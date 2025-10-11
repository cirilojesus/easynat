import { Pressable as PressableRN, PressableProps, StyleSheet, Platform } from "react-native";
import { useTheme } from "./theme-provider";
import { BSDefaultProps, DEFAULT_PROPS } from "./utils/DEFAULT_PROPS";
import { renderChild } from "./utils/helpers";
import { BSTextProps } from "./Text";

export type BSPressableProps = PressableProps & BSDefaultProps & {
    _text?: BSTextProps;
    _ios?: BSPressableProps;
    _android?: BSPressableProps;
    _web?: BSPressableProps;
    _pressed?: BSPressableProps; // estilo cuando está presionado
};

export const Pressable: React.FC<BSPressableProps> = ({ ...props }) => {
    const { theme } = useTheme();

    const combinedProps: BSPressableProps = {
        ...props,
        ...(Platform.OS === "ios" ? props._ios : {}),
        ...(Platform.OS === "android" ? props._android : {}),
        ...(Platform.OS === "web" ? props._web : {}),
    };

    const styles = DEFAULT_PROPS(combinedProps, theme);
    const pressedStyles = DEFAULT_PROPS(combinedProps?._pressed || {}, theme);
    const baseStyle = StyleSheet.flatten<BSPressableProps>([
        combinedProps.style,
        combinedProps.disabled && { opacity: .5 },
        ...styles,
    ]);

    return (
        <PressableRN
            {...combinedProps}
            style={({ pressed }) => [
                baseStyle,
                pressed && pressedStyles,
            ]}
        >
            {({ pressed }) => {
                return typeof combinedProps.children == 'function' ?
                    combinedProps.children(({ ...combinedProps, pressed }))
                    :
                    renderChild(
                        combinedProps.children,
                        pressed
                            ? { ...combinedProps._text, ...combinedProps._pressed?._text } // 👉 fusiona estilo normal con estilo presionado
                            : combinedProps._text
                    )
            }}
        </PressableRN>
    );
};
