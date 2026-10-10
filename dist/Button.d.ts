import { COLOR_SCHEME, VARIANT_BUTTON } from './theme';
import { EAPressableProps } from "./Pressable";
import React from "react";
import { IconProps } from "./Icon";
import { EABoxProps } from "./Box";
import { EATextProps } from "./Text";
export type ButtonChangeAnimation = 'zoom' | 'fade' | 'slide' | 'none';
export type EAButtonProps = Omit<EAPressableProps, 'variant' | '_ios' | '_android' | '_web' | '_pressed'> & {
    variant?: VARIANT_BUTTON | (string & {});
    colorScheme?: COLOR_SCHEME;
    _ios?: Omit<EAButtonProps, '_ios' | '_android' | '_web'>;
    _android?: Omit<EAButtonProps, '_ios' | '_android' | '_web'>;
    _web?: Omit<EAButtonProps, '_ios' | '_android' | '_web'>;
    _icon?: Partial<IconProps<any>>;
    _iconRight?: Partial<IconProps<any>>;
    icon?: React.ReactElement<IconProps<any>>;
    iconRight?: React.ReactElement<IconProps<any>>;
    _pressed?: Omit<EAButtonProps, '_ios' | '_android' | '_web' | '_pressed'>;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    /** Cargando (controlado): spinner y no se puede pulsar. También con ref.startLoading() o si onPress devuelve una promesa */
    isLoading?: boolean;
    /** Texto mientras carga (sin él, el spinner sale en el centro y el botón no cambia de tamaño) */
    loadingText?: string;
    /** Dónde va el spinner con loadingText. Por defecto 'start' */
    spinnerPlacement?: 'start' | 'end';
    /** Si onPress devuelve una promesa, spinner hasta que termine. Por defecto true */
    loadingOnPress?: boolean;
    /** Interruptor: cada pulsación alterna `active` (y se aplica _active) */
    toggle?: boolean;
    /** Activo (controlado; con onActiveChange) */
    active?: boolean;
    defaultActive?: boolean;
    onActiveChange?: (active: boolean) => void;
    /** Lo que cambia cuando está activo (children, icon, variant, colorScheme, estilos…) */
    _active?: Partial<EAButtonProps>;
    /** Lo que muestra un momento después de pulsar (o de terminar la promesa de onPress): p. ej. "¡Copiado!" */
    feedback?: Partial<EAButtonProps>;
    /** Cuánto dura el feedback (ms). Por defecto 1500 */
    feedbackDuration?: number;
    /** Animación del contenido al cambiar (activo, feedback, cargando). Por defecto 'zoom' */
    changeAnimation?: ButtonChangeAnimation;
};
export type ButtonRef = {
    startLoading: () => void;
    stopLoading: () => void;
    setLoading: (loading: boolean) => void;
    isLoading: () => boolean;
    /** Muestra el feedback (el de la prop, o el que se pase) */
    showFeedback: (feedback?: Partial<EAButtonProps>, duration?: number) => void;
    setActive: (active: boolean) => void;
    isActive: () => boolean;
};
export declare const Button: React.ForwardRefExoticComponent<Omit<EAPressableProps, "_ios" | "_android" | "_web" | "variant" | "_pressed"> & {
    variant?: VARIANT_BUTTON | (string & {});
    colorScheme?: COLOR_SCHEME;
    _ios?: Omit<EAButtonProps, "_ios" | "_android" | "_web">;
    _android?: Omit<EAButtonProps, "_ios" | "_android" | "_web">;
    _web?: Omit<EAButtonProps, "_ios" | "_android" | "_web">;
    _icon?: Partial<IconProps<any>>;
    _iconRight?: Partial<IconProps<any>>;
    icon?: React.ReactElement<IconProps<any>>;
    iconRight?: React.ReactElement<IconProps<any>>;
    _pressed?: Omit<EAButtonProps, "_ios" | "_android" | "_web" | "_pressed">;
    size?: "sm" | "md" | "lg" | "xl";
    /** Cargando (controlado): spinner y no se puede pulsar. También con ref.startLoading() o si onPress devuelve una promesa */
    isLoading?: boolean;
    /** Texto mientras carga (sin él, el spinner sale en el centro y el botón no cambia de tamaño) */
    loadingText?: string;
    /** Dónde va el spinner con loadingText. Por defecto 'start' */
    spinnerPlacement?: "start" | "end";
    /** Si onPress devuelve una promesa, spinner hasta que termine. Por defecto true */
    loadingOnPress?: boolean;
    /** Interruptor: cada pulsación alterna `active` (y se aplica _active) */
    toggle?: boolean;
    /** Activo (controlado; con onActiveChange) */
    active?: boolean;
    defaultActive?: boolean;
    onActiveChange?: (active: boolean) => void;
    /** Lo que cambia cuando está activo (children, icon, variant, colorScheme, estilos…) */
    _active?: Partial<EAButtonProps>;
    /** Lo que muestra un momento después de pulsar (o de terminar la promesa de onPress): p. ej. "¡Copiado!" */
    feedback?: Partial<EAButtonProps>;
    /** Cuánto dura el feedback (ms). Por defecto 1500 */
    feedbackDuration?: number;
    /** Animación del contenido al cambiar (activo, feedback, cargando). Por defecto 'zoom' */
    changeAnimation?: ButtonChangeAnimation;
} & React.RefAttributes<ButtonRef>>;
export type HoldButtonProps = Omit<EAButtonProps, 'onPress'> & {
    /** Al llenarse la barra. Si devuelve una promesa, spinner hasta que termine */
    onComplete: () => any;
    /** Cuánto hay que mantenerlo (ms). Por defecto 1500 */
    holdDuration?: number;
    /** Color del relleno. Por defecto un blanco translúcido (solid) o el tono suave del color */
    fillColor?: string;
    onHoldStart?: () => void;
    /** Se soltó antes de terminar */
    onHoldCancel?: () => void;
    /** Al completar, la barra se queda llena (hasta ref.reset()). Por defecto se vacía */
    keepFilled?: boolean;
};
export type HoldButtonRef = ButtonRef & {
    reset: () => void;
};
/**
 * Botón que hay que mantener pulsado: se va llenando una barra y al completarse llama a onComplete.
 * Si se suelta antes, la barra vuelve atrás
 * @example <HoldButton colorScheme="danger" onComplete={borrar}>Mantén para borrar</HoldButton>
 */
