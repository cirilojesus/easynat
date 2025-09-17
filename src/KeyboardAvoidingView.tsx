import React, { useEffect } from "react";
import { KeyboardAvoidingView, StyleSheet, Platform, Keyboard, KeyboardAvoidingViewProps } from "react-native";
import { useTheme } from "./theme-provider";
import { BSDefaultProps, DEFAULT_PROPS } from "./utils/DEFAULT_PROPS";

export type BSKeyboardAvoidingProps = KeyboardAvoidingViewProps & BSDefaultProps & {
    _ios?: BSKeyboardAvoidingProps;
    _android?: BSKeyboardAvoidingProps;
    _web?: BSKeyboardAvoidingProps;
};

export const KeyboardAvoiding: React.FC<BSKeyboardAvoidingProps> = ({ ...props }) => {
    const { theme } = useTheme();
    const [keyboardHeight, setKeyboardHeight] = React.useState(0);

    useEffect(() => {
        const show = Keyboard.addListener("keyboardDidShow", e => setKeyboardHeight(e.endCoordinates.height));
        const hide = Keyboard.addListener("keyboardDidHide", () => setKeyboardHeight(0));
        return () => { show.remove(); hide.remove(); };
    }, []);

    const combinedProps: BSKeyboardAvoidingProps = {
        ...props,
        ...(Platform.OS === "ios" ? props._ios : {}),
        ...(Platform.OS === "android" ? props._android : {}),
        ...(Platform.OS === "web" ? props._web : {}),
    };

    const styles = DEFAULT_PROPS(combinedProps, theme);

    const baseStyles = StyleSheet.flatten([
        ...styles,
        { flex: 1, paddingBottom: keyboardHeight },
        props.style
    ]);

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={baseStyles}
            {...props}
        >
            {props.children}
        </KeyboardAvoidingView>
    );
};
