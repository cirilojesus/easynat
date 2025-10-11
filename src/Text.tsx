import { Platform, Text as RNText, TextProps as RNTextProps, StyleProp, StyleSheet, TextStyle } from "react-native";
import { useTheme } from "./theme-provider";
import { BSDefaultProps, DEFAULT_PROPS } from "./utils/DEFAULT_PROPS";
import { Theme, VARIANTS_TYPE } from "./theme";

export type TextVariants = 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'h5'
    | 'h6'
    | 'small'

export type BSTextProps = RNTextProps & Omit<TextStyle, 'color'> & BSDefaultProps & {
    color?: keyof Theme["colors"];
    variant?: TextVariants | (string & {});
    _ios?: BSTextProps;
    _android?: BSTextProps;
    _web?: BSTextProps;
};

export const Text: React.FC<BSTextProps> = ({ style, children, ...props }) => {
    const { theme } = useTheme();
    const styles_default = theme?.components?.Text || {};

    const variantStyle: VARIANTS_TYPE = {
        h1: { fontSize: 26, fontWeight: "500" },
        h2: { fontSize: 24, fontWeight: "500" },
        h3: { fontSize: 22, fontWeight: "500" },
        h4: { fontSize: 20, fontWeight: "500" },
        h5: { fontSize: 18, fontWeight: "500" },
        h6: { fontSize: 16, fontWeight: "500" },
        small: { fontSize: 12 },
        ...theme?.components?.Text?.variants
    }

    const combinedProps: BSTextProps = {
        ...styles_default,
        ...props,
        ...(Platform.OS === "ios" ? props._ios : {}),
        ...(Platform.OS === "android" ? props._android : {}),
        ...(Platform.OS === "web" ? props._web : {}),
    };

    const styles = DEFAULT_PROPS({ ...variantStyle[combinedProps.variant], ...combinedProps }, theme)

    const textStyle = StyleSheet.flatten<TextStyle>([
        style,
        ...styles,
        { color: theme.colors[variantStyle[combinedProps.variant]?.color || combinedProps.color] || variantStyle[combinedProps.variant] || combinedProps.color },
    ]);

    return (
        <RNText style={[theme.fontFamily && { fontFamily: theme.fontFamily + (textStyle.fontWeight || '400') }, textStyle]} {...props}>
            {children}
        </RNText>
    );
};
