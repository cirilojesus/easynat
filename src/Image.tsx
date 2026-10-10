import React from "react";
import {
    Image as RNImage,
    ImageProps,
    ImageStyle,
    StyleSheet,
    ImageSourcePropType,
} from "react-native";
import { EADefaultProps, DEFAULT_PROPS } from "./utils/DEFAULT_PROPS";
import { Box, EABoxProps } from "./Box";
import { useThemeProps } from "./utils/useThemeProps";

export type EAImageProps = ImageProps & EADefaultProps & {
    _alt?: EABoxProps; // texto fallback si no carga la imagen
    _ios?: EAImageProps;
    _android?: EAImageProps;
    _web?: EAImageProps;
    fallback?: ImageSourcePropType; // nodo alternativo si falla la imagen
    size?: number
    variant?: (string & {});
};

export const Image: React.FC<EAImageProps> = (props) => {
    const [error, setError] = React.useState<'fallback' | 'alt' | ''>('');

    // Defaults → theme.components.Image → variante → props → plataforma
    const [{ style, fallback, variant: _variant, ...combinedProps }, theme] = useThemeProps<EAImageProps>('Image', props);

    const styles = DEFAULT_PROPS(combinedProps, theme);
    const baseStyle = StyleSheet.flatten<ImageStyle>([
        {
            width: combinedProps?.size || 50,
            height: combinedProps?.size || 50
        },
        style,
        ...styles
    ]);

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
