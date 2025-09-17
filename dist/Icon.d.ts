import React from "react";
import * as ICONS from "@expo/vector-icons";
import { BSDefaultProps } from "./utils/DEFAULT_PROPS";
import { Theme } from "./theme";
type IconLibrary = keyof typeof ICONS;
export type IconProps = BSDefaultProps & {
    name: string;
    as: IconLibrary;
    size?: number;
    color?: keyof Theme["colors"] | `#${string}` | `rgb${string}`;
};
export declare const Icon: React.FC<IconProps>;
export {};
