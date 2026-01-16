import * as ICONS from "@expo/vector-icons";
import { BSDefaultProps, DEFAULT_PROPS } from "./utils/DEFAULT_PROPS";
import { Theme } from "./theme";
import { useTheme } from "./theme-provider";
import { forwardRef } from "react";
import { IconButtonProps } from "@expo/vector-icons/build/createIconSet";

type IconLibrary = keyof typeof ICONS;

type IconRef = React.ComponentRef<(typeof ICONS)[keyof typeof ICONS]>;

export type IconProps<L extends IconLibrary> = Omit<IconButtonProps<typeof ICONS[L]>, "color" | 'name'> & BSDefaultProps & {
    as: L;
    color?: keyof Theme["colors"];
    name: keyof typeof ICONS[L]['glyphMap'];
};

/** --- 1. Tipo del componente genérico --- */
type IconComponent = <L extends IconLibrary>(
    props: IconProps<L> & { ref?: React.Ref<IconRef> }
) => React.ReactElement | null;

/** --- 2. Implementación interna --- */
const IconBase = forwardRef(<L extends IconLibrary>(props: IconProps<L>, ref: React.Ref<IconRef>) => {
    const { theme } = useTheme();
    const styles = DEFAULT_PROPS(props, theme);

    const IconComponent = ICONS[props.as];

    return (
        <IconComponent
            {...props}
            ref={ref}
            size={props.size || 18}
            color={theme.colors?.[props.color] || props.color}
            style={[props.style, ...styles]}
        />
    );
}
) as unknown as IconComponent;

/** --- 3. Export final con genéricos preservados --- */
export const Icon = IconBase;

