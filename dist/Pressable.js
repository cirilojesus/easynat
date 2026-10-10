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
exports.Pressable = void 0;
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const DEFAULT_PROPS_1 = require("./utils/DEFAULT_PROPS");
const helpers_1 = require("./utils/helpers");
const useThemeProps_1 = require("./utils/useThemeProps");
const Pressable = (_a) => {
    var _b;
    var props = __rest(_a, []);
    // Defaults → theme.components.Pressable → variante → props → plataforma
    const [combinedProps, theme] = (0, useThemeProps_1.useThemeProps)('Pressable', props);
    const styles = (0, DEFAULT_PROPS_1.DEFAULT_PROPS)(combinedProps, theme);
    const pressedStyles = (0, DEFAULT_PROPS_1.DEFAULT_PROPS)((_b = combinedProps._pressed) !== null && _b !== void 0 ? _b : {}, theme);
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