export declare const HoldButton: React.ForwardRefExoticComponent<Omit<EAButtonProps, "onPress"> & {
    /** Al llenarse la barra. Si devuelve una promesa, spinner hasta que termine */
    onComplete: () => any;
    /** Cuánto hay que mantenerlo (ms). Por defecto 1500 */
    holdDuration?: number;
    /** Color del relleno. Por defecto un blanco translúcido (solid) o el tono suave del color */
    fillColor?: string;
    onHoldStart?: () => void;
    /** Se soltó antes de terminar */
    onHoldCancel?: () => void;
    /** Al completar, la barra se queda llena (hasta ref.reset()). Por defecto se vacía */
    keepFilled?: boolean;
} & React.RefAttributes<HoldButtonRef>>;
export type SlideButtonProps = Omit<EABoxProps, 'children'> & {
    /** Al llegar al final. Si devuelve una promesa: spinner en el botón; si falla, vuelve al principio */
    onComplete: () => any;
    /** Texto del carril. Por defecto "Desliza para confirmar" */
    text?: string;
    /** Texto al terminar */
    completedText?: string;
    colorScheme?: COLOR_SCHEME;
    /** Alto (px). Por defecto 56 */
    height?: number;
    /** Icono del botón que se arrastra (por defecto una flecha) y al terminar (un check) */
    icon?: React.ReactElement;
    completedIcon?: React.ReactElement;
    /** Qué parte hay que recorrer para que cuente (0-1). Por defecto 0.85 */
    threshold?: number;
    /** Vuelve solo al principio a los X ms de terminar. Por defecto se queda hecho (ref.reset()) */
    resetAfter?: number;
    disabled?: boolean;
    variant?: (string & {});
    _track?: EABoxProps;
    _knob?: EABoxProps;
    _text?: EATextProps;
    /** La parte ya recorrida (detrás del botón) */
    _fill?: EABoxProps;
    /** El carril y el texto al terminar */
    _completedFill?: EABoxProps;
    _completedText?: EATextProps;
};
export type SlideButtonRef = {
    reset: () => void;
    complete: () => void;
    isCompleted: () => boolean;
};
/**
 * Deslizar para confirmar: se arrastra el botón hasta el final del carril
 * @example <SlideButton text="Desliza para confirmar el pedido" onComplete={confirmar} />
 */
export declare const SlideButton: React.ForwardRefExoticComponent<Omit<EABoxProps, "children"> & {
    /** Al llegar al final. Si devuelve una promesa: spinner en el botón; si falla, vuelve al principio */
    onComplete: () => any;
    /** Texto del carril. Por defecto "Desliza para confirmar" */
    text?: string;
    /** Texto al terminar */
    completedText?: string;
    colorScheme?: COLOR_SCHEME;
    /** Alto (px). Por defecto 56 */
    height?: number;
    /** Icono del botón que se arrastra (por defecto una flecha) y al terminar (un check) */
    icon?: React.ReactElement;
    completedIcon?: React.ReactElement;
    /** Qué parte hay que recorrer para que cuente (0-1). Por defecto 0.85 */
    threshold?: number;
    /** Vuelve solo al principio a los X ms de terminar. Por defecto se queda hecho (ref.reset()) */
    resetAfter?: number;
    disabled?: boolean;
    variant?: (string & {});
    _track?: EABoxProps;
    _knob?: EABoxProps;
    _text?: EATextProps;
    /** La parte ya recorrida (detrás del botón) */
    _fill?: EABoxProps;
    /** El carril y el texto al terminar */
    _completedFill?: EABoxProps;
    _completedText?: EATextProps;
} & React.RefAttributes<SlideButtonRef>>;
