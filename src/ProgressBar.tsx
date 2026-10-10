import React from "react";
import { useThemeProps } from "./utils/useThemeProps";
import { EADefaultProps } from "./utils/DEFAULT_PROPS";
import { ThemeColor } from "./theme";
import { Box, EABoxProps } from "./Box";

export type EAProgressBarProps = EABoxProps & EADefaultProps & {
    progress: number;
    color?: ThemeColor;
    text?: boolean | string;
    _ios?: EAProgressBarProps;
    _android?: EAProgressBarProps;
    _web?: EAProgressBarProps;
};

export const ProgressBar: React.FC<EAProgressBarProps> = (props) => {
    // Defaults → theme.components.ProgressBar → variante → props → plataforma
    const [{ variant: _variant, ...combinedProps }] = useThemeProps<EAProgressBarProps>('ProgressBar', props, { defaults: { text: true, color: 'primary.100' } });

    const { progress, color, text } = combinedProps;

    return (
        <Box
            rounded={40}
            borderWidth={1}
            borderColor={'light.100'}
            overflow="hidden"
            w={'100%'}
            {...combinedProps}
            _text={{ textAlign: "center", fontSize: 12, ...combinedProps._text }}
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
