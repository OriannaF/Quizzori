const { JSDOM } = require("jsdom");
const fs = require("fs");
const path = require("path");

const ROOT = require("path").join(__dirname, "..");
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8")
  .replace(/<script src="([^"]+)"><\/script>/g, (m, src) => `<script>${fs.readFileSync(path.join(ROOT, src.split("?")[0]), "utf8")}\n</script>`)
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
  const $$ = (s) => [...w.document.querySelectorAll(s)];
  const log = (k, v) => console.log(k.padEnd(34), v);
  const click = (sel) => $(sel).dispatchEvent(new w.MouseEvent("click", { bubbles: true }));

  const C = w.Conex;
  log("conex cargado", !!C ? "OK" : "FAIL");

  const csvRel = [
    "pregunta,categoria,opcion1,opcion2,opcion3,opcion4,correctas,explicacion",
    '"P1: 1) a1. 2) a2. 3) a3. 4) a4.",G1,d1,d2,d3,d4,C1;C2;C3;C4,',
    '"P2: 1) b1. 2) b2. 3) b3. 4) b4.",G2,e1,e2,e3,e4,C1;D2;D3;D4,',
    '"P3: 1) c1. 2) c2. 3) c3. 4) c4.",G3,m1,m2,m3,m4,F1;F2;F3;F4,',
    '"P4: 1) g1. 2) g2. 3) g3. 4) g4.",G4,j1,j2,j3,j4,K1;K2;K3;K4,'
  ].join("\n");
  const csvDrop = [
    "pregunta,categoria,opciones,respuesta1,respuesta2,correctas,explicacion",
    'Drop?,Cat,"x1;x2;x3;x4",x1,x2,1,'
  ].join("\n");

  const pool = C.buildPool([
    { hash: "r", name: "Rel", questions: w.CSV.parseQuestions(csvRel).questions },
    { hash: "d", name: "Drop", questions: w.CSV.parseQuestions(csvDrop).questions }
  ]);
  log("pool 4 grupos", pool.length === 4 ? "OK" : "FAIL " + JSON.stringify(pool.map((g) => [g.title, g.words.length])));
  log("pool descarta dup", pool.every((g) => !g.words.some((x) => x.n === "c1" && g.title === "G2")) ? "OK" : "FAIL");
  const allN = pool.flatMap((g) => g.words.map((x) => x.n));
  log("pool sin repetidos", new Set(allN).size === allN.length ? "OK" : "FAIL");

  const puz = C.makeDaily(pool, "2026-08-24");
  const puz2 = C.makeDaily(pool, "2026-08-24");
  log("puzzle diario determinista", puz && puz.tiles.length === 16 && JSON.stringify(puz) === JSON.stringify(puz2) ? "OK" : "FAIL");
  log("puzzle sin dia corto", C.makeDaily(pool.slice(0, 2), "2026-08-24") === null ? "OK" : "FAIL");

  let st = C.newGame(puz);
  st.puzzle.tiles.forEach((t, i) => { if (t.g === 0) C.toggleSel(st, i); });
  log("acierto de grupo", C.submitSel(st) === "ok" && st.solved.length === 1 && st.lives === 4 ? "OK" : "FAIL");
  const byG = (g) => st.puzzle.tiles.map((t, i) => ({ t, i })).filter((x) => x.t.g === g).map((x) => x.i);
  [byG(1)[0], byG(1)[1], byG(1)[2], byG(2)[0]].forEach((i) => C.toggleSel(st, i));
  log("casi grupo avisa", C.submitSel(st) === "close" && st.wrong === 1 ? "OK" : "FAIL");
  [byG(1)[0], byG(1)[1], byG(2)[0], byG(2)[1]].forEach((i) => C.toggleSel(st, i));
  log("mezcla falla", C.submitSel(st) === "bad" && st.lives === 2 ? "OK" : "FAIL");
  while (!st.done) {
    st.puzzle.tiles.forEach((_, i) => { if (st.sel.indexOf(i) < 0 && st.solved.every((s) => s.idxs.indexOf(i) < 0)) C.toggleSel(st, i); });
    C.submitSel(st);
  }
  log("derrota corta racha luego", st.done && !st.won ? "OK" : "FAIL");

  const s1 = C.applyResult({}, true, 0, "2026-08-23");
  const s2 = C.applyResult(s1, true, 2, "2026-08-24");
  log("streak suma dias seguidos", s1.streak === 1 && s2.streak === 2 && s2.maxStreak === 2 && s2.dist[2] === 1 ? "OK" : "FAIL");
  const s3 = C.applyResult(s2, false, 4, "2026-08-25");
  log("perder resetea streak", s3.streak === 0 && s3.played === 3 && s3.wins === 2 ? "OK" : "FAIL");
  const s4 = C.applyResult(s3, true, 1, "2026-08-26");
  log("streak reinicia en 1", s4.streak === 1 && s4.dist.reduce((a, b) => a + b, 0) === 3 ? "OK" : "FAIL");

  st.history = [[0, 1, 2, 3], [4, 5, 6, 7]];
  const grid = C.shareGrid(st);
  log("share grid filas", grid.split("\n").length === 2 && /^[^\n]+$/m.test(grid) ? "OK" : "FAIL");

  try { w.localStorage.removeItem("quiz.game.connections"); } catch (e) {}
  w.Quiz.loadCsv(csvRel, "Rel");
  w.Quiz.loadCsv(csvDrop, "Drop");
  click('#main-nav [data-view="juegos"]');
  await sleep(50);
  log("vista juegos renderiza", $("#cx-board") && $$(".cx-tile").length === 16 ? "OK" : "FAIL");
  log("hero con vidas", $$(".cx-life").length === 4 ? "OK" : "FAIL");

  const readBoard = () => JSON.parse(w.localStorage.getItem("quiz.game.connections")).board;
  let board = readBoard();
  const textsOf = (g) => board.puzzle.tiles.filter((t) => t.g === g).map((t) => t.t);
  const clickTiles = (texts) => {
    $$(".cx-tile").forEach((b) => { if (texts.indexOf(b.textContent) >= 0) b.click(); });
  };
  clickTiles(textsOf(board.puzzle.tiles[0].g));
  click("#cx-submit");
  await sleep(20);
  log("grupo resuelto en UI", $$(".cx-group").length === 1 ? "OK" : "FAIL");

  board = readBoard();
  const solvedIdxs = new Set(board.solved.flatMap((s) => s.idxs));
  const rest = board.puzzle.tiles.filter((t, i) => !solvedIdxs.has(i));
  const half = {};
  rest.forEach((t) => { half[t.g] = (half[t.g] || 0) + 1; });
  const twoGroups = Object.keys(half).slice(0, 2);
  const picksA = rest.filter((t) => t.g == twoGroups[0]).slice(0, 2).map((t) => t.t);
  const picksB = rest.filter((t) => t.g == twoGroups[1]).slice(0, 2).map((t) => t.t);
  clickTiles(picksA.concat(picksB));
  click("#cx-submit");
  await sleep(20);
  log("error resta vida", $$(".cx-life.off").length === 1 && readBoard().lives === 3 ? "OK" : "FAIL");

  click('#main-nav [data-view="juegos"]');
  await sleep(50);
  board = readBoard();
  log("progreso persistido", $$(".cx-tile").length === 12 && $$(".cx-group").length === 1 ? "OK" : "FAIL");

  log("runtime errors", errors.length ? "FAIL " + errors.join("; ") : "none");

  if (errors.length || process.exitCode) process.exit(1);
})().catch((e) => { console.error(e); process.exit(1); });
