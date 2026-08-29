/* Catalog core. Faction packs call PTSheetsPack(...) after this file. */
(function () {
  const STORE = "pt_datasheets_v1";
  const ABILITY_LIB = {
    "feel-no-pain": { id: "feel-no-pain", name: "Feel No Pain", kind: "fnp", announce: null, note: "After a wound would be lost, roll one D6 per wound. On X+ it is not lost." },
    "deep-strike": { id: "deep-strike", name: "Deep Strike", kind: "reserve", announce: null, note: "May start in Reserves and Ingress from the second battle round." }
  };
  const DATASHEETS_DEFAULT = {};
  const PACKS = {};
  const DETACHMENTS_DEFAULT = {};
  const ENHANCEMENTS_DEFAULT = {};
  const CHAPTER_KWS = ["SALAMANDERS","ULTRAMARINES","IMPERIAL FISTS","IRON HANDS","RAVEN GUARD","WHITE SCARS","CRIMSON FISTS","BLACK TEMPLARS","DARK ANGELS","BLOOD ANGELS","SPACE WOLVES","DEATHWATCH"];
  const BATTLE_SIZES = [
    { id: "incursion", name: "Incursion", pts: 1000, dp: 2, enhancements: 2, copies: 2, source: "core" },
    { id: "strike-force", name: "Strike Force", pts: 2000, dp: 3, enhancements: 4, copies: 3, source: "core" },
    { id: "onslaught", name: "Onslaught", pts: 3000, dp: 4, enhancements: 6, copies: 4, source: "proxy" }
  ];
  const MFM_HUB = "https://mfm.warhammer-community.com/en";
  function clone(o) { return JSON.parse(JSON.stringify(o || {})); }
  function mfmSeed() { return window.PT_MFM_SEED || { version: "", units: {} }; }
  function mfmNorm(s) { return String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim(); }
  function mfmEntryFor(sheet) {
    const seed = mfmSeed().units || {};
    if (sheet && sheet.id && seed[sheet.id]) return seed[sheet.id];
    const want = mfmNorm(sheet && (sheet.name || sheet.id));
    if (!want) return null;
    const keys = Object.keys(seed);
    for (let i = 0; i < keys.length; i++) {
      const e = seed[keys[i]];
      if (e && mfmNorm(e.name) === want) return e;
    }
    return null;
  }
  function lookupMfm(sheet) {
    const entry = mfmEntryFor(sheet);
    const url = MFM_HUB;
    if (!entry) return { hit: false, message: "Not in the MFM seed.", url };
    const band = (entry.bands || [])[0] || {};
    return { hit: true, pts: band.pts, bands: entry.bands || [], version: mfmSeed().version || "", url, message: (sheet.name || sheet.id) + " · " + (band.pts != null ? band.pts + " pts" : "?") + " (MFM " + (mfmSeed().version || "") + ")" };
  }
  function applyMfmProposal(sheet) {
    const look = lookupMfm(sheet);
    if (!look.hit) return look;
    sheet.ptsProposed = look.pts;
    sheet.ptsBands = (look.bands || []).map(b => ({ count: b.count, pts: b.pts, tier: b.tier || "unit" }));
    sheet.ptsMfmVersion = look.version;
    if (sheet.pts == null) { sheet.pts = look.pts; sheet.ptsSource = "proposed"; }
    else if (sheet.pts !== look.pts) sheet.ptsSource = "proposed";
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
    if (s.pendingStats) return true;
    const weps = (s.weapons || []).length;
    const noLine = s.M == null && s.T == null;
    if (s.sheetComplete === false && (noLine || !weps)) return true;
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
      if (!look.hit) { out.push({ key: k, name: s.name, kind: "missing", have: s.pts, want: null, url: look.url }); return; }
      if (s.pts !== look.pts) out.push({ key: k, name: s.name, kind: "changed", have: s.pts, want: look.pts, url: look.url });
    });
    return { version: mfmSeed().version || "", rows: out };
  }
  function currentLib() {
    const lib = clone(ABILITY_LIB);
    try { const raw = JSON.parse(localStorage.getItem(STORE) || "null"); if (raw && raw.lib) Object.assign(lib, raw.lib); } catch (_) {}
    return lib;
  }
  function currentSheets() {
    const sheets = clone(DATASHEETS_DEFAULT);
    try { const raw = JSON.parse(localStorage.getItem(STORE) || "null"); if (raw && raw.sheets) Object.assign(sheets, raw.sheets); } catch (_) {}
    return sheets;
  }
  function saveAll(lib, sheets) {
    const pack = { v: 1, lib: {}, sheets: {} };
    Object.keys(lib || {}).forEach(id => { if (JSON.stringify(lib[id]) !== JSON.stringify(ABILITY_LIB[id])) pack.lib[id] = lib[id]; });
    Object.keys(sheets || {}).forEach(k => { if (JSON.stringify(sheets[k]) !== JSON.stringify(DATASHEETS_DEFAULT[k])) pack.sheets[k] = sheets[k]; });
    localStorage.setItem(STORE, JSON.stringify(pack));
  }
  function slug(s) { return String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
  function addAbility(name, extra) {
    const id = slug(name);
    live.lib[id] = Object.assign({ id, name, kind: "other", announce: null, pending: true, note: "" }, extra || {});
    return live.lib[id];
  }
  function abilitiesOf(u) { return (u && u.abilities) || []; }
  function fnpOf(u) { const a = abilitiesOf(u).find(x => x.id === "feel-no-pain"); return a && a.x ? a.x : 0; }

  const ARMY_STORE = "pt_40k_army_v1";
  function nid() { return "list_" + Date.now().toString(36) + Math.floor(Math.random() * 1e3).toString(36); }
  function emptyStore() {
    return { v: 2, activeId: "list_default", lists: [{ id: "list_default", name: "My list", units: [], faction: "", sizeId: "strike-force", detachments: [], enhancements: [], enhancementCount: 0 }] };
  }
  function migrateArmy(raw) {
    if (!raw) return emptyStore();
    if (raw.v >= 2 && Array.isArray(raw.lists) && raw.lists.length) {
      raw.lists.forEach(l => {
        if (!l.sizeId) l.sizeId = "strike-force";
        if (!l.faction) l.faction = "";
        if (!Array.isArray(l.detachments)) l.detachments = [];
        if (!Array.isArray(l.enhancements)) l.enhancements = [];
        if (l.enhancementCount == null) l.enhancementCount = l.enhancements.length || 0;
      });
      if (!raw.activeId || !raw.lists.some(l => l.id === raw.activeId)) raw.activeId = raw.lists[0].id;
      return raw;
    }
    if (Array.isArray(raw.units)) {
      return { v: 2, activeId: "list_default", lists: [{ id: "list_default", name: raw.name || "My list", units: raw.units, faction: raw.faction || "", sizeId: raw.sizeId || "strike-force", detachments: raw.detachments || [], enhancements: raw.enhancements || [], enhancementCount: raw.enhancementCount || 0 }] };
    }
    return emptyStore();
  }
  function loadArmyStore() { try { return migrateArmy(JSON.parse(localStorage.getItem(ARMY_STORE) || "null")); } catch (_) { return emptyStore(); } }
  function saveArmyStore(st) { localStorage.setItem(ARMY_STORE, JSON.stringify(st)); }
  function listById(id) { return (loadArmyStore().lists || []).find(l => l.id === id) || null; }
  function activeList(store) { store = store || loadArmyStore(); return (store.lists || []).find(l => l.id === store.activeId) || store.lists[0]; }
  function emptyArmy() {
    const l = activeList();
    return { v: 1, id: l.id, name: l.name, units: l.units, faction: l.faction || "", sizeId: l.sizeId, detachments: l.detachments, enhancements: l.enhancements || [], enhancementCount: (l.enhancements && l.enhancements.length) || l.enhancementCount || 0 };
  }
  function loadArmy() { const a = emptyArmy(); repriceList(a); return a; }
  function saveArmy(army) {
    const st = loadArmyStore();
    let l = st.lists.find(x => x.id === (army.id || st.activeId));
    if (!l) {
      l = { id: army.id || nid(), name: army.name || "My list", units: army.units || [], faction: army.faction || "", sizeId: army.sizeId || "strike-force", detachments: army.detachments || [], enhancements: army.enhancements || [], enhancementCount: (army.enhancements && army.enhancements.length) || army.enhancementCount || 0 };
      st.lists.push(l); st.activeId = l.id;
    } else {
      l.name = army.name || l.name; l.units = army.units || [];
      if (army.faction != null) l.faction = army.faction;
      if (army.sizeId) l.sizeId = army.sizeId;
      if (army.detachments) l.detachments = army.detachments;
      if (army.enhancements) l.enhancements = army.enhancements;
      l.enhancementCount = (l.enhancements && l.enhancements.length) || army.enhancementCount || 0;
    }
    repriceList(l); saveArmyStore(st); return loadArmy();
  }
  function setActiveList(id) {
    const st = loadArmyStore();
    if (st.lists.some(l => l.id === id)) { st.activeId = id; saveArmyStore(st); }
    return loadArmy();
  }
  function addList(name) {
    const st = loadArmyStore();
    const l = { id: nid(), name: name || ("List " + (st.lists.length + 1)), units: [], faction: "", sizeId: "strike-force", detachments: [], enhancements: [], enhancementCount: 0 };
    st.lists.push(l); st.activeId = l.id; saveArmyStore(st); return l;
  }
  function deleteList(id) {
    const st = loadArmyStore();
    st.lists = st.lists.filter(l => l.id !== id);
    if (!st.lists.length) st.lists = emptyStore().lists;
    if (!st.lists.some(l => l.id === st.activeId)) st.activeId = st.lists[0].id;
    saveArmyStore(st); return loadArmy();
  }
  const LIST_KIND = "proxy-table-40k-list";
  const LISTS_KIND = "proxy-table-40k-lists";
  function snapshotList(list) {
    list = list || activeList();
    if (!list) return null;
    return {
      name: list.name || "List", faction: list.faction || "", sizeId: list.sizeId || "strike-force",
      detachments: (list.detachments || []).slice(),
      enhancements: (list.enhancements || []).map(e => ({ id: e.id, name: e.name, pts: e.pts })),
      enhancementCount: (list.enhancements && list.enhancements.length) || list.enhancementCount || 0,
      units: (list.units || []).map(u => ({ sheetKey: u.sheetKey, sheetId: u.sheetId, name: u.name, count: u.count, gear: (u.gear || []).map(g => ({ name: g.name, count: g.count })), pts: u.pts, ptsSource: u.ptsSource || "", copyIndex: u.copyIndex || 0, ptsTier: u.ptsTier || "" }))
    };
  }
  function exportList(id) {
    const list = (id && listById(id)) || activeList();
    return { v: 1, kind: LIST_KIND, app: "proxy-table", game: "wh40k", exportedAt: new Date().toISOString(), list: snapshotList(list) };
  }
  function exportAllLists() {
    const st = loadArmyStore();
    return { v: 1, kind: LISTS_KIND, app: "proxy-table", game: "wh40k", exportedAt: new Date().toISOString(), lists: (st.lists || []).map(snapshotList) };
  }
  function incomingLists(raw) {
    if (!raw || typeof raw !== "object") return [];
    if (raw.kind === LISTS_KIND && Array.isArray(raw.lists)) return raw.lists;
    if (raw.kind === LIST_KIND && raw.list) return [raw.list];
    if (raw.v >= 2 && Array.isArray(raw.lists)) return raw.lists;
    if (raw.list && Array.isArray(raw.list.units)) return [raw.list];
    if (Array.isArray(raw.units) || raw.sizeId) return [raw];
    return [];
  }
  function importLists(raw) {
    const incoming = incomingLists(raw);
    if (!incoming.length) return { ok: false, added: 0, message: "Not a Proxy Table list file." };
    const st = loadArmyStore();
    const added = [];
    incoming.forEach((src, n) => {
      const l = {
        id: nid(), name: src.name || ("Imported " + (st.lists.length + 1)), faction: src.faction || "",
        sizeId: src.sizeId || "strike-force",
        detachments: Array.isArray(src.detachments) ? src.detachments.slice() : [],
        enhancements: Array.isArray(src.enhancements) ? src.enhancements.map(e => ({ id: e.id, name: e.name, pts: e.pts })) : [],
        enhancementCount: (src.enhancements && src.enhancements.length) || src.enhancementCount || 0,
        units: (src.units || []).map((u, i) => ({
          id: "au_" + Date.now().toString(36) + n.toString(36) + i.toString(36),
          sheetKey: u.sheetKey, sheetId: u.sheetId, name: u.name, count: Math.max(1, u.count || 1),
          gear: (u.gear || []).map(g => ({ name: g.name, count: g.count || 0 })),
          pts: u.pts, ptsSource: u.ptsSource || "", copyIndex: u.copyIndex || 0, ptsTier: u.ptsTier || ""
        }))
      };
      repriceList(l); st.lists.push(l); added.push(l);
    });
    if (added.length) st.activeId = added[0].id;
    saveArmyStore(st);
    return { ok: true, added: added.length, message: "Imported " + added.length + " list" + (added.length === 1 ? "" : "s") + "." };
  }
  function parseNum(v, fallback) { const n = Number(String(v == null ? "" : v).replace(/[^\d.\-]+/g, "")); return n === n ? n : fallback; }
  function parseAorD(v, fallback) { if (v == null || v === "") return fallback; if (typeof v === "number") return v; return String(v).toUpperCase().replace(/\s+/g, "") || fallback; }
  function parseSkill(w) { const raw = w && (w.skill != null ? w.skill : (w.kind === "melee" ? w.WS : w.BS)); return parseNum(raw, 4); }
  function parseRange(w) { if (!w) return 0; if (w.rng != null) return parseNum(w.rng, 0); const r = String(w.range || ""); if (/melee/i.test(r)) return 0; return parseNum(r, 0); }
  function normalizeWeapon(w) {
    if (!w) return null;
    return { name: w.name, kind: w.kind, A: parseAorD(w.A, 1), skill: parseSkill(w), S: parseNum(w.S, 4), AP: parseNum(w.AP, 0), D: parseAorD(w.D, 1), rng: parseRange(w), tags: (w.tags || []).slice() };
  }
  function firstWeapon(sheet, kind) { return ((sheet && sheet.weapons) || []).find(w => w.kind === kind) || null; }
  function wepHasTag(w, tag) { const want = String(tag || "").toUpperCase().replace(/\s+/g, "-"); return ((w && w.tags) || []).some(t => String(t).toUpperCase().replace(/\s+/g, "-") === want); }
  function isCloseQuarters(w) { return wepHasTag(w, "CLOSE-QUARTERS") || wepHasTag(w, "PISTOL"); }
  function isSidearm(w) { return !!(w && w.kind === "ranged" && (isCloseQuarters(w) || /pistol/i.test(w.name || ""))); }
  function defaultGear(sheet, count) { const n = Math.max(1, count || 1); return ((sheet && sheet.weapons) || []).map(w => ({ name: w.name, count: n })); }
  function weaponsForIndex(sheet, gear, index) {
    const names = {};
    (gear || []).forEach(g => { if ((g.count || 0) > index) names[g.name] = true; });
    const weps = ((sheet && sheet.weapons) || []).filter(w => !gear || !gear.length || names[w.name]);
    return weps.length ? weps : ((sheet && sheet.weapons) || []).slice(0, 2);
  }
  function profileForIndex(sheet, index) {
    const list = (sheet && sheet.profiles) || [];
    if (!list.length) return { name: sheet.name, W: sheet.W };
    if (index === 0 && list[0]) return list[0];
    return list[1] || list[0] || { name: sheet.name, W: sheet.W };
  }
  function sizeById(id) { return BATTLE_SIZES.find(s => s.id === id) || BATTLE_SIZES[1]; }
  function parseTier(t) { return String(t || "unit"); }
  function bandFor(sheet, count, copyIndex) {
    const bands = (sheet && sheet.ptsBands) || [];
    const copy = copyIndex || 1;
    const want = [];
    bands.forEach(b => {
      const tier = parseTier(b.tier);
      if (tier.indexOf("3rd") >= 0 && copy < 3) return;
      if ((tier.indexOf("1st") >= 0 || tier.indexOf("2nd") >= 0) && copy >= 3) return;
      if (tier.indexOf("4th") >= 0 && copy < 4) return;
      want.push(b);
    });
    const pool = want.length ? want : bands;
    let hit = pool[0];
    pool.forEach(b => { if (b.count <= count) hit = b; });
    return hit || null;
  }
  function ptsForCount(sheet, count, copyIndex) {
    if (!sheet) return { pts: null, source: "review", unknown: true, copyIndex: copyIndex || 1, tier: "unit", count };
    const band = bandFor(sheet, count, copyIndex);
    if (band && band.pts != null) return { pts: band.pts, source: sheet.ptsSource || "mfm", unknown: sheet.ptsSource === "review", copyIndex, tier: band.tier || "unit", count };
    if (sheet.pts != null) return { pts: sheet.pts, source: sheet.ptsSource || "mfm", unknown: sheet.ptsSource === "review", copyIndex, tier: "unit", count };
    return { pts: null, source: "review", unknown: true, copyIndex: copyIndex || 1, tier: "unit", count };
  }
  function nextCopyIndex(list, sheetKey) { return ((list && list.units) || []).filter(u => u.sheetKey === sheetKey).length + 1; }
  function repriceList(list) {
    const seen = {};
    ((list && list.units) || []).forEach(u => {
      const sid = u.sheetKey || u.sheetId || u.name;
      seen[sid] = (seen[sid] || 0) + 1;
      u.copyIndex = seen[sid];
      const sheet = live.sheets[u.sheetKey] || live.sheets[u.sheetId] || null;
      if (!sheet) return;
      const quote = ptsForCount(sheet, u.count || 1, u.copyIndex);
      if (!quote.unknown && quote.pts != null) {
        u.pts = quote.pts; u.ptsTier = quote.tier;
        if (u.ptsSource === "review") u.ptsSource = sheet.ptsSource || "mfm";
      } else u.ptsTier = quote.tier || "";
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
    ((list && list.enhancements) || []).forEach(e => { pts += Number(e.pts) || 0; });
    return { pts, unknown };
  }
  function formatPts(n, unknown) {
    if (unknown) return (n ? Number(n).toLocaleString() + " + ?" : "?");
    if (n == null) return "?";
    return Number(n).toLocaleString() + " pts";
  }
  function detachmentOf(id) { return DETACHMENTS_DEFAULT[id] || null; }
  function detachmentsForFaction(faction) {
    return Object.keys(DETACHMENTS_DEFAULT).map(k => DETACHMENTS_DEFAULT[k]).filter(d => !faction || d.faction === faction);
  }
  function enhancementOf(id) { return ENHANCEMENTS_DEFAULT[id] || null; }
  function enhancementsForList(list) {
    const fac = (list && list.faction) || "";
    const dets = (list && list.detachments) || [];
    return Object.keys(ENHANCEMENTS_DEFAULT).map(k => ENHANCEMENTS_DEFAULT[k]).filter(e => {
      if (fac && e.faction && e.faction !== fac) return false;
      if (e.detIds && e.detIds.length && !e.detIds.some(id => dets.indexOf(id) >= 0)) return false;
      return true;
    });
  }
  function sheetChapter(sheet) {
    const kws = ((sheet && sheet.factionKeywords) || []).map(k => String(k).toUpperCase());
    for (let i = 0; i < CHAPTER_KWS.length; i++) if (kws.indexOf(CHAPTER_KWS[i]) >= 0) return CHAPTER_KWS[i];
    return "";
  }
  function chapterLockForList(list) {
    const dets = (list && list.detachments) || [];
    for (let i = 0; i < dets.length; i++) {
      const d = detachmentOf(dets[i]);
      if (d && d.chapter) return String(d.chapter).toUpperCase();
    }
    return "";
  }
  function chapterClash(list) {
    const lock = chapterLockForList(list);
    if (!lock) return null;
    const bad = [];
    ((list && list.units) || []).forEach(u => {
      const sheet = live.sheets[u.sheetKey] || live.sheets[u.sheetId];
      const ch = sheetChapter(sheet);
      if (ch && ch !== lock) bad.push((u.name || "unit") + " (" + ch + ")");
    });
    return bad.length ? { lock, bad } : null;
  }
  function sheetKeywords(sheet) { return ((sheet && sheet.keywords) || []).map(k => String(k).toUpperCase()); }
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
    dets.forEach(d => { (d.uniqueTags || []).forEach(t => { if (tags.indexOf(t) >= 0) uniqueClash = true; else tags.push(t); }); });
    const counts = {};
    (list.units || []).forEach(u => {
      const sid = u.sheetId || u.sheetKey || u.name;
      counts[sid] = counts[sid] || { name: u.name, n: 0, sheet: live.sheets[u.sheetKey] };
      counts[sid].n += 1;
    });
    const copies = Object.keys(counts).map(sid => {
      const row = counts[sid];
      return { name: row.name, n: row.n, cap: copyCapForSheet(row.sheet, size), over: row.n > copyCapForSheet(row.sheet, size) };
    });
    const enh = ((list.enhancements || []).length) || Number(list.enhancementCount) || 0;
    const clash = chapterClash(list);
    const overPts = !tot.unknown && tot.pts > size.pts;
    const overDp = dp > size.dp;
    const overEnh = enh > size.enhancements;
    const overCopies = copies.some(c => c.over);
    return {
      size, pts: tot.pts, unknown: tot.unknown, overPts, dp, dpBudget: size.dp, overDp,
      enh, enhCap: size.enhancements, overEnh, copies, overCopies, uniqueClash,
      chapterLock: clash && clash.lock, chapterBad: clash && clash.bad,
      legal: !overPts && !tot.unknown && !overDp && !overEnh && !overCopies && !uniqueClash && !clash
    };
  }

  const live = { lib: currentLib(), sheets: currentSheets() };
  window.PTSheetsPack = function (id, pack) {
    pack = pack || {};
    PACKS[id] = pack;
    Object.assign(ABILITY_LIB, pack.lib || {});
    Object.assign(DATASHEETS_DEFAULT, pack.sheets || {});
    (pack.detachments || []).forEach(d => { if (d && d.id) DETACHMENTS_DEFAULT[d.id] = Object.assign({ faction: pack.faction || "" }, d); });
    (pack.enhancements || []).forEach(e => { if (e && e.id) ENHANCEMENTS_DEFAULT[e.id] = Object.assign({ faction: pack.faction || "" }, e); });
    if (window.PTSheets && window.PTSheets.reload) window.PTSheets.reload();
  };
  window.PTSheets = {
    STORE, TYPES: ["Infantry","Character","Vehicle","Monster","Swarm","Mounted"], EDITIONS: ["11th"], PACKS,
    defaults: { lib: ABILITY_LIB, sheets: DATASHEETS_DEFAULT },
    get ABILITY_LIB() { return live.lib; },
    get DATASHEETS() { return live.sheets; },
    reload() { live.lib = currentLib(); live.sheets = currentSheets(); return live; },
    save(lib, sheets) { saveAll(lib || live.lib, sheets || live.sheets); this.reload(); },
    reset() { localStorage.removeItem(STORE); this.reload(); },
    sheetOf(key) { return live.sheets[key] || null; },
    firstWeapon, abilitiesOf, fnpOf, slug, addAbility,
    ARMY_STORE, MFM_HUB, BATTLE_SIZES, lookupMfm, applyMfmProposal, mfmCatalogDiff,
    isDemoSheet, isPtsOnly, isFanSheet, mfmSeed,
    loadArmy, saveArmy, emptyArmy, loadArmyStore, saveArmyStore, listById, activeList, setActiveList, addList, deleteList,
    LIST_KIND, LISTS_KIND, exportList, exportAllLists, importLists,
    ptsForCount, parseTier, bandFor, nextCopyIndex, repriceList, listTotal, sizeById, formatPts,
    detachmentOf, detachmentsForFaction, enhancementOf, enhancementsForList, sheetChapter, chapterLockForList, chapterClash, validateList,
    defaultGear, weaponsForIndex, profileForIndex, normalizeWeapon, wepHasTag, isCloseQuarters, isSidearm
  };
})();
