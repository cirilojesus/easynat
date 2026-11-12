import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Animated, BackHandler, StyleSheet, View, ViewProps, ViewStyle, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { EADefaultProps, DEFAULT_PROPS } from "./utils/DEFAULT_PROPS";
import { useThemeProps } from "./utils/useThemeProps";
import { addTapListener } from "./utils/touches";
import { libT } from "./utils/translate";
import { Portal } from "./Portal";
import { Pressable } from "./Pressable";
import { Text, EATextProps } from "./Text";

/* ---------------- Tipos ---------------- */

export type TooltipRef = {
    open: () => void;
    close: () => void;
    toggle: () => void;
    isOpen: () => boolean;
};

/** Lo que recibe `children` si es una función (para abrirlo desde tu propio botón) */
export type TooltipTriggerProps = {
    /** Alterna abrir / cerrar */
    onPress: () => void;
    /** Abre (para onLongPress) */
    onLongPress: () => void;
    open: () => void;
    close: () => void;
    isOpen: boolean;
};

/**
 * Props del Tooltip. Las props de estilo (bg, p, rounded, maxW…) van a la burbuja.
 * @example
 * <Tooltip label="Se guarda solo cada 5 minutos"><Icon name="info" /></Tooltip>
 * <Tooltip label="Copiar" openOn="longPress">{t => <Button {...t} onPress={copiar}>Copiar</Button>}</Tooltip>
 */
export type EATooltipProps = ViewProps & EADefaultProps & {
    /** Texto (o contenido) de la burbuja */
    label: React.ReactNode;
    /** Lo que abre el tooltip. Un elemento se envuelve en un Pressable; con una función, la conectas tú (TooltipTriggerProps) */
    children: React.ReactNode | ((props: TooltipTriggerProps) => React.ReactNode);
    /** Lado preferido; si no cabe y en el otro hay más sitio, se coloca en el otro. Por defecto 'top' */
    placement?: 'top' | 'bottom';
    /** Cómo se abre con un elemento como children: 'press' (tocar, por defecto) o 'longPress' (mantener pulsado) */
    openOn?: 'press' | 'longPress';
    /** Se cierra solo tras estos ms (0: no se cierra solo). Por defecto 3000 */
    duration?: number;
    /** Abierto (controlado; con onOpenChange) */
    isOpen?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    /** Flecha que apunta al trigger. Por defecto true */
    hasArrow?: boolean;
    /** No se abre */
    disabled?: boolean;
    /** Estilo del texto de la burbuja (si label es un texto) */
    _text?: EATextProps;
    /** Estilo del contenedor del trigger */
    _trigger?: EADefaultProps & ViewProps;
    _ios?: Omit<EATooltipProps, '_ios' | '_android' | '_web'>;
    _android?: Omit<EATooltipProps, '_ios' | '_android' | '_web'>;
    _web?: Omit<EATooltipProps, '_ios' | '_android' | '_web'>;
    variant?: (string & {});
};

type Layout = { x: number; y: number; width: number; height: number };

// Separación con el trigger, margen con los bordes de la pantalla y tamaño de la flecha
const GAP = 6;
const EDGE = 8;
const ARROW = 6;

