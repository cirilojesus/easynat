import { Platform } from "react-native";
import { useTheme } from "./theme-provider";
import { BSDefaultProps } from "./utils/DEFAULT_PROPS";
import { Theme } from "./theme";
import { Box, BSBoxProps } from "./Box";

export type EAProgressBarProps = BSBoxProps & BSDefaultProps & {
    progress: number;
    color?: keyof Theme["colors"];
    text?: boolean | string;
    _ios?: EAProgressBarProps;
    _android?: EAProgressBarProps;
    _web?: EAProgressBarProps;
};

export const ProgressBar: React.FC<EAProgressBarProps> = ({ ...props }) => {
    const { theme } = useTheme();
    const props_default = theme?.components?.ProgressBar || {}

    const combinedProps: EAProgressBarProps = {
        ...{ text: true, color: 'primary.100' },
        ...props_default,
        ...props,
        ...(Platform.OS === "ios" ? props._ios : {}),
        ...(Platform.OS === "android" ? props._android : {}),
        ...(Platform.OS === "web" ? props._web : {}),
    };

    const { progress, color, text } = combinedProps;

    return (
        <Box
            rounded={40}
            borderWidth={1}
            borderColor={'light.100'}
            overflow="hidden"
            w={'100%'}
            {...props}
            _text={{ textAlign: "center", ...combinedProps._text }}
        >
            <Box
                bg={color}
                w={`${progress}%`}
                position="absolute"
                maxW="100%"
                h="100%"
            />
            {text === true ? progress + "%" : text}
        </Box>
    );
};
