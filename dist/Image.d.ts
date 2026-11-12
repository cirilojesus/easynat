import React from "react";
import { ImageProps, ImageSourcePropType } from "react-native";
import { EADefaultProps } from "./utils/DEFAULT_PROPS";
import { EABoxProps } from "./Box";
export type EAImageProps = ImageProps & EADefaultProps & {
    _alt?: EABoxProps;
    _ios?: EAImageProps;
    _android?: EAImageProps;
    _web?: EAImageProps;
    fallback?: ImageSourcePropType;
    /** Ancho y alto iguales (cuadrada). Sin size, ni ancho ni alto: ocupa todo el ancho (100%) con la proporción de la imagen */
    size?: number;
    variant?: (string & {});
};
export declare const Image: React.FC<EAImageProps>;
