/* Tyranids — 11th edition. Accepted from Faction Pack 1.1 (22 Jul 2026). */
PTSheetsPack("tyranids", {
  faction: "Tyranids",
  lib: {
    "shadow-in-the-warp": {
      id: "shadow-in-the-warp",
      name: "Shadow in the Warp",
      kind: "other",
      announce: "command",
      pending: true,
      note: "Tyranid army rule. Once per battle, enemy units take Battle-shock; -1 near Synapse."
    },
    "synapse": {
      id: "synapse",
      name: "Synapse",
      kind: "other",
      announce: null,
      pending: false,
      note: "Tyranid army rule. Units within 6\" of Synapse: Battle-shock on 3D6; melee +1 S."
    },
    "leader": {
      id: "leader",
      name: "Leader",
      kind: "other",
      announce: null,
      pending: true,
      note: "May attach to listed bodyguard units when mustering."
    },
    "deadly-demise": {
      id: "deadly-demise",
      name: "Deadly Demise",
      kind: "other",
      announce: null,
      pending: true,
      note: "On destroyed, 6 on D6: X mortals to units within 6\"."
    },
    "hover": {
      id: "hover",
      name: "Hover",
      kind: "other",
      announce: null,
      pending: true,
      note: "FLY move does not subtract 2\"."
    },
    "swallow-whole": {
      id: "swallow-whole",
      name: "Swallow Whole",
      kind: "other",
      announce: null,
      pending: false,
      note: "Gaping maw vs Infantry/Mounted/Beasts: unmodified wounds are Critical; heal D3+2 when those models die to it."
    },
    "subterranean-hunter": {
      id: "subterranean-hunter",
      name: "Subterranean Hunter",
      kind: "reserve",
      announce: "fight",
      pending: true,
      note: "End of Fight, if unengaged, may go to Strategic Reserves."
    },
    "death-from-below": {
      id: "death-from-below",
      name: "Death from Below",
      kind: "reserve",
      announce: null,
      pending: true,
      note: "End of opponent's turn, if unengaged, may go to Strategic Reserves."
    },
    "alpha-warrior": {
      id: "alpha-warrior",
      name: "Alpha Warrior",
      kind: "other",
      announce: null,
      pending: true,
      note: "Weapons in this unit have [SUSTAINED HITS 1]."
    },
    "aggressive-leader-beast": {
      id: "aggressive-leader-beast",
      name: "Aggressive Leader-Beast",
      kind: "other",
      announce: null,
      pending: true,
      note: "After an enemy shooting attack destroys a model in this unit, this unit may surge up to D6\"."
    },
    "alpha-invader": {
      id: "alpha-invader",
      name: "Alpha Invader",
      kind: "other",
      announce: null,
      pending: true,
      note: "Weapons in this unit have [SUSTAINED HITS 1]."
    },
    "hypersensory-array": {
      id: "hypersensory-array",
      name: "Hypersensory Array",
      kind: "other",
      announce: null,
      pending: true,
      note: "Once per battle round may use Rapid Ingress/Heroic Intervention with CP discount as printed."
    },
    "frenzied-metabolism": {
      id: "frenzied-metabolism",
      name: "Frenzied Metabolism",
      kind: "other",
      announce: "shooting",
      pending: true,
      note: "When selected to shoot, may add 1 to wound rolls and take D3 mortals after."
    },
    "apex-beast": {
      id: "apex-beast",
      name: "Apex-beast",
      kind: "other",
      announce: null,
      pending: true,
      note: "Attacks vs Battle-shocked units add 1 to the Hit roll."
    },
    "stalking-forward": {
      id: "stalking-forward",
      name: "Stalking Forward",
      kind: "other",
      announce: null,
      pending: true,
      note: "Can move over 4\" or shorter terrain and models as if they were not there."
    }
  },
  sheets: {
    "red-terror": {
      id: "red-terror",
      edition: "11th",
      faction: "Tyranids",
      factionKeywords: ["TYRANIDS"],
      type: "Monster",
      name: "The Red Terror",
      keywords: ["CHARACTER", "MOBILE", "EPIC HERO", "GREAT DEVOURER", "MONSTER", "BURROWER", "VANGUARD INVADER", "THE RED TERROR"],
      search: ["red terror", "tyranids", "ravener", "epic hero"],
      source: { label: "Tyranids Faction Pack 1.1", file: "tyranids-faction-pack-1.1.pdf", page: 7, hub: "https://www.warhammer-community.com/en-gb/downloads/warhammer-40000/" },
      M: 10, T: 8, Sv: 3, Inv: 0, W: 9, Ld: 8, OC: 3, baseMm: 100,
      composition: { label: "1 The Red Terror", defaultCount: 1 },
      weapons: [
        { name: "Gaping maw", kind: "melee", A: 1, skill: 2, S: 5, AP: 0, D: "D3+2", rng: 0, tags: ["EXTRA ATTACKS", "DEVASTATING WOUNDS", "PRECISION"] },
        { name: "Scything talons", kind: "melee", A: 12, skill: 2, S: 7, AP: -2, D: 2, rng: 0, tags: [] }
      ],
      abilities: [
        { id: "deep-strike" },
        { id: "synapse" },
        { id: "swallow-whole" },
        { id: "subterranean-hunter", announce: "fight" }
      ]
    },
    "tyranid-prime-lash-whip": {
      id: "tyranid-prime-lash-whip",
      edition: "11th",
      faction: "Tyranids",
      factionKeywords: ["TYRANIDS"],
      type: "Character",
      name: "Tyranid Prime with Lash Whip",
      keywords: ["INFANTRY", "CHARACTER", "GREAT DEVOURER", "SYNAPSE", "TYRANID PRIME WITH LASH WHIP"],
      search: ["tyranid prime", "lash whip", "tyranids", "warrior"],
      source: { label: "Tyranids Faction Pack 1.1", file: "tyranids-faction-pack-1.1.pdf", page: 9, hub: "https://www.warhammer-community.com/en-gb/downloads/warhammer-40000/" },
      M: 10, T: 5, Sv: 3, Inv: 0, W: 6, Ld: 7, OC: 1, baseMm: 40,
      composition: { label: "1 Tyranid Prime with Lash Whip", defaultCount: 1 },
      leader: ["Hormagaunts", "Termagants", "Tyranid Warriors with Melee Bio-weapons", "Tyranid Warriors with Ranged Bio-weapons"],
      weapons: [
        { name: "Rending claw", kind: "melee", A: 4, skill: 2, S: 8, AP: -2, D: 3, rng: 0, tags: [] },
        { name: "Lash whip", kind: "melee", A: 8, skill: 2, S: 4, AP: -1, D: 1, rng: 0, tags: ["EXTRA ATTACKS"] },
        { name: "Scything talons", kind: "melee", A: 6, skill: 2, S: 6, AP: -2, D: 2, rng: 0, tags: [] }
      ],
      abilities: [
        { id: "leader" },
        { id: "shadow-in-the-warp", announce: "command" },
        { id: "synapse" },
        { id: "alpha-warrior" },
        { id: "aggressive-leader-beast" }
      ]
    },
    "raveners": {
      id: "raveners",
      edition: "11th",
      faction: "Tyranids",
      factionKeywords: ["TYRANIDS"],
      type: "Infantry",
      name: "Raveners",
      keywords: ["INFANTRY", "GREAT DEVOURER", "VANGUARD INVADER", "BURROWERS", "RAVENERS"],
      search: ["raveners", "tyranids", "burrower"],
      source: { label: "Tyranids Faction Pack 1.1", file: "tyranids-faction-pack-1.1.pdf", page: 11, hub: "https://www.warhammer-community.com/en-gb/downloads/warhammer-40000/" },
      M: 10, T: 5, Sv: 4, Inv: 0, W: 3, Ld: 8, OC: 1, baseMm: 40,
      composition: { label: "5 Raveners", defaultCount: 5 },
      weapons: [
        { name: "Ravener claws and talons", kind: "melee", A: 3, skill: 3, S: 5, AP: -2, D: 2, rng: 0, tags: ["TWIN-LINKED"] }
      ],
      abilities: [
        { id: "deep-strike" },
        { id: "synapse" },
        { id: "death-from-below" }
      ]
    },
    "hyperadapted-raveners": {
      id: "hyperadapted-raveners",
      edition: "11th",
      faction: "Tyranids",
      factionKeywords: ["TYRANIDS"],
      type: "Infantry",
      name: "Hyperadapted Raveners",
      keywords: ["INFANTRY", "GREAT DEVOURER", "VANGUARD INVADER", "BURROWERS", "HYPERADAPTED RAVENERS"],
      search: ["hyperadapted raveners", "ravener prime", "tyranids"],
      source: { label: "Tyranids Faction Pack 1.1", file: "tyranids-faction-pack-1.1.pdf", page: 13, hub: "https://www.warhammer-community.com/en-gb/downloads/warhammer-40000/" },
      M: 10, T: 5, Sv: 4, Inv: 0, W: 3, Ld: 8, OC: 1, baseMm: 40,
      composition: { label: "1 Ravener Prime, 4 Raveners", defaultCount: 5 },
      profiles: [
        { id: "prime", name: "Ravener Prime", W: 6, Ld: 7, OC: 1, keywords: ["CHARACTER", "SYNAPSE"], count: 1 },
        { id: "ravener", name: "Ravener", W: 3, Ld: 8, OC: 1, count: 4 }
      ],
      leader: ["Raveners"],
      weapons: [
        { name: "Venom bolt", kind: "ranged", A: "D6+3", skill: 0, S: 6, AP: -1, D: 1, rng: 12, tags: ["ASSAULT", "IGNORES COVER", "TORRENT"] },
        { name: "Prime claws and talons", kind: "melee", A: 6, skill: 3, S: 5, AP: -2, D: 2, rng: 0, tags: ["ANTI-MONSTER 5+", "ANTI-VEHICLE 5+", "TWIN-LINKED"] },
        { name: "Ravener heavy claws and talons", kind: "melee", A: 3, skill: 3, S: 5, AP: -2, D: 2, rng: 0, tags: ["ANTI-MONSTER 5+", "ANTI-VEHICLE 5+", "TWIN-LINKED"] }
      ],
      abilities: [
        { id: "deep-strike" },
        { id: "leader" },
        { id: "shadow-in-the-warp", announce: "command" },
        { id: "synapse" },
        { id: "alpha-invader" },
        { id: "hypersensory-array" }
      ]
    },
    "harridan": {
      id: "harridan",
      edition: "11th",
      faction: "Tyranids",
      factionKeywords: ["TYRANIDS"],
      type: "Monster",
      name: "Harridan",
      keywords: ["MONSTER", "TITANIC", "FLY", "FRAME", "TRANSPORT", "GREAT DEVOURER", "HARRIDAN"],
      search: ["harridan", "tyranids", "titanic"],
      source: { label: "Tyranids Faction Pack 1.1", file: "tyranids-faction-pack-1.1.pdf", page: 15, hub: "https://www.warhammer-community.com/en-gb/downloads/warhammer-40000/" },
      M: 14, T: 10, Sv: 3, Inv: 0, W: 30, Ld: 8, OC: 0, baseMm: 0,
      composition: { label: "1 Harridan", defaultCount: 1 },
      transport: { capacity: 20, note: "20 Gargoyles and 1 Winged Tyranid Prime" },
      damaged: { wounds: "1-10", hitMod: -1 },
      weapons: [
        { name: "Dire bio-cannon", kind: "ranged", A: "D6+6", skill: 3, S: 10, AP: -3, D: 3, rng: 48, tags: ["BLAST"] },
        { name: "Gargantuan scything talons", kind: "melee", A: 6, skill: 3, S: 14, AP: -2, D: 6, rng: 0, tags: [] }
      ],
      abilities: [
        { id: "deadly-demise", x: "2D6" },
        { id: "hover" },
        { id: "synapse" },
        { id: "frenzied-metabolism", announce: "shooting" }
      ]
    },
    "hierophant": {
      id: "hierophant",
      edition: "11th",
      faction: "Tyranids",
      factionKeywords: ["TYRANIDS"],
      type: "Monster",
      name: "Hierophant",
      keywords: ["MONSTER", "TITANIC", "TOWERING", "FRAME", "TRANSPORT", "GREAT DEVOURER", "HIEROPHANT"],
      search: ["hierophant", "tyranids", "titanic"],
      source: { label: "Tyranids Faction Pack 1.1", file: "tyranids-faction-pack-1.1.pdf", page: 17, hub: "https://www.warhammer-community.com/en-gb/downloads/warhammer-40000/" },
      M: 12, T: 14, Sv: 2, Inv: 5, W: 30, Ld: 8, OC: 12, baseMm: 0,
      composition: { label: "1 Hierophant", defaultCount: 1 },
      transport: { capacity: 20, note: "20 Tyranids Infantry; W>1 counts as 3; no Fly" },
      damaged: { wounds: "1-10", hitMod: -1, OC: 6 },
      weapons: [
        { name: "Bio-plasma torrent", kind: "ranged", A: 30, skill: 0, S: 6, AP: -2, D: 1, rng: 12, tags: ["ASSAULT", "TORRENT"] },
        { name: "Dire bio-cannon", kind: "ranged", A: "D6+6", skill: 3, S: 10, AP: -3, D: 3, rng: 48, tags: ["BLAST"] },
        { name: "Lashwhip pods", kind: "melee", A: 10, skill: 3, S: 5, AP: 0, D: 1, rng: 0, tags: ["EXTRA ATTACKS"] },
        { name: "Titanic scything talons", kind: "melee", A: 8, skill: 3, S: 20, AP: -2, D: "D6+1", rng: 0, tags: [] }
      ],
      abilities: [
        { id: "deadly-demise", x: "2D6" },
        { id: "synapse" },
        { id: "apex-beast" },
        { id: "stalking-forward" }
      ]
    }
  }
});
