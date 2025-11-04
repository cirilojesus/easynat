import React from "react";
import { ImageProps, ImageSourcePropType } from "react-native";
import { BSDefaultProps } from "./utils/DEFAULT_PROPS";
import { BSBoxProps } from "./Box";
export type BSImageProps = ImageProps & BSDefaultProps & {
    _alt?: BSBoxProps;
    _ios?: BSImageProps;
    _android?: BSImageProps;
    _web?: BSImageProps;
    fallback?: ImageSourcePropType;
};
export declare const Image: React.FC<BSImageProps>;
