/// <reference types="react" />
import * as ICONS from "@expo/vector-icons";
import { BSDefaultProps } from "./utils/DEFAULT_PROPS";
import { Theme } from "./theme";
import { IconButtonProps } from "@expo/vector-icons/build/createIconSet";
type IconLibrary = keyof typeof ICONS;
type IconRef = React.ComponentRef<(typeof ICONS)[keyof typeof ICONS]>;
export type IconProps<L extends IconLibrary> = Omit<IconButtonProps<typeof ICONS[L]>, "color" | 'name'> & BSDefaultProps & {
    as: L;
    color?: keyof Theme["colors"];
    name: keyof typeof ICONS[L]['glyphMap'];
};
/** --- 1. Tipo del componente genérico --- */
type IconComponent = <L extends IconLibrary>(props: IconProps<L> & {
    ref?: React.Ref<IconRef>;
}) => React.ReactElement | null;
/** --- 3. Export final con genéricos preservados --- */
export declare const Icon: IconComponent;
export {};
