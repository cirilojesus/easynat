import React, { forwardRef } from "react";
import { FlatList as RNFlatList, Platform, StyleSheet, } from "react-native";
import { useTheme } from "./theme-provider";
import { DEFAULT_PROPS } from "./utils/DEFAULT_PROPS";
/**
 * Componente FlatList con:
 *  - forwardRef (para refs nativas)
 *  - overrides por plataforma
 *  - inferencia de tipo T igual al FlatList nativo
 */
export const FlatList = forwardRef(({ style, ...props }, ref) => {
    const { theme } = useTheme();
    const combinedProps = {
        ...props,
        ...(Platform.OS === "ios" ? props._ios : {}),
        ...(Platform.OS === "android" ? props._android : {}),
        ...(Platform.OS === "web" ? props._web : {}),
    };
    const styles = DEFAULT_PROPS(combinedProps, theme);
    const baseStyle = StyleSheet.flatten([style, ...styles]);
    const contentStyles = DEFAULT_PROPS(combinedProps?._contentContainerStyle || {}, theme);
    return (<RNFlatList ref={ref} contentContainerStyle={[combinedProps.contentContainerStyle, ...contentStyles]} {...combinedProps} style={baseStyle}/>);
});
