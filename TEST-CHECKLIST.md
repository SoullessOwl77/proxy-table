# Test checklist — v2.16.28 → v2.16.34 (2026-08-30)

Check `[x]` as they pass; note issues under any item.

## v2.16.28 — Demo drop fix
- [ ] Both seats = Demo Forces, Enter table → manual quick-add buttons (Demo forces / Infantry / Commander / Walker) are hidden.
- [ ] Begin drops → to-place list shows units (Infantry + Walker), not empty.
- [ ] Infantry + Walker drop in the normal step; Commander comes up separately in the Infiltrate step (not bundled with infantry).

## v2.16.29 — Pile-in / Consolidate
- [ ] Fight → select unit → Pile-in → can drag it, capped at 3" (past 3" snaps back).
- [ ] Consolidate after fighting → same 3" drag.
- [ ] Undo reverts a pile-in move; tapping an enemy still targets normally.

## v2.16.30 — Rapid Ingress (Practice)
- [ ] Mark a unit Strategic Reserves in deploy; reach round 2+; Next out of the other seat's Movement → bar offers Rapid Ingress.
- [ ] Pick reserve → Rapid Ingress → arrives, spends 1 CP; drag to legal spot (>8" warns); Done → continues to Shooting.
- [ ] Round 1: not offered (hard block).
- [ ] No reserves: Next out of Movement does NOT pause.
- [ ] Once per battle round — not offered again after use.

## v2.16.31 — Fire Overwatch (Practice)
- [ ] Reacting seat: unengaged gun unit within 24" of an enemy, 1 CP, round 2+ → bar offers Fire Overwatch.
- [ ] Fire Overwatch → tap shooter → tap enemy within 24" → Fire → Snap (hits only on 6s).
- [ ] Titanic (demo Walker) can't Overwatch; engaged shooter blocked; target >24" rejected.
- [ ] Both reactions available → shown in one window; do both, then Done.
- [ ] Allocation guidance now shows in Fight too.

## v2.16.32 — Lobby scroll (mobile)
- [ ] Mobile: open lobby, scroll up → Battle size (top field) reachable.
- [ ] Desktop: lobby still centered / normal.

## v2.16.33 — Armor of Contempt (reaction)
- [ ] Shooting/Fight → tap attacker then enemy → "Armor of Contempt" button appears on the combat bar.
- [ ] Tap it → spends defender's 1 CP, AP-1 on that unit; resolve Attack → AP one worse.
- [ ] No longer in the Optional actions row.
- [ ] Not offered on a Battle-shocked target, with no CP, or if already used.

## v2.16.34 — PVP reactions (two devices)
- [ ] Two devices same match; reacting seat has a reserve or Overwatch target, round 2+. Active Next out of Movement → active shows "waiting for X"; other device shows the reaction bar.
- [ ] Reactor does Rapid Ingress / Overwatch → result appears on both devices.
- [ ] Reactor Done/Pass → active presses Next → advances.
- [ ] Reactor passes with no action → active can still proceed (no loop / re-offer).

## Regression
- [ ] Full Reset (to lobby) and Reset match (to Start-battle snapshot) still work.
- [ ] VP objective ticker (obj count) updates; Undo behaves.
