import React from "react";
import { EATextProps } from "./Text";
import { EAPressableProps } from "./Pressable";
import { EABoxProps } from "./Box";
import { ThemeColor } from "./theme";
/**
 * Contenido recortado con "Leer más" / "Leer menos". El enlace solo sale si el contenido no cabe.
 * - Un texto se recorta a `numberOfLines` líneas; cualquier otro contenido (o con `maxHeight`) a esa altura.
 * - Las props de texto (fontSize, color, variant…) van al texto.
 * @example
 * <ReadMore numberOfLines={3}>{producto.descripcion}</ReadMore>
 * <ReadMore numberOfLines={4} triggerPlacement="inline">{comentario}</ReadMore>
 * <ReadMore maxHeight={160} fade triggerPlacement="overlay" triggerAlign="center"><Articulo /></ReadMore>
 */
export type EAReadMoreProps = Omit<EATextProps, 'numberOfLines' | 'children' | '_ios' | '_android' | '_web'> & {
    children?: React.ReactNode;
    /** Líneas visibles recortado (si children es un texto). Por defecto 3 */
    numberOfLines?: number;
    /** Altura recortada en px (para cualquier contenido; con un texto, se usa en vez de numberOfLines) */
    maxHeight?: number;
    /** Degradado al final del contenido recortado (en vez de los "…") */
    fade?: boolean;
    /** Color del degradado: el del fondo donde está (p. ej. 'surface' dentro de una tarjeta). Por defecto 'background' */
    fadeColor?: ThemeColor;
    /**
     * Dónde va el enlace: 'below' (debajo, por defecto), 'inline' (al final de la última línea: "… Leer más"; solo con
     * texto) u 'overlay' (botón flotante sobre el final del contenido recortado; mejor con fade)
     */
    triggerPlacement?: 'below' | 'inline' | 'overlay';
    /** Alineación del enlace debajo o flotante. Por defecto 'left' ('center' con overlay) */
    triggerAlign?: 'left' | 'center' | 'right';
    /** Chevron junto al texto del enlace (no en inline). Por defecto true */
    showIcon?: boolean;
    /** Texto del enlace para desplegar (por defecto "Leer más" en el idioma actual) */
    readMoreText?: React.ReactNode;
    /** Texto del enlace para recoger (por defecto "Leer menos") */
    readLessText?: React.ReactNode;
    /** Lo que se ve recogido en vez del contenido recortado (p. ej. un resumen) */
    collapsed?: React.ReactNode;
    /** Enlace propio: recibe si está desplegado y cómo alternarlo */
    renderTrigger?: (state: {
        expanded: boolean;
        toggle: () => void;
    }) => React.ReactNode;
    /** false: una vez desplegado no se puede recoger. Por defecto true */
    showLess?: boolean;
    /** Empieza desplegado */
    defaultExpanded?: boolean;
    /** Desplegado (controlado; con onToggle) */
    expanded?: boolean;
    onToggle?: (expanded: boolean) => void;
    /** Anima la altura al desplegar y recoger. Por defecto true */
    animated?: boolean;
    /** Duración de la animación en ms. Por defecto 250 */
    duration?: number;
    /** Estilo del texto del enlace */
    _readMore?: EATextProps;
    /** Estilo del botón del enlace (Pressable) */
    _trigger?: EAPressableProps;
    /** Estilo del contenedor de todo */
    _container?: EABoxProps;
    _ios?: Omit<EAReadMoreProps, '_ios' | '_android' | '_web'>;
    _android?: Omit<EAReadMoreProps, '_ios' | '_android' | '_web'>;
    _web?: Omit<EAReadMoreProps, '_ios' | '_android' | '_web'>;
};
export declare const ReadMore: React.FC<EAReadMoreProps>;
