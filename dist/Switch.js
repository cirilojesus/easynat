import React from "react";
import { Platform, Switch as RNSwitch, } from "react-native";
import { useTheme } from "./theme-provider";
import { DEFAULT_PROPS } from "./utils/DEFAULT_PROPS";
import { Button } from "./Button";
export const Switch = (props) => {
    const { theme } = useTheme();
    const combinedProps = {
        ...props,
        ...(Platform.OS === "ios" ? props._ios : {}),
        ...(Platform.OS === "android" ? props._android : {}),
        ...(Platform.OS === "web" ? props._web : {}),
    };
    const styles = DEFAULT_PROPS(combinedProps, theme);
    const { colorScheme = "primary", _containerStyle, pointerBox, size = 1, ...rest } = combinedProps;
    const scale = 1 + 0.1 * (size - 1);
    const rightOffset = ((52 * (scale - 1)) / 2);
    return (<Button variant="unstyle" height={36 + size * 4} onPress={() => props.onValueChange(!props.value)} _text={{ ml: 1 }} _pressed={{ _text: { color: theme.colors[colorScheme + '.100'] } }} p={0} ml={-10} flexDir="row" alignItems="center" pointerEvents={pointerBox ? 'auto' : 'box-none'} {..._containerStyle}>
            <RNSwitch trackColor={{
            false: theme.colors['light'],
            true: theme.colors[colorScheme + '.100'],
        }} thumbColor={combinedProps.value
            ? theme.colors[colorScheme + '.100']
            : theme.colors['light']} {...rest} style={[
            {
                width: 52 + (rightOffset / 2),
                marginRight: (rightOffset * 2),
                transform: [{ scale }],
            },
            rest.style,
            ...styles
        ]}/>
            LABEL
        </Button>);
};
