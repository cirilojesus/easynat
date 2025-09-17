import { TextProps as RNTextProps, TextStyle } from "react-native";
import { BSDefaultProps } from "./utils/DEFAULT_PROPS";
import { Theme } from "./theme";
export type TextVariants = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'small';
export type BSTextProps = RNTextProps & TextStyle & BSDefaultProps & {
    color?: keyof Theme["colors"];
    variant?: TextVariants | (string & {});
    _ios?: BSTextProps;
    _android?: BSTextProps;
    _web?: BSTextProps;
};
export declare const Text: React.FC<BSTextProps>;
