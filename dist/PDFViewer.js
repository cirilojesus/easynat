"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.openPDFViewer = exports.PDFViewer = exports.registerPdfJs = exports.PDFJS_VERSION = void 0;
// PDFViewer: visor de PDF sobre react-native-webview (opcional) con pdf.js. Páginas en scroll vertical (solo se
// dibujan las cercanas a la vista), zoom con dos dedos y doble toque, enlaces (internos y externos), buscar texto,
// seleccionar y copiar texto, contraseña e indicador de página. pdf.js se carga del CDN; para usarlo sin internet: import 'easynat/dist/utils/pdfjs'
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const react_native_safe_area_context_1 = require("react-native-safe-area-context");
const Box_1 = require("./Box");
const Icon_1 = require("./Icon");
const Modal_1 = require("./Modal");
const Spinner_1 = require("./Spinner");
const Text_1 = require("./Text");
const translate_1 = require("./utils/translate");
const useThemeProps_1 = require("./utils/useThemeProps");
const webview_1 = require("./utils/webview");
/* ---------------- pdf.js ---------------- */
/** Versión de pdf.js del CDN (la última que se carga como script normal: funciona en WebViews antiguos) */
exports.PDFJS_VERSION = '3.11.174';
let bundled = null;
/** Registra pdf.js dentro de la app (lo hace `import 'easynat/dist/utils/pdfjs'`): así no hace falta internet */
const registerPdfJs = (lib) => { bundled = lib; };
exports.registerPdfJs = registerPdfJs;
const cdnBase = (version) => `https://cdn.jsdelivr.net/npm/pdfjs-dist@${version}`;
const viewerDocument = (cfg, lib) => `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<style>
html,body{margin:0;height:100%;background:${cfg.bg};overflow:hidden;-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none}
#scroll{position:absolute;left:0;top:0;right:0;bottom:0;overflow:auto;-webkit-overflow-scrolling:touch;touch-action:pan-x pan-y}
#pages{position:relative;transform-origin:0 0}
.page{position:relative;margin:0 auto;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.35)}
.page canvas{position:absolute;left:0;top:0;width:100%;height:100%}
.link{position:absolute;display:block;z-index:3}
.hl{position:absolute;background:rgba(255,213,0,.45);mix-blend-mode:multiply;border-radius:2px;pointer-events:none;z-index:1}
.textLayer{position:absolute;left:0;top:0;right:0;bottom:0;overflow:hidden;opacity:.25;line-height:1;-webkit-text-size-adjust:none;text-size-adjust:none;transform-origin:0 0;z-index:2;-webkit-user-select:text;user-select:text}
.textLayer span,.textLayer br{color:transparent;position:absolute;white-space:pre;cursor:text;transform-origin:0 0}
.textLayer span.markedContent{top:0;height:0}
.textLayer ::selection{background:#0050ff}
.textLayer br::selection{background:transparent}
.textLayer .endOfContent{display:block;position:absolute;left:0;right:0;top:100%;bottom:0;z-index:-1;-webkit-user-select:none;user-select:none}
.textLayer .endOfContent.active{top:0}
.hl.cur{background:rgba(255,120,0,.6)}
</style></head>
<body><div id="scroll"><div id="pages"></div></div>
<script>window.__CFG=${(0, webview_1.jsValue)(cfg)};${lib ? `window.__PDFJS_MAIN=${(0, webview_1.jsValue)(lib.main)};window.__PDFJS_WORKER=${(0, webview_1.jsValue)(lib.worker)};` : ''}</script>
<script>${VIEWER_SCRIPT}</script></body></html>`;
// Nuestro código va en ES5; pdf.js (build legacy) trae lo suyo
const VIEWER_SCRIPT = String.raw `(function () {
  var cfg = window.__CFG, RN = window.ReactNativeWebView;
  function post(o) { if (RN) RN.postMessage(JSON.stringify(o)); }
  var scroller = document.getElementById('scroll'), pagesEl = document.getElementById('pages');
  var dpr = window.devicePixelRatio || 1, lib = null, doc = null, pages = [], zoom = 1, baseScale = 1, chunks = [], current = 0;
  var pendingPassword = null, frame = false, gen = 0, MAX_PX = 16e6;

  /* ----- Cargar pdf.js (de dentro de la app o del CDN) y su worker (desde un blob: así funciona sin servidor) ----- */
  function fail(code, e) { post({ type: 'error', code: code, message: String(e && e.message || e || code) }); }
  function blobUrl(code) { return URL.createObjectURL(new Blob([code], { type: 'text/javascript' })); }
  function loadLib() {
    var s = document.createElement('script');
    s.src = cfg.inline ? blobUrl(window.__PDFJS_MAIN) : cfg.lib + 'pdf.min.js';
    s.onload = function () {
      lib = window.pdfjsLib;
      if (!lib) return fail('lib', 'pdf.js no se pudo cargar');
      if (cfg.inline) { lib.GlobalWorkerOptions.workerSrc = blobUrl(window.__PDFJS_WORKER); window.__PDFJS_MAIN = window.__PDFJS_WORKER = null; post({ type: 'ready' }); return; }
      fetch(cfg.lib + 'pdf.worker.min.js').then(function (r) { return r.text(); })
        .then(function (code) { lib.GlobalWorkerOptions.workerSrc = blobUrl(code); post({ type: 'ready' }); })
        .catch(function (e) { fail('lib', e); });
    };
    s.onerror = function () { fail('lib', 'No se pudo descargar pdf.js (sin internet). Para usarlo sin conexión: import "easynat/dist/utils/pdfjs"'); };
    document.head.appendChild(s);
  }

  /* ----- Abrir ----- */
  function b64ToBytes(b) { var bin = atob(b), n = bin.length, u = new Uint8Array(n); for (var i = 0; i < n; i++) u[i] = bin.charCodeAt(i); return u; }
  function closeDoc() {
    gen++; pages.forEach(function (p) { if (p.task) p.task.cancel(); release(p); });
    pages = []; pagesEl.innerHTML = ''; textCache = {}; matches = []; cur = -1;
    if (doc) { doc.destroy(); doc = null; }
  }
  window.__chunk = function (s) { chunks.push(s); };
  window.__open = function (o) {
    var data = b64ToBytes(chunks.join('')); chunks = [];
    closeDoc();
    var my = gen, task = lib.getDocument({ data: data, password: o && o.password || undefined, isEvalSupported: false, enableXfa: false,
      cMapUrl: cfg.cmaps, cMapPacked: true, standardFontDataUrl: cfg.fonts });
    task.onPassword = function (update, reason) { pendingPassword = update; post({ type: 'password', incorrect: reason === 2 }); };
    task.onProgress = function (p) { if (p.total) post({ type: 'progress', value: p.loaded / p.total }); };
    task.promise.then(function (d) {
      if (my !== gen) return d.destroy();
      doc = d;
      // Los tamaños de todas las páginas (para saber cuánto ocupa cada una antes de dibujarla)
      var all = []; for (var i = 1; i <= d.numPages; i++) all.push(d.getPage(i));
      return Promise.all(all).then(function (list) {
        if (my !== gen) return;
        pages = list.map(function (pg, i) {
          var vp = pg.getViewport({ scale: 1 }), el = document.createElement('div');
          el.className = 'page'; pagesEl.appendChild(el);
          return { num: i + 1, page: pg, w: vp.width, h: vp.height, el: el, canvas: null, scale: 0, task: null, links: false };
        });
        layout();
        goTo(cfg.initialPage || 1);
        update();
        d.getMetadata().then(function (m) { post({ type: 'loaded', numPages: d.numPages, title: m && m.info && m.info.Title || undefined }); })
          .catch(function () { post({ type: 'loaded', numPages: d.numPages }); });
      });
    }).catch(function (e) {
      if (my !== gen) return;
      var n = e && e.name;
      fail(n === 'PasswordException' ? 'password' : n === 'InvalidPDFException' || n === 'MissingPDFException' ? 'invalid' : 'unknown', e);
    });
  };
  window.__password = function (p) { var u = pendingPassword; pendingPassword = null; if (u) u(p); };

  /* ----- Tamaños y dibujo (solo las páginas cerca de la vista; las lejanas se sueltan para no gastar memoria) ----- */
  function layout() {
    if (!pages.length) return;
    var cw = scroller.clientWidth, ch = scroller.clientHeight, sp = cfg.spacing, maxW = 0;
    pages.forEach(function (p) { maxW = Math.max(maxW, p.w); });
    baseScale = cfg.fit === 'page' ? Math.min((cw - sp * 2) / maxW, (ch - sp * 2) / pages[0].h) : (cw - sp * 2) / maxW;
    var s = baseScale * zoom;
    pagesEl.style.padding = sp + 'px 0';
    pagesEl.style.width = Math.max(cw, maxW * s + sp * 2) + 'px';
    pages.forEach(function (p, i) {
      p.el.style.width = Math.floor(p.w * s) + 'px'; p.el.style.height = Math.floor(p.h * s) + 'px';
      p.el.style.marginBottom = i < pages.length - 1 ? sp + 'px' : '0';
    });
  }
  function release(p) {
    if (p.canvas) { p.canvas.width = 0; p.canvas.height = 0; if (p.canvas.parentNode) p.canvas.parentNode.removeChild(p.canvas); p.canvas = null; }
    p.scale = 0; dropText(p);
  }
  /* ----- Capa de texto: el texto de la página, invisible y encima del dibujo, para seleccionarlo y copiarlo ----- */
  function dropText(p) {
    if (p.textTask) { try { p.textTask.cancel(); } catch (e) { } p.textTask = null; }
    if (p.textLayer && p.textLayer.parentNode) p.textLayer.parentNode.removeChild(p.textLayer);
    p.textLayer = null; p.textScale = 0;
  }
  function addText(p) {
    var s = baseScale * zoom;
    if (!cfg.text || !lib.renderTextLayer || (p.textLayer && Math.abs(p.textScale - s) / s < 0.01)) return;
    dropText(p);
    var layer = document.createElement('div'), my = p.textScale = s;
    layer.className = 'textLayer';
    // pdf.js pone las letras con --scale-factor (el mismo que la escala de la página en pantalla)
    layer.style.setProperty('--scale-factor', String(s));
    p.textLayer = layer; p.el.appendChild(layer);
    pageText(p).then(function (t) {
      if (p.textLayer !== layer || p.textScale !== my) return;
      p.textTask = lib.renderTextLayer({ textContentSource: t.tc, container: layer, viewport: p.page.getViewport({ scale: s }), textDivs: [], isOffscreenCanvasSupported: false });
      return p.textTask.promise.then(function () {
        // Lo que va al final de la capa: al arrastrar la selección más allá del texto no se salta a otra página
        var end = document.createElement('div'); end.className = 'endOfContent'; layer.appendChild(end);
      });
    }).catch(function () { });
  }
  function renderPage(p) {
    // A la resolución de la pantalla (con zoom), con un tope de píxeles: más allá se estira (si no, iOS se queda sin memoria)
    var s = Math.min(baseScale * zoom * dpr, Math.sqrt(MAX_PX / (p.w * p.h)));
    if (p.scale && Math.abs(p.scale - s) / s < 0.05) return addText(p);
    if (p.task) { if (Math.abs(p.taskScale - s) / s < 0.05) return; p.task.cancel(); }
    var vp = p.page.getViewport({ scale: s }), c = document.createElement('canvas');
    c.width = Math.floor(vp.width); c.height = Math.floor(vp.height);
    var task = p.page.render({ canvasContext: c.getContext('2d'), viewport: vp });
    p.task = task; p.taskScale = s;
    task.promise.then(function () {
      p.task = null;
      // Se cambia cuando la nueva ya está (sin parpadeo en blanco al hacer zoom)
      if (p.canvas && p.canvas.parentNode) { p.canvas.width = 0; p.canvas.parentNode.removeChild(p.canvas); }
      p.el.insertBefore(c, p.el.firstChild); p.canvas = c; p.scale = s;
    }).catch(function () { if (p.task === task) p.task = null; });
    if (!p.links) addLinks(p);
    addText(p);
  }
  function update() {
    frame = false;
    if (!pages.length) return;
    var top = scroller.scrollTop, h = scroller.clientHeight, mid = top + h / 2, best = 0, bestD = Infinity;
    pages.forEach(function (p, i) {
      var y = p.el.offsetTop, ph = p.el.offsetHeight;
      if (y + ph >= top - h && y <= top + h * 2) renderPage(p);
      else if (y + ph < top - h * 3 || y > top + h * 4) { if (p.task) { p.task.cancel(); p.task = null; } release(p); }
      var d = mid < y ? y - mid : mid > y + ph ? mid - y - ph : 0;
      if (d < bestD) { bestD = d; best = i; }
    });
    if (best + 1 !== current) { current = best + 1; post({ type: 'page', page: current, numPages: pages.length }); }
  }
  function schedule() { if (!frame) { frame = true; requestAnimationFrame(update); } }
  scroller.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', function () { var p = current; layout(); goTo(p || 1); schedule(); });
  function goTo(n, y) {
    var p = pages[Math.max(0, Math.min(pages.length - 1, n - 1))];
    if (!p) return;
    scroller.scrollTop = p.el.offsetTop - cfg.spacing / 2 + (y || 0) * p.el.offsetHeight;
    schedule();
  }
  window.__goTo = function (n) { goTo(n); };

  /* ----- Enlaces: los de la web se mandan a la app; los internos van a su página ----- */
  function pct(p, r) {
    var vp = p.page.getViewport({ scale: 1 }), q = vp.convertToViewportRectangle(r), x = Math.min(q[0], q[2]), y = Math.min(q[1], q[3]);
    return { l: x / vp.width * 100, t: y / vp.height * 100, w: Math.abs(q[2] - q[0]) / vp.width * 100, h: Math.abs(q[3] - q[1]) / vp.height * 100 };
  }
  function place(el, r) { el.style.left = r.l + '%'; el.style.top = r.t + '%'; el.style.width = r.w + '%'; el.style.height = r.h + '%'; }
  function goDest(dest) {
    (typeof dest === 'string' ? doc.getDestination(dest) : Promise.resolve(dest)).then(function (exp) {
      if (!exp || !exp.length) return;
      var ref = exp[0];
      return (typeof ref === 'object' ? doc.getPageIndex(ref) : Promise.resolve(ref)).then(function (i) {
        var p = pages[i], y = 0;
        // /XYZ izquierda arriba zoom: ir a esa altura de la página
        if (p && exp[1] && exp[1].name === 'XYZ' && exp[3] != null) y = Math.max(0, Math.min(1, 1 - exp[3] / p.h));
        goTo(i + 1, y);
      });
    }).catch(function () { });
  }
  function addLinks(p) {
    p.links = true;
    p.page.getAnnotations({ intent: 'display' }).then(function (list) {
      list.forEach(function (a) {
        if (a.subtype !== 'Link' || !(a.url || a.unsafeUrl || a.dest)) return;
        var el = document.createElement('a'); el.className = 'link'; place(el, pct(p, a.rect));
        el.addEventListener('click', function (e) {
          e.preventDefault();
          if (a.url || a.unsafeUrl) post({ type: 'link', url: a.url || a.unsafeUrl }); else goDest(a.dest);
        });
        p.el.appendChild(el);
      });
    }).catch(function () { });
  }

  /* ----- Zoom: dos dedos (se estira con CSS mientras se pellizca y se vuelve a dibujar al soltar) y doble toque ----- */
  function setZoom(z, fx, fy, sx, sy) {
    z = Math.max(1, Math.min(cfg.maxZoom, z));
    if (fx == null) { sx = scroller.clientWidth / 2; sy = scroller.clientHeight / 2; fx = scroller.scrollLeft + sx; fy = scroller.scrollTop + sy; }
    var k = z / zoom; zoom = z; layout();
    // El punto que había bajo los dedos se queda bajo los dedos
    scroller.scrollLeft = fx * k - sx; scroller.scrollTop = fy * k - sy;
    schedule(); post({ type: 'zoom', zoom: zoom });
  }
  window.__setZoom = function (z) { setZoom(z); };
  var pinch = null, tap = null, lastTap = null;
  function dist(a, b) { return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); }
  scroller.addEventListener('touchstart', function (e) {
    if (e.touches.length === 2) {
      var a = e.touches[0], b = e.touches[1], sx = (a.clientX + b.clientX) / 2, sy = (a.clientY + b.clientY) / 2;
      pinch = { d0: dist(a, b), z0: zoom, s: 1, sx: sx, sy: sy, fx: scroller.scrollLeft + sx, fy: scroller.scrollTop + sy };
      pagesEl.style.transformOrigin = pinch.fx + 'px ' + pinch.fy + 'px';
      tap = null; e.preventDefault();
    } else if (e.touches.length === 1) tap = { x: e.touches[0].clientX, y: e.touches[0].clientY, t: Date.now() };
  }, { passive: false });
  scroller.addEventListener('touchmove', function (e) {
    if (pinch && e.touches.length === 2) {
      e.preventDefault();
      pinch.s = Math.max(1 / pinch.z0, Math.min(cfg.maxZoom / pinch.z0, dist(e.touches[0], e.touches[1]) / pinch.d0));
      pagesEl.style.transform = 'scale(' + pinch.s + ')';
    } else if (tap && Math.abs(e.touches[0].clientX - tap.x) + Math.abs(e.touches[0].clientY - tap.y) > 12) tap = null;
  }, { passive: false });
  function endPinch() {
    var p = pinch; pinch = null; pagesEl.style.transform = '';
    if (p && Math.abs(p.s - 1) > 0.01) setZoom(p.z0 * p.s, p.fx, p.fy, p.sx, p.sy);
  }
  scroller.addEventListener('touchend', function (e) {
    if (pinch) { if (e.touches.length < 2) endPinch(); return; }
    if (!tap || e.touches.length) return;
    var t = tap; tap = null;
    if (Date.now() - t.t > 300) return;
    if (lastTap && Date.now() - lastTap.t < 320 && Math.abs(lastTap.x - t.x) + Math.abs(lastTap.y - t.y) < 30) {
      // Doble toque: acercar ahí, o volver a ajustado
      lastTap = null;
      setZoom(zoom > 1.01 ? 1 : cfg.doubleTap, scroller.scrollLeft + t.x, scroller.scrollTop + t.y, t.x, t.y);
    } else lastTap = t;
  });
  scroller.addEventListener('touchcancel', function () { if (pinch) endPinch(); tap = null; });

  /* ----- Buscar (sin distinguir mayúsculas ni acentos) ----- */
  var textCache = {}, matches = [], cur = -1;
  // Una letra sin acento y en minúscula (mismo largo que el original: las posiciones siguen valiendo)
  function fold(s) { var o = ''; for (var i = 0; i < s.length; i++) { var c = s.charAt(i); o += (c.normalize ? c.normalize('NFD').charAt(0) : c).toLowerCase(); } return o; }
  function pageText(p) {
    if (textCache[p.num]) return Promise.resolve(textCache[p.num]);
    return p.page.getTextContent().then(function (tc) {
      var items = [], str = '';
      tc.items.forEach(function (it) {
        if (it.str == null) return;
        items.push({ start: str.length, it: it });
        str += it.str + (it.hasEOL ? ' ' : '');
      });
      return (textCache[p.num] = { str: fold(str), items: items, styles: tc.styles, tc: tc });
    });
  }
  // Rectángulos (en % de la página) de un trozo del texto. Dentro de un trozo de línea, cada parte ocupa lo que
  // mediría en una fuente parecida (serif o no) en proporción al ancho real del trozo
  var ruler = document.createElement('canvas').getContext('2d');
  function measure(s, serif) { if (!ruler) return s.length; ruler.font = '100px ' + (serif ? 'serif' : 'sans-serif'); return ruler.measureText(s).width; }
  function rectsOf(p, t, start, end) {
    var vp = p.page.getViewport({ scale: 1 }), out = [], styles = t.styles || {};
    t.items.forEach(function (x) {
      var it = x.it, len = it.str.length, a = Math.max(start, x.start), b = Math.min(end, x.start + len);
      if (b <= a || !len) return;
      var m = lib.Util.transform(vp.transform, it.transform), fh = Math.hypot(m[2], m[3]), W = it.width * vp.scale;
      var st = styles[it.fontName], serif = st && /serif/i.test(st.fontFamily) && !/sans/i.test(st.fontFamily), full = measure(it.str, serif) || 1;
      var x0 = measure(it.str.slice(0, a - x.start), serif) / full * W, x1 = measure(it.str.slice(0, b - x.start), serif) / full * W;
      out.push({ l: (m[4] + x0) / vp.width * 100, t: (m[5] - fh) / vp.height * 100, w: (x1 - x0) / vp.width * 100, h: fh * 1.2 / vp.height * 100 });
    });
    return out;
  }
  function clearHighlights() { var hs = pagesEl.querySelectorAll('.hl'); for (var i = 0; i < hs.length; i++) hs[i].parentNode.removeChild(hs[i]); }
  function showMatch() {
    var old = pagesEl.querySelectorAll('.hl.cur'); for (var i = 0; i < old.length; i++) old[i].className = 'hl';
    var m = matches[cur];
    if (!m) return;
    m.els.forEach(function (el) { el.className = 'hl cur'; });
    var p = pages[m.page - 1], r = m.rects[0];
    scroller.scrollTop = p.el.offsetTop + r.t / 100 * p.el.offsetHeight - scroller.clientHeight / 3;
    scroller.scrollLeft = Math.max(0, p.el.offsetLeft + r.l / 100 * p.el.offsetWidth - scroller.clientWidth / 3);
    post({ type: 'search', count: matches.length, index: cur });
  }
  window.__search = function (q, id) {
    clearHighlights(); matches = []; cur = -1;
    var needle = fold(String(q || '').trim()), my = gen;
    if (!needle || !doc) return post({ type: 'search', id: id, count: 0, index: -1 });
    var chain = Promise.resolve();
    pages.forEach(function (p) {
      chain = chain.then(function () {
        return pageText(p).then(function (t) {
          for (var at = t.str.indexOf(needle); at >= 0; at = t.str.indexOf(needle, at + needle.length)) {
            var rects = rectsOf(p, t, at, at + needle.length);
            if (!rects.length) continue;
            var els = rects.map(function (r) { var el = document.createElement('div'); el.className = 'hl'; place(el, r); p.el.appendChild(el); return el; });
            matches.push({ page: p.num, rects: rects, els: els });
          }
        });
      });
    });
    chain.then(function () {
      if (my !== gen) return;
      cur = matches.length ? 0 : -1;
      if (cur >= 0) showMatch();
      post({ type: 'search', id: id, count: matches.length, index: cur });
    });
  };
  window.__searchStep = function (d) { if (!matches.length) return; cur = (cur + d + matches.length) % matches.length; showMatch(); };
  window.__clearSearch = function () { clearHighlights(); matches = []; cur = -1; };
  // Lo seleccionado (para onTextSelect); copiar lo hace el menú del sistema
  var selTimer = null, lastSel = '';
  document.addEventListener('selectionchange', function () {
    clearTimeout(selTimer);
    selTimer = setTimeout(function () {
      var t = String(window.getSelection ? window.getSelection() : '');
      if (t !== lastSel) { lastSel = t; post({ type: 'selection', text: t }); }
    }, 250);
  });
  window.__clearSelection = function () { if (window.getSelection) window.getSelection().removeAllRanges(); };
  // Para depurar y para las pruebas
  window.__pure = { fold: fold };
  window.__state = function () { return { zoom: zoom, page: current, numPages: pages.length, rendered: pages.filter(function (p) { return p.canvas; }).map(function (p) { return p.num; }), text: pages.filter(function (p) { return p.textLayer; }).map(function (p) { return p.num; }), matches: matches.length, cur: cur }; };

  loadLib();
})();`;
/* ---------------- Componente ---------------- */
const CHUNK = 512 * 1024;
const RoundButton = ({ icon, onPress, label, active }) => (<react_native_1.Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} hitSlop={8} style={({ pressed }) => ({ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: active ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.55)', opacity: pressed ? 0.6 : 1 })}>
        <Icon_1.Icon as="MaterialCommunityIcons" name={icon} size={22} color={'white'}/>
    </react_native_1.Pressable>);
const sourceKey = (s) => { var _a; return (typeof s === 'string' ? s : 'uri' in s ? `${s.uri}|${JSON.stringify((_a = s.headers) !== null && _a !== void 0 ? _a : {})}` : `b64:${s.base64.length}:${s.base64.slice(0, 64)}`); };
/** El PDF en base64 (las uri se leen desde React Native: sin CORS, con cabeceras, y file:// / content:// también) */
const readSource = async (s) => {
    if (typeof s === 'object' && 'base64' in s)
        return s.base64.replace(/^data:[^,]*,/, '');
    const uri = typeof s === 'string' ? s : s.uri, data = await (0, webview_1.toDataUri)(uri, typeof s === 'string' ? undefined : s.headers);
    return data.slice(data.indexOf(',') + 1);
};
/**
 * Visor de PDF. Necesita react-native-webview (dependencia opcional). pdf.js sale del CDN; para usarlo sin
 * internet, importa una vez 'easynat/dist/utils/pdfjs'
 * @example <PDFViewer source={{ uri: 'https://…/factura.pdf' }} onPageChange={p => …} />
 * @example openPDFViewer(archivo.uri, { initialPage: 3 })
 */
exports.PDFViewer = (0, react_1.forwardRef)((rawProps, ref) => {
    // Defaults → theme.components.PDFViewer → variante → props → plataforma
    const [p] = (0, useThemeProps_1.useThemeProps)('PDFViewer', rawProps);
    const { source, password, initialPage = 1, fit = 'width', spacing = 8, maxZoom = 5, doubleTapZoom = 2.5, showPageIndicator = true, showSearch = true, backgroundColor = '#525659', pdfjsUrl, textSelection = true, onTextSelect, onLoad, onPageChange, onError, onLinkPress, onClose, variant: _v } = p, boxProps = __rest(p, ["source", "password", "initialPage", "fit", "spacing", "maxZoom", "doubleTapZoom", "showPageIndicator", "showSearch", "backgroundColor", "pdfjsUrl", "textSelection", "onTextSelect", "onLoad", "onPageChange", "onError", "onLinkPress", "onClose", "variant"]);
    const WebView = (0, webview_1.loadWebView)();
    const insets = (0, react_native_safe_area_context_1.useSafeAreaInsets)();
    const web = (0, react_1.useRef)(null);
    const ready = (0, react_1.useRef)(false);
    const queue = (0, react_1.useRef)([]);
    const run = (js) => { var _a; const code = `${js};true;`; if (ready.current)
        (_a = web.current) === null || _a === void 0 ? void 0 : _a.injectJavaScript(code);
    else
        queue.current.push(code); };
    const [status, setStatus] = (0, react_1.useState)('loading');
    const [error, setError] = (0, react_1.useState)(null);
    const [progress, setProgress] = (0, react_1.useState)(0);
    const [page, setPage] = (0, react_1.useState)({ page: 0, numPages: 0 });
    const [wrongPassword, setWrongPassword] = (0, react_1.useState)(false);
    const [typedPassword, setTypedPassword] = (0, react_1.useState)('');
    const passwordInput = (0, react_1.useRef)(null);
    const [searchOpen, setSearchOpen] = (0, react_1.useState)(false);
    const [query, setQuery] = (0, react_1.useState)('');
    const [found, setFound] = (0, react_1.useState)(null);
    const searches = (0, react_1.useRef)(new Map());
    const searchId = (0, react_1.useRef)(0);
    const [attempt, setAttempt] = (0, react_1.useState)(0);
    const latest = (0, react_1.useRef)({ onLoad, onPageChange, onError, onLinkPress, onTextSelect });
    latest.current = { onLoad, onPageChange, onError, onLinkPress, onTextSelect };
    const html = (0, react_1.useMemo)(() => {
        var _a, _b;
        const lib = bundled, base = (_a = pdfjsUrl === null || pdfjsUrl === void 0 ? void 0 : pdfjsUrl.replace(/\/$/, '')) !== null && _a !== void 0 ? _a : cdnBase((_b = lib === null || lib === void 0 ? void 0 : lib.version) !== null && _b !== void 0 ? _b : exports.PDFJS_VERSION);
        return { html: viewerDocument({ inline: !!lib, lib: `${base}/legacy/build/`, cmaps: `${base}/cmaps/`, fonts: `${base}/standard_fonts/`, spacing, fit, maxZoom, doubleTap: doubleTapZoom, bg: backgroundColor, initialPage, text: textSelection }, lib) };
    }, []);
    const fail = (e) => { var _a, _b; setError(e); setStatus('error'); (_b = (_a = latest.current).onError) === null || _b === void 0 ? void 0 : _b.call(_a, e); };
    // El PDF se lee en React Native y se manda al WebView en trozos (un solo mensaje enorme va lento)
    (0, react_1.useEffect)(() => {
        let alive = true;
        setStatus('loading');
        setError(null);
        setProgress(0);
        setFound(null);
        setWrongPassword(false);
        readSource(source).then(b64 => {
            if (!alive)
                return;
            for (let i = 0; i < b64.length; i += CHUNK)
                run(`window.__chunk(${(0, webview_1.jsValue)(b64.slice(i, i + CHUNK))})`);
            run(`window.__open(${(0, webview_1.jsValue)({ password })})`);
        }).catch(e => { var _a; if (alive)
            fail({ code: 'network', message: String((_a = e === null || e === void 0 ? void 0 : e.message) !== null && _a !== void 0 ? _a : e) }); });
        return () => { alive = false; };
    }, [sourceKey(source), attempt]);
    const search = (q) => new Promise(resolve => {
        const id = ++searchId.current;
        searches.current.set(id, resolve);
        run(`window.__search(${(0, webview_1.jsValue)(q)},${id})`);
    });
    (0, react_1.useImperativeHandle)(ref, () => ({
        goToPage: n => run(`window.__goTo(${Number(n) || 1})`),
        search,
        searchNext: () => run('window.__searchStep(1)'),
        searchPrev: () => run('window.__searchStep(-1)'),
        clearSearch: () => { run('window.__clearSearch()'); setFound(null); },
        setZoom: z => run(`window.__setZoom(${Number(z) || 1})`),
        clearSelection: () => run('window.__clearSelection()'),
    }));
    const onMessage = (e) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        let msg;
        try {
            msg = JSON.parse(e.nativeEvent.data);
        }
        catch (_l) {
            return;
        }
        switch (msg.type) {
            case 'ready':
                ready.current = true;
                queue.current.splice(0).forEach(code => { var _a; return (_a = web.current) === null || _a === void 0 ? void 0 : _a.injectJavaScript(code); });
                break;
            case 'progress':
                setProgress(msg.value);
                break;
            case 'password':
                // Incorrecta: se vacía el campo y vuelve el foco (autoFocus no siempre funciona al volver a montarse)
                setStatus('password');
                setWrongPassword(!!msg.incorrect);
                setTypedPassword('');
                setTimeout(() => { var _a; return (_a = passwordInput.current) === null || _a === void 0 ? void 0 : _a.focus(); }, 150);
                break;
            case 'loaded':
                setStatus('ready');
                setPage(prev => ({ page: prev.page || initialPage, numPages: msg.numPages }));
                (_b = (_a = latest.current).onLoad) === null || _b === void 0 ? void 0 : _b.call(_a, { numPages: msg.numPages, title: msg.title });
                break;
            case 'page':
                setPage({ page: msg.page, numPages: msg.numPages });
                (_d = (_c = latest.current).onPageChange) === null || _d === void 0 ? void 0 : _d.call(_c, msg.page, msg.numPages);
                break;
            case 'link':
                if (((_f = (_e = latest.current).onLinkPress) === null || _f === void 0 ? void 0 : _f.call(_e, msg.url)) !== false && /^(https?:|mailto:|tel:)/i.test(msg.url))
                    react_native_1.Linking.openURL(msg.url).catch(() => { });
                break;
            case 'search':
                setFound({ count: msg.count, index: msg.index });
                if (msg.id) {
                    (_g = searches.current.get(msg.id)) === null || _g === void 0 ? void 0 : _g(msg.count);
                    searches.current.delete(msg.id);
                }
                break;
            case 'selection':
                (_j = (_h = latest.current).onTextSelect) === null || _j === void 0 ? void 0 : _j.call(_h, (_k = msg.text) !== null && _k !== void 0 ? _k : '');
                break;
            case 'error':
                fail({ code: msg.code, message: msg.message });
                break;
        }
    };
    if (!WebView)
        return <webview_1.MissingWebView name="PDFViewer" {...boxProps}/>;
    // A pantalla completa (con botón de cerrar) el PDF empieza debajo de la barra de estado
    const top = onClose ? insets.top : 0;
    const submitPassword = () => { setStatus('loading'); run(`window.__password(${(0, webview_1.jsValue)(typedPassword)})`); };
    return (<Box_1.Box flex={1} style={{ backgroundColor, paddingTop: top }} overflow="hidden" {...boxProps}>
            <WebView ref={web} originWhitelist={['*']} source={html} onMessage={onMessage} style={{ flex: 1, backgroundColor }} containerStyle={{ backgroundColor }} bounces={false} overScrollMode="never" 
    // Dentro de un ScrollView (Android): el scroll del PDF no se lo queda la página
    nestedScrollEnabled setSupportMultipleWindows={false} javaScriptEnabled/>
            {status === 'loading' && (<react_native_1.View pointerEvents="none" style={[react_native_1.StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center', gap: 8 }]}>
                    <Spinner_1.Spinner color={'white'}/>
                    {progress > 0 && progress < 1 && <Text_1.Text color="white" fontSize={13}>{`${Math.round(progress * 100)} %`}</Text_1.Text>}
                </react_native_1.View>)}
            {status === 'error' && (<react_native_1.View style={[react_native_1.StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center', gap: 10, padding: 24 }]}>
                    <Icon_1.Icon as="MaterialCommunityIcons" name={'file-alert-outline'} size={42} color={'white'}/>
                    <Text_1.Text color="white" textAlign="center">{(0, translate_1.libT)('pdfError')}</Text_1.Text>
                    {!!(error === null || error === void 0 ? void 0 : error.message) && <Text_1.Text fontSize={12} textAlign="center" style={{ color: '#ddd' }} numberOfLines={3}>{error.message}</Text_1.Text>}
                    {(error === null || error === void 0 ? void 0 : error.code) !== 'invalid' && (<react_native_1.Pressable onPress={() => setAttempt(a => a + 1)} accessibilityRole="button" accessibilityLabel="retry" style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.18)' }}>
                            <Text_1.Text color="white">{(0, translate_1.libT)('retry')}</Text_1.Text>
                        </react_native_1.Pressable>)}
                </react_native_1.View>)}
            {status === 'password' && (
        // Contraseña: si no vino en las props, se pregunta
        <react_native_1.View style={[react_native_1.StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: 'rgba(0,0,0,0.35)' }]}>
                    <react_native_1.View style={{ width: '100%', maxWidth: 340, backgroundColor: '#fff', borderRadius: 14, padding: 18, gap: 12 }}>
                        <Text_1.Text fontWeight="600">{(0, translate_1.libT)('pdfPassword')}</Text_1.Text>
                        <react_native_1.TextInput ref={passwordInput} value={typedPassword} onChangeText={setTypedPassword} secureTextEntry autoFocus placeholder={(0, translate_1.libT)('password')} accessibilityLabel="password" onSubmitEditing={submitPassword} style={{ borderWidth: 1, borderColor: wrongPassword ? '#ef4444' : '#d1d5db', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, color: '#111' }}/>
                        {wrongPassword && <Text_1.Text fontSize={12} style={{ color: '#ef4444' }}>{(0, translate_1.libT)('wrongPassword')}</Text_1.Text>}
                        <react_native_1.View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10 }}>
                            {onClose && <react_native_1.Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="cancelPassword" style={{ padding: 8 }}><Text_1.Text>{(0, translate_1.libT)('cancel')}</Text_1.Text></react_native_1.Pressable>}
                            <react_native_1.Pressable onPress={submitPassword} accessibilityRole="button" accessibilityLabel="submitPassword" style={{ padding: 8 }}><Text_1.Text fontWeight="600" color="primary.100">{(0, translate_1.libT)('open')}</Text_1.Text></react_native_1.Pressable>
                        </react_native_1.View>
                    </react_native_1.View>
                </react_native_1.View>)}
            {/* Arriba: cerrar y buscar (o la barra de búsqueda) */}
            <react_native_1.View pointerEvents="box-none" style={{ position: 'absolute', top: top + 8, left: 8, right: 8, zIndex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                {onClose && <RoundButton icon="close" label="close" onPress={onClose}/>}
                <react_native_1.View style={{ flex: 1 }} pointerEvents="box-none"/>
                {showSearch && status === 'ready' && (searchOpen ? (<react_native_1.View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 20, paddingLeft: 12, flexShrink: 1, flexGrow: 1, maxWidth: 420 }}>
                        <react_native_1.TextInput value={query} onChangeText={q => setQuery(q.replace(/\s*\n\s*/g, ' '))} numberOfLines={1} autoFocus returnKeyType="search" placeholder={(0, translate_1.libT)('search')} placeholderTextColor="rgba(255,255,255,0.6)" accessibilityLabel="searchInput" onSubmitEditing={() => { if (found && found.count && query.trim())
            run('window.__searchStep(1)');
        else
            search(query); }} style={{ flex: 1, color: '#fff', paddingVertical: 8 }}/>
                        {found && <Text_1.Text fontSize={12} style={{ color: '#ddd', marginHorizontal: 4 }}>{found.count ? `${found.index + 1}/${found.count}` : (0, translate_1.libT)('noResults')}</Text_1.Text>}
                        <RoundButton icon="chevron-up" label="searchPrev" onPress={() => run('window.__searchStep(-1)')}/>
                        <RoundButton icon="chevron-down" label="searchNext" onPress={() => (found ? run('window.__searchStep(1)') : search(query))}/>
                        <RoundButton icon="close" label="closeSearch" onPress={() => { setSearchOpen(false); setQuery(''); setFound(null); run('window.__clearSearch()'); }}/>
                    </react_native_1.View>) : <RoundButton icon="magnify" label="openSearch" onPress={() => setSearchOpen(true)}/>)}
            </react_native_1.View>
            {/* Cambiar el texto busca de nuevo (la próxima vez que se pulse buscar) */}
            <SearchReset query={query} onChange={() => setFound(null)}/>
            {showPageIndicator && status === 'ready' && page.numPages > 0 && (<react_native_1.View pointerEvents="none" style={{ position: 'absolute', bottom: (onClose ? insets.bottom : 0) + 14, left: 0, right: 0, alignItems: 'center' }}>
                    <Text_1.Text color="white" fontSize={13} style={{ backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, overflow: 'hidden' }}>
                        {`${page.page || 1} / ${page.numPages}`}
                    </Text_1.Text>
                </react_native_1.View>)}
        </Box_1.Box>);
});
/** Al cambiar el texto de búsqueda, el resultado anterior deja de valer */
const SearchReset = ({ query, onChange }) => {
    const first = (0, react_1.useRef)(true);
    (0, react_1.useEffect)(() => { if (first.current) {
        first.current = false;
        return;
    } onChange(); }, [query]);
    return null;
};
/**
 * Abre el visor de PDF a pantalla completa (con botón de cerrar). Devuelve el control del modal
 * @example openPDFViewer('https://…/manual.pdf', { initialPage: 3 })
 */
const openPDFViewer = (source, options) => {
    var _a;
    return (0, Modal_1.openModal)({
        animationType: 'slideUp',
        buttonClose: false,
        _contentStyle: { h: '100%', my: 0, roundedTop: 0, roundedBottom: 0, bg: ((_a = options === null || options === void 0 ? void 0 : options.backgroundColor) !== null && _a !== void 0 ? _a : '#525659') },
        children: ({ close }) => <exports.PDFViewer source={source} onClose={() => close()} {...options}/>,
    });
};
exports.openPDFViewer = openPDFViewer;
