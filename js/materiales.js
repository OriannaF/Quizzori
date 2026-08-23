"use strict";

/*
 * Material compartido (colección pública "materiales" en Firestore).
 *
 * Reglas sugeridas en Firebase → Firestore → Reglas (además de las de /users/):
 *   match /materiales/{doc} {
 *     allow read: if true;
 *     allow create, update, delete: if request.auth != null
 *       && request.auth.token.email == 'oriannafernandezdelrosario@gmail.com';
 *   }
 */

(function () {
  const Materiales = (() => {
    let cache = [];
    let loaded = false;
    let loading = null;
    const cbs = [];
    const emit = () => cbs.forEach((fn) => { try { fn(cache); } catch (e) {} });

    function safeUrl(u) {
      const s = String(u || "").trim();
      return /^https?:\/\//i.test(s) ? s : "";
    }

    function dbReady() {
      if (!window.Cloud || typeof window.Cloud.ensureDb !== "function") {
        return Promise.reject(new Error("Firestore no disponible"));
      }
      return window.Cloud.ensureDb();
    }

    function fetchAll() {
      if (!window.Cloud || !window.Cloud.isConfigured()) return Promise.resolve(cache);
      if (!loading) {
        loading = dbReady().then((db) =>
          db.collection("materiales").limit(200).get()
        ).then((snap) => {
          cache = snap.docs.map((d) => {
            const v = d.data() || {};
            return { id: d.id, nombre: String(v.nombre || "Material"), url: String(v.url || "") };
          });
          loaded = true;
          emit();
          return cache;
        }).catch(() => {
          loaded = true;
          emit();
          return cache;
        });
      }
      return loading;
    }

    function add(nombre, url) {
      const clean = safeUrl(url);
      if (!clean) return Promise.reject(new Error("URL inválida"));
      return dbReady().then((db) =>
        db.collection("materiales").add({
          nombre: String(nombre || clean).slice(0, 120),
          url: clean,
          createdAt: Date.now(),
          createdBy: (window.Cloud.user() || {}).email || ""
        })
      );
    }

    function remove(id) {
      return dbReady().then((db) => db.collection("materiales").doc(id).delete());
    }

    function refresh() {
      loading = null;
      loaded = false;
      return fetchAll();
    }

    function subscribe(fn) { if (typeof fn === "function") cbs.push(fn); }
    function items() { return cache.slice(); }

    return { fetchAll, refresh, add, remove, subscribe, items, isLoaded: () => loaded, safeUrl };
  })();

  if (typeof window !== "undefined") window.Materiales = Materiales;
  if (typeof module !== "undefined" && module.exports) module.exports = Materiales;
})();
