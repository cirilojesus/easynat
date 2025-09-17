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
exports.InputText = void 0;
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const theme_provider_1 = require("./theme-provider");
const DEFAULT_PROPS_1 = require("./utils/DEFAULT_PROPS");
const InputText = (_a) => {
    var _b;
    var { style } = _a, props = __rest(_a, ["style"]);
    const { theme } = (0, theme_provider_1.useTheme)();
    const styles_default = ((_b = theme === null || theme === void 0 ? void 0 : theme.components) === null || _b === void 0 ? void 0 : _b.InputText) || {};
    const combinedProps = Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, props), (react_native_1.Platform.OS === "ios" ? Object.assign(Object.assign({}, props === null || props === void 0 ? void 0 : props._ios), styles_default === null || styles_default === void 0 ? void 0 : styles_default._ios) : {})), (react_native_1.Platform.OS === "android" ? Object.assign(Object.assign({}, props === null || props === void 0 ? void 0 : props._android), styles_default === null || styles_default === void 0 ? void 0 : styles_default._android) : {})), (react_native_1.Platform.OS === "web" ? Object.assign(Object.assign({}, props === null || props === void 0 ? void 0 : props._web), styles_default === null || styles_default === void 0 ? void 0 : styles_default._web) : {})), styles_default);
    const styles = (0, DEFAULT_PROPS_1.DEFAULT_PROPS)(combinedProps, theme);
    const inputStyle = react_native_1.StyleSheet.flatten([
        ...styles,
        {
            borderWidth: 1,
            borderColor: theme.colors['light'],
            borderRadius: 4,
            padding: 10,
        },
        style
    ]);
    return (<react_native_1.TextInput style={inputStyle} {...props}/>);
};
exports.InputText = InputText;
