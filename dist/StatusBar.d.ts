import React from "react";
import { StatusBarProps as RNStatusBarProps } from "react-native";
import { EADefaultProps } from "./utils/DEFAULT_PROPS";
export type EAStatusBarProps = RNStatusBarProps & EADefaultProps & {
    _ios?: EAStatusBarProps;
    _android?: EAStatusBarProps;
    _web?: EAStatusBarProps;
    variant?: (string & {});
};
export declare const StatusBar: React.FC<EAStatusBarProps>;
