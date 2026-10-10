"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeyboardAvoidingView = void 0;
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const DEFAULT_PROPS_1 = require("./utils/DEFAULT_PROPS");
const useThemeProps_1 = require("./utils/useThemeProps");
const KeyboardAvoidingView = (props) => {
    // Defaults → theme.components.KeyboardAvoidingView → variante → props → plataforma
    const [combinedProps, theme] = (0, useThemeProps_1.useThemeProps)('KeyboardAvoidingView', props);
    const styles = (0, DEFAULT_PROPS_1.DEFAULT_PROPS)(combinedProps, theme);
    const baseStyles = react_native_1.StyleSheet.flatten([
        combinedProps.style,
        ...styles,
    ]);
    return (<react_native_1.KeyboardAvoidingView {...combinedProps} style={baseStyles}>
            {combinedProps.children}
        </react_native_1.KeyboardAvoidingView>);
};
exports.KeyboardAvoidingView = KeyboardAvoidingView;
