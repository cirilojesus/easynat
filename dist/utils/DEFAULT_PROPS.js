import { calcSize } from "./helpers";
export const DEFAULT_PROPS = (props, theme) => {
    const { 
    // spacing
    p, m, px, py, pt, pb, pl, pr, mx, my, mt, mb, ml, mr, 
    // colors & radius
    bg, rounded, roundedTop, roundedBottom, roundedLeft, roundedRight, roundedX, roundedY, 
    // border
    borderWidth, borderColor, borderTopWidth, borderBottomWidth, borderLeftWidth, borderRightWidth, borderTopColor, borderBottomColor, borderLeftColor, borderRightColor, borderXWidth, borderYWidth, borderXColor, borderYColor, 
    // shadows & misc
    shadow, flexDir, opacity, pointerEvents, 
    // size
    w, h, maxW, maxH, minW, minH, ...others } = props;
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
        bg && { backgroundColor: theme.colors?.[bg] || bg },
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
        borderColor && { borderColor: theme.colors?.[borderColor] || borderColor },
        borderTopWidth !== undefined && { borderTopWidth },
        borderBottomWidth !== undefined && { borderBottomWidth },
        borderLeftWidth !== undefined && { borderLeftWidth },
        borderRightWidth !== undefined && { borderRightWidth },
        borderTopColor && { borderTopColor: theme.colors?.[borderTopColor] || borderTopColor },
        borderBottomColor && { borderBottomColor: theme.colors?.[borderBottomColor] || borderBottomColor },
        borderLeftColor && { borderLeftColor: theme.colors?.[borderLeftColor] || borderLeftColor },
        borderRightColor && { borderRightColor: theme.colors?.[borderRightColor] || borderRightColor },
        borderXWidth !== undefined && { borderLeftWidth: borderXWidth, borderRightWidth: borderXWidth },
        borderYWidth !== undefined && { borderTopWidth: borderYWidth, borderBottomWidth: borderYWidth },
        borderXColor && {
            borderLeftColor: theme.colors?.[borderXColor] || borderXColor,
            borderRightColor: theme.colors?.[borderXColor] || borderXColor
        },
        borderYColor && {
            borderTopColor: theme.colors?.[borderYColor] || borderYColor,
            borderBottomColor: theme.colors?.[borderYColor] || borderYColor
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
        others
    ];
};
