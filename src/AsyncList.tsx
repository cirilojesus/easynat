// AsyncList + ListStore: listas que se cargan por páginas desde una API. El store guarda los datos, la página, si
// hay más, el estado (cargando, refrescando, más, error) y los parámetros (filtros); cualquier componente puede
// escucharlo. AsyncList es una FlatList conectada: carga al montarse, scroll infinito, tirar para refrescar,
// vacío, error con reintentar y rejilla automática
import React, { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { LayoutChangeEvent, Pressable, RefreshControl, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Box, EABoxProps } from "./Box";
import { EAFlatListProps, FlatList } from "./FlatList";
import { Icon } from "./Icon";
import { Skeleton } from "./Skeleton";
import { Spinner } from "./Spinner";
import { EATextProps, Text } from "./Text";
import { ThemeColor } from "./theme";
import { libT } from "./utils/translate";
import { useThemeProps } from "./utils/useThemeProps";

/* ---------------- Store ---------------- */

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
export type ListFetchResult<T> = T[] | { data: T[]; hasMore?: boolean; total?: number };

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

// La caché en memoria: vive mientras la app está abierta (compartida por todos los stores con la misma clave). Una
// entrada por clave y params: cada combinación de filtros tiene su primera página
const memoryCache = new Map<string, unknown[]>();
const memoryKey = (key: string, params: unknown) => `${key}|${JSON.stringify(params)}`;
// Como mucho estas entradas (de todas las listas): al pasarse, se van las más antiguas
const MEMORY_CACHE_MAX = 50;
const memorySet = (key: string, items: unknown[]) => {
    memoryCache.delete(key); // al final = la más reciente
    memoryCache.set(key, items);
    while (memoryCache.size > MEMORY_CACHE_MAX) memoryCache.delete(memoryCache.keys().next().value as string);
};

const BUSY: ListStatus[] = ['loading', 'refreshing', 'loadingMore'];

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
export class ListStore<T = any, P extends Record<string, any> = Record<string, any>> {
    options: ListStoreOptions<T, P>;
    private state: ListState<T, P>;
    private listeners = new Set<() => void>();
    private controller: AbortController | null = null;
    private requestId = 0;
    private lastFailed: 'load' | 'refresh' | 'more' | null = null;

    constructor(options: ListStoreOptions<T, P>) {
        this.options = options;
        this.state = { data: [], page: 0, hasMore: true, total: null, status: 'idle', error: null, params: (options.params ?? {}) as P, fromCache: false };
        if (options.cacheKey) this.readCache(options.cacheKey);
    }

    /** Borra la caché de esta lista (memoria o AsyncStorage) */
    clearCache = () => {
        const key = this.options.cacheKey;
        if (!key) return Promise.resolve();
        [...memoryCache.keys()].filter(k => k.startsWith(`${key}|`)).forEach(k => memoryCache.delete(k));
        return this.options.cacheStorage === 'storage' ? AsyncStorage.removeItem(key).catch(() => { }) : Promise.resolve();
    };

    /* ----- Leer y escuchar ----- */

    getState = () => this.state;
    subscribe = (listener: () => void) => {
        this.listeners.add(listener);
        return () => { this.listeners.delete(listener) };
    };
    get data() { return this.state.data }
    get status() { return this.state.status }
    get params() { return this.state.params }
    get busy() { return BUSY.includes(this.state.status) }

    private set(patch: Partial<ListState<T, P>>) {
        this.state = { ...this.state, ...patch };
        this.listeners.forEach(l => l());
    }

    /**
     * Hook: el estado (o una parte) y re-render cuando cambia. Con selector solo cuando cambia lo seleccionado
     * (que devuelva un valor simple o una parte del estado, no un objeto nuevo en cada llamada)
     * @example const total = pedidos.use(s => s.total);
     */
    use<R = ListState<T, P>>(selector?: (state: ListState<T, P>) => R): R {
        return useSyncExternalStore(this.subscribe, () => (selector ? selector(this.state) : this.state as unknown as R));
    }

    /** Pinta lo que devuelva render y se actualiza solo (como form.listener) */
    listener(render: (state: ListState<T, P>, store: this) => React.ReactNode): React.ReactElement {
        return React.createElement(StoreListener, { store: this as ListStore<any, any>, render: render as any });
    }

    /* ----- Cargar ----- */

    /** Primera página (si ya hay datos, se quedan hasta que llegan los nuevos) */
    load = () => this.request('load');
    /** Vuelve a pedir la primera página (tirar para refrescar) */
    refresh = () => this.request('refresh');
    /** Siguiente página (si hay más y no hay otra petición en curso) */
    loadMore = () => {
        const s = this.state;
        if (!s.hasMore || this.busy || s.page === 0 || (s.status === 'error' && this.lastFailed === 'more')) return Promise.resolve();
        return this.request('more');
    };
    /** Repite lo que falló */
    retry = () => this.request(this.lastFailed ?? 'load');

    /**
     * Cambia los parámetros (filtros) y vuelve a cargar desde la primera página. Se mezclan con los que hay (con
     * { replace: true } se sustituyen); los que lleguen como undefined, null o '' se quitan
     */
    setParams = (params: Partial<P> | ((prev: P) => P), options?: { replace?: boolean }) => {
        const merged = typeof params === 'function' ? params(this.state.params)
            : options?.replace ? params as P : { ...this.state.params, ...params };
        const next = Object.fromEntries(Object.entries(merged).filter(([, v]) => v !== undefined && v !== null && v !== '')) as P;
        if (JSON.stringify(next) === JSON.stringify(this.state.params)) return Promise.resolve();
        this.abort();
        this.set({ params: next, data: [], page: 0, hasMore: true, total: null, status: 'idle', error: null, fromCache: false });
        return this.load();
    };

    /**
     * Vacía la lista y cancela lo que se estuviera pidiendo. Los params se quedan como estén; con
     * { params: 'initial' } vuelven a los del principio, o se pasan unos nuevos
     */
    reset = (options?: { params?: P | 'initial' }) => {
        this.abort();
        const params = options?.params === 'initial' ? (this.options.params ?? {}) as P : options?.params ?? this.state.params;
        this.set({ data: [], page: 0, hasMore: true, total: null, status: 'idle', error: null, fromCache: false, params });
    };

    private abort() {
        this.requestId++;
        this.controller?.abort();
        this.controller = null;
    }

    private async request(reason: 'load' | 'refresh' | 'more') {
        if (reason !== 'more') this.abort();
        const id = ++this.requestId;
        const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
        this.controller = controller;
        const { pageSize = 20, firstPage = 1, fetch } = this.options;
        const page = reason === 'more' ? firstPage + this.state.page : firstPage;
        // Carga desde cero con caché en memoria para estos params (tras un reset al cerrar la pantalla, o al volver a
        // un filtro ya visto): se ve al momento mientras llega la respuesta
        const cached = reason === 'load' && this.state.data.length === 0 && this.options.cacheKey && this.options.cacheStorage !== 'storage'
            ? memoryCache.get(memoryKey(this.options.cacheKey, this.state.params)) as T[] | undefined : undefined;
        const useCache = !!cached?.length;
        this.set({
            status: reason === 'load' ? 'loading' : reason === 'refresh' ? 'refreshing' : 'loadingMore', error: null,
            ...(useCache && { data: cached!, fromCache: true }),
        });
        try {
            const result = await fetch({ page, pageSize, params: this.state.params, signal: controller?.signal as AbortSignal, reason });
            // Llegó tarde (hubo otra petición, un reset o cambio de filtros después): se ignora
            if (id !== this.requestId) return;
            const items = Array.isArray(result) ? result : result?.data ?? [];
            const total = Array.isArray(result) ? null : result?.total ?? null;
            let data = reason === 'more' ? [...this.state.data, ...items] : items;
            if (reason === 'more' && this.options.dedupe !== false) {
                const seen = new Set<string>();
                data = data.filter((item, i) => { const k = this.keyOf(item, i); if (seen.has(k)) return false; seen.add(k); return true });
            }
            const hasMore = !Array.isArray(result) && result?.hasMore != null ? result.hasMore
                : total != null ? data.length < total : items.length >= pageSize;
            this.lastFailed = null;
            this.set({ data, page: reason === 'more' ? this.state.page + 1 : 1, hasMore, total, status: 'success', fromCache: false });
            if (reason !== 'more' && this.options.cacheKey) this.writeCache(this.options.cacheKey, items);
        } catch (error) {
            if (id !== this.requestId) return;
            this.lastFailed = reason;
            this.set({ status: 'error', error });
        }
    }

    private writeCache(key: string, items: T[]) {
        if (this.options.cacheStorage === 'storage') AsyncStorage.setItem(key, JSON.stringify(items)).catch(() => { });
        else memorySet(memoryKey(key, this.state.params), items);
    }

    private async readCache(key: string) {
        // En memoria: al momento (sin parpadeo al volver a la pantalla)
        if (this.options.cacheStorage !== 'storage') {
            const cached = memoryCache.get(memoryKey(key, this.state.params));
            if (cached?.length) this.state = { ...this.state, data: cached as T[], fromCache: true };
            return;
        }
        try {
            const raw = await AsyncStorage.getItem(key);
            const cached = raw ? JSON.parse(raw) : null;
            // Solo si todavía no ha llegado nada de la API
            if (Array.isArray(cached) && cached.length && this.state.data.length === 0 && this.state.page === 0) this.set({ data: cached, fromCache: true });
        } catch { }
    }

    /* ----- Cambios locales (sin pedir a la API) ----- */

    keyOf = (item: T, index: number) => {
        const { keyExtractor, keyField } = this.options;
        if (keyExtractor) return keyExtractor(item, index);
        const v = keyField != null ? (item as any)?.[keyField] : (item as any)?.id ?? (item as any)?.key;
        return String(v ?? index);
    };

    /** Cambia los datos a mano: un array o una función sobre los actuales */
    setData = (data: T[] | ((prev: T[]) => T[])) => this.set({ data: typeof data === 'function' ? data(this.state.data) : data });
    /** Añade elementos al principio (o al final con { end: true }) */
    addItems = (items: T | T[], options?: { end?: boolean }) => {
        const list = Array.isArray(items) ? items : [items];
        this.setData(prev => (options?.end ? [...prev, ...list] : [...list, ...prev]));
    };
    /** Cambia un elemento por su clave: con un objeto (se mezcla) o una función */
    updateItem = (key: string, patch: Partial<T> | ((item: T) => T)) =>
        this.setData(prev => prev.map((item, i) => (this.keyOf(item, i) !== key ? item : typeof patch === 'function' ? patch(item) : { ...item, ...patch })));
    /** Quita un elemento por su clave */
    removeItem = (key: string) => this.setData(prev => prev.filter((item, i) => this.keyOf(item, i) !== key));
}

const StoreListener = ({ store, render }: { store: ListStore<any, any>; render: (s: ListState<any, any>, store: ListStore<any, any>) => React.ReactNode }) => {
    const state = useSyncExternalStore(store.subscribe, store.getState);
    const out = render(state, store);
    return typeof out === 'string' || typeof out === 'number' ? <Text>{out}</Text> : <>{out}</>;
};

/**
 * Crea el store una sola vez (en un componente). fetch y las demás opciones se leen siempre de la última versión,
 * así que pueden usar variables del componente
 * @example const pedidos = useListStore({ fetch: ({ page, params }) => api.pedidos(page, params) });
 */
export const useListStore = <T, P extends Record<string, any> = Record<string, any>>(options: ListStoreOptions<T, P>) => {
    const latest = useRef(options);
    latest.current = options;
    const [store] = useState(() => new ListStore<T, P>({ ...options, fetch: args => latest.current.fetch(args) }));
    store.options = { ...options, fetch: args => latest.current.fetch(args) };
    return store;
};

/* ---------------- AsyncList ---------------- */

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

function AsyncListBase<T>(props: AsyncListProps<T>) {
    // Defaults → theme.components.AsyncList → variante → props → plataforma
    const [p, theme] = useThemeProps<AsyncListProps<any>>('AsyncList', props as AsyncListProps<any>);
    const {
        store, autoLoad = true, resetOnUnmount = false, refreshable = true, itemMinWidth, filterItems, itemHeight, skeleton, renderSkeleton,
        emptyText, emptyComponent, loadingComponent,
        errorComponent, endComponent, colorScheme = 'primary', _empty, _emptyText, _loading, _error, variant: _v,
        numColumns: numColumnsProp, onEndReachedThreshold = 0.4, keyExtractor, ListFooterComponent, onLayout: onLayoutProp, ...listProps
    } = p;
    const accent = theme.colors?.[`${colorScheme}.100` as ThemeColor] || colorScheme;
    const state = store.use();

    // Primera carga al montarse (si nadie la ha hecho ya)
    useEffect(() => {
        if (autoLoad && store.status === 'idle') store.load();
        return () => { if (resetOnUnmount) store.reset({ params: 'initial' }) };
    }, [store]);

    // Rejilla: columnas según el ancho
    const [width, setWidth] = useState(0);
    const onLayout = (e: LayoutChangeEvent) => { const w = Math.round(e.nativeEvent.layout.width); setWidth(prev => (prev === w ? prev : w)); onLayoutProp?.(e) };
    const numColumns = itemMinWidth && width ? Math.max(1, Math.floor(width / itemMinWidth)) : numColumnsProp ?? 1;

    const data = useMemo(() => (filterItems ? state.data.filter(filterItems) : state.data), [state.data, filterItems]);
    const firstLoad = data.length === 0 && (state.status === 'loading' || state.status === 'idle');

    const skeletonCount = typeof skeleton === 'number' ? skeleton : skeleton || renderSkeleton ? 6 : 0;
    const empty = firstLoad ? (
        loadingComponent ?? (skeletonCount ? (
            <Box gap={8}>
                {Array.from({ length: skeletonCount }, (_, i) => (
                    <React.Fragment key={i}>
                        {renderSkeleton ? renderSkeleton(i) : <Skeleton structure={[{ w: '60%', h: 14 }, { w: '90%', h: 12 }]} borderWidth={1} borderColor="light.100" rounded={2} />}
                    </React.Fragment>
                ))}
            </Box>
        ) : (
            <Box flexDir="row" alignItems="center" justifyContent="center" gap={8} p={6} {..._loading}>
                <Spinner color={accent as any} />
                <Text color="gray">{libT('loading')}</Text>
            </Box>
        ))
    ) : state.status === 'error' ? (
        typeof errorComponent === 'function' ? errorComponent(store.retry, state.error) : errorComponent ?? <ErrorBox accent={accent} onRetry={store.retry} _error={_error} />
    ) : state.status === 'success' ? (
        emptyComponent ?? (
            <Box alignItems="center" p={6} gap={8} {..._empty}>
                <Icon as="Feather" name="inbox" size={40} color="silver.100" />
                <Text color="gray" {..._emptyText}>{emptyText ?? libT('noResults')}</Text>
            </Box>
        )
    ) : null;

    const footer = data.length === 0 ? null
        : state.status === 'loadingMore' ? <Box p={4} alignItems="center"><Spinner color={accent as any} /></Box>
            : state.status === 'error' ? <ErrorBox accent={accent} onRetry={store.retry} compact _error={_error} />
                : !state.hasMore ? endComponent ?? null : null;

    // Funciones estables: la FlatList no recibe props nuevas en cada render
    const defaultKeyExtractor = useCallback((item: any, i: number) => store.keyOf(item, i), [store]);
    const onEndReached = useCallback(() => { store.loadMore() }, [store]);
    const getItemLayout = useMemo(() => (itemHeight
        ? (_: unknown, index: number) => ({ length: itemHeight, offset: itemHeight * index, index })
        : undefined), [itemHeight]);

    return (
        <View style={{ flex: 1 }} onLayout={onLayout}>
            <FlatList
                key={`cols-${numColumns}`}
                data={data}
                numColumns={numColumns}
                keyExtractor={keyExtractor ?? defaultKeyExtractor}
                getItemLayout={getItemLayout}
                onEndReached={onEndReached}
                onEndReachedThreshold={onEndReachedThreshold}
                refreshControl={refreshable ? (
                    <RefreshControl refreshing={state.status === 'refreshing'} onRefresh={store.refresh} colors={[accent]} tintColor={accent} />
                ) : undefined}
                ListEmptyComponent={empty == null ? null : <>{empty}</>}
                ListFooterComponent={<>{React.isValidElement(ListFooterComponent) ? ListFooterComponent : ListFooterComponent ? React.createElement(ListFooterComponent as React.ComponentType) : null}{footer}</>}
                {...listProps}
                // Con varias columnas, el hueco de cada una (si no se pasa uno propio)
                columnWrapperStyle={numColumns > 1 ? listProps.columnWrapperStyle ?? { gap: 8 } : undefined}
            />
        </View>
    );
}

const ErrorBox = ({ accent, onRetry, compact, _error }: { accent: string; onRetry: () => void; compact?: boolean; _error?: EABoxProps }) => (
    <Box alignItems="center" gap={compact ? 4 : 8} p={compact ? 3 : 6} {..._error}>
        {!compact && <Icon as="Feather" name="wifi-off" size={36} color="silver.100" />}
        <Text color="gray" fontSize={compact ? 13 : 14}>{libT('loadError')}</Text>
        <Pressable onPress={onRetry} accessibilityRole="button" hitSlop={8} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, flexDirection: 'row', alignItems: 'center', gap: 6 })}>
            <Icon as="Feather" name="refresh-cw" size={14} color={accent as any} />
            <Text color={accent as any} fontWeight="700">{libT('retry')}</Text>
        </Pressable>
    </Box>
);

/**
 * FlatList conectada a un ListStore: carga al montarse, scroll infinito, tirar para refrescar, vacío, error
 * con reintentar y rejilla automática (itemMinWidth)
 * @example <AsyncList store={pedidos} renderItem={({ item }) => <PedidoCard pedido={item} />} />
 */
export const AsyncList = AsyncListBase as <T>(props: AsyncListProps<T>) => React.ReactElement;
