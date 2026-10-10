import React, { useEffect, useSyncExternalStore } from "react";
import { Keyboard, KeyboardEvent, Platform, View } from "react-native";

// Store único del teclado para toda la app: un solo par de listeners compartido por todos los
// componentes. Así un componente que se monta a mitad de la animación del teclado (p. ej. el menú
// de un SearchInput, que se abre al hacer focus) ya conoce la altura en su primer render.
let keyboardHeight = 0;
const subscribers = new Set<() => void>();
let installed = false;

const setKeyboardHeight = (height: number) => {
    if (height === keyboardHeight) return;
    keyboardHeight = height;
    subscribers.forEach(fn => fn());
};

const installKeyboardListeners = () => {
    if (installed) return;
    installed = true;
    keyboardHeight = Keyboard.isVisible?.() ? Keyboard.metrics?.()?.height ?? 0 : 0;
    const onShow = (e: KeyboardEvent) => setKeyboardHeight(e.endCoordinates.height);
    const onHide = () => setKeyboardHeight(0);
    // iOS: los "Will" llegan al empezar la animación (lo que interesa); los "Did" se escuchan
    // también por si un "Will" se emitió antes de instalar los listeners. Android solo emite "Did".
    if (Platform.OS === "ios") {
        Keyboard.addListener("keyboardWillShow", onShow);
        Keyboard.addListener("keyboardWillHide", onHide);
        Keyboard.addListener("keyboardWillChangeFrame", e => {
            if (keyboardHeight > 0) onShow(e);
        });
    }
    Keyboard.addListener("keyboardDidShow", onShow);
    Keyboard.addListener("keyboardDidHide", onHide);
};

const subscribeKeyboard = (fn: () => void) => {
    installKeyboardListeners();
    subscribers.add(fn);
    return () => subscribers.delete(fn);
};
const getKeyboardHeight = () => keyboardHeight;

/**
 * Estado del teclado en pantalla.
 * @returns height: alto en px (0 si está cerrado), isVisible y dismiss() para cerrarlo.
 *
 * @example
 * const { height, isVisible, dismiss } = useKeyboard();
 * <Box pb={height}>…</Box>
 */
export function useKeyboard() {
    installKeyboardListeners();
    const height = useSyncExternalStore(subscribeKeyboard, getKeyboardHeight);
    return { height, isVisible: height > 0, dismiss: Keyboard.dismiss };
}

/** Alto del teclado en px (0 si está cerrado). */
export function useKeyboardHeight() {
    return useKeyboard().height;
}

/**
 * Android: añade al `ref` un paddingBottom igual al alto del teclado mientras está abierto.
 * Útil en pantallas edge-to-edge (Android 15+), donde el sistema ya no redimensiona la ventana.
 *
 * Usa setNativeProps, así que si el componente se vuelve a renderizar con el teclado abierto
 * el padding se pierde hasta el siguiente evento. Para layouts que cambian, es más fiable
 * `useKeyboardHeight()` en el style o un `KeyboardAvoidingView` con behavior="padding".
 *
 * @param offset px a restar del alto del teclado (p. ej. una barra inferior que ya ocupa ese espacio)
 *
 * @example
 * // Formulario a pantalla completa cuyo botón debe quedar por encima del teclado en Android
 * const ChatScreen = () => {
 *     const containerRef = useRef<View>(null);
 *
 *     // Sin barra inferior: el padding es el alto completo del teclado
 *     useAndroidKeyboardPadding(containerRef);
 *
 *     // Con una tab bar de 60px debajo, que ya cubre parte del teclado:
 *     // useAndroidKeyboardPadding(containerRef, 60);
 *
 *     return (
 *         <View ref={containerRef} style={{ flex: 1 }}>
 *             <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
 *                 {mensajes}
 *             </ScrollView>
 *             <Input placeholder="Escribe un mensaje" />
 *         </View>
 *     );
 * };
 */
export const useAndroidKeyboardPadding = (ref: React.RefObject<View>, offset = 0) => {
    useEffect(() => {
        if (Platform.OS !== "android") return;

        const setPadding = (paddingBottom: number) =>
            ref.current?.setNativeProps?.({ style: { paddingBottom: Math.max(paddingBottom, 0) } });

        const showSub = Keyboard.addListener("keyboardDidShow", (e) => setPadding(e.endCoordinates.height - offset));
        const hideSub = Keyboard.addListener("keyboardDidHide", () => setPadding(0));

        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, [offset]);
};
