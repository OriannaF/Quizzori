"use strict";

(function () {
  const Quiz = window.Quiz;
  const S = () => Quiz.S;
  const $ = (sel) => document.querySelector(sel);
  let warningsDismissed = false;
  let currentView = "inicio";
  let returnView = "inicio";

  const HORARIOS = [
    { mat: "Análisis Matemático II", com: "K2.1", dia: 1, ini: "16:35", fin: "18:05" },
    { mat: "Análisis Matemático II", com: "K2.1", dia: 2, ini: "12:45", fin: "15:00" },
    { mat: "Probabilidad y Estadística", com: "K3.2", dia: 1, ini: "18:10", fin: "20:25" },
    { mat: "Probabilidad y Estadística", com: "K3.2", dia: 5, ini: "18:10", fin: "20:25" },
    { mat: "Desarrollo de Software", com: "K3.1", dia: 4, ini: "16:35", fin: "22:35" },
    { mat: "Diseño de Sistemas de Información", com: "K3.1", dia: 3, ini: "18:10", fin: "20:25" },
    { mat: "Diseño de Sistemas de Información", com: "K3.1", dia: 3, ini: "20:25", fin: "22:40" },
    { mat: "Planificación (Elec.)", com: "K3.4", dia: 2, ini: "18:10", fin: "22:40" }
  ];
  const DIAS_L = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const MONTH_NAMES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const MONTHS_SHORT = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

  const MAT_PALETTE = {
    "diseno": { color: "#a855f7", bg: "rgba(168, 85, 247, 0.15)", name: "Diseño de Sistemas" },
    "analisis": { color: "#3b82f6", bg: "rgba(59, 130, 246, 0.15)", name: "Análisis Matemático II" },
    "am ii": { color: "#3b82f6", bg: "rgba(59, 130, 246, 0.15)", name: "AM II" },
    "probabilidad": { color: "#10b981", bg: "rgba(16, 185, 129, 0.15)", name: "Probabilidad y Estadística" },
    "desarrollo": { color: "#f59e0b", bg: "rgba(245, 158, 11, 0.15)", name: "Desarrollo de Software" },
    "ads": { color: "#f59e0b", bg: "rgba(245, 158, 11, 0.15)", name: "ADS" },
    "planificacion": { color: "#f43f5e", bg: "rgba(244, 63, 94, 0.15)", name: "Planificación" }
  };
  const MAT_FALLBACK_COLORS = ["#a855f7", "#3b82f6", "#10b981", "#f59e0b", "#f43f5e", "#06b6d4", "#f97316", "#14b8a6"];

  function getMateriaColor(nameOrId) {
    if (!nameOrId) return { color: "#3b82f6", bg: "rgba(59, 130, 246, 0.15)" };
    const key = String(nameOrId).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    for (const k in MAT_PALETTE) {
      if (key.includes(k)) return MAT_PALETTE[k];
    }
    let hash = 0;
    for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) & 0xffffffff;
    const c = MAT_FALLBACK_COLORS[Math.abs(hash) % MAT_FALLBACK_COLORS.length];
    return { color: c, bg: c + "26" };
  }

  function materiaTagHTML(matName) {
    if (!matName) return "";
    const mc = getMateriaColor(matName);
    return `<span class="mat-chip" style="background:${mc.bg}; border-color:${mc.color}60; color:${mc.color};"><span class="mat-dot" style="background:${mc.color};"></span><span>${esc(matName)}</span></span>`;
  }

  let activeCursosTab = "quizzes";
  let calYear = new Date().getFullYear();
  let calMonth = new Date().getMonth();
  let calSelectedDay = null;
  let showAllHomeQuizzes = false;

  const AGENDA = [
    { mat: "Análisis de sistemas", desc: "", tipo: "Final", fecha: "09/09/2026 16:00" },
    { mat: "Probabilidad y Estadistica", desc: "Primera instancia de evaluación", tipo: "Parcial", fecha: "18/09/2026" },
    { mat: "Planificacion", desc: "Primer parcial teorico-practico", tipo: "Parcial", fecha: "22/09/2026" },
    { mat: "Probabilidad y Estadistica", desc: "Primer Recuperatorio", tipo: "Recuperatorio", fecha: "25/09/2026" },
    { mat: "AM II", desc: "", tipo: "Parcial Práctico", fecha: "29/09/2026" },
    { mat: "Diseño de sistemas", desc: "IE3 Práctico", tipo: "Parcial Práctico", fecha: "07/10/2026" },
    { mat: "AM II", desc: "", tipo: "Parcial Práctico", fecha: "20/10/2026" },
    { mat: "Probabilidad y Estadistica", desc: "Segunda instancia de evaluación", tipo: "Parcial", fecha: "30/10/2026" },
    { mat: "AM II", desc: "", tipo: "Recuperatorio", fecha: "01/11/2026" },
    { mat: "Diseño de sistemas", desc: "IE3 Recu practica", tipo: "Recuperatorio", fecha: "04/11/2026" },
    { mat: "Planificacion", desc: "Segundo parcial teorico", tipo: "Parcial", fecha: "10/11/2026" },
    { mat: "Planificacion", desc: "Recuperatorios", tipo: "Recuperatorio", fecha: "17/11/2026" },
    { mat: "Diseño de sistemas", desc: "IE4 TPI", tipo: "TPI", fecha: "18/11/2026 → 25/11/2026" },
    { mat: "Diseño de sistemas", desc: "IE5 Teoria", tipo: "Parcial Teórico", fecha: "18/11/2026" },
    { mat: "Probabilidad y Estadistica", desc: "Tercer Instancia de Evaluación", tipo: "Parcial", fecha: "20/11/2026" },
    { mat: "Probabilidad y Estadistica", desc: "Instancia de recuperatorios", tipo: "Recuperatorio", fecha: "27/11/2026" },
    { mat: "AM II", desc: "", tipo: "Parcial Teórico", fecha: "01/12/2026" },
    { mat: "Planificacion", desc: "Entrega final pr [ABRIR] seguimiento", tipo: "TPI", fecha: "01/12/2026" },
    { mat: "Diseño de sistemas", desc: "IE4 Recu TPI", tipo: "Recuperatorio", fecha: "02/12/2026" },
    { mat: "Diseño de sistemas", desc: "IE5 Recu Teoria", tipo: "Recuperatorio", fecha: "09/12/2026" }
  ];

  const esc = (v) => String(v == null ? "" : v)
    .replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const rich = (v) => String(v == null ? "" : v)
    .split(/(!\[[^\]]*\]\([^)]*\))/g)
    .map((p) => {
      const m = /^!\[([^\]]*)\]\(([^)]*)\)$/.exec(p);
      if (!m) return esc(p);
      const s = (m[2] || "").trim();
      if (/^(?:javascript|vbscript):/i.test(s)) return esc(p);
      if (/^data:/i.test(s) && !/^data:image\//i.test(s)) return esc(p);
      return ` <img class="qimg" src="${esc(s)}" alt="${esc((m[1] || "").trim())}" loading="lazy"> `;
    })
    .join("");
  const fmt = (n) => (Math.round(n * 100) / 100).toLocaleString("es", { maximumFractionDigits: 2 });
  const LETTERS = "ABCDEFGHIJ";

  const POMO_DEFAULT = { study: 25, short: 5, long: 15 };
  let pomo = { phase: "study", remaining: POMO_DEFAULT.study * 60, running: false, doneCount: 0, timer: null };
  let pomoCfg = { ...POMO_DEFAULT };

  function pomoLoad() {
    try {
      const raw = JSON.parse(localStorage.getItem("quiz.pomo") || "{}");
      ["study", "short", "long"].forEach((k) => {
        const v = parseInt(raw[k], 10);
        if (v >= 1 && v <= 150) pomoCfg[k] = v;
      });
    } catch (e) {}
  }
  function pomoSave() {
    try { localStorage.setItem("quiz.pomo", JSON.stringify(pomoCfg)); } catch (e) {}
  }
  function pomoStateSave() {
    try {
      const raw = JSON.parse(localStorage.getItem("quiz.pomo") || "{}");
      raw.state = { phase: pomo.phase, remaining: pomo.remaining, doneCount: pomo.doneCount };
      localStorage.setItem("quiz.pomo", JSON.stringify(raw));
    } catch (e) {}
  }
  function pomoStateLoad() {
    try {
      const s = JSON.parse(localStorage.getItem("quiz.pomo") || "{}").state || {};
      if (["study", "short", "long"].indexOf(s.phase) !== -1) {
        const max = pomoDur(s.phase);
        const r = parseInt(s.remaining, 10);
        if (r >= 1 && r <= max) {
          pomo.phase = s.phase;
          pomo.remaining = r;
        }
      }
      const d = parseInt(s.doneCount, 10);
      if (d >= 0 && d < 4) pomo.doneCount = d;
    } catch (e) {}
  }
  const pomoDur = (ph) => (pomoCfg[ph === "study" ? "study" : ph] || POMO_DEFAULT[ph]) * 60;
  const pomoLabel = () => ({ study: "Estudio", short: "Pausa", long: "Pausa larga" })[pomo.phase];

  function pomoBeep() {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      const ctx = new AC();
      [0, 0.22, 0.44].forEach((t) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = "sine";
        o.frequency.value = 880;
        g.gain.setValueAtTime(0.0001, ctx.currentTime + t);
        g.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t + 0.18);
        o.connect(g);
        g.connect(ctx.destination);
        o.start(ctx.currentTime + t);
        o.stop(ctx.currentTime + t + 0.2);
      });
      setTimeout(() => { try { ctx.close(); } catch (e) {} }, 900);
    } catch (e) {}
  }

  function pomoNextPhase() {
    if (pomo.phase === "study") {
      pomo.doneCount++;
      return pomo.doneCount % 4 === 0 ? "long" : "short";
    }
    return "study";
  }

  function paintHomeStudyWidget() {
    const t = document.getElementById("hp-time");
    if (!t) return;
    const m = Math.floor(pomo.remaining / 60);
    const s = pomo.remaining % 60;
    t.textContent = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    const ph = document.getElementById("hp-phase");
    if (ph) ph.textContent = `${pomoLabel()}${pomo.running ? " · en curso" : ""}`;
    const total = pomoDur(pomo.phase) || 1;
    const pct = Math.max(0, Math.min(100, Math.round(((total - pomo.remaining) / total) * 100)));
    const ring = document.getElementById("hp-ring");
    if (ring) ring.setAttribute("stroke-dasharray", `${pct}, 100`);
    const rv = document.getElementById("hp-ring-val");
    if (rv) rv.textContent = `${pct}%`;
    const dots = document.getElementById("hp-dots");
    if (dots) dots.textContent = `${pomo.doneCount % 4}/4 pomodoros`;
  }

  function pomoRender() {
    const box = document.getElementById("pomo");
    const timeEl = document.getElementById("pomo-time");
    const playEl = document.getElementById("pomo-play");
    const dotsEl = document.getElementById("pomo-dots");
    if (!box || !timeEl || !playEl || !dotsEl) return;
    const m = Math.floor(pomo.remaining / 60);
    const s = pomo.remaining % 60;
    const tstr = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    timeEl.textContent = tstr;
    try {
      document.title = pomo.running ? `${tstr} · ${pomoLabel()} — Studori` : "Studori";
    } catch (err) {}
    timeEl.title = pomoLabel();
    playEl.querySelector(".material-symbols-outlined").textContent = pomo.running ? "pause" : "play_arrow";
    playEl.title = pomo.running ? "Pausar" : "Iniciar";
    box.classList.toggle("running", pomo.running);
    box.classList.toggle("break", pomo.phase !== "study");
    box.classList.toggle("study", pomo.phase === "study");
    let dots = "";
    for (let i = 0; i < 4; i++) dots += `<span class="pomo-dot ${i < pomo.doneCount % 4 ? "done" : ""}"></span>`;
    dotsEl.innerHTML = dots;
    paintHomeStudyWidget();
    paintFocusCard();
  }

  function pomoFinish(ann) {
    clearInterval(pomo.timer);
    pomo.timer = null;
    pomo.running = false;
    pomo.phase = pomoNextPhase();
    pomo.remaining = pomoDur(pomo.phase);
    if (ann) {
      pomoBeep();
      toast(`Pomodoro: ${pomoLabel()} — apretá play cuando estés listo`);
      const box = document.getElementById("pomo");
      if (box) box.classList.add("done");
    }
    pomoRender();
    pomoStateSave();
  }

  function pomoTick() {
    pomo.remaining--;
    if (pomo.remaining > 0) { pomoRender(); pomoStateSave(); return; }
    pomoFinish(true);
  }

  function pomoToggle() {
    pomo.running = !pomo.running;
    if (pomo.running) {
      const box = document.getElementById("pomo");
      if (box) box.classList.remove("done");
      pomo.timer = setInterval(pomoTick, 1000);
    } else if (pomo.timer) {
      clearInterval(pomo.timer);
      pomo.timer = null;
    }
    pomoRender();
    pomoStateSave();
  }

  function pomoReset() {
    if (pomo.timer) { clearInterval(pomo.timer); pomo.timer = null; }
    pomo.running = false;
    pomo.remaining = pomoDur(pomo.phase);
    const box = document.getElementById("pomo");
    if (box) box.classList.remove("done");
    pomoRender();
    pomoStateSave();
  }

  function pomoSkip() {
    if (pomo.timer) { clearInterval(pomo.timer); pomo.timer = null; }
    pomo.running = false;
    pomo.remaining = 0;
    pomoFinish(false);
  }

  function paintFocusCard() {
    const timeEl = document.getElementById("pf-time");
    if (!timeEl) return;
    const m = Math.floor(pomo.remaining / 60);
    const s = pomo.remaining % 60;
    const tstr = `${m}:${s < 10 ? "0" : ""}${s}`;
    timeEl.textContent = tstr;
    const phaseEl = document.getElementById("pf-phase");
    if (phaseEl) phaseEl.textContent = pomoLabel().toUpperCase();
    const total = pomoDur(pomo.phase) || 1;
    const f = Math.max(0, Math.min(1, pomo.remaining / total));
    const ring = document.getElementById("pf-ring");
    if (ring) ring.style.strokeDashoffset = String(289 * (1 - f));
    const card = document.getElementById("focus-card");
    if (card) {
      card.classList.toggle("running", pomo.running);
      card.classList.toggle("break", pomo.phase !== "study");
    }
    const dotsWrap = document.getElementById("pf-dots");
    if (dotsWrap) {
      let dots = "";
      for (let i = 0; i < 4; i++) dots += `<span class="fdot ${i < pomo.doneCount % 4 ? "on" : ""}"></span>`;
      dotsWrap.innerHTML = dots;
    }
    const cap = document.getElementById("pf-cap");
    if (cap) cap.textContent = `${pomo.doneCount % 4}/4 POMODOROS COMPLETADOS`;
    const playBtn = document.getElementById("pf-play");
    if (playBtn) playBtn.querySelector(".material-symbols-outlined").textContent = pomo.running ? "pause" : "play_arrow";
  }

  function initPomodoro() {
    pomoLoad();
    pomoStateLoad();
    if (pomo.remaining > pomoDur(pomo.phase)) pomo.remaining = pomoDur(pomo.phase);
    const box = document.getElementById("pomo");
    if (!box) return;
    document.getElementById("pomo-play").addEventListener("click", pomoToggle);
    document.getElementById("pomo-reset").addEventListener("click", pomoReset);
    const panel = document.getElementById("pomo-panel");
    document.getElementById("pomo-cfg").addEventListener("click", (e) => {
      e.stopPropagation();
      panel.hidden = !panel.hidden;
      if (!panel.hidden) {
        document.getElementById("pomo-study").value = pomoCfg.study;
        document.getElementById("pomo-short").value = pomoCfg.short;
        document.getElementById("pomo-long").value = pomoCfg.long;
      }
    });
    panel.addEventListener("click", (e) => e.stopPropagation());
    document.addEventListener("click", () => { panel.hidden = true; });
    [["pomo-study", "study"], ["pomo-short", "short"], ["pomo-long", "long"]].forEach(([id, key]) => {
      document.getElementById(id).addEventListener("change", (e) => {
        const v = parseInt(e.target.value, 10);
        if (!(v >= 1 && v <= 150)) return;
        pomoCfg[key] = v;
        pomoSave();
        if (!pomo.running) {
          pomo.remaining = pomoDur(pomo.phase);
          document.getElementById("pomo").classList.remove("done");
          pomoRender();
        }
      });
    });
    pomoRender();
  }

  function toast(msg) {
    let el = document.getElementById("toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "toast";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    let close = el.querySelector(".toast-close");
    if (!close) {
      close = document.createElement("button");
      close.className = "toast-close";
      close.addEventListener("click", () => {
        el.classList.remove("show");
        clearTimeout(el._t);
      });
    }
    close.textContent = "✕";
    el.appendChild(close);
    el.classList.add("show");
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove("show"), 3200);
  }

  function loadSource() {
    const loadOne = (url, name) =>
      fetch(`${url}?v=54`)
        .then((r) => (r.ok ? r.text() : Promise.reject(new Error("no file"))))
        .then((txt) => {
          if (!txt.trim()) return { ok: false, skipped: true };
          const res = Quiz.loadCsv(txt, name);
          if (res.ok && S().warnings.length) S().warnings = [];
          return res.ok ? { ok: true } : { ok: false, errors: res.errors };
        })
        .catch(() => ({ ok: false, skipped: true }));

    return Promise.all([
      loadOne("data/cuestionario.csv", "Final ADS"),
      loadOne("data/cuestionario Burpleria.csv", "Burpleria"),
      loadOne("data/cuestionario Primer Parcial 2026.csv", "Primer Parcial 2026")
    ]).then(([r1, r2, r3]) => {
      if (S().questionnaires.length > 0) return { ok: true, loaded: true };
      if (r1.errors) return { ok: false, errors: r1.errors };
      if (r2.errors) return { ok: false, errors: r2.errors };
      if (r3.errors) return { ok: false, errors: r3.errors };
      return Quiz.tryLoadSaved()
        ? { ok: true, loaded: true }
        : { ok: true, loaded: false };
    });
  }

  function initCloudUI() {
    const Cloud = window.Cloud;
    const sideBtn = document.getElementById("cloud-btn");
    const topBtn = document.getElementById("acct-btn");
    const btns = [sideBtn, topBtn].filter(Boolean);
    if (!btns.length) return;
    const ic = document.getElementById("cloud-ic");
    const label = document.getElementById("cloud-label");
    const aic = document.getElementById("acct-ic");
    const aname = document.getElementById("acct-name");
    if (Cloud && Cloud.isConfigured()) Cloud.init();
    let wasOwner = isOwner();
    const paint = () => {
      const u = Cloud && Cloud.user();
      const st = Cloud && typeof Cloud.syncState === "function" ? Cloud.syncState() : "idle";
      const full = u ? (u.name || u.email || "Cuenta") : "";
      const shortName = full.trim().split(/\s+/)[0] || "Cuenta";
      if (ic) ic.textContent = u ? "logout" : "person";
      if (label) {
        label.textContent = u ? full : "Entrar";
        const sub = label.parentElement && label.parentElement.querySelector("small");
        if (sub) {
          sub.textContent = u ? (st === "syncing" ? "Sincronizando…" : "Cerrar sesión") : "Iniciar sesión";
          sub.style.display = "";
        }
      }
      if (aic) {
        aic.textContent = st === "syncing" ? "sync" : (st === "saved" && u ? "cloud_done" : "person");
      }
      if (aname) {
        aname.textContent = u ? (st === "syncing" ? "Guardando…" : shortName) : "Entrar";
      }
      btns.forEach((b) => {
        b.title = !u ? "Iniciar sesión con Google y sincronizar progreso"
          : full + (st === "syncing" ? " (guardando…)" : " · clic para cerrar sesión");
      });
      const nowOwner = isOwner();
      if (nowOwner !== wasOwner && (currentView === "inicio" || currentView === "cursos")) refreshView();
      wasOwner = nowOwner;
    };
    btns.forEach((btn) => {
      btn.addEventListener("pointerdown", () => {
        if (Cloud && Cloud.isConfigured() && !Cloud.user() && typeof Cloud.warm === "function") Cloud.warm();
      });
      btn.addEventListener("click", () => {
      if (!Cloud || !Cloud.isConfigured()) {
        toast("Sync sin configurar: creá un proyecto gratis en Firebase y pegá las claves en js/cloud.js");
        return;
      }
      if (Cloud.user()) {
        if (confirm("¿Cerrar sesión en este dispositivo? Tu progreso queda guardado en la nube.")) Cloud.signOut().then(paint);
        return;
      }
      toast("Abriendo Google…");
      Cloud.signIn().then(() => { paint(); }).catch((e) => {
        if (e && (e.code === "auth/popup-closed-by-user" || e.code === "auth/cancelled-popup-request")) return;
        const code = e && e.code ? e.code : "";
        if (code === "auth/unauthorized-domain") {
          toast("Dominio sin autorizar: en Firebase → Authentication → Configuración → Dominios autorizados, agregá oriannaf.github.io");
        } else if (code === "auth/configuration-not-found" || code === "auth/operation-not-allowed") {
          toast("Google no está habilitado: en Firebase → Authentication → Sign-in method, habilitá el proveedor Google");
        } else {
          toast("No se pudo iniciar sesión" + (code ? " (" + code + ")" : "") + ". Revisá tu conexión.");
        }
        if (e) console.error("Cloud sign-in error:", e);
      });
      });
    });
    if (Cloud) Cloud.onChange(paint);
    paint();
  }

  let refreshTimer = null;
  function scheduleViewRefresh() {
    if (document.body.classList.contains("quiz-open") || (window.Quiz && window.Quiz.S && window.Quiz.S.items && window.Quiz.S.items.length > 0)) return;
    if (refreshTimer) clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => {
      refreshTimer = null;
      if (document.body.classList.contains("quiz-open") || (window.Quiz && window.Quiz.S && window.Quiz.S.items && window.Quiz.S.items.length > 0)) return;
      if (currentView === "inicio" || currentView === "progreso" || currentView === "cursos") {
        refreshView();
      }
    }, 300);
  }
  if (typeof window !== "undefined" && window.Cloud && typeof window.Cloud.onChange === "function") {
    window.Cloud.onChange(scheduleViewRefresh);
  }

  const NAV_SEL = "#main-nav .nav-item, #bottom-nav .nav-item";

  function bindNav() {
    document.querySelectorAll(NAV_SEL).forEach((a) => {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        navigate(a.dataset.view);
      });
    });
    const brand = document.getElementById("brand-home");
    if (brand) brand.addEventListener("click", () => navigate("inicio"));
  }

  function paintNav() {
    document.querySelectorAll(NAV_SEL).forEach((a) => {
      a.classList.toggle("active", a.dataset.view === currentView);
    });
  }

  const RENDERERS = {};

  function navigate(v) {
    const r = RENDERERS[v];
    if (!r) return;
    currentView = v;
    paintNav();
    r();
    window.scrollTo(0, 0);
  }

  function refreshView() {
    navigate(currentView);
  }

  function paintTopDate() {
    const el = document.getElementById("top-date");
    if (!el) return;
    const DAYS = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];
    const MES = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
    const d = new Date();
    el.textContent = `${DAYS[d.getDay()]} ${d.getDate()} ${MES[d.getMonth()]}`;
  }

  function init() {
    const tt = document.getElementById("theme-toggle");
    if (tt) tt.addEventListener("click", () => {
      const el = document.documentElement;
      const dark = el.classList.toggle("dark");
      el.classList.toggle("light", !dark);
      try { localStorage.setItem("quiz.theme", dark ? "dark" : "light"); } catch (e) {}
    });
    paintTopDate();
    bindNav();
    initPomodoro();
    loadSource().then((r) => {
      if (r.loaded) {
        warningsDismissed = false;
        navigate("inicio");
      } else if (r.errors) {
        renderLoadError(r.errors);
      } else {
        renderUpload();
      }
      const bgInit = () => {
        initCloudUI();
        refreshCoursesFromCloud();
      };
      if (typeof window !== "undefined" && typeof window.requestIdleCallback === "function") {
        window.requestIdleCallback(bgInit);
      } else {
        setTimeout(bgInit, 100);
      }
    });
  }

  function view(html) {
    $("#app").innerHTML = `<div class="view">${html}</div>`;
  }

  let uploadCtx = null;
  let conexData = null;

  function readFile(file) {
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result);
      const res = window.CSV.parseQuestions(text);
      if (!res.ok) { renderLoadError(res.errors); return; }
      warningsDismissed = false;
      openUploadModal({ name: file.name, text, questions: res.questions.length });
    };
    reader.readAsText(file, "UTF-8");
  }

  function closeUploadModal() {
    uploadCtx = null;
    const ov = document.getElementById("upload-overlay");
    if (!ov) return;
    if (ov._onKey) document.removeEventListener("keydown", ov._onKey);
    ov.remove();
  }

  function sendMateriaRequest(nombre, ctx) {
    const MAIL = "oriannafernandezdelrosario@gmail.com";
    const subject = `Solicitud: nueva materia "${nombre}"`;
    const body = [
      `Quiero agregar la materia "${nombre}" a Studori.`,
      "",
      `Cuestionario: ${ctx.name}`,
      `Preguntas detectadas: ${ctx.questions}`,
      "",
      "Adjunto el CSV para cargarlo."
    ].join("\r\n");
    try {
      window.location.href = `mailto:${MAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      toast("Abrimos tu correo para enviar la solicitud.");
    } catch (e) {
      toast(`Mandale la solicitud a ${MAIL} con el CSV adjunto.`);
    }
  }

  function openUploadModal(ctx) {
    closeUploadModal();
    uploadCtx = ctx;
    const courses = loadCourses();
    const hasCourses = courses.length > 0;
    const opts = courses.map((c) => `<option value="${esc(c.id)}">${esc(c.name)}</option>`).join("");
    const ov = document.createElement("div");
    ov.id = "upload-overlay";
    ov.className = "modal-overlay";
    ov.addEventListener("click", (e) => { if (e.target === ov) closeUploadModal(); });
    ov._onKey = (e) => { if (e.key === "Escape") closeUploadModal(); };
    document.addEventListener("keydown", ov._onKey);
    ov.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true">
      <div class="modal-head">
        <span class="material-symbols-outlined accent-ic">upload_file</span>
        <h3>${esc(ctx.name)}</h3>
        <button class="mini-edit" id="up-close" title="Cerrar"><span class="material-symbols-outlined">close</span></button>
      </div>
      <div class="modal-body">
        <p class="muted small">${ctx.questions} preguntas detectadas. ¿De qué materia es este cuestionario?</p>
        <label class="check-line"><input type="radio" name="uptype" value="exist" ${hasCourses ? "checked" : "disabled"}>
          <span>Materia existente</span></label>
        <select class="input sm" id="up-existing" ${hasCourses ? "" : "disabled"}>${opts}</select>
        <label class="check-line" style="margin-top:6px"><input type="radio" name="uptype" value="new" ${hasCourses ? "" : "checked"}>
          <span>Materia nueva (requiere aprobación)</span></label>
        <input class="input sm" id="up-newname" placeholder="Nombre de la materia nueva" ${hasCourses ? "disabled" : ""}>
        <p class="muted small">Con materia nueva se abre un mail a Orianna con la solicitud; adjuntá el CSV.</p>
      </div>
      <div class="modal-foot">
        <button class="btn ghost" id="up-cancel">Cancelar</button>
        <button class="btn primary" id="up-confirm">Confirmar</button>
      </div>
    </div>`;
    document.body.appendChild(ov);
    ov.querySelectorAll("[name=uptype]").forEach((r) => {
      r.addEventListener("change", () => {
        const mode = ov.querySelector("[name=uptype]:checked").value;
        ov.querySelector("#up-existing").disabled = mode !== "exist";
        ov.querySelector("#up-newname").disabled = mode !== "new";
      });
    });
    ov.querySelector("#up-close").onclick = closeUploadModal;
    ov.querySelector("#up-cancel").onclick = closeUploadModal;
    ov.querySelector("#up-confirm").onclick = () => {
      const mode = ov.querySelector("[name=uptype]:checked").value;
      if (mode === "exist") {
        const c = findCourse(ov.querySelector("#up-existing").value);
        if (!c) { toast("Elegí una materia."); return; }
        const res = Quiz.loadCsv(uploadCtx.text, uploadCtx.name);
        if (!res.ok) { renderLoadError(res.errors); closeUploadModal(); return; }
        const h = S().currentHash;
        mutateCourse(c.id, (cc) => {
          cc.quizzes = Array.isArray(cc.quizzes) ? cc.quizzes.slice() : [];
          if (cc.quizzes.indexOf(h) === -1) cc.quizzes.push(h);
        });
        closeUploadModal();
        refreshView();
        toast(`Cuestionario asignado a "${c.name}".`);
      } else {
        const nombre = ov.querySelector("#up-newname").value.trim();
        if (!nombre) { toast("Escribí el nombre de la materia nueva."); return; }
        sendMateriaRequest(nombre, uploadCtx);
        closeUploadModal();
      }
    };
  }

  function bindUpload(zoneId, fileId) {
    const dz = document.getElementById(zoneId);
    const input = document.getElementById(fileId);
    if (!dz || !input) return;
    dz.addEventListener("click", () => input.click());
    dz.addEventListener("dragover", (e) => { e.preventDefault(); dz.classList.add("hover"); });
    dz.addEventListener("dragleave", () => dz.classList.remove("hover"));
    dz.addEventListener("drop", (e) => {
      e.preventDefault();
      dz.classList.remove("hover");
      const f = e.dataTransfer.files && e.dataTransfer.files[0];
      if (f) readFile(f);
    });
    input.addEventListener("change", () => {
      if (input.files[0]) readFile(input.files[0]);
      input.value = "";
    });
  }

  function renderUpload() {
    view(`
      <div class="card center">
        <h2>Cargar un cuestionario</h2>
        <p class="muted">Subí un archivo CSV con las preguntas. Cada pregunta admite hasta 8 opciones y varias respuestas correctas.</p>
        <div class="dropzone" id="dropzone">
          <div class="dz-title">Arrastrá el CSV acá o hacé clic para elegirlo</div>
          <div class="muted small">Máximo 1000 preguntas · una fila por pregunta · delimitador , o ; (se detecta solo)</div>
        </div>
        <input type="file" id="file" accept=".csv,text/csv,text/plain" hidden>
      </div>
    `);
    bindUpload("dropzone", "file");
  }

  function renderLoadError(errors) {
    view(`
      <div class="card">
        <h2>No se pudo cargar el cuestionario</h2>
        <div class="error-list">${errors.map((e) => `<div class="error-item">${esc(e)}</div>`).join("")}</div>
        <div class="btn-row">
          <button class="btn" id="btn-back">Volver</button>
        </div>
      </div>
    `);
    document.getElementById("btn-back").addEventListener("click", () => {
      if (S().questions.length) refreshView();
      else renderUpload();
    });
  }

  const EXAM_ICONS = ["school", "menu_book", "science", "calculate", "account_balance", "psychology", "biotech", "public"];
  const TONES = ["", "tone-green", "tone-purple"];
  const toneOf = (i) => TONES[i % TONES.length];

  function modeOptions(st) {
    return [
      ["today", `Para hoy (${st.today})`],
      ["random", `Aleatorias (${st.total})`],
      ["new", `Solo nuevas (${st.newN})`],
      ["failed", `Solo falladas (${st.failedNow})`],
      ["all", `Todas (${st.total})`],
      ["timed", `⏱️ Examen con tiempo (Simulacro)`]
    ].map(([v, lbl]) => `<option value="${v}" ${S().settings.mode === v ? "selected" : ""}>${lbl}</option>`).join("");
  }

  function sizeOptions(st) {
    return [10, 15, 20, 25, 30, 40, 50, 0].map((n) =>
      `<option value="${n}" ${S().settings.size === n ? "selected" : ""}>${n === 0 ? `Todas (${Math.min(1000, st.total)})` : n} preguntas</option>`).join("");
  }

  function catOptions(hash) {
    const qz = Quiz.S.questionnaires.find((x) => x.hash === hash);
    if (!qz) return "";
    const cats = [];
    qz.questions.forEach((q) => {
      const c = (q.category || "").trim();
      if (c && cats.indexOf(c) === -1) cats.push(c);
    });
    if (!cats.length) return "";
    cats.sort((a, b) => a.localeCompare(b));
    const cur = String(S().settings.cat || "");
    const valid = cats.indexOf(cur) !== -1;
    return `<option value="">Todas las categorías</option>` +
      cats.map((c) => `<option value="${esc(c)}" ${valid && c === cur ? "selected" : ""}>${esc(c)}</option>`).join("");
  }

  let timedExamState = null;

  function formatTimer(sec) {
    const m = Math.floor(Math.max(0, sec) / 60);
    const s = Math.max(0, sec) % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  function updateTimerDisplay() {
    const el = document.getElementById("timer-digits");
    const bar = document.getElementById("exam-timer-bar");
    if (!el || !timedExamState) return;
    el.textContent = formatTimer(timedExamState.remainingSec);
    if (bar) {
      bar.classList.toggle("timer-warn", timedExamState.remainingSec <= 120 && timedExamState.remainingSec > 30);
      bar.classList.toggle("timer-critical", timedExamState.remainingSec <= 30);
    }
  }

  function startTimer(durationSeconds) {
    stopTimer();
    timedExamState = {
      durationSec: durationSeconds,
      remainingSec: durationSeconds,
      startAt: Date.now(),
      elapsedSec: 0,
      timerId: setInterval(() => {
        if (!timedExamState) return;
        timedExamState.remainingSec--;
        timedExamState.elapsedSec = Math.round((Date.now() - timedExamState.startAt) / 1000);
        updateTimerDisplay();
        if (timedExamState.remainingSec <= 0) {
          stopTimer();
          toast("⏰ ¡Tiempo terminado! Enviando examen…");
          submitQuiz();
        }
      }, 1000)
    };
  }

  function stopTimer() {
    if (timedExamState && timedExamState.timerId) {
      clearInterval(timedExamState.timerId);
      timedExamState.timerId = null;
    }
  }

  function startQuiz(hash) {
    returnView = currentView;
    Quiz.selectQuestionnaire(hash);
    const modeSel = document.getElementById("sel-mode-" + hash);
    if (modeSel) Quiz.setMode(modeSel.value);
    Quiz.newSession();
    if (Quiz.S.settings.mode === "timed") {
      const qCount = Quiz.S.items.length;
      const durationMin = qCount === 0 ? 30 : Math.max(5, Math.min(120, Math.round(qCount * 1.5)));
      startTimer(durationMin * 60);
    } else {
      stopTimer();
      timedExamState = null;
    }
    renderQuiz();
  }

  function resumeQuiz(hash) {
    returnView = currentView;
    Quiz.selectQuestionnaire(hash);
    stopTimer();
    timedExamState = null;
    if (Quiz.tryResume()) renderQuiz();
    else { S().items = []; refreshView(); }
  }

  function bindExamCard(hash, qq) {
    const startBtn = document.getElementById("btn-start-" + hash);
    if (startBtn) startBtn.addEventListener("click", () => startQuiz(hash));
    const flashBtn = document.getElementById("btn-flash-" + hash);
    if (flashBtn) flashBtn.addEventListener("click", () => startFlashcards(hash));
    const modeSel = document.getElementById("sel-mode-" + hash);
    if (modeSel) modeSel.addEventListener("change", (e) => Quiz.setMode(e.target.value));
    const catSel = document.getElementById("sel-cat-" + hash);
    if (catSel) catSel.addEventListener("change", (e) => Quiz.setCat(e.target.value));
    const sizeSel = document.getElementById("sel-size-" + hash);
    if (sizeSel) sizeSel.addEventListener("change", (e) => Quiz.setSize(e.target.value));
    const pointsInp = document.getElementById("inp-points-" + hash);
    if (pointsInp) pointsInp.addEventListener("change", (e) => Quiz.setPoints(e.target.value));
    const resetBtn = document.getElementById("btn-reset-" + hash);
    if (resetBtn) resetBtn.addEventListener("click", () => {
      if (confirm(`¿Reiniciar todo el progreso de "${qq.name}"?`)) {
        Quiz.resetProgressFor(hash);
        refreshView();
        toast("Progreso reiniciado");
      }
    });
    const resumeBtn = document.getElementById("btn-resume-" + hash);
    if (resumeBtn) resumeBtn.addEventListener("click", () => resumeQuiz(hash));
  }

  function activeCardHTML(qq, i, st) {
    const pct = st.total ? Math.round(((st.total - st.today) / st.total) * 100) : 0;
    const tone = toneOf(i);
    const toneCls = tone === "tone-green" ? "tone-green" : tone === "tone-purple" ? "tone-purple" : "tone-blue";
    const hasDraft = Quiz.draftOf(qq.hash);
    const mat = materiaOf(qq.hash);
    return `
    <div class="exam-card ${tone}">
      <div class="exam-card-body">
        <div class="mat-titling">
          <h3>${esc(st.name)}</h3>
          ${mat ? materiaTagHTML(mat.name) : '<span class="eyebrow">Sin materia</span>'}
        </div>
        <div class="bar-row">
          <span class="mono-label muted">Avance</span>
          <span class="mono-label">${pct}%</span>
        </div>
        <div class="progress ${tone === "tone-green" ? "green" : ""} ${tone === "tone-purple" ? "grad" : ""}"><span style="width:${pct}%"></span></div>
        <div class="exam-card-meta">
          <span><b>${st.total}</b> preguntas</span><span>·</span>
          <span><b>${st.today}</b> para hoy</span><span>·</span>
          <span><b>${st.mastered}</b> dominadas</span>
        </div>
        <div class="session-row">
          <label class="field-label visually-hidden" for="sel-size-${st.hash}">Cantidad de preguntas</label>
          <select class="input sm" id="sel-size-${st.hash}">${sizeOptions(st)}</select>
          <label class="field-label visually-hidden" for="sel-mode-${st.hash}">Tipo de sesión</label>
          <select class="input sm" id="sel-mode-${st.hash}">${modeOptions(st)}</select>
          <button class="play-fab" id="btn-start-${st.hash}" title="Comenzar sesión">
            <span class="material-symbols-outlined">play_arrow</span>
          </button>
          <button class="btn sm secondary" id="btn-flash-${st.hash}" type="button" title="Repasar con Flashcards" style="display:inline-flex; align-items:center; gap:4px;">
            <span class="material-symbols-outlined" style="font-size:18px;">style</span> Flashcards
          </button>
          ${(() => {
            const opts = catOptions(st.hash);
            return opts ? `
          <label class="field-label visually-hidden" for="sel-cat-${st.hash}">Categoría</label>
          <select class="input sm cat-sel" id="sel-cat-${st.hash}">${opts}</select>` : "";
          })()}
        </div>
        ${hasDraft ? `
        <button class="draft-chip" id="btn-resume-${st.hash}">
          <span class="material-symbols-outlined">history</span>
          Continuar sesión guardada
        </button>` : ""}
      </div>
    </div>`;
  }


  function fechasBoxHTML(sfx) {
    const courses = loadCourses();
    const exams = Quiz.courseExamsMap();
    const horas = Quiz.courseExamsHoraMap();
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const rows = courses
      .filter((c) => exams[c.id])
      .map((c) => ({ c, d: new Date(exams[c.id] + "T12:00:00") }))
      .filter((x) => !isNaN(x.d.getTime()))
      .sort((a, b) => a.d - b.d)
      .map(({ c, d }) => {
        const days = Math.round((d - today) / 86400000);
        const past = days < 0;
        const tone = past ? "past" : days <= 7 ? "" : "tone-green";
        const metaTxt = horas[c.id]
          ? esc(horas[c.id])
          : (days === 0 ? "¡Es hoy!" : days === 1 ? "Mañana" : past ? "Ya pasó" : `${days} días restantes`);
        return `
        <div class="date-item">
          <div class="date-box ${tone}">
            <span class="mon">${MONTHS_SHORT[d.getMonth()]}</span>
            <span class="day">${d.getDate()}</span>
          </div>
          <div class="date-info">
            <h4>${esc(c.name)}</h4>
            <span class="meta">${metaTxt}</span>
          </div>
          <div class="date-count ${past ? "past" : ""}"><b>${Math.max(0, days)}</b><span>días</span></div>
          ${sfx === "cur" ? `<button class="mini-edit del fecha-del" data-fecha-del="${c.id}" title="Quitar fecha">
            <span class="material-symbols-outlined">close</span>
          </button>` : ""}
        </div>`;
      }).join("");
    return `
    <div class="widget">
      <div class="widget-head">
        <h3>Fechas de parciales</h3>
        <span class="material-symbols-outlined">calendar_month</span>
      </div>
      ${rows || (courses.length
        ? `<div class="empty-note">Ninguna materia tiene fecha todavía.<br>Elegí una materia abajo y asignale la fecha límite.</div>`
        : `<div class="empty-note">Creá una materia para asignarle su fecha de parcial.</div>`)}
      ${sfx === "cur" && courses.length ? `
      <div class="fecha-add">
        <label class="field-label visually-hidden" for="sel-mat-${sfx}">Materia</label>
        <select class="input sm" id="sel-mat-${sfx}">${courses.map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join("")}</select>
        <label class="field-label visually-hidden" for="inp-fecha-${sfx}">Fecha límite</label>
        <input class="input sm" type="date" id="inp-fecha-${sfx}">
        <label class="field-label visually-hidden" for="inp-hora-${sfx}">Horario</label>
        <input class="input sm" type="text" id="inp-hora-${sfx}" placeholder="Horario ej: 8 a 11" maxlength="40">
        <button class="btn primary sm" id="btn-fecha-${sfx}">
          <span class="material-symbols-outlined">event</span>Guardar
        </button>
      </div>` : ""}
    </div>`;
  }

  function bindFechasBox(sfx) {
    const btn = document.getElementById("btn-fecha-" + sfx);
    if (btn) btn.addEventListener("click", () => {
      const sel = document.getElementById("sel-mat-" + sfx);
      const inp = document.getElementById("inp-fecha-" + sfx);
      if (!sel || !sel.value) return;
      if (!inp.value) { toast("Elegí una fecha primero."); return; }
      const inpH = document.getElementById("inp-hora-" + sfx);
      Quiz.setCourseExamFor(sel.value, inp.value);
      Quiz.setCourseExamHoraFor(sel.value, inpH ? inpH.value : "");
      toast("Fecha guardada.");
      refreshView();
    });
    document.querySelectorAll("[data-fecha-del]").forEach((b) => {
      b.addEventListener("click", () => {
        Quiz.setCourseExamFor(b.dataset.fechaDel, "");
        toast("Fecha eliminada.");
        refreshView();
      });
    });
  }

  function studyWidgetHTML() {
    return `
    <div class="widget">
      <div class="widget-head">
        <h3>Tiempo de estudio</h3>
        <span class="material-symbols-outlined">schedule</span>
      </div>
      <div class="study-widget-row">
        <div class="ring-wrap">
          <svg viewBox="0 0 36 36">
            <circle cx="18" cy="18" fill="none" r="16" stroke-width="3" stroke="var(--panel-hi)"></circle>
            <circle id="hp-ring" cx="18" cy="18" fill="none" r="16" stroke-width="3" stroke-linecap="round"
              stroke="var(--accent-soft)" stroke-dasharray="0, 100"></circle>
          </svg>
          <span class="ring-val" id="hp-ring-val">0%</span>
        </div>
        <div class="study-widget-info">
          <span class="big-time" id="hp-time">--:--</span>
          <span class="phase small" id="hp-phase">Estudio</span>
          <span class="mono-label muted" id="hp-dots">0/4 pomodoros</span>
        </div>
      </div>
    </div>`;
  }

  function homeDailyStripHTML() {
    const now = new Date();
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const dayClasses = HORARIOS.filter((x) => x.dia === now.getDay());
    let classTxt = "Hoy no cursás materias";
    if (dayClasses.length) {
      classTxt = dayClasses.map((c) => `${c.mat} (${c.ini} – ${c.fin})`).join(", ");
    }

    const nextEvals = AGENDA
      .map((x) => ({ x, d: evalDateOf(x.fecha) }))
      .filter((r) => r.d && !isNaN(r.d.getTime()))
      .map((r) => { r.days = Math.round((r.d - today) / 86400000); return r; })
      .filter((r) => r.days >= 0)
      .sort((a, b) => a.d - b.d);
    
    const nextEv = nextEvals.length ? nextEvals[0] : null;
    const nextTxt = nextEv 
      ? `<b>${esc(nextEv.x.mat)}</b> (${nextEv.days === 0 ? "¡Hoy!" : nextEv.days === 1 ? "Mañana" : `en ${nextEv.days} días`})`
      : "Sin fechas próximas";

    return `
      <div class="home-daily-strip">
        <div class="strip-card">
          <div class="strip-icon"><span class="material-symbols-outlined">schedule</span></div>
          <div class="strip-info">
            <div class="strip-title">Horario de Hoy (${DIAS_L[now.getDay()].slice(0, 3)} ${now.getDate()})</div>
            <div class="strip-val" title="${esc(classTxt)}">${esc(classTxt)}</div>
          </div>
        </div>
        <div class="strip-card">
          <div class="strip-icon" style="color:var(--amber);"><span class="material-symbols-outlined">event</span></div>
          <div class="strip-info">
            <div class="strip-title">Próximo Examen</div>
            <div class="strip-val">${nextTxt}</div>
          </div>
        </div>
        <div class="strip-card" style="cursor:pointer;" id="strip-go-horarios" title="Ver horario y calendario">
          <div class="strip-icon" style="color:var(--accent);"><span class="material-symbols-outlined">calendar_month</span></div>
          <div class="strip-info">
            <div class="strip-title">Calendario & Horarios</div>
            <div class="strip-val" style="color:var(--accent); display:flex; align-items:center; gap:4px;">
              Ver calendario completo <span class="material-symbols-outlined" style="font-size:16px;">arrow_forward</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function getQuizActivityScore(hash) {
    const prog = S().progress || {};
    let totalAttempts = 0;
    let lastPlayed = 0;
    const qz = S().questionnaires.find((x) => x.hash === hash);
    if (!qz) return 0;
    qz.questions.forEach((q) => {
      const p = prog[q.id];
      if (p) {
        if (p.reps) totalAttempts += p.reps;
        if (p.lastDate) {
          const t = new Date(p.lastDate).getTime();
          if (t > lastPlayed) lastPlayed = t;
        }
      }
    });
    const draftBonus = Quiz.draftOf(hash) ? 1000 : 0;
    return (lastPlayed / 1000000) + totalAttempts * 10 + draftBonus;
  }

  function evalDateOf(s) {
    const ms = String(s).match(/\d{2}\/\d{2}\/\d{4}/g);
    if (!ms) return null;
    const p = ms[ms.length - 1].split("/");
    return new Date(+p[2], +p[1] - 1, +p[0]);
  }

  function evalTone(tipo) {
    return /recup/i.test(tipo) ? "t-recu" : /final/i.test(tipo) ? "t-final" : /\btpi\b/i.test(tipo) ? "t-tpi" : "t-parcial";
  }

  function getEventsForDate(y, m, d) {
    const iso = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const events = [];
    
    AGENDA.forEach((item) => {
      const dt = evalDateOf(item.fecha);
      if (dt && dt.getFullYear() === y && dt.getMonth() === m && dt.getDate() === d) {
        events.push({
          mat: item.mat,
          desc: item.desc,
          tipo: item.tipo,
          color: getMateriaColor(item.mat)
        });
      }
    });

    const exams = Quiz.courseExamsMap();
    const courses = loadCourses();
    for (const cid in exams) {
      if (exams[cid] === iso) {
        const c = courses.find((x) => x && x.id === cid);
        const name = c ? c.name : "Parcial";
        if (!events.some((e) => e.mat.toLowerCase().includes(name.toLowerCase().slice(0, 5)))) {
          events.push({
            mat: name,
            desc: "Fecha fijada",
            tipo: "Parcial",
            color: getMateriaColor(name)
          });
        }
      }
    }
    return events;
  }

  function monthlyCalendarHTML() {
    const today = new Date();
    const isCurMonth = today.getFullYear() === calYear && today.getMonth() === calMonth;
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const firstDayIndex = new Date(calYear, calMonth, 1).getDay();

    const dayHeaders = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
      .map((d) => `<div class="cal-col-header">${d}</div>`).join("");

    let dayCells = "";
    for (let i = 0; i < firstDayIndex; i++) {
      dayCells += `<div class="cal-cell empty"></div>`;
    }

    let selectedEvents = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const isToday = isCurMonth && today.getDate() === d;
      const isSelected = calSelectedDay === d;
      const evs = getEventsForDate(calYear, calMonth, d);
      if (isSelected || (!calSelectedDay && isToday && evs.length)) {
        selectedEvents = evs.map((e) => ({ ...e, day: d }));
      }
      
      const dotsHTML = evs.map((e) => 
        `<span class="cal-event-dot" style="background:${e.color.color};" title="${esc(e.mat)}: ${esc(e.tipo)}"></span>`
      ).join("");

      dayCells += `
        <div class="cal-cell ${isToday ? "today" : ""} ${isSelected ? "selected" : ""}" data-cal-day="${d}">
          <div class="cal-cell-num">${d}</div>
          <div class="cal-dots-list">${dotsHTML}</div>
        </div>`;
    }

    let detailHTML = "";
    if (selectedEvents.length) {
      const dayNum = selectedEvents[0].day || calSelectedDay;
      const items = selectedEvents.map((e) => `
        <div class="cal-day-event-item">
          <span class="mat-dot" style="background:${e.color.color};"></span>
          <b>${esc(e.mat)}</b> · <span class="ev-tag ${evalTone(e.tipo)}">${esc(e.tipo)}</span>
          ${e.desc ? `<span class="muted small">(${esc(e.desc)})</span>` : ""}
        </div>
      `).join("");
      detailHTML = `
        <div class="cal-day-detail-box">
          <div class="cal-day-detail-title">📌 Evaluaciones para el ${dayNum} de ${MONTH_NAMES[calMonth]}:</div>
          ${items}
        </div>`;
    }

    const legendItems = [
      { name: "Diseño de Sistemas", key: "diseno" },
      { name: "Análisis Matemático II", key: "analisis" },
      { name: "Probabilidad y Estadística", key: "probabilidad" },
      { name: "Desarrollo de Software", key: "desarrollo" },
      { name: "Planificación", key: "planificacion" }
    ].map((m) => {
      const mc = getMateriaColor(m.key);
      return `<span class="cal-legend-item"><span class="mat-dot" style="background:${mc.color};"></span>${m.name}</span>`;
    }).join("");

    return `
      <div class="cal-month-wrap">
        <div class="cal-month-head">
          <div class="sec-title">
            <span class="material-symbols-outlined">calendar_month</span>
            <h2>Calendario Mensual de Exámenes</h2>
          </div>
          <div class="cal-month-nav">
            <button class="btn icon sm" id="btn-cal-prev" type="button" title="Mes anterior"><span class="material-symbols-outlined">chevron_left</span></button>
            <span class="cal-month-title">${MONTH_NAMES[calMonth]} ${calYear}</span>
            <button class="btn icon sm" id="btn-cal-next" type="button" title="Mes siguiente"><span class="material-symbols-outlined">chevron_right</span></button>
            <button class="btn sm" id="btn-cal-today" type="button">Hoy</button>
          </div>
        </div>
        <div class="cal-table-grid">
          ${dayHeaders}
          ${dayCells}
        </div>
        ${detailHTML}
        <div class="cal-legend">
          <span class="muted small" style="font-weight:700;">Referencias de color:</span>
          ${legendItems}
        </div>
      </div>
    `;
  }

  function bindMonthlyCalendar() {
    const prev = document.getElementById("btn-cal-prev");
    if (prev) prev.onclick = () => {
      calMonth--;
      if (calMonth < 0) { calMonth = 11; calYear--; }
      calSelectedDay = null;
      renderCursos();
    };
    const next = document.getElementById("btn-cal-next");
    if (next) next.onclick = () => {
      calMonth++;
      if (calMonth > 11) { calMonth = 0; calYear++; }
      calSelectedDay = null;
      renderCursos();
    };
    const todayBtn = document.getElementById("btn-cal-today");
    if (todayBtn) todayBtn.onclick = () => {
      const now = new Date();
      calYear = now.getFullYear();
      calMonth = now.getMonth();
      calSelectedDay = now.getDate();
      renderCursos();
    };
    document.querySelectorAll("[data-cal-day]").forEach((cell) => {
      cell.onclick = () => {
        calSelectedDay = parseInt(cell.dataset.calDay, 10);
        renderCursos();
      };
    });
  }

  function horarioSemanalHTML() {
    const days = [
      { d: 1, name: "Lunes" },
      { d: 2, name: "Martes" },
      { d: 3, name: "Miércoles" },
      { d: 4, name: "Jueves" },
      { d: 5, name: "Viernes" }
    ];
    const cols = days.map(({ d, name }) => {
      const classes = HORARIOS.filter((h) => h.dia === d);
      const items = classes.map((c) => {
        const mc = getMateriaColor(c.mat);
        return `
        <div class="sched-card" style="border-left: 4px solid ${mc.color}; margin-bottom:8px;">
          <p class="sched-h mono-label">${c.ini} – ${c.fin}</p>
          <p class="sched-mat" style="font-size:13px; font-weight:700;">${esc(c.mat)}</p>
          <div class="sched-sub">
            <span class="material-symbols-outlined" style="font-size:14px;">badge</span>
            <span>Com. ${esc(c.com)}</span>
          </div>
        </div>`;
      }).join("") || `<div class="empty-note" style="padding:12px 8px; font-size:12px;">Sin clases</div>`;
      return `
      <div style="flex:1; min-width:170px;">
        <div class="sec-head-row" style="margin-bottom:8px;">
          <h3 style="font-size:14px; font-weight:700;">${name}</h3>
        </div>
        <div>${items}</div>
      </div>`;
    }).join("");

    return `
    <section class="panel-sec">
      <div class="sec-head-row">
        <div class="sec-title"><span class="material-symbols-outlined">schedule</span><h2>Horario Semanal de Cursada</h2></div>
      </div>
      <div style="display:flex; gap:12px; overflow-x:auto; padding-bottom:8px;">
        ${cols}
      </div>
    </section>`;
  }

  function agendaHTML() {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const rows = AGENDA.map((x) => {
      const d = evalDateOf(x.fecha);
      const past = d ? d < today : false;
      return `
      <div class="eval-row${past ? " past" : ""}">
        <span class="ev-mat">${materiaTagHTML(x.mat)}</span>
        <span class="ev-desc">${x.desc ? esc(x.desc) : "—"}</span>
        <span class="ev-tag ${evalTone(x.tipo)}">${esc(x.tipo)}</span>
        <span class="ev-date">${esc(x.fecha)}</span>
      </div>`;
    }).join("");
    return `
    <section class="panel-sec">
      <div class="sec-head-row">
        <div class="sec-title"><span class="material-symbols-outlined">edit_calendar</span><h2>Agenda Completa de Evaluaciones</h2></div>
        <span class="day-pill mono-label">${AGENDA.length} fechas</span>
      </div>
      <div class="eval-head"><span>Materia</span><span>Descripción</span><span>Tipo</span><span>Fecha</span></div>
      <div class="eval-list">${rows}</div>
    </section>`;
  }

  function tasksList() {
    try {
      const arr = window.QuizStore.loadTasks();
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }

  function saveTasksList(list) {
    try { window.QuizStore.saveTasks(list.slice(0, 50)); } catch (e) {}
  }

  function tareasHTML() {
    const list = tasksList().slice().sort((a, b) => (a.done - b.done) || ((b.ts || 0) - (a.ts || 0)));
    const mats = loadCourses();
    const rows = list.map((t) => {
      const mc = t.mat ? getMateriaColor(t.mat) : null;
      return `
      <label class="task-row${t.done ? " done" : ""}">
        <input type="checkbox" data-task-check="${t.id}"${t.done ? " checked" : ""}>
        <span class="task-txt">${esc(t.txt)}</span>
        ${t.mat ? `<span class="mat-chip" style="font-size:10.5px; padding:2px 8px; background:${mc ? mc.bg : 'var(--panel)'}; color:${mc ? mc.color : 'inherit'}; border-color:${mc ? mc.color : 'currentColor'}50;"><span class="mat-dot" style="width:6px; height:6px; background:${mc ? mc.color : 'currentColor'};"></span>${esc(t.mat)}</span>` : ""}
        <button class="task-del" data-task-del="${t.id}" type="button" title="Borrar tarea"><span class="material-symbols-outlined">close</span></button>
      </label>`;
    }).join("");
    return `
    <section class="panel-sec">
      <div class="sec-head-row">
        <div class="sec-title"><span class="material-symbols-outlined">checklist</span><h2>Lista de Tareas</h2></div>
        <button class="link-btn" id="btn-task-new"><span class="material-symbols-outlined">add</span>Nueva</button>
      </div>
      <div class="tasks-list">${rows || `<div class="empty-note">Sin tareas. Sumá una con «Nueva».</div>`}</div>
      <div class="task-add" id="task-add" hidden>
        <textarea class="input" id="task-new-txt" maxlength="280" rows="3" placeholder="¿Qué tenés que hacer? (Escribí acá, Enter para guardar)" style="resize:vertical; min-height:68px; font-size:14px; line-height:1.45; width:100%; box-sizing:border-box;"></textarea>
        <div class="task-add-row">
          <label class="field-label visually-hidden" for="task-new-mat">Materia</label>
          <select class="input sm" id="task-new-mat" style="flex:1; min-width:0;">
            <option value="">General (sin materia)</option>
            ${mats.map((m) => `<option value="${esc(m.name)}">${esc(m.name)}</option>`).join("")}
          </select>
          <button class="btn primary sm" id="task-new-save" type="button" style="display:inline-flex; align-items:center; gap:4px; flex:none;">
            <span class="material-symbols-outlined" style="font-size:16px;">add</span> Agregar
          </button>
        </div>
      </div>
    </section>`;
  }

  function bindTareas() {
    const btnNew = document.getElementById("btn-task-new");
    const addRow = document.getElementById("task-add");
    if (!btnNew || !addRow) return;
    btnNew.addEventListener("click", () => {
      addRow.hidden = !addRow.hidden;
      if (!addRow.hidden) {
        const txt = document.getElementById("task-new-txt");
        if (txt) txt.focus();
      }
    });

    const doSave = () => {
      const txtEl = document.getElementById("task-new-txt");
      const matEl = document.getElementById("task-new-mat");
      const txt = txtEl ? txtEl.value.trim() : "";
      if (!txt) { toast("Escribí la tarea primero."); return; }
      const list = tasksList();
      list.push({ id: Date.now().toString(36), txt, mat: matEl ? matEl.value : "", done: false, ts: Date.now() });
      saveTasksList(list);
      renderTareas();
    };

    const btnSave = document.getElementById("task-new-save");
    if (btnSave) btnSave.addEventListener("click", doSave);

    const txtEl = document.getElementById("task-new-txt");
    if (txtEl) {
      txtEl.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          doSave();
        }
      });
    }

    document.querySelectorAll("[data-task-check]").forEach((c) => {
      c.addEventListener("change", () => {
        const list = tasksList();
        const t = list.find((x) => x.id === c.dataset.taskCheck);
        if (t) { t.done = c.checked; saveTasksList(list); renderTareas(); }
      });
    });
    document.querySelectorAll("[data-task-del]").forEach((b) => {
      b.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        saveTasksList(tasksList().filter((x) => x.id !== b.dataset.taskDel));
        renderTareas();
      });
    });
  }

  function renderTareas() {
    const wrap = document.getElementById("home-tareas");
    if (!wrap) return;
    wrap.innerHTML = tareasHTML();
    bindTareas();
  }

  function renderHome() {
    const qs = S().questionnaires.slice();
    const restricted = canViewRestricted();

    // Sort quizzes by activity (most frequent/recent first)
    qs.sort((a, b) => getQuizActivityScore(b.hash) - getQuizActivityScore(a.hash));

    const totalQz = qs.length;
    const limit = (!showAllHomeQuizzes && totalQz > 2) ? 2 : totalQz;
    const displayQs = qs.slice(0, limit);

    const activeCards = displayQs.map((qq, i) => {
      const st = Quiz.statsFor(qq.hash);
      if (!st) return "";
      return activeCardHTML(qq, i, st);
    }).join("");

    const toggleBar = totalQz > 2 ? `
      <div class="frequent-toggle-bar">
        <span class="frequent-badge">
          <span class="material-symbols-outlined" style="font-size:15px;">bolt</span>
          ${showAllHomeQuizzes ? `Mostrando todos los cuestionarios (${totalQz})` : `Tus ${limit} cuestionarios más frecuentes`}
        </span>
        <button class="link-btn" id="btn-toggle-quizzes" type="button">
          ${showAllHomeQuizzes ? `Mostrar solo los más frecuentes (2)` : `Ver todos (${totalQz})`}
        </button>
      </div>` : "";

    view(`
      <div class="home-wrap">
        ${restricted ? homeDailyStripHTML() : ""}
        <div class="home-grid">
          <div class="hg-main">
            <section class="panel-sec">
              <div class="sec-head-row">
                <div class="sec-title"><span class="material-symbols-outlined">bolt</span><h2>Quizzes activos</h2></div>
                <button class="link-btn" id="btn-ver-todos">Ir a Materias →</button>
              </div>
              ${toggleBar}
              <div class="exam-grid cols-2">${activeCards || `
                <div class="card center">
                  <h2>Nada por acá todavía</h2>
                  <p class="muted">Subí un CSV desde la sección Materias para crear tu primer cuestionario.</p>
                  <button class="btn primary" id="btn-empty-cursos">Ir a Materias <span class="material-symbols-outlined">arrow_forward</span></button>
                </div>`}</div>
            </section>
          </div>
          <aside class="hg-side">
            ${restricted ? `<div id="home-tareas">${tareasHTML()}</div>` : ""}
          </aside>
        </div>
      </div>
    `);

    displayQs.forEach((qq) => bindExamCard(qq.hash, qq));
    bindTareas();

    const toggleBtn = document.getElementById("btn-toggle-quizzes");
    if (toggleBtn) {
      toggleBtn.addEventListener("click", () => {
        showAllHomeQuizzes = !showAllHomeQuizzes;
        renderHome();
      });
    }

    const stripGo = document.getElementById("strip-go-horarios");
    if (stripGo) {
      stripGo.addEventListener("click", () => {
        activeCursosTab = "horarios";
        navigate("cursos");
      });
    }

    const verTodos = document.getElementById("btn-ver-todos");
    if (verTodos) verTodos.addEventListener("click", () => {
      activeCursosTab = "quizzes";
      navigate("cursos");
    });
    const emptyBtn = document.getElementById("btn-empty-cursos");
    if (emptyBtn) emptyBtn.addEventListener("click", () => {
      activeCursosTab = "quizzes";
      navigate("cursos");
    });
  }

  function loadCourses() {
    try {
      const arr = window.QuizStore.loadCourses();
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }

  let coursesPushTimer = null;

  function schedulePublish() {
    if (!isOwner()) return;
    const C = window.Cloud;
    if (!C || typeof C.publishCourses !== "function") return;
    if (coursesPushTimer) clearTimeout(coursesPushTimer);
    coursesPushTimer = setTimeout(() => {
      coursesPushTimer = null;
      C.publishCourses(window.QuizStore.loadCourses()).catch(() => {
        toast("No se pudieron publicar las materias (revisá tu conexión).");
      });
    }, 900);
  }

  function refreshCoursesFromCloud() {
    const C = window.Cloud;
    if (!C || typeof C.fetchPublicCourses !== "function" || !C.isConfigured()) return;
    C.fetchPublicCourses().then((list) => {
      if (!Array.isArray(list)) return;
      try { localStorage.setItem("quiz.courses", JSON.stringify(list)); } catch (e) { return; }
      if (currentView === "cursos" || currentView === "inicio") refreshView();
      if (openCourseId) renderCourseModal();
    }).catch(() => {});
  }

  function updateCourses(list) {
    window.QuizStore.saveCourses(list);
    schedulePublish();
    if (currentView === "cursos") renderCursos();
    if (openCourseId) renderCourseModal();
  }

  function findCourse(id) {
    return loadCourses().find((c) => c.id === id);
  }

  function materiaOf(hash) {
    return loadCourses().find((c) => Array.isArray(c.quizzes) && c.quizzes.indexOf(hash) !== -1) || null;
  }

  function isOwner() {
    const C = window.Cloud;
    return !!(C && typeof C.isAdmin === "function" && C.isAdmin());
  }

  function canViewRestricted() {
    const C = window.Cloud;
    if (!C || !C.user()) return false;
    return !!(C.isAdmin() && typeof C.isVerified === "function" && C.isVerified());
  }

  function safeUrl(u) {
    const s = String(u || "").trim();
    return /^https?:\/\//i.test(s) ? s : "";
  }

  function questionnaireCardHTML(st, i) {
    const tone = toneOf(i);
    const toneCls = tone === "tone-green" ? "tone-green" : tone === "tone-purple" ? "tone-purple" : "tone-blue";
    const seen = st.seen != null ? st.seen : st.total;
    const pct = seen ? Math.round((st.mastered / seen) * 100) : 0;
    const mat = materiaOf(st.hash);
    return `
      <div class="exam-card ${tone}">
        <div class="exam-card-body">
          <div class="course-top">
            <div class="mat-titling">
              <h3>${esc(st.name)}</h3>
              <span class="eyebrow ${toneCls}">${mat ? esc(mat.name) : "Sin materia"}</span>
            </div>
            <div class="pct-badge ${toneCls}">${pct}%</div>
          </div>
          <div>
            <div class="progress ${tone === "tone-green" ? "green" : ""} ${tone === "tone-purple" ? "grad" : ""}"><span style="width:${pct}%"></span></div>
          </div>
          <div class="exam-card-meta">
            <span><b>${st.total}</b> preguntas</span><span>·</span>
            <span><b>${st.today}</b> para hoy</span><span>·</span>
            <span><b>${st.mastered}</b> dominadas</span>
          </div>
          <div class="session-row">
            <label class="field-label visually-hidden" for="sel-size-${st.hash}">Cantidad de preguntas</label>
            <select class="input sm" id="sel-size-${st.hash}">${sizeOptions(st)}</select>
            <label class="field-label visually-hidden" for="sel-mode-${st.hash}">Tipo de sesión</label>
            <select class="input sm" id="sel-mode-${st.hash}">${modeOptions(st)}</select>
            <button class="play-fab" id="btn-start-${st.hash}" title="Comenzar sesión">
              <span class="material-symbols-outlined">play_arrow</span>
            </button>
            ${(() => {
              const opts = catOptions(st.hash);
              return opts ? `
            <label class="field-label visually-hidden" for="sel-cat-${st.hash}">Categoría</label>
            <select class="input sm cat-sel" id="sel-cat-${st.hash}">${opts}</select>` : "";
            })()}
          </div>
          ${Quiz.draftOf(st.hash) ? `
          <button class="draft-chip" id="btn-resume-${st.hash}">
            <span class="material-symbols-outlined">history</span>
            Continuar sesión guardada
          </button>` : ""}
        </div>
      </div>`;
  }

  function courseProgressOf(c) {
    let mastered = 0, seen = 0;
    (c.quizzes || []).forEach((h) => {
      const st = Quiz.statsFor(h);
      if (!st) return;
      seen += st.seen != null ? st.seen : st.total;
      mastered += st.mastered;
    });
    return { pct: seen ? Math.round((mastered / seen) * 100) : 0 };
  }

  function courseCardHTML(c, i) {
    const owner = isOwner();
    const nq = (c.quizzes || []).length;
    const nm = (c.material || []).length;
    const nl = (c.links || []).length;
    const tone = toneOf(i);
    const toneCls = tone === "tone-green" ? "tone-green" : tone === "tone-purple" ? "tone-purple" : "tone-blue";
    const barCls = `${tone === "tone-green" ? "green" : ""} ${tone === "tone-purple" ? "grad" : ""}`;
    const pct = nq ? courseProgressOf(c).pct : 0;
    const status = !nq ? "Sin quizzes" : pct === 0 ? "Sin empezar" : pct < 35 ? "Recién arrancada" : "En progreso";
    return `
      <article class="mat-card ${tone} course-card">
        <div class="mat-blob" aria-hidden="true"></div>
        <div class="mat-inner">
          <div class="mat-thumb"><span class="material-symbols-outlined">${EXAM_ICONS[(i + 1) % EXAM_ICONS.length]}</span></div>
          <div class="mat-main">
            <div class="mat-top">
              <div class="mat-titling">
                <div style="margin-bottom:4px;">${materiaTagHTML(c.name)}</div>
                <h3>${esc(c.name)}${owner ? `
                <button class="mini-edit" data-rename-course="${c.id}" title="Renombrar materia">
                  <span class="material-symbols-outlined">edit</span>
                </button>` : ""}</h3>
              </div>
              <div class="pct-badge ${toneCls}">${pct}%</div>
            </div>
            <div class="progress ${barCls}"><span style="width:${pct}%"></span></div>
            <div class="exam-card-meta">
              <span><b>${nq}</b> quizzes</span><span>·</span>
              <span><b>${nm}</b> material</span><span>·</span>
              <span><b>${nl}</b> links</span>
            </div>
            <div class="course-actions">
              <button class="course-act" data-open-course="${c.id}" data-tab="material">
                <span class="material-symbols-outlined">folder</span>Material
              </button>
              <button class="course-act" data-open-course="${c.id}" data-tab="quizzes">
                <span class="material-symbols-outlined">quiz</span>Quizzes
              </button>
              <button class="course-act" data-open-course="${c.id}" data-tab="links">
                <span class="material-symbols-outlined">link</span>Links
              </button>
            </div>
          </div>
        </div>
      </article>`;
  }

  function ownerHeadExtra() {
    return isOwner()
      ? `<button class="btn ghost sm-new" id="btn-new-course"><span class="material-symbols-outlined">add</span>Nueva materia</button>`
      : "";
  }

  function createCourse() {
    if (!isOwner()) { toast("Solo la cuenta admin puede crear materias."); return; }
    openCreateMateria();
  }

  function closeCreateMateria() {
    const ov = document.getElementById("create-overlay");
    if (ov) ov.remove();
  }

  function openCreateMateria() {
    let ov = document.getElementById("create-overlay");
    if (!ov) {
      ov = document.createElement("div");
      ov.id = "create-overlay";
      ov.className = "modal-overlay";
      ov.addEventListener("click", (e) => { if (e.target === ov) closeCreateMateria(); });
      document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeCreateMateria(); });
      document.body.appendChild(ov);
    }
    const qs = S().questionnaires;
    ov.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true">
      <div class="modal-head">
        <span class="material-symbols-outlined accent-ic">add_circle</span>
        <h3>Nueva materia</h3>
        <button class="mini-edit" id="cr-close" title="Cerrar"><span class="material-symbols-outlined">close</span></button>
      </div>
      <div class="modal-body">
        <label class="field-label" for="cr-name">Nombre de la materia</label>
        <input class="input" id="cr-name" placeholder="Ej: Análisis de Sistemas">
        <p class="field-label">Quizzes que van a vivir acá</p>
        ${qs.map((qq) => `
        <div class="assign-row">
          <label class="check-line">
            <input type="checkbox" data-cr-qz="${qq.hash}">
            <span>${esc(qq.name)}</span>
          </label>
        </div>`).join("") || `<p class="muted small">Todavía no hay cuestionarios cargados.</p>`}
      </div>
      <div class="modal-foot">
        <button class="btn ghost" id="cr-cancel">Cancelar</button>
        <button class="btn primary" id="cr-create"><span class="material-symbols-outlined">add</span>Crear materia</button>
      </div>
    </div>`;
    const nm = ov.querySelector("#cr-name");
    const doCreate = () => {
      const name = (nm.value || "").trim();
      if (!name) { toast("Ponele un nombre a la materia."); nm.focus(); return; }
      const hashes = [];
      ov.querySelectorAll("[data-cr-qz]:checked").forEach((cb) => hashes.push(cb.dataset.crQz));
      const list = loadCourses();
      list.push({ id: Date.now().toString(36), name, quizzes: hashes, material: [], links: [] });
      updateCourses(list);
      closeCreateMateria();
      toast(`Materia "${name}" creada.`);
    };
    ov.querySelector("#cr-create").onclick = doCreate;
    ov.querySelector("#cr-cancel").onclick = closeCreateMateria;
    ov.querySelector("#cr-close").onclick = closeCreateMateria;
    nm.addEventListener("keydown", (e) => { if (e.key === "Enter") doCreate(); });
    setTimeout(() => { try { nm.focus(); } catch (err) {} }, 0);
  }

  function renameCourse(id) {
    if (!isOwner()) { toast("Solo la cuenta admin puede editar materias."); return; }
    const c = findCourse(id);
    if (!c) return;
    const name = (window.prompt("Nuevo nombre de la materia:", c.name) || "").trim();
    if (!name) return;
    mutateCourse(id, (cc) => { cc.name = name; });
    toast("Materia renombrada.");
  }

  function deleteCourse(id) {
    if (!isOwner()) { toast("Solo la cuenta admin puede borrar materias."); return; }
    const c = findCourse(id);
    if (!c) return;
    if (!window.confirm(`¿Eliminar la materia "${c.name}"? Los quizzes no se borran.`)) return;
    updateCourses(loadCourses().filter((x) => x.id !== id));
    closeCourseModal();
    toast("Materia eliminada.");
  }

  function mutateCourse(id, fn) {
    const list = loadCourses();
    const c = list.find((x) => x.id === id);
    if (!c) return;
    fn(c);
    updateCourses(list);
  }

  let openCourseId = null;
  let openCourseTab = "quizzes";

  function ensureModal() {
    let ov = document.getElementById("modal-overlay");
    if (!ov) {
      ov = document.createElement("div");
      ov.id = "modal-overlay";
      ov.className = "modal-overlay";
      ov.addEventListener("click", (e) => { if (e.target === ov) closeCourseModal(); });
      document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeCourseModal(); });
      document.body.appendChild(ov);
    }
    return ov;
  }

  function closeCourseModal() {
    openCourseId = null;
    const ov = document.getElementById("modal-overlay");
    if (ov) ov.remove();
  }

  function openCourseModal(id, tab) {
    openCourseId = id;
    openCourseTab = tab || "quizzes";
    renderCourseModal();
  }

  function renderCourseModal() {
    const c = findCourse(openCourseId);
    if (!c) { closeCourseModal(); return; }
    const owner = isOwner();
    const qs = S().questionnaires;

    let body = "";
    if (openCourseTab === "quizzes") {
      body = qs.map((qq) => {
        const st = Quiz.statsFor(qq.hash);
        const on = (c.quizzes || []).indexOf(qq.hash) !== -1;
        return `
        <div class="assign-row">
          <label class="check-line">
            <input type="checkbox" data-assign="${qq.hash}" ${on ? "checked" : ""} ${owner ? "" : "disabled"}>
            <span>${esc(qq.name)}</span>
          </label>
          <span class="mono-label muted">${st ? st.total + " preg." : ""}</span>
          <button class="mini-edit play-mini" data-play="${qq.hash}" title="Practicar este quiz">
            <span class="material-symbols-outlined">play_arrow</span>
          </button>
          <button class="mini-edit play-mini" data-play-flash="${qq.hash}" title="Flashcards de este quiz">
            <span class="material-symbols-outlined">style</span>
          </button>
        </div>`;
      }).join("") || `<p class="muted small">Todavía no hay cuestionarios cargados.</p>`;
      if (!owner) body += `<p class="muted small lock-note"><span class="material-symbols-outlined">lock</span>Solo la cuenta de Orianna puede asignar quizzes.</p>`;
    } else {
      const kind = openCourseTab;
      const items = Array.isArray(c[kind]) ? c[kind] : [];
      body = items.map((it, idx) => `
        <div class="link-row">
          <span class="material-symbols-outlined">${kind === "material" ? "description" : "link"}</span>
          <a href="${esc(it.url)}" target="_blank" rel="noopener noreferrer">${esc(it.name)}</a>
          ${owner ? `<button class="mini-edit del" data-unlink="${idx}" title="Quitar">
            <span class="material-symbols-outlined">close</span>
          </button>` : ""}
        </div>`).join("") || `<p class="muted small">Todavía no hay nada acá.</p>`;
      if (owner) body += `
        <form class="link-add" data-kind="${kind}">
          <input class="input sm" name="lkname" placeholder="${kind === "material" ? "Nombre del material" : "Nombre del link"}" required>
          <input class="input sm" name="lkurl" placeholder="https://…" required>
          <button class="btn primary link-add-btn" type="submit"><span class="material-symbols-outlined">add</span>Agregar</button>
        </form>`;
    }

    const tabs = [["material", "folder", "Material"], ["quizzes", "quiz", "Quizzes"], ["links", "link", "Links"]];
    const ci = Math.max(0, loadCourses().findIndex((x) => x && x.id === c.id));
    const ov = ensureModal();
    ov.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true">
      <div class="modal-head">
        <span class="material-symbols-outlined accent-ic">${EXAM_ICONS[(ci + 1) % EXAM_ICONS.length]}</span>
        <h3>${esc(c.name)}</h3>
        ${owner ? `<button class="mini-edit" id="m-rename" title="Renombrar"><span class="material-symbols-outlined">edit</span></button>` : ""}
        <button class="mini-edit" id="m-close" title="Cerrar"><span class="material-symbols-outlined">close</span></button>
      </div>
      <div class="modal-tabs">${tabs.map(([tid, ic, label]) => `
        <button class="modal-tab ${openCourseTab === tid ? "active" : ""}" data-tab="${tid}">
          <span class="material-symbols-outlined">${ic}</span>${label}
        </button>`).join("")}
      </div>
      <div class="modal-body">${body}</div>
      <div class="modal-foot">
        ${owner ? `<button class="btn ghost danger" id="m-del"><span class="material-symbols-outlined">delete</span>Eliminar materia</button>`
                : `<span class="mono-label muted">solo lectura</span>`}
        <button class="btn ghost" id="m-close2">Cerrar</button>
      </div>
    </div>`;

    ov.querySelectorAll("[data-tab]").forEach((b) => {
      b.onclick = () => { openCourseTab = b.dataset.tab; renderCourseModal(); };
    });
    const xc = ov.querySelector("#m-close"); if (xc) xc.onclick = closeCourseModal;
    const xc2 = ov.querySelector("#m-close2"); if (xc2) xc2.onclick = closeCourseModal;
    const rn = ov.querySelector("#m-rename"); if (rn) rn.onclick = () => renameCourse(c.id);
    const dl = ov.querySelector("#m-del"); if (dl) dl.onclick = () => deleteCourse(c.id);

    ov.querySelectorAll("[data-play]").forEach((b) => {
      b.onclick = () => { closeCourseModal(); startQuiz(b.dataset.play); };
    });
    ov.querySelectorAll("[data-play-flash]").forEach((b) => {
      b.onclick = () => { closeCourseModal(); startFlashcards(b.dataset.playFlash); };
    });

    ov.querySelectorAll("[data-assign]").forEach((cb) => {
      cb.onchange = () => {
        mutateCourse(c.id, (cc) => {
          cc.quizzes = Array.isArray(cc.quizzes) ? cc.quizzes.slice() : [];
          const i = cc.quizzes.indexOf(cb.dataset.assign);
          if (cb.checked && i === -1) cc.quizzes.push(cb.dataset.assign);
          if (!cb.checked && i !== -1) cc.quizzes.splice(i, 1);
        });
      };
    });

    ov.querySelectorAll("[data-unlink]").forEach((b) => {
      b.onclick = () => {
        mutateCourse(c.id, (cc) => {
          const items = Array.isArray(cc[openCourseTab]) ? cc[openCourseTab] : [];
          items.splice(parseInt(b.dataset.unlink, 10), 1);
          cc[openCourseTab] = items;
        });
      };
    });

    const form = ov.querySelector(".link-add");
    if (form) {
      const nameEl = form.querySelector("[name=lkname]");
      const urlEl = form.querySelector("[name=lkurl]");
      form.onsubmit = (e) => {
        e.preventDefault();
        const name = nameEl.value.trim();
        const url = safeUrl(urlEl.value);
        if (!url) { toast("El link tiene que empezar con http:// o https://"); return; }
        mutateCourse(c.id, (cc) => {
          cc[openCourseTab] = Array.isArray(cc[openCourseTab]) ? cc[openCourseTab] : [];
          cc[openCourseTab].push({ name: name || url, url });
        });
        nameEl.value = "";
        urlEl.value = "";
        toast("Agregado a la materia.");
      };
    }
  }


  function renderCursos() {
    const qs = S().questionnaires;
    const stats = qs.map((qq) => Quiz.statsFor(qq.hash)).filter(Boolean);
    const courses = loadCourses();
    const statOf = (hash) => stats.find((s) => s.hash === hash);
    const cardOf = (qq, i) => {
      const st = statOf(qq.hash);
      return st ? questionnaireCardHTML(st, i) : "";
    };

    const tabsHTML = `
      <div class="sub-nav-tabs">
        <button class="sub-nav-tab ${activeCursosTab === 'quizzes' ? 'active' : ''}" id="tab-sub-quizzes" type="button">
          <span class="material-symbols-outlined">auto_stories</span> Mis Materias y Quizzes
        </button>
        <button class="sub-nav-tab ${activeCursosTab === 'horarios' ? 'active' : ''}" id="tab-sub-horarios" type="button">
          <span class="material-symbols-outlined">calendar_month</span> Horarios y Calendario
        </button>
      </div>`;

    if (activeCursosTab === "horarios") {
      view(`
        ${tabsHTML}
        ${monthlyCalendarHTML()}
        ${horarioSemanalHTML()}
        ${agendaHTML()}
      `);
      bindMonthlyCalendar();
      const tabQ = document.getElementById("tab-sub-quizzes");
      if (tabQ) tabQ.onclick = () => { activeCursosTab = "quizzes"; renderCursos(); };
      return;
    }

    let coursesGrid;
    let headSub;
    let freeSection = "";

    if (!courses.length) {
      coursesGrid = qs.map(cardOf).join("") || `
        <div class="card center">
          <h2>Todavía no hay materias</h2>
          <p class="muted">Creá una con el botón de arriba o subí un CSV abajo.</p>
        </div>`;
      headSub = "";
    } else {
      const assigned = new Set();
      courses.forEach((cc) => (cc.quizzes || []).forEach((h) => assigned.add(h)));
      coursesGrid = courses.map(courseCardHTML).join("") || `
        <div class="card center"><h2>Sin materias</h2><p class="muted">Creá una con el botón de arriba.</p></div>`;
      const freeCards = qs.filter((qq) => !assigned.has(qq.hash)).map(cardOf).join("");
      freeSection = freeCards ? `
      <section class="home-section">
        <div class="sec-head">
          <span class="material-symbols-outlined">select_all</span>
          <div>
            <h2>Quizzes sin materia</h2>
            <p class="muted small sub">Asignalos desde el botón Quizzes de cada materia</p>
          </div>
        </div>
        <div class="exam-grid">${freeCards}</div>
      </section>` : "";
      headSub = "Tus materias con su material, quizzes y links";
    }

    view(`
      ${tabsHTML}
      <section class="home-section">
        <div class="sec-head">
          <span class="material-symbols-outlined">auto_stories</span>
          <div>
            <h2>Mis materias</h2>
            ${headSub ? `<p class="muted small sub">${headSub}</p>` : ""}
          </div>
          ${ownerHeadExtra()}
        </div>
        <div class="exam-grid">${coursesGrid}</div>
      </section>
      <section class="home-section">
        <div class="sec-head">
          <span class="material-symbols-outlined">event</span>
          <div>
            <h2>Fechas de parciales</h2>
            <p class="muted small sub">Elegí la materia y fijale la fecha límite — corta la planificación de repasos</p>
          </div>
        </div>
        <div id="fechas-cursos"></div>
      </section>
      ${freeSection}
      <section class="home-section">
        <div class="card">
          <h2>Agregar cuestionario</h2>
          <div class="dropzone compact" id="dropzone2">
            <div>Arrastrá el CSV acá o hacé clic para elegirlo — después elegís a qué materia pertenece</div>
          </div>
          <input type="file" id="file2" accept=".csv,text/csv,text/plain" hidden>
        </div>
      </section>
      <section class="home-section">
        <div class="card">
          <h2>Copia de seguridad y datos</h2>
          <p class="muted small">Podés exportar todo tu progreso y configuración en un archivo JSON para tener un respaldo o transferirlo a otro dispositivo.</p>
          <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:12px;">
            <button class="btn sm" id="btn-export-backup" type="button"><span class="material-symbols-outlined">download</span> Exportar copia (JSON)</button>
            <label class="btn sm" style="cursor:pointer; display:inline-flex; align-items:center; gap:6px;">
              <span class="material-symbols-outlined">upload</span> Restaurar copia
              <input type="file" id="input-import-backup" accept=".json" style="display:none;">
            </label>
            ${Cloud && Cloud.isConfigured() && Cloud.user() ? `
            <button class="btn danger sm" id="btn-reset-all" type="button">Reiniciar progreso</button>
            ` : ""}
          </div>
        </div>
      </section>
    `);

    const tabH = document.getElementById("tab-sub-horarios");
    if (tabH) tabH.onclick = () => { activeCursosTab = "horarios"; renderCursos(); };
    const nb = document.getElementById("btn-new-course");
    if (nb) nb.onclick = createCourse;
    document.querySelectorAll("[data-open-course]").forEach((b) => {
      b.onclick = () => openCourseModal(b.dataset.openCourse, b.dataset.tab);
    });
    document.querySelectorAll("[data-rename-course]").forEach((b) => {
      b.onclick = () => renameCourse(b.dataset.renameCourse);
    });
    qs.forEach((qq) => {
      if (document.getElementById("btn-start-" + qq.hash)) bindExamCard(qq.hash, qq);
    });
    bindUpload("dropzone2", "file2");
    const fc = document.getElementById("fechas-cursos");
    if (fc) {
      fc.innerHTML = fechasBoxHTML("cur");
      bindFechasBox("cur");
    }
    bindBackupControls();
  }

  function bindBackupControls() {
    const expBtn = document.getElementById("btn-export-backup");
    if (expBtn) {
      expBtn.addEventListener("click", () => {
        if (!window.QuizStore || !window.QuizStore.exportData) return;
        const data = window.QuizStore.exportData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        const dateStr = new Date().toISOString().slice(0, 10);
        a.href = url;
        a.download = `studori-backup-${dateStr}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast("Copia de seguridad descargada.");
      });
    }
    const impInput = document.getElementById("input-import-backup");
    if (impInput) {
      impInput.addEventListener("change", (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const res = window.QuizStore.importData(reader.result);
            if (res.ok) {
              if (window.Quiz && window.Quiz.reloadProgress) window.Quiz.reloadProgress();
              if (window.Cloud && window.Cloud.flush) window.Cloud.flush();
              toast(`Restaurados ${res.count} registros.`);
              refreshView();
            } else {
              toast("Error al importar: " + (res.error || "formato inválido"));
            }
          } catch (err) {
            toast("No se pudo leer el archivo.");
          }
        };
        reader.readAsText(file);
      });
    }
    const resetAll = document.getElementById("btn-reset-all");
    if (resetAll) resetAll.addEventListener("click", () => {
      if (!confirm("¿Seguro que querés borrar TODO el progreso (de todos los cuestionarios, en este dispositivo y en la nube)? Esta acción no se puede deshacer.")) return;
      if (window.Cloud && typeof window.Cloud.resetProgress === "function") {
        window.Cloud.resetProgress().then(refreshView);
      } else {
        window.QuizStore.clearAll();
        refreshView();
      }
    });
  }

  function weekPlanData() {
    const days = [];
    const base = new Date(); base.setHours(0, 0, 0, 0);
    for (let i = 0; i < 7; i++) {
      const d = new Date(base); d.setDate(base.getDate() + i);
      const iso = isoOf(d.getFullYear(), d.getMonth(), d.getDate());
      let n = 0;
      S().questionnaires.forEach((qq) => {
        const by = Quiz.scheduledByDayFor(qq.hash);
        n += (by[iso] || []).length;
      });
      days.push({ d, iso, n });
    }
    return days;
  }

  function weekChartHTML() {
    const days = weekPlanData();
    const max = Math.max(...days.map((x) => x.n), 1);
    const LETTERS = ["D", "L", "M", "X", "J", "V", "S"];
    const cols = days.map((x, i) => {
      const h = Math.round((x.n / max) * 100);
      return `
      <div class="wc-col ${i === 0 ? "today" : ""}">
        <div class="wc-slot" title="${x.n} pregunta${x.n === 1 ? "" : "s"} planificadas">
          <div class="wc-bar" style="height:${Math.max(x.n ? 8 : 3, h)}%"></div>
        </div>
        <span class="wc-day">${LETTERS[x.d.getDay()]}</span>
      </div>`;
    }).join("");
    const total = days.reduce((a, x) => a + x.n, 0);
    return `
    <div class="widget">
      <div class="widget-head">
        <h3>Repasos próximos</h3>
        <span class="mono-label muted">${total} esta semana</span>
      </div>
      <div class="week-chart">${cols}</div>
    </div>`;
  }

  function perCourseProgressHTML() {
    const qs = S().questionnaires;
    const stats = qs.map((qq) => Quiz.statsFor(qq.hash)).filter(Boolean);
    const rows = stats.map((st) => {
      const seen = st.seen != null ? st.seen : st.total;
      const pct = seen ? Math.round((st.mastered / seen) * 100) : 0;
      return `
      <div class="prog-row">
        <div class="prog-head">
          <h4>${esc(st.name)}</h4>
          <span class="mono-label">${st.mastered}/${st.total} dominadas · ${st.failed} falladas</span>
        </div>
        <div class="progress grad"><span style="width:${pct}%"></span></div>
      </div>`;
    }).join("");
    return `
    <div class="widget">
      <div class="widget-head">
        <h3>Por cuestionario</h3>
        <span class="material-symbols-outlined">monitoring</span>
      </div>
      ${rows || `<div class="empty-note">Cargá un cuestionario para ver tu avance.</div>`}
    </div>`;
  }

  function renderProgreso() {
    const qs = S().questionnaires;
    const stats = qs.map((qq) => Quiz.statsFor(qq.hash)).filter(Boolean);
    const agg = { total: 0, today: 0, mastered: 0, failed: 0 };
    stats.forEach((st) => { agg.total += st.total; agg.today += st.today; agg.mastered += st.mastered; agg.failed += st.failed; });

    view(`
      <section class="home-section">
        <div class="sec-head">
          <span class="material-symbols-outlined">query_stats</span>
          <div>
            <h2>Progreso general</h2>
            <p class="muted small sub">Todo tu avance en un lugar</p>
          </div>
        </div>
        ${S().warnings.length && !warningsDismissed ? `
        <div class="card warn-card" id="warn-card">
          <div class="card-head">
            <h2>Filas omitidas (${S().warnings.length})</h2>
            <button class="btn icon" id="btn-warn-close" title="Cerrar aviso">✕</button>
          </div>
          <p class="muted small">Se cargaron las preguntas válidas. Estas filas se ignoraron:</p>
          <div class="error-list">${S().warnings.map((w) => `<div class="error-item">${esc(w)}</div>`).join("")}</div>
        </div>` : ""}
        <div class="stat-cards">
          <div class="stat-card">
            <div class="stat-ic"><span class="material-symbols-outlined">trending_up</span></div>
            <div><p class="lbl">Preguntas totales</p><p class="big">${agg.total}</p></div>
          </div>
          <div class="stat-card">
            <div class="stat-ic amber"><span class="material-symbols-outlined">timer</span></div>
            <div><p class="lbl">Para hoy</p><p class="big">${agg.today}</p></div>
          </div>
          <div class="stat-card">
            <div class="stat-ic green"><span class="material-symbols-outlined">task_alt</span></div>
            <div><p class="lbl">Dominadas</p><p class="big">${agg.mastered}</p></div>
          </div>
          <div class="stat-card">
            <div class="stat-ic red"><span class="material-symbols-outlined">error</span></div>
            <div><p class="lbl">Falladas históricas</p><p class="big">${agg.failed}</p></div>
          </div>
        </div>
      </section>
      <section class="home-section">
        <div class="layout">
          <div class="col-main">${perCourseProgressHTML()}</div>
          <aside class="col-side">${weekChartHTML()}${studyWidgetHTML()}</aside>
        </div>
      </section>
      <section class="home-section">
        <div class="card">
          <div class="card-head">
            <h2>Copia de seguridad y datos</h2>
          </div>
          <p class="muted small">Podés exportar todo tu progreso y configuración en un archivo JSON para tener un respaldo o transferirlo a otro dispositivo.</p>
          <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:12px;">
            <button class="btn sm" id="btn-export-backup" type="button"><span class="material-symbols-outlined">download</span> Exportar copia (JSON)</button>
            <label class="btn sm" style="cursor:pointer; display:inline-flex; align-items:center; gap:6px;">
              <span class="material-symbols-outlined">upload</span> Restaurar copia
              <input type="file" id="input-import-backup" accept=".json" style="display:none;">
            </label>
            ${Cloud && Cloud.isConfigured() && Cloud.user() ? `
            <button class="btn danger sm" id="btn-reset-all" type="button">Reiniciar progreso</button>
            ` : ""}
          </div>
        </div>
      </section>
    `);

    paintHomeStudyWidget();
    const warnClose = document.getElementById("btn-warn-close");
    if (warnClose) warnClose.addEventListener("click", () => { warningsDismissed = true; refreshView(); });
    const expBtn = document.getElementById("btn-export-backup");
    if (expBtn) {
      expBtn.addEventListener("click", () => {
        if (!window.QuizStore || !window.QuizStore.exportData) return;
        const data = window.QuizStore.exportData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        const dateStr = new Date().toISOString().slice(0, 10);
        a.href = url;
        a.download = `studori-backup-${dateStr}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast("Copia de seguridad descargada.");
      });
    }
    const impInput = document.getElementById("input-import-backup");
    if (impInput) {
      impInput.addEventListener("change", (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const res = window.QuizStore.importData(reader.result);
            if (res.ok) {
              if (window.Quiz && window.Quiz.reloadProgress) window.Quiz.reloadProgress();
              if (window.Cloud && window.Cloud.flush) window.Cloud.flush();
              toast(`Restaurados ${res.count} registros.`);
              refreshView();
            } else {
              toast("Error al importar: " + (res.error || "formato inválido"));
            }
          } catch (err) {
            toast("No se pudo leer el archivo.");
          }
        };
        reader.readAsText(file);
      });
    }
    const resetAll = document.getElementById("btn-reset-all");
    if (resetAll) resetAll.addEventListener("click", () => {
      if (!confirm("¿Seguro que querés borrar TODO el progreso (de todos los cuestionarios, en este dispositivo y en la nube)? Esta acción no se puede deshacer.")) return;
      if (window.Cloud && typeof window.Cloud.resetProgress === "function") {
        window.Cloud.resetProgress().then(refreshView);
      } else {
        window.QuizStore.clearAll();
        refreshView();
      }
    });
  }

  function conexLoad() {
    const C = window.Conex;
    const today = C.dayKey(new Date());
    const pool = C.buildPool(S().questionnaires);
    if (pool.length < 4) return { pool: [] };
    let saved = null;
    try { saved = window.QuizStore.loadGameStats(); } catch (e) {}
    if (saved && saved.day === today && saved.board) {
      return { pool, today, stats: saved, state: saved.board, scored: !!saved.board.done };
    }
    const puzzle = C.makeDaily(pool, today);
    const fresh = puzzle ? C.newGame(puzzle) : null;
    return { pool, today, stats: saved || {}, state: fresh, scored: false };
  }

  function conexPersist(data) {
    try {
      if (data.state && data.state.done && !data.scored) {
        data.stats = window.Conex.applyResult(Object.assign({}, data.stats || {}), data.state.won, data.state.wrong, data.today);
        delete data.stats.board;
        data.scored = true;
      }
      const s = Object.assign({}, data.stats || {}, { day: data.today, board: data.state });
      window.QuizStore.saveGameStats(s);
    } catch (e) {}
  }

  function conexStatsObj() {
    try {
      const s = window.QuizStore.loadGameStats();
      return s && typeof s === "object" ? s : {};
    } catch (e) { return {}; }
  }

  function paintConexBoard() {
    const root = document.getElementById("cx-board");
    if (!root) return;
    const data = conexData;
    const C = window.Conex;
    if (!data.pool || !data.pool.length) {
      root.innerHTML = `
        <div class="card center">
          <h2>Nada para armar todavía</h2>
          <p class="muted">Conexiones se arma con los conceptos de tus preguntas de cruce o dropdown. Necesito al menos 4 grupos.</p>
          <button class="btn primary" id="cx-go-cursos">Ir a Materias <span class="material-symbols-outlined">arrow_forward</span></button>
        </div>`;
      const b = document.getElementById("cx-go-cursos");
      if (b) b.addEventListener("click", () => navigate("cursos"));
      return;
    }
    const st = data.state;
    const solvedIdx = new Set(st.solved.flatMap((s) => s.idxs));
    const remaining = st.puzzle.tiles.map((t, i) => ({ t, i })).filter((x) => !solvedIdx.has(x.i));
    const selSet = new Set(st.sel);
    const livesDots = [0, 1, 2, 3].map((i) => `<span class="cx-life${i < st.lives ? "" : " off"}"></span>`).join("");
    const groupsHTML = st.solved.map((s) => `
      <div class="cx-group g${s.g}">
        <div class="cx-group-title">${esc(st.puzzle.groups[s.g])}</div>
        <div class="cx-group-words">${s.idxs.map((i) => esc(st.puzzle.tiles[i].t)).join(" · ")}</div>
      </div>`).join("");
    const tilesHTML = remaining.map(({ t, i }) => `
      <button type="button" class="cx-tile${selSet.has(i) ? " sel" : ""}" data-cx="${i}">${esc(t.t)}</button>`).join("");
    const resultHTML = !st.done ? "" : `
      <div class="cx-result ${st.won ? "win" : "lose"}">
        <h3>${st.won ? ["¡Impecable!", "¡Muy bien!", "Bien ahí", "Justo", "Al límite"][st.wrong] : "Se terminaron los intentos"}</h3>
        ${st.solved.length < 4 ? `<div class="cx-missing">${[0, 1, 2, 3].filter((g) => !st.solved.some((s) => s.g === g)).map((g) => `
          <div class="cx-group g${g}"><div class="cx-group-title">${esc(st.puzzle.groups[g])}</div><div class="cx-group-words">${st.puzzle.tiles.filter((t) => t.g === g).map((t) => esc(t.t)).join(" · ")}</div></div>`).join("")}</div>` : ""}
        <button class="btn primary" id="cx-share" type="button">Copiar resultado</button>
        <p class="muted small">Volvé mañana con un puzzle nuevo</p>
      </div>`;
    root.innerHTML = `
      <div class="cx-solved">${groupsHTML}</div>
      ${resultHTML}
      ${!st.done ? `<div class="cx-msg" id="cx-msg"></div>
      <div class="cx-grid" id="cx-grid">${tilesHTML}</div>
      <div class="cx-actions">
        <button class="btn sm" id="cx-shuffle" type="button">Mezclar</button>
        <button class="btn sm" id="cx-clear" type="button"${st.sel.length ? "" : " disabled"}>Limpiar</button>
        <button class="btn primary sm" id="cx-submit" type="button"${st.sel.length === 4 ? "" : " disabled"}>Enviar</button>
      </div>` : ""}
    `;
    document.querySelectorAll("[data-cx]").forEach((b) => {
      b.addEventListener("click", () => {
        C.toggleSel(st, parseInt(b.dataset.cx, 10));
        paintConexBoard();
      });
    });
    const shuffleBtn = document.getElementById("cx-shuffle");
    if (shuffleBtn) shuffleBtn.addEventListener("click", () => {
      C.shuffleBoard(st);
      paintConexBoard();
    });
    const clearBtn = document.getElementById("cx-clear");
    if (clearBtn) clearBtn.addEventListener("click", () => {
      C.clearSel(st);
      paintConexBoard();
    });
    const submitBtn = document.getElementById("cx-submit");
    if (submitBtn) submitBtn.addEventListener("click", () => {
      const res = C.submitSel(st);
      const msgEl0 = document.getElementById("cx-msg");
      if (res === "close") { if (msgEl0) msgEl0.textContent = "¡Una más y formás grupo!"; }
      else if (res === "bad") { if (msgEl0) msgEl0.textContent = "No es grupo."; }
      if (res === "bad" || res === "close") {
        document.querySelectorAll("[data-cx].sel").forEach((b) => b.classList.remove("sel"));
        submitBtn.disabled = true;
        const clearB = document.getElementById("cx-clear");
        if (clearB) clearB.disabled = true;
        const grid = document.getElementById("cx-grid");
        if (grid) {
          grid.classList.add("shake");
          grid.addEventListener("animationend", () => grid.classList.remove("shake"), { once: true });
        }
        setTimeout(() => { const m = document.getElementById("cx-msg"); if (m && !data.state.done) m.textContent = ""; }, 1600);
        conexPersist(data);
        updateConexLives();
        return;
      }
      conexPersist(data);
      paintConexBoard();
    });
    const shareBtn = document.getElementById("cx-share");
    if (shareBtn) shareBtn.addEventListener("click", () => {
      const txt = `Conexiones · ${data.today}\n` + C.shareGrid(st) + `\nRacha: ${conexStatsObj().streak || 0}`;
      const done = () => toast("Resultado copiado.");
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done, done);
      else done();
    });
  }

  function updateConexLives() {
    const el = document.querySelector(".cx-lives");
    if (!el || !conexData || !conexData.state) return;
    el.innerHTML = [0, 1, 2, 3].map((i) => `<span class="cx-life${i < conexData.state.lives ? "" : " off"}"></span>`).join("");
  }

  let activeGame = "conexiones";

  function renderJuegos() {
    conexData = conexLoad();
    const data = conexData;
    const todayLabel = new Date().toLocaleDateString("es-AR", { day: "numeric", month: "long" });
    const hasGame = data.pool && data.pool.length >= 4;
    const st = data.state;

    const allQ = [];
    (S().questionnaires || []).forEach((qq) => {
      (qq.questions || []).forEach((q) => allQ.push(q));
    });

    let gameContent = "";
    if (activeGame === "conexiones") {
      const statsRow = !hasGame ? "" : (() => {
        const s = st.done ? conexStatsObj() : {};
        return `
        <section class="home-section cx-stats-row">
          <div class="stat-card"><div class="stat-ic"><span class="material-symbols-outlined">local_fire_department</span></div><div><p class="lbl">Racha</p><p class="big">${s.streak || 0}</p></div></div>
          <div class="stat-card"><div class="stat-ic green"><span class="material-symbols-outlined">emoji_events</span></div><div><p class="lbl">Ganados</p><p class="big">${s.wins || 0}</p></div></div>
          <div class="stat-card"><div class="stat-ic amber"><span class="material-symbols-outlined">grid_view</span></div><div><p class="lbl">Jugadas</p><p class="big">${s.played || 0}</p></div></div>
        </section>`;
      })();
      gameContent = `
        <section class="cx-hero">
          <div class="mono-label muted">Juego diario · ${esc(todayLabel)}</div>
          <h2>Conexiones</h2>
          <p class="muted small">Encontrá los 4 grupos de 4 conceptos — salen de tu material</p>
          ${hasGame && !st.done ? `<div class="cx-lives"></div>` : ""}
        </section>
        <div id="cx-board"></div>
        ${statsRow}`;
    } else {
      if (!window._cwPairs) {
        const cwPairs = Crossword.extractTerms(allQ);
        const cwPairsExtra = cwPairs.length < 10 ? Crossword.extractFromSelect(allQ, 20) : [];
        window._cwPairs = cwPairs.concat(cwPairsExtra);
      }
      if (!window._cwSeed) window._cwSeed = Date.now();
      const cw = Crossword.buildGrid(window._cwPairs, 30, 26, window._cwSeed);
      gameContent = `
        <section class="cx-hero">
          <h2>Crucigrama</h2>
          <p class="muted small">Completá las palabras cruzando las pistas de tu material</p>
        </section>
        <div id="cw-board">${Crossword.renderHTML(cw)}</div>`;
      window._cw = cw;
    }

    view(`
      <div class="cx-wrap${activeGame === "crucigrama" ? " cw-wide" : ""}">
        <div class="game-tabs">
          <button class="game-tab${activeGame === "conexiones" ? " active" : ""}" data-game="conexiones">
            <span class="material-symbols-outlined">extension</span>Conexiones
          </button>
          <button class="game-tab${activeGame === "crucigrama" ? " active" : ""}" data-game="crucigrama">
            <span class="material-symbols-outlined">grid_on</span>Crucigrama
          </button>
        </div>
        ${gameContent}
      </div>
    `);

    document.querySelectorAll(".game-tab").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeGame = btn.dataset.game;
        renderJuegos();
      });
    });

    if (activeGame === "conexiones") {
      if (hasGame) updateConexLives();
      paintConexBoard();
      if (hasGame) conexPersist(data);
    } else {
      Crossword.bind(window._cw);
      const newBtn = document.getElementById("cw-new");
      if (newBtn) newBtn.addEventListener("click", () => {
        window._cwSeed = Date.now();
        renderJuegos();
      });
    }
  }

  RENDERERS.inicio = renderHome;
  RENDERERS.cursos = renderCursos;
  RENDERERS.juegos = renderJuegos;

  const isoOf = (y, m, d) => new Date(y, m, d, 12).toISOString().slice(0, 10);

  function renderQuiz() {
    const items = S().items;
    if (!items.length) { refreshView(); return; }
    document.body.classList.add("quiz-open");

    const n = items.length;
    const answered = Quiz.answeredCount();
    const cards = items.map((it, i) => {
      const q = it.q;
      const answeredNow = Quiz.isAnswered(q.id);
      const body = q.type === "dropdown"
        ? (() => {
          const chosen = S().answers[q.id] || {};
          const order = Array.isArray(it.dropOrder) && it.dropOrder.length === q.dropdown.length ? it.dropOrder : q.dropdown.map((_, j) => j);
          const rows = q.slots.map((txt, si) => `<label class="slot ${q.slotLabels ? "slot-labeled" : ""}">
            <span class="slot-head"><span class="slot-num">${si + 1}</span>${q.slotLabels ? `<span class="slot-lab">${esc(txt)}</span>` : ""}</span>
            <select class="input slot-select" data-q="${q.id}" data-slot="${si}">
              <option value="">Elegí una opción…</option>
              ${order.map((orig) => `<option value="${orig}" ${orig === chosen[si] ? "selected" : ""}>${esc(q.dropdown[orig])}</option>`).join("")}
            </select>
          </label>`).join("");
          return `<div class="qtext">${rich(q.text)}</div><div class="slot-grid">${rows}</div>`;
        })()
        : q.type === "fill"
          ? (() => {
            const val = typeof S().answers[q.id] === "string" ? S().answers[q.id] : "";
            return `<div class="qtext">${rich(q.text)}</div>
              <input class="input fill-input" data-q="${q.id}" placeholder="Escribí la respuesta…" value="${esc(val)}" autocomplete="off">`;
          })()
          : (() => {
          const checked = S().answers[q.id] || [];
          const opts = it.optOrder.map((orig, disp) => {
            const on = checked.indexOf(disp) >= 0;
            return `<label class="opt ${on ? "checked" : ""}">
              <input type="checkbox" class="hidden-input" data-q="${q.id}" data-d="${disp}" ${on ? "checked" : ""}>
              <span class="alpha">${LETTERS[disp]}</span>
              <span>${rich(q.options[orig])}</span>
            </label>`;
          }).join("");
          return `<div class="qtext">${rich(q.text)}</div><div class="opt-grid">${opts}</div>`;
        })();
      return `<div class="qcard" id="qcard-${q.id}" ${answeredNow ? "" : "data-unanswered"}>
        <div class="qhead">
          <span class="qnum">${i + 1}<span class="muted">/${n}</span></span>
          ${q.category ? `<span class="chip">${esc(q.category)}</span>` : ""}
          ${q.type === "dropdown" ? `<span class="chip">dropdown</span>` : q.type === "fill" ? `<span class="chip">rellenar</span>` : ""}
          <span class="chip warn" ${answeredNow ? "style='display:none'" : ""}>sin responder</span>
        </div>
        ${body}
      </div>`;
    }).join("");

    const timerHTML = timedExamState ? `
      <div class="exam-timer-bar" id="exam-timer-bar" title="Tiempo restante para completar el examen">
        <span class="material-symbols-outlined">timer</span>
        <span class="timer-digits" id="timer-digits">${formatTimer(timedExamState.remainingSec)}</span>
      </div>` : "";

    view(`
      <div class="card quiz-meta">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; flex-wrap:wrap; gap:8px;">
          <span class="mono-label muted">${esc(S().name)}</span>
          ${timerHTML}
        </div>
        <div class="progress"><span style="width:${Math.round((answered / n) * 100)}%" id="bar"></span></div>
        <div class="muted small center-txt" style="margin-top:8px;">Respondiste <b id="cnt-answered">${answered}</b> de ${n} · las respuestas correctas se muestran al terminar</div>
      </div>
      <div class="qlist">${cards}</div>
      <div class="sticky">
        <button class="btn" id="btn-exit">Salir</button>
        <span class="muted mono-label" id="pending-label">${n - answered} sin responder</span>
        <button class="btn primary" id="btn-submit">Finalizar y ver puntaje</button>
      </div>
    `);
    bindQuizEvents();
  }

  function updateQuizUI() {
    const n = S().items.length;
    const answered = Quiz.answeredCount();
    $("#bar").style.width = Math.round((answered / n) * 100) + "%";
    $("#cnt-answered").textContent = answered;
    $("#pending-label").textContent = `${n - answered} sin responder`;
  }

  const advanceTimers = {};

  function scheduleAdvance(qid, delay) {
    const items = S().items;
    const idx = items.findIndex((it) => it.q.id === qid);
    if (idx < 0 || idx >= items.length - 1) return;
    let targetId = null;
    for (let i = idx + 1; i < items.length; i++) {
      if (!Quiz.isAnswered(items[i].q.id)) { targetId = items[i].q.id; break; }
    }
    if (!targetId) {
      setTimeout(() => {
        const btn = document.getElementById("btn-submit");
        if (btn) btn.focus();
      }, delay);
      return;
    }
    clearTimeout(advanceTimers[targetId]);
    advanceTimers[targetId] = setTimeout(() => {
      const el = document.getElementById("qcard-" + targetId);
      if (!el || !$("#btn-exit")) return;
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.remove("adv-target");
      void el.offsetWidth;
      el.classList.add("adv-target");
      setTimeout(() => el.classList.remove("adv-target"), 900);
    }, delay);
  }

  function setAnsweredState(card, qid) {
    const answeredNow = Quiz.isAnswered(qid);
    const chip = card.querySelector(".chip.warn");
    if (chip) chip.style.display = answeredNow ? "none" : "";
    if (answeredNow) card.removeAttribute("data-unanswered");
    else card.setAttribute("data-unanswered", "");
    updateQuizUI();
    return answeredNow;
  }

  function bindQuizEvents() {
    $("#btn-exit").addEventListener("click", () => {
      if (confirm("¿Salir de la sesión? Tus respuestas se guardan y podés continuar después.")) {
        stopTimer();
        timedExamState = null;
        document.body.classList.remove("quiz-open");
        navigate(returnView);
      }
    });
    $("#btn-submit").addEventListener("click", submitQuiz);
    document.querySelectorAll(".opt input[type=checkbox]").forEach((input) => {
      input.addEventListener("change", (e) => {
        const qid = parseInt(e.target.dataset.q, 10);
        const disp = parseInt(e.target.dataset.d, 10);
        const wasAnswered = Quiz.isAnswered(qid);
        Quiz.toggle(qid, disp);
        e.target.closest(".opt").classList.toggle("checked", e.target.checked);
        const card = document.getElementById("qcard-" + qid);
        const answeredNow = setAnsweredState(card, qid);
        if (!wasAnswered && answeredNow) scheduleAdvance(qid, 500);
      });
    });
    document.querySelectorAll(".slot-select").forEach((sel) => {
      sel.addEventListener("change", (e) => {
        const qid = parseInt(e.target.dataset.q, 10);
        const slot = parseInt(e.target.dataset.slot, 10);
        const val = e.target.value === "" ? null : parseInt(e.target.value, 10);
        const wasAnswered = Quiz.isAnswered(qid);
        Quiz.setSlot(qid, slot, val);
        const card = document.getElementById("qcard-" + qid);
        const answeredNow = setAnsweredState(card, qid);
        if (!wasAnswered && answeredNow) scheduleAdvance(qid, 400);
      });
    });
    document.querySelectorAll(".fill-input").forEach((inp) => {
      inp.addEventListener("input", (e) => {
        const qid = parseInt(e.target.dataset.q, 10);
        const wasAnswered = Quiz.isAnswered(qid);
        Quiz.setFill(qid, e.target.value);
        const card = document.getElementById("qcard-" + qid);
        const answeredNow = setAnsweredState(card, qid);
        if (!wasAnswered && answeredNow) {
          clearTimeout(advanceTimers["f" + qid]);
          advanceTimers["f" + qid] = setTimeout(() => {
            delete advanceTimers["f" + qid];
            scheduleAdvance(qid, 0);
          }, 1200);
        }
      });
      inp.addEventListener("keydown", (e) => {
        if (e.key !== "Enter") return;
        e.preventDefault();
        const qid = parseInt(e.target.dataset.q, 10);
        if (advanceTimers["f" + qid]) {
          clearTimeout(advanceTimers["f" + qid]);
          delete advanceTimers["f" + qid];
        }
        if (Quiz.isAnswered(qid)) scheduleAdvance(qid, 0);
      });
    });
  }

  function submitQuiz() {
    let examStats = null;
    if (timedExamState) {
      examStats = {
        elapsedSec: timedExamState.elapsedSec || Math.round((Date.now() - timedExamState.startAt) / 1000),
        durationSec: timedExamState.durationSec
      };
      stopTimer();
      timedExamState = null;
    }
    const res = Quiz.submit();
    if (examStats) res.examStats = examStats;
    document.body.classList.remove("quiz-open");
    renderResults(res);
    window.scrollTo(0, 0);
  }

  function explainBlock(txt) {
    if (txt.length < 240) return `<div class="explain">${rich(txt)}</div>`;
    return `<div class="explain-wrap">
      <div class="explain">${rich(txt)}</div>
      <button class="explain-toggle" type="button"><span class="material-symbols-outlined">expand_more</span><span class="et-lab">Ver más</span></button>
    </div>`;
  }

  function renderResults(r) {
    const pct = r.max ? Math.round((r.total / r.max) * 100) : 0;
    const msg = pct === 100 ? "¡Perfecto!" : pct >= 80 ? "¡Muy bien!" : pct >= 60 ? "Aprobado" : pct >= 40 ? "Hay que repasar" : "¡A estudiar más!";
    const stateOf = (s) => s === "correct" ? ["ok", "Correcta"] : s === "partial" ? ["par", "Parcial"] : ["no", "Incorrecta"];
    const failedN = r.marked.failed.length + r.marked.partial.length;

    const rows = r.detail.map((d, i) => {
      const [cls, lbl] = stateOf(d.state);
      const opts = d.q.type === "dropdown"
        ? d.q.slots.map((txt, si) => {
          const ch = d.slotChosen ? d.slotChosen[si] : null;
          const isC = ch === d.q.correctSlot[si];
          const oCls = isC ? "correct" : ch == null ? "missed" : "wrong";
          const flag = isC ? "✓" : ch == null ? "sin responder" : "✗";
          return `<div class="opt ${oCls}" style="cursor:default">
            <span class="alpha">${si + 1}</span>
            <span><b>${rich(txt)}</b><br>
              <span class="muted small">Tu respuesta:</span> ${ch == null ? "—" : esc(d.q.dropdown[ch])}<br>
              <span class="muted small">Correcta:</span> ${esc(d.q.dropdown[d.q.correctSlot[si]])}
            </span>
            <span class="opt-flag">${flag}</span>
          </div>`;
        }).join("")
        : d.q.type === "fill"
          ? (() => {
            const has = !!d.fillAnswer;
            const isC = d.score > 0 && has;
            const oCls = isC ? "correct" : has ? "wrong" : "missed";
            const flag = isC ? "✓" : has ? "✗" : "sin responder";
            return `<div class="opt ${oCls}" style="cursor:default">
              <span class="alpha">1</span>
              <span>
                <b>Tu respuesta:</b> ${has ? esc(d.fillAnswer) : "—"}<br>
                <span class="muted small">Correcta:</span> ${d.q.correct.map((c) => esc(c)).join(" / ")}
              </span>
              <span class="opt-flag">${flag}</span>
            </div>`;
          })()
          : d.optOrder.map((orig, disp) => {
          const isC = d.q.correct.indexOf(orig) >= 0;
          const was = d.dispChecked.indexOf(disp) >= 0;
          const oCls = isC && was ? "correct" : isC ? "missed" : was ? "wrong" : "";
          const flag = isC && was ? "✓" : isC ? "correcta" : was ? "✗" : "";
          return `<div class="opt ${oCls}" style="cursor:default">
            <span class="alpha">${LETTERS[disp]}</span>
            <span>${rich(d.q.options[orig])}</span>
            <span class="opt-flag">${flag}</span>
          </div>`;
        }).join("");
      return `
        <div class="qcard">
          <div class="qhead">
            <span class="qnum">${i + 1}</span>
            ${d.q.category ? `<span class="chip">${esc(d.q.category)}</span>` : ""}
            <span class="badge ${cls}">${lbl}</span>
            <span class="score-chip">${fmt(d.score)} p</span>
          </div>
          <div class="qtext">${rich(d.q.text)}</div>
          <div class="opt-grid">${opts}</div>
          ${d.q.explanation ? explainBlock(d.q.explanation) : ""}
        </div>`;
    }).join("");

    view(`
      <div class="card result-hero">
        <div class="mono-label muted">Resultado · ${esc(S().name)}</div>
        <div class="big">${fmt(r.total)} <span class="muted">/ ${fmt(r.max)} puntos</span></div>
        <div class="pct ${pct === 100 ? "ok-c" : pct >= 60 ? "" : "bad-c"}">${pct} %</div>
        ${r.examStats ? `
        <div style="display:flex; justify-content:center; gap:12px; margin:10px 0; align-items:center; flex-wrap:wrap;">
          <span class="exam-badge ${pct >= 60 ? "passed" : "failed"}">
            <span class="material-symbols-outlined" style="font-size:16px;">${pct >= 60 ? "check_circle" : "cancel"}</span>
            ${pct >= 60 ? "Aprobado" : "No aprobado"}
          </span>
          <span class="mono-label muted">⏱️ Tiempo empleado: ${Math.floor(r.examStats.elapsedSec / 60)}m ${r.examStats.elapsedSec % 60}s</span>
        </div>` : ""}
        <div class="msg">${msg}</div>
        <div class="btn-row justify-center">
          <button class="btn primary" id="btn-repeat">Repetir mismas preguntas</button>
          <button class="btn" id="btn-fail" ${failedN ? "" : "disabled"}>Solo falladas (${failedN})</button>
          <button class="btn" id="btn-next">Nueva sesión</button>
          <button class="btn" id="btn-home">Inicio</button>
        </div>
      </div>
      ${rows}
    `);

    document.getElementById("btn-repeat").addEventListener("click", () => { Quiz.repeatSession(); renderQuiz(); });
    document.getElementById("btn-fail").addEventListener("click", () => { Quiz.failedSession(); renderQuiz(); });
    document.getElementById("btn-next").addEventListener("click", () => { Quiz.newSession(); renderQuiz(); });
    document.getElementById("btn-home").addEventListener("click", () => navigate(returnView));
    document.querySelectorAll(".explain-toggle").forEach((b) => b.addEventListener("click", () => {
      const wrap = b.closest(".explain-wrap");
      const open = wrap.classList.toggle("open");
      b.querySelector(".et-lab").textContent = open ? "Ver menos" : "Ver más";
    }));
  }

  /* ---- Flashcards System ---- */
  let flashState = null;

  function startFlashcards(hash) {
    returnView = currentView;
    const qz = Quiz.S.questionnaires.find((x) => x.hash === hash);
    if (!qz || !qz.questions || !qz.questions.length) {
      toast("No hay preguntas en este cuestionario.");
      return;
    }
    let questions = qz.questions.slice();
    const cat = String(Quiz.S.settings.cat || "").trim();
    if (cat) {
      const filtered = questions.filter((q) => (q.category || "").trim() === cat);
      if (filtered.length) questions = filtered;
    }
    questions = window.Scheduler ? window.Scheduler.shuffle(questions.map((q) => q.id)).map((id) => qz.questions[id]) : questions;

    flashState = {
      hash,
      name: qz.name,
      category: cat,
      deck: questions,
      idx: 0,
      flipped: false,
      easyCount: 0,
      hardDeck: []
    };
    renderFlashcards();
  }

  function formatFlashAnswer(q) {
    if (q.type === "dropdown") {
      return q.slots.map((s, i) => `<b>${esc(s)}:</b> ${esc(q.dropdown[q.correctSlot[i]])}`).join("<br>");
    }
    if (q.type === "fill") {
      return q.correct.map(esc).join(" <i>ó</i> ");
    }
    return q.correct.map((idx) => `• ${esc(q.options[idx])}`).join("<br>");
  }

  function renderFlashcards() {
    if (!flashState) { refreshView(); return; }
    const st = flashState;
    if (st.idx >= st.deck.length) {
      renderFlashSummary();
      return;
    }
    const q = st.deck[st.idx];
    const total = st.deck.length;
    const currentNum = st.idx + 1;
    const pct = Math.round((currentNum / total) * 100);

    const typeLabel = q.type === "dropdown" ? "Relacionar" : q.type === "fill" ? "Completar" : "Opción múltiple";
    const answerHTML = formatFlashAnswer(q);
    const explainHTML = q.explanation ? `<div class="explain" style="margin-top:12px;"><b>Explicación:</b> ${rich(q.explanation)}</div>` : "";

    view(`
      <div class="fc-wrap">
        <div class="fc-topbar">
          <button class="btn sm" id="btn-fc-exit"><span class="material-symbols-outlined">arrow_back</span> Salir</button>
          <span class="mono-label muted">${esc(st.name)}${st.category ? ` · ${esc(st.category)}` : ""}</span>
          <span class="mono-label">Tarjeta ${currentNum} de ${total}</span>
        </div>
        <div class="progress"><span style="width:${pct}%"></span></div>

        <div class="fc-scene" id="fc-scene" tabindex="0" role="button" aria-label="Girar tarjeta">
          <div class="fc-card${st.flipped ? " flipped" : ""}" id="fc-card">
            <div class="fc-face fc-front">
              <div class="fc-head">
                <span class="chip">${typeLabel}</span>
                ${q.category ? `<span class="chip warn">${esc(q.category)}</span>` : ""}
              </div>
              <div class="fc-body">
                <div class="qtext">${rich(q.text)}</div>
                ${q.type === "dropdown" ? `<div class="muted small">${q.slots.length} conceptos a relacionar</div>` : ""}
                ${q.type === "select" ? `<div class="muted small">${q.options.length} opciones disponibles</div>` : ""}
              </div>
              <div class="fc-hint">
                <span class="material-symbols-outlined">touch_app</span> Hacé clic o presioná <kbd>Espacio</kbd> para voltear
              </div>
            </div>

            <div class="fc-face fc-back">
              <div class="fc-head">
                <span class="chip" style="color:var(--green-solid); border-color:var(--green-solid);">Respuesta Correcta</span>
                <span class="material-symbols-outlined" style="color:var(--green-solid)">check_circle</span>
              </div>
              <div class="fc-body">
                <div class="fc-answer-box">${answerHTML}</div>
                ${explainHTML}
              </div>
              <div class="fc-hint">
                Calificá cómo la sentiste para continuar
              </div>
            </div>
          </div>
        </div>

        <div class="fc-controls" id="fc-controls" style="${st.flipped ? "" : "opacity:0.5; pointer-events:none;"}">
          <button class="fc-btn hard" id="fc-hard" type="button">
            <span>🔴 Difícil</span>
            <kbd>1 · Flecha Izq</kbd>
          </button>
          <button class="fc-btn med" id="fc-med" type="button">
            <span>🟡 Dudoso</span>
            <kbd>2 · Flecha Abajo</kbd>
          </button>
          <button class="fc-btn easy" id="fc-easy" type="button">
            <span>🟢 Fácil</span>
            <kbd>3 · Flecha Der</kbd>
          </button>
        </div>
      </div>
    `);

    bindFlashEvents();
  }

  function handleFlashRating(rating) {
    if (!flashState) return;
    const st = flashState;
    const currentQ = st.deck[st.idx];
    if (rating === "hard") {
      st.hardDeck.push(currentQ);
    } else if (rating === "easy") {
      st.easyCount++;
    }
    st.idx++;
    st.flipped = false;
    renderFlashcards();
  }

  function flipFlashcard() {
    if (!flashState) return;
    flashState.flipped = !flashState.flipped;
    const card = document.getElementById("fc-card");
    if (card) card.classList.toggle("flipped", flashState.flipped);
    const controls = document.getElementById("fc-controls");
    if (controls) {
      controls.style.opacity = flashState.flipped ? "1" : "0.5";
      controls.style.pointerEvents = flashState.flipped ? "auto" : "none";
    }
  }

  function bindFlashEvents() {
    const scene = document.getElementById("fc-scene");
    if (scene) scene.addEventListener("click", flipFlashcard);

    const exitBtn = document.getElementById("btn-fc-exit");
    if (exitBtn) {
      exitBtn.addEventListener("click", () => {
        flashState = null;
        navigate(returnView || "inicio");
      });
    }

    const hardBtn = document.getElementById("fc-hard");
    if (hardBtn) hardBtn.addEventListener("click", () => handleFlashRating("hard"));
    const medBtn = document.getElementById("fc-med");
    if (medBtn) medBtn.addEventListener("click", () => handleFlashRating("med"));
    const easyBtn = document.getElementById("fc-easy");
    if (easyBtn) easyBtn.addEventListener("click", () => handleFlashRating("easy"));
  }

  function renderFlashSummary() {
    const st = flashState;
    const total = st.deck.length;
    const hardN = st.hardDeck.length;
    const easyN = st.easyCount;

    view(`
      <div class="fc-wrap">
        <div class="card fc-summary-card">
          <span class="material-symbols-outlined" style="font-size:48px; color:var(--accent);">emoji_events</span>
          <h2>¡Repaso de Flashcards completado!</h2>
          <p class="muted">Repasaste <b>${total}</b> tarjetas de <b>${esc(st.name)}</b>.</p>

          <div class="fc-stats-grid">
            <div class="stat-card">
              <div class="stat-ic green"><span class="material-symbols-outlined">task_alt</span></div>
              <div><p class="lbl">Fáciles / Dominadas</p><p class="big">${easyN}</p></div>
            </div>
            <div class="stat-card">
              <div class="stat-ic red"><span class="material-symbols-outlined">replay</span></div>
              <div><p class="lbl">Para repasar</p><p class="big">${hardN}</p></div>
            </div>
          </div>

          <div style="display:flex; gap:12px; justify-content:center; flex-wrap:wrap; margin-top:20px;">
            ${hardN > 0 ? `
            <button class="btn primary" id="btn-fc-retry-hard">
              <span class="material-symbols-outlined">restart_alt</span> Repasar las difíciles (${hardN})
            </button>` : ""}
            <button class="btn" id="btn-fc-restart">Reiniciar todo el mazo</button>
            <button class="btn" id="btn-fc-home">Volver al inicio</button>
          </div>
        </div>
      </div>
    `);

    const retryBtn = document.getElementById("btn-fc-retry-hard");
    if (retryBtn) {
      retryBtn.addEventListener("click", () => {
        st.deck = st.hardDeck.slice();
        st.hardDeck = [];
        st.idx = 0;
        st.flipped = false;
        st.easyCount = 0;
        renderFlashcards();
      });
    }
    const restartBtn = document.getElementById("btn-fc-restart");
    if (restartBtn) {
      restartBtn.addEventListener("click", () => startFlashcards(st.hash));
    }
    const homeBtn = document.getElementById("btn-fc-home");
    if (homeBtn) {
      homeBtn.addEventListener("click", () => {
        flashState = null;
        navigate(returnView || "inicio");
      });
    }
  }

  window.addEventListener("keydown", (e) => {
    if (!flashState) return;
    if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) return;
    if (e.code === "Space" || e.key === " " || e.key === "Enter") {
      e.preventDefault();
      flipFlashcard();
    } else if (flashState.flipped) {
      if (e.key === "1" || e.key === "ArrowLeft") {
        e.preventDefault();
        handleFlashRating("hard");
      } else if (e.key === "2" || e.key === "ArrowDown") {
        e.preventDefault();
        handleFlashRating("med");
      } else if (e.key === "3" || e.key === "ArrowRight") {
        e.preventDefault();
        handleFlashRating("easy");
      }
    }
  });

  window.UI = { init, startFlashcards };
})();
