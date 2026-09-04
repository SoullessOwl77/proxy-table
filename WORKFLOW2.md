# Proxy Table 40K — Next Steps

Check items off with `[x]` as they land. Add notes under any item freely.

**Current build:** `v2.16.46-walkthrough` (`wh40k.html`) · hub `v2.7.10-howto` (`index.html`) · SW `pt-shell-v50` · shared guide `guide-data.js` · tutorial `howto.html`
**Handoff:** `PROXY_TABLE_HANDOFF.md` — read it + this file at the start of every chat.
**Baseline:** 11th edition Core Rules · skill `wh40k-rules`.
**Constraint:** Do not change MTG game structure except bug fixes. 40K stays in `wh40k.html`.
**Project path:** `wh40k.html`, `index.html`, `sw.js`, `worker/`, `army.html`, `datasheet.html`, `datasheets/`, `guide-data.js`, `howto.html`. NOTE: the folder now holds a large `.git` (349MB pack) — exclude `.git` and `backups/` from backup zips (write the zip to scratch outside the folder, then copy it in).

**Standing process (backups):** a build is any code change that bumps the `v#`. Back up (zip to `backups/`) on every 5th patch increment (…, .29, .34, .39, .44 …) and on any minor/major rollover (rollover resets the count). **Whenever a backup is written, also refresh this file's status + build line and the handoff build table** so the tracker never drifts from reality. Next backup trigger: **v2.16.49**.

---

## NOW / next

- [ ] Nothing actively in progress. Guides/tooltips + How-to-play tutorial shipped (.42-.44). Next candidates: stratagems (scaffolding — CP economy + `stratUsed` + reaction pattern — already exists), the two items under **Open**, or PVP Armor of Contempt.

## Open (smaller)

- [ ] **PVP Armor of Contempt** — deferred. Needs `attackerId`/`targetId` synced into the board so the defending client can see what's targeted (they're client-local now). Practice AoC works.
- [ ] **Score when leaving Fight via the phase buttons** — VP only scores off Next out of Fight today.
- [ ] Redeploys after drops → roll first turn → pre-battle abilities (honor-system; first turn is still the lobby pick).
- [ ] Hub one-liner: teaching proxy, fan sheets are purple.

## Parked by design (until weekly play / MFM data)

- [ ] True LoS / model heights — cover −1 on Light/Dense is the stand-in.
- [ ] Wargear options tree — split sheets for now.
- [ ] SM Seekers/Firestorm enhancement card names+pts — empty state until MFM.
- [ ] Land Raider Redeemer weapons — red pts-only until a pack card is ingested.

---

## Shipped this session (v2.16.21 → .44)

- §6 deploy/cleanup pass: one drop path (removed "Drop saved"), honest names (off-table / to-place / Strategic Reserves), Practice Dev on/off (rules-enforced by default), two resets (Full Reset + Reset-match snapshot at Start battle), VP objective ticker, Revert → **Undo** (last model drag).
- Reaction system: **Rapid Ingress** + **Fire Overwatch** (end of opponent's Movement, Snap 6s, once/round; Practice + PVP), **Armor of Contempt** as a defender reaction prompt (Practice).
- Combat correctness: **charge is one 2D6 per unit**; **pile-in/consolidate capped 3″ from the announce point**; **whole-unit shooting & fighting** (Attack fires the whole unit); **fight-once** gate; **volley report** (names every model that didn't fire + reason); scrollable all-rolls Rolls panel.
- **Scoreboard** (Score button): per-seat VP (auto primary + manual secondary +/-) and CP (auto +1/turn + manual +/-), honor-system, toggle panel.
- **Fights First / fight order** (teaching slice): the Fights First button is live — tap it in the Fight phase for the running order (chargers + Fights First units first, then the rest, non-active player choosing first), with a (done) tag on units that already fought. Fighting a normal unit while un-fought first-fighters are still in engagement pops a non-blocking reminder. True cross-player alternation stays manual (engine is active-seat-only).
- **11th setup sequence**: lobby sets Attacker/Defender (deploy order) only; after Infiltrators, a Determine First Turn roll-off (winner chooses) sets who goes first; then a Pre-battle abilities step (Scout moves / Scout-to-Reserves / redeploys). Start battle blocked until first turn is set.
- **Unified guidance model** `guide-data.js` (`window.PT_GUIDE`): one source for hover tooltips, the Guide walkthrough, and the tutorial. `wh40k.html` derives TIPS/GUIDE from it; content corrected to current behavior.
- **How-to-play tutorial** `howto.html`: standalone paged guide (Overview -> 5 phases -> Reactions/CP/Scoring), rendered from `guide-data.js`. Opened from the hub's 40K "How to play" button and the table's Guide panel.
- Fixes: demo-drop (hide manual buttons when a lobby army is committed; commander deploys as its own Infiltrator), mobile lobby scroll, reaction bar was invisible (CSS) — now shows, Undo in Fight, 3″ pile ring.

## Earlier milestones (do not re-litigate)

list→table drop, export/import, charge fail + Battle-shock, CP + Command Re-roll / Grenade, Dawn of War drops + Take and Hold / Sweeping Engagement, army generator + points bands + faction picker + catalog, enhancement cards, chapter lock, unit-aware Guide, two-seat PVP confirm.

---

## Still worth a manual pass

**Combat:** wound order (wounded first, Character last); FnP on a Character; Battle-shock (damaged unit tests, OC 0); shocked unit blocked from stratagems; soft eligibility warns.
**PVP (needs 2 devices):** challenge opens `?match=`; rejoin restores board (deploy + mission + VP + scoreboard); two-press reset clears both; reactions across devices; scoreboard/CP sync; can't drag the other seat's models; both seats on the same BUILD.
**Deploy/missions:** formation → mark Strategic Reserves → Begin drops (Defender first); drop blocked outside DZ / broken coherency; Titanic = two drops; Infiltrators then Scouts; Start battle locks terrain; end-of-turn VP (5 for 1+, 5 for 2+, 5 for more than opponent).
**Glue:** title-tap shows the current BUILD; SW not serving stale assets; empty faction files hidden.

---

## Deploy reminder

OneDrive primary: `proxy-table\proxy-table` → `deploy.bat` / `deploy.ps1`.
Copy: `index.html`, `wh40k.html`, `army.html`, `datasheet.html`, `datasheets/`, `sw.js`, `manifest.webmanifest`, icons, deploy scripts.
After push: **tap the page title** until the 40K subtitle reads the **current BUILD**.
Worker only when `worker/` changed — say which files. Reaction/scoreboard state so far is **additive board fields**, no worker change.
