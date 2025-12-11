import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
} from 'react';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    Easing,
    interpolateColor,
    interpolate,
    withDelay,
    EasingFunctionFactory,
} from 'react-native-reanimated';
import { Box, BSBoxProps } from './Box';

/* -------------------- TYPES -------------------- */

type AnimatedStyles = {
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
    color?: string;
    borderColor?: string;
    borderWidth?: number;
    borderRadius?: number;
    letterSpacing?: number;
    width?: number;
    height?: number;
};

type AnimValues = AnimatedStyles & {
    delay?: number;
    duration?: number;
    easing?: EasingFunctionFactory;
    delayAnimation?: Partial<Record<keyof AnimatedStyles, number>>;
    durationAnimation?: Partial<Record<keyof AnimatedStyles, number>>;
};

export type StaggerRef = {
    show: () => void;
    hide: () => void;
};

export type StaggerProps = BSBoxProps & {
    children: React.ReactElement[] | React.ReactElement;
    from: AnimValues;
    to: AnimValues;
    animateOnInit?: boolean;
    staggerDelay?: number;
    delay?: number;
    duration?: number;
    easing?: EasingFunctionFactory;
};

type ItemProps = {
    from: AnimValues;
    to: AnimValues;
    index: number;
    staggerDelay: number;
    animateOnInit?: boolean;
    durationGlobal?: number;
    easingGlobal?: EasingFunctionFactory;
    delayGlobal?: number;
    registerShow: (fn: () => void) => void;
    registerHide: (fn: () => void) => void;
    children: React.ReactElement;
};

/* -------------------- CONSTANTS -------------------- */

const DEFAULT_DURATION = 400;
const DEFAULT_DELAY = 0;
const DEFAULT_EASING = Easing.bezier(0.4, 0, 0.2, 1);

/* -------------------- ITEM COMPONENT -------------------- */

const StaggerItem = ({
    from,
    to,
    index,
    staggerDelay,
    animateOnInit,
    durationGlobal,
    delayGlobal,
    easingGlobal,
    registerShow,
    registerHide,
    children,
}: ItemProps) => {
    const progress = useSharedValue(0);

    const animateTo = (v: number) => {
        const isForward = v === 1;

        const duration =
            (isForward ? to.duration : from.duration) ||
            durationGlobal ||
            DEFAULT_DURATION;

        const delayBase =
            (isForward ? to.delay : from.delay) ||
            delayGlobal ||
            DEFAULT_DELAY;

        const easing =
            (isForward ? to.easing : from.easing) ||
            easingGlobal ||
            DEFAULT_EASING;

        const delay = delayBase + index * staggerDelay;

        progress.value = withDelay(delay, withTiming(v, { duration, easing }));
    };

    useEffect(() => {
        registerShow(() => animateTo(1));
        registerHide(() => animateTo(0));
        if (animateOnInit) animateTo(1);
    }, [from, to]);

    const style = useAnimatedStyle(() => {
        const transforms: any[] = [];

        const tx = interpolate(progress.value, [0, 1], [from.translateX ?? 0, to.translateX ?? from.translateX ?? 0]);
        const ty = interpolate(progress.value, [0, 1], [from.translateY ?? 0, to.translateY ?? from.translateY ?? 0]);
        const sc = interpolate(progress.value, [0, 1], [from.scale ?? 1, to.scale ?? from.scale ?? 1]);
        transforms.push({ translateX: tx }, { translateY: ty }, { scale: sc });

        // Rotations & skew
        const rotateProps = ['rotate', 'rotateX', 'rotateY', 'rotateZ', 'skewX', 'skewY'] as const;
        for (const prop of rotateProps) {
            const f = from[prop];
            const t = to[prop];
            if (f != null || t != null) {
                const fr = parseFloat(String(f ?? '0'));
                const tr = parseFloat(String(t ?? f ?? '0'));
                const val = fr + (tr - fr) * progress.value;
                transforms.push({ [prop]: `${val}deg` });
            }
        }

        const opacity =
            (from.opacity ?? 1) +
            (to.opacity ?? 1 - (from.opacity ?? 1)) * progress.value;

        const backgroundColor =
            from.backgroundColor || to.backgroundColor
                ? interpolateColor(
                    progress.value,
                    [0, 1],
                    [from.backgroundColor ?? 'transparent', to.backgroundColor ?? 'transparent']
                )
                : undefined;

        const borderColor =
            from.borderColor || to.borderColor
                ? interpolateColor(
                    progress.value,
                    [0, 1],
                    [from.borderColor ?? 'transparent', to.borderColor ?? 'transparent']
                )
                : undefined;

        const borderWidth = interpolate(
            progress.value,
            [0, 1],
            [from.borderWidth ?? 0, to.borderWidth ?? from.borderWidth ?? 0]
        );

        const borderRadius = interpolate(
            progress.value,
            [0, 1],
            [from.borderRadius ?? 0, to.borderRadius ?? from.borderRadius ?? 0]
        );

        const width = interpolate(progress.value, [0, 1], [from.width ?? 0, to.width ?? from.width ?? 0]);
        const height = interpolate(progress.value, [0, 1], [from.height ?? 0, to.height ?? from.height ?? 0]);

        return {
            opacity,
            transform: transforms,
            backgroundColor,
            borderColor,
            borderWidth,
            borderRadius,
            width: width || undefined,
            height: height || undefined,
        };
    });

    const textStyle = useAnimatedStyle(() => {
        const color =
            from.color || to.color
                ? interpolateColor(
                    progress.value,
                    [0, 1],
                    [from.color ?? '#000', to.color ?? from.color ?? '#000']
                )
                : undefined;

        const letterSpacing = interpolate(
            progress.value,
            [0, 1],
            [from.letterSpacing ?? 0, to.letterSpacing ?? from.letterSpacing ?? 0]
        );

        return { color, letterSpacing };
    });

    const childsChildren = React.Children.map(children.props.children, (x) => {
        if (typeof x === 'string') {
            return <Animated.Text style={textStyle}>{x}</Animated.Text>;
        }
        return x;
    });

    return (
        <Animated.View style={style}>
            {React.cloneElement(children, { children: childsChildren } as any)}
        </Animated.View>
    );
};

