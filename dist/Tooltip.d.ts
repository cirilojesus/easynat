import React from "react";
import { ViewProps } from "react-native";
import { EADefaultProps } from "./utils/DEFAULT_PROPS";
import { EATextProps } from "./Text";
export type TooltipRef = {
    open: () => void;
    close: () => void;
    toggle: () => void;
    isOpen: () => boolean;
};
/** Lo que recibe `children` si es una función (para abrirlo desde tu propio botón) */
export type TooltipTriggerProps = {
    /** Alterna abrir / cerrar */
    onPress: () => void;
    /** Abre (para onLongPress) */
    onLongPress: () => void;
    open: () => void;
    close: () => void;
    isOpen: boolean;
};
/**
 * Props del Tooltip. Las props de estilo (bg, p, rounded, maxW…) van a la burbuja.
 * @example
 * <Tooltip label="Se guarda solo cada 5 minutos"><Icon name="info" /></Tooltip>
 * <Tooltip label="Copiar" openOn="longPress">{t => <Button {...t} onPress={copiar}>Copiar</Button>}</Tooltip>
 */
export type EATooltipProps = ViewProps & EADefaultProps & {
    /** Texto (o contenido) de la burbuja */
    label: React.ReactNode;
    /** Lo que abre el tooltip. Un elemento se envuelve en un Pressable; con una función, la conectas tú (TooltipTriggerProps) */
    children: React.ReactNode | ((props: TooltipTriggerProps) => React.ReactNode);
    /** Lado preferido; si no cabe y en el otro hay más sitio, se coloca en el otro. Por defecto 'top' */
    placement?: 'top' | 'bottom';
    /** Cómo se abre con un elemento como children: 'press' (tocar, por defecto) o 'longPress' (mantener pulsado) */
    openOn?: 'press' | 'longPress';
    /** Se cierra solo tras estos ms (0: no se cierra solo). Por defecto 3000 */
    duration?: number;
    /** Abierto (controlado; con onOpenChange) */
    isOpen?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    /** Flecha que apunta al trigger. Por defecto true */
    hasArrow?: boolean;
    /** No se abre */
    disabled?: boolean;
    /** Estilo del texto de la burbuja (si label es un texto) */
    _text?: EATextProps;
    /** Estilo del contenedor del trigger */
    _trigger?: EADefaultProps & ViewProps;
    _ios?: Omit<EATooltipProps, '_ios' | '_android' | '_web'>;
    _android?: Omit<EATooltipProps, '_ios' | '_android' | '_web'>;
    _web?: Omit<EATooltipProps, '_ios' | '_android' | '_web'>;
    variant?: (string & {});
};
/**
 * Burbuja con un texto corto junto a un elemento (un icono de información, un botón con solo icono…). Se abre al
 * tocarlo (o al mantenerlo pulsado con openOn="longPress"), se cierra sola tras `duration`, al tocar en cualquier
 * sitio o con el botón atrás. Se pinta en un Portal, encima de todo, sin salirse de la pantalla
 */
export declare const Tooltip: React.ForwardRefExoticComponent<ViewProps & import("react-native").FlexStyle & {
    p?: import("react-native").DimensionValue;
    m?: import("react-native").DimensionValue;
    px?: import("react-native").DimensionValue;
    py?: import("react-native").DimensionValue;
    pt?: import("react-native").DimensionValue;
    pb?: import("react-native").DimensionValue;
    pl?: import("react-native").DimensionValue;
    pr?: import("react-native").DimensionValue;
    mx?: import("react-native").DimensionValue;
    my?: import("react-native").DimensionValue;
    mt?: import("react-native").DimensionValue;
    mb?: import("react-native").DimensionValue;
    ml?: import("react-native").DimensionValue;
    mr?: import("react-native").DimensionValue;
    bg?: import("./theme").ThemeColor;
    rounded?: import("react-native").DimensionValue;
    roundedTop?: import("react-native").DimensionValue;
    roundedBottom?: import("react-native").DimensionValue;
    roundedLeft?: import("react-native").DimensionValue;
    roundedRight?: import("react-native").DimensionValue;
    roundedX?: import("react-native").DimensionValue;
    roundedY?: import("react-native").DimensionValue;
    borderWidth?: number;
    borderColor?: import("./theme").ThemeColor;
    borderTopWidth?: number;
    borderBottomWidth?: number;
    borderLeftWidth?: number;
    borderRightWidth?: number;
    borderTopColor?: import("./theme").ThemeColor;
    borderBottomColor?: import("./theme").ThemeColor;
    borderLeftColor?: import("./theme").ThemeColor;
    borderRightColor?: import("./theme").ThemeColor;
    borderXWidth?: number;
    borderYWidth?: number;
    borderXColor?: import("./theme").ThemeColor;
    borderYColor?: import("./theme").ThemeColor;
    shadow?: import("./theme").ThemeShadow;
    flexDir?: "row" | "column" | "row-reverse" | "column-reverse";
    opacity?: number;
    pointerEvents?: "box-none" | "none" | "box-only" | "auto";
    w?: import("react-native").DimensionValue;
    h?: import("react-native").DimensionValue;
    maxW?: import("react-native").DimensionValue;
    maxH?: import("react-native").DimensionValue;
    minW?: import("react-native").DimensionValue;
    minH?: import("react-native").DimensionValue;
} & {
    /** Texto (o contenido) de la burbuja */
    label: React.ReactNode;
    /** Lo que abre el tooltip. Un elemento se envuelve en un Pressable; con una función, la conectas tú (TooltipTriggerProps) */
    children: React.ReactNode | ((props: TooltipTriggerProps) => React.ReactNode);
    /** Lado preferido; si no cabe y en el otro hay más sitio, se coloca en el otro. Por defecto 'top' */
    placement?: "top" | "bottom";
    /** Cómo se abre con un elemento como children: 'press' (tocar, por defecto) o 'longPress' (mantener pulsado) */
    openOn?: "press" | "longPress";
    /** Se cierra solo tras estos ms (0: no se cierra solo). Por defecto 3000 */
    duration?: number;
    /** Abierto (controlado; con onOpenChange) */
    isOpen?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    /** Flecha que apunta al trigger. Por defecto true */
    hasArrow?: boolean;
    /** No se abre */
    disabled?: boolean;
    /** Estilo del texto de la burbuja (si label es un texto) */
    _text?: EATextProps;
    /** Estilo del contenedor del trigger */
    _trigger?: EADefaultProps & ViewProps;
    _ios?: Omit<EATooltipProps, "_ios" | "_android" | "_web">;
    _android?: Omit<EATooltipProps, "_ios" | "_android" | "_web">;
    _web?: Omit<EATooltipProps, "_ios" | "_android" | "_web">;
    variant?: (string & {});
} & React.RefAttributes<TooltipRef>>;
