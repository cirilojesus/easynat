import React from "react";
import { Pressable as PressableRN, PressableProps, StyleSheet } from "react-native";
import { EADefaultProps, DEFAULT_PROPS } from "./utils/DEFAULT_PROPS";
import { renderChild } from "./utils/helpers";
import { useThemeProps } from "./utils/useThemeProps";
import { EATextProps } from "./Text";

export type EAPressableProps = PressableProps & EADefaultProps & {
    _text?: EATextProps;
    _ios?: Omit<EAPressableProps, '_ios' | '_android' | '_web'>;
    _android?: Omit<EAPressableProps, '_ios' | '_android' | '_web'>;
    _web?: Omit<EAPressableProps, '_ios' | '_android' | '_web'>;
    _pressed?: Omit<EAPressableProps, '_pressed' | '_ios' | '_android' | '_web'>;
    variant?: (string & {});
};

export const Pressable: React.FC<EAPressableProps> = ({ ...props }) => {
    // Defaults → theme.components.Pressable → variante → props → plataforma
    const [combinedProps, theme] = useThemeProps<EAPressableProps>('Pressable', props);
    const styles = DEFAULT_PROPS(combinedProps, theme);
    const pressedStyles = DEFAULT_PROPS(combinedProps._pressed ?? {}, theme);
    const baseStyle = StyleSheet.flatten<EAPressableProps>([
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
