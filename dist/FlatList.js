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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.FlatList = void 0;
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const theme_provider_1 = require("./theme-provider");
const DEFAULT_PROPS_1 = require("./utils/DEFAULT_PROPS");
/** Implementación interna */
const FlatListBase = (0, react_1.forwardRef)((_a, ref) => {
    var _b, _c, _d, _e;
    var { style } = _a, props = __rest(_a, ["style"]);
    const { theme } = (0, theme_provider_1.useTheme)();
    const props_default = ((_b = theme === null || theme === void 0 ? void 0 : theme.components) === null || _b === void 0 ? void 0 : _b.FlatList) || {};
    const props_variant = ((_d = (_c = theme === null || theme === void 0 ? void 0 : theme.components) === null || _c === void 0 ? void 0 : _c.FlatList) === null || _d === void 0 ? void 0 : _d.variants) || {};
    const combinedProps = Object.assign(Object.assign(Object.assign(Object.assign({}, props), (react_native_1.Platform.OS === "ios" ? props._ios : {})), (react_native_1.Platform.OS === "android" ? props._android : {})), (react_native_1.Platform.OS === "web" ? props._web : {}));
    const styles = (0, DEFAULT_PROPS_1.DEFAULT_PROPS)(Object.assign(Object.assign(Object.assign({}, props_default), props_variant[props_default.variant || combinedProps.variant]), combinedProps), theme);
    const baseStyle = react_native_1.StyleSheet.flatten([style, ...styles]);
    const contentStyles = (0, DEFAULT_PROPS_1.DEFAULT_PROPS)(Object.assign(Object.assign(Object.assign({}, props_default === null || props_default === void 0 ? void 0 : props_default._contentContainerStyle), (_e = props_variant[props_default.variant || combinedProps.variant]) === null || _e === void 0 ? void 0 : _e._contentContainerStyle), combinedProps === null || combinedProps === void 0 ? void 0 : combinedProps._contentContainerStyle), theme);
    return (<react_native_1.FlatList ref={ref} {...combinedProps} style={baseStyle} contentContainerStyle={[
            combinedProps.contentContainerStyle,
            ...contentStyles,
        ]}/>);
});
/** ✅ EXPORT FINAL (CLAVE para que el .d.ts NO colapse a any) */
exports.FlatList = FlatListBase;
