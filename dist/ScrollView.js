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
exports.ScrollView = void 0;
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const theme_provider_1 = require("./theme-provider");
const DEFAULT_PROPS_1 = require("./utils/DEFAULT_PROPS");
const helpers_1 = require("./utils/helpers");
const ScrollView = (_a) => {
    var { style, children } = _a, props = __rest(_a, ["style", "children"]);
    const { theme } = (0, theme_provider_1.useTheme)();
    const combinedProps = Object.assign(Object.assign(Object.assign(Object.assign({}, props), (react_native_1.Platform.OS === "ios" ? props._ios : {})), (react_native_1.Platform.OS === "android" ? props._android : {})), (react_native_1.Platform.OS === "web" ? props._web : {}));
    const styles = (0, DEFAULT_PROPS_1.DEFAULT_PROPS)(combinedProps, theme);
    const contentStyles = (0, DEFAULT_PROPS_1.DEFAULT_PROPS)((combinedProps === null || combinedProps === void 0 ? void 0 : combinedProps._contentContainerStyle) || {}, theme);
    const scrollStyle = react_native_1.StyleSheet.flatten([
        style,
        ...styles,
    ]);
    const scrollContentStyle = react_native_1.StyleSheet.flatten([
        ...contentStyles,
        combinedProps.contentContainerStyle
    ]);
    return (<react_native_1.ScrollView {...props} style={scrollStyle} contentContainerStyle={scrollContentStyle}>
            {(0, helpers_1.renderChild)(children, props._text)}
        </react_native_1.ScrollView>);
};
exports.ScrollView = ScrollView;
//# sourceMappingURL=ScrollView.js.map