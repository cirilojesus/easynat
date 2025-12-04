/// <reference types="react" />
import { BSBoxProps } from "./Box";
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
export declare const Stagger: import("react").ForwardRefExoticComponent<Omit<any, "ref"> & import("react").RefAttributes<StaggerRef>>;
