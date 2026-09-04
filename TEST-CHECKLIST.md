# Test checklist — current build v2.16.38-unit-fire-scoreboard

## Whole-unit shooting & fighting
- [ ] Shooting: tap any model of your unit, tap an enemy, Attack → the WHOLE unit fires (all gun models). Dice readout shows a "Unit volley: N firing — X hits..." summary.
- [ ] Fight: same, but only models within 2" engagement of the target fight.
- [ ] Single-model unit (Commander/Walker) still fires just that one.
- [ ] Overwatch still fires the whole squad (unchanged).

## Scrollable all-rolls readout
- [ ] After a unit volley, open Rolls (or it auto-opens) — it lists EVERY model's rolls (Model 1, Model 2, ...) with a totals header, and scrolls.
- [ ] Single attack still shows just that one roll.

## Scoreboard (toggle, honor system)
- [ ] "Score" button in the left rail toggles a panel (hidden until opened, like Rolls). Doesn't cover the screen otherwise.
- [ ] Shows each seat: VP = primary (auto, from objectives) + secondary (manual), and CP.
- [ ] VP +/- adjusts the secondary tally (won't go below 0); the total updates.
- [ ] CP +/- adjusts that seat's CP on top of the auto +1/turn (won't go below 0); the change shows in the log and in spending.
- [ ] Primary VP auto-fills as objectives score at end of turn.
- [ ] (PVP) secondary tally + CP changes sync to the other device.

## Regression
- [ ] Normal shooting/fight damage still resolves correctly (allocation, saves, FnP).
- [ ] Command Re-roll, Grenade, and the reactions (Rapid Ingress, Overwatch, AoC) still work.
