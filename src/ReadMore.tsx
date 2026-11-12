import React, { useEffect, useRef, useState } from "react";
import { View, ViewStyle } from "react-native";
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { useThemeProps } from "./utils/useThemeProps";
import { libT } from "./utils/translate";
import { Text, EATextProps } from "./Text";
import { Pressable, EAPressableProps } from "./Pressable";
import { Box, EABoxProps } from "./Box";
import { Icon } from "./Icon";
import { ThemeColor } from "./theme";

/**
 * Contenido recortado con "Leer más" / "Leer menos". El enlace solo sale si el contenido no cabe.
 * - Un texto se recorta a `numberOfLines` líneas; cualquier otro contenido (o con `maxHeight`) a esa altura.
 * - Las props de texto (fontSize, color, variant…) van al texto.
 * @example
 * <ReadMore numberOfLines={3}>{producto.descripcion}</ReadMore>
 * <ReadMore numberOfLines={4} triggerPlacement="inline">{comentario}</ReadMore>
 * <ReadMore maxHeight={160} fade triggerPlacement="overlay" triggerAlign="center"><Articulo /></ReadMore>
 */
export type EAReadMoreProps = Omit<EATextProps, 'numberOfLines' | 'children' | '_ios' | '_android' | '_web'> & {
    children?: React.ReactNode;
    /** Líneas visibles recortado (si children es un texto). Por defecto 3 */
    numberOfLines?: number;
    /** Altura recortada en px (para cualquier contenido; con un texto, se usa en vez de numberOfLines) */
    maxHeight?: number;
    /** Degradado al final del contenido recortado (en vez de los "…") */
    fade?: boolean;
    /** Color del degradado: el del fondo donde está (p. ej. 'surface' dentro de una tarjeta). Por defecto 'background' */
    fadeColor?: ThemeColor;
    /**
     * Dónde va el enlace: 'below' (debajo, por defecto), 'inline' (al final de la última línea: "… Leer más"; solo con
     * texto) u 'overlay' (botón flotante sobre el final del contenido recortado; mejor con fade)
     */
    triggerPlacement?: 'below' | 'inline' | 'overlay';
    /** Alineación del enlace debajo o flotante. Por defecto 'left' ('center' con overlay) */
    triggerAlign?: 'left' | 'center' | 'right';
    /** Chevron junto al texto del enlace (no en inline). Por defecto true */
    showIcon?: boolean;
    /** Texto del enlace para desplegar (por defecto "Leer más" en el idioma actual) */
    readMoreText?: React.ReactNode;
    /** Texto del enlace para recoger (por defecto "Leer menos") */
    readLessText?: React.ReactNode;
    /** Lo que se ve recogido en vez del contenido recortado (p. ej. un resumen) */
    collapsed?: React.ReactNode;
    /** Enlace propio: recibe si está desplegado y cómo alternarlo */
    renderTrigger?: (state: { expanded: boolean; toggle: () => void }) => React.ReactNode;
    /** false: una vez desplegado no se puede recoger. Por defecto true */
    showLess?: boolean;
    /** Empieza desplegado */
    defaultExpanded?: boolean;
    /** Desplegado (controlado; con onToggle) */
    expanded?: boolean;
    onToggle?: (expanded: boolean) => void;
    /** Anima la altura al desplegar y recoger. Por defecto true */
    animated?: boolean;
    /** Duración de la animación en ms. Por defecto 250 */
    duration?: number;
    /** Estilo del texto del enlace */
    _readMore?: EATextProps;
    /** Estilo del botón del enlace (Pressable) */
    _trigger?: EAPressableProps;
    /** Estilo del contenedor de todo */
    _container?: EABoxProps;
    _ios?: Omit<EAReadMoreProps, '_ios' | '_android' | '_web'>;
    _android?: Omit<EAReadMoreProps, '_ios' | '_android' | '_web'>;
    _web?: Omit<EAReadMoreProps, '_ios' | '_android' | '_web'>;
};

type Line = { text?: string; y: number; height: number };

const FADE = 48;
let fadeId = 0;

