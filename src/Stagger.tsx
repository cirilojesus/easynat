// Stagger: anima la entrada (y la salida) de sus hijos uno detrás de otro. Presets (fadeUp, scale, flip...) o from / to
// propios, salida distinta de la entrada (exit), orden (en orden, al revés, desde el centro), visible controlado, ref
// (show / hide / toggle / replay) y avisos al terminar
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import Animated, {
    Easing,
    interpolate,
    interpolateColor,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withTiming,
} from 'react-native-reanimated';
import { Box, EABoxProps } from './Box';
import { useThemeProps } from './utils/useThemeProps';

/* -------------------- Tipos -------------------- */

export type StaggerAnimatedStyles = {
    opacity?: number;
    translateX?: number;
    translateY?: number;
    scale?: number;
    rotate?: string | number;
    rotateX?: string | number;
    rotateY?: string | number;
    rotateZ?: string | number;
    skewX?: string | number;
    skewY?: string | number;
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
    borderRadius?: number;
    width?: number;
    height?: number;
    /** Color del texto de los hijos (solo si se anima) */
    color?: string;
    /** Espaciado del texto de los hijos (solo si se anima) */
    letterSpacing?: number;
};

export type StaggerAnimValues = StaggerAnimatedStyles & {
    /** Retraso de esta fase (entrar con `to`, salir con `from` / `exit`) */
    delay?: number;
    duration?: number;
    easing?: StaggerEasing;
};

/** Curva de la animación: un Easing de Reanimated (Easing.out(Easing.cubic), Easing.bezier(…)…). Propio para no depender
 *  de los tipos de una versión concreta de Reanimated */
export type StaggerEasing = ((value: number) => number) | { factory: () => (value: number) => number };

export type StaggerPreset = 'fade' | 'fadeUp' | 'fadeDown' | 'fadeLeft' | 'fadeRight' | 'scale' | 'zoom' | 'flip' | 'none';
export type StaggerOrder = 'forward' | 'reverse' | 'center';

export type StaggerRef = {
    show: () => void;
    hide: () => void;
    toggle: () => void;
    /** Vuelve a empezar la entrada desde el principio */
    replay: () => void;
    isVisible: () => boolean;
};

export type StaggerProps = EABoxProps & {
    children: React.ReactNode;
    /** Animación ya hecha. Por defecto 'fadeUp' (sube un poco apareciendo); from / to la ajustan */
    preset?: StaggerPreset;
    /** Cómo están ocultos (y adónde vuelven al ocultarse, si no hay exit) */
    from?: StaggerAnimValues;
    /** Cómo están visibles */
    to?: StaggerAnimValues;
    /** Adónde van al ocultarse (p. ej. salir por el otro lado). Por defecto, a `from` */
    exit?: StaggerAnimValues;
    /** Visible (controlado): al cambiar, entran o salen */
    visible?: boolean;
    /** Al montarse, animar la entrada. Por defecto true (false: aparecen ya visibles, sin animar) */
    animateOnInit?: boolean;
    /** Tiempo entre uno y el siguiente (ms). Por defecto 80 */
    staggerDelay?: number;
    /** Orden de entrada. Al salir, el contrario. Por defecto 'forward' */
    order?: StaggerOrder;
    delay?: number;
    duration?: number;
    easing?: StaggerEasing;
    /** Cuando el último termina de entrar */
    onShowEnd?: () => void;
    /** Cuando el último termina de salir */
    onHideEnd?: () => void;
    variant?: (string & {});
};

/* -------------------- Constantes -------------------- */

const DEFAULT_DURATION = 400;
const DEFAULT_EASING = Easing.bezier(0.4, 0, 0.2, 1);
const VISIBLE: StaggerAnimValues = { opacity: 1, translateX: 0, translateY: 0, scale: 1 };
/** Las animaciones de `preset`: cómo están ocultos (from) y visibles (to). from / to de las props se aplican encima */
export const STAGGER_PRESETS: Record<StaggerPreset, { from: StaggerAnimValues; to: StaggerAnimValues }> = {
    none: { from: {}, to: {} },
    fade: { from: { opacity: 0 }, to: { opacity: 1 } },
    fadeUp: { from: { opacity: 0, translateY: 20, scale: 0.95 }, to: VISIBLE },
    fadeDown: { from: { opacity: 0, translateY: -20 }, to: VISIBLE },
    fadeLeft: { from: { opacity: 0, translateX: 30 }, to: VISIBLE },
    fadeRight: { from: { opacity: 0, translateX: -30 }, to: VISIBLE },
    scale: { from: { opacity: 0, scale: 0.6 }, to: VISIBLE },
    zoom: { from: { opacity: 0, scale: 1.3 }, to: VISIBLE },
    flip: { from: { opacity: 0, rotateX: 90 }, to: { opacity: 1, rotateX: 0 } },
};
const ROTATIONS = ['rotate', 'rotateX', 'rotateY', 'rotateZ', 'skewX', 'skewY'] as const;
const deg = (v: string | number | undefined) => { 'worklet'; return parseFloat(String(v ?? 0)) || 0; };

