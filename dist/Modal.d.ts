import React from "react";
import { ViewProps, PressableProps } from "react-native";
import { BSBoxProps } from "./Box";
import { IconProps } from "./Icon";
import { Button, BSButtonProps } from "./Button";
import { BSKeyboardAvoidingProps } from "./KeyboardAvoidingView";
import { BSDefaultProps } from "./utils/DEFAULT_PROPS";
export type BSModalRef = {
    open: () => void;
    close: () => void;
};
export type BSModalProps = BSKeyboardAvoidingProps & {
    header?: BSBoxProps;
    iconClose?: boolean | typeof Button;
    _icon?: BSButtonProps & {
        icon: Partial<IconProps>;
    };
    _contentStyle?: ViewProps & BSDefaultProps;
    safeAreaTop?: boolean;
    safeAreaBottom?: boolean;
    onClose?: () => void;
    _ios?: BSModalProps;
    _android?: BSModalProps;
    _web?: BSModalProps;
    _backdrop?: PressableProps & BSDefaultProps;
    static?: boolean;
};
export declare const Modal: React.ForwardRefExoticComponent<any>;
