/* Orks — 11th edition catalog. */
PTSheetsPack("orks", {
  faction: "Orks",
  lib: {
    "waaagh": {
      id: "waaagh",
      name: "Waaagh!",
      kind: "other",
      announce: null,
      pending: true,
      note: "Ork faction ability. Not simulated yet."
    },
    "get-da-good-bitz": {
      id: "get-da-good-bitz",
      name: "Get da Good Bitz",
      kind: "other",
      announce: "command",
      pending: true,
      note: "If this unit controls an objective at the end of your Command phase, it stays yours."
    }
  },
  sheets: {
    boyz: {
      id: "boyz",
      edition: "11th",
      faction: "Orks",
      factionKeywords: ["ORKS"],
      type: "Infantry",
      name: "Boyz",
      keywords: ["INFANTRY", "BATTLELINE", "MOB", "EXPLOSIVES", "BOYZ"],
      search: ["boyz", "orks", "battleline"],
      M: 6, T: 5, Sv: 5, Inv: 0, W: 1, Ld: 7, OC: 2, baseMm: 32,
      composition: { label: "1 Boss Nob, 9 Boyz", defaultCount: 10 },
      profiles: [
        { id: "nob", name: "Boss Nob", W: 2, count: 1 },
        { id: "boy", name: "Boyz", W: 1, count: 9 }
      ],
      weapons: [
        { name: "Kustom shoota", kind: "ranged", A: 4, skill: 5, S: 4, AP: 0, D: 1, rng: 18, tags: ["RAPID FIRE 2"] },
        { name: "Kombi-rokkit", kind: "ranged", A: 1, skill: 5, S: 10, AP: -2, D: 3, rng: 24, tags: [] },
        { name: "Kombi-shoota", kind: "ranged", A: 2, skill: 5, S: 4, AP: 0, D: 1, rng: 24, tags: [] },
        { name: "Shoota", kind: "ranged", A: 2, skill: 5, S: 4, AP: 0, D: 1, rng: 18, tags: ["RAPID FIRE 1"] },
        { name: "Slugga", kind: "ranged", A: 1, skill: 5, S: 4, AP: 0, D: 1, rng: 12, tags: ["CLOSE-QUARTERS"] },
        { name: "Big choppa", kind: "melee", A: 3, skill: 3, S: 7, AP: -1, D: 2, rng: 0, tags: [] },
        { name: "Choppa", kind: "melee", A: 3, skill: 3, S: 4, AP: -1, D: 1, rng: 0, tags: [] }
      ],
      abilities: [
        { id: "waaagh" },
        { id: "get-da-good-bitz", announce: "command" }
      ]
    }
  }
});
