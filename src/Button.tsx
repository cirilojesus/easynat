import { useTheme } from "./theme-provider";
import { BSDefaultProps } from "./utils/DEFAULT_PROPS";
import { COLOR_SCHEME, VARIANT_BUTTON } from './theme';
import { BSPressableProps, Pressable } from "./Pressable";

export type BSButtonProps = BSPressableProps & BSDefaultProps & {
    variant?: VARIANT_BUTTON | (string & {});
    colorScheme?: COLOR_SCHEME;
    _ios?: BSButtonProps;
    _android?: BSButtonProps;
    _web?: BSButtonProps;
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
                }
            }
        },
        ...theme?.components?.Button?.variants
    };

    return (
        <Pressable
            p={3}
            rounded={2}
            {...props}
            {...variantStyles[variant]}
            _pressed={{ ...variantStyles[variant]._pressed, ...props._pressed }}
            _text={{ ...variantStyles[variant]._text, ...props._text }}
        />
    );
};
