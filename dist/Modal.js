"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Modal = exports.closeAllModals = exports.isModalOpen = exports.closeModal = void 0;
exports.openModal = openModal;
// Modal.tsx
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const Portal_1 = require("./Portal");
const touches_1 = require("./utils/touches");
const react_native_root_siblings_1 = __importDefault(require("react-native-root-siblings"));
const Box_1 = require("./Box");
const Icon_1 = require("./Icon");
const Button_1 = require("./Button");
const KeyboardAvoidingView_1 = require("./KeyboardAvoidingView");
const DEFAULT_PROPS_1 = require("./utils/DEFAULT_PROPS");
const useThemeProps_1 = require("./utils/useThemeProps");
/* ------------------ REGISTRO GLOBAL ------------------ */
// Modales montados por id (un id puede estar montado varias veces, p. ej. en pantallas apiladas)
const modalsById = new Map();
// Modales abiertos ahora mismo, en orden de apertura
const openModals = new Set();
function openModal(arg, data) {
    var _a;
    if (typeof arg !== 'string')
        return openDynamicModal(arg);
    const modal = (_a = modalsById.get(arg)) === null || _a === void 0 ? void 0 : _a.at(-1);
    modal === null || modal === void 0 ? void 0 : modal.open(data);
    return !!modal;
}
/** Cierra el modal (o modales) con ese id; `result` llega a su afterClose. Devuelve false si no hay ninguno montado. */
const closeModal = (id, result) => {
    var _a;
    const modals = (_a = modalsById.get(id)) !== null && _a !== void 0 ? _a : [];
    modals.forEach(modal => modal.close(result));
    return modals.length > 0;
};
exports.closeModal = closeModal;
/** Indica si algún modal con ese id está abierto. */
const isModalOpen = (id) => { var _a; return ((_a = modalsById.get(id)) !== null && _a !== void 0 ? _a : []).some(modal => modal.isOpen()); };
exports.isModalOpen = isModalOpen;
/** Cierra todos los modales abiertos (incluidos los internos de Select y DatePicker). */
const closeAllModals = () => {
    Array.from(openModals).reverse().forEach(modal => modal.close());
};
exports.closeAllModals = closeAllModals;
const AnimatedPressable = react_native_1.Animated.createAnimatedComponent(react_native_1.Pressable);
/** Estilo animado del contenido según animationType (progress va de 0 = cerrado a 1 = abierto) */
const contentAnimationStyle = (progress, type = 'slideUp') => {
    const { width, height } = react_native_1.Dimensions.get('window');
    const range = (from, to) => progress.interpolate({ inputRange: [0, 1], outputRange: [from, to] });
    switch (type) {
        case 'slideDown': return { transform: [{ translateY: range(-height, 0) }] };
        case 'slideLeft': return { transform: [{ translateX: range(width, 0) }] };
        case 'slideRight': return { transform: [{ translateX: range(-width, 0) }] };
        case 'fade': return { opacity: progress };
        case 'scale': return { opacity: progress, transform: [{ scale: range(0.85, 1) }] };
        case 'none': return null;
        default: return { transform: [{ translateY: range(height, 0) }] };
    }
};
/* ---------------- INTERNAL COMPONENT ---------------- */
const MODAL_MERGE_KEYS = ['header'];
function InternalModal(props, ref) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    // defaultOpen: el estado inicial ya es "abierto", con la animación en su valor final
    const [visible, setVisible] = (0, react_1.useState)(() => !!props.defaultOpen);
    const slideAnim = (0, react_1.useRef)(new react_native_1.Animated.Value(props.defaultOpen ? 1 : 0)).current;
    // isOpen: estado lógico (open/close); contentReady: el contenido ya está montado y medido;
    // pendingOpen: open() pidió animar pero el contenido aún no existía
    const isOpen = (0, react_1.useRef)(!!props.defaultOpen);
    // Con defaultOpen, onOpen se notifica cuando el contenido ya está montado
    const notifyInitialOpen = (0, react_1.useRef)(!!props.defaultOpen);
    const contentReady = (0, react_1.useRef)(false);
    const pendingOpen = (0, react_1.useRef)(false);
    const onCloseRef = (0, react_1.useRef)(null);
    const afterCloseRef = (0, react_1.useRef)(null);
    const onOpenRef = (0, react_1.useRef)(null);
    const animationRef = (0, react_1.useRef)('slideUp');
    const durationRef = (0, react_1.useRef)(200);
    const dataRef = (0, react_1.useRef)(undefined);
    // data de la apertura actual y resultado con el que se está cerrando
    const [data, setData] = (0, react_1.useState)(undefined);
    const resultRef = (0, react_1.useRef)(undefined);
    (0, react_1.useEffect)(() => {
        if (!visible)
            return;
        const sub = react_native_1.BackHandler.addEventListener("hardwareBackPress", () => {
            var _a;
            (_a = onCloseRef.current) === null || _a === void 0 ? void 0 : _a.call(onCloseRef);
            close();
            return true;
        });
        return () => sub.remove();
    }, [visible]);
    // Defaults → theme.components.Modal → variante → props → plataforma (header también se fusiona)
    const [combinedProps, theme] = (0, useThemeProps_1.useThemeProps)('Modal', props, { mergeKeys: MODAL_MERGE_KEYS });
    onCloseRef.current = combinedProps.onClose;
    afterCloseRef.current = combinedProps.afterClose;
    onOpenRef.current = combinedProps.onOpen;
    animationRef.current = (_a = combinedProps.animationType) !== null && _a !== void 0 ? _a : 'slideUp';
    durationRef.current = (_b = combinedProps.duration) !== null && _b !== void 0 ? _b : 200;
    const buttonClose = (_c = combinedProps.buttonClose) !== null && _c !== void 0 ? _c : true;
    const contentStyle = (0, DEFAULT_PROPS_1.DEFAULT_PROPS)((combinedProps === null || combinedProps === void 0 ? void 0 : combinedProps._contentStyle) || {}, theme);
    const backdropStyle = (0, DEFAULT_PROPS_1.DEFAULT_PROPS)((combinedProps === null || combinedProps === void 0 ? void 0 : combinedProps._backdrop) || {}, theme);
    const animate = (toValue, callBack) => {
        if (animationRef.current === 'none') {
            slideAnim.stopAnimation();
            slideAnim.setValue(toValue);
            callBack === null || callBack === void 0 ? void 0 : callBack();
            return;
        }
        react_native_1.Animated.timing(slideAnim, {
            toValue,
            duration: durationRef.current,
            easing: toValue ? react_native_1.Easing.out(react_native_1.Easing.ease) : react_native_1.Easing.in(react_native_1.Easing.ease),
            useNativeDriver: true,
        }).start(({ finished }) => finished && (callBack === null || callBack === void 0 ? void 0 : callBack()));
    };
    // onOpen se dispara al terminar la animación de apertura (no si la interrumpe un close)
    const notifyOpen = () => {
        var _a;
        if (isOpen.current)
            (_a = onOpenRef.current) === null || _a === void 0 ? void 0 : _a.call(onOpenRef, dataRef.current);
    };
    // Referencia estable a este modal para el registro global
    const handle = (0, react_1.useRef)(null);
    const open = (0, react_1.useCallback)((nextData) => {
        isOpen.current = true;
        resultRef.current = undefined;
        dataRef.current = nextData;
        setData(nextData);
        openModals.add(handle.current);
        setVisible(true);
        // Con useNativeDriver, animar antes de que exista la vista la deja en su valor inicial
        // (modal invisible). Si el contenido ya está montado (se reabre mientras se cerraba) se
        // anima ya; si no, lo hace el primer onLayout del contenido.
        if (contentReady.current)
            animate(1, notifyOpen);
        else
            pendingOpen.current = true;
    }, []);
    const close = (0, react_1.useCallback)((result) => {
        if (!isOpen.current)
            return;
        isOpen.current = false;
        notifyInitialOpen.current = false;
        resultRef.current = result;
        openModals.delete(handle.current);
        pendingOpen.current = false;
        // Se desmonta al terminar la animación; si open() la interrumpe, finished es false y no se oculta
        animate(0, () => {
            var _a;
            if (isOpen.current)
                return;
            const result = resultRef.current;
            resultRef.current = undefined;
            setVisible(false);
            // La data se suelta al terminar de cerrarse para no retenerla entre aperturas
            setData(undefined);
            dataRef.current = undefined;
            (_a = afterCloseRef.current) === null || _a === void 0 ? void 0 : _a.call(afterCloseRef, result);
        });
    }, []);
    // El contenido deja de estar listo solo cuando se desmonta de verdad (layout effect: sin huecos
    // entre el commit y un open() posterior)
    (0, react_1.useLayoutEffect)(() => {
        if (!visible)
            contentReady.current = false;
    }, [visible]);
    // Plan B: si el contenido no avisa de su layout (a veces no llega en la primera apertura), se anima igualmente a
    // los dos fotogramas (la vista ya existe). Sin esto el modal quedaba abierto e invisible, tapando los toques
    (0, react_1.useEffect)(() => {
        if (!visible || !pendingOpen.current)
            return;
        let f2 = 0;
        const f1 = requestAnimationFrame(() => {
            f2 = requestAnimationFrame(() => {
                if (!pendingOpen.current)
                    return;
                pendingOpen.current = false;
                contentReady.current = true;
                animate(1, notifyOpen);
            });
        });
        return () => { cancelAnimationFrame(f1); cancelAnimationFrame(f2); };
    }, [visible]);
    const onContentLayout = () => {
        if (contentReady.current)
            return;
        contentReady.current = true;
        if (notifyInitialOpen.current) {
            notifyInitialOpen.current = false;
            notifyOpen();
        }
        if (pendingOpen.current) {
            pendingOpen.current = false;
            animate(1, notifyOpen);
        }
    };
    if (!handle.current)
        handle.current = { open, close, isOpen: () => isOpen.current };
    (0, react_1.useImperativeHandle)(ref, () => handle.current, []);
    // Registro por id; al desmontar se quita del registro y de la lista de abiertos
    (0, react_1.useEffect)(() => {
        var _a;
        const id = combinedProps.id;
        if (id)
            modalsById.set(id, [...((_a = modalsById.get(id)) !== null && _a !== void 0 ? _a : []), handle.current]);
        return () => {
            var _a;
            if (!id)
                return;
            const rest = ((_a = modalsById.get(id)) !== null && _a !== void 0 ? _a : []).filter(modal => modal !== handle.current);
            rest.length ? modalsById.set(id, rest) : modalsById.delete(id);
        };
    }, [combinedProps.id]);
    (0, react_1.useEffect)(() => () => {
        openModals.delete(handle.current);
    }, []);
    // Un modal que monta abierto cuenta como abierto para closeAllModals
    (0, react_1.useEffect)(() => {
        if (isOpen.current)
            openModals.add(handle.current);
    }, []);
    const handleRequestClose = () => {
        var _a;
        (_a = combinedProps.onClose) === null || _a === void 0 ? void 0 : _a.call(combinedProps);
        close();
    };
    if (!visible)
        return null;
    return (<Portal_1.Portal>
            {/* touchHandlers: dentro del modal también se cierra, p. ej., el teclado de un editor al tocar fuera */}
            <Box_1.Box style={react_native_1.StyleSheet.absoluteFill} flex={1} {...touches_1.touchHandlers}>
                <AnimatedPressable style={[
            { backgroundColor: "#0003" },
            react_native_1.StyleSheet.absoluteFill,
            (_d = combinedProps === null || combinedProps === void 0 ? void 0 : combinedProps._backdrop) === null || _d === void 0 ? void 0 : _d.style,
            ...backdropStyle,
            {
                opacity: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1],
                }),
            },
        ]} onPress={!(combinedProps === null || combinedProps === void 0 ? void 0 : combinedProps.static) ? handleRequestClose : null}/>

                <Box_1.Box bg={combinedProps.bg || "white"} safeAreaTop={combinedProps === null || combinedProps === void 0 ? void 0 : combinedProps.safeAreaTop}/>

                {/* box-none: los toques fuera del contenido llegan al backdrop */}
                <KeyboardAvoidingView_1.KeyboardAvoidingView flex={1} pointerEvents="box-none" 
    // padding en ambas plataformas: mide el solape real con el teclado, así funciona
    // con altura fija o automática y tanto si Android redimensiona la ventana como si no
    behavior={(_e = combinedProps.behavior) !== null && _e !== void 0 ? _e : 'padding'} keyboardVerticalOffset={combinedProps.keyboardVerticalOffset}>
                    <react_native_1.Animated.View onLayout={onContentLayout} style={[
            {
                height: "90%",
                marginTop: "auto",
                backgroundColor: (_g = (_f = theme.colors) === null || _f === void 0 ? void 0 : _f.surface) !== null && _g !== void 0 ? _g : "#fff",
                borderTopRightRadius: 20,
                borderTopLeftRadius: 20,
                overflow: 'hidden',
            },
            contentAnimationStyle(slideAnim, combinedProps.animationType),
            (_h = combinedProps === null || combinedProps === void 0 ? void 0 : combinedProps._contentStyle) === null || _h === void 0 ? void 0 : _h.style,
            ...contentStyle,
        ]}>
                        <Box_1.Box zIndex={100} flexDir={'row'} gap={2} {...combinedProps.header}>
                            {(_j = combinedProps === null || combinedProps === void 0 ? void 0 : combinedProps.header) === null || _j === void 0 ? void 0 : _j.children}
                            {buttonClose === true ? (<Button_1.Button variant="ghost" position="absolute" rounded={50} right={0} m={2} icon={<Icon_1.Icon name="close" as="AntDesign"/>} onPress={handleRequestClose} {...combinedProps._buttonClose}/>) : (react_1.default.isValidElement(buttonClose) && react_1.default.cloneElement(buttonClose, Object.assign({ onPress: handleRequestClose }, combinedProps._buttonClose)))}
                        </Box_1.Box>
                        {typeof combinedProps.children === 'function'
            ? combinedProps.children({ data, close })
            : combinedProps.children}
                    </react_native_1.Animated.View>
                </KeyboardAvoidingView_1.KeyboardAvoidingView>

                <Box_1.Box bg={combinedProps.bg || "white"} safeAreaBottom={(combinedProps === null || combinedProps === void 0 ? void 0 : combinedProps.safeAreaBottom) !== undefined
            ? combinedProps === null || combinedProps === void 0 ? void 0 : combinedProps.safeAreaBottom
            : true}/>
            </Box_1.Box>
        </Portal_1.Portal>);
}
/**
 * El cast correcto:
 * `forwardRef` pierde los tipos, así que lo restauramos manualmente.
 */
