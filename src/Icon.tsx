import * as ICONS from "@expo/vector-icons";
import { BSDefaultProps, DEFAULT_PROPS } from "./utils/DEFAULT_PROPS";
import { Theme } from "./theme";
import { useTheme } from "./theme-provider";
import { ViewStyle } from "react-native";
import { forwardRef } from "react";

type IconLibrary = keyof typeof ICONS;

export type IconProps = BSDefaultProps & {
    name: string;
    as: IconLibrary; // nombre del set de iconos
    size?: number;
    color?: keyof Theme["colors"];
    style?: ViewStyle
};

export const Icon = forwardRef<any, IconProps>(
    ({ name, as = "MaterialIcons", size = 20, color = "dark", style, ...props }, ref) => {
        const { theme } = useTheme();
        const styles = DEFAULT_PROPS(props, theme);
        const IconComponent = ICONS[as];

        return (
            <IconComponent
                ref={ref} // <-- reenviamos el ref
                name={name}
                size={size}
                color={theme.colors?.[color] || color}
                style={[style, ...styles]}
            />
        );
    }
);
Icon.displayName = "Icon";

