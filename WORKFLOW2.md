# Proxy Table 40K — Next Steps

Check items off with `[x]` as they land. Add notes under any item freely.

**Current build:** `v2.16.38-unit-fire-scoreboard` (`wh40k.html`) · hub `v2.7.9-army` (`index.html`) · SW `pt-shell-v42`  
**Handoff:** `artifacts/PROXY_TABLE_HANDOFF.md` (2026-08-29) — agreed cleanup in §6 is **not coded yet**.  
**Baseline:** 11th edition Core Rules · skill `wh40k-rules`  
**Constraint:** Do not change MTG game structure except for bug fixes. 40K stays in `wh40k.html`.

**Project path:** `artifacts/proxy-table/` (`wh40k.html`, `index.html`, `sw.js`, `worker/`, `army.html`, `datasheet.html`, `datasheets/`)

---

## Queued fixes — SHIPPED in v2.16.38

- [x] Whole-unit shooting & fighting.
- [x] Scrollable all-rolls readout.
- [x] Toggleable honor-system scoreboard (auto primary VP + manual secondary +/-; CP auto +1/turn + manual +/-).


## Already shipped (do not re-litigate)

Practice smoke, Setup lock, phase tools, movement commit / Revert, shoot-fight dice, allocation + FnP, charge roll + **fail**, reserves + Ingress teaching slice, two-seat PVP confirm (2026-08-25), army generator + points bands + faction picker + catalog search + Army FAQ + list export/import, Demo Forces as a lobby list (`v2.16.14`), Practice two-list seats (`v2.16.17-practice-seats`), Nids + Space Marines catalogs (gold pack / purple fan / red pts-only), Battle-shock as a Command step, CP + Command Re-roll / Grenade / Armor of Contempt, Dawn of War drops + Take and Hold / Sweeping Engagement (`v2.16.20-deploy-mission`).

Teaching first: soft warns before hard locks.

---

## Suggested order

1. [x] Prove list → table drop (Boyz or Infernus) — `v2.16.15-list-drop`
2. [x] List export / import — `v2.16.16-export-guide`
3. [x] Table Guide copy to match Army help — `v2.16.16-export-guide`
4. [x] Charge fail + Battle-shock as real steps — `v2.16.18-charge-shock`
5. [x] CP + 2–3 generic stratagems — `v2.16.19-strats`
6. [x] Official-ish deployment slice — `v2.16.20-deploy-mission`
7. [x] Missions last — `v2.16.20-deploy-mission`

Skip full LoS and every Codex until someone is playing weekly. Tokens on a flat board cannot do model-height True LoS without inventing heights; cover −1 on Light/Dense is the teaching stand-in.

---

## 1. Table combat

Shipped: list-drop weapons `v2.16.15` · charge fail + Battle-shock `v2.16.18` · CP + Re-roll / Grenade / AoC `v2.16.19`.

### Need to test
- [ ] Wound order: wounded first, Character last
- [ ] FnP on a Commander / Vulkan
- [ ] Charge ring stays at origin; second Advance blocked
- [ ] Charge fail: short 2D6 snaps back; leaving Charge short also fails
- [ ] Battle-shock: damaged unit in Command → Announce → BS + OC 0; pass still counts as tested
- [ ] Command Re-roll 1 CP on last Advance / Charge / Battle-shock (failed charge can succeed)
- [ ] Grenade: GRENADES/EXPLOSIVES, 8″, 6 dice 4+=MW
- [ ] Armor of Contempt on the unit being shot/fought; AP worsened by 1 this phase
- [ ] Shocked unit cannot take those stratagems; second use same turn blocked
- [ ] Ingress BR2+, illegal spot warns, Revert to Reserves
- [ ] Soft eligibility warns (already shot, Fall Back, ER)
- [ ] Two-seat: cannot drag the other player’s models
- [ ] Practice: real list on seat 1 and a different list (or Demo) on seat 2
- [ ] Demo hides only on the edge that loaded a real list

### Need to build
- [ ] **Rapid Ingress + Fire Overwatch** — build spec in `COMBAT_PLAN.md`. 11th-ed: both react at the end of the opponent's Movement phase; Overwatch is Snap Shooting (hits on 6s). Practice first, PVP later. Awaiting go + answers to the 5 open questions.
- [ ] Overwatch resolve
- [ ] Fights First / fight order
- [ ] Rapid Ingress as a 1 CP stratagem (button is still a label)
- [ ] True LoS / cover — parked until weekly play (cover −1 on Light/Dense is the stand-in)

---

## 2. Army / catalog

Shipped: export/import `v2.16.16` · formation spawn into Reserves `v2.16.20`. Points live on saved units + MFM seed. Practice over-points warns, does not block.

### Need to test
- [x] Faction picker hides other factions
- [x] Search: name + keyword (`salamanders`, `infernus`)
- [x] 3rd+ / model-count bands change the quote
- [x] Cannot save Marines onto a Tyranid list
- [x] Legal banner: over points, over DP, copy cap
  - Banner stays. Popup on Save to list / battle-size change when over pts, DP, enhancements, or copy cap. Still saves for Practice.
