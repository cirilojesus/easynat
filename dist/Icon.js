import * as ICONS from "@expo/vector-icons";
import { DEFAULT_PROPS } from "./utils/DEFAULT_PROPS";
import { useTheme } from "./theme-provider";
import { forwardRef } from "react";
export const Icon = forwardRef(({ name, as = "MaterialIcons", size = 20, color = "dark", style, ...props }, ref) => {
    const { theme } = useTheme();
    const styles = DEFAULT_PROPS(props, theme);
    const IconComponent = ICONS[as];
    return (<IconComponent ref={ref} // <-- reenviamos el ref
     name={name} size={size} color={theme.colors?.[color] || color} style={[style, ...styles]}/>);
});
Icon.displayName = "Icon";
