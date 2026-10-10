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
exports.Icon = void 0;
const ICONS = __importStar(require("@expo/vector-icons"));
const DEFAULT_PROPS_1 = require("./utils/DEFAULT_PROPS");
const react_1 = __importStar(require("react"));
const useThemeProps_1 = require("./utils/useThemeProps");
/** --- 2. Implementación interna --- */
const IconBase = (0, react_1.forwardRef)((rawProps, ref) => {
    var _a;
    // Defaults → theme.components.Icon → variante → props → plataforma
    const [_b, theme] = (0, useThemeProps_1.useThemeProps)('Icon', rawProps, { defaults: { size: 18 } }), { variant: _variant } = _b, props = __rest(_b, ["variant"]);
    const styles = (0, DEFAULT_PROPS_1.DEFAULT_PROPS)(props, theme);
    const IconComponent = ICONS[props.as];
    return (<IconComponent {...props} ref={ref} color={((_a = theme.colors) === null || _a === void 0 ? void 0 : _a[props.color]) || props.color} style={[props.style, ...styles]}/>);
});
/** --- 3. Export final con genéricos preservados --- */
exports.Icon = IconBase;
