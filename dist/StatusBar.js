import { StatusBar as RNStatusBar, Platform } from "react-native";
import { useTheme } from "./theme-provider";
export const StatusBar = ({ ...props }) => {
    const { theme } = useTheme();
    const combinedProps = {
        ...props,
        ...(Platform.OS === "ios" ? props._ios : {}),
        ...(Platform.OS === "android" ? props._android : {}),
        ...(Platform.OS === "web" ? props._web : {}),
    };
    return (<RNStatusBar backgroundColor={theme.colors[combinedProps.bg] || combinedProps.bg || 'transparent'} translucent {...combinedProps}/>);
};
