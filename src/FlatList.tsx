import {
    FlatList as RNFlatList,
    FlatListProps,
    Platform,
    StyleSheet,
    ViewStyle,
} from "react-native";
import { useTheme } from "./theme-provider";
import { BSDefaultProps, DEFAULT_PROPS } from "./utils/DEFAULT_PROPS";

export type BSFlatListProps<T> = FlatListProps<T> &
    BSDefaultProps & {
        _ios?: BSFlatListProps<T>;
        _android?: BSFlatListProps<T>;
        _web?: BSFlatListProps<T>;
    };

export function FlatList<T>({
    style,
    ...props
}: BSFlatListProps<T>) {
    const { theme } = useTheme();

    // Aplica overrides por plataforma
    const combinedProps: BSFlatListProps<T> = {
        ...props,
        ...(Platform.OS === "ios" ? props._ios : {}),
        ...(Platform.OS === "android" ? props._android : {}),
        ...(Platform.OS === "web" ? props._web : {}),
    };

    const styles = DEFAULT_PROPS(combinedProps, theme);
    const baseStyle = StyleSheet.flatten<ViewStyle>([style, ...styles]);

    return (
        <RNFlatList
            {...combinedProps}
            style={baseStyle}
        />
    );
}
