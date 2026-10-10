// Modal.tsx
import React, {
    forwardRef,
    useImperativeHandle,
    useRef,
    useState,
    useEffect,
    useCallback,
    useLayoutEffect,
    useSyncExternalStore,
} from "react";
import {
    Animated,
    BackHandler,
    Easing,
    StyleSheet,
    Pressable,
    ViewProps,
    PressableProps,
    Dimensions,
} from "react-native";
import { Portal } from "./Portal";
import { touchHandlers } from "./utils/touches";
import RootSiblings from "react-native-root-siblings";
import { Box, EABoxProps } from "./Box";
import { Icon } from "./Icon";
import { Button, EAButtonProps } from "./Button";
import { EAKeyboardAvoidingProps, KeyboardAvoidingView } from "./KeyboardAvoidingView";
import { EADefaultProps, DEFAULT_PROPS } from "./utils/DEFAULT_PROPS";
import { useThemeProps } from "./utils/useThemeProps";

/* --------------------- TYPES ----------------------- */

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
export type EADynamicModalProps<T = any, R = any> = EAModalProps<T, R> & { data?: T };

/** Control de un modal abierto con openModal({...}) */
export type EAModalHandle<T = any, R = any> = {
    close: (result?: R) => void;
    /** Cambia props del modal abierto (p. ej. su contenido o su data) */
    update: (props: Partial<EADynamicModalProps<T, R>>) => void;
    isOpen: () => boolean;
    /** Se resuelve al terminar de cerrarse con el valor de close(result) (undefined si se cerró sin valor) */
    readonly result: Promise<R | undefined>;
};

/* ------------------ REGISTRO GLOBAL ------------------ */

// Modales montados por id (un id puede estar montado varias veces, p. ej. en pantallas apiladas)
const modalsById = new Map<string, EAModalRef[]>();
// Modales abiertos ahora mismo, en orden de apertura
const openModals = new Set<EAModalRef>();

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
export function openModal<T = any>(id: string, data?: T): boolean;
export function openModal<T = any, R = any>(props: EADynamicModalProps<T, R>): EAModalHandle<T, R>;
export function openModal(arg: string | EADynamicModalProps, data?: any): boolean | EAModalHandle {
    if (typeof arg !== 'string') return openDynamicModal(arg);
    const modal = modalsById.get(arg)?.at(-1);
    modal?.open(data);
    return !!modal;
}

/** Cierra el modal (o modales) con ese id; `result` llega a su afterClose. Devuelve false si no hay ninguno montado. */
export const closeModal = (id: string, result?: any): boolean => {
    const modals = modalsById.get(id) ?? [];
    modals.forEach(modal => modal.close(result));
    return modals.length > 0;
};

/** Indica si algún modal con ese id está abierto. */
export const isModalOpen = (id: string): boolean => (modalsById.get(id) ?? []).some(modal => modal.isOpen());

