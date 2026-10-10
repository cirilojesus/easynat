import React from "react";
import { ThemeColor } from "./theme";
import { Box, EABoxProps } from "./Box";
import { Icon } from "./Icon";
import { EAButtonProps, Button } from "./Button";

import { mergeProps, useThemeProps } from "./utils/useThemeProps";
export type EACheckBoxProps = Omit<EAButtonProps, '_ios' | '_android' | '_web'> & {
    checked?: boolean;
    onChange?: (checked: boolean) => void;
    pointerBox?: boolean,
    label?: string;
    color?: ThemeColor;
    variant?: (string & {});
    size?: 'sm' | 'md' | 'lg' | 'xl';
    _containerIcon?: EABoxProps;
    _ios?: Omit<EACheckBoxProps, '_ios' | '_android' | '_web'>;
    _android?: Omit<EACheckBoxProps, '_ios' | '_android' | '_web'>;
    _web?: Omit<EACheckBoxProps, '_ios' | '_android' | '_web'>;
};

const CHECKBOX_SIZES: Record<NonNullable<EACheckBoxProps['size']>, EACheckBoxProps> = {
    sm: { _containerIcon: { w: 18, height: 18 }, _icon: { size: 12 }, _text: { fontSize: 12 } },
    md: { _containerIcon: { w: 22, height: 22 }, _icon: { size: 14 }, _text: { fontSize: 14 } },
    lg: { _containerIcon: { w: 26, height: 26 }, _icon: { size: 16 }, _text: { fontSize: 16 } },
    xl: { _containerIcon: { w: 30, height: 30 }, _icon: { size: 18 }, _text: { fontSize: 18 } },
};

export const CheckBox: React.FC<EACheckBoxProps> = (props) => {
    // Defaults → theme.components.CheckBox → variante → tamaño → props → plataforma
    const [combinedProps, theme] = useThemeProps<EACheckBoxProps>('CheckBox', props, { defaults: { colorScheme: 'primary' }, sizes: CHECKBOX_SIZES });

    const {
        checked = false,
        onChange,
        label,
        pointerBox = false,
        // variant y size son del CheckBox, no del Button interno
        variant: _variant,
        size: _size,
        ...rest
    } = combinedProps;

    return (
        <Button
            variant={'unstyle'}
            flexDir="row"
            alignItems={'center'}
            justifyContent={'flex-start'}
            pointerEvents={pointerBox ? 'box-only' : 'box-none'}
            p={0}
            accessibilityRole="checkbox"
            accessibilityState={{ checked, disabled: !!rest.disabled }}
            {...rest}
            _pressed={mergeProps(combinedProps._pressed, {
                _icon: { bg: checked ? theme.colors[combinedProps.colorScheme + '.200'] : theme.colors[combinedProps.colorScheme + '.50'], ...combinedProps._pressed?._icon }
            })}
            onPress={(e) => {
                onChange?.(!checked)
                rest.onPress?.(e)
            }}
            icon={
                <Box w={22} height={22} borderWidth={1} bg={checked ? combinedProps.colorScheme + '.100' : 'transparent'}
                    borderColor={checked ? combinedProps.colorScheme + '.100' : 'light.200'} rounded={1}
                    // Centrado: la marca quedaba arriba a la izquierda de la caja
                    alignItems="center" justifyContent="center"
                    {...combinedProps._containerIcon}>
                    {checked ? combinedProps.icon || <Icon name={'check'} as={'Feather'} color="white" {...combinedProps._icon} /> : null}
                </Box>
            }
            _text={{ textAlign: 'left', ...combinedProps._text }}
        >
            {label}
        </Button>
    );
};
