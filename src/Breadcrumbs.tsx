import React, { useState } from "react";
import { ScrollView, StyleSheet, View, ViewProps, ViewStyle } from "react-native";
import Svg, { Polygon } from "react-native-svg";
import { EADefaultProps, DEFAULT_PROPS } from "./utils/DEFAULT_PROPS";
import { useThemeProps } from "./utils/useThemeProps";
import { libT } from "./utils/translate";
import { Pressable, EAPressableProps } from "./Pressable";
import { Text, EATextProps } from "./Text";
import { Icon } from "./Icon";
import { Menu, EAMenuProps } from "./Menu";
import { COLOR_SCHEME } from "./theme";

/* ---------------- Tipos ---------------- */

/** Una opción del desplegable de un elemento */
export type BreadcrumbOption = {
    label: string | number;
    onPress?: () => void;
    icon?: React.ReactElement;
    /** Marcada (p. ej. la opción en la que estás) */
    selected?: boolean;
    disabled?: boolean;
    key?: string | number;
};

export type BreadcrumbItem = {
    label: React.ReactNode;
    /** Al tocarlo (sin onPress ni options no se puede pulsar). El último es la página actual y no navega */
    onPress?: () => void;
    /** Icono delante del texto (p. ej. una casa en el primero) */
    icon?: React.ReactElement;
    /** Desplegable al tocarlo (p. ej. elegir otra carpeta o proyecto del mismo nivel). Lleva un chevron */
    options?: BreadcrumbOption[];
    /** Color de este elemento en variant="chips" / "arrows" (por defecto el colorScheme de Breadcrumbs) */
    colorScheme?: COLOR_SCHEME;
    /** Clave para la lista (por defecto, su posición) */
    key?: string | number;
    disabled?: boolean;
};

export type BreadcrumbsVariant = 'text' | 'underline' | 'chips' | 'arrows';

/**
 * Ruta de navegación: "Inicio › Productos › Zapatillas". El último es la página actual (resaltado y sin navegar).
 * Las props de estilo van a la fila.
 * @example
 * <Breadcrumbs items={[
 *     { label: 'Inicio', icon: <Icon as="Feather" name="home" size={14} />, onPress: () => nav.navigate('Home') },
 *     { label: 'Proyectos', options: proyectos.map(p => ({ label: p.nombre, onPress: () => abrir(p) })) },
 *     { label: 'Zapatillas' },
 * ]} />
 */
export type EABreadcrumbsProps = Omit<ViewProps, 'children'> & EADefaultProps & {
    items: BreadcrumbItem[];
    /**
     * Estilo: 'text' (por defecto, enlaces de color), 'underline' (enlaces subrayados), 'chips' (cada elemento en una
     * etiqueta de color) o 'arrows' (barra de flechas encadenadas, tipo pasos de un proceso)
     */
    variant?: BreadcrumbsVariant | (string & {});
    /** Color de los enlaces, chips y flechas. Por defecto 'primary' */
    colorScheme?: COLOR_SCHEME;
    /** Separador: 'chevron' (por defecto), 'slash', un texto ("›", "/") o un elemento. En 'arrows' no se usa */
    separator?: 'chevron' | 'slash' | React.ReactNode;
    /**
     * Máximo de elementos visibles: si hay más, se ven el primero, "…" y los últimos. Al tocar "…" se abre un menú
     * con los que faltan. Por defecto, todos
     */
    maxItems?: number;
    /** true: una sola línea con scroll horizontal (empezando por el final). Por defecto false: salta de línea */
    scrollable?: boolean;
    /** Delante de la ruta (p. ej. botones atrás / adelante) */
    startContent?: React.ReactNode;
    /** Detrás de la ruta */
    endContent?: React.ReactNode;
    /** Estilo de cada elemento pulsable */
    _item?: EAPressableProps;
    /** Estilo del texto de los elementos */
    _text?: EATextProps;
    /** Estilo del texto del elemento actual (el último) */
    _current?: EATextProps;
    /** Estilo del separador (si es un texto) */
    _separator?: EATextProps;
    /** Props de los menús desplegables (del "…" y de los elementos con options) */
    _menu?: Partial<EAMenuProps>;
    _ios?: Omit<EABreadcrumbsProps, '_ios' | '_android' | '_web'>;
    _android?: Omit<EABreadcrumbsProps, '_ios' | '_android' | '_web'>;
    _web?: Omit<EABreadcrumbsProps, '_ios' | '_android' | '_web'>;
};

// Lo que se pinta: un elemento o el "…" con los que se ocultan
type Hidden = { item: BreadcrumbItem; index: number };
type Entry = { kind: 'item'; item: BreadcrumbItem; index: number } | { kind: 'ellipsis'; hidden: Hidden[] };

// Punta de las flechas (variant="arrows")
const TIP = 12;

