import React from "react";
import { EABoxProps } from './Box';
import { EATextInputProps } from "./Input";
import { EAButtonProps } from "./Button";
import { EAMenuProps } from "./Menu";
import { EASpinnerProps } from "./Spinner";
import { EATextProps } from "./Text";
export type SearchInputModel<T = any> = EAMenuProps<T> & {
    value: T[] | T | null;
    multiple?: boolean;
    children?: React.ReactNode;
    _item?: EAButtonProps & {
        label: keyof T;
        value: keyof T;
    };
    onChange?: (value: T[] | T | null) => any;
    _input?: EATextInputProps;
    /**
     * Cómo se muestra la lista de opciones:
     * - menu (por defecto): en un Menu flotante por encima de la app (sin backdrop; actívalo con backdrop)
     * - absolute: en una lista en position absolute bajo el input, dentro de la pantalla (se mueve con el scroll).
     *   Al estar en el layout normal, un padre con overflow hidden la recorta y hermanos posteriores de otro
     *   contenedor pueden taparla
     */
    listType?: 'menu' | 'absolute';
    /** Estilo de la lista en modo absolute */
    _list?: EABoxProps;
    /** Alto máximo de la lista en modo absolute (por defecto 220) */
    maxListHeight?: number;
    /**
     * Cómo se filtran las opciones con el texto escrito. Por defecto: el label contiene el texto, sin
     * distinguir mayúsculas ni acentos ("malaga" encuentra "Málaga"). false: no filtra (datos remotos)
     */
    filter?: ((item: T, text: string) => boolean) | false;
    /** Texto (o contenido) cuando lo escrito no tiene resultados. null lo desactiva. Por defecto "Sin resultados" */
    emptyText?: React.ReactNode;
    /**
     * Búsqueda remota: se llama con el texto escrito tras `debounce` ms sin escribir. Con onSearch el filtro
     * local se desactiva por defecto (el servidor decide qué coincide); actualiza `data` con lo que devuelva
     */
    onSearch?: (text: string) => void;
    /** Espera en ms tras dejar de escribir antes de llamar a onSearch (por defecto 300) */
    debounce?: number;
    /** Muestra un indicador de carga en la lista (p. ej. mientras llega la respuesta de onSearch) */
    loading?: boolean;
    /** Botón (×) para borrar el texto (y el valor en modo simple) */
    clearable?: boolean;
    /** Múltiple: máximo de elementos elegidos; al llegar, la lista ya no se muestra */
    maxSelected?: number;
    /** Estilo del texto "Sin resultados" (cuando emptyText es un texto) */
    _emptyText?: EATextProps;
    /** Estilo del indicador de carga; _container es la fila que lo contiene */
    _loading?: EASpinnerProps & {
        _container?: EABoxProps;
    };
    /** Props del botón (×) de clearable (p. ej. icon para cambiar el icono, colorScheme, p...) */
    _clearable?: EAButtonProps;
    /** Múltiple: contenedor de las etiquetas de los elegidos */
    _tags?: EABoxProps;
    /** Múltiple: cada etiqueta (_text para su texto) */
    _tag?: EABoxProps;
    /** Múltiple: botón (×) para quitar cada etiqueta */
    _tagRemove?: EAButtonProps;
};
export type EASearchInputItem = EAButtonProps & {
    label: string | number;
    value: string | number;
};
export declare const SearchInput: {
    <T>(rawProps: SearchInputModel<T>): React.JSX.Element;
    Item: React.FC<EASearchInputItem>;
};
