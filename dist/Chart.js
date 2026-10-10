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
exports.Chart = exports.compactNumber = void 0;
// Chart: líneas, áreas, sparkline, barras (verticales, horizontales, agrupadas o apiladas), pie, donut y progreso
// circular, todo en un componente con type="...". Dibuja con react-native-svg y anima con reanimated: los paths
// son worklets, así que la animación corre en el hilo de UI
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const react_native_svg_1 = __importStar(require("react-native-svg"));
const react_native_reanimated_1 = __importStar(require("react-native-reanimated"));
const Box_1 = require("./Box");
const Text_1 = require("./Text");
const Spinner_1 = require("./Spinner");
const translate_1 = require("./utils/translate");
const useThemeProps_1 = require("./utils/useThemeProps");
const theme_provider_1 = require("./theme-provider");
const AnimatedPath = react_native_reanimated_1.default.createAnimatedComponent(react_native_svg_1.Path);
const AnimatedCircle = react_native_reanimated_1.default.createAnimatedComponent(react_native_svg_1.Circle);
const AnimatedRect = react_native_reanimated_1.default.createAnimatedComponent(react_native_svg_1.Rect);
const EASING = react_native_reanimated_1.Easing.out(react_native_reanimated_1.Easing.cubic);
const TAU = Math.PI * 2;
/* ---------------- Colores ---------------- */
const DEFAULT_PALETTE = [
    'primary.100', 'secondary.100', 'success.100', 'warning.100', 'info.100', 'danger.100',
    '#8B5CF6', '#14B8A6', '#F97316', '#64748B',
];
const resolveColor = (theme, color, fallback = '#000') => { var _a; return (color && (((_a = theme.colors) === null || _a === void 0 ? void 0 : _a[color]) || color)) || fallback; };
/* ---------------- Números ---------------- */
const numberFormatters = new Map();
const formatWithDecimals = (value, decimals) => {
    let f = numberFormatters.get(decimals);
    if (!f)
        numberFormatters.set(decimals, f = new Intl.NumberFormat(undefined, { maximumFractionDigits: decimals }));
    return f.format(value);
};
/** 1234.5 → "1.234,5" (según el idioma del dispositivo, hasta 2 decimales) */
const defaultFormatValue = (value) => formatWithDecimals(value, 2);
/** Para los ejes: 1500 → "1,5k", 2300000 → "2,3M" */
const compactNumber = (value) => {
    const abs = Math.abs(value);
    for (const [n, suffix] of [[1e12, 'T'], [1e9, 'B'], [1e6, 'M'], [1e3, 'k']])
        if (abs >= n)
            return formatWithDecimals(value / n, 1) + suffix;
    return formatWithDecimals(value, abs < 10 ? 2 : 1);
};
exports.compactNumber = compactNumber;
const niceNumber = (range, round) => {
    const exp = Math.floor(Math.log10(range));
    const f = range / Math.pow(10, exp);
    const nice = round
        ? (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10)
        : (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10);
    return nice * Math.pow(10, exp);
};
/** Escala "bonita" para un eje: límites y marcas en números redondos (0, 25, 50...) */
const niceScale = (min, max, count = 5) => {
    if (!Number.isFinite(min) || !Number.isFinite(max)) {
        min = 0;
        max = 1;
    }
    if (min === max) {
        const pad = Math.abs(min) * 0.1 || 1;
        min -= min === 0 ? 0 : pad;
        max += pad;
    }
    const step = niceNumber(niceNumber(max - min, false) / Math.max(1, count - 1), true);
    const niceMin = Math.floor(min / step) * step;
    const niceMax = Math.ceil(max / step) * step;
    const decimals = Math.max(0, -Math.floor(Math.log10(step)));
    const ticks = [];
    for (let v = niceMin; v <= niceMax + step / 2; v += step)
        ticks.push(Number(v.toFixed(decimals)));
    return { min: niceMin, max: niceMax, ticks };
};
/* ---------------- Datos ---------------- */
/** data simple (números u objetos) o series → series normalizadas + etiquetas + colores por punto */
const normalizeSeries = (data, series, labels) => {
    if (series === null || series === void 0 ? void 0 : series.length) {
        const length = Math.max(0, ...series.map(s => s.data.length));
        return { series, labels: labels !== null && labels !== void 0 ? labels : [], length, pointColors: undefined };
    }
    const items = data !== null && data !== void 0 ? data : [];
    const values = items.map(d => (d == null ? null : typeof d === 'number' ? d : d.value));
    const pointColors = items.map(d => (d && typeof d === 'object' ? d.color : undefined));
    const itemLabels = items.map((d, i) => { var _a; return (d && typeof d === 'object' && d.label != null ? d.label : (_a = labels === null || labels === void 0 ? void 0 : labels[i]) !== null && _a !== void 0 ? _a : ''); });
    return { series: [{ data: values }], labels: itemLabels, length: values.length, pointColors: pointColors.some(Boolean) ? pointColors : undefined };
};
const isNum = (v) => typeof v === 'number' && Number.isFinite(v);
/* ---------------- Tamaño del contenedor ---------------- */
/** El ancho del contenedor (si no se pasa width): se mide con onLayout */
const useChartWidth = (width) => {
    const [measured, setMeasured] = (0, react_1.useState)(0);
    const onLayout = (0, react_1.useCallback)((e) => {
        const w = Math.round(e.nativeEvent.layout.width);
        setMeasured(prev => (prev === w ? prev : w));
    }, []);
    return { width: width !== null && width !== void 0 ? width : measured, onLayout: width == null ? onLayout : undefined };
};
/** Ancho aproximado de un texto (sin medir): suficiente para reservar el hueco de los ejes */
const textWidth = (text, fontSize) => text.length * fontSize * 0.58;
/* ---------------- Leyenda, tooltip y vacío ---------------- */
const Legend = ({ items, _legend, _legendText }) => (<Box_1.Box flexDir="row" flexWrap="wrap" justifyContent="center" gap={12} mt={8} {..._legend}>
        {items.map((item, i) => (<Box_1.Box key={i} flexDir="row" alignItems="center" gap={1.5}>
                <react_native_1.View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: item.color }}/>
                <Text_1.Text fontSize={12} color="gray" {..._legendText}>
                    {item.label}{item.value != null ? <Text_1.Text fontSize={12} fontWeight="700" {..._legendText}>{`  ${item.value}`}</Text_1.Text> : null}
                </Text_1.Text>
            </Box_1.Box>))}
    </Box_1.Box>);
/** Recuadro flotante que se coloca sobre (x, y) sin salirse del gráfico */
const Tooltip = ({ x, y, width, children, _tooltip }) => {
    const [size, setSize] = (0, react_1.useState)(null);
    const left = size ? Math.min(Math.max(0, x - size.w / 2), Math.max(0, width - size.w)) : 0;
    const top = size ? (y - size.h - 10 >= 0 ? y - size.h - 10 : y + 12) : 0;
    return (<react_native_1.View pointerEvents="none" onLayout={e => { const { width: w, height: h } = e.nativeEvent.layout; setSize(s => (s && s.w === w && s.h === h ? s : { w, h })); }} style={{ position: 'absolute', left, top, opacity: size ? 1 : 0 }}>
            <Box_1.Box bg="dark.100" rounded={2} px={2.5} py={1.5} {..._tooltip}>{children}</Box_1.Box>
        </react_native_1.View>);
};
const TooltipRow = ({ color, label, value, _tooltipText }) => (<Box_1.Box flexDir="row" alignItems="center" gap={1.5}>
        {color ? <react_native_1.View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }}/> : null}
        <Text_1.Text fontSize={12} color="white" {..._tooltipText}>
            {label ? `${label}: ` : ''}<Text_1.Text fontSize={12} fontWeight="700" color="white" {..._tooltipText}>{value}</Text_1.Text>
        </Text_1.Text>
    </Box_1.Box>);
const ChartEmpty = ({ height, text, _emptyText }) => (<Box_1.Box h={height} alignItems="center" justifyContent="center">
        <Text_1.Text color="silver.100" {..._emptyText}>{text}</Text_1.Text>
    </Box_1.Box>);