/* -------------------- Un hijo -------------------- */

type ItemProps = {
    from: StaggerAnimValues;
    to: StaggerAnimValues;
    exit?: StaggerAnimValues;
    showDelay: number;
    hideDelay: number;
    duration?: number;
    easing?: StaggerEasing;
    initial: 0 | 1;
    register: (api: { animate: (v: 0 | 1, run: number) => void; reset: () => void }) => void;
    onDone: (run: number) => void;
    animateText: boolean;
    /** Añadido después de montarse el Stagger (y visible): entra animado él solo */
    enterOnMount: boolean;
    children: React.ReactElement<any>;
};

const StaggerItem = ({ from, to, exit, showDelay, hideDelay, duration, easing, initial, register, onDone, animateText, enterOnMount, children }: ItemProps) => {
    // 0 = oculto (from), 1 = visible (to), 2 = salido (exit)
    const progress = useSharedValue<number>(enterOnMount ? 0 : initial);
    const [interactive, setInteractive] = useState(enterOnMount || initial === 1);
    useEffect(() => {
        if (enterOnMount) progress.value = withTiming(1, { duration: to.duration ?? duration ?? DEFAULT_DURATION, easing: (to.easing ?? easing ?? DEFAULT_EASING) as any });
    }, []);

    register({
        animate: (v, run) => {
            const p = v === 1 ? to : exit ?? from;
            const target = v === 1 ? 1 : exit ? 2 : 0;
            // Si va a entrar desde la salida, primero vuelve a "oculto" (si no, entraría por donde salió)
            if (v === 1 && progress.value > 1) progress.value = 0;
            setInteractive(v === 1);
            progress.value = withDelay((p.delay ?? 0) + (v === 1 ? showDelay : hideDelay),
                withTiming(target, { duration: p.duration ?? duration ?? DEFAULT_DURATION, easing: (p.easing ?? easing ?? DEFAULT_EASING) as any },
                    finished => { if (finished) runOnJS(onDone)(run) }));
        },
        reset: () => { progress.value = 0; setInteractive(false) },
    });

    const style = useAnimatedStyle(() => {
        const e = exit ?? from;
        const range = [0, 1, 2];
        const num = (k: 'opacity' | 'translateX' | 'translateY' | 'scale' | 'borderWidth' | 'borderRadius' | 'width' | 'height', base: number) => {
            const f = from[k] ?? to[k] ?? base, t = to[k] ?? from[k] ?? base, x = e[k] ?? f;
            return interpolate(progress.value, range, [f, t, x]);
        };
        const out: Record<string, any> = {
            opacity: num('opacity', 1),
            transform: [{ translateX: num('translateX', 0) }, { translateY: num('translateY', 0) }, { scale: num('scale', 1) }] as any[],
        };
        for (const k of ROTATIONS) {
            if (from[k] == null && to[k] == null && e[k] == null) continue;
            const f = deg(from[k] ?? to[k]), t = deg(to[k] ?? from[k]), x = e[k] != null ? deg(e[k]) : f;
            out.transform.push({ [k]: `${interpolate(progress.value, range, [f, t, x])}deg` });
        }
        // Solo lo que se anima (si no, se pisarían los estilos del hijo)
        if (from.backgroundColor || to.backgroundColor || e.backgroundColor) {
            const f = from.backgroundColor ?? to.backgroundColor ?? 'transparent', t = to.backgroundColor ?? f;
            out.backgroundColor = interpolateColor(progress.value, range, [f, t, e.backgroundColor ?? f]);
        }
        if (from.borderColor || to.borderColor || e.borderColor) {
            const f = from.borderColor ?? to.borderColor ?? 'transparent', t = to.borderColor ?? f;
            out.borderColor = interpolateColor(progress.value, range, [f, t, e.borderColor ?? f]);
        }
        if (from.borderWidth != null || to.borderWidth != null) out.borderWidth = num('borderWidth', 0);
        if (from.borderRadius != null || to.borderRadius != null) out.borderRadius = num('borderRadius', 0);
        if (from.width != null || to.width != null) out.width = num('width', 0);
        if (from.height != null || to.height != null) out.height = num('height', 0);
        return out;
    });

    const textStyle = useAnimatedStyle(() => {
        const e = exit ?? from, out: Record<string, any> = {};
        if (from.color || to.color) {
            const f = from.color ?? to.color ?? '#000', t = to.color ?? f;
            out.color = interpolateColor(progress.value, [0, 1, 2], [f, t, e.color ?? f]);
        }
        if (from.letterSpacing != null || to.letterSpacing != null) {
            const f = from.letterSpacing ?? to.letterSpacing ?? 0, t = to.letterSpacing ?? f;
            out.letterSpacing = interpolate(progress.value, [0, 1, 2], [f, t, e.letterSpacing ?? f]);
        }
        return out;
    });

    // El color / espaciado del texto se anima envolviendo los textos sueltos del hijo
    const child = animateText
        ? React.cloneElement(children, {
            children: React.Children.map(children.props.children, (x: any) => (typeof x === 'string' || typeof x === 'number' ? <Animated.Text style={textStyle}>{x}</Animated.Text> : x)),
        } as any)
        : children;

    return <Animated.View style={style} pointerEvents={interactive ? 'auto' : 'none'}>{child}</Animated.View>;
};

