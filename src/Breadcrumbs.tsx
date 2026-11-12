import React, { useState } from "react";
import { ScrollView, StyleSheet, View, ViewProps, ViewStyle } from "react-native";
import { EADefaultProps, DEFAULT_PROPS } from "./utils/DEFAULT_PROPS";
import { useThemeProps } from "./utils/useThemeProps";
import { libT } from "./utils/translate";
import { Pressable, EAPressableProps } from "./Pressable";
import { Text, EATextProps } from "./Text";
import { Icon } from "./Icon";

/* ---------------- Tipos ---------------- */

export type BreadcrumbItem = {
    label: React.ReactNode;
    /** Al tocarlo (sin onPress no se puede pulsar). El último es la página actual y nunca se pulsa */
    onPress?: () => void;
    /** Icono delante del texto (p. ej. una casa en el primero) */
    icon?: React.ReactElement;
    /** Clave para la lista (por defecto, su posición) */
    key?: string | number;
    disabled?: boolean;
};

/**
 * Ruta de navegación: "Inicio › Productos › Zapatillas". El último es la página actual (resaltado y sin pulsar).
 * Las props de estilo van a la fila.
 * @example
 * <Breadcrumbs items={[
 *     { label: 'Inicio', icon: <Icon name="home" size={14} />, onPress: () => nav.navigate('Home') },
 *     { label: 'Productos', onPress: () => nav.navigate('Products') },
 *     { label: 'Zapatillas' },
 * ]} />
 */
export type EABreadcrumbsProps = ViewProps & EADefaultProps & {
    items: BreadcrumbItem[];
    /** Separador: un texto ("/", "›") o un elemento. Por defecto, un icono chevron */
    separator?: React.ReactNode;
    /**
     * Máximo de elementos visibles: si hay más, se muestran el primero y los últimos con "…" en medio (al tocarlo se
     * despliegan todos). Por defecto, todos
     */
    maxItems?: number;
    /** true: una sola línea con scroll horizontal (empezando por el final). Por defecto false: salta de línea si no cabe */
    scrollable?: boolean;
    /** Estilo de cada elemento pulsable */
    _item?: EAPressableProps;
    /** Estilo del texto de los elementos */
    _text?: EATextProps;
    /** Estilo del texto del elemento actual (el último) */
    _current?: EATextProps;
    /** Estilo del separador (si es un texto) */
    _separator?: EATextProps;
    _ios?: Omit<EABreadcrumbsProps, '_ios' | '_android' | '_web'>;
    _android?: Omit<EABreadcrumbsProps, '_ios' | '_android' | '_web'>;
    _web?: Omit<EABreadcrumbsProps, '_ios' | '_android' | '_web'>;
    variant?: (string & {});
};

// Lo que se pinta: los items o el "…" de los que se ocultan
type Entry = { kind: 'item'; item: BreadcrumbItem; index: number } | { kind: 'ellipsis' };

/** Ruta de navegación con el último elemento como página actual */
export const Breadcrumbs: React.FC<EABreadcrumbsProps> = (rawProps) => {
    // Defaults → theme.components.Breadcrumbs → variante → props → plataforma
    const [{
        items = [], separator, maxItems, scrollable, _item, _text, _current, _separator, style, variant: _variant, ...props
    }, theme] = useThemeProps<EABreadcrumbsProps>('Breadcrumbs', rawProps);
    const [expanded, setExpanded] = useState(false);

    const last = items.length - 1;
    // Con maxItems: el primero, "…" y los últimos (maxItems - 1)
    const collapse = !expanded && maxItems != null && maxItems >= 2 && items.length > maxItems;
    const entries: Entry[] = collapse
        ? [
            { kind: 'item', item: items[0], index: 0 },
            { kind: 'ellipsis' },
            ...items.slice(items.length - (maxItems! - 1)).map((item, i) => ({ kind: 'item' as const, item, index: items.length - (maxItems! - 1) + i })),
        ]
        : items.map((item, index) => ({ kind: 'item' as const, item, index }));

    const sep = separator === undefined
        ? <Icon name="chevron-right" as="Feather" size={14} color="text.subtle" />
        : typeof separator === 'string' || typeof separator === 'number'
            ? <Text color="text.subtle" fontSize={13} {..._separator}>{separator}</Text>
            : separator;

    const renderEntry = (entry: Entry) => {
        if (entry.kind === 'ellipsis') {
            return (
                <Pressable key="ellipsis" onPress={() => setExpanded(true)} accessibilityRole="button" accessibilityLabel="…" px={1} py={0.5} rounded={1} {..._item}>
                    <Text color="text.muted" fontSize={13} {..._text}>…</Text>
                </Pressable>
            );
        }
        const { item, index } = entry;
        const current = index === last;
        const content = (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                {item.icon}
                {typeof item.label === 'string' || typeof item.label === 'number'
                    ? current
                        ? <Text color="text" fontSize={13} fontWeight="600" numberOfLines={1} {..._text} {..._current}>{item.label}</Text>
                        : <Text color={item.onPress ? 'primary.100' : 'text.muted'} fontSize={13} numberOfLines={1} {..._text}>{item.label}</Text>
                    : item.label}
            </View>
        );
        return (
            <React.Fragment key={item.key ?? index}>
                {current || !item.onPress
                    ? <View accessibilityRole="text" style={{ paddingHorizontal: 4, paddingVertical: 2 }}>{content}</View>
                    : (
                        <Pressable onPress={item.onPress} disabled={item.disabled} accessibilityRole="link" px={1} py={0.5} rounded={1}
                            _pressed={{ opacity: 0.6 }} {..._item}>
                            {content}
                        </Pressable>
                    )}
            </React.Fragment>
        );
    };

    const children = entries.flatMap((entry, i) => i === 0
        ? [renderEntry(entry)]
        : [<View key={'sep' + i} style={{ marginHorizontal: 2 }}>{sep}</View>, renderEntry(entry)]);

    const rowStyle = StyleSheet.flatten<ViewStyle>([
        { flexDirection: 'row', alignItems: 'center', flexWrap: scrollable ? 'nowrap' : 'wrap' },
        style,
        ...DEFAULT_PROPS(props, theme),
    ]);

    if (scrollable) {
        // Una línea con scroll, empezando por el final (la página actual a la vista)
        let scroll: ScrollView | null = null;
        return (
            <ScrollView
                {...props}
                horizontal
                showsHorizontalScrollIndicator={false}
                accessibilityLabel={libT('breadcrumbs')}
                ref={r => { scroll = r }}
                onContentSizeChange={() => scroll?.scrollToEnd?.({ animated: false })}
                contentContainerStyle={rowStyle}
            >
                {children}
            </ScrollView>
        );
    }
    return <View accessibilityLabel={libT('breadcrumbs')} {...props} style={rowStyle}>{children}</View>;
};