/** Cierra todos los modales abiertos (incluidos los internos de Select y DatePicker). */
export const closeAllModals = () => {
    Array.from(openModals).reverse().forEach(modal => modal.close());
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** Estilo animado del contenido según animationType (progress va de 0 = cerrado a 1 = abierto) */
const contentAnimationStyle = (progress: Animated.Value, type: EAModalAnimation = 'slideUp') => {
    const { width, height } = Dimensions.get('window');
    const range = (from: number, to: number) => progress.interpolate({ inputRange: [0, 1], outputRange: [from, to] });
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

const MODAL_MERGE_KEYS = ['header'] as const;

function InternalModal(
    props: EAModalProps,
    ref: React.Ref<EAModalRef>
) {
    // defaultOpen: el estado inicial ya es "abierto", con la animación en su valor final
    const [visible, setVisible] = useState(() => !!props.defaultOpen);
    const slideAnim = useRef(new Animated.Value(props.defaultOpen ? 1 : 0)).current;
    // isOpen: estado lógico (open/close); contentReady: el contenido ya está montado y medido;
    // pendingOpen: open() pidió animar pero el contenido aún no existía
    const isOpen = useRef(!!props.defaultOpen);
    // Con defaultOpen, onOpen se notifica cuando el contenido ya está montado
    const notifyInitialOpen = useRef(!!props.defaultOpen);
    const contentReady = useRef(false);
    const pendingOpen = useRef(false);
    const onCloseRef = useRef<EAModalProps['onClose']>(null);
    const afterCloseRef = useRef<EAModalProps['afterClose']>(null);
    const onOpenRef = useRef<EAModalProps['onOpen']>(null);
    const animationRef = useRef<EAModalAnimation>('slideUp');
    const durationRef = useRef(200);
    const dataRef = useRef<any>(undefined);
    // data de la apertura actual y resultado con el que se está cerrando
    const [data, setData] = useState<any>(undefined);
    const resultRef = useRef<any>(undefined);

    useEffect(() => {
        if (!visible) return;

        const sub = BackHandler.addEventListener("hardwareBackPress", () => {
            onCloseRef.current?.();
            close();
            return true;
        });

        return () => sub.remove();
    }, [visible]);

    // Defaults → theme.components.Modal → variante → props → plataforma (header también se fusiona)
    const [combinedProps, theme] = useThemeProps<EAModalProps>('Modal', props, { mergeKeys: MODAL_MERGE_KEYS });

    onCloseRef.current = combinedProps.onClose;
    afterCloseRef.current = combinedProps.afterClose;
    onOpenRef.current = combinedProps.onOpen;
    animationRef.current = combinedProps.animationType ?? 'slideUp';
    durationRef.current = combinedProps.duration ?? 200;
    const buttonClose = combinedProps.buttonClose ?? true;

    const contentStyle = DEFAULT_PROPS(combinedProps?._contentStyle || {}, theme);
    const backdropStyle = DEFAULT_PROPS(combinedProps?._backdrop || {}, theme);

    const animate = (toValue: 0 | 1, callBack?: () => void) => {
        if (animationRef.current === 'none') {
            slideAnim.stopAnimation();
            slideAnim.setValue(toValue);
            callBack?.();
            return;
        }
        Animated.timing(slideAnim, {
            toValue,
            duration: durationRef.current,
            easing: toValue ? Easing.out(Easing.ease) : Easing.in(Easing.ease),
            useNativeDriver: true,
        }).start(({ finished }) => finished && callBack?.());
    };

    // onOpen se dispara al terminar la animación de apertura (no si la interrumpe un close)
    const notifyOpen = () => {
        if (isOpen.current) onOpenRef.current?.(dataRef.current);
    };

    // Referencia estable a este modal para el registro global
    const handle = useRef<EAModalRef>(null);

    const open = useCallback((nextData?: any) => {
        isOpen.current = true;
        resultRef.current = undefined;
        dataRef.current = nextData;
        setData(nextData);
        openModals.add(handle.current);
        setVisible(true);
        // Con useNativeDriver, animar antes de que exista la vista la deja en su valor inicial
        // (modal invisible). Si el contenido ya está montado (se reabre mientras se cerraba) se
        // anima ya; si no, lo hace el primer onLayout del contenido.
        if (contentReady.current) animate(1, notifyOpen);
        else pendingOpen.current = true;
    }, []);

    const close = useCallback((result?: any) => {
        if (!isOpen.current) return;
        isOpen.current = false;
        notifyInitialOpen.current = false;
        resultRef.current = result;
        openModals.delete(handle.current);
        pendingOpen.current = false;
        // Se desmonta al terminar la animación; si open() la interrumpe, finished es false y no se oculta
        animate(0, () => {
            if (isOpen.current) return;
            const result = resultRef.current;
            resultRef.current = undefined;
            setVisible(false);
            // La data se suelta al terminar de cerrarse para no retenerla entre aperturas
            setData(undefined);
            dataRef.current = undefined;
            afterCloseRef.current?.(result);
        });
    }, []);

    // El contenido deja de estar listo solo cuando se desmonta de verdad (layout effect: sin huecos
    // entre el commit y un open() posterior)
    useLayoutEffect(() => {
        if (!visible) contentReady.current = false;
    }, [visible]);

    // Plan B: si el contenido no avisa de su layout (a veces no llega en la primera apertura), se anima igualmente a
    // los dos fotogramas (la vista ya existe). Sin esto el modal quedaba abierto e invisible, tapando los toques
    useEffect(() => {
        if (!visible || !pendingOpen.current) return;
        let f2 = 0;
        const f1 = requestAnimationFrame(() => {
            f2 = requestAnimationFrame(() => {
                if (!pendingOpen.current) return;
                pendingOpen.current = false;
                contentReady.current = true;
                animate(1, notifyOpen);
            });
        });
        return () => { cancelAnimationFrame(f1); cancelAnimationFrame(f2); };
    }, [visible]);

    const onContentLayout = () => {
        if (contentReady.current) return;
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

    if (!handle.current) handle.current = { open, close, isOpen: () => isOpen.current };

    useImperativeHandle(ref, () => handle.current, []);

    // Registro por id; al desmontar se quita del registro y de la lista de abiertos
    useEffect(() => {
        const id = combinedProps.id;
        if (id) modalsById.set(id, [...(modalsById.get(id) ?? []), handle.current]);
        return () => {
            if (!id) return;
            const rest = (modalsById.get(id) ?? []).filter(modal => modal !== handle.current);
            rest.length ? modalsById.set(id, rest) : modalsById.delete(id);
        };
    }, [combinedProps.id]);

    useEffect(() => () => {
        openModals.delete(handle.current);
    }, []);

    // Un modal que monta abierto cuenta como abierto para closeAllModals
    useEffect(() => {
        if (isOpen.current) openModals.add(handle.current);
    }, []);

    const handleRequestClose = () => {
        combinedProps.onClose?.();
        close();
    };

    if (!visible) return null;

    return (
        <Portal>
            {/* touchHandlers: dentro del modal también se cierra, p. ej., el teclado de un editor al tocar fuera */}
            <Box style={StyleSheet.absoluteFill} flex={1} {...touchHandlers}>
                <AnimatedPressable
                    style={[
                        { backgroundColor: "#0003" },
                        StyleSheet.absoluteFill,
                        combinedProps?._backdrop?.style,
                        ...backdropStyle,
                        {
                            opacity: slideAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, 1],
                            }),
                        },
                    ]}
                    onPress={!combinedProps?.static ? handleRequestClose : null}
                />

                <Box
                    bg={combinedProps.bg || "white"}
                    safeAreaTop={combinedProps?.safeAreaTop}
                />

                {/* box-none: los toques fuera del contenido llegan al backdrop */}
                <KeyboardAvoidingView
                    flex={1}
                    pointerEvents="box-none"
                    // padding en ambas plataformas: mide el solape real con el teclado, así funciona
                    // con altura fija o automática y tanto si Android redimensiona la ventana como si no
                    behavior={combinedProps.behavior ?? 'padding'}
                    keyboardVerticalOffset={combinedProps.keyboardVerticalOffset}
                >
                    <Animated.View
                        onLayout={onContentLayout}
                        style={[
                            {
                                height: "90%",
                                marginTop: "auto",
                                backgroundColor: theme.colors?.surface ?? "#fff",
                                borderTopRightRadius: 20,
                                borderTopLeftRadius: 20,
                                overflow: 'hidden',
                            },
                            contentAnimationStyle(slideAnim, combinedProps.animationType),
                            combinedProps?._contentStyle?.style,
                            ...contentStyle,
                        ]}
                    >
                        <Box zIndex={100} flexDir={'row'} gap={2} {...combinedProps.header}>
                            {combinedProps?.header?.children}
                            {buttonClose === true ? (
                                <Button
                                    variant="ghost"
                                    position="absolute"
                                    rounded={50}
                                    right={0}
                                    m={2}
                                    icon={
                                        <Icon
                                            name="close"
                                            as="AntDesign"
                                        />
                                    }
                                    onPress={handleRequestClose}
                                    {...combinedProps._buttonClose}
                                />
                            ) : (
                                React.isValidElement(buttonClose) && React.cloneElement(buttonClose as React.ReactElement<any>, {
                                    onPress: handleRequestClose,
                                    ...combinedProps._buttonClose,
                                })
                            )}
                        </Box>
                        {typeof combinedProps.children === 'function'
                            ? combinedProps.children({ data, close })
                            : combinedProps.children}
                    </Animated.View>
                </KeyboardAvoidingView>

                <Box
                    bg={combinedProps.bg || "white"}
                    safeAreaBottom={
                        combinedProps?.safeAreaBottom !== undefined
                            ? combinedProps?.safeAreaBottom
                            : true
                    }
                />
            </Box>
        </Portal>
    );
}

