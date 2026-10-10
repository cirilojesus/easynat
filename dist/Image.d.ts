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
    size?: number;
    variant?: (string & {});
};
export declare const Image: React.FC<EAImageProps>;
