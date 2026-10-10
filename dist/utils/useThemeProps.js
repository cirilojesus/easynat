"use strict";
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
exports.useThemeProps = exports.mergeProps = void 0;
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const theme_provider_1 = require("../theme-provider");
const isPlainObject = (v) => !!v && typeof v === "object" && !Array.isArray(v) && !react_1.default.isValidElement(v)
    && Object.getPrototypeOf(v) === Object.prototype;
/**
 * Fusiona props de izquierda a derecha (las de la derecha ganan). Las props de estilo anidadas
 * (_text, _icon, _pressed...) se fusionan en vez de reemplazarse: un `_text: { color }` del tema y un
 * `_text: { fontSize }` de las props se aplican los dos. Los undefined no pisan valores anteriores.
 */
const mergeProps = (...sources) => mergeWith(undefined, sources);
exports.mergeProps = mergeProps;
const mergeWith = (mergeKeys, sources) => {
    const result = {};
    for (const source of sources) {
        if (!source)
            continue;
        for (const key in source) {
            const value = source[key];
            if (value === undefined)
                continue;
            const prev = result[key];
            result[key] = (key[0] === "_" || (mergeKeys === null || mergeKeys === void 0 ? void 0 : mergeKeys.includes(key))) && isPlainObject(value) && isPlainObject(prev)
                ? (0, exports.mergeProps)(prev, value)
                : value;
        }
    }
    return result;
};
/**
 * Props finales de un componente según el tema, en este orden (cada uno pisa al anterior):
 * defaults del componente → theme.components[name] → variante (del componente + del tema, según
 * props.variant o el variant por defecto; varias separadas por espacios, en orden) → tamaño → props → _ios / _android / _web de la plataforma.
 *
 * Devuelve [props, theme]: así el componente lee el contexto del tema una sola vez.
 * @example const [{ variant, ...rest }, theme] = useThemeProps('Box', props, { variants: BOX_VARIANTS });
 */
const useThemeProps = (name, props, options) => {
    var _a, _b, _c, _d, _e;
    const { theme } = (0, theme_provider_1.useTheme)();
    const _f = ((_b = (_a = theme === null || theme === void 0 ? void 0 : theme.components) === null || _a === void 0 ? void 0 : _a[name]) !== null && _b !== void 0 ? _b : {}), { variants: themeVariants } = _f, themeDefaults = __rest(_f, ["variants"]);
    const keys = options === null || options === void 0 ? void 0 : options.mergeKeys;
    const base = mergeWith(keys, [options === null || options === void 0 ? void 0 : options.defaults, themeDefaults]);
    const variant = (_c = props.variant) !== null && _c !== void 0 ? _c : base.variant;
    const size = (_d = props.size) !== null && _d !== void 0 ? _d : base.size;
    const libVariants = typeof (options === null || options === void 0 ? void 0 : options.variants) === 'function'
        ? options.variants(theme, mergeWith(keys, [base, props]))
        : options === null || options === void 0 ? void 0 : options.variants;
    // Varias variantes separadas por espacios se aplican en orden: variant="card row"
    const names = typeof variant === 'string' ? variant.split(/\s+/).filter(Boolean) : variant != null ? [variant] : [];
    const merged = mergeWith(keys, [
        base,
        ...names.flatMap(n => [libVariants === null || libVariants === void 0 ? void 0 : libVariants[n], themeVariants === null || themeVariants === void 0 ? void 0 : themeVariants[n]]),
        size != null && ((_e = options === null || options === void 0 ? void 0 : options.sizes) === null || _e === void 0 ? void 0 : _e[size]),
        props,
    ]);
    const platform = merged[`_${react_native_1.Platform.OS}`];
    return [(platform ? mergeWith(keys, [merged, platform]) : merged), theme];
};
exports.useThemeProps = useThemeProps;
