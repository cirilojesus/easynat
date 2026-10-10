import React from "react";
import { PressableProps } from "react-native";
import { EADefaultProps } from "./utils/DEFAULT_PROPS";
import { EATextProps } from "./Text";
export type EAPressableProps = PressableProps & EADefaultProps & {
    _text?: EATextProps;
    _ios?: Omit<EAPressableProps, '_ios' | '_android' | '_web'>;
    _android?: Omit<EAPressableProps, '_ios' | '_android' | '_web'>;
    _web?: Omit<EAPressableProps, '_ios' | '_android' | '_web'>;
    _pressed?: Omit<EAPressableProps, '_pressed' | '_ios' | '_android' | '_web'>;
    variant?: (string & {});
};
export declare const Pressable: React.FC<EAPressableProps>;
