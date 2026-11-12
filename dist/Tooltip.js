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
exports.Tooltip = void 0;
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const react_native_safe_area_context_1 = require("react-native-safe-area-context");
const DEFAULT_PROPS_1 = require("./utils/DEFAULT_PROPS");
const useThemeProps_1 = require("./utils/useThemeProps");
const touches_1 = require("./utils/touches");
const translate_1 = require("./utils/translate");
const Portal_1 = require("./Portal");
const Pressable_1 = require("./Pressable");
const Text_1 = require("./Text");
// Separación con el trigger, margen con los bordes de la pantalla y tamaño de la flecha
const GAP = 6;
const EDGE = 8;
const ARROW = 6;
const TOOLTIP_DEFAULTS = {
    // Invertido respecto a la pantalla: oscuro en modo claro y claro en modo oscuro
    bg: 'text',
    px: 2.5,
    py: 1.5,
    rounded: 1.5,
    maxW: 260,
    shadow: 2,
    placement: 'top',
    openOn: 'press',
    duration: 3000,
    hasArrow: true,
};
function Bubble({ trigger, placement, hasArrow, relative, style, animation, onReady, children }) {
    var _a;
    const window = (0, react_native_1.useWindowDimensions)();
    const insets = (0, react_native_safe_area_context_1.useSafeAreaInsets)();
    // Tamaño de la burbuja + flecha (su ancho natural, como mucho maxWidth)
    const [size, setSize] = (0, react_1.useState)({ w: 0, h: 0 });
    const sized = size.w > 0;
    const needed = size.h + GAP;
    const spaceAbove = trigger.y - insets.top - EDGE;
    const spaceBelow = window.height - insets.bottom - EDGE - (trigger.y + trigger.height);
    const side = placement === 'top'
        ? (spaceAbove < needed && spaceBelow > spaceAbove ? 'bottom' : 'top')
        : (spaceBelow < needed && spaceAbove > spaceBelow ? 'top' : 'bottom');
    // Centrada en el trigger, sin salirse de la pantalla (x en la pantalla)
    const center = trigger.x + trigger.width / 2;
    const left = Math.min(Math.max(center - size.w / 2, EDGE), Math.max(window.width - size.w - EDGE, EDGE));
    // Una franja del ancho de la pantalla, encima o debajo del trigger; la burbuja va dentro con marginLeft.
    // En el Portal en coordenadas de la pantalla; en 'absolute', relativas al trigger
    const strip = relative
        ? side === 'top'
            ? { left: -trigger.x, width: window.width, bottom: trigger.height + GAP }
            : { left: -trigger.x, width: window.width, top: trigger.height + GAP }
        : side === 'top'
            ? { left: 0, width: window.width, bottom: window.height - trigger.y + GAP }
            : { left: 0, width: window.width, top: trigger.y + trigger.height + GAP };
    // La flecha apunta al centro del trigger aunque la burbuja se haya desplazado para caber (sin pasar de las esquinas)
    const radius = Number(style.borderRadius) || 0;
    const minArrow = Math.max(radius, 4);
    const arrowLeft = Math.min(Math.max(center - left - ARROW, minArrow), Math.max(size.w - ARROW * 2 - minArrow, minArrow));
    const bg = (_a = style.backgroundColor) !== null && _a !== void 0 ? _a : '#000';
    const maxWidth = Math.min(Number(style.maxWidth) || Infinity, window.width - EDGE * 2);
    (0, react_1.useEffect)(() => { if (sized)
        onReady(); }, [sized]);
    // La flecha va fuera de la burbuja (hermana suya, encima o debajo), así no depende de su padding
    const arrow = hasArrow && (<react_native_1.View style={Object.assign({ marginLeft: arrowLeft, width: 0, height: 0, borderLeftWidth: ARROW, borderRightWidth: ARROW, borderLeftColor: 'transparent', borderRightColor: 'transparent' }, (side === 'top'
            ? { borderTopWidth: ARROW, borderTopColor: bg }
            : { borderBottomWidth: ARROW, borderBottomColor: bg }))}/>);
    return (<react_native_1.Animated.View pointerEvents="none" style={Object.assign(Object.assign({ position: 'absolute' }, strip), { alignItems: 'flex-start', zIndex: 1000, elevation: 1000, opacity: sized ? animation : 0, transform: [{ translateY: animation.interpolate({ inputRange: [0, 1], outputRange: [side === 'top' ? 4 : -4, 0] }) }] })}>
            <react_native_1.View accessibilityRole="text" style={{ marginLeft: sized ? left : 0, maxWidth, alignItems: 'flex-start' }} onLayout={e => {
            const { width: w, height: h } = e.nativeEvent.layout;
            if (Math.round(w) !== Math.round(size.w) || Math.round(h) !== Math.round(size.h))
                setSize({ w, h });
        }}>
                {side === 'bottom' && arrow}
                <react_native_1.View style={[style, { maxWidth }]}>{children}</react_native_1.View>
                {side === 'top' && arrow}
            </react_native_1.View>
        </react_native_1.Animated.View>);
}
/* ---------------- Tooltip ---------------- */
/**
 * Burbuja con un texto corto junto a un elemento (un icono de información, un botón con solo icono…). Se abre al
 * tocarlo (o al mantenerlo pulsado con openOn="longPress"), se cierra sola tras `duration`, al tocar en cualquier
 * sitio o con el botón atrás. Se pinta en un Portal, encima de todo (o junto al trigger con mode="absolute"), sin salirse
 * de la pantalla
 */
