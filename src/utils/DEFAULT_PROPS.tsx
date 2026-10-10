import { DimensionValue, FlexStyle, TextStyle } from "react-native";
import { calcSize } from "./helpers";
import { Theme, ThemeColor, ThemeShadow } from "../theme";

export type EADefaultProps = FlexStyle & {
    // Spacing
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

    // Background
    bg?: ThemeColor;

    // Border radius
    rounded?: DimensionValue;
    roundedTop?: DimensionValue;
    roundedBottom?: DimensionValue;
    roundedLeft?: DimensionValue;
    roundedRight?: DimensionValue;
    roundedX?: DimensionValue;
    roundedY?: DimensionValue;

    // Border
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

    // Shadows & flex
    shadow?: ThemeShadow;
    flexDir?: "row" | "column" | "row-reverse" | "column-reverse";
    opacity?: number;
    pointerEvents?: "box-none" | "none" | "box-only" | "auto";

    // Sizing
    w?: DimensionValue;
    h?: DimensionValue;
    maxW?: DimensionValue;
    maxH?: DimensionValue;
    minW?: DimensionValue;
    minH?: DimensionValue;
};

// Claves de estilo válidas de React Native (View, Text e Image)
const STYLE_KEYS = new Set([
    "alignContent", "alignItems", "alignSelf", "aspectRatio", "backfaceVisibility", "backgroundColor",
    "borderBlockColor", "borderBlockEndColor", "borderBlockStartColor", "borderBottomColor",
    "borderBottomEndRadius", "borderBottomLeftRadius", "borderBottomRightRadius", "borderBottomStartRadius",
    "borderBottomWidth", "borderColor", "borderCurve", "borderEndColor", "borderEndEndRadius",
    "borderEndStartRadius", "borderEndWidth", "borderLeftColor", "borderLeftWidth", "borderRadius",
    "borderRightColor", "borderRightWidth", "borderStartColor", "borderStartEndRadius",
    "borderStartStartRadius", "borderStartWidth", "borderStyle", "borderTopColor", "borderTopEndRadius",
    "borderTopLeftRadius", "borderTopRightRadius", "borderTopStartRadius", "borderTopWidth", "borderWidth",
    "bottom", "boxShadow", "color", "columnGap", "cursor", "direction", "display", "elevation", "end",
    "filter", "flex", "flexBasis", "flexDirection", "flexGrow", "flexShrink", "flexWrap", "fontFamily",
    "fontSize", "fontStyle", "fontVariant", "fontWeight", "gap", "height", "includeFontPadding", "inset",
    "insetBlock", "insetBlockEnd", "insetBlockStart", "insetInline", "insetInlineEnd", "insetInlineStart",
    "isolation", "justifyContent", "left", "letterSpacing", "lineHeight", "margin", "marginBlock",
    "marginBlockEnd", "marginBlockStart", "marginBottom", "marginEnd", "marginHorizontal", "marginInline",
    "marginInlineEnd", "marginInlineStart", "marginLeft", "marginRight", "marginStart", "marginTop",
    "marginVertical", "maxHeight", "maxWidth", "minHeight", "minWidth", "mixBlendMode", "objectFit",
    "opacity", "outlineColor", "outlineOffset", "outlineStyle", "outlineWidth", "overflow", "overlayColor",
    "padding", "paddingBlock", "paddingBlockEnd", "paddingBlockStart", "paddingBottom", "paddingEnd",
    "paddingHorizontal", "paddingInline", "paddingInlineEnd", "paddingInlineStart", "paddingLeft",
    "paddingRight", "paddingStart", "paddingTop", "paddingVertical", "pointerEvents", "position",
    "resizeMode", "right", "rotation", "rowGap", "scaleX", "scaleY", "shadowColor", "shadowOffset",
    "shadowOpacity", "shadowRadius", "start", "textAlign", "textAlignVertical", "textDecorationColor",
    "textDecorationLine", "textDecorationStyle", "textShadowColor", "textShadowOffset", "textShadowRadius",
    "textTransform", "tintColor", "top", "transform", "transformMatrix", "transformOrigin", "translateX",
    "translateY", "userSelect", "verticalAlign", "width", "writingDirection", "zIndex",
]);

