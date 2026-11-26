// Mostrador: guarda la pantalla del panel para que abra rápido. Los datos siempre se piden al servidor.
const VERSION = "mostrador-v252";
const BASE = ["./", "index.html", "manifest.webmanifest", "icono-192.png", "icono-512.png", "icono-notif.png",
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
    // Se pide sin la memoria del navegador (GitHub guarda la página 10 minutos) para mostrar siempre la última versión
    // Cada link (empresas y operadores, o dueño de la app) se guarda por separado
    const clave = u.pathname.includes("/dueno") ? "dueno/index.html" : "index.html";
    e.respondWith(fetch(new Request(r.url, { cache: "no-cache", credentials: "same-origin" })).then((res) => { const copia = res.clone(); caches.open(VERSION).then((c) => c.put(clave, copia)); return res; })
      .catch(() => caches.match(clave)));
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

// Avisos push: llega una pregunta para responder aunque el panel esté cerrado
self.addEventListener("push", (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch { d = { body: e.data ? e.data.text() : "" }; }
  e.waitUntil((async () => {
    // Ya no queda nada pendiente de ese módulo: se borra la notificación del celular
    if (d.cerrar) {
      for (const n of await self.registration.getNotifications({ tag: d.cerrar })) n.close();
    } else {
      // Mismo módulo, mismo "tag": reemplaza la anterior con el total. Si solo bajó el total, se actualiza sin sonar.
      await self.registration.showNotification(d.title || "Mostrador", {
        body: d.body || "Hay una pregunta para responder", tag: d.tag || "mostrador", renotify: !d.silencioso, silent: !!d.silencioso,
        icon: "/MercadoLibre/chatbot/icono-192.png", badge: "/MercadoLibre/chatbot/icono-notif.png", data: { url: d.url || "./" },
      });
    }
    try { const n = await self.registration.getNotifications(); if (self.navigator.setAppBadge) await self.navigator.setAppBadge(n.length); } catch {}
  })());
});
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil((async () => {
    const url = e.notification.data?.url || "./";
    // Solo ventanas de esta app (no otras páginas del mismo sitio)
    const ventanas = (await clients.matchAll({ type: "window", includeUncontrolled: true })).filter((v) => v.url.startsWith(self.registration.scope));
    const abierta = ventanas.find((v) => "focus" in v);
    if (abierta) {
      try { await abierta.focus(); } catch { /* sigue */ }
      // La app abierta confirma que recibió el pedido; si estaba dormida y no contesta, se la lleva a la dirección del aviso
      const ok = await new Promise((res) => {
        const ch = new MessageChannel(); const t = setTimeout(() => res(false), 2000);
        ch.port1.onmessage = () => { clearTimeout(t); res(true); };
        try { abierta.postMessage({ abrir: url }, [ch.port2]); } catch { clearTimeout(t); res(false); }
      });
      if (ok) return;
      if ("navigate" in abierta) { try { await abierta.navigate(url); return; } catch { /* abre otra */ } }
    }
    return clients.openWindow(url);
  })());
});
