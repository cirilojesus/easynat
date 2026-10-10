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
exports.SlideButton = exports.HoldButton = exports.Button = void 0;
const Pressable_1 = require("./Pressable");
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const react_native_reanimated_1 = __importStar(require("react-native-reanimated"));
const Icon_1 = require("./Icon");
const Spinner_1 = require("./Spinner");
const Box_1 = require("./Box");
const Text_1 = require("./Text");
const helpers_1 = require("./utils/helpers");
const translate_1 = require("./utils/translate");
const color_1 = require("./utils/color");
const useThemeProps_1 = require("./utils/useThemeProps");
const BUTTON_DEFAULTS = {
    variant: "solid",
    p: 2.5,
    rounded: 1,
    flexDir: 'row',
    alignItems: 'center',
    gap: 1.5,
    justifyContent: 'center',
    _text: { textAlign: 'center' },
};
const BUTTON_SIZES = {
    sm: { p: 1.5, gap: 1, _text: { fontSize: 12 }, _icon: { size: 14 }, _iconRight: { size: 14 } },
    md: { p: 2.5, gap: 1.5, _text: { fontSize: 14 }, _icon: { size: 16 }, _iconRight: { size: 16 } },
    lg: { p: 3.5, gap: 2, _text: { fontSize: 16 }, _icon: { size: 18 }, _iconRight: { size: 18 } },
    xl: { p: 4.5, gap: 2.5, _text: { fontSize: 18 }, _icon: { size: 20 }, _iconRight: { size: 20 } },
};
/** Texto e iconos del mismo color */
const tint = (color) => ({ _text: { color }, _icon: { color }, _iconRight: { color } });
// Variantes propias: dependen del colorScheme (el de las props, el del tema o primary)
const buttonVariants = (theme, props) => {
    const c = (shade) => { var _b; return theme.colors[`${(_b = props.colorScheme) !== null && _b !== void 0 ? _b : "primary"}.${shade}`]; };
    return {
        solid: Object.assign({ bg: c('100'), _pressed: { bg: c('200') }, borderWidth: 1, borderColor: c('100') }, tint(theme.colors['white'])),
        // Fondo suave del color, texto en el tono oscuro; pulsado, el fondo algo más intenso
        subtle: Object.assign({ bg: (0, color_1.withAlpha)(c('100'), 0.12), borderWidth: 1, borderColor: (0, color_1.withAlpha)(c('100'), 0.12), _pressed: { bg: (0, color_1.withAlpha)(c('100'), 0.22) } }, tint(c('200'))),
        // Borde neutro y el texto del color (como en la referencia)
        outline: Object.assign({ borderWidth: 1, borderColor: c('100'), _pressed: { bg: c('50') } }, tint(c('100'))),
        ghost: Object.assign(Object.assign({ _pressed: { bg: c('50') } }, tint(c('100'))), { borderWidth: 1, borderColor: 'transparent' }),
        link: Object.assign(Object.assign({}, tint(c('100'))), { borderWidth: 1, borderColor: 'transparent', _pressed: { _text: { color: c('200'), textDecorationLine: 'underline' }, _icon: { color: c('200') }, _iconRight: { color: c('200') } } }),
        // Sin estilos: ni fondo ni relleno; solo baja la opacidad al pulsar
        unstyled: { p: 0, rounded: 0, _pressed: { opacity: 0.6 }, _text: { color: theme.colors['dark'] } },
    };
};
const ENTERING = {
    zoom: react_native_reanimated_1.ZoomIn.duration(180),
    fade: react_native_reanimated_1.FadeIn.duration(180),
    slide: react_native_reanimated_1.FadeInDown.duration(200),
};
exports.Button = (0, react_1.forwardRef)((props, ref) => {
    var _b, _c, _e, _f;
    const [internalActive, setInternalActive] = (0, react_1.useState)(!!props.defaultActive);
    const [feedbackShown, setFeedbackShown] = (0, react_1.useState)(null);
    const [internalLoading, setInternalLoading] = (0, react_1.useState)(false);
    const feedbackTimer = (0, react_1.useRef)(null);
    const alive = (0, react_1.useRef)(true);
    (0, react_1.useEffect)(() => () => { alive.current = false; if (feedbackTimer.current)
        clearTimeout(feedbackTimer.current); }, []);
    const active = (_b = props.active) !== null && _b !== void 0 ? _b : internalActive;
    // Lo activo y el feedback se aplican encima de las props (pueden cambiar hasta la variante)
    const effective = (0, useThemeProps_1.mergeProps)(props, active && props._active, feedbackShown);
    // Defaults → theme.components.Button → variante → tamaño → props → plataforma
    const _g = (0, useThemeProps_1.useThemeProps)('Button', effective, { defaults: BUTTON_DEFAULTS, variants: buttonVariants, sizes: BUTTON_SIZES })[0], { variant: _variant, colorScheme: _colorScheme, size: _size, icon, iconRight, _icon, _iconRight, children, isLoading, loadingText, spinnerPlacement = 'start', loadingOnPress = true, toggle, active: _a, defaultActive: _d, onActiveChange, _active, feedback, feedbackDuration = 1500, changeAnimation = 'zoom', onPress } = _g, rest = __rest(_g, ["variant", "colorScheme", "size", "icon", "iconRight", "_icon", "_iconRight", "children", "isLoading", "loadingText", "spinnerPlacement", "loadingOnPress", "toggle", "active", "defaultActive", "onActiveChange", "_active", "feedback", "feedbackDuration", "changeAnimation", "onPress"]);
    const loading = isLoading !== null && isLoading !== void 0 ? isLoading : internalLoading;
    const showFeedback = (f, duration) => {
        const fb = f !== null && f !== void 0 ? f : props.feedback;
        if (!fb)
            return;
        if (feedbackTimer.current)
            clearTimeout(feedbackTimer.current);
        setFeedbackShown(fb);
        feedbackTimer.current = setTimeout(() => { if (alive.current)
            setFeedbackShown(null); }, duration !== null && duration !== void 0 ? duration : feedbackDuration);
    };
    const setActive = (v) => {
        if (props.active == null)
            setInternalActive(v);
        onActiveChange === null || onActiveChange === void 0 ? void 0 : onActiveChange(v);
    };
    (0, react_1.useImperativeHandle)(ref, () => ({
        startLoading: () => setInternalLoading(true),
        stopLoading: () => setInternalLoading(false),
        setLoading: setInternalLoading,
        isLoading: () => loading,
        showFeedback,
        setActive,
        isActive: () => active,
    }));
    const handlePress = (e) => {
        if (loading)
            return;
        if (toggle || props.active != null)
            setActive(!active);
        const r = onPress === null || onPress === void 0 ? void 0 : onPress(e);
        if (r && typeof r.then === 'function' && loadingOnPress) {
            setInternalLoading(true);
            r.then(() => { if (alive.current) {
                setInternalLoading(false);
                showFeedback();
            } }, () => { if (alive.current)
                setInternalLoading(false); });
        }
        else
            showFeedback();
    };
    // El contenido se anima al cambiar de estado (la primera vez que cambia se envuelve; los botones normales no)
    const stateKey = `${active ? 'a' : 'n'}${feedbackShown ? 'f' : ''}${loading ? (loadingText ? 'L' : 'l') : ''}`;
    const changed = (0, react_1.useRef)(false);
    if (stateKey !== 'n')
        changed.current = true;
    const spinnerColor = (_e = (_c = rest._text) === null || _c === void 0 ? void 0 : _c.color) !== null && _e !== void 0 ? _e : 'white';
    return (<Pressable_1.Pressable {...rest} onPress={handlePress} accessibilityRole={(_f = rest.accessibilityRole) !== null && _f !== void 0 ? _f : 'button'} accessibilityState={Object.assign(Object.assign({ disabled: !!rest.disabled, busy: loading }, (toggle || props.active != null ? { selected: active } : null)), rest.accessibilityState)}>
            {({ pressed }) => {
            var _b, _c, _e, _f, _g, _h, _j, _k;
            const textProps = pressed ? Object.assign(Object.assign({}, rest._text), (_b = rest._pressed) === null || _b === void 0 ? void 0 : _b._text) : rest._text;
            const inner = (<>
                        {loading && loadingText && spinnerPlacement === 'start' && <Spinner_1.Spinner size="small" color={spinnerColor}/>}
                        {!(loading && loadingText) && icon && (0, react_1.cloneElement)(icon, Object.assign(Object.assign(Object.assign({}, _icon), icon.props), (pressed ? (_c = rest._pressed) === null || _c === void 0 ? void 0 : _c._icon : {})))}
                        {(0, helpers_1.renderChild)((loading && loadingText ? loadingText : children), textProps)}
                        {!(loading && loadingText) && iconRight && (0, react_1.cloneElement)(iconRight, Object.assign(Object.assign(Object.assign({}, _iconRight), iconRight.props), (pressed ? (_e = rest._pressed) === null || _e === void 0 ? void 0 : _e._iconRight : {})))}
                        {loading && loadingText && spinnerPlacement === 'end' && <Spinner_1.Spinner size="small" color={spinnerColor}/>}
                    </>);
            const hideContent = loading && !loadingText;
            const content = changed.current && changeAnimation !== 'none'
                ? (<react_native_reanimated_1.default.View key={stateKey} entering={ENTERING[changeAnimation]} style={{
                        flexDirection: ((_g = (_f = rest.flexDir) !== null && _f !== void 0 ? _f : rest.flexDirection) !== null && _g !== void 0 ? _g : 'row'), alignItems: 'center', gap: (0, helpers_1.calcSize)((_h = rest.gap) !== null && _h !== void 0 ? _h : 2),
                        justifyContent: (_j = rest.justifyContent) !== null && _j !== void 0 ? _j : 'center', flexGrow: rest.justifyContent && rest.justifyContent !== 'center' ? 1 : 0,
                        opacity: hideContent ? 0 : 1,
                    }}>
                            {inner}
                        </react_native_reanimated_1.default.View>)
                : hideContent ? <react_native_1.View style={{ flexDirection: 'row', alignItems: 'center', gap: (0, helpers_1.calcSize)((_k = rest.gap) !== null && _k !== void 0 ? _k : 2), opacity: 0 }}>{inner}</react_native_1.View> : inner;
            return (<>
                        {content}
                        {/* Cargando sin texto: el spinner en el centro, sin cambiar el tamaño del botón */}
                        {hideContent && <react_native_1.View style={[react_native_1.StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]} pointerEvents="none"><Spinner_1.Spinner size="small" color={spinnerColor}/></react_native_1.View>}
                    </>);
        }}
        </Pressable_1.Pressable>);
});
/**
 * Botón que hay que mantener pulsado: se va llenando una barra y al completarse llama a onComplete.
 * Si se suelta antes, la barra vuelve atrás
 * @example <HoldButton colorScheme="danger" onComplete={borrar}>Mantén para borrar</HoldButton>
 */
