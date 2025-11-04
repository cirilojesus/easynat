import { View, StyleSheet, Platform } from "react-native";
import { useTheme } from "./theme-provider";
import { DEFAULT_PROPS } from "./utils/DEFAULT_PROPS";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { renderChild } from "./utils/helpers";
export const Box = ({ children, safeArea, safeAreaTop, safeAreaBottom, safeAreaLeft, safeAreaRight, ...props }) => {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const styles_default = theme?.components?.Box || {};
    const variantStyle = {
        badge: { rounded: 40, _text: { fontSize: 12 }, px: 2, py: 1, bg: 'light', flexDir: 'row', alignItems: 'center', gap: 4 },
        ...theme?.components?.Box?.variants
    };
    const combinedProps = {
        ...styles_default,
        ...props,
        ...(Platform.OS === "ios" ? props._ios : {}),
        ...(Platform.OS === "android" ? props._android : {}),
        ...(Platform.OS === "web" ? props._web : {}),
    };
    const styles = DEFAULT_PROPS({ ...variantStyle[combinedProps.variant], ...combinedProps }, theme);
    const baseStyle = StyleSheet.flatten([
        combinedProps.style,
        ...styles
    ]);
    return (<View {...combinedProps} style={{
            ...baseStyle,
            paddingTop: (baseStyle.padding || baseStyle.paddingVertical || baseStyle.paddingTop || 0) + ((safeArea || safeAreaTop) ? insets.top : 0),
            paddingBottom: (baseStyle.padding || baseStyle.paddingVertical || baseStyle.paddingBottom || 0) + ((safeArea || safeAreaBottom) ? insets.bottom : 0),
            paddingLeft: (baseStyle.padding || baseStyle.paddingHorizontal || baseStyle.paddingLeft || 0) + ((safeArea || safeAreaLeft) ? insets.left : 0),
            paddingRight: (baseStyle.padding || baseStyle.paddingHorizontal || baseStyle.paddingRight || 0) + ((safeArea || safeAreaRight) ? insets.right : 0),
        }}>
            {renderChild(children, { ...theme?.components?.Box?.variants[props.variant]?._text, ...combinedProps._text })}
        </View>);
};
