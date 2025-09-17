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
    var { style, children, safeArea, safeAreaTop, safeAreaBottom, safeAreaLeft, safeAreaRight } = _a, props = __rest(_a, ["style", "children", "safeArea", "safeAreaTop", "safeAreaBottom", "safeAreaLeft", "safeAreaRight"]);
    const { theme } = (0, theme_provider_1.useTheme)();
    const insets = (0, react_native_safe_area_context_1.useSafeAreaInsets)();
    const combinedProps = Object.assign(Object.assign(Object.assign(Object.assign({}, props), (react_native_1.Platform.OS === "ios" ? props._ios : {})), (react_native_1.Platform.OS === "android" ? props._android : {})), (react_native_1.Platform.OS === "web" ? props._web : {}));
    const styles = (0, DEFAULT_PROPS_1.DEFAULT_PROPS)(combinedProps, theme);
    const boxStyle = react_native_1.StyleSheet.flatten([
        style,
        ...styles
    ]);
    return (<react_native_1.View style={boxStyle} {...props}>
            <react_native_1.View style={{
            paddingTop: (safeArea || safeAreaTop) && insets.top,
            paddingBottom: (safeArea || safeAreaBottom) && insets.bottom,
            paddingLeft: (safeArea || safeAreaLeft) && insets.left,
            paddingRight: (safeArea || safeAreaRight) && insets.right,
            flex: 1
        }}>
                {(0, helpers_1.renderChild)(children, combinedProps._text)}
            </react_native_1.View>
        </react_native_1.View>);
};
exports.Box = Box;
