# AGENTS.md — Quizzori

App estática de estudio (quizzes con repetición espaciada) deployada en GitHub Pages.
Vanilla JS sin build. Idioma de la UI y de los commits: español rioplatense.

## Ejecutar y verificar

```bash
python3 -m http.server        # servir en localhost (los CSV se cargan por fetch)
npm install && npm test       # suite completa jsdom (~15s, 4 harnesses)
node --check js/<file>.js     # syntax check rápido tras editar
```

No hay framework ni bundler: lo que está en `js/` va directo al browser.

## Mapa del proyecto

| Archivo | Rol |
|---|---|
| `index.html` | Shell único: header superior fijo (brand + nav desktop `#main-nav` + pomodoro/tema/cuenta) + `<main id="app">` + bottom nav móvil (`#bottom-nav`). Router client-side por vistas, no hay rutas URL. |
| `css/style.css` | Sistema "Dark Fidelity" completo (tokens al inicio, tema claro vía overrides en `html.light`). |
| `js/csv.js` | Parseo de CSV de preguntas → `questionnaires`. Tipos: select (columnas de opciones + índices), completar (sin opciones), dropdown (`opciones` + `respuestaN`) y relacione (`correctas` con textos `;`-separados en el orden de las afirmaciones: las afirmaciones son las demás celdas con texto de la fila y el menú se arma con esa lista; alternativa legada: pares `a=b` posicionales sobre las celdas, puede desbordar columnas sin encabezado) |
| `js/storage.js` (`QuizStore`) | localStorage + snapshot/restore para sync. Claves `quiz.*`. Exporta también para Node (`module.exports`). |
| `js/scheduler.js` | Repetición espaciada: qué toca repasar hoy (buscar SIEMPRE preguntas por id vía `byIdMap`, no por posición del array) |
| `js/quiz.js` (`Quiz`) | Estado y lógica de sesión: modos, respuestas, submit, drafts |
| `js/cloud.js` (`Cloud`) | Firebase Auth (Google) + Firestore sync del progreso (`/users/{uid}`) + colección pública `courses` (materias visibles para todos, escritura solo admin). Config dentro del archivo. |
| `js/ui.js` (`UI`) | TODO el render y routing de vistas: `inicio` (horario hoy desde const `HORARIOS`, quizzes, tarjeta pomodoro "Modo Enfoque" que comparte estado con la del header, parciales solo lectura, tareas), `cursos`, `progreso`, quiz, resultados, calendario, pomodoro, cloud UI |

Datos: `data/*.csv` — un CSV = un cuestionario ("Final ADS" 278 preguntas, "Burpleria").

## APIs clave (y trampas)

- **`Quiz.S` es un OBJETO de estado, no una función** (fuente clásica de bugs).
- Funciones usadas desde ui.js: `statsFor(hash)`, `scheduledByDayFor(hash)`,
  `questionsOnDayFor(hash)`, `examDateFor/setExamDateFor`, `draftOf`, `tryResume`,
  `newSession`, `selectQuestionnaire`, `loadCsv`, `tryLoadSaved`, `resetProgressFor`,
  `setMode/setSize/setPoints`, `toggle/setSlot/setFill`, `answeredCount/isAnswered`,
  `submit/repeatSession/failedSession`.
- Cada vista renderiza su HTML en `#app` y debe **bindear sus propios botones**
  (no hay delegación global; `bindExamCard(hash)` solo corre si el elemento existe).
- El quiz es otra vista más: al salir vuelve a `returnView`.
- `window.Cloud.user()` devuelve `{uid, name, email}` o `null`. `Cloud.isAdmin()`
  compara email contra `ADMIN_EMAILS` (en cloud.js). `isOwner()` en ui.js = solo
  `isAdmin()` (email admin, sin fallback por displayName).
- Sync automático: toda clave `quiz.*` que NO esté en `EXCLUDE_SYNC` (storage.js)
  viaja a Firestore al tocarla. Cuidado con meter objetos grandes ahí.

## Permisos / roles

- **Admin**: `oriannafernandezdelrosario@gmail.com` — edita cursos (material/quizzes/links
  por curso, guardados en `quiz.courses`) y los publica a la colección pública
  Firestore `courses` (doc `all`). Reglas en Firebase: read público en `/courses`,
  write solo admin email; `/users/{uid}` solo su dueño.
- **Visitantes**: ven todo, practican y guardan progreso localmente; si inician
  sesión con Google, su progreso se sincroniza.

## Convenciones

- **Cache busting**: al cambiar cualquier css/js, subir `?v=N` en index.html
  (actualmente `v=32`). GitHub Pages cachea agresivo.
- Sin comentarios en el código salvo headers instructivos (como el de cloud.js).
- Strings de UI siempre en español rioplatense (vos, tenés, hacé).
- URLs externas: validar esquema http/https (ver `safeUrl`), nunca `javascript:`.
- Los harnesses de `tests/` usan jsdom con los scripts inlineados; mockean
  `window.Cloud`/`fetch` según el caso. Si agregás una feature, sumale checks a
  `tests/run*.js`.

## Gotchas conocidos

- Firefox headless `--dump-dom` se cuelga en este proyecto: usar jsdom, no selenium.
- `form.lkname` (acceso por nombre) no funciona en jsdom: usar
  `form.querySelector("[name=…]")` — vale para máxima compatibilidad también.
- jsdom no dispara `DOMContentLoaded` antes de ~300ms en estos harnesses: los
  tests esperan con sleeps.
