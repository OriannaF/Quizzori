"use strict";

/*
 * Sincronización en la nube (Firebase Auth + Firestore).
 *
 * Para activarla:
 * 1. Creá un proyecto gratis en https://console.firebase.google.com
 * 2. Authentication → Sign-in method → habilitá "Google".
 * 3. Firestore Database → crear base → modo producción.
 * 4. Reglas sugeridas:
 *      rules_version = '2';
 *      service cloud.firestore {
 *        match /databases/{database}/documents {
 *          match /courses/{doc} {
 *            allow read: if true;
 *            allow write: if request.auth != null &&
 *              request.auth.token.email in ['oriannafernandezdelrosario@gmail.com'];
 *          }
 *          match /users/{uid} {
 *            allow read, write: if request.auth != null && request.auth.uid == uid;
 *          }
 *        }
 *      }
 * 5. Project settings → Tus apps → Web → copiá los valores de config acá abajo.
 *
 * Sin configurar, la app funciona igual y el botón de cuenta explica estos pasos.
 */

(function () {
  const Cloud = (() => {
    const SDK_BASE = "https://www.gstatic.com/firebasejs/10.12.2";
    const FIREBASE_CONFIG = {
      apiKey: "AIzaSyBkV7vABdSnCwzSl7ApIgjsYL5BMf9ToO0",
      authDomain: "quizzori.firebaseapp.com",
      projectId: "quizzori",
      storageBucket: "quizzori.firebasestorage.app",
      messagingSenderId: "116920483833",
      appId: "1:116920483833:web:d56145d2d7d3ae9135c728"
    };

    const isConfigured = () =>
      !!FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.apiKey.indexOf("PONÉ") !== 0;

    const ADMIN_EMAILS = ["oriannafernandezdelrosario@gmail.com"];

    let fb = null;
    let user = null;
    let pushTimer = null;
    let storeUnsub = null;
    let started = false;
    let listenerAttached = false;
    let syncState = "idle";
    const REDIRECT_FLAG = "quiz.cloud.redirect";
    const cbs = [];
    const emit = () => cbs.forEach((fn) => { try { fn(user); } catch (e) {} });

    const encKey = (k) => String(k).replace(/\./g, "__");
    const decKey = (k) => String(k).replace(/_+/g, ".");

    function loadSdk() {
      return new Promise((resolve, reject) => {
        if (typeof window.firebase === "object" && window.firebase.firestore) return resolve(window.firebase);
        const files = ["firebase-app-compat.js", "firebase-auth-compat.js", "firebase-firestore-compat.js"];
        let pending = files.length;
        let failed = false;
        files.forEach((f) => {
          const s = document.createElement("script");
          s.src = `${SDK_BASE}/${f}`;
          s.async = true;
          s.onload = () => { if (--pending === 0 && !failed) resolve(window.firebase); };
          s.onerror = () => {
            failed = true;
            reject(new Error("No se pudieron descargar los SDK de Firebase."));
          };
          document.head.appendChild(s);
        });
      });
    }

    function initFb(firebase) {
      if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
      fb = firebase;
    }

    function mergeSnap(local, remote) {
      const rk = remote && remote.kv ? remote.kv : {};
      const rt = remote && remote.times ? remote.times : {};
      const outKv = {};
      const outTimes = {};
      const keys = new Set(Object.keys(local.kv).concat(Object.keys(rk)));
      keys.forEach((ek) => {
        const hasL = Object.prototype.hasOwnProperty.call(local.kv, ek);
        const hasR = Object.prototype.hasOwnProperty.call(rk, ek);
        if (hasL && !hasR) { outKv[ek] = local.kv[ek]; outTimes[ek] = local.times[ek] || 0; }
        else if (!hasL && hasR) { outKv[ek] = rk[ek]; outTimes[ek] = rt[ek] || 0; }
        else if ((rt[ek] || 0) > (local.times[ek] || 0)) { outKv[ek] = rk[ek]; outTimes[ek] = rt[ek] || 0; }
        else { outKv[ek] = local.kv[ek]; outTimes[ek] = local.times[ek] || 0; }
      });
      return { kv: outKv, times: outTimes };
    }

    function docFromSnap(snap, savedAt) {
      const kv = {}, times = {};
      Object.keys(snap.kv).forEach((k) => {
        kv[encKey(k)] = snap.kv[k];
        times[encKey(k)] = snap.times[k] || savedAt;
      });
      return { kv, times, savedAt };
    }

    function snapFromDoc(d) {
      const rk = (d && d.kv) || {};
      const rt = (d && d.times) || {};
      const kv = {}, times = {};
      Object.keys(rk).forEach((k) => {
        const rawKey = decKey(k);
        kv[rawKey] = rk[k];
        times[rawKey] = rt[k] || 0;
      });
      return { kv, times };
    }

    async function pushNow() {
      if (!fb || !user) return;
      syncState = "syncing";
      emit();
      try {
        const snap = window.QuizStore.snapshot();
        await fb.firestore().collection("users").doc(user.uid)
          .set(docFromSnap(snap, Date.now()));
        syncState = "saved";
        emit();
      } catch (e) {
        syncState = "error";
        emit();
      }
    }

    function schedulePush() {
      if (pushTimer) clearTimeout(pushTimer);
      pushTimer = setTimeout(() => { pushTimer = null; pushNow(); }, 2500);
    }

    function flush() {
      if (pushTimer) { clearTimeout(pushTimer); pushTimer = null; }
      return pushNow();
    }

    async function pullMergeAndPush() {
      if (!fb || !user) return;
      syncState = "syncing";
      emit();
      try {
        const ref = fb.firestore().collection("users").doc(user.uid);
        const doc = await ref.get();
        const local = window.QuizStore.snapshot();
        if (doc.exists) {
          const remote = snapFromDoc(doc.data() || {});
          const merged = mergeSnap(local, remote);
          window.QuizStore.restore(merged.kv, merged.times);
          await ref.set(docFromSnap(merged, Date.now()));
        } else {
          await ref.set(docFromSnap(local, Date.now()));
        }
        syncState = "saved";
        emit();
      } catch (e) {
        syncState = "error";
        emit();
      }
    }

    function startSession(u) {
      user = u ? { uid: u.uid, name: u.displayName || "", email: u.email || "", verified: !!u.emailVerified } : null;
      if (!user) { emit(); return; }
      pullMergeAndPush().then(() => {
        if (user && !storeUnsub) storeUnsub = window.QuizStore.onChange(schedulePush);
      });
      emit();
    }

    function stopSession() {
      user = null;
      syncState = "idle";
      if (storeUnsub) { storeUnsub(); storeUnsub = null; }
      if (pushTimer) { clearTimeout(pushTimer); pushTimer = null; }
      emit();
    }

    function attachAuthListener() {
      if (!fb || listenerAttached) return;
      listenerAttached = true;
      fb.auth().onAuthStateChanged((u) => {
        if (u && (!user || user.uid !== u.uid)) startSession(u);
        else if (!u && user) stopSession();
      });
    }

    function ensureLoaded() {
      if (fb) return Promise.resolve();
      return loadSdk().then((firebase) => {
        initFb(firebase);
        trySetLocalPersistence();
        attachAuthListener();
      });
    }

    function trySetLocalPersistence() {
      try {
        if (fb && fb.auth) {
          const P = (window.firebase && window.firebase.auth && window.firebase.auth.Auth && window.firebase.auth.Auth.Persistence) || {};
          const localP = P.LOCAL || "local";
          fb.auth().setPersistence(localP).catch(() => {});
        }
      } catch (e) {}
    }

    function doRedirect(provider) {
      try { localStorage.setItem(REDIRECT_FLAG, "1"); } catch (e) {}
      return fb.auth().signInWithRedirect(provider).catch((err) => {
        try { localStorage.removeItem(REDIRECT_FLAG); } catch (e) {}
        throw err;
      });
    }

    const GTASKS_TOKEN_KEY = "quiz.gtasks.token";
    const GTASKS_EXP_KEY = "quiz.gtasks.exp";

    function getGTasksToken() {
      try {
        const tok = localStorage.getItem(GTASKS_TOKEN_KEY);
        const exp = parseInt(localStorage.getItem(GTASKS_EXP_KEY) || "0", 10);
        if (tok && exp && Date.now() > exp) {
          localStorage.removeItem(GTASKS_TOKEN_KEY);
          localStorage.removeItem(GTASKS_EXP_KEY);
          return null;
        }
        return tok;
      } catch (e) { return null; }
    }

    function setGTasksToken(tok) {
      try {
        if (!tok) {
          localStorage.removeItem(GTASKS_TOKEN_KEY);
          localStorage.removeItem(GTASKS_EXP_KEY);
          return;
        }
        localStorage.setItem(GTASKS_TOKEN_KEY, tok);
        localStorage.setItem(GTASKS_EXP_KEY, String(Date.now() + 3500 * 1000));
      } catch (e) {}
    }

    function hasGTasksPermission() {
      return !!getGTasksToken();
    }

    async function gtasksFetch(endpoint, options = {}) {
      const token = getGTasksToken();
      if (!token) throw new Error("No hay conexión con Google Tasks. Iniciá sesión para sincronizar.");
      const res = await fetch(`https://tasks.googleapis.com/tasks/v1${endpoint}`, {
        ...options,
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          ...(options.headers || {})
        }
      });
      if (res.status === 401) {
        setGTasksToken(null);
        throw new Error("La sesión de Google Tasks expiró. Tocá Sincronizar para reconectar.");
      }
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const msg = (errData && errData.error && errData.error.message) || `Error ${res.status}`;
        throw new Error(msg);
      }
      if (res.status === 204) return null;
      return res.json();
    }

    async function fetchGTasks() {
      const data = await gtasksFetch("/lists/@default/tasks?showCompleted=true&showHidden=true&maxResults=100");
      return (data && Array.isArray(data.items)) ? data.items : [];
    }

    async function createGTask(task) {
      const body = {
        title: task.txt || "Nueva tarea",
        notes: task.mat ? `[Materia: ${task.mat}]` : "",
        status: task.done ? "completed" : "needsAction"
      };
      return gtasksFetch("/lists/@default/tasks", {
        method: "POST",
        body: JSON.stringify(body)
      });
    }

    async function updateGTask(gId, updates) {
      if (!gId) return null;
      const body = {};
      if (typeof updates.done === "boolean") {
        body.status = updates.done ? "completed" : "needsAction";
      }
      if (updates.txt) {
        body.title = updates.txt;
      }
      if (updates.mat !== undefined) {
        body.notes = updates.mat ? `[Materia: ${updates.mat}]` : "";
      }
      return gtasksFetch(`/lists/@default/tasks/${encodeURIComponent(gId)}`, {
        method: "PATCH",
        body: JSON.stringify(body)
      });
    }

    async function deleteGTask(gId) {
      if (!gId) return null;
      return gtasksFetch(`/lists/@default/tasks/${encodeURIComponent(gId)}`, {
        method: "DELETE"
      });
    }

    function parseMatFromNotes(notes) {
      if (!notes) return "";
      const m = String(notes).match(/\[Materia:\s*([^\]]+)\]/i);
      if (m) return m[1].trim();
      return "";
    }

    async function connectGoogleTasks() {
      await ensureLoaded();
      const provider = new fb.auth.GoogleAuthProvider();
      provider.addScope("https://www.googleapis.com/auth/tasks");
      try {
        const cred = await fb.auth().signInWithPopup(provider);
        if (cred && cred.credential && cred.credential.accessToken) {
          setGTasksToken(cred.credential.accessToken);
        }
        if (cred && cred.user) {
          startSession({ uid: cred.user.uid, displayName: cred.user.displayName || "", email: cred.user.email || "", emailVerified: cred.user.emailVerified });
        }
        return getGTasksToken();
      } catch (err) {
        const c = String((err && err.code) || "");
        const fallback = c.indexOf("popup") !== -1 ||
          c === "auth/operation-not-supported-in-this-environment" ||
          c === "auth/network-request-failed";
        if (fallback) return doRedirect(provider);
        throw err;
      }
    }

    async function syncGoogleTasks() {
      if (!getGTasksToken()) {
        await connectGoogleTasks();
      }
      const remoteTasks = await fetchGTasks();
      const localTasks = (window.QuizStore && window.QuizStore.loadTasks) ? window.QuizStore.loadTasks().slice() : [];
      
      const remoteMap = new Map();
      remoteTasks.forEach((gt) => {
        if (!gt.id || gt.deleted) return;
        remoteMap.set(gt.id, gt);
      });

      const merged = [];
      const handledGIds = new Set();

      localTasks.forEach((lt) => {
        if (lt.gId && remoteMap.has(lt.gId)) {
          const gt = remoteMap.get(lt.gId);
          handledGIds.add(lt.gId);
          merged.push({
            id: lt.id,
            txt: gt.title || lt.txt,
            mat: lt.mat || parseMatFromNotes(gt.notes),
            done: gt.status === "completed",
            gId: gt.id,
            ts: gt.updated ? new Date(gt.updated).getTime() : lt.ts
          });
        } else if (!lt.gId) {
          merged.push(lt);
        }
      });

      remoteMap.forEach((gt, gId) => {
        if (!handledGIds.has(gId)) {
          merged.push({
            id: "gt_" + gId,
            txt: gt.title || "Tarea de Google Tasks",
            mat: parseMatFromNotes(gt.notes),
            done: gt.status === "completed",
            gId: gt.id,
            ts: gt.updated ? new Date(gt.updated).getTime() : Date.now()
          });
        }
      });

      for (let i = 0; i < merged.length; i++) {
        const t = merged[i];
        if (!t.gId) {
          try {
            const created = await createGTask(t);
            if (created && created.id) t.gId = created.id;
          } catch (e) {
            console.warn("No se pudo crear tarea en Google:", e);
          }
        }
      }

      if (window.QuizStore && window.QuizStore.saveTasks) {
        window.QuizStore.saveTasks(merged.slice(0, 50));
      }
      return merged;
    }

    function signIn() {
      return ensureLoaded().then(() => {
        const provider = new fb.auth.GoogleAuthProvider();
        provider.addScope("https://www.googleapis.com/auth/tasks");
        return fb.auth().signInWithPopup(provider).catch((err) => {
          const c = String((err && err.code) || "");
          const fallback = c.indexOf("popup") !== -1 ||
            c === "auth/operation-not-supported-in-this-environment" ||
            c === "auth/network-request-failed";
          if (!fallback) throw err;
          return doRedirect(provider);
        });
      }).then((cred) => {
        if (cred && cred.credential && cred.credential.accessToken) {
          setGTasksToken(cred.credential.accessToken);
        }
        if (cred && cred.user) startSession({ uid: cred.user.uid, displayName: cred.user.displayName || "", email: cred.user.email || "", emailVerified: cred.user.emailVerified });
      });
    }

    function isAdmin() {
      return !!user && ADMIN_EMAILS.indexOf(String(user.email || "").toLowerCase()) !== -1;
    }

    function isVerified() {
      return !!user && user.verified === true;
    }

    function ensureDb() {
      if (!isConfigured()) return Promise.reject(new Error("Firebase sin configurar"));
      return loadSdk().then((firebase) => {
        initFb(firebase);
        return fb.firestore();
      });
    }

    function fetchPublicCourses() {
      return ensureDb().then(async (db) => {
        const doc = await db.collection("courses").doc("all").get();
        if (!doc.exists) return null;
        const list = (doc.data() || {}).list;
        return Array.isArray(list) ? list : null;
      });
    }

    function publishCourses(list) {
      const arr = Array.isArray(list) ? list : [];
      return ensureDb().then((db) =>
        db.collection("courses").doc("all").set({ list: arr, updatedAt: Date.now() }));
    }

    function signOut() {
      setGTasksToken(null);
      if (!fb) return Promise.resolve();
      return fb.auth().signOut().catch(() => {});
    }

    async function resetProgress() {
      if (!fb || !user) return;
      try {
        await fb.firestore().collection("users").doc(user.uid).delete();
      } catch (e) {}
      if (window.QuizStore && window.QuizStore.clearAll) window.QuizStore.clearAll();
    }

    function init() {
      if (started || !isConfigured()) return;
      started = true;
      let pendingRedirect = false;
      try { pendingRedirect = localStorage.getItem(REDIRECT_FLAG) === "1"; } catch (e) {}
      ensureLoaded().then(() => {
        if (fb && fb.auth) {
          fb.auth().getRedirectResult().then((res) => {
            if (res && res.credential && res.credential.accessToken) {
              setGTasksToken(res.credential.accessToken);
            }
            if (res && res.user && (!user || user.uid !== res.user.uid)) {
              startSession(res.user);
            }
          }).catch(() => {});
        }
        if (pendingRedirect) {
          try { localStorage.removeItem(REDIRECT_FLAG); } catch (e) {}
        }
      }).catch(() => {});
    }

    if (typeof document !== "undefined" && typeof document.addEventListener === "function") {
      document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") flush(); });
    }
    if (typeof window !== "undefined" && typeof window.addEventListener === "function") {
      window.addEventListener("beforeunload", flush);
    }

    return {
      isConfigured, init, signIn, signOut, warm: () => { ensureLoaded().catch(() => {}); },
      user: () => user,
      syncState: () => syncState,
      flush,
      isAdmin, isVerified, ensureDb,
      fetchPublicCourses, publishCourses,
      resetProgress,
      snapFromDoc, docFromSnap, encKey, decKey,
      // Google Tasks API
      hasGTasksPermission, connectGoogleTasks, syncGoogleTasks,
      createGTask, updateGTask, deleteGTask, fetchGTasks,
      onChange: (fn) => { if (typeof fn === "function") cbs.push(fn); }
    };
  })();

  if (typeof window !== "undefined") window.Cloud = Cloud;
  if (typeof module !== "undefined" && module.exports) module.exports = Cloud;
})();
