// Aviso de los toques de la app (sin quedárselos): para cerrar cosas al tocar fuera de ellas (p. ej. el teclado
// del RichTextEditor, un panel, un tooltip). Solo cuenta un toque de verdad: soltar sin moverse; arrastrar (hacer
// scroll) no cuenta. El ThemeProvider y cada Modal envuelven su contenido con touchHandlers
import { RefObject, useEffect, useRef } from "react";
import type { GestureResponderEvent, View } from "react-native";

type TapListener = (e: { pageX: number; pageY: number }) => void;
const listeners = new Set<TapListener>();
// Más de esto (px) entre empezar y soltar: es un arrastre, no un toque
const SLOP = 10;
let start: { x: number; y: number; moved: boolean } | null = null;

/**
 * Escucha los toques de toda la app (dentro del ThemeProvider y de los modales). Devuelve la función para dejar de
 * escuchar. Solo llegan toques (soltar sin moverse), no arrastres
 * @example const stop = addTapListener(({ pageX, pageY }) => console.log(pageX, pageY)); ... stop();
 */
export const addTapListener = (fn: TapListener) => {
    listeners.add(fn);
    return () => { listeners.delete(fn) };
};

const point = (e: GestureResponderEvent) => {
    const t = e.nativeEvent.touches?.[0] ?? e.nativeEvent;
    return { x: t.pageX, y: t.pageY };
};

/**
 * Eventos de toque que suben desde cualquier hijo (no hacen falta para el responder: no le quitan el toque a
 * nadie). Un ScrollView que empieza a desplazarse cancela el toque (onTouchCancel): no cuenta como toque
 */
export const touchHandlers = {
    onTouchStart: (e: GestureResponderEvent) => {
        if (!listeners.size) return;
        // Varios dedos (zoom, etc.): no es un toque
        if ((e.nativeEvent.touches?.length ?? 1) > 1) { start = null; return }
        const p = point(e);
        start = { x: p.x, y: p.y, moved: false };
    },
    onTouchMove: (e: GestureResponderEvent) => {
        if (!start) return;
        const p = point(e);
        if (Math.abs(p.x - start.x) > SLOP || Math.abs(p.y - start.y) > SLOP) start.moved = true;
    },
    onTouchEnd: () => {
        const s = start;
        start = null;
        if (s && !s.moved) listeners.forEach(fn => fn({ pageX: s.x, pageY: s.y }));
    },
    onTouchCancel: () => { start = null },
};

/** Simula un toque en (pageX, pageY): les llega a todos los que escuchan (pruebas, toques que no pasan por la app) */
export const emitTap = (pageX: number, pageY: number) => listeners.forEach(fn => fn({ pageX, pageY }));

/**
 * Llama a `onTapOutside` al tocar fuera de la vista de `ref` (no al hacer scroll). Mientras `enabled` sea false no
 * escucha nada. La vista se mide al activarse (si se mueve mientras, vuelve a medirse en cada toque)
 * @example
 * const panel = useRef<View>(null);
 * useTapOutside(panel, () => setAbierto(false), abierto);
 * <View ref={panel} collapsable={false}>...</View>
 */
export const useTapOutside = (ref: RefObject<View | null>, onTapOutside: () => void, enabled = true) => {
    const callback = useRef(onTapOutside);
    callback.current = onTapOutside;
    useEffect(() => {
        if (!enabled) return;
        let rect: { x: number; y: number; w: number; h: number } | null = null;
        const measure = () => ref.current?.measure((_x, _y, w, h, pageX, pageY) => { rect = { x: pageX, y: pageY, w, h } });
        measure();
        return addTapListener(({ pageX, pageY }) => {
            if (!rect) return;
            const inside = pageX >= rect.x && pageX <= rect.x + rect.w && pageY >= rect.y && pageY <= rect.y + rect.h;
            if (!inside) callback.current();
            else measure();
        });
    }, [enabled]);
};
