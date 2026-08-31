const { JSDOM } = require("jsdom");
const fs = require("fs");
const path = require("path");

const ROOT = require("path").join(__dirname, "..");
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8")
  .replace(/<script src="([^"]+)"><\/script>/g, (m, src) => {
    const code = fs.readFileSync(path.join(ROOT, src.split("?")[0]), "utf8");
    if (src.indexOf("cloud.js") !== -1) {
      return `<script>${code}\n</script><script>window.Cloud={isConfigured:()=>true,user:()=>({uid:"u1",name:"Test User",email:"test@test.com"}),isAdmin:()=>true,isVerified:()=>true,onChange(){},init(){},signIn(){return Promise.resolve()},signOut(){return Promise.resolve()},fetchPublicCourses:()=>Promise.resolve(null),publishCourses:()=>Promise.resolve()};</script>`;
    }
    return `<script>${code}\n</script>`;
  })
  .replace(/<link[^>]*>/g, "");

const errors = [];
const dom = new JSDOM(html, {
  url: "http://localhost/",
  runScripts: "dangerously",
  pretendToBeVisual: true,
  beforeParse(window) {
    window.fetch = (url) => {
      const p = path.join(ROOT, decodeURIComponent(String(url).split("?")[0].replace("http://localhost/", "")));
      const txt = fs.existsSync(p) ? fs.readFileSync(p, "utf8") : "";
      return Promise.resolve({ ok: true, text: () => Promise.resolve(txt) });
    };
    window.HTMLCanvasElement.prototype.getContext = () => null;
    window.matchMedia = () => ({ matches: false, addListener() {}, removeListener() {} });
    window.scrollTo = () => {};
    window.HTMLElement.prototype.scrollIntoView = function () {};
    window.confirm = () => true;
  }
});
dom.window.addEventListener("error", (e) => errors.push("window error: " + e.message));

const w = dom.window;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const click = (sel) => {
  const el = w.document.querySelector(sel);
  if (!el) throw new Error("missing element: " + sel);
  el.dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
};

(async () => {
  await sleep(300);
  const $ = (s) => w.document.querySelector(s);
  const log = (k, v) => console.log(k.padEnd(34), v);

  log("questionnaires loaded", w.Quiz.S.questionnaires.map(q => q.name + ":" + q.questions.length).join(", ") || "NONE");
  log("initial view", $("#app").textContent.includes("Horario de Hoy") && $("#app").textContent.includes("Quizzes activos") ? "inicio OK" : "NOT inicio");

  for (const v of ["cursos", "juegos", "inicio"]) {
    click(`#main-nav [data-view="${v}"]`);
    await sleep(50);
  }
  log("nav round-trip", $("#app").textContent.includes("Horario de Hoy") ? "OK" : "FAIL");
  log("nav active state", $('#main-nav [data-view="inicio"]').classList.contains("active") ? "OK" : "FAIL");
  log("topbar stable", $("#pomo-time").textContent === "25:00" && $("#top-date") ? "OK" : "FAIL");
  log("offline badge", $("#offline-badge") && $("#offline-badge").hidden ? "OK (hidden default)" : "FAIL");

  // Offline / Account modal test
  click("#acct-btn");
  await sleep(50);
  const acctModalOpen = !!$("#acct-overlay .modal") && $("#acct-overlay").textContent.includes("Modo sin conexión");
  click("#acct-m-done");
  await sleep(50);
  const acctModalClosed = !$("#acct-overlay");
  log("offline modal roundtrip", acctModalOpen && acctModalClosed ? "OK" : "FAIL");

  // Pomodoro reset test
  click("#pomo-play");
  await sleep(50);
  click("#pomo-reset");
  await sleep(50);
  const resetOnce = $("#pomo-time").textContent === "25:00";
  click("#pomo-reset");
  await sleep(50);
  const resetFull = $("#pomo-time").textContent === "25:00" && $("#pomo-dots .done") === null;
  log("pomo multi-reset", resetOnce && resetFull ? "OK" : "FAIL");

  click('#main-nav [data-view="cursos"]');
  await sleep(50);
  log("cursos view", $("#app").textContent.toLowerCase().includes("materias") ? "OK" : "FAIL");

  click('#main-nav [data-view="inicio"]');
  await sleep(50);
  const startBtn = $('[id^="btn-start-"]');
  if (startBtn) {
    startBtn.click();
    await sleep(100);
    log("quiz started", $(".qcard") ? w.document.querySelectorAll(".qcard").length + " qcards" : "NO QCARDS");
    const firstOpt = $(".opt input[type=checkbox]");
    if (firstOpt) {
      firstOpt.checked = true;
      firstOpt.dispatchEvent(new w.Event("change", { bubbles: true }));
      await sleep(700);
      log("answer toggle", $("#cnt-answered").textContent === "1" ? "OK" : "cnt=" + $("#cnt-answered").textContent);
    } else if ($(".slot-select")) {
      const s = $(".slot-select");
      s.value = "1";
      s.dispatchEvent(new w.Event("change", { bubbles: true }));
      await sleep(600);
      log("slot answer", $("#cnt-answered").textContent);
    } else if ($(".fill-input")) {
      const f = $(".fill-input");
      f.value = "test";
      f.dispatchEvent(new w.Event("input", { bubbles: true }));
      await sleep(1500);
      log("fill answer", $("#cnt-answered").textContent);
    }
    click("#btn-exit");
    await sleep(50);
    log("exit returns view", $("#app").textContent.includes("Horario de Hoy") ? "OK" : "FAIL");
  } else {
    log("start button", "NOT FOUND");
  }

  const errs = errors.filter(e => !/not implemented|Could not load|css/i.test(e));
  log("runtime errors", errs.length ? "\n  " + errs.join("\n  ") : "none");
  process.exit(errs.length ? 1 : 0);
})().catch((e) => { console.error("HARNESS FAIL:", e); process.exit(2); });
