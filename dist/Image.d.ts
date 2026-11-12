import React from "react";
import { ImageProps, ImageSourcePropType } from "react-native";
import { EADefaultProps } from "./utils/DEFAULT_PROPS";
import { EABoxProps } from "./Box";
export type EAImageProps = ImageProps & EADefaultProps & {
    /** Estilo de la caja que sale si no carga la imagen (ni el fallback): fondo gris con un icono y el texto de `alt` */
    _alt?: EABoxProps;
    _ios?: EAImageProps;
    _android?: EAImageProps;
    _web?: EAImageProps;
    fallback?: ImageSourcePropType;
    /**
     * Ancho y alto iguales (cuadrada). Sin size, ni ancho ni alto: ocupa todo el ancho (100%) con la proporción de la
     * imagen; en una fila (flexDir="row") varias se reparten el ancho (o usa flex={1}, o flex distintos para repartir a tu gusto)
     */
    size?: number;
    variant?: (string & {});
};
export declare const Image: React.FC<EAImageProps>;
