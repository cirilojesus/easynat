import React from "react";
import { TextProps as RNTextProps, TextStyle } from "react-native";
import { EADefaultProps } from "./utils/DEFAULT_PROPS";
import { ThemeColor } from "./theme";
export type TextVariants = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'title' | 'subtitle' | 'body' | 'small' | 'caption' | 'label' | 'overline' | 'muted' | 'bold' | 'link' | 'error' | 'code';
export type EATextProps = RNTextProps & Omit<TextStyle, 'color'> & EADefaultProps & {
    color?: ThemeColor;
    variant?: TextVariants | (string & {});
    _ios?: Omit<EATextProps, '_ios' | '_android' | '_web'>;
    _android?: Omit<EATextProps, '_ios' | '_android' | '_web'>;
    _web?: Omit<EATextProps, '_ios' | '_android' | '_web'>;
};
/** true dentro de un Text: un texto suelto se puede pintar tal cual (hereda los estilos del Text de fuera) */
export declare const InsideTextContext: React.Context<boolean>;
export declare const Text: React.FC<EATextProps>;
