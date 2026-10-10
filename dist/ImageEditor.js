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
exports.openImageEditor = exports.ImageEditor = exports.IMAGE_EDITOR_FILTERS = exports.IMAGE_EDITOR_ADJUSTMENTS = exports.IMAGE_EDITOR_FONTS = exports.IMAGE_EDITOR_TOOLS = void 0;
// ImageEditor: editar una foto sobre react-native-webview (opcional). Dibujar (lápiz suavizado, marcador, líneas,
// flechas, formas con relleno y trazo discontinuo), textos, stickers, bote de relleno, pixelar o desenfocar zonas, goma,
// cuentagotas, ajustes (exposición, brillo, contraste, saturación...) y filtros, seleccionar y mover / escalar / girar
// lo dibujado, zoom, girar y recortar la foto, deshacer y rehacer. Todo se guarda como elementos (no como píxeles):
// deshacer no copia el lienzo, girar y recortar no lo estropean y se exporta a la resolución de la imagen original.
// Devuelve un data URI (para guardarlo con expo-file-system, subirlo...)
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const react_native_safe_area_context_1 = require("react-native-safe-area-context");
const Box_1 = require("./Box");
const Icon_1 = require("./Icon");
const Menu_1 = require("./Menu");
const Modal_1 = require("./Modal");
const Spinner_1 = require("./Spinner");
const Text_1 = require("./Text");
const translate_1 = require("./utils/translate");
const color_1 = require("./utils/color");
const useThemeProps_1 = require("./utils/useThemeProps");
const webview_1 = require("./utils/webview");
/** Todas las herramientas del editor, en el orden de la barra (la prop `tools` usa estas por defecto) */
exports.IMAGE_EDITOR_TOOLS = [
    'move', 'pencil', 'highlighter', 'line', 'arrow', 'doubleArrow', 'square', 'rounded', 'circle', 'triangle', 'star', 'bubble',
    'text', 'sticker', 'fill', 'pixelate', 'blur', 'eraser',
];
/** Las fuentes de los textos por defecto: del sistema, sin descargar nada (la prop `fonts` las cambia) */
exports.IMAGE_EDITOR_FONTS = [
    { id: 'sans', label: 'Clásica', css: '-apple-system, Roboto, "Helvetica Neue", Arial, sans-serif', weight: 700, android: 'sans-serif' },
    { id: 'serif', label: 'Serif', css: 'Georgia, "Times New Roman", serif', weight: 700, ios: 'Georgia', android: 'serif' },
    { id: 'condensed', label: 'Titular', css: '"Futura-CondensedExtraBold", Impact, "sans-serif-condensed", "Arial Narrow", sans-serif', weight: 800, ios: 'Futura-CondensedExtraBold', android: 'sans-serif-condensed' },
    { id: 'mono', label: 'Máquina', css: '"Courier New", Courier, monospace', weight: 700, ios: 'Courier New', android: 'monospace' },
    { id: 'hand', label: 'A mano', css: '"Marker Felt", "Chalkboard SE", casual, "Comic Sans MS", cursive', weight: 400, ios: 'Marker Felt', android: 'casual' },
    { id: 'script', label: 'Cursiva', css: '"Snell Roundhand", "Dancing Script", cursive', weight: 700, ios: 'Snell Roundhand', android: 'cursive' },
];
/** Los ajustes de la foto que se muestran por defecto (la prop `adjust` los elige) */
exports.IMAGE_EDITOR_ADJUSTMENTS = ['exposure', 'brightness', 'contrast', 'saturation', 'vibrance', 'warmth', 'tint', 'highlights', 'shadows', 'vignette'];
/** Los filtros por defecto: cada uno es una combinación de ajustes (la prop `filters` los cambia) */
exports.IMAGE_EDITOR_FILTERS = [
    { id: 'original', label: 'Original', adjust: {} },
    { id: 'mono', label: 'B/N', adjust: { mono: 100, contrast: 12 } },
    { id: 'sepia', label: 'Sepia', adjust: { sepia: 100, contrast: 5 } },
    { id: 'vivid', label: 'Vívido', adjust: { saturation: 30, vibrance: 25, contrast: 15 } },
    { id: 'warm', label: 'Cálido', adjust: { warmth: 35, saturation: 10 } },
    { id: 'cool', label: 'Frío', adjust: { warmth: -35, tint: 5 } },
    { id: 'vintage', label: 'Vintage', adjust: { sepia: 35, contrast: -10, vignette: 40, highlights: -15 } },
    { id: 'fade', label: 'Suave', adjust: { contrast: -25, shadows: 25, saturation: -20 } },
    { id: 'drama', label: 'Drama', adjust: { contrast: 35, shadows: -20, highlights: -20, vignette: 30 } },
];
const COLORS = ['#ffffff', '#111827', '#ef4444', '#f97316', '#facc15', '#22c55e', '#06b6d4', '#3b82f6', '#a855f7', '#ec4899'];
const LINE_WIDTHS = [3, 6, 10, 16, 24];
const SHAPE_TOOLS = ['line', 'arrow', 'doubleArrow', 'square', 'rounded', 'circle', 'triangle', 'star', 'bubble'];
const PRIVACY_TOOLS = ['pixelate', 'blur'];
const CLOSED_TOOLS = ['square', 'rounded', 'circle', 'triangle', 'star', 'bubble'];
const ICONS = {
    move: 'cursor-move', pencil: 'pencil', highlighter: 'marker', line: 'vector-line', arrow: 'arrow-top-right', doubleArrow: 'arrow-left-right',
    square: 'square-outline', rounded: 'square-rounded-outline', circle: 'circle-outline', triangle: 'triangle-outline', star: 'star-outline',
    bubble: 'message-outline', text: 'format-text', sticker: 'sticker-emoji', fill: 'format-color-fill', pixelate: 'checkerboard', blur: 'blur',
    eraser: 'eraser', crop: 'crop', shapes: 'shape-outline', privacy: 'eye-off-outline', adjust: 'tune-variant',
};
const ADJUST_ICONS = {
    exposure: 'brightness-7', brightness: 'brightness-6', contrast: 'contrast-box', saturation: 'water', vibrance: 'flare', warmth: 'thermometer',
    tint: 'palette-outline', highlights: 'white-balance-sunny', shadows: 'weather-night', vignette: 'checkbox-blank-circle-outline',
};
const TEXT_PX = 30;
const STICKER_PX = 120;
const readable = (hex) => (0, color_1.readableColor)(hex);
/** La uri de un sticker (los require() se resuelven a su uri) */
const stickerUri = (u) => { var _a, _b; return (typeof u === 'number' ? (_b = (_a = react_native_1.Image.resolveAssetSource(u)) === null || _a === void 0 ? void 0 : _a.uri) !== null && _b !== void 0 ? _b : '' : u); };
const stickerOf = (s) => (typeof s === 'object' ? s : { uri: s });
const sameAdjust = (a, b) => {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    return [...keys].every(k => { var _a, _b; return ((_a = a[k]) !== null && _a !== void 0 ? _a : 0) === ((_b = b[k]) !== null && _b !== void 0 ? _b : 0); });
};
/* ---------------- El documento del WebView ---------------- */
const editorDocument = (cfg) => `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<style>
html,body{margin:0;height:100%;background:${cfg.bg};overflow:hidden;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;touch-action:none}
#base,#draw{position:absolute;left:0;top:0}
#crop{position:absolute;display:none;border:2px dashed #fff;box-shadow:0 0 0 9999px rgba(0,0,0,.55);pointer-events:none}
</style></head>
<body><canvas id="base"></canvas><canvas id="draw"></canvas><div id="crop"></div>
<script>window.__CFG=${(0, webview_1.jsValue)(cfg)};</script>
<script>${EDITOR_SCRIPT}</script></body></html>`;
// En ES5 a propósito: así funciona también en WebViews de Android antiguos. Coordenadas de los elementos de 0 a 1
// sobre la imagen (girada y recortada); grosores y tamaños divididos por sqrt(ancho·alto), para que se vean igual en
// pantalla y al exportar. Cada elemento puede llevar dx/dy (movido, de 0 a 1), s (escala) y rot (radianes). La vista
// (zoom vz y desplazamiento vx/vy) solo cambia cómo se ve: los toques se pasan a coordenadas de la imagen
const EDITOR_SCRIPT = String.raw `(function () {
  var cfg = window.__CFG, RN = window.ReactNativeWebView;
  function post(o) { if (RN) RN.postMessage(JSON.stringify(o)); }
  var base = document.getElementById('base'), draw = document.getElementById('draw'), cropEl = document.getElementById('crop');
  var bctx = base.getContext('2d'), dctx = draw.getContext('2d'), mctx = document.createElement('canvas').getContext('2d'), tmp = document.createElement('canvas');
  var src = document.createElement('canvas'), sctx = src.getContext('2d');
  var img = null, work = null, workKey = '', dpr = window.devicePixelRatio || 1, dw = 1, dh = 1, ox = 0, oy = 0, vz = 1, vx = 0, vy = 0;
  var st = { rot: 0, crop: { x: 0, y: 0, w: 1, h: 1 }, adjust: {}, ops: [] }, undoStack = [], redoStack = [];
  var tool = cfg.tool, style = { color: cfg.color, width: cfg.width, fill: 'none', dash: 'solid', fillMode: 'drawing' };
  var cur = null, sel = null, selected = -1, editing = -1, gesture = null, guides = null, adjPre = null, adjFrame = false;
  var stickers = {}, fillCache = {}, fillKeys = [];
  var FREE = { pencil: 1, highlighter: 1, eraser: 1 }, LINEAR = { line: 1, arrow: 1, doubleArrow: 1 }, AREA = { pixelate: 1, blur: 1 };
  var CLOSED = { square: 1, rounded: 1, circle: 1, triangle: 1, star: 1, bubble: 1 }, BOXED = { text: 1, sticker: 1 };
  var LINE_H = 1.25, HANDLE = 13, FILL_RES = 900;

  function clone(s) { return JSON.parse(JSON.stringify(s)); }
  function U(W, H) { return Math.sqrt(W * H); }
  function hexNum(hex) { var h = String(hex).replace('#', ''); if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2]; return parseInt(h.slice(0, 6), 16); }
  function rgbOf(hex) { var n = hexNum(hex); return isNaN(n) ? [0, 0, 0] : [n >> 16 & 255, n >> 8 & 255, n & 255]; }
  function rgba(hex, a) { var n = hexNum(hex); return isNaN(n) ? hex : 'rgba(' + (n >> 16 & 255) + ',' + (n >> 8 & 255) + ',' + (n & 255) + ',' + a + ')'; }
  function readable(hex) { var c = rgbOf(hex); return (0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]) / 255 > 0.6 ? '#111111' : '#ffffff'; }
  function toHex(r, g, b) { return '#' + [r, g, b].map(function (v) { var s = Math.round(v).toString(16); return s.length < 2 ? '0' + s : s; }).join(''); }
  function rotSize() { var w = img.naturalWidth, h = img.naturalHeight; return st.rot % 2 ? { w: h, h: w } : { w: w, h: h }; }
  function cropPx() { var r = rotSize(); return { x: st.crop.x * r.w, y: st.crop.y * r.h, w: st.crop.w * r.w, h: st.crop.h * r.h }; }
  function info(op) {
    if (!op) return null;
    return { type: op.type, color: op.color, fill: op.fill, dash: op.dash, text: op.type === 'text' ? op.text : undefined,
      hasWidth: op.width != null && op.type !== 'eraser', closed: !!CLOSED[op.type], dashable: !!(LINEAR[op.type] || CLOSED[op.type] || op.type === 'pencil') };
  }
  function emit() {
    post({ type: 'state', canUndo: undoStack.length > 0, canRedo: redoStack.length > 0, hasSelection: !!sel, changed: undoStack.length > 0,
      selected: selected >= 0 ? info(st.ops[selected]) : null, adjust: st.adjust, zoom: vz });
  }
  function change(fn) { undoStack.push(clone(st)); redoStack = []; fn(); }

  /* ----- Ajustes de la foto (por píxel: sin ctx.filter, que no está en todos los WebViews) ----- */
  function neutral(a) { for (var k in a) if (a[k] && k !== 'vignette') return false; return true; }
  function adjustPixels(d, a) {
    var ex = Math.pow(2, (a.exposure || 0) / 100 * 1.2), br = (a.brightness || 0) * 0.6, C = (a.contrast || 0) * 1.28, cf = 259 * (C + 255) / (255 * (259 - C));
    var sat = 1 + (a.saturation || 0) / 100, vib = (a.vibrance || 0) / 100, wm = (a.warmth || 0) / 100, tn = (a.tint || 0) / 100;
    var hl = (a.highlights || 0) / 100, sh = (a.shadows || 0) / 100, mono = (a.mono || 0) / 100, sep = (a.sepia || 0) / 100;
    for (var i = 0; i < d.length; i += 4) {
      var r = d[i] * ex + br + 30 * wm + 12 * tn, g = d[i + 1] * ex + br - 24 * tn, b = d[i + 2] * ex + br - 30 * wm + 12 * tn;
      if (hl || sh) {
        // Luces: pesa más en lo claro; sombras: en lo oscuro
        var L = Math.max(0, Math.min(1, (0.299 * r + 0.587 * g + 0.114 * b) / 255)), k = hl * 90 * L * L + sh * 90 * (1 - L) * (1 - L);
        r += k; g += k; b += k;
      }
      if (C) { r = (r - 128) * cf + 128; g = (g - 128) * cf + 128; b = (b - 128) * cf + 128; }
      if (sat !== 1 || vib) {
        var gray = 0.299 * r + 0.587 * g + 0.114 * b, s = sat;
        // Intensidad: satura más lo poco saturado (pieles y cielos no se pasan)
        if (vib) { var mx = Math.max(r, g, b), mn = Math.min(r, g, b), cs = mx > 0 ? (mx - mn) / Math.max(mx, 1) : 0; s *= 1 + vib * (1 - Math.min(1, cs)); }
        r = gray + (r - gray) * s; g = gray + (g - gray) * s; b = gray + (b - gray) * s;
      }
      if (mono) { var y = 0.299 * r + 0.587 * g + 0.114 * b; r += (y - r) * mono; g += (y - g) * mono; b += (y - b) * mono; }
      if (sep) {
        var tr = 0.393 * r + 0.769 * g + 0.189 * b, tg = 0.349 * r + 0.686 * g + 0.168 * b, tb = 0.272 * r + 0.534 * g + 0.131 * b;
        r += (tr - r) * sep; g += (tg - g) * sep; b += (tb - b) * sep;
      }
      d[i] = r; d[i + 1] = g; d[i + 2] = b;
    }
  }
  // Viñeta: bordes oscuros (o claros si es negativa), sobre el encuadre final
  function vignette(ctx, W, H) {
    var v = st.adjust.vignette || 0;
    if (!v) return;
    var R = Math.sqrt(W * W + H * H) / 2, g = ctx.createRadialGradient(W / 2, H / 2, R * 0.35, W / 2, H / 2, R), c = v > 0 ? '0,0,0' : '255,255,255';
    g.addColorStop(0, 'rgba(' + c + ',0)'); g.addColorStop(1, 'rgba(' + c + ',' + Math.abs(v) / 100 * 0.75 + ')');
    ctx.save(); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
  }
  // La foto con los ajustes, a resolución de trabajo (lado mayor 2000): rápida de rehacer al mover un control
  function ensureWork() {
    var key = JSON.stringify(st.adjust);
    if (key === workKey && work) return false;
    workKey = key;
    if (neutral(st.adjust)) { work = img; return true; }
    var k = Math.min(1, 2000 / Math.max(img.naturalWidth, img.naturalHeight)), c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(img.naturalWidth * k)); c.height = Math.max(1, Math.round(img.naturalHeight * k));
    var x = c.getContext('2d'); x.drawImage(img, 0, 0, c.width, c.height);
    var data = x.getImageData(0, 0, c.width, c.height); adjustPixels(data.data, st.adjust); x.putImageData(data, 0, 0);
    work = c; return true;
  }

  /* ----- Imagen ----- */
  // La imagen girada y recortada, ocupando W x H (source: la original o la de trabajo, con el tamaño que tenga)
  function drawImageTo(ctx, W, H, source) {
    var r = rotSize(), c = cropPx();
    ctx.save(); ctx.scale(W / c.w, H / c.h); ctx.translate(-c.x, -c.y);
    if (st.rot === 1) { ctx.translate(r.w, 0); ctx.rotate(Math.PI / 2); }
    else if (st.rot === 2) { ctx.translate(r.w, r.h); ctx.rotate(Math.PI); }
    else if (st.rot === 3) { ctx.translate(0, r.h); ctx.rotate(-Math.PI / 2); }
    ctx.drawImage(source || img, 0, 0, img.naturalWidth, img.naturalHeight); ctx.restore();
  }

  /* ----- Geometría de los elementos ----- */
  function roundRectPath(ctx, x, y, w, h, r) {
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  function textFont(op, px) { return (op.weight || 700) + ' ' + px + 'px ' + op.font; }
  function textLayout(op, W, H) {
    var px = op.size * U(W, H);
    mctx.font = textFont(op, px);
    var lines = String(op.text).split('\n'), widths = lines.map(function (l) { return mctx.measureText(l).width; });
    var w = Math.max.apply(null, widths.concat([px * 0.5])), lh = px * LINE_H;
    return { px: px, lines: lines, widths: widths, w: w, h: lines.length * lh, lh: lh, pad: op.bg === 'solid' || op.bg === 'soft' ? px * 0.35 : px * 0.12 };
  }
  function lineX(op, L, i, cx) { var w = L.widths[i]; return op.align === 'left' ? cx - L.w / 2 : op.align === 'right' ? cx + L.w / 2 - w : cx - w / 2; }
  // Caja del elemento sin mover / escalar / girar, en px de W x H
  function bbox(op, W, H) {
    if (op.type === 'text') {
      var L = textLayout(op, W, H);
      return { x: op.x * W - L.w / 2 - L.pad, y: op.y * H - L.h / 2, w: L.w + L.pad * 2, h: L.h };
    }
    if (op.type === 'sticker') { var sw = op.size * U(W, H), sh = sw * op.aspect; return { x: op.x * W - sw / 2, y: op.y * H - sh / 2, w: sw, h: sh }; }
    if (op.type === 'fill') return { x: op.x * W, y: op.y * H, w: 0, h: 0 };
    var x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    (op.points || [op.a, op.b]).forEach(function (p) { x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y); });
    var pad = AREA[op.type] ? 0 : op.width * U(W, H) / 2;
    return { x: x0 * W - pad, y: y0 * H - pad, w: (x1 - x0) * W + pad * 2, h: (y1 - y0) * H + pad * 2 };
  }
  function center(b) { return { x: b.x + b.w / 2, y: b.y + b.h / 2 }; }
  function hasTf(op) { return op.dx || op.dy || (op.s && op.s !== 1) || op.rot; }
  function applyTf(ctx, op, W, H) {
    if (!hasTf(op)) return;
    var c = center(bbox(op, W, H));
    ctx.translate(c.x + (op.dx || 0) * W, c.y + (op.dy || 0) * H);
    if (op.rot) ctx.rotate(op.rot);
    if (op.s && op.s !== 1) ctx.scale(op.s, op.s);
    ctx.translate(-c.x, -c.y);
  }
  // De la imagen (sin zoom) al sistema del elemento (deshaciendo su movimiento, escala y giro) y al revés
  function toLocal(op, p) {
    var c = center(bbox(op, dw, dh)), x = p.x - c.x - (op.dx || 0) * dw, y = p.y - c.y - (op.dy || 0) * dh, r = -(op.rot || 0), s = op.s || 1;
    return { x: (x * Math.cos(r) - y * Math.sin(r)) / s + c.x, y: (x * Math.sin(r) + y * Math.cos(r)) / s + c.y };
  }
  function toScreen(op, q) {
    var c = center(bbox(op, dw, dh)), s = op.s || 1, r = op.rot || 0, x = (q.x - c.x) * s, y = (q.y - c.y) * s;
    return { x: x * Math.cos(r) - y * Math.sin(r) + c.x + (op.dx || 0) * dw, y: x * Math.sin(r) + y * Math.cos(r) + c.y + (op.dy || 0) * dh };
  }
  function segDist(p, a, b) {
    var ux = b.x - a.x, uy = b.y - a.y, l = ux * ux + uy * uy, t = l ? Math.max(0, Math.min(1, ((p.x - a.x) * ux + (p.y - a.y) * uy) / l)) : 0;
    return Math.hypot(p.x - a.x - ux * t, p.y - a.y - uy * t);
  }
  function sp(p) { return { x: p.x * dw, y: p.y * dh }; }

  /* ----- Dibujar los elementos ----- */
  // Trazo a mano suavizado: curvas por los puntos medios (sin esquinas de los puntos sueltos)
  function freePath(ctx, pts, W, H) {
    ctx.moveTo(pts[0].x * W, pts[0].y * H);
    if (pts.length < 3) { var l = pts[pts.length - 1]; ctx.lineTo(l.x * W + (pts.length === 1 ? 0.01 : 0), l.y * H); return; }
    for (var i = 1; i < pts.length - 1; i++) ctx.quadraticCurveTo(pts[i].x * W, pts[i].y * H, (pts[i].x + pts[i + 1].x) / 2 * W, (pts[i].y + pts[i + 1].y) / 2 * H);
    var e = pts[pts.length - 1]; ctx.lineTo(e.x * W, e.y * H);
  }
  function head(ctx, ax, ay, bx, by, hl) {
    var ang = Math.atan2(by - ay, bx - ax);
    ctx.moveTo(bx - hl * Math.cos(ang - 0.5), by - hl * Math.sin(ang - 0.5)); ctx.lineTo(bx, by);
    ctx.lineTo(bx - hl * Math.cos(ang + 0.5), by - hl * Math.sin(ang + 0.5));
  }
  function shapePath(ctx, op, W, H) {
    var ax = op.a.x * W, ay = op.a.y * H, bx = op.b.x * W, by = op.b.y * H, t = op.type;
    var x = Math.min(ax, bx), y = Math.min(ay, by), w = Math.abs(bx - ax), h = Math.abs(by - ay);
    if (LINEAR[t]) { ctx.moveTo(ax, ay); ctx.lineTo(bx, by); }
    else if (t === 'square') ctx.rect(x, y, w, h);
    else if (t === 'rounded') roundRectPath(ctx, x, y, w, h, Math.min(w, h) * 0.2);
    else if (t === 'circle') ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
    else if (t === 'triangle') { ctx.moveTo(x + w / 2, y); ctx.lineTo(x + w, y + h); ctx.lineTo(x, y + h); ctx.closePath(); }
    else if (t === 'star') {
      for (var i = 0; i < 10; i++) {
        var a = -Math.PI / 2 + i * Math.PI / 5, f = i % 2 ? 0.45 : 1, px = x + w / 2 + Math.cos(a) * w / 2 * f, py = y + h / 2 + Math.sin(a) * h / 2 * f;
        if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py);
      }
      ctx.closePath();
    } else if (t === 'bubble') {
      // Bocadillo: caja redondeada con el pico abajo a la izquierda
      var bh = h * 0.78, bb = y + bh, r = Math.max(0, Math.min(w / 2, bh / 2, Math.min(w, bh) * 0.25));
      ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, bb, r); ctx.arcTo(x + w, bb, x, bb, r);
      ctx.lineTo(x + w * 0.42, bb); ctx.lineTo(x + w * 0.18, y + h); ctx.lineTo(x + w * 0.26, bb);
      ctx.arcTo(x, bb, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
    }
  }
  function drawShape(ctx, op, W, H) {
    var lw = op.width * U(W, H), t = op.type;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = lw;
    if (t === 'eraser') { ctx.globalCompositeOperation = 'destination-out'; ctx.strokeStyle = '#000'; }
    else ctx.strokeStyle = op.color;
    // Marcador fluorescente: translúcido y de punta plana (el trazo entero de una vez: no se oscurece donde se cruza)
    if (t === 'highlighter') { ctx.globalAlpha = 0.42; ctx.lineCap = 'square'; }
    if (op.dash === 'dashed') ctx.setLineDash([lw * 3, lw * 2.2]);
    else if (op.dash === 'dotted') ctx.setLineDash([0.001, lw * 2]);
    ctx.beginPath();
    if (op.points) freePath(ctx, op.points, W, H); else shapePath(ctx, op, W, H);
    if (CLOSED[t] && op.fill && op.fill !== 'none') { ctx.fillStyle = op.fill === 'soft' ? rgba(op.color, 0.35) : op.color; ctx.fill(); }
    ctx.stroke();
    if (t === 'arrow' || t === 'doubleArrow') {
      var hl = lw * 3 + U(W, H) * 0.015, ax = op.a.x * W, ay = op.a.y * H, bx = op.b.x * W, by = op.b.y * H;
      ctx.setLineDash([]); ctx.beginPath(); head(ctx, ax, ay, bx, by, hl);
      if (t === 'doubleArrow') head(ctx, bx, by, ax, ay, hl);
      ctx.stroke();
    }
  }
  function drawText(ctx, op, W, H) {
    var L = textLayout(op, W, H), cx = op.x * W, top = op.y * H - L.h / 2, fill = op.color, box = null;
    ctx.font = textFont(op, L.px); ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.lineJoin = 'round';
    if (op.bg === 'solid') { box = op.color; fill = readable(op.color); }
    else if (op.bg === 'soft') box = 'rgba(0,0,0,0.55)';
    if (box) {
      // Las cajas detrás de todas las líneas (si no, la de una línea taparía el pie de la anterior)
      ctx.fillStyle = box;
      L.lines.forEach(function (ln, i) {
        if (!ln) return;
        ctx.beginPath(); roundRectPath(ctx, lineX(op, L, i, cx) - L.pad, top + i * L.lh, L.widths[i] + L.pad * 2, L.lh, L.px * 0.28); ctx.fill();
      });
    }
    L.lines.forEach(function (ln, i) {
      var x = lineX(op, L, i, cx), y = top + i * L.lh + L.lh / 2;
      if (op.bg === 'outline') { ctx.strokeStyle = readable(op.color); ctx.lineWidth = L.px * 0.16; ctx.strokeText(ln, x, y); }
      ctx.fillStyle = fill; ctx.fillText(ln, x, y);
    });
  }
  function drawSticker(ctx, op, W, H) {
    var im = stickers[op.id];
    if (!im) return;
    var b = bbox(op, W, H);
    ctx.drawImage(im, b.x, b.y, b.w, b.h);
  }
  // Zona pixelada o desenfocada: la foto de esa zona se reduce y se vuelve a agrandar, sin suavizar (píxeles) o
  // suavizando (desenfoque). Sale de la foto, no de lo dibujado
  function areaRect(op, W, H) {
    var b = bbox(op, W, H), s = op.s || 1, cx = b.x + b.w / 2 + (op.dx || 0) * W, cy = b.y + b.h / 2 + (op.dy || 0) * H;
    var x0 = Math.max(0, cx - b.w * s / 2), y0 = Math.max(0, cy - b.h * s / 2), x1 = Math.min(W, cx + b.w * s / 2), y1 = Math.min(H, cy + b.h * s / 2);
    return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
  }
  function drawArea(ctx, op, W, H, source) {
    var r = areaRect(op, W, H);
    if (r.w < 1 || r.h < 1 || !source) return;
    var cell = Math.max(2, op.block * U(W, H) * (op.type === 'blur' ? 1.6 : 1));
    var cw = Math.max(1, Math.round(r.w / cell)), ch = Math.max(1, Math.round(r.h / cell)), kx = source.width / W, ky = source.height / H;
    tmp.width = cw; tmp.height = ch;
    var t = tmp.getContext('2d');
    t.imageSmoothingEnabled = true;
    t.drawImage(source, r.x * kx, r.y * ky, r.w * kx, r.h * ky, 0, 0, cw, ch);
    ctx.save(); ctx.imageSmoothingEnabled = op.type === 'blur';
    ctx.drawImage(tmp, 0, 0, cw, ch, r.x, r.y, r.w, r.h);
    ctx.restore();
  }

  /* ----- Bote de relleno ----- */
  // Relleno por inundación (por líneas: rápido y sin recursión). wall[i] = 1 donde no se puede pasar
  function flood(wall, w, h, sx, sy) {
    if (sx < 0 || sy < 0 || sx >= w || sy >= h || wall[sy * w + sx]) return null;
    var out = new Uint8Array(w * h), stack = [sx, sy];
    while (stack.length) {
      var y = stack.pop(), x = stack.pop(), i = y * w + x;
      if (out[i]) continue;
      while (x > 0 && !wall[i - 1] && !out[i - 1]) { x--; i--; }
      var up = false, dn = false;
      for (; x < w && !wall[i] && !out[i]; x++, i++) {
        out[i] = 1;
        if (y > 0) { var u = i - w; if (!wall[u] && !out[u]) { if (!up) { stack.push(x, y - 1); up = true; } } else up = false; }
        if (y < h - 1) { var dd = i + w; if (!wall[dd] && !out[dd]) { if (!dn) { stack.push(x, y + 1); dn = true; } } else dn = false; }
      }
    }
    return out;
  }
  // Crece una máscara 1 px por vuelta (only: solo hacia donde only[i] es 1)
  function grow(mask, w, h, times, only) {
    for (var t = 0; t < times; t++) {
      var next = new Uint8Array(mask);
      for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) {
        var i = y * w + x;
        if (mask[i] || (only && !only[i])) continue;
        if ((x > 0 && mask[i - 1]) || (x < w - 1 && mask[i + 1]) || (y > 0 && mask[i - w]) || (y < h - 1 && mask[i + w])) next[i] = 1;
      }
      mask = next;
    }
    return mask;
  }
  // La máscara de un relleno, a resolución fija (900 px el lado mayor): sale igual en pantalla y al exportar. Bordes:
  // lo dibujado antes (cerrando huecos de 1 px) y, en modo 'image', además la foto que no se parece al color tocado
  // (la original: así la zona no cambia al tocar después los ajustes)
  function fillMask(op, index) {
    var key = JSON.stringify([st.rot, st.crop, op, st.ops.slice(0, index)]);
    if (fillCache[key] !== undefined) return fillCache[key];
    var c = cropPx(), k = FILL_RES / Math.max(c.w, c.h), w = Math.max(1, Math.round(c.w * k)), h = Math.max(1, Math.round(c.h * k));
    var cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    var x = cv.getContext('2d');
    for (var j = 0; j < index; j++) { var o = st.ops[j]; if (o.type !== 'fill' && !AREA[o.type]) drawOp(x, o, w, h, null, j); }
    var dd = x.getImageData(0, 0, w, h).data, n = w * h, lines = new Uint8Array(n), i;
    for (i = 0; i < n; i++) lines[i] = dd[i * 4 + 3] >= 100 ? 1 : 0;
    var wall = grow(lines, w, h, 1);
    var sx = Math.floor(op.x * w), sy = Math.floor(op.y * h);
    if (op.mode === 'image' && sx >= 0 && sy >= 0 && sx < w && sy < h) {
      x.clearRect(0, 0, w, h); drawImageTo(x, w, h, img);
      var id = x.getImageData(0, 0, w, h).data, si = (sy * w + sx) * 4, tol = (op.tol || 40) * (op.tol || 40) * 3;
      for (i = 0; i < n; i++) {
        var dr = id[i * 4] - id[si], dg = id[i * 4 + 1] - id[si + 1], db = id[i * 4 + 2] - id[si + 2];
        if (dr * dr + dg * dg + db * db > tol) wall[i] = 1;
      }
    }
    var out = flood(wall, w, h, sx, sy), result = null;
    if (out) {
      // Que llegue por debajo del borde suavizado de las líneas (si no, queda un filo claro)
      out = grow(out, w, h, 2, op.mode === 'image' ? null : wall);
      var rgb = rgbOf(op.color), im = x.createImageData(w, h), p = im.data;
      for (i = 0; i < n; i++) if (out[i]) { p[i * 4] = rgb[0]; p[i * 4 + 1] = rgb[1]; p[i * 4 + 2] = rgb[2]; p[i * 4 + 3] = 255; }
      x.clearRect(0, 0, w, h); x.putImageData(im, 0, 0); result = cv;
    }
    fillCache[key] = result; fillKeys.push(key);
    if (fillKeys.length > 24) delete fillCache[fillKeys.shift()];
    return result;
  }
  function drawFill(ctx, op, W, H, index) {
    var m = fillMask(op, index);
    if (!m) return;
    ctx.save(); ctx.imageSmoothingEnabled = true; ctx.drawImage(m, 0, 0, W, H); ctx.restore();
  }
  function drawOp(ctx, op, W, H, source, index) {
    if (AREA[op.type]) return drawArea(ctx, op, W, H, source);
    if (op.type === 'fill') return drawFill(ctx, op, W, H, index);
    ctx.save(); applyTf(ctx, op, W, H);
    if (op.type === 'text') drawText(ctx, op, W, H);
    else if (op.type === 'sticker') drawSticker(ctx, op, W, H);
    else drawShape(ctx, op, W, H);
    ctx.restore();
  }

  /* ----- Pantalla ----- */
  function viewTf(ctx) { ctx.setTransform(dpr * vz, 0, 0, dpr * vz, (ox + vx) * dpr, (oy + vy) * dpr); }
  // La foto (con ajustes) a tamaño de pantalla sin zoom: de aquí sacan los píxeles las zonas pixeladas
  function renderSource() {
    src.width = Math.max(1, Math.round(dw * dpr)); src.height = Math.max(1, Math.round(dh * dpr));
    sctx.setTransform(dpr, 0, 0, dpr, 0, 0); drawImageTo(sctx, dw, dh, work); vignette(sctx, dw, dh);
  }
  function renderBase() {
    bctx.setTransform(dpr, 0, 0, dpr, 0, 0); bctx.clearRect(0, 0, innerWidth, innerHeight);
    viewTf(bctx);
    bctx.save(); bctx.beginPath(); bctx.rect(0, 0, dw, dh); bctx.clip();
    drawImageTo(bctx, dw, dh, work); vignette(bctx, dw, dh);
    bctx.restore();
  }
  function drawSelection() {
    var op = st.ops[selected];
    if (!op || selected === editing) return;
    var b = bbox(op, dw, dh), m = 6 / vz, u = 1 / vz;
    var cs = [[b.x - m, b.y - m], [b.x + b.w + m, b.y - m], [b.x + b.w + m, b.y + b.h + m], [b.x - m, b.y + b.h + m]].map(function (q) { return toScreen(op, { x: q[0], y: q[1] }); });
    dctx.save();
    dctx.beginPath(); cs.forEach(function (c, i) { if (i) dctx.lineTo(c.x, c.y); else dctx.moveTo(c.x, c.y); }); dctx.closePath();
    dctx.strokeStyle = 'rgba(0,0,0,0.45)'; dctx.lineWidth = 3 * u; dctx.stroke();
    dctx.setLineDash([6 * u, 4 * u]); dctx.strokeStyle = '#ffffff'; dctx.lineWidth = 1.5 * u; dctx.stroke(); dctx.setLineDash([]);
    // Tirador de escalar y girar, en la esquina de abajo a la derecha
    var h = cs[2];
    dctx.beginPath(); dctx.arc(h.x, h.y, HANDLE * u, 0, Math.PI * 2); dctx.fillStyle = '#ffffff'; dctx.fill();
    dctx.strokeStyle = 'rgba(0,0,0,0.3)'; dctx.lineWidth = u; dctx.stroke();
    dctx.beginPath(); dctx.arc(h.x, h.y, 6 * u, -Math.PI * 0.85, Math.PI * 0.55); dctx.strokeStyle = '#111111'; dctx.lineWidth = 1.8 * u; dctx.stroke();
    dctx.restore();
  }
  function render() {
    if (!img) return;
    dctx.setTransform(dpr, 0, 0, dpr, 0, 0); dctx.clearRect(0, 0, innerWidth, innerHeight);
    viewTf(dctx);
    dctx.save(); dctx.beginPath(); dctx.rect(0, 0, dw, dh); dctx.clip();
    st.ops.forEach(function (op, i) { if (i !== editing) drawOp(dctx, op, dw, dh, src, i); });
    if (cur) drawOp(dctx, cur, dw, dh, src, st.ops.length);
    dctx.restore();
    if (guides && (guides.v || guides.h)) {
      dctx.save(); dctx.strokeStyle = '#ec4899'; dctx.lineWidth = 1 / vz; dctx.beginPath();
      if (guides.v) { dctx.moveTo(dw / 2, 0); dctx.lineTo(dw / 2, dh); }
      if (guides.h) { dctx.moveTo(0, dh / 2); dctx.lineTo(dw, dh / 2); }
      dctx.stroke(); dctx.restore();
    }
    drawSelection();
  }
  // Con zoom, la foto ocupa toda la pantalla que pueda (sin dejar huecos si es más grande; centrada si cabe)
  function clampAxis(v, size, view, off) { return size >= view ? Math.min(-off, Math.max(view - size - off, v)) : (view - size) / 2 - off; }
  function clampView() {
    vz = Math.max(1, Math.min(cfg.maxZoom || 8, vz));
    if (vz <= 1.001) { vz = 1; vx = 0; vy = 0; return; }
    vx = clampAxis(vx, dw * vz, innerWidth, ox); vy = clampAxis(vy, dh * vz, innerHeight, oy);
  }
  // Encaja la imagen (girada y recortada) en la pantalla; los lienzos ocupan toda la pantalla (así el tirador de un
  // elemento junto al borde se puede tocar, y con zoom la foto llega hasta los bordes)
  function layout() {
    if (!img) return;
    var c = cropPx(), pad = cfg.padding, W = innerWidth, H = innerHeight;
    var k = Math.min((W - pad * 2) / c.w, (H - pad * 2) / c.h);
    dw = Math.max(1, Math.round(c.w * k)); dh = Math.max(1, Math.round(c.h * k));
    ox = Math.round((W - dw) / 2); oy = Math.round((H - dh) / 2);
    [base, draw].forEach(function (cv) { cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px'; });
    ensureWork(); clampView(); renderSource(); renderBase(); render(); showSel();
  }
  // La foto cambió (ajustes): se rehace lo que sale de ella
  function refreshImage() { if (ensureWork()) { renderSource(); renderBase(); render(); } }

  /* ----- Recorte ----- */
  function selRect() {
    if (!sel) return null;
    return { x: Math.min(sel.a.x, sel.b.x), y: Math.min(sel.a.y, sel.b.y), w: Math.abs(sel.b.x - sel.a.x), h: Math.abs(sel.b.y - sel.a.y) };
  }
  function showSel() {
    var r = selRect();
    if (!r) { cropEl.style.display = 'none'; return; }
    cropEl.style.display = 'block';
    cropEl.style.left = ox + vx + r.x * dw * vz + 'px'; cropEl.style.top = oy + vy + r.y * dh * vz + 'px';
    cropEl.style.width = r.w * dw * vz + 'px'; cropEl.style.height = r.h * dh * vz + 'px';
  }
  function remap(p, r) { return { x: (p.x - r.x) / r.w, y: (p.y - r.y) / r.h }; }
  window.__applyCrop = function () {
    var r = selRect(); if (!r || r.w < 0.02 || r.h < 0.02) return;
    change(function () {
      var k = Math.sqrt(r.w * r.h);
      st.ops.forEach(function (op) {
        if (op.points) op.points = op.points.map(function (p) { return remap(p, r); });
        if (op.a) { op.a = remap(op.a, r); op.b = remap(op.b, r); }
        if (op.x != null) { var q = remap({ x: op.x, y: op.y }, r); op.x = q.x; op.y = q.y; }
        if (op.size != null) op.size /= k;
        if (op.width != null) op.width /= k;
        if (op.block != null) op.block /= k;
        if (op.dx) op.dx /= r.w;
        if (op.dy) op.dy /= r.h;
      });
      var c = st.crop;
      st.crop = { x: c.x + r.x * c.w, y: c.y + r.y * c.h, w: r.w * c.w, h: r.h * c.h };
    });
    sel = null; selected = -1; vz = 1; layout(); emit();
  };
  window.__cancelCrop = function () { sel = null; showSel(); emit(); };

  /* ----- Girar la foto (90º; dir 1 = derecha) ----- */
  function rotP(p) { return { x: 1 - p.y, y: p.x }; }
  window.__rotate = function (dir) {
    if (!img) return;
    change(function () {
      var times = dir < 0 ? 3 : 1;
      for (var t = 0; t < times; t++) {
        st.ops.forEach(function (op) {
          if (op.points) op.points = op.points.map(rotP);
          if (op.a) { op.a = rotP(op.a); op.b = rotP(op.b); }
          if (op.x != null) { var q = rotP({ x: op.x, y: op.y }); op.x = q.x; op.y = q.y; }
          // Textos y stickers no son puntos: hay que girar también su contenido
          if (BOXED[op.type]) op.rot = (op.rot || 0) + Math.PI / 2;
          if (op.dx || op.dy) { var dx = op.dx || 0; op.dx = -(op.dy || 0); op.dy = dx; }
        });
        var c = st.crop;
        st.crop = { x: 1 - (c.y + c.h), y: c.x, w: c.h, h: c.w };
        st.rot = (st.rot + 1) % 4;
      }
    });
    sel = null; selected = -1; vz = 1; layout(); emit();
  };

  /* ----- Seleccionar y transformar ----- */
  function hitTest(p, onlyText) {
    for (var i = st.ops.length - 1; i >= 0; i--) {
      var op = st.ops[i];
      if (op.type === 'eraser' || op.type === 'fill' || (onlyText && op.type !== 'text')) continue;
      var q = toLocal(op, p), b = bbox(op, dw, dh), tol = 10 / vz / (op.s || 1);
      if (q.x < b.x - tol || q.x > b.x + b.w + tol || q.y < b.y - tol || q.y > b.y + b.h + tol) continue;
      // Los trazos y las líneas solo si se toca cerca del trazo (no todo su rectángulo)
      if (op.points || LINEAR[op.type]) {
        var pts = op.points || [op.a, op.b], lim = op.width * U(dw, dh) / 2 + tol, near = false;
        for (var j = 0; j < pts.length && !near; j++) near = segDist(q, sp(pts[j]), sp(pts[Math.min(j + 1, pts.length - 1)])) <= lim;
        if (!near) continue;
      }
      return i;
    }
    return -1;
  }
  function handlePos(op) { var b = bbox(op, dw, dh), m = 6 / vz; return toScreen(op, { x: b.x + b.w + m, y: b.y + b.h + m }); }
  function opCenter(op) { var c = center(bbox(op, dw, dh)); return { x: c.x + (op.dx || 0) * dw, y: c.y + (op.dy || 0) * dh }; }
  function startGesture(type, p, pre) {
    var op = st.ops[selected];
    gesture = { type: type, p0: p, t0: Date.now(), moved: false, pre: pre || clone(st), dx: op.dx || 0, dy: op.dy || 0, s: op.s || 1, rot: op.rot || 0 };
    if (type === 'handle') { gesture.c = opCenter(op); gesture.v0 = { x: p.x - gesture.c.x, y: p.y - gesture.c.y }; }
  }
  function setScaleRot(op, s, rot) { op.s = Math.max(0.1, Math.min(20, s)); if (!AREA[op.type]) op.rot = rot; }
  // Mover (con imán al centro de la foto y su guía, si se pidió)
  function moveOp(op, dx, dy) {
    var c = center(bbox(op, dw, dh)), lim = 7 / vz;
    guides = { v: false, h: false };
    if (cfg.snap && Math.abs(c.x + dx * dw - dw / 2) < lim) { dx = (dw / 2 - c.x) / dw; guides.v = true; }
    if (cfg.snap && Math.abs(c.y + dy * dh - dh / 2) < lim) { dy = (dh / 2 - c.y) / dh; guides.h = true; }
    op.dx = dx; op.dy = dy;
  }
  function commit(g) { if (g && g.moved && g.pre) { undoStack.push(g.pre); redoStack = []; } }
  function selecting() { return tool === 'move' || tool === 'text'; }

  /* ----- Cuentagotas: el color de la foto (con lo dibujado encima), promedio de 5x5 ----- */
  function pickAt(t) {
    var x = Math.round(t.clientX * dpr) - 2, y = Math.round(t.clientY * dpr) - 2;
    var a = bctx.getImageData(x, y, 5, 5).data, b = dctx.getImageData(x, y, 5, 5).data, r = 0, g = 0, bl = 0, n = 0;
    for (var i = 0; i < a.length; i += 4) {
      var al = b[i + 3] / 255;
      r += b[i] * al + a[i] * (1 - al); g += b[i + 1] * al + a[i + 1] * (1 - al); bl += b[i + 2] * al + a[i + 2] * (1 - al); n++;
    }
    post({ type: 'pick', color: toHex(r / n, g / n, bl / n) });
  }

  /* ----- Toques ----- */
  function rel(t) { return { x: (t.clientX - ox - vx) / vz, y: (t.clientY - oy - vy) / vz }; }
  function norm(p) { return { x: Math.min(1, Math.max(0, p.x / dw)), y: Math.min(1, Math.max(0, p.y / dh)) }; }
  function pinchInfo(e, screen) {
    var t0 = e.touches[0], t1 = e.touches[1];
    var A = screen ? { x: t0.clientX, y: t0.clientY } : rel(t0), B = screen ? { x: t1.clientX, y: t1.clientY } : rel(t1);
    return { d: Math.max(1, Math.hypot(B.x - A.x, B.y - A.y)), a: Math.atan2(B.y - A.y, B.x - A.x), m: { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 } };
  }
  document.addEventListener('touchstart', function (e) {
    if (!img) return;
    if (e.touches.length === 2) {
      cur = null;
      if (tool === 'crop') { sel = null; showSel(); }
      if (selected >= 0 && selecting()) {
        // Dos dedos sobre lo seleccionado: escalar, girar y mover a la vez
        var pre = gesture && gesture.pre ? gesture.pre : null, pi = pinchInfo(e);
        startGesture('pinch', pi.m, pre);
        gesture.d0 = pi.d; gesture.a0 = pi.a; gesture.m0 = pi.m;
      } else {
        // Dos dedos sin selección: zoom de la vista (y moverla)
        var ps = pinchInfo(e, true);
        gesture = { type: 'view', d0: ps.d, m0: ps.m, z0: vz, vx0: vx, vy0: vy };
      }
      render(); return;
    }
    if (e.touches.length !== 1) return;
    var p = rel(e.touches[0]);
    if (tool === 'picker') { pickAt(e.touches[0]); return; }
    if (tool === 'crop') { var n = norm(p); sel = { a: n, b: n }; showSel(); return; }
    if (tool === 'fill') { gesture = { type: 'fillTap', p0: p, t0: Date.now() }; return; }
    if (selecting()) {
      var op = st.ops[selected];
      if (op && Math.hypot(p.x - handlePos(op).x, p.y - handlePos(op).y) <= (HANDLE + 8) / vz) { startGesture('handle', p); return; }
      var hit = hitTest(p, tool === 'text'), was = hit >= 0 && hit === selected;
      if (hit >= 0) { selected = hit; startGesture('drag', p); gesture.was = was; }
      else { selected = -1; gesture = { type: 'tap', p0: p, t0: Date.now(), s0: { x: e.touches[0].clientX, y: e.touches[0].clientY }, vx0: vx, vy0: vy }; }
      emit(); render(); return;
    }
    if (!FREE[tool] && !LINEAR[tool] && !CLOSED[tool] && !AREA[tool]) return;
    var np = norm(p), w = (tool === 'highlighter' ? style.width * 2.5 : style.width) / vz / U(dw, dh);
    if (AREA[tool]) cur = { type: tool, a: np, b: np, block: 14 / vz / U(dw, dh) };
    else if (FREE[tool]) cur = { type: tool, color: style.color, width: w, dash: tool === 'pencil' ? style.dash : 'solid', points: [np] };
    else cur = { type: tool, color: style.color, width: w, fill: CLOSED[tool] ? style.fill : 'none', dash: style.dash, a: np, b: np };
    render();
  }, { passive: false });

  document.addEventListener('touchmove', function (e) {
    if (!img) return;
    e.preventDefault();
    if (gesture && gesture.type === 'view') {
      if (e.touches.length < 2) return;
      // El punto de la foto que había entre los dedos se queda entre los dedos
      var ps = pinchInfo(e, true), z = Math.max(1, Math.min(cfg.maxZoom || 8, gesture.z0 * ps.d / gesture.d0));
      var cx = (gesture.m0.x - ox - gesture.vx0) / gesture.z0, cy = (gesture.m0.y - oy - gesture.vy0) / gesture.z0;
      vz = z; vx = ps.m.x - ox - cx * z; vy = ps.m.y - oy - cy * z; clampView();
      renderBase(); render(); showSel(); return;
    }
    var p = rel(e.touches[0]);
    if (tool === 'crop') { if (sel) { sel.b = norm(p); showSel(); } return; }
    if (gesture) {
      if (gesture.type === 'tap' || gesture.type === 'fillTap') {
        // Con zoom, arrastrar en un hueco (herramienta mover) mueve la vista
        if (gesture.type === 'tap' && tool === 'move' && vz > 1) {
          vx = gesture.vx0 + e.touches[0].clientX - gesture.s0.x; vy = gesture.vy0 + e.touches[0].clientY - gesture.s0.y; clampView();
          renderBase(); render(); return;
        }
        if (Math.abs(p.x - gesture.p0.x) + Math.abs(p.y - gesture.p0.y) > 10 / vz) gesture = null;
        return;
      }
      var op = st.ops[selected];
      if (!op) return;
      if (gesture.type === 'pinch' && e.touches.length >= 2) {
        var pi = pinchInfo(e);
        setScaleRot(op, gesture.s * pi.d / gesture.d0, gesture.rot + pi.a - gesture.a0);
        moveOp(op, gesture.dx + (pi.m.x - gesture.m0.x) / dw, gesture.dy + (pi.m.y - gesture.m0.y) / dh);
        gesture.moved = true;
      } else if (gesture.type === 'drag' && e.touches.length === 1) {
        if (!gesture.moved && Math.abs(p.x - gesture.p0.x) + Math.abs(p.y - gesture.p0.y) < 6 / vz) return;
        gesture.moved = true;
        moveOp(op, gesture.dx + (p.x - gesture.p0.x) / dw, gesture.dy + (p.y - gesture.p0.y) / dh);
      } else if (gesture.type === 'handle') {
        var v = { x: p.x - gesture.c.x, y: p.y - gesture.c.y }, l0 = Math.max(1, Math.hypot(gesture.v0.x, gesture.v0.y));
        setScaleRot(op, gesture.s * Math.hypot(v.x, v.y) / l0, gesture.rot + Math.atan2(v.y, v.x) - Math.atan2(gesture.v0.y, gesture.v0.x));
        gesture.moved = true;
      }
      render(); return;
    }
    if (!cur) return;
    var np = norm(p);
    if (cur.points) {
      var last = cur.points[cur.points.length - 1];
      if ((Math.abs(last.x - np.x) * dw + Math.abs(last.y - np.y) * dh) * vz < 1.5) return; // puntos casi iguales: fuera
      cur.points.push(np);
    } else cur.b = np;
    render();
  }, { passive: false });

  // Ramer-Douglas-Peucker: quita los puntos que no cambian la forma del trazo (más ligero y más suave)
  function simplify(pts, tol) {
    if (pts.length < 3) return pts;
    var keep = []; keep[0] = keep[pts.length - 1] = true;
    var stack = [[0, pts.length - 1]];
    while (stack.length) {
      var seg = stack.pop(), a = seg[0], b = seg[1], best = 0, idx = -1;
      for (var i = a + 1; i < b; i++) { var d = segDist(sp(pts[i]), sp(pts[a]), sp(pts[b])); if (d > best) { best = d; idx = i; } }
      if (best > tol) { keep[idx] = true; stack.push([a, idx], [idx, b]); }
    }
    return pts.filter(function (p, i) { return keep[i]; });
  }

  function onEnd(e) {
    if (!img) return;
    if (gesture && gesture.type === 'view') { if (e.touches.length < 2) { gesture = null; emit(); } return; }
    if (tool === 'crop') { var r = selRect(); if (r && (r.w < 0.02 || r.h < 0.02)) sel = null; showSel(); emit(); return; }
    if (gesture) {
      if (gesture.type === 'pinch' && e.touches.length === 1) { commit(gesture); gesture = null; guides = null; render(); emit(); return; }
      if (e.touches.length) return;
      var g = gesture, op = st.ops[selected];
      gesture = null; guides = null;
      if (g.type === 'fillTap') {
        // Bote: un toque dentro de la foto rellena esa zona
        if (g.p0.x >= 0 && g.p0.y >= 0 && g.p0.x <= dw && g.p0.y <= dh) {
          var q = norm(g.p0);
          change(function () { st.ops.push({ type: 'fill', x: q.x, y: q.y, color: style.color, mode: style.fillMode }); });
        }
      } else if (g.type === 'tap') {
        // Texto: un toque en un hueco escribe uno nuevo ahí
        if (tool === 'text' && Date.now() - g.t0 < 400) post({ type: 'newText', x: norm(g.p0).x, y: norm(g.p0).y });
      } else if (g.type === 'drag' && !g.moved && op && op.type === 'text' && (g.was || tool === 'text')) {
        // Un toque en un texto (ya seleccionado, o con la herramienta de texto): editarlo
        window.__editSelected();
      }
      commit(g); render(); emit(); return;
    }
    if (!cur || e.touches.length) return;
    var item = cur; cur = null;
    if (item.points) item.points = simplify(item.points, 0.75 / vz);
    var lim = (AREA[item.type] ? 8 : 3) / vz, small = item.a && Math.abs(item.a.x - item.b.x) * dw < lim && Math.abs(item.a.y - item.b.y) * dh < lim;
    if (!small) change(function () { st.ops.push(item); });
    render(); emit();
  }
  document.addEventListener('touchend', onEnd);
  document.addEventListener('touchcancel', function () { cur = null; if (gesture) { commit(gesture); gesture = null; guides = null; } render(); emit(); });

  /* ----- Desde React Native ----- */
  window.__load = function (source) {
    var next = new Image();
    next.onload = function () {
      img = next; work = null; workKey = ''; st = { rot: 0, crop: { x: 0, y: 0, w: 1, h: 1 }, adjust: {}, ops: [] }; undoStack = []; redoStack = [];
      sel = null; selected = -1; editing = -1; vz = 1; vx = 0; vy = 0; fillCache = {}; fillKeys = [];
      layout(); emit(); post({ type: 'loaded', width: img.naturalWidth, height: img.naturalHeight });
    };
    next.onerror = function () { post({ type: 'error', message: 'No se pudo abrir la imagen' }); };
    next.src = source;
  };
  window.__setTool = function (t) { tool = t; if (t !== 'crop') { sel = null; showSel(); } if (!selecting()) selected = -1; render(); emit(); };
  // Con algo seleccionado, el color / grosor / estilo se aplica a eso (además de quedar para lo siguiente)
  function toSelected(fn) {
    var op = st.ops[selected];
    if (!op || !selecting()) return;
    change(function () { fn(op); }); render(); emit();
  }
  window.__setColor = function (c) { style.color = c; toSelected(function (op) { if (op.color != null) op.color = c; }); };
  window.__setWidth = function (w) { style.width = w; toSelected(function (op) { if (op.width != null && op.type !== 'eraser') op.width = (op.type === 'highlighter' ? w * 2.5 : w) / U(dw, dh) / (op.s || 1); }); };
  window.__setStyle = function (o) {
    if (o.fill) style.fill = o.fill;
    if (o.dash) style.dash = o.dash;
    if (o.fillMode) style.fillMode = o.fillMode;
    toSelected(function (op) { if (o.fill && CLOSED[op.type]) op.fill = o.fill; if (o.dash && op.dash != null && op.type !== 'highlighter') op.dash = o.dash; });
  };
  // Dónde poner lo nuevo si no se dice: el centro de lo que se ve (con zoom, no el de la foto)
  function viewCenter() { return { x: Math.min(1, Math.max(0, (innerWidth / 2 - ox - vx) / vz / dw)), y: Math.min(1, Math.max(0, (innerHeight / 2 - oy - vy) / vz / dh)) }; }
  window.__addText = function (o) {
    if (!img || !o || !o.text) return;
    var c = viewCenter();
    var op = { type: 'text', text: o.text, color: o.color || style.color, bg: o.bg || 'none', font: o.font, fontId: o.fontId, weight: o.weight || 700, align: o.align || 'center',
      size: (o.px || 30) / vz / U(dw, dh), x: o.x == null ? c.x : o.x, y: o.y == null ? c.y : o.y, dx: 0, dy: 0, s: 1, rot: 0 };
    change(function () { st.ops.push(op); });
    selected = st.ops.length - 1; render(); emit();
  };
  // Stickers: la imagen se guarda aparte (en el estado solo va su id: deshacer no copia imágenes)
  window.__addSticker = function (o) {
    if (!img || !o || !o.src) return;
    function add(im) {
      var c = viewCenter(), w = (o.px || 120) / vz;
      var op = { type: 'sticker', id: o.id, aspect: im.naturalHeight / Math.max(1, im.naturalWidth), size: w / U(dw, dh), x: c.x, y: c.y, dx: 0, dy: 0, s: 1, rot: 0 };
      change(function () { st.ops.push(op); });
      selected = st.ops.length - 1; render(); emit();
    }
    if (stickers[o.id]) return add(stickers[o.id]);
    var im = new Image();
    im.onload = function () { stickers[o.id] = im; add(im); };
    im.onerror = function () { post({ type: 'stickerError', id: o.id }); };
    im.src = o.src;
  };
  window.__updateText = function (i, o) {
    var op = st.ops[i]; editing = -1;
    if (op) {
      if (!o || !o.text) { change(function () { st.ops.splice(i, 1); }); selected = -1; }
      else change(function () { ['text', 'color', 'bg', 'font', 'fontId', 'weight', 'align'].forEach(function (k) { if (o[k] != null) op[k] = o[k]; }); });
    }
    render(); emit();
  };
  window.__editSelected = function () {
    var op = st.ops[selected];
    if (!op || op.type !== 'text') return;
    editing = selected; render();
    post({ type: 'editText', index: selected, op: { text: op.text, color: op.color, bg: op.bg, font: op.fontId, align: op.align } });
  };
  window.__endEdit = function () { editing = -1; render(); emit(); };
  window.__select = function (i) { selected = st.ops[i] ? i : -1; render(); emit(); };
  window.__deleteSelected = function () { if (selected < 0) return; var i = selected; change(function () { st.ops.splice(i, 1); }); selected = -1; render(); emit(); };
  window.__duplicate = function () {
    var op = st.ops[selected]; if (!op) return;
    var copy = clone(op); copy.dx = (op.dx || 0) + 0.04; copy.dy = (op.dy || 0) + 0.04;
    change(function () { st.ops.push(copy); }); selected = st.ops.length - 1; render(); emit();
  };
  // Ajustes: __setAdjust cambia el estado al momento y rehace la foto en el siguiente fotograma (al arrastrar un
  // control llegan muchos); __adjustBegin / __adjustEnd agrupan un arrastre en un solo paso de deshacer
  window.__adjustBegin = function () { if (!adjPre) adjPre = clone(st); };
  window.__setAdjust = function (a) {
    st.adjust = a || {};
    if (adjFrame) return;
    adjFrame = true;
    requestAnimationFrame(function () { adjFrame = false; refreshImage(); });
  };
  window.__adjustEnd = function () {
    if (adjPre && JSON.stringify(adjPre.adjust) !== JSON.stringify(st.adjust)) { undoStack.push(adjPre); redoStack = []; }
    adjPre = null; refreshImage(); emit();
  };
  window.__resetZoom = function () { vz = 1; clampView(); renderBase(); render(); showSel(); emit(); };
  window.__undo = function () { if (!undoStack.length) return; redoStack.push(clone(st)); st = undoStack.pop(); sel = null; selected = -1; editing = -1; layout(); emit(); };
  window.__redo = function () { if (!redoStack.length) return; undoStack.push(clone(st)); st = redoStack.pop(); sel = null; selected = -1; editing = -1; layout(); emit(); };
  window.__clear = function () { if (!st.ops.length) return; change(function () { st.ops = []; }); selected = -1; render(); emit(); };
  // Exporta a la resolución de la imagen (o con su lado mayor a maxSize), con los ajustes aplicados a esa resolución
  window.__export = function (o) {
    try {
      var c = cropPx(), k = o.maxSize ? Math.min(1, o.maxSize / Math.max(c.w, c.h)) : 1;
      var W = Math.max(1, Math.round(c.w * k)), H = Math.max(1, Math.round(c.h * k));
      var out = document.createElement('canvas'); out.width = W; out.height = H;
      var octx = out.getContext('2d');
      if (o.format === 'jpeg') { octx.fillStyle = '#fff'; octx.fillRect(0, 0, W, H); }
      drawImageTo(octx, W, H, img);
      if (!neutral(st.adjust)) { var data = octx.getImageData(0, 0, W, H); adjustPixels(data.data, st.adjust); octx.putImageData(data, 0, 0); }
      vignette(octx, W, H);
      // Los elementos en su propia capa: la goma solo borra lo dibujado, no la foto (y las zonas pixeladas salen de la foto)
      var layer = document.createElement('canvas'); layer.width = W; layer.height = H;
      var lctx = layer.getContext('2d');
      st.ops.forEach(function (op, i) { drawOp(lctx, op, W, H, out, i); });
      octx.drawImage(layer, 0, 0);
      post({ type: 'export', id: o.id, dataUri: out.toDataURL(o.format === 'jpeg' ? 'image/jpeg' : 'image/png', o.quality), width: W, height: H });
    } catch (err) { post({ type: 'export', id: o.id, error: String(err && err.message || err) }); }
  };
  // Una copia del estado y las funciones puras (para depurar y para las pruebas)
  window.__state = function () { return { st: clone(st), selected: selected, tool: tool, dw: dw, dh: dh, zoom: vz, vx: vx, vy: vy, ox: ox, oy: oy }; };
  window.__pure = { flood: flood, grow: grow, adjustPixels: adjustPixels };
  window.addEventListener('resize', layout);
  post({ type: 'ready' });
})();`;
/* ---------------- Botones ---------------- */
const ToolButton = ({ icon, active, disabled, onPress, label, color = 'white', activeBg = 'rgba(255,255,255,0.18)' }) => (<react_native_1.Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ selected: !!active, disabled: !!disabled }} hitSlop={4} style={({ pressed }) => ({ width: 38, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: active ? activeBg : 'transparent', opacity: disabled ? 0.35 : pressed ? 0.6 : 1 })}>
        <Icon_1.Icon as="MaterialCommunityIcons" name={icon} size={22} color={color}/>
    </react_native_1.Pressable>);
