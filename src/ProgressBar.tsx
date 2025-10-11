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

    const combinedProps: EAProgressBarProps = {
        ...{ text: true },
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
            borderColor={'light'}
            overflow="hidden"
            _text={{ textAlign: "center" }}
            w={100}
            {...props}
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
