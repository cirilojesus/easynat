import * as ICONS from "@expo/vector-icons";
import { EADefaultProps, DEFAULT_PROPS } from "./utils/DEFAULT_PROPS";
import { ThemeColor } from "./theme";
import React, { forwardRef } from "react";
import { IconButtonProps } from "@expo/vector-icons/build/createIconSet";
import { useThemeProps } from "./utils/useThemeProps";

type IconLibrary = keyof typeof ICONS;

type IconRef = React.ComponentRef<(typeof ICONS)[keyof typeof ICONS]>;

export type IconProps<L extends IconLibrary> = Omit<IconButtonProps<typeof ICONS[L]>, "color" | 'name'> & EADefaultProps & {
    as: L;
    color?: ThemeColor;
    name: keyof typeof ICONS[L]['glyphMap'];
    variant?: (string & {});
};

/** --- 1. Tipo del componente genérico --- */
type IconComponent = <L extends IconLibrary>(
    props: IconProps<L> & { ref?: React.Ref<IconRef> }
) => React.ReactElement | null;

/** --- 2. Implementación interna --- */
const IconBase = forwardRef(<L extends IconLibrary>(rawProps: IconProps<L>, ref: React.Ref<IconRef>) => {
    // Defaults → theme.components.Icon → variante → props → plataforma
    const [{ variant: _variant, ...props }, theme] = useThemeProps<IconProps<L>>('Icon', rawProps, { defaults: { size: 18 } as Partial<IconProps<L>> });
    const styles = DEFAULT_PROPS(props, theme);

    const IconComponent = ICONS[props.as] as any;

    return (
        <IconComponent
            {...props}
            ref={ref}
            color={theme.colors?.[props.color] || props.color}
            style={[props.style, ...styles]}
        />
    );
}
) as unknown as IconComponent;

/** --- 3. Export final con genéricos preservados --- */
export const Icon = IconBase;