const Separator = () => <react_native_1.View style={{ width: 1, height: 22, backgroundColor: '#444', marginHorizontal: 4 }}/>;
const MENU_ICON = '#1f2937';
const MENU_ACTIVE = '#e5e7eb';
const fontFamilyOf = (f) => (f ? react_native_1.Platform.select({ ios: f.ios, android: f.android, default: undefined }) : undefined);
/** Control deslizante de un ajuste (-100 a 100), con marca en el 0 */
const AdjustSlider = ({ value, onStart, onChange, onEnd }) => {
    const width = (0, react_1.useRef)(1);
    const start = (0, react_1.useRef)({ x: 0, v: 0 });
    const clamp = (v) => Math.round(Math.max(-100, Math.min(100, v)));
    return (<react_native_1.View accessibilityRole="adjustable" accessibilityValue={{ min: -100, max: 100, now: value }} onLayout={e => { width.current = Math.max(1, e.nativeEvent.layout.width); }} onStartShouldSetResponder={() => true} onMoveShouldSetResponder={() => true} onResponderTerminationRequest={() => false} onResponderGrant={e => {
            // Tocar en un punto lleva el valor ahí; arrastrar lo mueve desde ahí
            const v = clamp(-100 + Math.max(0, Math.min(1, e.nativeEvent.locationX / width.current)) * 200);
            start.current = { x: e.nativeEvent.pageX, v };
            onStart();
            onChange(v);
        }} onResponderMove={e => onChange(clamp(start.current.v + (e.nativeEvent.pageX - start.current.x) / width.current * 200))} onResponderRelease={onEnd} onResponderTerminate={onEnd} style={{ height: 36, justifyContent: 'center', marginHorizontal: 18 }}>
            <react_native_1.View pointerEvents="none" style={{ height: 3, borderRadius: 2, backgroundColor: '#555' }}/>
            <react_native_1.View pointerEvents="none" style={{ position: 'absolute', left: '50%', marginLeft: -1, width: 2, height: 12, backgroundColor: '#888' }}/>
            <react_native_1.View pointerEvents="none" style={{ position: 'absolute', left: `${(value + 100) / 2}%`, marginLeft: -10, width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff' }}/>
        </react_native_1.View>);
};
const BG_ORDER = ['none', 'outline', 'solid', 'soft'];
const BG_ICON = { none: 'format-text', outline: 'alpha-a-box-outline', solid: 'alpha-a-box', soft: 'format-color-fill' };
const ALIGN_ORDER = ['center', 'left', 'right'];
const TextComposer = ({ initial, colors, fonts, top, onDone, onCancel }) => {
    var _a, _b;
    const [v, setV] = (0, react_1.useState)(initial);
    const set = (patch) => setV(prev => (Object.assign(Object.assign({}, prev), patch)));
    const font = (_a = fonts.find(f => f.id === v.font)) !== null && _a !== void 0 ? _a : fonts[0];
    const textColor = v.bg === 'solid' ? readable(v.color) : v.color;
    return (<react_native_1.View style={[react_native_1.StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.72)', paddingTop: top + 4 }]}>
            <react_native_1.View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 6 }}>
                <ToolButton icon="close" label={(0, translate_1.libT)('cancel')} onPress={onCancel}/>
                <react_native_1.View style={{ flexDirection: 'row', gap: 6 }}>
                    <ToolButton icon={`format-align-${v.align}`} label={`align-${v.align}`} onPress={() => set({ align: ALIGN_ORDER[(ALIGN_ORDER.indexOf(v.align) + 1) % 3] })}/>
                    <ToolButton icon={BG_ICON[v.bg]} label={`bg-${v.bg}`} active={v.bg !== 'none'} onPress={() => set({ bg: BG_ORDER[(BG_ORDER.indexOf(v.bg) + 1) % 4] })}/>
                </react_native_1.View>
                <ToolButton icon="check" label={(0, translate_1.libT)('done')} color="#22c55e" onPress={() => onDone(v)}/>
            </react_native_1.View>
            <react_native_1.ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="always" style={{ flexGrow: 0 }} contentContainerStyle={{ gap: 8, paddingHorizontal: 12, paddingVertical: 8 }}>
                {fonts.map(f => {
            var _a;
            return (<react_native_1.Pressable key={f.id} onPress={() => set({ font: f.id })} accessibilityRole="button" accessibilityLabel={`font-${f.id}`} accessibilityState={{ selected: f.id === font.id }} style={{ paddingHorizontal: 12, height: 32, borderRadius: 16, justifyContent: 'center', backgroundColor: f.id === font.id ? '#ffffff' : 'rgba(255,255,255,0.15)' }}>
                        <Text_1.Text style={{ fontFamily: fontFamilyOf(f), fontWeight: String((_a = f.weight) !== null && _a !== void 0 ? _a : 700), color: f.id === font.id ? '#111' : '#fff', fontSize: 14 }}>{f.label}</Text_1.Text>
                    </react_native_1.Pressable>);
        })}
            </react_native_1.ScrollView>
            <react_native_1.ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="always" style={{ flexGrow: 0 }} contentContainerStyle={{ gap: 10, paddingHorizontal: 12, paddingBottom: 8 }}>
                {colors.map(c => (<react_native_1.Pressable key={c} onPress={() => set({ color: c })} accessibilityRole="button" accessibilityLabel={c} style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: c, borderWidth: c === v.color ? 3 : 1.5, borderColor: c === v.color ? '#3b82f6' : '#fff' }}/>))}
            </react_native_1.ScrollView>
            {/* Arriba (y no centrado): así no lo tapa el teclado */}
            <react_native_1.View style={{ paddingHorizontal: 16, paddingTop: 24, alignItems: v.align === 'left' ? 'flex-start' : v.align === 'right' ? 'flex-end' : 'center' }}>
                <react_native_1.TextInput value={v.text} onChangeText={text => set({ text })} multiline autoFocus placeholder={(0, translate_1.libT)('typeText')} placeholderTextColor="rgba(255,255,255,0.55)" accessibilityLabel="text" style={Object.assign({ fontSize: TEXT_PX, color: textColor, textAlign: v.align, fontFamily: fontFamilyOf(font), fontWeight: String((_b = font.weight) !== null && _b !== void 0 ? _b : 700), backgroundColor: v.bg === 'solid' ? v.color : v.bg === 'soft' ? 'rgba(0,0,0,0.55)' : 'transparent', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, minWidth: 40, maxWidth: '100%' }, (v.bg === 'outline' ? { textShadowColor: readable(v.color), textShadowRadius: 4, textShadowOffset: { width: 0, height: 0 } } : null))}/>
            </react_native_1.View>
        </react_native_1.View>);
};
/**
 * Editor de imágenes: dibujar, textos, stickers, relleno, pixelar, ajustes y filtros, seleccionar y mover, zoom, girar
 * y recortar. Necesita react-native-webview (dependencia opcional)
 * @example <ImageEditor source={foto.uri} onSave={r => subir(r.dataUri)} onCancel={volver} />
 * @example const r = await openImageEditor(foto.uri); if (r) guardar(r.base64);
 */
