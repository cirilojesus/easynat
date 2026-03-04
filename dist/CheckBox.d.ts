/// <reference types="react" />
import { Theme } from "./theme";
import { BSButtonProps } from "./Button";
export type EACheckBoxProps = Omit<BSButtonProps, '_ios' | '_android' | '_web'> & {
    checked?: boolean;
    onChange?: (checked: boolean) => void;
    pointerBox?: boolean;
    label?: string;
    color?: keyof Theme["colors"];
    _ios?: Omit<EACheckBoxProps, '_ios' | '_android' | '_web'>;
    _android?: Omit<EACheckBoxProps, '_ios' | '_android' | '_web'>;
    _web?: Omit<EACheckBoxProps, '_ios' | '_android' | '_web'>;
};
export declare const CheckBox: React.FC<EACheckBoxProps>;
