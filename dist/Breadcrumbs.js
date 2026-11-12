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
exports.Breadcrumbs = void 0;
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const react_native_svg_1 = __importStar(require("react-native-svg"));
const DEFAULT_PROPS_1 = require("./utils/DEFAULT_PROPS");
const useThemeProps_1 = require("./utils/useThemeProps");
const translate_1 = require("./utils/translate");
const Pressable_1 = require("./Pressable");
const Text_1 = require("./Text");
const Icon_1 = require("./Icon");
const Menu_1 = require("./Menu");
// Punta de las flechas (variant="arrows")
const TIP = 12;
/** Tramo de la barra de flechas: el fondo es un polígono con muesca a la izquierda (salvo el primero) y punta a la derecha */
const ArrowSegment = ({ color, first, children }) => {
    const [size, setSize] = (0, react_1.useState)({ w: 0, h: 0 });
    const { w, h } = size;
    const points = first
        ? `0,0 ${w - TIP},0 ${w},${h / 2} ${w - TIP},${h} 0,${h}`
        : `0,0 ${w - TIP},0 ${w},${h / 2} ${w - TIP},${h} 0,${h} ${TIP},${h / 2}`;
    return (<react_native_1.View style={{ flexShrink: 1, minWidth: 0, marginLeft: first ? 0 : -TIP + 3, paddingLeft: first ? 12 : TIP + 8, paddingRight: TIP + 8, paddingVertical: 8, justifyContent: 'center' }} onLayout={e => {
            const { width, height } = e.nativeEvent.layout;
            if (Math.round(width) !== Math.round(w) || Math.round(height) !== Math.round(h))
                setSize({ w: width, h: height });
        }}>
            {w > 0 && (<react_native_svg_1.default width={w} height={h} style={react_native_1.StyleSheet.absoluteFill} pointerEvents="none">
                    <react_native_svg_1.Polygon points={points} fill={color}/>
                </react_native_svg_1.default>)}
            {children}
        </react_native_1.View>);
};
const textOf = (label, fallback) => typeof label === 'string' || typeof label === 'number' ? label : fallback;
/** Ruta de navegación con el último elemento como página actual */
const Breadcrumbs = (rawProps) => {
    // Defaults → theme.components.Breadcrumbs → variante → props → plataforma
    const [_a, theme] = (0, useThemeProps_1.useThemeProps)('Breadcrumbs', rawProps), { items = [], variant = 'text', colorScheme = 'primary', separator = 'chevron', maxItems, scrollable, startContent, endContent, _item, _text, _current, _separator, _menu, style } = _a, props = __rest(_a, ["items", "variant", "colorScheme", "separator", "maxItems", "scrollable", "startContent", "endContent", "_item", "_text", "_current", "_separator", "_menu", "style"]);
    const color = (scheme, tone) => { var _a, _b, _c, _d; return (_d = (_b = (_a = theme.colors) === null || _a === void 0 ? void 0 : _a[`${scheme !== null && scheme !== void 0 ? scheme : colorScheme}.${tone}`]) !== null && _b !== void 0 ? _b : (_c = theme.colors) === null || _c === void 0 ? void 0 : _c[`primary.${tone}`]) !== null && _d !== void 0 ? _d : '#4F46E5'; };
    const last = items.length - 1;
    // Con maxItems: el primero, "…" (con los ocultos) y los últimos (maxItems - 1)
    const collapse = maxItems != null && maxItems >= 2 && items.length > maxItems;
    const tail = collapse ? items.length - (maxItems - 1) : 1;
    const entries = collapse
        ? [
            { kind: 'item', item: items[0], index: 0 },
            { kind: 'ellipsis', hidden: items.slice(1, tail).map((item, i) => ({ item, index: i + 1 })) },
            ...items.slice(tail).map((item, i) => ({ kind: 'item', item, index: tail + i })),
        ]
        : items.map((item, index) => ({ kind: 'item', item, index }));
    const sep = separator === 'chevron'
        ? <Icon_1.Icon name="chevron-right" as="Feather" size={14} color="text.subtle"/>
        : separator === 'slash' || typeof separator === 'string' || typeof separator === 'number'
            ? <Text_1.Text color="text.subtle" fontSize={13} {..._separator}>{separator === 'slash' ? '/' : separator}</Text_1.Text>
            : separator;
    // Texto de un elemento según la variante
    const label = (item, current, pressable) => {
        if (typeof item.label !== 'string' && typeof item.label !== 'number')
            return item.label;
        const base = { fontSize: 13, numberOfLines: 1 };
        const cur = current ? _current : undefined;
        if (variant === 'arrows')
            return <Text_1.Text {...base} color="white" fontWeight={current ? '700' : '500'} {..._text} {...cur}>{item.label}</Text_1.Text>;
        if (variant === 'chips')
            return <Text_1.Text {...base} color={color(item.colorScheme, '200')} fontWeight={current ? '700' : '600'} {..._text} {...cur}>{item.label}</Text_1.Text>;
        if (current)
            return <Text_1.Text {...base} color="text" fontWeight="600" {..._text} {...cur}>{item.label}</Text_1.Text>;
        return (<Text_1.Text {...base} color={pressable ? color(item.colorScheme, '100') : 'text.muted'} textDecorationLine={variant === 'underline' && pressable ? 'underline' : 'none'} {..._text}>
                {item.label}
            </Text_1.Text>);
    };
    // Contenido de un elemento (icono, texto y chevron si tiene desplegable) en su caja según la variante
    const body = (item, index, current, pressable, open = false) => {
        var _a;
        const inner = (<react_native_1.View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, flexShrink: 1 }}>
                {item.icon}
                {label(item, current, pressable)}
                {!!((_a = item.options) === null || _a === void 0 ? void 0 : _a.length) && (<Icon_1.Icon as="Feather" name={open ? 'chevron-up' : 'chevron-down'} size={13} color={variant === 'arrows' ? 'white' : variant === 'chips' ? color(item.colorScheme, '200') : 'text.subtle'}/>)}
            </react_native_1.View>);
        if (variant === 'arrows') {
            return <ArrowSegment first={index === 0} color={color(item.colorScheme, current ? '200' : '100')}>{inner}</ArrowSegment>;
        }
        if (variant === 'chips') {
            return (<react_native_1.View style={{ backgroundColor: color(item.colorScheme, '50'), borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 }}>
                    {inner}
                </react_native_1.View>);
        }
        return <react_native_1.View style={{ paddingHorizontal: 4, paddingVertical: 2 }}>{inner}</react_native_1.View>;
    };
    // En 'arrows' la barra va en una línea: los tramos encogen y sus textos se acortan con …
    const shrink = variant === 'arrows' ? { flexShrink: 1, minWidth: 0 } : null;
    const menuItems = (opts) => opts.map((o, i) => {
        var _a;
        return (<Menu_1.Menu.Item key={(_a = o.key) !== null && _a !== void 0 ? _a : i} label={o.label} icon={o.icon} disabled={o.disabled} onPress={o.onPress} _text={o.selected ? { color: 'primary.100', fontWeight: '600' } : { color: 'text' }}/>);
    });
    const renderEntry = (entry) => {
        var _a, _b;
        if (entry.kind === 'ellipsis') {
            // "…": menú con los elementos ocultos
            return (<Menu_1.Menu key="ellipsis" {..._menu} _trigger={Object.assign(Object.assign({}, shrink), _menu === null || _menu === void 0 ? void 0 : _menu._trigger)} trigger={t => (<Pressable_1.Pressable onPress={t.onPress} accessibilityRole="button" accessibilityLabel="…" rounded={1} style={shrink} _pressed={{ opacity: 0.6 }} {..._item}>
                        {variant === 'arrows'
                        ? <ArrowSegment first={false} color={color(undefined, '100')}><Text_1.Text color="white" fontWeight="700">…</Text_1.Text></ArrowSegment>
                        : <react_native_1.View style={{ paddingHorizontal: 4, paddingVertical: 2 }}><Icon_1.Icon as="Feather" name="more-horizontal" size={16} color={color(undefined, '100')}/></react_native_1.View>}
                    </Pressable_1.Pressable>)}>
                    {menuItems(entry.hidden.map(({ item, index }) => {
                    var _a;
                    return ({
                        key: (_a = item.key) !== null && _a !== void 0 ? _a : index, label: textOf(item.label, index + 1), icon: item.icon, onPress: item.onPress, disabled: item.disabled,
                    });
                }))}
                </Menu_1.Menu>);
        }
        const { item, index } = entry;
        const current = index === last;
        const key = (_a = item.key) !== null && _a !== void 0 ? _a : index;
        if ((_b = item.options) === null || _b === void 0 ? void 0 : _b.length) {
            return (<Menu_1.Menu key={key} {..._menu} _trigger={Object.assign(Object.assign({}, shrink), _menu === null || _menu === void 0 ? void 0 : _menu._trigger)} trigger={t => (<Pressable_1.Pressable onPress={t.onPress} disabled={item.disabled} accessibilityRole="button" accessibilityState={{ expanded: t.isOpen }} style={shrink} _pressed={{ opacity: 0.6 }} rounded={1} {..._item}>
                        {body(item, index, current, true, t.isOpen)}
                    </Pressable_1.Pressable>)}>
                    {menuItems(item.options)}
                </Menu_1.Menu>);
        }
        const pressable = !current && !!item.onPress;
        if (!pressable)
            return <react_native_1.View key={key} accessibilityRole="text" style={shrink}>{body(item, index, current, false)}</react_native_1.View>;
        return (<Pressable_1.Pressable key={key} onPress={item.onPress} disabled={item.disabled} accessibilityRole="link" rounded={1} style={shrink} _pressed={{ opacity: 0.6 }} {..._item}>
                {body(item, index, current, true)}
            </Pressable_1.Pressable>);
    };
    const children = entries.flatMap((entry, i) => i === 0 || variant === 'arrows'
        ? [renderEntry(entry)]
        : [<react_native_1.View key={'sep' + i} style={{ marginHorizontal: variant === 'chips' ? 4 : 2 }}>{sep}</react_native_1.View>, renderEntry(entry)]);
    const rowStyle = react_native_1.StyleSheet.flatten([
        { flexDirection: 'row', alignItems: 'center', flexWrap: scrollable || variant === 'arrows' ? 'nowrap' : 'wrap', rowGap: 4 },
        style,
        ...(0, DEFAULT_PROPS_1.DEFAULT_PROPS)(props, theme),
    ]);
    const route = scrollable
        // Una línea con scroll, empezando por el final (la página actual a la vista)
        ? <EndScroll>{children}</EndScroll>
        : startContent != null || endContent != null
            ? <react_native_1.View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', flexShrink: 1, rowGap: 4 }}>{children}</react_native_1.View>
            : children;
    const framed = startContent != null || endContent != null;
    return (<react_native_1.View accessibilityLabel={(0, translate_1.libT)('breadcrumbs')} {...props} style={[rowStyle, framed && { flexWrap: 'nowrap', gap: 8 }]}>
            {startContent}
            {route}
            {endContent}
        </react_native_1.View>);
};
exports.Breadcrumbs = Breadcrumbs;
/** Scroll horizontal que se queda al final (la página actual a la vista) */
const EndScroll = ({ children }) => {
    const ref = react_1.default.useRef(null);
    return (<react_native_1.ScrollView horizontal ref={ref} showsHorizontalScrollIndicator={false} onContentSizeChange={() => { var _a, _b; return (_b = (_a = ref.current) === null || _a === void 0 ? void 0 : _a.scrollToEnd) === null || _b === void 0 ? void 0 : _b.call(_a, { animated: false }); }} contentContainerStyle={{ flexDirection: 'row', alignItems: 'center' }} style={{ flexShrink: 1 }}>
            {children}
        </react_native_1.ScrollView>);
};