exports.Modal = (0, react_1.forwardRef)(InternalModal);
/* ------------------ MODALES DINÁMICOS: openModal({...}) ------------------ */
const createStore = (initial) => {
    let value = initial;
    const listeners = new Set();
    return {
        get: () => value,
        set: (next) => {
            value = next;
            listeners.forEach(listener => listener());
        },
        subscribe: (listener) => {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
    };
};
const DynamicModal = ({ store, control }) => {
    const _a = (0, react_1.useSyncExternalStore)(store.subscribe, store.get), { data } = _a, props = __rest(_a, ["data"]);
    const ref = (0, react_1.useRef)(null);
    const mounted = (0, react_1.useRef)(false);
    (0, react_1.useEffect)(() => {
        var _a;
        // Si se cerró antes de llegar a montarse, se destruye sin abrirlo
        if (control.closed) {
            control.settle(control.pendingResult);
            return control.destroy();
        }
        control.modal = ref.current;
        (_a = ref.current) === null || _a === void 0 ? void 0 : _a.open(data);
        mounted.current = true;
    }, []);
    // update({ data }) con el modal abierto: se le pasa la nueva data
    (0, react_1.useEffect)(() => {
        var _a;
        if (mounted.current && ((_a = ref.current) === null || _a === void 0 ? void 0 : _a.isOpen()))
            ref.current.open(data);
    }, [data]);
    return (<exports.Modal ref={ref} {...props} afterClose={result => {
            var _a;
            (_a = props.afterClose) === null || _a === void 0 ? void 0 : _a.call(props, result);
            control.settle(result);
            control.destroy();
        }}/>);
};
const openDynamicModal = (props) => {
    const store = createStore(props);
    let sibling = null;
    // El resultado se guarda siempre; la promesa solo se crea si alguien lee `result`
    let settled = false;
    let finalResult;
    let resolvePromise = null;
    let promise = null;
    const control = {
        modal: null,
        closed: false,
        pendingResult: undefined,
        settle: result => {
            if (settled)
                return;
            settled = true;
            finalResult = result;
            resolvePromise === null || resolvePromise === void 0 ? void 0 : resolvePromise(result);
        },
        destroy: () => {
            sibling === null || sibling === void 0 ? void 0 : sibling.destroy();
            sibling = null;
        },
    };
    sibling = new react_native_root_siblings_1.default(<DynamicModal store={store} control={control}/>);
    return {
        close: result => {
            var _a;
            control.closed = true;
            control.pendingResult = result;
            (_a = control.modal) === null || _a === void 0 ? void 0 : _a.close(result);
        },
        update: next => store.set(Object.assign(Object.assign({}, store.get()), next)),
        isOpen: () => !control.closed && (control.modal ? control.modal.isOpen() : true),
        get result() {
            if (!promise)
                promise = settled ? Promise.resolve(finalResult) : new Promise(resolve => (resolvePromise = resolve));
            return promise;
        },
    };
};
