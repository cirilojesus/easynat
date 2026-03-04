/// <reference types="react" />
import { TextInputProps } from "react-native";
import { BSButtonProps } from "./Button";
import { BSTextProps } from "./Text";
import { BSBoxProps } from "./Box";
import { Theme } from "./theme";
export type BSTextInputProps = TextInputProps & Omit<BSTextProps, '_ios' | '_android' | '_web'> & {
    _ios?: Omit<BSTextInputProps, '_ios' | '_android' | '_web'>;
    _android?: Omit<BSTextInputProps, '_ios' | '_android' | '_web'>;
    _web?: Omit<BSTextInputProps, '_ios' | '_android' | '_web'>;
    label?: string;
    _label?: BSTextProps;
    isPassword?: boolean;
    isFloat?: boolean;
    isRequired?: boolean;
    iconLeft?: React.ReactElement;
    _containerStyle?: BSBoxProps;
    _focus?: Omit<BSTextInputProps, '_ios' | '_android' | '_web' | '_focus'>;
    _iconRight?: BSButtonProps;
    iconRight?: React.ReactElement;
    color?: keyof Theme["colors"];
    variant?: (string & {});
    size?: 'sm' | 'md' | 'lg' | 'xl';
};
export declare const Input: React.FC<BSTextInputProps>;
export declare const InputText: import("react").FC<any>;
