import { Animated, Pressable } from "react-native";
import RootSiblings from "react-native-root-siblings";
import { Box, BSBoxProps } from "./Box";
import { COLOR_SCHEME } from "./theme";

let currentAlert: RootSiblings | null = null;
let timer = null
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
let animate = (value: 1 | 0, callBack?: () => any) => null

export const showAlert = (message: string, colorScheme: COLOR_SCHEME, props?: BSBoxProps, duration = 3000) => {
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
                <Box safeAreaTop bg={colorScheme + '.100'} _text={{ color: 'white' }} p={3} {...props}>
                    {message}
                </Box>
            </AnimatedPressable>
        );
        animate(1)
        timer = setTimeout(hideAlert, duration)
    }, 50)
};

export const hideAlert = () => {
    if (currentAlert) {
        animate(0, () => {
            currentAlert.destroy();
            currentAlert = null;
            clearTimeout(timer)
        })
    }
};
