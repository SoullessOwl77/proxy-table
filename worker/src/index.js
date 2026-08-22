import { sendPush } from "./webpush.js";
import { Match } from "./match.js";

export { Match };

/* ---------- small helpers ---------- */
const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS"
  }
});
const err = (msg, status = 400) => json({ error: msg }, status);
const uid = () => crypto.randomUUID();
const ALPH = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no I L O 0 1
function code(len = 6) {
  let s = ""; const buf = crypto.getRandomValues(new Uint8Array(len));
  for (const b of buf) s += ALPH[b % ALPH.length];
  return s;
}
const isName = s => typeof s === "string" && /^[A-Za-z0-9_ -]{2,20}$/.test(s.trim());
const norm = s => s.trim();
let gameColsReady = false;
async function ensureGameCols(db) {
  if (gameColsReady) return;
  try { await db.prepare("ALTER TABLE matches ADD COLUMN game TEXT DEFAULT 'mtg'").run(); } catch (_) {}
  try { await db.prepare("ALTER TABLE challenges ADD COLUMN game TEXT DEFAULT 'mtg'").run(); } catch (_) {}
  gameColsReady = true;
}

async function readJson(req) {
  try { return await req.json(); } catch (e) { return null; }
}

export default {
  async fetch(req, env, ctx) {
    if (req.method === "OPTIONS") return json({});
    const url = new URL(req.url);
    const p = url.pathname;
    const db = env.DB;
    await ensureGameCols(db);

    try {
      /* ---------- Durable Object routing for live matches ---------- */
      // /api/match/:id/ws?username=...
      const wsMatch = p.match(/^\/api\/match\/([^/]+)\/ws$/);
      if (wsMatch) {
        const matchId = wsMatch[1];
        const id = env.MATCH.idFromName(matchId);
        const stub = env.MATCH.get(id);
        // Forward the request (with matchId already in the path) so the DO can read it
        const doUrl = new URL(req.url);
        doUrl.searchParams.set("matchId", matchId);
        return stub.fetch(new Request(doUrl.toString(), req));
      }

      /* ---------------- accounts ---------------- */
      if (p === "/api/username/available" && req.method === "GET") {
        const name = norm(url.searchParams.get("name") || "");
        if (!isName(name)) return err("Names are 2-20 letters, numbers, spaces, - or _.");
        const row = await db.prepare("SELECT username FROM users WHERE username = ?").bind(name).first();
        return json({ available: !row });
      }

      if (p === "/api/account" && req.method === "POST") {
        const b = await readJson(req);
        const name = b && norm(b.username || "");
        if (!isName(name)) return err("Names are 2-20 letters, numbers, spaces, - or _.");
        const existing = await db.prepare("SELECT username FROM users WHERE username = ?").bind(name).first();
        if (existing) return err("name taken", 409);
        await db.prepare("INSERT INTO users (username) VALUES (?)").bind(name).run();
        return json({ ok: true, username: name });
      }

      /* ---------------- decks ---------------- */
      if (p === "/api/decks" && req.method === "GET") {
        const user = norm(url.searchParams.get("username") || "");
        if (!user) return err("username required");
        const { results } = await db.prepare("SELECT * FROM decks WHERE username = ? ORDER BY updated_at DESC").bind(user).all();
        return json({ decks: results.map(rowToDeck) });
      }

      if (p.match(/^\/api\/decks\/[^/]+$/) && req.method === "PUT") {
        const id = p.split("/").pop();
        const b = await readJson(req);
        if (!b || !isName(b.username)) return err("username required");
        const user = await db.prepare("SELECT username FROM users WHERE username = ?").bind(norm(b.username)).first();
        if (!user) return err("no such account", 404);
        const now = new Date().toISOString();
        await db.prepare(`
          INSERT INTO decks (id, username, name, format, raw, cards_json, main_json, side_json, cmdr_json, created_at, updated_at)
          VALUES (?,?,?,?,?,?,?,?,?,?,?)
          ON CONFLICT(id) DO UPDATE SET
            name=excluded.name, format=excluded.format, raw=excluded.raw,
            cards_json=excluded.cards_json, main_json=excluded.main_json,
            side_json=excluded.side_json, cmdr_json=excluded.cmdr_json, updated_at=excluded.updated_at
        `).bind(id, norm(b.username), b.name || "Untitled deck", b.format || "freeform", b.raw || "",
          JSON.stringify(b.cards || {}), JSON.stringify(b.main || []),
          JSON.stringify(b.side || []), JSON.stringify(b.commander || []), now, now).run();
        return json({ ok: true, id });
      }

      if (p.match(/^\/api\/decks\/[^/]+$/) && req.method === "DELETE") {
        const id = p.split("/").pop();
        const user = norm(url.searchParams.get("username") || "");
        await db.prepare("DELETE FROM decks WHERE id = ? AND username = ?").bind(id, user).run();
        return json({ ok: true });
      }

      /* ---------------- challenges ---------------- */
      if (p === "/api/challenge" && req.method === "POST") {
        const b = await readJson(req);
        if (!b || !isName(b.from)) return err("from required");
        const from = norm(b.from);
        const to = b.to ? norm(b.to) : null;
        const game = b.game === "wh40k" ? "wh40k" : "mtg";
        const fromUser = await db.prepare("SELECT username FROM users WHERE username=?").bind(from).first();
        if (!fromUser) return err("no such account", 404);
        if (to) {
          const toUser = await db.prepare("SELECT username FROM users WHERE username=?").bind(to).first();
          if (!toUser) return err("that name isn't registered", 404);
        }
        const c = code(6);
        const expires = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
        try {
          await db.prepare("INSERT INTO challenges (code, from_user, to_user, expires_at, game) VALUES (?,?,?,?,?)")
            .bind(c, from, to, expires, game).run();
        } catch (_) {
          await db.prepare("INSERT INTO challenges (code, from_user, to_user, expires_at) VALUES (?,?,?,?)")
            .bind(c, from, to, expires).run();
        }

        if (to) {
          const subs = await db.prepare("SELECT * FROM push_subs WHERE username=?").bind(to).all();
          const vapid = { publicKey: env.VAPID_PUBLIC_KEY, d: env.VAPID_PRIVATE_D, x: env.VAPID_PUBLIC_X, y: env.VAPID_PUBLIC_Y, subject: env.VAPID_SUBJECT };
          for (const s of subs.results) {
            ctx.waitUntil(notify(db, s, { title: `${from} challenged you`, body: "Tap to accept or decline.", tag: "challenge", data: { type: "challenge", code: c, game } }, vapid));
          }
        }
        return json({ ok: true, code: c, expires_at: expires });
      }

      if (p.match(/^\/api\/challenge\/[^/]+$/) && req.method === "GET") {
        const c = p.split("/").pop();
        const row = await db.prepare("SELECT * FROM challenges WHERE code=?").bind(c).first();
        if (!row) return err("no challenge with that code", 404);
        if (row.status === "pending" && new Date(row.expires_at) < new Date()) {
          await db.prepare("UPDATE challenges SET status='expired' WHERE code=?").bind(c).run();
          row.status = "expired";
        }
        return json({ challenge: row });
      }

      if (p.match(/^\/api\/challenge\/[^/]+\/accept$/) && req.method === "POST") {
        const c = p.split("/")[3];
        const b = await readJson(req);
        if (!b || !isName(b.username)) return err("username required");
        const you = norm(b.username);
        const row = await db.prepare("SELECT * FROM challenges WHERE code=?").bind(c).first();
        if (!row) return err("no challenge with that code", 404);
        if (row.status !== "pending") return err("that challenge is " + row.status, 409);
        if (new Date(row.expires_at) < new Date()) return err("that challenge expired", 410);
        if (row.to_user && row.to_user !== you) return err("that challenge wasn't sent to you", 403);
        if (row.from_user === you) return err("you can't accept your own challenge", 400);

        const matchId = uid();
        const game = row.game === "wh40k" ? "wh40k" : "mtg";
        try {
          await db.prepare("INSERT INTO matches (id, status, game, updated_at) VALUES (?,?,?,datetime('now'))")
            .bind(matchId, "active", game).run();
        } catch (_) {
          try {
            await db.prepare("INSERT INTO matches (id, game) VALUES (?,?)").bind(matchId, game).run();
          } catch (__) {
            await db.prepare("INSERT INTO matches (id) VALUES (?)").bind(matchId).run();
          }
        }
        try { await db.prepare("UPDATE matches SET status='active', updated_at=datetime('now') WHERE id=?").bind(matchId).run(); } catch (_) {}
        await db.prepare("INSERT INTO match_players (match_id, username, seat) VALUES (?,?,0)").bind(matchId, row.from_user).run();
        await db.prepare("INSERT INTO match_players (match_id, username, seat) VALUES (?,?,1)").bind(matchId, you).run();
        await db.prepare("UPDATE challenges SET status='accepted', match_id=? WHERE code=?").bind(matchId, c).run();

        const subs = await db.prepare("SELECT * FROM push_subs WHERE username=?").bind(row.from_user).all();
        const vapid = { publicKey: env.VAPID_PUBLIC_KEY, d: env.VAPID_PRIVATE_D, x: env.VAPID_PUBLIC_X, y: env.VAPID_PUBLIC_Y, subject: env.VAPID_SUBJECT };
        for (const s of subs.results) {
          ctx.waitUntil(notify(db, s, { title: `${you} accepted your challenge`, body: "Your match is ready.", tag: "accept", data: { type: "match", matchId, game } }, vapid));
        }
        return json({ ok: true, matchId, game });
      }

      if (p.match(/^\/api\/challenge\/[^/]+\/decline$/) && req.method === "POST") {
        const c = p.split("/")[3];
        await db.prepare("UPDATE challenges SET status='declined' WHERE code=? AND status='pending'").bind(c).run();
        return json({ ok: true });
      }

      /* ---------------- matches list (still HTTP) ---------------- */
      if (p.match(/^\/api\/match\/[^/]+$/) && req.method === "GET") {
        const matchId = p.split("/")[3];
        let m = null;
        try {
          m = await db.prepare("SELECT id, status, game, updated_at FROM matches WHERE id=?").bind(matchId).first();
        } catch (_) {
          m = await db.prepare("SELECT id, status, updated_at FROM matches WHERE id=?").bind(matchId).first();
        }
        if (!m) return err("no match", 404);
        let results = [];
        try {
          const q = await db.prepare(
            "SELECT username, seat, deck_name, deck_id FROM match_players WHERE match_id=? ORDER BY seat"
          ).bind(matchId).all();
          results = q.results || [];
        } catch (_) {
          const q = await db.prepare(
            "SELECT username, seat FROM match_players WHERE match_id=? ORDER BY seat"
          ).bind(matchId).all();
          results = q.results || [];
        }
        return json({
          match: {
            id: m.id,
            status: m.status,
            game: m.game === "wh40k" ? "wh40k" : "mtg",
            updated_at: m.updated_at,
            players: results || []
          }
        });
      }

      if (p === "/api/matches" && req.method === "GET") {
        const user = norm(url.searchParams.get("username") || "");
        if (!user) return err("username required");
        const whereActive = `(m.status IS NULL OR m.status = '' OR m.status = 'active')`;
        let results = [];
        try {
          const q = await db.prepare(`
          SELECT m.id, m.status, m.updated_at, m.game,
                 mp.deck_name AS my_deck,
                 (SELECT username FROM match_players WHERE match_id=m.id AND username != ?) AS opponent,
                 (SELECT deck_name FROM match_players WHERE match_id=m.id AND username != ?) AS opponent_deck
          FROM matches m
          JOIN match_players mp ON mp.match_id = m.id AND mp.username = ?
          WHERE ${whereActive}
          ORDER BY m.updated_at DESC
        `).bind(user, user, user).all();
          results = q.results || [];
        } catch (_) {
          try {
            const q = await db.prepare(`
            SELECT m.id, m.status, m.updated_at,
                   mp.deck_name AS my_deck,
                   (SELECT username FROM match_players WHERE match_id=m.id AND username != ?) AS opponent,
                   (SELECT deck_name FROM match_players WHERE match_id=m.id AND username != ?) AS opponent_deck
            FROM matches m
            JOIN match_players mp ON mp.match_id = m.id AND mp.username = ?
            WHERE ${whereActive}
            ORDER BY m.updated_at DESC
          `).bind(user, user, user).all();
            results = q.results || [];
          } catch (__) {
            try {
              const q = await db.prepare(`
              SELECT m.id, m.status, m.updated_at,
                     mp.deck_name AS my_deck,
                     (SELECT username FROM match_players WHERE match_id=m.id AND username != ?) AS opponent,
                     (SELECT deck_name FROM match_players WHERE match_id=m.id AND username != ?) AS opponent_deck
              FROM matches m
              JOIN match_players mp ON mp.match_id = m.id AND mp.username = ?
              ORDER BY m.updated_at DESC
            `).bind(user, user, user).all();
              results = q.results || [];
            } catch (___) { results = []; }
          }
        }
        return json({ matches: results });
      }

      /* Record which deck you're playing (for match list labels) */
      if (p.match(/^\/api\/match\/[^/]+\/deck$/) && req.method === "POST") {
        const matchId = p.split("/")[3];
        const b = await readJson(req);
        if (!b || !isName(b.username)) return err("username required");
        const me = norm(b.username);
        const player = await db.prepare(
          "SELECT username FROM match_players WHERE match_id = ? AND username = ?"
        ).bind(matchId, me).first();
        if (!player) return err("not a player in this match", 403);
        await db.prepare(
          "UPDATE match_players SET deck_id = ?, deck_name = ? WHERE match_id = ? AND username = ?"
        ).bind(b.deckId || null, b.deckName || null, matchId, me).run();
        await db.prepare("UPDATE matches SET updated_at = datetime('now') WHERE id = ?").bind(matchId).run();
        return json({ ok: true });
      }

      /* ---------------- abandon match (no win/loss recorded) ---------------- */
      if (p.match(/^\/api\/match\/[^/]+\/abandon$/) && req.method === "POST") {
        const matchId = p.split("/")[3];
        const b = await readJson(req);
        if (!b || !isName(b.username)) return err("username required");
        const me = norm(b.username);
        const player = await db.prepare(
          "SELECT username FROM match_players WHERE match_id = ? AND username = ?"
        ).bind(matchId, me).first();
        if (!player) return err("not a player in this match", 403);

        await db.prepare("DELETE FROM match_events WHERE match_id = ?").bind(matchId).run();
        await db.prepare("DELETE FROM match_state  WHERE match_id = ?").bind(matchId).run();
        await db.prepare("DELETE FROM match_players WHERE match_id = ?").bind(matchId).run();
        await db.prepare("DELETE FROM matches WHERE id = ?").bind(matchId).run();
        return json({ ok: true });
      }

      /* ---------------- results (win/loss history) ---------------- */
      if (p === "/api/results" && req.method === "GET") {
        const user = norm(url.searchParams.get("username") || "");
        if (!user) return err("username required");
        const { results } = await db.prepare(`
          SELECT * FROM match_results
          WHERE winner = ? OR loser = ?
          ORDER BY created_at DESC
          LIMIT 100
        `).bind(user, user).all();
        return json({ results });
      }

      /* ---------------- push subscriptions ---------------- */
      if (p === "/api/push/subscribe" && req.method === "POST") {
        const b = await readJson(req);
        if (!b || !isName(b.username) || !b.subscription) return err("username and subscription required");
        const s = b.subscription;
        await db.prepare(`
          INSERT INTO push_subs (username, endpoint, p256dh, auth) VALUES (?,?,?,?)
          ON CONFLICT(username, endpoint) DO NOTHING
        `).bind(norm(b.username), s.endpoint, s.keys.p256dh, s.keys.auth).run();
        return json({ ok: true });
      }

      if (p === "/api/push/vapid-key" && req.method === "GET") {
        return json({ key: env.VAPID_PUBLIC_KEY });
      }

      return err("not found", 404);
    } catch (e) {
      return err("server error: " + e.message, 500);
    }
  }
};

function rowToDeck(r) {
  return {
    id: r.id, name: r.name, format: r.format, raw: r.raw,
    cards: JSON.parse(r.cards_json), main: JSON.parse(r.main_json),
    side: JSON.parse(r.side_json), commander: JSON.parse(r.cmdr_json),
    updated_at: r.updated_at
  };
}

async function notify(db, sub, payload, vapid) {
  const subscription = { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } };
  try {
    const res = await sendPush(subscription, payload, vapid);
    if (res.status === 404 || res.status === 410) {
      await db.prepare("DELETE FROM push_subs WHERE username=? AND endpoint=?").bind(sub.username, sub.endpoint).run();
    }
  } catch (e) { /* one bad subscription shouldn't break the request */ }
}
