/* Practice / placeholder units. Not a real faction.
   Teaching kit: every new table ability goes on at least one demo sheet
   (usually all three). Role keywords stay split so deploy still has a
   normal drop (Infantry + Scout), an Infiltrator (Commander), and a
   Titanic (Walker). Re-drop Demo after a sheet change. */
(function () {
  const TEACH = [
    { id: "feel-no-pain", x: 5 },
    { id: "deep-strike" },
    { id: "scout", x: 6 },
    { id: "fights-first" }
  ];
  PTSheetsPack("demo", {
    faction: "Demo",
    sheets: {
      inf: {
        id: "demo-infantry",
        edition: "11th",
        faction: "Demo",
        factionKeywords: ["DEMO"],
        type: "Infantry",
        name: "Infantry",
        keywords: ["INFANTRY", "GRENADES", "SCOUTS"],
        search: ["infantry", "demo", "battleline"],
        M: 6, T: 4, Sv: 3, Inv: 0, W: 2, Ld: 6, OC: 2, baseMm: 32,
        composition: { label: "1 Infantry", defaultCount: 5 },
        pts: null, ptsSource: "demo",
        weapons: [
          { name: "Rifle", kind: "ranged", A: 2, skill: 3, S: 4, AP: 0, D: 1, rng: 24, tags: ["TORRENT"] },
          { name: "Blade", kind: "melee", A: 3, skill: 3, S: 4, AP: 0, D: 1, rng: 0, tags: [] }
        ],
        abilities: TEACH.map(a => Object.assign({}, a))
      },
      cmd: {
        id: "demo-commander",
        edition: "11th",
        faction: "Demo",
        factionKeywords: ["DEMO"],
        type: "Character",
        name: "Commander",
        keywords: ["INFANTRY", "CHARACTER", "GRENADES", "INFILTRATORS"],
        search: ["commander", "character", "demo", "hq"],
        M: 6, T: 4, Sv: 3, Inv: 4, W: 5, Ld: 7, OC: 1, baseMm: 40,
        composition: { label: "1 Commander", defaultCount: 1 },
        pts: null, ptsSource: "demo",
        weapons: [
          { name: "Pistol", kind: "ranged", A: 1, skill: 2, S: 4, AP: -1, D: 1, rng: 12, tags: ["PISTOL"] },
          { name: "Power blade", kind: "melee", A: 5, skill: 2, S: 5, AP: -2, D: 2, rng: 0, tags: [] }
        ],
        abilities: TEACH.map(a => Object.assign({}, a))
      },
      wlk: {
        id: "demo-walker",
        edition: "11th",
        faction: "Demo",
        factionKeywords: ["DEMO"],
        type: "Vehicle",
        name: "Walker",
        keywords: ["VEHICLE", "WALKER", "TITANIC", "GRENADES", "DEEP STRIKE"],
        search: ["walker", "vehicle", "demo"],
        M: 8, T: 10, Sv: 3, Inv: 0, W: 7, Ld: 7, OC: 3, baseMm: 80,
        composition: { label: "1 Walker", defaultCount: 1 },
        pts: null, ptsSource: "demo",
        weapons: [
          { name: "Cannon", kind: "ranged", A: 3, skill: 3, S: 8, AP: -1, D: 2, rng: 36, tags: [] },
          { name: "Fist", kind: "melee", A: 4, skill: 3, S: 8, AP: -2, D: 2, rng: 0, tags: [] }
        ],
        abilities: TEACH.map(a => Object.assign({}, a))
      }
    }
  });
})();
