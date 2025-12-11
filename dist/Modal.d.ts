import React from "react";
import { ViewProps, PressableProps } from "react-native";
import { BSBoxProps } from "./Box";
import { BSButtonProps } from "./Button";
import { BSKeyboardAvoidingProps } from "./KeyboardAvoidingView";
import { BSDefaultProps } from "./utils/DEFAULT_PROPS";
export type BSModalRef = {
    open: () => void;
    close: () => void;
};
export type BSModalProps = BSKeyboardAvoidingProps & {
    header?: BSBoxProps;
    buttonClose?: boolean | React.ReactElement<any>;
    _buttonClose?: BSButtonProps;
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
export type ModalComponent = (props: BSModalProps & {
    ref?: React.Ref<BSModalRef>;
}) => React.ReactElement | null;
/**
 * El cast correcto:
 * `forwardRef` pierde los tipos, así que lo restauramos manualmente.
 */
export declare const Modal: ModalComponent;