/* -------------------- INTERNAL STAGGER (REAL COMPONENT) -------------------- */

function InternalStagger(
    {
        children,
        from = { opacity: 0, translateY: 20, scale: 0.95 },
        to = { opacity: 1, translateY: 0, scale: 1 },
        animateOnInit,
        staggerDelay = 80,
        delay,
        duration,
        easing,
        ...props
    }: StaggerProps,
    ref: React.Ref<StaggerRef>
) {
    const showRefs = useRef<(() => void)[]>([]);
    const hideRefs = useRef<(() => void)[]>([]);

    useImperativeHandle(ref, () => ({
        show: () => showRefs.current.forEach((fn) => fn?.()),
        hide: () => hideRefs.current.slice().reverse().forEach((fn) => fn?.()),
    }));

    return (
        <Box {...props}>
            {React.Children.map(children, (child, index) => (
                <StaggerItem
                    key={index}
                    index={index}
                    from={from}
                    to={to}
                    animateOnInit={animateOnInit}
                    staggerDelay={staggerDelay}
                    delayGlobal={delay}
                    durationGlobal={duration}
                    easingGlobal={easing}
                    registerShow={(fn) => (showRefs.current[index] = fn)}
                    registerHide={(fn) => (hideRefs.current[index] = fn)}
                >
                    {child}
                </StaggerItem>
            ))}
        </Box>
    );
}

/* -------------------- FIX DE AUTOCOMPLETADO -------------------- */

export type StaggerComponent = (
    props: StaggerProps & { ref?: React.Ref<StaggerRef> }
) => React.ReactElement | null;

export const Stagger = forwardRef(InternalStagger) as unknown as StaggerComponent;


