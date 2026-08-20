-- Proxy Table backend schema (Cloudflare D1 / SQLite)

CREATE TABLE IF NOT EXISTS users (
  username    TEXT PRIMARY KEY,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS decks (
  id          TEXT PRIMARY KEY,
  username    TEXT NOT NULL REFERENCES users(username),
  name        TEXT NOT NULL,
  format      TEXT NOT NULL,
  raw         TEXT NOT NULL DEFAULT '',
  cards_json  TEXT NOT NULL,      -- {name: {oid,name,img,back,type,legal}}
  main_json   TEXT NOT NULL,      -- [{qty,name}]
  side_json   TEXT NOT NULL DEFAULT '[]',
  cmdr_json   TEXT NOT NULL DEFAULT '[]',
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_decks_username ON decks(username);

CREATE TABLE IF NOT EXISTS matches (
  id          TEXT PRIMARY KEY,
  status      TEXT NOT NULL DEFAULT 'active',   -- active | ended
  game        TEXT NOT NULL DEFAULT 'mtg',      -- mtg | wh40k
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS match_players (
  match_id    TEXT NOT NULL REFERENCES matches(id),
  username    TEXT NOT NULL REFERENCES users(username),
  seat        INTEGER NOT NULL,   -- 0 or 1
  deck_id     TEXT,
  deck_name   TEXT,
  PRIMARY KEY (match_id, username)
);
-- Existing databases: also run
--   ALTER TABLE match_players ADD COLUMN deck_name TEXT;
CREATE INDEX IF NOT EXISTS idx_players_username ON match_players(username);

-- Append-only. Discrete things one player does to the other: nudges, and
-- allowing a declared target. Board snapshots do NOT go here — see below.
CREATE TABLE IF NOT EXISTS match_events (
  match_id    TEXT NOT NULL REFERENCES matches(id),
  seq         INTEGER NOT NULL,
  username    TEXT NOT NULL,
  type        TEXT NOT NULL,      -- nudge | resolve
  payload     TEXT NOT NULL,      -- JSON, shape depends on type
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (match_id, seq)
);

-- One row per player per match, overwritten in place. A board snapshot is
-- ~30KB and gets pushed several times a second while dragging; appending
-- each one would fill the free storage tier in a few dozen games and blow
-- the daily write limit in a single evening.
CREATE TABLE IF NOT EXISTS match_state (
  match_id    TEXT NOT NULL REFERENCES matches(id),
  username    TEXT NOT NULL,
  payload     TEXT NOT NULL,
  updated_at  TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (match_id, username)
);

CREATE TABLE IF NOT EXISTS challenges (
  code        TEXT PRIMARY KEY,
  from_user   TEXT NOT NULL REFERENCES users(username),
  to_user     TEXT,               -- null when the code is posted openly (fallback / code-based)
  status      TEXT NOT NULL DEFAULT 'pending',  -- pending | accepted | declined | expired
  game        TEXT NOT NULL DEFAULT 'mtg',
  match_id    TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_challenges_to ON challenges(to_user, status);

CREATE TABLE IF NOT EXISTS push_subs (
  username    TEXT NOT NULL REFERENCES users(username),
  endpoint    TEXT NOT NULL,
  p256dh      TEXT NOT NULL,
  auth        TEXT NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (username, endpoint)
);

-- Lightweight permanent record once a match is finished.
-- Heavy match/events/state rows are deleted after this is written.
CREATE TABLE IF NOT EXISTS match_results (
  id              TEXT PRIMARY KEY,
  winner          TEXT NOT NULL,
  winner_deck     TEXT NOT NULL,
  loser           TEXT NOT NULL,
  loser_deck      TEXT NOT NULL,
  format          TEXT NOT NULL DEFAULT 'freeform',
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_results_winner ON match_results(winner);
CREATE INDEX IF NOT EXISTS idx_results_loser  ON match_results(loser);
CREATE INDEX IF NOT EXISTS idx_results_wdeck  ON match_results(winner_deck);
CREATE INDEX IF NOT EXISTS idx_results_ldeck  ON match_results(loser_deck);

