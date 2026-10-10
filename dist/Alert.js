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
exports.hideAlert = exports.showAlert = void 0;
const react_native_1 = require("react-native");
const react_native_root_siblings_1 = __importDefault(require("react-native-root-siblings"));
const Box_1 = require("./Box");
const useThemeProps_1 = require("./utils/useThemeProps");
// Contenido del aviso: lee theme.components.Alert (defaults y variantes, p. ej. variants.danger)
const AlertContent = (_a) => {
    var { message } = _a, props = __rest(_a, ["message"]);
    const [_b] = (0, useThemeProps_1.useThemeProps)('Alert', props, { defaults: { p: 3, _text: { color: 'white' } } }), { colorScheme, variant } = _b, rest = __rest(_b, ["colorScheme", "variant"]);
    return <Box_1.Box safeAreaTop bg={colorScheme + '.100'} {...rest}>{message}</Box_1.Box>;
};
let currentAlert = null;
let timer = null;
const AnimatedPressable = react_native_1.Animated.createAnimatedComponent(react_native_1.Pressable);
let animate = (value, callBack) => null;
/**
 * Muestra un aviso arriba de la pantalla desde cualquier parte (también fuera de los componentes). Baja animado y se
 * cierra solo a los `duration` ms o al tocarlo. Si ya hay uno, lo sustituye
 * @example showAlert('Guardado', 'success');
 * showAlert('Sin conexión', 'danger', { _text: { fontWeight: '700' } }, 5000);
 */
const showAlert = (message, colorScheme, props, duration = 3000) => {
    if (currentAlert)
        animate(0);
    let opacity = new react_native_1.Animated.Value(0);
    animate = (value, callBack) => {
        react_native_1.Animated.timing(opacity, {
            toValue: value,
            duration: 200,
            useNativeDriver: true,
        }).start(({ finished }) => {
            if (finished)
                callBack === null || callBack === void 0 ? void 0 : callBack();
        });
    };
    setTimeout(() => {
        if (currentAlert) {
            currentAlert.destroy();
            currentAlert = null;
            clearTimeout(timer);
        }
        currentAlert = new react_native_root_siblings_1.default(<AnimatedPressable style={[
                {
                    transform: [
                        {
                            translateY: opacity.interpolate({
                                inputRange: [0, 1],
                                outputRange: [-100, 0],
                            })
                        }
                    ],
                    width: '100%',
                    top: 0,
                    position: "absolute",
                    alignSelf: "center",
                    zIndex: 10000,
                },
                { opacity },
            ]} onPress={exports.hideAlert}>
                <AlertContent message={message} colorScheme={colorScheme} variant={colorScheme} {...props}/>
            </AnimatedPressable>);
        animate(1);
        timer = setTimeout(exports.hideAlert, duration);
    }, 50);
};
exports.showAlert = showAlert;
/** Cierra el aviso que se esté mostrando (con su animación) */
const hideAlert = () => {
    if (currentAlert) {
        animate(0, () => {
            currentAlert.destroy();
            currentAlert = null;
            clearTimeout(timer);
        });
    }
};
exports.hideAlert = hideAlert;
