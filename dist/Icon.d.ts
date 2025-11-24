import * as ICONS from "@expo/vector-icons";
import { BSDefaultProps } from "./utils/DEFAULT_PROPS";
import { Theme } from "./theme";
import { ViewStyle } from "react-native";
import React from "react";
type IconLibrary = keyof typeof ICONS;
export type IconProps = BSDefaultProps & {
    name: string;
    as: IconLibrary;
    size?: number;
    color?: keyof Theme["colors"];
    style?: ViewStyle;
};
export declare const Icon: React.ForwardRefExoticComponent<Omit<any, "ref"> & React.RefAttributes<unknown>>;
export {};
