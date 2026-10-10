"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAndroidKeyboardPadding = void 0;
exports.useKeyboard = useKeyboard;
exports.useKeyboardHeight = useKeyboardHeight;
const react_1 = require("react");
const react_native_1 = require("react-native");
// Store único del teclado para toda la app: un solo par de listeners compartido por todos los
// componentes. Así un componente que se monta a mitad de la animación del teclado (p. ej. el menú
// de un SearchInput, que se abre al hacer focus) ya conoce la altura en su primer render.
let keyboardHeight = 0;
const subscribers = new Set();
let installed = false;
const setKeyboardHeight = (height) => {
    if (height === keyboardHeight)
        return;
    keyboardHeight = height;
    subscribers.forEach(fn => fn());
};
const installKeyboardListeners = () => {
    var _a, _b, _c, _d;
    if (installed)
        return;
    installed = true;
    keyboardHeight = ((_a = react_native_1.Keyboard.isVisible) === null || _a === void 0 ? void 0 : _a.call(react_native_1.Keyboard)) ? (_d = (_c = (_b = react_native_1.Keyboard.metrics) === null || _b === void 0 ? void 0 : _b.call(react_native_1.Keyboard)) === null || _c === void 0 ? void 0 : _c.height) !== null && _d !== void 0 ? _d : 0 : 0;
    const onShow = (e) => setKeyboardHeight(e.endCoordinates.height);
    const onHide = () => setKeyboardHeight(0);
    // iOS: los "Will" llegan al empezar la animación (lo que interesa); los "Did" se escuchan
    // también por si un "Will" se emitió antes de instalar los listeners. Android solo emite "Did".
    if (react_native_1.Platform.OS === "ios") {
        react_native_1.Keyboard.addListener("keyboardWillShow", onShow);
        react_native_1.Keyboard.addListener("keyboardWillHide", onHide);
        react_native_1.Keyboard.addListener("keyboardWillChangeFrame", e => {
            if (keyboardHeight > 0)
                onShow(e);
        });
    }
    react_native_1.Keyboard.addListener("keyboardDidShow", onShow);
    react_native_1.Keyboard.addListener("keyboardDidHide", onHide);
};
const subscribeKeyboard = (fn) => {
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
function useKeyboard() {
    installKeyboardListeners();
    const height = (0, react_1.useSyncExternalStore)(subscribeKeyboard, getKeyboardHeight);
    return { height, isVisible: height > 0, dismiss: react_native_1.Keyboard.dismiss };
}
/** Alto del teclado en px (0 si está cerrado). */
function useKeyboardHeight() {
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
const useAndroidKeyboardPadding = (ref, offset = 0) => {
    (0, react_1.useEffect)(() => {
        if (react_native_1.Platform.OS !== "android")
            return;
        const setPadding = (paddingBottom) => { var _a, _b; return (_b = (_a = ref.current) === null || _a === void 0 ? void 0 : _a.setNativeProps) === null || _b === void 0 ? void 0 : _b.call(_a, { style: { paddingBottom: Math.max(paddingBottom, 0) } }); };
        const showSub = react_native_1.Keyboard.addListener("keyboardDidShow", (e) => setPadding(e.endCoordinates.height - offset));
        const hideSub = react_native_1.Keyboard.addListener("keyboardDidHide", () => setPadding(0));
        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, [offset]);
};
exports.useAndroidKeyboardPadding = useAndroidKeyboardPadding;
