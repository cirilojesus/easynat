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
const useThemeProps_1 = require("./utils/useThemeProps");
const translate_1 = require("./utils/translate");
const Text_1 = require("./Text");
const Pressable_1 = require("./Pressable");
const ReadMore = (rawProps) => {
    // Defaults → theme.components.ReadMore → variante → props → plataforma
    // (variant es del texto: se pasa al Text)
    const [_a] = (0, useThemeProps_1.useThemeProps)('ReadMore', rawProps), { numberOfLines = 3, defaultExpanded, expanded: controlled, onToggle, readMoreText, readLessText, showLess = true, _readMore, children } = _a, textProps = __rest(_a, ["numberOfLines", "defaultExpanded", "expanded", "onToggle", "readMoreText", "readLessText", "showLess", "_readMore", "children"]);
    const [internal, setInternal] = (0, react_1.useState)(!!defaultExpanded);
    const expanded = controlled !== null && controlled !== void 0 ? controlled : internal;
    // Líneas del texto completo: se miden con una copia invisible sin límite (con el límite, iOS solo
    // informa de las visibles). null hasta medirlo
    const [lines, setLines] = (0, react_1.useState)(null);
    const overflows = lines !== null && lines > numberOfLines;
    const toggle = () => {
        const next = !expanded;
        if (controlled === undefined)
            setInternal(next);
        onToggle === null || onToggle === void 0 ? void 0 : onToggle(next);
    };
    return (<react_native_1.View>
            <Text_1.Text {...textProps} numberOfLines={expanded ? undefined : numberOfLines}>{children}</Text_1.Text>
            {/* Copia invisible para saber cuántas líneas ocupa entero (mismo ancho y estilo) */}
            <Text_1.Text {...textProps} aria-hidden accessibilityElementsHidden importantForAccessibility="no-hide-descendants" pointerEvents="none" style={[textProps.style, { position: 'absolute', left: 0, right: 0, top: 0, opacity: 0 }]} onTextLayout={e => {
            const n = e.nativeEvent.lines.length;
            if (n !== lines)
                setLines(n);
        }}>
                {children}
            </Text_1.Text>
            {overflows && (expanded ? showLess : true) && (<Pressable_1.Pressable onPress={toggle} accessibilityRole="button" accessibilityState={{ expanded }} alignSelf="flex-start" mt={1} hitSlop={8}>
                    <Text_1.Text color="primary.100" fontWeight="600" fontSize={textProps.fontSize} {..._readMore}>
                        {expanded ? readLessText !== null && readLessText !== void 0 ? readLessText : (0, translate_1.libT)('readLess') : readMoreText !== null && readMoreText !== void 0 ? readMoreText : (0, translate_1.libT)('readMore')}
                    </Text_1.Text>
                </Pressable_1.Pressable>)}
        </react_native_1.View>);
};
exports.ReadMore = ReadMore;
