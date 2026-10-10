"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsyncList = exports.useListStore = exports.ListStore = void 0;
// AsyncList + ListStore: listas que se cargan por páginas desde una API. El store guarda los datos, la página, si
// hay más, el estado (cargando, refrescando, más, error) y los parámetros (filtros); cualquier componente puede
// escucharlo. AsyncList es una FlatList conectada: carga al montarse, scroll infinito, tirar para refrescar,
// vacío, error con reintentar y rejilla automática
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const async_storage_1 = __importDefault(require("@react-native-async-storage/async-storage"));
const Box_1 = require("./Box");
const FlatList_1 = require("./FlatList");
const Icon_1 = require("./Icon");
const Skeleton_1 = require("./Skeleton");
const Spinner_1 = require("./Spinner");
const Text_1 = require("./Text");
const translate_1 = require("./utils/translate");
const useThemeProps_1 = require("./utils/useThemeProps");
// La caché en memoria: vive mientras la app está abierta (compartida por todos los stores con la misma clave). Una
// entrada por clave y params: cada combinación de filtros tiene su primera página
const memoryCache = new Map();
const memoryKey = (key, params) => `${key}|${JSON.stringify(params)}`;
// Como mucho estas entradas (de todas las listas): al pasarse, se van las más antiguas
const MEMORY_CACHE_MAX = 50;
const memorySet = (key, items) => {
    memoryCache.delete(key); // al final = la más reciente
    memoryCache.set(key, items);
    while (memoryCache.size > MEMORY_CACHE_MAX)
        memoryCache.delete(memoryCache.keys().next().value);
};
const BUSY = ['loading', 'refreshing', 'loadingMore'];
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
class ListStore {
    constructor(options) {
        var _a;
        this.listeners = new Set();
        this.controller = null;
        this.requestId = 0;
        this.lastFailed = null;
        /** Borra la caché de esta lista (memoria o AsyncStorage) */
        this.clearCache = () => {
            const key = this.options.cacheKey;
            if (!key)
                return Promise.resolve();
            [...memoryCache.keys()].filter(k => k.startsWith(`${key}|`)).forEach(k => memoryCache.delete(k));
            return this.options.cacheStorage === 'storage' ? async_storage_1.default.removeItem(key).catch(() => { }) : Promise.resolve();
        };
        /* ----- Leer y escuchar ----- */
        this.getState = () => this.state;
        this.subscribe = (listener) => {
            this.listeners.add(listener);
            return () => { this.listeners.delete(listener); };
        };
        /* ----- Cargar ----- */
        /** Primera página (si ya hay datos, se quedan hasta que llegan los nuevos) */
        this.load = () => this.request('load');
        /** Vuelve a pedir la primera página (tirar para refrescar) */
        this.refresh = () => this.request('refresh');
        /** Siguiente página (si hay más y no hay otra petición en curso) */
        this.loadMore = () => {
            const s = this.state;
            if (!s.hasMore || this.busy || s.page === 0 || (s.status === 'error' && this.lastFailed === 'more'))
                return Promise.resolve();
            return this.request('more');
        };
        /** Repite lo que falló */
        this.retry = () => { var _a; return this.request((_a = this.lastFailed) !== null && _a !== void 0 ? _a : 'load'); };
        /**
         * Cambia los parámetros (filtros) y vuelve a cargar desde la primera página. Se mezclan con los que hay (con
         * { replace: true } se sustituyen); los que lleguen como undefined, null o '' se quitan
         */
        this.setParams = (params, options) => {
            const merged = typeof params === 'function' ? params(this.state.params)
                : (options === null || options === void 0 ? void 0 : options.replace) ? params : Object.assign(Object.assign({}, this.state.params), params);
            const next = Object.fromEntries(Object.entries(merged).filter(([, v]) => v !== undefined && v !== null && v !== ''));
            if (JSON.stringify(next) === JSON.stringify(this.state.params))
                return Promise.resolve();
            this.abort();
            this.set({ params: next, data: [], page: 0, hasMore: true, total: null, status: 'idle', error: null, fromCache: false });
            return this.load();
        };
        /**
         * Vacía la lista y cancela lo que se estuviera pidiendo. Los params se quedan como estén; con
         * { params: 'initial' } vuelven a los del principio, o se pasan unos nuevos
         */
        this.reset = (options) => {
            var _a, _b;
            this.abort();
            const params = (options === null || options === void 0 ? void 0 : options.params) === 'initial' ? ((_a = this.options.params) !== null && _a !== void 0 ? _a : {}) : (_b = options === null || options === void 0 ? void 0 : options.params) !== null && _b !== void 0 ? _b : this.state.params;
            this.set({ data: [], page: 0, hasMore: true, total: null, status: 'idle', error: null, fromCache: false, params });
        };
        /* ----- Cambios locales (sin pedir a la API) ----- */
        this.keyOf = (item, index) => {
            var _a;
            const { keyExtractor, keyField } = this.options;
            if (keyExtractor)
                return keyExtractor(item, index);
            const v = keyField != null ? item === null || item === void 0 ? void 0 : item[keyField] : (_a = item === null || item === void 0 ? void 0 : item.id) !== null && _a !== void 0 ? _a : item === null || item === void 0 ? void 0 : item.key;
            return String(v !== null && v !== void 0 ? v : index);
        };
        /** Cambia los datos a mano: un array o una función sobre los actuales */
        this.setData = (data) => this.set({ data: typeof data === 'function' ? data(this.state.data) : data });
        /** Añade elementos al principio (o al final con { end: true }) */
        this.addItems = (items, options) => {
            const list = Array.isArray(items) ? items : [items];
            this.setData(prev => ((options === null || options === void 0 ? void 0 : options.end) ? [...prev, ...list] : [...list, ...prev]));
        };
        /** Cambia un elemento por su clave: con un objeto (se mezcla) o una función */
        this.updateItem = (key, patch) => this.setData(prev => prev.map((item, i) => (this.keyOf(item, i) !== key ? item : typeof patch === 'function' ? patch(item) : Object.assign(Object.assign({}, item), patch))));
        /** Quita un elemento por su clave */
        this.removeItem = (key) => this.setData(prev => prev.filter((item, i) => this.keyOf(item, i) !== key));
        this.options = options;
        this.state = { data: [], page: 0, hasMore: true, total: null, status: 'idle', error: null, params: ((_a = options.params) !== null && _a !== void 0 ? _a : {}), fromCache: false };
        if (options.cacheKey)
            this.readCache(options.cacheKey);
    }
    get data() { return this.state.data; }
    get status() { return this.state.status; }
    get params() { return this.state.params; }
    get busy() { return BUSY.includes(this.state.status); }
    set(patch) {
        this.state = Object.assign(Object.assign({}, this.state), patch);
        this.listeners.forEach(l => l());
    }
    /**
     * Hook: el estado (o una parte) y re-render cuando cambia. Con selector solo cuando cambia lo seleccionado
     * (que devuelva un valor simple o una parte del estado, no un objeto nuevo en cada llamada)
     * @example const total = pedidos.use(s => s.total);
     */
    use(selector) {
        return (0, react_1.useSyncExternalStore)(this.subscribe, () => (selector ? selector(this.state) : this.state));
    }
    /** Pinta lo que devuelva render y se actualiza solo (como form.listener) */
    listener(render) {
        return react_1.default.createElement(StoreListener, { store: this, render: render });
    }
    abort() {
        var _a;
        this.requestId++;
        (_a = this.controller) === null || _a === void 0 ? void 0 : _a.abort();
        this.controller = null;
    }
    async request(reason) {
        var _a, _b;
        if (reason !== 'more')
            this.abort();
        const id = ++this.requestId;
        const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
        this.controller = controller;
        const { pageSize = 20, firstPage = 1, fetch } = this.options;
        const page = reason === 'more' ? firstPage + this.state.page : firstPage;
        // Carga desde cero con caché en memoria para estos params (tras un reset al cerrar la pantalla, o al volver a
        // un filtro ya visto): se ve al momento mientras llega la respuesta
        const cached = reason === 'load' && this.state.data.length === 0 && this.options.cacheKey && this.options.cacheStorage !== 'storage'
            ? memoryCache.get(memoryKey(this.options.cacheKey, this.state.params)) : undefined;
        const useCache = !!(cached === null || cached === void 0 ? void 0 : cached.length);
        this.set(Object.assign({ status: reason === 'load' ? 'loading' : reason === 'refresh' ? 'refreshing' : 'loadingMore', error: null }, (useCache && { data: cached, fromCache: true })));
        try {
            const result = await fetch({ page, pageSize, params: this.state.params, signal: controller === null || controller === void 0 ? void 0 : controller.signal, reason });
            // Llegó tarde (hubo otra petición, un reset o cambio de filtros después): se ignora
            if (id !== this.requestId)
                return;
            const items = Array.isArray(result) ? result : (_a = result === null || result === void 0 ? void 0 : result.data) !== null && _a !== void 0 ? _a : [];
            const total = Array.isArray(result) ? null : (_b = result === null || result === void 0 ? void 0 : result.total) !== null && _b !== void 0 ? _b : null;
            let data = reason === 'more' ? [...this.state.data, ...items] : items;
            if (reason === 'more' && this.options.dedupe !== false) {
                const seen = new Set();
                data = data.filter((item, i) => { const k = this.keyOf(item, i); if (seen.has(k))
                    return false; seen.add(k); return true; });
            }
            const hasMore = !Array.isArray(result) && (result === null || result === void 0 ? void 0 : result.hasMore) != null ? result.hasMore
                : total != null ? data.length < total : items.length >= pageSize;
            this.lastFailed = null;
            this.set({ data, page: reason === 'more' ? this.state.page + 1 : 1, hasMore, total, status: 'success', fromCache: false });
            if (reason !== 'more' && this.options.cacheKey)
                this.writeCache(this.options.cacheKey, items);
        }
        catch (error) {
            if (id !== this.requestId)
                return;
            this.lastFailed = reason;
            this.set({ status: 'error', error });
        }
    }
    writeCache(key, items) {
        if (this.options.cacheStorage === 'storage')
            async_storage_1.default.setItem(key, JSON.stringify(items)).catch(() => { });
        else
            memorySet(memoryKey(key, this.state.params), items);
    }
    async readCache(key) {
        // En memoria: al momento (sin parpadeo al volver a la pantalla)
        if (this.options.cacheStorage !== 'storage') {
            const cached = memoryCache.get(memoryKey(key, this.state.params));
            if (cached === null || cached === void 0 ? void 0 : cached.length)
                this.state = Object.assign(Object.assign({}, this.state), { data: cached, fromCache: true });
            return;
        }
        try {
            const raw = await async_storage_1.default.getItem(key);
            const cached = raw ? JSON.parse(raw) : null;
            // Solo si todavía no ha llegado nada de la API
            if (Array.isArray(cached) && cached.length && this.state.data.length === 0 && this.state.page === 0)
                this.set({ data: cached, fromCache: true });
        }
        catch (_a) { }
    }
}
exports.ListStore = ListStore;
const StoreListener = ({ store, render }) => {
    const state = (0, react_1.useSyncExternalStore)(store.subscribe, store.getState);
    const out = render(state, store);
    return typeof out === 'string' || typeof out === 'number' ? <Text_1.Text>{out}</Text_1.Text> : <>{out}</>;
};
/**
 * Crea el store una sola vez (en un componente). fetch y las demás opciones se leen siempre de la última versión,
 * así que pueden usar variables del componente
 * @example const pedidos = useListStore({ fetch: ({ page, params }) => api.pedidos(page, params) });
 */