/** Tramo de la barra de flechas: el fondo es un polígono con muesca a la izquierda (salvo el primero) y punta a la derecha */
const ArrowSegment = ({ color, first, children }: { color: string; first: boolean; children: React.ReactNode }) => {
    const [size, setSize] = useState({ w: 0, h: 0 });
    const { w, h } = size;
    const points = first
        ? `0,0 ${w - TIP},0 ${w},${h / 2} ${w - TIP},${h} 0,${h}`
        : `0,0 ${w - TIP},0 ${w},${h / 2} ${w - TIP},${h} 0,${h} ${TIP},${h / 2}`;
    return (
        <View
            style={{ flexShrink: 1, minWidth: 0, marginLeft: first ? 0 : -TIP + 3, paddingLeft: first ? 12 : TIP + 8, paddingRight: TIP + 8, paddingVertical: 8, justifyContent: 'center' }}
            onLayout={e => {
                const { width, height } = e.nativeEvent.layout;
                if (Math.round(width) !== Math.round(w) || Math.round(height) !== Math.round(h)) setSize({ w: width, h: height });
            }}
        >
            {w > 0 && (
                <Svg width={w} height={h} style={StyleSheet.absoluteFill} pointerEvents="none">
                    <Polygon points={points} fill={color} />
                </Svg>
            )}
            {children}
        </View>
    );
};

const textOf = (label: React.ReactNode, fallback: string | number) =>
    typeof label === 'string' || typeof label === 'number' ? label : fallback;

