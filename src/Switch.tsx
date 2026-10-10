import React from "react";
import {
    Switch as RNSwitch,
    SwitchProps as RNSwitchProps,
} from "react-native";
import { EADefaultProps, DEFAULT_PROPS } from "./utils/DEFAULT_PROPS";
import { COLOR_SCHEME } from "./theme";
import { EAButtonProps, Button } from "./Button";
import { useThemeProps } from "./utils/useThemeProps";

export type EASwitchProps = RNSwitchProps & EADefaultProps & {
    _ios?: Omit<EASwitchProps, '_ios' | '_android' | '_web'>;
    _android?: Omit<EASwitchProps, '_ios' | '_android' | '_web'>;
    _web?: Omit<EASwitchProps, '_ios' | '_android' | '_web'>;
    scale?: number;
    colorScheme?: COLOR_SCHEME;
    _containerStyle?: EAButtonProps;
    pointerBox?: boolean;
    label?: string;
    variant?: (string & {});
};

export const Switch: React.FC<EASwitchProps> = (props) => {
    // Defaults → theme.components.Switch → variante → props → plataforma
    const [combinedProps, theme] = useThemeProps<EASwitchProps>('Switch', props);

    const styles = DEFAULT_PROPS(combinedProps, theme);

    const {
        colorScheme = "primary",
        _containerStyle,
        pointerBox,
        label,
        scale = 1,
        variant: _variant,
        ...rest
    } = combinedProps;


    // transform: scale no ocupa espacio: se compensa con margen. Cada lado crece la MITAD del aumento del
    // tamaño real del switch (se mide; antes era un ancho fijo y todo el aumento a cada lado, el doble)
    const [size, setSize] = React.useState({ w: 51, h: 31 });
    const extraX = (scale - 1) * size.w / 2;
    const extraY = (scale - 1) * size.h / 2;

    return (
        <Button
            variant="unstyle"
            minH={size.h * scale}
            p={0}
            onPress={() => !combinedProps.disabled && combinedProps.onValueChange?.(!combinedProps.value)}
            _pressed={{ _text: { color: theme.colors[colorScheme + '.100'] } }}
            justifyContent={'flex-start'}
            pointerEvents={pointerBox ? 'auto' : 'box-none'}
            {..._containerStyle}
        >
            <RNSwitch
                // Bolita blanca sobre el carril: con los dos en light.100, apagado la bolita no se veía
                trackColor={{
                    false: theme.colors['muted.100'],
                    true: theme.colors[colorScheme + '.100'],
                }}
                thumbColor={theme.colors['white']}
                ios_backgroundColor={theme.colors['muted.100']}
                {...rest}
                onLayout={e => {
                    const { width, height } = e.nativeEvent.layout;
                    if (Math.round(width) !== Math.round(size.w) || Math.round(height) !== Math.round(size.h)) setSize({ w: width, h: height });
                    rest.onLayout?.(e);
                }}
                style={[
                    {
                        marginHorizontal: extraX,
                        marginVertical: extraY,
                        transform: [{ scale }]
                    },
                    rest.style,
                    ...styles
                ]}
            />
            {label}
        </Button>

    );
};
