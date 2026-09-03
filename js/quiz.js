"use strict";

(function () {
const hasWindow = typeof window !== "undefined";
const CSV = hasWindow ? window.CSV : require("./csv.js");
const Sched = hasWindow ? window.Scheduler : require("./scheduler.js");
const Store = hasWindow ? window.QuizStore : require("./storage.js");

const Quiz = (() => {
  const S = {
    questionnaires: [], // array of {hash, name, questions}
    currentHash: "",
    progress: {},
    settings: { size: 20, points: 1, cat: "", mode: "today", timedMinutes: 40, timedSize: 50 },
    examIndex: 0,
    hash: "",
    name: "",
    items: [],
    answers: {},
    results: null,
    sourceText: "",
    warnings: [],
    materiaCut: ""
  };

  function scoreQuestion(q, checkedOrig) {
    const c = q.correct.length;
    const unit = 1 / c;
    let s = 0;
    for (const i of checkedOrig) s += q.correct.indexOf(i) >= 0 ? unit : -unit;
    return Math.round(s * 100000) / 100000;
  }

  function scoreFill(q, text) {
    const t = CSV.normText(text);
    if (!t) return 0;
    return q.correct.some((c) => CSV.normText(c) === t) ? 1 : -1;
  }

  function scoreDropdown(q, chosen) {
    const unit = 1 / q.slots.length;
    let s = 0;
    for (let i = 0; i < q.slots.length; i++) {
      const c = chosen == null ? null : chosen[i];
      if (c === q.correctSlot[i]) s += unit;
      else if (c != null) s -= unit;
    }
    return Math.round(s * 100000) / 100000;
  }

  function scoreOrder(q, userOrder) {
    if (!Array.isArray(userOrder) || !Array.isArray(q.correct) || userOrder.length !== q.correct.length) return 0;
    const n = q.correct.length;
    if (!n) return 0;
    const unit = 1 / n;
    let s = 0;
    for (let i = 0; i < n; i++) {
      if (userOrder[i] === q.correct[i]) s += unit;
    }
    return Math.round(s * 100000) / 100000;
  }

  function scoreImagePuzzle(q, placements) {
    if (!q.slots || !q.slots.length) return 0;
    const unit = 1 / q.slots.length;
    let s = 0;
    for (const slot of q.slots) {
      if (placements && placements[slot.id] === slot.id) {
        s += unit;
      } else if (placements && placements[slot.id]) {
        s -= unit;
      }
    }
    return Math.round(s * 100000) / 100000;
  }

  function setPuzzleSlot(qid, slotId, pieceId) {
    if (!S.answers[qid] || typeof S.answers[qid] !== "object") {
      S.answers[qid] = {};
    }
    Object.keys(S.answers[qid]).forEach((s) => {
      if (S.answers[qid][s] === pieceId) delete S.answers[qid][s];
    });
    if (pieceId) {
      S.answers[qid][slotId] = pieceId;
    } else {
      delete S.answers[qid][slotId];
    }
    saveDraft();
  }

  function loadSettings() {
    const saved = Store.loadSettings();
    const size = parseInt(saved.sessionSize, 10);
    S.settings.size = size === 0 ? 0 : (isNaN(size) ? 20 : Math.min(1000, Math.max(1, size)));
    const pts = parseFloat(saved.points);
    S.settings.points = isNaN(pts) ? 1 : Math.max(0.05, pts);
    const modes = ["today", "random", "new", "failed", "all", "timed"];
    S.settings.mode = modes.includes(saved.mode) ? saved.mode : "today";
    S.settings.cat = typeof saved.cat === "string" ? saved.cat : "";
    const tm = parseInt(saved.timedMinutes, 10);
    S.settings.timedMinutes = isNaN(tm) || tm < 1 ? 40 : Math.min(300, tm);
    const ts = parseInt(saved.timedSize, 10);
    S.settings.timedSize = isNaN(ts) ? 50 : Math.min(1000, Math.max(1, ts));
  }

  const validDate = (v) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(new Date(v + "T00:00:00").getTime()) ? v : "";

  // Fecha límite efectiva de un cuestionario: la más temprana entre las
  // materias que lo contienen. Devuelve "" si ninguna materia tiene fecha.
  function materiaCutoffFor(hash) {
    let cut = "";
    try {
      const courses = Store.loadCourses() || [];
      const exams = Store.loadCourseExams() || {};
      for (const c of courses) {
        if (!c || !Array.isArray(c.quizzes) || c.quizzes.indexOf(hash) === -1) continue;
        const d = validDate(exams[c.id]);
        if (d && (!cut || d < cut)) cut = d;
      }
    } catch (e) {}
    return cut;
  }

  function refreshMateriaCut() {
    S.materiaCut = materiaCutoffFor(S.currentHash || S.hash);
  }

  function loadExamDates() {
    const hash = S.currentHash || S.hash;
    const saved = Store.loadExamDates(hash);
    const ex = saved && typeof saved === "object" ? saved : {};
    S.examDates = {
      date: validDate(ex.date),
      cats: (ex.cats && typeof ex.cats === "object") ? ex.cats : {}
    };
    for (const k of Object.keys(S.examDates.cats)) {
      if (!validDate(S.examDates.cats[k])) delete S.examDates.cats[k];
    }
    const old = validDate(String((Store.loadSettings() || {}).examDate || ""));
    if (old && !S.examDates.date) {
      S.examDates.date = old;
      saveExamDates();
      Store.saveSettings({
        sessionSize: S.settings.size,
        points: S.settings.points,
        mode: S.settings.mode
      });
    }
    refreshMateriaCut();
  }

  function saveExamDates() {
    const hash = S.currentHash || S.hash;
    Store.saveExamDates(hash, S.examDates);
  }

  const quizDate = () => S.examDates.date || "";
  const catDate = (cat) => {
    const c = S.examDates.cats[cat];
    if (c) return c;
    if (S.materiaCut) return S.materiaCut;
    return quizDate();
  };

  function loadCsv(text, name) {
    const res = CSV.parseQuestions(text);
    if (!res.ok) return res;
    const hash = Store.hash(text);
    // Check if this CSV is already loaded (by hash)
    const existing = S.questionnaires.find(q => q.hash === hash);
    if (existing) {
      // Already loaded, just set as current
      S.currentHash = hash;
    } else {
      // New CSV, add to list
      S.questionnaires.push({
        hash,
        name: name || "Cuestionario",
        questions: res.questions
      });
      S.currentHash = hash;
    }
    // Find the current questionnaire's data
    const current = S.questionnaires.find(q => q.hash === S.currentHash);
    if (current) {
      S.questions = current.questions;
      S.name = current.name;
    }
    S.warnings = res.warnings || [];
    S.progress = Store.loadProgress(S.currentHash);
    S.items = [];
    S.answers = {};
    S.results = null;
    loadSettings();
    loadExamDates();
    Store.saveLastCsv({ text, name, hash });
    return res;
  }

  function tryLoadSaved() {
    const saved = Store.loadLastCsv();
    if (!saved || !String(saved.text || "").trim()) return false;
    if (!CSV.parseQuestions(saved.text).ok) return false;
    loadCsv(saved.text, saved.name || "Cuestionario guardado");
    // Also load its exam dates if stored
    const current = S.questionnaires.find(q => q.hash === S.currentHash);
    if (current && saved.hash) {
      const savedDates = Store.loadExamDates(saved.hash);
      if (savedDates && typeof savedDates === "object") {
        S.examDates = {
          date: savedDates.date || S.examDates.date,
          cats: { ...(S.examDates.cats || {}), ...savedDates.cats }
        };
      }
    }
    return true;
  }

  function persistSettings() {
    Store.saveSettings({
      sessionSize: S.settings.size,
      points: S.settings.points,
      mode: S.settings.mode,
      cat: S.settings.cat,
      timedMinutes: S.settings.timedMinutes,
      timedSize: S.settings.timedSize
    });
  }

  function setSize(n) {
    const v = parseInt(n, 10);
    S.settings.size = v === 0 ? 0 : (isNaN(v) ? 20 : Math.min(1000, Math.max(1, v)));
    persistSettings();
  }

  function setTimedSize(n) {
    const v = parseInt(n, 10);
    S.settings.timedSize = v === 0 ? 0 : (isNaN(v) ? 50 : Math.min(1000, Math.max(1, v)));
    persistSettings();
  }

  function setMode(m) {
    S.settings.mode = ["today", "random", "new", "failed", "all", "timed"].includes(m) ? m : "today";
    persistSettings();
  }

  function setTimedMinutes(m) {
    const v = parseInt(m, 10);
    S.settings.timedMinutes = isNaN(v) || v < 1 ? 40 : Math.min(300, v);
    persistSettings();
  }

  function setExamIndex(idx) {
    const max = Math.max(0, S.items.length - 1);
    const i = parseInt(idx, 10);
    S.examIndex = isNaN(i) ? 0 : Math.max(0, Math.min(max, i));
  }

  function setCat(v) {
    S.settings.cat = String(v || "").trim();
    persistSettings();
  }

  function setExamDate(iso) {
    const hash = S.currentHash || S.hash;
    S.examDates.date = validDate(iso);
    saveExamDates(hash);
  }

  function setCatExamDate(cat, iso) {
    const hash = S.currentHash || S.hash;
    const c = String(cat || "").trim() || "Sin categoría";
    const v = validDate(iso);
    if (v) S.examDates.cats[c] = v;
    else delete S.examDates.cats[c];
    saveExamDates(hash);
  }

  function setPoints(p) {
    S.settings.points = Math.max(0.05, parseFloat(p) || 1);
    persistSettings();
  }

  function buildFrom(fn) {
    S.items = fn();
    S.answers = {};
    S.results = null;
    S.examIndex = 0;
    saveDraft();
  }

  function newSession() {
    let questions = [];
    if (S.currentHash === "all") {
      S.questionnaires.forEach(q => { questions = questions.concat(q.questions); });
    } else {
      const current = S.questionnaires.find(q => q.hash === S.currentHash);
      if (current) questions = current.questions;
    }
    const isTimed = S.settings.mode === "timed";
    const want = !isTimed ? String(S.settings.cat || "").trim() : "";
    if (want) {
      questions = questions.filter((q) => (q.category || "").trim() === want);
    }
    const sessionSize = isTimed ? (S.settings.timedSize || 50) : S.settings.size;
    buildFrom(() => Sched.buildByMode(questions, S.progress, S.settings.mode, sessionSize, undefined, S.settings.points));
  }

  function repeatSession(lastIds) {
    const ids = (lastIds && lastIds.length ? lastIds : S.items.map((it) => it.q.id));
    buildFrom(() => Sched.shuffle(ids).map((qid) => Sched.makeItem(S.questions[qid])));
  }

  function failedSession() {
    buildFrom(() => Sched.buildFailedSession(S.questions, S.progress, S.settings.size, S.settings.points));
  }

  function toggle(qid, dispIdx) {
    S.answers[qid] = S.answers[qid] || [];
    const i = S.answers[qid].indexOf(dispIdx);
    if (i >= 0) S.answers[qid].splice(i, 1);
    else S.answers[qid].push(dispIdx);
    saveDraft();
  }

  function setSlot(qid, slot, optIdx) {
    const a = S.answers[qid] = S.answers[qid] || {};
    if (optIdx == null) delete a[slot];
    else a[slot] = optIdx;
    saveDraft();
  }

  function setFill(qid, text) {
    const v = String(text || "").trim();
    if (v) S.answers[qid] = v;
    else delete S.answers[qid];
    saveDraft();
  }

  function setOrder(qid, orderArray) {
    if (Array.isArray(orderArray)) {
      S.answers[qid] = orderArray.slice();
      saveDraft();
    }
  }

  function moveOrderItem(qid, fromPos, toPos) {
    const it = S.items.find((item) => item.q.id === qid);
    if (!it || !it.q || it.q.type !== "order") return null;
    const cur = (Array.isArray(S.answers[qid]) && S.answers[qid].length === it.q.options.length)
      ? S.answers[qid].slice()
      : (it.initialOrder ? it.initialOrder.slice() : it.q.options.map((_, i) => i));
    if (fromPos < 0 || fromPos >= cur.length || toPos < 0 || toPos >= cur.length) return cur;
    const item = cur.splice(fromPos, 1)[0];
    cur.splice(toPos, 0, item);
    S.answers[qid] = cur;
    saveDraft();
    return cur;
  }

  const isAnswered = (qid) => {
    const a = S.answers[qid];
    if (!a) return false;
    if (typeof a === "string") return a.length > 0;
    return Array.isArray(a) ? a.length > 0 : Object.keys(a).length > 0;
  };
  const answeredCount = () => S.items.filter((it) => isAnswered(it.q.id)).length;

  function submit() {
    const pts = S.settings.points;
    const marked = { correct: [], partial: [], failed: [] };
    let total = 0;
    const cap = Math.max(4, Math.round(S.questions.length / 30));
    const schedCtx = { progress: S.progress };
    const detail = S.items.map((it) => {
      const q = it.q;
      const card = S.progress[q.id] || Sched.newCard();
      const qCtx = Object.assign({ qid: q.id, examDate: catDate(q.category), cap }, schedCtx);
      if (q.type === "dropdown") {
        const chosen = S.answers[q.id] || {};
        const score = scoreDropdown(q, chosen);
        const full = score + 1e-9 >= pts;
        S.progress[q.id] = Sched.update(card, score, full, qCtx);
        total += score;
        const state = full ? "correct" : (score > 1e-9 ? "partial" : "failed");
        marked[state].push(q.id);
        return { q, optOrder: [], slotChosen: chosen, score, state };
      }
      if (q.type === "fill") {
        const answer = typeof S.answers[q.id] === "string" ? S.answers[q.id] : "";
        const score = scoreFill(q, answer);
        const full = score + 1e-9 >= pts;
        S.progress[q.id] = Sched.update(card, score, full, qCtx);
        total += score;
        const state = full ? "correct" : (score > 1e-9 ? "partial" : "failed");
        marked[state].push(q.id);
        return { q, optOrder: [], fillAnswer: answer, score, state };
      }
      if (q.type === "order") {
        const userOrder = (Array.isArray(S.answers[q.id]) && S.answers[q.id].length === q.correct.length)
          ? S.answers[q.id]
          : (it.initialOrder || q.options.map((_, i) => i));
        const rawScore = scoreOrder(q, userOrder);
        const score = Math.round(rawScore * pts * 100000) / 100000;
        const full = score + 1e-9 >= pts;
        S.progress[q.id] = Sched.update(card, score, full, qCtx);
        total += score;
        const state = full ? "correct" : (score > 1e-9 ? "partial" : "failed");
        marked[state].push(q.id);
        return { q, optOrder: [], userOrder, score, state };
      }
      if (q.type === "image_puzzle") {
        const placements = S.answers[q.id] || {};
        const rawScore = scoreImagePuzzle(q, placements);
        const score = Math.round(rawScore * pts * 100000) / 100000;
        const full = score + 1e-9 >= pts;
        S.progress[q.id] = Sched.update(card, score, full, qCtx);
        total += score;
        const state = full ? "correct" : (score > 1e-9 ? "partial" : "failed");
        marked[state].push(q.id);
        return { q, optOrder: [], placements, score, state };
      }

      const dispChecked = (S.answers[q.id] || []).slice().sort((a, b) => a - b);
      const origChecked = dispChecked.map((d) => it.optOrder[d]);
      const score = scoreQuestion(q, origChecked);
      const full = score + 1e-9 >= pts;
      S.progress[q.id] = Sched.update(card, score, full, qCtx);
      total += score;
      const state = full ? "correct" : (score > 1e-9 ? "partial" : "failed");
      marked[state].push(q.id);
      return { q, optOrder: it.optOrder, dispChecked, origChecked, score, state };
    });
    S.results = { detail, total, max: S.items.length * pts, pts, marked };
    const hash = S.currentHash || S.hash;
    Store.saveProgress(hash, S.progress);
    Store.clearDraft(hash);
    if (hasWindow && window.Cloud && typeof window.Cloud.flush === "function") {
      window.Cloud.flush();
    }
    return S.results;
  }

  function saveDraft() {
    const hash = S.currentHash || S.hash;
    Store.saveDraft(hash, {
      items: S.items.map((it) => ({ idx: it.q.id, order: it.optOrder, drop: it.dropOrder, initOrder: it.initialOrder })),
      answers: S.answers
    });
  }

  function tryResume() {
    const hash = S.currentHash || S.hash;
    const d = Store.loadDraft(hash);
    if (!d || !Array.isArray(d.items)) return false;
    const items = [];
    for (const m of d.items) {
      const q = S.questions[m.idx];
      if (!q) return false;
      items.push({
        q,
        optOrder: Array.isArray(m.order) && m.order.length === q.options.length ? m.order : q.options.map((_, i) => i),
        dropOrder: Array.isArray(m.drop) && q.dropdown && m.drop.length === q.dropdown.length ? m.drop : (q.dropdown && q.dropdown.length > 1 ? Sched.shuffle(q.dropdown.map((_, i) => i)) : undefined),
        initialOrder: Array.isArray(m.initOrder) && q.options && m.initOrder.length === q.options.length ? m.initOrder : (q.type === "order" ? Sched.shuffle(q.options.map((_, i) => i)) : undefined)
      });
    }
    S.items = items;
    S.answers = d.answers || {};
    S.results = null;
    return S.items.length > 0;
  }

  function resetProgress() {
    const hash = S.currentHash || S.hash;
    Store.resetProgress(hash);
    Store.clearDraft(hash);
    S.progress = {};
    S.items = [];
    S.answers = {};
    S.results = null;
  }

  function failedCount() {
    const pts = S.settings.points;
    return S.questions.filter((q) => {
      const c = S.progress[q.id];
      return c && c.last !== undefined && c.last < pts - 1e-9;
    }).length;
  }

  function todayCount() {
    const t = Sched.startOfDay();
    return S.questions.filter((q) => {
      const c = S.progress[q.id];
      return !c || !c.due || Sched.isDue(c, t);
    }).length;
  }

  function newCount() {
    return S.questions.filter((q) => !S.progress[q.id]).length;
  }

  function stats() {
    const pts = S.settings.points;
    const t = Sched.startOfDay();
    let unseen = 0, due = 0, mastered = 0, failed = 0;
    const cats = new Map();
    for (const q of S.questions) {
      const c = S.progress[q.id];
      if (c && c.reps >= 3) mastered++;
      if (c && c.fails > 0) failed++;
      if (!c || !c.due) unseen++;
      else if (Sched.isDue(c, t)) due++;
      const key = q.category || "Sin categoría";
      if (!cats.has(key)) cats.set(key, { count: 0, attempts: 0, sum: 0, failed: 0 });
      const cat = cats.get(key);
      cat.count++;
      if (c) {
        cat.attempts += c.attempts;
        cat.sum += c.sum || 0;
        cat.failed += c.fails;
      }
    }
    return { total: S.questions.length, unseen, due, mastered, failed, cats, points: pts };
  }

  function scheduledByDay() {
    const by = {};
    for (const [id, c] of Object.entries(S.progress)) {
      if (c && c.due) {
        const k = String(c.due).slice(0, 10);
        (by[k] = by[k] || []).push(parseInt(id, 10));
      }
    }
    return by;
  }

  function questionsOnDay(iso) {
    const ids = scheduledByDay()[String(iso).slice(0, 10)] || [];
    return ids.map((id) => S.questions[id]).filter(Boolean);
  }

  function selectQuestionnaire(hash) {
    if (hash === "all") {
      S.currentHash = "all";
      S.questions = [];
      S.questionnaires.forEach(q => { S.questions = S.questions.concat(q.questions); });
      S.name = "Todos los cuestionarios";
      S.progress = {};
      return true;
    }
    const q = S.questionnaires.find(x => x.hash === hash);
    if (!q) return false;
    S.currentHash = hash;
    S.questions = q.questions;
    S.name = q.name;
    S.progress = Store.loadProgress(hash);
    loadExamDates();
    return true;
  }

  function examDateFor(hash) {
    const ed = Store.loadExamDates(hash);
    return (ed && typeof ed === "object" && validDate(ed.date)) ? ed.date : "";
  }

  function setExamDateFor(hash, iso) {
    const ed = Store.loadExamDates(hash) || {};
    const cats = (ed.cats && typeof ed.cats === "object") ? ed.cats : {};
    Store.saveExamDates(hash, { date: validDate(iso), cats });
    if ((S.currentHash || S.hash) === hash) {
      S.examDates.date = validDate(iso);
      S.examDates.cats = cats;
    }
  }

  function courseExamsMap() {
    const raw = Store.loadCourseExams();
    const out = {};
    if (raw && typeof raw === "object") {
      for (const k of Object.keys(raw)) {
        const d = validDate(raw[k]);
        if (d) out[k] = d;
      }
    }
    return out;
  }

  function courseExamFor(id) {
    return courseExamsMap()[id] || "";
  }

  function courseExamsHoraMap() {
    const raw = Store.loadCourseExamHoras();
    const out = {};
    if (raw && typeof raw === "object") {
      for (const k of Object.keys(raw)) {
        const v = String(raw[k] || "").trim().slice(0, 40);
        if (v) out[k] = v;
      }
    }
    return out;
  }

  function setCourseExamHoraFor(id, hora) {
    if (!id) return;
    const map = Store.loadCourseExamHoras() || {};
    const v = String(hora || "").trim().slice(0, 40);
    if (v) map[id] = v;
    else delete map[id];
    Store.saveCourseExamHoras(map);
  }

  function setCourseExamFor(id, iso) {
    if (!id) return;
    const map = Store.loadCourseExams() || {};
    const d = validDate(iso);
    if (d) map[id] = d;
    else {
      delete map[id];
      const hm = Store.loadCourseExamHoras() || {};
      if (hm[id]) { delete hm[id]; Store.saveCourseExamHoras(hm); }
    }
    Store.saveCourseExams(map);
    refreshMateriaCut();
  }

  function statsFor(hash) {
    const q = S.questionnaires.find(x => x.hash === hash);
    if (!q) return null;
    const progress = Store.loadProgress(hash);
    const pts = S.settings.points;
    const t = Sched.startOfDay();
    let today = 0, newN = 0, mastered = 0, failed = 0, failedNow = 0, seen = 0;
    for (const qq of q.questions) {
      const c = progress[qq.id];
      if (!c || !c.due || Sched.isDue(c, t)) today++;
      if (!c) newN++;
      if (c && c.reps >= 3) mastered++;
      if (c && c.fails > 0) failed++;
      if (c && c.last !== undefined && c.last < pts - 1e-9) failedNow++;
      if (c && (c.attempts || 0) > 0) seen++;
    }
    return { hash, name: q.name, total: q.questions.length, today, newN, mastered, failed, failedNow, seen, date: examDateFor(hash) };
  }

  function draftOf(hash) {
    const d = Store.loadDraft(hash);
    return !!(d && Array.isArray(d.items) && d.items.length);
  }

  function resetProgressFor(hash) {
    Store.resetProgress(hash);
    Store.clearDraft(hash);
    if ((S.currentHash || S.hash) === hash) {
      S.progress = {};
      S.items = [];
      S.answers = {};
      S.results = null;
    }
  }

  function scheduledByDayFor(hash) {
    const progress = Store.loadProgress(hash);
    const by = {};
    for (const [id, c] of Object.entries(progress)) {
      if (c && c.due) {
        const k = String(c.due).slice(0, 10);
        (by[k] = by[k] || []).push(parseInt(id, 10));
      }
    }
    return by;
  }

  function questionsOnDayFor(hash, iso) {
    const q = S.questionnaires.find(x => x.hash === hash);
    if (!q) return [];
    const ids = scheduledByDayFor(hash)[String(iso).slice(0, 10)] || [];
    return ids.map(id => q.questions[id]).filter(Boolean);
  }

  function reloadProgress() {
    const hash = S.currentHash || S.hash;
    if (hash && hash !== "all") {
      S.progress = Store.loadProgress(hash);
    }
    loadExamDates();
  }

  if (Store && typeof Store.onChange === "function") {
    Store.onChange(() => {
      const hash = S.currentHash || S.hash;
      if (hash && hash !== "all") {
        S.progress = Store.loadProgress(hash);
      }
      refreshMateriaCut();
    });
  }

  function loadCustoms() {
    if (!Store || typeof Store.loadCustomQuestionnaires !== "function") return;
    const list = Store.loadCustomQuestionnaires();
    if (!Array.isArray(list)) return;
    list.forEach((cq) => {
      if (!cq || !cq.hash) return;
      const existing = S.questionnaires.find((x) => x.hash === cq.hash);
      if (existing) {
        (cq.questions || []).forEach((q) => {
          if (!existing.questions.some((eq) => eq.id === q.id)) {
            existing.questions.push(q);
          }
        });
      } else {
        S.questionnaires.push({
          hash: cq.hash,
          name: cq.name || "Cuestionario Visual",
          questions: cq.questions || []
        });
      }
    });
  }

  function saveImageQuestion(questionnaireHash, newQuestionnaireName, question) {
    loadCustoms();
    let target = S.questionnaires.find((q) => q.hash === questionnaireHash);
    if (!target) {
      const name = newQuestionnaireName || "Cuestionario con Imágenes";
      const hash = "custom_" + Store.hash(name + "_" + Date.now());
      target = { hash, name, questions: [] };
      S.questionnaires.push(target);
    }
    question.id = target.questions.length;
    target.questions.push(question);

    const customs = (Store.loadCustomQuestionnaires() || []).slice();
    const idx = customs.findIndex((c) => c.hash === target.hash);
    if (idx >= 0) {
      customs[idx] = target;
    } else {
      customs.push(target);
    }
    Store.saveCustomQuestionnaires(customs);
    return target;
  }

  loadCustoms();

  return {
    S, loadCsv, tryLoadSaved, newSession, repeatSession, failedSession, toggle, setSlot, setFill, setOrder, moveOrderItem,
    isAnswered, answeredCount, submit, tryResume, resetProgress, reloadProgress,
    persistSettings, setSize, setTimedSize, setPoints, setMode, setCat, setTimedMinutes, setExamIndex, setExamDate, setCatExamDate, quizDate, catDate,
    stats, failedCount, todayCount, newCount, scheduledByDay, questionsOnDay, scoreQuestion, scoreOrder, scoreImagePuzzle,
    setPuzzleSlot, loadCustoms, saveImageQuestion,
    selectQuestionnaire, examDateFor, setExamDateFor, statsFor, draftOf, resetProgressFor,
    scheduledByDayFor, questionsOnDayFor,
    materiaCutoffFor, courseExamsMap, courseExamsHoraMap, courseExamFor, setCourseExamFor, setCourseExamHoraFor
  };
})();

if (hasWindow) window.Quiz = Quiz;
if (typeof module !== "undefined" && module.exports) module.exports = Quiz;
})();