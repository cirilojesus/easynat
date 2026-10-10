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
exports.Switch = void 0;
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const DEFAULT_PROPS_1 = require("./utils/DEFAULT_PROPS");
const Button_1 = require("./Button");
const useThemeProps_1 = require("./utils/useThemeProps");
const Switch = (props) => {
    // Defaults → theme.components.Switch → variante → props → plataforma
    const [combinedProps, theme] = (0, useThemeProps_1.useThemeProps)('Switch', props);
    const styles = (0, DEFAULT_PROPS_1.DEFAULT_PROPS)(combinedProps, theme);
    const { colorScheme = "primary", _containerStyle, pointerBox, label, scale = 1, variant: _variant } = combinedProps, rest = __rest(combinedProps, ["colorScheme", "_containerStyle", "pointerBox", "label", "scale", "variant"]);
    // transform: scale no ocupa espacio: se compensa con margen. Cada lado crece la MITAD del aumento del
    // tamaño real del switch (se mide; antes era un ancho fijo y todo el aumento a cada lado, el doble)
    const [size, setSize] = react_1.default.useState({ w: 51, h: 31 });
    const extraX = (scale - 1) * size.w / 2;
    const extraY = (scale - 1) * size.h / 2;
    return (<Button_1.Button variant="unstyle" minH={size.h * scale} p={0} onPress={() => { var _a; return !combinedProps.disabled && ((_a = combinedProps.onValueChange) === null || _a === void 0 ? void 0 : _a.call(combinedProps, !combinedProps.value)); }} _pressed={{ _text: { color: theme.colors[colorScheme + '.100'] } }} justifyContent={'flex-start'} pointerEvents={pointerBox ? 'auto' : 'box-none'} {..._containerStyle}>
            <react_native_1.Switch 
    // Bolita blanca sobre el carril: con los dos en light.100, apagado la bolita no se veía
    trackColor={{
            false: theme.colors['muted.100'],
            true: theme.colors[colorScheme + '.100'],
        }} thumbColor={theme.colors['white']} ios_backgroundColor={theme.colors['muted.100']} {...rest} onLayout={e => {
            var _a;
            const { width, height } = e.nativeEvent.layout;
            if (Math.round(width) !== Math.round(size.w) || Math.round(height) !== Math.round(size.h))
                setSize({ w: width, h: height });
            (_a = rest.onLayout) === null || _a === void 0 ? void 0 : _a.call(rest, e);
        }} style={[
            {
                marginHorizontal: extraX,
                marginVertical: extraY,
                transform: [{ scale }]
            },
            rest.style,
            ...styles
        ]}/>
            {label}
        </Button_1.Button>);
};
exports.Switch = Switch;
