import React from "react";
import { ScrollView as RNScrollView, StyleSheet, Platform } from "react-native";
import { useTheme } from "./theme-provider";
import { DEFAULT_PROPS } from "./utils/DEFAULT_PROPS";
import { renderChild } from "./utils/helpers";
export const ScrollView = ({ style, children, ...props }) => {
    const { theme } = useTheme();
    const combinedProps = {
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
    return (<RNScrollView {...props} style={scrollStyle} contentContainerStyle={scrollContentStyle}>
            {renderChild(children, props._text)}
        </RNScrollView>);
};
