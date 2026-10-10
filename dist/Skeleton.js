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
exports.Skeleton = void 0;
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const react_native_reanimated_1 = __importStar(require("react-native-reanimated"));
const Box_1 = require("./Box");
const useThemeProps_1 = require("./utils/useThemeProps");
const Skeleton = (rawProps) => {
    // Defaults → theme.components.Skeleton → variante → props → plataforma
    const [_a, theme] = (0, useThemeProps_1.useThemeProps)('Skeleton', rawProps), { structure = [], gap = 4, variant: _variant } = _a, props = __rest(_a, ["structure", "gap", "variant"]);
    const opacity = (0, react_native_reanimated_1.useSharedValue)(0.1);
    (0, react_1.useEffect)(() => {
        opacity.value = (0, react_native_reanimated_1.withRepeat)((0, react_native_reanimated_1.withTiming)(1, { duration: 800 }), -1, true);
    }, []);
    const animatedStyle = (0, react_native_reanimated_1.useAnimatedStyle)(() => ({
        opacity: opacity.value,
    }));
    return (<Box_1.Box flexDir='row' flexWrap={'wrap'} padding={Number(gap) / 2} {...props} gap={0}>
            {structure.map((x, i) => {
            var _a, _b, _c;
            return <react_native_1.View key={i} style={{ padding: gap, width: x.w || '100%' }}>
                    <react_native_reanimated_1.default.View {...x} style={[
                    { height: x.h || 10, borderRadius: x.rounded || 10, backgroundColor: (x.bg && ((_b = (_a = theme.colors) === null || _a === void 0 ? void 0 : _a[x.bg]) !== null && _b !== void 0 ? _b : x.bg)) || ((_c = theme.colors) === null || _c === void 0 ? void 0 : _c['light.200']) || '#ddd' },
                    animatedStyle,
                    x.style,
                ]}/>
                </react_native_1.View>;
        })}
        </Box_1.Box>);
};
exports.Skeleton = Skeleton;
