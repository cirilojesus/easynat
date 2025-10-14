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
exports.Pressable = void 0;
const react_native_1 = require("react-native");
const theme_provider_1 = require("./theme-provider");
const DEFAULT_PROPS_1 = require("./utils/DEFAULT_PROPS");
const helpers_1 = require("./utils/helpers");
const Pressable = (_a) => {
    var props = __rest(_a, []);
    const { theme } = (0, theme_provider_1.useTheme)();
    const combinedProps = Object.assign(Object.assign(Object.assign(Object.assign({}, props), (react_native_1.Platform.OS === "ios" ? props._ios : {})), (react_native_1.Platform.OS === "android" ? props._android : {})), (react_native_1.Platform.OS === "web" ? props._web : {}));
    const styles = (0, DEFAULT_PROPS_1.DEFAULT_PROPS)(combinedProps, theme);
    const pressedStyles = (0, DEFAULT_PROPS_1.DEFAULT_PROPS)((combinedProps === null || combinedProps === void 0 ? void 0 : combinedProps._pressed) || {}, theme);
    const baseStyle = react_native_1.StyleSheet.flatten([
        combinedProps.style,
        combinedProps.disabled && { opacity: .5 },
        ...styles,
    ]);
    return (<react_native_1.Pressable {...combinedProps} style={({ pressed }) => [
            baseStyle,
            pressed && pressedStyles,
        ]}>
            {({ pressed }) => {
            var _a;
            return typeof combinedProps.children == 'function' ?
                combinedProps.children((Object.assign(Object.assign({}, combinedProps), { pressed })))
                :
                    (0, helpers_1.renderChild)(combinedProps.children, pressed
                        ? Object.assign(Object.assign({}, combinedProps._text), (_a = combinedProps._pressed) === null || _a === void 0 ? void 0 : _a._text) : combinedProps._text);
        }}
        </react_native_1.Pressable>);
};
exports.Pressable = Pressable;
