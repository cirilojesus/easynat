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
    /** Ancho y alto iguales (cuadrada). Sin size, ni ancho ni alto: ocupa todo el ancho (100%) con la proporción de la imagen */
    size?: number
    variant?: (string & {});
};

// Proporción (ancho / alto) real de una imagen: la de un require() al momento y la de una uri al cargarla
const useAspectRatio = (source: ImageProps['source'], enabled: boolean) => {
    const uri = enabled && source && typeof source === 'object' && !Array.isArray(source) ? (source as any).uri as string | undefined : undefined;
    const local = enabled && typeof source === 'number' ? (RNImage as any).resolveAssetSource?.(source) : null;
    const [ratios, setRatios] = React.useState<Record<string, number>>({});
    React.useEffect(() => {
        if (!uri || ratios[uri] || !RNImage.getSize) return;
        let alive = true;
        RNImage.getSize(uri, (w, h) => { if (alive && w > 0 && h > 0) setRatios(r => ({ ...r, [uri]: w / h })) }, () => { });
        return () => { alive = false };
    }, [uri]);
    if (local?.width && local?.height) return local.width / local.height;
    return uri ? ratios[uri] : undefined;
};

export const Image: React.FC<EAImageProps> = (props) => {
    const [error, setError] = React.useState<'fallback' | 'alt' | ''>('');

    // Defaults → theme.components.Image → variante → props → plataforma
    const [{ style, fallback, variant: _variant, ...combinedProps }, theme] = useThemeProps<EAImageProps>('Image', props);

    const styles = DEFAULT_PROPS(combinedProps, theme);
    const own = StyleSheet.flatten<ImageStyle>([style, ...styles]);
    const { size } = combinedProps;
    // Sin size: todo el ancho y, si tampoco hay alto ni proporción, la proporción real de la imagen (sin ella,
    // una imagen remota con width 100% saldría con alto 0)
    const auto = !size && own.height == null && own.aspectRatio == null && own.flex == null;
    const ratio = useAspectRatio(combinedProps.source, auto);
    const baseStyle = StyleSheet.flatten<ImageStyle>([
        size
            ? { width: size, height: size }
            : { width: '100%', ...(auto && ratio ? { aspectRatio: ratio } : null) },
        own,
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