exports.HoldButton = (0, react_1.forwardRef)((rawProps, ref) => {
    var _b, _c, _e;
    const [props, theme] = (0, useThemeProps_1.useThemeProps)('HoldButton', rawProps);
    const { onComplete, holdDuration = 1500, fillColor, onHoldStart, onHoldCancel, keepFilled, children } = props, buttonProps = __rest(props, ["onComplete", "holdDuration", "fillColor", "onHoldStart", "onHoldCancel", "keepFilled", "children"]);
    const progress = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    const value = (0, react_1.useRef)(0);
    const done = (0, react_1.useRef)(false);
    const holding = (0, react_1.useRef)(false);
    const button = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => { const id = progress.addListener(({ value: v }) => { value.current = v; }); return () => progress.removeListener(id); }, []);
    const reset = () => { done.current = false; react_native_1.Animated.timing(progress, { toValue: 0, duration: 200, useNativeDriver: false }).start(); };
    (0, react_1.useImperativeHandle)(ref, () => (Object.assign(Object.assign({}, button.current), { reset })));
    const start = () => {
        var _b;
        if (done.current || buttonProps.disabled || ((_b = button.current) === null || _b === void 0 ? void 0 : _b.isLoading()))
            return;
        holding.current = true;
        onHoldStart === null || onHoldStart === void 0 ? void 0 : onHoldStart();
        // Lo que falta (si se volvió a pulsar a medias, sigue desde ahí)
        react_native_1.Animated.timing(progress, { toValue: 1, duration: holdDuration * (1 - value.current), useNativeDriver: false }).start(({ finished }) => {
            var _b, _c;
            if (!finished)
                return;
            holding.current = false;
            done.current = true;
            const r = onComplete === null || onComplete === void 0 ? void 0 : onComplete();
            const after = () => { if (!keepFilled)
                reset(); };
            if (r && typeof r.then === 'function') {
                (_b = button.current) === null || _b === void 0 ? void 0 : _b.startLoading();
                r.then(() => { var _b; (_b = button.current) === null || _b === void 0 ? void 0 : _b.stopLoading(); after(); }, () => { var _b; (_b = button.current) === null || _b === void 0 ? void 0 : _b.stopLoading(); reset(); });
            }
            else {
                (_c = button.current) === null || _c === void 0 ? void 0 : _c.showFeedback();
                setTimeout(after, 350);
            }
        });
    };
    const stop = () => {
        if (done.current || !holding.current)
            return;
        holding.current = false;
        progress.stopAnimation();
        onHoldCancel === null || onHoldCancel === void 0 ? void 0 : onHoldCancel();
        react_native_1.Animated.timing(progress, { toValue: 0, duration: 250, useNativeDriver: false }).start();
    };
    const variant = (_b = buttonProps.variant) !== null && _b !== void 0 ? _b : 'solid';
    const fill = fillColor !== null && fillColor !== void 0 ? fillColor : (variant === 'solid' ? 'rgba(255,255,255,0.35)' : theme.colors[`${(_c = buttonProps.colorScheme) !== null && _c !== void 0 ? _c : 'primary'}.50`]);
    return (<exports.Button ref={button} overflow="hidden" {...buttonProps} onPressIn={start} onPressOut={stop} accessibilityHint={(_e = buttonProps.accessibilityHint) !== null && _e !== void 0 ? _e : (0, translate_1.libT)('holdHint')} 
    // Lectores de pantalla: la acción de activar lo completa directamente
    onAccessibilityAction={(e) => { if (e.nativeEvent.actionName === 'activate') {
        done.current = true;
        onComplete === null || onComplete === void 0 ? void 0 : onComplete();
    } }} accessibilityActions={[{ name: 'activate' }]}>
            <react_native_1.Animated.View pointerEvents="none" style={{
            position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: fill,
            width: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
        }}/>
            {children}
        </exports.Button>);
});
/**
 * Deslizar para confirmar: se arrastra el botón hasta el final del carril
 * @example <SlideButton text="Desliza para confirmar el pedido" onComplete={confirmar} />
 */
