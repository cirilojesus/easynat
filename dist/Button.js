import { useTheme } from "./theme-provider";
import { Pressable } from "./Pressable";
import { cloneElement } from "react";
import { renderChild } from "./utils/helpers";
export const Button = ({ colorScheme = "primary", variant = "solid", ...props }) => {
    const { theme } = useTheme();
    const variantStyles = {
        solid: {
            bg: theme.colors[colorScheme + '.100'],
            _pressed: {
                bg: theme.colors[colorScheme + '.200']
            },
            _text: {
                color: theme.colors['white']
            },
            _icon: {
                color: theme.colors['white']
            }
        },
        outline: {
            borderWidth: 1,
            borderColor: theme.colors[colorScheme + '.100'],
            _pressed: {
                bg: theme.colors[colorScheme + '.50']
            }
        },
        ghost: {
            _pressed: {
                bg: theme.colors[colorScheme + '.50']
            }
        },
        link: {
            _pressed: {
                _text: {
                    color: theme.colors[colorScheme + '.100'],
                    textDecorationLine: 'underline'
                },
                _icon: {
                    color: theme.colors[colorScheme + '.100'],
                }
            }
        },
        ...theme?.components?.Button?.variants
    };
    return (<Pressable p={3} rounded={2} {...{ ...variantStyles[variant], ...props }} _pressed={{ ...variantStyles[variant]?._pressed, ...props._pressed }} _text={{ textAlign: 'center', ...variantStyles[variant]?._text, ...props._text }}>
            {({ pressed, ...e }) => <>
                    {e.icon && cloneElement(e.icon, { ...variantStyles[variant]?._icon, ...props._icon, ...(pressed ? props._pressed?._icon : {}) })}
                    {renderChild(props.children, pressed ? { ...e._text, ...e._pressed?._text } : e._text)}
                </>}
        </Pressable>);
};
