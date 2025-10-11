import { StatusBar as RNStatusBar, StatusBarProps as RNStatusBarProps, Platform } from "react-native";
import { useTheme } from "./theme-provider";
import { BSDefaultProps } from "./utils/DEFAULT_PROPS";

export type BSStatusBarProps = RNStatusBarProps & BSDefaultProps & {
    _ios?: BSStatusBarProps;
    _android?: BSStatusBarProps;
    _web?: BSStatusBarProps;
};

export const StatusBar: React.FC<BSStatusBarProps> = ({ ...props }) => {
    const { theme } = useTheme();

    const combinedProps: BSStatusBarProps = {
        ...props,
        ...(Platform.OS === "ios" ? props._ios : {}),
        ...(Platform.OS === "android" ? props._android : {}),
        ...(Platform.OS === "web" ? props._web : {}),
    };

    return (
        <RNStatusBar
            backgroundColor={theme.colors[combinedProps.bg] || combinedProps.bg || 'transparent'}
            translucent
            {...combinedProps}
        />
    );
};
