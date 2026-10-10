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
exports.Text = exports.InsideTextContext = void 0;
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const DEFAULT_PROPS_1 = require("./utils/DEFAULT_PROPS");
const useThemeProps_1 = require("./utils/useThemeProps");
// Variantes propias (theme.components.Text.variants puede ampliarlas o modificarlas)
// Se combinan con espacios: variant="small muted"
const TEXT_VARIANTS = {
    h1: { fontSize: 30, lineHeight: 38, fontWeight: "700" },
    h2: { fontSize: 26, lineHeight: 33, fontWeight: "700" },
    h3: { fontSize: 22, lineHeight: 29, fontWeight: "600" },
    h4: { fontSize: 20, lineHeight: 26, fontWeight: "600" },
    h5: { fontSize: 18, lineHeight: 24, fontWeight: "600" },
    h6: { fontSize: 16, lineHeight: 22, fontWeight: "600" },
    title: { fontSize: 18, lineHeight: 24, fontWeight: "700" },
    subtitle: { fontSize: 15, lineHeight: 21, fontWeight: "500", color: 'gray' },
    body: { fontSize: 14, lineHeight: 20 },
    small: { fontSize: 12 },
    caption: { fontSize: 12, lineHeight: 16, color: 'silver' },
    label: { fontSize: 13, fontWeight: "600" },
    /** Texto pequeño en mayúsculas (encabezados de sección) */
    overline: { fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: 'uppercase', color: 'silver' },
    muted: { color: 'silver' },
    bold: { fontWeight: "700" },
    link: { color: 'primary.100', textDecorationLine: 'underline' },
    error: { fontSize: 12, color: 'danger.100' },
    code: { fontFamily: react_native_1.Platform.select({ ios: 'Menlo', default: 'monospace' }), fontSize: 13, bg: 'light.50', px: 1, alignSelf: 'flex-start' },
};
/** true dentro de un Text: un texto suelto se puede pintar tal cual (hereda los estilos del Text de fuera) */
exports.InsideTextContext = react_1.default.createContext(false);
const Text = (_a) => {
    var _b, _c, _d;
    var { children } = _a, props = __rest(_a, ["children"]);
    // Defaults → theme.components.Text → variante → props → plataforma
    const [combinedProps, theme] = (0, useThemeProps_1.useThemeProps)('Text', props, { variants: TEXT_VARIANTS });
    const insideText = react_1.default.useContext(exports.InsideTextContext);
    const styles = (0, DEFAULT_PROPS_1.DEFAULT_PROPS)(combinedProps, theme);
    // Sin color: el del tema ('text', cambia con el modo). Un Text dentro de otro hereda el del de fuera
    const color = (_b = combinedProps.color) !== null && _b !== void 0 ? _b : (insideText ? undefined : 'text');
    const textStyle = react_native_1.StyleSheet.flatten([
        combinedProps.style,
        ...styles,
        color !== undefined && { color: ((_c = theme.colors) === null || _c === void 0 ? void 0 : _c[color]) || color },
    ]);
    return (<react_native_1.Text {...combinedProps} style={[
            theme.fontFamily && { fontFamily: ((_d = theme === null || theme === void 0 ? void 0 : theme.fonts) === null || _d === void 0 ? void 0 : _d[theme.fontFamily + '_' + ((textStyle === null || textStyle === void 0 ? void 0 : textStyle.fontWeight) || '400')]) || theme.fontFamily + '_' + ((textStyle === null || textStyle === void 0 ? void 0 : textStyle.fontWeight) || '400') },
            textStyle,
            theme.fontFamily && { fontWeight: undefined }
        ]}>
            <exports.InsideTextContext.Provider value={true}>{children}</exports.InsideTextContext.Provider>
        </react_native_1.Text>);
};
exports.Text = Text;
