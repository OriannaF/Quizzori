const { JSDOM } = require("jsdom");
const fs = require("fs");
const path = require("path");

const ROOT = require("path").join(__dirname, "..");
let html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8")
  .replace(/<script src="([^"]+)"><\/script>/g, (m, src) => {
    const code = fs.readFileSync(path.join(ROOT, src.split("?")[0]), "utf8");
    if (src.indexOf("cloud.js") !== -1) {
      return `<script>${code}\n</script><script>window.Cloud={isConfigured:()=>true,user:()=>({uid:"u1",name:"Orianna Fernandez"}),onChange(){},init(){},signIn(){return Promise.resolve()},signOut(){return Promise.resolve()}};</script>`;
    }
    return `<script>${code}\n</script>`;
  })
  .replace(/<link[^>]*>/g, "");

function boot() {
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
      window.HTMLCanvasElement.prototype.getContext = () => null;
      window.matchMedia = () => ({ matches: false, addListener() {}, removeListener() {} });
      window.scrollTo = () => {};
      window.HTMLElement.prototype.scrollIntoView = function () {};
      window.confirm = () => true;
      window.prompt = () => PROMPT();
      window.alert = () => {};
    }
  });
  dom.window.addEventListener("error", (e) => errors.push("window error: " + e.message));
  return { dom, errors };
}

let promptReply = "";
const PROMPT = () => promptReply;

