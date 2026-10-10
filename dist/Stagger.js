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
exports.Stagger = exports.STAGGER_PRESETS = void 0;
// Stagger: anima la entrada (y la salida) de sus hijos uno detrás de otro. Presets (fadeUp, scale, flip...) o from / to
// propios, salida distinta de la entrada (exit), orden (en orden, al revés, desde el centro), visible controlado, ref
// (show / hide / toggle / replay) y avisos al terminar
const react_1 = __importStar(require("react"));
const react_native_reanimated_1 = __importStar(require("react-native-reanimated"));
const Box_1 = require("./Box");
const useThemeProps_1 = require("./utils/useThemeProps");
/* -------------------- Constantes -------------------- */
const DEFAULT_DURATION = 400;
const DEFAULT_EASING = react_native_reanimated_1.Easing.bezier(0.4, 0, 0.2, 1);
const VISIBLE = { opacity: 1, translateX: 0, translateY: 0, scale: 1 };
/** Las animaciones de `preset`: cómo están ocultos (from) y visibles (to). from / to de las props se aplican encima */
exports.STAGGER_PRESETS = {
    none: { from: {}, to: {} },
    fade: { from: { opacity: 0 }, to: { opacity: 1 } },
    fadeUp: { from: { opacity: 0, translateY: 20, scale: 0.95 }, to: VISIBLE },
    fadeDown: { from: { opacity: 0, translateY: -20 }, to: VISIBLE },
    fadeLeft: { from: { opacity: 0, translateX: 30 }, to: VISIBLE },
    fadeRight: { from: { opacity: 0, translateX: -30 }, to: VISIBLE },
    scale: { from: { opacity: 0, scale: 0.6 }, to: VISIBLE },
    zoom: { from: { opacity: 0, scale: 1.3 }, to: VISIBLE },
    flip: { from: { opacity: 0, rotateX: 90 }, to: { opacity: 1, rotateX: 0 } },
};
const ROTATIONS = ['rotate', 'rotateX', 'rotateY', 'rotateZ', 'skewX', 'skewY'];
const deg = (v) => {
    'worklet';
    return parseFloat(String(v !== null && v !== void 0 ? v : 0)) || 0;
};
const StaggerItem = ({ from, to, exit, showDelay, hideDelay, duration, easing, initial, register, onDone, animateText, enterOnMount, children }) => {
    // 0 = oculto (from), 1 = visible (to), 2 = salido (exit)
    const progress = (0, react_native_reanimated_1.useSharedValue)(enterOnMount ? 0 : initial);
    const [interactive, setInteractive] = (0, react_1.useState)(enterOnMount || initial === 1);
    (0, react_1.useEffect)(() => {
        var _a, _b, _c, _d;
        if (enterOnMount)
            progress.value = (0, react_native_reanimated_1.withTiming)(1, { duration: (_b = (_a = to.duration) !== null && _a !== void 0 ? _a : duration) !== null && _b !== void 0 ? _b : DEFAULT_DURATION, easing: ((_d = (_c = to.easing) !== null && _c !== void 0 ? _c : easing) !== null && _d !== void 0 ? _d : DEFAULT_EASING) });
    }, []);
    register({
        animate: (v, run) => {
            var _a, _b, _c, _d, _e;
            const p = v === 1 ? to : exit !== null && exit !== void 0 ? exit : from;
            const target = v === 1 ? 1 : exit ? 2 : 0;
            // Si va a entrar desde la salida, primero vuelve a "oculto" (si no, entraría por donde salió)
            if (v === 1 && progress.value > 1)
                progress.value = 0;
            setInteractive(v === 1);
            progress.value = (0, react_native_reanimated_1.withDelay)(((_a = p.delay) !== null && _a !== void 0 ? _a : 0) + (v === 1 ? showDelay : hideDelay), (0, react_native_reanimated_1.withTiming)(target, { duration: (_c = (_b = p.duration) !== null && _b !== void 0 ? _b : duration) !== null && _c !== void 0 ? _c : DEFAULT_DURATION, easing: ((_e = (_d = p.easing) !== null && _d !== void 0 ? _d : easing) !== null && _e !== void 0 ? _e : DEFAULT_EASING) }, finished => { if (finished)
                (0, react_native_reanimated_1.runOnJS)(onDone)(run); }));
        },
        reset: () => { progress.value = 0; setInteractive(false); },
    });
    const style = (0, react_native_reanimated_1.useAnimatedStyle)(() => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        const e = exit !== null && exit !== void 0 ? exit : from;
        const range = [0, 1, 2];
        const num = (k, base) => {
            var _a, _b, _c, _d, _e;
            const f = (_b = (_a = from[k]) !== null && _a !== void 0 ? _a : to[k]) !== null && _b !== void 0 ? _b : base, t = (_d = (_c = to[k]) !== null && _c !== void 0 ? _c : from[k]) !== null && _d !== void 0 ? _d : base, x = (_e = e[k]) !== null && _e !== void 0 ? _e : f;
            return (0, react_native_reanimated_1.interpolate)(progress.value, range, [f, t, x]);
        };
        const out = {
            opacity: num('opacity', 1),
            transform: [{ translateX: num('translateX', 0) }, { translateY: num('translateY', 0) }, { scale: num('scale', 1) }],
        };
        for (const k of ROTATIONS) {
            if (from[k] == null && to[k] == null && e[k] == null)
                continue;
            const f = deg((_a = from[k]) !== null && _a !== void 0 ? _a : to[k]), t = deg((_b = to[k]) !== null && _b !== void 0 ? _b : from[k]), x = e[k] != null ? deg(e[k]) : f;
            out.transform.push({ [k]: `${(0, react_native_reanimated_1.interpolate)(progress.value, range, [f, t, x])}deg` });
        }
        // Solo lo que se anima (si no, se pisarían los estilos del hijo)
        if (from.backgroundColor || to.backgroundColor || e.backgroundColor) {
            const f = (_d = (_c = from.backgroundColor) !== null && _c !== void 0 ? _c : to.backgroundColor) !== null && _d !== void 0 ? _d : 'transparent', t = (_e = to.backgroundColor) !== null && _e !== void 0 ? _e : f;
            out.backgroundColor = (0, react_native_reanimated_1.interpolateColor)(progress.value, range, [f, t, (_f = e.backgroundColor) !== null && _f !== void 0 ? _f : f]);
        }
        if (from.borderColor || to.borderColor || e.borderColor) {
            const f = (_h = (_g = from.borderColor) !== null && _g !== void 0 ? _g : to.borderColor) !== null && _h !== void 0 ? _h : 'transparent', t = (_j = to.borderColor) !== null && _j !== void 0 ? _j : f;
            out.borderColor = (0, react_native_reanimated_1.interpolateColor)(progress.value, range, [f, t, (_k = e.borderColor) !== null && _k !== void 0 ? _k : f]);
        }
        if (from.borderWidth != null || to.borderWidth != null)
            out.borderWidth = num('borderWidth', 0);
        if (from.borderRadius != null || to.borderRadius != null)
            out.borderRadius = num('borderRadius', 0);
        if (from.width != null || to.width != null)
            out.width = num('width', 0);
        if (from.height != null || to.height != null)
            out.height = num('height', 0);
        return out;
    });
    const textStyle = (0, react_native_reanimated_1.useAnimatedStyle)(() => {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const e = exit !== null && exit !== void 0 ? exit : from, out = {};
        if (from.color || to.color) {
            const f = (_b = (_a = from.color) !== null && _a !== void 0 ? _a : to.color) !== null && _b !== void 0 ? _b : '#000', t = (_c = to.color) !== null && _c !== void 0 ? _c : f;
            out.color = (0, react_native_reanimated_1.interpolateColor)(progress.value, [0, 1, 2], [f, t, (_d = e.color) !== null && _d !== void 0 ? _d : f]);
        }
        if (from.letterSpacing != null || to.letterSpacing != null) {
            const f = (_f = (_e = from.letterSpacing) !== null && _e !== void 0 ? _e : to.letterSpacing) !== null && _f !== void 0 ? _f : 0, t = (_g = to.letterSpacing) !== null && _g !== void 0 ? _g : f;
            out.letterSpacing = (0, react_native_reanimated_1.interpolate)(progress.value, [0, 1, 2], [f, t, (_h = e.letterSpacing) !== null && _h !== void 0 ? _h : f]);
        }
        return out;
    });
    // El color / espaciado del texto se anima envolviendo los textos sueltos del hijo
    const child = animateText
        ? react_1.default.cloneElement(children, {
            children: react_1.default.Children.map(children.props.children, (x) => (typeof x === 'string' || typeof x === 'number' ? <react_native_reanimated_1.default.Text style={textStyle}>{x}</react_native_reanimated_1.default.Text> : x)),
        })
        : children;
    return <react_native_reanimated_1.default.View style={style} pointerEvents={interactive ? 'auto' : 'none'}>{child}</react_native_reanimated_1.default.View>;
};
/* -------------------- Componente -------------------- */
function InternalStagger(rawProps, ref) {
    var _a;
    // Defaults → theme.components.Stagger → variante → props → plataforma (el variant no pasa al Box)
    const [_b] = (0, useThemeProps_1.useThemeProps)('Stagger', rawProps), { children, preset = 'fadeUp', from: fromProp, to: toProp, exit, visible, animateOnInit = true, staggerDelay = 80, order = 'forward', delay = 0, duration, easing, onShowEnd, onHideEnd, variant: _variant } = _b, props = __rest(_b, ["children", "preset", "from", "to", "exit", "visible", "animateOnInit", "staggerDelay", "order", "delay", "duration", "easing", "onShowEnd", "onHideEnd", "variant"]);
    const base = (_a = exports.STAGGER_PRESETS[preset]) !== null && _a !== void 0 ? _a : exports.STAGGER_PRESETS.fadeUp;
    const from = Object.assign(Object.assign({}, base.from), fromProp);
    const to = Object.assign(Object.assign({}, base.to), toProp);
    const items = react_1.default.Children.toArray(children).filter(react_1.default.isValidElement);
    const n = items.length;
    const animateText = !!(from.color || to.color || from.letterSpacing != null || to.letterSpacing != null);
    const apis = (0, react_1.useRef)([]);
    const shown = (0, react_1.useRef)(visible !== null && visible !== void 0 ? visible : true);
    const run = (0, react_1.useRef)({ id: 0, target: 1, done: 0 });
    const latest = (0, react_1.useRef)({ onShowEnd, onHideEnd, n });
    latest.current = { onShowEnd, onHideEnd, n };
    // Cómo empieza cada hijo al montarse el Stagger; los que se añaden después (estando visible) entran animados
    const initial = (0, react_1.useRef)(animateOnInit || visible === false ? 0 : 1);
    const mounted = (0, react_1.useRef)(false);
    // Posición en la cola: en orden, al revés o desde el centro hacia fuera
    const rank = (i) => (order === 'reverse' ? n - 1 - i : order === 'center' ? Math.round(Math.abs(i - (n - 1) / 2)) : i);
    const maxRank = n ? Math.max(...items.map((_, i) => rank(i))) : 0;
    const animate = (v) => {
        shown.current = v === 1;
        run.current = { id: run.current.id + 1, target: v, done: 0 };
        apis.current.slice(0, n).forEach(a => a === null || a === void 0 ? void 0 : a.animate(v, run.current.id));
    };
    const onDone = (id) => {
        var _a;
        if (id !== run.current.id)
            return;
        // Cuando terminan todos (el último de la cola) se avisa
        if (++run.current.done === latest.current.n)
            (_a = (run.current.target === 1 ? latest.current.onShowEnd : latest.current.onHideEnd)) === null || _a === void 0 ? void 0 : _a();
    };
    (0, react_1.useImperativeHandle)(ref, () => ({
        show: () => animate(1),
        hide: () => animate(0),
        toggle: () => animate(shown.current ? 0 : 1),
        replay: () => { apis.current.slice(0, n).forEach(a => a === null || a === void 0 ? void 0 : a.reset()); animate(1); },
        isVisible: () => shown.current,
    }));
    // Al montarse: entrada animada (si se pidió y debe verse)
    (0, react_1.useEffect)(() => {
        mounted.current = true;
        if (animateOnInit && (visible !== null && visible !== void 0 ? visible : true))
            animate(1);
    }, []);
    // Controlado
    const first = (0, react_1.useRef)(true);
    (0, react_1.useEffect)(() => {
        if (first.current) {
            first.current = false;
            return;
        }
        if (visible != null && visible !== shown.current)
            animate(visible ? 1 : 0);
    }, [visible]);
    return (<Box_1.Box {...props}>
            {items.map((child, i) => {
            var _a;
            return (<StaggerItem key={(_a = child.key) !== null && _a !== void 0 ? _a : i} from={from} to={to} exit={exit} showDelay={delay + rank(i) * staggerDelay} hideDelay={delay + (maxRank - rank(i)) * staggerDelay} duration={duration} easing={easing} initial={!shown.current ? 0 : initial.current} enterOnMount={mounted.current && shown.current} register={api => { apis.current[i] = api; }} onDone={onDone} animateText={animateText}>
                    {child}
                </StaggerItem>);
        })}
        </Box_1.Box>);
}
exports.Stagger = (0, react_1.forwardRef)(InternalStagger);
