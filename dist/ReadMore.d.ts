import React from "react";
import { EATextProps } from "./Text";
/**
 * Texto recortado a unas líneas con "Leer más" / "Leer menos". El enlace solo sale si el texto no cabe.
 * Las props de texto (fontSize, color, variant…) van al texto.
 * @example <ReadMore numberOfLines={3}>{producto.descripcion}</ReadMore>
 */
export type EAReadMoreProps = Omit<EATextProps, 'numberOfLines' | '_ios' | '_android' | '_web'> & {
    /** Líneas visibles recortado. Por defecto 3 */
    numberOfLines?: number;
    /** Empieza desplegado */
    defaultExpanded?: boolean;
    /** Desplegado (controlado; con onToggle) */
    expanded?: boolean;
    onToggle?: (expanded: boolean) => void;
    /** Texto del enlace para desplegar (por defecto "Leer más" en el idioma actual) */
    readMoreText?: string;
    /** Texto del enlace para recoger (por defecto "Leer menos") */
    readLessText?: string;
    /** false: una vez desplegado no se puede recoger. Por defecto true */
    showLess?: boolean;
    /** Estilo del enlace */
    _readMore?: EATextProps;
    _ios?: Omit<EAReadMoreProps, '_ios' | '_android' | '_web'>;
    _android?: Omit<EAReadMoreProps, '_ios' | '_android' | '_web'>;
    _web?: Omit<EAReadMoreProps, '_ios' | '_android' | '_web'>;
};
export declare const ReadMore: React.FC<EAReadMoreProps>;