export const ReadMore: React.FC<EAReadMoreProps> = (rawProps) => {
    // Defaults → theme.components.ReadMore → variante → props → plataforma
    // (variant es del texto: se pasa al Text)
    const [{
        children, numberOfLines = 3, maxHeight, fade, fadeColor = 'background', triggerPlacement = 'below', triggerAlign,
        showIcon = true, readMoreText, readLessText, collapsed, renderTrigger, showLess = true, defaultExpanded,
        expanded: controlled, onToggle, animated = true, duration = 250, _readMore, _trigger, _container, ...textProps
    }, theme] = useThemeProps<EAReadMoreProps>('ReadMore', rawProps);
    const [internal, setInternal] = useState(!!defaultExpanded);
    const expanded = controlled ?? internal;
    const isText = (typeof children === 'string' || typeof children === 'number') && maxHeight == null;
    const inline = triggerPlacement === 'inline' && isText;
    const align = triggerAlign ?? (triggerPlacement === 'overlay' ? 'center' : 'left');
    const fadeGradient = useRef(`readMoreFade${fadeId++}`).current;

    // Medidas: alto entero y recortado (null hasta conocerlos) y, con texto, sus líneas
    const [fullH, setFullH] = useState<number | null>(null);
    const [lines, setLines] = useState<Line[] | null>(null);
    const collapsedH = isText
        ? (lines && lines.length >= numberOfLines ? lines[numberOfLines - 1].y + lines[numberOfLines - 1].height : null)
        : maxHeight ?? null;
    const overflows = collapsed != null || (isText
        ? !!lines && lines.length > numberOfLines
        : fullH != null && collapsedH != null && fullH > collapsedH + 1);

    // Altura animada del contenido recortado. `settled`: recogido y quieto (con texto, entonces lleva los "…")
    // Se anima en el hilo de UI (Reanimated): con Animated y useNativeDriver: false iba a tirones
    const height = useSharedValue(collapsedH ?? 0);
    const heightStyle = useAnimatedStyle(() => ({ height: height.value }));
    // La altura final también en el estado de React: con Fabric, al repintar el componente (p. ej. al cambiar
    // `settled`), React aplica su estilo y, sin height, pisaba la que había puesto Reanimated (salía el texto entero)
    const [target, setTarget] = useState<number | null>(null);
    const [settled, setSettled] = useState(!expanded);
    const first = useRef(true);
    useEffect(() => {
        if (!overflows || fullH == null || collapsedH == null || collapsed != null) return;
        const to = expanded ? fullH : collapsedH;
        if (first.current || !animated) {
            first.current = false;
            height.value = to;
            setTarget(to);
            setSettled(!expanded);
            return;
        }
        if (expanded) setSettled(false);
        const collapsing = !expanded;
        height.value = withTiming(to, { duration, easing: Easing.out(Easing.cubic) }, finished => {
            'worklet';
            if (!finished) return;
            // Al terminar: React ya pinta con la altura final
            runOnJS(setTarget)(to);
            if (collapsing) runOnJS(setSettled)(true);
        });
    }, [expanded, fullH, collapsedH, overflows]);

    const toggle = () => {
        const next = !expanded;
        if (controlled === undefined) setInternal(next);
        onToggle?.(next);
    };

    const moreText = readMoreText ?? libT('readMore');
    const lessText = readLessText ?? libT('readLess');

    // Copia invisible del texto, sin límite de líneas: da sus líneas (con el límite, iOS solo informa de las visibles)
    const measureCopy = isText && (
        <Text
            {...textProps}
            aria-hidden
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            pointerEvents="none"
            style={[textProps.style, { position: 'absolute', left: 0, right: 0, top: 0, opacity: 0 }]}
            onTextLayout={e => {
                const ls = e.nativeEvent.lines as Line[];
                const last = ls[ls.length - 1];
                setLines(prev => prev && prev.length === ls.length && prev[prev.length - 1]?.y === last?.y ? prev : ls);
                if (last) setFullH(last.y + last.height);
            }}
        >
            {children}
        </Text>
    );

    /* ---- Enlace al final de la última línea: "… Leer más" ---- */
    if (inline) {
        const link = (label: React.ReactNode) => (
            <Text color="primary.100" fontWeight="600" {..._readMore} onPress={toggle} accessibilityRole="button">{label}</Text>
        );
        let content: React.ReactNode = children;
        if (overflows && !expanded && lines) {
            // Las primeras líneas enteras y la última recortada para que quepan "… " y el enlace
            const label = typeof moreText === 'string' ? moreText : libT('readMore');
            const start = lines.slice(0, numberOfLines - 1).map(l => l.text ?? '').join('');
            const lastLine = (lines[numberOfLines - 1]?.text ?? '').replace(/\s+$/, '');
            const room = Math.max(lastLine.length - label.length - 4, 0);
            content = <>{start}{lastLine.slice(0, room).replace(/\s+$/, '')}{'… '}{link(label)}</>;
        } else if (overflows && expanded && showLess) {
            content = <>{children}{' '}{link(lessText)}</>;
        }
        return (
            <Box {..._container}>
                {measureCopy}
                <Text {...textProps} numberOfLines={lines ? undefined : numberOfLines}>{content}</Text>
            </Box>
        );
    }

    /* ---- Enlace debajo o flotante ---- */
    const trigger = (floating: boolean) => {
        if (renderTrigger) return renderTrigger({ expanded, toggle });
        const pill = triggerPlacement === 'overlay';
        const color = _readMore?.color ?? (pill ? 'text' : 'primary.100');
        return (
            <Pressable
                onPress={toggle}
                accessibilityRole="button"
                accessibilityState={{ expanded }}
                hitSlop={8}
                flexDir="row"
                alignItems="center"
                gap={4}
                alignSelf={align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start'}
                mt={floating ? 0 : 1}
                _pressed={{ opacity: 0.6 }}
                {...(pill ? { bg: 'surface', borderWidth: 1, borderColor: 'border', rounded: 40, px: 3.5, py: 1.5, shadow: 2 } : null)}
                {..._trigger}
            >
                <Text color="primary.100" fontWeight="600" fontSize={pill ? 13 : textProps.fontSize} {...(pill ? { color: 'text' } : null)} {..._readMore}>
                    {expanded ? lessText : moreText}
                </Text>
                {showIcon && <Icon as="Feather" name={expanded ? 'chevron-up' : 'chevron-down'} size={14} color={color} />}
            </Pressable>
        );
    };

    const content = isText
        // Recogido y quieto sin degradado: con numberOfLines (lleva los "…"). Antes de medir, también
        ? <Text {...textProps} numberOfLines={(!lines || (!expanded && settled && !fade)) ? numberOfLines : undefined}>{children}</Text>
        : <View onLayout={e => { const h = Math.round(e.nativeEvent.layout.height); setFullH(prev => (prev === h ? prev : h)) }}>{children}</View>;

    const measured = overflows && fullH != null && collapsedH != null;
    const clip: any = collapsed != null
        ? null
        : measured
            ? [{ overflow: 'hidden', height: target ?? collapsedH }, heightStyle]
            : !isText && maxHeight != null ? { maxHeight, overflow: 'hidden' } : null;
    const showFade = fade && overflows && collapsed == null && !expanded;
    // Flotante sobre el degradado solo recogido; desplegado va debajo
    const floating = triggerPlacement === 'overlay' && overflows && !expanded;
    const fadeH = Math.min(FADE, collapsedH ?? FADE);
    const fadeHex = theme.colors?.[fadeColor] ?? fadeColor;

    return (
        <Box {..._container}>
            {measureCopy}
            {collapsed != null && !expanded
                ? collapsed
                : (
                    <Animated.View style={clip as any}>
                        {content}
                        {showFade && (
                            <Svg pointerEvents="none" width="100%" height={fadeH} style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}>
                                <Defs>
                                    <LinearGradient id={fadeGradient} x1="0" y1="0" x2="0" y2="1">
                                        <Stop offset="0" stopColor={fadeHex} stopOpacity={0} />
                                        <Stop offset="1" stopColor={fadeHex} stopOpacity={1} />
                                    </LinearGradient>
                                </Defs>
                                <Rect x="0" y="0" width="100%" height={fadeH} fill={`url(#${fadeGradient})`} />
                            </Svg>
                        )}
                        {floating && (
                            <View style={{ position: 'absolute', left: 0, right: 0, bottom: 6, paddingHorizontal: 4 }} pointerEvents="box-none">
                                {trigger(true)}
                            </View>
                        )}
                    </Animated.View>
                )}
            {overflows && !floating && (expanded ? showLess : true) && trigger(false)}
        </Box>
    );
};
