import { Platform, Text as RNText, TextProps as RNTextProps, StyleProp, StyleSheet, TextStyle } from "react-native";
import { useTheme } from "./theme-provider";
import { BSDefaultProps, DEFAULT_PROPS } from "./utils/DEFAULT_PROPS";
import { Theme } from "./theme";

export type TextVariants = 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'h5'
    | 'h6'
    | 'small'

export type BSTextProps = RNTextProps & TextStyle & BSDefaultProps & {
    color?: keyof Theme["colors"];
    variant?: TextVariants | (string & {});
    _ios?: BSTextProps;
    _android?: BSTextProps;
    _web?: BSTextProps;
};

export const Text: React.FC<BSTextProps> = ({ style, children, ...props }) => {
    const { theme } = useTheme();

    const variantStyle = {
        h1: { fontSize: 26, fontWeight: "500" as const },
        h2: { fontSize: 24, fontWeight: "500" as const },
        h3: { fontSize: 22, fontWeight: "500" as const },
        h4: { fontSize: 20, fontWeight: "500" as const },
        h5: { fontSize: 18, fontWeight: "500" as const },
        h6: { fontSize: 16, fontWeight: "500" as const },
        small: { fontSize: 12 },
        ...theme?.components?.Text?.variants
    }

    const combinedProps: BSTextProps = {
        ...props,
        ...(Platform.OS === "ios" ? props._ios : {}),
        ...(Platform.OS === "android" ? props._android : {}),
        ...(Platform.OS === "web" ? props._web : {}),
    };

    const styles = DEFAULT_PROPS(combinedProps, theme)

    const textStyle = StyleSheet.flatten<TextStyle>([
        ...styles,
        { color: theme.colors[combinedProps.color] || combinedProps.color },
        { ...variantStyle[combinedProps.variant] },
        style,
    ]);

    return (
        <RNText style={textStyle} {...props}>
            {children}
        </RNText>
    );
};
