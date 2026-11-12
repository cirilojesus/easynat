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
const DEFAULT_PROPS_1 = require("./utils/DEFAULT_PROPS");
const useThemeProps_1 = require("./utils/useThemeProps");
const translate_1 = require("./utils/translate");
const Pressable_1 = require("./Pressable");
const Text_1 = require("./Text");
const Icon_1 = require("./Icon");
/** Ruta de navegación con el último elemento como página actual */
const Breadcrumbs = (rawProps) => {
    // Defaults → theme.components.Breadcrumbs → variante → props → plataforma
    const [_a, theme] = (0, useThemeProps_1.useThemeProps)('Breadcrumbs', rawProps), { items = [], separator, maxItems, scrollable, _item, _text, _current, _separator, style, variant: _variant } = _a, props = __rest(_a, ["items", "separator", "maxItems", "scrollable", "_item", "_text", "_current", "_separator", "style", "variant"]);
    const [expanded, setExpanded] = (0, react_1.useState)(false);
    const last = items.length - 1;
    // Con maxItems: el primero, "…" y los últimos (maxItems - 1)
    const collapse = !expanded && maxItems != null && maxItems >= 2 && items.length > maxItems;
    const entries = collapse
        ? [
            { kind: 'item', item: items[0], index: 0 },
            { kind: 'ellipsis' },
            ...items.slice(items.length - (maxItems - 1)).map((item, i) => ({ kind: 'item', item, index: items.length - (maxItems - 1) + i })),
        ]
        : items.map((item, index) => ({ kind: 'item', item, index }));
    const sep = separator === undefined
        ? <Icon_1.Icon name="chevron-right" as="Feather" size={14} color="text.subtle"/>
        : typeof separator === 'string' || typeof separator === 'number'
            ? <Text_1.Text color="text.subtle" fontSize={13} {..._separator}>{separator}</Text_1.Text>
            : separator;
    const renderEntry = (entry) => {
        var _a;
        if (entry.kind === 'ellipsis') {
            return (<Pressable_1.Pressable key="ellipsis" onPress={() => setExpanded(true)} accessibilityRole="button" accessibilityLabel="…" px={1} py={0.5} rounded={1} {..._item}>
                    <Text_1.Text color="text.muted" fontSize={13} {..._text}>…</Text_1.Text>
                </Pressable_1.Pressable>);
        }
        const { item, index } = entry;
        const current = index === last;
        const content = (<react_native_1.View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                {item.icon}
                {typeof item.label === 'string' || typeof item.label === 'number'
                ? current
                    ? <Text_1.Text color="text" fontSize={13} fontWeight="600" numberOfLines={1} {..._text} {..._current}>{item.label}</Text_1.Text>
                    : <Text_1.Text color={item.onPress ? 'primary.100' : 'text.muted'} fontSize={13} numberOfLines={1} {..._text}>{item.label}</Text_1.Text>
                : item.label}
            </react_native_1.View>);
        return (<react_1.default.Fragment key={(_a = item.key) !== null && _a !== void 0 ? _a : index}>
                {current || !item.onPress
                ? <react_native_1.View accessibilityRole="text" style={{ paddingHorizontal: 4, paddingVertical: 2 }}>{content}</react_native_1.View>
                : (<Pressable_1.Pressable onPress={item.onPress} disabled={item.disabled} accessibilityRole="link" px={1} py={0.5} rounded={1} _pressed={{ opacity: 0.6 }} {..._item}>
                            {content}
                        </Pressable_1.Pressable>)}
            </react_1.default.Fragment>);
    };
    const children = entries.flatMap((entry, i) => i === 0
        ? [renderEntry(entry)]
        : [<react_native_1.View key={'sep' + i} style={{ marginHorizontal: 2 }}>{sep}</react_native_1.View>, renderEntry(entry)]);
    const rowStyle = react_native_1.StyleSheet.flatten([
        { flexDirection: 'row', alignItems: 'center', flexWrap: scrollable ? 'nowrap' : 'wrap' },
        style,
        ...(0, DEFAULT_PROPS_1.DEFAULT_PROPS)(props, theme),
    ]);
    if (scrollable) {
        // Una línea con scroll, empezando por el final (la página actual a la vista)
        let scroll = null;
        return (<react_native_1.ScrollView {...props} horizontal showsHorizontalScrollIndicator={false} accessibilityLabel={(0, translate_1.libT)('breadcrumbs')} ref={r => { scroll = r; }} onContentSizeChange={() => { var _a; return (_a = scroll === null || scroll === void 0 ? void 0 : scroll.scrollToEnd) === null || _a === void 0 ? void 0 : _a.call(scroll, { animated: false }); }} contentContainerStyle={rowStyle}>
                {children}
            </react_native_1.ScrollView>);
    }
    return <react_native_1.View accessibilityLabel={(0, translate_1.libT)('breadcrumbs')} {...props} style={rowStyle}>{children}</react_native_1.View>;
};
exports.Breadcrumbs = Breadcrumbs;
