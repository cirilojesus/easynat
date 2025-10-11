import React from "react";
import { ScrollView as RNScrollView, ScrollViewProps, StyleSheet, Platform } from "react-native";
import { useTheme } from "./theme-provider";
import { BSTextProps } from "./Text";
import { BSDefaultProps, DEFAULT_PROPS } from "./utils/DEFAULT_PROPS";
import { renderChild } from "./utils/helpers";

export type BSScrollViewProps = ScrollViewProps & BSDefaultProps & {
    _ios?: BSScrollViewProps;
    _android?: BSScrollViewProps;
    _web?: BSScrollViewProps;
    _text?: BSTextProps;
    _contentContainerStyle?: BSScrollViewProps;
};

export const ScrollView: React.FC<BSScrollViewProps> = ({
    style,
    children,
    ...props
}) => {
    const { theme } = useTheme();

    const combinedProps: BSScrollViewProps = {
        ...props,
        ...(Platform.OS === "ios" ? props._ios : {}),
        ...(Platform.OS === "android" ? props._android : {}),
        ...(Platform.OS === "web" ? props._web : {}),
    };

    const styles = DEFAULT_PROPS(combinedProps, theme);
    const contentStyles = DEFAULT_PROPS(combinedProps?._contentContainerStyle || {}, theme);

    const scrollStyle = StyleSheet.flatten([
        style,
        ...styles,
    ]);

    const scrollContentStyle = StyleSheet.flatten([
        ...contentStyles,
        combinedProps.contentContainerStyle
    ]);

    return (
        <RNScrollView
            {...props}
            style={scrollStyle}
            contentContainerStyle={scrollContentStyle}
        >
            {renderChild(children, props._text)}
        </RNScrollView>
    );
};
