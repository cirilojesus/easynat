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
exports.Collapse = void 0;
const react_1 = __importStar(require("react"));
const react_native_reanimated_1 = __importStar(require("react-native-reanimated"));
const Box_1 = require("./Box");
const Icon_1 = require("./Icon");
const useThemeProps_1 = require("./utils/useThemeProps");
/**
 * Icono que gira con `progress`. El giro va en un Animated.View (vista nativa): animar el Icon directamente
 * no se aplica bien (no es una vista nativa) y el giro llegaba tarde. Recibe el color y tamaño que le da el
 * Button (cloneElement de iconRight) y se los pasa al icono.
 */
const RotatingIcon = (_a) => {
    var { progress, icon } = _a, iconProps = __rest(_a, ["progress", "icon"]);
    const style = (0, react_native_reanimated_1.useAnimatedStyle)(() => ({ transform: [{ rotate: `${progress.value * 180}deg` }] }));
    return (<react_native_reanimated_1.default.View style={style}>
            {icon ? react_1.default.cloneElement(icon, Object.assign(Object.assign({}, iconProps), icon.props)) : <Icon_1.Icon as="Feather" name="chevron-down" {...iconProps}/>}
        </react_native_reanimated_1.default.View>);
};
const TRIGGER_DEFAULTS = {
    p: 2.5,
    borderWidth: 1,
    borderColor: 'light.100',
    rounded: 1,
    flexDir: 'row',
    justifyContent: 'space-between',
};
/* ---------------- INTERNAL COMPONENT ------------------- */
function InternalCollapse(rawProps, ref) {
    // Defaults → theme.components.Collapse → variante → props → plataforma (el variant no pasa al Box)
    const [_a] = (0, useThemeProps_1.useThemeProps)('Collapse', rawProps), { trigger, defaultOpen, isOpen: controlledOpen, onChange, onOpen, onClose, duration = 250, lazy, disabled, icon, variant: _variant, _trigger, _open, _contentStyle, children } = _a, props = __rest(_a, ["trigger", "defaultOpen", "isOpen", "onChange", "onOpen", "onClose", "duration", "lazy", "disabled", "icon", "variant", "_trigger", "_open", "_contentStyle", "children"]);
    // El estado vive en React (el trigger recibe isOpen al momento); la animación solo lo sigue
    const controlled = controlledOpen !== undefined;
    const [innerOpen, setInnerOpen] = (0, react_1.useState)(!!defaultOpen);
    const open = controlled ? !!controlledOpen : innerOpen;
    // lazy: el contenido se monta la primera vez que se abre y luego se queda montado
    const [mounted, setMounted] = (0, react_1.useState)(!lazy || open);
    // Un solo valor (0 cerrado → 1 abierto) para la altura y el giro del icono: van sincronizados
    const progress = (0, react_native_reanimated_1.useSharedValue)(open ? 1 : 0);
    const contentHeight = (0, react_native_reanimated_1.useSharedValue)(0);
    const callbacks = (0, react_1.useRef)({ onChange, onOpen, onClose });
    callbacks.current = { onChange, onOpen, onClose };
    const openRef = (0, react_1.useRef)(open);
    openRef.current = open;
    const first = (0, react_1.useRef)(true);
    (0, react_1.useEffect)(() => {
        if (open)
            setMounted(true);
        // La primera vez (defaultOpen o isOpen inicial) no se anima ni se avisa
        if (first.current) {
            first.current = false;
            return;
        }
        progress.value = (0, react_native_reanimated_1.withTiming)(open ? 1 : 0, { duration });
        // Se avisa al terminar, desde JS (sin pasar por el hilo de UI)
        const timer = setTimeout(() => { var _a; return (_a = (open ? callbacks.current.onOpen : callbacks.current.onClose)) === null || _a === void 0 ? void 0 : _a(); }, duration);
        return () => clearTimeout(timer);
    }, [open]);
    const setOpen = (next) => {
        var _a, _b;
        if (next === openRef.current)
            return;
        if (!controlled)
            setInnerOpen(next);
        (_b = (_a = callbacks.current).onChange) === null || _b === void 0 ? void 0 : _b.call(_a, next);
    };
    (0, react_1.useImperativeHandle)(ref, () => ({
        open: () => setOpen(true),
        close: () => setOpen(false),
        toggle: () => setOpen(!openRef.current),
        isOpen: () => openRef.current,
    }), [controlled]);
    const bodyStyle = (0, react_native_reanimated_1.useAnimatedStyle)(() => ({
        height: progress.value * contentHeight.value,
        overflow: 'hidden',
    }));
    const triggerProps = (0, useThemeProps_1.mergeProps)(TRIGGER_DEFAULTS, _trigger, open && _open);
    return (<Box_1.Box {...props}>
            {trigger(Object.assign(Object.assign({}, triggerProps), { isOpen: open, disabled, accessibilityRole: 'button', accessibilityState: { expanded: open, disabled: !!disabled }, iconRight: icon === false ? undefined : <RotatingIcon progress={progress} icon={icon || undefined}/>, onPress: () => !disabled && setOpen(!openRef.current) }))}

            {/* La altura se anima entre 0 y la del contenido, que se mide en posición absoluta */}
            {/* Animated.View (vista nativa) para que Reanimated anime la altura sin pasar por React */}
            <react_native_reanimated_1.default.View style={bodyStyle}>
                <Box_1.Box onLayout={e => (contentHeight.value = e.nativeEvent.layout.height)} position="absolute" w="100%" {..._contentStyle}>
                    {mounted ? children : null}
                </Box_1.Box>
            </react_native_reanimated_1.default.View>
        </Box_1.Box>);
}
/**
 * forwardRef pierde los tipos al compilar.
 * Aquí los restauramos para que funcione el autocompletado
 * en el proyecto donde usas la librería.
 */
exports.Collapse = (0, react_1.forwardRef)(InternalCollapse);
