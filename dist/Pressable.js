import { Pressable as PressableRN, StyleSheet, Platform } from "react-native";
import { useTheme } from "./theme-provider";
import { DEFAULT_PROPS } from "./utils/DEFAULT_PROPS";
import { renderChild } from "./utils/helpers";
export const Pressable = ({ ...props }) => {
    const { theme } = useTheme();
    const combinedProps = {
        ...props,
        ...(Platform.OS === "ios" ? props._ios : {}),
        ...(Platform.OS === "android" ? props._android : {}),
        ...(Platform.OS === "web" ? props._web : {}),
    };
    const styles = DEFAULT_PROPS(combinedProps, theme);
    const pressedStyles = DEFAULT_PROPS(combinedProps?._pressed || {}, theme);
    const baseStyle = StyleSheet.flatten([
        combinedProps.style,
        combinedProps.disabled && { opacity: .5 },
        ...styles,
    ]);
    return (<PressableRN {...combinedProps} style={({ pressed }) => [
            baseStyle,
            pressed && pressedStyles,
        ]}>
            {({ pressed }) => {
            return typeof combinedProps.children == 'function' ?
                combinedProps.children(({ ...combinedProps, pressed }))
                :
                    renderChild(combinedProps.children, pressed
                        ? { ...combinedProps._text, ...combinedProps._pressed?._text } // 👉 fusiona estilo normal con estilo presionado
                        : combinedProps._text);
        }}
        </PressableRN>);
};