export const DEFAULT_PROPS = (props: EADefaultProps, theme: Theme) => {
    const {
        // spacing
        p, m, px, py, pt, pb, pl, pr,
        mx, my, mt, mb, ml, mr,
        // colors & radius
        bg, rounded, roundedTop, roundedBottom,
        roundedLeft, roundedRight, roundedX, roundedY,
        // border
        borderWidth, borderColor,
        borderTopWidth, borderBottomWidth, borderLeftWidth, borderRightWidth,
        borderTopColor, borderBottomColor, borderLeftColor, borderRightColor,
        borderXWidth, borderYWidth, borderXColor, borderYColor,
        // shadows & misc
        shadow, flexDir, opacity, pointerEvents,
        // size
        w, h, maxW, maxH, minW, minH,
        gap,
        ...others
    } = props;

    return [
        // Padding
        p !== undefined && { padding: calcSize(p) },
        px !== undefined && { paddingHorizontal: calcSize(px) },
        py !== undefined && { paddingVertical: calcSize(py) },
        pt !== undefined && { paddingTop: calcSize(pt) },
        pb !== undefined && { paddingBottom: calcSize(pb) },
        pl !== undefined && { paddingLeft: calcSize(pl) },
        pr !== undefined && { paddingRight: calcSize(pr) },

        // Margin
        m !== undefined && { margin: calcSize(m) },
        mx !== undefined && { marginHorizontal: calcSize(mx) },
        my !== undefined && { marginVertical: calcSize(my) },
        mt !== undefined && { marginTop: calcSize(mt) },
        mb !== undefined && { marginBottom: calcSize(mb) },
        ml !== undefined && { marginLeft: calcSize(ml) },
        mr !== undefined && { marginRight: calcSize(mr) },

        // Background
        bg && { backgroundColor: theme.colors?.[bg as ThemeColor] || bg },

        // Border radius
        rounded !== undefined && { borderRadius: calcSize(rounded) },
        roundedTop !== undefined && {
            borderTopLeftRadius: calcSize(roundedTop),
            borderTopRightRadius: calcSize(roundedTop),
        },
        roundedBottom !== undefined && {
            borderBottomLeftRadius: calcSize(roundedBottom),
            borderBottomRightRadius: calcSize(roundedBottom),
        },
        roundedLeft !== undefined && {
            borderTopLeftRadius: calcSize(roundedLeft),
            borderBottomLeftRadius: calcSize(roundedLeft),
        },
        roundedRight !== undefined && {
            borderTopRightRadius: calcSize(roundedRight),
            borderBottomRightRadius: calcSize(roundedRight),
        },
        roundedX !== undefined && {
            borderTopLeftRadius: calcSize(roundedX),
            borderBottomLeftRadius: calcSize(roundedX),
            borderTopRightRadius: calcSize(roundedX),
            borderBottomRightRadius: calcSize(roundedX),
        },
        roundedY !== undefined && {
            borderTopLeftRadius: calcSize(roundedY),
            borderTopRightRadius: calcSize(roundedY),
            borderBottomLeftRadius: calcSize(roundedY),
            borderBottomRightRadius: calcSize(roundedY),
        },

        // Border
        borderWidth !== undefined && { borderWidth },
        borderColor && { borderColor: theme.colors?.[borderColor as ThemeColor] || borderColor },

        borderTopWidth !== undefined && { borderTopWidth },
        borderBottomWidth !== undefined && { borderBottomWidth },
        borderLeftWidth !== undefined && { borderLeftWidth },
        borderRightWidth !== undefined && { borderRightWidth },

        borderTopColor && { borderTopColor: theme.colors?.[borderTopColor as ThemeColor] || borderTopColor },
        borderBottomColor && { borderBottomColor: theme.colors?.[borderBottomColor as ThemeColor] || borderBottomColor },
        borderLeftColor && { borderLeftColor: theme.colors?.[borderLeftColor as ThemeColor] || borderLeftColor },
        borderRightColor && { borderRightColor: theme.colors?.[borderRightColor as ThemeColor] || borderRightColor },

        borderXWidth !== undefined && { borderLeftWidth: borderXWidth, borderRightWidth: borderXWidth },
        borderYWidth !== undefined && { borderTopWidth: borderYWidth, borderBottomWidth: borderYWidth },

        borderXColor && {
            borderLeftColor: theme.colors?.[borderXColor as ThemeColor] || borderXColor,
            borderRightColor: theme.colors?.[borderXColor as ThemeColor] || borderXColor
        },
        borderYColor && {
            borderTopColor: theme.colors?.[borderYColor as ThemeColor] || borderYColor,
            borderBottomColor: theme.colors?.[borderYColor as ThemeColor] || borderYColor
        },

        // Size
        w !== undefined && { width: calcSize(w) },
        h !== undefined && { height: calcSize(h) },
        maxW !== undefined && { maxWidth: calcSize(maxW) },
        maxH !== undefined && { maxHeight: calcSize(maxH) },
        minW !== undefined && { minWidth: calcSize(minW) },
        minH !== undefined && { minHeight: calcSize(minH) },

        // Others
        shadow && theme.shadows[shadow],
        flexDir !== undefined && { flexDirection: flexDir },
        pointerEvents !== undefined && { pointerEvents },
        opacity !== undefined && { opacity },
        gap !== undefined && { gap: calcSize(gap as DimensionValue) },
        // Solo se pasan a style las props que son estilos; el resto (onPress, children...) se ignora
        Object.fromEntries(Object.entries(others).filter(([key]) => STYLE_KEYS.has(key))),
        (others as TextStyle).color && { color: theme.colors?.[(others as TextStyle).color as string] || (others as TextStyle).color },
    ];
};