exports.Tooltip = (0, react_1.forwardRef)((rawProps, ref) => {
    // Defaults → theme.components.Tooltip → variante → props → plataforma
    const [_a, theme] = (0, useThemeProps_1.useThemeProps)('Tooltip', rawProps, { defaults: TOOLTIP_DEFAULTS }), { label, children, placement, openOn, duration, isOpen: controlled, defaultOpen, onOpenChange, hasArrow, disabled, _text, _trigger, style, mode, variant: _variant } = _a, props = __rest(_a, ["label", "children", "placement", "openOn", "duration", "isOpen", "defaultOpen", "onOpenChange", "hasArrow", "disabled", "_text", "_trigger", "style", "mode", "variant"]);
    const [internal, setInternal] = (0, react_1.useState)(!!defaultOpen);
    const open = controlled !== null && controlled !== void 0 ? controlled : internal;
    // Montada mientras está abierta o animando el cierre
    const [mounted, setMounted] = (0, react_1.useState)(open);
    const [layout, setLayout] = (0, react_1.useState)(null);
    const animation = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    const triggerRef = (0, react_1.useRef)(null);
    const openRef = (0, react_1.useRef)(open);
    openRef.current = open;
    const onChangeRef = (0, react_1.useRef)(onOpenChange);
    onChangeRef.current = onOpenChange;
    const layoutRef = (0, react_1.useRef)(layout);
    layoutRef.current = layout;
    const setOpen = (0, react_1.useCallback)((v) => {
        var _a;
        if (v === openRef.current)
            return;
        if (controlled === undefined)
            setInternal(v);
        (_a = onChangeRef.current) === null || _a === void 0 ? void 0 : _a.call(onChangeRef, v);
    }, [controlled]);
    // Mide el trigger con measure (pageX/pageY): la misma referencia que el Portal también en Android edge-to-edge
    const measure = () => {
        const node = triggerRef.current;
        if (!(node === null || node === void 0 ? void 0 : node.measure))
            return setLayout({ x: 0, y: 0, width: 0, height: 0 });
        node.measure((_x, _y, width, height, pageX, pageY) => setLayout(prev => prev && Math.abs(prev.x - pageX) < 1 && Math.abs(prev.y - pageY) < 1
            && Math.abs(prev.width - width) < 1 && Math.abs(prev.height - height) < 1
            ? prev : { x: pageX, y: pageY, width, height }));
    };
    (0, react_1.useEffect)(() => {
        if (open) {
            setLayout(null);
            setMounted(true);
            measure();
            // Sigue al trigger mientras está abierto (scroll, teclado…): una medida cada ~100 ms, y solo
            // re-renderiza si se movió
            const timer = setInterval(measure, 100);
            return () => clearInterval(timer);
        }
        react_native_1.Animated.timing(animation, { toValue: 0, duration: 100, useNativeDriver: true })
            .start(({ finished }) => { if (finished && !openRef.current)
            setMounted(false); });
    }, [open]);
    // Se cierra solo tras `duration`
    (0, react_1.useEffect)(() => {
        if (!open || !duration)
            return;
        const timer = setTimeout(() => setOpen(false), duration);
        return () => clearTimeout(timer);
    }, [open, duration]);
    // Un toque en cualquier sitio lo cierra (los del trigger no: el trigger ya lo alterna)
    (0, react_1.useEffect)(() => {
        if (!open)
            return;
        return (0, touches_1.addTapListener)(({ pageX, pageY }) => {
            const l = layoutRef.current;
            const inTrigger = l && pageX >= l.x && pageX <= l.x + l.width && pageY >= l.y && pageY <= l.y + l.height;
            if (!inTrigger)
                setOpen(false);
        });
    }, [open]);
    // Botón atrás de Android: lo cierra si está abierto
    (0, react_1.useEffect)(() => {
        if (!open)
            return;
        const sub = react_native_1.BackHandler.addEventListener('hardwareBackPress', () => {
            if (!openRef.current)
                return false;
            setOpen(false);
            return true;
        });
        return () => sub.remove();
    }, [open]);
    const show = (0, react_1.useCallback)(() => { if (!disabled)
        setOpen(true); }, [disabled, setOpen]);
    const hide = (0, react_1.useCallback)(() => setOpen(false), [setOpen]);
    const toggle = (0, react_1.useCallback)(() => (openRef.current ? hide() : show()), [show, hide]);
    (0, react_1.useImperativeHandle)(ref, () => ({ open: show, close: hide, toggle, isOpen: () => openRef.current }), [show, hide, toggle]);
    const bubbleStyle = react_native_1.StyleSheet.flatten([style, ...(0, DEFAULT_PROPS_1.DEFAULT_PROPS)(props, theme)]);
    const triggerProps = { onPress: toggle, onLongPress: show, open: show, close: hide, isOpen: open };
    const label_ = typeof label === 'string' || typeof label === 'number'
        ? <Text_1.Text color="background" fontSize={13} {..._text}>{label}</Text_1.Text>
        : label;
    const relative = mode === 'absolute';
    const bubble = mounted && layout && (<Bubble trigger={layout} placement={placement !== null && placement !== void 0 ? placement : 'top'} hasArrow={hasArrow !== false} relative={relative} style={bubbleStyle} animation={animation} onReady={() => {
            if (openRef.current)
                react_native_1.Animated.timing(animation, { toValue: 1, duration: 120, useNativeDriver: true }).start();
        }}>
            {label_}
        </Bubble>);
    return (<>
            {/* En 'absolute', abierto, el contenedor del trigger sube de capa para que la burbuja quede encima de sus hermanos */}
            <react_native_1.View ref={triggerRef} collapsable={false} style={[react_native_1.StyleSheet.flatten((0, DEFAULT_PROPS_1.DEFAULT_PROPS)(_trigger || {}, theme)), relative && mounted && { zIndex: 1000, elevation: 1000 }]}>
                {typeof children === 'function'
            ? children(triggerProps)
            : (<Pressable_1.Pressable accessibilityHint={typeof label === 'string' ? label : (0, translate_1.libT)('tooltipHint')} {...(openOn === 'longPress' ? { onLongPress: show } : { onPress: toggle })}>
                            {children}
                        </Pressable_1.Pressable>)}
                {relative && bubble}
            </react_native_1.View>
            {!relative && mounted && (<Portal_1.Portal>
                    <react_native_1.View style={react_native_1.StyleSheet.absoluteFill} pointerEvents="box-none">{bubble}</react_native_1.View>
                </Portal_1.Portal>)}
        </>);
});
exports.Tooltip.displayName = 'Tooltip';
