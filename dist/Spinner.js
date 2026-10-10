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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpinnerOverlay = exports.withSpinner = exports.isSpinnerVisible = exports.hideSpinner = exports.showSpinner = exports.Spinner = void 0;
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const react_native_root_siblings_1 = __importDefault(require("react-native-root-siblings"));
const Box_1 = require("./Box");
const Text_1 = require("./Text");
const useThemeProps_1 = require("./utils/useThemeProps");
const Spinner = (props) => {
    // Defaults → theme.components.Spinner → variante → props → plataforma
    const [combinedProps, theme] = (0, useThemeProps_1.useThemeProps)('Spinner', props, { defaults: { color: 'primary.100' } });
    return (<react_native_1.ActivityIndicator {...combinedProps} color={theme.colors[combinedProps.color] || combinedProps.color}/>);
};
exports.Spinner = Spinner;
// Cada showSpinner es una entrada: se ve mientras quede alguna (se pueden solapar cargas sin que la primera
// en terminar esconda las demás). Se pinta en su propia capa encima de todo (incluidos los modales abiertos)
const entries = new Map();
let nextId = 0;
let state = { visible: false, opts: {} };
const listeners = new Set();
const setState = (s) => { state = s; listeners.forEach(l => l()); };
let sibling = null;
let shownAt = 0;
let hideTimer = null;
const sync = () => {
    var _a;
    const active = [...entries.values()].filter(e => e.shown);
    if (active.length) {
        if (hideTimer) {
            clearTimeout(hideTimer);
            hideTimer = null;
        }
        if (!state.visible)
            shownAt = Date.now();
        // Una capa nueva cada vez que aparece: así queda por encima de lo abierto después
        if (!sibling)
            sibling = new react_native_root_siblings_1.default(<SpinnerHost />);
        setState({ visible: true, opts: active[active.length - 1].opts });
        return;
    }
    if (!state.visible || hideTimer)
        return;
    // Lo que falte para el tiempo mínimo
    const wait = Math.max(0, ((_a = state.opts.minDuration) !== null && _a !== void 0 ? _a : 300) - (Date.now() - shownAt));
    hideTimer = setTimeout(() => { hideTimer = null; if (![...entries.values()].some(e => e.shown))
        setState(Object.assign(Object.assign({}, state), { visible: false })); }, wait);
};
const remove = (id) => {
    const e = entries.get(id);
    if (!e)
        return;
    e.timers.forEach(clearTimeout);
    entries.delete(id);
    sync();
};
/**
 * Muestra un spinner que tapa toda la pantalla (y bloquea los toques) desde cualquier parte, sin montar nada.
 * Devuelve un control para esconderlo; hideSpinner() los esconde todos
 * @example const s = showSpinner('Guardando…'); await guardar(); s.hide();
 * @example showSpinner({ message: 'Conectando…', duration: 3000 })
 */
const showSpinner = (options) => {
    var _a;
    const opts = typeof options === 'string' ? { message: options } : Object.assign({}, options);
    const id = ++nextId;
    const entry = { id, opts, shown: false, timers: [] };
    entries.set(id, entry);
    const reveal = () => {
        if (!entries.has(id))
            return;
        entry.shown = true;
        if (opts.dismissKeyboard !== false)
            react_native_1.Keyboard.dismiss();
        sync();
    };
    if (opts.delay)
        entry.timers.push(setTimeout(reveal, opts.delay));
    else
        reveal();
    if (opts.duration)
        entry.timers.push(setTimeout(() => remove(id), ((_a = opts.delay) !== null && _a !== void 0 ? _a : 0) + opts.duration));
    return {
        hide: () => remove(id),
        update: patch => { if (!entries.has(id))
            return; entry.opts = Object.assign(Object.assign({}, entry.opts), patch); if (entry.shown)
            sync(); },
    };
};
exports.showSpinner = showSpinner;
/** Esconde todos los spinners de pantalla completa */
const hideSpinner = () => { [...entries.keys()].forEach(id => { var _a; return (_a = entries.get(id)) === null || _a === void 0 ? void 0 : _a.timers.forEach(clearTimeout); }); entries.clear(); sync(); };
exports.hideSpinner = hideSpinner;
/** ¿Se está viendo? */
const isSpinnerVisible = () => state.visible;
exports.isSpinnerVisible = isSpinnerVisible;
/**
 * Muestra el spinner mientras dura la promesa (o la función async) y lo esconde al terminar, salga bien o mal
 * @example const datos = await withSpinner(api.get('/pedidos'), 'Cargando pedidos…');
 */