const useListStore = (options) => {
    const latest = (0, react_1.useRef)(options);
    latest.current = options;
    const [store] = (0, react_1.useState)(() => new ListStore(Object.assign(Object.assign({}, options), { fetch: args => latest.current.fetch(args) })));
    store.options = Object.assign(Object.assign({}, options), { fetch: args => latest.current.fetch(args) });
    return store;
};
exports.useListStore = useListStore;
function AsyncListBase(props) {
    var _a, _b;
    // Defaults → theme.components.AsyncList → variante → props → plataforma
    const [p, theme] = (0, useThemeProps_1.useThemeProps)('AsyncList', props);
    const { store, autoLoad = true, resetOnUnmount = false, refreshable = true, itemMinWidth, filterItems, itemHeight, skeleton, renderSkeleton, emptyText, emptyComponent, loadingComponent, errorComponent, endComponent, colorScheme = 'primary', _empty, _emptyText, _loading, _error, variant: _v, numColumns: numColumnsProp, onEndReachedThreshold = 0.4, keyExtractor, ListFooterComponent, onLayout: onLayoutProp } = p, listProps = __rest(p, ["store", "autoLoad", "resetOnUnmount", "refreshable", "itemMinWidth", "filterItems", "itemHeight", "skeleton", "renderSkeleton", "emptyText", "emptyComponent", "loadingComponent", "errorComponent", "endComponent", "colorScheme", "_empty", "_emptyText", "_loading", "_error", "variant", "numColumns", "onEndReachedThreshold", "keyExtractor", "ListFooterComponent", "onLayout"]);
    const accent = ((_a = theme.colors) === null || _a === void 0 ? void 0 : _a[`${colorScheme}.100`]) || colorScheme;
    const state = store.use();
    // Primera carga al montarse (si nadie la ha hecho ya)
    (0, react_1.useEffect)(() => {
        if (autoLoad && store.status === 'idle')
            store.load();
        return () => { if (resetOnUnmount)
            store.reset({ params: 'initial' }); };
    }, [store]);
    // Rejilla: columnas según el ancho
    const [width, setWidth] = (0, react_1.useState)(0);
    const onLayout = (e) => { const w = Math.round(e.nativeEvent.layout.width); setWidth(prev => (prev === w ? prev : w)); onLayoutProp === null || onLayoutProp === void 0 ? void 0 : onLayoutProp(e); };
    const numColumns = itemMinWidth && width ? Math.max(1, Math.floor(width / itemMinWidth)) : numColumnsProp !== null && numColumnsProp !== void 0 ? numColumnsProp : 1;
    const data = (0, react_1.useMemo)(() => (filterItems ? state.data.filter(filterItems) : state.data), [state.data, filterItems]);
    const firstLoad = data.length === 0 && (state.status === 'loading' || state.status === 'idle');
    const skeletonCount = typeof skeleton === 'number' ? skeleton : skeleton || renderSkeleton ? 6 : 0;
    const empty = firstLoad ? (loadingComponent !== null && loadingComponent !== void 0 ? loadingComponent : (skeletonCount ? (<Box_1.Box gap={8}>
                {Array.from({ length: skeletonCount }, (_, i) => (<react_1.default.Fragment key={i}>
                        {renderSkeleton ? renderSkeleton(i) : <Skeleton_1.Skeleton structure={[{ w: '60%', h: 14 }, { w: '90%', h: 12 }]} borderWidth={1} borderColor="light.100" rounded={2}/>}
                    </react_1.default.Fragment>))}
            </Box_1.Box>) : (<Box_1.Box flexDir="row" alignItems="center" justifyContent="center" gap={8} p={6} {..._loading}>
                <Spinner_1.Spinner color={accent}/>
                <Text_1.Text color="gray">{(0, translate_1.libT)('loading')}</Text_1.Text>
            </Box_1.Box>))) : state.status === 'error' ? (typeof errorComponent === 'function' ? errorComponent(store.retry, state.error) : errorComponent !== null && errorComponent !== void 0 ? errorComponent : <ErrorBox accent={accent} onRetry={store.retry} _error={_error}/>) : state.status === 'success' ? (emptyComponent !== null && emptyComponent !== void 0 ? emptyComponent : (<Box_1.Box alignItems="center" p={6} gap={8} {..._empty}>
                <Icon_1.Icon as="Feather" name="inbox" size={40} color="silver.100"/>
                <Text_1.Text color="gray" {..._emptyText}>{emptyText !== null && emptyText !== void 0 ? emptyText : (0, translate_1.libT)('noResults')}</Text_1.Text>
            </Box_1.Box>)) : null;
    const footer = data.length === 0 ? null
        : state.status === 'loadingMore' ? <Box_1.Box p={4} alignItems="center"><Spinner_1.Spinner color={accent}/></Box_1.Box>
            : state.status === 'error' ? <ErrorBox accent={accent} onRetry={store.retry} compact _error={_error}/>
                : !state.hasMore ? endComponent !== null && endComponent !== void 0 ? endComponent : null : null;
    // Funciones estables: la FlatList no recibe props nuevas en cada render
    const defaultKeyExtractor = (0, react_1.useCallback)((item, i) => store.keyOf(item, i), [store]);
    const onEndReached = (0, react_1.useCallback)(() => { store.loadMore(); }, [store]);
    const getItemLayout = (0, react_1.useMemo)(() => (itemHeight
        ? (_, index) => ({ length: itemHeight, offset: itemHeight * index, index })
        : undefined), [itemHeight]);
    return (<react_native_1.View style={{ flex: 1 }} onLayout={onLayout}>
            <FlatList_1.FlatList key={`cols-${numColumns}`} data={data} numColumns={numColumns} keyExtractor={keyExtractor !== null && keyExtractor !== void 0 ? keyExtractor : defaultKeyExtractor} getItemLayout={getItemLayout} onEndReached={onEndReached} onEndReachedThreshold={onEndReachedThreshold} refreshControl={refreshable ? (<react_native_1.RefreshControl refreshing={state.status === 'refreshing'} onRefresh={store.refresh} colors={[accent]} tintColor={accent}/>) : undefined} ListEmptyComponent={empty == null ? null : <>{empty}</>} ListFooterComponent={<>{react_1.default.isValidElement(ListFooterComponent) ? ListFooterComponent : ListFooterComponent ? react_1.default.createElement(ListFooterComponent) : null}{footer}</>} {...listProps} 
    // Con varias columnas, el hueco de cada una (si no se pasa uno propio)
    columnWrapperStyle={numColumns > 1 ? (_b = listProps.columnWrapperStyle) !== null && _b !== void 0 ? _b : { gap: 8 } : undefined}/>
        </react_native_1.View>);
}
const ErrorBox = ({ accent, onRetry, compact, _error }) => (<Box_1.Box alignItems="center" gap={compact ? 4 : 8} p={compact ? 3 : 6} {..._error}>
        {!compact && <Icon_1.Icon as="Feather" name="wifi-off" size={36} color="silver.100"/>}
        <Text_1.Text color="gray" fontSize={compact ? 13 : 14}>{(0, translate_1.libT)('loadError')}</Text_1.Text>
        <react_native_1.Pressable onPress={onRetry} accessibilityRole="button" hitSlop={8} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, flexDirection: 'row', alignItems: 'center', gap: 6 })}>
            <Icon_1.Icon as="Feather" name="refresh-cw" size={14} color={accent}/>
            <Text_1.Text color={accent} fontWeight="700">{(0, translate_1.libT)('retry')}</Text_1.Text>
        </react_native_1.Pressable>
    </Box_1.Box>);
/**
 * FlatList conectada a un ListStore: carga al montarse, scroll infinito, tirar para refrescar, vacío, error
 * con reintentar y rejilla automática (itemMinWidth)
 * @example <AsyncList store={pedidos} renderItem={({ item }) => <PedidoCard pedido={item} />} />
 */
exports.AsyncList = AsyncListBase;
