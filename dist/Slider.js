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
exports.Slider = void 0;
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const Box_1 = require("./Box");
const Text_1 = require("./Text");
const Label_1 = require("./Label");
const useThemeProps_1 = require("./utils/useThemeProps");
const DEFAULT_PROPS_1 = require("./utils/DEFAULT_PROPS");
const SIZES = { sm: { track: 4, thumb: 16 }, md: { track: 6, thumb: 22 }, lg: { track: 8, thumb: 28 } };
// Variantes: cómo es el tirador
const SLIDER_VARIANTS = {
    /** Blanco con sombra */
    default: {},
    /** Del color del relleno */
    filled: { _thumb: { bg: '__fill__' } },
    /** Con borde del color */
    outline: { _thumb: { borderWidth: 2, borderColor: '__fill__', shadow: 'none' } },
};
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
exports.Slider = (0, react_1.forwardRef)((rawProps, ref) => {
    var _a, _b, _c;
    const [_d, theme] = (0, useThemeProps_1.useThemeProps)('Slider', rawProps, { variants: SLIDER_VARIANTS }), { value, defaultValue, range: rangeProp, min = 0, max = 100, step = 1, minDistance = 0, onChange, onChangeEnd, onChangeStart, disabled, colorScheme = 'primary', size = 'md', showValue = false, formatValue = v => String(v), marks, showMinMax, label, isRequired, showLabelValue, _label, _track, _fill, _thumb, _tooltip, _mark, variant: _variant } = _d, boxProps = __rest(_d, ["value", "defaultValue", "range", "min", "max", "step", "minDistance", "onChange", "onChangeEnd", "onChangeStart", "disabled", "colorScheme", "size", "showValue", "formatValue", "marks", "showMinMax", "label", "isRequired", "showLabelValue", "_label", "_track", "_fill", "_thumb", "_tooltip", "_mark", "variant"]);
    const range = rangeProp !== null && rangeProp !== void 0 ? rangeProp : (Array.isArray(value !== null && value !== void 0 ? value : defaultValue));
    const color = (c) => { var _a, _b; return (c ? (_b = (_a = theme.colors) === null || _a === void 0 ? void 0 : _a[c]) !== null && _b !== void 0 ? _b : c : undefined); };
    const fillColor = color(String((_a = _fill === null || _fill === void 0 ? void 0 : _fill.bg) !== null && _a !== void 0 ? _a : `${colorScheme}.100`));
    const { track: trackH, thumb: thumbSize } = (_b = SIZES[size]) !== null && _b !== void 0 ? _b : SIZES.md;
    // Normaliza: dentro de [min, max], en el step, y el rango ordenado y con su distancia mínima
    const snap = (v) => {
        const s = step > 0 ? Math.round((v - min) / step) * step + min : v;
        return clamp(Number(s.toFixed(10)), min, max);
    };
    const normalize = (v) => {
        if (Array.isArray(v)) {
            const a = snap(Math.min(v[0], v[1])), b = snap(Math.max(v[0], v[1]));
            return [a, Math.max(b, a)];
        }
        if (v == null)
            return range ? [min, max] : [snap(min), snap(min)];
        return [snap(v), snap(v)];
    };
    const out = (v) => (range ? [v[0], v[1]] : v[1]);
    const controlled = value !== undefined;
    const [vals, setVals] = (0, react_1.useState)(() => normalize(controlled ? value : defaultValue));
    const valsRef = (0, react_1.useRef)(vals);
    const [width, setWidth] = (0, react_1.useState)(0);
    const widthRef = (0, react_1.useRef)(0);
    const [dragging, setDragging] = (0, react_1.useState)(null);
    // Posición en px de cada tirador (0 = el de abajo del rango; 1 = el de arriba, o el único)
    const pos = (0, react_1.useRef)([new react_native_1.Animated.Value(0), new react_native_1.Animated.Value(0)]).current;
    const toPx = (v) => (max === min ? 0 : ((v - min) / (max - min)) * widthRef.current);
    const place = (v) => { pos[0].setValue(toPx(v[0])); pos[1].setValue(toPx(v[1])); };
    const commit = (v) => { valsRef.current = v; setVals(v); place(v); };
    // Mientras se arrastra, los tiradores se mueven sin repintar (Animated). Solo se repinta si algo enseña el valor
    // (burbuja, valor del label, marcas), y como mucho una vez por fotograma
    const frame = (0, react_1.useRef)(null);
    const scheduled = (0, react_1.useRef)(false);
    const live = (0, react_1.useRef)(false);
    const commitDrag = (v) => {
        valsRef.current = v;
        place(v);
        if (!live.current || scheduled.current)
            return;
        scheduled.current = true;
        frame.current = requestAnimationFrame(() => { scheduled.current = false; frame.current = null; setVals(valsRef.current); });
    };
    (0, react_1.useEffect)(() => () => { if (frame.current != null)
        cancelAnimationFrame(frame.current); }, []);
    // Controlado: el valor de fuera manda (si no se está arrastrando)
    // (al soltar también: si el padre no aceptó el valor, vuelve al suyo)
    const external = controlled ? JSON.stringify(normalize(value)) : null;
    const [released, setReleased] = (0, react_1.useState)(0);
    (0, react_1.useEffect)(() => { if (external && dragging == null)
        commit(JSON.parse(external)); }, [external, dragging, released]);
    (0, react_1.useEffect)(() => { place(valsRef.current); }, [width, min, max]);
    (0, react_1.useImperativeHandle)(ref, () => ({ setValue: v => commit(normalize(v)), getValue: () => out(valsRef.current) }));
    // El gesto lee siempre lo último (el PanResponder se crea una vez)
    const live0 = showValue !== false || !!showLabelValue || !!marks;
    const latest = (0, react_1.useRef)({ onChange, onChangeEnd, onChangeStart, disabled, range, minDistance, controlled, live: live0 });
    latest.current = { onChange, onChangeEnd, onChangeStart, disabled, range, minDistance, controlled, live: live0 };
    const drag = (0, react_1.useRef)({ thumb: 1, startX: 0, start: [0, 0] });
    const end = () => {
        var _a, _b;
        if (frame.current != null)
            cancelAnimationFrame(frame.current);
        frame.current = null;
        scheduled.current = false;
        setVals(valsRef.current);
        setDragging(null);
        setReleased(r => r + 1);
        (_b = (_a = latest.current).onChangeEnd) === null || _b === void 0 ? void 0 : _b.call(_a, out(valsRef.current));
    };
    const valueAt = (x) => snap(min + (clamp(x, 0, widthRef.current) / (widthRef.current || 1)) * (max - min));
    const moveTo = (x) => {
        var _a, _b;
        const { thumb } = drag.current;
        const cur = valsRef.current;
        let v = valueAt(x);
        let next;
        if (!latest.current.range)
            next = [v, v];
        else if (thumb === 0) {
            v = Math.min(v, cur[1] - latest.current.minDistance);
            next = [Math.max(min, v), cur[1]];
        }
        else {
            v = Math.max(v, cur[0] + latest.current.minDistance);
            next = [cur[0], Math.min(max, v)];
        }
        if (next[0] === cur[0] && next[1] === cur[1])
            return;
        // Controlado: se mueve igual mientras se arrastra (al soltar, manda el value de fuera)
        commitDrag(next);
        (_b = (_a = latest.current).onChange) === null || _b === void 0 ? void 0 : _b.call(_a, out(next));
    };
    const responder = (0, react_1.useMemo)(() => react_native_1.PanResponder.create({
        onStartShouldSetPanResponder: () => !latest.current.disabled,
        // Horizontal: el slider se queda el gesto; vertical: lo deja para el scroll
        onMoveShouldSetPanResponder: (_, g) => !latest.current.disabled && Math.abs(g.dx) > Math.abs(g.dy),
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: e => {
            var _a, _b;
            const x = e.nativeEvent.locationX - thumbSize / 2;
            const cur = valsRef.current;
            // Rango: el tirador más cercano (si están juntos, el que puede moverse hacia donde se toca)
            let thumb = 1;
            if (latest.current.range) {
                const d0 = Math.abs(toPx(cur[0]) - x), d1 = Math.abs(toPx(cur[1]) - x);
                thumb = d0 < d1 || (d0 === d1 && x < toPx(cur[0])) ? 0 : 1;
            }
            drag.current = { thumb, startX: x, start: cur };
            live.current = latest.current.live;
            setDragging(thumb);
            (_b = (_a = latest.current).onChangeStart) === null || _b === void 0 ? void 0 : _b.call(_a, out(cur));
            moveTo(x);
        },
        onPanResponderMove: (_, g) => moveTo(drag.current.startX + g.dx),
        onPanResponderRelease: () => end(),
        onPanResponderTerminate: () => end(),
    }), [thumbSize, min, max, step, range]);
    const onLayout = (e) => {
        const w = Math.max(0, e.nativeEvent.layout.width - thumbSize);
        widthRef.current = w;
        setWidth(w);
    };
    // Accesibilidad (un solo valor): deslizar arriba / abajo con el lector de pantalla
    const onAccessibilityAction = (e) => {
        const inc = step > 0 ? step : (max - min) / 20;
        const cur = valsRef.current[1];
        const v = snap(e.nativeEvent.actionName === 'increment' ? cur + inc : cur - inc);
        if (v === cur)
            return;
        const next = [v, v];
        commit(next);
        onChange === null || onChange === void 0 ? void 0 : onChange(out(next));
        onChangeEnd === null || onChangeEnd === void 0 ? void 0 : onChangeEnd(out(next));
    };
    // Marcas
    const markList = (0, react_1.useMemo)(() => {
        if (!marks)
            return [];
        if (marks === true) {
            const n = step > 0 ? Math.floor((max - min) / step) : 0;
            return n > 0 && n <= 20 ? Array.from({ length: n + 1 }, (_, i) => ({ value: snap(min + i * step) })) : [];
        }
        return marks.map(m => (typeof m === 'number' ? { value: m } : m)).filter(m => m.value >= min && m.value <= max);
    }, [marks, min, max, step]);
    const track = react_native_1.StyleSheet.flatten((0, DEFAULT_PROPS_1.DEFAULT_PROPS)(Object.assign({ bg: 'light.100', rounded: 40 }, _track), theme));
    const fill = react_native_1.StyleSheet.flatten((0, DEFAULT_PROPS_1.DEFAULT_PROPS)(Object.assign(Object.assign({ rounded: 40 }, _fill), { bg: undefined }), theme));
    const thumbProps = Object.assign(Object.assign({}, _thumb), { bg: (_thumb === null || _thumb === void 0 ? void 0 : _thumb.bg) === '__fill__' ? fillColor : (_c = _thumb === null || _thumb === void 0 ? void 0 : _thumb.bg) !== null && _c !== void 0 ? _c : 'white', borderColor: (_thumb === null || _thumb === void 0 ? void 0 : _thumb.borderColor) === '__fill__' ? fillColor : _thumb === null || _thumb === void 0 ? void 0 : _thumb.borderColor });
    // Deshabilitado, sin sombra (con la opacidad, en Android deja un halo)
    const thumbStyle = react_native_1.StyleSheet.flatten((0, DEFAULT_PROPS_1.DEFAULT_PROPS)(Object.assign({ shadow: disabled ? 'none' : 2 }, thumbProps), theme));
    // La burbuja: del color del texto (oscura en claro, clara en oscuro)
    const tooltip = react_native_1.StyleSheet.flatten((0, DEFAULT_PROPS_1.DEFAULT_PROPS)(Object.assign({ bg: 'text', rounded: 2, px: 2, py: 1 }, _tooltip), theme));
    const tooltipText = _tooltip === null || _tooltip === void 0 ? void 0 : _tooltip._text;
    const height = Math.max(thumbSize, 32);
    const top = (height - trackH) / 2;
    const label0 = formatValue(vals[0]), label1 = formatValue(vals[1]);
    const renderThumb = (i) => {
        const show = showValue === true || (showValue === 'drag' && dragging === i);
        return (<react_native_1.Animated.View key={i} pointerEvents="none" style={{
                position: 'absolute', left: 0, top: (height - thumbSize) / 2, width: thumbSize, height: thumbSize,
                transform: [{ translateX: pos[i] }, { scale: dragging === i ? 1.12 : 1 }],
                zIndex: dragging === i ? 3 : 2,
            }}>
                <react_native_1.View style={[{ width: thumbSize, height: thumbSize, borderRadius: thumbSize / 2 }, thumbStyle]}/>
                {show && (<react_native_1.View style={{ position: 'absolute', bottom: thumbSize + 6, left: -40, right: -40, alignItems: 'center' }}>
                        <react_native_1.View style={tooltip}>
                            <Text_1.Text fontSize={12} fontWeight="600" color="background" {...tooltipText}>{i === 0 ? label0 : label1}</Text_1.Text>
                        </react_native_1.View>
                    </react_native_1.View>)}
            </react_native_1.Animated.View>);
    };
    const fillLeft = range ? pos[0] : 0;
    const fillWidth = range ? react_native_1.Animated.subtract(pos[1], pos[0]) : pos[1];
    return (<Box_1.Box opacity={disabled ? 0.5 : 1} {...boxProps}>
            {(label || showLabelValue) && (<Box_1.Box flexDir="row" alignItems="center" mb={showValue === true ? 6 : 1}>
                    <Box_1.Box flex={1}>{label ? <Label_1.Label isRequired={isRequired} {..._label}>{label}</Label_1.Label> : null}</Box_1.Box>
                    {showLabelValue && <Text_1.Text fontWeight="600" fontSize={13} color="text.muted">{range ? `${label0} – ${label1}` : label1}</Text_1.Text>}
                </Box_1.Box>)}
            {!label && !showLabelValue && showValue === true && <Box_1.Box h={6}/>}
            <react_native_1.View {...responder.panHandlers} onLayout={onLayout} style={{ height, justifyContent: 'center' }} accessible accessibilityRole="adjustable" accessibilityLabel={label} accessibilityState={{ disabled: !!disabled }} accessibilityValue={range ? { text: `${label0} – ${label1}` } : { min, max, now: vals[1], text: label1 }} accessibilityActions={range ? undefined : [{ name: 'increment' }, { name: 'decrement' }]} onAccessibilityAction={range ? undefined : onAccessibilityAction}>
                <react_native_1.View pointerEvents="none" style={[{ position: 'absolute', left: thumbSize / 2, right: thumbSize / 2, top, height: trackH }, track]}/>
                <react_native_1.Animated.View pointerEvents="none" style={[{
                position: 'absolute', top, height: trackH, left: thumbSize / 2, width: fillWidth, backgroundColor: fillColor,
                transform: [{ translateX: fillLeft }],
            }, fill]}/>
                {markList.map(m => (<react_native_1.View key={m.value} pointerEvents="none" style={{
                position: 'absolute', top: top + trackH / 2 - 2, width: 4, height: 4, borderRadius: 2,
                left: thumbSize / 2 + toPx(m.value) - 2,
                // Dentro del relleno, clara; fuera, gris
                backgroundColor: (range ? m.value >= vals[0] && m.value <= vals[1] : m.value <= vals[1]) ? 'rgba(255,255,255,0.7)' : color('silver.100'),
            }}/>))}
                {range && renderThumb(0)}
                {renderThumb(1)}
            </react_native_1.View>
            {(showMinMax || markList.some(m => m.label != null)) && (<react_native_1.View style={{ height: 18, marginHorizontal: thumbSize / 2 }}>
                    {showMinMax && <Text_1.Text variant="caption" position="absolute" left={0} {..._mark}>{formatValue(min)}</Text_1.Text>}
                    {showMinMax && <Text_1.Text variant="caption" position="absolute" right={0} {..._mark}>{formatValue(max)}</Text_1.Text>}
                    {markList.filter(m => m.label != null).map(m => (<react_native_1.View key={m.value} style={{ position: 'absolute', left: toPx(m.value) - 40, width: 80, alignItems: 'center' }}>
                            <Text_1.Text variant="caption" {..._mark}>{m.label}</Text_1.Text>
                        </react_native_1.View>))}
                </react_native_1.View>)}
        </Box_1.Box>);
});