/* -------------------- Componente -------------------- */

function InternalStagger(rawProps: StaggerProps, ref: React.Ref<StaggerRef>) {
    // Defaults → theme.components.Stagger → variante → props → plataforma (el variant no pasa al Box)
    const [{
        children, preset = 'fadeUp', from: fromProp, to: toProp, exit, visible, animateOnInit = true, staggerDelay = 80, order = 'forward',
        delay = 0, duration, easing, onShowEnd, onHideEnd, variant: _variant, ...props
    }] = useThemeProps<StaggerProps>('Stagger', rawProps);
    const base = STAGGER_PRESETS[preset] ?? STAGGER_PRESETS.fadeUp;
    const from = { ...base.from, ...fromProp };
    const to = { ...base.to, ...toProp };
    const items = React.Children.toArray(children).filter(React.isValidElement) as React.ReactElement<any>[];
    const n = items.length;
    const animateText = !!(from.color || to.color || from.letterSpacing != null || to.letterSpacing != null);

    const apis = useRef<{ animate: (v: 0 | 1, run: number) => void; reset: () => void }[]>([]);
    const shown = useRef(visible ?? true);
    const run = useRef({ id: 0, target: 1 as 0 | 1, done: 0 });
    const latest = useRef({ onShowEnd, onHideEnd, n });
    latest.current = { onShowEnd, onHideEnd, n };
    // Cómo empieza cada hijo al montarse el Stagger; los que se añaden después (estando visible) entran animados
    const initial = useRef<0 | 1>(animateOnInit || visible === false ? 0 : 1);
    const mounted = useRef(false);

    // Posición en la cola: en orden, al revés o desde el centro hacia fuera
    const rank = (i: number) => (order === 'reverse' ? n - 1 - i : order === 'center' ? Math.round(Math.abs(i - (n - 1) / 2)) : i);
    const maxRank = n ? Math.max(...items.map((_, i) => rank(i))) : 0;

    const animate = (v: 0 | 1) => {
        shown.current = v === 1;
        run.current = { id: run.current.id + 1, target: v, done: 0 };
        apis.current.slice(0, n).forEach(a => a?.animate(v, run.current.id));
    };
    const onDone = (id: number) => {
        if (id !== run.current.id) return;
        // Cuando terminan todos (el último de la cola) se avisa
        if (++run.current.done === latest.current.n) (run.current.target === 1 ? latest.current.onShowEnd : latest.current.onHideEnd)?.();
    };

    useImperativeHandle(ref, () => ({
        show: () => animate(1),
        hide: () => animate(0),
        toggle: () => animate(shown.current ? 0 : 1),
        replay: () => { apis.current.slice(0, n).forEach(a => a?.reset()); animate(1) },
        isVisible: () => shown.current,
    }));

    // Al montarse: entrada animada (si se pidió y debe verse)
    useEffect(() => {
        mounted.current = true;
        if (animateOnInit && (visible ?? true)) animate(1);
    }, []);
    // Controlado
    const first = useRef(true);
    useEffect(() => {
        if (first.current) { first.current = false; return }
        if (visible != null && visible !== shown.current) animate(visible ? 1 : 0);
    }, [visible]);

    return (
        <Box {...props}>
            {items.map((child, i) => (
                <StaggerItem
                    key={child.key ?? i}
                    from={from}
                    to={to}
                    exit={exit}
                    showDelay={delay + rank(i) * staggerDelay}
                    hideDelay={delay + (maxRank - rank(i)) * staggerDelay}
                    duration={duration}
                    easing={easing}
                    initial={!shown.current ? 0 : initial.current}
                    enterOnMount={mounted.current && shown.current}
                    register={api => { apis.current[i] = api }}
                    onDone={onDone}
                    animateText={animateText}
                >
                    {child}
                </StaggerItem>
            ))}
        </Box>
    );
}

export type StaggerComponent = (props: StaggerProps & { ref?: React.Ref<StaggerRef> }) => React.ReactElement | null;

export const Stagger = forwardRef(InternalStagger) as unknown as StaggerComponent;
