import { RefObject } from "react";
import type { GestureResponderEvent, View } from "react-native";
type TapListener = (e: {
    pageX: number;
    pageY: number;
}) => void;
/**
 * Escucha los toques de toda la app (dentro del ThemeProvider y de los modales). Devuelve la función para dejar de
 * escuchar. Solo llegan toques (soltar sin moverse), no arrastres
 * @example const stop = addTapListener(({ pageX, pageY }) => console.log(pageX, pageY)); ... stop();
 */
export declare const addTapListener: (fn: TapListener) => () => void;
/**
 * Eventos de toque que suben desde cualquier hijo (no hacen falta para el responder: no le quitan el toque a
 * nadie). Un ScrollView que empieza a desplazarse cancela el toque (onTouchCancel): no cuenta como toque
 */
export declare const touchHandlers: {
    onTouchStart: (e: GestureResponderEvent) => void;
    onTouchMove: (e: GestureResponderEvent) => void;
    onTouchEnd: () => void;
    onTouchCancel: () => void;
};
/** Simula un toque en (pageX, pageY): les llega a todos los que escuchan (pruebas, toques que no pasan por la app) */
export declare const emitTap: (pageX: number, pageY: number) => void;
/**
 * Llama a `onTapOutside` al tocar fuera de la vista de `ref` (no al hacer scroll). Mientras `enabled` sea false no
 * escucha nada. La vista se mide al activarse (si se mueve mientras, vuelve a medirse en cada toque)
 * @example
 * const panel = useRef<View>(null);
 * useTapOutside(panel, () => setAbierto(false), abierto);
 * <View ref={panel} collapsable={false}>...</View>
 */
export declare const useTapOutside: (ref: RefObject<View | null>, onTapOutside: () => void, enabled?: boolean) => void;
export {};
