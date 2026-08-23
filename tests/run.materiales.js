const { JSDOM } = require("jsdom");
const fs = require("fs");
const path = require("path");

const ROOT = require("path").join(__dirname, "..");
const ADMIN_EMAIL = "oriannafernandezdelrosario@gmail.com";

function buildHtml(user) {
  const mock = user
    ? `window.Cloud={isConfigured:()=>true,user:()=>({uid:"u1",name:"Orianna Fernandez",email:"${user}"}),isAdmin:()=>("${user}").toLowerCase()==="${ADMIN_EMAIL}",onChange(){},init(){},signIn(){return Promise.resolve()},signOut(){return Promise.resolve()},ensureDb:()=>Promise.resolve(window.__db)};`
    : `window.Cloud={isConfigured:()=>true,user:()=>null,isAdmin:()=>false,onChange(){},init(){},signIn(){return Promise.resolve()},signOut(){return Promise.resolve()},ensureDb:()=>Promise.resolve(window.__db)};`;
  return fs.readFileSync(path.join(ROOT, "index.html"), "utf8")
    .replace(/<script src="([^"]+)"><\/script>/g, (m, src) => {
      const code = fs.readFileSync(path.join(ROOT, src.split("?")[0]), "utf8");
      if (src.indexOf("cloud.js") !== -1) return `<script>${code}\n</script><script>${mock}</script>`;
      return `<script>${code}\n</script>`;
    })
    .replace(/<link[^>]*>/g, "");
}

function boot(user) {
  const errors = [];
  const DOCS = [{ id: "m1", data: { nombre: "Álgebra - Guía TP 1", url: "https://drive.google.com/mate" } }];
  const db = {
    collection: (name) => ({
      limit: () => ({
        get: async () => ({ docs: DOCS.map((d) => ({ id: d.id, data: () => d.data })) })
      }),
      add: async (v) => { DOCS.push({ id: "m" + (DOCS.length + 1), data: v }); return { id: "new" }; },
      doc: (id) => ({ delete: async () => { const i = DOCS.findIndex((d) => d.id === id); if (i >= 0) DOCS.splice(i, 1); } })
    })
  };
  const dom = new JSDOM(buildHtml(user), {
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
      window.prompt = () => "Curso X";
      window.__db = db;
    }
  });
  dom.window.addEventListener("error", (e) => errors.push("window error: " + e.message));
  return { dom, errors, DOCS };
}

(async () => {
  let pass = 0;
  const log = (k, v) => { console.log(k.padEnd(34), v); if (v !== "FAIL") pass++; };

  // ---------- ADMIN ----------
  const A = boot(ADMIN_EMAIL);
  const w = A.dom.window;
  await new Promise((r) => setTimeout(r, 350));
  const $ = (s) => w.document.querySelector(s);
  w.document.querySelector('#main-nav [data-view="cursos"]').dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
  await new Promise((r) => setTimeout(r, 150));

  log("admin form visible (block)", $("#mat-form") && $("#mat-form").style.display === "block" ? "OK" : String($("#mat-form") && $("#mat-form").style.display));
  const btn0 = $(".mat-btn");
  log("public buttons rendered", btn0 && btn0.textContent.includes("Álgebra - Guía TP 1") && btn0.getAttribute("href") === "https://drive.google.com/mate" ? "OK" : "FAIL");
  log("del button for admin", !!$("[data-mat-del]") ? "OK" : "FAIL");

  $("#matname").value = "Análisis Matemático - Parciales";
  $("#maturl").value = "https://campus.com/parciales.pdf";
  $("#mat-form").dispatchEvent(new w.Event("submit", { bubbles: true, cancelable: true }));
  await new Promise((r) => setTimeout(r, 150));
  const mats = w.Materiales.items();
  const added = mats.find((m) => m.nombre === "Análisis Matemático - Parciales");
  log("insert into materiales", added && added.url === "https://campus.com/parciales.pdf" ? "OK" : JSON.stringify(mats));
  log("buttons updated after add", w.document.querySelectorAll(".mat-btn").length === 2 ? "OK" : w.document.querySelectorAll(".mat-btn").length);
  log("bad url rejected locally", ($("#maturl").value = "javascript:x", $("#mat-form").dispatchEvent(new w.Event("submit", { bubbles: true, cancelable: true })), await new Promise(r => setTimeout(r, 60)), w.Materiales.items().every(m => m.url.indexOf("javascript") !== 0)) ? "OK" : "FAIL");

  click_del(w, "[data-mat-del]");
  await new Promise((r) => setTimeout(r, 120));
  log("admin delete material", w.Materiales.items().length === 1 ? "OK (1 restante)" : "FAIL");

  const errsA = A.errors.filter(e => !/not implemented|Could not load|css/i.test(e));
  log("admin runtime errors", errsA.length ? "\n  " + errsA.join("\n  ") : "none");

  // ---------- VISITANTE ----------
  const B = boot(null);
  const wb = B.dom.window;
  await new Promise((r) => setTimeout(r, 350));
  wb.document.querySelector('#main-nav [data-view="cursos"]').dispatchEvent(new wb.MouseEvent("click", { bubbles: true }));
  await new Promise((r) => setTimeout(r, 150));
  log("visitor sees buttons (no login)", wb.document.querySelectorAll(".mat-btn").length > 0 ? "OK (" + wb.document.querySelectorAll(".mat-btn").length + ")" : "FAIL");
  log("visitor form hidden", wb.document.getElementById("mat-form").style.display === "none" ? "OK" : wb.document.getElementById("mat-form").style.display);
  log("visitor no del buttons", !wb.document.querySelector("[data-mat-del]") ? "OK" : "FAIL");

  const errsB = B.errors.filter(e => !/not implemented|Could not load|css/i.test(e));
  log("visitor runtime errors", errsB.length ? "\n  " + errsB.join("\n  ") : "none");

  console.log("\nPASSED:", pass);
  process.exit(0);

  function click_del(win, sel) {
    const el = win.document.querySelector(sel);
    if (el) el.dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  }
})().catch((e) => { console.error("HARNESS FAIL:", e); process.exit(2); });
