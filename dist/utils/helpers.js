"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderChild = exports.mergeTheme = exports.calcSize = void 0;
exports.getDeviceLanguage = getDeviceLanguage;
exports.getDeviceLocaleInfo = getDeviceLocaleInfo;
const Text_1 = require("../Text");
const react_1 = __importDefault(require("react"));
const calcSize = (size) => {
    const sizes = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6];
    if (typeof size == "number" && sizes.includes(size))
        return size * 4;
    return size;
};
exports.calcSize = calcSize;
/**
 * Junta el tema de la librería con el tuyo (lo hace el ThemeProvider). Por cada modo, tus colores, sombras y components
 * se mezclan con los de la librería en vez de reemplazarlos. El modo oscuro hereda lo que pongas en `light` (tus colores
 * de marca, fuentes, components…) salvo los colores que tienen versión oscura (semánticos y grises), y encima lo de `dark`
 * @example mergeTheme(libTheme, { light: { colors: { 'primary.100': '#0EA5E9' } } }) // primary también en oscuro
 */
const mergeTheme = (libTheme, theme) => {
    var _a, _b;
    const mergeMode = (base, ...customs) => {
        const out = Object.assign({}, base);
        for (const custom of customs) {
            if (!custom)
                continue;
            Object.keys(custom).forEach(key => {
                const v = custom[key];
                const isObject = typeof v == 'object' && v !== null && !Array.isArray(v);
                if (key === 'components' && isObject) {
                    // Por componente y por variante: Box en dark no borra el Box de light (ni sus variantes)
                    const comps = Object.assign({}, out.components);
                    Object.keys(v).forEach(name => {
                        var _a, _b;
                        const prev = (_a = comps[name]) !== null && _a !== void 0 ? _a : {}, next = (_b = v[name]) !== null && _b !== void 0 ? _b : {};
                        comps[name] = Object.assign(Object.assign(Object.assign({}, prev), next), (prev.variants || next.variants ? { variants: Object.assign(Object.assign({}, prev.variants), next.variants) } : {}));
                    });
                    out.components = comps;
                }
                else
                    out[key] = isObject ? Object.assign(Object.assign({}, out[key]), v) : v;
            });
        }
        return out;
    };
    const lib = libTheme;
    // Los colores que el oscuro de la librería redefine: no se heredan de light
    const darkKeys = new Set(Object.keys((_b = (_a = lib.dark) === null || _a === void 0 ? void 0 : _a.colors) !== null && _b !== void 0 ? _b : {}).filter(k => { var _a, _b; return lib.dark.colors[k] !== ((_b = (_a = lib.light) === null || _a === void 0 ? void 0 : _a.colors) === null || _b === void 0 ? void 0 : _b[k]); }));
    const merge = {};
    Object.keys(Object.assign(Object.assign({}, libTheme), theme)).forEach(mode => {
        var _a;
        const base = lib[mode] || {};
        const custom = theme === null || theme === void 0 ? void 0 : theme[mode];
        if (mode === 'dark') {
            const light = theme === null || theme === void 0 ? void 0 : theme.light;
            const fromLight = light ? Object.assign(Object.assign({}, light), { colors: Object.fromEntries(Object.entries((_a = light.colors) !== null && _a !== void 0 ? _a : {}).filter(([k]) => !darkKeys.has(k))) }) : undefined;
            merge[mode] = mergeMode(base, fromLight, custom);
        }
        else
            merge[mode] = mergeMode(base, custom);
    });
    return merge;
};
exports.mergeTheme = mergeTheme;
const renderChild = (children, props) => react_1.default.Children.map(children, (child) => {
    if (typeof child === "string" || typeof child === 'number')
        return <Text_1.Text {...props}>{child}</Text_1.Text>;
    return child;
});
exports.renderChild = renderChild;
/**
 * El idioma del dispositivo, sin la región ('es-MX' → 'es'). Es el idioma inicial de las traducciones
 * @example getDeviceLanguage(); // 'es'
 */
function getDeviceLanguage() {
    return Intl.DateTimeFormat().resolvedOptions().locale.split(/[-_]/)[0];
}
/**
 * La configuración regional del dispositivo según Intl: locale, calendario, sistema de números y zona horaria
 * @example getDeviceLocaleInfo().timeZone; // 'Europe/Madrid'
 */
function getDeviceLocaleInfo(options = {}) {
    const formatter = new Intl.DateTimeFormat(undefined, options);
    return formatter.resolvedOptions();
}
