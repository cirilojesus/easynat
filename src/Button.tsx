import { COLOR_SCHEME, Theme, VARIANT_BUTTON } from './theme';
import { EAPressableProps, Pressable } from "./Pressable";
import React, { cloneElement, forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { AccessibilityActionEvent, Animated as RNAnimated, PanResponder, StyleSheet, View } from "react-native";
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';
import { Icon, IconProps } from "./Icon";
import { Spinner } from "./Spinner";
import { Box, EABoxProps } from "./Box";
import { EATextProps, Text } from "./Text";
import { calcSize, renderChild } from "./utils/helpers";
import { libT } from "./utils/translate";
import { withAlpha } from "./utils/color";
import { mergeProps, useThemeProps } from "./utils/useThemeProps";

export type ButtonChangeAnimation = 'zoom' | 'fade' | 'slide' | 'none';

export type EAButtonProps = Omit<EAPressableProps, 'variant' | '_ios' | '_android' | '_web' | '_pressed'> & {
    variant?: VARIANT_BUTTON | (string & {});
    colorScheme?: COLOR_SCHEME;
    _ios?: Omit<EAButtonProps, '_ios' | '_android' | '_web'>;
    _android?: Omit<EAButtonProps, '_ios' | '_android' | '_web'>;
    _web?: Omit<EAButtonProps, '_ios' | '_android' | '_web'>;
    _icon?: Partial<IconProps<any>>;
    _iconRight?: Partial<IconProps<any>>;
    icon?: React.ReactElement<IconProps<any>>
    iconRight?: React.ReactElement<IconProps<any>>
    _pressed?: Omit<EAButtonProps, '_ios' | '_android' | '_web' | '_pressed'>;
    size?: 'sm' | 'md' | 'lg' | 'xl'
    /** Cargando (controlado): spinner y no se puede pulsar. También con ref.startLoading() o si onPress devuelve una promesa */
    isLoading?: boolean;
    /** Texto mientras carga (sin él, el spinner sale en el centro y el botón no cambia de tamaño) */
    loadingText?: string;
    /** Dónde va el spinner con loadingText. Por defecto 'start' */
    spinnerPlacement?: 'start' | 'end';
    /** Si onPress devuelve una promesa, spinner hasta que termine. Por defecto true */
    loadingOnPress?: boolean;
    /** Interruptor: cada pulsación alterna `active` (y se aplica _active) */
    toggle?: boolean;
    /** Activo (controlado; con onActiveChange) */
    active?: boolean;
    defaultActive?: boolean;
    onActiveChange?: (active: boolean) => void;
    /** Lo que cambia cuando está activo (children, icon, variant, colorScheme, estilos…) */
    _active?: Partial<EAButtonProps>;
    /** Lo que muestra un momento después de pulsar (o de terminar la promesa de onPress): p. ej. "¡Copiado!" */
    feedback?: Partial<EAButtonProps>;
    /** Cuánto dura el feedback (ms). Por defecto 1500 */
    feedbackDuration?: number;
    /** Animación del contenido al cambiar (activo, feedback, cargando). Por defecto 'zoom' */
    changeAnimation?: ButtonChangeAnimation;
};

export type ButtonRef = {
    startLoading: () => void;
    stopLoading: () => void;
    setLoading: (loading: boolean) => void;
    isLoading: () => boolean;
    /** Muestra el feedback (el de la prop, o el que se pase) */
    showFeedback: (feedback?: Partial<EAButtonProps>, duration?: number) => void;
    setActive: (active: boolean) => void;
    isActive: () => boolean;
};

const BUTTON_DEFAULTS: EAButtonProps = {
    variant: "solid",
    p: 2.5,
    rounded: 1,
    flexDir: 'row',
    alignItems: 'center',
    gap: 1.5,
    justifyContent: 'center',
    _text: { textAlign: 'center' },
};

const BUTTON_SIZES: Record<NonNullable<EAButtonProps['size']>, EAButtonProps> = {
    sm: { p: 1.5, gap: 1, _text: { fontSize: 12 }, _icon: { size: 14 }, _iconRight: { size: 14 } },
    md: { p: 2.5, gap: 1.5, _text: { fontSize: 14 }, _icon: { size: 16 }, _iconRight: { size: 16 } },
    lg: { p: 3.5, gap: 2, _text: { fontSize: 16 }, _icon: { size: 18 }, _iconRight: { size: 18 } },
    xl: { p: 4.5, gap: 2.5, _text: { fontSize: 18 }, _icon: { size: 20 }, _iconRight: { size: 20 } },
};

/** Texto e iconos del mismo color */
const tint = (color: string) => ({ _text: { color }, _icon: { color }, _iconRight: { color } });

// Variantes propias: dependen del colorScheme (el de las props, el del tema o primary)
const buttonVariants = (theme: Theme, props: EAButtonProps): Record<VARIANT_BUTTON | 'unstyled', EAButtonProps> => {
    const c = (shade: string) => theme.colors[`${props.colorScheme ?? "primary"}.${shade}`];
    return {
        solid: { bg: c('100'), _pressed: { bg: c('200') }, borderWidth: 1, borderColor: c('100'), ...tint(theme.colors['white']) },
        // Fondo suave del color, texto en el tono oscuro; pulsado, el fondo algo más intenso
        subtle: { bg: withAlpha(c('100'), 0.12) as any, borderWidth: 1, borderColor: withAlpha(c('100'), 0.12), _pressed: { bg: withAlpha(c('100'), 0.22) as any }, ...tint(c('200')) },
        // Borde neutro y el texto del color (como en la referencia)
        outline: { borderWidth: 1, borderColor: c('100'), _pressed: { bg: c('50') }, ...tint(c('100')) },
        ghost: { _pressed: { bg: c('50') }, ...tint(c('100')), borderWidth: 1, borderColor: 'transparent' },
        link: {
            ...tint(c('100')),
            borderWidth: 1, borderColor: 'transparent',
            _pressed: { _text: { color: c('200'), textDecorationLine: 'underline' }, _icon: { color: c('200') }, _iconRight: { color: c('200') } },
        },
        // Sin estilos: ni fondo ni relleno; solo baja la opacidad al pulsar
        unstyled: { p: 0, rounded: 0, _pressed: { opacity: 0.6 }, _text: { color: theme.colors['dark'] } },
    };
};

const ENTERING: Record<Exclude<ButtonChangeAnimation, 'none'>, any> = {
    zoom: ZoomIn.duration(180),
    fade: FadeIn.duration(180),
    slide: FadeInDown.duration(200),
};

export const Button = forwardRef<ButtonRef, EAButtonProps>((props, ref) => {
    const [internalActive, setInternalActive] = useState(!!props.defaultActive);
    const [feedbackShown, setFeedbackShown] = useState<Partial<EAButtonProps> | null>(null);
    const [internalLoading, setInternalLoading] = useState(false);
    const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const alive = useRef(true);
    useEffect(() => () => { alive.current = false; if (feedbackTimer.current) clearTimeout(feedbackTimer.current) }, []);

    const active = props.active ?? internalActive;
    // Lo activo y el feedback se aplican encima de las props (pueden cambiar hasta la variante)
    const effective = mergeProps<EAButtonProps>(props, active && props._active, feedbackShown);

    // Defaults → theme.components.Button → variante → tamaño → props → plataforma
    const {
        variant: _variant, colorScheme: _colorScheme, size: _size, icon, iconRight, _icon, _iconRight, children,
        isLoading, loadingText, spinnerPlacement = 'start', loadingOnPress = true, toggle, active: _a, defaultActive: _d, onActiveChange,
        _active, feedback, feedbackDuration = 1500, changeAnimation = 'zoom', onPress, ...rest
    } = useThemeProps<EAButtonProps>('Button', effective, { defaults: BUTTON_DEFAULTS, variants: buttonVariants, sizes: BUTTON_SIZES })[0];
    const loading = isLoading ?? internalLoading;

    const showFeedback = (f?: Partial<EAButtonProps>, duration?: number) => {
        const fb = f ?? props.feedback;
        if (!fb) return;
        if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
        setFeedbackShown(fb);
        feedbackTimer.current = setTimeout(() => { if (alive.current) setFeedbackShown(null) }, duration ?? feedbackDuration);
    };
    const setActive = (v: boolean) => {
        if (props.active == null) setInternalActive(v);
        onActiveChange?.(v);
    };
    useImperativeHandle(ref, () => ({
        startLoading: () => setInternalLoading(true),
        stopLoading: () => setInternalLoading(false),
        setLoading: setInternalLoading,
        isLoading: () => loading,
        showFeedback,
        setActive,
        isActive: () => active,
    }));

    const handlePress = (e: any) => {
        if (loading) return;
        if (toggle || props.active != null) setActive(!active);
        const r: any = onPress?.(e);
        if (r && typeof r.then === 'function' && loadingOnPress) {
            setInternalLoading(true);
            r.then(() => { if (alive.current) { setInternalLoading(false); showFeedback() } }, () => { if (alive.current) setInternalLoading(false) });
        } else showFeedback();
    };

    // El contenido se anima al cambiar de estado (la primera vez que cambia se envuelve; los botones normales no)
    const stateKey = `${active ? 'a' : 'n'}${feedbackShown ? 'f' : ''}${loading ? (loadingText ? 'L' : 'l') : ''}`;
    const changed = useRef(false);
    if (stateKey !== 'n') changed.current = true;
    const spinnerColor = (rest._text as any)?.color ?? 'white';

    return (
        <Pressable {...rest} onPress={handlePress} accessibilityRole={rest.accessibilityRole ?? 'button'}
            accessibilityState={{ disabled: !!rest.disabled, busy: loading, ...(toggle || props.active != null ? { selected: active } : null), ...rest.accessibilityState }}>
            {({ pressed }: { pressed: boolean }) => {
                const textProps = pressed ? { ...rest._text, ...rest._pressed?._text } : rest._text;
                const inner = (
                    <>
                        {loading && loadingText && spinnerPlacement === 'start' && <Spinner size="small" color={spinnerColor} />}
                        {!(loading && loadingText) && icon && cloneElement(icon, { ..._icon, ...icon.props, ...(pressed ? rest._pressed?._icon : {}) })}
                        {renderChild((loading && loadingText ? loadingText : children) as any, textProps)}
                        {!(loading && loadingText) && iconRight && cloneElement(iconRight, { ..._iconRight, ...iconRight.props, ...(pressed ? rest._pressed?._iconRight : {}) })}
                        {loading && loadingText && spinnerPlacement === 'end' && <Spinner size="small" color={spinnerColor} />}
                    </>
                );
                const hideContent = loading && !loadingText;
                const content = changed.current && changeAnimation !== 'none'
                    ? (
                        <Animated.View key={stateKey} entering={ENTERING[changeAnimation]}
                            style={{
                                flexDirection: (rest.flexDir ?? rest.flexDirection ?? 'row') as any, alignItems: 'center', gap: calcSize(rest.gap as any ?? 2) as number,
                                justifyContent: rest.justifyContent ?? 'center', flexGrow: rest.justifyContent && rest.justifyContent !== 'center' ? 1 : 0,
                                opacity: hideContent ? 0 : 1,
                            }}>
                            {inner}
                        </Animated.View>
                    )
                    : hideContent ? <View style={{ flexDirection: 'row', alignItems: 'center', gap: calcSize(rest.gap as any ?? 2) as number, opacity: 0 }}>{inner}</View> : inner;
                return (
                    <>
                        {content}
                        {/* Cargando sin texto: el spinner en el centro, sin cambiar el tamaño del botón */}
                        {hideContent && <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]} pointerEvents="none"><Spinner size="small" color={spinnerColor} /></View>}
                    </>
                );
            }}
        </Pressable>
    );
});

