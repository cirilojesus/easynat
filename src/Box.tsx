import React, { createContext, useContext } from "react";
import { View, ViewProps, StyleSheet } from "react-native";
import { EATextProps } from "./Text";
import { EADefaultProps, DEFAULT_PROPS } from "./utils/DEFAULT_PROPS";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { renderChild } from "./utils/helpers";
import { useThemeProps } from "./utils/useThemeProps";

export type EABoxProps = ViewProps & EADefaultProps & {
    _text?: EATextProps;
    safeArea?: boolean,
    safeAreaTop?: boolean,
    safeAreaBottom?: boolean,
    safeAreaLeft?: boolean,
    safeAreaRight?: boolean,
    _ios?: Omit<EABoxProps, '_ios' | '_android' | '_web'>;
    _android?: Omit<EABoxProps, '_ios' | '_android' | '_web'>;
    _web?: Omit<EABoxProps, '_ios' | '_android' | '_web'>;
    padding?: number;
    paddingTop?: number;
    paddingBottom?: number;
    paddingLeft?: number;
    paddingRight?: number;
    paddingHorizontal?: number;
    paddingVertical?: number;
    variant?: BoxVariant | `${BoxVariant} ${string}` | (string & {});
};

export type BoxVariant =
    | 'card' | 'card_sm' | 'card_flat' | 'card_elevated' | 'card_outline'
    | 'badge' | 'badge_sm' | 'badge_lg' | 'badge_outline' | 'dot'
    | 'row' | 'row_between' | 'column' | 'center' | 'fill' | 'absolute_fill' | 'overlay'
    | 'grid_sm' | 'grid' | 'grid_lg' | 'grid_xl' | 'col_1' | 'col_2' | 'col_3' | 'col_4' | 'col_5' | 'col_6'
    | 'divider' | 'divider_vertical' | 'section' | 'screen' | 'avatar' | 'avatar_sm' | 'avatar_lg'
    | 'chip' | 'surface' | 'footer';