// Va antes que linePath: el plugin de reanimated convierte los worklets en constantes (sin hoisting)
function segmentPath(xs, ys, a, b, curve, base) {
    'worklet';
    let d = `M${xs[a]},${ys[a]}`;
    if (curve === 'step') {
        for (let i = a + 1; i <= b; i++)
            d += `H${xs[i]}V${ys[i]}`;
    }
    else if (curve === 'monotone' && b - a >= 2) {
        // Cúbica monótona (Fritsch-Carlson): suave, sin pasarse por encima o por debajo de los valores
        const n = b - a + 1;
        const m = [];
        const t = [];
        for (let i = 0; i < n - 1; i++) {
            const dx = xs[a + i + 1] - xs[a + i];
            m.push(dx === 0 ? 0 : (ys[a + i + 1] - ys[a + i]) / dx);
        }
        t.push(m[0]);
        for (let i = 1; i < n - 1; i++)
            t.push(m[i - 1] * m[i] <= 0 ? 0 : (m[i - 1] + m[i]) / 2);
        t.push(m[n - 2]);
        for (let i = 0; i < n - 1; i++) {
            if (m[i] === 0) {
                t[i] = 0;
                t[i + 1] = 0;
                continue;
            }
            const p = t[i] / m[i];
            const q = t[i + 1] / m[i];
            const s = p * p + q * q;
            if (s > 9) {
                const k = 3 / Math.sqrt(s);
                t[i] = k * p * m[i];
                t[i + 1] = k * q * m[i];
            }
        }
        for (let i = 0; i < n - 1; i++) {
            const x0 = xs[a + i], x1 = xs[a + i + 1], y0 = ys[a + i], y1 = ys[a + i + 1];
            const dx = (x1 - x0) / 3;
            d += `C${x0 + dx},${y0 + t[i] * dx},${x1 - dx},${y1 - t[i + 1] * dx},${x1},${y1}`;
        }
    }
    else {
        for (let i = a + 1; i <= b; i++)
            d += `L${xs[i]},${ys[i]}`;
    }
    if (base != null)
        d += `L${xs[b]},${base}L${xs[a]},${base}Z`;
    return d;
}
/**
 * Path de una línea por los puntos (xs[i], ys[i]); un y null corta la línea (hueco).
 * Con `base`, cada tramo se cierra hasta esa altura (área).
 */
function linePath(xs, ys, curve, base) {
    'worklet';
    let d = '';
    let start = -1;
    for (let i = 0; i <= ys.length; i++) {
        const y = i < ys.length ? ys[i] : null;
        if (y != null && start < 0)
            start = i;
        if ((y == null || i === ys.length) && start >= 0) {
            d += segmentPath(xs, ys, start, i - 1, curve, base);
            start = -1;
        }
    }
    return d;
}
/** Porción de tarta o de donut entre dos ángulos (radianes, 0 = arriba, sentido horario) */
function arcPath(cx, cy, r, inner, a0, a1) {
    'worklet';
    const sweep = a1 - a0;
    if (sweep <= 0.0001)
        return '';
    const pt = (radius, a) => `${cx + radius * Math.sin(a)},${cy - radius * Math.cos(a)}`;
    if (sweep >= Math.PI * 2 - 0.0001) {
        // Círculo completo: dos medias vueltas (un arco SVG no puede empezar y acabar en el mismo punto)
        const ring = `M${pt(r, 0)}A${r},${r} 0 1 1 ${pt(r, Math.PI)}A${r},${r} 0 1 1 ${pt(r, 0)}Z`;
        return inner > 0 ? ring + `M${pt(inner, 0)}A${inner},${inner} 0 1 0 ${pt(inner, Math.PI)}A${inner},${inner} 0 1 0 ${pt(inner, 0)}Z` : ring;
    }
    const large = sweep > Math.PI ? 1 : 0;
    if (inner <= 0)
        return `M${cx},${cy}L${pt(r, a0)}A${r},${r} 0 ${large} 1 ${pt(r, a1)}Z`;
    return `M${pt(r, a0)}A${r},${r} 0 ${large} 1 ${pt(r, a1)}L${pt(inner, a1)}A${inner},${inner} 0 ${large} 0 ${pt(inner, a0)}Z`;
}
const resolveCommon = (theme, p) => {
    var _a, _b, _c, _d, _e, _f, _g, _j, _k, _l, _m, _o, _p;
    const norm = normalizeSeries(p.data, p.series, p.labels);
    const palette = (_a = p.colors) !== null && _a !== void 0 ? _a : DEFAULT_PALETTE;
    const fmtValue = (_b = p.formatValue) !== null && _b !== void 0 ? _b : defaultFormatValue;
    return Object.assign(Object.assign({ theme }, norm), { names: norm.series.map((s, i) => { var _a; return (_a = s.name) !== null && _a !== void 0 ? _a : (norm.series.length > 1 ? `${i + 1}` : ''); }), colors: norm.series.map((s, i) => { var _a; return resolveColor(theme, (_a = s.color) !== null && _a !== void 0 ? _a : palette[i % palette.length]); }), fmtValue, fmtY: (_d = (_c = p.formatYLabel) !== null && _c !== void 0 ? _c : p.formatValue) !== null && _d !== void 0 ? _d : exports.compactNumber, fmtLabel: (_e = p.formatLabel) !== null && _e !== void 0 ? _e : (l => l), fs: (_g = (_f = p._axisLabel) === null || _f === void 0 ? void 0 : _f.fontSize) !== null && _g !== void 0 ? _g : 10, axisFill: resolveColor(theme, (_k = (_j = p._axisLabel) === null || _j === void 0 ? void 0 : _j.fill) !== null && _k !== void 0 ? _k : 'silver.100'), grid: Object.assign(Object.assign({ strokeWidth: react_native_1.StyleSheet.hairlineWidth * 2, strokeDasharray: '4 4' }, p._grid), { stroke: resolveColor(theme, (_m = (_l = p._grid) === null || _l === void 0 ? void 0 : _l.stroke) !== null && _m !== void 0 ? _m : 'light.100') }), valueLabel: Object.assign(Object.assign({ fontSize: 10, fontWeight: '600' }, p._valueLabel), { fill: resolveColor(theme, (_p = (_o = p._valueLabel) === null || _o === void 0 ? void 0 : _o.fill) !== null && _p !== void 0 ? _p : 'gray.100') }) });
};
/** Escala del eje de valores con lo visible (y las líneas de referencia, para que se vean) */
const valueScale = (values, p, includeZero, count) => {
    var _a, _b, _c, _d, _e;
    const refs = ((_a = p.referenceLines) !== null && _a !== void 0 ? _a : []).map(l => l.value).filter(isNum);
    const all = values.concat(refs);
    let lo = Math.min(...all), hi = Math.max(...all);
    if (includeZero) {
        lo = Math.min(0, lo);
        hi = Math.max(0, hi);
    }
    const scale = niceScale((_b = p.yMin) !== null && _b !== void 0 ? _b : lo, (_c = p.yMax) !== null && _c !== void 0 ? _c : hi, count);
    const min = (_d = p.yMin) !== null && _d !== void 0 ? _d : scale.min, max = (_e = p.yMax) !== null && _e !== void 0 ? _e : scale.max;
    return { min, max, ticks: scale.ticks.filter(t => t >= min - 1e-9 && t <= max + 1e-9) };
};
/* ---------------- Zoom ---------------- */
const nextFrame = (fn) => (typeof requestAnimationFrame === 'function' ? requestAnimationFrame(fn) : setTimeout(fn, 16));
/**
 * Ventana visible en el eje de categorías, en índices. En líneas el ancho completo es n - 1 (de punto a punto)
 * y en barras n (huecos). null = todo
 */
const useViewport = (n, slots, p) => {
    var _a;
    const full = Math.max(1, slots ? n : n - 1);
    const minSpan = Math.min(full, Math.max(2, full / Math.max(1, (_a = p.maxZoom) !== null && _a !== void 0 ? _a : 10)));
    const clamp = (v) => {
        const span = Math.min(full, Math.max(minSpan, v.span));
        return { span, start: Math.min(full - span, Math.max(0, v.start)) };
    };
    const initial = () => (p.visiblePoints && p.visiblePoints < n
        ? clamp({ span: slots ? p.visiblePoints : p.visiblePoints - 1, start: Infinity }) : null);
    const [view, setViewState] = (0, react_1.useState)(initial);
    // Al cambiar el número de datos se vuelve a la vista inicial (con visiblePoints, al final: lo más reciente)
    const lastN = (0, react_1.useRef)(n);
    (0, react_1.useEffect)(() => { if (lastN.current !== n) {
        lastN.current = n;
        setViewState(initial());
    } }, [n]);
    const current = view ? clamp(view) : { start: 0, span: full };
    const onZoomRef = (0, react_1.useRef)(p.onZoomChange);
    onZoomRef.current = p.onZoomChange;
    // Durante el gesto llegan más movimientos que fotogramas: se aplica solo el último de cada fotograma
    const pending = (0, react_1.useRef)(null);
    const setView = (v) => {
        const first = !pending.current;
        pending.current = { v };
        if (first)
            nextFrame(() => { const p = pending.current; pending.current = null; if (p)
                applyView(p.v); });
    };
    const applyView = (v) => {
        var _a;
        const next = v && clamp(v);
        const final = !next || next.span >= full - 1e-6 ? null : next;
        setViewState(prev => (prev && final && Math.abs(prev.start - final.start) < 1e-3 && Math.abs(prev.span - final.span) < 1e-3 ? prev : final));
        (_a = onZoomRef.current) === null || _a === void 0 ? void 0 : _a.call(onZoomRef, final ? (slots
            ? { start: Math.floor(final.start), end: Math.ceil(final.start + final.span) - 1 }
            : { start: Math.ceil(final.start - 1e-6), end: Math.floor(final.start + final.span + 1e-6) }) : null);
    };
    return { view: current, zoomed: current.span < full - 1e-6, setView, clamp };
};
/**
 * Toques: un toque (soltar sin moverse) selecciona o, si es lo mismo, quita; arrastrar en horizontal recorre
 * (o desplaza, con zoom); dos dedos hacen zoom y un doble toque lo quita. Si la pantalla empieza a hacer
 * scroll antes, se queda con el toque y no cambia nada. El overlay no tiene hijos: locationX es relativo a él
 */
