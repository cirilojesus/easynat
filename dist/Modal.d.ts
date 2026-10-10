import React from "react";
import { ViewProps, PressableProps } from "react-native";
import { EABoxProps } from "./Box";
import { EAButtonProps } from "./Button";
import { EAKeyboardAvoidingProps } from "./KeyboardAvoidingView";
import { EADefaultProps } from "./utils/DEFAULT_PROPS";
/** Lo que recibe `children` cuando es una función: la data con la que se abrió y close(result) */
export type EAModalContext<T = any, R = any> = {
    data: T;
    close: (result?: R) => void;
};
export type EAModalRef<T = any, R = any> = {
    /** Abre el modal; `data` llega a `children` cuando es una función */
    open: (data?: T) => void;
    /** Cierra el modal; `result` llega a `afterClose` (y a `result` en los dinámicos) */
    close: (result?: R) => void;
    isOpen: () => boolean;
};
export type EAModalProps<T = any, R = any> = Omit<EAKeyboardAvoidingProps, 'children'> & {
    /** JSX normal, o una función que recibe { data, close } */
    children?: React.ReactNode | ((context: EAModalContext<T, R>) => React.ReactNode);
    header?: EABoxProps;
    buttonClose?: boolean | React.ReactElement<any>;
    _buttonClose?: EAButtonProps;
    _contentStyle?: ViewProps & EADefaultProps;
    safeAreaTop?: boolean;
    safeAreaBottom?: boolean;
    /** Cuando el usuario pide cerrar: atrás (Android), tocar fuera o la ×. No con close() por código: para eso, afterClose */
    onClose?: () => void;
    _ios?: EAModalProps<T, R>;
    _android?: EAModalProps<T, R>;
    _web?: EAModalProps<T, R>;
    _backdrop?: PressableProps & EADefaultProps;
    static?: boolean;
    variant?: (string & {});
    /** Permite controlar el modal desde cualquier parte con openModal(id) / closeModal(id) */
    id?: string;
    /** Se llama cuando el modal termina de cerrarse (con la animación completa), sea cual sea la vía.
     *  Recibe el valor pasado a close(result), o undefined si se cerró sin valor (X, fuera, atrás). */
    afterClose?: (result?: R) => void;
    /** Se llama cuando el modal termina de abrirse (con la animación completa); recibe la data de open(data) */
    onOpen?: (data?: T) => void;
    /** El modal monta ya abierto (sin animación de entrada). El cierre y las aperturas posteriores sí se animan */
    defaultOpen?: boolean;
    /** Animación de entrada/salida del contenido. Por defecto 'slideUp' */
    animationType?: EAModalAnimation;
    /** Duración de la animación de abrir y cerrar en ms (por defecto 200) */
    duration?: number;
};
/**
 * - slideUp: entra desde abajo (por defecto) · slideDown: desde arriba
 * - slideLeft: entra desde la derecha hacia la izquierda · slideRight: desde la izquierda hacia la derecha
 * - fade: aparece con transparencia · scale: crece desde el 85 % con fade · none: sin animación
 */
export type EAModalAnimation = 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'fade' | 'scale' | 'none';
/** Props de openModal({...}): las del Modal más la data inicial */
export type EADynamicModalProps<T = any, R = any> = EAModalProps<T, R> & {
    data?: T;
};
/** Control de un modal abierto con openModal({...}) */
export type EAModalHandle<T = any, R = any> = {
    close: (result?: R) => void;
    /** Cambia props del modal abierto (p. ej. su contenido o su data) */
    update: (props: Partial<EADynamicModalProps<T, R>>) => void;
    isOpen: () => boolean;
    /** Se resuelve al terminar de cerrarse con el valor de close(result) (undefined si se cerró sin valor) */
    readonly result: Promise<R | undefined>;
};
/**
 * - openModal(id): abre el modal montado con ese id (el más reciente si hay varios). Devuelve false si no existe.
 * - openModal({...props}): crea y abre un modal al vuelo, sin declararlo en el JSX. Se destruye al cerrarse.
 *
 * @example
 * const modal = openModal({
 *     header: { children: <Text variant="h5" p={4}>Título</Text> },
 *     _contentStyle: { h: 'auto' },
 *     children: <Box p={4}><Button onPress={() => modal.close()}>Cerrar</Button></Box>,
 * });
 */
export declare function openModal<T = any>(id: string, data?: T): boolean;
export declare function openModal<T = any, R = any>(props: EADynamicModalProps<T, R>): EAModalHandle<T, R>;
/** Cierra el modal (o modales) con ese id; `result` llega a su afterClose. Devuelve false si no hay ninguno montado. */
export declare const closeModal: (id: string, result?: any) => boolean;
/** Indica si algún modal con ese id está abierto. */
export declare const isModalOpen: (id: string) => boolean;
/** Cierra todos los modales abiertos (incluidos los internos de Select y DatePicker). */
export declare const closeAllModals: () => void;
export type ModalComponent = <T = any, R = any>(props: EAModalProps<T, R> & {
    ref?: React.Ref<EAModalRef<T, R>>;
}) => React.ReactElement | null;
/**
 * El cast correcto:
 * `forwardRef` pierde los tipos, así que lo restauramos manualmente.
 */
export declare const Modal: ModalComponent;
