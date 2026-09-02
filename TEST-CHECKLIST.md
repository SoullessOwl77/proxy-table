# Test checklist — current build v2.16.37-aoc-prompt-ow-squad (2026-08-30)

## Charge (v2.16.36 — per unit)
- [ ] Charge a multi-model squad: one 2D6 roll covers the whole unit; every model becomes draggable off that one roll.
- [ ] Can't roll charge again for the same squad once it's rolled.
- [ ] Each model drags up to the roll; overshoot clamps to the limit (doesn't fail).
- [ ] Leave Charge phase (Next): charge holds if any model reached 2" of the target; whole unit snaps back if none did.

## Consolidate / Pile-in (v2.16.36 — 3" cap fixed)
- [ ] Announce Pile-in/Consolidate, then try to pick the unit up repeatedly — it can't exceed 3" from where you announced.
- [ ] Inside the 3" bubble you can still reposition freely. The gold 3" ring stays anchored at the announce point.

## Fire Overwatch (v2.16.37 — whole squad fires)
- [ ] Trigger Overwatch (reacting seat, unengaged gun unit within 24", 1 CP, round 2+). Tap shooter, tap enemy within 24", Fire.
- [ ] The WHOLE shooting squad fires at the target (multiple models' weapons resolve), Snap (hits on 6s), 1 CP for the unit.
- [ ] Titanic can't Overwatch; engaged shooter blocked; target >24" rejected.

## Armor of Contempt (v2.16.37 — reaction prompt)
- [ ] Shooting/Fight: tap your attacker, then an enemy → the green reaction bar shows "Defend - [seat]: Armor of Contempt (1 CP) / Pass" (NOT a button next to Attack).
- [ ] Tap Armor of Contempt → spends the defender's 1 CP, AP-1 on that unit; then resolve Attack → AP one worse. Pass dismisses.
- [ ] Not offered on a Battle-shocked target, with no CP, or if already used.

## Reaction system re-check (v2.16.35 made the bar visible)
- [ ] Rapid Ingress: reserve on the reacting seat, round 2+, Next out of opponent's Movement → bar offers it; place, drag, Done.
- [ ] Both Rapid Ingress and Fire Overwatch offered in one window when both available.
- [ ] PVP (two devices): active shows "waiting"; other device acts; results sync; Done → active Next advances.

## Regression
- [ ] Undo works in Movement and in Fight (after a pile-in). Full Reset, Reset match, VP objective ticker all fine.
