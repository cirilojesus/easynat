import React from "react";
import {
    Image as RNImage,
    ImageProps,
    ImageStyle,
    StyleSheet,
    ImageSourcePropType,
} from "react-native";
import { EADefaultProps, DEFAULT_PROPS, withoutStyleProps } from "./utils/DEFAULT_PROPS";
import { Box, EABoxProps } from "./Box";
import { useThemeProps } from "./utils/useThemeProps";
import { Icon } from "./Icon";
import { Text } from "./Text";

export type EAImageProps = ImageProps & EADefaultProps & {
    /** Estilo de la caja que sale si no carga la imagen (ni el fallback): fondo gris con un icono y el texto de `alt` */
    _alt?: EABoxProps;
    _ios?: EAImageProps;
    _android?: EAImageProps;
    _web?: EAImageProps;
    fallback?: ImageSourcePropType; // nodo alternativo si falla la imagen
    /**
     * Ancho y alto iguales (cuadrada). Sin size, ni ancho ni alto: ocupa todo el ancho (100%) con la proporción de la
     * imagen; en una fila (flexDir="row") varias se reparten el ancho (o usa flex={1}, o flex distintos para repartir a tu gusto)
     */
    size?: number
    variant?: (string & {});
};

// Proporción (ancho / alto) real de una imagen: la de un require() al momento y la de una uri al cargarla
const useAspectRatio = (source: ImageProps['source'], enabled: boolean) => {
    const uri = enabled && source && typeof source === 'object' && !Array.isArray(source) ? (source as any).uri as string | undefined : undefined;
    const local = enabled && typeof source === 'number' ? (RNImage as any).resolveAssetSource?.(source) : null;
    // 0: no se pudo saber (la imagen no carga)
    const [ratios, setRatios] = React.useState<Record<string, number>>({});
    React.useEffect(() => {
        if (!uri || ratios[uri] != null || !RNImage.getSize) return;
        let alive = true;
        RNImage.getSize(uri, (w, h) => { if (alive && w > 0 && h > 0) setRatios(r => ({ ...r, [uri]: w / h })) },
            () => { if (alive) setRatios(r => ({ ...r, [uri]: 0 })) });
        return () => { alive = false };
    }, [uri]);
    // Al cargar, la imagen dice su tamaño (getSize falla con algunas, p. ej. data: URIs en Android)
    const onLoaded = (w?: number, h?: number) => {
        if (uri && w && h && w > 0 && h > 0 && Math.abs((ratios[uri] ?? 0) - w / h) > 0.001) setRatios(r => ({ ...r, [uri]: w / h }));
    };
    if (local?.width && local?.height) return [local.width / local.height, onLoaded] as const;
    return [uri ? ratios[uri] : undefined, onLoaded] as const;
};

// Proporción provisional mientras no se conoce la real: con alto 0 la imagen no se vería (ni cargaría en algunos casos)
const PROVISIONAL_RATIO = 16 / 9;

export const Image: React.FC<EAImageProps> = (props) => {
    const [error, setError] = React.useState<'fallback' | 'alt' | ''>('');

    // Defaults → theme.components.Image → variante → props → plataforma
    const [{ style, fallback, variant: _variant, ...combinedProps }, theme] = useThemeProps<EAImageProps>('Image', props);
    // Otra imagen: se vuelve a intentar (el error era de la anterior)
    const sourceKey = JSON.stringify(combinedProps.source ?? null);
    const [errorFor, setErrorFor] = React.useState(sourceKey);
    if (errorFor !== sourceKey) {
        setErrorFor(sourceKey);
        if (error) setError('');
    }

    const styles = DEFAULT_PROPS(combinedProps, theme);
    const own = StyleSheet.flatten<ImageStyle>([style, ...styles]);
    const { size } = combinedProps;
    // Sin size: todo el ancho y, si tampoco hay alto ni proporción, la proporción real de la imagen (sin ella,
    // una imagen remota con width 100% saldría con alto 0)
    // (con flex también: en una fila, flex da el ancho y la proporción el alto; en una columna con alto y ancho
    // fijados, Yoga ignora la proporción)
    const auto = !size && own.height == null && own.aspectRatio == null;
    const [ratio, onLoaded] = useAspectRatio(combinedProps.source, auto);
    const baseStyle = StyleSheet.flatten<ImageStyle>([
        size
            ? { width: size, height: size }
            // flexShrink: en una fila, varias imágenes sin ancho se reparten el espacio en vez de salirse
            : { width: '100%', flexShrink: 1, ...(auto ? { aspectRatio: ratio || PROVISIONAL_RATIO } : null) },
        own,
    ]);

    if (error == 'fallback') {
        return (
            <RNImage
                {...withoutStyleProps(combinedProps)}
                source={fallback}
                style={baseStyle}
                onError={() => setError('alt')}
            />
        );
    }

    if (error == 'alt') {
        // Hueco gris con un icono (y el texto de alt) del mismo tamaño; sin proporción conocida, 16:9
        const { alt, _alt } = combinedProps;
        const iconSize = Math.max(16, Math.min(32, Number(size) / 2 || 32));
        return (
            <Box
                style={baseStyle}
                bg="light.50" alignItems="center" justifyContent="center" gap={4} overflow="hidden"
                accessibilityRole="image" accessibilityLabel={alt}
                {..._alt}
            >
                <Icon as="Feather" name="image" size={iconSize} color="text.subtle" />
                {!!alt && (!size || size >= 80) && <Text fontSize={12} color="text.subtle" textAlign="center" px={2} numberOfLines={2}>{alt}</Text>}
            </Box>
        )
    }

    return (
        <RNImage
            {...withoutStyleProps(combinedProps)}
            style={baseStyle}
            onLoad={e => {
                const src: any = (e.nativeEvent as any)?.source;
                onLoaded(src?.width, src?.height);
                combinedProps.onLoad?.(e);
            }}
            onError={() => setError(fallback ? 'fallback' : 'alt')}
        />
    );
};
