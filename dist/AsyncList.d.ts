import React from "react";
import { EABoxProps } from "./Box";
import { EAFlatListProps } from "./FlatList";
import { EATextProps } from "./Text";
export type ListStatus = 'idle' | 'loading' | 'refreshing' | 'loadingMore' | 'success' | 'error';
/** Lo que recibe fetch */
export type ListFetchArgs<P> = {
    page: number;
    pageSize: number;
    params: P;
    /** Se aborta si llega otra petición antes (fetch(url, { signal })) */
    signal: AbortSignal;
    /** Por qué se pide: primera carga, refresco o siguiente página */
    reason: 'load' | 'refresh' | 'more';
};
/** Lo que devuelve fetch: la página (si trae pageSize elementos, se entiende que hay más) o { data, hasMore, total } */
export type ListFetchResult<T> = T[] | {
    data: T[];
    hasMore?: boolean;
    total?: number;
};
export type ListState<T, P> = {
    data: T[];
    /** Última página cargada (0 = ninguna) */
    page: number;
    hasMore: boolean;
    /** Total que dio la API (si lo da) */
    total: number | null;
    status: ListStatus;
    error: unknown;
    params: P;
    /** Los datos son de la caché (cacheKey) y todavía no han llegado los nuevos */
    fromCache: boolean;
};
export type ListStoreOptions<T, P> = {
    fetch: (args: ListFetchArgs<P>) => Promise<ListFetchResult<T>>;
    /** Por defecto 20 */
    pageSize?: number;
    /** Parámetros iniciales (filtros, orden...) */
    params?: P;
    /** El campo que hace de clave de cada elemento (para la lista, updateItem y removeItem). Por defecto id o key */
    keyField?: keyof T;
    /** La clave de cada elemento a tu manera (manda sobre keyField) */
    keyExtractor?: (item: T, index: number) => string;
    /**
     * Al añadir una página, los elementos que ya estaban (misma clave) no se repiten. Pasa cuando entran datos
     * nuevos mientras se pagina y la API "corre" la página. Por defecto true
     */
    dedupe?: boolean;
    /** Número de la primera página. Por defecto 1 */
    firstPage?: number;
    /** Guarda la primera página con esta clave y la muestra al abrir mientras llega la nueva */
    cacheKey?: string;
    /**
     * Dónde se guarda: 'memory' (por defecto): mientras la app está abierta (al volver a la pantalla se ve al
     * momento). 'storage': en AsyncStorage (también al volver a abrir la app)
     */
    cacheStorage?: 'memory' | 'storage';
};
/**
 * El estado de una lista paginada: datos, página, si hay más, estado y parámetros. Se escucha con store.use(),
 * store.listener() o conectándolo a <AsyncList store={...} />
 * @example
 * const pedidos = new ListStore({
 *   fetch: async ({ page, pageSize, params, signal }) => {
 *     const r = await fetch(`/api/pedidos?page=${page}&q=${params.q ?? ''}`, { signal }).then(r => r.json());
 *     return { data: r.items, total: r.total };
 *   },
 * });
 */
