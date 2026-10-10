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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const DEFAULT_PROPS_1 = require("./utils/DEFAULT_PROPS");
const useThemeProps_1 = require("./utils/useThemeProps");
/** Implementación interna */
const FlatListBase = (0, react_1.forwardRef)((props, ref) => {
    var _a;
    // Defaults → theme.components.FlatList → variante → props → plataforma (también props no visuales)
    const [_b, theme] = (0, useThemeProps_1.useThemeProps)('FlatList', props), { style, variant: _variant } = _b, combinedProps = __rest(_b, ["style", "variant"]);
    const styles = (0, DEFAULT_PROPS_1.DEFAULT_PROPS)(combinedProps, theme);
    const baseStyle = react_native_1.StyleSheet.flatten([style, ...styles]);
    const contentStyles = (0, DEFAULT_PROPS_1.DEFAULT_PROPS)((_a = combinedProps._contentContainerStyle) !== null && _a !== void 0 ? _a : {}, theme);
    return (<react_native_1.FlatList ref={ref} {...combinedProps} style={baseStyle} contentContainerStyle={[
            combinedProps.contentContainerStyle,
            ...contentStyles,
        ]}/>);
});
/** ✅ EXPORT FINAL (CLAVE para que el .d.ts NO colapse a any) */
exports.FlatList = FlatListBase;
