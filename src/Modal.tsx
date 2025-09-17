// Modal.tsx
import React, { forwardRef, useImperativeHandle, useRef, useState, useEffect } from "react";
import { Animated, BackHandler, Easing, StyleSheet, Pressable, Platform, ViewProps, PressableProps } from "react-native";
import { RootSiblingPortal } from "react-native-root-siblings";
import { Box, BSBoxProps } from "./Box";
import { Icon, IconProps } from "./Icon";
import { Button, BSButtonProps } from "./Button";
import { BSKeyboardAvoidingProps, KeyboardAvoiding } from "./KeyboardAvoidingView";
import { BSDefaultProps, DEFAULT_PROPS } from "./utils/DEFAULT_PROPS";
import { useTheme } from "./theme-provider";

export type BSModalRef = {
    open: () => void;
    close: () => void;
};

export type BSModalProps = BSKeyboardAvoidingProps & {
    header?: BSBoxProps;
    iconClose?: boolean | typeof Button;
    _icon?: BSButtonProps & { icon: Partial<IconProps> };
    _contentStyle?: ViewProps & BSDefaultProps;
    safeAreaTop?: boolean,
    safeAreaBottom?: boolean,
    onClose?: () => void;
    _ios?: BSModalProps;
    _android?: BSModalProps;
    _web?: BSModalProps;
    _backdrop?: PressableProps & BSDefaultProps;
    static?: boolean;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const Modal = forwardRef<BSModalRef, BSModalProps>(({ ...props }, ref) => {
    const { theme } = useTheme();
    const [visible, setVisible] = useState(false);
    const slideAnim = useRef(new Animated.Value(0)).current;

    useImperativeHandle(ref, () => ({ open, close }));

    useEffect(() => {
        if (!visible) return;
        const sub = BackHandler.addEventListener("hardwareBackPress", () => {
            handleRequestClose();
            return true;
        });
        return () => sub.remove();
    }, [visible]);

    const combinedProps: BSModalProps = {
        ...props,
        ...(Platform.OS === "ios" ? props._ios : {}),
        ...(Platform.OS === "android" ? props._android : {}),
        ...(Platform.OS === "web" ? props._web : {}),
    };

    const contentStyle = DEFAULT_PROPS(combinedProps?._contentStyle || {}, theme);
    const backdropStyle = DEFAULT_PROPS(combinedProps?._backdrop || {}, theme);

    const animate = (toValue: 0 | 1, callBack?: () => void) => {
        Animated.timing(slideAnim, {
            toValue,
            duration: toValue ? 250 : 200,
            easing: toValue ? Easing.out(Easing.ease) : Easing.in(Easing.ease),
            useNativeDriver: true,
        }).start(({ finished }) => finished && callBack?.());
    };

    const open = () => {
        setVisible(true)
        animate(1)
    };

    const close = () => animate(0, () => setVisible(false));

    const handleRequestClose = () => {
        combinedProps.onClose?.();
        close();
    };

    if (!visible) return null;

    return (
        <RootSiblingPortal>
            <Box style={StyleSheet.absoluteFill} flex={1}>
                <AnimatedPressable
                    style={[
                        { backgroundColor: "#0003" },
                        StyleSheet.absoluteFill,
                        combinedProps?._backdrop?.style,
                        ...backdropStyle,
                        {
                            opacity: slideAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, 1],
                            }),
                        }
                    ]}
                    onPress={!combinedProps?.static ? handleRequestClose : null}
                />
                <Box bg={combinedProps.bg || 'white'} safeAreaTop={combinedProps?.safeAreaTop} />
                <KeyboardAvoiding {...props}>
                    <Animated.View
                        style={[
                            {
                                height: '90%',
                                marginTop: 'auto',
                                backgroundColor: '#fff',
                                borderTopRightRadius: 20,
                                borderTopLeftRadius: 20,
                                transform: [
                                    {
                                        translateY: slideAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [800, 0],
                                        })
                                    }
                                ]
                            },
                            combinedProps?._contentStyle?.style,
                            ...contentStyle,
                        ]}
                    >
                        {combinedProps.header && (
                            <Box
                                px={5}
                                pb={4}
                                pt={2}
                                borderBottomWidth={1}
                                borderBottomColor="light"
                                {...combinedProps.header}
                            />
                        )}
                        {combinedProps.iconClose === true ? (
                            <Button
                                variant="ghost"
                                position="absolute"
                                zIndex={100}
                                rounded={50}
                                right={0}
                                m={2}
                                children={<Icon name="close" as="AntDesign" {...combinedProps._icon?.icon} />}
                                onPress={close}
                                {...combinedProps._icon}
                            />
                        ) : (
                            combinedProps.iconClose && combinedProps.iconClose({ onPress: close, ...combinedProps._icon })
                        )}
                        {combinedProps.children}
                    </Animated.View>
                </KeyboardAvoiding>
                <Box bg={combinedProps.bg || 'white'} safeAreaBottom={combinedProps?.safeAreaBottom !== undefined ? combinedProps?.safeAreaBottom : true} />
            </Box>
        </RootSiblingPortal>
    );
});
