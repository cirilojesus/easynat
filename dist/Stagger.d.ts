import React from 'react';
import { EasingFunctionFactory } from 'react-native-reanimated';
import { BSBoxProps } from './Box';
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
export type StaggerComponent = (props: StaggerProps & {
    ref?: React.Ref<StaggerRef>;
}) => React.ReactElement | null;
export declare const Stagger: StaggerComponent;
export {};
