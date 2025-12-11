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
        onPress: () => void;
    } & BSButtonProps) => React.ReactNode;
    _contentStyle?: BSBoxProps;
    _open?: BSButtonProps;
    _trigger?: BSButtonProps;
};
export type CollapseComponent = (props: CollapseProps & {
    ref?: React.Ref<CollapseHandle>;
}) => React.ReactElement | null;
/**
 * forwardRef pierde los tipos al compilar.
 * Aquí los restauramos para que funcione el autocompletado
 * en el proyecto donde usas la librería.
 */
export declare const Collapse: CollapseComponent;