(async () => {
  let pass = 0;
  const log = (k, v) => { console.log(k.padEnd(34), v); if (v !== "FAIL") pass++; };

  // ---------- OWNER ----------
  promptReply = "Análisis de Sistemas";
  const A = boot();
  const w = A.dom.window;
  await new Promise((r) => setTimeout(r, 300));
  const $ = (s) => w.document.querySelector(s);
  const click = (el) => el.dispatchEvent(new w.MouseEvent("click", { bubbles: true }));

  $('#main-nav [data-view="cursos"]').dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
  await new Promise((r) => setTimeout(r, 50));
  log("owner sees Nuevo curso", !!$("#btn-new-course"));

  click($("#btn-new-course"));
  await new Promise((r) => setTimeout(r, 50));
  const courseCard = $(".course-card h3");
  log("course created", courseCard && courseCard.textContent.includes(promptReply) ? "OK" : "FAIL");

  const stored0 = w.QuizStore.loadCourses();
  log("persisted to store", stored0.length === 1 && stored0[0].name === promptReply ? "OK" : JSON.stringify(stored0));

  const quizBtn = $('[data-open-course][data-tab="quizzes"]');
  click(quizBtn);
  await new Promise((r) => setTimeout(r, 50));
  log("modal opens", !!$(".modal") ? "OK" : "FAIL");

  const cb = $('.modal [data-assign]');
  cb.checked = true;
  cb.dispatchEvent(new w.Event("change", { bubbles: true }));
  await new Promise((r) => setTimeout(r, 50));
  const c1 = w.QuizStore.loadCourses()[0];
  log("quiz assigned", c1.quizzes.length === 1 && c1.quizzes[0] === cb.dataset.assign ? "OK" : JSON.stringify(c1.quizzes));

  click($('.modal-tab[data-tab="material"]'));
  await new Promise((r) => setTimeout(r, 50));
  const form = $(".modal .link-add");
  if (!form) throw new Error("no link-add form. modal body: " + (($(".modal") && $(".modal .modal-body").innerHTML) || "NO MODAL").replace(/\s+/g, " ").slice(0, 400));
  form.querySelector("[name=lkname]").value = "Guía TP 1";
  form.querySelector("[name=lkurl]").value = "https://drive.google.com/guia1";
  form.dispatchEvent(new w.Event("submit", { bubbles: true, cancelable: true }));
  await new Promise((r) => setTimeout(r, 50));
  const c2 = w.QuizStore.loadCourses()[0];
  log("material added", c2.material.length === 1 && c2.material[0].url === "https://drive.google.com/guia1" ? "OK" : JSON.stringify(c2.material));

  form.querySelector("[name=lkname]").value = "X";
  form.querySelector("[name=lkurl]").value = "javascript:alert(1)";
  form.dispatchEvent(new w.Event("submit", { bubbles: true, cancelable: true }));
  await new Promise((r) => setTimeout(r, 50));
  const c3 = w.QuizStore.loadCourses()[0];
  log("bad url rejected", c3.material.length === 1 ? "OK" : "FAIL");
  log("toast shown for bad url", $("#toast").textContent.includes("http") ? "OK" : $("#toast").textContent);

  click($('.modal-tab[data-tab="links"]'));
  await new Promise((r) => setTimeout(r, 50));
  const formL = $(".modal .link-add");
  formL.querySelector("[name=lkname]").value = "Campus";
  formL.querySelector("[name=lkurl]").value = "http://campus.universidad.edu.ar";
  formL.dispatchEvent(new w.Event("submit", { bubbles: true, cancelable: true }));
  await new Promise((r) => setTimeout(r, 50));
  const linkA = $(".link-row a");
  log("link added + safe href", linkA && linkA.getAttribute("href") === "http://campus.universidad.edu.ar" ? "OK" : "FAIL");

  click($('.modal-tab[data-tab="quizzes"]'));
  await new Promise((r) => setTimeout(r, 50));
  click($('.play-mini[data-play]'));
  await new Promise((r) => setTimeout(r, 100));
  const inQuiz = w.document.querySelectorAll(".qcard").length > 0;
  log("play from modal starts quiz", inQuiz ? "OK" : "FAIL");
  if (inQuiz) { click($("#btn-exit")); await new Promise((r) => setTimeout(r, 50)); }

  promptReply = "Sistemas II";
  const cardAfterQuiz = $(".course-card .mini-edit[data-rename-course]");
  click(cardAfterQuiz);
  await new Promise((r) => setTimeout(r, 50));
  const renamed = w.QuizStore.loadCourses()[0].name === "Sistemas II";
  log("rename course", renamed && $(".course-card h3").textContent.includes("Sistemas II") ? "OK" : "FAIL");

  click($('[data-open-course][data-tab="material"]'));
  await new Promise((r) => setTimeout(r, 50));
  const delBtn = $("#m-del");
  if (!delBtn) throw new Error("no #m-del; modal=" + !!$(".modal"));
  click(delBtn);
  await new Promise((r) => setTimeout(r, 50));
  log("delete course", !$(".modal") && w.QuizStore.loadCourses().length === 0 ? "OK" : "FAIL");
  log("fallback questionnaire cards", document_qcards(w) > 0 ? "OK" : "FAIL");

  const errsA = A.errors.filter(e => !/not implemented|Could not load|css/i.test(e));
  log("owner runtime errors", errsA.length ? "\n  " + errsA.join("\n  ") : "none");
  A.dom.window.close();

  // ---------- NON-OWNER ----------
  html = html.replace('name:"Orianna Fernandez"', 'name:"Someone Else"');
  const B = boot();
  const wb = B.dom.window;
  await new Promise((r) => setTimeout(r, 300));
  wb.document.querySelector('#main-nav [data-view="cursos"]').dispatchEvent(new wb.MouseEvent("click", { bubbles: true }));
  await new Promise((r) => setTimeout(r, 50));
  log("anon hides Nuevo curso", !wb.document.querySelector("#btn-new-course") ? "OK" : "FAIL");
  log("anon sees lock note", !!wb.document.querySelector(".lock-note") ? "OK" : "FAIL");

  const errsB = B.errors.filter(e => !/not implemented|Could not load|css/i.test(e));
  log("anon runtime errors", errsB.length ? "\n  " + errsB.join("\n  ") : "none");

  console.log("\nPASSED:", pass);
  process.exit(0);
})().catch((e) => { console.error("HARNESS FAIL:", e); process.exit(2); });

function document_qcards(w) {
  return w.document.querySelectorAll(".exam-card:not(.course-card)").length;
}
