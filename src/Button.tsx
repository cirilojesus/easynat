import { useTheme } from "./theme-provider";
import { BSDefaultProps } from "./utils/DEFAULT_PROPS";
import { COLOR_SCHEME, VARIANT_BUTTON } from './theme';
import { BSPressableProps, Pressable } from "./Pressable";
import { cloneElement } from "react";
import { IconProps } from "./Icon";
import { renderChild } from "./utils/helpers";

export type BSButtonProps = Omit<BSPressableProps, 'variant'> & BSDefaultProps & {
    variant?: VARIANT_BUTTON | (string & {});
    colorScheme?: COLOR_SCHEME;
    _ios?: BSButtonProps;
    _android?: BSButtonProps;
    _web?: BSButtonProps;
    _icon?: Partial<IconProps<any>>;
    _iconRight?: Partial<IconProps<any>>;
    icon?: React.ReactElement<IconProps<any>>
    iconRight?: React.ReactElement<IconProps<any>>
    _pressed?: BSButtonProps;
    size?: 'sm' | 'md' | 'lg' | 'xl'
};

export const Button: React.FC<BSButtonProps> = ({ colorScheme = "primary", variant = "solid", ...props }) => {
    const { theme } = useTheme();
    const props_default = theme?.components?.Button || {}

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
            },
            _iconRight: {
                color: theme.colors['white']
            }
        },
        outline: {
            borderWidth: 1,
            borderColor: theme.colors[colorScheme + '.100'],
            _pressed: {
                bg: theme.colors[colorScheme + '.50']
            },
            _text: {
                color: theme.colors[colorScheme + '.100']
            },
            _icon: {
                color: theme.colors[colorScheme + '.100']
            },
            _iconRight: {
                color: theme.colors[colorScheme + '.100']
            }
        },
        ghost: {
            _pressed: {
                bg: theme.colors[colorScheme + '.50']
            },
            _text: {
                color: theme.colors[colorScheme + '.100']
            },
            _icon: {
                color: theme.colors[colorScheme + '.100']
            },
            _iconRight: {
                color: theme.colors[colorScheme + '.100']
            }
        },
        link: {
            _pressed: {
                _text: {
                    color: theme.colors[colorScheme + '.200'],
                    textDecorationLine: 'underline'
                },
                _icon: {
                    color: theme.colors[colorScheme + '.200'],
                },
                _iconRight: {
                    color: theme.colors[colorScheme + '.200'],
                }
            },
            _text: {
                color: theme.colors[colorScheme + '.100']
            },
            _icon: {
                color: theme.colors[colorScheme + '.100']
            },
            _iconRight: {
                color: theme.colors[colorScheme + '.100']
            }
        },
        subtle: {
            bg: theme.colors[colorScheme + '.50'],
            _pressed: {
                bg: theme.colors[colorScheme + '.100']
            },
            _text: {
                color: theme.colors[colorScheme + '.200']
            },
            _icon: {
                color: theme.colors[colorScheme + '.200']
            },
            _iconRight: {
                color: theme.colors[colorScheme + '.200']
            }
        },
        ...theme?.components?.Button?.variants
    };

    const sizeStyle: Record<BSButtonProps['size'], BSButtonProps> = {
        sm: {
            p: 1.5,
            _text: { fontSize: 12 },
            _icon: { size: 14 }
        },
        md: {
            p: 2.5,
            _text: { fontSize: 14 },
            _icon: { size: 16 }
        },
        lg: {
            p: 3.5,
            _text: { fontSize: 16 },
            _icon: { size: 18 }
        },
        xl: {
            p: 4.5,
            _text: { fontSize: 18 },
            _icon: { size: 20 }
        },
    }

    return (
        <Pressable
            p={2.5}
            rounded={2}
            flexDir={'row'}
            alignItems={'center'}
            gap={8}
            justifyContent={'center'}
            {...{ ...props_default, ...variantStyles[variant], ...sizeStyle[props?.size], ...props }}
            _pressed={{ ...props_default?._pressed, ...variantStyles[variant]?._pressed, ...props._pressed }}
            _text={{ textAlign: 'center', ...props_default?._text, ...variantStyles[variant]?._text, ...sizeStyle[props?.size]?._text, ...props._text }}
        >
            {({ pressed, ...e }: BSButtonProps & { pressed: boolean }) =>
                <>
                    {e.icon && cloneElement(e.icon, { ...props_default?._icon, ...variantStyles[variant]?._icon, ...props._icon, ...(pressed ? props._pressed?._icon : {}), ...e.icon?.props })}
                    {renderChild(props.children as any, pressed ? { ...e._text, ...e._pressed?._text } : e._text)}
                    {e.iconRight && cloneElement(e.iconRight, { ...variantStyles[variant]?._iconRight, ...props._iconRight, ...(pressed ? props._pressed?._iconRight : {}) })}
                </>
            }
        </Pressable>
    );
};
