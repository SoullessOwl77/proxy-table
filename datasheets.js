/* Shared 40K datasheet template. Loaded by wh40k.html and datasheet.html.
   Edits save to localStorage (pt_datasheets_v1) and override the built-in demo rows. */
(function () {
  const STORE = "pt_datasheets_v1";

  const ABILITY_LIB = {
    "feel-no-pain": {
      id: "feel-no-pain",
      name: "Feel No Pain",
      kind: "fnp",
      announce: null,
      note: "After a wound would be lost, roll one D6 per wound. On X+ it is not lost."
    },
    "deep-strike": {
      id: "deep-strike",
      name: "Deep Strike",
      kind: "reserve",
      announce: null,
      note: "May start in Reserves and Ingress from the second battle round."
    },
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
  };

  const DATASHEETS_DEFAULT = {
    inf: {
      id: "demo-infantry",
      edition: "11th",
      faction: "Demo",
      factionKeywords: ["DEMO"],
      type: "Infantry",
      name: "Infantry",
      keywords: ["INFANTRY"],
      search: ["infantry", "demo", "battleline"],
      M: 6, T: 4, Sv: 3, Inv: 0, W: 2, Ld: 6, OC: 2, baseMm: 32,
      composition: { label: "1 Infantry", defaultCount: 5 },
      weapons: [
        { name: "Rifle", kind: "ranged", A: 2, skill: 3, S: 4, AP: 0, D: 1, rng: 24, tags: [] },
        { name: "Blade", kind: "melee", A: 3, skill: 3, S: 4, AP: 0, D: 1, rng: 0, tags: [] }
      ],
      abilities: []
    },
    cmd: {
      id: "demo-commander",
      edition: "11th",
      faction: "Demo",
      factionKeywords: ["DEMO"],
      type: "Character",
      name: "Commander",
      keywords: ["INFANTRY", "CHARACTER"],
      search: ["commander", "character", "demo", "hq"],
      M: 6, T: 4, Sv: 3, Inv: 4, W: 5, Ld: 7, OC: 1, baseMm: 40,
      composition: { label: "1 Commander", defaultCount: 1 },
      weapons: [
        { name: "Pistol", kind: "ranged", A: 1, skill: 2, S: 4, AP: -1, D: 1, rng: 12, tags: ["PISTOL"] },
        { name: "Power blade", kind: "melee", A: 5, skill: 2, S: 5, AP: -2, D: 2, rng: 0, tags: [] }
      ],
      abilities: [{ id: "feel-no-pain", x: 5 }]
    },
    wlk: {
      id: "demo-walker",
      edition: "11th",
      faction: "Demo",
      factionKeywords: ["DEMO"],
      type: "Vehicle",
      name: "Walker",
      keywords: ["VEHICLE", "WALKER"],
      search: ["walker", "vehicle", "demo"],
      M: 8, T: 10, Sv: 3, Inv: 0, W: 7, Ld: 7, OC: 3, baseMm: 80,
      composition: { label: "1 Walker", defaultCount: 1 },
      weapons: [
        { name: "Cannon", kind: "ranged", A: 3, skill: 3, S: 8, AP: -1, D: 2, rng: 36, tags: [] },
        { name: "Fist", kind: "melee", A: 4, skill: 3, S: 8, AP: -2, D: 2, rng: 0, tags: [] }
      ],
      abilities: []
    },
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
  };

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function slug(s) {
    return String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "ability";
  }

  function loadStore() {
    try { return JSON.parse(localStorage.getItem(STORE) || "null") || { lib: {}, sheets: {} }; }
    catch (_) { return { lib: {}, sheets: {} }; }
  }

  function currentLib() {
    const lib = clone(ABILITY_LIB);
    const extra = loadStore().lib || {};
    Object.keys(extra).forEach(k => { lib[k] = extra[k]; });
    return lib;
  }

  function currentSheets() {
    const sheets = clone(DATASHEETS_DEFAULT);
    const extra = loadStore().sheets || {};
    Object.keys(extra).forEach(k => { sheets[k] = extra[k]; });
    return sheets;
  }

  function saveAll(lib, sheets) {
    const pack = { lib: {}, sheets: {} };
    const baseLib = ABILITY_LIB;
    Object.keys(lib || {}).forEach(id => {
      if (JSON.stringify(lib[id]) !== JSON.stringify(baseLib[id])) pack.lib[id] = lib[id];
    });
    const baseSheets = DATASHEETS_DEFAULT;
    Object.keys(sheets || {}).forEach(k => {
      if (JSON.stringify(sheets[k]) !== JSON.stringify(baseSheets[k])) pack.sheets[k] = sheets[k];
    });
    localStorage.setItem(STORE, JSON.stringify(pack));
  }

  function firstWeapon(sheet, kind) {
    const w = ((sheet && sheet.weapons) || []).find(x => x.kind === kind);
    if (!w) return kind === "ranged"
      ? { name: "Gun", A: 1, skill: 4, S: 4, AP: 0, D: 1, rng: 24, tags: [] }
      : { name: "Close combat", A: 1, skill: 4, S: 4, AP: 0, D: 1, rng: 0, tags: [] };
    return { name: w.name, A: w.A, skill: w.skill, S: w.S, AP: w.AP, D: w.D, rng: w.rng || 0, tags: (w.tags || []).slice() };
  }

  function abilitiesOf(u) { return (u && u.abilities) || []; }

  function fnpOf(u) {
    const a = abilitiesOf(u).find(x => x.id === "feel-no-pain");
    return a && a.x ? a.x : 0;
  }

  const ARMY_STORE = "pt_40k_army_v1";
  function emptyArmy() {
    return { v: 1, name: "My list", units: [] };
  }
  function loadArmy() {
    try {
      const raw = JSON.parse(localStorage.getItem(ARMY_STORE) || "null");
      if (raw && Array.isArray(raw.units)) return raw;
    } catch (_) {}
    return emptyArmy();
  }
  function saveArmy(army) {
    localStorage.setItem(ARMY_STORE, JSON.stringify(army));
    return army;
  }
  function defaultGear(sheet, count) {
    count = Math.max(1, count || (sheet.composition && sheet.composition.defaultCount) || 1);
    const gear = (sheet.weapons || []).map(w => ({ name: w.name, count: 0 }));
    const set = (name, n) => {
      const g = gear.find(x => x.name === name);
      if (g) g.count = Math.max(0, Math.min(count, n));
    };
    if (sheet.id === "boyz") {
      set("Slugga", count);
      set("Shoota", Math.max(0, count - 1));
      set("Choppa", Math.max(0, count - 1));
      set("Kustom shoota", count >= 1 ? 1 : 0);
      set("Big choppa", count >= 1 ? 1 : 0);
    } else {
      const r = (sheet.weapons || []).find(w => w.kind === "ranged");
      const m = (sheet.weapons || []).find(w => w.kind === "melee");
      if (r) set(r.name, count);
      if (m) set(m.name, count);
    }
    return gear;
  }
  function weaponsForIndex(sheet, gear, index) {
    const names = (gear || []).filter(g => index < (g.count || 0)).map(g => g.name);
    return (sheet.weapons || []).filter(w => names.indexOf(w.name) >= 0);
  }

  const live = { lib: currentLib(), sheets: currentSheets() };

  window.PTSheets = {
    STORE,
    TYPES: ["Infantry", "Character", "Vehicle", "Monster", "Swarm", "Mounted"],
    EDITIONS: ["11th"],
    defaults: { lib: ABILITY_LIB, sheets: DATASHEETS_DEFAULT },
    get ABILITY_LIB() { return live.lib; },
    get DATASHEETS() { return live.sheets; },
    reload() {
      live.lib = currentLib();
      live.sheets = currentSheets();
      return live;
    },
    save(lib, sheets) {
      saveAll(lib || live.lib, sheets || live.sheets);
      this.reload();
    },
    reset() {
      localStorage.removeItem(STORE);
      this.reload();
    },
    sheetOf(key) { return live.sheets[key] || null; },
    firstWeapon,
    abilitiesOf,
    fnpOf,
    slug,
    ARMY_STORE,
    loadArmy,
    saveArmy,
    emptyArmy,
    defaultGear,
    weaponsForIndex,
    addAbility(name, extra) {
      const id = slug(name);
      if (!live.lib[id]) {
        live.lib[id] = Object.assign({
          id,
          name: name || id,
          kind: "other",
          announce: null,
          note: "",
          pending: true
        }, extra || {});
      }
      return live.lib[id];
    }
  };
})();
