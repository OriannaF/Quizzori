"use strict";

(function () {
  const PRESETS = {
    heart: {
      name: "Anatomía del Corazón Humano",
      categoria: "Anatomía",
      instruction: "Arrastrá cada porción recortada a su hueco correspondiente en el diagrama.",
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" width="900" height="600">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0b1326" />
            <stop offset="100%" stop-color="#171f33" />
          </linearGradient>
          <linearGradient id="aorta" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#ef4444" />
            <stop offset="100%" stop-color="#b91c1c" />
          </linearGradient>
          <linearGradient id="pulmonary" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#3b82f6" />
            <stop offset="100%" stop-color="#1d4ed8" />
          </linearGradient>
          <linearGradient id="muscle" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#dc2626" />
            <stop offset="100%" stop-color="#991b1b" />
          </linearGradient>
        </defs>
        <rect width="900" height="600" fill="url(#bg)" rx="16" />
        <text x="450" y="55" fill="#f8fafc" font-size="28" font-family="sans-serif" font-weight="bold" text-anchor="middle">ANATOMÍA BÁSICA DEL CORAZÓN HUMANO</text>
        <text x="450" y="85" fill="#94a3b8" font-size="15" font-family="sans-serif" text-anchor="middle">Completá el diagrama colocando las estructuras en sus cavidades y vasos</text>
        <g transform="translate(180, 70)">
          <path d="M 120,70 Q 110,180 130,260 L 170,260 Q 150,180 160,70 Z" fill="#2563eb" stroke="#60a5fa" stroke-width="3" />
          <path d="M 230,150 Q 230,50 320,60 Q 400,70 380,180 L 330,170 Q 340,110 300,105 Q 270,100 270,150 Z" fill="url(#aorta)" stroke="#f87171" stroke-width="3" />
          <path d="M 270,60 L 270,20 L 290,20 L 290,65 Z" fill="#ef4444" stroke="#fca5a5" stroke-width="2" />
          <path d="M 310,65 L 320,20 L 340,23 L 330,75 Z" fill="#ef4444" stroke="#fca5a5" stroke-width="2" />
          <path d="M 355,85 L 375,35 L 395,43 L 375,100 Z" fill="#ef4444" stroke="#fca5a5" stroke-width="2" />
          <path d="M 240,180 Q 250,110 390,130 L 390,170 Q 290,150 280,210 Z" fill="url(#pulmonary)" stroke="#93c5fd" stroke-width="3" />
          <path d="M 140,240 Q 90,340 270,440 Q 430,320 400,220 Q 360,170 270,190 Q 180,170 140,240 Z" fill="url(#muscle)" stroke="#fca5a5" stroke-width="4" />
          <path d="M 270,210 Q 260,310 270,430" stroke="#7f1d1d" stroke-width="6" stroke-dasharray="6,6" fill="none" />
          <ellipse cx="200" cy="270" rx="35" ry="25" fill="#1e40af" opacity="0.8" />
          <ellipse cx="340" cy="270" rx="35" ry="25" fill="#991b1b" opacity="0.8" />
          <ellipse cx="210" cy="350" rx="45" ry="35" fill="#1e3a8a" opacity="0.8" />
          <ellipse cx="330" cy="350" rx="45" ry="35" fill="#7f1d1d" opacity="0.8" />
          <text x="280" y="45" fill="#fecaca" font-size="14" font-weight="bold" font-family="sans-serif">Arco Aórtico</text>
          <text x="80" y="120" fill="#bfdbfe" font-size="14" font-weight="bold" font-family="sans-serif">Vena Cava</text>
          <text x="395" y="150" fill="#bfdbfe" font-size="14" font-weight="bold" font-family="sans-serif">Arteria Pulmonar</text>
          <text x="200" y="275" fill="#ffffff" font-size="13" font-weight="bold" font-family="sans-serif" text-anchor="middle">Aurícula Der.</text>
          <text x="340" y="275" fill="#ffffff" font-size="13" font-weight="bold" font-family="sans-serif" text-anchor="middle">Aurícula Izq.</text>
          <text x="210" y="355" fill="#ffffff" font-size="13" font-weight="bold" font-family="sans-serif" text-anchor="middle">Ventrículo Der.</text>
          <text x="330" y="355" fill="#ffffff" font-size="13" font-weight="bold" font-family="sans-serif" text-anchor="middle">Ventrículo Izq.</text>
        </g>
      </svg>`,
      defaultSlots: [
        { label: "Arco Aórtico", x: 45, y: 10, width: 22, height: 18 },
        { label: "Vena Cava", x: 25, y: 22, width: 18, height: 16 },
        { label: "Ventrículo Izquierdo", x: 50, y: 60, width: 20, height: 18 },
        { label: "Aurícula Derecha", x: 36, y: 48, width: 18, height: 16 }
      ]
    },
    solar: {
      name: "Planetas del Sistema Solar",
      categoria: "Astronomía",
      instruction: "Arrastrá cada planeta o cuerpo celeste a su posición orbital correcta.",
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" width="900" height="600">
        <rect width="900" height="600" fill="#030712" rx="16"/>
        <circle cx="100" cy="80" r="1.5" fill="#fff" opacity="0.6"/>
        <circle cx="250" cy="140" r="2" fill="#fff" opacity="0.8"/>
        <circle cx="780" cy="110" r="1.5" fill="#fff" opacity="0.5"/>
        <circle cx="650" cy="500" r="2" fill="#fff" opacity="0.7"/>
        <circle cx="150" cy="480" r="1" fill="#fff" opacity="0.5"/>
        <text x="450" y="55" fill="#f8fafc" font-size="28" font-family="sans-serif" font-weight="bold" text-anchor="middle">SISTEMA SOLAR Y PLANETAS</text>
        <text x="450" y="85" fill="#94a3b8" font-size="15" font-family="sans-serif" text-anchor="middle">Ubicá los cuerpos celestes en sus respectivas órbitas</text>
        <circle cx="40" cy="330" r="150" fill="#f59e0b" stroke="#fbbf24" stroke-width="8" opacity="0.9"/>
        <text x="70" y="335" fill="#78350f" font-size="20" font-weight="bold" font-family="sans-serif">SOL</text>
        <ellipse cx="40" cy="330" rx="240" ry="160" fill="none" stroke="#334155" stroke-width="1.5" stroke-dasharray="4,4"/>
        <ellipse cx="40" cy="330" rx="380" ry="210" fill="none" stroke="#334155" stroke-width="1.5" stroke-dasharray="4,4"/>
        <ellipse cx="40" cy="330" rx="550" ry="250" fill="none" stroke="#334155" stroke-width="1.5" stroke-dasharray="4,4"/>
        <ellipse cx="40" cy="330" rx="720" ry="280" fill="none" stroke="#334155" stroke-width="1.5" stroke-dasharray="4,4"/>
        <g transform="translate(260, 270)">
          <circle cx="20" cy="20" r="24" fill="#0284c7" stroke="#38bdf8" stroke-width="2"/>
          <path d="M 10,15 Q 18,10 24,18 Q 30,25 22,32 Z" fill="#22c55e"/>
          <text x="20" y="58" fill="#bae6fd" font-size="13" font-weight="bold" font-family="sans-serif" text-anchor="middle">Tierra</text>
        </g>
        <g transform="translate(400, 220)">
          <circle cx="16" cy="16" r="18" fill="#dc2626" stroke="#f87171" stroke-width="2"/>
          <text x="16" y="48" fill="#fca5a5" font-size="13" font-weight="bold" font-family="sans-serif" text-anchor="middle">Marte</text>
        </g>
        <g transform="translate(560, 250)">
          <circle cx="45" cy="45" r="45" fill="#d97706" stroke="#fbbf24" stroke-width="3"/>
          <path d="M 8,35 Q 45,30 82,35" stroke="#92400e" stroke-width="6" fill="none"/>
          <path d="M 5,55 Q 45,50 85,55" stroke="#b45309" stroke-width="6" fill="none"/>
          <ellipse cx="65" cy="62" rx="8" ry="6" fill="#b91c1c"/>
          <text x="45" y="105" fill="#fde68a" font-size="14" font-weight="bold" font-family="sans-serif" text-anchor="middle">Júpiter</text>
        </g>
        <g transform="translate(730, 230)">
          <ellipse cx="40" cy="40" rx="55" ry="18" fill="none" stroke="#cbd5e1" stroke-width="5" transform="rotate(-18 40 40)"/>
          <circle cx="40" cy="40" r="32" fill="#e2e8f0" stroke="#94a3b8" stroke-width="2"/>
          <text x="40" y="90" fill="#e2e8f0" font-size="14" font-weight="bold" font-family="sans-serif" text-anchor="middle">Saturno</text>
        </g>
      </svg>`,
      defaultSlots: [
        { label: "Planeta Tierra", x: 28, y: 44, width: 10, height: 16 },
        { label: "Planeta Marte", x: 43, y: 35, width: 9, height: 14 },
        { label: "Planeta Júpiter", x: 61, y: 40, width: 14, height: 21 },
        { label: "Planeta Saturno", x: 79, y: 36, width: 16, height: 18 }
      ]
    }
  };

  function cropImageArea(img, crop) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";
    const nw = img.naturalWidth || img.width || 800;
    const nh = img.naturalHeight || img.height || 600;

    const px = Math.round((crop.x / 100) * nw);
    const py = Math.round((crop.y / 100) * nh);
    const pw = Math.max(1, Math.round((crop.width / 100) * nw));
    const ph = Math.max(1, Math.round((crop.height / 100) * nh));

    canvas.width = pw;
    canvas.height = ph;
    ctx.drawImage(img, px, py, pw, ph, 0, 0, pw, ph);
    return canvas.toDataURL("image/png");
  }

  const esc = (v) => (window.UI && typeof window.UI.esc === "function") ? window.UI.esc(v) : String(v == null ? "" : v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const view = (html) => {
    if (window.UI && typeof window.UI.view === "function") {
      window.UI.view(html);
    } else {
      const app = document.getElementById("app");
      if (app) app.innerHTML = `<div class="view">${html}</div>`;
    }
  };
  const toast = (msg) => {
    if (window.UI && typeof window.UI.toast === "function") {
      window.UI.toast(msg);
    } else {
      alert(msg);
    }
  };
  const rich = (v) => (window.UI && typeof window.UI.rich === "function") ? window.UI.rich(v) : esc(v);
  const navigate = (v) => {
    if (window.UI && typeof window.UI.navigate === "function") {
      window.UI.navigate(v);
    }
  };
  const renderQuiz = () => {
    if (window.UI && typeof window.UI.renderQuiz === "function") {
      window.UI.renderQuiz();
    }
  };

  // State of the creator UI
  const creatorState = {
    imageUrl: "",
    slots: [],
    selectedSlotId: null
  };

  function renderCreador() {
    try {
      const S = (window.Quiz && window.Quiz.S) ? window.Quiz.S : { questionnaires: [] };
      const qs = Array.isArray(S.questionnaires) ? S.questionnaires : [];

      const qsOptions = qs.map((q) => `<option value="${q.hash}">${esc(q.name || "Cuestionario")} (${(q.questions || []).length} preg.)</option>`).join("");
      const isNewOnly = qs.length === 0;

      view(`
        <div class="creador-wrap">
          <div class="card creador-head-card">
            <div class="sec-head" style="justify-content:space-between; flex-wrap:wrap; gap:12px;">
              <div style="display:flex; align-items:center; gap:10px;">
                <span class="material-symbols-outlined" style="font-size:26px;">crop</span>
                <div>
                  <h2>Creador de Preguntas con Imagen y Huecos</h2>
                  <p class="muted small sub">Recortá huecos sobre cualquier imagen para que los alumnos arrastren las porciones correspondientes.</p>
                </div>
              </div>
              <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
                <button class="btn sm secondary" id="btn-cr-sync-repo" type="button" title="Sincronizar preguntas de este navegador con el archivo del repositorio">
                  <span class="material-symbols-outlined" style="font-size:18px;">cloud_sync</span> Sincronizar con repo
                </button>
                <button class="btn sm secondary" id="btn-cr-export-json" type="button" title="Descargar archivo JSON de preguntas">
                  <span class="material-symbols-outlined" style="font-size:18px;">download</span> Exportar JSON
                </button>
              </div>
            </div>
          </div>

          <div class="creador-grid">
            <div class="card creador-main-card">
              <!-- Formulario básico -->
              <div class="creador-form-row">
                <label class="creador-field" style="flex:2">
                  <span class="mono-label">Enunciado de la pregunta *</span>
                  <input class="input" id="cr-title" placeholder="Ej: Ubicación de las cavidades y vasos del corazón" autocomplete="off">
                </label>
                <label class="creador-field" style="flex:1">
                  <span class="mono-label">Categoría / Tema</span>
                  <input class="input" id="cr-cat" placeholder="Ej: Anatomía" autocomplete="off">
                </label>
              </div>

              <div class="creador-form-row">
                <label class="creador-field" style="flex:1">
                  <span class="mono-label">Instrucción para el alumno</span>
                  <input class="input" id="cr-inst" value="Arrastrá cada una de las porciones recortadas a su hueco correspondiente en la imagen." autocomplete="off">
                </label>
              </div>

              <!-- Selector de cuestionario -->
              <div class="creador-target-box">
                <div class="creador-field" style="flex:1">
                  <span class="mono-label"><b>Asignar a Cuestionario:</b></span>
                  <select class="input" id="cr-target-quiz">
                    ${qsOptions}
                    <option value="__new__" ${isNewOnly ? "selected" : ""}>+ Crear nuevo cuestionario...</option>
                  </select>
                </div>
                <div id="cr-new-quiz-wrap" style="${isNewOnly ? "display:block;" : "display:none;"} flex:1">
                  <span class="mono-label">Nombre del nuevo cuestionario:</span>
                  <input class="input" id="cr-new-quiz-name" placeholder="Ej: Biología Celular y Anatomía">
                </div>
              </div>

              <!-- Barra de carga de imagen -->
              <div class="creador-upload-bar">
                <div class="creador-upload-actions">
                  <button class="btn sm primary" id="btn-cr-upload" type="button">
                    <span class="material-symbols-outlined">upload</span> Subir mi imagen
                  </button>
                  <input type="file" id="cr-file-input" accept="image/*" hidden>
                  <span class="muted small">o usar plantilla rápida:</span>
                  <button class="btn sm" id="btn-cr-preset-heart" type="button">❤️ Corazón</button>
                  <button class="btn sm" id="btn-cr-preset-solar" type="button">🪐 Sistema Solar</button>
                </div>
                <div class="muted small" id="cr-slots-count">0 huecos definidos</div>
              </div>

              <!-- Canvas / Lienzo interactivo -->
              <div class="creador-stage-wrap" id="cr-stage-wrap">
                <div class="creador-empty-zone" id="cr-empty-zone">
                  <span class="material-symbols-outlined" style="font-size:48px; opacity:0.6;">add_photo_alternate</span>
                  <h3>Cargá una imagen o elegí una plantilla arriba</h3>
                  <p class="muted small">Formatos admitidos: PNG, JPG, WebP o SVG. Una vez cargada, arrastrá el ratón para trazar los huecos.</p>
                </div>
                <div class="creador-canvas-container" id="cr-canvas-container" style="display:none;">
                  <img id="cr-base-img" alt="Base para recortar" draggable="false">
                  <div id="cr-slots-layer"></div>
                  <div id="cr-selection-box" class="cr-selection-box" style="display:none;"></div>
                </div>
              </div>
            </div>

            <!-- Columna lateral: Piezas recortadas -->
            <div class="card creador-side-card">
              <div class="sec-head" style="margin-bottom:10px;">
                <span class="material-symbols-outlined" style="font-size:20px;">extension</span>
                <div>
                  <h3 style="font-size:15px; margin:0;">Piezas Recortadas</h3>
                  <span class="muted small" id="cr-side-sub">Hacé clic y arrastrá en la imagen para recortar</span>
                </div>
              </div>

              <div class="creador-slots-list" id="cr-slots-list">
                <div class="muted small center-txt" style="padding:24px 0;">No hay piezas todavía.</div>
              </div>

              <div class="creador-actions-footer">
                <button class="btn primary block" id="btn-cr-save" type="button" style="font-weight:700;">
                  <span class="material-symbols-outlined">save</span> Guardar Pregunta
                </button>
              </div>
            </div>
          </div>
        </div>
      `);

      bindCreadorEvents();
    } catch (e) {
      console.error("renderCreador error:", e);
    }
  }

  function bindCreadorEvents() {
    const targetSelect = document.getElementById("cr-target-quiz");
    const newQuizWrap = document.getElementById("cr-new-quiz-wrap");
    if (targetSelect && newQuizWrap) {
      if (targetSelect.value === "__new__") newQuizWrap.style.display = "block";
      targetSelect.addEventListener("change", () => {
        newQuizWrap.style.display = targetSelect.value === "__new__" ? "block" : "none";
      });
    }

    const fileBtn = document.getElementById("btn-cr-upload");
    const fileInput = document.getElementById("cr-file-input");
    if (fileBtn && fileInput) {
      fileBtn.addEventListener("click", () => fileInput.click());
      fileInput.addEventListener("change", () => {
        const file = fileInput.files && fileInput.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
          loadNewImage(e.target.result);
        };
        reader.readAsDataURL(file);
        fileInput.value = "";
      });
    }

    const heartBtn = document.getElementById("btn-cr-preset-heart");
    if (heartBtn) {
      heartBtn.addEventListener("click", () => {
        loadPreset("heart");
      });
    }

    const solarBtn = document.getElementById("btn-cr-preset-solar");
    if (solarBtn) {
      solarBtn.addEventListener("click", () => {
        loadPreset("solar");
      });
    }

    const saveBtn = document.getElementById("btn-cr-save");
    if (saveBtn) {
      saveBtn.addEventListener("click", handleSaveQuestion);
    }

    const syncBtn = document.getElementById("btn-cr-sync-repo");
    if (syncBtn) {
      syncBtn.addEventListener("click", () => {
        const customs = window.Store && typeof window.Store.loadCustomQuestionnaires === "function" ? window.Store.loadCustomQuestionnaires() : [];
        if (!customs || !customs.length) {
          toast("No hay preguntas creadas en este navegador todavía.");
          return;
        }
        syncBtn.disabled = true;
        fetch("/api/sync-repo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(customs)
        })
          .then((r) => (r.ok ? r.json() : Promise.reject()))
          .then((data) => {
            syncBtn.disabled = false;
            toast(`¡Sincronizadas ${customs.length} lista(s) en data/image_questions.json!`);
          })
          .catch(() => {
            syncBtn.disabled = false;
            toast("No se pudo conectar con el servidor local para guardar en el archivo.");
          });
      });
    }

    const exportBtn = document.getElementById("btn-cr-export-json");
    if (exportBtn) {
      exportBtn.addEventListener("click", () => {
        const customs = window.Store && typeof window.Store.loadCustomQuestionnaires === "function" ? window.Store.loadCustomQuestionnaires() : [];
        const blob = new Blob([JSON.stringify(customs, null, 2)], { type: "application/json" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "image_questions.json";
        a.click();
        URL.revokeObjectURL(a.href);
      });
    }

    setupCanvasDrawing();
  }

  function loadNewImage(url, defaultSlots) {
    creatorState.imageUrl = url;
    creatorState.slots = [];
    creatorState.selectedSlotId = null;

    const emptyZone = document.getElementById("cr-empty-zone");
    const container = document.getElementById("cr-canvas-container");
    const img = document.getElementById("cr-base-img");

    if (emptyZone && container && img) {
      emptyZone.style.display = "none";
      container.style.display = "inline-block";
      img.src = url;
      img.onload = () => {
        if (Array.isArray(defaultSlots) && defaultSlots.length) {
          creatorState.slots = defaultSlots.map((s, idx) => ({
            id: `slot_${Date.now()}_${idx}`,
            x: s.x,
            y: s.y,
            width: s.width,
            height: s.height,
            label: s.label || `Pieza ${idx + 1}`,
            imageCropUrl: cropImageArea(img, s)
          }));
        }
        renderSlotsOverlay();
        renderSlotsList();
      };
    }
  }

  function loadPreset(type) {
    const p = PRESETS[type];
    if (!p) return;
    const url = "data:image/svg+xml;utf8," + encodeURIComponent(p.svg);
    const titleInput = document.getElementById("cr-title");
    const catInput = document.getElementById("cr-cat");
    const instInput = document.getElementById("cr-inst");
    if (titleInput && !titleInput.value) titleInput.value = p.name;
    if (catInput && !catInput.value) catInput.value = p.categoria;
    if (instInput && p.instruction) instInput.value = p.instruction;

    loadNewImage(url, p.defaultSlots);
  }

  function setupCanvasDrawing() {
    const container = document.getElementById("cr-canvas-container");
    const img = document.getElementById("cr-base-img");
    const box = document.getElementById("cr-selection-box");
    if (!container || !img || !box) return;

    let drawing = false;
    let startX = 0, startY = 0;

    const getCoords = (e) => {
      const rect = img.getBoundingClientRect();
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      const cy = e.touches ? e.touches[0].clientY : e.clientY;
      const clampedX = Math.max(rect.left, Math.min(cx, rect.right));
      const clampedY = Math.max(rect.top, Math.min(cy, rect.bottom));
      return {
        x: ((clampedX - rect.left) / rect.width) * 100,
        y: ((clampedY - rect.top) / rect.height) * 100
      };
    };

    const onStart = (e) => {
      if (e.target.closest("button")) return;
      drawing = true;
      const c = getCoords(e);
      startX = c.x;
      startY = c.y;
      box.style.display = "block";
      box.style.left = startX + "%";
      box.style.top = startY + "%";
      box.style.width = "0%";
      box.style.height = "0%";
    };

    const onMove = (e) => {
      if (!drawing) return;
      const c = getCoords(e);
      const minX = Math.min(startX, c.x);
      const minY = Math.min(startY, c.y);
      const w = Math.abs(c.x - startX);
      const h = Math.abs(c.y - startY);
      box.style.left = minX + "%";
      box.style.top = minY + "%";
      box.style.width = w + "%";
      box.style.height = h + "%";
    };

    const onEnd = (e) => {
      if (!drawing) return;
      drawing = false;
      box.style.display = "none";
      const c = getCoords(e);
      const minX = Math.min(startX, c.x);
      const minY = Math.min(startY, c.y);
      const w = Math.abs(c.x - startX);
      const h = Math.abs(c.y - startY);

      if (w > 3 && h > 3) {
        const crop = {
          x: Math.round(minX * 100) / 100,
          y: Math.round(minY * 100) / 100,
          width: Math.round(w * 100) / 100,
          height: Math.round(h * 100) / 100
        };
        const cropUrl = cropImageArea(img, crop);
        const newSlot = {
          id: `slot_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          x: crop.x,
          y: crop.y,
          width: crop.width,
          height: crop.height,
          label: `Pieza #${creatorState.slots.length + 1}`,
          imageCropUrl: cropUrl
        };
        creatorState.slots.push(newSlot);
        creatorState.selectedSlotId = newSlot.id;
        renderSlotsOverlay();
        renderSlotsList();
      }
    };

    container.addEventListener("mousedown", onStart);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onEnd);
    container.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onEnd, { passive: true });
  }

  function renderSlotsOverlay() {
    const layer = document.getElementById("cr-slots-layer");
    const countEl = document.getElementById("cr-slots-count");
    if (countEl) countEl.textContent = `${creatorState.slots.length} ${creatorState.slots.length === 1 ? "hueco definido" : "huecos definidos"}`;
    if (!layer) return;

    layer.innerHTML = creatorState.slots.map((s, idx) => {
      const isSel = s.id === creatorState.selectedSlotId;
      return `
        <div class="cr-slot-box ${isSel ? "selected" : ""}" style="left:${s.x}%; top:${s.y}%; width:${s.width}%; height:${s.height}%;" data-slot-id="${s.id}">
          <span class="cr-slot-tag">#${idx + 1}</span>
          <button class="cr-slot-del" data-del-id="${s.id}" type="button" title="Eliminar">✕</button>
        </div>
      `;
    }).join("");

    layer.querySelectorAll(".cr-slot-box").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        creatorState.selectedSlotId = el.dataset.slotId;
        renderSlotsOverlay();
        renderSlotsList();
      });
    });

    layer.querySelectorAll(".cr-slot-del").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        deleteSlot(btn.dataset.delId);
      });
    });
  }

  function deleteSlot(id) {
    creatorState.slots = creatorState.slots.filter((s) => s.id !== id);
    if (creatorState.selectedSlotId === id) creatorState.selectedSlotId = null;
    renderSlotsOverlay();
    renderSlotsList();
  }

  function renderSlotsList() {
    const list = document.getElementById("cr-slots-list");
    if (!list) return;

    if (!creatorState.slots.length) {
      list.innerHTML = `<div class="muted small center-txt" style="padding:24px 0;">No hay piezas todavía. Arrastrá sobre la imagen para recortar.</div>`;
      return;
    }

    list.innerHTML = creatorState.slots.map((s, idx) => {
      const isSel = s.id === creatorState.selectedSlotId;
      return `
        <div class="cr-piece-card ${isSel ? "active" : ""}" data-piece-id="${s.id}">
          <div class="cr-piece-thumb">
            <img src="${s.imageCropUrl}" alt="">
          </div>
          <div class="cr-piece-info">
            <span class="cr-piece-idx">Hueco #${idx + 1}</span>
            <input class="input cr-piece-label" data-id="${s.id}" value="${esc(s.label)}" placeholder="Nombre de la pieza">
          </div>
          <button class="btn-icon cr-piece-del" data-id="${s.id}" type="button" title="Eliminar">
            <span class="material-symbols-outlined" style="font-size:18px;">delete</span>
          </button>
        </div>
      `;
    }).join("");

    list.querySelectorAll(".cr-piece-label").forEach((inp) => {
      inp.addEventListener("input", (e) => {
        const id = inp.dataset.id;
        const s = creatorState.slots.find((x) => x.id === id);
        if (s) s.label = e.target.value;
      });
    });

    list.querySelectorAll(".cr-piece-del").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        deleteSlot(btn.dataset.id);
      });
    });
  }

  function handleSaveQuestion() {
    const title = (document.getElementById("cr-title").value || "").trim();
    const cat = (document.getElementById("cr-cat").value || "").trim();
    const inst = (document.getElementById("cr-inst").value || "").trim();
    const targetSelect = document.getElementById("cr-target-quiz");
    const targetVal = targetSelect ? targetSelect.value : "";
    const newNameInput = document.getElementById("cr-new-quiz-name");
    const newName = newNameInput ? newNameInput.value.trim() : "";

    if (!title) {
      toast("Escribí el enunciado de la pregunta.");
      return;
    }
    if (!creatorState.imageUrl) {
      toast("Tenés que cargar una imagen primero.");
      return;
    }
    if (!creatorState.slots.length) {
      toast("Agregá al menos un hueco recortado dibujando sobre la imagen.");
      return;
    }
    if (targetVal === "__new__" && !newName) {
      toast("Escribí el nombre para el nuevo cuestionario.");
      return;
    }

    const questionObj = {
      type: "image_puzzle",
      text: title,
      instruction: inst || "Arrastrá cada porción a su hueco correspondiente en la imagen.",
      category: cat || "General",
      baseImageUrl: creatorState.imageUrl,
      slots: creatorState.slots.map((s, idx) => ({
        id: s.id,
        order: idx,
        x: s.x,
        y: s.y,
        width: s.width,
        height: s.height,
        label: s.label,
        imageCropUrl: s.imageCropUrl
      })),
      explanation: ""
    };

    const targetHash = targetVal === "__new__" ? null : targetVal;
    const targetQz = window.Quiz.saveImageQuestion(targetHash, newName, questionObj);

    // Intentar persistir automáticamente al endpoint local de data/image_questions.json
    fetch("/api/save-repo-question", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        hash: targetQz.hash,
        name: targetQz.name,
        question: questionObj
      })
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => {
        if (res && res.ok) {
          toast(`¡Guardada en "${targetQz.name}" y añadida a data/image_questions.json!`);
        } else {
          toast(`¡Pregunta guardada en "${targetQz.name}"!`);
        }
      })
      .catch(() => {
        toast(`¡Pregunta guardada en "${targetQz.name}"!`);
      });

    // Show prompt / confirmation overlay to play or continue
    setTimeout(() => {
      if (confirm(`¡Pregunta guardada con éxito en "${targetQz.name}"!\n\n¿Querés probar el cuestionario ahora?`)) {
        window.Quiz.selectQuestionnaire(targetQz.hash);
        window.Quiz.newSession();
        navigate("quiz");
      } else {
        // Reset form for next question
        document.getElementById("cr-title").value = "";
        creatorState.slots = [];
        renderSlotsOverlay();
        renderSlotsList();
      }
    }, 200);
  }

  // -------------------------------------------------------------
  // PLAYING / SOLVING IMAGE PUZZLE IN QUIZ
  // -------------------------------------------------------------
  function renderCardHTML(q, it) {
    const answers = window.Quiz.S.answers[q.id] || {};

    // Generate dock pieces (unplaced)
    const placedPieceIds = new Set(Object.values(answers));
    const allPieces = q.slots.map((s) => ({
      id: s.id,
      imageCropUrl: s.imageCropUrl
    }));

    if (!it.puzzleShuffledPieces) {
      // Shuffle pieces once for this question
      const arr = allPieces.slice();
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
      }
      it.puzzleShuffledPieces = arr;
    }

    const dockPieces = it.puzzleShuffledPieces.filter((p) => !placedPieceIds.has(p.id));

    // Slots on the main base image
    const slotsHTML = q.slots.map((slot) => {
      const placedPieceId = answers[slot.id];
      const placedPiece = placedPieceId ? q.slots.find((s) => s.id === placedPieceId) : null;

      return `
        <div class="puzzle-slot ${placedPiece ? "filled" : "empty"}"
             data-qid="${q.id}"
             data-slot-id="${slot.id}"
             style="left:${slot.x}%; top:${slot.y}%; width:${slot.width}%; height:${slot.height}%;">
          ${placedPiece ? `
            <div class="puzzle-placed-piece" data-qid="${q.id}" data-slot-id="${slot.id}" data-piece-id="${placedPiece.id}">
              <img src="${placedPiece.imageCropUrl}" alt="" draggable="false">
              <span class="puzzle-remove-btn" title="Quitar">✕</span>
            </div>
          ` : `
            <div class="puzzle-hole-black"></div>
          `}
        </div>
      `;
    }).join("");

    // Pieces in dock: PURE IMAGES ONLY, no numbers, no descriptions
    const dockPiecesHTML = dockPieces.length ? dockPieces.map((piece) => `
      <div class="puzzle-dock-piece" data-qid="${q.id}" data-piece-id="${piece.id}" draggable="true">
        <img src="${piece.imageCropUrl}" alt="" draggable="false">
      </div>
    `).join("") : `<div class="muted small center-txt" style="grid-column:1/-1; padding:12px 0;">¡Todas las piezas ubicadas en sus huecos!</div>`;

    return `
      <div class="qtext">${rich(q.text)}</div>
      <div class="muted small" style="margin-bottom:12px;">${esc(q.instruction || "Arrastrá cada porción a su hueco correspondiente en la imagen:")}</div>
      <div class="puzzle-play-wrap" data-qid="${q.id}">
        <div class="puzzle-stage">
          <img src="${q.baseImageUrl}" alt="" class="puzzle-base-img" draggable="false">
          <div class="puzzle-slots-layer">${slotsHTML}</div>
        </div>
        <div class="puzzle-dock-container">
          <div class="puzzle-dock-header">
            <span class="material-symbols-outlined" style="font-size:16px;">extension</span>
            <span>Piezas (${dockPieces.length})</span>
          </div>
          <div class="puzzle-dock-grid" id="puzzle-dock-${q.id}">${dockPiecesHTML}</div>
        </div>
      </div>
    `;
  }

  function bindEvents() {
    let activeDragPieceId = null;
    let selectedPieceId = null; // Click-to-place fallback

    document.querySelectorAll(".puzzle-dock-piece").forEach((pieceEl) => {
      const qid = parseInt(pieceEl.dataset.qid, 10);
      const pieceId = pieceEl.dataset.pieceId;

      pieceEl.addEventListener("dragstart", (e) => {
        activeDragPieceId = pieceId;
        pieceEl.classList.add("dragging");
        if (e.dataTransfer) {
          e.dataTransfer.setData("text/plain", pieceId);
          e.dataTransfer.effectAllowed = "move";
        }
      });

      pieceEl.addEventListener("dragend", () => {
        activeDragPieceId = null;
        pieceEl.classList.remove("dragging");
      });

      // Click to select fallback
      pieceEl.addEventListener("click", () => {
        document.querySelectorAll(`.puzzle-dock-piece[data-qid="${qid}"]`).forEach(p => p.classList.remove("selected"));
        if (selectedPieceId === pieceId) {
          selectedPieceId = null;
        } else {
          selectedPieceId = pieceId;
          pieceEl.classList.add("selected");
        }
      });
    });

    document.querySelectorAll(".puzzle-slot").forEach((slotEl) => {
      const qid = parseInt(slotEl.dataset.qid, 10);
      const slotId = slotEl.dataset.slotId;

      slotEl.addEventListener("dragover", (e) => {
        e.preventDefault();
        if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
        slotEl.classList.add("hovered");
      });

      slotEl.addEventListener("dragleave", () => {
        slotEl.classList.remove("hovered");
      });

      slotEl.addEventListener("drop", (e) => {
        e.preventDefault();
        slotEl.classList.remove("hovered");
        const pieceId = e.dataTransfer ? (e.dataTransfer.getData("text/plain") || activeDragPieceId) : activeDragPieceId;
        if (pieceId) {
          window.Quiz.setPuzzleSlot(qid, slotId, pieceId);
          renderQuiz();
        }
      });

      slotEl.addEventListener("click", () => {
        if (selectedPieceId) {
          window.Quiz.setPuzzleSlot(qid, slotId, selectedPieceId);
          selectedPieceId = null;
          renderQuiz();
        }
      });
    });

    // Remove piece from slot on click
    document.querySelectorAll(".puzzle-remove-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const pieceWrap = btn.closest(".puzzle-placed-piece");
        if (!pieceWrap) return;
        const qid = parseInt(pieceWrap.dataset.qid, 10);
        const slotId = pieceWrap.dataset.slotId;
        window.Quiz.setPuzzleSlot(qid, slotId, null);
        renderQuiz();
      });
    });
  }

  function renderResultHTML(d) {
    const q = d.q;
    const placements = d.placements || {};

    const slotsResultHTML = q.slots.map((slot) => {
      const placedPieceId = placements[slot.id];
      const placedPiece = placedPieceId ? q.slots.find((s) => s.id === placedPieceId) : null;
      const isCorrect = placedPieceId === slot.id;

      return `
        <div class="puzzle-slot result ${isCorrect ? "correct" : placedPieceId ? "wrong" : "missed"}"
             style="left:${slot.x}%; top:${slot.y}%; width:${slot.width}%; height:${slot.height}%;">
          ${placedPiece ? `
            <img src="${placedPiece.imageCropUrl}" alt="" style="width:100%; height:100%; object-fit:cover;">
          ` : `
            <div class="puzzle-hole-black"></div>
          `}
          <span class="puzzle-res-badge ${isCorrect ? "correct" : "wrong"}">
            ${isCorrect ? "✓" : "✕"}
          </span>
        </div>
      `;
    }).join("");

    let correctCount = 0;
    q.slots.forEach(s => {
      if (placements[s.id] === s.id) correctCount++;
    });

    return `
      <div class="puzzle-result-stage-wrap">
        <div class="puzzle-stage">
          <img src="${q.baseImageUrl}" alt="" class="puzzle-base-img" draggable="false">
          <div class="puzzle-slots-layer">${slotsResultHTML}</div>
        </div>
      </div>
      <div class="muted small" style="margin-top:8px;">
        Aciertos: <b>${correctCount}</b> de <b>${q.slots.length}</b> huecos correctos.
      </div>
    `;
  }

  window.ImageQuiz = {
    renderCreador,
    renderCardHTML,
    bindEvents,
    renderResultHTML,
    cropImageArea
  };
})();
