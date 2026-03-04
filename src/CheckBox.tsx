import { Platform, } from "react-native";
import { useTheme } from "./theme-provider";
import { Theme } from "./theme";
import { Box, BSBoxProps } from "./Box";
import { Icon } from "./Icon";
import { BSButtonProps, Button } from "./Button";

export type EACheckBoxProps = Omit<BSButtonProps, '_ios' | '_android' | '_web'> & {
    checked?: boolean;
    onChange?: (checked: boolean) => void;
    pointerBox?: boolean,
    label?: string;
    color?: keyof Theme["colors"];
    variant?: (string & {});
    size?: 'sm' | 'md' | 'lg' | 'xl';
    _containerIcon?: BSBoxProps;
    _ios?: Omit<EACheckBoxProps, '_ios' | '_android' | '_web'>;
    _android?: Omit<EACheckBoxProps, '_ios' | '_android' | '_web'>;
    _web?: Omit<EACheckBoxProps, '_ios' | '_android' | '_web'>;
};

export const CheckBox: React.FC<EACheckBoxProps> = (props) => {
    const { theme } = useTheme();
    const styles_default = theme?.components?.CheckBox || {};
    const props_variant = theme?.components?.CheckBox?.variants || {};

    const sizeStyle: Record<EACheckBoxProps['size'], EACheckBoxProps> = {
        sm: { _containerIcon: { w: 18, height: 18 }, _icon: { size: 12 }, _text: { fontSize: 12 } },
        md: { _containerIcon: { w: 22, height: 22 }, _icon: { size: 14 }, _text: { fontSize: 14 } },
        lg: { _containerIcon: { w: 26, height: 26 }, _icon: { size: 16 }, _text: { fontSize: 16 } },
        xl: { _containerIcon: { w: 30, height: 30 }, _icon: { size: 18 }, _text: { fontSize: 18 } },
    };

    const combinedProps: EACheckBoxProps = {
        ...{ colorScheme: 'primary' },
        ...styles_default,
        ...props_variant[styles_default.variant || props.variant],
        ...sizeStyle[props.size],
        ...props,
        ...(Platform.OS === "ios" ? props._ios : {}),
        ...(Platform.OS === "android" ? props._android : {}),
        ...(Platform.OS === "web" ? props._web : {}),
    };

    const {
        checked = false,
        onChange,
        label,
        pointerBox = false,
        ...rest
    } = combinedProps;

    return (
        <Button
            variant={'unstyle'}
            flexDir="row"
            alignItems={'center'}
            justifyContent={'flex-start'}
            pointerEvents={pointerBox ? 'box-only' : 'box-none'}
            p={0}
            {...rest}
            _pressed={{
                ...combinedProps._pressed,
                _icon: { bg: checked ? theme.colors[combinedProps.colorScheme + '.200'] : theme.colors[combinedProps.colorScheme + '.50'], ...combinedProps._pressed?._icon }
            }}
            onPress={(e) => {
                onChange?.(!checked)
                rest.onPress?.(e)
            }}
            icon={
                <Box w={22} height={22} borderWidth={1} bg={checked ? 'primary.100' : 'transparent'} borderColor={'light.100'} rounded={1} {...combinedProps._containerIcon}>
                    {checked ? combinedProps.icon || <Icon name={'check'} as={'Feather'} color="white" {...combinedProps._icon} /> : ''}
                </Box>
            }
            _text={{ ml: 2, textAlign: 'left', ...combinedProps._text }}
        >
            {label}
        </Button>
    );
};
