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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Stagger = void 0;
const react_1 = require("react");
const react_native_reanimated_1 = __importStar(require("react-native-reanimated"));
const Box_1 = require("./Box");
const DEFAULT_DELAY = 0;
const DEFAULT_DURATION = 300;
const DEFAULT_EASING = react_native_reanimated_1.Easing.out(react_native_reanimated_1.Easing.exp);
exports.Stagger = (0, react_1.forwardRef)((props, ref) => {
    const { children, from = { opacity: 0, translateY: 20, scale: 0.95 }, to = { opacity: 1, translateY: 0, scale: 1 }, animateOnInit = false, staggerDelay = 80, delay = DEFAULT_DELAY, duration = DEFAULT_DURATION, easing = DEFAULT_EASING } = props, rest = __rest(props, ["children", "from", "to", "animateOnInit", "staggerDelay", "delay", "duration", "easing"]);
    const nodes = Array.isArray(children) ? children : [children];
    const timers = nodes.map(() => (0, react_native_reanimated_1.useSharedValue)(0));
    const animate = () => {
        timers.forEach((t, i) => {
            t.value = 0;
            t.value = (0, react_native_reanimated_1.withTiming)(1, {
                duration,
                easing,
                delay: delay + i * staggerDelay,
            });
        });
    };
    const reset = () => {
        timers.forEach((t) => (t.value = 0));
    };
    (0, react_1.useImperativeHandle)(ref, () => ({
        play: animate,
        reset,
    }));
    (0, react_1.useEffect)(() => {
        if (animateOnInit)
            animate();
    }, []);
    return (<Box_1.Box {...rest}>
            {nodes.map((child, index) => {
            const progress = timers[index];
            const animatedStyle = (0, react_native_reanimated_1.useAnimatedStyle)(() => {
                var _a, _b, _c, _d, _e, _f, _g, _h;
                return {
                    opacity: from.opacity !== undefined
                        ? (0, react_native_reanimated_1.interpolate)(progress.value, [0, 1], [(_a = from.opacity) !== null && _a !== void 0 ? _a : 0, (_b = to.opacity) !== null && _b !== void 0 ? _b : 1])
                        : undefined,
                    transform: [
                        from.translateY !== undefined && {
                            translateY: (0, react_native_reanimated_1.interpolate)(progress.value, [0, 1], [(_c = from.translateY) !== null && _c !== void 0 ? _c : 20, (_d = to.translateY) !== null && _d !== void 0 ? _d : 0]),
                        },
                        from.translateX !== undefined && {
                            translateX: (0, react_native_reanimated_1.interpolate)(progress.value, [0, 1], [(_e = from.translateX) !== null && _e !== void 0 ? _e : 20, (_f = to.translateX) !== null && _f !== void 0 ? _f : 0]),
                        },
                        from.scale !== undefined && {
                            scale: (0, react_native_reanimated_1.interpolate)(progress.value, [0, 1], [(_g = from.scale) !== null && _g !== void 0 ? _g : 0.9, (_h = to.scale) !== null && _h !== void 0 ? _h : 1]),
                        },
                        from.rotate !== undefined && {
                            rotate: `${(0, react_native_reanimated_1.interpolate)(progress.value, [0, 1], [
                                Number(String(from.rotate).replace("deg", "")) ||
                                    0,
                                Number(String(to.rotate).replace("deg", "")) ||
                                    0,
                            ])}deg`,
                        },
                    ].filter(Boolean),
                };
            });
            return (<react_native_reanimated_1.default.View key={index} style={animatedStyle}>
                        {child}
                    </react_native_reanimated_1.default.View>);
        })}
        </Box_1.Box>);
});
// import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
// import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing, interpolateColor, EasingFunctionFactory, } from 'react-native-reanimated';
// import { Box, BSBoxProps } from './Box'; type DelayDurationMap = Partial<Record<string, number>>; type EasingFn = EasingFunctionFactory; type AnimValues = { opacity?: number; translateX?: number; translateY?: number; scale?: number; rotate?: string | number; rotateX?: string | number; rotateY?: string | number; rotateZ?: string | number; skewX?: string | number; skewY?: string | number; backgroundColor?: string; color?: string; borderColor?: string; borderWidth?: number; borderRadius?: number; letterSpacing?: number; width?: number; height?: number; delay?: number; duration?: number; easing?: EasingFn; delayAnimation?: DelayDurationMap; durationAnimation?: DelayDurationMap; }; type StaggerProps = BSBoxProps & { children: React.ReactElement[] | React.ReactElement; from?: AnimValues; to?: AnimValues; animateOnInit?: boolean; staggerDelay?: number; delay?: number; duration?: number; easing?: EasingFn; }; export type StaggerRef = { show: () => void; hide: () => void; reset: () => void }; const DEFAULT_DURATION = 400; const DEFAULT_DELAY = 0; const DEFAULT_EASING = Easing.bezier(0.4, 0, 0.2, 1); export const Stagger = forwardRef<StaggerRef, StaggerProps>(({ children, from = { opacity: 0, translateY: 20, scale: 0.95 }, to = { opacity: 1, translateY: 0, scale: 1 }, animateOnInit = true, staggerDelay = 80, delay = DEFAULT_DELAY, duration = DEFAULT_DURATION, easing = DEFAULT_EASING, ...props }, ref) => { const showRefs = useRef<(() => void)[]>([]); const hideRefs = useRef<(() => void)[]>([]); const showAll = () => showRefs.current.forEach((fn, i) => setTimeout(() => fn?.(), i * staggerDelay)); const hideAll = () => hideRefs.current.slice().reverse().forEach((fn, i) => setTimeout(() => fn?.(), i * staggerDelay)); useImperativeHandle(ref, () => ({ show: showAll, hide: hideAll, reset: () => { showRefs.current = []; hideRefs.current = []; }, })); useEffect(() => { if (animateOnInit) setTimeout(() => showAll(), 0); // eslint-disable-next-line react-hooks/exhaustive-deps }, []); return ( <Box {...props}> {React.Children.map(children, (child, i) => ( <Item key={i} index={i} from={from} to={to} registerShow={(fn) => (showRefs.current[i] = fn)} registerHide={(fn) => (hideRefs.current[i] = fn)} globalDelay={delay} globalDuration={duration} globalEasing={easing} > {child} </Item> ))} </Box> ); } ); type ItemProps = { from: AnimValues; to: AnimValues; index?: number; globalDelay: number; globalDuration: number; globalEasing: EasingFn; registerShow: (fn: () => void) => void; registerHide: (fn: () => void) => void; children: React.ReactElement; }; const parseNumber = (v: any, fallback = 0) => typeof v === 'number' ? v : typeof v === 'string' ? parseFloat(v) || fallback : fallback; const Item = ({ from, to, index = 0, globalDelay, globalDuration, globalEasing, registerShow, registerHide, children }: ItemProps) => { // SharedValues (fixed order) const svOpacity = useSharedValue<number>(from.opacity ?? to.opacity ?? 1); const svTranslateX = useSharedValue<number>(from.translateX ?? to.translateX ?? 0); const svTranslateY = useSharedValue<number>(from.translateY ?? to.translateY ?? 0); const svScale = useSharedValue<number>(from.scale ?? to.scale ?? 1); const svRotate = useSharedValue<number>(parseNumber(from.rotate ?? to.rotate ?? 0)); const svRotateX = useSharedValue<number>(parseNumber(from.rotateX ?? to.rotateX ?? 0)); const svRotateY = useSharedValue<number>(parseNumber(from.rotateY ?? to.rotateY ?? 0)); const svRotateZ = useSharedValue<number>(parseNumber(from.rotateZ ?? to.rotateZ ?? 0)); const svSkewX = useSharedValue<number>(parseNumber(from.skewX ?? to.skewX ?? 0)); const svSkewY = useSharedValue<number>(parseNumber(from.skewY ?? to.skewY ?? 0)); const svBorderWidth = useSharedValue<number>(from.borderWidth ?? to.borderWidth ?? 0); const svBorderRadius = useSharedValue<number>(from.borderRadius ?? to.borderRadius ?? 0); const svWidth = useSharedValue<number>(from.width ?? to.width ?? 0); const svHeight = useSharedValue<number>(from.height ?? to.height ?? 0); const svLetterSpacing = useSharedValue<number>(from.letterSpacing ?? to.letterSpacing ?? 0); const svBgColor = useSharedValue<number>(0); const svColor = useSharedValue<number>(0); const svBorderColor = useSharedValue<number>(0); const getTimingForProp = (prop: string, forward: boolean) => { const config = forward ? to : from; const duration = config.durationAnimation?.[prop] ?? config.duration ?? globalDuration ?? DEFAULT_DURATION; const delay = config.delayAnimation?.[prop] ?? config.delay ?? globalDelay ?? DEFAULT_DELAY; const easing = config.easing ?? globalEasing ?? DEFAULT_EASING; return { duration, delay, easing }; }; const animateProperty = (prop: string, forward: boolean) => { const { duration, delay, easing } = getTimingForProp(prop, forward); const src = (forward ? from[prop] : to[prop]); const dst = (forward ? to[prop] : from[prop]); switch (prop) { case 'opacity': svOpacity.value = withDelay(delay + (index ?? 0) * 0, withTiming(Number(dst ?? src ?? 1), { duration, easing })); break; case 'translateX': svTranslateX.value = withDelay(delay, withTiming(Number(dst ?? src ?? 0), { duration, easing })); break; case 'translateY': svTranslateY.value = withDelay(delay, withTiming(Number(dst ?? src ?? 0), { duration, easing })); break; case 'scale': svScale.value = withDelay(delay, withTiming(Number(dst ?? src ?? 1), { duration, easing })); break; case 'rotate': svRotate.value = withDelay(delay, withTiming(parseNumber(dst ?? src ?? 0), { duration, easing })); break; case 'rotateX': svRotateX.value = withDelay(delay, withTiming(parseNumber(dst ?? src ?? 0), { duration, easing })); break; case 'rotateY': svRotateY.value = withDelay(delay, withTiming(parseNumber(dst ?? src ?? 0), { duration, easing })); break; case 'rotateZ': svRotateZ.value = withDelay(delay, withTiming(parseNumber(dst ?? src ?? 0), { duration, easing })); break; case 'skewX': svSkewX.value = withDelay(delay, withTiming(parseNumber(dst ?? src ?? 0), { duration, easing })); break; case 'skewY': svSkewY.value = withDelay(delay, withTiming(parseNumber(dst ?? src ?? 0), { duration, easing })); break; case 'borderWidth': svBorderWidth.value = withDelay(delay, withTiming(Number(dst ?? src ?? 0), { duration, easing })); break; case 'borderRadius': svBorderRadius.value = withDelay(delay, withTiming(Number(dst ?? src ?? 0), { duration, easing })); break; case 'width': svWidth.value = withDelay(delay, withTiming(Number(dst ?? src ?? 0), { duration, easing })); break; case 'height': svHeight.value = withDelay(delay, withTiming(Number(dst ?? src ?? 0), { duration, easing })); break; case 'letterSpacing': svLetterSpacing.value = withDelay(delay, withTiming(Number(dst ?? src ?? 0), { duration, easing })); break; case 'backgroundColor': svBgColor.value = withDelay(delay, withTiming(forward ? 1 : 0, { duration, easing })); break; case 'color': svColor.value = withDelay(delay, withTiming(forward ? 1 : 0, { duration, easing })); break; case 'borderColor': svBorderColor.value = withDelay(delay, withTiming(forward ? 1 : 0, { duration, easing })); break; default: break; } }; const animateTo = (forward: boolean) => { const keys = new Set([...Object.keys(from || {}), ...Object.keys(to || {})]); keys.forEach((k) => { if (k === 'delayAnimation' || k === 'durationAnimation') return; animateProperty(k, forward); }); }; useEffect(() => { registerShow(() => animateTo(true)); registerHide(() => animateTo(false)); // eslint-disable-next-line react-hooks/exhaustive-deps }, [from, to]); const style = useAnimatedStyle(() => { const transforms: any[] = [ { translateX: svTranslateX.value }, { translateY: svTranslateY.value }, { scale: svScale.value }, ]; transforms.push({ rotate: ${svRotate.value}deg }); transforms.push({ rotateX: ${svRotateX.value}deg }); transforms.push({ rotateY: ${svRotateY.value}deg }); transforms.push({ rotateZ: ${svRotateZ.value}deg }); transforms.push({ skewX: ${svSkewX.value}deg }); transforms.push({ skewY: ${svSkewY.value}deg }); const backgroundColor = (from.backgroundColor || to.backgroundColor) ? interpolateColor(svBgColor.value, [0, 1], [from.backgroundColor ?? 'transparent', to.backgroundColor ?? 'transparent']) : undefined; const borderColor = (from.borderColor || to.borderColor) ? interpolateColor(svBorderColor.value, [0, 1], [from.borderColor ?? 'transparent', to.borderColor ?? 'transparent']) : undefined; return { opacity: svOpacity.value, transform: transforms, backgroundColor, borderColor, borderWidth: svBorderWidth.value, borderRadius: svBorderRadius.value, width: svWidth.value || undefined, height: svHeight.value || undefined, }; }); const styleText = useAnimatedStyle(() => ({ color: (from.color || to.color) ? interpolateColor(svColor.value, [0, 1], [from.color ?? '#000', to.color ?? from.color ?? '#000']) : undefined, letterSpacing: svLetterSpacing.value, })); const childsChildren = React.Children.map(children.props['children'], (x) => typeof x === 'string' ? <Animated.Text style={styleText}>{x}</Animated.Text> : x ); return ( <Animated.View style={[style]}> {React.cloneElement(children, { children: childsChildren } as any)} </Animated.View> ); };