exports.ImageEditor = (0, react_1.forwardRef)((rawProps, ref) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    // Defaults → theme.components.ImageEditor → variante → props → plataforma
    const [p] = (0, useThemeProps_1.useThemeProps)('ImageEditor', rawProps);
    const { source, tools: toolsProp = exports.IMAGE_EDITOR_TOOLS, rotate = true, crop = true, adjust: adjustProp = true, filters = exports.IMAGE_EDITOR_FILTERS, eyedropper = true, snapGuides = false, maxZoom = 8, colors = COLORS, lineWidths = LINE_WIDTHS, fonts = exports.IMAGE_EDITOR_FONTS, stickers = [], defaultTool = toolsProp.includes('pencil') ? 'pencil' : (_a = toolsProp[0]) !== null && _a !== void 0 ? _a : 'pencil', defaultColor = '#ef4444', defaultLineWidth = 6, format = 'jpeg', quality = 0.9, maxSize, onSave, onCancel, backgroundColor = '#111', _toolbar, variant: _v } = p, boxProps = __rest(p, ["source", "tools", "rotate", "crop", "adjust", "filters", "eyedropper", "snapGuides", "maxZoom", "colors", "lineWidths", "fonts", "stickers", "defaultTool", "defaultColor", "defaultLineWidth", "format", "quality", "maxSize", "onSave", "onCancel", "backgroundColor", "_toolbar", "variant"]);
    // Sin stickers no hay botón de stickers
    const tools = stickers.length ? toolsProp : toolsProp.filter(t => t !== 'sticker');
    const adjustKeys = adjustProp === true ? exports.IMAGE_EDITOR_ADJUSTMENTS : adjustProp || [];
    const WebView = (0, webview_1.loadWebView)();
    const insets = (0, react_native_safe_area_context_1.useSafeAreaInsets)();
    const web = (0, react_1.useRef)(null);
    const ready = (0, react_1.useRef)(false);
    const queue = (0, react_1.useRef)([]);
    const run = (js) => { var _a; const code = `${js};true;`; if (ready.current)
        (_a = web.current) === null || _a === void 0 ? void 0 : _a.injectJavaScript(code);
    else
        queue.current.push(code); };
    const [tool, setToolState] = (0, react_1.useState)(defaultTool);
    const prevTool = (0, react_1.useRef)(defaultTool);
    const [color, setColor] = (0, react_1.useState)(defaultColor);
    const [lineWidth, setLineWidth] = (0, react_1.useState)(defaultLineWidth);
    const [shapeStyle, setShapeStyle] = (0, react_1.useState)({ fill: 'none', dash: 'solid', fillMode: 'drawing' });
    const [state, setState] = (0, react_1.useState)({ canUndo: false, canRedo: false, hasSelection: false, changed: false, selected: null, zoom: 1 });
    const [adjust, setAdjustState] = (0, react_1.useState)({});
    const [adjustKey, setAdjustKey] = (0, react_1.useState)((_b = adjustKeys[0]) !== null && _b !== void 0 ? _b : 'brightness');
    const adjusting = (0, react_1.useRef)(false);
    const [status, setStatus] = (0, react_1.useState)('loading');
    const [saving, setSaving] = (0, react_1.useState)(false);
    const [composer, setComposer] = (0, react_1.useState)(null);
    const lastText = (0, react_1.useRef)({ color: '#ffffff', bg: 'solid', font: (_d = (_c = fonts[0]) === null || _c === void 0 ? void 0 : _c.id) !== null && _d !== void 0 ? _d : 'sans', align: 'center' });
    const shapeTools = tools.filter(t => SHAPE_TOOLS.includes(t));
    const privacyTools = tools.filter(t => PRIVACY_TOOLS.includes(t));
    const [lastShape, setLastShape] = (0, react_1.useState)(SHAPE_TOOLS.includes(defaultTool) ? defaultTool : shapeTools.includes('arrow') ? 'arrow' : (_e = shapeTools[0]) !== null && _e !== void 0 ? _e : 'arrow');
    const [lastPrivacy, setLastPrivacy] = (0, react_1.useState)((_f = privacyTools[0]) !== null && _f !== void 0 ? _f : 'pixelate');
    const pendingExports = (0, react_1.useRef)(new Map());
    const exportId = (0, react_1.useRef)(0);
    const htmlSource = (0, react_1.useMemo)(() => ({ html: editorDocument({ tool: defaultTool, color: defaultColor, width: defaultLineWidth, bg: backgroundColor, padding: 12, snap: snapGuides, maxZoom }) }), []);
    // La imagen se pasa como data URI (también las https: así el canvas se puede exportar sin problemas de CORS)
    (0, react_1.useEffect)(() => {
        let alive = true;
        setStatus('loading');
        (0, webview_1.toDataUri)(source).then(data => { if (alive)
            run(`window.__load(${(0, webview_1.jsValue)(data)})`); }).catch(() => { if (alive)
            setStatus('error'); });
        return () => { alive = false; };
    }, [source]);
    const setTool = (t) => {
        if ((t === 'picker' || t === 'adjust') && tool !== 'picker' && tool !== 'adjust')
            prevTool.current = tool;
        setToolState(t);
        if (SHAPE_TOOLS.includes(t))
            setLastShape(t);
        if (PRIVACY_TOOLS.includes(t))
            setLastPrivacy(t);
        // Los ajustes no son una herramienta de la foto: mientras, los toques no dibujan
        run(`window.__setTool(${(0, webview_1.jsValue)(t === 'adjust' ? 'none' : t)})`);
    };
    const fontById = (id) => { var _a; return (_a = fonts.find(f => f.id === id)) !== null && _a !== void 0 ? _a : fonts[0]; };
    const textPayload = (v) => {
        var _a, _b;
        const f = fontById(v.font);
        return { text: v.text, color: v.color, bg: v.bg, align: v.align, font: (_a = f === null || f === void 0 ? void 0 : f.css) !== null && _a !== void 0 ? _a : 'sans-serif', fontId: f === null || f === void 0 ? void 0 : f.id, weight: (_b = f === null || f === void 0 ? void 0 : f.weight) !== null && _b !== void 0 ? _b : 700 };
    };
    const addText = (text, o = {}) => {
        var _a, _b;
        const v = Object.assign(Object.assign(Object.assign({}, lastText.current), o), { text });
        run(`window.__addText(${(0, webview_1.jsValue)(Object.assign(Object.assign({}, textPayload(v)), { px: (_b = (_a = o.size) !== null && _a !== void 0 ? _a : o.px) !== null && _b !== void 0 ? _b : TEXT_PX, x: o.x, y: o.y }))})`);
    };
    const openNewText = (x, y) => setComposer({ mode: 'new', x, y, initial: Object.assign(Object.assign({}, lastText.current), { text: '' }) });
    const addSticker = async (s) => {
        const uri = stickerUri(stickerOf(s).uri);
        if (!uri)
            return;
        try {
            const data = await (0, webview_1.toDataUri)(uri);
            run(`window.__addSticker(${(0, webview_1.jsValue)({ id: uri, src: data, px: STICKER_PX })})`);
            setTool('move');
        }
        catch (_a) { }
    };
    const applyAdjust = (a) => {
        setAdjustState(a);
        run('window.__adjustBegin()');
        run(`window.__setAdjust(${(0, webview_1.jsValue)(a)})`);
        run('window.__adjustEnd()');
    };
    const save = () => new Promise((resolve, reject) => {
        const id = ++exportId.current;
        pendingExports.current.set(id, { resolve, reject });
        run(`window.__export(${(0, webview_1.jsValue)({ id, format, quality, maxSize })})`);
    });
    const rotateTo = (dir = 'right') => run(`window.__rotate(${dir === 'left' ? -1 : 1})`);
    (0, react_1.useImperativeHandle)(ref, () => ({
        save, setTool, rotate: rotateTo, undo: () => run('window.__undo()'), redo: () => run('window.__redo()'), clear: () => run('window.__clear()'),
        addText: (text, options) => { addText(text, options); setTool('move'); }, addSticker, setAdjust: applyAdjust,
        deleteSelected: () => run('window.__deleteSelected()'), resetZoom: () => run('window.__resetZoom()'),
    }));
    const onMessage = (e) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        let msg;
        try {
            msg = JSON.parse(e.nativeEvent.data);
        }
        catch (_k) {
            return;
        }
        switch (msg.type) {
            case 'ready':
                ready.current = true;
                queue.current.splice(0).forEach(code => { var _a; return (_a = web.current) === null || _a === void 0 ? void 0 : _a.injectJavaScript(code); });
                break;
            case 'loaded':
                setStatus('ready');
                break;
            case 'error':
                setStatus('error');
                break;
            case 'state':
                setState({ canUndo: msg.canUndo, canRedo: msg.canRedo, hasSelection: msg.hasSelection, changed: msg.changed, selected: (_a = msg.selected) !== null && _a !== void 0 ? _a : null, zoom: (_b = msg.zoom) !== null && _b !== void 0 ? _b : 1 });
                // Mientras se arrastra un control manda el control (si no, el valor saltaría hacia atrás)
                if (!adjusting.current && msg.adjust)
                    setAdjustState(msg.adjust);
                break;
            case 'pick':
                // Cuentagotas: el color tomado, y de vuelta a la herramienta de antes
                setColor(msg.color);
                run(`window.__setColor(${(0, webview_1.jsValue)(msg.color)})`);
                setTool(prevTool.current);
                break;
            case 'newText':
                openNewText(msg.x, msg.y);
                break;
            case 'editText':
                setComposer({ mode: 'edit', index: msg.index, initial: { text: (_c = msg.op.text) !== null && _c !== void 0 ? _c : '', color: (_d = msg.op.color) !== null && _d !== void 0 ? _d : '#ffffff', bg: (_e = msg.op.bg) !== null && _e !== void 0 ? _e : 'none', font: (_f = msg.op.font) !== null && _f !== void 0 ? _f : (_g = fonts[0]) === null || _g === void 0 ? void 0 : _g.id, align: (_h = msg.op.align) !== null && _h !== void 0 ? _h : 'center' } });
                break;
            case 'export': {
                const pending = pendingExports.current.get(msg.id);
                pendingExports.current.delete(msg.id);
                if (!pending)
                    break;
                if (msg.error)
                    pending.reject(new Error(msg.error));
                else
                    pending.resolve({ dataUri: msg.dataUri, base64: (_j = String(msg.dataUri).split(',')[1]) !== null && _j !== void 0 ? _j : '', mimeType: format === 'png' ? 'image/png' : 'image/jpeg', width: msg.width, height: msg.height });
                break;
            }
        }
    };
    const onComposerDone = (v) => {
        const c = composer;
        react_native_1.Keyboard.dismiss();
        setComposer(null);
        if (!c)
            return;
        const { text: _t } = v, rest = __rest(v, ["text"]);
        lastText.current = rest;
        if (c.mode === 'edit')
            run(`window.__updateText(${c.index},${(0, webview_1.jsValue)(v.text.trim() ? textPayload(v) : null)})`);
        else if (v.text.trim())
            addText(v.text, Object.assign(Object.assign({}, rest), { x: c.x, y: c.y }));
    };
    const onComposerCancel = () => { react_native_1.Keyboard.dismiss(); if ((composer === null || composer === void 0 ? void 0 : composer.mode) === 'edit')
        run('window.__endEdit()'); setComposer(null); };
    // Atrás (botón o gesto de Android): cierra el texto, sale de ajustes / cuentagotas / recorte o quita la selección;
    // con cambios, pide pulsar otra vez antes de descartarlos. Se vuelve a registrar al cambiar el estado: así va después
    // del Modal (los últimos en registrarse se llaman primero) y no cierra el editor perdiendo lo hecho
    const [discardHint, setDiscardHint] = (0, react_1.useState)(false);
    const armed = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => () => { if (armed.current)
        clearTimeout(armed.current); }, []);
    (0, react_1.useEffect)(() => {
        if (react_native_1.Platform.OS !== 'android')
            return;
        const sub = react_native_1.BackHandler.addEventListener('hardwareBackPress', () => {
            if (composer) {
                onComposerCancel();
                return true;
            }
            if (tool === 'adjust' || tool === 'picker') {
                setTool(prevTool.current);
                return true;
            }
            if (tool === 'crop') {
                run('window.__cancelCrop()');
                setTool(defaultTool);
                return true;
            }
            if (state.selected) {
                run('window.__select(-1)');
                return true;
            }
            if (state.changed && !armed.current) {
                setDiscardHint(true);
                armed.current = setTimeout(() => { armed.current = null; setDiscardHint(false); }, 2500);
                return true;
            }
            if (onCancel) {
                onCancel();
                return true;
            }
            return false;
        });
        return () => sub.remove();
    }, [status, composer, tool, state.selected, state.changed, onCancel]);
    const onSavePress = async () => {
        if (!onSave || saving)
            return;
        setSaving(true);
        try {
            onSave(await save());
        }
        finally {
            setSaving(false);
        }
    };
    const colorMenu = (0, react_1.useRef)(null);
    const widthMenu = (0, react_1.useRef)(null);
    const styleMenu = (0, react_1.useRef)(null);
    const shapeMenu = (0, react_1.useRef)(null);
    const privacyMenu = (0, react_1.useRef)(null);
    const stickerMenu = (0, react_1.useRef)(null);
    if (!WebView)
        return <webview_1.MissingWebView name="ImageEditor" {...boxProps}/>;
    const cropping = tool === 'crop';
    const sel = state.selected;
    const isShapeTool = SHAPE_TOOLS.includes(tool);
    const drawsLines = isShapeTool || tool === 'pencil' || tool === 'highlighter' || tool === 'eraser';
    const showColor = sel ? sel.color != null : !['eraser', 'pixelate', 'blur', 'crop', 'picker'].includes(tool);
    const showWidth = sel ? sel.hasWidth : drawsLines;
    const showStyle = sel ? sel.dashable : isShapeTool || tool === 'pencil' || tool === 'fill';
    const styleFill = sel ? (_g = sel.fill) !== null && _g !== void 0 ? _g : 'none' : shapeStyle.fill;
    const styleDash = sel ? (_h = sel.dash) !== null && _h !== void 0 ? _h : 'solid' : shapeStyle.dash;
    const styleClosed = sel ? sel.closed : CLOSED_TOOLS.includes(tool);
    const shownColor = (_j = sel === null || sel === void 0 ? void 0 : sel.color) !== null && _j !== void 0 ? _j : color;
    const barStyle = { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, backgroundColor: '#1b1b1b' };
    const hint = cropping && !state.hasSelection ? (0, translate_1.libT)('cropHint') : tool === 'picker' ? (0, translate_1.libT)('pickHint') : tool === 'fill' ? (0, translate_1.libT)('fillHint') : null;
    // Fila 1: herramientas, con las formas y las de privacidad agrupadas en un botón con menú
    const row1 = [];
    const seen = new Set();
    tools.forEach(t => {
        if (SHAPE_TOOLS.includes(t)) {
            if (seen.has('shapes'))
                return;
            seen.add('shapes');
            row1.push(<Menu_1.Menu key="shapes" ref={shapeMenu} trigger={tr => <ToolButton icon={ICONS[isShapeTool ? tool : lastShape]} label="shapes" active={isShapeTool} onPress={tr.onPress}/>}>
                    <Box_1.Box flexDir="row" flexWrap="wrap" w={4 * 42 + 16} p={2}>
                        {shapeTools.map(s => <ToolButton key={s} icon={ICONS[s]} label={s} color={MENU_ICON} activeBg={MENU_ACTIVE} active={tool === s} onPress={() => { var _a; setTool(s); (_a = shapeMenu.current) === null || _a === void 0 ? void 0 : _a.close(); }}/>)}
                    </Box_1.Box>
                </Menu_1.Menu>);
        }
        else if (PRIVACY_TOOLS.includes(t)) {
            if (seen.has('privacy'))
                return;
            seen.add('privacy');
            const active = PRIVACY_TOOLS.includes(tool);
            row1.push(<Menu_1.Menu key="privacy" ref={privacyMenu} trigger={tr => <ToolButton icon={ICONS[active ? tool : lastPrivacy]} label="privacy" active={active} onPress={tr.onPress}/>}>
                    {privacyTools.map(s => (<react_native_1.Pressable key={s} onPress={() => { var _a; setTool(s); (_a = privacyMenu.current) === null || _a === void 0 ? void 0 : _a.close(); }} accessibilityRole="button" accessibilityLabel={s} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: tool === s ? MENU_ACTIVE : 'transparent' }}>
                            <Icon_1.Icon as="MaterialCommunityIcons" name={ICONS[s]} size={20} color={MENU_ICON}/>
                            <Text_1.Text>{(0, translate_1.libT)(s === 'pixelate' ? 'pixelate' : 'blur')}</Text_1.Text>
                        </react_native_1.Pressable>))}
                </Menu_1.Menu>);
        }
        else if (t === 'sticker') {
            row1.push(<Menu_1.Menu key="sticker" ref={stickerMenu} trigger={tr => <ToolButton icon={ICONS.sticker} label="sticker" onPress={tr.onPress}/>}>
                    <react_native_1.ScrollView style={{ maxHeight: 260 }} contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', width: 4 * 64 + 16, padding: 8 }}>
                        {stickers.map((s, i) => {
                    var _a, _b;
                    const o = stickerOf(s);
                    return (<react_native_1.Pressable key={i} onPress={() => { var _a; (_a = stickerMenu.current) === null || _a === void 0 ? void 0 : _a.close(); addSticker(s); }} accessibilityRole="button" accessibilityLabel={(_a = o.label) !== null && _a !== void 0 ? _a : `sticker-${i}`} style={({ pressed }) => ({ width: 64, height: 64, padding: 6, opacity: pressed ? 0.5 : 1 })}>
                                    <react_native_1.Image source={{ uri: stickerUri((_b = o.thumbnail) !== null && _b !== void 0 ? _b : o.uri) }} style={{ width: '100%', height: '100%' }} resizeMode="contain"/>
                                </react_native_1.Pressable>);
                })}
                    </react_native_1.ScrollView>
                </Menu_1.Menu>);
        }
        else if (t === 'text') {
            row1.push(<ToolButton key="text" icon={ICONS.text} label="text" active={tool === 'text'} onPress={() => { setTool('text'); openNewText(); }}/>);
        }
        else {
            row1.push(<ToolButton key={t} icon={ICONS[t]} label={t} active={tool === t} onPress={() => setTool(t)}/>);
        }
    });
    return (<Box_1.Box flex={1} style={{ backgroundColor }} {...boxProps}>
            {/* Arriba: cancelar, deshacer / rehacer (y quitar el zoom) y guardar */}
            <react_native_1.View style={[barStyle, { paddingTop: insets.top + 4, paddingBottom: 4, justifyContent: 'space-between' }]}>
                {onCancel ? <ToolButton icon="close" label={(0, translate_1.libT)('cancel')} onPress={onCancel}/> : <react_native_1.View style={{ width: 40 }}/>}
                <react_native_1.View style={{ flexDirection: 'row', gap: 4 }}>
                    <ToolButton icon="undo" label="undo" disabled={!state.canUndo} onPress={() => run('window.__undo()')}/>
                    <ToolButton icon="redo" label="redo" disabled={!state.canRedo} onPress={() => run('window.__redo()')}/>
                    {state.zoom > 1.01 && <ToolButton icon="magnify-minus-outline" label="resetZoom" onPress={() => run('window.__resetZoom()')}/>}
                </react_native_1.View>
                {onSave
            ? (saving ? <react_native_1.View style={{ width: 40, alignItems: 'center' }}><Spinner_1.Spinner color={'white'}/></react_native_1.View>
                : <ToolButton icon="check" label={(0, translate_1.libT)('done')} color="#22c55e" disabled={status !== 'ready'} onPress={onSavePress}/>)
            : <react_native_1.View style={{ width: 40 }}/>}
            </react_native_1.View>

            <react_native_1.View style={{ flex: 1 }}>
                <WebView ref={web} originWhitelist={['*']} source={htmlSource} onMessage={onMessage} style={{ flex: 1, backgroundColor }} containerStyle={{ backgroundColor }} scrollEnabled={false} bounces={false} overScrollMode="never" setSupportMultipleWindows={false} javaScriptEnabled/>
                {status !== 'ready' && (<react_native_1.View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
                        {status === 'loading' ? <Spinner_1.Spinner color={'white'}/> : <Text_1.Text color="white">{(0, translate_1.libT)('loadError')}</Text_1.Text>}
                    </react_native_1.View>)}
            </react_native_1.View>

            <Box_1.Box style={[barStyle, { paddingBottom: insets.bottom + 6, paddingTop: 6 }]} {..._toolbar}>
                {tool === 'adjust' ? (
        // Ajustes: filtros, el control del ajuste elegido y la lista de ajustes
        <react_native_1.View style={{ flex: 1, gap: 4 }}>
                        {filters.length > 0 && (<react_native_1.ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingHorizontal: 6 }}>
                                {filters.map(f => {
                    const active = sameAdjust(adjust, f.adjust);
                    return (<react_native_1.Pressable key={f.id} onPress={() => applyAdjust(Object.assign({}, f.adjust))} accessibilityRole="button" accessibilityLabel={`filter-${f.id}`} accessibilityState={{ selected: active }} style={{ paddingHorizontal: 12, height: 28, borderRadius: 14, justifyContent: 'center', backgroundColor: active ? '#fff' : 'rgba(255,255,255,0.12)' }}>
                                            <Text_1.Text fontSize={13} style={{ color: active ? '#111' : '#fff' }}>{f.label}</Text_1.Text>
                                        </react_native_1.Pressable>);
                })}
                            </react_native_1.ScrollView>)}
                        {adjustKeys.length > 0 && (<react_native_1.View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text_1.Text fontSize={12} style={{ color: '#ccc', width: 96, paddingLeft: 10 }} numberOfLines={1}>{`${(0, translate_1.libT)(adjustKey)} ${(_k = adjust[adjustKey]) !== null && _k !== void 0 ? _k : 0}`}</Text_1.Text>
                                <react_native_1.View style={{ flex: 1 }}>
                                    <AdjustSlider value={(_l = adjust[adjustKey]) !== null && _l !== void 0 ? _l : 0} onStart={() => { adjusting.current = true; run('window.__adjustBegin()'); }} onChange={v => { const next = Object.assign(Object.assign({}, adjust), { [adjustKey]: v }); setAdjustState(next); run(`window.__setAdjust(${(0, webview_1.jsValue)(next)})`); }} onEnd={() => { adjusting.current = false; run('window.__adjustEnd()'); }}/>
                                </react_native_1.View>
                            </react_native_1.View>)}
                        {/* Los ajustes (con scroll) y, siempre a la vista, restablecer y cerrar */}
                        <react_native_1.View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <react_native_1.ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }} contentContainerStyle={{ alignItems: 'center', gap: 2, paddingHorizontal: 4 }}>
                                {adjustKeys.map(k => (<react_native_1.View key={k}>
                                        <ToolButton icon={ADJUST_ICONS[k]} label={k} active={adjustKey === k} onPress={() => setAdjustKey(k)}/>
                                        {!!adjust[k] && <react_native_1.View pointerEvents="none" style={{ position: 'absolute', bottom: 2, left: 17, width: 4, height: 4, borderRadius: 2, backgroundColor: '#3b82f6' }}/>}
                                    </react_native_1.View>))}
                            </react_native_1.ScrollView>
                            <Separator />
                            <ToolButton icon="restore" label="resetAdjust" disabled={sameAdjust(adjust, {})} onPress={() => applyAdjust({})}/>
                            <ToolButton icon="check" label="closeAdjust" color="#22c55e" onPress={() => setTool(prevTool.current)}/>
                        </react_native_1.View>
                    </react_native_1.View>) : cropping && state.hasSelection ? (
        // Mismo alto que las dos filas: así la imagen no salta al empezar a recortar
        <react_native_1.View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16, height: 84 }}>
                        <ToolButton icon="close" label={(0, translate_1.libT)('cancel')} onPress={() => run('window.__cancelCrop()')}/>
                        <ToolButton icon="check" label={(0, translate_1.libT)('apply')} color="#22c55e" onPress={() => { run('window.__applyCrop()'); setTool(defaultTool); }}/>
                    </react_native_1.View>) : (<react_native_1.View style={{ flex: 1, gap: 4 }}>
                        <react_native_1.ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center', gap: 2, flexGrow: 1, justifyContent: 'center' }}>
                            {row1}
                        </react_native_1.ScrollView>
                        <react_native_1.View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 2, minHeight: 40 }}>
                            {showColor && (<Menu_1.Menu ref={colorMenu} trigger={tr => (<react_native_1.Pressable {...tr} accessibilityRole="button" accessibilityLabel="color" hitSlop={4} style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
                                        <react_native_1.View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: shownColor, borderWidth: 2, borderColor: '#fff' }}/>
                                    </react_native_1.Pressable>)}>
                                    <Box_1.Box p={2.5} gap={8} w={5 * 30 + 4 * 8 + 20}>
                                        <Box_1.Box flexDir="row" flexWrap="wrap" gap={8}>
                                            {colors.map(c => (<react_native_1.Pressable key={c} onPress={() => { var _a; setColor(c); run(`window.__setColor(${(0, webview_1.jsValue)(c)})`); (_a = colorMenu.current) === null || _a === void 0 ? void 0 : _a.close(); }} accessibilityRole="button" accessibilityLabel={c} style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: c, borderWidth: c === shownColor ? 3 : 1, borderColor: c === shownColor ? '#3b82f6' : 'rgba(0,0,0,0.15)' }}/>))}
                                        </Box_1.Box>
                                        {eyedropper && (<react_native_1.Pressable onPress={() => { var _a; (_a = colorMenu.current) === null || _a === void 0 ? void 0 : _a.close(); setTool('picker'); }} accessibilityRole="button" accessibilityLabel="picker" style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4, opacity: pressed ? 0.5 : 1 })}>
                                                <Icon_1.Icon as="MaterialCommunityIcons" name="eyedropper" size={20} color={MENU_ICON}/>
                                                <Text_1.Text fontSize={13}>{(0, translate_1.libT)('pickColor')}</Text_1.Text>
                                            </react_native_1.Pressable>)}
                                    </Box_1.Box>
                                </Menu_1.Menu>)}
                            {showWidth && (<Menu_1.Menu ref={widthMenu} trigger={tr => (<react_native_1.Pressable {...tr} accessibilityRole="button" accessibilityLabel="width" hitSlop={4} style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
                                        <react_native_1.View style={{ width: 22, height: Math.min(14, Math.max(2, lineWidth / 1.6)), borderRadius: 7, backgroundColor: '#fff' }}/>
                                    </react_native_1.Pressable>)}>
                                    {lineWidths.map(w => (<react_native_1.Pressable key={w} onPress={() => { var _a; setLineWidth(w); run(`window.__setWidth(${w})`); (_a = widthMenu.current) === null || _a === void 0 ? void 0 : _a.close(); }} accessibilityRole="button" accessibilityLabel={`${w}`} style={{ paddingHorizontal: 16, paddingVertical: 10 }}>
                                            <react_native_1.View style={{ width: 70, height: w, borderRadius: w / 2, backgroundColor: w === lineWidth ? '#3b82f6' : '#333' }}/>
                                        </react_native_1.Pressable>))}
                                </Menu_1.Menu>)}
                            {showStyle && (<Menu_1.Menu ref={styleMenu} trigger={tr => <ToolButton icon="palette-swatch-outline" label="style" onPress={tr.onPress}/>}>
                                    <Box_1.Box p={2.5} gap={10}>
                                        {tool === 'fill' && !sel ? (
                // Bote: dentro de lo dibujado, o la zona de la foto del mismo color
                ['drawing', 'image'].map(m => (<react_native_1.Pressable key={m} accessibilityRole="button" accessibilityLabel={`fillMode-${m}`} onPress={() => { var _a; setShapeStyle(s => (Object.assign(Object.assign({}, s), { fillMode: m }))); run(`window.__setStyle(${(0, webview_1.jsValue)({ fillMode: m })})`); (_a = styleMenu.current) === null || _a === void 0 ? void 0 : _a.close(); }} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 8, paddingVertical: 8, borderRadius: 8, backgroundColor: shapeStyle.fillMode === m ? MENU_ACTIVE : 'transparent' }}>
                                                    <Icon_1.Icon as="MaterialCommunityIcons" name={(m === 'drawing' ? 'vector-square' : 'image-filter-center-focus')} size={20} color={MENU_ICON}/>
                                                    <Text_1.Text fontSize={13}>{(0, translate_1.libT)(m === 'drawing' ? 'fillInside' : 'fillByColor')}</Text_1.Text>
                                                </react_native_1.Pressable>))) : (<>
                                                {styleClosed && (<react_native_1.View style={{ flexDirection: 'row', gap: 8 }}>
                                                        {['none', 'solid', 'soft'].map(f => (<react_native_1.Pressable key={f} accessibilityRole="button" accessibilityLabel={`fill-${f}`} onPress={() => { var _a; setShapeStyle(s => (Object.assign(Object.assign({}, s), { fill: f }))); run(`window.__setStyle(${(0, webview_1.jsValue)({ fill: f })})`); (_a = styleMenu.current) === null || _a === void 0 ? void 0 : _a.close(); }} style={{ width: 44, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: styleFill === f ? MENU_ACTIVE : 'transparent' }}>
                                                                <react_native_1.View style={{ width: 26, height: 20, borderRadius: 4, borderWidth: 2, borderColor: shownColor === '#ffffff' ? '#9ca3af' : shownColor, backgroundColor: f === 'none' ? 'transparent' : f === 'solid' ? shownColor : `${shownColor}59` }}/>
                                                            </react_native_1.Pressable>))}
                                                    </react_native_1.View>)}
                                                <react_native_1.View style={{ flexDirection: 'row', gap: 8 }}>
                                                    {['solid', 'dashed', 'dotted'].map(d => (<react_native_1.Pressable key={d} accessibilityRole="button" accessibilityLabel={`dash-${d}`} onPress={() => { var _a; setShapeStyle(s => (Object.assign(Object.assign({}, s), { dash: d }))); run(`window.__setStyle(${(0, webview_1.jsValue)({ dash: d })})`); (_a = styleMenu.current) === null || _a === void 0 ? void 0 : _a.close(); }} style={{ width: 44, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: styleDash === d ? MENU_ACTIVE : 'transparent' }}>
                                                            <react_native_1.View style={{ width: 30, height: 0, borderTopWidth: 3, borderStyle: d, borderColor: MENU_ICON }}/>
                                                        </react_native_1.Pressable>))}
                                                </react_native_1.View>
                                            </>)}
                                    </Box_1.Box>
                                </Menu_1.Menu>)}
                            {(showColor || showWidth || showStyle) && <Separator />}
                            {sel ? (<>
                                    {sel.type === 'text' && <ToolButton icon="pencil-box-outline" label="editText" onPress={() => run('window.__editSelected()')}/>}
                                    <ToolButton icon="content-copy" label="duplicate" onPress={() => run('window.__duplicate()')}/>
                                    <ToolButton icon="trash-can-outline" label="delete" color="#f87171" onPress={() => run('window.__deleteSelected()')}/>
                                </>) : (<>
                                    {(adjustKeys.length > 0 || filters.length > 0) && <ToolButton icon={ICONS.adjust} label="adjust" active={!sameAdjust(adjust, {})} onPress={() => setTool('adjust')}/>}
                                    {rotate && <ToolButton icon="rotate-right" label="rotate" onPress={() => rotateTo('right')}/>}
                                    {crop && <ToolButton icon={ICONS.crop} label="crop" active={cropping} onPress={() => setTool(cropping ? defaultTool : 'crop')}/>}
                                </>)}
                        </react_native_1.View>
                    </react_native_1.View>)}
            </Box_1.Box>
            {hint && (<react_native_1.View pointerEvents="none" style={{ position: 'absolute', top: insets.top + 60, left: 0, right: 0, alignItems: 'center' }}>
                    <Text_1.Text color="white" fontSize={13} style={{ backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 }}>{hint}</Text_1.Text>
                </react_native_1.View>)}
            {discardHint && (<react_native_1.View pointerEvents="none" style={{ position: 'absolute', bottom: insets.bottom + 110, left: 0, right: 0, alignItems: 'center' }}>
                    <Text_1.Text color="white" fontSize={13} style={{ backgroundColor: 'rgba(0,0,0,0.75)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 }}>{(0, translate_1.libT)('discardHint')}</Text_1.Text>
                </react_native_1.View>)}
            {composer && (<TextComposer key={composer.mode === 'edit' ? `e${composer.index}` : 'new'} initial={composer.initial} colors={colors} fonts={fonts} top={insets.top} onDone={onComposerDone} onCancel={onComposerCancel}/>)}
        </Box_1.Box>);
});
/**
 * Abre el editor a pantalla completa. Se resuelve con la imagen editada al guardar, o null si se cancela
 * @example const r = await openImageEditor(foto.uri, { format: 'png' }); if (r) subir(r.dataUri);
 */
const openImageEditor = (source, options) => {
    var _a;
    return (0, Modal_1.openModal)({
        buttonClose: false,
        static: true,
        _contentStyle: { h: '100%', my: 0, roundedTop: 0, roundedBottom: 0, bg: ((_a = options === null || options === void 0 ? void 0 : options.backgroundColor) !== null && _a !== void 0 ? _a : '#111') },
        children: ({ close }) => <exports.ImageEditor source={source} onSave={r => close(r)} onCancel={() => close(null)} {...options}/>,
    }).result.then(r => r !== null && r !== void 0 ? r : null);
};
exports.openImageEditor = openImageEditor;