const TOOLTIP_DEFAULTS: Partial<EATooltipProps> = {
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

/* ---------------- Burbuja (solo montada abierta) ---------------- */

type BubbleProps = {
    trigger: Layout;
    placement: 'top' | 'bottom';
    hasArrow: boolean;
    style: ViewStyle;
    animation: Animated.Value;
    onReady: () => void;
    children: React.ReactNode;
};

function Bubble({ trigger, placement, hasArrow, style, animation, onReady, children }: BubbleProps) {
    const window = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const [size, setSize] = useState({ w: 0, h: 0 });
    const sized = size.w > 0;

    const needed = size.h + GAP + (hasArrow ? ARROW : 0);
    const spaceAbove = trigger.y - insets.top - EDGE;
    const spaceBelow = window.height - insets.bottom - EDGE - (trigger.y + trigger.height);
    const side = placement === 'top'
        ? (spaceAbove < needed && spaceBelow > spaceAbove ? 'bottom' : 'top')
        : (spaceBelow < needed && spaceAbove > spaceBelow ? 'top' : 'bottom');
    // Centrada en el trigger, sin salirse de la pantalla
    const center = trigger.x + trigger.width / 2;
    const left = Math.min(Math.max(center - size.w / 2, EDGE), Math.max(window.width - size.w - EDGE, EDGE));
    const offset = GAP + (hasArrow ? ARROW : 0);
    const position: ViewStyle = !sized
        // Primero se mide oculta en la esquina (con todo el ancho, para no partir el texto antes de tiempo)
        ? { left: 0, top: 0 }
        : side === 'top'
            ? { left, bottom: window.height - trigger.y + offset }
            : { left, top: trigger.y + trigger.height + offset };
    // La flecha apunta al centro del trigger aunque la burbuja se haya desplazado para caber
    const arrowLeft = Math.min(Math.max(center - left - ARROW, 6), Math.max(size.w - ARROW * 2 - 6, 6));
    const bg = (style.backgroundColor as string) ?? '#000';

    useEffect(() => { if (sized) onReady() }, [sized]);

    return (
        <Animated.View
            accessibilityRole="text"
            pointerEvents="none"
            onLayout={e => {
                const { width: w, height: h } = e.nativeEvent.layout;
                if (Math.round(w) !== Math.round(size.w) || Math.round(h) !== Math.round(size.h)) setSize({ w, h });
            }}
            style={[
                style,
                {
                    position: 'absolute',
                    ...position,
                    maxWidth: Math.min(Number(style.maxWidth) || Infinity, window.width - EDGE * 2),
                    opacity: sized ? animation : 0,
                    transform: [{ translateY: animation.interpolate({ inputRange: [0, 1], outputRange: [side === 'top' ? 4 : -4, 0] }) }],
                },
            ]}
        >
            {children}
            {hasArrow && sized && (
                <View
                    style={{
                        position: 'absolute',
                        left: arrowLeft,
                        width: 0,
                        height: 0,
                        borderLeftWidth: ARROW,
                        borderRightWidth: ARROW,
                        borderLeftColor: 'transparent',
                        borderRightColor: 'transparent',
                        ...(side === 'top'
                            ? { top: '100%', borderTopWidth: ARROW, borderTopColor: bg }
                            : { bottom: '100%', borderBottomWidth: ARROW, borderBottomColor: bg }),
                    }}
                />
            )}
        </Animated.View>
    );
}

/* ---------------- Tooltip ---------------- */

/**
 * Burbuja con un texto corto junto a un elemento (un icono de información, un botón con solo icono…). Se abre al
 * tocarlo (o al mantenerlo pulsado con openOn="longPress"), se cierra sola tras `duration`, al tocar en cualquier
 * sitio o con el botón atrás. Se pinta en un Portal, encima de todo, sin salirse de la pantalla
 */
export const Tooltip = forwardRef<TooltipRef, EATooltipProps>((rawProps, ref) => {
    // Defaults → theme.components.Tooltip → variante → props → plataforma
    const [{
        label, children, placement, openOn, duration, isOpen: controlled, defaultOpen, onOpenChange, hasArrow, disabled,
        _text, _trigger, style, variant: _variant, ...props
    }, theme] = useThemeProps<EATooltipProps>('Tooltip', rawProps, { defaults: TOOLTIP_DEFAULTS });

    const [internal, setInternal] = useState(!!defaultOpen);
    const open = controlled ?? internal;
    // Montada mientras está abierta o animando el cierre
    const [mounted, setMounted] = useState(open);
    const [layout, setLayout] = useState<Layout | null>(null);
    const animation = useRef(new Animated.Value(0)).current;
    const triggerRef = useRef<View>(null);
    const openRef = useRef(open);
    openRef.current = open;
    const onChangeRef = useRef(onOpenChange);
    onChangeRef.current = onOpenChange;
    const layoutRef = useRef(layout);
    layoutRef.current = layout;

    const setOpen = useCallback((v: boolean) => {
        if (v === openRef.current) return;
        if (controlled === undefined) setInternal(v);
        onChangeRef.current?.(v);
    }, [controlled]);

    // Mide el trigger con measure (pageX/pageY): la misma referencia que el Portal también en Android edge-to-edge
    const measure = () => {
        const node: any = triggerRef.current;
        if (!node?.measure) return setLayout({ x: 0, y: 0, width: 0, height: 0 });
        node.measure((_x: number, _y: number, width: number, height: number, pageX: number, pageY: number) =>
            setLayout({ x: pageX, y: pageY, width, height }));
    };

    useEffect(() => {
        if (open) {
            setLayout(null);
            setMounted(true);
            measure();
            return;
        }
        Animated.timing(animation, { toValue: 0, duration: 100, useNativeDriver: true })
            .start(({ finished }) => { if (finished && !openRef.current) setMounted(false) });
    }, [open]);

    // Se cierra solo tras `duration`
    useEffect(() => {
        if (!open || !duration) return;
        const timer = setTimeout(() => setOpen(false), duration);
        return () => clearTimeout(timer);
    }, [open, duration]);

    // Un toque en cualquier sitio lo cierra (los del trigger no: el trigger ya lo alterna)
    useEffect(() => {
        if (!open) return;
        return addTapListener(({ pageX, pageY }) => {
            const l = layoutRef.current;
            const inTrigger = l && pageX >= l.x && pageX <= l.x + l.width && pageY >= l.y && pageY <= l.y + l.height;
            if (!inTrigger) setOpen(false);
        });
    }, [open]);

    // Botón atrás de Android: lo cierra si está abierto
    useEffect(() => {
        if (!open) return;
        const sub = BackHandler.addEventListener('hardwareBackPress', () => {
            if (!openRef.current) return false;
            setOpen(false);
            return true;
        });
        return () => sub.remove();
    }, [open]);

    const show = useCallback(() => { if (!disabled) setOpen(true) }, [disabled, setOpen]);
    const hide = useCallback(() => setOpen(false), [setOpen]);
    const toggle = useCallback(() => (openRef.current ? hide() : show()), [show, hide]);
    useImperativeHandle(ref, () => ({ open: show, close: hide, toggle, isOpen: () => openRef.current }), [show, hide, toggle]);

    const bubbleStyle = StyleSheet.flatten<ViewStyle>([style, ...DEFAULT_PROPS(props, theme)]);
    const triggerProps: TooltipTriggerProps = { onPress: toggle, onLongPress: show, open: show, close: hide, isOpen: open };
    const label_ = typeof label === 'string' || typeof label === 'number'
        ? <Text color="background" fontSize={13} {..._text}>{label}</Text>
        : label;

    return (
        <>
            <View ref={triggerRef} collapsable={false} style={StyleSheet.flatten(DEFAULT_PROPS(_trigger || {}, theme))}>
                {typeof children === 'function'
                    ? children(triggerProps)
                    : (
                        <Pressable
                            accessibilityHint={typeof label === 'string' ? label : libT('tooltipHint')}
                            {...(openOn === 'longPress' ? { onLongPress: show } : { onPress: toggle })}
                        >
                            {children}
                        </Pressable>
                    )}
            </View>
            {mounted && (
                <Portal>
                    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
                        {layout && (
                            <Bubble
                                trigger={layout}
                                placement={placement ?? 'top'}
                                hasArrow={hasArrow !== false}
                                style={bubbleStyle}
                                animation={animation}
                                onReady={() => {
                                    if (openRef.current) Animated.timing(animation, { toValue: 1, duration: 120, useNativeDriver: true }).start();
                                }}
                            >
                                {label_}
                            </Bubble>
                        )}
                    </View>
                </Portal>
            )}
        </>
    );
});
Tooltip.displayName = 'Tooltip';