const withSpinner = async (task, options) => {
    const s = (0, exports.showSpinner)(options);
    try {
        return await (typeof task === 'function' ? task() : task);
    }
    finally {
        s.hide();
    }
};
exports.withSpinner = withSpinner;
/** La capa: aparece y desaparece con un fundido; al terminar de desaparecer se quita */
const SpinnerHost = () => {
    const current = (0, react_1.useSyncExternalStore)(cb => { listeners.add(cb); return () => { listeners.delete(cb); }; }, () => state);
    const opacity = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    const [props] = (0, useThemeProps_1.useThemeProps)('SpinnerOverlay', current.opts, {
        variants: {
            card: { _content: { bg: 'surface', rounded: 4, p: 5, minW: 120, shadow: 3 }, color: 'primary.100' },
            plain: { _content: {}, color: 'white', _text: { color: 'white', fontWeight: '600' }, backdropColor: 'rgba(0,0,0,0.65)' },
        },
        defaults: { variant: 'card', size: 'large' },
    });
    const { message, progress, cancelable, onCancel, backdropColor = 'rgba(0,0,0,0.45)', size, color, _content, _text } = props;
    (0, react_1.useEffect)(() => {
        react_native_1.Animated.timing(opacity, { toValue: current.visible ? 1 : 0, duration: 180, useNativeDriver: true }).start(({ finished }) => {
            if (finished && !current.visible && !state.visible) {
                sibling === null || sibling === void 0 ? void 0 : sibling.destroy();
                sibling = null;
            }
        });
    }, [current.visible]);
    const cancel = () => { if (!cancelable)
        return; (0, exports.hideSpinner)(); onCancel === null || onCancel === void 0 ? void 0 : onCancel(); };
    // Atrás de Android: bloqueado mientras se ve (o cancela, si se puede)
    (0, react_1.useEffect)(() => {
        if (!current.visible)
            return;
        const sub = react_native_1.BackHandler.addEventListener('hardwareBackPress', () => { cancel(); return true; });
        return () => sub.remove();
    }, [current.visible, cancelable, onCancel]);
    const pct = progress != null ? Math.round(Math.max(0, Math.min(1, progress)) * 100) : null;
    return (<react_native_1.Animated.View style={[react_native_1.StyleSheet.absoluteFill, { opacity, zIndex: 100000, elevation: 100000 }]} pointerEvents={current.visible ? 'auto' : 'none'}>
            <react_native_1.Pressable style={[react_native_1.StyleSheet.absoluteFill, { backgroundColor: backdropColor, alignItems: 'center', justifyContent: 'center' }]} onPress={cancel} accessibilityViewIsModal accessibilityRole="progressbar" accessibilityLabel={message !== null && message !== void 0 ? message : 'loading'} accessibilityValue={pct != null ? { min: 0, max: 100, now: pct } : undefined}>
                <Box_1.Box alignItems="center" justifyContent="center" gap={3} {..._content}>
                    <exports.Spinner size={size} color={color}/>
                    {pct != null && <Text_1.Text fontWeight="600" {..._text}>{`${pct} %`}</Text_1.Text>}
                    {!!message && <Text_1.Text textAlign="center" maxW={260} {..._text}>{message}</Text_1.Text>}
                </Box_1.Box>
            </react_native_1.Pressable>
        </react_native_1.Animated.View>);
};
/**
 * El mismo spinner de pantalla completa, controlado por una prop (se ve mientras visible sea true)
 * @example <SpinnerOverlay visible={guardando} message="Guardando…" />
 */
const SpinnerOverlay = (_a) => {
    var { visible } = _a, options = __rest(_a, ["visible"]);
    const handle = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        if (visible && !handle.current)
            handle.current = (0, exports.showSpinner)(options);
        else if (!visible && handle.current) {
            handle.current.hide();
            handle.current = null;
        }
    }, [visible]);
    (0, react_1.useEffect)(() => { var _a; (_a = handle.current) === null || _a === void 0 ? void 0 : _a.update(options); }, [options.message, options.progress, options.cancelable, options.onCancel]);
    (0, react_1.useEffect)(() => () => { var _a; (_a = handle.current) === null || _a === void 0 ? void 0 : _a.hide(); handle.current = null; }, []);
    return null;
};
exports.SpinnerOverlay = SpinnerOverlay;
