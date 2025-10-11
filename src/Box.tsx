import { View, ViewProps, StyleSheet, Platform } from "react-native";
import { useTheme } from "./theme-provider";
import { BSTextProps } from "./Text";
import { BSDefaultProps, DEFAULT_PROPS } from "./utils/DEFAULT_PROPS";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { renderChild } from "./utils/helpers";
import { VARIANTS_TYPE } from "./theme";

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
    padding?: number;
    paddingTop?: number;
    paddingBottom?: number;
    paddingLeft?: number;
    paddingRight?: number;
    paddingHorizontal?: number;
    paddingVertical?: number;
    variant?: 'badge' | (string & {});
};

export const Box: React.FC<BSBoxProps> = ({
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
    const styles_default = theme?.components?.Box || {};

    const variantStyle: VARIANTS_TYPE = {
        badge: { rounded: 40, _text: { fontSize: 12 }, px: 2, py: 1, bg: 'light', flexDir: 'row', alignItems: 'center', gap: 4 },
        ...theme?.components?.Box?.variants
    }

    const combinedProps: BSBoxProps = {
        ...styles_default,
        ...props,
        ...(Platform.OS === "ios" ? props._ios : {}),
        ...(Platform.OS === "android" ? props._android : {}),
        ...(Platform.OS === "web" ? props._web : {}),
    };

    const styles = DEFAULT_PROPS({ ...variantStyle[combinedProps.variant], ...combinedProps }, theme)

    const baseStyle = StyleSheet.flatten<BSBoxProps>([
        combinedProps.style,
        ...styles
    ]);

    return (
        <View
            {...combinedProps}
            style={{
                ...baseStyle,
                paddingTop: (baseStyle.padding || baseStyle.paddingVertical || baseStyle.paddingTop || 0) + ((safeArea || safeAreaTop) ? insets.top : 0),
                paddingBottom: (baseStyle.padding || baseStyle.paddingVertical || baseStyle.paddingBottom || 0) + ((safeArea || safeAreaBottom) ? insets.bottom : 0),
                paddingLeft: (baseStyle.padding || baseStyle.paddingHorizontal || baseStyle.paddingLeft || 0) + ((safeArea || safeAreaLeft) ? insets.left : 0),
                paddingRight: (baseStyle.padding || baseStyle.paddingHorizontal || baseStyle.paddingRight || 0) + ((safeArea || safeAreaRight) ? insets.right : 0),
            }}
        >
            {renderChild(children, { ...theme?.components?.Box?.variants[props.variant]?._text, ...combinedProps._text })}
        </View>
    );
};
