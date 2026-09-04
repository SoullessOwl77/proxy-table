/* Proxy Table shared guidance model.
   ONE source of truth for: in-app hover tooltips (TIPS), the phase
   walkthrough panel (GUIDE do/dont/next), and the standalone How-to-play
   tutorial (howto.html). Update guidance here and every surface follows.
   Loaded before the main app script and by howto.html.
   Reflects 11th-edition setup + current app behavior. */
window.PT_GUIDE = {

  /* Ordered phases. Each carries tooltip text (short/more), the
     walkthrough (do/dont/next), and a tutorial page block. */
  phases: {
    setup: {
      title: "Before the battle",
      short: "Lobby, then deploy, roll for first turn, and resolve pre-battle abilities. Start battle when the board is ready — Next does not bring you back here.",
      more: "Lobby: battle size, mission, Attacker/Defender, and an army for each edge. Force disposition is Dawn of War (12″ long-edge DZs). The player you do not pick as Attacker is the Defender and deploys first.\n\nSequence (11th): mark Strategic Reserves → Begin drops (Defender first, alternate one unit at a time; Titanic counts as two) → place Infiltrators (>8″ from the enemy DZ and enemy units) → roll off to determine the first turn, winner chooses → pre-battle abilities (Scout moves, or send a Scout to Reserves, plus honor-system redeploys) → Start battle.\n\nObjectives score at the end of your turn: 5 VP for holding 1+, 5 for 2+, 5 if you hold more than the opponent. Start battle locks terrain and opens Command.",
      do: [
        "Lobby: size, mission, Attacker/Defender, army on each edge. Dawn of War 12″ DZs. Defender deploys first; first turn is rolled after deployment.",
        "Formation: armies start off the table. Mark who stays in Strategic Reserves, then Begin drops. Alternate. Titanic = two drops for the opponent.",
        "Infiltrators after normal drops (>8″ from enemy DZ and units). Then Roll first turn and the winner picks who goes first.",
        "Pre-battle abilities: Scout moves (or Scout to Reserves) and redeploys. Generate or place terrain. Objectives score at the end of your turn.",
        "Tap Start battle when the board is ready."
      ],
      dont: [
        "Don't mix factions on one list — Tyranids stay with Tyranids, Marines with Marines.",
        "Don't drop a red (points-only) unit and expect guns to work.",
        "Don't try to Start battle before the first turn is rolled — it's blocked until then.",
        "Don't expect Next to bring you back here — use Setup or Reset."
      ],
      next: "Start battle → Command. Terrain locks. Unit dragging waits for Movement / Charge / Fight.",
      tutorial: {
        whatFor: "Before any dice are rolled, both players build the battlefield and place their armies. This step sets where everyone starts and who takes the first turn - the foundation the whole game sits on. (A 'model' is one miniature; a 'unit' is a group of models that acts together.)",
        yourMove: [
          "In the lobby, choose the game size, the mission (what you score points for), and an army for each side. One side is the Attacker and the other is the Defender - the Defender places their models first.",
          "You may hold some units off the table to arrive later; these are called Strategic Reserves. Decide which (if any) before you start, then place your units. Players take turns setting up one unit at a time, each inside their own deployment zone - the strip of table you are allowed to start in.",
          "A few units set up differently. Infiltrators may deploy outside their zone as long as they stay more than 8 inches from the enemy. Place those after the normal units.",
          "Tap Roll first turn. Each side rolls one die; the higher roll wins and chooses who goes first. Going first is not always the advantage, so it is a real decision.",
          "Resolve pre-battle moves: units with the Scout ability make a small free move before the game begins, and you can shuffle any last repositioning.",
          "When the board looks right, tap Start battle. The terrain locks in place and the first player's turn begins."
        ],
        watchOuts: [
          "You decide who goes first AFTER everyone is deployed, not in the lobby - that is why the roll comes near the end of setup.",
          "Once you begin placing, a unit you did not set aside as Reserves cannot suddenly be held back - decide reserves up front.",
          "Start battle stays locked until you have rolled for the first turn."
        ],
        whatsNext: "The first player's Command phase."
      }
    },

    command: {
      title: "Command phase",
      short: "Start of this player's turn. Gain 1 CP. Battle-shock damaged units. Stratagems spend CP.",
      more: "At the start of your Command this table refreshes that seat's unit flags and adds 1 Command Point (the currency for Stratagems).\n\nBattle-shock is a real Command step: each damaged unit on this seat must test. Select it → Optional → Battle-shock → Announce. 2D6 vs Leadership (Synapse units roll 3D6). Fail = the unit is marked BS and its OC drops to 0 until this seat's next Command.\n\nStratagems: Command Re-roll and Grenade cost 1 CP; Armor of Contempt is a defender reaction used in Combat. Each is once per your turn.",
      do: [
        "Note whose turn it is and the battle round. CP +1 is already applied.",
        "Battle-shock: each damaged unit on this seat tests 2D6 vs Ld (Optional → Announce).",
        "Failed tests mark BS and drop that unit's OC to 0 until its next Command.",
        "Spend CP now or later this turn: Command Re-roll, Grenade (Shooting), Armor of Contempt (a defender reaction in Combat)."
      ],
      dont: [
        "Don't skip Battle-shock on a wounded unit — Next will remind you.",
        "Don't spend CP you don't have — each Stratagem is 1 CP, once per your turn.",
        "Don't move models or shoot — Command is not a movement phase.",
        "Don't move terrain — it locked when the battle started."
      ],
      next: "When you're ready, Next → Movement.",
      tutorial: {
        whatFor: "Every turn begins here. It is a short bookkeeping step: you gain a resource called a Command Point, and you check whether any of your battered units lose their nerve.",
        yourMove: [
          "Look at the top of the screen to see whose turn it is. You automatically gain 1 Command Point - think of these as tokens you spend later on special abilities called Stratagems.",
          "Any of your units that have already taken casualties must take a Battle-shock test (a morale check): select the unit, then Optional, Battle-shock, Announce, to roll two dice against the unit's Leadership number.",
          "If a unit fails, it is 'battle-shocked' and stops holding objectives until your next turn. If it passes, nothing happens. Units at full strength do not test at all."
        ],
        watchOuts: [
          "Only damaged units test for Battle-shock; a full-strength unit never does.",
          "Nothing moves or shoots in this phase - it is just upkeep before the action.",
          "You can spend Command Points now or save them for later in your turn."
        ],
        whatsNext: "Movement phase."
      }
    },

    movement: {
      title: "Movement phase",
      short: "Default drag = Normal Move (M″ from the base edge). Optional: Advance (M+D6), Fall Back, Remain Stationary. Multi-model units keep coherency.",
      more: "Declare Advance / Fall Back / Remain with Optional → Announce before (or instead of) a Normal Move.\n\nAdvance: roll D6; the gold ring becomes M+that from the base edge; the unit usually can't shoot or charge.\nFall Back: leave 2″ Engagement Range; usually can't shoot or charge.\nRemain Stationary: choose not to move.\n\nCoherency (multi-model units): each model within 2″ base-edge of another so the unit forms one chain, and every model within 9″ of every other. Single models have no coherency partners.\n\nReactions: at the END of your Movement the opponent may react — Rapid Ingress (bring a reserve unit in) or Fire Overwatch (Snap-shoot at 6s). The app prompts them.",
      do: [
        "Select an active-player model. The gold ring = M″ reach from the base edge.",
        "Drag so the base edge stays on or inside the gold ring when you stop.",
        "Multi-model groups (green links): keep a 2″ chain and 9″ or less between the farthest models."
      ],
      dont: [
        "Don't leave a squad model stranded more than 2″ from the rest of its unit.",
        "Don't move the other seat's models — only the active player's force moves.",
        "Don't end on top of an enemy model."
      ],
      next: "When every model you wanted to move has moved (or stayed), Next → Shooting. The opponent may get a reaction first.",
      tutorial: {
        whatFor: "This is where you reposition your army - moving toward objectives, pulling out of danger, or holding still for a better shot. Everything is measured in inches from the edge of a model's base.",
        yourMove: [
          "Select one of your models. A gold ring appears showing how far it can move - that distance is the unit's Move stat, in inches.",
          "Drag the model so it finishes on or inside that ring. If it is a squad of several models, keep them close - within 2 inches of each other, forming one connected group.",
          "Need extra distance? Declare an Advance (Optional, then Announce) to add a die roll to your move - but a unit that Advances usually cannot shoot or charge this turn.",
          "To pull a unit out of melee, declare Fall Back. To keep a unit still so it shoots at full effect, declare Remain Stationary."
        ],
        watchOuts: [
          "Advancing or Falling Back usually costs that unit its shooting and its charge for the turn - it is a trade-off.",
          "Keep squad members within 2 inches of each other; spreading them too far breaks up the unit (the app warns you).",
          "You can only move your own units - the other player moves on their turn.",
          "When you finish moving, your opponent may get to react before you shoot (see the Reactions page)."
        ],
        whatsNext: "Shooting phase."
      }
    },

    shooting: {
      title: "Shooting phase",
      short: "Whole units fire. Attack rolls the entire unit at the target: Hit → Wound → Save → Damage. Cover is −1 to hit.",
      more: "Pick Combat, tap one of your models, then an enemy in range and not within 2″ Engagement Range. Attack fires the WHOLE unit at that target — the dice readout reports how many models fired and names any that couldn't, with the reason.\n\nSequence per model: roll to hit on BS (1 always fails, 6 always hits), Strength vs Toughness to wound, then the target's armour save worsened by AP (an Invulnerable save ignores AP), then Damage off remaining wounds. Cover (−1 to hit) if the target's base overlaps Light/Dense, or the shot line crosses Light/Dense.",
      do: [
        "Select a model — the blue ring is gun range, the red ring is 2″ ER (don't shoot into that).",
        "Combat tool: tap an active-player model, then an enemy inside range. Attack fires the whole unit.",
        "Check Cover on the bar, then read the volley: how many fired, and who couldn't."
      ],
      dont: [
        "Don't shoot with the other seat's models — only the active player attacks.",
        "Don't shoot into 2″ Engagement Range with normal guns (that's the Fight phase).",
        "Don't pick a friendly model as the target."
      ],
      next: "When you've shot with the units you want, Next → Charge.",
      tutorial: {
        whatFor: "Your units with ranged weapons open fire. A whole unit shoots together at one enemy target, and each shot is settled by a short chain of dice rolls.",
        yourMove: [
          "Switch to the Combat tool. Tap one of your models to choose its unit, then tap an enemy unit that is within range and that you can see.",
          "Tap Attack. The whole unit fires at that target at once.",
          "The dice resolve in four steps: roll to Hit (did the shot land), then to Wound (did it hurt - the weapon's Strength versus the target's Toughness), then the defender rolls a Save (its armour tries to stop it), and finally any hits that get through deal Damage. The app rolls it all and shows how many models fired and who could not."
        ],
        watchOuts: [
          "A model within 2 inches of an enemy is locked in melee and cannot shoot - that is often why only part of a squad fires.",
          "A target standing in or behind terrain has Cover, which makes it harder to hit.",
          "You cannot shoot a unit you are already in melee with using normal weapons - that is what the Fight phase is for."
        ],
        whatsNext: "Charge phase."
      }
    },

    charge: {
      title: "Charge phase",
      short: "Close to within 2″ of an enemy. One 2D6 roll per unit versus the distance.",
      more: "Eligible units that did not Advance or Fall Back can charge. Select a model in the unit and tap Roll charge for one 2D6 — that roll is the whole unit's charge distance. If it can't reach 2″ Engagement Range of any enemy, the charge fails and the unit stays put. If it can, the gold ring shows the distance from the start; end inside the ring and in ER. Drop short or outside and the charge fails — models snap back. Fighting happens in the Fight phase.",
      do: [
        "Select an active-player model in the charging unit, then tap Roll charge (one 2D6 for the unit).",
        "If the roll can't reach 2″ ER of any enemy, it fails and the unit stays.",
        "If it can: the gold ring is from the start point — end inside it and in the red 2″ ER."
      ],
      dont: [
        "Don't roll separately for each model — it's one 2D6 for the whole unit.",
        "Don't move farther than the gold ring — that's a failed charge, snap-back.",
        "Don't stop short of ER, and don't resolve fights yet — that's the Fight phase."
      ],
      next: "When charges are done, Next → Fight.",
      tutorial: {
        whatFor: "Charging moves a unit into melee range so it can fight this turn. It is a gamble: you roll to see how far the unit can rush, and if it falls short it does not move at all.",
        yourMove: [
          "Pick a unit that did not Advance or Fall Back. Select one of its models and tap Roll charge - you roll two dice, and that total is how many inches the whole unit can move.",
          "If the roll is enough to reach within 2 inches of an enemy - close enough to fight, which is called Engagement Range - drag the unit into contact.",
          "If the roll falls short of every enemy, the charge fails and the unit stays exactly where it was."
        ],
        watchOuts: [
          "It is one roll for the whole unit, not one per model.",
          "A unit that Advanced or Fell Back this turn usually cannot charge.",
          "Charging pays off: units that charge get to strike first in the Fight phase."
        ],
        whatsNext: "Fight phase."
      }
    },

    fight: {
      title: "Fight phase",
      short: "Models within 2″ fight. Chargers and Fights First units strike first. Attack resolves the whole unit: Hit → Wound → Save → Damage.",
      more: "Engagement Range is 2″. Pile-in and Consolidate are 3″ moves (honor-system, capped from the announce point). Attack fights with the whole unit and a unit fights once per phase.\n\nOrder: units that charged or have Fights First fight first, then players alternate. Tap the Fights First button any time in this phase for the live order of engaged units — fighting a normal unit while un-fought first-fighters remain pops a reminder. This table uses the same attack engine as shooting, with WS and the melee profile.",
      do: [
        "Tap Fights First to see the order — chargers and Fights First units go before the rest.",
        "Combat tool: tap an active-player model within 2″ of an enemy, then the enemy, then Attack (the whole unit fights).",
        "Watch wounds on the tokens; destroyed models disappear. Each unit fights once."
      ],
      dont: [
        "Don't attack with the inactive seat until the order reaches them.",
        "Don't swing at targets outside 2″, and don't fight the same unit twice.",
        "Don't skip ending the turn — after Fight, Next starts the other player's Command."
      ],
      next: "Tap Next to pass the turn (other seat's Command, or the next battle round — objectives score as you leave).",
      tutorial: {
        whatFor: "Melee combat. Every unit within 2 inches of an enemy fights, and unlike the other phases, both players' units take part - in a set order.",
        yourMove: [
          "Order matters first. Units that charged this turn, plus any unit with the Fights First ability, swing before everyone else. Tap the Fights First button to see the current order for the units in combat.",
          "With the Combat tool, tap one of your models within 2 inches of an enemy, then tap that enemy, then Attack. The whole unit fights at once, using the same Hit, Wound, Save, Damage steps as shooting.",
          "Work through the order - chargers and Fights First units, then the rest, with the players alternating - until every unit in combat has fought once."
        ],
        watchOuts: [
          "Resolve chargers and Fights First units before your ordinary units; the app reminds you if you jump ahead.",
          "Each unit fights only once per turn.",
          "After the Fight phase, ending your turn is what scores your objectives - do not forget to press Next."
        ],
        whatsNext: "Your turn ends: you score the objectives you control, then it is the other player's Command phase (or the next round begins)."
      }
    }
  },

  /* Non-phase tooltips (tools and chrome). Shape: {title, short, more}.
     Kept here so every tooltip in the app comes from one file. */
  tips: {
    terrain: {
      title: "Terrain tool",
      short: "Place, rotate, lock, or Generate a starter layout. Categories: Exposed, Light, Dense.",
      more: "During setup you can Generate, place, rotate, and lock pieces. The first time you leave Command (Next → Movement) all terrain locks for the rest of the battle — same as real 40K. Practice Reset returns to setup."
    },
    unit: {
      title: "Units tool",
      short: "Drop demo forces or single models. Drag to move. Gold ring = M″ from base edge; red = 2″ ER.",
      more: "One token is one model. Blue is seat 0, red is seat 1. Green dashed lines link models that share a unit. Multi-model units must stay in coherency (2″ chain + 9″ span). A warning fires if a move breaks that."
    },
    measure: {
      title: "Measure",
      short: "Tap two points. The tape shows inches on the 60″ × 44″ table.",
      more: "All distances in 40K are in inches. Ranges are measured base to base. The tape is for you; it is not synced to the other player."
    },
    combat: {
      title: "Combat tool",
      short: "Tap your model, then an enemy, then Attack. Uses guns in Shooting, melee in Fight. Fires/fights the whole unit.",
      more: "Hit uses BS or WS. Cover −1 if the target's base overlaps Light/Dense, or the shot line crosses it. Wound compares Strength to Toughness (equal = 4+). Save uses Sv modified by AP, or Inv if the model has one. Damage comes off remaining wounds; 0 removes the model. Attack resolves the whole unit and reports who couldn't fire."
    },
    next: {
      title: "Next",
      short: "In setup: Start battle. After that: Command → Movement → Shooting → Charge → Fight, then the other seat's Command.",
      more: "Setup has its own Start battle button (same control). After the battle starts, Next walks the five phases and, leaving Fight, ends the turn and scores objectives. It does not return to Setup."
    },
    fit: {
      title: "Fit",
      short: "Resets pan/zoom so the full 60″ × 44″ table is centered on screen.",
      more: "Pinch or scroll to zoom any time. Fit is the show-me-the-whole-board button. It does not move models or change the phase."
    },
    menu: {
      title: "Menu",
      short: "Leaves this table and returns to the hub (matches + game chooser).",
      more: "Practice progress is saved in this browser. PVP stays on the server — rejoin from Your Matches."
    },
    guide: {
      title: "Guide",
      short: "Phase walkthrough plus the same teaching notes as Army help.",
      more: "On by default in Practice, off in PVP. Toggle any time. This table is a teaching proxy, not tournament-legal. One faction per list. Normal names = official pack or card. Purple = fan (Wahapedia). Red = points only, no stat line. Onslaught 3000 / 4 DP is a house rule."
    },
    rolls: {
      title: "Dice math",
      short: "Shows every hit, wound, save, and damage roll from the last Attack, model by model.",
      more: "Toggle with Rolls. Each model's attack is listed with the number needed and pass/fail, and any models that didn't fire are named with the reason."
    },
    score: {
      title: "Scoreboard",
      short: "Toggle the honor-system score panel: per-seat VP and CP with manual +/-.",
      more: "Primary objective VP is scored automatically at end of turn. Use the panel's +/- for secondary VP and to adjust CP on top of the automatic +1 per turn. Honor-system — it doesn't police the rules."
    },
    exposed: {
      title: "Exposed terrain",
      short: "Does not grant Cover. Still useful as a footprint for placement and blocking.",
      more: "Obstacles and similar pieces are Exposed in this proxy. They don't apply the −1 to hit Cover penalty. True blocking line of sight is simplified — treat absolute blocked shots as honor-system."
    },
    light: {
      title: "Light cover",
      short: "Target on it, or shot through it → shooters take −1 to hit.",
      more: "11th-edition Cover is a hit penalty, not a better armour save. Woods and hills use Light here. Stand the target on the piece, or put the piece between the models."
    },
    dense: {
      title: "Dense cover",
      short: "Same as Light on this table: −1 to hit if on it or shot through it.",
      more: "Ruins are Dense. In a full game Dense also tightens visibility more strictly; here it matches Light for Cover. Lock ruins after you like the layout."
    }
  },

  /* Cross-cutting concepts for the tutorial (not phase-bound).
     Shape: {title, body}. */
  asides: {
    reactions: {
      title: "Reactions",
      body: "Most of the game happens on your own turn, but a few abilities let you act during your opponent's turn. These are Reactions, and each costs one Command Point. The common ones: Rapid Ingress lets a unit you kept in Strategic Reserves arrive early (never on the very first round); Fire Overwatch lets one of your units shoot at an enemy moving nearby, though hurried fire only lands on the best possible dice rolls; and Armor of Contempt is a defensive reaction you use when your unit is being attacked, blunting the incoming hits. When one is available, the app pops up a reaction bar so you do not miss the window."
    },
    command_points: {
      title: "Command Points and Stratagems",
      body: "Command Points (CP) are a resource you spend on one-off special effects called Stratagems. You gain one at the start of each of your turns. Typical uses are re-rolling a bad dice roll, throwing a grenade, or the Reactions above. Most Stratagems can only be used once per turn, so pick your moment. The scoreboard has plus/minus buttons if you ever need to correct your CP total by hand."
    },
    scoring: {
      title: "How you win: objectives and Victory Points",
      body: "You win by scoring the most Victory Points, and most of them come from objectives - the marked spots on the table. In the Take and Hold mission, at the end of each of your turns you score for the objectives you control (a unit controls one if the total Objective Control stat of its nearby models beats the enemy's): 5 points for holding at least one, 5 more for holding two or more, and 5 more for holding more than your opponent. The app tallies this automatically when you end your turn out of the Fight phase, and you can turn on the Scoreboard to watch both sides' points and Command Points."
    }
  },

  /* Ordered keys for the tutorial's page flow. */
  order: ["setup", "command", "movement", "shooting", "charge", "fight"]
};
