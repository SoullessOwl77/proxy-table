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
| Hub + MTG + Your Matches | `index.html` (`v2.7.10-howto`) |
| 40K table | `wh40k.html` (`v2.16.46-walkthrough`) |
| Army builder | `army.html` |
| Datasheet editor | `datasheet.html` |
| Catalog | `datasheets/load.js` + `index.js` + faction packs + `mfm-seed.js` + `demo.js` |
| SW | `sw.js` (`pt-shell-v50`) |
| Shared guide model | `guide-data.js` (tooltips + walkthrough + tutorial) |
| How-to-play tutorial | `howto.html` (paged, reads `guide-data.js`) |
| Backend | `worker/` — D1 + Durable Object `Match` + webpush |

**Rules baseline:** 11th edition Core Rules (~2026-06-01). Skills: `wh40k-rules`, `wh40k-datasheet` (draft and wait — do not invent paid Codex text). Official hubs: Warhammer Community downloads + `https://mfm.warhammer-community.com/en`. No live MFM scrape; seed + on-demand lookup only.

---

## 2. Current BUILD (must match title subtitle)

| File | Version |
|---|---|
| `wh40k.html` | `v2.16.46-walkthrough` |
| `index.html` | `v2.7.10-howto` |
| `sw.js` | `pt-shell-v50` |

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
- `v2.16.46-walkthrough` — Added an interactive **spotlight walkthrough** on the 40K table, modelled on the hub's MTG tour (a cutout hole + caption box, Back/Next/Skip). `tourStart` snapshots S, drops demo forces for both seats and marks the game started, then steps through the board, the four tools, and each phase (switching phase so real controls show), spotlighting elements with beginner captions on what each does / what's optional / how you tap; `tourEnd` restores the pre-tour S (fully non-destructive). Launched by finishing the read-through (howto.html final button -> `wh40k.html?tour=1`) and replayable from a **Replay walkthrough** button in the Guide panel. Tour DOM inserted before the main script so handlers bind. SW -> pt-shell-v50. Node-verified. Not a backup build (next backup v2.16.49).
- `v2.16.45-howto-newbie` — Rewrote the tutorial for a **zero-knowledge general audience**. All six `phases[*].tutorial` blocks and the three `asides` in `guide-data.js`, plus the overview page in `howto.html`, now define every term on first use (model vs unit, objectives/Victory Points, Command Points, Battle-shock, Strategic Reserves, Infiltrators, Scouts, Engagement Range, Objective Control, Cover, Hit/Wound/Save/Damage) in plain language. The overview now opens with what the game even is. In-app hover tooltips (short/more/do/dont) left terse and unchanged — those are for the player mid-game. SW bumped to pt-shell-v49 so clients re-fetch guide-data.js + howto.html. Node-verified. Not a backup build (next backup v2.16.49).
- `v2.16.44-howto-link` — Added the **standalone How-to-play tutorial** (`howto.html`) and linked it: the hub's previously-disabled 40K "How to play" button now opens it, and the table's Guide panel has a "Full how-to-play guide" link. The tutorial is paged (Overview -> setup -> the five phases -> Reactions / CP / Scoring asides), Prev/Next + a jump nav + arrow keys + hash deep-links, and renders **entirely from `guide-data.js`** so it never drifts from the tooltips. New files `howto.html` + `guide-data.js` added to the SW SHELL cache. **Backup written:** `backups/backup_v2.16.44-howto-link_2026-09-04.zip` (61 files, excludes `.git`).
- `v2.16.43-shared-guide` — **Unified the guidance model.** New `guide-data.js` (`window.PT_GUIDE`) is the single source for hover tooltips, the Guide walkthrough, and the tutorial. In `wh40k.html` the inline `TIPS` and `GUIDE` literals are now derived from `PT_GUIDE` at load (script included after `datasheets/load.js`, before the main script). Content corrected to current behavior: 11th setup sequence, whole-unit shooting/fighting, one-2D6-per-unit charge, fights-first order, reactions, scoreboard. Update guidance in one file and every surface follows. Node-verified all key coverage.
- `v2.16.42-eleventh-setup` — **Setup rebuilt for 11th.** Decoupled first turn from the lobby: the lobby pick now sets Attacker/Defender (deploy order) only. New **Determine First Turn** deploy step after Infiltrator placement — a roll-off (`doRollFirstTurn`, D6 each, re-roll ties) then the winner chooses (`chooseFirstTurn`), which sets `activeSeat` and advances to the pre-battle (scouts) step. Start battle blocked until first turn is set. Reframed the Scouts step as Pre-battle abilities (Scout moves / Scout-to-Reserves / redeploys). Lobby + TIPS/GUIDE copy updated. Researched against 11th sources (New Recruit, Wahapedia 11e, Tabletop Battles). Node-verified.
- `v2.16.41-fights-first` — Fight-order teaching slice. New helpers `isFirstFighter` (charged-and-not-failed OR has Fights First), `unitEngaged`, `fightOrderLists`, `firstFightPending`. The **Fights First** action button is now live (placeholder removed): tapping it (and `refreshTip`) calls `showFightOrder`, which reads the current table and shows a Tip listing engaged units as “fight first (chargers + Fights First) → then the rest, non-active player first,” with a (done) tag on already-fought units and a short line counting first-fighters still owed a fight. `resolveUnitAttack` adds a **non-blocking** soft-warn: fighting a normal unit while un-fought first-fighters remain in engagement pops a warnbar reminder but still resolves (engine is active-seat-only, so true cross-player alternation stays manual). ASCII-only strings to sidestep the em-dash encoding. Node-verified.
- `v2.16.40-fight-once` — Bugfix: the Fight phase had no once-per-phase gate, so a unit could keep attacking until the enemy vanished. Shooting was fine (the `shot` flag + `shootGate` blocks re-fire); Fight set a `fought` flag but nothing checked it. Added a Fight gate in `resolveAttack`: a model with `fought` (and not dev-open) is skipped with reason "already fought this phase" — so a second Attack click reports all models as already fought instead of resolving again. Clears each turn via `beginSeatTurn`.
- `v2.16.39-volley-report` — Volley accountability. `resolveAttack` now RETURNS a short reason string on every skip (out of range, in engagement range, friendly, etc.) instead of just a silent `return`. `resolveUnitAttack` collects non-firing models into `volleySkipped` and reports them: dice readout shows "N of M fired", each skipped model is logged ("X did not fire — out of range (Y in)"), and the Rolls panel lists them. Answers the "why didn't that one fire?" question and reveals whether a 4-of-5 was a real range/ER skip. Rifle TORRENT auto-hit and dead-target auto-advance (no shooter lost on a kill) confirmed as correct. **Backup written:** `backups/backup_v2.16.39-volley-report_2026-09-04.zip`.
- `v2.16.38-unit-fire-scoreboard` — Batch build: **whole-unit shooting & fighting** (Attack loops the unit's models via `resolveUnitAttack`), **scrollable all-rolls readout** (`volley` array + `renderRollPanel`/`rollBlockHtml` list), and a **toggleable honor-system scoreboard** (`Score` button → `#scorepanel`: per-seat VP = auto primary + manual secondary +/-, and CP auto +1/turn + manual +/-). `scoreAdj` is an additive synced board field. Node-verified; VM was flaky, applied in two passes.
- `v2.16.37-aoc-prompt-ow-squad` — Two combat reworks from testing. **Fire Overwatch now fires the whole shooting squad** at the target (loops `resolveAttack` over each non-Titanic model with a ranged weapon, Snap; stops if the target unit is wiped), not one model; still 1 CP for the unit. **Armor of Contempt moved off the combat bar to a reaction-bar prompt** (like Rapid Ingress): when the active seat picks an attacker + target in Shooting/Fight and the defender can AoC, the green reaction bar shows "Defend - [seat]: Armor of Contempt (1 CP) / Pass" (client-local `aocPrompt`, driven from `renderCombatBar`; the RI button doubles as the AoC button, Pass dismisses). Old `#btnAoc` removed. Note: AoC is still Practice-only (its trigger reads client-local `targetId`, which doesn't sync — PVP AoC still needs targeting synced into the board). Node-checked.
- `v2.16.36-charge-perunit` — Combat correctness from testing. **Charge is now one 2D6 per unit** (was per model): rolling with any squad model rolls once and stamps the same total on every model in the group; re-roll blocked once any member has rolled; `need` is the min across the squad; each model's drag clamps to the roll (no per-drag fail); the end-in-ER check moved to `resolveOpenCharges` and is per-unit (succeeds if ANY model reached 2" ER, else the whole unit snaps back via a group-wide `failCharge`). **Consolidate/Pile-in repeat-move fixed**: was capped to 3" from each pickup point, so you could walk a unit 3" at a time; now each model stores a `pileOrigin` at announce and every drag clamps to 3" from that fixed point (adjustable inside the bubble, never beyond). The 3" ring now anchors at `pileOrigin` persistently. Verified the math in Node. **Next build:** Armor of Contempt moves to a reaction-bar prompt (like Rapid Ingress) when your unit is targeted, and Fire Overwatch fires the whole chosen squad (per user testing).
- `v2.16.35-reaction-visible` — Test fixes. **Critical:** the reaction bar (`#reactionbar`, class `warnbar`) was never visible — `.warnbar` is `display:none` in CSS and the code showed it with `style.display=""` (which lets the CSS win), so Rapid Ingress AND Fire Overwatch never appeared in any of .30–.34. Now shows with `display:"flex"`, plus a distinct `#reactionbar` style/position (green/brass, below the red warn bar). Undo button now also shows in the Fight phase when a pile-in/consolidate drag exists (`lastDragId`). Reserve button relabeled **Strategic Reserves**. Added a 3″ gold ring anchored at the pile-in start point during the drag. Confirmed SR units keep `reserved:true` through Start battle, so Rapid Ingress has units to offer. Re-test the whole reaction system — it was unreachable before this.
- `v2.16.34-pvp-reactions` — Reaction system, PVP layer for the two end-of-Movement reactions (Rapid Ingress + Fire Overwatch). No worker change — `S.reaction` / `S.reactUsed` are board fields synced by the existing `pushState` (whole-S LWW by rev; no seat write-lock, so the non-active reactor client can write). Flow: the **active** client leaving Movement opens the window and syncs it (only the active client opens — `mySeat===activeSeat` gate); the **reactor** client (`mySeat===reaction.seat`) sees the bar and acts (place/drag a reserve, or snap-fire), pushing to the shared board; when the reactor taps Done/Pass the window clears and the active player presses Next to continue. A `windowOffered` key (round+activeSeat) opens the window once per opponent's Movement — prevents a re-offer loop when the reactor passes. `canControlUnit` now hands drive to the reactor in PVP too. The paused active client shows a “waiting for X to react” bar. Known limits: if the reactor is offline the active player is stuck until Reset (no skip-after-timeout yet). **AoC PVP deferred** — it hangs off `attackerId`/`targetId`, which are client-local globals (not in S), so the defender client can't see the target; needs targeting synced into the board first. Verified gating in Node; **needs live two-device testing.**
- `v2.16.33-aoc-reaction` — Reaction system, slice 3 (Practice): **Armor of Contempt** moved to its correct home. Removed from the active-seat Optional actions row; it is now a defender reaction in the **combat bar** — when the active seat picks an attacker and an enemy target in Shooting/Fight, an Armor of Contempt button appears for the **target's** owner. Clicking spends 1 CP from that (defender) seat and sets AP−1 against that unit for the phase (the existing `aoc` mechanic; clears on phase change). Gated: defender has ≥1 CP, not already used, target not Battle-shocked, not already AoC'd. The old announce-handler branch is now dead code (unreachable — AoC is no longer in ACTIONS). Guide text updated. This completes the Practice layer for all three reactions (Rapid Ingress, Fire Overwatch, Armor of Contempt). **Remaining:** the PVP layer, where the non-active/defending client acts through the shared board.
- `v2.16.32-lobby-scroll` — Mobile fix: the lobby modal was `align-items:center`, so on a phone a sheet taller than the viewport pushed its top (Battle size) off-screen with no way to scroll up. Changed the container to `align-items:flex-start` and gave `.sheet` `margin:auto` — centers when it fits, top stays reachable and scrollable when it doesn't. CSS-only.
- `v2.16.31-overwatch` — Reaction system, slice 2 (Practice): **Fire Overwatch**. Same end-of-Movement reaction window now offers Rapid Ingress AND Fire Overwatch (both 1 CP, either/both usable, then Done). Overwatch: tap an unengaged non-Titanic shooter, then an enemy within 24″, then Fire — resolves through the existing attack engine with a new `overwatchMode` flag that bypasses the active-seat gates and forces **Snap Shooting** (hitNeed 7 + Torrent off → hits only on unmodified 6; verified in Node). Once per battle round per seat (`ow` key). Targeting taps handled in `pointerdown` while `S.reaction.mode==="overwatch"`. Small win folded in: corrected the stale Rapid Ingress / Overwatch placeholder action text (no longer "not playable yet"). **Still to do:** move Armor of Contempt to the target-selection reaction hook; then the PVP layer.
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
- **Backups & docs standing rule:** a build = any change that bumps `v#`. Back up (zip to `backups/`) on every 5th patch increment (.29, .34, .39, .44 …) and on any minor/major rollover (rollover resets the count). **Every time a backup is written, also refresh `WORKFLOW2.md` (status + build line) and this file's build table** so the trackers never drift.
