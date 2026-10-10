import React, { useEffect, useRef, useSyncExternalStore } from "react";
import { ActivityIndicator, ActivityIndicatorProps, Animated, BackHandler, Keyboard, Pressable, StyleSheet } from "react-native";
import RootSiblings from "react-native-root-siblings";
import { Box, EABoxProps } from "./Box";
import { EATextProps, Text } from "./Text";
import { EADefaultProps } from "./utils/DEFAULT_PROPS";
import { ThemeColor } from "./theme";
import { useThemeProps } from "./utils/useThemeProps";

export type EASpinnerProps = ActivityIndicatorProps & EADefaultProps & {
    color?: ThemeColor;
    _ios?: EASpinnerProps;
    _android?: EASpinnerProps;
    _web?: EASpinnerProps;
    variant?: (string & {});
};

export const Spinner: React.FC<EASpinnerProps> = (props) => {
    // Defaults → theme.components.Spinner → variante → props → plataforma
    const [combinedProps, theme] = useThemeProps<EASpinnerProps>('Spinner', props, { defaults: { color: 'primary.100' } });

    return (
        <ActivityIndicator
            {...combinedProps}
            color={theme.colors[combinedProps.color] || combinedProps.color}
        />
    );
};

/* ================= Spinner a pantalla completa (desde cualquier parte) ================= */

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

type Entry = { id: number; opts: SpinnerOverlayOptions; shown: boolean; timers: ReturnType<typeof setTimeout>[] };
type State = { visible: boolean; opts: SpinnerOverlayOptions };

// Cada showSpinner es una entrada: se ve mientras quede alguna (se pueden solapar cargas sin que la primera
// en terminar esconda las demás). Se pinta en su propia capa encima de todo (incluidos los modales abiertos)
const entries = new Map<number, Entry>();
let nextId = 0;
let state: State = { visible: false, opts: {} };
const listeners = new Set<() => void>();
const setState = (s: State) => { state = s; listeners.forEach(l => l()) };
let sibling: RootSiblings | null = null;
let shownAt = 0;
let hideTimer: ReturnType<typeof setTimeout> | null = null;

const sync = () => {
    const active = [...entries.values()].filter(e => e.shown);
    if (active.length) {
        if (hideTimer) { clearTimeout(hideTimer); hideTimer = null }
        if (!state.visible) shownAt = Date.now();
        // Una capa nueva cada vez que aparece: así queda por encima de lo abierto después
        if (!sibling) sibling = new RootSiblings(<SpinnerHost />);
        setState({ visible: true, opts: active[active.length - 1].opts });
        return;
    }
    if (!state.visible || hideTimer) return;
    // Lo que falte para el tiempo mínimo
    const wait = Math.max(0, (state.opts.minDuration ?? 300) - (Date.now() - shownAt));
    hideTimer = setTimeout(() => { hideTimer = null; if (![...entries.values()].some(e => e.shown)) setState({ ...state, visible: false }) }, wait);
};

const remove = (id: number) => {
    const e = entries.get(id);
    if (!e) return;
    e.timers.forEach(clearTimeout);
    entries.delete(id);
    sync();
};

/**
 * Muestra un spinner que tapa toda la pantalla (y bloquea los toques) desde cualquier parte, sin montar nada.
 * Devuelve un control para esconderlo; hideSpinner() los esconde todos
 * @example const s = showSpinner('Guardando…'); await guardar(); s.hide();
 * @example showSpinner({ message: 'Conectando…', duration: 3000 })
 */
export const showSpinner = (options?: string | SpinnerOverlayOptions): SpinnerHandle => {
    const opts: SpinnerOverlayOptions = typeof options === 'string' ? { message: options } : { ...options };
    const id = ++nextId;
    const entry: Entry = { id, opts, shown: false, timers: [] };
    entries.set(id, entry);
    const reveal = () => {
        if (!entries.has(id)) return;
        entry.shown = true;
        if (opts.dismissKeyboard !== false) Keyboard.dismiss();
        sync();
    };
    if (opts.delay) entry.timers.push(setTimeout(reveal, opts.delay)); else reveal();
    if (opts.duration) entry.timers.push(setTimeout(() => remove(id), (opts.delay ?? 0) + opts.duration));
    return {
        hide: () => remove(id),
        update: patch => { if (!entries.has(id)) return; entry.opts = { ...entry.opts, ...patch }; if (entry.shown) sync() },
    };
};

