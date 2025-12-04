import {
    forwardRef,
    useImperativeHandle,
    useEffect,
} from "react";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    Easing,
    interpolate,
} from "react-native-reanimated";
import { Box, BSBoxProps } from "./Box";

export type AnimValues = {
    opacity?: number;
    translateY?: number;
    translateX?: number;
    scale?: number;
    rotate?: string | number;
    letterSpacing?: number;
};

export type StaggerRef = {
    play: () => void;
    reset: () => void;
};

export type StaggerProps = BSBoxProps & {
    children: React.ReactElement | React.ReactElement[];
    from?: AnimValues;
    to?: AnimValues;
    animateOnInit?: boolean;
    staggerDelay?: number;
    delay?: number;
    duration?: number;
    easing?: (v: number) => number;
};

const DEFAULT_DELAY = 0;
const DEFAULT_DURATION = 300;
const DEFAULT_EASING = Easing.out(Easing.exp);

export const Stagger = forwardRef<StaggerRef, StaggerProps>((props, ref) => {

    const {
        children,
        from = { opacity: 0, translateY: 20, scale: 0.95 },
        to = { opacity: 1, translateY: 0, scale: 1 },
        animateOnInit = false,
        staggerDelay = 80,
        delay = DEFAULT_DELAY,
        duration = DEFAULT_DURATION,
        easing = DEFAULT_EASING,
        ...rest
    } = props;

    const nodes = Array.isArray(children) ? children : [children];
    const timers = nodes.map(() => useSharedValue(0));

    const animate = () => {
        timers.forEach((t, i) => {
            t.value = 0;
            t.value = withTiming(1, {
                duration,
                easing,
                delay: delay + i * staggerDelay,
            });
        });
    };

    const reset = () => {
        timers.forEach((t) => (t.value = 0));
    };

    useImperativeHandle(ref, () => ({
        play: animate,
        reset,
    }));

    useEffect(() => {
        if (animateOnInit) animate();
    }, []);

    return (
        <Box {...rest}>
            {nodes.map((child, index) => {
                const progress = timers[index];

                const animatedStyle = useAnimatedStyle(() => {
                    return {
                        opacity:
                            from.opacity !== undefined
                                ? interpolate(
                                    progress.value,
                                    [0, 1],
                                    [from.opacity ?? 0, to.opacity ?? 1]
                                )
                                : undefined,

                        transform: [
                            from.translateY !== undefined && {
                                translateY: interpolate(
                                    progress.value,
                                    [0, 1],
                                    [from.translateY ?? 20, to.translateY ?? 0]
                                ),
                            },
                            from.translateX !== undefined && {
                                translateX: interpolate(
                                    progress.value,
                                    [0, 1],
                                    [from.translateX ?? 20, to.translateX ?? 0]
                                ),
                            },
                            from.scale !== undefined && {
                                scale: interpolate(
                                    progress.value,
                                    [0, 1],
                                    [from.scale ?? 0.9, to.scale ?? 1]
                                ),
                            },
                            from.rotate !== undefined && {
                                rotate: `${interpolate(
                                    progress.value,
                                    [0, 1],
                                    [
                                        Number(String(from.rotate).replace("deg", "")) ||
                                        0,
                                        Number(String(to.rotate).replace("deg", "")) ||
                                        0,
                                    ]
                                )
                                    }deg`,
                            },
                        ].filter(Boolean) as any,
                    };
                });

                return (
                    <Animated.View key={index} style={animatedStyle}>
                        {child}
                    </Animated.View>
                );
            })}
        </Box>
    );
});



