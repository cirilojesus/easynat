import React from "react";
import { TextStyle } from "react-native";
import * as ICONS from "@expo/vector-icons";
import { BSDefaultProps, DEFAULT_PROPS } from "./utils/DEFAULT_PROPS";
import { Theme } from "./theme";
import { useTheme } from "./theme-provider";

type IconLibrary = keyof typeof ICONS;

export type IconProps = BSDefaultProps & {
    name: string;
    as: IconLibrary; // nombre del set de iconos
    size?: number;
    color?: keyof Theme["colors"] | `#${string}` | `rgb${string}`;
};

export const Icon: React.FC<IconProps> = ({
    name,
    as = "MaterialIcons", // por defecto
    size = 20,
    color = "text",
    ...props
}) => {
    const { theme } = useTheme();
    const styles = DEFAULT_PROPS(props, theme) as TextStyle[];

    const IconComponent = ICONS[as];

    return (
        <IconComponent
            name={name}
            size={size}
            color={theme.colors?.[color as keyof Theme["colors"]] || color}
            style={styles}
        />
    );
};