const useChartGestures = ({ select, zoomable, pick, onChange, vp, plotL, plotW }) => {
    const [selected, setSelected] = (0, react_1.useState)(null);
    const g = (0, react_1.useRef)({ mode: 'tap', x: 0, y: 0, before: null, selected: null, start: vp.view, d0: 1, cx0: 0, lastTap: 0 });
    g.current.selected = selected;
    // Lo último de cada render, para los handlers (se crean una vez por render, pero el gesto dura varios)
    const live = (0, react_1.useRef)({ vp, plotL, plotW, pick });
    live.current = { vp, plotL, plotW, pick };
    const set = (i) => {
        if (i === g.current.selected)
            return;
        g.current.selected = i;
        setSelected(i);
        onChange(i);
    };
    if (!select && !zoomable)
        return { selected, setSelected: set, handlers: {} };
    const handlers = {
        onStartShouldSetResponder: () => true,
        onResponderGrant: (e) => {
            Object.assign(g.current, { mode: 'tap', x: e.nativeEvent.pageX, y: e.nativeEvent.pageY, before: g.current.selected, start: live.current.vp.view });
        },
        onResponderMove: (e) => {
            var _a;
            const { vp, plotL, plotW, pick } = live.current;
            const touches = (_a = e.nativeEvent.touches) !== null && _a !== void 0 ? _a : [];
            if (zoomable && touches.length >= 2) {
                const [a, b] = touches;
                const d = Math.hypot(a.pageX - b.pageX, a.pageY - b.pageY) || 1;
                const cx = (a.locationX + b.locationX) / 2;
                if (g.current.mode !== 'pinch') {
                    Object.assign(g.current, { mode: 'pinch', d0: d, cx0: cx, start: vp.view });
                    set(null);
                    return;
                }
                // El índice bajo el centro de los dedos se queda bajo el centro (zoom + desplazamiento a la vez)
                const v0 = g.current.start;
                const span = vp.clamp({ span: v0.span * (g.current.d0 / d), start: 0 }).span;
                const anchor = v0.start + ((g.current.cx0 - plotL) / plotW) * v0.span;
                vp.setView({ span, start: anchor - ((cx - plotL) / plotW) * span });
                return;
            }
            if (g.current.mode === 'pinch')
                return; // se levantó un dedo: hasta soltar
            const dx = e.nativeEvent.pageX - g.current.x, dy = e.nativeEvent.pageY - g.current.y;
            if (g.current.mode === 'tap' && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
                g.current.mode = zoomable && vp.zoomed ? 'pan' : select ? 'scrub' : 'tap';
                g.current.start = vp.view;
            }
            if (g.current.mode === 'scrub') {
                const i = pick(e.nativeEvent.locationX, e.nativeEvent.locationY);
                if (i != null)
                    set(i);
            }
            if (g.current.mode === 'pan')
                vp.setView({ span: g.current.start.span, start: g.current.start.start - (dx / plotW) * g.current.start.span });
        },
        onResponderRelease: (e) => {
            if (g.current.mode !== 'tap')
                return;
            const now = Date.now();
            if (zoomable && live.current.vp.zoomed && now - g.current.lastTap < 300) {
                g.current.lastTap = 0;
                live.current.vp.setView(null);
                set(null);
                return;
            }
            g.current.lastTap = now;
            if (!select)
                return;
            const i = live.current.pick(e.nativeEvent.locationX, e.nativeEvent.locationY);
            set(i != null && i === g.current.before ? null : i);
        },
        // El scroll de la pantalla puede quedarse el toque mientras no se esté recorriendo, desplazando o haciendo zoom
        onResponderTerminationRequest: () => g.current.mode === 'tap',
        onResponderTerminate: () => { if (g.current.mode === 'tap')
            set(g.current.before); },
    };
    return { selected, setSelected: set, handlers };
};
const selectionOf = (r, index) => ({
    index,
    label: r.labels[index] || undefined,
    values: r.series.map((s, i) => {
        var _a;
        return ({
            name: r.names[i] || undefined,
            value: isNum(s.data[index]) ? s.data[index] : null,
            color: ((_a = r.pointColors) === null || _a === void 0 ? void 0 : _a[index]) && r.series.length === 1 ? resolveColor(r.theme, r.pointColors[index]) : r.colors[i],
        });
    }),
});
const DefaultTooltip = ({ sel, r, _tooltipText }) => (<>
        {sel.label ? <Text_1.Text fontSize={11} color="silver.100" mb={0.5} {..._tooltipText}>{r.fmtLabel(sel.label, sel.index)}</Text_1.Text> : null}
        {sel.values.map((v, i) => (<TooltipRow key={i} color={sel.values.length > 1 ? v.color : undefined} label={v.name} value={v.value == null ? '—' : r.fmtValue(v.value)} _tooltipText={_tooltipText}/>))}
    </>);
// Props de Chart que no son del Box contenedor
const CHART_PROP_KEYS = [
    'data', 'series', 'labels', 'width', 'height', 'aspectRatio', 'colors', 'animate', 'duration', 'legend', 'legendPosition',
    'loading', 'formatValue', 'emptyText', 'yMin', 'yMax', 'yTicks', 'showGrid', 'showXAxis', 'showYAxis', 'showValues',
    'formatYLabel', 'formatLabel', 'tooltip', 'renderTooltip', 'onSelect', 'referenceLines', 'zoomable', 'maxZoom',
    'visiblePoints', 'onZoomChange', 'curve', 'strokeWidth', 'dots', 'dotSize', 'area', 'gradient', 'fillOpacity',
    'horizontal', 'stacked', 'barRadius', 'barGap', 'variant', '_grid', '_axisLabel', '_valueLabel', '_legend',
    '_legendText', '_tooltip', '_tooltipText', '_emptyText',
];
const boxPropsOf = (p) => {
    const out = {};
    for (const k in p)
        if (!CHART_PROP_KEYS.includes(k))
            out[k] = p[k];
    return out;
};
/** Hueco del gráfico: alto fijo o, con aspectRatio, según el ancho */
const chartHeight = (p, width, fallback) => { var _a; return (_a = p.height) !== null && _a !== void 0 ? _a : (p.aspectRatio && width ? width / p.aspectRatio : fallback); };
/** Contenedor común: mide el ancho, pinta el gráfico, el overlay táctil, el tooltip y la leyenda */
const ChartFrame = ({ p, r, width, onLayout, height, legendItems, children, touch, tooltipAt, empty }) => {
    var _a;
    const sel = touch.selected != null && touch.selected < r.length ? selectionOf(r, touch.selected) : null;
    const pos = sel && tooltipAt ? tooltipAt(sel.index) : null;
    const legend = !empty && !p.loading && legendItems && legendItems.length > 0
        ? <Legend items={legendItems} _legend={Object.assign(Object.assign({}, (p.legendPosition === 'top' ? { mt: 0, mb: 8 } : null)), p._legend)} _legendText={p._legendText}/> : null;
    return (<Box_1.Box {...boxPropsOf(p)}>
            {p.legendPosition === 'top' && legend}
            <react_native_1.View onLayout={onLayout} style={Object.assign({ width: '100%' }, (p.height == null && p.aspectRatio ? { aspectRatio: p.aspectRatio } : { height }))} accessibilityRole="image">
                {p.loading ? <Box_1.Box flex={1} alignItems="center" justifyContent="center"><Spinner_1.Spinner /></Box_1.Box>
            : empty ? <ChartEmpty height={height} text={(_a = p.emptyText) !== null && _a !== void 0 ? _a : (0, translate_1.libT)('noData')} _emptyText={p._emptyText}/>
                : width > 0 && (<>
                                {children}
                                <react_native_1.View style={react_native_1.StyleSheet.absoluteFill} {...touch.handlers}/>
                                {sel && pos && p.tooltip !== false && (<Tooltip x={pos.x} y={pos.y} width={width} _tooltip={p._tooltip}>
                                        {p.renderTooltip ? p.renderTooltip(sel) : <DefaultTooltip sel={sel} r={r} _tooltipText={p._tooltipText}/>}
                                    </Tooltip>)}
                            </>)}
            </react_native_1.View>
            {p.legendPosition !== 'top' && legend}
        </Box_1.Box>);
};
/** Progreso de la animación: solo se reinicia cuando cambian los datos (no al hacer zoom ni al cambiar el ancho) */
const useProgress = (dataKey, animate, duration) => {
    const progress = (0, react_native_reanimated_1.useSharedValue)(animate ? 0 : 1);
    const [animating, setAnimating] = (0, react_1.useState)(animate);
    // Antes de pintar: si no, se vería un fotograma con los datos nuevos sin animar
    (0, react_1.useLayoutEffect)(() => {
        if (!animate) {
            progress.value = 1;
            setAnimating(false);
            return;
        }
        progress.value = 0;
        if (!dataKey)
            return; // sin medir todavía: empieza cuando se pinte
        setAnimating(true);
        progress.value = (0, react_native_reanimated_1.withTiming)(1, { duration, easing: EASING });
        // Al terminar se pasa a elementos SVG normales: así los re-renders (zoom, ancho, selección) no
        // rehacen los animados en el hilo de UI, que en Android es lo que más cuesta
        const t = setTimeout(() => setAnimating(false), duration + 30);
        return () => clearTimeout(t);
    }, [dataKey, animate]);
    return { progress, animating };
};
/**
 * Lo que anima cada serie: con datos nuevos, de lo que se veía a lo nuevo; con solo zoom o ancho
 * distintos, directamente a lo nuevo (from = to). Si no cambia nada, se queda como estaba (no corta la animación)
 */
