import { KeyboardAvoidingView as NRKeyboardAvoidingView, StyleSheet, Platform } from "react-native";
import { useTheme } from "./theme-provider";
import { DEFAULT_PROPS } from "./utils/DEFAULT_PROPS";
export const KeyboardAvoidingView = ({ ...props }) => {
    const { theme } = useTheme();
    const combinedProps = {
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
    return (<NRKeyboardAvoidingView style={baseStyles} {...props}>
            {combinedProps.children}
        </NRKeyboardAvoidingView>);
};
