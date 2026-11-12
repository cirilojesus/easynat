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
exports.Image = void 0;
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const DEFAULT_PROPS_1 = require("./utils/DEFAULT_PROPS");
const Box_1 = require("./Box");
const useThemeProps_1 = require("./utils/useThemeProps");
// Proporción (ancho / alto) real de una imagen: la de un require() al momento y la de una uri al cargarla
const useAspectRatio = (source, enabled) => {
    var _a, _b;
    const uri = enabled && source && typeof source === 'object' && !Array.isArray(source) ? source.uri : undefined;
    const local = enabled && typeof source === 'number' ? (_b = (_a = react_native_1.Image).resolveAssetSource) === null || _b === void 0 ? void 0 : _b.call(_a, source) : null;
    const [ratios, setRatios] = react_1.default.useState({});
    react_1.default.useEffect(() => {
        if (!uri || ratios[uri] || !react_native_1.Image.getSize)
            return;
        let alive = true;
        react_native_1.Image.getSize(uri, (w, h) => { if (alive && w > 0 && h > 0)
            setRatios(r => (Object.assign(Object.assign({}, r), { [uri]: w / h }))); }, () => { });
        return () => { alive = false; };
    }, [uri]);
    if ((local === null || local === void 0 ? void 0 : local.width) && (local === null || local === void 0 ? void 0 : local.height))
        return local.width / local.height;
    return uri ? ratios[uri] : undefined;
};
const Image = (props) => {
    const [error, setError] = react_1.default.useState('');
    // Defaults → theme.components.Image → variante → props → plataforma
    const [_a, theme] = (0, useThemeProps_1.useThemeProps)('Image', props), { style, fallback, variant: _variant } = _a, combinedProps = __rest(_a, ["style", "fallback", "variant"]);
    const styles = (0, DEFAULT_PROPS_1.DEFAULT_PROPS)(combinedProps, theme);
    const own = react_native_1.StyleSheet.flatten([style, ...styles]);
    const { size } = combinedProps;
    // Sin size: todo el ancho y, si tampoco hay alto ni proporción, la proporción real de la imagen (sin ella,
    // una imagen remota con width 100% saldría con alto 0)
    const auto = !size && own.height == null && own.aspectRatio == null && own.flex == null;
    const ratio = useAspectRatio(combinedProps.source, auto);
    const baseStyle = react_native_1.StyleSheet.flatten([
        size
            ? { width: size, height: size }
            : Object.assign({ width: '100%' }, (auto && ratio ? { aspectRatio: ratio } : null)),
        own,
    ]);
    if (error == 'fallback') {
        return (<react_native_1.Image {...combinedProps} source={fallback} style={baseStyle} onError={() => setError('alt')}/>);
    }
    if (error == 'alt') {
        return (<Box_1.Box style={baseStyle} {...combinedProps === null || combinedProps === void 0 ? void 0 : combinedProps._alt}>
                {combinedProps.alt}
            </Box_1.Box>);
    }
    return (<react_native_1.Image {...combinedProps} style={baseStyle} onError={() => setError(fallback ? 'fallback' : 'alt')}/>);
};
exports.Image = Image;
