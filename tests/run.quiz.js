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
      const p = path.join(ROOT, decodeURIComponent(String(url).replace("http://localhost/", "")));
      const txt = fs.existsSync(p) ? fs.readFileSync(p, "utf8") : "";
      return Promise.resolve({ ok: true, text: () => Promise.resolve(txt) });
    };
    window.HTMLElement.prototype.scrollIntoView = function () {};
    window.matchMedia = () => ({ matches: false, addListener() {}, removeListener() {} });
    window.scrollTo = () => {};
    window.confirm = () => true;
  }
});
dom.window.addEventListener("error", (e) => errors.push("window error: " + e.message));

const w = dom.window;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  await sleep(300);
  const $ = (s) => w.document.querySelector(s);
  const log = (k, v) => console.log(k.padEnd(34), v);

  log("pomodoro header", $("#pomo-time") && $("#pomo-time").textContent !== "" ? "OK (" + $("#pomo-time").textContent + ")" : "FAIL");
  log("sin focus card", !$("#pf-time") ? "OK" : "FAIL");
  log("home evaluaciones anon visibles", $("#home-dates .eval-list") && $(".hg-side .widget") ? "OK" : "FAIL");
  log("home tareas", !!($("#home-tareas .task-row") || $("#home-tareas .empty-note")) ? "OK" : "FAIL");

  const csvMini = [
    "pregunta,categoria,opcion1,opcion2,opcion3,opcion4,correctas,explicacion",
    '"Identificar el concepto: 1) uno. 2) dos.",Conceptos,defUno,defDos,Concepto X,Concepto Y,1=4;2=3,',
    '"Relacioná las definiciones: 1) aa. 2) bb.",TR,def aa,def bb,,,ConB;ConA,',
    "Pregunta normal?,Norm,opA,opB,,,2,",
    "Rota?,X,solita,, ,,1=99,",
    '"Desalineado?",TD,s1,s2,,,R1;R2;R3,'
  ].join("\n");
  const pr = w.CSV.parseQuestions(csvMini);
  const rel = pr.questions[0];
  const trel = pr.questions[1];
  const normQ = pr.questions[2];
  log("csv relacione parsed", pr.questions.length === 3 && pr.warnings.length === 2 ? "OK" : "FAIL " + JSON.stringify(pr.warnings));
  log("csv relacione shape", rel && rel.type === "dropdown"
    && rel.slots.join("|") === "defUno|defDos"
    && rel.dropdown.join("|") === "Concepto X|Concepto Y"
    && rel.correctSlot.join("|") === "1|0"
    && rel.slotLabels === true ? "OK" : "FAIL");
  log("csv relacione textos", trel && trel.type === "dropdown"
    && trel.slots.join("|") === "def aa|def bb"
    && trel.dropdown.join("|") === "ConB|ConA"
    && trel.correctSlot.join("|") === "0|1"
    && trel.slotLabels === true ? "OK" : "FAIL");
  log("csv normal intacto", normQ && normQ.type === "select" && normQ.correct.join() === "1" ? "OK" : "FAIL");

  const csvDrop = [
    "pregunta,categoria,opciones,respuesta1,respuesta2,correctas,explicacion",
    'Drop con comillas?,Cat,"alpha";"beta";"gamma",beta,alpha,2,'
  ].join("\n");
  const prDrop = w.CSV.parseQuestions(csvDrop);
  const dq2 = prDrop.questions[0];
  log("csv dropdown sin comillas", dq2 && dq2.type === "dropdown"
    && dq2.dropdown.join("|") === "alpha|beta|gamma"
    && dq2.slots.join("|") === "beta|alpha"
    && dq2.correctSlot.join("|") === "1|0"
    && !prDrop.warnings.length ? "OK" : "FAIL " + JSON.stringify(prDrop.warnings));

  const Sch = w.Scheduler;
  const qsF = [
    { id: 0, text: "A", options: ["x", "y"], correct: [0], category: "C1" },
    { id: 7, text: "B", options: ["x", "y"], correct: [1], category: "C2" }
  ];
  const filtradas = qsF.filter((q) => q.category === "C2");
  const itemsF = Sch.buildByMode(filtradas, {}, "all", 0);
  log("sesion por categoria", itemsF.length === 1 && itemsF[0].q === filtradas[0] ? "OK" : "FAIL");

  const dq = { id: 9, type: "dropdown", text: "D", slots: ["a", "b"], dropdown: ["v1", "v2", "v3", "v4", "v5", "v6"], correctSlot: [0, 1], options: [] };
  const dItems = [Sch.makeItem(dq), Sch.makeItem(dq)];
  const sameSet = (arr) => arr.slice().sort((x, y) => x - y).join() === [0, 1, 2, 3, 4, 5].join();
  const shuffled = dItems.some((it) => it.dropOrder && it.dropOrder.some((v, i) => v !== i));
  log("dropOrder permutacion", dItems.every((it) => Array.isArray(it.dropOrder) && it.dropOrder.length === 6 && sameSet(it.dropOrder)) ? "OK" : "FAIL");
  log("dropOrder baraja", shuffled ? "OK" : "FAIL (orden identidad)");

  const startBtn = $('[id^="btn-start-"]');
  startBtn.click();
  await sleep(100);

  const n = w.document.querySelectorAll(".qcard").length;
  for (const cb of w.document.querySelectorAll(".opt input[type=checkbox]")) {
    cb.checked = true;
    cb.dispatchEvent(new w.Event("change", { bubbles: true }));
  }
  for (const sel of w.document.querySelectorAll(".slot-select")) {
    sel.value = "1";
    sel.dispatchEvent(new w.Event("change", { bubbles: true }));
  }
  for (const f of w.document.querySelectorAll(".fill-input")) {
    f.value = "x";
    f.dispatchEvent(new w.Event("input", { bubbles: true }));
  }
  await sleep(100);
  log("all answered", $("#cnt-answered").textContent + "/" + n);

  $("#btn-submit").click();
  await sleep(200);
  log("results hero", $(".result-hero") ? $(".result-hero .big").textContent.replace(/\s+/g, " ").trim() : "MISSING");
  log("detail rows", w.document.querySelectorAll(".result-hero ~ .qcard").length + " qcards");

  click2("#btn-home");
  function click2(sel) {
    const el = w.document.querySelector(sel);
    if (el) el.dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
  }
  await sleep(100);
  log("back to view", $("#app").textContent.includes("Horario de Hoy") ? "OK" : "FAIL");

  click2('#main-nav [data-view="cursos"]');
  await sleep(50);
  const sec = $("details.manage-card summary");
  if (sec) {
    sec.dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
    await sleep(50);
    log("calendar renders", $(".cal-grid .cal-day") ? "OK" : "FAIL");
  }

  const errs = errors.filter(e => !/not implemented|Could not load|css/i.test(e));
  log("runtime errors", errs.length ? "\n  " + errs.join("\n  ") : "none");
  process.exit(errs.length ? 1 : 0);
})().catch((e) => { console.error("HARNESS FAIL:", e); process.exit(2); });