/* --------------------- FIX PARA AUTOCOMPLETADO ----------------------- */

export type ModalComponent = <T = any, R = any>(
    props: EAModalProps<T, R> & { ref?: React.Ref<EAModalRef<T, R>> }
) => React.ReactElement | null;

/**  
 * El cast correcto:  
 * `forwardRef` pierde los tipos, así que lo restauramos manualmente.
 */
export const Modal = forwardRef(InternalModal) as unknown as ModalComponent;

/* ------------------ MODALES DINÁMICOS: openModal({...}) ------------------ */

const createStore = <T,>(initial: T) => {
    let value = initial;
    const listeners = new Set<() => void>();
    return {
        get: () => value,
        set: (next: T) => {
            value = next;
            listeners.forEach(listener => listener());
        },
        subscribe: (listener: () => void) => {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
    };
};

type DynamicControl = {
    modal: EAModalRef | null;
    closed: boolean;
    pendingResult: any;
    settle: (result: any) => void;
    destroy: () => void;
};

const DynamicModal = ({ store, control }: { store: ReturnType<typeof createStore<EADynamicModalProps>>; control: DynamicControl }) => {
    const { data, ...props } = useSyncExternalStore(store.subscribe, store.get);
    const ref = useRef<EAModalRef>(null);
    const mounted = useRef(false);

    useEffect(() => {
        // Si se cerró antes de llegar a montarse, se destruye sin abrirlo
        if (control.closed) {
            control.settle(control.pendingResult);
            return control.destroy();
        }
        control.modal = ref.current;
        ref.current?.open(data);
        mounted.current = true;
    }, []);

    // update({ data }) con el modal abierto: se le pasa la nueva data
    useEffect(() => {
        if (mounted.current && ref.current?.isOpen()) ref.current.open(data);
    }, [data]);

    return (
        <Modal
            ref={ref}
            {...props}
            afterClose={result => {
                props.afterClose?.(result);
                control.settle(result);
                control.destroy();
            }}
        />
    );
};

const openDynamicModal = (props: EADynamicModalProps): EAModalHandle => {
    const store = createStore<EADynamicModalProps>(props);
    let sibling: RootSiblings | null = null;

    // El resultado se guarda siempre; la promesa solo se crea si alguien lee `result`
    let settled = false;
    let finalResult: any;
    let resolvePromise: ((value: any) => void) | null = null;
    let promise: Promise<any> | null = null;

    const control: DynamicControl = {
        modal: null,
        closed: false,
        pendingResult: undefined,
        settle: result => {
            if (settled) return;
            settled = true;
            finalResult = result;
            resolvePromise?.(result);
        },
        destroy: () => {
            sibling?.destroy();
            sibling = null;
        },
    };
    sibling = new RootSiblings(<DynamicModal store={store} control={control} />);

    return {
        close: result => {
            control.closed = true;
            control.pendingResult = result;
            control.modal?.close(result);
        },
        update: next => store.set({ ...store.get(), ...next }),
        isOpen: () => !control.closed && (control.modal ? control.modal.isOpen() : true),
        get result() {
            if (!promise) promise = settled ? Promise.resolve(finalResult) : new Promise(resolve => (resolvePromise = resolve));
            return promise;
        },
    };
};
