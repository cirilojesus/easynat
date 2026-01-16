import { Platform, } from "react-native";
import { useTheme } from "./theme-provider";
import { Theme } from "./theme";
import { Box } from "./Box";
import { Icon } from "./Icon";
import { BSButtonProps, Button } from "./Button";

export type EACheckBoxProps = BSButtonProps & {
    checked?: boolean;
    onChange?: (checked: boolean) => void;
    pointerBox?: boolean,
    label?: string;
    color?: keyof Theme["colors"];
    _ios?: EACheckBoxProps;
    _android?: EACheckBoxProps;
    _web?: EACheckBoxProps;
};

export const CheckBox: React.FC<EACheckBoxProps> = (props) => {
    const { theme } = useTheme();
    const styles_default = theme?.components?.CheckBox || {};

    const combinedProps: EACheckBoxProps = {
        ...{ colorScheme: 'primary' },
        ...styles_default,
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
                <Box w={22} height={22} borderWidth={1} bg={checked ? 'primary.100' : 'transparent'} borderColor={'light.100'} rounded={1}>
                    {checked ? combinedProps.icon || <Icon name={'check'} as={'Feather'} color="white" {...combinedProps._icon} /> : ''}
                </Box>
            }
            _text={{ ml: 2, textAlign: 'left', ...combinedProps._text }}
        >
            {label}
        </Button>
    );
};
