import React from "react";
import { SwitchProps as RNSwitchProps } from "react-native";
import { BSDefaultProps } from "./utils/DEFAULT_PROPS";
import { COLOR_SCHEME } from "./theme";
import { BSButtonProps } from "./Button";
export type EASwitchProps = RNSwitchProps & BSDefaultProps & {
    _ios?: Omit<EASwitchProps, '_ios' | '_android' | '_web'>;
    _android?: Omit<EASwitchProps, '_ios' | '_android' | '_web'>;
    _web?: Omit<EASwitchProps, '_ios' | '_android' | '_web'>;
    size?: number;
    scale?: number;
    colorScheme?: COLOR_SCHEME;
    _containerStyle?: BSButtonProps;
    pointerBox?: boolean;
    label?: string;
};
export declare const Switch: React.FC<EASwitchProps>;
