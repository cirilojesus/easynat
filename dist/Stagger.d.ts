import React from 'react';
import { EABoxProps } from './Box';
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
export type StaggerEasing = ((value: number) => number) | {
    factory: () => (value: number) => number;
};
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
/** Las animaciones de `preset`: cómo están ocultos (from) y visibles (to). from / to de las props se aplican encima */
export declare const STAGGER_PRESETS: Record<StaggerPreset, {
    from: StaggerAnimValues;
    to: StaggerAnimValues;
}>;
export type StaggerComponent = (props: StaggerProps & {
    ref?: React.Ref<StaggerRef>;
}) => React.ReactElement | null;
export declare const Stagger: StaggerComponent;
