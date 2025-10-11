import { KeyboardAvoidingView as NRKeyboardAvoidingView, StyleSheet, Platform, KeyboardAvoidingViewProps } from "react-native";
import { useTheme } from "./theme-provider";
import { BSDefaultProps, DEFAULT_PROPS } from "./utils/DEFAULT_PROPS";

export type BSKeyboardAvoidingProps = KeyboardAvoidingViewProps & BSDefaultProps & {
    _ios?: BSKeyboardAvoidingProps;
    _android?: BSKeyboardAvoidingProps;
    _web?: BSKeyboardAvoidingProps;
};

export const KeyboardAvoidingView: React.FC<BSKeyboardAvoidingProps> = ({ ...props }) => {
    const { theme } = useTheme();

    const combinedProps: BSKeyboardAvoidingProps = {
        ...props,
        ...(Platform.OS === "ios" ? props._ios : {}),
        ...(Platform.OS === "android" ? props._android : {}),
        ...(Platform.OS === "web" ? props._web : {}),
    };

    const styles = DEFAULT_PROPS(combinedProps, theme);

    const baseStyles = StyleSheet.flatten([
        combinedProps.style,
        ...styles,
    ]);

    return (
        <NRKeyboardAvoidingView
            style={baseStyles}
            {...props}
        >
            {combinedProps.children}
        </NRKeyboardAvoidingView>
    );
};
