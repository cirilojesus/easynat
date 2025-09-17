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
exports.Menu = void 0;
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const theme_provider_1 = require("./theme-provider");
const DEFAULT_PROPS_1 = require("./utils/DEFAULT_PROPS");
const Pressable_1 = require("./Pressable");
const Scrollview_1 = require("./Scrollview");
const react_native_safe_area_context_1 = require("react-native-safe-area-context");
const react_native_root_siblings_1 = require("react-native-root-siblings");
const Menu = (_a) => {
    var { trigger, children, style, defaultOpen, placement = "bottom", menuDir = "left" } = _a, props = __rest(_a, ["trigger", "children", "style", "defaultOpen", "placement", "menuDir"]);
    const { theme } = (0, theme_provider_1.useTheme)();
    const [open, setOpen] = (0, react_1.useState)(defaultOpen || false);
    const { height } = react_native_1.Dimensions.get('screen');
    const insets = (0, react_native_safe_area_context_1.useSafeAreaInsets)();
    const [triggerLayout, setTriggerLayout] = (0, react_1.useState)({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    });
    const [menuSize, setMenuSize] = (0, react_1.useState)({ w: 0, h: 0 });
    const animation = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    const combinedProps = Object.assign(Object.assign(Object.assign(Object.assign({ shadow: 3, borderWidth: 1, borderColor: 'light', bg: 'white', py: 3, rounded: 3 }, props), (react_native_1.Platform.OS === "ios" ? props._ios : {})), (react_native_1.Platform.OS === "android" ? props._android : {})), (react_native_1.Platform.OS === "web" ? props._web : {}));
    const styles = (0, DEFAULT_PROPS_1.DEFAULT_PROPS)(combinedProps, theme);
    // posición vertical
    const menuTop = placement === "bottom"
        ? triggerLayout.y + triggerLayout.height
        : triggerLayout.y - menuSize.h;
    // posición horizontal según menuDir
    const menuLeft = menuDir === "left"
        ? Math.max(0, triggerLayout.x - Math.max(0, menuSize.w - triggerLayout.width))
        : Math.max(0, triggerLayout.x + triggerLayout.width - menuSize.w);
    const baseStyle = react_native_1.StyleSheet.flatten([
        style,
        {
            position: "absolute",
            top: menuTop,
            left: menuLeft,
            maxHeight: placement == 'top' ? triggerLayout.y - insets.top : height - insets.bottom - triggerLayout.y - triggerLayout.height
        },
        ...styles
    ]);
    const animate = (toValue, callBack) => {
        react_native_1.Animated.timing(animation, {
            toValue,
            duration: toValue ? 250 : 200,
            useNativeDriver: true,
        }).start(({ finished }) => finished && (callBack === null || callBack === void 0 ? void 0 : callBack()));
    };
    const onOpen = () => {
        setOpen(true);
        animate(1);
    };
    const onClose = () => animate(0, () => setOpen(false));
    return (<>
            {trigger({
            onPress: (e) => {
                e.currentTarget.measure((x, _y, width, height, _px, y) => setTriggerLayout({ x, y, width, height: height }));
                open ? onClose() : onOpen();
            }
        })}

            {open &&
            <react_native_root_siblings_1.RootSiblingPortal>
                    <react_native_1.View style={react_native_1.StyleSheet.absoluteFill}>
                        <Pressable_1.Pressable onPress={() => onClose()} flex={1}/>
                        <react_native_1.Animated.View onLayout={(e) => {
                    const { width, height } = e.nativeEvent.layout;
                    setMenuSize({ w: width, h: height });
                }} style={[
                    baseStyle,
                    {
                        transform: [
                            {
                                translateY: animation.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [5, 0],
                                })
                            }
                        ],
                        opacity: animation
                    },
                ]}>
                            <Scrollview_1.ScrollBox _contentContainerStyle={{ bg: 'light', gap: 1 }} {...props._contentStyle}>
                                {react_1.default.Children.map(children, (child) => {
                    var _a;
                    return <react_native_1.View style={{ backgroundColor: ((_a = props === null || props === void 0 ? void 0 : props._contentStyle) === null || _a === void 0 ? void 0 : _a.bg) || '#fff' }}>
                                        <child.type p={3} _pressed={{ bg: 'primary.50' }} {...child.props} onPress={e => {
                            var _a, _b;
                            (_b = (_a = child.props).onPress) === null || _b === void 0 ? void 0 : _b.call(_a, e);
                            onClose();
                        }}/>
                                    </react_native_1.View>;
                })}
                            </Scrollview_1.ScrollBox>
                        </react_native_1.Animated.View>
                    </react_native_1.View>
                </react_native_root_siblings_1.RootSiblingPortal>}
        </>);
};
exports.Menu = Menu;
