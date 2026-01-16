import { DimensionValue, FlexStyle } from "react-native";
import { calcSize } from "./helpers";
import { Theme } from "../theme";

export type BSDefaultProps = FlexStyle & {
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
    bg?: keyof Theme['colors'] | `#${string}` | `rgb${string}`;

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
    borderColor?: keyof Theme["colors"] | `#${string}` | `rgb${string}`;
    borderTopWidth?: number;
    borderBottomWidth?: number;
    borderLeftWidth?: number;
    borderRightWidth?: number;
    borderTopColor?: keyof Theme["colors"] | `#${string}` | `rgb${string}`;
    borderBottomColor?: keyof Theme["colors"] | `#${string}` | `rgb${string}`;
    borderLeftColor?: keyof Theme["colors"] | `#${string}` | `rgb${string}`;
    borderRightColor?: keyof Theme["colors"] | `#${string}` | `rgb${string}`;
    borderXWidth?: number;
    borderYWidth?: number;
    borderXColor?: keyof Theme["colors"] | `#${string}` | `rgb${string}`;
    borderYColor?: keyof Theme["colors"] | `#${string}` | `rgb${string}`;

    // Shadows & flex
    shadow?: keyof Theme['shadows'];
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

export const DEFAULT_PROPS = (props: BSDefaultProps, theme: Theme) => {
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
        bg && { backgroundColor: theme.colors?.[bg as keyof Theme["colors"]] || bg },

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
        borderColor && { borderColor: theme.colors?.[borderColor as keyof Theme["colors"]] || borderColor },

        borderTopWidth !== undefined && { borderTopWidth },
        borderBottomWidth !== undefined && { borderBottomWidth },
        borderLeftWidth !== undefined && { borderLeftWidth },
        borderRightWidth !== undefined && { borderRightWidth },

        borderTopColor && { borderTopColor: theme.colors?.[borderTopColor as keyof Theme["colors"]] || borderTopColor },
        borderBottomColor && { borderBottomColor: theme.colors?.[borderBottomColor as keyof Theme["colors"]] || borderBottomColor },
        borderLeftColor && { borderLeftColor: theme.colors?.[borderLeftColor as keyof Theme["colors"]] || borderLeftColor },
        borderRightColor && { borderRightColor: theme.colors?.[borderRightColor as keyof Theme["colors"]] || borderRightColor },

        borderXWidth !== undefined && { borderLeftWidth: borderXWidth, borderRightWidth: borderXWidth },
        borderYWidth !== undefined && { borderTopWidth: borderYWidth, borderBottomWidth: borderYWidth },

        borderXColor && {
            borderLeftColor: theme.colors?.[borderXColor as keyof Theme["colors"]] || borderXColor,
            borderRightColor: theme.colors?.[borderXColor as keyof Theme["colors"]] || borderXColor
        },
        borderYColor && {
            borderTopColor: theme.colors?.[borderYColor as keyof Theme["colors"]] || borderYColor,
            borderBottomColor: theme.colors?.[borderYColor as keyof Theme["colors"]] || borderYColor
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
        gap !== undefined && { gap: calcSize(gap) },
        others
    ];
};
