"use strict";

(function () {
const QuizStore = (() => {
  const mem = {};
  const store = typeof localStorage !== "undefined" ? localStorage : {
    getItem: (k) => (k in mem ? mem[k] : null),
    setItem: (k, v) => { mem[k] = String(v); },
    removeItem: (k) => { delete mem[k]; }
  };
  const PREFIX = "quiz.progress.";

  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0).toString(16).padStart(8, "0");
  }

  const get = (k, def) => {
    try {
      const v = store.getItem(k);
      return v ? JSON.parse(v) : def;
    } catch (e) { return def; }
  };

  const EXCLUDE_SYNC = ["quiz.theme", "quiz.pomo", "quiz.keytimes"];
  const isSyncKey = (k) =>
    String(k).indexOf("quiz.") === 0 &&
    EXCLUDE_SYNC.indexOf(k) < 0 &&
    String(k).indexOf("quiz.cloud.") !== 0;

  let keytimes = get("quiz.keytimes", {});
  const known = new Set();
  const listeners = [];
  const emit = () => listeners.forEach((fn) => { try { fn(); } catch (e) {} });

  function touchKey(k) {
    keytimes[k] = Date.now();
    try { store.setItem("quiz.keytimes", JSON.stringify(keytimes)); } catch (e) {}
  }

  const set = (k, v) => {
    try {
      store.setItem(k, JSON.stringify(v));
      if (isSyncKey(k)) { known.add(k); touchKey(k); emit(); }
    } catch (e) { }
  };
  const remove = (k) => {
    try { store.removeItem(k); } catch (e) { }
    if (isSyncKey(k)) { known.add(k); touchKey(k); emit(); }
  };

  function loadProgress(h) { return get(PREFIX + h, {}); }
  function saveProgress(h, p) { set(PREFIX + h, p); }
  function resetProgress(h) { remove(PREFIX + h); }

  function loadSettings() { return get("quiz.settings", {}); }
  function saveSettings(s) { set("quiz.settings", s); }

  function loadDraft(h) { return get("quiz.draft." + h, null); }
  function saveDraft(h, d) { set("quiz.draft." + h, d); }
  function clearDraft(h) { remove("quiz.draft." + h); }

  function loadLastCsv() { return get("quiz.csv.loaded", null); }
  function saveLastCsv(v) { set("quiz.csv.loaded", v); }

  function loadExamDates(h) { return get("quiz.examdates." + h, null); }
  function saveExamDates(h, d) { set("quiz.examdates." + h, d); }

  function loadCourses() { return get("quiz.courses", []); }
  function saveCourses(c) { set("quiz.courses", Array.isArray(c) ? c : []); }

  function loadCourseExams() { return get("quiz.courseexams", {}); }
  function saveCourseExams(m) { set("quiz.courseexams", m && typeof m === "object" ? m : {}); }

  function loadCourseExamHoras() { return get("quiz.courseexamhoras", {}); }
  function saveCourseExamHoras(m) { set("quiz.courseexamhoras", m && typeof m === "object" ? m : {}); }

  function loadTasks() { return get("quiz.tasks", []); }
  function saveTasks(t) { set("quiz.tasks", Array.isArray(t) ? t : []); }

  function loadGameStats() { return get("quiz.game.connections", {}); }
  function saveGameStats(s) { set("quiz.game.connections", s && typeof s === "object" ? s : {}); }

  function snapshot() {
    const kv = {}, times = {};
    try {
      for (let i = 0; i < store.length; i++) {
        const k = store.key(i);
        if (isSyncKey(k)) known.add(k);
      }
    } catch (e) {}
    known.forEach((k) => {
      const v = get(k, undefined);
      if (v !== undefined) { kv[k] = v; times[k] = keytimes[k] || 0; }
    });
    return { kv, times };
  }

  function setQuiet(k, v) {
    try {
      store.setItem(k, JSON.stringify(v));
      if (isSyncKey(k)) known.add(k);
    } catch (e) {}
  }

  function restore(kv, times) {
    Object.keys(kv || {}).forEach((k) => {
      known.add(k);
      setQuiet(k, kv[k]);
      if (times && typeof times[k] === "number") keytimes[k] = times[k];
    });
    emit();
  }

  function clearAll() {
    const toRemove = Array.from(known).concat(
      (() => {
        const ks = [];
        try {
          for (let i = 0; i < store.length; i++) {
            const k = store.key(i);
            if (String(k).indexOf("quiz.") === 0 && String(k).indexOf("quiz.cloud.") !== 0) ks.push(k);
          }
        } catch (e) {}
        return ks;
      })()
    );
    toRemove.forEach((k) => {
      try { store.removeItem(k); } catch (e) {}
      known.delete(k);
      delete keytimes[k];
    });
    try { store.setItem("quiz.keytimes", "{}"); } catch (e) {}
    keytimes = {};
    emit();
  }

  function onChange(fn) {
    if (typeof fn === "function") listeners.push(fn);
  }

  return {
    hash, loadProgress, saveProgress, resetProgress,
    loadSettings, saveSettings, loadDraft, saveDraft, clearDraft,
    loadLastCsv, saveLastCsv, loadExamDates, saveExamDates,
    loadCourses, saveCourses, loadCourseExams, saveCourseExams,
    loadCourseExamHoras, saveCourseExamHoras,
    loadTasks, saveTasks,
    loadGameStats, saveGameStats,
    snapshot, restore, clearAll, onChange
  };
})();

if (typeof window !== "undefined") window.QuizStore = QuizStore;
if (typeof module !== "undefined" && module.exports) module.exports = QuizStore;
})();