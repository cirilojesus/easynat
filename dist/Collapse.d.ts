/// <reference types="react" />
import { BSBoxProps } from './Box';
import { BSButtonProps } from './Button';
export type CollapseHandle = {
    open: () => void;
    close: () => void;
    toggle: () => void;
};
export type CollapseProps = BSBoxProps & {
    trigger: (props: {
        isOpen: boolean;
    } & BSButtonProps) => React.ReactNode;
    _contentStyle?: BSBoxProps;
    _open?: BSButtonProps;
    _trigger?: BSButtonProps;
};
export declare const Collapse: import("react").ForwardRefExoticComponent<Omit<any, "ref"> & import("react").RefAttributes<CollapseHandle>>;