// import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
// import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing, interpolateColor, EasingFunctionFactory, } from 'react-native-reanimated';
// import { Box, BSBoxProps } from './Box'; type DelayDurationMap = Partial<Record<string, number>>; type EasingFn = EasingFunctionFactory; type AnimValues = { opacity?: number; translateX?: number; translateY?: number; scale?: number; rotate?: string | number; rotateX?: string | number; rotateY?: string | number; rotateZ?: string | number; skewX?: string | number; skewY?: string | number; backgroundColor?: string; color?: string; borderColor?: string; borderWidth?: number; borderRadius?: number; letterSpacing?: number; width?: number; height?: number; delay?: number; duration?: number; easing?: EasingFn; delayAnimation?: DelayDurationMap; durationAnimation?: DelayDurationMap; }; type StaggerProps = BSBoxProps & { children: React.ReactElement[] | React.ReactElement; from?: AnimValues; to?: AnimValues; animateOnInit?: boolean; staggerDelay?: number; delay?: number; duration?: number; easing?: EasingFn; }; export type StaggerRef = { show: () => void; hide: () => void; reset: () => void }; const DEFAULT_DURATION = 400; const DEFAULT_DELAY = 0; const DEFAULT_EASING = Easing.bezier(0.4, 0, 0.2, 1); export const Stagger = forwardRef<StaggerRef, StaggerProps>(({ children, from = { opacity: 0, translateY: 20, scale: 0.95 }, to = { opacity: 1, translateY: 0, scale: 1 }, animateOnInit = true, staggerDelay = 80, delay = DEFAULT_DELAY, duration = DEFAULT_DURATION, easing = DEFAULT_EASING, ...props }, ref) => { const showRefs = useRef<(() => void)[]>([]); const hideRefs = useRef<(() => void)[]>([]); const showAll = () => showRefs.current.forEach((fn, i) => setTimeout(() => fn?.(), i * staggerDelay)); const hideAll = () => hideRefs.current.slice().reverse().forEach((fn, i) => setTimeout(() => fn?.(), i * staggerDelay)); useImperativeHandle(ref, () => ({ show: showAll, hide: hideAll, reset: () => { showRefs.current = []; hideRefs.current = []; }, })); useEffect(() => { if (animateOnInit) setTimeout(() => showAll(), 0); // eslint-disable-next-line react-hooks/exhaustive-deps }, []); return ( <Box {...props}> {React.Children.map(children, (child, i) => ( <Item key={i} index={i} from={from} to={to} registerShow={(fn) => (showRefs.current[i] = fn)} registerHide={(fn) => (hideRefs.current[i] = fn)} globalDelay={delay} globalDuration={duration} globalEasing={easing} > {child} </Item> ))} </Box> ); } ); type ItemProps = { from: AnimValues; to: AnimValues; index?: number; globalDelay: number; globalDuration: number; globalEasing: EasingFn; registerShow: (fn: () => void) => void; registerHide: (fn: () => void) => void; children: React.ReactElement; }; const parseNumber = (v: any, fallback = 0) => typeof v === 'number' ? v : typeof v === 'string' ? parseFloat(v) || fallback : fallback; const Item = ({ from, to, index = 0, globalDelay, globalDuration, globalEasing, registerShow, registerHide, children }: ItemProps) => { // SharedValues (fixed order) const svOpacity = useSharedValue<number>(from.opacity ?? to.opacity ?? 1); const svTranslateX = useSharedValue<number>(from.translateX ?? to.translateX ?? 0); const svTranslateY = useSharedValue<number>(from.translateY ?? to.translateY ?? 0); const svScale = useSharedValue<number>(from.scale ?? to.scale ?? 1); const svRotate = useSharedValue<number>(parseNumber(from.rotate ?? to.rotate ?? 0)); const svRotateX = useSharedValue<number>(parseNumber(from.rotateX ?? to.rotateX ?? 0)); const svRotateY = useSharedValue<number>(parseNumber(from.rotateY ?? to.rotateY ?? 0)); const svRotateZ = useSharedValue<number>(parseNumber(from.rotateZ ?? to.rotateZ ?? 0)); const svSkewX = useSharedValue<number>(parseNumber(from.skewX ?? to.skewX ?? 0)); const svSkewY = useSharedValue<number>(parseNumber(from.skewY ?? to.skewY ?? 0)); const svBorderWidth = useSharedValue<number>(from.borderWidth ?? to.borderWidth ?? 0); const svBorderRadius = useSharedValue<number>(from.borderRadius ?? to.borderRadius ?? 0); const svWidth = useSharedValue<number>(from.width ?? to.width ?? 0); const svHeight = useSharedValue<number>(from.height ?? to.height ?? 0); const svLetterSpacing = useSharedValue<number>(from.letterSpacing ?? to.letterSpacing ?? 0); const svBgColor = useSharedValue<number>(0); const svColor = useSharedValue<number>(0); const svBorderColor = useSharedValue<number>(0); const getTimingForProp = (prop: string, forward: boolean) => { const config = forward ? to : from; const duration = config.durationAnimation?.[prop] ?? config.duration ?? globalDuration ?? DEFAULT_DURATION; const delay = config.delayAnimation?.[prop] ?? config.delay ?? globalDelay ?? DEFAULT_DELAY; const easing = config.easing ?? globalEasing ?? DEFAULT_EASING; return { duration, delay, easing }; }; const animateProperty = (prop: string, forward: boolean) => { const { duration, delay, easing } = getTimingForProp(prop, forward); const src = (forward ? from[prop] : to[prop]); const dst = (forward ? to[prop] : from[prop]); switch (prop) { case 'opacity': svOpacity.value = withDelay(delay + (index ?? 0) * 0, withTiming(Number(dst ?? src ?? 1), { duration, easing })); break; case 'translateX': svTranslateX.value = withDelay(delay, withTiming(Number(dst ?? src ?? 0), { duration, easing })); break; case 'translateY': svTranslateY.value = withDelay(delay, withTiming(Number(dst ?? src ?? 0), { duration, easing })); break; case 'scale': svScale.value = withDelay(delay, withTiming(Number(dst ?? src ?? 1), { duration, easing })); break; case 'rotate': svRotate.value = withDelay(delay, withTiming(parseNumber(dst ?? src ?? 0), { duration, easing })); break; case 'rotateX': svRotateX.value = withDelay(delay, withTiming(parseNumber(dst ?? src ?? 0), { duration, easing })); break; case 'rotateY': svRotateY.value = withDelay(delay, withTiming(parseNumber(dst ?? src ?? 0), { duration, easing })); break; case 'rotateZ': svRotateZ.value = withDelay(delay, withTiming(parseNumber(dst ?? src ?? 0), { duration, easing })); break; case 'skewX': svSkewX.value = withDelay(delay, withTiming(parseNumber(dst ?? src ?? 0), { duration, easing })); break; case 'skewY': svSkewY.value = withDelay(delay, withTiming(parseNumber(dst ?? src ?? 0), { duration, easing })); break; case 'borderWidth': svBorderWidth.value = withDelay(delay, withTiming(Number(dst ?? src ?? 0), { duration, easing })); break; case 'borderRadius': svBorderRadius.value = withDelay(delay, withTiming(Number(dst ?? src ?? 0), { duration, easing })); break; case 'width': svWidth.value = withDelay(delay, withTiming(Number(dst ?? src ?? 0), { duration, easing })); break; case 'height': svHeight.value = withDelay(delay, withTiming(Number(dst ?? src ?? 0), { duration, easing })); break; case 'letterSpacing': svLetterSpacing.value = withDelay(delay, withTiming(Number(dst ?? src ?? 0), { duration, easing })); break; case 'backgroundColor': svBgColor.value = withDelay(delay, withTiming(forward ? 1 : 0, { duration, easing })); break; case 'color': svColor.value = withDelay(delay, withTiming(forward ? 1 : 0, { duration, easing })); break; case 'borderColor': svBorderColor.value = withDelay(delay, withTiming(forward ? 1 : 0, { duration, easing })); break; default: break; } }; const animateTo = (forward: boolean) => { const keys = new Set([...Object.keys(from || {}), ...Object.keys(to || {})]); keys.forEach((k) => { if (k === 'delayAnimation' || k === 'durationAnimation') return; animateProperty(k, forward); }); }; useEffect(() => { registerShow(() => animateTo(true)); registerHide(() => animateTo(false)); // eslint-disable-next-line react-hooks/exhaustive-deps }, [from, to]); const style = useAnimatedStyle(() => { const transforms: any[] = [ { translateX: svTranslateX.value }, { translateY: svTranslateY.value }, { scale: svScale.value }, ]; transforms.push({ rotate: ${svRotate.value}deg }); transforms.push({ rotateX: ${svRotateX.value}deg }); transforms.push({ rotateY: ${svRotateY.value}deg }); transforms.push({ rotateZ: ${svRotateZ.value}deg }); transforms.push({ skewX: ${svSkewX.value}deg }); transforms.push({ skewY: ${svSkewY.value}deg }); const backgroundColor = (from.backgroundColor || to.backgroundColor) ? interpolateColor(svBgColor.value, [0, 1], [from.backgroundColor ?? 'transparent', to.backgroundColor ?? 'transparent']) : undefined; const borderColor = (from.borderColor || to.borderColor) ? interpolateColor(svBorderColor.value, [0, 1], [from.borderColor ?? 'transparent', to.borderColor ?? 'transparent']) : undefined; return { opacity: svOpacity.value, transform: transforms, backgroundColor, borderColor, borderWidth: svBorderWidth.value, borderRadius: svBorderRadius.value, width: svWidth.value || undefined, height: svHeight.value || undefined, }; }); const styleText = useAnimatedStyle(() => ({ color: (from.color || to.color) ? interpolateColor(svColor.value, [0, 1], [from.color ?? '#000', to.color ?? from.color ?? '#000']) : undefined, letterSpacing: svLetterSpacing.value, })); const childsChildren = React.Children.map(children.props['children'], (x) => typeof x === 'string' ? <Animated.Text style={styleText}>{x}</Animated.Text> : x ); return ( <Animated.View style={[style]}> {React.cloneElement(children, { children: childsChildren } as any)} </Animated.View> ); };