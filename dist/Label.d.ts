/// <reference types="react" />
import { BSTextProps } from "./Text";
export type LabelType = BSTextProps & {
    isFloat?: boolean;
    isRequired?: boolean;
};
export type LabelRef = {
    animate: (value: boolean) => void;
};
export declare const Label: import("react").ForwardRefExoticComponent<Omit<any, "ref"> & import("react").RefAttributes<LabelRef>>;
