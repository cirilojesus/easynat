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
const theme_provider_1 = require("./theme-provider");
const DEFAULT_PROPS_1 = require("./utils/DEFAULT_PROPS");
const Box_1 = require("./Box");
const Image = (_a) => {
    var { style, fallback } = _a, props = __rest(_a, ["style", "fallback"]);
    const { theme } = (0, theme_provider_1.useTheme)();
    const [error, setError] = react_1.default.useState('');
    // Overrides por plataforma
    const combinedProps = Object.assign(Object.assign(Object.assign(Object.assign({}, props), (react_native_1.Platform.OS === "ios" ? props._ios : {})), (react_native_1.Platform.OS === "android" ? props._android : {})), (react_native_1.Platform.OS === "web" ? props._web : {}));
    const styles = (0, DEFAULT_PROPS_1.DEFAULT_PROPS)(combinedProps, theme);
    const baseStyle = react_native_1.StyleSheet.flatten([style, ...styles]);
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
//# sourceMappingURL=Image.js.map