import { ActivityIndicator, Platform } from "react-native";
import { useTheme } from "./theme-provider";
export const Spinner = ({ ...props }) => {
    const { theme } = useTheme();
    const combinedProps = {
        ...props,
        ...(Platform.OS === "ios" ? props._ios : {}),
        ...(Platform.OS === "android" ? props._android : {}),
        ...(Platform.OS === "web" ? props._web : {}),
    };
    return (<ActivityIndicator {...combinedProps} color={theme.colors[combinedProps.color] || combinedProps.color || theme.colors['primary']}/>);
};