const useFrames = (dataKey, geomKey, target, base) => {
    const frames = (0, react_1.useRef)(undefined);
    const f = frames.current;
    if (!f || f.dataKey !== dataKey) {
        const prev = (f === null || f === void 0 ? void 0 : f.dataKey) ? f.to : undefined; // '' = todavía sin medir: se anima desde la base
        frames.current = { dataKey, geomKey, to: target, from: target.map((ys, s) => ys.map((_, i) => { var _a, _b; return (_b = (_a = prev === null || prev === void 0 ? void 0 : prev[s]) === null || _a === void 0 ? void 0 : _a[i]) !== null && _b !== void 0 ? _b : base; })) };
    }
    else if (f.geomKey !== geomKey) {
        frames.current = { dataKey, geomKey, to: target, from: target.map(ys => ys.map(y => y !== null && y !== void 0 ? y : base)) };
    }
    return frames.current;
};
const ReferenceLines = ({ lines, theme, fs, at, horizontal, from, to }) => (<>
        {(lines !== null && lines !== void 0 ? lines : []).filter(l => isNum(l.value)).map((l, i) => {
        var _a, _b, _c;
        const color = resolveColor(theme, (_a = l.color) !== null && _a !== void 0 ? _a : 'danger.100');
        const p = at(l.value);
        return (<react_1.default.Fragment key={i}>
                    {horizontal
                ? <react_native_svg_1.Line x1={p} x2={p} y1={from} y2={to} stroke={color} strokeWidth={(_b = l.strokeWidth) !== null && _b !== void 0 ? _b : 1.5} strokeDasharray={l.dashed === false ? undefined : '6 4'}/>
                : <react_native_svg_1.Line x1={from} x2={to} y1={p} y2={p} stroke={color} strokeWidth={(_c = l.strokeWidth) !== null && _c !== void 0 ? _c : 1.5} strokeDasharray={l.dashed === false ? undefined : '6 4'}/>}
                    {l.label ? (horizontal
                ? <react_native_svg_1.Text x={p + 4} y={from + fs} fontSize={fs} fontWeight="600" fill={color}>{l.label}</react_native_svg_1.Text>
                // Encima de la línea; si no cabe (línea pegada arriba), debajo
                : <react_native_svg_1.Text x={to - 2} y={p - 4 - fs < 0 ? p + fs + 2 : p - 4} fontSize={fs} fontWeight="600" fill={color} textAnchor="end">{l.label}</react_native_svg_1.Text>) : null}
                </react_1.default.Fragment>);
    })}
    </>);
