import React from "react";
import { TextInput, TextInputProps, StyleSheet, Platform, TextStyle } from "react-native";
import { useTheme } from "./theme-provider";
import { BSDefaultProps, DEFAULT_PROPS } from "./utils/DEFAULT_PROPS";

export type BSTextInputProps = TextInputProps & BSDefaultProps & {
    _ios?: BSTextInputProps;
    _android?: BSTextInputProps;
    _web?: BSTextInputProps;
};

export const InputText: React.FC<BSTextInputProps> = ({ style, ...props }) => {
    const { theme } = useTheme();
    const styles_default = theme?.components?.InputText || {}

    const combinedProps: BSTextInputProps = {
        ...props,
        ...(Platform.OS === "ios" ? { ...props?._ios, ...styles_default?._ios } : {}),
        ...(Platform.OS === "android" ? { ...props?._android, ...styles_default?._android } : {}),
        ...(Platform.OS === "web" ? { ...props?._web, ...styles_default?._web } : {}),
        ...styles_default
    };

    const styles = DEFAULT_PROPS(combinedProps, theme);

    const inputStyle = StyleSheet.flatten<TextStyle>([
        ...styles,
        {
            borderWidth: 1,
            borderColor: theme.colors['light'],
            borderRadius: 4,
            padding: 10,
        },
        style
    ]);

    return (
        <TextInput
            style={inputStyle}
            {...props}
        />
    );
};
