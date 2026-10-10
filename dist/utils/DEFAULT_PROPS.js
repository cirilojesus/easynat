"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_PROPS = void 0;
const helpers_1 = require("./helpers");
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
const DEFAULT_PROPS = (props, theme) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
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
    w, h, maxW, maxH, minW, minH, gap } = props, others = __rest(props, ["p", "m", "px", "py", "pt", "pb", "pl", "pr", "mx", "my", "mt", "mb", "ml", "mr", "bg", "rounded", "roundedTop", "roundedBottom", "roundedLeft", "roundedRight", "roundedX", "roundedY", "borderWidth", "borderColor", "borderTopWidth", "borderBottomWidth", "borderLeftWidth", "borderRightWidth", "borderTopColor", "borderBottomColor", "borderLeftColor", "borderRightColor", "borderXWidth", "borderYWidth", "borderXColor", "borderYColor", "shadow", "flexDir", "opacity", "pointerEvents", "w", "h", "maxW", "maxH", "minW", "minH", "gap"]);
    return [
        // Padding
        p !== undefined && { padding: (0, helpers_1.calcSize)(p) },
        px !== undefined && { paddingHorizontal: (0, helpers_1.calcSize)(px) },
        py !== undefined && { paddingVertical: (0, helpers_1.calcSize)(py) },
        pt !== undefined && { paddingTop: (0, helpers_1.calcSize)(pt) },
        pb !== undefined && { paddingBottom: (0, helpers_1.calcSize)(pb) },
        pl !== undefined && { paddingLeft: (0, helpers_1.calcSize)(pl) },
        pr !== undefined && { paddingRight: (0, helpers_1.calcSize)(pr) },
        // Margin
        m !== undefined && { margin: (0, helpers_1.calcSize)(m) },
        mx !== undefined && { marginHorizontal: (0, helpers_1.calcSize)(mx) },
        my !== undefined && { marginVertical: (0, helpers_1.calcSize)(my) },
        mt !== undefined && { marginTop: (0, helpers_1.calcSize)(mt) },
        mb !== undefined && { marginBottom: (0, helpers_1.calcSize)(mb) },
        ml !== undefined && { marginLeft: (0, helpers_1.calcSize)(ml) },
        mr !== undefined && { marginRight: (0, helpers_1.calcSize)(mr) },
        // Background
        bg && { backgroundColor: ((_a = theme.colors) === null || _a === void 0 ? void 0 : _a[bg]) || bg },
        // Border radius
        rounded !== undefined && { borderRadius: (0, helpers_1.calcSize)(rounded) },
        roundedTop !== undefined && {
            borderTopLeftRadius: (0, helpers_1.calcSize)(roundedTop),
            borderTopRightRadius: (0, helpers_1.calcSize)(roundedTop),
        },
        roundedBottom !== undefined && {
            borderBottomLeftRadius: (0, helpers_1.calcSize)(roundedBottom),
            borderBottomRightRadius: (0, helpers_1.calcSize)(roundedBottom),
        },
        roundedLeft !== undefined && {
            borderTopLeftRadius: (0, helpers_1.calcSize)(roundedLeft),
            borderBottomLeftRadius: (0, helpers_1.calcSize)(roundedLeft),
        },
        roundedRight !== undefined && {
            borderTopRightRadius: (0, helpers_1.calcSize)(roundedRight),
            borderBottomRightRadius: (0, helpers_1.calcSize)(roundedRight),
        },
        roundedX !== undefined && {
            borderTopLeftRadius: (0, helpers_1.calcSize)(roundedX),
            borderBottomLeftRadius: (0, helpers_1.calcSize)(roundedX),
            borderTopRightRadius: (0, helpers_1.calcSize)(roundedX),
            borderBottomRightRadius: (0, helpers_1.calcSize)(roundedX),
        },
        roundedY !== undefined && {
            borderTopLeftRadius: (0, helpers_1.calcSize)(roundedY),
            borderTopRightRadius: (0, helpers_1.calcSize)(roundedY),
            borderBottomLeftRadius: (0, helpers_1.calcSize)(roundedY),
            borderBottomRightRadius: (0, helpers_1.calcSize)(roundedY),
        },
        // Border
        borderWidth !== undefined && { borderWidth },
        borderColor && { borderColor: ((_b = theme.colors) === null || _b === void 0 ? void 0 : _b[borderColor]) || borderColor },
        borderTopWidth !== undefined && { borderTopWidth },
        borderBottomWidth !== undefined && { borderBottomWidth },
        borderLeftWidth !== undefined && { borderLeftWidth },
        borderRightWidth !== undefined && { borderRightWidth },
        borderTopColor && { borderTopColor: ((_c = theme.colors) === null || _c === void 0 ? void 0 : _c[borderTopColor]) || borderTopColor },
        borderBottomColor && { borderBottomColor: ((_d = theme.colors) === null || _d === void 0 ? void 0 : _d[borderBottomColor]) || borderBottomColor },
        borderLeftColor && { borderLeftColor: ((_e = theme.colors) === null || _e === void 0 ? void 0 : _e[borderLeftColor]) || borderLeftColor },
        borderRightColor && { borderRightColor: ((_f = theme.colors) === null || _f === void 0 ? void 0 : _f[borderRightColor]) || borderRightColor },
        borderXWidth !== undefined && { borderLeftWidth: borderXWidth, borderRightWidth: borderXWidth },
        borderYWidth !== undefined && { borderTopWidth: borderYWidth, borderBottomWidth: borderYWidth },
        borderXColor && {
            borderLeftColor: ((_g = theme.colors) === null || _g === void 0 ? void 0 : _g[borderXColor]) || borderXColor,
            borderRightColor: ((_h = theme.colors) === null || _h === void 0 ? void 0 : _h[borderXColor]) || borderXColor
        },
        borderYColor && {
            borderTopColor: ((_j = theme.colors) === null || _j === void 0 ? void 0 : _j[borderYColor]) || borderYColor,
            borderBottomColor: ((_k = theme.colors) === null || _k === void 0 ? void 0 : _k[borderYColor]) || borderYColor
        },
        // Size
        w !== undefined && { width: (0, helpers_1.calcSize)(w) },
        h !== undefined && { height: (0, helpers_1.calcSize)(h) },
        maxW !== undefined && { maxWidth: (0, helpers_1.calcSize)(maxW) },
        maxH !== undefined && { maxHeight: (0, helpers_1.calcSize)(maxH) },
        minW !== undefined && { minWidth: (0, helpers_1.calcSize)(minW) },
        minH !== undefined && { minHeight: (0, helpers_1.calcSize)(minH) },
        // Others
        shadow && theme.shadows[shadow],
        flexDir !== undefined && { flexDirection: flexDir },
        pointerEvents !== undefined && { pointerEvents },
        opacity !== undefined && { opacity },
        gap !== undefined && { gap: (0, helpers_1.calcSize)(gap) },
        // Solo se pasan a style las props que son estilos; el resto (onPress, children...) se ignora
        Object.fromEntries(Object.entries(others).filter(([key]) => STYLE_KEYS.has(key))),
        others.color && { color: ((_l = theme.colors) === null || _l === void 0 ? void 0 : _l[others.color]) || others.color },
    ];
};
exports.DEFAULT_PROPS = DEFAULT_PROPS;