/** Esconde todos los spinners de pantalla completa */
export const hideSpinner = () => { [...entries.keys()].forEach(id => entries.get(id)?.timers.forEach(clearTimeout)); entries.clear(); sync() };

/** ¿Se está viendo? */
export const isSpinnerVisible = () => state.visible;

/**
 * Muestra el spinner mientras dura la promesa (o la función async) y lo esconde al terminar, salga bien o mal
 * @example const datos = await withSpinner(api.get('/pedidos'), 'Cargando pedidos…');
 */
export const withSpinner = async <T,>(task: Promise<T> | (() => Promise<T>), options?: string | SpinnerOverlayOptions): Promise<T> => {
    const s = showSpinner(options);
    try { return await (typeof task === 'function' ? task() : task) } finally { s.hide() }
};

/** La capa: aparece y desaparece con un fundido; al terminar de desaparecer se quita */
const SpinnerHost = () => {
    const current = useSyncExternalStore(cb => { listeners.add(cb); return () => { listeners.delete(cb) } }, () => state);
    const opacity = useRef(new Animated.Value(0)).current;
    const [props] = useThemeProps<SpinnerOverlayOptions & EABoxProps>('SpinnerOverlay', current.opts as any, {
        variants: {
            card: { _content: { bg: 'surface', rounded: 4, p: 5, minW: 120, shadow: 3 } as EABoxProps, color: 'primary.100' },
            plain: { _content: {}, color: 'white', _text: { color: 'white', fontWeight: '600' }, backdropColor: 'rgba(0,0,0,0.65)' },
        },
        defaults: { variant: 'card', size: 'large' },
    });
    const { message, progress, cancelable, onCancel, backdropColor = 'rgba(0,0,0,0.45)', size, color, _content, _text } = props;

    useEffect(() => {
        Animated.timing(opacity, { toValue: current.visible ? 1 : 0, duration: 180, useNativeDriver: true }).start(({ finished }) => {
            if (finished && !current.visible && !state.visible) { sibling?.destroy(); sibling = null }
        });
    }, [current.visible]);

    const cancel = () => { if (!cancelable) return; hideSpinner(); onCancel?.() };
    // Atrás de Android: bloqueado mientras se ve (o cancela, si se puede)
    useEffect(() => {
        if (!current.visible) return;
        const sub = BackHandler.addEventListener('hardwareBackPress', () => { cancel(); return true });
        return () => sub.remove();
    }, [current.visible, cancelable, onCancel]);

    const pct = progress != null ? Math.round(Math.max(0, Math.min(1, progress)) * 100) : null;
    return (
        <Animated.View style={[StyleSheet.absoluteFill, { opacity, zIndex: 100000, elevation: 100000 }]} pointerEvents={current.visible ? 'auto' : 'none'}>
            <Pressable style={[StyleSheet.absoluteFill, { backgroundColor: backdropColor, alignItems: 'center', justifyContent: 'center' }]} onPress={cancel}
                accessibilityViewIsModal accessibilityRole="progressbar" accessibilityLabel={message ?? 'loading'} accessibilityValue={pct != null ? { min: 0, max: 100, now: pct } : undefined}>
                <Box alignItems="center" justifyContent="center" gap={3} {..._content}>
                    <Spinner size={size} color={color as any} />
                    {pct != null && <Text fontWeight="600" {..._text}>{`${pct} %`}</Text>}
                    {!!message && <Text textAlign="center" maxW={260} {..._text}>{message}</Text>}
                </Box>
            </Pressable>
        </Animated.View>
    );
};

export type SpinnerOverlayProps = SpinnerOverlayOptions & { visible: boolean };

/**
 * El mismo spinner de pantalla completa, controlado por una prop (se ve mientras visible sea true)
 * @example <SpinnerOverlay visible={guardando} message="Guardando…" />
 */
export const SpinnerOverlay = ({ visible, ...options }: SpinnerOverlayProps) => {
    const handle = useRef<SpinnerHandle | null>(null);
    useEffect(() => {
        if (visible && !handle.current) handle.current = showSpinner(options);
        else if (!visible && handle.current) { handle.current.hide(); handle.current = null }
    }, [visible]);
    useEffect(() => { handle.current?.update(options) }, [options.message, options.progress, options.cancelable, options.onCancel]);
    useEffect(() => () => { handle.current?.hide(); handle.current = null }, []);
    return null;
};
