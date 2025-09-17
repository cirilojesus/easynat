import React from "react";
import { ScrollViewProps } from "react-native";
import { BSTextProps } from "./Text";
import { BSDefaultProps } from "./utils/DEFAULT_PROPS";
export type BSScrollBoxProps = ScrollViewProps & BSDefaultProps & {
    _ios?: BSScrollBoxProps;
    _android?: BSScrollBoxProps;
    _web?: BSScrollBoxProps;
    _text?: BSTextProps;
    _contentContainerStyle?: BSScrollBoxProps;
};
export declare const ScrollBox: React.FC<BSScrollBoxProps>;
