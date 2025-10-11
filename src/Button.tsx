import { useTheme } from "./theme-provider";
import { BSDefaultProps } from "./utils/DEFAULT_PROPS";
import { COLOR_SCHEME, VARIANT_BUTTON } from './theme';
import { BSPressableProps, Pressable } from "./Pressable";
import { cloneElement } from "react";
import { IconProps } from "./Icon";
import { renderChild } from "./utils/helpers";

export type BSButtonProps = BSPressableProps & BSDefaultProps & {
    variant?: VARIANT_BUTTON | (string & {});
    colorScheme?: COLOR_SCHEME;
    _ios?: BSButtonProps;
    _android?: BSButtonProps;
    _web?: BSButtonProps;
    _icon?: Partial<IconProps>;
    icon?: React.ReactElement<IconProps>
    iconLeft?: React.ReactElement<IconProps>
    _pressed?: BSButtonProps
};

export const Button: React.FC<BSButtonProps> = ({
    colorScheme = "primary",
    variant = "solid",
    ...props
}) => {
    const { theme } = useTheme();

    const variantStyles: Record<VARIANT_BUTTON, BSButtonProps> = {
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

    return (
        <Pressable
            p={3}
            rounded={2}
            {...{ ...variantStyles[variant], ...props }}
            _pressed={{ ...variantStyles[variant]?._pressed, ...props._pressed }}
            _text={{ textAlign: 'center', ...variantStyles[variant]?._text, ...props._text }}
        >
            {({ pressed, ...e }: BSButtonProps & { pressed: boolean }) =>

                <>
                    {e.icon && cloneElement(e.icon, { ...variantStyles[variant]?._icon, ...props._icon, ...(pressed ? props._pressed?._icon : {}) })}
                    {renderChild(props.children as any, pressed ? { ...e._text, ...e._pressed?._text } : e._text)}
                </>
            }
        </Pressable>
    );
};
