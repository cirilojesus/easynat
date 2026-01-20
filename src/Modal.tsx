// Modal.tsx
import React, {
    forwardRef,
    useImperativeHandle,
    useRef,
    useState,
    useEffect,
    useCallback,
} from "react";
import {
    Animated,
    BackHandler,
    Easing,
    StyleSheet,
    Pressable,
    Platform,
    ViewProps,
    PressableProps
} from "react-native";
import { RootSiblingPortal } from "react-native-root-siblings";
import { Box, BSBoxProps } from "./Box";
import { Icon, IconProps } from "./Icon";
import { Button, BSButtonProps } from "./Button";
import { BSKeyboardAvoidingProps, KeyboardAvoidingView } from "./KeyboardAvoidingView";
import { BSDefaultProps, DEFAULT_PROPS } from "./utils/DEFAULT_PROPS";
import { useTheme } from "./theme-provider";
import { useAndroidKeyboardPadding } from "./utils/useAndroidKeyboardPadding";

/* --------------------- TYPES ----------------------- */

export type BSModalRef = {
    open: () => void;
    close: () => void;
};

export type BSModalProps = BSKeyboardAvoidingProps & {
    header?: BSBoxProps;
    buttonClose?: boolean | React.ReactElement<any>;
    _buttonClose?: BSButtonProps;
    _contentStyle?: ViewProps & BSDefaultProps;
    safeAreaTop?: boolean;
    safeAreaBottom?: boolean;
    onClose?: () => void;
    _ios?: BSModalProps;
    _android?: BSModalProps;
    _web?: BSModalProps;
    _backdrop?: PressableProps & BSDefaultProps;
    static?: boolean;
    variant?: (string & {});
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/* ---------------- INTERNAL COMPONENT ---------------- */

function InternalModal(
    { buttonClose = true, ...props }: BSModalProps,
    ref: React.Ref<BSModalRef>
) {
    const { theme } = useTheme();
    const props_default = theme?.components?.Modal || {}
    const [visible, setVisible] = useState(false);
    const slideAnim = useRef(new Animated.Value(0)).current;
    const modalContentRef = useRef(null);
    useAndroidKeyboardPadding(modalContentRef);

    useEffect(() => {
        if (!visible) return;

        const sub = BackHandler.addEventListener("hardwareBackPress", () => {
            handleRequestClose();
            return true;
        });

        return () => sub.remove();
    }, [visible]);

    const combinedProps: BSModalProps = {
        ...props_default,
        ...props_default?.variants?.[props?.variant],
        ...props,
        ...(Platform.OS === "ios" ? props._ios : {}),
        ...(Platform.OS === "android" ? props._android : {}),
        ...(Platform.OS === "web" ? props._web : {}),
    };

    const contentStyle = DEFAULT_PROPS(combinedProps?._contentStyle || {}, theme);
    const backdropStyle = DEFAULT_PROPS(combinedProps?._backdrop || {}, theme);

    const animate = useCallback((toValue: 0 | 1, callBack?: () => void) => {
        Animated.timing(slideAnim, {
            toValue,
            duration: toValue ? 250 : 200,
            easing: toValue ? Easing.out(Easing.ease) : Easing.in(Easing.ease),
            useNativeDriver: true,
        }).start(({ finished }) => finished && callBack?.());
    }, [slideAnim]);


    const open = useCallback(() => {
        setVisible(true);
        animate(1);
    }, [animate]);

    const close = useCallback(() => {
        animate(0, () => setVisible(false));
    }, [animate]);


    useImperativeHandle(ref, () => ({ open, close }), [open, close]);

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
                        },
                    ]}
                    onPress={!combinedProps?.static ? handleRequestClose : null}
                />

                <Box
                    bg={combinedProps.bg || "white"}
                    safeAreaTop={combinedProps?.safeAreaTop}
                />

                <KeyboardAvoidingView flex={1} _ios={{ behavior: 'padding' }} {...props}>
                    <Animated.View
                        ref={modalContentRef}
                        style={[
                            {
                                height: "90%",
                                marginTop: "auto",
                                backgroundColor: "#fff",
                                borderTopRightRadius: 20,
                                borderTopLeftRadius: 20,
                                overflow: 'hidden',
                                transform: [
                                    {
                                        translateY: slideAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [800, 0],
                                        }),
                                    },
                                ],
                            },
                            combinedProps?._contentStyle?.style,
                            ...contentStyle,
                        ]}
                    >
                        <Box zIndex={100} flexDir={'row'} gap={2} {...{ ...props_default?.variants?.[props?.variant]?.header, ...combinedProps?.header }}>
                            {combinedProps?.header?.children}
                            {buttonClose === true ? (
                                <Button
                                    variant="ghost"
                                    position="absolute"
                                    rounded={50}
                                    right={0}
                                    m={2}
                                    icon={
                                        <Icon
                                            name="close"
                                            as="AntDesign"
                                        />
                                    }
                                    onPress={handleRequestClose}
                                    {...{ ...props_default?.variants?.[props?.variant]?._buttonClose, ...combinedProps._buttonClose }}
                                />
                            ) : (
                                buttonClose &&
                                React.cloneElement(combinedProps.buttonClose, {
                                    onPress: handleRequestClose,
                                    ...combinedProps._buttonClose,
                                })
                            )}
                        </Box>
                        {combinedProps.children}
                    </Animated.View>
                </KeyboardAvoidingView>

                <Box
                    bg={combinedProps.bg || "white"}
                    safeAreaBottom={
                        combinedProps?.safeAreaBottom !== undefined
                            ? combinedProps?.safeAreaBottom
                            : true
                    }
                />
            </Box>
        </RootSiblingPortal>
    );
}

/* --------------------- FIX PARA AUTOCOMPLETADO ----------------------- */

export type ModalComponent = (
    props: BSModalProps & { ref?: React.Ref<BSModalRef> }
) => React.ReactElement | null;

/**  
 * El cast correcto:  
 * `forwardRef` pierde los tipos, así que lo restauramos manualmente.
 */
export const Modal = forwardRef(InternalModal) as unknown as ModalComponent;
