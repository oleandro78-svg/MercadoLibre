// Mostrador: apariencias intercambiables ("skins").
// Cada persona elige la suya en el menú → Apariencia; queda guardada en este dispositivo.
// Una apariencia es solo una hoja de estilos (skins/<archivo>.css) que se aplica sobre la pantalla de siempre:
// no cambia cómo funciona nada. Para agregar otra: sumarla en SKINS y crear su archivo .css.
(function () {
  const BASE = (document.currentScript && document.currentScript.src || "").replace(/[^/]*$/, "");
  const VER = "2"; // subir al cambiar los .css para que los teléfonos no usen la copia vieja
  const SKINS = {
    clasica: { nombre: "Clásica", desc: "El diseño de siempre de Mostrador", muestra: ["#F2F5F7", "#16202A", "#0D7A64"] },
    wa: { nombre: "Estilo WhatsApp", desc: "Listas, colores y barra de abajo como en WhatsApp", css: "whatsapp.css", muestra: ["#FFFFFF", "#111B21", "#25D366"] },
  };
  const CLAVE = "mostrador_skin";
  const leer = () => { try { const v = localStorage.getItem(CLAVE); return SKINS[v] ? v : "clasica"; } catch { return "clasica"; } };
  let actual = leer();

  function aplicar(id) {
    actual = SKINS[id] ? id : "clasica";
    const raiz = document.documentElement;
    if (actual === "clasica") raiz.removeAttribute("data-skin"); else raiz.setAttribute("data-skin", actual);
    for (const [k, s] of Object.entries(SKINS)) {
      if (!s.css) continue;
      let l = document.getElementById("skin-" + k);
      if (k === actual && !l) {
        l = document.createElement("link"); l.id = "skin-" + k; l.rel = "stylesheet"; l.href = BASE + s.css + "?v=" + VER;
        (document.head || raiz).appendChild(l);
      }
      if (l) l.disabled = k !== actual;
    }
    // Color de la barra del teléfono
    const m = document.querySelector('meta[name="theme-color"]');
    if (m) { m.dataset.orig ??= m.content; m.content = actual === "wa" ? (oscuro() ? "#111B21" : "#FFFFFF") : m.dataset.orig; }
    if (document.body) barra();
  }
  const oscuro = () => { const t = document.documentElement.getAttribute("data-theme"); return t ? t === "dark" : matchMedia("(prefers-color-scheme: dark)").matches; };
  aplicar(actual);

  // Estilos de la hoja "Apariencia" (valen para todas las apariencias: usan los colores de la que esté puesta)
  const est = document.createElement("style");
  est.textContent = `.skin-velo{position:fixed;inset:0;z-index:300;background:rgba(10,16,22,.45);display:flex;align-items:center;justify-content:center;padding:16px}
.skin-hoja{background:var(--sup);color:var(--tinta);width:min(440px,100%);border-radius:var(--r-l,18px);padding:18px 18px 16px;box-shadow:0 10px 40px rgba(0,0,0,.25)}
.skin-asa{display:none;width:36px;height:4px;border-radius:2px;background:var(--linea);margin:0 auto 12px}
.skin-hoja h2{margin:0;font-size:20px}.skin-hoja>p{margin:4px 0 14px;color:var(--piz);font-size:14px}
.skin-ops{display:grid;gap:10px}
.skin-op{all:unset;box-sizing:border-box;cursor:pointer;display:flex;gap:14px;align-items:center;padding:12px;border-radius:14px;border:2px solid var(--linea);background:var(--sup)}
.skin-op.on{border-color:var(--pino);background:var(--pino-2)}.skin-op:focus-visible{outline:2px solid var(--cielo);outline-offset:2px}
.skin-mu{width:58px;height:58px;border-radius:12px;flex:none;border:1px solid var(--linea);position:relative;overflow:hidden}
.skin-mu i{position:absolute;left:8px;height:6px;border-radius:3px;width:34px;top:12px}.skin-mu i+i{top:24px;width:24px}
.skin-mu b{position:absolute;right:7px;bottom:7px;width:18px;height:18px;border-radius:50%}
.skin-tx{flex:1;min-width:0}.skin-tx b{display:block;font-size:16px}.skin-tx span{display:block;color:var(--piz);font-size:13.5px;line-height:1.35}
.skin-rd{width:20px;height:20px;border-radius:50%;border:2px solid var(--piz);flex:none;box-sizing:border-box}
.skin-op.on .skin-rd{border-color:var(--pino);background:var(--pino);box-shadow:inset 0 0 0 3px var(--sup)}
.skin-listo{all:unset;box-sizing:border-box;cursor:pointer;display:block;width:100%;text-align:center;margin-top:14px;padding:11px;border-radius:12px;background:var(--pino);color:var(--sobre-pino);font-weight:700}
@media (max-width:720px){.skin-velo{align-items:flex-end;padding:0}.skin-hoja{border-radius:20px 20px 0 0;padding-bottom:calc(16px + env(safe-area-inset-bottom))}.skin-asa{display:block}}`;
  (document.head || document.documentElement).appendChild(est);

  // ---------- Elegir la apariencia ----------
  function elegir() {
    document.getElementById("skinVelo")?.remove();
    const v = document.createElement("div");
    v.id = "skinVelo"; v.className = "skin-velo";
    v.innerHTML = `<div class="skin-hoja" role="dialog" aria-modal="true" aria-labelledby="skinTit">
      <div class="skin-asa" aria-hidden="true"></div>
      <h2 id="skinTit">Apariencia</h2>
      <p>Cambia solo cómo se ve la app en este dispositivo. Todo funciona igual.</p>
      <div class="skin-ops">${Object.entries(SKINS).map(([k, s]) => `<button type="button" class="skin-op ${k === actual ? "on" : ""}" data-skin="${k}" aria-pressed="${k === actual}">
        <span class="skin-mu" aria-hidden="true" style="background:${s.muestra[0]}"><i style="background:${s.muestra[1]}"></i><i style="background:${s.muestra[1]};opacity:.35"></i><b style="background:${s.muestra[2]}"></b></span>
        <span class="skin-tx"><b>${s.nombre}</b><span>${s.desc}</span></span><span class="skin-rd" aria-hidden="true"></span></button>`).join("")}</div>
      <button type="button" class="skin-listo">Listo</button></div>`;
    document.body.appendChild(v);
    const cerrar = () => v.remove();
    v.onclick = (e) => {
      if (e.target === v || e.target.closest(".skin-listo")) return cerrar();
      const b = e.target.closest("[data-skin]"); if (!b) return;
      try { localStorage.setItem(CLAVE, b.dataset.skin); } catch {}
      aplicar(b.dataset.skin);
      v.querySelectorAll("[data-skin]").forEach((x) => { const on = x === b; x.classList.toggle("on", on); x.setAttribute("aria-pressed", String(on)); });
    };
    v.onkeydown = (e) => { if (e.key === "Escape") cerrar(); };
    v.querySelector(".skin-op.on")?.focus();
  }
  function ponerBoton() {
    const pie = document.querySelector(".riel-pie");
    if (!pie || document.getElementById("skinBtn")) return;
    const b = document.createElement("button");
    b.type = "button"; b.id = "skinBtn"; b.className = "btn lin chico"; b.textContent = "Apariencia";
    b.onclick = () => { document.getElementById("riel")?.classList.remove("abierto"); elegir(); };
    const tema = document.getElementById("tema");
    tema ? tema.insertAdjacentElement("afterend", b) : pie.appendChild(b);
  }

  // ---------- Barra de abajo (solo en la apariencia WhatsApp, en el teléfono) ----------
  // Copia los botones del menú: tocar uno es tocar el del menú, así que la app hace exactamente lo mismo.
  const PRINCIPALES = [["mensajes"], ["preguntas", "bandeja"], ["despacho"], ["devoluciones"], ["chat"]];
  const ICONOS = {
    mensajes: '<path d="M6 7h12l-1 13H7z"/><path d="M9 7a3 3 0 0 1 6 0"/>',
    preguntas: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.7M12 17h.01"/>',
    despacho: '<path d="M3 7l9-4 9 4-9 4z"/><path d="M3 7v10l9 4 9-4V7M12 11v10"/>',
    devoluciones: '<path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/>',
    chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/>',
    mas: '<circle cx="5" cy="12" r="1.4" fill="currentColor"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/><circle cx="19" cy="12" r="1.4" fill="currentColor"/>',
  };
  const svg = (k) => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONOS[k]}</svg>`;
  let firma = "";
  function barra() {
    let el = document.getElementById("skinBarra");
    const nav = document.getElementById("nav");
    if (actual !== "wa" || !nav || !nav.children.length) { if (el) el.remove(); firma = ""; return; }
    const bts = [...nav.querySelectorAll("button[data-t]")].filter((b) => !b.classList.contains("off"));
    const usados = new Set(), items = [];
    for (const alt of PRINCIPALES) {
      const b = bts.find((x) => alt.includes(x.dataset.t));
      if (b && items.length < 4) { items.push({ b, ic: alt[0] }); usados.add(b); }
    }
    items.sort((a, b) => bts.indexOf(a.b) - bts.indexOf(b.b));
    const resto = bts.filter((b) => !usados.has(b));
    const n = (b) => Number(b.querySelector(".cuenta-n")?.textContent) || 0;
    const nuevas = (b) => b.querySelector(".cuenta-nueva") ? 1 : 0;
    const nombre = (b) => [...b.childNodes].filter((x) => x.nodeType === 3).map((x) => x.textContent).join("").trim();
    const restoN = resto.reduce((x, b) => x + n(b), 0);
    const masOn = resto.some((b) => b.classList.contains("on"));
    const html = items.map(({ b, ic }) => `<button type="button" data-bt="${b.dataset.t}" class="${b.classList.contains("on") ? "on" : ""}"><span class="sb-ic">${svg(ic)}${n(b) ? `<i class="sb-n">${n(b) > 99 ? "99+" : n(b)}</i>` : nuevas(b) ? `<i class="sb-p"></i>` : ""}</span><span class="sb-t">${nombre(b)}</span></button>`).join("")
      + `<button type="button" data-bt="__mas" class="${masOn ? "on" : ""}"><span class="sb-ic">${svg("mas")}${restoN ? `<i class="sb-n">${restoN > 99 ? "99+" : restoN}</i>` : ""}</span><span class="sb-t">Más</span></button>`;
    if (html === firma && el) return;
    firma = html;
    if (!el) {
      el = document.createElement("nav"); el.id = "skinBarra"; el.className = "skin-barra"; el.setAttribute("aria-label", "Secciones");
      el.onclick = (e) => {
        const x = e.target.closest("[data-bt]"); if (!x) return;
        if (x.dataset.bt === "__mas") { document.getElementById("abrirRiel")?.click(); return; }
        document.querySelector(`#nav button[data-t="${x.dataset.bt}"]`)?.click();
        try { scrollTo(0, 0); } catch {}
      };
      document.getElementById("app")?.appendChild(el);
    }
    el.innerHTML = html;
  }
  function vigilar() {
    const nav = document.getElementById("nav");
    if (!nav) return;
    new MutationObserver(() => barra()).observe(nav, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"], characterData: true });
    barra();
  }
  const listo = () => { ponerBoton(); vigilar(); aplicar(actual); };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", listo); else listo();
  window.MOSTRADOR_SKINS = { elegir, aplicar, actual: () => actual };
})();
