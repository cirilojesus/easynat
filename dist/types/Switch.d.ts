import React from "react";
import { SwitchProps as RNSwitchProps } from "react-native";
import { BSDefaultProps } from "./utils/DEFAULT_PROPS";
import { COLOR_SCHEME } from "./theme";
import { BSButtonProps } from "./Button";
export type EASwitchProps = RNSwitchProps & BSDefaultProps & {
    _ios?: EASwitchProps;
    _android?: EASwitchProps;
    _web?: EASwitchProps;
    size?: number;
    colorScheme?: COLOR_SCHEME;
    _containerStyle?: BSButtonProps;
    pointerBox?: boolean;
};
export declare const Switch: React.FC<EASwitchProps>;
