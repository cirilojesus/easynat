import { Platform, Text as RNText, StyleSheet } from "react-native";
import { useTheme } from "./theme-provider";
import { DEFAULT_PROPS } from "./utils/DEFAULT_PROPS";
export const Text = ({ style, children, ...props }) => {
    const { theme } = useTheme();
    const styles_default = theme?.components?.Text || {};
    const variantStyle = {
        h1: { fontSize: 26, fontWeight: "500" },
        h2: { fontSize: 24, fontWeight: "500" },
        h3: { fontSize: 22, fontWeight: "500" },
        h4: { fontSize: 20, fontWeight: "500" },
        h5: { fontSize: 18, fontWeight: "500" },
        h6: { fontSize: 16, fontWeight: "500" },
        small: { fontSize: 12 },
        ...theme?.components?.Text?.variants
    };
    const combinedProps = {
        ...styles_default,
        ...props,
        ...(Platform.OS === "ios" ? props._ios : {}),
        ...(Platform.OS === "android" ? props._android : {}),
        ...(Platform.OS === "web" ? props._web : {}),
    };
    const styles = DEFAULT_PROPS({ ...variantStyle[combinedProps.variant], ...combinedProps }, theme);
    const textStyle = StyleSheet.flatten([
        style,
        ...styles,
        { color: theme.colors[variantStyle[combinedProps.variant]?.color || combinedProps.color] || variantStyle[combinedProps.variant] || combinedProps.color },
    ]);
    return (<RNText style={[theme.fontFamily && { fontFamily: theme.fontFamily + (textStyle.fontWeight || '400') }, textStyle]} {...props}>
            {children}
        </RNText>);
};
