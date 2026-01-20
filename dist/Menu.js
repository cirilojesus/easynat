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
exports.Menu = void 0;
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const theme_provider_1 = require("./theme-provider");
const DEFAULT_PROPS_1 = require("./utils/DEFAULT_PROPS");
const Pressable_1 = require("./Pressable");
const react_native_safe_area_context_1 = require("react-native-safe-area-context");
const react_native_root_siblings_1 = require("react-native-root-siblings");
const FlatList_1 = require("./FlatList");
const Button_1 = require("./Button");
const useKeyboardHeight_1 = require("./utils/useKeyboardHeight");
const MenuItem = () => null;
MenuItem.displayName = "MenuItem";
function InternalMenu(_a, ref) {
    var { trigger, children, style, defaultOpen, placement = "bottom", menuDir = "left", data, renderItem } = _a, props = __rest(_a, ["trigger", "children", "style", "defaultOpen", "placement", "menuDir", "data", "renderItem"]);
    const { theme } = (0, theme_provider_1.useTheme)();
    const [show, setShow] = (0, react_1.useState)(defaultOpen || false);
    const { height } = react_native_1.Dimensions.get("screen");
    const insets = (0, react_native_safe_area_context_1.useSafeAreaInsets)();
    const keyboardHeight = (0, useKeyboardHeight_1.useKeyboardHeight)();
    const [triggerLayout] = (0, react_1.useState)({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    });
    const [menuSize, setMenuSize] = (0, react_1.useState)({ w: 0, h: 0 });
    const animation = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    const combinedProps = Object.assign(Object.assign(Object.assign(Object.assign({ shadow: 3, borderWidth: 1, borderColor: "light.100", bg: "white", py: 2, rounded: 2, backdrop: true }, props), (react_native_1.Platform.OS === "ios" ? props._ios : {})), (react_native_1.Platform.OS === "android" ? props._android : {})), (react_native_1.Platform.OS === "web" ? props._web : {}));
    const styles = (0, DEFAULT_PROPS_1.DEFAULT_PROPS)(combinedProps, theme);
    const calcMaxHeightBottom = height - insets.bottom - triggerLayout.y - triggerLayout.height - keyboardHeight;
    placement = (calcMaxHeightBottom < 96 && placement == 'bottom') ? 'top' : placement;
    let menuTop = placement === "top" ? triggerLayout.y - menuSize.h : triggerLayout.y + triggerLayout.height;
    let maxHeight = placement == "top" ? triggerLayout.y - insets.top : calcMaxHeightBottom;
    if (maxHeight + 96 > height - keyboardHeight) {
        menuTop -= (maxHeight + 96) - (height - keyboardHeight);
        maxHeight -= (maxHeight + 96) - (height - keyboardHeight);
    }
    const menuLeft = menuDir === "left"
        ? Math.max(0, triggerLayout.x - Math.max(0, menuSize.w - triggerLayout.width))
        : Math.max(0, triggerLayout.x + triggerLayout.width - menuSize.w);
    const baseStyle = react_native_1.StyleSheet.flatten([
        style,
        {
            position: "absolute",
            top: menuTop,
            left: menuLeft,
            width: combinedProps.useTriggerWidth && triggerLayout.width,
            maxHeight: maxHeight
        },
        ...styles,
    ]);
    const animate = (toValue, callBack) => {
        react_native_1.Animated.timing(animation, {
            toValue,
            duration: 150,
            useNativeDriver: true,
            delay: 50
        }).start(({ finished }) => finished && (callBack === null || callBack === void 0 ? void 0 : callBack()));
    };
    const open = () => setShow(true);
    const close = () => animate(0, () => setShow(false));
    (0, react_1.useImperativeHandle)(ref, () => ({
        open,
        close,
        isOpen: () => show,
        toggle: () => {
            show ? close() : open();
        }
    }));
    const renderItemDefault = ({ item }) => {
        var _a, _b;
        return ((((_a = item === null || item === void 0 ? void 0 : item.type) === null || _a === void 0 ? void 0 : _a.name) == 'MenuItem' || ((_b = item === null || item === void 0 ? void 0 : item.type) === null || _b === void 0 ? void 0 : _b.name) == 'SearchInputItem') ?
            <Button_1.Button children={item.props.label} variant={"ghost"} _text={{ color: 'black' }} rounded={0} {...item.props} onPress={(e) => {
                    var _a, _b;
                    (_b = (_a = item.props).onPress) === null || _b === void 0 ? void 0 : _b.call(_a, e);
                    close();
                }}/>
            : (item === null || item === void 0 ? void 0 : item.type) ? <item.type {...item.props}/> : item);
    };
    const dataFlatList = {
        data: data || react_1.default.Children.toArray(children),
        renderItem: renderItem || renderItemDefault
    };
    return (<>
            {trigger === null || trigger === void 0 ? void 0 : trigger({
            onPress: (e) => {
                var _a, _b;
                (_b = (_a = e.currentTarget) === null || _a === void 0 ? void 0 : _a.measure) === null || _b === void 0 ? void 0 : _b.call(_a, (_x, _y, width, height, x, y) => {
                    Object.assign(triggerLayout, { x, y, width, height });
                });
                show ? close() : open();
            },
        })}

            {show && (<react_native_root_siblings_1.RootSiblingPortal>
                    <react_native_1.View style={react_native_1.StyleSheet.absoluteFill} pointerEvents={"box-none"}>
                        {combinedProps.backdrop && <Pressable_1.Pressable onPress={() => combinedProps.backdrop != 'static' && close()} flex={1}/>}
                        <react_native_1.Animated.View onLayout={(e) => {
                const { width, height } = e.nativeEvent.layout;
                if (width != menuSize.w || Math.floor(height) != Math.floor(menuSize.h)) {
                    setMenuSize({ w: width, h: height });
                    animate(1);
                }
            }} style={[
                baseStyle,
                {
                    transform: [
                        {
                            translateY: animation.interpolate({
                                inputRange: [0, 1],
                                outputRange: [8, 0],
                            }),
                        },
                    ],
                    opacity: animation,
                },
            ]}>
                            <FlatList_1.FlatList initialNumToRender={1} maxToRenderPerBatch={10} updateCellsBatchingPeriod={10} windowSize={10} nestedScrollEnabled keyboardShouldPersistTaps={"handled"} {...combinedProps._contentStyle} {...dataFlatList}/>
                        </react_native_1.Animated.View>
                    </react_native_1.View>
                </react_native_root_siblings_1.RootSiblingPortal>)}
        </>);
}
// cast seguro: forwardRef devuelve un React component no-genérico, así que casteamos.
const MenuBase = (0, react_1.forwardRef)(InternalMenu);
// asignar la prop estática
MenuBase.Item = MenuItem;
// export
exports.Menu = MenuBase;
