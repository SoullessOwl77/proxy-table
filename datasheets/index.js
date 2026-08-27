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
  const DETACHMENTS_DEFAULT = {};

  const BATTLE_SIZES = [
    { id: "incursion", name: "Incursion", pts: 1000, dp: 2, enhancements: 2, copies: 2, source: "core" },
    { id: "strike-force", name: "Strike Force", pts: 2000, dp: 3, enhancements: 4, copies: 3, source: "core" },
    { id: "onslaught", name: "Onslaught", pts: 3000, dp: 4, enhancements: 6, copies: 4, source: "proxy" }
  ];
  const MFM_HUB = "https://mfm.warhammer-community.com/en";
  function mfmSeed() { return window.PT_MFM_SEED || { version: "", units: {} }; }
  function mfmNorm(s) {
    return String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  }
  function mfmEntryFor(sheet) {
    const seed = mfmSeed().units || {};
    if (sheet && sheet.id && seed[sheet.id]) return seed[sheet.id];
    const want = mfmNorm(sheet && (sheet.name || sheet.id));
    if (!want) return null;
    const keys = Object.keys(seed);
    for (let i = 0; i < keys.length; i++) {
      const e = seed[keys[i]];
      if (mfmNorm(e.name) === want || mfmNorm(keys[i]) === want) return e;
    }
    return null;
  }
  function mfmFirstPts(entry) {
    if (!entry || !entry.bands || !entry.bands.length) return null;
    return entry.bands.find(b => !b.tier || b.tier === "unit" || String(b.tier).indexOf("1st") === 0) || entry.bands[0];
  }
  function lookupMfm(sheet) {
    const entry = mfmEntryFor(sheet);
    const slug = ((sheet && sheet.faction) || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const url = MFM_HUB + (slug ? "/" + slug : "");
    if (!entry) {
      return { hit: false, url, version: mfmSeed().version || "", message: "Not in the local MFM seed. Open the faction page and enter the cost." };
    }
    const first = mfmFirstPts(entry);
    return {
      hit: true,
      url,
      version: mfmSeed().version || "",
      name: entry.name,
      pts: first && first.pts,
      bands: entry.bands,
      message: "MFM v" + (mfmSeed().version || "?") + " · " + (first && first.pts) + " pts"
    };
  }
  function applyMfmProposal(sheet) {
    const look = lookupMfm(sheet);
    if (!look.hit) return look;
    sheet.ptsProposed = look.pts;
    sheet.ptsBands = (look.bands || []).map(b => ({ count: b.count, pts: b.pts, tier: b.tier || "unit" }));
    sheet.ptsMfmVersion = look.version;
    if (sheet.pts == null) {
      sheet.pts = look.pts;
      sheet.ptsSource = "proposed";
    } else if (sheet.pts !== look.pts) {
      sheet.ptsSource = "proposed";
    }
    return look;
  }
  function isDemoSheet(s) {
    if (!s) return false;
    if (s.ptsSource === "demo") return true;
    if (String(s.faction || "").toUpperCase() === "DEMO") return true;
    if (String(s.id || "").indexOf("demo-") === 0) return true;
    return false;
  }
  function isPtsOnly(s) {
    if (!s) return false;
    if (s.fanSourced || (s.source && s.source.kind === "fan")) return false;
    if (s.pendingStats) return true;
    if (s.sheetComplete === false) return true;
    return false;
  }
  function isFanSheet(s) {
    if (!s) return false;
    if (s.fanSourced) return true;
    if (s.source && s.source.kind === "fan") return true;
    return false;
  }
  function mfmCatalogDiff() {
    const sheets = currentSheets();
    const out = [];
    Object.keys(sheets).forEach(k => {
      const s = sheets[k];
      if (isDemoSheet(s)) return;
      const look = lookupMfm(s);
      if (!look.hit) {
        out.push({ key: k, name: s.name, kind: "missing", have: s.pts, want: null, url: look.url });
        return;
      }
      if (s.pts !== look.pts) {
        out.push({ key: k, name: s.name, kind: "changed", have: s.pts, want: look.pts, url: look.url });
      }
    });
    return { version: mfmSeed().version, rows: out };
  }

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
  function nid() { return "list_" + Date.now().toString(36) + Math.floor(Math.random() * 1e3).toString(36); }
  function emptyStore() {
    return {
      v: 2,
      activeId: "list_default",
      lists: [{ id: "list_default", name: "My list", units: [], sizeId: "strike-force", detachments: [], enhancementCount: 0 }]
    };
  }
  function migrateArmy(raw) {
    if (!raw) return emptyStore();
    if (raw.v >= 2 && Array.isArray(raw.lists) && raw.lists.length) {
      raw.lists.forEach(l => {
        if (!l.sizeId) l.sizeId = "strike-force";
        if (!Array.isArray(l.detachments)) l.detachments = [];
        if (l.enhancementCount == null) l.enhancementCount = 0;
      });
      if (!raw.activeId || !raw.lists.some(l => l.id === raw.activeId)) raw.activeId = raw.lists[0].id;
      return raw;
    }
    if (Array.isArray(raw.units)) {
      const id = "list_default";
      return {
        v: 2, activeId: id,
        lists: [{ id, name: raw.name || "My list", units: raw.units, sizeId: "strike-force", detachments: [], enhancementCount: 0 }]
      };
    }
    return emptyStore();
  }
  function loadArmyStore() {
    try { return migrateArmy(JSON.parse(localStorage.getItem(ARMY_STORE) || "null")); }
    catch (_) { return emptyStore(); }
  }
  function saveArmyStore(store) {
    store.v = 2;
    localStorage.setItem(ARMY_STORE, JSON.stringify(store));
    return store;
  }
  function listById(id) {
    return (loadArmyStore().lists || []).find(l => l.id === id) || null;
  }
  function activeList(store) {
    store = store || loadArmyStore();
    return (store.lists || []).find(l => l.id === store.activeId) || store.lists[0];
  }
  function emptyArmy() {
    const l = activeList();
    return { v: 1, id: l.id, name: l.name, units: l.units, sizeId: l.sizeId, detachments: l.detachments, enhancementCount: l.enhancementCount };
  }
  function loadArmy() { const a = emptyArmy(); repriceList(a); return a; }
  function saveArmy(army) {
    const st = loadArmyStore();
    let l = st.lists.find(x => x.id === (army.id || st.activeId));
    if (!l) {
      l = {
        id: army.id || nid(), name: army.name || "My list", units: army.units || [],
        sizeId: army.sizeId || "strike-force", detachments: army.detachments || [], enhancementCount: army.enhancementCount || 0
      };
      st.lists.push(l);
      st.activeId = l.id;
    } else {
      l.name = army.name || l.name;
      l.units = army.units || [];
      if (army.sizeId) l.sizeId = army.sizeId;
      if (army.detachments) l.detachments = army.detachments;
      if (army.enhancementCount != null) l.enhancementCount = army.enhancementCount;
    }
    repriceList(l);
    saveArmyStore(st);
    return loadArmy();
  }
  function setActiveList(id) {
    const st = loadArmyStore();
    if (st.lists.some(l => l.id === id)) { st.activeId = id; saveArmyStore(st); }
    return loadArmy();
  }
  function addList(name) {
    const st = loadArmyStore();
    const l = { id: nid(), name: name || ("List " + (st.lists.length + 1)), units: [], sizeId: "strike-force", detachments: [], enhancementCount: 0 };
    st.lists.push(l);
    st.activeId = l.id;
    saveArmyStore(st);
    return l;
  }
  function deleteList(id) {
    const st = loadArmyStore();
    st.lists = st.lists.filter(l => l.id !== id);
    if (!st.lists.length) st.lists = emptyStore().lists;
    if (!st.lists.some(l => l.id === st.activeId)) st.activeId = st.lists[0].id;
    saveArmyStore(st);
    return loadArmy();
  }
  function sizeById(id) { return BATTLE_SIZES.find(s => s.id === id) || null; }
  function parseTier(tier) {
    const raw = String(tier || "unit").toLowerCase();
    if (!raw || raw === "unit") return { min: 1, max: Infinity, label: "any" };
    const plus = raw.indexOf("+") >= 0;
    const parts = raw.replace("+", "").split("-");
    const ord = { "1st": 1, "2nd": 2, "3rd": 3, "4th": 4, "5th": 5, "6th": 6 };
    const num = s => ord[s] || parseInt(s, 10) || 1;
    const min = num(parts[0]);
    const max = plus ? Infinity : (parts[1] ? num(parts[1]) : min);
    return { min, max, label: raw };
  }
  function bandFor(sheet, count, copyIndex) {
    copyIndex = Math.max(1, copyIndex || 1);
    count = Math.max(1, count || 1);
    const bands = ((sheet && sheet.ptsBands) || []).filter(b => b.count === count);
    if (!bands.length) return null;
    const hit = bands.find(b => {
      const t = parseTier(b.tier);
      return copyIndex >= t.min && copyIndex <= t.max;
    });
    return hit || bands[0];
  }
  function ptsForCount(sheet, count, copyIndex) {
    count = Math.max(1, count || 1);
    copyIndex = Math.max(1, copyIndex || 1);
    if (!sheet) return { pts: null, source: "review", unknown: true, copyIndex, tier: "" };
    const seed = mfmEntryFor(sheet);
    const bands = (sheet.ptsBands && sheet.ptsBands.length)
      ? sheet.ptsBands
      : ((seed && seed.bands) || []);
    const view = Object.assign({}, sheet, { ptsBands: bands });
    const hit = bandFor(view, count, copyIndex);
    if (hit && typeof hit.pts === "number") {
      return {
        pts: hit.pts,
        source: sheet.ptsSource || "mfm",
        unknown: sheet.ptsSource === "review",
        copyIndex,
        tier: hit.tier || "unit",
        count
      };
    }
    const def = (sheet.composition && sheet.composition.defaultCount) || 1;
    if (typeof sheet.pts === "number" && count === def) {
      return { pts: sheet.pts, source: sheet.ptsSource || "mfm", unknown: sheet.ptsSource === "review", copyIndex, tier: "unit", count };
    }
    if (sheet.ptsPer === "model" && typeof sheet.pts === "number") {
      return { pts: sheet.pts * count, source: sheet.ptsSource || "mfm", unknown: false, copyIndex, tier: "unit", count };
    }
    return { pts: null, source: "review", unknown: true, copyIndex, tier: "", count };
  }
  function sheetKeyOf(u) { return (u && (u.sheetKey || u.sheetId || u.name)) || ""; }
  function nextCopyIndex(list, sheetKey) {
    const n = ((list && list.units) || []).filter(u => sheetKeyOf(u) === sheetKey).length;
    return n + 1;
  }
  function repriceList(list) {
    if (!list || !list.units) return list;
    const seen = {};
    list.units.forEach(u => {
      const sid = sheetKeyOf(u);
      seen[sid] = (seen[sid] || 0) + 1;
      u.copyIndex = seen[sid];
      const sheet = live.sheets[u.sheetKey] || live.sheets[u.sheetId] || null;
      if (!sheet) return;
      const quote = ptsForCount(sheet, u.count || 1, u.copyIndex);
      if (!quote.unknown && quote.pts != null) {
        u.pts = quote.pts;
        u.ptsTier = quote.tier;
        if (u.ptsSource === "review") u.ptsSource = sheet.ptsSource || "mfm";
      } else {
        u.ptsTier = quote.tier || "";
      }
    });
    return list;
  }
  function listTotal(list) {
    repriceList(list);
    let pts = 0, unknown = 0;
    ((list && list.units) || []).forEach(u => {
      if (u.ptsSource === "review" || u.pts == null || u.pts === "") unknown++;
      else pts += Number(u.pts) || 0;
    });
    return { pts, unknown };
  }
  function formatPts(n, unknown) {
    if (unknown) return (n ? Number(n).toLocaleString() + " + ?" : "?");
    if (n == null) return "?";
    return Number(n).toLocaleString() + " pts";
  }
  function detachmentOf(id) { return DETACHMENTS_DEFAULT[id] || null; }
  function detachmentsForFaction(faction) {
    return Object.keys(DETACHMENTS_DEFAULT).map(k => DETACHMENTS_DEFAULT[k])
      .filter(d => !faction || d.faction === faction);
  }
  function sheetKeywords(sheet) {
    return ((sheet && sheet.keywords) || []).map(k => String(k).toUpperCase());
  }
  function copyCapForSheet(sheet, size) {
    const kws = sheetKeywords(sheet);
    if (kws.indexOf("EPIC HERO") >= 0) return 1;
    const base = (size && size.copies) || 3;
    if (kws.indexOf("BATTLELINE") >= 0 || kws.indexOf("DEDICATED TRANSPORT") >= 0) return base * 2;
    return base;
  }
  function validateList(list) {
    list = list || loadArmy();
    const size = sizeById(list.sizeId) || sizeById("strike-force");
    const tot = listTotal(list);
    const dets = (list.detachments || []).map(detachmentOf).filter(Boolean);
    const dp = dets.reduce((n, d) => n + (d.dp || 0), 0);
    const tags = [];
    let uniqueClash = false;
    dets.forEach(d => {
      (d.uniqueTags || []).forEach(t => {
        if (tags.indexOf(t) >= 0) uniqueClash = true;
        else tags.push(t);
      });
    });
    const counts = {};
    (list.units || []).forEach(u => {
      const sid = u.sheetId || u.sheetKey || u.name;
      counts[sid] = counts[sid] || { name: u.name, n: 0, sheet: live.sheets[u.sheetKey] };
      counts[sid].n += 1;
    });
    const copies = Object.keys(counts).map(sid => {
      const row = counts[sid];
      const cap = copyCapForSheet(row.sheet, size);
      return { name: row.name, n: row.n, cap, over: row.n > cap };
    });
    const enh = Number(list.enhancementCount) || 0;
    const overPts = !tot.unknown && tot.pts > size.pts;
    const overDp = dp > size.dp;
    const overEnh = enh > size.enhancements;
    const overCopies = copies.some(c => c.over);
    return {
      size, pts: tot.pts, unknown: tot.unknown, overPts,
      dp, dpBudget: size.dp, overDp,
      enh, enhCap: size.enhancements, overEnh,
      copies, overCopies, uniqueClash,
      legal: !overPts && !tot.unknown && !overDp && !overEnh && !overCopies && !uniqueClash
    };
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
    (pack.detachments || []).forEach(d => {
      if (!d || !d.id) return;
      DETACHMENTS_DEFAULT[d.id] = Object.assign({ faction: pack.faction || "" }, d);
    });
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
    MFM_HUB,
    BATTLE_SIZES,
    lookupMfm,
    applyMfmProposal,
    mfmCatalogDiff,
    isDemoSheet,
    isPtsOnly,
    isFanSheet,
    mfmSeed,
    loadArmy,
    saveArmy,
    emptyArmy,
    loadArmyStore,
    saveArmyStore,
    listById,
    activeList,
    setActiveList,
    addList,
    deleteList,
    ptsForCount,
    parseTier,
    bandFor,
    nextCopyIndex,
    repriceList,
    listTotal,
    sizeById,
    formatPts,
    detachmentOf,
    detachmentsForFaction,
    validateList,
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
