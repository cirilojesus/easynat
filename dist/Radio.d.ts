import React from "react";
import { ThemeColor } from "./theme";
import { EABoxProps } from "./Box";
import { EAButtonProps } from "./Button";
export type EARadioProps = EAButtonProps & {
    checked?: boolean;
    value?: any;
    onChange?: (value: any) => void;
    pointerBox?: boolean;
    label?: string | number;
    color?: ThemeColor;
    _ios?: EARadioProps;
    _android?: EARadioProps;
    _web?: EARadioProps;
    /** Estilo del círculo */
    _containerIcon?: EABoxProps;
};
export declare const Radio: React.FC<EARadioProps>;
