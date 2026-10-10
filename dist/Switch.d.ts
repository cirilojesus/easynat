import React from "react";
import { SwitchProps as RNSwitchProps } from "react-native";
import { EADefaultProps } from "./utils/DEFAULT_PROPS";
import { COLOR_SCHEME } from "./theme";
import { EAButtonProps } from "./Button";
export type EASwitchProps = RNSwitchProps & EADefaultProps & {
    _ios?: Omit<EASwitchProps, '_ios' | '_android' | '_web'>;
    _android?: Omit<EASwitchProps, '_ios' | '_android' | '_web'>;
    _web?: Omit<EASwitchProps, '_ios' | '_android' | '_web'>;
    scale?: number;
    colorScheme?: COLOR_SCHEME;
    _containerStyle?: EAButtonProps;
    pointerBox?: boolean;
    label?: string;
    variant?: (string & {});
};
export declare const Switch: React.FC<EASwitchProps>;
