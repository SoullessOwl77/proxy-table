# Proxy Table — Chat Handoff (2026-08-29)

Read this first on a new machine / new chat. Then `artifacts/WORKFLOW2.md`.  
Primary code: `artifacts/proxy-table/`.

Do **not** rebuild architecture. Do **not** touch MTG game structure except bug fixes.  
Do **not** create a second app folder or a second `wh40k.html`. Edit in place.

User: Taylor Goodall. Deploy from OneDrive `Proxy_Table_current/proxy-table/proxy-table` → `deploy.bat` / `deploy.ps1` → **title-tap** until the subtitle matches BUILD. Service worker caches hard.

---

## 1. What this is

Vanilla HTML/JS PWA for tabletop proxy play. Teaching-first 40K (11th edition). Casual, not tournament-legal. Soft warns before hard locks.

| Piece | File |
|---|---|
| Hub + MTG + Your Matches | `index.html` (`v2.7.9-army`) |
| 40K table | `wh40k.html` (`v2.16.30-rapid-ingress`) |
| Army builder | `army.html` |
| Datasheet editor | `datasheet.html` |
| Catalog | `datasheets/load.js` + `index.js` + faction packs + `mfm-seed.js` + `demo.js` |
| SW | `sw.js` (`pt-shell-v28`) |
| Backend | `worker/` — D1 + Durable Object `Match` + webpush |

**Rules baseline:** 11th edition Core Rules (~2026-06-01). Skills: `wh40k-rules`, `wh40k-datasheet` (draft and wait — do not invent paid Codex text). Official hubs: Warhammer Community downloads + `https://mfm.warhammer-community.com/en`. No live MFM scrape; seed + on-demand lookup only.

---

## 2. Current BUILD (must match title subtitle)

| File | Version |
|---|---|
| `wh40k.html` | `v2.16.30-rapid-ingress` |
| `index.html` | `v2.7.9-army` |
| `sw.js` | `pt-shell-v34` |

If live is older, files were not copied or title-tap did not run.

---

## 3. Locked architecture

| Decision | Choice |
|---|---|
| Hub | `index.html` = chooser + matches. MTG stays there |
| 40K | Own page `wh40k.html` |
| Worker | Reuse. Additive `matches.game` / `challenges.game` |
| MTG sync | **Two private boards** on the Match DO (`boards[username]`). Opponent gets `publicView` only. That was the MTG LWW fix |
| 40K sync | **One shared** `shared40k` BoardState. Last-write-wins by `rev`. Stale clients cannot overwrite (`next.rev >= stored.rev`; client ignores `board.rev <= S.rev`). Camera is local-only |
| Board | 60″ × 44″. Measure from **base edge** |
| Terrain | Locks at Start battle |
| Teaching | Soft warns first. Practice over-points warns, does not block |
| Combat parked | Overwatch resolve, Fights First / fight order, Rapid Ingress as a real 1 CP spend, true LoS |
| Onslaught house | 3000 pts / 4 DP / 6 enhancements / 4 copies. Core only prints Incursion + Strike Force |
| Colors | Gold = official pack/card. Purple = fan (Wahapedia). Red = points only (no stat line) |
| Datasheet ingest | Draft → user Accept. Do not write pack files from memory |

**Do not replace 40K LWW with MTG’s two-board model.** One felt, both seats move the same tokens. Remaining collision case is two writes from the same `rev` (setup both dragging, or a reaction during shooting). Mitigate with drop-seat / active-seat locks, not a new sync layer.

Practice is localStorage only. PVP hits the DO.

---

## 4. What is already on the table (do not rebuild)

Practice smoke, Setup, phase tools, movement + Revert (whole unit today), shoot/fight dice, allocation + FnP, charge roll **and fail** (short 2D6 snaps back), Battle-shock as a Command step (OC 0), CP + Command Re-roll / Grenade / Armor of Contempt, reserves + Ingress teaching slice, two-seat PVP confirm (2026-08-25), army generator + points bands + faction lock + search + export/import, Demo Forces as a lobby list, Practice two-list seats, Nids + Space Marines catalogs, Dawn of War drops + Take and Hold / Sweeping Engagement, mission `scoreMission` already runs when Next leaves Fight (easy to miss — no ticker yet).

