"use strict";

(function () {
const Crossword = (() => {
  const normText = (t) => String(t || "")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  const ABCD = "ABCDEFGHIJKLMNOPQRSTUVWXYZÑ";

  function extractTerms(questions) {
    const seen = new Set();
    const pairs = [];
    for (const q of questions) {
      if (q.type === "fill" && q.correct && q.correct.length) {
        const raw = q.correct[0];
        const word = raw.toUpperCase().replace(/[^A-ZÑ]/g, "");
        if (word.length >= 3 && word.length <= 20 && !seen.has(word)) {
          seen.add(word);
          const clue = q.text.replace(/^\d+\.\s*/, "").trim();
          pairs.push({ word, clue, category: q.category || "" });
        }
      }
    }
    return pairs;
  }

  function extractFromSelect(questions, limit) {
    const seen = new Set();
    const pairs = [];
    for (const q of questions) {
      if (q.type !== "select" || pairs.length >= limit) continue;
      const opts = q.options || [];
      const correctIdx = (q.correct || [])[0];
      if (correctIdx == null || !opts[correctIdx]) continue;
      const raw = opts[correctIdx];
      const word = raw.toUpperCase().replace(/[^A-ZÑ]/g, "");
      if (word.length >= 3 && word.length <= 15 && !seen.has(word)) {
        seen.add(word);
        const clue = q.text.replace(/^\d+\.\s*/, "").trim();
        pairs.push({ word, clue, category: q.category || "" });
      }
    }
    return pairs;
  }

  function buildGrid(pairs, maxWords, maxSide) {
    const words = pairs
      .slice()
      .sort((a, b) => b.word.length - a.word.length)
      .slice(0, maxWords || 18);

    if (!words.length) return null;

    const side = maxSide || 22;
    const grid = [];
    for (let r = 0; r < side; r++) {
      grid[r] = [];
      for (let c = 0; c < side; c++) grid[r][c] = null;
    }

    const placed = [];
    const first = words[0];
    const startR = Math.floor(side / 2);
    const startC = Math.floor((side - first.word.length) / 2);

    for (let i = 0; i < first.word.length; i++) {
      grid[startR][startC + i] = first.word[i];
    }
    placed.push({ word: first.word, clue: first.clue, category: first.category,
      row: startR, col: startC, dir: "across", number: 1 });

    for (let wi = 1; wi < words.length; wi++) {
      const w = words[wi];
      let best = null;
      let bestScore = -1;

      for (let r = 0; r < side; r++) {
        for (let c = 0; c < side; c++) {
          for (const dir of ["across", "down"]) {
            const fits = canPlace(grid, w.word, r, c, dir, side);
            if (!fits) continue;
            let intersections = 0;
            for (let i = 0; i < w.word.length; i++) {
              const cr = dir === "across" ? r : r + i;
              const cc = dir === "across" ? c + i : c;
              if (grid[cr][cc] === w.word[i]) intersections++;
            }
            if (intersections === 0) continue;
            const score = intersections * 100 + (wi < 6 ? 10 : 0) - r - c;
            if (score > bestScore) { bestScore = score; best = { r, c, dir }; }
          }
        }
      }

      if (!best) continue;

      const num = placed.length + 1;
      for (let i = 0; i < w.word.length; i++) {
        const cr = best.dir === "across" ? best.r : best.r + i;
        const cc = best.dir === "across" ? best.c + i : best.c;
        grid[cr][cc] = w.word[i];
      }
      placed.push({ word: w.word, clue: w.clue, category: w.category,
        row: best.r, col: best.c, dir: best.dir, number: num });
    }

    const usedRows = new Set();
    const usedCols = new Set();
    for (const p of placed) {
      usedRows.add(p.row);
      usedCols.add(p.col);
      if (p.dir === "across") {
        for (let i = 0; i < p.word.length; i++) usedCols.add(p.col + i);
      } else {
        for (let i = 0; i < p.word.length; i++) usedRows.add(p.row + i);
      }
    }
    const minR = Math.min(...usedRows);
    const maxR = Math.max(...usedRows);
    const minC = Math.min(...usedCols);
    const maxC = Math.max(...usedCols);

    const trimmed = { grid: [], words: placed, rows: maxR - minR + 1, cols: maxC - minC + 1 };
    for (let r = minR; r <= maxR; r++) {
      const row = [];
      for (let c = minC; c <= maxC; c++) row.push(grid[r][c]);
      trimmed.grid.push(row);
    }
    for (const w of trimmed.words) { w.row -= minR; w.col -= minC; }

    return trimmed;
  }

  function canPlace(grid, word, row, col, dir, side) {
    if (dir === "across") {
      if (col < 0 || col + word.length > side) return false;
      if (row < 0 || row >= side) return false;
      if (col > 0 && grid[row][col - 1]) return false;
      if (col + word.length < side && grid[row][col + word.length]) return false;
      for (let i = 0; i < word.length; i++) {
        const cell = grid[row][col + i];
        if (cell && cell !== word[i]) return false;
      }
      return true;
    } else {
      if (row < 0 || row + word.length > side) return false;
      if (col < 0 || col >= side) return false;
      if (row > 0 && grid[row - 1][col]) return false;
      if (row + word.length < side && grid[row + word.length][col]) return false;
      for (let i = 0; i < word.length; i++) {
        const cell = grid[row + i][col];
        if (cell && cell !== word[i]) return false;
      }
      return true;
    }
  }

  function renderHTML(cw) {
    if (!cw || !cw.words.length) return '<div class="empty-note">No hay suficientes preguntas para armar un crucigrama.</div>';

    const cell = 34;
    const pad = 12;
    const svgW = cw.cols * cell + pad * 2;
    const svgH = cw.rows * cell + pad * 2;

    let squares = "";
    for (let r = 0; r < cw.rows; r++) {
      for (let c = 0; c < cw.cols; c++) {
        if (!cw.grid[r][c]) continue;
        const x = pad + c * cell;
        const y = pad + r * cell;
        const num = cw.words.find((w) => {
          if (w.dir === "across") return w.row === r && w.col === c;
          return w.row === r && w.col === c;
        });
        squares += `<rect class="cw-cell" data-r="${r}" data-c="${c}" x="${x}" y="${y}" width="${cell}" height="${cell}" rx="3"/>`;
        if (num) {
          squares += `<text class="cw-num" x="${x + 3}" y="${y + 11}">${num.number}</text>`;
        }
        squares += `<text class="cw-letter" data-r="${r}" data-c="${c}" x="${x + cell / 2}" y="${y + cell / 2 + 5}"></text>`;
      }
    }

    const cursorX = pad;
    const cursorY = pad;
    squares += `<rect class="cw-cursor" id="cw-cursor" x="${cursorX}" y="${cursorY}" width="${cell}" height="${cell}" rx="3"/>`;

    const across = cw.words.filter((w) => w.dir === "across").sort((a, b) => a.number - b.number);
    const down = cw.words.filter((w) => w.dir === "down").sort((a, b) => a.number - b.number);

    const clueList = (arr, label) => {
      if (!arr.length) return "";
      return `<div class="cw-clue-group"><h4>${label}</h4>${arr.map((w) =>
        `<p class="cw-clue" data-word-num="${w.number}"><b>${w.number}.</b> ${esc(w.clue)}</p>`
      ).join("")}</div>`;
    };

    return `
      <div class="cw-play">
        <div class="cw-left">
          <div class="cw-board">
            <svg viewBox="0 0 ${svgW} ${svgH}" class="cw-svg">${squares}</svg>
          </div>
          <div class="cw-input-bar">
            <span class="cw-input-label">Seleccioná una celda y escribí</span>
            <input type="text" class="input cw-text-input" id="cw-input" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="20" placeholder="…">
            <div class="cw-btns">
              <button class="link-btn" id="cw-check" type="button"><span class="material-symbols-outlined">check_circle</span> Verificar</button>
              <button class="link-btn" id="cw-reveal" type="button"><span class="material-symbols-outlined">visibility</span> Revelar</button>
              <button class="link-btn" id="cw-clear" type="button"><span class="material-symbols-outlined">delete</span> Limpiar</button>
            </div>
          </div>
        </div>
        <div class="cw-right cw-clues">
          ${clueList(across, "Horizontales →")}
          ${clueList(down, "Verticales ↓")}
        </div>
      </div>`;
  }

  function esc(s) { return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  function bind(cw) {
    if (!cw || !cw.words.length) return;

    const input = document.getElementById("cw-input");
    const svg = document.querySelector(".cw-svg");
    if (!input || !svg) return;

    let activeWord = null;
    let activeIdx = 0;

    const letters = svg.querySelectorAll(".cw-letter");
    const letterMap = {};
    letters.forEach((el) => {
      const r = parseInt(el.dataset.r, 10);
      const c = parseInt(el.dataset.c, 10);
      letterMap[r + "," + c] = el;
    });

    const cells = svg.querySelectorAll(".cw-cell");
    const cursor = document.getElementById("cw-cursor");
    const cell = 34;
    const pad = 12;

    function moveCursor(r, c) {
      if (!cursor) return;
      cursor.setAttribute("x", pad + c * cell);
      cursor.setAttribute("y", pad + r * cell);
      cursor.classList.add("on");
    }

    function clearHighlight() {
      cells.forEach((el) => el.classList.remove("active", "same-word"));
      document.querySelectorAll(".cw-clue.active").forEach((el) => el.classList.remove("active"));
    }

    function highlightWord(w) {
      clearHighlight();
      activeWord = w;
      for (let i = 0; i < w.word.length; i++) {
        const cr = w.dir === "across" ? w.row : w.row + i;
        const cc = w.dir === "across" ? w.col + i : w.col;
        const key = cr + "," + cc;
        if (letterMap[key]) letterMap[key].classList.add("same-word");
        cells.forEach((el) => {
          if (parseInt(el.dataset.r, 10) === cr && parseInt(el.dataset.c, 10) === cc) {
            el.classList.add("active");
          }
        });
      }
      const ccr = w.dir === "across" ? w.row : w.row + activeIdx;
      const ccc = w.dir === "across" ? w.col + activeIdx : w.col;
      moveCursor(ccr, ccc);
      const clueEl = document.querySelector(`.cw-clue[data-word-num="${w.number}"]`);
      if (clueEl) { clueEl.classList.add("active"); clueEl.scrollIntoView({ behavior: "smooth", block: "nearest" }); }
    }

    function placeChar(ch, advance) {
      if (!activeWord) return;
      const w = activeWord;
      const cr = w.dir === "across" ? w.row : w.row + activeIdx;
      const cc = w.dir === "across" ? w.col + activeIdx : w.col;
      const key = cr + "," + cc;
      const el = letterMap[key];
      if (el) el.textContent = ch.toUpperCase();
      if (advance && activeIdx < w.word.length - 1) {
        activeIdx++;
        highlightWord(w);
      }
    }

    cells.forEach((el) => {
      el.addEventListener("click", () => {
        const r = parseInt(el.dataset.r, 10);
        const c = parseInt(el.dataset.c, 10);
        const w = cw.words.find((w) => {
          if (w.dir === "across") return r === w.row && c >= w.col && c < w.col + w.word.length;
          return c === w.col && r >= w.row && r < w.row + w.word.length;
        });
        if (!w) {
          const alt = cw.words.find((ww) => {
            if (ww.dir === "across") return r === ww.row && c >= ww.col && c < ww.col + ww.word.length;
            return c === ww.col && r >= ww.row && r < ww.row + ww.word.length;
          });
          if (alt) { highlightWord(alt); activeIdx = alt.dir === "across" ? c - alt.col : r - alt.row; }
          input.focus();
          return;
        }
        if (activeWord && activeWord.number === w.number) {
          activeIdx = w.dir === "across" ? c - w.col : r - w.row;
        } else {
          activeIdx = 0;
        }
        highlightWord(w);
        input.focus();
      });
    });

    document.querySelectorAll(".cw-clue").forEach((el) => {
      el.addEventListener("click", () => {
        const num = parseInt(el.dataset.wordNum, 10);
        const w = cw.words.find((ww) => ww.number === num);
        if (w) { activeIdx = 0; highlightWord(w); input.focus(); }
      });
    });

    input.addEventListener("input", () => {
      const val = input.value.toUpperCase().replace(/[^A-ZÑ]/g, "");
      input.value = val;
      if (!val || !activeWord) return;
      const ch = val[val.length - 1];
      input.value = "";
      placeChar(ch, true);
    });

    input.addEventListener("keydown", (e) => {
      if (!activeWord) return;
      if (e.key === "ArrowRight" && activeWord.dir === "across" && activeIdx < activeWord.word.length - 1) { activeIdx++; highlightWord(activeWord); e.preventDefault(); }
      else if (e.key === "ArrowLeft" && activeWord.dir === "across" && activeIdx > 0) { activeIdx--; highlightWord(activeWord); e.preventDefault(); }
      else if (e.key === "ArrowDown" && activeWord.dir === "down" && activeIdx < activeWord.word.length - 1) { activeIdx++; highlightWord(activeWord); e.preventDefault(); }
      else if (e.key === "ArrowUp" && activeWord.dir === "down" && activeIdx > 0) { activeIdx--; highlightWord(activeWord); e.preventDefault(); }
      else if (e.key === "Backspace") {
        const cr = activeWord.dir === "across" ? activeWord.row : activeWord.row + activeIdx;
        const cc = activeWord.dir === "across" ? activeWord.col + activeIdx : activeWord.col;
        const key = cr + "," + cc;
        const el = letterMap[key];
        if (el && el.textContent) { el.textContent = ""; }
        else if (activeIdx > 0) { activeIdx--; highlightWord(activeWord); const pk = activeWord.dir === "across" ? activeWord.row + "," + (activeWord.col + activeIdx) : (activeWord.row + activeIdx) + "," + activeWord.col; const pel = letterMap[pk]; if (pel) pel.textContent = ""; }
        e.preventDefault();
      }
      else if (e.key === "Tab") {
        e.preventDefault();
        const sameDir = cw.words.filter((ww) => ww.dir === activeWord.dir && ww.number !== activeWord.number);
        const next = e.shiftKey ? sameDir[sameDir.length - 1] : sameDir[0];
        if (next) { activeIdx = 0; highlightWord(next); }
      }
    });

    const btnCheck = document.getElementById("cw-check");
    const btnReveal = document.getElementById("cw-reveal");
    const btnClear = document.getElementById("cw-clear");

    if (btnCheck) btnCheck.addEventListener("click", () => {
      let correct = 0, total = 0;
      for (const w of cw.words) {
        for (let i = 0; i < w.word.length; i++) {
          const cr = w.dir === "across" ? w.row : w.row + i;
          const cc = w.dir === "across" ? w.col + i : w.col;
          const key = cr + "," + cc;
          const el = letterMap[key];
          total++;
          if (el && el.textContent === w.word[i]) {
            el.classList.remove("wrong");
            el.classList.add("correct");
            correct++;
          } else if (el && el.textContent) {
            el.classList.remove("correct");
            el.classList.add("wrong");
          }
        }
      }
      if (correct === total) {
        toast("¡Crucigrama completo! Todas las respuestas son correctas.");
      } else {
        toast(`${correct}/${total} letras correctas.`);
      }
    });

    if (btnReveal) btnReveal.addEventListener("click", () => {
      if (!confirm("¿Revelar todas las respuestas?")) return;
      for (const w of cw.words) {
        for (let i = 0; i < w.word.length; i++) {
          const cr = w.dir === "across" ? w.row : w.row + i;
          const cc = w.dir === "across" ? w.col + i : w.col;
          const key = cr + "," + cc;
          const el = letterMap[key];
          if (el) { el.textContent = w.word[i]; el.classList.add("correct"); el.classList.remove("wrong"); }
        }
      }
    });

    if (btnClear) btnClear.addEventListener("click", () => {
      letters.forEach((el) => { el.textContent = ""; el.classList.remove("correct", "wrong"); });
    });

    if (cw.words.length) { activeIdx = 0; highlightWord(cw.words[0]); input.focus(); }
  }

  return { extractTerms, extractFromSelect, buildGrid, renderHTML, bind };
})();

if (typeof window !== "undefined") window.Crossword = Crossword;
if (typeof module !== "undefined" && module.exports) module.exports = Crossword;
})();
