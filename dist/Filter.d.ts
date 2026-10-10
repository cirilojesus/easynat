import React from "react";
import type { ListStore } from "./AsyncList";
import { EABoxProps } from "./Box";
import { EAButtonProps } from "./Button";
import { EATextProps } from "./Text";
export type FilterOption = {
    label: string;
    value: string | number;
};
export type FilterFieldType = 'text' | 'select' | 'autocomplete' | 'date' | 'dateRange' | 'switch' | 'checkbox' | 'radio';
export type FilterField<R = any> = {
    /** Nombre del filtro (la clave en los valores) */
    name: string;
    /** Por defecto 'text' */
    type?: FilterFieldType;
    label?: string;
    placeholder?: string;
    /** Opciones de select, autocomplete y radio */
    options?: FilterOption[];
    defaultValue?: unknown;
    /** Ancho: 'full' (por defecto) o 'half' (dos por fila) */
    width?: 'full' | 'half';
    /** Cómo se muestra su valor en el chip de filtros activos */
    formatChip?: (value: any) => string;
    /** Props extra para el control (Input, Select, DatePicker...) */
    props?: Record<string, any>;
    /**
     * filterData (datos locales): en qué campos de la fila busca. Por defecto el de su mismo nombre; en los de
     * texto se pueden dar varios: searchIn: ['cliente', 'id']
     */
    searchIn?: (keyof R | string)[];
    /** filterData: cómo se compara a tu manera (fila, valor del filtro) => si pasa */
    match?: (row: R, value: any) => boolean;
    /** filterData en fechas: 'from' (>=, por defecto), 'to' (<=) o 'equal' */
    compare?: 'from' | 'to' | 'equal';
};
export type FilterValues = Record<string, any>;
export type FilterRef = {
    /** Vacía todos los filtros (y avisa) */
    clear: () => void;
    /** Avisa con lo que hay (mode="apply") */
    apply: () => void;
    /** Los valores limpios de ahora */
    getValues: () => FilterValues;
};
export type FilterProps = Omit<EABoxProps, 'children'> & {
    fields: FilterField[];
    /**
     * Con los filtros ya limpios (sin vacíos, null ni false): listos para la API. El segundo argumento son todos
     * los valores, también los vacíos
     */
    onChange?: (values: FilterValues, all: FilterValues) => void;
    /**
     * Escribe directamente en los params de un ListStore (y vuelve a cargar). Solo toca sus campos: puede haber
     * varios Filter sobre el mismo store (p. ej. la búsqueda en la pantalla y el resto en un modal)
     */
    store?: ListStore<any, any>;
    /** Valores controlados (con onChange). Con store, se toman de sus params */
    value?: FilterValues;
    /** 'live' (por defecto): avisa al cambiar. 'apply': avisa al pulsar "Aplicar" */
    mode?: 'live' | 'apply';
    /** Tras pulsar "Aplicar" (p. ej. para cerrar el modal) */
    onApply?: (values: FilterValues) => void;
    /** Espera tras dejar de escribir en los campos de texto (ms). Por defecto 400 */
    debounce?: number;
    /** Chips con los filtros activos debajo (también existe <FilterChips> para ponerlos en otra parte) */
    showChips?: boolean;
    /** Botón "Limpiar filtros". Por defecto true si hay más de un campo */
    showClear?: boolean;
    clearText?: string;
    applyText?: string;
    /** Props para todos los controles (size, variant, _containerStyle...) */
    _control?: Record<string, any>;
    _actions?: EABoxProps;
    _clear?: EAButtonProps;
    _apply?: EAButtonProps;
    _chip?: EABoxProps;
    _chipText?: EATextProps;
    variant?: (string & {});
};
/** Los filtros activos (sin vacíos) de estos campos, listos para la API */
export declare const cleanFilters: (fields: FilterField[], values: FilterValues) => FilterValues;
/** Cuántos filtros hay activos (para un "Filtros (2)" en tu botón) */
export declare const filterCount: (fields: FilterField[], values: FilterValues) => number;
/**
 * Filtra datos locales (p. ej. las filas de un Table) con los valores de un Filter y sus campos. Texto: contiene
 * (sin mayúsculas ni acentos, en searchIn); select / radio / autocomplete: igual (o está entre los elegidos);
 * switch / checkbox: verdadero; fecha: desde (compare 'to' para hasta); rango: entre. match lo cambia por campo
 * @example <Table data={filterData(productos, filtros, CAMPOS)} columns={...} />
 */
export declare function filterData<R>(rows: R[], values: FilterValues, fields: FilterField<R>[]): R[];
export type FilterChipsProps = Omit<EABoxProps, 'children'> & {
    fields: FilterField[];
    /** Los valores (los de un Filter controlado) o un ListStore (sus params) */
    value?: FilterValues;
    store?: ListStore<any, any>;
    /** Al quitar un chip: los valores sin ese filtro (con store se quita solo) */
    onChange?: (values: FilterValues) => void;
    /** Un chip más al final para quitar todos */
    showClearAll?: boolean;
    _chip?: EABoxProps;
    _chipText?: EATextProps;
};
/** Los filtros activos como chips (cada uno se quita con su ×). Va donde se quiera: p. ej. fuera del modal de filtros */
export declare const FilterChips: React.FC<FilterChipsProps>;
/**
 * Campos de filtro. Es solo el contenido: va directo en la pantalla, dentro de un Collapse o en un modal
 * @example
 * <Filter fields={[{ name: 'q', placeholder: 'Buscar…' }]} store={pedidos} />          // búsqueda en la pantalla
 * <Filter fields={FILTROS} store={pedidos} mode="apply" onApply={() => close()} />    // el resto, en un modal
 * <Filter fields={CAMPOS} onChange={setFiltros} />  +  <Table data={filterData(filas, filtros, CAMPOS)} />
 */
export declare const Filter: React.ForwardRefExoticComponent<Omit<EABoxProps, "children"> & {
    fields: FilterField[];
    /**
     * Con los filtros ya limpios (sin vacíos, null ni false): listos para la API. El segundo argumento son todos
     * los valores, también los vacíos
     */
    onChange?: (values: FilterValues, all: FilterValues) => void;
    /**
     * Escribe directamente en los params de un ListStore (y vuelve a cargar). Solo toca sus campos: puede haber
     * varios Filter sobre el mismo store (p. ej. la búsqueda en la pantalla y el resto en un modal)
     */
    store?: ListStore<any, any>;
    /** Valores controlados (con onChange). Con store, se toman de sus params */
    value?: FilterValues;
    /** 'live' (por defecto): avisa al cambiar. 'apply': avisa al pulsar "Aplicar" */
    mode?: "live" | "apply";
    /** Tras pulsar "Aplicar" (p. ej. para cerrar el modal) */
    onApply?: (values: FilterValues) => void;
    /** Espera tras dejar de escribir en los campos de texto (ms). Por defecto 400 */
    debounce?: number;
    /** Chips con los filtros activos debajo (también existe <FilterChips> para ponerlos en otra parte) */
    showChips?: boolean;
    /** Botón "Limpiar filtros". Por defecto true si hay más de un campo */
    showClear?: boolean;
    clearText?: string;
    applyText?: string;
    /** Props para todos los controles (size, variant, _containerStyle...) */
    _control?: Record<string, any>;
    _actions?: EABoxProps;
    _clear?: EAButtonProps;
    _apply?: EAButtonProps;
    _chip?: EABoxProps;
    _chipText?: EATextProps;
    variant?: (string & {});
} & React.RefAttributes<FilterRef>>;