/** Etiqueta del eje X centrada en x, pero sin salirse del gráfico por los lados */
const xLabelAnchor = (x, text, fs, width) => {
    const w = textWidth(text, fs);
    return x - w / 2 < 0 ? 'start' : x + w / 2 > width ? 'end' : 'middle';
};
/** Sin animación en curso: paths normales (calculados aquí, sin worklets) */
const LineSeries = (props) => {
    if (props.animating)
        return <AnimatedLineSeries {...props}/>;
    const { xs, to, curve, base, color, strokeWidth, area, fill, fillOpacity } = props;
    return (<>
            {area && <react_native_svg_1.Path d={linePath(xs, to, curve, base)} fill={fill !== null && fill !== void 0 ? fill : color} fillOpacity={fill ? 1 : fillOpacity}/>}
            <react_native_svg_1.Path d={linePath(xs, to, curve)} stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinejoin="round" strokeLinecap="round"/>
        </>);
};
const AnimatedLineSeries = ({ xs, from, to, progress, curve, base, color, strokeWidth, area, fill, fillOpacity }) => {
    const lineProps = (0, react_native_reanimated_1.useAnimatedProps)(() => {
        const p = progress.value;
        const ys = to.map((y, i) => (y == null ? null : from[i] + (y - from[i]) * p));
        return { d: linePath(xs, ys, curve) };
    });
    const areaProps = (0, react_native_reanimated_1.useAnimatedProps)(() => {
        const p = progress.value;
        const ys = to.map((y, i) => (y == null ? null : from[i] + (y - from[i]) * p));
        return { d: area ? linePath(xs, ys, curve, base) : '' };
    });
    return (<>
            {area && <AnimatedPath animatedProps={areaProps} fill={fill !== null && fill !== void 0 ? fill : color} fillOpacity={fill ? 1 : fillOpacity}/>}
            <AnimatedPath animatedProps={lineProps} stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinejoin="round" strokeLinecap="round"/>
        </>);
};
const Dot = (_a) => {
    var _b, _c;
    var { animating } = _a, p = __rest(_a, ["animating"]);
    // El borde del punto, del color de la superficie (blanco en claro): lo separa de la línea
    const ring = (_c = (_b = (0, theme_provider_1.useTheme)().theme.colors) === null || _b === void 0 ? void 0 : _b.surface) !== null && _c !== void 0 ? _c : '#fff';
    return animating
        ? <AnimatedDot {...p} ring={ring}/>
        : <react_native_svg_1.Circle cx={p.x} cy={p.to} r={p.r} fill={p.color} stroke={ring} strokeWidth={1.5}/>;
};
const AnimatedDot = ({ x, from, to, progress, r, color, ring }) => {
    const props = (0, react_native_reanimated_1.useAnimatedProps)(() => ({ cy: from + (to - from) * progress.value }));
    return <AnimatedCircle cx={x} animatedProps={props} r={r} fill={color} stroke={ring} strokeWidth={1.5}/>;
};
const LineBase = (_a) => {
    var _b, _c;
    var { theme } = _a, p = __rest(_a, ["theme"]);
    const { animate = true, duration = 600, yTicks = 5, showGrid = true, showXAxis = true, showYAxis = true, showValues = false, curve = 'linear', strokeWidth = 2, dotSize = 3.5, area = false, gradient = true, fillOpacity = 0.25, } = p;
    const gid = (0, react_1.useId)().replace(/[^a-zA-Z0-9]/g, '');
    const { width, onLayout } = useChartWidth(p.width);
    const height = chartHeight(p, width, 220);
    const r = resolveCommon(theme, p);
    const n = r.length;
    const vp = useViewport(n, false, p);
    const { start, span } = vp.view;
    // Lo visible: de un punto antes del borde a uno después (para que la línea llegue a los bordes)
    const lo = Math.max(0, Math.floor(start + 1e-6));
    const hi = Math.min(n - 1, Math.ceil(start + span - 1e-6));
    const visibleValues = r.series.flatMap(s => s.data.slice(lo, hi + 1).filter(isNum));
    const allValues = r.series.flatMap(s => s.data.filter(isNum));
    // El área siempre incluye el 0 (se rellena hasta él); la línea se ajusta a los valores
    const scale = valueScale(visibleValues.length ? visibleValues : allValues, p, area, yTicks);
    const { min: sMin, max: sMax, ticks } = scale;
    const fs = r.fs;
    const visibleCount = hi - lo + 1;
    const dots = (_b = p.dots) !== null && _b !== void 0 ? _b : visibleCount <= 20;
    const edge = Math.max(dots ? dotSize + 1.5 : 0, strokeWidth) + 1;
    const yLabelW = showYAxis ? Math.max(...ticks.map(t => textWidth(r.fmtY(t), fs))) + 8 : 0;
    const padTop = showValues ? fs + 8 : edge + 2;
    const padBottom = showXAxis ? fs + 10 : edge;
    const plotL = showYAxis ? yLabelW : edge;
    const plotW = Math.max(1, width - plotL - edge);
    const plotH = Math.max(1, height - padTop - padBottom);
    const step = n > 1 ? plotW / span : 0;
    const xAt = (i) => (n > 1 ? plotL + (i - start) * step : plotL + plotW / 2);
    const yPx = (v) => padTop + (1 - (v - sMin) / (sMax - sMin || 1)) * plotH;
    const base = yPx(Math.min(Math.max(0, sMin), sMax));
    const target = r.series.map(s => Array.from({ length: n }, (_, i) => (isNum(s.data[i]) ? yPx(s.data[i]) : null)));
    const dataKey = JSON.stringify(r.series.map(s => s.data));
    // Hasta medir el ancho no se pinta nada: la animación de entrada empieza al pintarse
    const animKey = width > 0 ? dataKey : '';
    const frames = useFrames(animKey, JSON.stringify([width, height, start, span, sMin, sMax]), target, base);
    const { progress, animating } = useProgress(animKey, animate, duration);
    const touch = useChartGestures({
        select: p.tooltip !== false || !!p.onSelect,
        zoomable: !!p.zoomable && n > 2,
        vp, plotL, plotW,
        pick: x => (n ? Math.min(Math.min(n - 1, Math.floor(start + span + 1e-6)), Math.max(Math.ceil(start - 1e-6), Math.round(step ? start + (x - plotL) / step : 0))) : null),
        onChange: i => { var _a; return (_a = p.onSelect) === null || _a === void 0 ? void 0 : _a.call(p, i == null ? null : selectionOf(r, i)); },
    });
    (0, react_1.useEffect)(() => { if (touch.selected != null && touch.selected >= n)
        touch.setSelected(null); }, [n]);
    const sel = touch.selected != null && touch.selected < n ? touch.selected : null;
    // Etiquetas del eje X sin pisarse (solo las visibles; con zoom aparecen más)
    const maxLabelW = Math.max(0, ...r.labels.slice(lo, hi + 1).map((l, i) => textWidth(r.fmtLabel(l, lo + i), fs)));
    const every = Math.max(1, Math.ceil((maxLabelW + 8) / (step || plotW)));
    const xs = Array.from({ length: hi - lo + 1 }, (_, i) => xAt(lo + i));
    const inView = (i) => i >= start - 1e-6 && i <= start + span + 1e-6;
    const clipId = `${gid}clip`;
    return (<ChartFrame p={p} r={r} width={width} onLayout={onLayout} height={height} touch={touch} empty={!allValues.length} legendItems={((_c = p.legend) !== null && _c !== void 0 ? _c : r.series.length > 1) ? r.series.map((_, i) => ({ label: r.names[i] || `${i + 1}`, color: r.colors[i] })) : undefined} tooltipAt={i => ({ x: xAt(i), y: Math.min(...target.map(ys => { var _a; return (_a = ys[i]) !== null && _a !== void 0 ? _a : Infinity; }), padTop + plotH) })}>
            <react_native_svg_1.default width={width} height={height}>
                <react_native_svg_1.Defs>
                    <react_native_svg_1.ClipPath id={clipId}><react_native_svg_1.Rect x={plotL - edge} y={0} width={plotW + edge * 2} height={height}/></react_native_svg_1.ClipPath>
                    {area && gradient && r.colors.map((c, i) => (<react_native_svg_1.LinearGradient key={i} id={`${gid}g${i}`} x1="0" y1="0" x2="0" y2="1">
                            <react_native_svg_1.Stop offset="0" stopColor={c} stopOpacity={Math.min(1, fillOpacity * 1.6)}/>
                            <react_native_svg_1.Stop offset="1" stopColor={c} stopOpacity={0}/>
                        </react_native_svg_1.LinearGradient>))}
                </react_native_svg_1.Defs>
                {showGrid && ticks.map(t => <react_native_svg_1.Line key={t} x1={plotL} x2={plotL + plotW} y1={yPx(t)} y2={yPx(t)} {...r.grid}/>)}
                {showYAxis && ticks.map(t => (<react_native_svg_1.Text key={t} x={yLabelW - 6} y={yPx(t) + fs / 3} fontSize={fs} fill={r.axisFill} textAnchor="end">{r.fmtY(t)}</react_native_svg_1.Text>))}
                {showXAxis && r.labels.map((l, i) => {
            if (!l || !inView(i) || i % every)
                return null;
            const text = r.fmtLabel(l, i);
            return <react_native_svg_1.Text key={i} x={xAt(i)} y={height - 4} fontSize={fs} fill={r.axisFill} textAnchor={xLabelAnchor(xAt(i), text, fs, width)}>{text}</react_native_svg_1.Text>;
        })}
                {sel != null && <react_native_svg_1.Line x1={xAt(sel)} x2={xAt(sel)} y1={padTop} y2={padTop + plotH} stroke={r.axisFill} strokeWidth={1} strokeDasharray="3 3"/>}
                <react_native_svg_1.G clipPath={`url(#${clipId})`}>
                    {r.series.map((_, s) => (<LineSeries key={s} xs={xs} from={frames.from[s].slice(lo, hi + 1)} to={frames.to[s].slice(lo, hi + 1)} progress={progress} curve={curve} base={base} color={r.colors[s]} strokeWidth={strokeWidth} area={area} fill={area && gradient ? `url(#${gid}g${s})` : undefined} fillOpacity={fillOpacity} animating={animating}/>))}
                    {dots && r.series.map((_, s) => frames.to[s].map((y, i) => (y == null || !inView(i) ? null : (<Dot key={`${s}.${i}`} x={xAt(i)} from={frames.from[s][i]} to={y} progress={progress} r={dotSize} color={r.colors[s]} animating={animating}/>))))}
                </react_native_svg_1.G>
                <ReferenceLines lines={p.referenceLines} theme={theme} fs={fs} at={yPx} horizontal={false} from={plotL} to={plotL + plotW}/>
                {sel != null && r.series.map((_, s) => {
            var _a, _b;
            return (isNum(target[s][sel]) ? (<react_native_svg_1.Circle key={s} cx={xAt(sel)} cy={target[s][sel]} r={dotSize + 2} fill={r.colors[s]} stroke={(_b = (_a = r.theme.colors) === null || _a === void 0 ? void 0 : _a.surface) !== null && _b !== void 0 ? _b : "#fff"} strokeWidth={2}/>) : null);
        })}
                {showValues && r.series.map((s, si) => s.data.map((v, i) => (isNum(v) && inView(i) ? (<react_native_svg_1.Text key={`${si}.${i}`} x={xAt(i)} y={target[si][i] - dotSize - 4} textAnchor="middle" {...r.valueLabel}>{r.fmtValue(v)}</react_native_svg_1.Text>) : null)))}
            </react_native_svg_1.default>
        </ChartFrame>);
};
/** Mientras anima, de from a to con el progreso compartido; si no, un Rect normal */
const Bar = (_a) => {
    var { animating, from, to, progress } = _a, p = __rest(_a, ["animating", "from", "to", "progress"]);
    if (animating)
        return <AnimatedBar {...p} from={from} to={to} progress={progress}/>;
    const rx = Math.min(p.radius, to.len / 2, p.thickness / 2);
    return p.horizontal
        ? <react_native_svg_1.Rect x={to.pos} y={p.cross} width={to.len} height={p.thickness} rx={rx} ry={rx} fill={p.color} opacity={p.opacity}/>
        : <react_native_svg_1.Rect x={p.cross} y={to.pos} width={p.thickness} height={to.len} rx={rx} ry={rx} fill={p.color} opacity={p.opacity}/>;
};
const AnimatedBar = ({ horizontal, cross, thickness, radius, color, opacity, from, to, progress }) => {
    const props = (0, react_native_reanimated_1.useAnimatedProps)(() => {
        const k = progress.value;
        const pos = from.pos + (to.pos - from.pos) * k;
        const l = Math.max(0, from.len + (to.len - from.len) * k);
        const rx = Math.min(radius, l / 2, thickness / 2);
        return horizontal ? { x: pos, width: l, rx, ry: rx } : { y: pos, height: l, rx, ry: rx };
    });
    return horizontal
        ? <AnimatedRect y={cross} height={thickness} animatedProps={props} fill={color} opacity={opacity}/>
        : <AnimatedRect x={cross} width={thickness} animatedProps={props} fill={color} opacity={opacity}/>;
};
const BarBase = (_a) => {
    var _b, _c, _d;
    var { theme } = _a, p = __rest(_a, ["theme"]);
    const { animate = true, duration = 600, yTicks = 5, showGrid = true, showXAxis = true, showYAxis = true, showValues = false, horizontal = false, stacked = false, barRadius = stacked ? 2 : 4, barGap = 0.3, } = p;
    const gid = (0, react_1.useId)().replace(/[^a-zA-Z0-9]/g, '');
    const { width, onLayout } = useChartWidth(p.width);
    const r = resolveCommon(theme, p);
    const n = r.length;
    const k = r.series.length;
    // Horizontal sin alto: según las categorías (para que quepan las etiquetas)
    const height = horizontal && p.height == null && !p.aspectRatio
        ? Math.max(120, n * (k > 1 && !stacked ? 18 * k + 14 : 34) + 30)
        : chartHeight(p, width, 220);
    const vp = useViewport(n, true, horizontal ? Object.assign(Object.assign({}, p), { visiblePoints: undefined }) : p);
    const { start, span } = vp.view;
    const lo = Math.max(0, Math.floor(start + 1e-6));
    const hi = Math.min(n - 1, Math.ceil(start + span - 1e-6) - 1);
    // Totales por categoría (apiladas: positivos y negativos por separado)
    const sums = Array.from({ length: n }, (_, i) => r.series.reduce((acc, s) => {
        const v = s.data[i];
        if (isNum(v))
            v >= 0 ? (acc.pos += v) : (acc.neg += v);
        return acc;
    }, { pos: 0, neg: 0 }));
    const allValues = r.series.flatMap(s => s.data.filter(isNum));
    const visible = stacked
        ? sums.slice(lo, hi + 1).flatMap(s => [s.pos, s.neg])
        : r.series.flatMap(s => s.data.slice(lo, hi + 1).filter(isNum));
    const { min: sMin, max: sMax, ticks } = valueScale(visible.length ? visible : allValues, p, true, yTicks);
    const fs = r.fs;
    // Geometría: un eje de categorías (X en vertical, Y en horizontal) y uno de valores
    const labelTexts = r.labels.map((l, i) => r.fmtLabel(l, i));
    const valueLabelW = showValues ? Math.max(0, ...(stacked ? sums.map(s => s.pos) : allValues).map(v => textWidth(r.fmtValue(v), r.valueLabel.fontSize))) + 6 : 0;
    let plotL, plotR, padTop, padBottom, catLabelW = 0;
    if (horizontal) {
        catLabelW = showYAxis ? Math.min(Math.max(0, ...labelTexts.map(l => textWidth(l, fs))), width * 0.35) + 8 : 0;
        plotL = catLabelW;
        plotR = width - Math.max(valueLabelW, showXAxis ? textWidth(r.fmtY((_b = ticks[ticks.length - 1]) !== null && _b !== void 0 ? _b : 0), fs) / 2 + 2 : 2);
        padTop = 4;
        padBottom = showXAxis ? fs + 10 : 2;
    }
    else {
        plotL = showYAxis ? Math.max(...ticks.map(t => textWidth(r.fmtY(t), fs))) + 8 : 2;
        plotR = width - 2;
        padTop = showValues ? fs + 8 : 6;
        padBottom = showXAxis ? fs + 10 : 2;
    }
    const plotW = Math.max(1, plotR - plotL);
    const plotH = Math.max(1, height - padTop - padBottom);
    // Posición en el eje de valores: en vertical crece hacia arriba
    const vPx = (v) => (horizontal
        ? plotL + ((v - sMin) / (sMax - sMin || 1)) * plotW
        : padTop + (1 - (v - sMin) / (sMax - sMin || 1)) * plotH);
    const zero = vPx(Math.min(Math.max(0, sMin), sMax));
    const slot = (horizontal ? plotH : plotW) / span;
    const catStart = horizontal ? padTop : plotL;
    const catAt = (i) => catStart + (i - start) * slot;
    const groupW = slot * (1 - Math.min(0.9, Math.max(0, barGap)));
    const barW = stacked || k === 1 ? groupW : Math.max(1, (groupW - (k - 1) * 2) / k);
    const bars = [];
    for (let i = lo; i <= hi; i++) {
        let accPos = 0, accNeg = 0;
        r.series.forEach((s, si) => {
            var _a;
            const v = s.data[i];
            if (!isNum(v))
                return;
            let a, b;
            if (stacked) {
                if (v >= 0) {
                    a = accPos;
                    b = accPos += v;
                }
                else {
                    a = accNeg;
                    b = accNeg += v;
                }
            }
            else {
                a = 0;
                b = v;
            }
            const pa = vPx(a), pb = vPx(b);
            const cross = catAt(i) + (slot - groupW) / 2 + (stacked || k === 1 ? 0 : si * (barW + 2));
            const color = k === 1 && ((_a = r.pointColors) === null || _a === void 0 ? void 0 : _a[i]) ? resolveColor(theme, r.pointColors[i]) : r.colors[si];
            bars.push({ key: `${si}.${i}`, cross, pos: Math.min(pa, pb), len: Math.abs(pb - pa), color, index: i, value: v });
        });
    }
    // Solo se anima con datos nuevos: de donde estaba cada barra (o desde el 0) a lo nuevo. Con zoom,
    // desplazamiento o ancho distinto va directa. Hasta medir el ancho no hay nada pintado ('')
    const dataKey = JSON.stringify(r.series.map(s => s.data));
    const animKey = width > 0 ? dataKey : '';
    const geomKey = JSON.stringify([width, height, start, span, sMin, sMax]);
    const toMap = new Map(bars.map(b => [b.key, { pos: b.pos, len: b.len }]));
    const bf = (0, react_1.useRef)(undefined);
    if (!bf.current || bf.current.key !== animKey) {
        const prev = ((_c = bf.current) === null || _c === void 0 ? void 0 : _c.key) ? bf.current.to : undefined;
        bf.current = { key: animKey, geom: geomKey, to: toMap, from: new Map(bars.map(b => { var _a; return [b.key, (_a = prev === null || prev === void 0 ? void 0 : prev.get(b.key)) !== null && _a !== void 0 ? _a : { pos: zero, len: 0 }]; })) };
    }
    else if (bf.current.geom !== geomKey || bf.current.to.size !== toMap.size) {
        bf.current = { key: animKey, geom: geomKey, to: toMap, from: toMap };
    }
    const { progress, animating } = useProgress(animKey, animate, duration);
    const touch = useChartGestures({
        select: p.tooltip !== false || !!p.onSelect,
        zoomable: !!p.zoomable && !horizontal && n > 2,
        vp, plotL, plotW,
        pick: (x, y) => {
            if (!n)
                return null;
            const i = Math.floor(start + ((horizontal ? y : x) - catStart) / slot);
            return Math.min(hi, Math.max(lo, i));
        },
        onChange: i => { var _a; return (_a = p.onSelect) === null || _a === void 0 ? void 0 : _a.call(p, i == null ? null : selectionOf(r, i)); },
    });
    (0, react_1.useEffect)(() => { if (touch.selected != null && touch.selected >= n)
        touch.setSelected(null); }, [n]);
    const sel = touch.selected != null && touch.selected < n ? touch.selected : null;
    const every = horizontal ? 1 : Math.max(1, Math.ceil((Math.max(0, ...labelTexts.slice(lo, hi + 1).map(l => textWidth(l, fs))) + 6) / slot));
    const truncate = (l) => {
        const max = Math.floor((catLabelW - 8) / (fs * 0.58));
        return l.length > max && max > 1 ? l.slice(0, max - 1) + '…' : l;
    };
    const clipId = `${gid}clip`;
    return (<ChartFrame p={p} r={r} width={width} onLayout={onLayout} height={height} touch={touch} empty={!allValues.length} legendItems={((_d = p.legend) !== null && _d !== void 0 ? _d : k > 1) ? r.series.map((_, i) => ({ label: r.names[i] || `${i + 1}`, color: r.colors[i] })) : undefined} tooltipAt={i => {
            const group = bars.filter(b => b.index === i);
            if (!group.length)
                return null;
            const c = catAt(i) + slot / 2;
            return horizontal
                ? { x: Math.max(...group.map(b => b.pos + b.len), zero), y: c - slot / 2 + 4 }
                : { x: c, y: Math.min(...group.map(b => b.pos), zero) };
        }}>
            <react_native_svg_1.default width={width} height={height}>
                <react_native_svg_1.Defs>
                    <react_native_svg_1.ClipPath id={clipId}><react_native_svg_1.Rect x={plotL} y={0} width={plotW} height={height}/></react_native_svg_1.ClipPath>
                </react_native_svg_1.Defs>
                {showGrid && ticks.map(t => (horizontal
            ? <react_native_svg_1.Line key={t} x1={vPx(t)} x2={vPx(t)} y1={padTop} y2={padTop + plotH} {...r.grid}/>
            : <react_native_svg_1.Line key={t} x1={plotL} x2={plotR} y1={vPx(t)} y2={vPx(t)} {...r.grid}/>))}
                {/* Eje de valores */}
                {(horizontal ? showXAxis : showYAxis) && ticks.map(t => (horizontal
            ? <react_native_svg_1.Text key={t} x={vPx(t)} y={height - 4} fontSize={fs} fill={r.axisFill} textAnchor="middle">{r.fmtY(t)}</react_native_svg_1.Text>
            : <react_native_svg_1.Text key={t} x={plotL - 6} y={vPx(t) + fs / 3} fontSize={fs} fill={r.axisFill} textAnchor="end">{r.fmtY(t)}</react_native_svg_1.Text>))}
                {/* Eje de categorías */}
                {(horizontal ? showYAxis : showXAxis) && labelTexts.map((l, i) => {
            if (!l || i < lo || i > hi || i % every)
                return null;
            const c = catAt(i) + slot / 2;
            // Con zoom, una barra a medio ver en el borde no lleva etiqueta (se cortaría)
            if (!horizontal && (c < plotL || c > plotR))
                return null;
            return horizontal
                ? <react_native_svg_1.Text key={i} x={catLabelW - 6} y={c + fs / 3} fontSize={fs} fill={r.axisFill} textAnchor="end">{truncate(l)}</react_native_svg_1.Text>
                : <react_native_svg_1.Text key={i} x={c} y={height - 4} fontSize={fs} fill={r.axisFill} textAnchor={xLabelAnchor(c, l, fs, width)}>{l}</react_native_svg_1.Text>;
        })}
                <react_native_svg_1.G clipPath={horizontal ? undefined : `url(#${clipId})`}>
                    {bars.map(b => {
            var _a, _b;
            return (<Bar key={b.key} horizontal={horizontal} cross={b.cross} thickness={barW} radius={barRadius} color={b.color} opacity={sel == null || sel === b.index ? 1 : 0.45} animating={animating} progress={progress} from={(_a = bf.current.from.get(b.key)) !== null && _a !== void 0 ? _a : b} to={(_b = bf.current.to.get(b.key)) !== null && _b !== void 0 ? _b : b}/>);
        })}
                </react_native_svg_1.G>
                {/* Línea del 0 si hay negativos */}
                {sMin < 0 && (horizontal
            ? <react_native_svg_1.Line x1={zero} x2={zero} y1={padTop} y2={padTop + plotH} stroke={r.axisFill} strokeWidth={1}/>
            : <react_native_svg_1.Line x1={plotL} x2={plotR} y1={zero} y2={zero} stroke={r.axisFill} strokeWidth={1}/>)}
                <ReferenceLines lines={p.referenceLines} theme={theme} fs={fs} at={vPx} horizontal={horizontal} from={horizontal ? padTop : plotL} to={horizontal ? padTop + plotH : plotR}/>
                {showValues && (stacked
            ? sums.map((s, i) => {
                if (i < lo || i > hi || !bars.some(b => b.index === i))
                    return null;
                const total = s.pos + s.neg;
                const c = catAt(i) + slot / 2;
                const end = vPx(s.pos > 0 ? s.pos : s.neg);
                return horizontal
                    ? <react_native_svg_1.Text key={i} x={end + 4} y={c + r.valueLabel.fontSize / 3} textAnchor="start" {...r.valueLabel}>{r.fmtValue(total)}</react_native_svg_1.Text>
                    : <react_native_svg_1.Text key={i} x={c} y={end - 4} textAnchor="middle" {...r.valueLabel}>{r.fmtValue(total)}</react_native_svg_1.Text>;
            })
            : bars.map(b => {
                const neg = b.value < 0;
                return horizontal
                    ? <react_native_svg_1.Text key={b.key} x={neg ? b.pos - 4 : b.pos + b.len + 4} y={b.cross + barW / 2 + r.valueLabel.fontSize / 3} textAnchor={neg ? 'end' : 'start'} {...r.valueLabel}>{r.fmtValue(b.value)}</react_native_svg_1.Text>
                    : <react_native_svg_1.Text key={b.key} x={b.cross + barW / 2} y={neg ? b.pos + b.len + r.valueLabel.fontSize + 2 : b.pos - 4} textAnchor="middle" {...r.valueLabel}>{r.fmtValue(b.value)}</react_native_svg_1.Text>;
            }))}
            </react_native_svg_1.default>
        </ChartFrame>);
};
/* ---------------- Tarta y donut ---------------- */
const Slice = ({ cx, cy, r, inner, from, to, pad, progress, offset, color, opacity }) => {
    const off = (0, react_native_reanimated_1.useSharedValue)(0);
    (0, react_1.useEffect)(() => { off.value = (0, react_native_reanimated_1.withTiming)(offset, { duration: 180 }); }, [offset]);
    const props = (0, react_native_reanimated_1.useAnimatedProps)(() => {
        const p = progress.value;
        const a0 = from[0] + (to[0] - from[0]) * p;
        const a1 = from[1] + (to[1] - from[1]) * p;
        const mid = (a0 + a1) / 2;
        const half = a1 - a0 > pad * 2 && a1 - a0 < TAU - 0.0001 ? pad : 0;
        return { d: arcPath(cx + Math.sin(mid) * off.value, cy - Math.cos(mid) * off.value, r, inner, a0 + half, a1 - half) };
    });
    return <AnimatedPath animatedProps={props} fill={color} opacity={opacity}/>;
};
const formatPercentDefault = (p) => `${p >= 10 || p === 0 ? Math.round(p) : Math.round(p * 10) / 10}%`;
const PieBase = (_a) => {
    var _b, _c, _d, _e;
    var { theme } = _a, p = __rest(_a, ["theme"]);
    const { data, labels, size: sizeProp, innerRadius = 0, padAngle = 0, startAngle = 0, showValues = false, legendValue = 'percent', centerLabel, tooltip, renderTooltip, onSelect, selectedOffset = 6, formatPercent = formatPercentDefault, groupSmall, othersLabel, width: widthProp, height: _h, aspectRatio: _ar, colors, animate = true, duration = 700, legend = true, legendPosition, loading, formatValue = defaultFormatValue, emptyText, _valueLabel, _centerValue, _centerLabel, _legend, _legendText, _tooltip, _tooltipText, _emptyText, variant: _v } = p, boxProps = __rest(p, ["data", "labels", "size", "innerRadius", "padAngle", "startAngle", "showValues", "legendValue", "centerLabel", "tooltip", "renderTooltip", "onSelect", "selectedOffset", "formatPercent", "groupSmall", "othersLabel", "width", "height", "aspectRatio", "colors", "animate", "duration", "legend", "legendPosition", "loading", "formatValue", "emptyText", "_valueLabel", "_centerValue", "_centerLabel", "_legend", "_legendText", "_tooltip", "_tooltipText", "_emptyText", "variant"]);
    const { width, onLayout } = useChartWidth(widthProp);
    const palette = colors !== null && colors !== void 0 ? colors : DEFAULT_PALETTE;
    // Porciones (los valores 0, negativos o vacíos no se dibujan)
    let items = data.map((d, i) => {
        var _a, _b, _c;
        const o = typeof d === 'number' ? { value: d } : d;
        return { label: (_b = (_a = o.label) !== null && _a !== void 0 ? _a : labels === null || labels === void 0 ? void 0 : labels[i]) !== null && _b !== void 0 ? _b : '', value: isNum(o.value) && o.value > 0 ? o.value : 0, color: resolveColor(theme, (_c = o.color) !== null && _c !== void 0 ? _c : palette[i % palette.length]) };
    });
    const total = items.reduce((a, b) => a + b.value, 0);
    // groupSmall: las pequeñas se juntan al final en "Otros" (si hay al menos dos que juntar)
    if (groupSmall && total) {
        const small = items.filter(it => it.value > 0 && (it.value / total) * 100 < groupSmall);
        if (small.length > 1) {
            items = items.filter(it => !small.includes(it));
            items.push({ label: othersLabel !== null && othersLabel !== void 0 ? othersLabel : (0, translate_1.libT)('others'), value: small.reduce((a, b) => a + b.value, 0), color: resolveColor(theme, 'silver.100') });
        }
    }
    const size = Math.max(40, Math.min(sizeProp !== null && sizeProp !== void 0 ? sizeProp : 200, width || sizeProp || 200));
    const cx = width / 2, cy = size / 2;
    const r = size / 2 - selectedOffset;
    const inner = Math.min(0.95, Math.max(0, innerRadius)) * r;
    const start = (startAngle * Math.PI) / 180;
    const angles = [];
    let acc = start;
    items.forEach(it => { const a = total ? (it.value / total) * TAU : 0; angles.push([acc, acc + a]); acc += a; });
    // Animación: de los ángulos que se veían (o de cero, en el inicio) a los nuevos
    // Solo con datos nuevos (no al cambiar de ancho); hasta medir el ancho no hay nada pintado ('')
    const key = width > 0 ? JSON.stringify(angles) : '';
    const frames = (0, react_1.useRef)(undefined);
    if (((_b = frames.current) === null || _b === void 0 ? void 0 : _b.key) !== key) {
        const prev = ((_c = frames.current) === null || _c === void 0 ? void 0 : _c.key) ? frames.current.to : undefined;
        frames.current = { key, to: angles, from: angles.map((_, i) => { var _a; return (_a = prev === null || prev === void 0 ? void 0 : prev[i]) !== null && _a !== void 0 ? _a : (prev ? [acc, acc] : [start, start]); }) };
    }
    const progress = (0, react_native_reanimated_1.useSharedValue)(animate ? 0 : 1);
    const [ready, setReady] = (0, react_1.useState)(!animate);
    (0, react_1.useLayoutEffect)(() => {
        if (!animate) {
            progress.value = 1;
            setReady(true);
            return;
        }
        progress.value = 0;
        progress.value = (0, react_native_reanimated_1.withTiming)(1, { duration, easing: EASING });
        // Los textos sobre las porciones aparecen al terminar (si no, flotarían sobre porciones a medio dibujar)
        setReady(false);
        const t = setTimeout(() => setReady(true), duration);
        return () => clearTimeout(t);
    }, [key, animate]);
    const [selected, setSelected] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => { if (selected != null && selected >= items.length)
        setSelected(null); }, [items.length]);
    const selectionOf = (i) => ({ index: i, label: items[i].label || undefined, value: items[i].value, percent: total ? (items[i].value / total) * 100 : 0, color: items[i].color });
    const select = (i) => {
        const next = i === selected ? null : i;
        setSelected(next);
        onSelect === null || onSelect === void 0 ? void 0 : onSelect(next == null ? null : selectionOf(next));
    };
    const pick = (x, y) => {
        const dx = x - cx, dy = y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > r + selectedOffset || dist < inner - 2)
            return null;
        const a = ((Math.atan2(dx, -dy) - start) % TAU + TAU) % TAU;
        const i = angles.findIndex(([a0, a1]) => a1 > a0 && a >= a0 - start && a < a1 - start);
        return i < 0 ? null : i;
    };
    const showTooltip = tooltip !== null && tooltip !== void 0 ? tooltip : inner === 0;
    const sel = selected != null && selected < items.length ? selectionOf(selected) : null;
    const tooltipPos = (() => {
        if (!sel)
            return null;
        const [a0, a1] = angles[sel.index];
        const mid = (a0 + a1) / 2;
        const rr = inner ? (r + inner) / 2 : r * 0.6;
        return { x: cx + Math.sin(mid) * rr, y: cy - Math.cos(mid) * rr };
    })();
    const valueLabel = Object.assign(Object.assign({ fontSize: 11, fontWeight: '700' }, _valueLabel), { fill: resolveColor(theme, (_d = _valueLabel === null || _valueLabel === void 0 ? void 0 : _valueLabel.fill) !== null && _d !== void 0 ? _d : 'white') });
    const center = centerLabel === false || inner < 24 ? null
        : typeof centerLabel === 'function' ? centerLabel({ total, selected: sel })
            : centerLabel !== undefined ? centerLabel
                : (<Box_1.Box alignItems="center" maxW={inner * 1.6}>
                        <Text_1.Text fontSize={Math.max(12, Math.min(22, inner / 3))} fontWeight="700" numberOfLines={1} {..._centerValue}>
                            {formatValue(sel ? sel.value : total)}
                        </Text_1.Text>
                        <Text_1.Text fontSize={11} color="gray" numberOfLines={1} {..._centerLabel}>
                            {sel ? `${(_e = sel.label) !== null && _e !== void 0 ? _e : ''} · ${formatPercent(sel.percent)}` : (0, translate_1.libT)('total')}
                        </Text_1.Text>
                    </Box_1.Box>);
    const legendEl = legend && total > 0 && !loading ? (<Legend _legend={Object.assign(Object.assign({}, (legendPosition === 'top' ? { mt: 0, mb: 8 } : null)), _legend)} _legendText={_legendText} items={items.map(it => ({
            label: it.label, color: it.color,
            value: legendValue === 'none' ? undefined : legendValue === 'value' ? formatValue(it.value) : formatPercent((it.value / total) * 100),
        })).filter(it => it.label)}/>) : null;
    return (<Box_1.Box {...boxProps}>
            {legendPosition === 'top' && legendEl}
            <react_native_1.View onLayout={onLayout} style={{ width: '100%', height: size }} accessibilityRole="image">
                {loading ? <Box_1.Box flex={1} alignItems="center" justifyContent="center"><Spinner_1.Spinner /></Box_1.Box> : !total ? <ChartEmpty height={size} text={emptyText !== null && emptyText !== void 0 ? emptyText : (0, translate_1.libT)('noData')} _emptyText={_emptyText}/>
            : width > 0 && (<>
                            <react_native_svg_1.default width={width} height={size}>
                                {items.map((it, i) => (<Slice key={i} cx={cx} cy={cy} r={r} inner={inner} from={frames.current.from[i]} to={frames.current.to[i]} pad={(padAngle * Math.PI) / 360} progress={progress} offset={selected === i ? selectedOffset : 0} color={it.color} opacity={selected == null || selected === i ? 1 : 0.55}/>))}
                                {ready && showValues && items.map((it, i) => {
                    const [a0, a1] = angles[i];
                    if (a1 - a0 < 0.35)
                        return null; // no cabe
                    const mid = (a0 + a1) / 2;
                    const rr = inner ? (r + inner) / 2 : r * 0.62;
                    const text = showValues === 'value' ? formatValue(it.value) : formatPercent((it.value / total) * 100);
                    return (<react_native_svg_1.Text key={i} x={cx + Math.sin(mid) * rr} y={cy - Math.cos(mid) * rr + valueLabel.fontSize / 3} textAnchor="middle" {...valueLabel}>{text}</react_native_svg_1.Text>);
                })}
                            </react_native_svg_1.default>
                            {center && (<react_native_1.View pointerEvents="none" style={[react_native_1.StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>{center}</react_native_1.View>)}
                            <react_native_1.View style={react_native_1.StyleSheet.absoluteFill} onStartShouldSetResponder={() => true} onResponderRelease={e => select(pick(e.nativeEvent.locationX, e.nativeEvent.locationY))}/>
                            {showTooltip && sel && tooltipPos && (<Tooltip x={tooltipPos.x} y={tooltipPos.y} width={width} _tooltip={_tooltip}>
                                    {renderTooltip ? renderTooltip(sel) : (<TooltipRow label={sel.label} value={`${formatValue(sel.value)} (${formatPercent(sel.percent)})`} _tooltipText={_tooltipText}/>)}
                                </Tooltip>)}
                        </>)}
            </react_native_1.View>
            {legendPosition !== 'top' && legendEl}
        </Box_1.Box>);
};
/* ---------------- ProgressRing ---------------- */
const ProgressRingBase = (_a) => {
    var { theme } = _a, p = __rest(_a, ["theme"]);
    const { value, max = 100, size = 120, thickness = 12, color = 'primary.100', trackColor = 'light.100', half = false, animate = true, duration = 700, showValue = true, formatValue, label, children, _value, _label, variant: _v } = p, boxProps = __rest(p, ["value", "max", "size", "thickness", "color", "trackColor", "half", "animate", "duration", "showValue", "formatValue", "label", "children", "_value", "_label", "variant"]);
    const pct = Math.min(1, Math.max(0, max ? (isNum(value) ? value : 0) / max : 0));
    const r = (size - thickness) / 2;
    const cx = size / 2, cy = size / 2;
    const length = half ? Math.PI * r : TAU * r;
    const d = half
        ? `M${cx - r},${cy}A${r},${r} 0 0 1 ${cx + r},${cy}`
        : `M${cx},${cy - r}A${r},${r} 0 1 1 ${cx},${cy + r}A${r},${r} 0 1 1 ${cx},${cy - r}`;
    const height = half ? size / 2 + thickness / 2 : size;
    const sv = (0, react_native_reanimated_1.useSharedValue)(animate ? 0 : pct);
    (0, react_1.useEffect)(() => { sv.value = animate ? (0, react_native_reanimated_1.withTiming)(pct, { duration, easing: EASING }) : pct; }, [pct]);
    const props = (0, react_native_reanimated_1.useAnimatedProps)(() => ({
        strokeDashoffset: length * (1 - sv.value),
        // Con extremo redondeado, 0 se vería como un punto
        strokeOpacity: sv.value > 0.001 ? 1 : 0,
    }));
    const text = formatValue ? formatValue(value, pct * 100) : `${Math.round(pct * 100)}%`;
    return (<Box_1.Box w={size} h={height} {...boxProps} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max, now: value }}>
            <react_native_svg_1.default width={size} height={height}>
                <react_native_svg_1.Path d={d} stroke={resolveColor(theme, trackColor)} strokeWidth={thickness} fill="none" strokeLinecap="round"/>
                <AnimatedPath d={d} stroke={resolveColor(theme, color)} strokeWidth={thickness} fill="none" strokeLinecap="round" strokeDasharray={`${length} ${length}`} animatedProps={props}/>
            </react_native_svg_1.default>
            {(children || showValue || label) && (<react_native_1.View pointerEvents="none" style={[react_native_1.StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: half ? 'flex-end' : 'center', paddingHorizontal: thickness + 4 }]}>
                    {children !== null && children !== void 0 ? children : (<>
                            {showValue && <Text_1.Text fontSize={Math.max(12, half ? size / 8 : size / 5.5)} fontWeight="700" numberOfLines={1} {..._value}>{text}</Text_1.Text>}
                            {label ? <Text_1.Text fontSize={11} color="gray" {..._label}>{label}</Text_1.Text> : null}
                        </>)}
                </react_native_1.View>)}
        </Box_1.Box>);
};
// Lo que cambia cada tipo (el tema y las props van por encima)
const TYPE_DEFAULTS = {
    line: {},
    area: { area: true, curve: 'monotone' },
    sparkline: { height: 40, showGrid: false, showXAxis: false, showYAxis: false, tooltip: false, dots: false, curve: 'monotone', strokeWidth: 1.5 },
    bar: {},
    column: {},
    horizontalBar: {},
    pie: { showValues: 'percent' },
    donut: { innerRadius: 0.62, padAngle: 1.5 },
    progress: {},
};
/**
 * Gráficos: type = line (evolución), area (tendencia con relleno), sparkline (mínimo, para tarjetas),
 * bar / column (categorías; bar con horizontal), horizontalBar, pie (porcentajes), donut o progress (aro de progreso).
 * @example <Chart type="line" data={[10, 40, 25]} labels={['Ene', 'Feb', 'Mar']} />
 * @example <Chart type="column" series={[{ name: 'Online', data: [4, 6] }, { name: 'Tienda', data: [7, 5] }]} labels={['2024', '2025']} stacked />
 * @example <Chart type="donut" data={[{ label: 'Casa', value: 900 }, { label: 'Ocio', value: 210 }]} />
 * @example <Chart type="progress" value={65} label="Completado" />
 */
const Chart = props => {
    // Defaults del tipo → theme.components.Chart → variante → props → plataforma
    const [_a, theme] = (0, useThemeProps_1.useThemeProps)('Chart', props, { defaults: TYPE_DEFAULTS[props.type] }), { type } = _a, p = __rest(_a, ["type"]);
    switch (type) {
        case 'bar': return <BarBase {...p} theme={theme}/>;
        case 'column': return <BarBase {...p} horizontal={false} theme={theme}/>;
        case 'horizontalBar': return <BarBase {...p} horizontal theme={theme}/>;
        case 'pie':
        case 'donut': return <PieBase {...p} theme={theme}/>;
        case 'progress': return <ProgressRingBase {...p} theme={theme}/>;
        default: return <LineBase {...p} theme={theme}/>;
    }
};
exports.Chart = Chart;
