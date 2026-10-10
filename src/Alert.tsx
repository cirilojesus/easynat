import { Animated, Pressable } from "react-native";
import RootSiblings from "react-native-root-siblings";
import { Box, EABoxProps } from "./Box";
import { COLOR_SCHEME } from "./theme";
import { useThemeProps } from "./utils/useThemeProps";

export type EAAlertProps = EABoxProps & { colorScheme?: COLOR_SCHEME };

// Contenido del aviso: lee theme.components.Alert (defaults y variantes, p. ej. variants.danger)
const AlertContent = ({ message, ...props }: EAAlertProps & { message: string }) => {
    const [{ colorScheme, variant, ...rest }] = useThemeProps<EAAlertProps>('Alert', props, { defaults: { p: 3, _text: { color: 'white' } } });
    return <Box safeAreaTop bg={colorScheme + '.100'} {...rest}>{message}</Box>;
};

let currentAlert: RootSiblings | null = null;
let timer = null
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
let animate = (value: 1 | 0, callBack?: () => any) => null

/**
 * Muestra un aviso arriba de la pantalla desde cualquier parte (también fuera de los componentes). Baja animado y se
 * cierra solo a los `duration` ms o al tocarlo. Si ya hay uno, lo sustituye
 * @example showAlert('Guardado', 'success');
 * showAlert('Sin conexión', 'danger', { _text: { fontWeight: '700' } }, 5000);
 */
export const showAlert = (message: string, colorScheme: COLOR_SCHEME, props?: EABoxProps, duration = 3000) => {
    if (currentAlert) animate(0)
    let opacity = new Animated.Value(0);

    animate = (value: 1 | 0, callBack?: () => any) => {
        Animated.timing(opacity, {
            toValue: value,
            duration: 200,
            useNativeDriver: true,
        }).start(({ finished }) => {
            if (finished) callBack?.()
        });
    }

    setTimeout(() => {
        if (currentAlert) {
            currentAlert.destroy();
            currentAlert = null;
            clearTimeout(timer)
        }
        currentAlert = new RootSiblings(
            <AnimatedPressable
                style={[
                    {
                        transform: [
                            {
                                translateY: opacity.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [-100, 0],
                                })
                            }
                        ],
                        width: '100%',
                        top: 0,
                        position: "absolute",
                        alignSelf: "center",
                        zIndex: 10000,
                    },
                    { opacity },
                ]}
                onPress={hideAlert}
            >
                <AlertContent message={message} colorScheme={colorScheme} variant={colorScheme} {...props} />
            </AnimatedPressable>
        );
        animate(1)
        timer = setTimeout(hideAlert, duration)
    }, 50)
};

/** Cierra el aviso que se esté mostrando (con su animación) */
export const hideAlert = () => {
    if (currentAlert) {
        animate(0, () => {
            currentAlert.destroy();
            currentAlert = null;
            clearTimeout(timer)
        })
    }
};
