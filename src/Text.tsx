import React from "react";
import { Platform, Text as RNText, TextProps as RNTextProps, StyleSheet, TextStyle } from "react-native";
import { EADefaultProps, DEFAULT_PROPS } from "./utils/DEFAULT_PROPS";
import { ThemeColor } from "./theme";
import { useThemeProps } from "./utils/useThemeProps";

export type TextVariants = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
    | 'title' | 'subtitle' | 'body' | 'small' | 'caption' | 'label' | 'overline' | 'muted' | 'bold' | 'link' | 'error' | 'code'

export type EATextProps = RNTextProps & Omit<TextStyle, 'color'> & EADefaultProps & {
    color?: ThemeColor;
    variant?: TextVariants | (string & {});
    _ios?: Omit<EATextProps, '_ios' | '_android' | '_web'>;
    _android?: Omit<EATextProps, '_ios' | '_android' | '_web'>;
    _web?: Omit<EATextProps, '_ios' | '_android' | '_web'>;
};

// Variantes propias (theme.components.Text.variants puede ampliarlas o modificarlas)
// Se combinan con espacios: variant="small muted"
const TEXT_VARIANTS: Record<TextVariants, EATextProps> = {
    h1: { fontSize: 30, lineHeight: 38, fontWeight: "700" },
    h2: { fontSize: 26, lineHeight: 33, fontWeight: "700" },
    h3: { fontSize: 22, lineHeight: 29, fontWeight: "600" },
    h4: { fontSize: 20, lineHeight: 26, fontWeight: "600" },
    h5: { fontSize: 18, lineHeight: 24, fontWeight: "600" },
    h6: { fontSize: 16, lineHeight: 22, fontWeight: "600" },
    title: { fontSize: 18, lineHeight: 24, fontWeight: "700" },
    subtitle: { fontSize: 15, lineHeight: 21, fontWeight: "500", color: 'gray' },
    body: { fontSize: 14, lineHeight: 20 },
    small: { fontSize: 12 },
    caption: { fontSize: 12, lineHeight: 16, color: 'silver' },
    label: { fontSize: 13, fontWeight: "600" },
    /** Texto pequeño en mayúsculas (encabezados de sección) */
    overline: { fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: 'uppercase', color: 'silver' },
    muted: { color: 'silver' },
    bold: { fontWeight: "700" },
    link: { color: 'primary.100', textDecorationLine: 'underline' },
    error: { fontSize: 12, color: 'danger.100' },
    code: { fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }), fontSize: 13, bg: 'light.50', px: 1, alignSelf: 'flex-start' },
};

/** true dentro de un Text: un texto suelto se puede pintar tal cual (hereda los estilos del Text de fuera) */
export const InsideTextContext = React.createContext(false);

export const Text: React.FC<EATextProps> = ({ children, ...props }) => {
    // Defaults → theme.components.Text → variante → props → plataforma
    const [combinedProps, theme] = useThemeProps<EATextProps>('Text', props, { variants: TEXT_VARIANTS });
    const insideText = React.useContext(InsideTextContext);
    const styles = DEFAULT_PROPS(combinedProps, theme)
    // Sin color: el del tema ('text', cambia con el modo). Un Text dentro de otro hereda el del de fuera
    const color = combinedProps.color ?? (insideText ? undefined : 'text')

    const textStyle = StyleSheet.flatten<TextStyle>([
        combinedProps.style,
        ...styles,
        color !== undefined && { color: theme.colors?.[color] || color },
    ]);

    return (
        <RNText
            {...combinedProps}
            style={[
                theme.fontFamily && { fontFamily: theme?.fonts?.[theme.fontFamily + '_' + (textStyle?.fontWeight || '400')] || theme.fontFamily + '_' + (textStyle?.fontWeight || '400') },
                textStyle,
                theme.fontFamily && { fontWeight: undefined }
            ]}
        >
            <InsideTextContext.Provider value={true}>{children}</InsideTextContext.Provider>
        </RNText>
    );
};
