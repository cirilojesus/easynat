import React from "react";
import { ThemeColor } from "./theme";
import { Box, EABoxProps } from "./Box";
import { mergeProps, useThemeProps } from "./utils/useThemeProps";
import { EAButtonProps, Button } from "./Button";

export type EARadioProps = EAButtonProps & {
    checked?: boolean;
    value?: any,
    onChange?: (value: any) => void;
    pointerBox?: boolean,
    label?: string | number;
    color?: ThemeColor;
    _ios?: EARadioProps;
    _android?: EARadioProps;
    _web?: EARadioProps;
    /** Estilo del círculo */
    _containerIcon?: EABoxProps;
};

const RADIO_SIZES: Record<'sm' | 'md' | 'lg' | 'xl', EARadioProps> = {
    sm: { _containerIcon: { w: 18, height: 18 }, _text: { fontSize: 12 } },
    md: { _containerIcon: { w: 22, height: 22 }, _text: { fontSize: 14 } },
    lg: { _containerIcon: { w: 26, height: 26 }, _text: { fontSize: 16 } },
    xl: { _containerIcon: { w: 30, height: 30 }, _text: { fontSize: 18 } },
};

export const Radio: React.FC<EARadioProps> = (props) => {

    // Defaults → theme.components.Radio → variante → props → plataforma
    const [combinedProps, theme] = useThemeProps<EARadioProps>('Radio', props, { defaults: { colorScheme: 'primary' }, sizes: RADIO_SIZES });

    const {
        checked = false,
        onChange,
        label,
        pointerBox = false,
        // variant, size y _containerIcon son del Radio, no del Button interno
        variant: _variant,
        size: _size,
        _containerIcon,
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
            accessibilityRole="radio"
            accessibilityState={{ checked, disabled: !!rest.disabled }}
            {...rest}
            _pressed={mergeProps(combinedProps._pressed, {
                _icon: { bg: theme.colors[combinedProps.colorScheme + '.50'], ...combinedProps._pressed?._icon }
            })}
            onPress={(e) => {
                onChange?.(combinedProps.value)
                rest.onPress?.(e)
            }}
            icon={
                // Aro del color y un punto centrado (antes un círculo blanco sin centrar dentro del relleno)
                <Box w={22} height={22} borderWidth={checked ? 2 : 1} borderColor={checked ? combinedProps.colorScheme + '.100' : 'light.200'}
                    rounded={40} alignItems="center" justifyContent="center" {..._containerIcon}>
                    {checked ? combinedProps.icon || <Box w="50%" h="50%" rounded={40} bg={combinedProps.colorScheme + '.100'} /> : null}
                </Box>
            }
            _text={{ textAlign: 'left', ...combinedProps._text }}
        >
            {label}
        </Button>
    );
};