// Variantes propias (theme.components.Box.variants puede ampliarlas o modificarlas). Se combinan con espacios:
// variant="card row". Los números de espaciado (p, m, gap, rounded...) de 0.5 a 6 van en la escala x4 (p: 3 = 12 px);
// el resto (negativos, 10, 40...) en px
const BOX_VARIANTS: Record<BoxVariant, EABoxProps> = {
    // Tarjetas
    card: { borderWidth: 1, borderColor: 'border', p: 4, rounded: 4, bg: 'surface', shadow: 1 },
    card_sm: { borderWidth: 1, borderColor: 'border', p: 3, rounded: 2, bg: 'surface', shadow: 1 },
    card_flat: { borderWidth: 1, borderColor: 'border', p: 4, rounded: 4, bg: 'surface' },
    card_elevated: { p: 4, rounded: 4, bg: 'surface', shadow: 3 },
    card_outline: { borderWidth: 1, borderColor: 'muted.100', p: 4, rounded: 4 },
    surface: { bg: 'surface.50', p: 3, rounded: 3 },
    // Etiquetas
    badge: { rounded: 40, _text: { fontSize: 12 }, px: 2, py: 1, bg: 'light.100', flexDir: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 1 },
    badge_sm: { rounded: 40, _text: { color: 'white', fontSize: 11, fontWeight: '600' }, px: 1.5, py: 0.5, bg: 'primary.100', flexDir: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 0.5 },
    badge_lg: { rounded: 40, _text: { fontSize: 14, fontWeight: '600' }, px: 3, py: 1.5, bg: 'light.100', flexDir: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 1.5 },
    badge_outline: { rounded: 40, _text: { fontSize: 12, color: 'primary.100' }, px: 2, py: 1, borderWidth: 1, borderColor: 'primary.100', flexDir: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 1 },
    chip: { rounded: 40, px: 3, py: 1.5, bg: 'primary.50', _text: { color: 'primary.100', fontWeight: '600' }, flexDir: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 1.5 },
    /** Punto de aviso (p. ej. encima de un icono) */
    dot: { w: 10, h: 10, rounded: 40, bg: 'danger.100', borderWidth: 2, borderColor: 'surface' },
    // Disposición
    row: { flexDir: 'row', alignItems: 'center', gap: 2 },
    row_between: { flexDir: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 2 },
    column: { flexDir: 'column', gap: 2 },
    center: { alignItems: 'center', justifyContent: 'center' },
    fill: { flex: 1 },
    absolute_fill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
    overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, bg: 'black.50', alignItems: 'center', justifyContent: 'center' },
    screen: { flex: 1, bg: 'background' },
    section: { p: 4, gap: 3 },
    footer: { flexDir: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 2, pt: 3, borderTopWidth: 1, borderTopColor: 'light.100' },
    // Rejilla: grid_* por fuera y col_N por dentro (N por fila). La separación la pone la rejilla (ver GRID_GUTTERS) y
    // cada columna toma la mitad como padding a los lados
    grid_sm: { flexDir: 'row', flexWrap: 'wrap' },
    grid: { flexDir: 'row', flexWrap: 'wrap' },
    grid_lg: { flexDir: 'row', flexWrap: 'wrap' },
    grid_xl: { flexDir: 'row', flexWrap: 'wrap' },
    col_1: { w: '100%' },
    col_2: { w: '49.999%' },
    col_3: { w: '33.333%' },
    col_4: { w: '24.999%' },
    col_5: { w: '19.999%' },
    col_6: { w: '16.666%' },
    // Separadores
    divider: { h: StyleSheet.hairlineWidth * 2, bg: 'border', alignSelf: 'stretch' },
    divider_vertical: { w: StyleSheet.hairlineWidth * 2, bg: 'border', alignSelf: 'stretch' },
    // Avatares (círculo con iniciales o una imagen dentro)
    avatar: { w: 40, h: 40, rounded: 40, bg: 'primary.50', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', _text: { color: 'primary.100', fontWeight: '700' } },
    avatar_sm: { w: 28, h: 28, rounded: 40, bg: 'primary.50', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', _text: { color: 'primary.100', fontWeight: '700', fontSize: 12 } },
    avatar_lg: { w: 64, h: 64, rounded: 40, bg: 'primary.50', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', _text: { color: 'primary.100', fontWeight: '700', fontSize: 22 } },
};

/** Separación entre columnas (y entre filas) de cada rejilla, en px: las columnas llevan la mitad a cada lado */
export const GRID_GUTTERS: Record<string, number> = { grid_sm: 4, grid: 8, grid_lg: 12, grid_xl: 16 };
const GridContext = createContext(GRID_GUTTERS.grid);

export const Box: React.FC<EABoxProps> = ({ children, ...props }) => {
    const insets = useSafeAreaInsets();
    // Defaults → theme.components.Box → variante → props → plataforma (safeArea también puede venir de una variante)
    const [{ safeArea, safeAreaTop, safeAreaBottom, safeAreaLeft, safeAreaRight, variant, ...combinedProps }, theme] = useThemeProps<EABoxProps>('Box', props, { variants: BOX_VARIANTS });
    // Rejilla: la separación de la rejilla en la que está (para las col_N) y la suya (si es una grid_*)
    const parentGutter = useContext(GridContext);
    const names = typeof variant === 'string' ? variant.split(/\s+/) : [];
    const gridName = names.find(n => n in GRID_GUTTERS);
    const gutter = gridName ? GRID_GUTTERS[gridName] : undefined;
    const isCol = names.some(n => /^col_\d+$/.test(n));
    // Va antes que los estilos de las props: un mx / px propio sigue mandando
    const gridStyle = {
        ...(gutter != null && { marginHorizontal: -gutter / 2, rowGap: gutter }),
        ...(isCol && { paddingHorizontal: parentGutter / 2 }),
    };
    const styles = DEFAULT_PROPS(combinedProps, theme)

    const baseStyle = StyleSheet.flatten<EABoxProps>([
        gridStyle,
        combinedProps.style,
        ...styles
    ]);

    return (
        <View
            {...combinedProps}
            style={{
                ...baseStyle,
                ...((safeArea || safeAreaTop) && { paddingTop: (baseStyle.paddingTop ?? baseStyle.paddingVertical ?? baseStyle.padding ?? 0) + insets.top }),
                ...((safeArea || safeAreaBottom) && { paddingBottom: (baseStyle.paddingBottom ?? baseStyle.paddingVertical ?? baseStyle.padding ?? 0) + insets.bottom }),
                ...((safeArea || safeAreaLeft) && { paddingLeft: (baseStyle.paddingLeft ?? baseStyle.paddingHorizontal ?? baseStyle.padding ?? 0) + insets.left }),
                ...((safeArea || safeAreaRight) && { paddingRight: (baseStyle.paddingRight ?? baseStyle.paddingHorizontal ?? baseStyle.padding ?? 0) + insets.right }),
            }}
        >
            {gutter != null
                ? <GridContext.Provider value={gutter}>{renderChild(children, combinedProps._text)}</GridContext.Provider>
                : renderChild(children, combinedProps._text)}
        </View>
    );
};
