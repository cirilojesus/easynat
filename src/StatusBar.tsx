import React from "react";
import { StatusBar as RNStatusBar, StatusBarProps as RNStatusBarProps } from "react-native";
import { EADefaultProps } from "./utils/DEFAULT_PROPS";
import { useThemeProps } from "./utils/useThemeProps";

export type EAStatusBarProps = RNStatusBarProps & EADefaultProps & {
    _ios?: EAStatusBarProps;
    _android?: EAStatusBarProps;
    _web?: EAStatusBarProps;
    variant?: (string & {});
};

export const StatusBar: React.FC<EAStatusBarProps> = (props) => {
    // Defaults → theme.components.StatusBar → variante → props → plataforma
    const [combinedProps, theme] = useThemeProps<EAStatusBarProps>('StatusBar', props);

    return (
        <RNStatusBar
            backgroundColor={theme.colors[combinedProps.bg] || combinedProps.bg || 'transparent'}
            translucent
            {...combinedProps}
        />
    );
};
