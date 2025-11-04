import React from "react";
import { Image as RNImage, Platform, StyleSheet, } from "react-native";
import { useTheme } from "./theme-provider";
import { DEFAULT_PROPS } from "./utils/DEFAULT_PROPS";
import { Box } from "./Box";
export const Image = ({ style, fallback, ...props }) => {
    const { theme } = useTheme();
    const [error, setError] = React.useState('');
    // Overrides por plataforma
    const combinedProps = {
        ...props,
        ...(Platform.OS === "ios" ? props._ios : {}),
        ...(Platform.OS === "android" ? props._android : {}),
        ...(Platform.OS === "web" ? props._web : {}),
    };
    const styles = DEFAULT_PROPS(combinedProps, theme);
    const baseStyle = StyleSheet.flatten([style, ...styles]);
    if (error == 'fallback') {
        return (<RNImage {...combinedProps} source={fallback} style={baseStyle} onError={() => setError('alt')}/>);
    }
    if (error == 'alt') {
        return (<Box style={baseStyle} {...combinedProps?._alt}>
                {combinedProps.alt}
            </Box>);
    }
    return (<RNImage {...combinedProps} style={baseStyle} onError={() => setError(fallback ? 'fallback' : 'alt')}/>);
};
