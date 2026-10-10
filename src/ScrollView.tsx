import React from "react";
import { ScrollView as RNScrollView, ScrollViewProps, StyleSheet } from "react-native";
import { EATextProps } from "./Text";
import { EADefaultProps, DEFAULT_PROPS } from "./utils/DEFAULT_PROPS";
import { renderChild } from "./utils/helpers";
import { useThemeProps } from "./utils/useThemeProps";

export type EAScrollViewProps = ScrollViewProps & EADefaultProps & {
    _ios?: EAScrollViewProps;
    _android?: EAScrollViewProps;
    _web?: EAScrollViewProps;
    _text?: EATextProps;
    _contentContainerStyle?: EAScrollViewProps;
    variant?: (string & {});
};

export const ScrollView: React.FC<EAScrollViewProps> = ({
    children,
    ...props
}) => {
    // Defaults → theme.components.ScrollView → variante → props → plataforma
    const [combinedProps, theme] = useThemeProps<EAScrollViewProps>('ScrollView', props);

    const styles = DEFAULT_PROPS(combinedProps, theme);
    const contentStyles = DEFAULT_PROPS(combinedProps?._contentContainerStyle || {}, theme);

    const scrollStyle = StyleSheet.flatten([
        combinedProps.style,
        ...styles,
    ]);

    const scrollContentStyle = StyleSheet.flatten([
        ...contentStyles,
        combinedProps.contentContainerStyle
    ]);

    return (
        <RNScrollView
            {...combinedProps}
            style={scrollStyle}
            contentContainerStyle={scrollContentStyle}
        >
            {renderChild(children, combinedProps._text)}
        </RNScrollView>
    );
};