/* ================= HoldButton: mantener pulsado hasta llenar la barra ================= */

export type HoldButtonProps = Omit<EAButtonProps, 'onPress'> & {
    /** Al llenarse la barra. Si devuelve una promesa, spinner hasta que termine */
    onComplete: () => any;
    /** Cuánto hay que mantenerlo (ms). Por defecto 1500 */
    holdDuration?: number;
    /** Color del relleno. Por defecto un blanco translúcido (solid) o el tono suave del color */
    fillColor?: string;
    onHoldStart?: () => void;
    /** Se soltó antes de terminar */
    onHoldCancel?: () => void;
    /** Al completar, la barra se queda llena (hasta ref.reset()). Por defecto se vacía */
    keepFilled?: boolean;
};

export type HoldButtonRef = ButtonRef & { reset: () => void };

/**
 * Botón que hay que mantener pulsado: se va llenando una barra y al completarse llama a onComplete.
 * Si se suelta antes, la barra vuelve atrás
 * @example <HoldButton colorScheme="danger" onComplete={borrar}>Mantén para borrar</HoldButton>
 */
export const HoldButton = forwardRef<HoldButtonRef, HoldButtonProps>((rawProps, ref) => {
    const [props, theme] = useThemeProps<HoldButtonProps>('HoldButton', rawProps);
    const { onComplete, holdDuration = 1500, fillColor, onHoldStart, onHoldCancel, keepFilled, children, ...buttonProps } = props;
    const progress = useRef(new RNAnimated.Value(0)).current;
    const value = useRef(0);
    const done = useRef(false);
    const holding = useRef(false);
    const button = useRef<ButtonRef>(null);
    useEffect(() => { const id = progress.addListener(({ value: v }) => { value.current = v }); return () => progress.removeListener(id) }, []);

    const reset = () => { done.current = false; RNAnimated.timing(progress, { toValue: 0, duration: 200, useNativeDriver: false }).start() };
    useImperativeHandle(ref, () => ({ ...(button.current as ButtonRef), reset }));

    const start = () => {
        if (done.current || buttonProps.disabled || button.current?.isLoading()) return;
        holding.current = true;
        onHoldStart?.();
        // Lo que falta (si se volvió a pulsar a medias, sigue desde ahí)
        RNAnimated.timing(progress, { toValue: 1, duration: holdDuration * (1 - value.current), useNativeDriver: false }).start(({ finished }) => {
            if (!finished) return;
            holding.current = false;
            done.current = true;
            const r = onComplete?.();
            const after = () => { if (!keepFilled) reset() };
            if (r && typeof r.then === 'function') { button.current?.startLoading(); r.then(() => { button.current?.stopLoading(); after() }, () => { button.current?.stopLoading(); reset() }) }
            else { button.current?.showFeedback(); setTimeout(after, 350) }
        });
    };
    const stop = () => {
        if (done.current || !holding.current) return;
        holding.current = false;
        progress.stopAnimation();
        onHoldCancel?.();
        RNAnimated.timing(progress, { toValue: 0, duration: 250, useNativeDriver: false }).start();
    };

    const variant = buttonProps.variant ?? 'solid';
    const fill = fillColor ?? (variant === 'solid' ? 'rgba(255,255,255,0.35)' : theme.colors[`${buttonProps.colorScheme ?? 'primary'}.50`]);
    return (
        <Button ref={button} overflow="hidden" {...buttonProps} onPressIn={start} onPressOut={stop}
            accessibilityHint={buttonProps.accessibilityHint ?? libT('holdHint')}
            // Lectores de pantalla: la acción de activar lo completa directamente
            onAccessibilityAction={(e: AccessibilityActionEvent) => { if (e.nativeEvent.actionName === 'activate') { done.current = true; onComplete?.() } }}
            accessibilityActions={[{ name: 'activate' }]}>
            <RNAnimated.View pointerEvents="none" style={{
                position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: fill,
                width: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
            }} />
            {children as any}
        </Button>
    );
});

