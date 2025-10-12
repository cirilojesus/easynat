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
exports.BSLinearGradient = void 0;
const react_native_svg_1 = __importStar(require("react-native-svg"));
const theme_provider_1 = require("./theme-provider");
const DEFAULT_PROPS_1 = require("./utils/DEFAULT_PROPS");
const react_native_1 = require("react-native");
const BSLinearGradient = (_a) => {
    var { type = "linear" } = _a, props = __rest(_a, ["type"]);
    const { theme } = (0, theme_provider_1.useTheme)();
    const combinedProps = Object.assign(Object.assign(Object.assign(Object.assign({}, props), (react_native_1.Platform.OS === "ios" ? props._ios : {})), (react_native_1.Platform.OS === "android" ? props._android : {})), (react_native_1.Platform.OS === "web" ? props._web : {}));
    const svgStyle = (0, DEFAULT_PROPS_1.DEFAULT_PROPS)(combinedProps, theme);
    const coords = (() => {
        if (!combinedProps.angle)
            return { x1: 0, y1: 0, x2: 1, y2: 0 };
        const r = ((combinedProps.angle % 360) * Math.PI) / 180;
        return {
            x1: 0.5 - Math.cos(r) / 2,
            y1: 0.5 - Math.sin(r) / 2,
            x2: 0.5 + Math.cos(r) / 2,
            y2: 0.5 + Math.sin(r) / 2,
        };
    })();
    const stops = combinedProps.colors.map((c, i) => {
        var _a, _b;
        return <react_native_svg_1.Stop key={i} offset={`${(_a = c.offset) !== null && _a !== void 0 ? _a : (i / (combinedProps.colors.length - 1)) * 100}%`} stopColor={theme.colors[c.color] || c.color} stopOpacity={(_b = c.opacity) !== null && _b !== void 0 ? _b : 1}/>;
    });
    return (<react_native_svg_1.default {...combinedProps} style={[combinedProps.style, ...svgStyle]}>
            <react_native_svg_1.Defs>
                {type === "radial" ? (<react_native_svg_1.RadialGradient id="grad" cx="50%" cy="50%" r="50%">
                        {stops}
                    </react_native_svg_1.RadialGradient>) : (<react_native_svg_1.LinearGradient id="grad" {...coords}>
                        {stops}
                    </react_native_svg_1.LinearGradient>)}
            </react_native_svg_1.Defs>
            <react_native_svg_1.Rect x="0" y="0" width="100%" height="100%" fill="url(#grad)" {...combinedProps._rect}/>
        </react_native_svg_1.default>);
};
exports.BSLinearGradient = BSLinearGradient;
//# sourceMappingURL=LinearGradient.js.map