import { useEffect, useRef, useState } from "react";
import { TextInput, TextInputProps, StyleSheet, Platform, TextStyle, Animated } from "react-native";
import { useTheme } from "./theme-provider";
import { BSDefaultProps, DEFAULT_PROPS } from "./utils/DEFAULT_PROPS";
import { Icon } from "./Icon";
import { Button } from "./Button";
import { BSTextProps, Text } from "./Text";
import { Box, BSBoxProps } from "./Box";
import { Theme } from "./theme";

export type BSTextInputProps = TextInputProps & BSTextProps & BSDefaultProps & {
    _ios?: BSTextInputProps;
    _android?: BSTextInputProps;
    _web?: BSTextInputProps;
    label?: string;
    _label?: BSTextProps,
    isPassword?: boolean;
    isFloat?: boolean;
    isRequired?: boolean;
    _iconLeft?: React.ReactElement,
    _containerStyle?: BSBoxProps,
    _focus?: BSTextInputProps,
    color?: keyof Theme["colors"];
};

const AnimatedText = Animated.createAnimatedComponent(Text);

export const InputText: React.FC<BSTextInputProps> = ({ style, ...props }) => {
    const { theme } = useTheme();
    const styles_default = theme?.components?.InputText || {};
    const [focus, setFocus] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const animation = useRef(new Animated.Value(0)).current;

    const combinedProps: BSTextInputProps = {
        ...styles_default,
        ...props,
        ...(focus && props._focus),
        ...(Platform.OS === "ios"
            ? { ...styles_default?._ios, ...props?._ios }
            : {}),
        ...(Platform.OS === "android"
            ? { ...styles_default?._android, ...props?._android }
            : {}),
        ...(Platform.OS === "web"
            ? { ...styles_default?._web, ...props?._web }
            : {}),
    };

    const styles = DEFAULT_PROPS(combinedProps, theme);

    const inputStyle = StyleSheet.flatten<TextStyle>([
        {
            fontSize: 14,
            paddingVertical: 8,
            paddingHorizontal: 12,
            flex: 1,
        },
        style,
        ...styles,
        { color: theme.colors[combinedProps.color] || combinedProps.color }
    ]);

    const animate = (text) => {
        Animated.timing(animation, {
            toValue: text ? 1 : 0,
            duration: 100,
            useNativeDriver: true,
        }).start();
    }

    useEffect(() => {
        if (!focus) animate(props.value)
    }, [props.value])

    return (
        <>
            {combinedProps.label &&
                <AnimatedText
                    pointerEvents="none"
                    style={[
                        (combinedProps.isFloat ?
                            {
                                padding: 3,
                                marginLeft: 10,
                                backgroundColor: '#fff',
                                zIndex: 1000,
                                marginRight: 'auto',
                                marginBottom: -10,
                                transform: [
                                    {
                                        translateY: animation.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [20, 1],
                                        })
                                    }
                                ]
                            } :
                            { marginBottom: 4 }),
                    ]}
                    {...combinedProps._label}
                >
                    {combinedProps.label} {combinedProps.isRequired && <Text color={'danger'}>*</Text>}
                </AnimatedText>
            }
            <Box
                alignItems={'center'}
                flexDir="row"
                rounded={1}
                borderWidth={1}
                {...{ ...styles_default._containerStyle, ...combinedProps._containerStyle }}
                borderColor={styles_default?._containerStyle?.borderColor || combinedProps._containerStyle?.borderColor || (focus ? 'primary' : 'light')}
            >
                {combinedProps._iconLeft}
                <TextInput
                    {...combinedProps}
                    secureTextEntry={combinedProps.isPassword && !showPassword}
                    style={[theme.fontFamily && { fontFamily: theme.fontFamily + (inputStyle.fontWeight || '400') }, inputStyle]}
                    onFocus={e => {
                        animate(true)
                        props.onFocus?.(e)
                        setFocus(true)
                    }}
                    onBlur={e => {
                        animate(props.value)
                        props.onBlur?.(e)
                        setFocus(false)
                    }}
                />
                {combinedProps.isPassword && (
                    <Button onPress={() => setShowPassword(!showPassword)} variant={'ghost'} rounded={40} p={1} mr={2} marginVertical={4.5}>
                        {showPassword ? <Icon name="eye-off" as={'Feather'} /> : <Icon name="eye" as={'Feather'} />}
                    </Button>
                )}
            </Box>
        </>
    );
};