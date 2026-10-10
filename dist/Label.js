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
exports.Label = void 0;
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const Text_1 = require("./Text");
const useThemeProps_1 = require("./utils/useThemeProps");
// Cuánto se mete el label flotante en el campo de debajo (su marginBottom negativo)
const OVERLAP = 10;
const AnimatedText = react_native_1.Animated.createAnimatedComponent(Text_1.Text);
exports.Label = (0, react_1.forwardRef)((rawProps, ref) => {
    var _a, _b;
    // Defaults → theme.components.Label → variante → props → plataforma
    // (variant es del Label: no se pasa al Text interno)
    const [_c, theme] = (0, useThemeProps_1.useThemeProps)('Label', rawProps), { isFloat, isRequired, fieldHeight, variant: _variant } = _c, props = __rest(_c, ["isFloat", "isRequired", "fieldHeight", "variant"]);
    const animation = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    // En reposo (dentro del campo) se centra en él: depende del alto del campo y del propio label
    // (un desplazamiento fijo solo cuadraba con unas medidas concretas)
    const [height, setHeight] = (0, react_1.useState)(0);
    // Arriba (sobre el borde) lleva fondo para tapar la línea; abajo (dentro del campo) es transparente
    const [raised, setRaised] = (0, react_1.useState)(false);
    const restY = fieldHeight && height ? fieldHeight / 2 + height / 2 - OVERLAP : 20;
    (0, react_1.useImperativeHandle)(ref, () => ({
        animate: (value) => {
            setRaised(value);
            react_native_1.Animated.timing(animation, {
                toValue: value ? 1 : 0,
                duration: 100,
                useNativeDriver: true,
            }).start();
        }
    }), []);
    return (<AnimatedText pointerEvents="none" style={[
            isFloat
                ? {
                    padding: 3,
                    marginLeft: 10,
                    // Tapa el borde del campo: del color del fondo (con _label={{ style: { backgroundColor } }} se cambia)
                    backgroundColor: raised ? (_b = (_a = theme.colors) === null || _a === void 0 ? void 0 : _a.background) !== null && _b !== void 0 ? _b : '#fff' : 'transparent',
                    zIndex: 1000,
                    marginRight: 'auto',
                    marginBottom: -OVERLAP,
                    transform: [
                        {
                            translateY: animation.interpolate({
                                inputRange: [0, 1],
                                outputRange: [restY, 1],
                            })
                        }
                    ]
                }
                : { marginBottom: 4 },
        ]} {...props} onLayout={e => {
            var _a;
            const h = e.nativeEvent.layout.height;
            if (Math.round(h) !== Math.round(height))
                setHeight(h);
            (_a = props.onLayout) === null || _a === void 0 ? void 0 : _a.call(props, e);
        }}>
                {props.children}
                {isRequired && <Text_1.Text color={'danger.100'}> *</Text_1.Text>}
            </AnimatedText>);
});
