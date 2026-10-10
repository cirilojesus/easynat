import React, { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Animated } from "react-native";
import { Text, EATextProps } from "./Text";
import { useThemeProps } from "./utils/useThemeProps";

export type LabelType = EATextProps & {
    isFloat?: boolean;
    isRequired?: boolean;
    /** Alto del campo que va debajo (flotante): en reposo, el label se centra en él */
    fieldHeight?: number;
}

// Cuánto se mete el label flotante en el campo de debajo (su marginBottom negativo)
const OVERLAP = 10;

export type LabelRef = {
    animate: (value: boolean) => void
}

const AnimatedText = Animated.createAnimatedComponent(Text);

type LabelComponent = React.ForwardRefExoticComponent<
    LabelType & React.RefAttributes<LabelRef>
>;

export const Label = forwardRef<LabelRef, LabelType>(
    (rawProps, ref) => {
        // Defaults → theme.components.Label → variante → props → plataforma
        // (variant es del Label: no se pasa al Text interno)
        const [{ isFloat, isRequired, fieldHeight, variant: _variant, ...props }, theme] = useThemeProps<LabelType>('Label', rawProps);
        const animation = useRef(new Animated.Value(0)).current;
        // En reposo (dentro del campo) se centra en él: depende del alto del campo y del propio label
        // (un desplazamiento fijo solo cuadraba con unas medidas concretas)
        const [height, setHeight] = useState(0);
        // Arriba (sobre el borde) lleva fondo para tapar la línea; abajo (dentro del campo) es transparente
        const [raised, setRaised] = useState(false);
        const restY = fieldHeight && height ? fieldHeight / 2 + height / 2 - OVERLAP : 20;

        useImperativeHandle(ref, () => ({
            animate: (value: boolean) => {
                setRaised(value);
                Animated.timing(animation, {
                    toValue: value ? 1 : 0,
                    duration: 100,
                    useNativeDriver: true,
                }).start();
            }
        }), []);

        return (
            <AnimatedText
                pointerEvents="none"
                style={[
                    isFloat
                        ? {
                            padding: 3,
                            marginLeft: 10,
                            // Tapa el borde del campo: del color del fondo (con _label={{ style: { backgroundColor } }} se cambia)
                            backgroundColor: raised ? theme.colors?.background ?? '#fff' : 'transparent',
                            zIndex: 1000,
                            marginRight: 'auto',
                            marginBottom: -OVERLAP,
                            transform: [
                                {
                                    translateY: animation.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [restY, 1],
                                    })
                                }
                            ]
                        }
                        : { marginBottom: 4 },
                ]}
                {...props}
                onLayout={e => {
                    const h = e.nativeEvent.layout.height;
                    if (Math.round(h) !== Math.round(height)) setHeight(h);
                    props.onLayout?.(e);
                }}
            >
                {props.children}
                {isRequired && <Text color={'danger.100'}> *</Text>}
            </AnimatedText>
        );
    }
) as LabelComponent;
