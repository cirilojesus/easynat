// Chart: líneas, áreas, sparkline, barras (verticales, horizontales, agrupadas o apiladas), pie, donut y progreso
// circular, todo en un componente con type="...". Dibuja con react-native-svg y anima con reanimated: los paths
// son worklets, así que la animación corre en el hilo de UI
import React, { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { GestureResponderEvent, LayoutChangeEvent, StyleSheet, View } from "react-native";
import Svg, { Circle, ClipPath, Defs, G, Line, LinearGradient, Path, Rect, Stop, Text as SvgText } from "react-native-svg";
import Animated, { Easing, SharedValue, useAnimatedProps, useSharedValue, withTiming } from "react-native-reanimated";
import { Box, EABoxProps } from "./Box";
import { EATextProps, Text } from "./Text";
import { Spinner } from "./Spinner";
import { Theme, ThemeColor } from "./theme";
import { libT } from "./utils/translate";
import { useThemeProps } from "./utils/useThemeProps";
import { useTheme } from "./theme-provider";

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedRect = Animated.createAnimatedComponent(Rect);
const EASING = Easing.out(Easing.cubic);
const TAU = Math.PI * 2;

/* ---------------- Tipos públicos ---------------- */

export type ChartColor = ThemeColor | (string & {});

/** Un punto de una serie simple: número o { label, value, color } */
export type ChartDatum = number | null | { label?: string; value: number | null; color?: ChartColor };

export type ChartSeries = {
    name?: string;
    data: (number | null)[];
    color?: ChartColor;
};

/** Lo que se selecciona al tocar un gráfico de ejes (líneas, áreas y barras) */
export type ChartSelection = {
    index: number;
    label?: string;
    values: { name?: string; value: number | null; color: string }[];
};

export type ChartBaseProps = Omit<EABoxProps, 'children'> & {
    /** Ancho en px. Por defecto, el del contenedor */
    width?: number;
    /** Alto en px del área del gráfico (sin leyenda) */
    height?: number;
    /** Alto según el ancho (ancho / alto), en lugar de height: se adapta a cualquier pantalla */
    aspectRatio?: number;
    /** Paleta para las series o porciones sin color propio (claves del tema o colores) */
    colors?: ChartColor[];
    /** Animación al aparecer y al cambiar los datos. Por defecto true */
    animate?: boolean;
    /** Duración de la animación en ms. Por defecto 600 */
    duration?: number;
    /** Leyenda (por defecto, con varias series y en pie / donut) */
    legend?: boolean;
    /** Leyenda arriba o abajo. Por defecto abajo */
    legendPosition?: 'top' | 'bottom';
    /** Indicador de carga en lugar del gráfico (mientras llegan los datos) */
    loading?: boolean;
    /** Formato de los valores (tooltip, etiquetas, leyenda) */
    formatValue?: (value: number) => string;
    /** Texto sin datos. Por defecto "Sin datos" / "No data" */
    emptyText?: string;
    _legend?: EABoxProps;
    _legendText?: EATextProps;
    _tooltip?: EABoxProps;
    _tooltipText?: EATextProps;
    _emptyText?: EATextProps;
    variant?: (string & {});
};

/* ---------------- Colores ---------------- */

const DEFAULT_PALETTE: ChartColor[] = [
    'primary.100', 'secondary.100', 'success.100', 'warning.100', 'info.100', 'danger.100',
    '#8B5CF6', '#14B8A6', '#F97316', '#64748B',
];

const resolveColor = (theme: Theme, color: ChartColor | undefined, fallback = '#000') =>
    (color && (theme.colors?.[color as ThemeColor] || color)) || fallback;

/* ---------------- Números ---------------- */

const numberFormatters = new Map<number, Intl.NumberFormat>();
const formatWithDecimals = (value: number, decimals: number) => {
    let f = numberFormatters.get(decimals);
    if (!f) numberFormatters.set(decimals, f = new Intl.NumberFormat(undefined, { maximumFractionDigits: decimals }));
    return f.format(value);
};

/** 1234.5 → "1.234,5" (según el idioma del dispositivo, hasta 2 decimales) */
const defaultFormatValue = (value: number) => formatWithDecimals(value, 2);

/** Para los ejes: 1500 → "1,5k", 2300000 → "2,3M" */
export const compactNumber = (value: number) => {
    const abs = Math.abs(value);
    for (const [n, suffix] of [[1e12, 'T'], [1e9, 'B'], [1e6, 'M'], [1e3, 'k']] as const)
        if (abs >= n) return formatWithDecimals(value / n, 1) + suffix;
    return formatWithDecimals(value, abs < 10 ? 2 : 1);
};

const niceNumber = (range: number, round: boolean) => {
    const exp = Math.floor(Math.log10(range));
    const f = range / Math.pow(10, exp);
    const nice = round
        ? (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10)
        : (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10);
    return nice * Math.pow(10, exp);
};

/** Escala "bonita" para un eje: límites y marcas en números redondos (0, 25, 50...) */
const niceScale = (min: number, max: number, count = 5) => {
    if (!Number.isFinite(min) || !Number.isFinite(max)) { min = 0; max = 1 }
    if (min === max) {
        const pad = Math.abs(min) * 0.1 || 1;
        min -= min === 0 ? 0 : pad;
        max += pad;
    }
    const step = niceNumber(niceNumber(max - min, false) / Math.max(1, count - 1), true);
    const niceMin = Math.floor(min / step) * step;
    const niceMax = Math.ceil(max / step) * step;
    const decimals = Math.max(0, -Math.floor(Math.log10(step)));
    const ticks: number[] = [];
    for (let v = niceMin; v <= niceMax + step / 2; v += step) ticks.push(Number(v.toFixed(decimals)));
    return { min: niceMin, max: niceMax, ticks };
};

/* ---------------- Datos ---------------- */

/** data simple (números u objetos) o series → series normalizadas + etiquetas + colores por punto */
const normalizeSeries = (data: ChartDatum[] | undefined, series: ChartSeries[] | undefined, labels?: string[]) => {
    if (series?.length) {
        const length = Math.max(0, ...series.map(s => s.data.length));
        return { series, labels: labels ?? [], length, pointColors: undefined as (ChartColor | undefined)[] | undefined };
    }
    const items = data ?? [];
    const values = items.map(d => (d == null ? null : typeof d === 'number' ? d : d.value));
    const pointColors = items.map(d => (d && typeof d === 'object' ? d.color : undefined));
    const itemLabels = items.map((d, i) => (d && typeof d === 'object' && d.label != null ? d.label : labels?.[i] ?? ''));
    return { series: [{ data: values }] as ChartSeries[], labels: itemLabels, length: values.length, pointColors: pointColors.some(Boolean) ? pointColors : undefined };
};

const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

/* ---------------- Tamaño del contenedor ---------------- */

/** El ancho del contenedor (si no se pasa width): se mide con onLayout */
const useChartWidth = (width?: number) => {
    const [measured, setMeasured] = useState(0);
    const onLayout = useCallback((e: LayoutChangeEvent) => {
        const w = Math.round(e.nativeEvent.layout.width);
        setMeasured(prev => (prev === w ? prev : w));
    }, []);
    return { width: width ?? measured, onLayout: width == null ? onLayout : undefined };
};

/** Ancho aproximado de un texto (sin medir): suficiente para reservar el hueco de los ejes */
const textWidth = (text: string, fontSize: number) => text.length * fontSize * 0.58;

/* ---------------- Leyenda, tooltip y vacío ---------------- */

const Legend = ({ items, _legend, _legendText }: {
    items: { label: string; color: string; value?: string }[];
    _legend?: EABoxProps;
    _legendText?: EATextProps;
}) => (
    <Box flexDir="row" flexWrap="wrap" justifyContent="center" gap={12} mt={8} {..._legend}>
        {items.map((item, i) => (
            <Box key={i} flexDir="row" alignItems="center" gap={1.5}>
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: item.color }} />
                <Text fontSize={12} color="gray" {..._legendText}>
                    {item.label}{item.value != null ? <Text fontSize={12} fontWeight="700" {..._legendText}>{`  ${item.value}`}</Text> : null}
                </Text>
            </Box>
        ))}
    </Box>
);

/** Recuadro flotante que se coloca sobre (x, y) sin salirse del gráfico */
const Tooltip = ({ x, y, width, children, _tooltip }: { x: number; y: number; width: number; children: React.ReactNode; _tooltip?: EABoxProps }) => {
    const [size, setSize] = useState<{ w: number; h: number } | null>(null);
    const left = size ? Math.min(Math.max(0, x - size.w / 2), Math.max(0, width - size.w)) : 0;
    const top = size ? (y - size.h - 10 >= 0 ? y - size.h - 10 : y + 12) : 0;
    return (
        <View
            pointerEvents="none"
            onLayout={e => { const { width: w, height: h } = e.nativeEvent.layout; setSize(s => (s && s.w === w && s.h === h ? s : { w, h })) }}
            style={{ position: 'absolute', left, top, opacity: size ? 1 : 0 }}
        >
            <Box bg="dark.100" rounded={2} px={2.5} py={1.5} {..._tooltip}>{children}</Box>
        </View>
    );
};

