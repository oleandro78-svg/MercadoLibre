// Mostrador: guarda la pantalla del panel para que abra rápido. Los datos siempre se piden al servidor.
const VERSION = "mostrador-v4";
const BASE = ["./", "index.html", "manifest.webmanifest", "icono-192.png", "icono-512.png",
  "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js"];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(VERSION).then((c) => c.addAll(BASE)).then(() => self.skipWaiting())); });
self.addEventListener("activate", (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", (e) => {
  const r = e.request;
  if (r.method !== "GET") return;
  const u = new URL(r.url);
  if (u.hostname.endsWith("supabase.co")) return; // datos y sesión: nunca de la memoria
  // La pantalla: primero la versión nueva; si no hay conexión, la guardada
  if (r.mode === "navigate") {
    e.respondWith(fetch(r).then((res) => { const copia = res.clone(); caches.open(VERSION).then((c) => c.put("index.html", copia)); return res; })
      .catch(() => caches.match("index.html")));
    return;
  }
  // Íconos, librería y letras: de la memoria si están
  e.respondWith(caches.match(r).then((m) => m || fetch(r).then((res) => {
    if (res.ok && (u.origin === location.origin || u.hostname.includes("jsdelivr") || u.hostname.includes("gstatic") || u.hostname.includes("googleapis"))) {
      const copia = res.clone(); caches.open(VERSION).then((c) => c.put(r, copia));
    }
    return res;
  })));
});
