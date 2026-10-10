import React from "react";
import { EATextProps } from "./Text";
export type LabelType = EATextProps & {
    isFloat?: boolean;
    isRequired?: boolean;
    /** Alto del campo que va debajo (flotante): en reposo, el label se centra en él */
    fieldHeight?: number;
};
export type LabelRef = {
    animate: (value: boolean) => void;
};
type LabelComponent = React.ForwardRefExoticComponent<LabelType & React.RefAttributes<LabelRef>>;
export declare const Label: LabelComponent;
export {};
