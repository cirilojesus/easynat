import React from "react";
import { View } from "react-native";
/**
 * Estado del teclado en pantalla.
 * @returns height: alto en px (0 si está cerrado), isVisible y dismiss() para cerrarlo.
 *
 * @example
 * const { height, isVisible, dismiss } = useKeyboard();
 * <Box pb={height}>…</Box>
 */
export declare function useKeyboard(): {
    height: number;
    isVisible: boolean;
    dismiss: () => void;
};
/** Alto del teclado en px (0 si está cerrado). */
export declare function useKeyboardHeight(): number;
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
export declare const useAndroidKeyboardPadding: (ref: React.RefObject<View>, offset?: number) => void;
