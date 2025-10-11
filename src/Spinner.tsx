import { ActivityIndicator, ActivityIndicatorProps, Platform } from "react-native";
import { useTheme } from "./theme-provider";
import { BSDefaultProps } from "./utils/DEFAULT_PROPS";
import { Theme } from "./theme";

export type EASpinnerProps = ActivityIndicatorProps & BSDefaultProps & {
    color?: keyof Theme["colors"];
    _ios?: EASpinnerProps;
    _android?: EASpinnerProps;
    _web?: EASpinnerProps;
};

export const Spinner: React.FC<EASpinnerProps> = ({ ...props }) => {
    const { theme } = useTheme();

    const combinedProps: EASpinnerProps = {
        ...props,
        ...(Platform.OS === "ios" ? props._ios : {}),
        ...(Platform.OS === "android" ? props._android : {}),
        ...(Platform.OS === "web" ? props._web : {}),
    };

    return (
        <ActivityIndicator
            {...combinedProps}
            color={theme.colors[combinedProps.color] || combinedProps.color || theme.colors['primary']}
        />
    );
};
