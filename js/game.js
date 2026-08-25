"use strict";

(function () {
const Conex = (() => {
  const normText = (t) => String(t || "")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  function fnv(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function seededShuffle(arr, rnd) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      const tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  function dayKey(d) {
    const p = (n) => String(n).padStart(2, "0");
    return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate());
  }

  function shiftDay(key, delta) {
    const parts = String(key).split("-").map(Number);
    const dt = new Date(parts[0], parts[1] - 1, parts[2] + delta);
    return dayKey(dt);
  }

  function shortTitle(q) {
    const cat = String(q.category || "").trim();
    if (cat) return cat;
    const full = String(q.text || "").trim().replace(/\s+/g, " ");
    const words = full.split(" ").slice(0, 5).join(" ");
    return words.length < full.length ? words + "…" : words;
  }

  function buildPool(questionnaires) {
    const groups = [];
    const seen = new Set();
    const addGroup = (q) => {
      const menu = Array.isArray(q.dropdown) ? q.dropdown : [];
      const words = [];
      const local = new Set();
      for (let i = 0; i < menu.length && words.length < 4; i++) {
        const t = String(menu[i] || "").trim();
        if (!t) continue;
        const n = normText(t);
        if (!n || seen.has(n) || local.has(n)) continue;
        local.add(n);
        words.push({ t, n });
      }
      if (words.length === 4) {
        local.forEach((n) => seen.add(n));
        groups.push({ title: shortTitle(q), words });
      }
    };
    const all = [];
    (questionnaires || []).forEach((qq) => {
      (Array.isArray(qq && qq.questions) ? qq.questions : []).forEach((q) => {
        if (q && q.type === "dropdown" && Array.isArray(q.dropdown) && q.dropdown.length >= 4) all.push(q);
      });
    });
    all.filter((q) => q.slotLabels).forEach(addGroup);
    all.filter((q) => !q.slotLabels).forEach(addGroup);
    return groups;
  }

  function makeDaily(pool, dateKey) {
    const avail = (pool || []).filter((g) => g && g.words && g.words.length === 4);
    if (avail.length < 4) return null;
    const seed = fnv("conex|" + dateKey);
    const rnd = mulberry32(seed);
    const groups = seededShuffle(avail, rnd).slice(0, 4);
    const tiles = seededShuffle(
      groups.flatMap((g, gi) => g.words.map((w) => ({ t: w.t, n: w.n, g: gi }))),
      mulberry32(seed ^ 0x9e3779b9)
    );
    return { day: dateKey, groups: groups.map((g) => g.title), tiles };
  }

  function newGame(puzzle) {
    if (!puzzle) return null;
    return { puzzle, sel: [], solved: [], lives: 4, wrong: 0, done: false, won: false, history: [] };
  }

  function toggleSel(st, idx) {
    if (!st || st.done) return false;
    const at = st.sel.indexOf(idx);
    if (at >= 0) st.sel.splice(at, 1);
    else if (st.sel.length < 4) st.sel.push(idx);
    return true;
  }

  function clearSel(st) {
    if (st) st.sel = [];
  }

  function shuffleBoard(st, rnd) {
    if (!st || st.done) return false;
    const alive = st.puzzle.tiles
      .map((t, i) => ({ t, i }))
      .filter((x) => !st.solved.some((s) => s.idxs.indexOf(x.i) >= 0));
    const order = seededShuffle(alive.map((x) => x.i), rnd || Math.random);
    const map = {};
    alive.forEach((x, pos) => { map[x.i] = order[pos]; });
    const tiles = st.puzzle.tiles.slice();
    alive.forEach((x) => { tiles[map[x.i]] = st.puzzle.tiles[x.i]; });
    st.puzzle.tiles = tiles;
    st.sel = [];
    return true;
  }

  function submitSel(st) {
    if (!st || st.done || st.sel.length !== 4) return null;
    const gids = st.sel.map((i) => st.puzzle.tiles[i].g);
    const distinct = [...new Set(gids)];
    if (distinct.length === 1) {
      st.history.push(st.sel.slice());
      st.solved.push({ g: distinct[0], idxs: st.sel.slice().sort((a, b) => a - b) });
      st.sel = [];
      if (st.solved.length === 4) { st.done = true; st.won = true; }
      return "ok";
    }
    const counts = {};
    gids.forEach((g) => { counts[g] = (counts[g] || 0) + 1; });
    const close = Object.keys(counts).some((k) => counts[k] === 3);
    st.history.push(st.sel.slice());
    st.wrong++;
    st.lives--;
    st.sel = [];
    if (st.lives <= 0) { st.done = true; st.won = false; }
    return close ? "close" : "bad";
  }

  function applyResult(stats, won, mistakes, today) {
    const s = Object.assign({}, stats && typeof stats === "object" ? stats : {});
    s.played = (s.played || 0) + 1;
    s.lastPlayedDay = today;
    if (!won) {
      s.streak = 0;
      s.maxStreak = s.maxStreak || 0;
      s.wins = s.wins || 0;
      if (!Array.isArray(s.dist)) s.dist = [0, 0, 0, 0, 0];
      return s;
    }
    s.wins = (s.wins || 0) + 1;
    const dist = Array.isArray(s.dist) ? s.dist.slice(0, 5) : [];
    while (dist.length < 5) dist.push(0);
    const mi = Math.max(0, Math.min(4, mistakes | 0));
    dist[mi] = (dist[mi] || 0) + 1;
    s.dist = dist;
    s.streak = s.lastWinDay === shiftDay(today, -1) ? (s.streak || 0) + 1 : 1;
    s.maxStreak = Math.max(s.maxStreak || 0, s.streak);
    s.lastWinDay = today;
    return s;
  }

  const EMOJI = ["\u{1F7E8}", "\u{1F7E9}", "\u{1F7E6}", "\u{1F7EA}"];

  function shareGrid(st) {
    if (!st) return "";
    return st.history.map((row) => {
      const gids = row.map((i) => st.puzzle.tiles[i].g);
      const distinct = [...new Set(gids)];
      return gids.map((g) => (distinct.length === 1 ? EMOJI[g] : "\u{1F7E5}")).join("");
    }).join("\n");
  }

  return {
    normText, fnv, mulberry32, seededShuffle, dayKey, shiftDay,
    buildPool, makeDaily, newGame, toggleSel, clearSel, shuffleBoard,
    submitSel, applyResult, shareGrid
  };
})();

if (typeof window !== "undefined") window.Conex = Conex;
if (typeof module !== "undefined" && module.exports) module.exports = Conex;
})();
