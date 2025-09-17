import { View, ViewProps, StyleSheet, Platform } from "react-native";
import { useTheme } from "./theme-provider";
import { BSTextProps, Text } from "./Text";
import { BSDefaultProps, DEFAULT_PROPS } from "./utils/DEFAULT_PROPS";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { renderChild } from "./utils/helpers";

export type BSBoxProps = ViewProps & BSDefaultProps & {
    _text?: BSTextProps;
    safeArea?: boolean,
    safeAreaTop?: boolean,
    safeAreaBottom?: boolean,
    safeAreaLeft?: boolean,
    safeAreaRight?: boolean,
    _ios?: BSBoxProps;
    _android?: BSBoxProps;
    _web?: BSBoxProps;
};

export const Box: React.FC<BSBoxProps> = ({
    style,
    children,
    safeArea,
    safeAreaTop,
    safeAreaBottom,
    safeAreaLeft,
    safeAreaRight,
    ...props
}) => {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();

    const combinedProps: BSBoxProps = {
        ...props,
        ...(Platform.OS === "ios" ? props._ios : {}),
        ...(Platform.OS === "android" ? props._android : {}),
        ...(Platform.OS === "web" ? props._web : {}),
    };

    const styles = DEFAULT_PROPS(combinedProps, theme)

    const boxStyle = StyleSheet.flatten([
        style,
        ...styles
    ]);

    return (
        <View style={boxStyle} {...props}>
            <View style={{
                paddingTop: (safeArea || safeAreaTop) && insets.top,
                paddingBottom: (safeArea || safeAreaBottom) && insets.bottom,
                paddingLeft: (safeArea || safeAreaLeft) && insets.left,
                paddingRight: (safeArea || safeAreaRight) && insets.right,
                flex: 1
            }}>
                {renderChild(children, combinedProps._text)}
            </View>
        </View>
    );
};
