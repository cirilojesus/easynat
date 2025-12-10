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
exports.Modal = void 0;
// Modal.tsx
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const react_native_root_siblings_1 = require("react-native-root-siblings");
const Box_1 = require("./Box");
const Icon_1 = require("./Icon");
const Button_1 = require("./Button");
const KeyboardAvoidingView_1 = require("./KeyboardAvoidingView");
const DEFAULT_PROPS_1 = require("./utils/DEFAULT_PROPS");
const theme_provider_1 = require("./theme-provider");
const AnimatedPressable = react_native_1.Animated.createAnimatedComponent(react_native_1.Pressable);
/* ---------------- INTERNAL COMPONENT ---------------- */
function InternalModal(_a, ref) {
    var _b, _c, _d;
    var props = __rest(_a, []);
    const { theme } = (0, theme_provider_1.useTheme)();
    const [visible, setVisible] = (0, react_1.useState)(false);
    const slideAnim = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    (0, react_1.useImperativeHandle)(ref, () => ({ open, close }));
    (0, react_1.useEffect)(() => {
        if (!visible)
            return;
        const sub = react_native_1.BackHandler.addEventListener("hardwareBackPress", () => {
            handleRequestClose();
            return true;
        });
        return () => sub.remove();
    }, [visible]);
    const combinedProps = Object.assign(Object.assign(Object.assign(Object.assign({}, props), (react_native_1.Platform.OS === "ios" ? props._ios : {})), (react_native_1.Platform.OS === "android" ? props._android : {})), (react_native_1.Platform.OS === "web" ? props._web : {}));
    const contentStyle = (0, DEFAULT_PROPS_1.DEFAULT_PROPS)((combinedProps === null || combinedProps === void 0 ? void 0 : combinedProps._contentStyle) || {}, theme);
    const backdropStyle = (0, DEFAULT_PROPS_1.DEFAULT_PROPS)((combinedProps === null || combinedProps === void 0 ? void 0 : combinedProps._backdrop) || {}, theme);
    const animate = (toValue, callBack) => {
        react_native_1.Animated.timing(slideAnim, {
            toValue,
            duration: toValue ? 250 : 200,
            easing: toValue ? react_native_1.Easing.out(react_native_1.Easing.ease) : react_native_1.Easing.in(react_native_1.Easing.ease),
            useNativeDriver: true,
        }).start(({ finished }) => finished && (callBack === null || callBack === void 0 ? void 0 : callBack()));
    };
    const open = () => {
        setVisible(true);
        animate(1);
    };
    const close = () => animate(0, () => setVisible(false));
    const handleRequestClose = () => {
        var _a;
        (_a = combinedProps.onClose) === null || _a === void 0 ? void 0 : _a.call(combinedProps);
        close();
    };
    if (!visible)
        return null;
    return (<react_native_root_siblings_1.RootSiblingPortal>
            <Box_1.Box style={react_native_1.StyleSheet.absoluteFill} flex={1}>
                <AnimatedPressable style={[
            { backgroundColor: "#0003" },
            react_native_1.StyleSheet.absoluteFill,
            (_b = combinedProps === null || combinedProps === void 0 ? void 0 : combinedProps._backdrop) === null || _b === void 0 ? void 0 : _b.style,
            ...backdropStyle,
            {
                opacity: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1],
                }),
            },
        ]} onPress={!(combinedProps === null || combinedProps === void 0 ? void 0 : combinedProps.static) ? handleRequestClose : null}/>

                <Box_1.Box bg={combinedProps.bg || "white"} safeAreaTop={combinedProps === null || combinedProps === void 0 ? void 0 : combinedProps.safeAreaTop}/>

                <KeyboardAvoidingView_1.KeyboardAvoidingView flex={1} {...props}>
                    <react_native_1.Animated.View style={[
            {
                height: "90%",
                marginTop: "auto",
                backgroundColor: "#fff",
                borderTopRightRadius: 20,
                borderTopLeftRadius: 20,
                transform: [
                    {
                        translateY: slideAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [800, 0],
                        }),
                    },
                ],
            },
            (_c = combinedProps === null || combinedProps === void 0 ? void 0 : combinedProps._contentStyle) === null || _c === void 0 ? void 0 : _c.style,
            ...contentStyle,
        ]}>
                        {combinedProps.header && (<Box_1.Box px={5} pb={4} pt={2} borderBottomWidth={1} borderBottomColor="light" {...combinedProps.header}/>)}

                        {combinedProps.iconClose === true ? (<Button_1.Button variant="ghost" position="absolute" zIndex={100} rounded={50} right={0} m={2} icon={<Icon_1.Icon name="close" as="AntDesign" {...(_d = combinedProps._icon) === null || _d === void 0 ? void 0 : _d.icon}/>} onPress={close} {...combinedProps._icon}/>) : (combinedProps.iconClose &&
            react_1.default.cloneElement(combinedProps.iconClose, Object.assign({ onPress: close }, combinedProps._icon)))}

                        {combinedProps.children}
                    </react_native_1.Animated.View>
                </KeyboardAvoidingView_1.KeyboardAvoidingView>

                <Box_1.Box bg={combinedProps.bg || "white"} safeAreaBottom={(combinedProps === null || combinedProps === void 0 ? void 0 : combinedProps.safeAreaBottom) !== undefined
            ? combinedProps === null || combinedProps === void 0 ? void 0 : combinedProps.safeAreaBottom
            : true}/>
            </Box_1.Box>
        </react_native_root_siblings_1.RootSiblingPortal>);
}
/**
 * El cast correcto:
 * `forwardRef` pierde los tipos, así que lo restauramos manualmente.
 */
exports.Modal = (0, react_1.forwardRef)(InternalModal);
