import React from "react";
import { ThemeColor } from "./theme";
import { EABoxProps } from "./Box";
import { EAButtonProps } from "./Button";
export type EACheckBoxProps = Omit<EAButtonProps, '_ios' | '_android' | '_web'> & {
    checked?: boolean;
    onChange?: (checked: boolean) => void;
    pointerBox?: boolean;
    label?: string;
    color?: ThemeColor;
    variant?: (string & {});
    size?: 'sm' | 'md' | 'lg' | 'xl';
    _containerIcon?: EABoxProps;
    _ios?: Omit<EACheckBoxProps, '_ios' | '_android' | '_web'>;
    _android?: Omit<EACheckBoxProps, '_ios' | '_android' | '_web'>;
    _web?: Omit<EACheckBoxProps, '_ios' | '_android' | '_web'>;
};
export declare const CheckBox: React.FC<EACheckBoxProps>;
