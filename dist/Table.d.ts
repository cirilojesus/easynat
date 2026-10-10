import React from "react";
import type { ListStore } from "./AsyncList";
import { EABoxProps } from "./Box";
import { EATextProps } from "./Text";
export type TableAlign = 'left' | 'center' | 'right';
export type TableColumn<T> = {
    /** Identificador de la columna (y el campo de la fila, si no se pasa value) */
    key: string;
    title?: React.ReactNode;
    /** El valor de la celda: un campo de la fila o una función. Por defecto row[key] */
    value?: keyof T | ((row: T) => unknown);
    /** Ancho fijo en px */
    width?: number;
    /** Parte del ancho sobrante que se lleva (por defecto 1) */
    flex?: number;
    /** Ancho mínimo (si no caben, la tabla hace scroll horizontal). Por defecto el columnMinWidth de la tabla */
    minWidth?: number;
    align?: TableAlign;
    /** El valor como texto: (valor, fila, índice) => '12,50 €' */
    format?: (value: any, row: T, index: number) => string;
    /** La celda a tu manera (un badge, un botón, una imagen...) */
    render?: (row: T, index: number, value: any) => React.ReactNode;
    /** Se puede ordenar tocando su cabecera */
    sortable?: boolean;
    /** Con qué se ordena (por defecto el valor de la celda) */
    sortValue?: (row: T) => string | number | Date | null | undefined;
    /** La celda de la fila de totales: algo fijo o calculado con todas las filas */
    footer?: React.ReactNode | ((rows: T[]) => React.ReactNode);
    /** Máximo de líneas del texto de la celda (con …) */
    numberOfLines?: number;
    /**
     * La celda ocupa esta columna y las siguientes (las que tapa no se pintan en esa fila). Un número o según la
     * fila: colSpan: (row) => row.resumen ? 3 : 1
     */
    colSpan?: number | ((row: T, index: number) => number);
    /** La celda de totales de esta columna ocupa también las siguientes (p. ej. "Total" sobre 3 columnas) */
    footerColSpan?: number;
    _header?: EABoxProps;
    _headerText?: EATextProps;
    _cell?: EABoxProps;
    _text?: EATextProps;
};
/** Grupo de columnas: una cabecera encima de varias (p. ej. "Precio" sobre "Base" e "IVA") */
export type TableColumnGroup<T> = {
    title: React.ReactNode;
    children: TableColumn<T>[];
    align?: TableAlign;
    _header?: EABoxProps;
    _headerText?: EATextProps;
};
export type TableSort = {
    key: string;
    direction: 'asc' | 'desc';
} | null;
export type TableProps<T> = Omit<EABoxProps, 'children'> & {
    /** Las filas (o store) */
    data?: T[];
    /**
     * Las filas de un ListStore (datos de una API): carga, más filas al llegar al final (con height) o con el botón
     * "Cargar más", y error con reintentar. Para ordenar en el servidor: manualSort + onSortChange → store.setParams
     */
    store?: ListStore<T, any>;
    /** Las columnas; un grupo ({ title, children }) pone una cabecera encima de varias */
    columns: (TableColumn<T> | TableColumnGroup<T>)[];
    /** El campo que hace de clave de cada fila. Por defecto id o key (o su posición) */
    keyField?: keyof T;
    /** La clave de cada fila a tu manera (manda sobre keyField) */
    keyExtractor?: (row: T, index: number) => string;
    /** Filas alternas con fondo */
    striped?: boolean;
    /** Bordes entre todas las celdas */
    bordered?: boolean;
    size?: 'sm' | 'md' | 'lg';
    /** Alto del cuerpo: la cabecera queda fija y las filas hacen scroll (con muchas filas, solo pinta las visibles) */
    height?: number;
    /** Ancho mínimo de las columnas sin minWidth. Por defecto 100 */
    columnMinWidth?: number;
    /** Estilo de cada fila según sus datos (p. ej. fondo para las filas de resumen o las vencidas) */
    rowStyle?: (row: T, index: number) => EABoxProps | undefined;
    onRowPress?: (row: T, index: number) => void;
    onRowLongPress?: (row: T, index: number) => void;
    /** Orden controlado (con onSortChange) */
    sort?: TableSort;
    defaultSort?: TableSort;
    onSortChange?: (sort: TableSort) => void;
    /** El orden lo hace el servidor: la tabla solo avisa con onSortChange (no reordena data) */
    manualSort?: boolean;
    /** Casillas para seleccionar filas ('single': solo una) */
    selectable?: boolean | 'single';
    selectedKeys?: string[];
    defaultSelectedKeys?: string[];
    onSelectionChange?: (keys: string[], rows: T[]) => void;
    /** Contenido que se despliega bajo la fila (con una flecha al principio) */
    renderExpanded?: (row: T, index: number) => React.ReactNode;
    expandedKeys?: string[];
    defaultExpandedKeys?: string[];
    onExpandedChange?: (keys: string[]) => void;
    /** Filas por página (con un paginador debajo). Sin él, todas */
    pageSize?: number;
    page?: number;
    defaultPage?: number;
    onPageChange?: (page: number) => void;
    /** Filas de carga (Skeleton) en lugar de los datos */
    loading?: boolean;
    /** Sin filas. Por defecto "Sin datos" / "No data" */
    emptyText?: string;
    /** Sin filas: contenido propio */
    emptyComponent?: React.ReactNode;
    /** Color de las casillas, el orden activo y el paginador. Por defecto primary */
    colorScheme?: string;
    _header?: EABoxProps;
    _headerText?: EATextProps;
    _row?: EABoxProps;
    _text?: EATextProps;
    _cell?: EABoxProps;
    _stripedRow?: EABoxProps;
    _selectedRow?: EABoxProps;
    _footer?: EABoxProps;
    _footerText?: EATextProps;
    _expanded?: EABoxProps;
    _pagination?: EABoxProps;
    _emptyText?: EATextProps;
    variant?: (string & {});
};
/**
 * Tabla de datos
 * @example
 * <Table
 *   data={pedidos}
 *   columns={[
 *     { key: 'cliente', title: 'Cliente', sortable: true },
 *     { key: 'total', title: 'Total', align: 'right', format: v => `${v} €`, footer: rows => sum(rows) },
 *   ]}
 *   striped pageSize={10} selectable onRowPress={p => abrir(p)}
 * />
 */
export declare const Table: <T>(props: TableProps<T>) => React.ReactElement;
