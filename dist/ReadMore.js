"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.ReadMore = void 0;
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const react_native_reanimated_1 = __importStar(require("react-native-reanimated"));
const react_native_svg_1 = __importStar(require("react-native-svg"));
const useThemeProps_1 = require("./utils/useThemeProps");
const translate_1 = require("./utils/translate");
const Text_1 = require("./Text");
const Pressable_1 = require("./Pressable");
const Box_1 = require("./Box");
const Icon_1 = require("./Icon");
const FADE = 48;
let fadeId = 0;
const ReadMore = (rawProps) => {
    var _a, _b, _c, _d;
    // Defaults → theme.components.ReadMore → variante → props → plataforma
    // (variant es del texto: se pasa al Text)
    const [_e, theme] = (0, useThemeProps_1.useThemeProps)('ReadMore', rawProps), { children, numberOfLines = 3, maxHeight, fade, fadeColor = 'background', triggerPlacement = 'below', triggerAlign, showIcon = true, readMoreText, readLessText, collapsed, renderTrigger, showLess = true, defaultExpanded, expanded: controlled, onToggle, animated = true, duration = 250, _readMore, _trigger, _container } = _e, textProps = __rest(_e, ["children", "numberOfLines", "maxHeight", "fade", "fadeColor", "triggerPlacement", "triggerAlign", "showIcon", "readMoreText", "readLessText", "collapsed", "renderTrigger", "showLess", "defaultExpanded", "expanded", "onToggle", "animated", "duration", "_readMore", "_trigger", "_container"]);
    const [internal, setInternal] = (0, react_1.useState)(!!defaultExpanded);
    const expanded = controlled !== null && controlled !== void 0 ? controlled : internal;
    const isText = (typeof children === 'string' || typeof children === 'number') && maxHeight == null;
    const inline = triggerPlacement === 'inline' && isText;
    const align = triggerAlign !== null && triggerAlign !== void 0 ? triggerAlign : (triggerPlacement === 'overlay' ? 'center' : 'left');
    const fadeGradient = (0, react_1.useRef)(`readMoreFade${fadeId++}`).current;
    // Medidas: alto entero y recortado (null hasta conocerlos) y, con texto, sus líneas
    const [fullH, setFullH] = (0, react_1.useState)(null);
    const [lines, setLines] = (0, react_1.useState)(null);
    const collapsedH = isText
        ? (lines && lines.length >= numberOfLines ? lines[numberOfLines - 1].y + lines[numberOfLines - 1].height : null)
        : maxHeight !== null && maxHeight !== void 0 ? maxHeight : null;
    const overflows = collapsed != null || (isText
        ? !!lines && lines.length > numberOfLines
        : fullH != null && collapsedH != null && fullH > collapsedH + 1);
    // Altura animada del contenido recortado. `settled`: recogido y quieto (con texto, entonces lleva los "…")
    // Se anima en el hilo de UI (Reanimated): con Animated y useNativeDriver: false iba a tirones
    const height = (0, react_native_reanimated_1.useSharedValue)(collapsedH !== null && collapsedH !== void 0 ? collapsedH : 0);
    const heightStyle = (0, react_native_reanimated_1.useAnimatedStyle)(() => ({ height: height.value }));
    // La altura final también en el estado de React: con Fabric, al repintar el componente (p. ej. al cambiar
    // `settled`), React aplica su estilo y, sin height, pisaba la que había puesto Reanimated (salía el texto entero)
    const [target, setTarget] = (0, react_1.useState)(null);
    const [settled, setSettled] = (0, react_1.useState)(!expanded);
    const first = (0, react_1.useRef)(true);
    (0, react_1.useEffect)(() => {
        if (!overflows || fullH == null || collapsedH == null || collapsed != null)
            return;
        const to = expanded ? fullH : collapsedH;
        if (first.current || !animated) {
            first.current = false;
            height.value = to;
            setTarget(to);
            setSettled(!expanded);
            return;
        }
        if (expanded)
            setSettled(false);
        const collapsing = !expanded;
        height.value = (0, react_native_reanimated_1.withTiming)(to, { duration, easing: react_native_reanimated_1.Easing.out(react_native_reanimated_1.Easing.cubic) }, finished => {
            'worklet';
            if (!finished)
                return;
            // Al terminar: React ya pinta con la altura final
            (0, react_native_reanimated_1.runOnJS)(setTarget)(to);
            if (collapsing)
                (0, react_native_reanimated_1.runOnJS)(setSettled)(true);
        });
    }, [expanded, fullH, collapsedH, overflows]);
    const toggle = () => {
        const next = !expanded;
        if (controlled === undefined)
            setInternal(next);
        onToggle === null || onToggle === void 0 ? void 0 : onToggle(next);
    };
    const moreText = readMoreText !== null && readMoreText !== void 0 ? readMoreText : (0, translate_1.libT)('readMore');
    const lessText = readLessText !== null && readLessText !== void 0 ? readLessText : (0, translate_1.libT)('readLess');
    // Copia invisible del texto, sin límite de líneas: da sus líneas (con el límite, iOS solo informa de las visibles)
    const measureCopy = isText && (<Text_1.Text {...textProps} aria-hidden accessibilityElementsHidden importantForAccessibility="no-hide-descendants" pointerEvents="none" style={[textProps.style, { position: 'absolute', left: 0, right: 0, top: 0, opacity: 0 }]} onTextLayout={e => {
            const ls = e.nativeEvent.lines;
            const last = ls[ls.length - 1];
            setLines(prev => { var _a; return prev && prev.length === ls.length && ((_a = prev[prev.length - 1]) === null || _a === void 0 ? void 0 : _a.y) === (last === null || last === void 0 ? void 0 : last.y) ? prev : ls; });
            if (last)
                setFullH(last.y + last.height);
        }}>
            {children}
        </Text_1.Text>);
    /* ---- Enlace al final de la última línea: "… Leer más" ---- */
    if (inline) {
        const link = (label) => (<Text_1.Text color="primary.100" fontWeight="600" {..._readMore} onPress={toggle} accessibilityRole="button">{label}</Text_1.Text>);
        let content = children;
        if (overflows && !expanded && lines) {
            // Las primeras líneas enteras y la última recortada para que quepan "… " y el enlace
            const label = typeof moreText === 'string' ? moreText : (0, translate_1.libT)('readMore');
            const start = lines.slice(0, numberOfLines - 1).map(l => { var _a; return (_a = l.text) !== null && _a !== void 0 ? _a : ''; }).join('');
            const lastLine = ((_b = (_a = lines[numberOfLines - 1]) === null || _a === void 0 ? void 0 : _a.text) !== null && _b !== void 0 ? _b : '').replace(/\s+$/, '');
            const room = Math.max(lastLine.length - label.length - 4, 0);
            content = <>{start}{lastLine.slice(0, room).replace(/\s+$/, '')}{'… '}{link(label)}</>;
        }
        else if (overflows && expanded && showLess) {
            content = <>{children}{' '}{link(lessText)}</>;
        }
        return (<Box_1.Box {..._container}>
                {measureCopy}
                <Text_1.Text {...textProps} numberOfLines={lines ? undefined : numberOfLines}>{content}</Text_1.Text>
            </Box_1.Box>);
    }
    /* ---- Enlace debajo o flotante ---- */
    const trigger = (floating) => {
        var _a;
        if (renderTrigger)
            return renderTrigger({ expanded, toggle });
        const pill = triggerPlacement === 'overlay';
        const color = (_a = _readMore === null || _readMore === void 0 ? void 0 : _readMore.color) !== null && _a !== void 0 ? _a : (pill ? 'text' : 'primary.100');
        return (<Pressable_1.Pressable onPress={toggle} accessibilityRole="button" accessibilityState={{ expanded }} hitSlop={8} flexDir="row" alignItems="center" gap={4} alignSelf={align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start'} mt={floating ? 0 : 1} _pressed={{ opacity: 0.6 }} {...(pill ? { bg: 'surface', borderWidth: 1, borderColor: 'border', rounded: 40, px: 3.5, py: 1.5, shadow: 2 } : null)} {..._trigger}>
                <Text_1.Text color="primary.100" fontWeight="600" fontSize={pill ? 13 : textProps.fontSize} {...(pill ? { color: 'text' } : null)} {..._readMore}>
                    {expanded ? lessText : moreText}
                </Text_1.Text>
                {showIcon && <Icon_1.Icon as="Feather" name={expanded ? 'chevron-up' : 'chevron-down'} size={14} color={color}/>}
            </Pressable_1.Pressable>);
    };
    const content = isText
        // Recogido y quieto sin degradado: con numberOfLines (lleva los "…"). Antes de medir, también
        ? <Text_1.Text {...textProps} numberOfLines={(!lines || (!expanded && settled && !fade)) ? numberOfLines : undefined}>{children}</Text_1.Text>
        : <react_native_1.View onLayout={e => { const h = Math.round(e.nativeEvent.layout.height); setFullH(prev => (prev === h ? prev : h)); }}>{children}</react_native_1.View>;
    const measured = overflows && fullH != null && collapsedH != null;
    const clip = collapsed != null
        ? null
        : measured
            ? [{ overflow: 'hidden', height: target !== null && target !== void 0 ? target : collapsedH }, heightStyle]
            : !isText && maxHeight != null ? { maxHeight, overflow: 'hidden' } : null;
    const showFade = fade && overflows && collapsed == null && !expanded;
    // Flotante sobre el degradado solo recogido; desplegado va debajo
    const floating = triggerPlacement === 'overlay' && overflows && !expanded;
    const fadeH = Math.min(FADE, collapsedH !== null && collapsedH !== void 0 ? collapsedH : FADE);
    const fadeHex = (_d = (_c = theme.colors) === null || _c === void 0 ? void 0 : _c[fadeColor]) !== null && _d !== void 0 ? _d : fadeColor;
    return (<Box_1.Box {..._container}>
            {measureCopy}
            {collapsed != null && !expanded
            ? collapsed
            : (<react_native_reanimated_1.default.View style={clip}>
                        {content}
                        {showFade && (<react_native_svg_1.default pointerEvents="none" width="100%" height={fadeH} style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}>
                                <react_native_svg_1.Defs>
                                    <react_native_svg_1.LinearGradient id={fadeGradient} x1="0" y1="0" x2="0" y2="1">
                                        <react_native_svg_1.Stop offset="0" stopColor={fadeHex} stopOpacity={0}/>
                                        <react_native_svg_1.Stop offset="1" stopColor={fadeHex} stopOpacity={1}/>
                                    </react_native_svg_1.LinearGradient>
                                </react_native_svg_1.Defs>
                                <react_native_svg_1.Rect x="0" y="0" width="100%" height={fadeH} fill={`url(#${fadeGradient})`}/>
                            </react_native_svg_1.default>)}
                        {floating && (<react_native_1.View style={{ position: 'absolute', left: 0, right: 0, bottom: 6, paddingHorizontal: 4 }} pointerEvents="box-none">
                                {trigger(true)}
                            </react_native_1.View>)}
                    </react_native_reanimated_1.default.View>)}
            {overflows && !floating && (expanded ? showLess : true) && trigger(false)}
        </Box_1.Box>);
};
exports.ReadMore = ReadMore;