Recent slices in this chat thread:

- `v2.16.21-drop-pass` — Next player locks the drop (drag no longer auto-commits). Reserves row is current seat only. Strategic Reserves (`· SR`) do not block Start battle.
- `v2.16.22-reserve-bar` — after Start battle the formation row hides; it returns in Movement if that seat still has units off the table.
- `v2.16.23-demo-kit` — Demo Infantry / Commander / Walker carry the teaching abilities (FnP, DS, Scout, Fights First, GRENADES). Role keywords stay split so deploy still has a normal drop, an Infiltrator, and a Titanic.
- `v2.16.30-rapid-ingress` — Reaction system, slice 1 (Practice): **Rapid Ingress**. Leaving your Movement phase (Next) opens a reaction checkpoint — if the **non-active** seat has a non-Aircraft unit in Reserves, ≥1 CP, and it's battle round ≥2, a reaction bar offers Rapid Ingress (1 CP): pick the reserved unit, place it (Deep Strike anywhere / else near its edge), drag to a legal spot (>8″, soft-warn), then Done. Once per battle round per seat (`S.reactUsed` keyed by round); hard round-1 block. New state `S.reaction` / `S.reactUsed` (additive, PVP-safe). Guards: phase advance is blocked while a reaction is open; `canControlUnit` hands drive to the reacting seat only for its arriving unit. Verified in Node — normal games (no reserves) never trigger the checkpoint. Also: **Allocation** guidance now shows in Fight as well as Shooting. Audit result: the only out-of-home actions were the three reactions (AoC, Rapid Ingress, Overwatch); everything else is correctly phased. **Still to do in the reaction system:** Fire Overwatch (next), then move Armor of Contempt to the target-selection hook; then the PVP layer.
- `v2.16.29-pilein` — Fight-phase **Pile-in / Consolidate now actually move**. The Fight phase forces the Combat tool (tap = attack targeting), so declared pile moves were locked. Now announcing Pile-in or Consolidate flags the unit `piling`; in the Combat tool a piling unit is drag-enabled, capped to **3″ from where the model started** (real cap, not honor-system), without setting the movement `moved` flag; Undo reverts it. `piling` clears on any phase change. **Backup written:** `backups/backup_v2.16.29-pilein_2026-08-29.zip` (5th-build fallback). Also confirmed in testing: **Armor of Contempt is mis-timed** — it is a defender **reaction** used when your unit is the target of an attack (opponent's Shooting, or Fight), not an active-seat action in your own Shooting/Fight. It will move into the reaction system build (see `COMBAT_PLAN.md`), which now covers Rapid Ingress + Fire Overwatch + AoC.
- `v2.16.28-demo-drop-fix` — bugfix from Practice testing: with a committed lobby army (incl Demo), the manual quick-add buttons (Demo forces / Infantry / Commander / Walker) now hide — they placed **non-reserved** units and the gold Demo-forces button wiped the spawned formation, emptying the drop queue so Begin drops had nothing to place. Root cause: `demoForces()`/`addDrop()` bypass `markFormation`; `showDemo` showed them for a committed `__demo__` army. Also split the demo Commander into its own group id (`c`+seat) so it deploys as a distinct **Infiltrator** instead of bundled with the Infantry squad. Manual buttons still available in free play (no committed army). Fix if a game is already stuck: Full Reset to respawn the formation.
- `v2.16.27-vp-undo` — §6 agreed-after-cleanup done: **VP ticker** — phases sub now shows live `obj P1/P2` objective count; on turn change the log prints an objectives-held mission line beside the existing score line (display only — still the one `scoreMission`, no second scorer). **Revert → Undo** — button renamed; Undo now reverts the last single **model drag** first, and falls back to the whole-unit one-step undo for declared Advance / Fall Back / Charge / Ingress. Tracks `lastDragId`; all UI 'Revert' text now reads 'Undo'. NOT changed: scoring still fires only at end of turn (Next past Fight), not on mid-turn phase-button navigation. §6 now fully complete.
- `v2.16.26-resets` — §6 build 2 (must-do complete): Dev toggle now real — **Dev off = match-like** (gates enforced, real dice, active-seat only); Dev on = skip gates + queue dice. Two resets: **Full Reset** (practice wipes to lobby/army pick; PVP two-press to setup) and **Reset match** (restores a snapshot cloned at `startBattle()` — units where drops finished, terrain locked, back to BR1 Command; practice confirm, PVP two-press). Additive board fields `matchSnapshot` / `snapAsk` — no worker change. §6 §Must-do items 1–7 all done. Next: §6 §Agreed — VP ticker (wire to existing `scoreMission`) + rename Revert → Undo (last model drag).
- `v2.16.25-cleanup` — §6 build 1: removed **Drop saved** (one drop path), honest names (off the table / to place / Strategic Reserves), lobby copy (Attacker/Defender reminder, PVP label **Your list (this device)**), single reserve-voice hint during drops. §6 item 4 (grey phase Next in Setup) already satisfied — phase buttons disabled in Setup, Next reads **Start battle**. Still open: §6 item 3 (dev on/off active-seat lock) and item 5 (two resets + snapshot-at-Start-battle).
- `v2.16.24-army-kit` — enhancement **cards** UI (count box gone), Seekers `chapter: SALAMANDERS` lock, He’stan **95** / Apothecary **40** / Redeemer **260/280** pts-only red sheet, unit-aware Guide.

`datasheets/index.js` was **wiped to 0 bytes mid-edit on 2026-08-29** and rebuilt from the APIs `army.html` / `datasheet.html` / `wh40k.html` call. It works. If points bands or list persist look off versus memory, diff behavior against `WORKFLOW2` tests before rewriting it again.

---

## 5. How deploy works today (Practice)

This is what Taylor was testing. Wording is still jumbled — cleanup is the next code pass.

1. Lobby: battle size, Seat 1 army, Seat 2 army, who goes first (that seat = Attacker; other = Defender and places first), mission.
2. Enter table. Armies spawn **off the table** (formation). That is not Strategic Reserves yet.
3. Units tool. Edge dropdown = which seat you are looking at. Mark units that stay off all game → **Reserves** (`· SR`) **before** Begin drops.
4. **Begin drops** — Defender’s “to place” list. Select → **Deploy unit** → drag in the 12″ DZ → **Next player** locks and passes. Titanic = opponent places two.
5. Infiltrators, then Scouts, then **Start battle**.
6. Ignore **Drop saved** during this sequence. It dumps a spare model and skips the official path.

PVP: one “your army” picker (this device). Same DO board. Start battle needs both ready + units on the table (or marked SR). Match Reset is two-press.

---

## 6. Agreed cleanup — NOT CODED YET

Discussed 2026-08-29. Next agent should implement this before more combat. Taylor signed off. Do not invent extra scope.

### Must do (one pass)

1. **One drop path.** Remove **Drop saved** from the gold row (or bury it as “skip sequence”). Gold path only: Begin drops → Deploy unit → Lock drop / Pass seat → Start battle.
2. **Honest names.** Formation = “off table.” Bottom row during drops = “to place.” `· SR` = Strategic Reserves. Never call the whole formation “Reserves.”
3. **Dev vs lock (Practice only).**  
   - Dev **on** = current practice: drive both seats, skip gates, queue dice.  
   - Dev **off** = lock to **active seat**, like a match.  
   - PVP never drives the other player’s models.
4. **Grey Next (phase) during Setup.** Start battle is the setup advance. **Next player** already hides after Setup.
5. **Two resets + confirm on both modes.**  
   - **Full Reset** → lobby / choose army (today’s practice wipe). PVP still two-press.  
   - **Reset match** → snapshot taken at **Start battle** (units where drops finished, terrain locked, BR1 Command). Needs a stored board clone at `startBattle()`.  
   - Reset is not Undo.
6. **Lobby copy.** Who-goes-first reminder: that seat is Attacker; the other is Defender and places first. PVP army label: **Your list (this device)**.
7. **Fewer overlapping hints** during drops. One voice (reserve hint). Guide for after Start battle.

### Agreed, next build after cleanup

- Honesty **VP ticker** + mission line in the log when the turn changes. `scoreMission` already computes hold 1+ / 2+ / more from OC within 3″ (Battle-shock OC 0). Do **not** add a second scorer — display what already ran.
- Rename Revert → **Undo**. Undo last **model drag**. Advance / Fall Back / Charge stay one unit-wide step. No full-game undo stack (dice, CP, shock, deletes) in that pass.

### Explicitly parked

- Wargear options tree (split sheets for now).
- Overwatch resolve, Fights First / fight order, Rapid Ingress spend.
- True LoS / model heights. Cover −1 on Light/Dense stays the stand-in.
- SM Seekers/Firestorm **enhancement card names+pts** until they come from MFM (empty state is correct).
- Land Raider Redeemer weapons — red pts-only until a pack card is ingested (`wh40k-datasheet`: draft and wait).

---

## 7. Suggested next-session order

1. Implement §6 “Must do” in `wh40k.html` (+ tiny lobby label). Bump BUILD (e.g. `v2.16.25-cleanup`). Bump `pt-shell-v29`. Edit in place.
2. Snapshot-at-Start-battle for Reset match.
3. VP ticker + mission line (wire UI to existing `scoreMission`).
4. Undo = last model drag; keep unit-wide declare as one step.
5. Then combat test list in `WORKFLOW2.md` §1 (charge fail, shock, strats, two-seat drag lock) — Taylor said the match is the hard thing to test; iron table feel first.
6. Then Overwatch / fight order / Rapid Ingress.

---

## 8. Demo Forces (intentional)

Demo is the **teaching kit**, not a real army. Every new table ability should land on this kit.

| Token | Why it exists |
|---|---|
| Infantry | SCOUTS, Torrent rifle, GRENADES, body for wound order |
| Commander | CHARACTER, INFILTRATORS, FnP 5+ |
| Walker | TITANIC, DEEP STRIKE |

All three also have Scout 6″, Deep Strike, Fights First, GRENADES. Do **not** put INFILTRATORS on every model or Begin drops skips the normal DZ step.

---

## 9. Army / catalog notes

- Enhancement UI is checkboxes, not a count. Costs add to `listTotal`. Cap from battle size. Packs list cards on `enhancements: [{ id, name, pts, detIds }]`. SM catalog has **no cards seeded yet**.
- Forgefather’s Seekers: `chapter: "SALAMANDERS"`. Generic ADEPTUS ASTARTES ok. Other chapter keywords blocked on Save + legal banner.
- He’stan 95, Apothecary 40, Redeemer 260 / 280 3rd+ in `mfm-seed.js` + sheets.
- Datasheet editor had a stray `};` after MFM check — fixed. Faction dropdown and sheet list should paint after title-tap.

---

## 10. Files to touch

```
artifacts/proxy-table/
  wh40k.html          # table + lobby + Guide + deploy
  army.html
  datasheet.html
  datasheets/index.js # catalog core (rebuilt 2026-08-29)
  datasheets/demo.js
  datasheets/space-marines.js
  datasheets/mfm-seed.js
  sw.js
  worker/src/match.js # only if 40K persist/seats change
artifacts/WORKFLOW2.md
artifacts/PROXY_TABLE_HANDOFF.md
```

User copies from this folder to OneDrive deploy path, then title-taps.

---

## 11. Constraints for the next model

- Work only in `artifacts/proxy-table/` for app code.
- Teaching first. Soft warn before hard lock.
- Do not scrape GW. Do not invent Codex ability text. Points from MFM seed or user-entered.
- Do not “fix” 40K sync by splitting boards like MTG.
- Do not start LoS or a wargear tree while §6 is open.
- After any table edit: bump `BUILD` in `wh40k.html` and `SHELL` in `sw.js`, then tell the user to copy those files and title-tap.
