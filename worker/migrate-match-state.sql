-- Run once against the existing database. Safe to run twice.
--
-- Board snapshots used to be appended to match_events, one row per push,
-- several pushes per second while dragging. They now live in match_state,
-- one row per player, overwritten in place.

CREATE TABLE IF NOT EXISTS match_state (
  match_id    TEXT NOT NULL REFERENCES matches(id),
  username    TEXT NOT NULL,
  payload     TEXT NOT NULL,
  updated_at  TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (match_id, username)
);

-- Carry the most recent snapshot of each player into the new table so
-- matches in progress don't lose their boards.
INSERT OR REPLACE INTO match_state (match_id, username, payload, updated_at)
SELECT e.match_id, e.username, e.payload, e.created_at
FROM match_events e
JOIN (
  SELECT match_id, username, MAX(seq) AS seq
  FROM match_events WHERE type='state'
  GROUP BY match_id, username
) latest
  ON latest.match_id = e.match_id
 AND latest.username = e.username
 AND latest.seq = e.seq;

-- Drop the accumulated snapshot rows; they're dead weight now.
DELETE FROM match_events WHERE type='state';
