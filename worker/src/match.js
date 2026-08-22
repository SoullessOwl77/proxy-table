/* Match Durable Object — one instance per active match.
   Holds both seats' live state in memory and speaks WebSockets.
   On confirmed end it writes a lightweight result row and deletes
   the heavy match data from D1.

   MTG: per-username boards (private hand/library).
   40K: one shared BoardState (last-write-wins by rev), persisted so
   rejoin / title-tap / DO hibernation restore the table. */

import { sendPush } from "./webpush.js";

export class Match {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.sessions = new Map(); // username -> WebSocket
    this.boards = {};          // username -> full private state (MTG, in-memory)
    this.shared40k = null;     // shared BoardState for game==="wh40k"
    this.game = null;          // "mtg" | "wh40k"
    this.players = [];         // [username0, username1] seat order
    this.matchId = null;
    this.ended = false;
    this.activity = [];        // recent human-readable lines for catch-up
  }

  async pushTo(username, payload) {
    try {
      const { results } = await this.env.DB.prepare(
        "SELECT * FROM push_subs WHERE username = ?"
      ).bind(username).all();
      if (!results || !results.length) return;
      const vapid = {
        publicKey: this.env.VAPID_PUBLIC_KEY,
        d: this.env.VAPID_PRIVATE_D,
        x: this.env.VAPID_PUBLIC_X,
        y: this.env.VAPID_PUBLIC_Y,
        subject: this.env.VAPID_SUBJECT
      };
      for (const s of results) {
        const subscription = { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } };
        try {
          const res = await sendPush(subscription, payload, vapid);
          if (res.status === 404 || res.status === 410) {
            await this.env.DB.prepare(
              "DELETE FROM push_subs WHERE username=? AND endpoint=?"
            ).bind(s.username, s.endpoint).run();
          }
        } catch (_) {}
      }
    } catch (e) { console.error("pushTo", e); }
  }

  note(line) {
    this.activity.push({ t: Date.now(), line });
    if (this.activity.length > 30) this.activity = this.activity.slice(-30);
  }

  storageVal(stored, key) {
    if (!stored) return undefined;
    if (typeof stored.get === "function") return stored.get(key);
    return stored[key];
  }

  async persistLive() {
    try {
      await this.state.storage.put({
        players: this.players,
        matchId: this.matchId,
        ended: !!this.ended,
        game: this.game,
        shared40k: this.shared40k,
        boards: this.boards
      });
    } catch (e) { console.error("persistLive", e); }
  }

  async persistD1(username, payload) {
    if (!this.matchId || !payload) return;
    const now = Date.now();
    if (this._lastD1 && now - this._lastD1 < 2500) return;
    this._lastD1 = now;
    try {
      await this.env.DB.prepare(
        `INSERT INTO match_state (match_id, username, payload, updated_at)
         VALUES (?,?,?,datetime('now'))
         ON CONFLICT(match_id, username) DO UPDATE SET
           payload=excluded.payload, updated_at=datetime('now')`
      ).bind(this.matchId, username, JSON.stringify(payload)).run();
      await this.env.DB.prepare("UPDATE matches SET updated_at=datetime('now') WHERE id=?").bind(this.matchId).run();
    } catch (e) { console.error("persistD1", e); }
  }

  async loadD1Boards(matchId) {
    try {
      const { results } = await this.env.DB.prepare(
        "SELECT username, payload FROM match_state WHERE match_id=?"
      ).bind(matchId).all();
      for (const r of results || []) {
        let payload;
        try { payload = JSON.parse(r.payload); } catch (_) { continue; }
        if (payload && payload.game === "wh40k") {
          if (!this.shared40k || (payload.rev || 0) >= (this.shared40k.rev || 0)) this.shared40k = payload;
        } else if (r.username && payload) {
          this.boards[r.username] = payload;
        }
      }
    } catch (e) { console.error("loadD1Boards", e); }
  }

  async ensureLoaded(matchId) {
    if (this.players.length > 0 && this.game && (this.game !== "wh40k" ? Object.keys(this.boards).length : this.shared40k)) {
      return;
    }
    const stored = await this.state.storage.get(["players", "matchId", "ended", "shared40k", "game", "boards"]);
    const players = this.storageVal(stored, "players");
    const sid = this.storageVal(stored, "matchId");
    const ended = this.storageVal(stored, "ended");
    const shared40k = this.storageVal(stored, "shared40k");
    const game = this.storageVal(stored, "game");
    const boards = this.storageVal(stored, "boards");
    if (players && players.length === 2) {
      this.players = players;
      this.matchId = sid || matchId;
      this.ended = !!ended;
      if (shared40k) this.shared40k = shared40k;
      if (game) this.game = game;
      if (boards && typeof boards === "object") this.boards = Object.assign({}, this.boards, boards);
    }
    if (!matchId) matchId = this.matchId;
    if (!matchId) throw new Error("matchId required");
    this.matchId = matchId;
    if (!this.players.length) {
      const { results } = await this.env.DB.prepare(
        "SELECT username, seat FROM match_players WHERE match_id = ? ORDER BY seat"
      ).bind(matchId).all();
      if (!results || results.length < 2) throw new Error("match not found or incomplete");
      this.players = results.map(r => r.username);
    }
    if (!this.game) {
      try {
        const row = await this.env.DB.prepare("SELECT game FROM matches WHERE id = ?").bind(matchId).first();
        this.game = (row && row.game) === "wh40k" ? "wh40k" : "mtg";
      } catch (_) {
        this.game = this.shared40k ? "wh40k" : "mtg";
      }
    }
    if ((this.game === "wh40k" && !this.shared40k) || (this.game !== "wh40k" && !Object.keys(this.boards).length)) {
      await this.loadD1Boards(matchId);
    }
    await this.persistLive();
  }

  seatOf(username) {
    const i = this.players.indexOf(username);
    return i < 0 ? 0 : i;
  }

  playerMap() {
    return { "0": this.players[0] || "", "1": this.players[1] || "" };
  }

  async fetch(request) {
    const url = new URL(request.url);

    if (request.headers.get("Upgrade") === "websocket") {
      const username = (url.searchParams.get("username") || "").trim();
      if (!username) return new Response("username required", { status: 400 });

      try {
        await this.ensureLoaded(url.searchParams.get("matchId"));
      } catch (e) {
        return new Response(e.message, { status: 404 });
      }

      if (!this.players.includes(username)) {
        return new Response("not a player in this match", { status: 403 });
      }

      if (this.ended) {
        return new Response("match already ended", { status: 410 });
      }

      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);
      server.accept();

      const prev = this.sessions.get(username);
      if (prev) {
        try { prev.close(1000, "replaced"); } catch (_) {}
      }
      this.sessions.set(username, server);

      server.addEventListener("message", (evt) => this.onMessage(username, evt.data));
      server.addEventListener("close", () => {
        if (this.sessions.get(username) === server) this.sessions.delete(username);
      });
      server.addEventListener("error", () => {
        if (this.sessions.get(username) === server) this.sessions.delete(username);
      });

      const forty = this.game === "wh40k";
      const board = forty ? this.shared40k : (this.boards[username] || null);
      this.sendTo(username, {
        type: "snapshot",
        you: forty ? board : (this.boards[username] || null),
        opponent: forty ? board : this.publicView(this.other(username)),
        opponentName: this.other(username),
        activity: this.activity.slice(-15),
        seat: this.seatOf(username),
        players: this.playerMap(),
        game: this.game || "mtg"
      });

      return new Response(null, { status: 101, webSocket: client });
    }

    return new Response("expected websocket", { status: 426 });
  }

  other(username) {
    return this.players.find(p => p !== username) || null;
  }

  /* Strip private info so the opponent only sees public zones.
     40K is a shared table — send the full BoardState. */
  publicView(username) {
    if (this.game === "wh40k") return this.shared40k;
    const s = this.boards[username];
    if (!s) return null;
    if (s.game === "wh40k") return s;
    const pub = c => ({
      id: c.id,
      name: c.faceDown ? "" : c.name,
      img: c.faceDown ? "" : c.img,
      back: c.back,
      x: c.x, y: c.y,
      tapped: !!c.tapped,
      ctr: c.ctr || 0,
      faceDown: !!c.faceDown,
      flipped: !!c.flipped,
      own: c.own || null
    });
    const lib = s.library || [];
    return {
      name: username,
      deckName: s.deckName,
      life: s.life,
      turn: s.turn || 1,
      active: s.active !== false,
      hand: (s.hand || []).length,
      library: lib.length,
      command: (s.command || []).map(pub),
      field: (s.field || []).map(pub),
      grave: (s.grave || []).map(pub),
      exile: (s.exile || []).map(pub),
      pending: s.pending || [],
      topCard: (s.topRevealed && lib.length) ? pub(lib[lib.length - 1]) : null
    };
  }

  sendTo(username, msg) {
    const ws = this.sessions.get(username);
    if (ws && ws.readyState === 1) {
      try { ws.send(JSON.stringify(msg)); } catch (_) {}
    }
  }

  broadcast(from, msg) {
    const other = this.other(from);
    if (other) this.sendTo(other, msg);
  }

  async onMessage(username, raw) {
    if (this.ended) return;
    let msg;
    try { msg = JSON.parse(raw); } catch (_) { return; }
    if (!msg || !msg.type) return;

    switch (msg.type) {
      case "state": {
        const prev = this.boards[username];
        const next = msg.payload || {};
        if (next.game === "wh40k" || this.game === "wh40k") {
          this.game = "wh40k";
          const prevRev = (this.shared40k && this.shared40k.rev) || 0;
          const nextRev = next.rev || 0;
          if (nextRev >= prevRev) {
            next.players = this.playerMap();
            this.shared40k = next;
            await this.persistLive();
            this.persistD1("_shared", next);
            const line = (next.log && next.log.length) ? next.log[next.log.length - 1] : null;
            if (line && line.line) this.note(line.line);
            const other = this.other(username);
            this.broadcast(username, {
              type: "opponent",
              opponent: next,
              game: "wh40k",
              seat: other ? this.seatOf(other) : 1,
              players: this.playerMap()
            });
          }
          break;
        }
        this.boards[username] = next;
        await this.persistLive();
        this.persistD1(username, next);
        if (prev) {
          if (typeof next.life === "number" && next.life !== prev.life) {
            this.note(`${username} life ${prev.life} → ${next.life}`);
          }
          const prevField = (prev.field || []).length;
          const nextField = (next.field || []).length;
          if (nextField !== prevField) {
            this.note(`${username} board ${prevField} → ${nextField} permanents`);
          }
        } else if (next.deckName) {
          this.note(`${username} dealt in with ${next.deckName}`);
        }
        this.broadcast(username, {
          type: "opponent",
          opponent: this.publicView(username)
        });
        break;
      }

      case "event": {
        const et = msg.eventType;
        const p = msg.payload || {};
        if (et === "nudge") {
          this.note(`${username} nudged`);
          const other = this.other(username);
          if (other) {
            this.pushTo(other, {
              title: username,
              body: (p && p.message) || "Your move.",
              tag: "nudge-" + (this.matchId || ""),
              data: { type: "match", matchId: this.matchId, game: this.game || "mtg" }
            });
          }
        }
        else if (et === "endturn") this.note(`${username} passed the turn`);
        else if (et === "control") this.note(`${username} took control of a card`);
        else if (et === "return") this.note(`${username} returned a card (${p.zone || "zone"})`);
        else if (et === "call") this.note(`${username}: ${p.kind || "call"}`);
        else if (et === "newgame") this.note(`${username} requested a new game`);
        this.broadcast(username, {
          type: "event",
          from: username,
          eventType: et,
          payload: p
        });
        break;
      }

      case "end": {
        if (!msg.winner || !msg.loser) return;
        await this.finish(msg.winner, msg.loser, msg.winnerDeck || "Unknown", msg.loserDeck || "Unknown", msg.format || "freeform");
        break;
      }

      case "result": {
        if (!msg.winner || !msg.loser) return;
        try {
          const id = crypto.randomUUID();
          await this.env.DB.prepare(`
            INSERT INTO match_results (id, winner, winner_deck, loser, loser_deck, format)
            VALUES (?, ?, ?, ?, ?, ?)
          `).bind(
            id,
            msg.winner,
            msg.winnerDeck || "Unknown",
            msg.loser,
            msg.loserDeck || "Unknown",
            msg.format || "freeform"
          ).run();
          this.broadcast(username, {
            type: "result_recorded",
            winner: msg.winner,
            winnerDeck: msg.winnerDeck || "Unknown",
            loser: msg.loser,
            loserDeck: msg.loserDeck || "Unknown"
          });
        } catch (e) { console.error("result write", e); }
        break;
      }

      case "abandon": {
        this.ended = true;
        await this.state.storage.put("ended", true);
        this.broadcast(username, { type: "abandoned", by: username });
        try {
          if (this.matchId) {
            await this.env.DB.prepare("DELETE FROM match_events WHERE match_id = ?").bind(this.matchId).run();
            await this.env.DB.prepare("DELETE FROM match_state  WHERE match_id = ?").bind(this.matchId).run();
            await this.env.DB.prepare("DELETE FROM match_players WHERE match_id = ?").bind(this.matchId).run();
            await this.env.DB.prepare("DELETE FROM matches WHERE id = ?").bind(this.matchId).run();
          }
        } catch (e) { console.error("abandon cleanup", e); }
        setTimeout(() => {
          for (const ws of this.sessions.values()) {
            try { ws.close(1000, "abandoned"); } catch (_) {}
          }
          this.sessions.clear();
        }, 400);
        break;
      }
    }
  }

  async finish(winner, loser, winnerDeck, loserDeck, format) {
    if (this.ended) return;
    this.ended = true;
    await this.state.storage.put("ended", true);

    const id = crypto.randomUUID();
    try {
      await this.env.DB.prepare(`
        INSERT INTO match_results (id, winner, winner_deck, loser, loser_deck, format)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(id, winner, winnerDeck, loser, loserDeck, format).run();

      if (this.matchId) {
        await this.env.DB.prepare("DELETE FROM match_events WHERE match_id = ?").bind(this.matchId).run();
        await this.env.DB.prepare("DELETE FROM match_state  WHERE match_id = ?").bind(this.matchId).run();
        await this.env.DB.prepare("DELETE FROM match_players WHERE match_id = ?").bind(this.matchId).run();
        await this.env.DB.prepare("DELETE FROM matches WHERE id = ?").bind(this.matchId).run();
      }
    } catch (e) {
      console.error("finish error", e);
    }

    const result = { type: "ended", winner, loser, winnerDeck, loserDeck };
    for (const u of this.players) this.sendTo(u, result);

    setTimeout(() => {
      for (const ws of this.sessions.values()) {
        try { ws.close(1000, "match ended"); } catch (_) {}
      }
      this.sessions.clear();
    }, 500);
  }
}
