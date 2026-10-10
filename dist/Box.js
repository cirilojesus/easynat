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
exports.Box = exports.GRID_GUTTERS = void 0;
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const DEFAULT_PROPS_1 = require("./utils/DEFAULT_PROPS");
const react_native_safe_area_context_1 = require("react-native-safe-area-context");
const helpers_1 = require("./utils/helpers");
const useThemeProps_1 = require("./utils/useThemeProps");
// Variantes propias (theme.components.Box.variants puede ampliarlas o modificarlas). Se combinan con espacios:
// variant="card row". Los números de espaciado (p, m, gap, rounded...) de 0.5 a 6 van en la escala x4 (p: 3 = 12 px);
// el resto (negativos, 10, 40...) en px
const BOX_VARIANTS = {
    // Tarjetas
    card: { borderWidth: 1, borderColor: 'border', p: 4, rounded: 4, bg: 'surface', shadow: 1 },
    card_sm: { borderWidth: 1, borderColor: 'border', p: 3, rounded: 2, bg: 'surface', shadow: 1 },
    card_flat: { borderWidth: 1, borderColor: 'border', p: 4, rounded: 4, bg: 'surface' },
    card_elevated: { p: 4, rounded: 4, bg: 'surface', shadow: 3 },
    card_outline: { borderWidth: 1, borderColor: 'muted.100', p: 4, rounded: 4 },
    surface: { bg: 'surface.50', p: 3, rounded: 3 },
    // Etiquetas
    badge: { rounded: 40, _text: { fontSize: 12 }, px: 2, py: 1, bg: 'light.100', flexDir: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 1 },
    badge_sm: { rounded: 40, _text: { color: 'white', fontSize: 11, fontWeight: '600' }, px: 1.5, py: 0.5, bg: 'primary.100', flexDir: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 0.5 },
    badge_lg: { rounded: 40, _text: { fontSize: 14, fontWeight: '600' }, px: 3, py: 1.5, bg: 'light.100', flexDir: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 1.5 },
    badge_outline: { rounded: 40, _text: { fontSize: 12, color: 'primary.100' }, px: 2, py: 1, borderWidth: 1, borderColor: 'primary.100', flexDir: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 1 },
    chip: { rounded: 40, px: 3, py: 1.5, bg: 'primary.50', _text: { color: 'primary.100', fontWeight: '600' }, flexDir: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 1.5 },
    /** Punto de aviso (p. ej. encima de un icono) */
    dot: { w: 10, h: 10, rounded: 40, bg: 'danger.100', borderWidth: 2, borderColor: 'surface' },
    // Disposición
    row: { flexDir: 'row', alignItems: 'center', gap: 2 },
    row_between: { flexDir: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 2 },
    column: { flexDir: 'column', gap: 2 },
    center: { alignItems: 'center', justifyContent: 'center' },
    fill: { flex: 1 },
    absolute_fill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
    overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, bg: 'black.50', alignItems: 'center', justifyContent: 'center' },
    screen: { flex: 1, bg: 'background' },
    section: { p: 4, gap: 3 },
    footer: { flexDir: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 2, pt: 3, borderTopWidth: 1, borderTopColor: 'light.100' },
    // Rejilla: grid_* por fuera y col_N por dentro (N por fila). La separación la pone la rejilla (ver GRID_GUTTERS) y
    // cada columna toma la mitad como padding a los lados
    grid_sm: { flexDir: 'row', flexWrap: 'wrap' },
    grid: { flexDir: 'row', flexWrap: 'wrap' },
    grid_lg: { flexDir: 'row', flexWrap: 'wrap' },
    grid_xl: { flexDir: 'row', flexWrap: 'wrap' },
    col_1: { w: '100%' },
    col_2: { w: '49.999%' },
    col_3: { w: '33.333%' },
    col_4: { w: '24.999%' },
    col_5: { w: '19.999%' },
    col_6: { w: '16.666%' },
    // Separadores
    divider: { h: react_native_1.StyleSheet.hairlineWidth * 2, bg: 'border', alignSelf: 'stretch' },
    divider_vertical: { w: react_native_1.StyleSheet.hairlineWidth * 2, bg: 'border', alignSelf: 'stretch' },
    // Avatares (círculo con iniciales o una imagen dentro)
    avatar: { w: 40, h: 40, rounded: 40, bg: 'primary.50', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', _text: { color: 'primary.100', fontWeight: '700' } },
    avatar_sm: { w: 28, h: 28, rounded: 40, bg: 'primary.50', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', _text: { color: 'primary.100', fontWeight: '700', fontSize: 12 } },
    avatar_lg: { w: 64, h: 64, rounded: 40, bg: 'primary.50', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', _text: { color: 'primary.100', fontWeight: '700', fontSize: 22 } },
};
/** Separación entre columnas (y entre filas) de cada rejilla, en px: las columnas llevan la mitad a cada lado */
exports.GRID_GUTTERS = { grid_sm: 4, grid: 8, grid_lg: 12, grid_xl: 16 };
const GridContext = (0, react_1.createContext)(exports.GRID_GUTTERS.grid);
const Box = (_a) => {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
    var { children } = _a, props = __rest(_a, ["children"]);
    const insets = (0, react_native_safe_area_context_1.useSafeAreaInsets)();
    // Defaults → theme.components.Box → variante → props → plataforma (safeArea también puede venir de una variante)
    const [_p, theme] = (0, useThemeProps_1.useThemeProps)('Box', props, { variants: BOX_VARIANTS }), { safeArea, safeAreaTop, safeAreaBottom, safeAreaLeft, safeAreaRight, variant } = _p, combinedProps = __rest(_p, ["safeArea", "safeAreaTop", "safeAreaBottom", "safeAreaLeft", "safeAreaRight", "variant"]);
    // Rejilla: la separación de la rejilla en la que está (para las col_N) y la suya (si es una grid_*)
    const parentGutter = (0, react_1.useContext)(GridContext);
    const names = typeof variant === 'string' ? variant.split(/\s+/) : [];
    const gridName = names.find(n => n in exports.GRID_GUTTERS);
    const gutter = gridName ? exports.GRID_GUTTERS[gridName] : undefined;
    const isCol = names.some(n => /^col_\d+$/.test(n));
    // Va antes que los estilos de las props: un mx / px propio sigue mandando
    const gridStyle = Object.assign(Object.assign({}, (gutter != null && { marginHorizontal: -gutter / 2, rowGap: gutter })), (isCol && { paddingHorizontal: parentGutter / 2 }));
    const styles = (0, DEFAULT_PROPS_1.DEFAULT_PROPS)(combinedProps, theme);
    const baseStyle = react_native_1.StyleSheet.flatten([
        gridStyle,
        combinedProps.style,
        ...styles
    ]);
    return (<react_native_1.View {...combinedProps} style={Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, baseStyle), ((safeArea || safeAreaTop) && { paddingTop: ((_d = (_c = (_b = baseStyle.paddingTop) !== null && _b !== void 0 ? _b : baseStyle.paddingVertical) !== null && _c !== void 0 ? _c : baseStyle.padding) !== null && _d !== void 0 ? _d : 0) + insets.top })), ((safeArea || safeAreaBottom) && { paddingBottom: ((_g = (_f = (_e = baseStyle.paddingBottom) !== null && _e !== void 0 ? _e : baseStyle.paddingVertical) !== null && _f !== void 0 ? _f : baseStyle.padding) !== null && _g !== void 0 ? _g : 0) + insets.bottom })), ((safeArea || safeAreaLeft) && { paddingLeft: ((_k = (_j = (_h = baseStyle.paddingLeft) !== null && _h !== void 0 ? _h : baseStyle.paddingHorizontal) !== null && _j !== void 0 ? _j : baseStyle.padding) !== null && _k !== void 0 ? _k : 0) + insets.left })), ((safeArea || safeAreaRight) && { paddingRight: ((_o = (_m = (_l = baseStyle.paddingRight) !== null && _l !== void 0 ? _l : baseStyle.paddingHorizontal) !== null && _m !== void 0 ? _m : baseStyle.padding) !== null && _o !== void 0 ? _o : 0) + insets.right }))}>
            {gutter != null
            ? <GridContext.Provider value={gutter}>{(0, helpers_1.renderChild)(children, combinedProps._text)}</GridContext.Provider>
            : (0, helpers_1.renderChild)(children, combinedProps._text)}
        </react_native_1.View>);
};
exports.Box = Box;
