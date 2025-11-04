/// <reference types="react" />
import { TextInputProps } from "react-native";
import { BSDefaultProps } from "./utils/DEFAULT_PROPS";
import { BSButtonProps } from "./Button";
import { BSTextProps } from "./Text";
import { BSBoxProps } from "./Box";
import { Theme } from "./theme";
export type BSTextInputProps = TextInputProps & BSTextProps & BSDefaultProps & {
    _ios?: BSTextInputProps;
    _android?: BSTextInputProps;
    _web?: BSTextInputProps;
    label?: string;
    _label?: BSTextProps;
    isPassword?: boolean;
    isFloat?: boolean;
    isRequired?: boolean;
    iconLeft?: React.ReactElement;
    _containerStyle?: BSBoxProps;
    _focus?: BSTextInputProps;
    _iconRight?: BSButtonProps;
    iconRight?: React.ReactElement;
    color?: keyof Theme["colors"];
};
export declare const InputText: React.FC<BSTextInputProps>;