const TooltipRow = ({ color, label, value, _tooltipText }: { color?: string; label?: string; value: string; _tooltipText?: EATextProps }) => (
    <Box flexDir="row" alignItems="center" gap={1.5}>
        {color ? <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} /> : null}
        <Text fontSize={12} color="white" {..._tooltipText}>
            {label ? `${label}: ` : ''}<Text fontSize={12} fontWeight="700" color="white" {..._tooltipText}>{value}</Text>
        </Text>
    </Box>
);

const ChartEmpty = ({ height, text, _emptyText }: { height: number; text: string; _emptyText?: EATextProps }) => (
    <Box h={height} alignItems="center" justifyContent="center">
        <Text color="silver.100" {..._emptyText}>{text}</Text>
    </Box>
);

/* ---------------- Paths (worklets) ---------------- */

export type ChartCurve = 'linear' | 'monotone' | 'step';

// Va antes que linePath: el plugin de reanimated convierte los worklets en constantes (sin hoisting)
function segmentPath(xs: number[], ys: number[], a: number, b: number, curve: ChartCurve, base?: number): string {
    'worklet';
    let d = `M${xs[a]},${ys[a]}`;
    if (curve === 'step') {
        for (let i = a + 1; i <= b; i++) d += `H${xs[i]}V${ys[i]}`;
    } else if (curve === 'monotone' && b - a >= 2) {
        // Cúbica monótona (Fritsch-Carlson): suave, sin pasarse por encima o por debajo de los valores
        const n = b - a + 1;
        const m: number[] = [];
        const t: number[] = [];
        for (let i = 0; i < n - 1; i++) {
            const dx = xs[a + i + 1] - xs[a + i];
            m.push(dx === 0 ? 0 : (ys[a + i + 1] - ys[a + i]) / dx);
        }
        t.push(m[0]);
        for (let i = 1; i < n - 1; i++) t.push(m[i - 1] * m[i] <= 0 ? 0 : (m[i - 1] + m[i]) / 2);
        t.push(m[n - 2]);
        for (let i = 0; i < n - 1; i++) {
            if (m[i] === 0) { t[i] = 0; t[i + 1] = 0; continue }
            const p = t[i] / m[i];
            const q = t[i + 1] / m[i];
            const s = p * p + q * q;
            if (s > 9) { const k = 3 / Math.sqrt(s); t[i] = k * p * m[i]; t[i + 1] = k * q * m[i] }
        }
        for (let i = 0; i < n - 1; i++) {
            const x0 = xs[a + i], x1 = xs[a + i + 1], y0 = ys[a + i], y1 = ys[a + i + 1];
            const dx = (x1 - x0) / 3;
            d += `C${x0 + dx},${y0 + t[i] * dx},${x1 - dx},${y1 - t[i + 1] * dx},${x1},${y1}`;
        }
    } else {
        for (let i = a + 1; i <= b; i++) d += `L${xs[i]},${ys[i]}`;
    }
    if (base != null) d += `L${xs[b]},${base}L${xs[a]},${base}Z`;
    return d;
}

/**
 * Path de una línea por los puntos (xs[i], ys[i]); un y null corta la línea (hueco).
 * Con `base`, cada tramo se cierra hasta esa altura (área).
 */
function linePath(xs: number[], ys: (number | null)[], curve: ChartCurve, base?: number): string {
    'worklet';
    let d = '';
    let start = -1;
    for (let i = 0; i <= ys.length; i++) {
        const y = i < ys.length ? ys[i] : null;
        if (y != null && start < 0) start = i;
        if ((y == null || i === ys.length) && start >= 0) {
            d += segmentPath(xs, ys as number[], start, i - 1, curve, base);
            start = -1;
        }
    }
    return d;
}

/** Porción de tarta o de donut entre dos ángulos (radianes, 0 = arriba, sentido horario) */
function arcPath(cx: number, cy: number, r: number, inner: number, a0: number, a1: number): string {
    'worklet';
    const sweep = a1 - a0;
    if (sweep <= 0.0001) return '';
    const pt = (radius: number, a: number) => `${cx + radius * Math.sin(a)},${cy - radius * Math.cos(a)}`;
    if (sweep >= Math.PI * 2 - 0.0001) {
        // Círculo completo: dos medias vueltas (un arco SVG no puede empezar y acabar en el mismo punto)
        const ring = `M${pt(r, 0)}A${r},${r} 0 1 1 ${pt(r, Math.PI)}A${r},${r} 0 1 1 ${pt(r, 0)}Z`;
        return inner > 0 ? ring + `M${pt(inner, 0)}A${inner},${inner} 0 1 0 ${pt(inner, Math.PI)}A${inner},${inner} 0 1 0 ${pt(inner, 0)}Z` : ring;
    }
    const large = sweep > Math.PI ? 1 : 0;
    if (inner <= 0) return `M${cx},${cy}L${pt(r, a0)}A${r},${r} 0 ${large} 1 ${pt(r, a1)}Z`;
    return `M${pt(r, a0)}A${r},${r} 0 ${large} 1 ${pt(r, a1)}L${pt(inner, a1)}A${inner},${inner} 0 ${large} 0 ${pt(inner, a0)}Z`;
}

/* ---------------- Props de los gráficos con ejes ---------------- */

/** Línea de referencia (objetivo, media, límite...) en un valor del eje de valores */
export type ChartReferenceLine = { value: number; label?: string; color?: ChartColor; dashed?: boolean; strokeWidth?: number };

/** Índices visibles con zoom (null = todo) */
export type ChartZoomRange = { start: number; end: number };

export type CartesianChartProps = ChartBaseProps & {
    /** Una serie: números o { label, value, color } */
    data?: ChartDatum[];
    /** Varias series: [{ name, data, color }] (con labels para el eje X) */
    series?: ChartSeries[];
    /** Etiquetas del eje de categorías */
    labels?: string[];
    yMin?: number;
    yMax?: number;
    /** Número aproximado de marcas en el eje de valores. Por defecto 5 */
    yTicks?: number;
    showGrid?: boolean;
    showXAxis?: boolean;
    showYAxis?: boolean;
    /** Valor encima de cada punto o barra */
    showValues?: boolean;
    /** Formato de las marcas del eje de valores. Por defecto compacto (1,5k) o formatValue si se pasa */
    formatYLabel?: (value: number) => string;
    /** Formato de las etiquetas del eje de categorías */
    formatLabel?: (label: string, index: number) => string;
    /** Tooltip al tocar. Por defecto true */
    tooltip?: boolean;
    renderTooltip?: (selection: ChartSelection) => React.ReactNode;
    /** Al tocar un punto o barra (null al quitar la selección) */
    onSelect?: (selection: ChartSelection | null) => void;
    /** Líneas de referencia: objetivo, media, límite... */
    referenceLines?: ChartReferenceLine[];
    /**
     * Zoom con dos dedos en el eje de categorías; con zoom, arrastrar con un dedo desplaza y un doble toque
     * lo quita. El eje de valores se ajusta a lo visible. No aplica a las barras horizontales
     */
    zoomable?: boolean;
    /** Zoom máximo (veces). Por defecto 10 */
    maxZoom?: number;
    /** Muestra solo los últimos N puntos (se desplaza para ver el resto). Útil con series largas */
    visiblePoints?: number;
    /** Al cambiar el zoom: los índices visibles (null = todo) */
    onZoomChange?: (range: ChartZoomRange | null) => void;
    _grid?: { stroke?: ChartColor; strokeWidth?: number; strokeDasharray?: string };
    _axisLabel?: { fill?: ChartColor; fontSize?: number };
    _valueLabel?: { fill?: ChartColor; fontSize?: number; fontWeight?: string };
};

export type LineChartProps = CartesianChartProps & {
    /** linear, monotone (suave) o step (escalones). Por defecto linear */
    curve?: ChartCurve;
    strokeWidth?: number;
    /** Un punto en cada valor. Por defecto, si se ven 20 o menos */
    dots?: boolean;
    dotSize?: number;
    /** Rellena el área bajo la línea */
    area?: boolean;
    /** El relleno del área en degradado (si no, color plano). Por defecto true */
    gradient?: boolean;
    fillOpacity?: number;
};

export type BarChartProps = CartesianChartProps & {
    /** Barras horizontales */
    horizontal?: boolean;
    /** Series apiladas (si no, agrupadas) */
    stacked?: boolean;
    barRadius?: number;
    /** Hueco entre categorías, de 0 a 1 del ancho de cada una. Por defecto 0.3 */
    barGap?: number;
};

/* ---------------- Comunes ---------------- */

type Resolved = {
    theme: Theme;
    names: string[];
    colors: string[];
    labels: string[];
    series: ChartSeries[];
    length: number;
    pointColors?: (ChartColor | undefined)[];
    fmtValue: (v: number) => string;
    fmtY: (v: number) => string;
    fmtLabel: (l: string, i: number) => string;
    fs: number;
    axisFill: string;
    grid: { stroke: string; strokeWidth: number; strokeDasharray?: string };
    valueLabel: { fill: string; fontSize: number; fontWeight: string };
};