/* ================= SlideButton: deslizar para confirmar ================= */

export type SlideButtonProps = Omit<EABoxProps, 'children'> & {
    /** Al llegar al final. Si devuelve una promesa: spinner en el botón; si falla, vuelve al principio */
    onComplete: () => any;
    /** Texto del carril. Por defecto "Desliza para confirmar" */
    text?: string;
    /** Texto al terminar */
    completedText?: string;
    colorScheme?: COLOR_SCHEME;
    /** Alto (px). Por defecto 56 */
    height?: number;
    /** Icono del botón que se arrastra (por defecto una flecha) y al terminar (un check) */
    icon?: React.ReactElement;
    completedIcon?: React.ReactElement;
    /** Qué parte hay que recorrer para que cuente (0-1). Por defecto 0.85 */
    threshold?: number;
    /** Vuelve solo al principio a los X ms de terminar. Por defecto se queda hecho (ref.reset()) */
    resetAfter?: number;
    disabled?: boolean;
    variant?: (string & {});
    _track?: EABoxProps;
    _knob?: EABoxProps;
    _text?: EATextProps;
    /** La parte ya recorrida (detrás del botón) */
    _fill?: EABoxProps;
    /** El carril y el texto al terminar */
    _completedFill?: EABoxProps;
    _completedText?: EATextProps;
};

