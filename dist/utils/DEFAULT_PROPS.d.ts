import { DimensionValue, FlexStyle } from "react-native";
import { Theme, ThemeColor, ThemeShadow } from "../theme";
export type EADefaultProps = FlexStyle & {
    p?: DimensionValue;
    m?: DimensionValue;
    px?: DimensionValue;
    py?: DimensionValue;
    pt?: DimensionValue;
    pb?: DimensionValue;
    pl?: DimensionValue;
    pr?: DimensionValue;
    mx?: DimensionValue;
    my?: DimensionValue;
    mt?: DimensionValue;
    mb?: DimensionValue;
    ml?: DimensionValue;
    mr?: DimensionValue;
    bg?: ThemeColor;
    rounded?: DimensionValue;
    roundedTop?: DimensionValue;
    roundedBottom?: DimensionValue;
    roundedLeft?: DimensionValue;
    roundedRight?: DimensionValue;
    roundedX?: DimensionValue;
    roundedY?: DimensionValue;
    borderWidth?: number;
    borderColor?: ThemeColor;
    borderTopWidth?: number;
    borderBottomWidth?: number;
    borderLeftWidth?: number;
    borderRightWidth?: number;
    borderTopColor?: ThemeColor;
    borderBottomColor?: ThemeColor;
    borderLeftColor?: ThemeColor;
    borderRightColor?: ThemeColor;
    borderXWidth?: number;
    borderYWidth?: number;
    borderXColor?: ThemeColor;
    borderYColor?: ThemeColor;
    shadow?: ThemeShadow;
    flexDir?: "row" | "column" | "row-reverse" | "column-reverse";
    opacity?: number;
    pointerEvents?: "box-none" | "none" | "box-only" | "auto";
    w?: DimensionValue;
    h?: DimensionValue;
    maxW?: DimensionValue;
    maxH?: DimensionValue;
    minW?: DimensionValue;
    minH?: DimensionValue;
};
/**
 * Las props sin las de estilo (flex, bg, p, w…), para pasarlas a un componente nativo: el estilo ya va en `style`.
 * Sueltas, en la nueva arquitectura (Fabric) una prop como `flex` cuenta como estilo y puede pisar el estilo que
 * pone el propio componente (p. ej. KeyboardAvoidingView pone flex: 0 al salir el teclado y flex={1} lo anulaba)
 */
export declare const withoutStyleProps: <P extends object>(props: P) => P;
export declare const DEFAULT_PROPS: (props: EADefaultProps, theme: Theme) => any[];
