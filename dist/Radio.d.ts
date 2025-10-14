/// <reference types="react" />
import { Theme } from "./theme";
import { BSButtonProps } from "./Button";
export type EARadioProps = BSButtonProps & {
    checked?: boolean;
    value?: any;
    onChange?: (checked: boolean) => void;
    pointerBox?: boolean;
    label?: string | number;
    color?: keyof Theme["colors"];
    _ios?: EARadioProps;
    _android?: EARadioProps;
    _web?: EARadioProps;
};
export declare const Radio: React.FC<EARadioProps>;
