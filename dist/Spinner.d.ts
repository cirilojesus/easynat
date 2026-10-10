import React from "react";
import { ActivityIndicatorProps } from "react-native";
import { EABoxProps } from "./Box";
import { EATextProps } from "./Text";
import { EADefaultProps } from "./utils/DEFAULT_PROPS";
import { ThemeColor } from "./theme";
export type EASpinnerProps = ActivityIndicatorProps & EADefaultProps & {
    color?: ThemeColor;
    _ios?: EASpinnerProps;
    _android?: EASpinnerProps;
    _web?: EASpinnerProps;
    variant?: (string & {});
};
export declare const Spinner: React.FC<EASpinnerProps>;
export type SpinnerOverlayOptions = {
    /** Texto debajo del spinner */
    message?: string;
    /** Se esconde solo a los X ms */
    duration?: number;
    /** No aparece hasta pasados X ms (si termina antes, no parpadea). Por defecto 0 */
    delay?: number;
    /** Una vez visible, se queda al menos X ms (sin destellos). Por defecto 300 */
    minDuration?: number;
    /** Progreso de 0 a 1 (muestra el %); se cambia con handle.update({ progress }) */
    progress?: number;
    /** Tocar el fondo o atrás (Android) lo cierra y llama a onCancel. Por defecto false (bloquea) */
    cancelable?: boolean;
    onCancel?: () => void;
    /** Cerrar el teclado al aparecer. Por defecto true */
    dismissKeyboard?: boolean;
    /** 'card': spinner en una tarjeta blanca (por defecto); 'plain': solo el spinner sobre el fondo */
    variant?: 'card' | 'plain' | (string & {});
    /** Color del fondo que tapa la pantalla */
    backdropColor?: string;
    size?: ActivityIndicatorProps['size'];
    color?: string;
    _content?: EABoxProps;
    _text?: EATextProps;
};
export type SpinnerHandle = {
    /** Esconde este spinner (si hay otros abiertos, se sigue viendo hasta que terminen) */
    hide: () => void;
    /** Cambia su mensaje o progreso */
    update: (options: Partial<SpinnerOverlayOptions>) => void;
};
/**
 * Muestra un spinner que tapa toda la pantalla (y bloquea los toques) desde cualquier parte, sin montar nada.
 * Devuelve un control para esconderlo; hideSpinner() los esconde todos
 * @example const s = showSpinner('Guardando…'); await guardar(); s.hide();
 * @example showSpinner({ message: 'Conectando…', duration: 3000 })
 */
export declare const showSpinner: (options?: string | SpinnerOverlayOptions) => SpinnerHandle;
/** Esconde todos los spinners de pantalla completa */
export declare const hideSpinner: () => void;
/** ¿Se está viendo? */
export declare const isSpinnerVisible: () => boolean;
/**
 * Muestra el spinner mientras dura la promesa (o la función async) y lo esconde al terminar, salga bien o mal
 * @example const datos = await withSpinner(api.get('/pedidos'), 'Cargando pedidos…');
 */
export declare const withSpinner: <T>(task: Promise<T> | (() => Promise<T>), options?: string | SpinnerOverlayOptions) => Promise<T>;
export type SpinnerOverlayProps = SpinnerOverlayOptions & {
    visible: boolean;
};
/**
 * El mismo spinner de pantalla completa, controlado por una prop (se ve mientras visible sea true)
 * @example <SpinnerOverlay visible={guardando} message="Guardando…" />
 */
export declare const SpinnerOverlay: ({ visible, ...options }: SpinnerOverlayProps) => any;