const resolveCommon = (theme: Theme, p: CartesianChartProps): Resolved => {
    const norm = normalizeSeries(p.data, p.series, p.labels);
    const palette = p.colors ?? DEFAULT_PALETTE;
    const fmtValue = p.formatValue ?? defaultFormatValue;
    return {
        theme,
        ...norm,
        names: norm.series.map((s, i) => s.name ?? (norm.series.length > 1 ? `${i + 1}` : '')),
        colors: norm.series.map((s, i) => resolveColor(theme, s.color ?? palette[i % palette.length])),
        fmtValue,
        fmtY: p.formatYLabel ?? p.formatValue ?? compactNumber,
        fmtLabel: p.formatLabel ?? (l => l),
        fs: p._axisLabel?.fontSize ?? 10,
        axisFill: resolveColor(theme, p._axisLabel?.fill ?? 'silver.100'),
        grid: { strokeWidth: StyleSheet.hairlineWidth * 2, strokeDasharray: '4 4', ...p._grid, stroke: resolveColor(theme, p._grid?.stroke ?? 'light.100') },
        valueLabel: { fontSize: 10, fontWeight: '600', ...p._valueLabel, fill: resolveColor(theme, p._valueLabel?.fill ?? 'gray.100') },
    };
};

/** Escala del eje de valores con lo visible (y las líneas de referencia, para que se vean) */
const valueScale = (values: number[], p: CartesianChartProps, includeZero: boolean, count: number) => {
    const refs = (p.referenceLines ?? []).map(l => l.value).filter(isNum);
    const all = values.concat(refs);
    let lo = Math.min(...all), hi = Math.max(...all);
    if (includeZero) { lo = Math.min(0, lo); hi = Math.max(0, hi) }
    const scale = niceScale(p.yMin ?? lo, p.yMax ?? hi, count);
    const min = p.yMin ?? scale.min, max = p.yMax ?? scale.max;
    return { min, max, ticks: scale.ticks.filter(t => t >= min - 1e-9 && t <= max + 1e-9) };
};

/* ---------------- Zoom ---------------- */

const nextFrame = (fn: () => void) => (typeof requestAnimationFrame === 'function' ? requestAnimationFrame(fn) : setTimeout(fn, 16));

type Viewport = { start: number; span: number };

/**
 * Ventana visible en el eje de categorías, en índices. En líneas el ancho completo es n - 1 (de punto a punto)
 * y en barras n (huecos). null = todo
 */