- [ ] Purple / gold / red colors after title-tap
  - Official pack/card names are gold. Fan (Wahapedia) stay purple. Red is pts-only (no stat line) — almost none in the current packs, so you will mostly see gold + purple.
- [x] Army help accordion opens
  - General how-to only (start, faction, colors, points, detachments, add, export, table). No faction starters.
- [x] Datasheet editor lists sheets after title-tap (not only New sheet)
- [x] Export one list / export all / import adds a new list (does not overwrite)

### Need to build
- [x] Enhancement cards (not a count box)
  - Tick cards instead of a count. Cost adds to the list total. Cap still from battle size. SM Seekers/Firestorm cards not seeded yet (need MFM names+pts) — empty state until a pack lists them.
- [x] Forgefather’s Seekers chapter lock in code (Salamanders only)
  - Detachment `chapter: SALAMANDERS`. Generic Astartes ok. Other chapter keywords blocked on Save and on the legal banner.
- [x] Vulkan He’stan + Apothecary MFM points
  - He’stan 95. Apothecary 40. Seed + sheet. Biologis already 70.
- [x] Land Raider Redeemer sheet
  - Points-only (red): 260 / 280 3rd+. No weapons until a pack card is ingested.
- [ ] Wargear options tree (later — split sheets for now)
- [x] Unit-aware Guide
  - Selected unit prepends Infiltrator / Scout / Titanic / Grenades / DS / FnP / Character lines.

Points already live on saved units + MFM seed. Table does not hard-block Practice over-points.

---

## 3. PVP / hub

Shipped: two-seat confirm 2026-08-25 · Guide copy `v2.16.16`. Re-test after lobby/army/deploy changes.

### Need to test
- [ ] Challenge opens `wh40k.html?match=`
- [ ] Rejoin restores board after title-tap (including `deploy` + `mission` + VP)
- [ ] Start needs both ready + at least one unit per seat on the table
- [ ] Reset two-press actually clears both clients
- [ ] Names vs P0/P1 on the seat line
- [ ] Match list: Army vs Army (same scheme as MTG decks)
- [ ] Both seats on `v2.16.20-deploy-mission` — mixed BUILD desyncs whose drop it is

### Need to build
- [ ] Anything that still fails in those tests
- [ ] Hub one-liner: teaching proxy, fan sheets are purple

---

## 4. Deployment / missions

Shipped in `v2.16.20-deploy-mission`: Dawn of War 12″ DZs, Defender first, formation Reserves, Titanic = two drops, Infiltrators, Scouts 6″, Take and Hold / Sweeping Engagement (5 / 5 / 5 VP), 50% Reserves warn.

### Need to test
- [ ] Formation → mark Reserves → Begin drops → Defender places first
- [ ] Drop does not pass if the unit is outside its DZ or coherency is broken
- [ ] Titanic: opponent then places two
- [ ] Infiltrators after normal drops, >8″ from enemy DZ and units
- [ ] Scout move 6″ or pull a reserved Scout into own DZ
- [ ] Cannot mark new Reserves after Begin drops
- [ ] Start battle locks terrain and opens Command
- [ ] End of your turn via Next: 5 VP for 1+ held, 5 for 2+, 5 if you hold more than the opponent
- [ ] Old Practice save: Reset once or pre-2.16.20 boards skip formation

### Need to build
- [ ] Redeploys after drops, then roll first turn, then pre-battle abilities (first turn is still the lobby pick; redeploy is honor-system)
- [ ] Score when leaving Fight on the phase buttons (VP today only runs off Next out of Fight)
- [x] Practice: lock free-drop to the drop-turn seat so the edge dropdown cannot place the wrong army
  - `v2.16.21-drop-pass`: Next player passes and locks. Reserves row is the current seat only. Strategic Reserves do not block Start battle.

---

## 5. Product glue

Shipped: this file synced to `v2.16.20-deploy-mission`.

### Need to test
- [ ] Title-tap BUILD is `v2.16.20-deploy-mission`
- [ ] SW is not serving a stale `army.html` / `datasheets/` (`pt-shell-v23`)
- [ ] Empty faction files do not appear in the picker

### Need to build
- [ ] Optional: hide factions with zero sheets

---

## Deploy reminder

OneDrive primary: `proxy-table\proxy-table` → `deploy.bat` / `deploy.ps1`.  
Copy: `index.html`, `wh40k.html`, `army.html`, `datasheet.html`, `datasheets/`, `sw.js`, `manifest.webmanifest`, icons, deploy scripts.  
Worker only when `worker/` actually changed — say which files.  
After push: **tap page title** (40K BUILD should read `v2.16.20-deploy-mission`).  
**Must deploy `worker/` when match persist / seats / lobby API change** — boards live in Durable Object storage + D1 `match_state`.  
Worker was **not** changed for 2.16.17–2.16.20. Additive board fields only.
