import React from "react";
import { ScrollView, ScrollViewProps, StyleSheet, Platform } from "react-native";
import { useTheme } from "./theme-provider";
import { BSTextProps } from "./Text";
import { BSDefaultProps, DEFAULT_PROPS } from "./utils/DEFAULT_PROPS";
import { renderChild } from "./utils/helpers";

export type BSScrollBoxProps = ScrollViewProps & BSDefaultProps & {
    _ios?: BSScrollBoxProps;
    _android?: BSScrollBoxProps;
    _web?: BSScrollBoxProps;
    _text?: BSTextProps;
    _contentContainerStyle?: BSScrollBoxProps;
};

export const ScrollBox: React.FC<BSScrollBoxProps> = ({
    style,
    children,
    ...props
}) => {
    const { theme } = useTheme();

    const combinedProps: BSScrollBoxProps = {
        ...props,
        ...(Platform.OS === "ios" ? props._ios : {}),
        ...(Platform.OS === "android" ? props._android : {}),
        ...(Platform.OS === "web" ? props._web : {}),
    };

    const styles = DEFAULT_PROPS(combinedProps, theme);
    const contentStyles = DEFAULT_PROPS(combinedProps?._contentContainerStyle || {}, theme);

    const scrollStyle = StyleSheet.flatten([
        ...styles.filter(x => x && !Object.keys(x).some(key => key.startsWith("margin"))),
        style
    ]);

    const scrollContentStyle = StyleSheet.flatten([
        ...contentStyles,
        combinedProps.contentContainerStyle
    ]);

    return (
        <ScrollView
            {...props}
            style={scrollStyle}
            contentContainerStyle={scrollContentStyle}
        >
            {renderChild(children, props._text)}
        </ScrollView>
    );
};
