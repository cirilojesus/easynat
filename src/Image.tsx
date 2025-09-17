import React from "react";
import {
    Image as RNImage,
    ImageProps,
    ImageStyle,
    Platform,
    StyleSheet,
    View,
    ImageSourcePropType,
} from "react-native";
import { useTheme } from "./theme-provider";
import { BSDefaultProps, DEFAULT_PROPS } from "./utils/DEFAULT_PROPS";
import { Box, BSBoxProps } from "./Box";

export type BSImageProps = ImageProps &
    BSDefaultProps & {
        _alt?: BSBoxProps; // texto fallback si no carga la imagen
        _ios?: BSImageProps;
        _android?: BSImageProps;
        _web?: BSImageProps;
        fallback?: ImageSourcePropType; // nodo alternativo si falla la imagen
    };

export const Image: React.FC<BSImageProps> = ({
    style,
    fallback,
    ...props
}) => {
    const { theme } = useTheme();
    const [error, setError] = React.useState<'fallback' | 'alt' | ''>('');

    // Overrides por plataforma
    const combinedProps: BSImageProps = {
        ...props,
        ...(Platform.OS === "ios" ? props._ios : {}),
        ...(Platform.OS === "android" ? props._android : {}),
        ...(Platform.OS === "web" ? props._web : {}),
    };

    const styles = DEFAULT_PROPS(combinedProps, theme);
    const baseStyle = StyleSheet.flatten<ImageStyle>([style, ...styles]);

    if (error == 'fallback') {
        return (
            <RNImage
                {...combinedProps}
                source={fallback}
                style={baseStyle}
                onError={() => setError('alt')}
            />
        );
    }

    if (error == 'alt') {
        return (
            <Box style={baseStyle} {...combinedProps?._alt}>
                {combinedProps.alt}
            </Box>
        )
    }

    return (
        <RNImage
            {...combinedProps}
            style={baseStyle}
            onError={() => setError(fallback ? 'fallback' : 'alt')}
        />
    );
};
