/// <reference types="react" />
import { Theme } from "./theme";
import { BSButtonProps } from "./Button";
export type EACheckBoxProps = BSButtonProps & {
    checked?: boolean;
    onChange?: (checked: boolean) => void;
    pointerBox?: boolean;
    label?: string;
    color?: keyof Theme["colors"];
    _ios?: EACheckBoxProps;
    _android?: EACheckBoxProps;
    _web?: EACheckBoxProps;
};
export declare const CheckBox: React.FC<EACheckBoxProps>;
