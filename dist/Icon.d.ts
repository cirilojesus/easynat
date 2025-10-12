import * as ICONS from "@expo/vector-icons";
import { BSDefaultProps } from "./utils/DEFAULT_PROPS";
import { Theme } from "./theme";
import { ViewStyle } from "react-native";
type IconLibrary = keyof typeof ICONS;
export type IconProps = BSDefaultProps & {
    name: string;
    as: IconLibrary;
    size?: number;
    color?: keyof Theme["colors"];
    style?: ViewStyle;
};
export declare const Icon: import("react").ForwardRefExoticComponent<any>;
export {};
