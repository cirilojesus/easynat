import React from "react";
import { KeyboardAvoidingView as NRKeyboardAvoidingView, StyleSheet, KeyboardAvoidingViewProps } from "react-native";
import { EADefaultProps, DEFAULT_PROPS } from "./utils/DEFAULT_PROPS";
import { useThemeProps } from "./utils/useThemeProps";

export type EAKeyboardAvoidingProps = KeyboardAvoidingViewProps & EADefaultProps & {
    _ios?: EAKeyboardAvoidingProps;
    _android?: EAKeyboardAvoidingProps;
    _web?: EAKeyboardAvoidingProps;
    variant?: (string & {});
};

export const KeyboardAvoidingView: React.FC<EAKeyboardAvoidingProps> = (props) => {
    // Defaults → theme.components.KeyboardAvoidingView → variante → props → plataforma
    const [combinedProps, theme] = useThemeProps<EAKeyboardAvoidingProps>('KeyboardAvoidingView', props);

    const styles = DEFAULT_PROPS(combinedProps, theme);

    const baseStyles = StyleSheet.flatten([
        combinedProps.style,
        ...styles,
    ]);

    return (
        <NRKeyboardAvoidingView
            {...combinedProps}
            style={baseStyles}
        >
            {combinedProps.children}
        </NRKeyboardAvoidingView>
    );
};
