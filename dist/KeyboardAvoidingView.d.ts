import React from "react";
import { KeyboardAvoidingViewProps } from "react-native";
import { EADefaultProps } from "./utils/DEFAULT_PROPS";
export type EAKeyboardAvoidingProps = KeyboardAvoidingViewProps & EADefaultProps & {
    _ios?: EAKeyboardAvoidingProps;
    _android?: EAKeyboardAvoidingProps;
    _web?: EAKeyboardAvoidingProps;
    variant?: (string & {});
};
export declare const KeyboardAvoidingView: React.FC<EAKeyboardAvoidingProps>;
