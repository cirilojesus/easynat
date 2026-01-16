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
exports.Collapse = void 0;
const react_1 = require("react");
const react_native_reanimated_1 = __importStar(require("react-native-reanimated"));
const Box_1 = require("./Box");
const Icon_1 = require("./Icon");
const IconAnimated = react_native_reanimated_1.default.createAnimatedComponent(Icon_1.Icon);
/* ---------------- INTERNAL COMPONENT ------------------- */
function InternalCollapse(_a, ref) {
    var _b;
    var { trigger } = _a, props = __rest(_a, ["trigger"]);
    const height = (0, react_native_reanimated_1.useSharedValue)(0);
    const isExpanded = (0, react_native_reanimated_1.useSharedValue)(false);
    const [openState, setOpenState] = (0, react_1.useState)(false);
    (0, react_native_reanimated_1.useAnimatedReaction)(() => isExpanded.value, (val) => (0, react_native_reanimated_1.runOnJS)(setOpenState)(val));
    const derivedHeight = (0, react_native_reanimated_1.useDerivedValue)(() => (0, react_native_reanimated_1.withTiming)(isExpanded.value ? height.value : 0, { duration: 300 }));
    const bodyStyle = (0, react_native_reanimated_1.useAnimatedStyle)(() => ({
        height: derivedHeight.value,
        overflow: 'hidden',
    }));
    const iconStyle = (0, react_native_reanimated_1.useAnimatedStyle)(() => ({
        transform: [
            {
                rotate: (0, react_native_reanimated_1.withTiming)(`${!isExpanded.value ? 0 : 180}deg`, { duration: 200 })
            },
        ]
    }));
    (0, react_1.useImperativeHandle)(ref, () => ({
        open: () => (isExpanded.value = true),
        close: () => (isExpanded.value = false),
        toggle: () => (isExpanded.value = !isExpanded.value),
    }));
    return (<Box_1.Box {...props}>
            {trigger(Object.assign({ onPress: () => (isExpanded.value = !isExpanded.value), isOpen: openState, p: 2.5, borderWidth: 1, borderColor: 'light.100', rounded: 1, flexDir: 'row', justifyContent: 'space-between', icon: (<IconAnimated as="Feather" name="chevron-down" {...(_b = props._trigger) === null || _b === void 0 ? void 0 : _b._icon} style={iconStyle}/>) }, (openState ? props._open : props._trigger)))}

            <react_native_reanimated_1.default.View style={bodyStyle}>
                <Box_1.Box onLayout={(e) => (height.value = e.nativeEvent.layout.height)} style={{ width: '100%', position: 'absolute' }} {...props._contentStyle}>
                    {props.children}
                </Box_1.Box>
            </react_native_reanimated_1.default.View>
        </Box_1.Box>);
}
/**
 * forwardRef pierde los tipos al compilar.
 * Aquí los restauramos para que funcione el autocompletado
 * en el proyecto donde usas la librería.
 */
exports.Collapse = (0, react_1.forwardRef)(InternalCollapse);
