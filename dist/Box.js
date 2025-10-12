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
exports.Box = void 0;
const react_native_1 = require("react-native");
const theme_provider_1 = require("./theme-provider");
const DEFAULT_PROPS_1 = require("./utils/DEFAULT_PROPS");
const react_native_safe_area_context_1 = require("react-native-safe-area-context");
const helpers_1 = require("./utils/helpers");
const Box = (_a) => {
    var _b, _c, _d, _e, _f, _g;
    var { children, safeArea, safeAreaTop, safeAreaBottom, safeAreaLeft, safeAreaRight } = _a, props = __rest(_a, ["children", "safeArea", "safeAreaTop", "safeAreaBottom", "safeAreaLeft", "safeAreaRight"]);
    const { theme } = (0, theme_provider_1.useTheme)();
    const insets = (0, react_native_safe_area_context_1.useSafeAreaInsets)();
    const styles_default = ((_b = theme === null || theme === void 0 ? void 0 : theme.components) === null || _b === void 0 ? void 0 : _b.Box) || {};
    const variantStyle = Object.assign({ badge: { rounded: 40, _text: { fontSize: 12 }, px: 2, py: 1, bg: 'light', flexDir: 'row', alignItems: 'center', gap: 4 } }, (_d = (_c = theme === null || theme === void 0 ? void 0 : theme.components) === null || _c === void 0 ? void 0 : _c.Box) === null || _d === void 0 ? void 0 : _d.variants);
    const combinedProps = Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, styles_default), props), (react_native_1.Platform.OS === "ios" ? props._ios : {})), (react_native_1.Platform.OS === "android" ? props._android : {})), (react_native_1.Platform.OS === "web" ? props._web : {}));
    const styles = (0, DEFAULT_PROPS_1.DEFAULT_PROPS)(Object.assign(Object.assign({}, variantStyle[combinedProps.variant]), combinedProps), theme);
    const baseStyle = react_native_1.StyleSheet.flatten([
        combinedProps.style,
        ...styles
    ]);
    return (<react_native_1.View {...combinedProps} style={Object.assign(Object.assign({}, baseStyle), { paddingTop: (baseStyle.padding || baseStyle.paddingVertical || baseStyle.paddingTop || 0) + ((safeArea || safeAreaTop) ? insets.top : 0), paddingBottom: (baseStyle.padding || baseStyle.paddingVertical || baseStyle.paddingBottom || 0) + ((safeArea || safeAreaBottom) ? insets.bottom : 0), paddingLeft: (baseStyle.padding || baseStyle.paddingHorizontal || baseStyle.paddingLeft || 0) + ((safeArea || safeAreaLeft) ? insets.left : 0), paddingRight: (baseStyle.padding || baseStyle.paddingHorizontal || baseStyle.paddingRight || 0) + ((safeArea || safeAreaRight) ? insets.right : 0) })}>
            {(0, helpers_1.renderChild)(children, Object.assign(Object.assign({}, (_g = (_f = (_e = theme === null || theme === void 0 ? void 0 : theme.components) === null || _e === void 0 ? void 0 : _e.Box) === null || _f === void 0 ? void 0 : _f.variants[props.variant]) === null || _g === void 0 ? void 0 : _g._text), combinedProps._text))}
        </react_native_1.View>);
};
exports.Box = Box;
//# sourceMappingURL=Box.js.map