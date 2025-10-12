import React from "react";
import { ScrollViewProps } from "react-native";
import { BSTextProps } from "./Text";
import { BSDefaultProps } from "./utils/DEFAULT_PROPS";
export type BSScrollViewProps = ScrollViewProps & BSDefaultProps & {
    _ios?: BSScrollViewProps;
    _android?: BSScrollViewProps;
    _web?: BSScrollViewProps;
    _text?: BSTextProps;
    _contentContainerStyle?: BSScrollViewProps;
};
export declare const ScrollView: React.FC<BSScrollViewProps>;
