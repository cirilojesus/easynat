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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Table = void 0;
// Table: tabla de datos. Columnas que reparten el ancho (y scroll horizontal si no caben), cabecera fija con
// height, ordenar al tocar la cabecera, selección con casillas, filas desplegables, paginación, fila de totales,
// carga con Skeleton y estado vacío
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const Box_1 = require("./Box");
const CheckBox_1 = require("./CheckBox");
const Icon_1 = require("./Icon");
const Skeleton_1 = require("./Skeleton");
const Spinner_1 = require("./Spinner");
const Text_1 = require("./Text");
const translate_1 = require("./utils/translate");
const useThemeProps_1 = require("./utils/useThemeProps");
const isGroup = (c) => Array.isArray(c.children);
/* ---------------- Utilidades ---------------- */
const SIZES = { sm: { px: 8, py: 6, fs: 12 }, md: { px: 12, py: 10, fs: 14 }, lg: { px: 14, py: 14, fs: 15 } };
const CHECK_W = 44;
const EXPAND_W = 36;
const valueOf = (col, row) => { var _a; return typeof col.value === 'function' ? col.value(row) : row === null || row === void 0 ? void 0 : row[(_a = col.value) !== null && _a !== void 0 ? _a : col.key]; };
const defaultKey = (row, index) => { var _a, _b; return String((_b = (_a = row === null || row === void 0 ? void 0 : row.id) !== null && _a !== void 0 ? _a : row === null || row === void 0 ? void 0 : row.key) !== null && _b !== void 0 ? _b : index); };
const noop = () => () => { };
const noState = () => null;
/** El color con poca opacidad (para el fondo de la fila seleccionada): '#4F46E5' → '#4F46E51F' */
const tint = (hex, alpha = '1F') => (/^#[0-9a-f]{6}([0-9a-f]{2})?$/i.test(hex) ? hex.slice(0, 7) + alpha : hex);
/** Para ordenar: números, fechas y textos (con números dentro, "a2" < "a10"); vacíos al final */
const compare = (a, b) => {
    const empty = (v) => v === null || v === undefined || v === '';
    if (empty(a) || empty(b))
        return empty(a) === empty(b) ? 0 : empty(a) ? 1 : -1;
    const n = (v) => (v instanceof Date ? v.getTime() : typeof v === 'number' ? v : NaN);
    if (!Number.isNaN(n(a)) && !Number.isNaN(n(b)))
        return n(a) - n(b);
    return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
};
/** Estado controlado (prop) o propio (default), con aviso al cambiar */
function useControlled(value, initial, onChange) {
    const [own, setOwn] = (0, react_1.useState)(initial);
    const current = value !== undefined ? value : own;
    return [current, v => { if (value === undefined)
            setOwn(v); onChange === null || onChange === void 0 ? void 0 : onChange(v); }];
}
// ScrollView.Context existe en React Native pero no está en sus tipos (si faltara, la lista se pinta tal cual)
const ScrollContext = react_native_1.ScrollView.Context;
const NotNested = ({ children }) => ScrollContext ? <ScrollContext.Provider value={null}>{children}</ScrollContext.Provider> : <>{children}</>;
/* ---------------- Componente ---------------- */
function TableBase(props) {
    var _a, _b;
    // Defaults → theme.components.Table → variante → props → plataforma
    const [p, theme] = (0, useThemeProps_1.useThemeProps)('Table', props);
    const { data: dataProp, store, columns: columnsProp, keyField, keyExtractor: keyExtractorProp, striped = false, bordered = false, size = 'md', height, columnMinWidth = 100, rowStyle: rowStyleProp, onRowPress, onRowLongPress, sort: sortProp, defaultSort = null, onSortChange, manualSort = false, selectable = false, selectedKeys, defaultSelectedKeys = [], onSelectionChange, renderExpanded, expandedKeys, defaultExpandedKeys = [], onExpandedChange, pageSize, page: pageProp, defaultPage = 0, onPageChange, loading: loadingProp = false, emptyText, emptyComponent, colorScheme = 'primary', _header, _headerText, _row, _text, _cell, _stripedRow, _selectedRow, _footer, _footerText, _expanded, _pagination, _emptyText, variant: _v } = p, boxProps = __rest(p, ["data", "store", "columns", "keyField", "keyExtractor", "striped", "bordered", "size", "height", "columnMinWidth", "rowStyle", "onRowPress", "onRowLongPress", "sort", "defaultSort", "onSortChange", "manualSort", "selectable", "selectedKeys", "defaultSelectedKeys", "onSelectionChange", "renderExpanded", "expandedKeys", "defaultExpandedKeys", "onExpandedChange", "pageSize", "page", "defaultPage", "onPageChange", "loading", "emptyText", "emptyComponent", "colorScheme", "_header", "_headerText", "_row", "_text", "_cell", "_stripedRow", "_selectedRow", "_footer", "_footerText", "_expanded", "_pagination", "_emptyText", "variant"]);
    // Con store: sus filas y su estado (re-render cuando cambia)
    const storeState = (0, react_1.useSyncExternalStore)(store ? store.subscribe : noop, store ? store.getState : noState);
    const data = (_a = (store ? storeState === null || storeState === void 0 ? void 0 : storeState.data : dataProp)) !== null && _a !== void 0 ? _a : [];
    const loading = loadingProp || (!!store && data.length === 0 && ((storeState === null || storeState === void 0 ? void 0 : storeState.status) === 'loading' || (storeState === null || storeState === void 0 ? void 0 : storeState.status) === 'idle'));
    // Memorizada: si cambiara en cada render, las filas se recalcularían siempre
    const keyExtractor = (0, react_1.useMemo)(() => keyExtractorProp !== null && keyExtractorProp !== void 0 ? keyExtractorProp : (store ? store.keyOf : keyField != null ? (row, i) => { var _a; return String((_a = row === null || row === void 0 ? void 0 : row[keyField]) !== null && _a !== void 0 ? _a : i); } : defaultKey), [keyExtractorProp, store, keyField]);
    // Con store: la primera página al montarse (si nadie la ha pedido ya)
    (0, react_1.useEffect)(() => { if (store && store.status === 'idle')
        store.load(); }, [store]);
    // Las columnas "hoja" (sin grupos): con ellas va todo (anchos, orden, celdas); los grupos solo son la cabecera
    const columns = (0, react_1.useMemo)(() => columnsProp.flatMap(c => (isGroup(c) ? c.children : [c])), [columnsProp]);
    const color = (c) => { var _a; return ((_a = theme.colors) === null || _a === void 0 ? void 0 : _a[c]) || c; };
    const accent = color(`${colorScheme}.100`);
    const border = color('light.100');
    const s = (_b = SIZES[size]) !== null && _b !== void 0 ? _b : SIZES.md;
    const [width, setWidth] = (0, react_1.useState)(0);
    const onLayout = (e) => { const w = Math.round(e.nativeEvent.layout.width); setWidth(prev => (prev === w ? prev : w)); };
    const [sort, setSort] = useControlled(sortProp, defaultSort, onSortChange);
    const [selected, setSelected] = useControlled(selectedKeys, defaultSelectedKeys);
    const [expanded, setExpanded] = useControlled(expandedKeys, defaultExpandedKeys, onExpandedChange);
    const [page, setPage] = useControlled(pageProp, defaultPage, onPageChange);
    // Filas con su clave e índice original (el índice que reciben render, onRowPress...)
    const rows = (0, react_1.useMemo)(() => data.map((row, index) => ({ row, index, key: keyExtractor(row, index) })), [data, keyExtractor]);
    const sorted = (0, react_1.useMemo)(() => {
        if (!sort || manualSort)
            return rows;
        const col = columns.find(c => c.key === sort.key);
        if (!col)
            return rows;
        const get = (r) => (col.sortValue ? col.sortValue(r.row) : valueOf(col, r.row));
        const dir = sort.direction === 'desc' ? -1 : 1;
        return [...rows].sort((a, b) => compare(get(a), get(b)) * dir || a.index - b.index);
    }, [rows, sort, manualSort, columns]);
    const pages = pageSize ? Math.max(1, Math.ceil(sorted.length / pageSize)) : 1;
    const currentPage = Math.min(Math.max(0, page), pages - 1);
    const visible = pageSize ? sorted.slice(currentPage * pageSize, (currentPage + 1) * pageSize) : sorted;
    // Anchos: los fijos, y el sobrante repartido por flex (sin bajar del mínimo). Si no caben: scroll horizontal
    const extra = (selectable ? CHECK_W : 0) + (renderExpanded ? EXPAND_W : 0);
    const widths = (0, react_1.useMemo)(() => {
        const out = columns.map(c => { var _a; return (_a = c.width) !== null && _a !== void 0 ? _a : 0; });
        let free = Math.max(0, width - columns.reduce((a, c) => { var _a; return a + ((_a = c.width) !== null && _a !== void 0 ? _a : 0); }, extra));
        // Las que no llegarían a su mínimo se quedan con el mínimo; el resto se reparte entre las demás (por flex)
        let pending = columns.map((c, i) => i).filter(i => columns[i].width == null);
        while (pending.length) {
            const totalFlex = pending.reduce((a, i) => { var _a; return a + ((_a = columns[i].flex) !== null && _a !== void 0 ? _a : 1); }, 0) || 1;
            const min = (i) => { var _a; return (_a = columns[i].minWidth) !== null && _a !== void 0 ? _a : columnMinWidth; };
            const short = pending.filter(i => { var _a; return (free * ((_a = columns[i].flex) !== null && _a !== void 0 ? _a : 1)) / totalFlex < min(i); });
            if (!short.length) {
                pending.forEach(i => { var _a; out[i] = Math.floor((free * ((_a = columns[i].flex) !== null && _a !== void 0 ? _a : 1)) / totalFlex); });
                // Los píxeles del redondeo, a la última (así llena el ancho justo)
                out[pending[pending.length - 1]] += free - pending.reduce((a, i) => a + out[i], 0);
                break;
            }
            short.forEach(i => { out[i] = min(i); free = Math.max(0, free - min(i)); });
            pending = pending.filter(i => !short.includes(i));
        }
        return out;
    }, [columns, width, extra, columnMinWidth]);
    const contentWidth = widths.reduce((a, b) => a + b, extra);
    /** El ancho de una celda que ocupa `span` columnas desde la i */
    const spanWidth = (i, span) => (span === 1 ? widths[i] : widths.slice(i, i + span).reduce((a, b) => a + b, 0));
    const scrollX = width > 0 && contentWidth > width + 0.5;
    const toggleSort = (key) => {
        // asc → desc → sin orden
        const next = (sort === null || sort === void 0 ? void 0 : sort.key) !== key ? { key, direction: 'asc' } : sort.direction === 'asc' ? { key, direction: 'desc' } : null;
        setSort(next);
    };
    // Set: comprobar si una fila está elegida es inmediato (con includes, cada fila recorría toda la selección)
    const selectedSet = (0, react_1.useMemo)(() => new Set(selected), [selected]);
    const expandedSet = (0, react_1.useMemo)(() => new Set(expanded), [expanded]);
    const emitSelection = (keys) => {
        setSelected(keys);
        const set = new Set(keys);
        onSelectionChange === null || onSelectionChange === void 0 ? void 0 : onSelectionChange(keys, rows.filter(r => set.has(r.key)).map(r => r.row));
    };
    const toggleRow = (key) => {
        if (selectable === 'single')
            return emitSelection(selected[0] === key ? [] : [key]);
        emitSelection(selectedSet.has(key) ? selected.filter(k => k !== key) : [...selected, key]);
    };
    const allSelected = rows.length > 0 && rows.every(r => selectedSet.has(r.key));
    const toggleAll = () => emitSelection(allSelected ? [] : rows.map(r => r.key));
    const toggleExpanded = (key) => setExpanded(expandedSet.has(key) ? expanded.filter(k => k !== key) : [...expanded, key]);
    const justify = (align) => (align === 'right' ? 'flex-end' : align === 'center' ? 'center' : 'flex-start');
    const cellBorder = bordered ? { borderRightWidth: react_native_1.StyleSheet.hairlineWidth, borderColor: border } : null;
    const baseText = (0, useThemeProps_1.mergeProps)({ fontSize: s.fs, color: 'dark.100' }, _text);
    /* ----- Cabecera ----- */
    const headerCell = (c, i) => {
        var _a;
        const active = (sort === null || sort === void 0 ? void 0 : sort.key) === c.key;
        const title = (<Box_1.Box flexDir="row" alignItems="center" gap={1} justifyContent={justify(c.align)} flex={1}>
                {typeof c.title === 'string' || typeof c.title === 'number' || c.title == null
                ? <Text_1.Text fontSize={s.fs - 1} fontWeight="700" color={active ? accent : 'gray.100'} textAlign={c.align} {..._headerText} {...c._headerText}>{(_a = c.title) !== null && _a !== void 0 ? _a : c.key}</Text_1.Text>
                : c.title}
                {c.sortable && (<Icon_1.Icon as="MaterialCommunityIcons" size={14} color={(active ? accent : 'silver.100')} name={!active ? 'unfold-more-horizontal' : sort.direction === 'asc' ? 'arrow-up' : 'arrow-down'}/>)}
            </Box_1.Box>);
        const cellStyle = [{ width: widths[i], paddingHorizontal: s.px, paddingVertical: s.py, justifyContent: 'center' }, i < columns.length - 1 ? cellBorder : null];
        return c.sortable ? (<react_native_1.Pressable key={c.key} onPress={() => toggleSort(c.key)} accessibilityRole="button" accessibilityLabel={typeof c.title === 'string' ? c.title : c.key} accessibilityState={{ selected: active }} style={({ pressed }) => [...cellStyle, { opacity: pressed ? 0.6 : 1 }]}>
                <Box_1.Box {...c._header}>{title}</Box_1.Box>
            </react_native_1.Pressable>) : (<react_native_1.View key={c.key} style={cellStyle}><Box_1.Box {...c._header}>{title}</Box_1.Box></react_native_1.View>);
    };
    // Con grupos: cada grupo es una columna con su título arriba y sus columnas debajo; las demás ocupan todo el alto
    let leaf = 0;
    const header = (<Box_1.Box flexDir="row" bg="light.50" borderBottomWidth={1} borderColor={border} {..._header}>
            {renderExpanded && <react_native_1.View style={[{ width: EXPAND_W }, cellBorder]}/>}
            {selectable && (<Box_1.Box w={CHECK_W} alignItems="center" justifyContent="center" style={cellBorder !== null && cellBorder !== void 0 ? cellBorder : undefined}>
                    {selectable !== 'single' && <CheckBox_1.CheckBox size="sm" checked={allSelected} onChange={toggleAll} colorScheme={colorScheme} accessibilityLabel="all"/>}
                </Box_1.Box>)}
            {columnsProp.map((c, gi) => {
            var _a;
            if (!isGroup(c))
                return headerCell(c, leaf++);
            const first = leaf;
            const cells = c.children.map(child => headerCell(child, leaf++));
            const width = widths.slice(first, leaf).reduce((a, b) => a + b, 0);
            return (<react_native_1.View key={`group-${gi}`} style={{ width }}>
                        {/* El título del grupo (con su borde derecho si no es el último: el de abajo lo ponen sus columnas) */}
                        <Box_1.Box px={s.px} py={s.py / 1.5} borderBottomWidth={react_native_1.StyleSheet.hairlineWidth} borderColor={border} alignItems={justify((_a = c.align) !== null && _a !== void 0 ? _a : 'center')} style={leaf < columns.length ? cellBorder !== null && cellBorder !== void 0 ? cellBorder : undefined : undefined} {...c._header}>
                            {typeof c.title === 'string' || typeof c.title === 'number'
                    ? <Text_1.Text fontSize={s.fs - 1} fontWeight="700" color="gray.100" {..._headerText} {...c._headerText}>{c.title}</Text_1.Text>
                    : c.title}
                        </Box_1.Box>
                        <react_native_1.View style={{ flexDirection: 'row', flex: 1 }}>{cells}</react_native_1.View>
                    </react_native_1.View>);
        })}
        </Box_1.Box>);
    /* ----- Filas ----- */
    const renderRow = ({ item, index: position }) => {
        const { row, index, key } = item;
        const isSelected = selectedSet.has(key);
        const isExpanded = !!renderExpanded && expandedSet.has(key);
        const rowStyle = (0, useThemeProps_1.mergeProps)(_row, striped && position % 2 === 1 ? Object.assign({ bg: 'light.50' }, _stripedRow) : null, rowStyleProp === null || rowStyleProp === void 0 ? void 0 : rowStyleProp(row, index), isSelected ? Object.assign({ bg: tint(accent) }, _selectedRow) : null);
        const press = onRowPress ? () => onRowPress(row, index) : renderExpanded ? () => toggleExpanded(key) : undefined;
        let covered = 0;
        const content = (pressed) => (<Box_1.Box flexDir="row" borderBottomWidth={react_native_1.StyleSheet.hairlineWidth} borderColor={border} {...rowStyle} opacity={pressed ? 0.7 : 1}>
                            {renderExpanded && (<react_native_1.Pressable onPress={() => toggleExpanded(key)} hitSlop={6} accessibilityRole="button" accessibilityLabel="expand" accessibilityState={{ expanded: isExpanded }} style={[{ width: EXPAND_W, alignItems: 'center', justifyContent: 'center' }, cellBorder]}>
                                    <Icon_1.Icon as="MaterialCommunityIcons" name={isExpanded ? 'chevron-down' : 'chevron-right'} size={20} color={'gray.100'}/>
                                </react_native_1.Pressable>)}
                            {selectable && (<Box_1.Box w={CHECK_W} alignItems="center" justifyContent="center" style={cellBorder !== null && cellBorder !== void 0 ? cellBorder : undefined}>
                                    <CheckBox_1.CheckBox size="sm" checked={isSelected} onChange={() => toggleRow(key)} colorScheme={colorScheme} rounded={selectable === 'single' ? 40 : undefined}/>
                                </Box_1.Box>)}
                            {columns.map((c, i) => {
                var _a;
                // Tapada por el colSpan de una celda anterior
                if (i < covered)
                    return null;
                const span = Math.max(1, Math.min(columns.length - i, Math.floor(typeof c.colSpan === 'function' ? c.colSpan(row, index) : (_a = c.colSpan) !== null && _a !== void 0 ? _a : 1)));
                covered = i + span;
                const value = valueOf(c, row);
                return (<Box_1.Box key={c.key} style={[{ width: spanWidth(i, span), paddingHorizontal: s.px, paddingVertical: s.py, justifyContent: 'center', alignItems: justify(c.align) }, i + span < columns.length ? cellBorder : null]} {..._cell} {...c._cell}>
                                        {c.render ? c.render(row, index, value) : (<Text_1.Text {...baseText} textAlign={c.align} numberOfLines={c.numberOfLines} {...c._text}>
                                                {c.format ? c.format(value, row, index) : value == null ? '' : String(value)}
                                            </Text_1.Text>)}
                                    </Box_1.Box>);
            })}
                        </Box_1.Box>);
        return (<react_native_1.View key={key}>
                {/* Solo las filas que se pueden tocar llevan Pressable (más ligero con muchas filas) */}
                {press || onRowLongPress ? (<react_native_1.Pressable onPress={press} onLongPress={onRowLongPress ? () => onRowLongPress(row, index) : undefined} accessibilityRole="button" accessibilityState={selectable ? { selected: isSelected } : undefined}>
                        {({ pressed }) => content(pressed)}
                    </react_native_1.Pressable>) : (<react_native_1.View accessibilityState={selectable ? { selected: isSelected } : undefined}>{content(false)}</react_native_1.View>)}
                {isExpanded && (<Box_1.Box px={s.px} py={s.py} bg="light.50" borderBottomWidth={react_native_1.StyleSheet.hairlineWidth} borderColor={border} {..._expanded}>
                        {renderExpanded(row, index)}
                    </Box_1.Box>)}
            </react_native_1.View>);
    };
    /* ----- Totales ----- */
    let footerCovered = 0;
    const hasFooter = columns.some(c => c.footer != null);
    const footer = hasFooter && !loading && visible.length > 0 && (<Box_1.Box flexDir="row" bg="light.50" borderTopWidth={1} borderColor={border} {..._footer}>
            {renderExpanded && <react_native_1.View style={{ width: EXPAND_W }}/>}
            {selectable && <react_native_1.View style={{ width: CHECK_W }}/>}
            {columns.map((c, i) => {
            var _a;
            if (i < footerCovered)
                return null;
            const span = Math.max(1, Math.min(columns.length - i, Math.floor((_a = c.footerColSpan) !== null && _a !== void 0 ? _a : 1)));
            footerCovered = i + span;
            const content = typeof c.footer === 'function' ? c.footer(sorted.map(r => r.row)) : c.footer;
            return (<Box_1.Box key={c.key} style={[{ width: spanWidth(i, span), paddingHorizontal: s.px, paddingVertical: s.py, alignItems: justify(c.align) }, i + span < columns.length ? cellBorder : null]}>
                        {typeof content === 'string' || typeof content === 'number'
                    ? <Text_1.Text {...baseText} fontWeight="700" textAlign={c.align} {..._footerText}>{content}</Text_1.Text>
                    : content}
                    </Box_1.Box>);
        })}
        </Box_1.Box>);
    /* ----- Cuerpo ----- */
    const body = loading ? (Array.from({ length: Math.min(pageSize !== null && pageSize !== void 0 ? pageSize : 5, 8) }, (_, i) => (<Skeleton_1.Skeleton key={i} gap={s.py / 2} structure={[{ w: Math.max(40, contentWidth - 8), h: s.fs }]} borderBottomWidth={react_native_1.StyleSheet.hairlineWidth} borderColor={border}/>))) : visible.length === 0 ? (<Box_1.Box p={4} alignItems="center" w={scrollX ? width : undefined}>
            {(store === null || store === void 0 ? void 0 : store.status) === 'error'
            ? <StoreFooter store={store} accent={accent}/>
            : emptyComponent !== null && emptyComponent !== void 0 ? emptyComponent : <Text_1.Text color="silver.100" fontSize={s.fs} {..._emptyText}>{emptyText !== null && emptyText !== void 0 ? emptyText : (0, translate_1.libT)('noData')}</Text_1.Text>}
        </Box_1.Box>) : height != null ? (
    // Con alto: solo el cuerpo hace scroll (la cabecera queda fija); FlatList pinta solo las filas visibles
    // Tiene su propio alto y su propio scroll: aunque la pantalla sea un ScrollView, no está "anidada" (el aviso
    // de React Native no aplica), así que se le quita ese contexto
    <NotNested>
            <react_native_1.FlatList data={visible} keyExtractor={r => r.key} renderItem={renderRow} style={{ height }} nestedScrollEnabled initialNumToRender={20} windowSize={7} extraData={[selected, expanded, widths, striped]} 
    // Con store: al llegar al final, la siguiente página
    onEndReached={store ? () => { store.loadMore(); } : undefined} onEndReachedThreshold={0.5} ListFooterComponent={store ? <StoreFooter store={store} accent={accent} auto/> : null}/>
        </NotNested>) : (visible.map((item, index) => renderRow({ item, index })));
    const table = (<react_native_1.View style={{ width: scrollX ? contentWidth : '100%' }}>
            {header}
            {body}
            {/* Con store y sin height: "Cargar más" bajo las filas */}
            {store && height == null && visible.length > 0 && <StoreFooter store={store} accent={accent}/>}
            {footer}
        </react_native_1.View>);
    /* ----- Paginador ----- */
    const from = sorted.length ? currentPage * (pageSize !== null && pageSize !== void 0 ? pageSize : 0) + 1 : 0;
    const to = Math.min(sorted.length, (currentPage + 1) * (pageSize !== null && pageSize !== void 0 ? pageSize : 0));
    const pager = pageSize != null && !loading && sorted.length > 0 && (<Box_1.Box flexDir="row" alignItems="center" justifyContent="flex-end" gap={2} px={2} py={1.5} borderTopWidth={react_native_1.StyleSheet.hairlineWidth} borderColor={border} {..._pagination}>
            <Text_1.Text fontSize={12} color="gray">{(0, translate_1.libT)('pageRange', { from, to, total: sorted.length })}</Text_1.Text>
            {['first', 'prev', 'next', 'last'].map(dir => {
            const target = dir === 'first' ? 0 : dir === 'prev' ? currentPage - 1 : dir === 'next' ? currentPage + 1 : pages - 1;
            const disabled = target < 0 || target > pages - 1 || target === currentPage;
            const icon = { first: 'page-first', prev: 'chevron-left', next: 'chevron-right', last: 'page-last' }[dir];
            return (<react_native_1.Pressable key={dir} disabled={disabled} onPress={() => setPage(target)} accessibilityRole="button" accessibilityLabel={dir} hitSlop={6} style={({ pressed }) => ({ opacity: disabled ? 0.3 : pressed ? 0.5 : 1, padding: 2 })}>
                        <Icon_1.Icon as="MaterialCommunityIcons" name={icon} size={22} color={(disabled ? 'silver.100' : accent)}/>
                    </react_native_1.Pressable>);
        })}
        </Box_1.Box>);
    return (<Box_1.Box borderWidth={1} borderColor={border} rounded={1} overflow="hidden" {...boxProps}>
            <react_native_1.View onLayout={onLayout}>
                {scrollX
            ? <react_native_1.ScrollView horizontal nestedScrollEnabled showsHorizontalScrollIndicator>{table}</react_native_1.ScrollView>
            : table}
            </react_native_1.View>
            {pager}
        </Box_1.Box>);
}
/** Con store: spinner al cargar más, error con reintentar y (sin scroll propio) el botón "Cargar más" */
const StoreFooter = ({ store, accent, auto }) => {
    const { status, hasMore, data } = (0, react_1.useSyncExternalStore)(store.subscribe, store.getState);
    if (status === 'loadingMore')
        return <Box_1.Box p={3} alignItems="center"><Spinner_1.Spinner color={accent}/></Box_1.Box>;
    const button = (label, onPress, icon) => (<react_native_1.Pressable onPress={onPress} accessibilityRole="button" hitSlop={8} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 12 })}>
            <Icon_1.Icon as="Feather" name={icon} size={14} color={accent}/>
            <Text_1.Text color={accent} fontWeight="700" fontSize={13}>{label}</Text_1.Text>
        </react_native_1.Pressable>);
    if (status === 'error')
        return (<Box_1.Box alignItems="center">
            <Text_1.Text color="gray" fontSize={13} pt={2}>{(0, translate_1.libT)('loadError')}</Text_1.Text>
            {button((0, translate_1.libT)('retry'), () => { store.retry(); }, 'refresh-cw')}
        </Box_1.Box>);
    if (!auto && hasMore && data.length > 0 && status === 'success')
        return button((0, translate_1.libT)('loadMore'), () => { store.loadMore(); }, 'chevron-down');
    return null;
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
exports.Table = TableBase;