exports.SlideButton = (0, react_1.forwardRef)((rawProps, ref) => {
    const [props, theme] = (0, useThemeProps_1.useThemeProps)('SlideButton', rawProps, {
        variants: {
            dark: { _knob: { bg: 'black' }, _fill: { bg: 'light.100' }, _completedFill: { bg: 'black' } },
        },
    });
    const { onComplete, text = (0, translate_1.libT)('slideToConfirm'), completedText, colorScheme = 'primary', height = 56, icon, completedIcon, threshold = 0.85, resetAfter, disabled, variant: _v, _track, _knob, _text, _fill, _completedFill, _completedText } = props, boxProps = __rest(props, ["onComplete", "text", "completedText", "colorScheme", "height", "icon", "completedIcon", "threshold", "resetAfter", "disabled", "variant", "_track", "_knob", "_text", "_fill", "_completedFill", "_completedText"]);
    const pad = 4, knob = height - pad * 2;
    const [width, setWidth] = (0, react_1.useState)(0);
    const max = Math.max(0, width - knob - pad * 2);
    const x = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    // Siempre un valor animado (pasar de animado a número fijo deja en Android el último valor animado)
    const one = (0, react_1.useRef)(new react_native_1.Animated.Value(1)).current;
    const [state, setState] = (0, react_1.useState)('idle');
    const live = (0, react_1.useRef)({ max, state, onComplete, threshold, resetAfter, disabled });
    live.current = { max, state, onComplete, threshold, resetAfter, disabled };
    const resetTimer = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => () => { if (resetTimer.current)
        clearTimeout(resetTimer.current); }, []);
    const back = () => { setState('idle'); react_native_1.Animated.spring(x, { toValue: 0, useNativeDriver: false, bounciness: 6 }).start(); };
    const finish = () => {
        var _b;
        const L = live.current;
        react_native_1.Animated.timing(x, { toValue: L.max, duration: 120, useNativeDriver: false }).start();
        const r = (_b = L.onComplete) === null || _b === void 0 ? void 0 : _b.call(L);
        const done = () => {
            setState('done');
            if (L.resetAfter)
                resetTimer.current = setTimeout(back, L.resetAfter);
        };
        if (r && typeof r.then === 'function') {
            setState('loading');
            r.then(done, back);
        }
        else
            done();
    };
    (0, react_1.useImperativeHandle)(ref, () => ({ reset: back, complete: () => { if (live.current.state === 'idle')
            finish(); }, isCompleted: () => live.current.state === 'done' }));
    const pan = (0, react_1.useRef)(react_native_1.PanResponder.create({
        onStartShouldSetPanResponder: () => live.current.state === 'idle' && !live.current.disabled,
        onMoveShouldSetPanResponder: (_, g) => live.current.state === 'idle' && !live.current.disabled && Math.abs(g.dx) > Math.abs(g.dy),
        // Que no se lo quite el ScrollView de la pantalla
        onPanResponderTerminationRequest: () => false,
        onPanResponderMove: (_, g) => x.setValue(Math.max(0, Math.min(live.current.max, g.dx))),
        onPanResponderRelease: (_, g) => {
            const L = live.current;
            if (L.max && g.dx >= L.max * L.threshold)
                finish();
            else
                back();
        },
        onPanResponderTerminate: () => back(),
    })).current;
    const c = (shade) => theme.colors[`${colorScheme}.${shade}`];
    const doneState = state === 'done';
    const label = doneState && completedText ? completedText : text;
    return (<Box_1.Box h={height} rounded={height} bg="surface" borderWidth={1} borderColor="border" justifyContent="center" overflow="hidden" opacity={disabled ? 0.5 : 1} onLayout={e => setWidth(e.nativeEvent.layout.width)} accessibilityRole="adjustable" accessibilityLabel={label} accessibilityState={{ disabled: !!disabled, busy: state === 'loading', checked: doneState }} accessibilityActions={[{ name: 'activate' }, { name: 'increment' }]} onAccessibilityAction={() => { if (state === 'idle' && !disabled)
        finish(); }} {...boxProps} {..._track}>
            {/* Lo recorrido */}
            <react_native_1.Animated.View pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: react_native_1.Animated.add(x, knob + pad * 2) }}>
                {doneState ? <Box_1.Box flex={1} bg={c('100')} rounded={height} {..._completedFill}/> : <Box_1.Box flex={1} bg={c('50')} rounded={height} {..._fill}/>}
            </react_native_1.Animated.View>
            <react_native_1.Animated.View pointerEvents="none" style={{
            position: 'absolute', left: knob + pad * 2, right: pad * 2, alignItems: 'center',
            opacity: doneState || !max ? one : x.interpolate({ inputRange: [0, max * 0.6], outputRange: [1, 0], extrapolate: 'clamp' }),
        }}>
                {doneState
            ? <Text_1.Text fontWeight="600" numberOfLines={1} color="white" {..._completedText}>{label}</Text_1.Text>
            : <Text_1.Text fontWeight="600" numberOfLines={1} color="dark" {..._text}>{label}</Text_1.Text>}
            </react_native_1.Animated.View>
            <react_native_1.Animated.View {...pan.panHandlers} style={{ position: 'absolute', left: pad, transform: [{ translateX: x }] }}>
                <Box_1.Box w={knob} h={knob} rounded={knob} bg={c('100')} alignItems="center" justifyContent="center" shadow={1} {..._knob}>
                    {state === 'loading'
            ? <Spinner_1.Spinner color="white" size="small"/>
            : doneState
                ? (completedIcon !== null && completedIcon !== void 0 ? completedIcon : <Icon_1.Icon as="Feather" name="check" size={22} color="white"/>)
                : (icon !== null && icon !== void 0 ? icon : <Icon_1.Icon as="Feather" name="arrow-right" size={22} color="white"/>)}
                </Box_1.Box>
            </react_native_1.Animated.View>
        </Box_1.Box>);
});
