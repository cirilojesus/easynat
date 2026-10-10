import React from 'react';
import { EABoxProps } from './Box';
import { EAButtonProps } from './Button';
export type CollapseHandle = {
    open: () => void;
    close: () => void;
    toggle: () => void;
    isOpen: () => boolean;
};
/** Lo que recibe la función `trigger`: props listas para un Button (estilo, icono, accesibilidad) */
export type CollapseTriggerProps = Omit<EAButtonProps, 'onPress'> & {
    isOpen: boolean;
    onPress: (e?: any) => void;
};
export type CollapseProps = EABoxProps & {
    /** El trigger: normalmente un <Button {...props}>Título</Button> */
    trigger: (props: CollapseTriggerProps) => React.ReactNode;
    /** Empieza abierto (sin animación) */
    defaultOpen?: boolean;
    /** Controlado: abierto o cerrado según esta prop (usa onChange para cambiarla) */
    isOpen?: boolean;
    /** Se llama al pedir abrir o cerrar (por el trigger o por ref) */
    onChange?: (isOpen: boolean) => void;
    /** Se llama cuando termina de abrirse */
    onOpen?: () => void;
    /** Se llama cuando termina de cerrarse */
    onClose?: () => void;
    /** Duración de la animación en ms (por defecto 250) */
    duration?: number;
    /** No monta el contenido hasta la primera vez que se abre (para contenido pesado) */
    lazy?: boolean;
    /** El trigger no responde */
    disabled?: boolean;
    /** Icono del trigger (gira al abrir). false para quitarlo */
    icon?: React.ReactElement | false;
    _contentStyle?: EABoxProps;
    /** Props del trigger */
    _trigger?: EAButtonProps;
    /** Props del trigger cuando está abierto (se fusionan con _trigger) */
    _open?: EAButtonProps;
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