export type SlideButtonRef = { reset: () => void; complete: () => void; isCompleted: () => boolean };

/**
 * Deslizar para confirmar: se arrastra el botón hasta el final del carril
 * @example <SlideButton text="Desliza para confirmar el pedido" onComplete={confirmar} />
 */
export const SlideButton = forwardRef<SlideButtonRef, SlideButtonProps>((rawProps, ref) => {
    const [props, theme] = useThemeProps<SlideButtonProps>('SlideButton', rawProps, {
        variants: {
            dark: { _knob: { bg: 'black' }, _fill: { bg: 'light.100' }, _completedFill: { bg: 'black' } },
        },
    });
    const {
        onComplete, text = libT('slideToConfirm'), completedText, colorScheme = 'primary', height = 56, icon, completedIcon, threshold = 0.85,
        resetAfter, disabled, variant: _v, _track, _knob, _text, _fill, _completedFill, _completedText, ...boxProps
    } = props;
    const pad = 4, knob = height - pad * 2;
    const [width, setWidth] = useState(0);
    const max = Math.max(0, width - knob - pad * 2);
    const x = useRef(new RNAnimated.Value(0)).current;
    // Siempre un valor animado (pasar de animado a número fijo deja en Android el último valor animado)
    const one = useRef(new RNAnimated.Value(1)).current;
    const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle');
    const live = useRef({ max, state, onComplete, threshold, resetAfter, disabled });
    live.current = { max, state, onComplete, threshold, resetAfter, disabled };
    const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    useEffect(() => () => { if (resetTimer.current) clearTimeout(resetTimer.current) }, []);

    const back = () => { setState('idle'); RNAnimated.spring(x, { toValue: 0, useNativeDriver: false, bounciness: 6 }).start() };
    const finish = () => {
        const L = live.current;
        RNAnimated.timing(x, { toValue: L.max, duration: 120, useNativeDriver: false }).start();
        const r = L.onComplete?.();
        const done = () => {
            setState('done');
            if (L.resetAfter) resetTimer.current = setTimeout(back, L.resetAfter);
        };
        if (r && typeof r.then === 'function') { setState('loading'); r.then(done, back) } else done();
    };
    useImperativeHandle(ref, () => ({ reset: back, complete: () => { if (live.current.state === 'idle') finish() }, isCompleted: () => live.current.state === 'done' }));

    const pan = useRef(PanResponder.create({
        onStartShouldSetPanResponder: () => live.current.state === 'idle' && !live.current.disabled,
        onMoveShouldSetPanResponder: (_, g) => live.current.state === 'idle' && !live.current.disabled && Math.abs(g.dx) > Math.abs(g.dy),
        // Que no se lo quite el ScrollView de la pantalla
        onPanResponderTerminationRequest: () => false,
        onPanResponderMove: (_, g) => x.setValue(Math.max(0, Math.min(live.current.max, g.dx))),
        onPanResponderRelease: (_, g) => {
            const L = live.current;
            if (L.max && g.dx >= L.max * L.threshold) finish(); else back();
        },
        onPanResponderTerminate: () => back(),
    })).current;

    const c = (shade: string) => theme.colors[`${colorScheme}.${shade}`];
    const doneState = state === 'done';
    const label = doneState && completedText ? completedText : text;
    return (
        <Box h={height} rounded={height} bg="surface" borderWidth={1} borderColor="border" justifyContent="center" overflow="hidden" opacity={disabled ? 0.5 : 1}
            onLayout={e => setWidth(e.nativeEvent.layout.width)}
            accessibilityRole="adjustable" accessibilityLabel={label} accessibilityState={{ disabled: !!disabled, busy: state === 'loading', checked: doneState }}
            accessibilityActions={[{ name: 'activate' }, { name: 'increment' }]}
            onAccessibilityAction={() => { if (state === 'idle' && !disabled) finish() }}
            {...boxProps} {..._track}>
            {/* Lo recorrido */}
            <RNAnimated.View pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: RNAnimated.add(x, knob + pad * 2) }}>
                {doneState ? <Box flex={1} bg={c('100')} rounded={height} {..._completedFill} /> : <Box flex={1} bg={c('50')} rounded={height} {..._fill} />}
            </RNAnimated.View>
            <RNAnimated.View pointerEvents="none" style={{
                position: 'absolute', left: knob + pad * 2, right: pad * 2, alignItems: 'center',
                opacity: doneState || !max ? one : x.interpolate({ inputRange: [0, max * 0.6], outputRange: [1, 0], extrapolate: 'clamp' }),
            }}>
                {doneState
                    ? <Text fontWeight="600" numberOfLines={1} color="white" {..._completedText}>{label}</Text>
                    : <Text fontWeight="600" numberOfLines={1} color="dark" {..._text}>{label}</Text>}
            </RNAnimated.View>
            <RNAnimated.View {...pan.panHandlers} style={{ position: 'absolute', left: pad, transform: [{ translateX: x }] }}>
                <Box w={knob} h={knob} rounded={knob} bg={c('100')} alignItems="center" justifyContent="center" shadow={1} {..._knob}>
                    {state === 'loading'
                        ? <Spinner color="white" size="small" />
                        : doneState
                            ? (completedIcon ?? <Icon as="Feather" name="check" size={22} color="white" />)
                            : (icon ?? <Icon as="Feather" name="arrow-right" size={22} color="white" />)}
                </Box>
            </RNAnimated.View>
        </Box>
    );
});