/** Ruta de navegación con el último elemento como página actual */
export const Breadcrumbs: React.FC<EABreadcrumbsProps> = (rawProps) => {
    // Defaults → theme.components.Breadcrumbs → variante → props → plataforma
    const [{
        items = [], variant = 'text', colorScheme = 'primary', separator = 'chevron', maxItems, scrollable,
        startContent, endContent, _item, _text, _current, _separator, _menu, style, ...props
    }, theme] = useThemeProps<EABreadcrumbsProps>('Breadcrumbs', rawProps);
    const color = (scheme: COLOR_SCHEME | undefined, tone: '50' | '100' | '200'): string =>
        theme.colors?.[`${scheme ?? colorScheme}.${tone}`] ?? theme.colors?.[`primary.${tone}`] ?? '#4F46E5';

    const last = items.length - 1;
    // Con maxItems: el primero, "…" (con los ocultos) y los últimos (maxItems - 1)
    const collapse = maxItems != null && maxItems >= 2 && items.length > maxItems;
    const tail = collapse ? items.length - (maxItems! - 1) : 1;
    const entries: Entry[] = collapse
        ? [
            { kind: 'item', item: items[0], index: 0 },
            { kind: 'ellipsis', hidden: items.slice(1, tail).map((item, i) => ({ item, index: i + 1 })) },
            ...items.slice(tail).map((item, i) => ({ kind: 'item' as const, item, index: tail + i })),
        ]
        : items.map((item, index) => ({ kind: 'item' as const, item, index }));

    const sep = separator === 'chevron'
        ? <Icon name="chevron-right" as="Feather" size={14} color="text.subtle" />
        : separator === 'slash' || typeof separator === 'string' || typeof separator === 'number'
            ? <Text color="text.subtle" fontSize={13} {..._separator}>{separator === 'slash' ? '/' : separator}</Text>
            : separator;

    // Texto de un elemento según la variante
    const label = (item: BreadcrumbItem, current: boolean, pressable: boolean) => {
        if (typeof item.label !== 'string' && typeof item.label !== 'number') return item.label;
        const base: EATextProps = { fontSize: 13, numberOfLines: 1 };
        const cur = current ? _current : undefined;
        if (variant === 'arrows') return <Text {...base} color="white" fontWeight={current ? '700' : '500'} {..._text} {...cur}>{item.label}</Text>;
        if (variant === 'chips') return <Text {...base} color={color(item.colorScheme, '200')} fontWeight={current ? '700' : '600'} {..._text} {...cur}>{item.label}</Text>;
        if (current) return <Text {...base} color="text" fontWeight="600" {..._text} {...cur}>{item.label}</Text>;
        return (
            <Text {...base} color={pressable ? color(item.colorScheme, '100') : 'text.muted'}
                textDecorationLine={variant === 'underline' && pressable ? 'underline' : 'none'} {..._text}>
                {item.label}
            </Text>
        );
    };

    // Contenido de un elemento (icono, texto y chevron si tiene desplegable) en su caja según la variante
    const body = (item: BreadcrumbItem, index: number, current: boolean, pressable: boolean, open = false) => {
        const inner = (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, flexShrink: 1 }}>
                {item.icon}
                {label(item, current, pressable)}
                {!!item.options?.length && (
                    <Icon as="Feather" name={open ? 'chevron-up' : 'chevron-down'} size={13}
                        color={variant === 'arrows' ? 'white' : variant === 'chips' ? color(item.colorScheme, '200') : 'text.subtle'} />
                )}
            </View>
        );
        if (variant === 'arrows') {
            return <ArrowSegment first={index === 0} color={color(item.colorScheme, current ? '200' : '100')}>{inner}</ArrowSegment>;
        }
        if (variant === 'chips') {
            return (
                <View style={{ backgroundColor: color(item.colorScheme, '50'), borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 }}>
                    {inner}
                </View>
            );
        }
        return <View style={{ paddingHorizontal: 4, paddingVertical: 2 }}>{inner}</View>;
    };

    // En 'arrows' la barra va en una línea: los tramos encogen y sus textos se acortan con …
    const shrink = variant === 'arrows' ? { flexShrink: 1, minWidth: 0 } : null;

    const menuItems = (opts: BreadcrumbOption[]) => opts.map((o, i) => (
        <Menu.Item key={o.key ?? i} label={o.label} icon={o.icon as any} disabled={o.disabled} onPress={o.onPress}
            _text={o.selected ? { color: 'primary.100', fontWeight: '600' } : { color: 'text' }} />
    ));

    const renderEntry = (entry: Entry) => {
        if (entry.kind === 'ellipsis') {
            // "…": menú con los elementos ocultos
            return (
                <Menu key="ellipsis" {..._menu} _trigger={{ ...shrink, ..._menu?._trigger }} trigger={t => (
                    <Pressable onPress={t.onPress} accessibilityRole="button" accessibilityLabel="…" rounded={1} style={shrink}
                        _pressed={{ opacity: 0.6 }} {..._item}>
                        {variant === 'arrows'
                            ? <ArrowSegment first={false} color={color(undefined, '100')}><Text color="white" fontWeight="700">…</Text></ArrowSegment>
                            : <View style={{ paddingHorizontal: 4, paddingVertical: 2 }}><Icon as="Feather" name="more-horizontal" size={16} color={color(undefined, '100')} /></View>}
                    </Pressable>
                )}>
                    {menuItems(entry.hidden.map(({ item, index }) => ({
                        key: item.key ?? index, label: textOf(item.label, index + 1), icon: item.icon, onPress: item.onPress, disabled: item.disabled,
                    })))}
                </Menu>
            );
        }
        const { item, index } = entry;
        const current = index === last;
        const key = item.key ?? index;
        if (item.options?.length) {
            return (
                <Menu key={key} {..._menu} _trigger={{ ...shrink, ..._menu?._trigger }} trigger={t => (
                    <Pressable onPress={t.onPress} disabled={item.disabled} accessibilityRole="button" accessibilityState={{ expanded: t.isOpen }} style={shrink}
                        _pressed={{ opacity: 0.6 }} rounded={1} {..._item}>
                        {body(item, index, current, true, t.isOpen)}
                    </Pressable>
                )}>
                    {menuItems(item.options)}
                </Menu>
            );
        }
        const pressable = !current && !!item.onPress;
        if (!pressable) return <View key={key} accessibilityRole="text" style={shrink}>{body(item, index, current, false)}</View>;
        return (
            <Pressable key={key} onPress={item.onPress} disabled={item.disabled} accessibilityRole="link" rounded={1} style={shrink}
                _pressed={{ opacity: 0.6 }} {..._item}>
                {body(item, index, current, true)}
            </Pressable>
        );
    };

    const children = entries.flatMap((entry, i) => i === 0 || variant === 'arrows'
        ? [renderEntry(entry)]
        : [<View key={'sep' + i} style={{ marginHorizontal: variant === 'chips' ? 4 : 2 }}>{sep}</View>, renderEntry(entry)]);

    const rowStyle = StyleSheet.flatten<ViewStyle>([
        { flexDirection: 'row', alignItems: 'center', flexWrap: scrollable || variant === 'arrows' ? 'nowrap' : 'wrap', rowGap: 4 },
        style,
        ...DEFAULT_PROPS(props, theme),
    ]);

    const route = scrollable
        // Una línea con scroll, empezando por el final (la página actual a la vista)
        ? <EndScroll>{children}</EndScroll>
        : startContent != null || endContent != null
            ? <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', flexShrink: 1, rowGap: 4 }}>{children}</View>
            : children;

    const framed = startContent != null || endContent != null;
    return (
        <View accessibilityLabel={libT('breadcrumbs')} {...props} style={[rowStyle, framed && { flexWrap: 'nowrap', gap: 8 }]}>
            {startContent}
            {route}
            {endContent}
        </View>
    );
};

/** Scroll horizontal que se queda al final (la página actual a la vista) */
const EndScroll = ({ children }: { children: React.ReactNode }) => {
    const ref = React.useRef<ScrollView>(null);
    return (
        <ScrollView
            horizontal
            ref={ref}
            showsHorizontalScrollIndicator={false}
            onContentSizeChange={() => ref.current?.scrollToEnd?.({ animated: false })}
            contentContainerStyle={{ flexDirection: 'row', alignItems: 'center' }}
            style={{ flexShrink: 1 }}
        >
            {children}
        </ScrollView>
    );
};