export declare class ListStore<T = any, P extends Record<string, any> = Record<string, any>> {
    options: ListStoreOptions<T, P>;
    private state;
    private listeners;
    private controller;
    private requestId;
    private lastFailed;
    constructor(options: ListStoreOptions<T, P>);
    /** Borra la caché de esta lista (memoria o AsyncStorage) */
    clearCache: () => Promise<void>;
    getState: () => ListState<T, P>;
    subscribe: (listener: () => void) => () => void;
    get data(): T[];
    get status(): ListStatus;
    get params(): P;
    get busy(): boolean;
    private set;
    /**
     * Hook: el estado (o una parte) y re-render cuando cambia. Con selector solo cuando cambia lo seleccionado
     * (que devuelva un valor simple o una parte del estado, no un objeto nuevo en cada llamada)
     * @example const total = pedidos.use(s => s.total);
     */
    use<R = ListState<T, P>>(selector?: (state: ListState<T, P>) => R): R;
    /** Pinta lo que devuelva render y se actualiza solo (como form.listener) */
    listener(render: (state: ListState<T, P>, store: this) => React.ReactNode): React.ReactElement;
    /** Primera página (si ya hay datos, se quedan hasta que llegan los nuevos) */
    load: () => Promise<void>;
    /** Vuelve a pedir la primera página (tirar para refrescar) */
    refresh: () => Promise<void>;
    /** Siguiente página (si hay más y no hay otra petición en curso) */
    loadMore: () => Promise<void>;
    /** Repite lo que falló */
    retry: () => Promise<void>;
    /**
     * Cambia los parámetros (filtros) y vuelve a cargar desde la primera página. Se mezclan con los que hay (con
     * { replace: true } se sustituyen); los que lleguen como undefined, null o '' se quitan
     */
    setParams: (params: Partial<P> | ((prev: P) => P), options?: {
        replace?: boolean;
    }) => Promise<void>;
    /**
     * Vacía la lista y cancela lo que se estuviera pidiendo. Los params se quedan como estén; con
     * { params: 'initial' } vuelven a los del principio, o se pasan unos nuevos
     */
    reset: (options?: {
        params?: P | "initial";
    }) => void;
    private abort;
    private request;
    private writeCache;
    private readCache;
    keyOf: (item: T, index: number) => string;
    /** Cambia los datos a mano: un array o una función sobre los actuales */
    setData: (data: T[] | ((prev: T[]) => T[])) => void;
    /** Añade elementos al principio (o al final con { end: true }) */
    addItems: (items: T | T[], options?: {
        end?: boolean;
    }) => void;
    /** Cambia un elemento por su clave: con un objeto (se mezcla) o una función */
    updateItem: (key: string, patch: Partial<T> | ((item: T) => T)) => void;
    /** Quita un elemento por su clave */
    removeItem: (key: string) => void;
}
/**
 * Crea el store una sola vez (en un componente). fetch y las demás opciones se leen siempre de la última versión,
 * así que pueden usar variables del componente
 * @example const pedidos = useListStore({ fetch: ({ page, params }) => api.pedidos(page, params) });
 */
export declare const useListStore: <T, P extends Record<string, any> = Record<string, any>>(options: ListStoreOptions<T, P>) => ListStore<T, P>;
export type AsyncListProps<T> = Omit<EAFlatListProps<T>, 'data' | 'refreshing' | 'onRefresh' | 'onEndReached'> & {
    store: ListStore<T, any>;
    /** Carga la primera página al montarse si todavía no se ha cargado. Por defecto true */
    autoLoad?: boolean;
    /**
     * Al desmontarse (se cierra el modal, se vuelve atrás...) el store vuelve al principio: sin datos, con los
     * params iniciales y cancelando lo que se estuviera pidiendo (la caché, si la hay, se queda)
     */
    resetOnUnmount?: boolean;
    /** Tirar para refrescar. Por defecto true */
    refreshable?: boolean;
    /** Rejilla: tantas columnas como quepan de este ancho mínimo (se recalcula al girar o cambiar de tamaño) */
    itemMinWidth?: number;
    /** Filtro local sobre los datos cargados (sin pedir a la API) */
    filterItems?: (item: T) => boolean;
    /**
     * Alto fijo de cada elemento (o de cada fila, en rejilla), con su separación. Si todos miden lo mismo, la lista
     * sabe dónde está cada uno sin medirlos: scroll más fluido y saltos al instante (scrollToIndex)
     */
    itemHeight?: number;
    /** Primera carga con elementos de carga (Skeleton) en lugar del spinner: true (6) o cuántos */
    skeleton?: boolean | number;
    /** Cómo es cada elemento de carga (por defecto dos líneas grises) */
    renderSkeleton?: (index: number) => React.ReactNode;
    /** Sin resultados: texto o contenido propio */
    emptyText?: string;
    emptyComponent?: React.ReactNode;
    /** Primera carga: contenido propio (por defecto un Spinner y "Cargando…") */
    loadingComponent?: React.ReactNode;
    /** Error: contenido propio (recibe retry) */
    errorComponent?: React.ReactNode | ((retry: () => void, error: unknown) => React.ReactNode);
    /** Al final, cuando ya no hay más (por defecto nada) */
    endComponent?: React.ReactNode;
    /** Color del Spinner, el refresco y el botón de reintentar. Por defecto primary */
    colorScheme?: string;
    _empty?: EABoxProps;
    _emptyText?: EATextProps;
    _loading?: EABoxProps;
    _error?: EABoxProps;
    variant?: (string & {});
};
/**
 * FlatList conectada a un ListStore: carga al montarse, scroll infinito, tirar para refrescar, vacío, error
 * con reintentar y rejilla automática (itemMinWidth)
 * @example <AsyncList store={pedidos} renderItem={({ item }) => <PedidoCard pedido={item} />} />
 */
export declare const AsyncList: <T>(props: AsyncListProps<T>) => React.ReactElement;
