import React from "react";
import { EAPressableProps } from "./Pressable";
import { IconProps } from "./Icon";
import { EABoxProps } from "./Box";
import { EATextProps } from "./Text";
import { EATextInputProps } from "./Input";
export type SelectValue = string | number;
/** Una opción: con `options` o con <Select.Item> */
export type SelectOption = {
    label: string | number;
    value: SelectValue;
    /** Texto pequeño debajo del label */
    description?: string;
    /** Icono o elemento a la izquierda */
    icon?: React.ReactElement<any>;
    disabled?: boolean;
    /** Las opciones con el mismo group se agrupan bajo ese título (en el orden en que aparecen) */
    group?: string;
};
export type EASelectProps = Omit<EAPressableProps, 'onChange' | 'children'> & {
    placeholder?: string;
    /** Valor elegido (controlado). Con multiple, un array */
    value?: SelectValue | SelectValue[] | null;
    /** Valor inicial (sin controlar); si cambia, también se aplica */
    defaultValue?: SelectValue | SelectValue[] | null;
    /** El valor (con multiple, el array) y la opción u opciones elegidas. Con clearable, null al borrar */
    onChange?: (value: any, option?: SelectOption | SelectOption[]) => void;
    /** Las opciones como array (en vez de <Select.Item>) */
    options?: SelectOption[];
    /** Elegir varias: el panel no se cierra al tocar y tiene botón de listo */
    multiple?: boolean;
    /** Con multiple: cuántas como máximo (las demás se deshabilitan al llegar) */
    maxSelected?: number;
    /** Buscador encima de la lista (sin acentos ni mayúsculas, en el label y la descripción) */
    searchable?: boolean;
    searchPlaceholder?: string;
    /** Texto cuando la búsqueda no encuentra nada */
    emptyText?: string;
    /** Botón × para borrar lo elegido */
    clearable?: boolean;
    /** Título del panel. Por defecto el label; false para quitarlo */
    title?: string | false;
    /** Borde de error (danger) */
    isInvalid?: boolean;
    /** Cerrar al elegir. Por defecto true (con multiple, false) */
    closeOnSelect?: boolean;
    /** Lo que se muestra en el campo. Por defecto el label (con multiple, los labels separados por comas) */
    renderValue?: (selected: SelectOption[]) => React.ReactNode;
    onOpen?: () => void;
    onClose?: () => void;
    /** El panel (contenido del modal) */
    _menu?: Partial<EABoxProps>;
    _option?: Partial<EAPressableProps>;
    _selected?: Partial<EAPressableProps>;
    /** El título de cada grupo */
    _group?: Partial<EATextProps>;
    _search?: Partial<EATextInputProps>;
    /** El check de las opciones elegidas (false para quitarlo) */
    _check?: Partial<IconProps<any>> | false;
    _icon?: Partial<IconProps<any>>;
    icon?: boolean | React.ReactElement<any>;
    children?: React.ReactNode;
    label?: string;
    _label?: EATextProps;
    isFloat?: boolean;
    isRequired?: boolean;
    _containerStyle?: EABoxProps;
    variant?: (string & {});
    size?: 'sm' | 'md' | 'lg' | 'xl';
};
export type EASelectItemProps = EAPressableProps & Omit<SelectOption, 'disabled'>;
export type SelectRef = {
    open: () => void;
    close: () => void;
    /** Borra lo elegido (llama a onChange con null, o [] con multiple) */
    clear: () => void;
    isOpen: () => boolean;
};
export declare const Select: React.ForwardRefExoticComponent<EASelectProps & React.RefAttributes<SelectRef>> & {
    Item: React.FC<EASelectItemProps>;
};
