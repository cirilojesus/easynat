import * as ICONS from "@expo/vector-icons";
import { EADefaultProps } from "./utils/DEFAULT_PROPS";
import { ThemeColor } from "./theme";
import React from "react";
import { IconButtonProps } from "@expo/vector-icons/build/createIconSet";
type IconLibrary = keyof typeof ICONS;
type IconRef = React.ComponentRef<(typeof ICONS)[keyof typeof ICONS]>;
export type IconProps<L extends IconLibrary> = Omit<IconButtonProps<typeof ICONS[L]>, "color" | 'name'> & EADefaultProps & {
    as: L;
    color?: ThemeColor;
    name: keyof typeof ICONS[L]['glyphMap'];
    variant?: (string & {});
};
/** --- 1. Tipo del componente genérico --- */
type IconComponent = <L extends IconLibrary>(props: IconProps<L> & {
    ref?: React.Ref<IconRef>;
}) => React.ReactElement | null;
/** --- 3. Export final con genéricos preservados --- */
export declare const Icon: IconComponent;
export {};
