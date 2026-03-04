/// <reference types="react" />
import { Theme } from "./theme";
import { BSBoxProps } from "./Box";
import { BSButtonProps } from "./Button";
export type EACheckBoxProps = Omit<BSButtonProps, '_ios' | '_android' | '_web'> & {
    checked?: boolean;
    onChange?: (checked: boolean) => void;
    pointerBox?: boolean;
    label?: string;
    color?: keyof Theme["colors"];
    variant?: (string & {});
    size?: 'sm' | 'md' | 'lg' | 'xl';
    _containerIcon?: BSBoxProps;
    _ios?: Omit<EACheckBoxProps, '_ios' | '_android' | '_web'>;
    _android?: Omit<EACheckBoxProps, '_ios' | '_android' | '_web'>;
    _web?: Omit<EACheckBoxProps, '_ios' | '_android' | '_web'>;
};
export declare const CheckBox: React.FC<EACheckBoxProps>;
