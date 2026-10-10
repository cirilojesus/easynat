"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusBar = void 0;
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const useThemeProps_1 = require("./utils/useThemeProps");
const StatusBar = (props) => {
    // Defaults → theme.components.StatusBar → variante → props → plataforma
    const [combinedProps, theme] = (0, useThemeProps_1.useThemeProps)('StatusBar', props);
    return (<react_native_1.StatusBar backgroundColor={theme.colors[combinedProps.bg] || combinedProps.bg || 'transparent'} translucent {...combinedProps}/>);
};
exports.StatusBar = StatusBar;
