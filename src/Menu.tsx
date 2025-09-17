import React, { useRef, useState } from "react";
import {
    StyleSheet,
    ViewStyle,
    Animated,
    ViewProps,
    Platform,
    Dimensions,
    View,
} from "react-native";
import { useTheme } from "./theme-provider";
import { BSDefaultProps, DEFAULT_PROPS } from "./utils/DEFAULT_PROPS";
import { Pressable } from "./Pressable";
import { BSScrollBoxProps, ScrollBox } from "./Scrollview";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RootSiblingPortal } from "react-native-root-siblings";

export type Placement = "bottom" | "top";
export type MenuDir = "left" | "right";

export type BSMenuProps = ViewProps & BSDefaultProps & {
    trigger?: (props: { onPress: (e: any) => void }) => React.ReactNode;
    defaultOpen?: boolean;
    placement?: Placement;
    menuDir?: MenuDir;
    _ios?: BSMenuProps;
    _android?: BSMenuProps;
    _web?: BSMenuProps;
    children?: React.ReactElement<any> | React.ReactElement<any>[];
    _contentStyle?: BSScrollBoxProps
};

export const Menu: React.FC<BSMenuProps> = ({
    trigger,
    children,
    style,
    defaultOpen,
    placement = "bottom",
    menuDir = "left",
    ...props
}) => {
    const { theme } = useTheme();
    const [open, setOpen] = useState(defaultOpen || false);
    const { height } = Dimensions.get('screen')
    const insets = useSafeAreaInsets();
    const [triggerLayout, setTriggerLayout] = useState({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    });
    const [menuSize, setMenuSize] = useState({ w: 0, h: 0 });
    const animation = useRef(new Animated.Value(0)).current;

    const combinedProps: BSMenuProps = {
        shadow: 3, borderWidth: 1, borderColor: 'light', bg: 'white', py: 3, rounded: 3,
        ...props,
        ...(Platform.OS === "ios" ? props._ios : {}),
        ...(Platform.OS === "android" ? props._android : {}),
        ...(Platform.OS === "web" ? props._web : {}),
    };

    const styles = DEFAULT_PROPS(combinedProps, theme)

    // posición vertical
    const menuTop = placement === "bottom"
        ? triggerLayout.y + triggerLayout.height
        : triggerLayout.y - menuSize.h;

    // posición horizontal según menuDir
    const menuLeft = menuDir === "left"
        ? Math.max(0, triggerLayout.x - Math.max(0, menuSize.w - triggerLayout.width))
        : Math.max(0, triggerLayout.x + triggerLayout.width - menuSize.w)


    const baseStyle = StyleSheet.flatten<ViewStyle>([
        style,
        {
            position: "absolute",
            top: menuTop,
            left: menuLeft,
            maxHeight: placement == 'top' ? triggerLayout.y - insets.top : height - insets.bottom - triggerLayout.y - triggerLayout.height
        },
        ...styles
    ]);

    const animate = (toValue: 0 | 1, callBack?: () => void) => {
        Animated.timing(animation, {
            toValue,
            duration: toValue ? 250 : 200,
            useNativeDriver: true,
        }).start(({ finished }) => finished && callBack?.());
    };

    const onOpen = () => {
        setOpen(true)
        animate(1)
    }

    const onClose = () => animate(0, () => setOpen(false));

    return (
        <>
            {trigger({
                onPress: (e) => {
                    e.currentTarget.measure((x, _y, width, height, _px, y) => setTriggerLayout({ x, y, width, height: height }))
                    open ? onClose() : onOpen()
                }
            })}

            {open &&
                <RootSiblingPortal>
                    <View style={StyleSheet.absoluteFill}>
                        <Pressable onPress={() => onClose()} flex={1} />
                        <Animated.View
                            onLayout={(e) => {
                                const { width, height } = e.nativeEvent.layout;
                                setMenuSize({ w: width, h: height });
                            }}
                            style={[
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
                            ]}
                        >
                            <ScrollBox _contentContainerStyle={{ bg: 'light', gap: 1 }} {...props._contentStyle}>
                                {React.Children.map(children, (child) =>
                                    <View style={{ backgroundColor: props?._contentStyle?.bg || '#fff' }}>
                                        <child.type
                                            p={3}
                                            _pressed={{ bg: 'primary.50' }}
                                            {...child.props}
                                            onPress={e => {
                                                child.props.onPress?.(e)
                                                onClose()
                                            }}
                                        />
                                    </View>
                                )}
                            </ScrollBox>
                        </Animated.View>
                    </View>
                </RootSiblingPortal>
            }
        </>
    );
};
