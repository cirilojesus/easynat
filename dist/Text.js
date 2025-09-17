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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Text = void 0;
const react_native_1 = require("react-native");
const theme_provider_1 = require("./theme-provider");
const DEFAULT_PROPS_1 = require("./utils/DEFAULT_PROPS");
const Text = (_a) => {
    var _b, _c;
    var { style, children } = _a, props = __rest(_a, ["style", "children"]);
    const { theme } = (0, theme_provider_1.useTheme)();
    const variantStyle = Object.assign({ h1: { fontSize: 26, fontWeight: "500" }, h2: { fontSize: 24, fontWeight: "500" }, h3: { fontSize: 22, fontWeight: "500" }, h4: { fontSize: 20, fontWeight: "500" }, h5: { fontSize: 18, fontWeight: "500" }, h6: { fontSize: 16, fontWeight: "500" }, small: { fontSize: 12 } }, (_c = (_b = theme === null || theme === void 0 ? void 0 : theme.components) === null || _b === void 0 ? void 0 : _b.Text) === null || _c === void 0 ? void 0 : _c.variants);
    const combinedProps = Object.assign(Object.assign(Object.assign(Object.assign({}, props), (react_native_1.Platform.OS === "ios" ? props._ios : {})), (react_native_1.Platform.OS === "android" ? props._android : {})), (react_native_1.Platform.OS === "web" ? props._web : {}));
    const styles = (0, DEFAULT_PROPS_1.DEFAULT_PROPS)(combinedProps, theme);
    const textStyle = react_native_1.StyleSheet.flatten([
        ...styles,
        { color: theme.colors[combinedProps.color] || combinedProps.color },
        Object.assign({}, variantStyle[combinedProps.variant]),
        style,
    ]);
    return (<react_native_1.Text style={textStyle} {...props}>
            {children}
        </react_native_1.Text>);
};
exports.Text = Text;
