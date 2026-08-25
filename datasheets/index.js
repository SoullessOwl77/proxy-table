/* Catalog core. Faction packs call PTSheetsPack(...) after this file. */
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
    }
  };
  const DATASHEETS_DEFAULT = {};
  const PACKS = {};

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
    Object.keys(lib || {}).forEach(id => {
      if (JSON.stringify(lib[id]) !== JSON.stringify(ABILITY_LIB[id])) pack.lib[id] = lib[id];
    });
    Object.keys(sheets || {}).forEach(k => {
      if (JSON.stringify(sheets[k]) !== JSON.stringify(DATASHEETS_DEFAULT[k])) pack.sheets[k] = sheets[k];
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
  function emptyArmy() { return { v: 1, name: "My list", units: [] }; }
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
  function profileForIndex(sheet, index, total) {
    const list = (sheet && sheet.profiles) || [];
    if (!list.length) return { name: sheet.name, W: sheet.W };
    const leader = list[0];
    if (index === 0 && leader) return leader;
    return list[1] || leader || { name: sheet.name, W: sheet.W };
  }
  function wepHasTag(w, tag) {
    const want = String(tag || "").toUpperCase().replace(/\s+/g, "-");
    return ((w && w.tags) || []).some(t => String(t).toUpperCase().replace(/\s+/g, "-") === want);
  }
  function isCloseQuarters(w) {
    return wepHasTag(w, "CLOSE-QUARTERS") || wepHasTag(w, "PISTOL");
  }

  const live = { lib: currentLib(), sheets: currentSheets() };

  window.PTSheetsPack = function (id, pack) {
    pack = pack || {};
    PACKS[id] = pack;
    Object.assign(ABILITY_LIB, pack.lib || {});
    Object.assign(DATASHEETS_DEFAULT, pack.sheets || {});
    if (window.PTSheets && window.PTSheets.reload) window.PTSheets.reload();
  };

  window.PTSheets = {
    STORE,
    TYPES: ["Infantry", "Character", "Vehicle", "Monster", "Swarm", "Mounted"],
    EDITIONS: ["11th"],
    PACKS,
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
    profileForIndex,
    wepHasTag,
    isCloseQuarters,
    addAbility(name, extra) {
      const id = slug(name);
      if (!live.lib[id]) {
        live.lib[id] = Object.assign({
          id, name: name || id, kind: "other", announce: null, note: "", pending: true
        }, extra || {});
      }
      return live.lib[id];
    }
  };
})();