// import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
// import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing, interpolateColor, EasingFunctionFactory, } from 'react-native-reanimated';
// import { Box, BSBoxProps } from './Box'; type DelayDurationMap = Partial<Record<string, number>>; type EasingFn = EasingFunctionFactory; type AnimValues = { opacity?: number; translateX?: number; translateY?: number; scale?: number; rotate?: string | number; rotateX?: string | number; rotateY?: string | number; rotateZ?: string | number; skewX?: string | number; skewY?: string | number; backgroundColor?: string; color?: string; borderColor?: string; borderWidth?: number; borderRadius?: number; letterSpacing?: number; width?: number; height?: number; delay?: number; duration?: number; easing?: EasingFn; delayAnimation?: DelayDurationMap; durationAnimation?: DelayDurationMap; }; type StaggerProps = BSBoxProps & { children: React.ReactElement[] | React.ReactElement; from?: AnimValues; to?: AnimValues; animateOnInit?: boolean; staggerDelay?: number; delay?: number; duration?: number; easing?: EasingFn; }; export type StaggerRef = { show: () => void; hide: () => void; reset: () => void }; const DEFAULT_DURATION = 400; const DEFAULT_DELAY = 0; const DEFAULT_EASING = Easing.bezier(0.4, 0, 0.2, 1); export const Stagger = forwardRef<StaggerRef, StaggerProps>(({ children, from = { opacity: 0, translateY: 20, scale: 0.95 }, to = { opacity: 1, translateY: 0, scale: 1 }, animateOnInit = true, staggerDelay = 80, delay = DEFAULT_DELAY, duration = DEFAULT_DURATION, easing = DEFAULT_EASING, ...props }, ref) => { const showRefs = useRef<(() => void)[]>([]); const hideRefs = useRef<(() => void)[]>([]); const showAll = () => showRefs.current.forEach((fn, i) => setTimeout(() => fn?.(), i * staggerDelay)); const hideAll = () => hideRefs.current.slice().reverse().forEach((fn, i) => setTimeout(() => fn?.(), i * staggerDelay)); useImperativeHandle(ref, () => ({ show: showAll, hide: hideAll, reset: () => { showRefs.current = []; hideRefs.current = []; }, })); useEffect(() => { if (animateOnInit) setTimeout(() => showAll(), 0); // eslint-disable-next-line react-hooks/exhaustive-deps }, []); return ( <Box {...props}> {React.Children.map(children, (child, i) => ( <Item key={i} index={i} from={from} to={to} registerShow={(fn) => (showRefs.current[i] = fn)} registerHide={(fn) => (hideRefs.current[i] = fn)} globalDelay={delay} globalDuration={duration} globalEasing={easing} > {child} </Item> ))} </Box> ); } ); type ItemProps = { from: AnimValues; to: AnimValues; index?: number; globalDelay: number; globalDuration: number; globalEasing: EasingFn; registerShow: (fn: () => void) => void; registerHide: (fn: () => void) => void; children: React.ReactElement; }; const parseNumber = (v: any, fallback = 0) => typeof v === 'number' ? v : typeof v === 'string' ? parseFloat(v) || fallback : fallback; const Item = ({ from, to, index = 0, globalDelay, globalDuration, globalEasing, registerShow, registerHide, children }: ItemProps) => { // SharedValues (fixed order) const svOpacity = useSharedValue<number>(from.opacity ?? to.opacity ?? 1); const svTranslateX = useSharedValue<number>(from.translateX ?? to.translateX ?? 0); const svTranslateY = useSharedValue<number>(from.translateY ?? to.translateY ?? 0); const svScale = useSharedValue<number>(from.scale ?? to.scale ?? 1); const svRotate = useSharedValue<number>(parseNumber(from.rotate ?? to.rotate ?? 0)); const svRotateX = useSharedValue<number>(parseNumber(from.rotateX ?? to.rotateX ?? 0)); const svRotateY = useSharedValue<number>(parseNumber(from.rotateY ?? to.rotateY ?? 0)); const svRotateZ = useSharedValue<number>(parseNumber(from.rotateZ ?? to.rotateZ ?? 0)); const svSkewX = useSharedValue<number>(parseNumber(from.skewX ?? to.skewX ?? 0)); const svSkewY = useSharedValue<number>(parseNumber(from.skewY ?? to.skewY ?? 0)); const svBorderWidth = useSharedValue<number>(from.borderWidth ?? to.borderWidth ?? 0); const svBorderRadius = useSharedValue<number>(from.borderRadius ?? to.borderRadius ?? 0); const svWidth = useSharedValue<number>(from.width ?? to.width ?? 0); const svHeight = useSharedValue<number>(from.height ?? to.height ?? 0); const svLetterSpacing = useSharedValue<number>(from.letterSpacing ?? to.letterSpacing ?? 0); const svBgColor = useSharedValue<number>(0); const svColor = useSharedValue<number>(0); const svBorderColor = useSharedValue<number>(0); const getTimingForProp = (prop: string, forward: boolean) => { const config = forward ? to : from; const duration = config.durationAnimation?.[prop] ?? config.duration ?? globalDuration ?? DEFAULT_DURATION; const delay = config.delayAnimation?.[prop] ?? config.delay ?? globalDelay ?? DEFAULT_DELAY; const easing = config.easing ?? globalEasing ?? DEFAULT_EASING; return { duration, delay, easing }; }; const animateProperty = (prop: string, forward: boolean) => { const { duration, delay, easing } = getTimingForProp(prop, forward); const src = (forward ? from[prop] : to[prop]); const dst = (forward ? to[prop] : from[prop]); switch (prop) { case 'opacity': svOpacity.value = withDelay(delay + (index ?? 0) * 0, withTiming(Number(dst ?? src ?? 1), { duration, easing })); break; case 'translateX': svTranslateX.value = withDelay(delay, withTiming(Number(dst ?? src ?? 0), { duration, easing })); break; case 'translateY': svTranslateY.value = withDelay(delay, withTiming(Number(dst ?? src ?? 0), { duration, easing })); break; case 'scale': svScale.value = withDelay(delay, withTiming(Number(dst ?? src ?? 1), { duration, easing })); break; case 'rotate': svRotate.value = withDelay(delay, withTiming(parseNumber(dst ?? src ?? 0), { duration, easing })); break; case 'rotateX': svRotateX.value = withDelay(delay, withTiming(parseNumber(dst ?? src ?? 0), { duration, easing })); break; case 'rotateY': svRotateY.value = withDelay(delay, withTiming(parseNumber(dst ?? src ?? 0), { duration, easing })); break; case 'rotateZ': svRotateZ.value = withDelay(delay, withTiming(parseNumber(dst ?? src ?? 0), { duration, easing })); break; case 'skewX': svSkewX.value = withDelay(delay, withTiming(parseNumber(dst ?? src ?? 0), { duration, easing })); break; case 'skewY': svSkewY.value = withDelay(delay, withTiming(parseNumber(dst ?? src ?? 0), { duration, easing })); break; case 'borderWidth': svBorderWidth.value = withDelay(delay, withTiming(Number(dst ?? src ?? 0), { duration, easing })); break; case 'borderRadius': svBorderRadius.value = withDelay(delay, withTiming(Number(dst ?? src ?? 0), { duration, easing })); break; case 'width': svWidth.value = withDelay(delay, withTiming(Number(dst ?? src ?? 0), { duration, easing })); break; case 'height': svHeight.value = withDelay(delay, withTiming(Number(dst ?? src ?? 0), { duration, easing })); break; case 'letterSpacing': svLetterSpacing.value = withDelay(delay, withTiming(Number(dst ?? src ?? 0), { duration, easing })); break; case 'backgroundColor': svBgColor.value = withDelay(delay, withTiming(forward ? 1 : 0, { duration, easing })); break; case 'color': svColor.value = withDelay(delay, withTiming(forward ? 1 : 0, { duration, easing })); break; case 'borderColor': svBorderColor.value = withDelay(delay, withTiming(forward ? 1 : 0, { duration, easing })); break; default: break; } }; const animateTo = (forward: boolean) => { const keys = new Set([...Object.keys(from || {}), ...Object.keys(to || {})]); keys.forEach((k) => { if (k === 'delayAnimation' || k === 'durationAnimation') return; animateProperty(k, forward); }); }; useEffect(() => { registerShow(() => animateTo(true)); registerHide(() => animateTo(false)); // eslint-disable-next-line react-hooks/exhaustive-deps }, [from, to]); const style = useAnimatedStyle(() => { const transforms: any[] = [ { translateX: svTranslateX.value }, { translateY: svTranslateY.value }, { scale: svScale.value }, ]; transforms.push({ rotate: ${svRotate.value}deg }); transforms.push({ rotateX: ${svRotateX.value}deg }); transforms.push({ rotateY: ${svRotateY.value}deg }); transforms.push({ rotateZ: ${svRotateZ.value}deg }); transforms.push({ skewX: ${svSkewX.value}deg }); transforms.push({ skewY: ${svSkewY.value}deg }); const backgroundColor = (from.backgroundColor || to.backgroundColor) ? interpolateColor(svBgColor.value, [0, 1], [from.backgroundColor ?? 'transparent', to.backgroundColor ?? 'transparent']) : undefined; const borderColor = (from.borderColor || to.borderColor) ? interpolateColor(svBorderColor.value, [0, 1], [from.borderColor ?? 'transparent', to.borderColor ?? 'transparent']) : undefined; return { opacity: svOpacity.value, transform: transforms, backgroundColor, borderColor, borderWidth: svBorderWidth.value, borderRadius: svBorderRadius.value, width: svWidth.value || undefined, height: svHeight.value || undefined, }; }); const styleText = useAnimatedStyle(() => ({ color: (from.color || to.color) ? interpolateColor(svColor.value, [0, 1], [from.color ?? '#000', to.color ?? from.color ?? '#000']) : undefined, letterSpacing: svLetterSpacing.value, })); const childsChildren = React.Children.map(children.props['children'], (x) => typeof x === 'string' ? <Animated.Text style={styleText}>{x}</Animated.Text> : x ); return ( <Animated.View style={[style]}> {React.cloneElement(children, { children: childsChildren } as any)} </Animated.View> ); };