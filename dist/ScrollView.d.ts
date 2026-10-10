import React from "react";
import { ScrollViewProps } from "react-native";
import { EATextProps } from "./Text";
import { EADefaultProps } from "./utils/DEFAULT_PROPS";
export type EAScrollViewProps = ScrollViewProps & EADefaultProps & {
    _ios?: EAScrollViewProps;
    _android?: EAScrollViewProps;
    _web?: EAScrollViewProps;
    _text?: EATextProps;
    _contentContainerStyle?: EAScrollViewProps;
    variant?: (string & {});
};
export declare const ScrollView: React.FC<EAScrollViewProps>;
