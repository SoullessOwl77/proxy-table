# Combat section — build spec: Rapid Ingress + Fire Overwatch

Status: **plan only, no code yet.** Decision on this chat (2026-08-29): plan the reactions first; build for **Practice now, PVP later**. Fights First / fight order is deferred behind these.

Baseline: 11th edition Core Rules (~2026-06). Teaching slice — Core only, no Codex text.

---

## 1. What changed in 11th (why this is simpler than it looks)

Both of these are now **reactions at the end of the opponent's Movement phase** — the same window. That means one reaction hook, not two.

**Rapid Ingress (1 CP — confirmed).**
Window: end of opponent's Movement phase. Target: one of your units in Reserves, unengaged, not Aircraft. Effect: set it up on the table now, as if it were the Reinforcements step of your own Movement phase (so it follows normal Reserves placement — Deep Strike wholly >9" from enemies; Strategic Reserves near a board edge and not in the enemy DZ before round 3). Restriction: **cannot be used in battle round 1 — hard block** (per your call).

**Fire Overwatch (1 CP — confirmed).**
Window: end of opponent's Movement phase. Shooter: one of your units that is **unengaged and non-Titanic** (so the demo Walker can't Overwatch), able to shoot as in your Shooting phase, targeting **one visible enemy within 24"**. Effect: it shoots an eligible enemy as if it were your Shooting phase, but with **Snap Shooting** — hits only on unmodified 6s, no re-rolls allowed. Limits: one unit Overwatches per phase; a unit can Overwatch once per battle round. (11th dropped the old "must target the unit that moved" rule.)

Note: the current in-app placeholder text for Overwatch still says "charge phase / when a charge is announced" — that's 10th-ed. Update it to the end-of-Movement timing when we build.

---

## 1c. Armor of Contempt (also a reaction — folds into this build)

Currently AoC is an active-seat action offered in your own Shooting/Fight phase. That's the wrong timing: it's a **1 CP defender reaction** used *when a unit from your army is selected as the target of an attack* (opponent's Shooting phase, or either player's Fight phase), giving that unit AP−1 against attacks this phase. The AP−1 mechanic already exists (the `aoc` flag read during attack resolution); what's wrong is *who* triggers it and *when*. Hook: unlike Rapid Ingress / Overwatch (end-of-Movement checkpoint), AoC fires at **target selection during an attack** — so it needs a second, smaller reaction prompt in the shooting/fight targeting flow, offered to the **defending** seat. Practice-first: prompt the defender when their unit is picked as a target; PVP later (defender is the non-active client). Same per-battle-round use bookkeeping as the others.

## 2. Engine fit

The turn engine drives one seat at a time (active seat only). Both reactions belong to the **non-active** seat and fire at one moment: when the active seat leaves Movement (Next from movement → shooting). So we add a single reaction checkpoint there.

Existing infra we reuse: `spendCP(n, why, seat)` already takes a seat; `S.cp` is per-seat; Reserves detection (`reservedUnits` / `stayReserve`); Ingress placement + legality; `edgeDist` for 24"; the shooting/attack engine for Overwatch. What's missing: a per-**battle-round** use flag on the reacting seat (today's `stratUsed` clears each of the acting seat's turns, which is the wrong clock for a reaction), and a Snap-Shooting hit override in the attack path.

---

## 3. Practice-first plan (one person drives both seats)

1. **Reaction checkpoint.** When the active seat presses Next out of Movement, before advancing to Shooting, check whether the non-active seat has a legal reaction available: (Rapid Ingress) has ≥1 reserved unit, ≥1 CP, and it is not battle round 1; (Overwatch) has ≥1 unengaged unit with a ranged weapon and an enemy within 24" and line of sight, and ≥1 CP. If neither, advance as normal (no interruption).
2. **Prompt the non-active seat.** If a reaction is available, show a soft prompt: "[non-active seat] may react — Rapid Ingress (1 CP) / Fire Overwatch (1 CP) / Pass." Teaching-first, skippable. In Practice we temporarily hand drive to the reacting seat for the reaction only.
3. **Rapid Ingress action.** Pick a reserved unit → place it using the existing Ingress placement + legality (Deep Strike / Strategic Reserves checks) → `spendCP(1, "Rapid Ingress", reactingSeat)` → mark used this battle round. Not round 1.
4. **Fire Overwatch action.** Pick an unengaged shooter → pick an eligible enemy within 24" → run the existing shooting resolution with a **snap** flag that forces hits on unmodified 6s and disables re-rolls (Command Re-roll blocked here) → `spendCP(1, ...)` → mark used: one unit per phase, once per battle round per unit.
5. **Resume.** Return drive to the active seat and continue into Shooting.
6. **Log lines** for each reaction so both seats can see what happened (honesty, same as the VP line).

New state (additive board fields, PVP-safe later): `S.reactUsed = { "0":{}, "1":{} }` keyed by battle round; a transient `snapShoot` flag on the Overwatch attack.

---

## 4. Deferred for PVP (later build)

On the shared DO board, the reaction happens on the **opponent's** turn, so the non-active client must be prompted and allowed to act while it is not their turn — that crosses the active-seat / turn-ownership model and needs its own pass (who owns the reaction window, how the prompt reaches the other client, LWW while both could touch the board). Keep the Practice hook and state additive so PVP layers on top without a rewrite.

---

## 5. Decisions (locked 2026-08-29)

1. **CP costs:** 1 CP each — confirmed against 11th-ed core stratagems.
2. **Overwatch targeting:** build the full 11th-ed rule from the start — shooter unengaged + non-Titanic, target one visible enemy within 24", Snap Shooting (hits on unmodified 6s, no re-rolls). It's the real rule and no harder than a narrower version; the engine already has range + a hit override is a small flag. Teaching limit for the first slice: one unit may Overwatch per reaction window (expand to the full per-phase / per-round bookkeeping later).
3. **Command Re-roll during Overwatch:** blocked — Snap Shooting cannot be re-rolled.
4. **Prompt:** auto-prompt at the checkpoint while we learn the game.
5. **Round-1 Rapid Ingress:** hard block — the rule forbids it in battle round 1.

---

## Progress

- [x] `v2.16.30` — **Rapid Ingress (Practice)** + reaction checkpoint at end of opponent's Movement. Round-1 hard block, 1 CP, once per battle round, Aircraft excluded.
- [x] `v2.16.31` — Fire Overwatch (Practice) — same checkpoint, Snap Shooting (hits on unmodified 6s), unengaged non-Titanic shooter, target within 24″, 1 CP, once per battle round.
- [x] `v2.16.33` — Armor of Contempt moved to the combat-bar target-selection hook (defender reaction, 1 CP, AP−1 for the phase).
- [x] `v2.16.34` — PVP layer for Rapid Ingress + Fire Overwatch (checkpoint reactions; whole-S sync, active client opens, reactor acts). Needs live two-device testing.
- [ ] PVP Armor of Contempt — blocked on syncing `attackerId`/`targetId` into the board (defender client can't see the target otherwise).

## 6. Suggested build order once confirmed

`v2.16.28` — reaction checkpoint + Rapid Ingress (Practice). `v2.16.29` — Fire Overwatch + Snap flag (Practice). **`.29` is a backup trigger** — write the fallback zip at that build. Then Fights First / fight order. Then the PVP reaction pass.

Sources: 11th-ed core stratagems deep dive (tabletopbattles.com), Wahapedia 10th/11th core rules (wahapedia.ru), Spikey Bits 11th stratagems.
