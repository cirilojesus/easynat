"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTapOutside = exports.emitTap = exports.touchHandlers = exports.addTapListener = void 0;
// Aviso de los toques de la app (sin quedárselos): para cerrar cosas al tocar fuera de ellas (p. ej. el teclado
// del RichTextEditor, un panel, un tooltip). Solo cuenta un toque de verdad: soltar sin moverse; arrastrar (hacer
// scroll) no cuenta. El ThemeProvider y cada Modal envuelven su contenido con touchHandlers
const react_1 = require("react");
const listeners = new Set();
// Más de esto (px) entre empezar y soltar: es un arrastre, no un toque
const SLOP = 10;
let start = null;
/**
 * Escucha los toques de toda la app (dentro del ThemeProvider y de los modales). Devuelve la función para dejar de
 * escuchar. Solo llegan toques (soltar sin moverse), no arrastres
 * @example const stop = addTapListener(({ pageX, pageY }) => console.log(pageX, pageY)); ... stop();
 */
const addTapListener = (fn) => {
    listeners.add(fn);
    return () => { listeners.delete(fn); };
};
exports.addTapListener = addTapListener;
const point = (e) => {
    var _a, _b;
    const t = (_b = (_a = e.nativeEvent.touches) === null || _a === void 0 ? void 0 : _a[0]) !== null && _b !== void 0 ? _b : e.nativeEvent;
    return { x: t.pageX, y: t.pageY };
};
/**
 * Eventos de toque que suben desde cualquier hijo (no hacen falta para el responder: no le quitan el toque a
 * nadie). Un ScrollView que empieza a desplazarse cancela el toque (onTouchCancel): no cuenta como toque
 */
exports.touchHandlers = {
    onTouchStart: (e) => {
        var _a, _b;
        if (!listeners.size)
            return;
        // Varios dedos (zoom, etc.): no es un toque
        if (((_b = (_a = e.nativeEvent.touches) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 1) > 1) {
            start = null;
            return;
        }
        const p = point(e);
        start = { x: p.x, y: p.y, moved: false };
    },
    onTouchMove: (e) => {
        if (!start)
            return;
        const p = point(e);
        if (Math.abs(p.x - start.x) > SLOP || Math.abs(p.y - start.y) > SLOP)
            start.moved = true;
    },
    onTouchEnd: () => {
        const s = start;
        start = null;
        if (s && !s.moved)
            listeners.forEach(fn => fn({ pageX: s.x, pageY: s.y }));
    },
    onTouchCancel: () => { start = null; },
};
/** Simula un toque en (pageX, pageY): les llega a todos los que escuchan (pruebas, toques que no pasan por la app) */
const emitTap = (pageX, pageY) => listeners.forEach(fn => fn({ pageX, pageY }));
exports.emitTap = emitTap;
/**
 * Llama a `onTapOutside` al tocar fuera de la vista de `ref` (no al hacer scroll). Mientras `enabled` sea false no
 * escucha nada. La vista se mide al activarse (si se mueve mientras, vuelve a medirse en cada toque)
 * @example
 * const panel = useRef<View>(null);
 * useTapOutside(panel, () => setAbierto(false), abierto);
 * <View ref={panel} collapsable={false}>...</View>
 */
const useTapOutside = (ref, onTapOutside, enabled = true) => {
    const callback = (0, react_1.useRef)(onTapOutside);
    callback.current = onTapOutside;
    (0, react_1.useEffect)(() => {
        if (!enabled)
            return;
        let rect = null;
        const measure = () => { var _a; return (_a = ref.current) === null || _a === void 0 ? void 0 : _a.measure((_x, _y, w, h, pageX, pageY) => { rect = { x: pageX, y: pageY, w, h }; }); };
        measure();
        return (0, exports.addTapListener)(({ pageX, pageY }) => {
            if (!rect)
                return;
            const inside = pageX >= rect.x && pageX <= rect.x + rect.w && pageY >= rect.y && pageY <= rect.y + rect.h;
            if (!inside)
                callback.current();
            else
                measure();
        });
    }, [enabled]);
};
exports.useTapOutside = useTapOutside;
