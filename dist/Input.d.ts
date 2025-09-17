import React from "react";
import { TextInputProps } from "react-native";
import { BSDefaultProps } from "./utils/DEFAULT_PROPS";
export type BSTextInputProps = TextInputProps & BSDefaultProps & {
    _ios?: BSTextInputProps;
    _android?: BSTextInputProps;
    _web?: BSTextInputProps;
};
export declare const InputText: React.FC<BSTextInputProps>;
