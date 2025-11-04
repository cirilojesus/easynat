import React, { useRef, useState, forwardRef, useImperativeHandle, useEffect, } from "react";
import { StyleSheet, Animated, Platform, Dimensions, View, } from "react-native";
import { useTheme } from "./theme-provider";
import { DEFAULT_PROPS } from "./utils/DEFAULT_PROPS";
import { Pressable } from "./Pressable";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RootSiblingPortal } from "react-native-root-siblings";
import { FlatList } from "./FlatList";
import { Button } from "./Button";
import { useKeyboardHeight } from "./utils/useKeyboardHeight";
const MenuItem = () => null;
MenuItem.displayName = "MenuItem";
let awaitConfigMenu = null;
function InternalMenu({ trigger, children, style, defaultOpen, placement = "bottom", menuDir = "left", data, renderItem, ...props }, ref) {
    const { theme } = useTheme();
    const [show, setShow] = useState(defaultOpen || false);
    const { height } = Dimensions.get("screen");
    const insets = useSafeAreaInsets();
    const keyboardHeight = useKeyboardHeight();
    const [triggerLayout] = useState({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    });
    const [menuSize, setMenuSize] = useState({ w: 0, h: 0 });
    const animation = useRef(new Animated.Value(0)).current;
    const combinedProps = {
        shadow: 3,
        borderWidth: 1,
        borderColor: "light",
        bg: "white",
        py: 3,
        rounded: 3,
        backdrop: true,
        ...props,
        ...(Platform.OS === "ios" ? props._ios : {}),
        ...(Platform.OS === "android" ? props._android : {}),
        ...(Platform.OS === "web" ? props._web : {}),
    };
    const styles = DEFAULT_PROPS(combinedProps, theme);
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
    const baseStyle = StyleSheet.flatten([
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
        Animated.timing(animation, {
            toValue,
            duration: toValue ? 200 : 200,
            useNativeDriver: true,
        }).start(({ finished }) => finished && callBack?.());
    };
    const open = () => setShow(true);
    useEffect(() => {
        if (show) {
            clearInterval(awaitConfigMenu);
            awaitConfigMenu = setTimeout(() => animate(1), 10);
        }
    }, [show, menuSize]);
    const close = () => animate(0, () => setShow(false));
    useImperativeHandle(ref, () => ({
        open,
        close,
        isOpen: () => show,
    }));
    const renderItemDefault = ({ item }) => ((item?.type?.name == 'MenuItem' || item?.type?.name == 'SearchInputItem') ?
        <Button children={item.props.label} variant={"ghost"} rounded={0} {...item.props} onPress={(e) => {
                item.props.onPress?.(e);
                close();
            }}/>
        : item?.type ? <item.type {...item.props}/> : item);
    const dataFlatList = {
        data: data || React.Children.toArray(children),
        renderItem: renderItem || renderItemDefault
    };
    return (<>
            {trigger?.({
            onPress: (e) => {
                e.currentTarget?.measure?.((_x, _y, width, height, x, y) => {
                    Object.assign(triggerLayout, { x, y, width, height });
                });
                show ? close() : open();
            },
        })}

            {show && (<RootSiblingPortal>
                    <View style={StyleSheet.absoluteFill} pointerEvents={"box-none"}>
                        {combinedProps.backdrop && <Pressable onPress={() => combinedProps.backdrop != 'static' && close()} flex={1}/>}
                        <Animated.View onLayout={(e) => {
                const { width, height } = e.nativeEvent.layout;
                if (width != menuSize.w || Math.floor(height) != Math.floor(menuSize.h)) {
                    setMenuSize({ w: width, h: height });
                }
            }} style={[
                baseStyle,
                {
                    transform: [
                        {
                            translateY: animation.interpolate({
                                inputRange: [0, 1],
                                outputRange: [5, 0],
                            }),
                        },
                    ],
                    opacity: animation,
                },
            ]}>
                            <FlatList initialNumToRender={1} maxToRenderPerBatch={10} updateCellsBatchingPeriod={10} windowSize={10} nestedScrollEnabled ItemSeparatorComponent={() => <View style={{ backgroundColor: '#ccc', height: .5 }}/>} keyboardShouldPersistTaps={"handled"} {...combinedProps._contentStyle} {...dataFlatList}/>
                        </Animated.View>
                    </View>
                </RootSiblingPortal>)}
        </>);
}
// cast seguro: forwardRef devuelve un React component no-genérico, así que casteamos.
const MenuBase = forwardRef(InternalMenu);
// asignar la prop estática
MenuBase.Item = MenuItem;
// export
export const Menu = MenuBase;
