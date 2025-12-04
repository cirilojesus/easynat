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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Icon = void 0;
const ICONS = __importStar(require("@expo/vector-icons"));
const DEFAULT_PROPS_1 = require("./utils/DEFAULT_PROPS");
const theme_provider_1 = require("./theme-provider");
const react_1 = require("react");
/** --- 2. Implementación interna --- */
const IconBase = (0, react_1.forwardRef)((props, ref) => {
    var _a;
    const { theme } = (0, theme_provider_1.useTheme)();
    const styles = (0, DEFAULT_PROPS_1.DEFAULT_PROPS)(props, theme);
    const IconComponent = ICONS[props.as];
    return (<IconComponent {...props} ref={ref} size={props.size || 20} color={((_a = theme.colors) === null || _a === void 0 ? void 0 : _a[props.color]) || props.color} style={[props.style, ...styles]}/>);
});
/** --- 3. Export final con genéricos preservados --- */
exports.Icon = IconBase;