const useViewport = (n: number, slots: boolean, p: CartesianChartProps) => {
    const full = Math.max(1, slots ? n : n - 1);
    const minSpan = Math.min(full, Math.max(2, full / Math.max(1, p.maxZoom ?? 10)));
    const clamp = (v: Viewport): Viewport => {
        const span = Math.min(full, Math.max(minSpan, v.span));
        return { span, start: Math.min(full - span, Math.max(0, v.start)) };
    };
    const initial = (): Viewport | null => (p.visiblePoints && p.visiblePoints < n
        ? clamp({ span: slots ? p.visiblePoints : p.visiblePoints - 1, start: Infinity }) : null);
    const [view, setViewState] = useState<Viewport | null>(initial);
    // Al cambiar el número de datos se vuelve a la vista inicial (con visiblePoints, al final: lo más reciente)
    const lastN = useRef(n);
    useEffect(() => { if (lastN.current !== n) { lastN.current = n; setViewState(initial()) } }, [n]);
    const current = view ? clamp(view) : { start: 0, span: full };
    const onZoomRef = useRef(p.onZoomChange);
    onZoomRef.current = p.onZoomChange;
    // Durante el gesto llegan más movimientos que fotogramas: se aplica solo el último de cada fotograma
    const pending = useRef<{ v: Viewport | null } | null>(null);
    const setView = (v: Viewport | null) => {
        const first = !pending.current;
        pending.current = { v };
        if (first) nextFrame(() => { const p = pending.current; pending.current = null; if (p) applyView(p.v) });
    };
    const applyView = (v: Viewport | null) => {
        const next = v && clamp(v);
        const final = !next || next.span >= full - 1e-6 ? null : next;
        setViewState(prev => (prev && final && Math.abs(prev.start - final.start) < 1e-3 && Math.abs(prev.span - final.span) < 1e-3 ? prev : final));
        onZoomRef.current?.(final ? (slots
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
const useChartGestures = ({ select, zoomable, pick, onChange, vp, plotL, plotW }: {
    select: boolean;
    zoomable: boolean;
    pick: (x: number, y: number) => number | null;
    onChange: (i: number | null) => void;
    vp: ReturnType<typeof useViewport>;
    plotL: number;
    plotW: number;
}) => {
    const [selected, setSelected] = useState<number | null>(null);
    const g = useRef({ mode: 'tap' as 'tap' | 'scrub' | 'pan' | 'pinch', x: 0, y: 0, before: null as number | null, selected: null as number | null, start: vp.view, d0: 1, cx0: 0, lastTap: 0 });
    g.current.selected = selected;
    // Lo último de cada render, para los handlers (se crean una vez por render, pero el gesto dura varios)
    const live = useRef({ vp, plotL, plotW, pick });
    live.current = { vp, plotL, plotW, pick };
    const set = (i: number | null) => {
        if (i === g.current.selected) return;
        g.current.selected = i;
        setSelected(i);
        onChange(i);
    };
    if (!select && !zoomable) return { selected, setSelected: set, handlers: {} };
    const handlers = {
        onStartShouldSetResponder: () => true,
        onResponderGrant: (e: GestureResponderEvent) => {
            Object.assign(g.current, { mode: 'tap', x: e.nativeEvent.pageX, y: e.nativeEvent.pageY, before: g.current.selected, start: live.current.vp.view });
        },
        onResponderMove: (e: GestureResponderEvent) => {
            const { vp, plotL, plotW, pick } = live.current;
            const touches = e.nativeEvent.touches ?? [];
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
            if (g.current.mode === 'pinch') return; // se levantó un dedo: hasta soltar
            const dx = e.nativeEvent.pageX - g.current.x, dy = e.nativeEvent.pageY - g.current.y;
            if (g.current.mode === 'tap' && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
                g.current.mode = zoomable && vp.zoomed ? 'pan' : select ? 'scrub' : 'tap';
                g.current.start = vp.view;
            }
            if (g.current.mode === 'scrub') { const i = pick(e.nativeEvent.locationX, e.nativeEvent.locationY); if (i != null) set(i) }
            if (g.current.mode === 'pan') vp.setView({ span: g.current.start.span, start: g.current.start.start - (dx / plotW) * g.current.start.span });
        },
        onResponderRelease: (e: GestureResponderEvent) => {
            if (g.current.mode !== 'tap') return;
            const now = Date.now();
            if (zoomable && live.current.vp.zoomed && now - g.current.lastTap < 300) {
                g.current.lastTap = 0;
                live.current.vp.setView(null);
                set(null);
                return;
            }
            g.current.lastTap = now;
            if (!select) return;
            const i = live.current.pick(e.nativeEvent.locationX, e.nativeEvent.locationY);
            set(i != null && i === g.current.before ? null : i);
        },
        // El scroll de la pantalla puede quedarse el toque mientras no se esté recorriendo, desplazando o haciendo zoom
        onResponderTerminationRequest: () => g.current.mode === 'tap',
        onResponderTerminate: () => { if (g.current.mode === 'tap') set(g.current.before) },
    };
    return { selected, setSelected: set, handlers };
};

const selectionOf = (r: Resolved, index: number): ChartSelection => ({
    index,
    label: r.labels[index] || undefined,
    values: r.series.map((s, i) => ({
        name: r.names[i] || undefined,
        value: isNum(s.data[index]) ? s.data[index] as number : null,
        color: r.pointColors?.[index] && r.series.length === 1 ? resolveColor(r.theme, r.pointColors[index]) : r.colors[i],
    })),
});

const DefaultTooltip = ({ sel, r, _tooltipText }: { sel: ChartSelection; r: Resolved; _tooltipText?: any }) => (
    <>
        {sel.label ? <Text fontSize={11} color="silver.100" mb={0.5} {..._tooltipText}>{r.fmtLabel(sel.label, sel.index)}</Text> : null}
        {sel.values.map((v, i) => (
            <TooltipRow key={i} color={sel.values.length > 1 ? v.color : undefined} label={v.name} value={v.value == null ? '—' : r.fmtValue(v.value)} _tooltipText={_tooltipText} />
        ))}
    </>
);

// Props de Chart que no son del Box contenedor
const CHART_PROP_KEYS = [
    'data', 'series', 'labels', 'width', 'height', 'aspectRatio', 'colors', 'animate', 'duration', 'legend', 'legendPosition',
    'loading', 'formatValue', 'emptyText', 'yMin', 'yMax', 'yTicks', 'showGrid', 'showXAxis', 'showYAxis', 'showValues',
    'formatYLabel', 'formatLabel', 'tooltip', 'renderTooltip', 'onSelect', 'referenceLines', 'zoomable', 'maxZoom',
    'visiblePoints', 'onZoomChange', 'curve', 'strokeWidth', 'dots', 'dotSize', 'area', 'gradient', 'fillOpacity',
    'horizontal', 'stacked', 'barRadius', 'barGap', 'variant', '_grid', '_axisLabel', '_valueLabel', '_legend',
    '_legendText', '_tooltip', '_tooltipText', '_emptyText',
];
const boxPropsOf = (p: Record<string, any>) => {
    const out: Record<string, any> = {};
    for (const k in p) if (!CHART_PROP_KEYS.includes(k)) out[k] = p[k];
    return out as EABoxProps;
};

/** Hueco del gráfico: alto fijo o, con aspectRatio, según el ancho */
const chartHeight = (p: ChartBaseProps, width: number, fallback: number) =>
    p.height ?? (p.aspectRatio && width ? width / p.aspectRatio : fallback);

/** Contenedor común: mide el ancho, pinta el gráfico, el overlay táctil, el tooltip y la leyenda */
const ChartFrame = ({ p, r, width, onLayout, height, legendItems, children, touch, tooltipAt, empty }: {
    p: CartesianChartProps;
    r: Resolved;
    width: number;
    onLayout?: (e: any) => void;
    height: number;
    legendItems?: { label: string; color: string }[];
    children: React.ReactNode;
    touch: ReturnType<typeof useChartGestures>;
    tooltipAt?: (i: number) => { x: number; y: number } | null;
    empty: boolean;
}) => {
    const sel = touch.selected != null && touch.selected < r.length ? selectionOf(r, touch.selected) : null;
    const pos = sel && tooltipAt ? tooltipAt(sel.index) : null;
    const legend = !empty && !p.loading && legendItems && legendItems.length > 0
        ? <Legend items={legendItems} _legend={{ ...(p.legendPosition === 'top' ? { mt: 0, mb: 8 } : null), ...p._legend }} _legendText={p._legendText} /> : null;

    return (
        <Box {...boxPropsOf(p)}>
            {p.legendPosition === 'top' && legend}
            <View onLayout={onLayout} style={{ width: '100%', ...(p.height == null && p.aspectRatio ? { aspectRatio: p.aspectRatio } : { height }) }} accessibilityRole="image">
                {p.loading ? <Box flex={1} alignItems="center" justifyContent="center"><Spinner /></Box>
                    : empty ? <ChartEmpty height={height} text={p.emptyText ?? libT('noData')} _emptyText={p._emptyText} />
                        : width > 0 && (
                            <>
                                {children}
                                <View style={StyleSheet.absoluteFill} {...touch.handlers} />
                                {sel && pos && p.tooltip !== false && (
                                    <Tooltip x={pos.x} y={pos.y} width={width} _tooltip={p._tooltip}>
                                        {p.renderTooltip ? p.renderTooltip(sel) : <DefaultTooltip sel={sel} r={r} _tooltipText={p._tooltipText} />}
                                    </Tooltip>
                                )}
                            </>
                        )}
            </View>
            {p.legendPosition !== 'top' && legend}
        </Box>
    );
};

/** Progreso de la animación: solo se reinicia cuando cambian los datos (no al hacer zoom ni al cambiar el ancho) */
const useProgress = (dataKey: string, animate: boolean, duration: number) => {
    const progress = useSharedValue(animate ? 0 : 1);
    const [animating, setAnimating] = useState(animate);
    // Antes de pintar: si no, se vería un fotograma con los datos nuevos sin animar
    useLayoutEffect(() => {
        if (!animate) { progress.value = 1; setAnimating(false); return }
        progress.value = 0;
        if (!dataKey) return; // sin medir todavía: empieza cuando se pinte
        setAnimating(true);
        progress.value = withTiming(1, { duration, easing: EASING });
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
const useFrames = (dataKey: string, geomKey: string, target: (number | null)[][], base: number) => {
    const frames = useRef<{ dataKey: string; geomKey: string; from: number[][]; to: (number | null)[][] } | undefined>(undefined);
    const f = frames.current;
    if (!f || f.dataKey !== dataKey) {
        const prev = f?.dataKey ? f.to : undefined; // '' = todavía sin medir: se anima desde la base
        frames.current = { dataKey, geomKey, to: target, from: target.map((ys, s) => ys.map((_, i) => prev?.[s]?.[i] ?? base)) };
    } else if (f.geomKey !== geomKey) {
        frames.current = { dataKey, geomKey, to: target, from: target.map(ys => ys.map(y => y ?? base)) };
    }
    return frames.current!;
};

const ReferenceLines = ({ lines, theme, fs, at, horizontal, from, to }: {
    lines?: ChartReferenceLine[]; theme: Theme; fs: number; at: (v: number) => number; horizontal: boolean; from: number; to: number;
}) => (
    <>
        {(lines ?? []).filter(l => isNum(l.value)).map((l, i) => {
            const color = resolveColor(theme, l.color ?? 'danger.100');
            const p = at(l.value);
            return (
                <React.Fragment key={i}>
                    {horizontal
                        ? <Line x1={p} x2={p} y1={from} y2={to} stroke={color} strokeWidth={l.strokeWidth ?? 1.5} strokeDasharray={l.dashed === false ? undefined : '6 4'} />
                        : <Line x1={from} x2={to} y1={p} y2={p} stroke={color} strokeWidth={l.strokeWidth ?? 1.5} strokeDasharray={l.dashed === false ? undefined : '6 4'} />}
                    {l.label ? (horizontal
                        ? <SvgText x={p + 4} y={from + fs} fontSize={fs} fontWeight="600" fill={color}>{l.label}</SvgText>
                        // Encima de la línea; si no cabe (línea pegada arriba), debajo
                        : <SvgText x={to - 2} y={p - 4 - fs < 0 ? p + fs + 2 : p - 4} fontSize={fs} fontWeight="600" fill={color} textAnchor="end">{l.label}</SvgText>) : null}
                </React.Fragment>
            );
        })}
    </>
);

/** Etiqueta del eje X centrada en x, pero sin salirse del gráfico por los lados */
const xLabelAnchor = (x: number, text: string, fs: number, width: number) => {
    const w = textWidth(text, fs);
    return x - w / 2 < 0 ? 'start' : x + w / 2 > width ? 'end' : 'middle';
};

/* ---------------- Líneas y áreas ---------------- */

type LineSeriesProps = {
    xs: number[];
    from: number[];
    to: (number | null)[];
    progress: SharedValue<number>;
    curve: ChartCurve;
    base: number;
    color: string;
    strokeWidth: number;
    area: boolean;
    fill?: string;
    fillOpacity: number;
};

/** Sin animación en curso: paths normales (calculados aquí, sin worklets) */
const LineSeries = (props: LineSeriesProps & { animating: boolean }) => {
    if (props.animating) return <AnimatedLineSeries {...props} />;
    const { xs, to, curve, base, color, strokeWidth, area, fill, fillOpacity } = props;
    return (
        <>
            {area && <Path d={linePath(xs, to, curve, base)} fill={fill ?? color} fillOpacity={fill ? 1 : fillOpacity} />}
            <Path d={linePath(xs, to, curve)} stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinejoin="round" strokeLinecap="round" />
        </>
    );
};

const AnimatedLineSeries = ({ xs, from, to, progress, curve, base, color, strokeWidth, area, fill, fillOpacity }: LineSeriesProps) => {
    const lineProps = useAnimatedProps(() => {
        const p = progress.value;
        const ys = to.map((y, i) => (y == null ? null : from[i] + (y - from[i]) * p));
        return { d: linePath(xs, ys, curve) };
    });
    const areaProps = useAnimatedProps(() => {
        const p = progress.value;
        const ys = to.map((y, i) => (y == null ? null : from[i] + (y - from[i]) * p));
        return { d: area ? linePath(xs, ys, curve, base) : '' };
    });
    return (
        <>
            {area && <AnimatedPath animatedProps={areaProps} fill={fill ?? color} fillOpacity={fill ? 1 : fillOpacity} />}
            <AnimatedPath animatedProps={lineProps} stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinejoin="round" strokeLinecap="round" />
        </>
    );
};

type DotProps = { x: number; from: number; to: number; progress: SharedValue<number>; r: number; color: string };
const Dot = ({ animating, ...p }: DotProps & { animating: boolean }) => {
    // El borde del punto, del color de la superficie (blanco en claro): lo separa de la línea
    const ring = useTheme().theme.colors?.surface ?? '#fff';
    return animating
        ? <AnimatedDot {...p} ring={ring} />
        : <Circle cx={p.x} cy={p.to} r={p.r} fill={p.color} stroke={ring} strokeWidth={1.5} />;
};

const AnimatedDot = ({ x, from, to, progress, r, color, ring }: DotProps & { ring: string }) => {
    const props = useAnimatedProps(() => ({ cy: from + (to - from) * progress.value }));
    return <AnimatedCircle cx={x} animatedProps={props} r={r} fill={color} stroke={ring} strokeWidth={1.5} />;
};

const LineBase = ({ theme, ...p }: LineChartProps & { theme: Theme }) => {
    const {
        animate = true, duration = 600, yTicks = 5, showGrid = true, showXAxis = true, showYAxis = true,
        showValues = false, curve = 'linear', strokeWidth = 2, dotSize = 3.5, area = false, gradient = true, fillOpacity = 0.25,
    } = p;
    const gid = useId().replace(/[^a-zA-Z0-9]/g, '');
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
    const dots = p.dots ?? visibleCount <= 20;
    const edge = Math.max(dots ? dotSize + 1.5 : 0, strokeWidth) + 1;
    const yLabelW = showYAxis ? Math.max(...ticks.map(t => textWidth(r.fmtY(t), fs))) + 8 : 0;
    const padTop = showValues ? fs + 8 : edge + 2;
    const padBottom = showXAxis ? fs + 10 : edge;
    const plotL = showYAxis ? yLabelW : edge;
    const plotW = Math.max(1, width - plotL - edge);
    const plotH = Math.max(1, height - padTop - padBottom);
    const step = n > 1 ? plotW / span : 0;
    const xAt = (i: number) => (n > 1 ? plotL + (i - start) * step : plotL + plotW / 2);
    const yPx = (v: number) => padTop + (1 - (v - sMin) / (sMax - sMin || 1)) * plotH;
    const base = yPx(Math.min(Math.max(0, sMin), sMax));

    const target = r.series.map(s => Array.from({ length: n }, (_, i) => (isNum(s.data[i]) ? yPx(s.data[i] as number) : null)));
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
        onChange: i => p.onSelect?.(i == null ? null : selectionOf(r, i)),
    });
    useEffect(() => { if (touch.selected != null && touch.selected >= n) touch.setSelected(null) }, [n]);
    const sel = touch.selected != null && touch.selected < n ? touch.selected : null;

    // Etiquetas del eje X sin pisarse (solo las visibles; con zoom aparecen más)
    const maxLabelW = Math.max(0, ...r.labels.slice(lo, hi + 1).map((l, i) => textWidth(r.fmtLabel(l, lo + i), fs)));
    const every = Math.max(1, Math.ceil((maxLabelW + 8) / (step || plotW)));
    const xs = Array.from({ length: hi - lo + 1 }, (_, i) => xAt(lo + i));
    const inView = (i: number) => i >= start - 1e-6 && i <= start + span + 1e-6;
    const clipId = `${gid}clip`;

    return (
        <ChartFrame
            p={p} r={r} width={width} onLayout={onLayout} height={height} touch={touch} empty={!allValues.length}
            legendItems={(p.legend ?? r.series.length > 1) ? r.series.map((_, i) => ({ label: r.names[i] || `${i + 1}`, color: r.colors[i] })) : undefined}
            tooltipAt={i => ({ x: xAt(i), y: Math.min(...target.map(ys => ys[i] ?? Infinity), padTop + plotH) })}
        >
            <Svg width={width} height={height}>
                <Defs>
                    <ClipPath id={clipId}><Rect x={plotL - edge} y={0} width={plotW + edge * 2} height={height} /></ClipPath>
                    {area && gradient && r.colors.map((c, i) => (
                        <LinearGradient key={i} id={`${gid}g${i}`} x1="0" y1="0" x2="0" y2="1">
                            <Stop offset="0" stopColor={c} stopOpacity={Math.min(1, fillOpacity * 1.6)} />
                            <Stop offset="1" stopColor={c} stopOpacity={0} />
                        </LinearGradient>
                    ))}
                </Defs>
                {showGrid && ticks.map(t => <Line key={t} x1={plotL} x2={plotL + plotW} y1={yPx(t)} y2={yPx(t)} {...r.grid} />)}
                {showYAxis && ticks.map(t => (
                    <SvgText key={t} x={yLabelW - 6} y={yPx(t) + fs / 3} fontSize={fs} fill={r.axisFill} textAnchor="end">{r.fmtY(t)}</SvgText>
                ))}
                {showXAxis && r.labels.map((l, i) => {
                    if (!l || !inView(i) || i % every) return null;
                    const text = r.fmtLabel(l, i);
                    return <SvgText key={i} x={xAt(i)} y={height - 4} fontSize={fs} fill={r.axisFill} textAnchor={xLabelAnchor(xAt(i), text, fs, width)}>{text}</SvgText>;
                })}
                {sel != null && <Line x1={xAt(sel)} x2={xAt(sel)} y1={padTop} y2={padTop + plotH} stroke={r.axisFill} strokeWidth={1} strokeDasharray="3 3" />}
                <G clipPath={`url(#${clipId})`}>
                    {r.series.map((_, s) => (
                        <LineSeries
                            key={s} xs={xs} from={frames.from[s].slice(lo, hi + 1)} to={frames.to[s].slice(lo, hi + 1)} progress={progress}
                            curve={curve} base={base} color={r.colors[s]} strokeWidth={strokeWidth} area={area}
                            fill={area && gradient ? `url(#${gid}g${s})` : undefined} fillOpacity={fillOpacity} animating={animating}
                        />
                    ))}
                    {dots && r.series.map((_, s) => frames.to[s].map((y, i) => (y == null || !inView(i) ? null : (
                        <Dot key={`${s}.${i}`} x={xAt(i)} from={frames.from[s][i]} to={y} progress={progress} r={dotSize} color={r.colors[s]} animating={animating} />
                    ))))}
                </G>
                <ReferenceLines lines={p.referenceLines} theme={theme} fs={fs} at={yPx} horizontal={false} from={plotL} to={plotL + plotW} />
                {sel != null && r.series.map((_, s) => (isNum(target[s][sel]) ? (
                    <Circle key={s} cx={xAt(sel)} cy={target[s][sel]!} r={dotSize + 2} fill={r.colors[s]} stroke={r.theme.colors?.surface ?? "#fff"} strokeWidth={2} />
                ) : null))}
                {showValues && r.series.map((s, si) => s.data.map((v, i) => (isNum(v) && inView(i) ? (
                    <SvgText key={`${si}.${i}`} x={xAt(i)} y={target[si][i]! - dotSize - 4} textAnchor="middle" {...r.valueLabel}>{r.fmtValue(v)}</SvgText>
                ) : null)))}
            </Svg>
        </ChartFrame>
    );
};

/* ---------------- Barras ---------------- */

type BarGeom = { pos: number; len: number };
type BarProps = { horizontal: boolean; cross: number; thickness: number; radius: number; color: string; opacity: number };

/** Mientras anima, de from a to con el progreso compartido; si no, un Rect normal */
const Bar = ({ animating, from, to, progress, ...p }: BarProps & { animating: boolean; from: BarGeom; to: BarGeom; progress: SharedValue<number> }) => {
    if (animating) return <AnimatedBar {...p} from={from} to={to} progress={progress} />;
    const rx = Math.min(p.radius, to.len / 2, p.thickness / 2);
    return p.horizontal
        ? <Rect x={to.pos} y={p.cross} width={to.len} height={p.thickness} rx={rx} ry={rx} fill={p.color} opacity={p.opacity} />
        : <Rect x={p.cross} y={to.pos} width={p.thickness} height={to.len} rx={rx} ry={rx} fill={p.color} opacity={p.opacity} />;
};

const AnimatedBar = ({ horizontal, cross, thickness, radius, color, opacity, from, to, progress }: BarProps & { from: BarGeom; to: BarGeom; progress: SharedValue<number> }) => {
    const props = useAnimatedProps<Partial<{ x: number; y: number; width: number; height: number; rx: number; ry: number }>>(() => {
        const k = progress.value;
        const pos = from.pos + (to.pos - from.pos) * k;
        const l = Math.max(0, from.len + (to.len - from.len) * k);
        const rx = Math.min(radius, l / 2, thickness / 2);
        return horizontal ? { x: pos, width: l, rx, ry: rx } : { y: pos, height: l, rx, ry: rx };
    });
    return horizontal
        ? <AnimatedRect y={cross} height={thickness} animatedProps={props} fill={color} opacity={opacity} />
        : <AnimatedRect x={cross} width={thickness} animatedProps={props} fill={color} opacity={opacity} />;
};

const BarBase = ({ theme, ...p }: BarChartProps & { theme: Theme }) => {
    const {
        animate = true, duration = 600, yTicks = 5, showGrid = true, showXAxis = true, showYAxis = true,
        showValues = false, horizontal = false, stacked = false, barRadius = stacked ? 2 : 4, barGap = 0.3,
    } = p;
    const gid = useId().replace(/[^a-zA-Z0-9]/g, '');
    const { width, onLayout } = useChartWidth(p.width);
    const r = resolveCommon(theme, p);
    const n = r.length;
    const k = r.series.length;
    // Horizontal sin alto: según las categorías (para que quepan las etiquetas)
    const height = horizontal && p.height == null && !p.aspectRatio
        ? Math.max(120, n * (k > 1 && !stacked ? 18 * k + 14 : 34) + 30)
        : chartHeight(p, width, 220);
    const vp = useViewport(n, true, horizontal ? { ...p, visiblePoints: undefined } : p);
    const { start, span } = vp.view;
    const lo = Math.max(0, Math.floor(start + 1e-6));
    const hi = Math.min(n - 1, Math.ceil(start + span - 1e-6) - 1);

    // Totales por categoría (apiladas: positivos y negativos por separado)
    const sums = Array.from({ length: n }, (_, i) => r.series.reduce((acc, s) => {
        const v = s.data[i];
        if (isNum(v)) v >= 0 ? (acc.pos += v) : (acc.neg += v);
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
    let plotL: number, plotR: number, padTop: number, padBottom: number, catLabelW = 0;
    if (horizontal) {
        catLabelW = showYAxis ? Math.min(Math.max(0, ...labelTexts.map(l => textWidth(l, fs))), width * 0.35) + 8 : 0;
        plotL = catLabelW;
        plotR = width - Math.max(valueLabelW, showXAxis ? textWidth(r.fmtY(ticks[ticks.length - 1] ?? 0), fs) / 2 + 2 : 2);
        padTop = 4;
        padBottom = showXAxis ? fs + 10 : 2;
    } else {
        plotL = showYAxis ? Math.max(...ticks.map(t => textWidth(r.fmtY(t), fs))) + 8 : 2;
        plotR = width - 2;
        padTop = showValues ? fs + 8 : 6;
        padBottom = showXAxis ? fs + 10 : 2;
    }
    const plotW = Math.max(1, plotR - plotL);
    const plotH = Math.max(1, height - padTop - padBottom);
    // Posición en el eje de valores: en vertical crece hacia arriba
    const vPx = (v: number) => (horizontal
        ? plotL + ((v - sMin) / (sMax - sMin || 1)) * plotW
        : padTop + (1 - (v - sMin) / (sMax - sMin || 1)) * plotH);
    const zero = vPx(Math.min(Math.max(0, sMin), sMax));
    const slot = (horizontal ? plotH : plotW) / span;
    const catStart = horizontal ? padTop : plotL;
    const catAt = (i: number) => catStart + (i - start) * slot;
    const groupW = slot * (1 - Math.min(0.9, Math.max(0, barGap)));
    const barW = stacked || k === 1 ? groupW : Math.max(1, (groupW - (k - 1) * 2) / k);

    type BarItem = BarGeom & { key: string; cross: number; color: string; index: number; value: number };
    const bars: BarItem[] = [];
    for (let i = lo; i <= hi; i++) {
        let accPos = 0, accNeg = 0;
        r.series.forEach((s, si) => {
            const v = s.data[i];
            if (!isNum(v)) return;
            let a: number, b: number;
            if (stacked) {
                if (v >= 0) { a = accPos; b = accPos += v } else { a = accNeg; b = accNeg += v }
            } else { a = 0; b = v }
            const pa = vPx(a), pb = vPx(b);
            const cross = catAt(i) + (slot - groupW) / 2 + (stacked || k === 1 ? 0 : si * (barW + 2));
            const color = k === 1 && r.pointColors?.[i] ? resolveColor(theme, r.pointColors[i]) : r.colors[si];
            bars.push({ key: `${si}.${i}`, cross, pos: Math.min(pa, pb), len: Math.abs(pb - pa), color, index: i, value: v });
        });
    }

    // Solo se anima con datos nuevos: de donde estaba cada barra (o desde el 0) a lo nuevo. Con zoom,
    // desplazamiento o ancho distinto va directa. Hasta medir el ancho no hay nada pintado ('')
    const dataKey = JSON.stringify(r.series.map(s => s.data));
    const animKey = width > 0 ? dataKey : '';
    const geomKey = JSON.stringify([width, height, start, span, sMin, sMax]);
    const toMap = new Map(bars.map(b => [b.key, { pos: b.pos, len: b.len }]));
    const bf = useRef<{ key: string; geom: string; from: Map<string, BarGeom>; to: Map<string, BarGeom> } | undefined>(undefined);
    if (!bf.current || bf.current.key !== animKey) {
        const prev = bf.current?.key ? bf.current.to : undefined;
        bf.current = { key: animKey, geom: geomKey, to: toMap, from: new Map(bars.map(b => [b.key, prev?.get(b.key) ?? { pos: zero, len: 0 }])) };
    } else if (bf.current.geom !== geomKey || bf.current.to.size !== toMap.size) {
        bf.current = { key: animKey, geom: geomKey, to: toMap, from: toMap };
    }
    const { progress, animating } = useProgress(animKey, animate, duration);

    const touch = useChartGestures({
        select: p.tooltip !== false || !!p.onSelect,
        zoomable: !!p.zoomable && !horizontal && n > 2,
        vp, plotL, plotW,
        pick: (x, y) => {
            if (!n) return null;
            const i = Math.floor(start + ((horizontal ? y : x) - catStart) / slot);
            return Math.min(hi, Math.max(lo, i));
        },
        onChange: i => p.onSelect?.(i == null ? null : selectionOf(r, i)),
    });
    useEffect(() => { if (touch.selected != null && touch.selected >= n) touch.setSelected(null) }, [n]);
    const sel = touch.selected != null && touch.selected < n ? touch.selected : null;

    const every = horizontal ? 1 : Math.max(1, Math.ceil((Math.max(0, ...labelTexts.slice(lo, hi + 1).map(l => textWidth(l, fs))) + 6) / slot));
    const truncate = (l: string) => {
        const max = Math.floor((catLabelW - 8) / (fs * 0.58));
        return l.length > max && max > 1 ? l.slice(0, max - 1) + '…' : l;
    };
    const clipId = `${gid}clip`;

    return (
        <ChartFrame
            p={p} r={r} width={width} onLayout={onLayout} height={height} touch={touch} empty={!allValues.length}
            legendItems={(p.legend ?? k > 1) ? r.series.map((_, i) => ({ label: r.names[i] || `${i + 1}`, color: r.colors[i] })) : undefined}
            tooltipAt={i => {
                const group = bars.filter(b => b.index === i);
                if (!group.length) return null;
                const c = catAt(i) + slot / 2;
                return horizontal
                    ? { x: Math.max(...group.map(b => b.pos + b.len), zero), y: c - slot / 2 + 4 }
                    : { x: c, y: Math.min(...group.map(b => b.pos), zero) };
            }}
        >
            <Svg width={width} height={height}>
                <Defs>
                    <ClipPath id={clipId}><Rect x={plotL} y={0} width={plotW} height={height} /></ClipPath>
                </Defs>
                {showGrid && ticks.map(t => (horizontal
                    ? <Line key={t} x1={vPx(t)} x2={vPx(t)} y1={padTop} y2={padTop + plotH} {...r.grid} />
                    : <Line key={t} x1={plotL} x2={plotR} y1={vPx(t)} y2={vPx(t)} {...r.grid} />))}
                {/* Eje de valores */}
                {(horizontal ? showXAxis : showYAxis) && ticks.map(t => (horizontal
                    ? <SvgText key={t} x={vPx(t)} y={height - 4} fontSize={fs} fill={r.axisFill} textAnchor="middle">{r.fmtY(t)}</SvgText>
                    : <SvgText key={t} x={plotL - 6} y={vPx(t) + fs / 3} fontSize={fs} fill={r.axisFill} textAnchor="end">{r.fmtY(t)}</SvgText>))}
                {/* Eje de categorías */}
                {(horizontal ? showYAxis : showXAxis) && labelTexts.map((l, i) => {
                    if (!l || i < lo || i > hi || i % every) return null;
                    const c = catAt(i) + slot / 2;
                    // Con zoom, una barra a medio ver en el borde no lleva etiqueta (se cortaría)
                    if (!horizontal && (c < plotL || c > plotR)) return null;
                    return horizontal
                        ? <SvgText key={i} x={catLabelW - 6} y={c + fs / 3} fontSize={fs} fill={r.axisFill} textAnchor="end">{truncate(l)}</SvgText>
                        : <SvgText key={i} x={c} y={height - 4} fontSize={fs} fill={r.axisFill} textAnchor={xLabelAnchor(c, l, fs, width)}>{l}</SvgText>;
                })}
                <G clipPath={horizontal ? undefined : `url(#${clipId})`}>
                    {bars.map(b => (
                        <Bar key={b.key} horizontal={horizontal} cross={b.cross} thickness={barW} radius={barRadius} color={b.color}
                            opacity={sel == null || sel === b.index ? 1 : 0.45} animating={animating} progress={progress}
                            from={bf.current!.from.get(b.key) ?? b} to={bf.current!.to.get(b.key) ?? b} />
                    ))}
                </G>
                {/* Línea del 0 si hay negativos */}
                {sMin < 0 && (horizontal
                    ? <Line x1={zero} x2={zero} y1={padTop} y2={padTop + plotH} stroke={r.axisFill} strokeWidth={1} />
                    : <Line x1={plotL} x2={plotR} y1={zero} y2={zero} stroke={r.axisFill} strokeWidth={1} />)}
                <ReferenceLines lines={p.referenceLines} theme={theme} fs={fs} at={vPx} horizontal={horizontal}
                    from={horizontal ? padTop : plotL} to={horizontal ? padTop + plotH : plotR} />
                {showValues && (stacked
                    ? sums.map((s, i) => {
                        if (i < lo || i > hi || !bars.some(b => b.index === i)) return null;
                        const total = s.pos + s.neg;
                        const c = catAt(i) + slot / 2;
                        const end = vPx(s.pos > 0 ? s.pos : s.neg);
                        return horizontal
                            ? <SvgText key={i} x={end + 4} y={c + r.valueLabel.fontSize / 3} textAnchor="start" {...r.valueLabel}>{r.fmtValue(total)}</SvgText>
                            : <SvgText key={i} x={c} y={end - 4} textAnchor="middle" {...r.valueLabel}>{r.fmtValue(total)}</SvgText>;
                    })
                    : bars.map(b => {
                        const neg = b.value < 0;
                        return horizontal
                            ? <SvgText key={b.key} x={neg ? b.pos - 4 : b.pos + b.len + 4} y={b.cross + barW / 2 + r.valueLabel.fontSize / 3} textAnchor={neg ? 'end' : 'start'} {...r.valueLabel}>{r.fmtValue(b.value)}</SvgText>
                            : <SvgText key={b.key} x={b.cross + barW / 2} y={neg ? b.pos + b.len + r.valueLabel.fontSize + 2 : b.pos - 4} textAnchor="middle" {...r.valueLabel}>{r.fmtValue(b.value)}</SvgText>;
                    }))}
            </Svg>
        </ChartFrame>
    );
};

/* ---------------- Props de pie, donut y progress ---------------- */

export type PieDatum = number | { label?: string; value: number; color?: ChartColor };

export type PieSelection = { index: number; label?: string; value: number; percent: number; color: string };

export type PieChartProps = ChartBaseProps & {
    data: PieDatum[];
    labels?: string[];
    /** Diámetro en px. Por defecto 200 (o el ancho disponible si es menor) */
    size?: number;
    /** Hueco central, de 0 a 0.95 del radio (0 = tarta). En type="donut", 0.62 */
    innerRadius?: number;
    /** Separación entre porciones, en grados */
    padAngle?: number;
    /** Ángulo de inicio en grados (0 = arriba, en sentido horario) */
    startAngle?: number;
    /** Texto sobre cada porción: el porcentaje o el valor */
    showValues?: boolean | 'percent' | 'value';
    /** Qué se muestra en la leyenda junto a cada etiqueta. Por defecto el porcentaje */
    legendValue?: 'percent' | 'value' | 'none';
    /** Centro del donut: por defecto el total (o lo seleccionado). false lo oculta */
    centerLabel?: React.ReactNode | false | ((info: { total: number; selected: PieSelection | null }) => React.ReactNode);
    /** Tooltip al tocar una porción. Por defecto en pie sí y en donut no (lo muestra el centro) */
    tooltip?: boolean;
    renderTooltip?: (selection: PieSelection) => React.ReactNode;
    onSelect?: (selection: PieSelection | null) => void;
    /** Cuánto sale la porción seleccionada, en px. Por defecto 6 */
    selectedOffset?: number;
    /** Junta en una porción "Otros" las que no lleguen a este porcentaje (p. ej. 5) */
    groupSmall?: number;
    /** Nombre de la porción que junta las pequeñas. Por defecto "Otros" / "Others" */
    othersLabel?: string;
    formatPercent?: (percent: number) => string;
    _valueLabel?: { fill?: ChartColor; fontSize?: number; fontWeight?: string };
    _centerValue?: EATextProps;
    _centerLabel?: EATextProps;
};

export type ProgressRingProps = Omit<EABoxProps, 'children'> & {
    value: number;
    /** Por defecto 100 */
    max?: number;
    /** Diámetro en px. Por defecto 120 */
    size?: number;
    /** Grosor del aro. Por defecto 12 */
    thickness?: number;
    color?: ChartColor;
    trackColor?: ChartColor;
    /** Medio círculo (indicador tipo velocímetro) */
    half?: boolean;
    animate?: boolean;
    duration?: number;
    /** El porcentaje en el centro. Por defecto true */
    showValue?: boolean;
    formatValue?: (value: number, percent: number) => string;
    /** Texto pequeño bajo el valor */
    label?: string;
    /** Contenido propio en el centro (en lugar del valor) */
    children?: React.ReactNode;
    _value?: EATextProps;
    _label?: EATextProps;
    variant?: (string & {});
};

/* ---------------- Tarta y donut ---------------- */

const Slice = ({ cx, cy, r, inner, from, to, pad, progress, offset, color, opacity }: {
    cx: number; cy: number; r: number; inner: number; from: [number, number]; to: [number, number];
    pad: number; progress: SharedValue<number>; offset: number; color: string; opacity: number;
}) => {
    const off = useSharedValue(0);
    useEffect(() => { off.value = withTiming(offset, { duration: 180 }) }, [offset]);
    const props = useAnimatedProps(() => {
        const p = progress.value;
        const a0 = from[0] + (to[0] - from[0]) * p;
        const a1 = from[1] + (to[1] - from[1]) * p;
        const mid = (a0 + a1) / 2;
        const half = a1 - a0 > pad * 2 && a1 - a0 < TAU - 0.0001 ? pad : 0;
        return { d: arcPath(cx + Math.sin(mid) * off.value, cy - Math.cos(mid) * off.value, r, inner, a0 + half, a1 - half) };
    });
    return <AnimatedPath animatedProps={props} fill={color} opacity={opacity} />;
};

const formatPercentDefault = (p: number) => `${p >= 10 || p === 0 ? Math.round(p) : Math.round(p * 10) / 10}%`;

const PieBase = ({ theme, ...p }: PieChartProps & { theme: Theme }) => {
    const {
        data, labels, size: sizeProp, innerRadius = 0, padAngle = 0, startAngle = 0, showValues = false, legendValue = 'percent',
        centerLabel, tooltip, renderTooltip, onSelect, selectedOffset = 6, formatPercent = formatPercentDefault, groupSmall, othersLabel,
        width: widthProp, height: _h, aspectRatio: _ar, colors, animate = true, duration = 700, legend = true, legendPosition, loading,
        formatValue = defaultFormatValue, emptyText, _valueLabel, _centerValue, _centerLabel, _legend, _legendText, _tooltip, _tooltipText, _emptyText, variant: _v,
        ...boxProps
    } = p;
    const { width, onLayout } = useChartWidth(widthProp);
    const palette = colors ?? DEFAULT_PALETTE;

    // Porciones (los valores 0, negativos o vacíos no se dibujan)
    let items = data.map((d, i) => {
        const o = typeof d === 'number' ? { value: d } : d;
        return { label: o.label ?? labels?.[i] ?? '', value: isNum(o.value) && o.value > 0 ? o.value : 0, color: resolveColor(theme, o.color ?? palette[i % palette.length]) };
    });
    const total = items.reduce((a, b) => a + b.value, 0);
    // groupSmall: las pequeñas se juntan al final en "Otros" (si hay al menos dos que juntar)
    if (groupSmall && total) {
        const small = items.filter(it => it.value > 0 && (it.value / total) * 100 < groupSmall);
        if (small.length > 1) {
            items = items.filter(it => !small.includes(it));
            items.push({ label: othersLabel ?? libT('others'), value: small.reduce((a, b) => a + b.value, 0), color: resolveColor(theme, 'silver.100') });
        }
    }
    const size = Math.max(40, Math.min(sizeProp ?? 200, width || sizeProp || 200));
    const cx = width / 2, cy = size / 2;
    const r = size / 2 - selectedOffset;
    const inner = Math.min(0.95, Math.max(0, innerRadius)) * r;
    const start = (startAngle * Math.PI) / 180;

    const angles: [number, number][] = [];
    let acc = start;
    items.forEach(it => { const a = total ? (it.value / total) * TAU : 0; angles.push([acc, acc + a]); acc += a });

    // Animación: de los ángulos que se veían (o de cero, en el inicio) a los nuevos
    // Solo con datos nuevos (no al cambiar de ancho); hasta medir el ancho no hay nada pintado ('')
    const key = width > 0 ? JSON.stringify(angles) : '';
    const frames = useRef<{ key: string; from: [number, number][]; to: [number, number][] } | undefined>(undefined);
    if (frames.current?.key !== key) {
        const prev = frames.current?.key ? frames.current.to : undefined;
        frames.current = { key, to: angles, from: angles.map((_, i) => prev?.[i] ?? (prev ? [acc, acc] : [start, start])) };
    }
    const progress = useSharedValue(animate ? 0 : 1);
    const [ready, setReady] = useState(!animate);
    useLayoutEffect(() => {
        if (!animate) { progress.value = 1; setReady(true); return }
        progress.value = 0;
        progress.value = withTiming(1, { duration, easing: EASING });
        // Los textos sobre las porciones aparecen al terminar (si no, flotarían sobre porciones a medio dibujar)
        setReady(false);
        const t = setTimeout(() => setReady(true), duration);
        return () => clearTimeout(t);
    }, [key, animate]);

    const [selected, setSelected] = useState<number | null>(null);
    useEffect(() => { if (selected != null && selected >= items.length) setSelected(null) }, [items.length]);
    const selectionOf = (i: number): PieSelection => ({ index: i, label: items[i].label || undefined, value: items[i].value, percent: total ? (items[i].value / total) * 100 : 0, color: items[i].color });
    const select = (i: number | null) => {
        const next = i === selected ? null : i;
        setSelected(next);
        onSelect?.(next == null ? null : selectionOf(next));
    };
    const pick = (x: number, y: number) => {
        const dx = x - cx, dy = y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > r + selectedOffset || dist < inner - 2) return null;
        const a = ((Math.atan2(dx, -dy) - start) % TAU + TAU) % TAU;
        const i = angles.findIndex(([a0, a1]) => a1 > a0 && a >= a0 - start && a < a1 - start);
        return i < 0 ? null : i;
    };

    const showTooltip = tooltip ?? inner === 0;
    const sel = selected != null && selected < items.length ? selectionOf(selected) : null;
    const tooltipPos = (() => {
        if (!sel) return null;
        const [a0, a1] = angles[sel.index];
        const mid = (a0 + a1) / 2;
        const rr = inner ? (r + inner) / 2 : r * 0.6;
        return { x: cx + Math.sin(mid) * rr, y: cy - Math.cos(mid) * rr };
    })();
    const valueLabel = { fontSize: 11, fontWeight: '700', ..._valueLabel, fill: resolveColor(theme, _valueLabel?.fill ?? 'white') };
    const center = centerLabel === false || inner < 24 ? null
        : typeof centerLabel === 'function' ? centerLabel({ total, selected: sel })
            : centerLabel !== undefined ? centerLabel
                : (
                    <Box alignItems="center" maxW={inner * 1.6}>
                        <Text fontSize={Math.max(12, Math.min(22, inner / 3))} fontWeight="700" numberOfLines={1} {..._centerValue}>
                            {formatValue(sel ? sel.value : total)}
                        </Text>
                        <Text fontSize={11} color="gray" numberOfLines={1} {..._centerLabel}>
                            {sel ? `${sel.label ?? ''} · ${formatPercent(sel.percent)}` : libT('total')}
                        </Text>
                    </Box>
                );

    const legendEl = legend && total > 0 && !loading ? (
        <Legend
            _legend={{ ...(legendPosition === 'top' ? { mt: 0, mb: 8 } : null), ..._legend }} _legendText={_legendText}
            items={items.map(it => ({
                label: it.label, color: it.color,
                value: legendValue === 'none' ? undefined : legendValue === 'value' ? formatValue(it.value) : formatPercent((it.value / total) * 100),
            })).filter(it => it.label)}
        />
    ) : null;

    return (
        <Box {...boxProps}>
            {legendPosition === 'top' && legendEl}
            <View onLayout={onLayout} style={{ width: '100%', height: size }} accessibilityRole="image">
                {loading ? <Box flex={1} alignItems="center" justifyContent="center"><Spinner /></Box> : !total ? <ChartEmpty height={size} text={emptyText ?? libT('noData')} _emptyText={_emptyText} />
                    : width > 0 && (
                        <>
                            <Svg width={width} height={size}>
                                {items.map((it, i) => (
                                    <Slice key={i} cx={cx} cy={cy} r={r} inner={inner} from={frames.current!.from[i]} to={frames.current!.to[i]}
                                        pad={(padAngle * Math.PI) / 360} progress={progress} offset={selected === i ? selectedOffset : 0}
                                        color={it.color} opacity={selected == null || selected === i ? 1 : 0.55} />
                                ))}
                                {ready && showValues && items.map((it, i) => {
                                    const [a0, a1] = angles[i];
                                    if (a1 - a0 < 0.35) return null; // no cabe
                                    const mid = (a0 + a1) / 2;
                                    const rr = inner ? (r + inner) / 2 : r * 0.62;
                                    const text = showValues === 'value' ? formatValue(it.value) : formatPercent((it.value / total) * 100);
                                    return (
                                        <SvgText key={i} x={cx + Math.sin(mid) * rr} y={cy - Math.cos(mid) * rr + valueLabel.fontSize / 3} textAnchor="middle" {...valueLabel}>{text}</SvgText>
                                    );
                                })}
                            </Svg>
                            {center && (
                                <View pointerEvents="none" style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>{center}</View>
                            )}
                            <View style={StyleSheet.absoluteFill} onStartShouldSetResponder={() => true}
                                onResponderRelease={e => select(pick(e.nativeEvent.locationX, e.nativeEvent.locationY))} />
                            {showTooltip && sel && tooltipPos && (
                                <Tooltip x={tooltipPos.x} y={tooltipPos.y} width={width} _tooltip={_tooltip}>
                                    {renderTooltip ? renderTooltip(sel) : (
                                        <TooltipRow label={sel.label} value={`${formatValue(sel.value)} (${formatPercent(sel.percent)})`} _tooltipText={_tooltipText} />
                                    )}
                                </Tooltip>
                            )}
                        </>
                    )}
            </View>
            {legendPosition !== 'top' && legendEl}
        </Box>
    );
};

/* ---------------- ProgressRing ---------------- */

const ProgressRingBase = ({ theme, ...p }: ProgressRingProps & { theme: Theme }) => {
    const {
        value, max = 100, size = 120, thickness = 12, color = 'primary.100', trackColor = 'light.100', half = false,
        animate = true, duration = 700, showValue = true, formatValue, label, children, _value, _label, variant: _v, ...boxProps
    } = p;
    const pct = Math.min(1, Math.max(0, max ? (isNum(value) ? value : 0) / max : 0));
    const r = (size - thickness) / 2;
    const cx = size / 2, cy = size / 2;
    const length = half ? Math.PI * r : TAU * r;
    const d = half
        ? `M${cx - r},${cy}A${r},${r} 0 0 1 ${cx + r},${cy}`
        : `M${cx},${cy - r}A${r},${r} 0 1 1 ${cx},${cy + r}A${r},${r} 0 1 1 ${cx},${cy - r}`;
    const height = half ? size / 2 + thickness / 2 : size;

    const sv = useSharedValue(animate ? 0 : pct);
    useEffect(() => { sv.value = animate ? withTiming(pct, { duration, easing: EASING }) : pct }, [pct]);
    const props = useAnimatedProps(() => ({
        strokeDashoffset: length * (1 - sv.value),
        // Con extremo redondeado, 0 se vería como un punto
        strokeOpacity: sv.value > 0.001 ? 1 : 0,
    }));
    const text = formatValue ? formatValue(value, pct * 100) : `${Math.round(pct * 100)}%`;

    return (
        <Box w={size} h={height} {...boxProps} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max, now: value }}>
            <Svg width={size} height={height}>
                <Path d={d} stroke={resolveColor(theme, trackColor)} strokeWidth={thickness} fill="none" strokeLinecap="round" />
                <AnimatedPath d={d} stroke={resolveColor(theme, color)} strokeWidth={thickness} fill="none" strokeLinecap="round"
                    strokeDasharray={`${length} ${length}`} animatedProps={props} />
            </Svg>
            {(children || showValue || label) && (
                <View pointerEvents="none" style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: half ? 'flex-end' : 'center', paddingHorizontal: thickness + 4 }]}>
                    {children ?? (
                        <>
                            {showValue && <Text fontSize={Math.max(12, half ? size / 8 : size / 5.5)} fontWeight="700" numberOfLines={1} {..._value}>{text}</Text>}
                            {label ? <Text fontSize={11} color="gray" {..._label}>{label}</Text> : null}
                        </>
                    )}
                </View>
            )}
        </Box>
    );
};

/* ---------------- Chart ---------------- */

export type ChartType = 'line' | 'area' | 'sparkline' | 'bar' | 'column' | 'horizontalBar' | 'pie' | 'donut' | 'progress';

export type ChartProps =
    | ({ type: 'line' | 'area' | 'sparkline' } & LineChartProps)
    | ({ type: 'bar' | 'column' | 'horizontalBar' } & BarChartProps)
    | ({ type: 'pie' | 'donut' } & PieChartProps)
    | ({ type: 'progress' } & ProgressRingProps);

// Lo que cambia cada tipo (el tema y las props van por encima)
const TYPE_DEFAULTS: Record<ChartType, Record<string, any>> = {
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
export const Chart: React.FC<ChartProps> = props => {
    // Defaults del tipo → theme.components.Chart → variante → props → plataforma
    const [{ type, ...p }, theme] = useThemeProps<ChartProps>('Chart', props, { defaults: TYPE_DEFAULTS[props.type] as Partial<ChartProps> });
    switch (type) {
        case 'bar': return <BarBase {...(p as BarChartProps)} theme={theme} />;
        case 'column': return <BarBase {...(p as BarChartProps)} horizontal={false} theme={theme} />;
        case 'horizontalBar': return <BarBase {...(p as BarChartProps)} horizontal theme={theme} />;
        case 'pie': case 'donut': return <PieBase {...(p as PieChartProps)} theme={theme} />;
        case 'progress': return <ProgressRingBase {...(p as ProgressRingProps)} theme={theme} />;
        default: return <LineBase {...(p as LineChartProps)} theme={theme} />;
    }
};
