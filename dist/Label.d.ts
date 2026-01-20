import React from "react";
import { BSTextProps } from "./Text";
export type LabelType = BSTextProps & {
    isFloat?: boolean;
    isRequired?: boolean;
};
export type LabelRef = {
    animate: (value: boolean) => void;
};
type LabelComponent = React.ForwardRefExoticComponent<LabelType & React.RefAttributes<LabelRef>>;
export declare const Label: LabelComponent;
export {};
