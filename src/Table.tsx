// Table: tabla de datos. Columnas que reparten el ancho (y scroll horizontal si no caben), cabecera fija con
// height, ordenar al tocar la cabecera, selección con casillas, filas desplegables, paginación, fila de totales,
// carga con Skeleton y estado vacío
import React, { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { FlatList, LayoutChangeEvent, Pressable, ScrollView, StyleSheet, View } from "react-native";
import type { ListStore } from "./AsyncList";
import { Box, EABoxProps } from "./Box";
import { CheckBox } from "./CheckBox";
import { Icon } from "./Icon";
import { Skeleton } from "./Skeleton";
import { Spinner } from "./Spinner";
import { EATextProps, Text } from "./Text";
import { ThemeColor } from "./theme";
import { libT } from "./utils/translate";
import { mergeProps, useThemeProps } from "./utils/useThemeProps";

/* ---------------- Tipos ---------------- */

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

const isGroup = <T,>(c: TableColumn<T> | TableColumnGroup<T>): c is TableColumnGroup<T> => Array.isArray((c as TableColumnGroup<T>).children);

export type TableSort = { key: string; direction: 'asc' | 'desc' } | null;

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

/* ---------------- Utilidades ---------------- */

const SIZES = { sm: { px: 8, py: 6, fs: 12 }, md: { px: 12, py: 10, fs: 14 }, lg: { px: 14, py: 14, fs: 15 } };
const CHECK_W = 44;
const EXPAND_W = 36;

const valueOf = <T,>(col: TableColumn<T>, row: T): unknown =>
    typeof col.value === 'function' ? col.value(row) : (row as any)?.[col.value ?? col.key];

const defaultKey = (row: any, index: number) => String(row?.id ?? row?.key ?? index);
const noop = () => () => { };
const noState = () => null;

/** El color con poca opacidad (para el fondo de la fila seleccionada): '#4F46E5' → '#4F46E51F' */
const tint = (hex: string, alpha = '1F') => (/^#[0-9a-f]{6}([0-9a-f]{2})?$/i.test(hex) ? hex.slice(0, 7) + alpha : hex);

/** Para ordenar: números, fechas y textos (con números dentro, "a2" < "a10"); vacíos al final */
const compare = (a: unknown, b: unknown) => {
    const empty = (v: unknown) => v === null || v === undefined || v === '';
    if (empty(a) || empty(b)) return empty(a) === empty(b) ? 0 : empty(a) ? 1 : -1;
    const n = (v: unknown) => (v instanceof Date ? v.getTime() : typeof v === 'number' ? v : NaN);
    if (!Number.isNaN(n(a)) && !Number.isNaN(n(b))) return n(a) - n(b);
    return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
};

/** Estado controlado (prop) o propio (default), con aviso al cambiar */
function useControlled<V>(value: V | undefined, initial: V, onChange?: (v: V) => void): [V, (v: V) => void] {
    const [own, setOwn] = useState(initial);
    const current = value !== undefined ? value : own;
    return [current, v => { if (value === undefined) setOwn(v); onChange?.(v) }];
}

// ScrollView.Context existe en React Native pero no está en sus tipos (si faltara, la lista se pinta tal cual)
const ScrollContext = (ScrollView as unknown as { Context?: React.Context<unknown> }).Context;
const NotNested = ({ children }: { children: React.ReactNode }) =>
    ScrollContext ? <ScrollContext.Provider value={null}>{children}</ScrollContext.Provider> : <>{children}</>;

/* ---------------- Componente ---------------- */

function TableBase<T>(props: TableProps<T>) {
    // Defaults → theme.components.Table → variante → props → plataforma
    const [p, theme] = useThemeProps<TableProps<any>>('Table', props as TableProps<any>);
    const {
        data: dataProp, store, columns: columnsProp, keyField, keyExtractor: keyExtractorProp, striped = false, bordered = false, size = 'md', height, columnMinWidth = 100,
        rowStyle: rowStyleProp, onRowPress, onRowLongPress, sort: sortProp, defaultSort = null, onSortChange, manualSort = false,
        selectable = false, selectedKeys, defaultSelectedKeys = [], onSelectionChange,
        renderExpanded, expandedKeys, defaultExpandedKeys = [], onExpandedChange,
        pageSize, page: pageProp, defaultPage = 0, onPageChange, loading: loadingProp = false, emptyText, emptyComponent, colorScheme = 'primary',
        _header, _headerText, _row, _text, _cell, _stripedRow, _selectedRow, _footer, _footerText, _expanded, _pagination, _emptyText,
        variant: _v, ...boxProps
    } = p;
    // Con store: sus filas y su estado (re-render cuando cambia)
    const storeState = useSyncExternalStore(store ? store.subscribe : noop, store ? store.getState : noState);
    const data = (store ? storeState?.data : dataProp) ?? [];
    const loading = loadingProp || (!!store && data.length === 0 && (storeState?.status === 'loading' || storeState?.status === 'idle'));
    // Memorizada: si cambiara en cada render, las filas se recalcularían siempre
    const keyExtractor = useMemo(() => keyExtractorProp
        ?? (store ? store.keyOf : keyField != null ? (row: any, i: number) => String(row?.[keyField] ?? i) : defaultKey), [keyExtractorProp, store, keyField]);
    // Con store: la primera página al montarse (si nadie la ha pedido ya)
    useEffect(() => { if (store && store.status === 'idle') store.load() }, [store]);
    // Las columnas "hoja" (sin grupos): con ellas va todo (anchos, orden, celdas); los grupos solo son la cabecera
    const columns = useMemo(() => columnsProp.flatMap(c => (isGroup(c) ? c.children : [c])), [columnsProp]);
    const color = (c: string) => theme.colors?.[c as ThemeColor] || c;
    const accent = color(`${colorScheme}.100`);
    const border = color('light.100');
    const s = SIZES[size] ?? SIZES.md;

    const [width, setWidth] = useState(0);
    const onLayout = (e: LayoutChangeEvent) => { const w = Math.round(e.nativeEvent.layout.width); setWidth(prev => (prev === w ? prev : w)) };

    const [sort, setSort] = useControlled<TableSort>(sortProp, defaultSort, onSortChange);
    const [selected, setSelected] = useControlled<string[]>(selectedKeys, defaultSelectedKeys);
    const [expanded, setExpanded] = useControlled<string[]>(expandedKeys, defaultExpandedKeys, onExpandedChange);
    const [page, setPage] = useControlled<number>(pageProp, defaultPage, onPageChange);

    // Filas con su clave e índice original (el índice que reciben render, onRowPress...)
    const rows = useMemo(() => data.map((row, index) => ({ row, index, key: keyExtractor(row, index) })), [data, keyExtractor]);
    const sorted = useMemo(() => {
        if (!sort || manualSort) return rows;
        const col = columns.find(c => c.key === sort.key);
        if (!col) return rows;
        const get = (r: { row: any }) => (col.sortValue ? col.sortValue(r.row) : valueOf(col, r.row));
        const dir = sort.direction === 'desc' ? -1 : 1;
        return [...rows].sort((a, b) => compare(get(a), get(b)) * dir || a.index - b.index);
    }, [rows, sort, manualSort, columns]);

    const pages = pageSize ? Math.max(1, Math.ceil(sorted.length / pageSize)) : 1;
    const currentPage = Math.min(Math.max(0, page), pages - 1);
    const visible = pageSize ? sorted.slice(currentPage * pageSize, (currentPage + 1) * pageSize) : sorted;

    // Anchos: los fijos, y el sobrante repartido por flex (sin bajar del mínimo). Si no caben: scroll horizontal
    const extra = (selectable ? CHECK_W : 0) + (renderExpanded ? EXPAND_W : 0);
    const widths = useMemo(() => {
        const out = columns.map(c => c.width ?? 0);
        let free = Math.max(0, width - columns.reduce((a, c) => a + (c.width ?? 0), extra));
        // Las que no llegarían a su mínimo se quedan con el mínimo; el resto se reparte entre las demás (por flex)
        let pending = columns.map((c, i) => i).filter(i => columns[i].width == null);
        while (pending.length) {
            const totalFlex = pending.reduce((a, i) => a + (columns[i].flex ?? 1), 0) || 1;
            const min = (i: number) => columns[i].minWidth ?? columnMinWidth;
            const short = pending.filter(i => (free * (columns[i].flex ?? 1)) / totalFlex < min(i));
            if (!short.length) {
                pending.forEach(i => { out[i] = Math.floor((free * (columns[i].flex ?? 1)) / totalFlex) });
                // Los píxeles del redondeo, a la última (así llena el ancho justo)
                out[pending[pending.length - 1]] += free - pending.reduce((a, i) => a + out[i], 0);
                break;
            }
            short.forEach(i => { out[i] = min(i); free = Math.max(0, free - min(i)) });
            pending = pending.filter(i => !short.includes(i));
        }
        return out;
    }, [columns, width, extra, columnMinWidth]);
    const contentWidth = widths.reduce((a, b) => a + b, extra);
    /** El ancho de una celda que ocupa `span` columnas desde la i */
    const spanWidth = (i: number, span: number) => (span === 1 ? widths[i] : widths.slice(i, i + span).reduce((a, b) => a + b, 0));
    const scrollX = width > 0 && contentWidth > width + 0.5;

    const toggleSort = (key: string) => {
        // asc → desc → sin orden
        const next: TableSort = sort?.key !== key ? { key, direction: 'asc' } : sort.direction === 'asc' ? { key, direction: 'desc' } : null;
        setSort(next);
    };
    // Set: comprobar si una fila está elegida es inmediato (con includes, cada fila recorría toda la selección)
    const selectedSet = useMemo(() => new Set(selected), [selected]);
    const expandedSet = useMemo(() => new Set(expanded), [expanded]);
    const emitSelection = (keys: string[]) => {
        setSelected(keys);
        const set = new Set(keys);
        onSelectionChange?.(keys, rows.filter(r => set.has(r.key)).map(r => r.row));
    };
    const toggleRow = (key: string) => {
        if (selectable === 'single') return emitSelection(selected[0] === key ? [] : [key]);
        emitSelection(selectedSet.has(key) ? selected.filter(k => k !== key) : [...selected, key]);
    };
    const allSelected = rows.length > 0 && rows.every(r => selectedSet.has(r.key));
    const toggleAll = () => emitSelection(allSelected ? [] : rows.map(r => r.key));
    const toggleExpanded = (key: string) => setExpanded(expandedSet.has(key) ? expanded.filter(k => k !== key) : [...expanded, key]);

    const justify = (align?: TableAlign) => (align === 'right' ? 'flex-end' : align === 'center' ? 'center' : 'flex-start');
    const cellBorder = bordered ? { borderRightWidth: StyleSheet.hairlineWidth, borderColor: border } : null;
    const baseText = mergeProps<EATextProps>({ fontSize: s.fs, color: 'dark.100' }, _text);

    /* ----- Cabecera ----- */
    const headerCell = (c: TableColumn<any>, i: number) => {
        const active = sort?.key === c.key;
        const title = (
            <Box flexDir="row" alignItems="center" gap={1} justifyContent={justify(c.align)} flex={1}>
                {typeof c.title === 'string' || typeof c.title === 'number' || c.title == null
                    ? <Text fontSize={s.fs - 1} fontWeight="700" color={active ? accent as any : 'gray.100'} textAlign={c.align} {..._headerText} {...c._headerText}>{c.title ?? c.key}</Text>
                    : c.title}
                {c.sortable && (
                    <Icon as="MaterialCommunityIcons" size={14} color={(active ? accent : 'silver.100') as any}
                        name={!active ? 'unfold-more-horizontal' : sort!.direction === 'asc' ? 'arrow-up' : 'arrow-down'} />
                )}
            </Box>
        );
        const cellStyle = [{ width: widths[i], paddingHorizontal: s.px, paddingVertical: s.py, justifyContent: 'center' as const }, i < columns.length - 1 ? cellBorder : null];
        return c.sortable ? (
            <Pressable key={c.key} onPress={() => toggleSort(c.key)} accessibilityRole="button" accessibilityLabel={typeof c.title === 'string' ? c.title : c.key}
                accessibilityState={{ selected: active }} style={({ pressed }) => [...cellStyle, { opacity: pressed ? 0.6 : 1 }]}>
                <Box {...c._header}>{title}</Box>
            </Pressable>
        ) : (
            <View key={c.key} style={cellStyle}><Box {...c._header}>{title}</Box></View>
        );
    };
    // Con grupos: cada grupo es una columna con su título arriba y sus columnas debajo; las demás ocupan todo el alto
    let leaf = 0;
    const header = (
        <Box flexDir="row" bg="light.50" borderBottomWidth={1} borderColor={border as any} {..._header}>
            {renderExpanded && <View style={[{ width: EXPAND_W }, cellBorder]} />}
            {selectable && (
                <Box w={CHECK_W} alignItems="center" justifyContent="center" style={cellBorder ?? undefined}>
                    {selectable !== 'single' && <CheckBox size="sm" checked={allSelected} onChange={toggleAll} colorScheme={colorScheme as any} accessibilityLabel="all" />}
                </Box>
            )}
            {columnsProp.map((c, gi) => {
                if (!isGroup(c)) return headerCell(c, leaf++);
                const first = leaf;
                const cells = c.children.map(child => headerCell(child, leaf++));
                const width = widths.slice(first, leaf).reduce((a, b) => a + b, 0);
                return (
                    <View key={`group-${gi}`} style={{ width }}>
                        {/* El título del grupo (con su borde derecho si no es el último: el de abajo lo ponen sus columnas) */}
                        <Box px={s.px} py={s.py / 1.5} borderBottomWidth={StyleSheet.hairlineWidth} borderColor={border as any} alignItems={justify(c.align ?? 'center')}
                            style={leaf < columns.length ? cellBorder ?? undefined : undefined} {...c._header}>
                            {typeof c.title === 'string' || typeof c.title === 'number'
                                ? <Text fontSize={s.fs - 1} fontWeight="700" color="gray.100" {..._headerText} {...c._headerText}>{c.title}</Text>
                                : c.title}
                        </Box>
                        <View style={{ flexDirection: 'row', flex: 1 }}>{cells}</View>
                    </View>
                );
            })}
        </Box>
    );

    /* ----- Filas ----- */
    const renderRow = ({ item, index: position }: { item: { row: any; index: number; key: string }; index: number }) => {
        const { row, index, key } = item;
        const isSelected = selectedSet.has(key);
        const isExpanded = !!renderExpanded && expandedSet.has(key);
        const rowStyle = mergeProps<EABoxProps>(_row, striped && position % 2 === 1 ? { bg: 'light.50', ..._stripedRow } : null, rowStyleProp?.(row, index), isSelected ? { bg: tint(accent) as any, ..._selectedRow } : null);
        const press = onRowPress ? () => onRowPress(row, index) : renderExpanded ? () => toggleExpanded(key) : undefined;
        let covered = 0;
        const content = (pressed: boolean) => (
                        <Box flexDir="row" borderBottomWidth={StyleSheet.hairlineWidth} borderColor={border as any} {...rowStyle} opacity={pressed ? 0.7 : 1}>
                            {renderExpanded && (
                                <Pressable onPress={() => toggleExpanded(key)} hitSlop={6} accessibilityRole="button" accessibilityLabel="expand" accessibilityState={{ expanded: isExpanded }}
                                    style={[{ width: EXPAND_W, alignItems: 'center', justifyContent: 'center' }, cellBorder]}>
                                    <Icon as="MaterialCommunityIcons" name={isExpanded ? 'chevron-down' : 'chevron-right'} size={20} color={'gray.100' as any} />
                                </Pressable>
                            )}
                            {selectable && (
                                <Box w={CHECK_W} alignItems="center" justifyContent="center" style={cellBorder ?? undefined}>
                                    <CheckBox size="sm" checked={isSelected} onChange={() => toggleRow(key)} colorScheme={colorScheme as any} rounded={selectable === 'single' ? 40 : undefined} />
                                </Box>
                            )}
                            {columns.map((c, i) => {
                                // Tapada por el colSpan de una celda anterior
                                if (i < covered) return null;
                                const span = Math.max(1, Math.min(columns.length - i, Math.floor(typeof c.colSpan === 'function' ? c.colSpan(row, index) : c.colSpan ?? 1)));
                                covered = i + span;
                                const value = valueOf(c, row);
                                return (
                                    <Box key={c.key} style={[{ width: spanWidth(i, span), paddingHorizontal: s.px, paddingVertical: s.py, justifyContent: 'center', alignItems: justify(c.align) }, i + span < columns.length ? cellBorder : null]}
                                        {..._cell} {...c._cell}>
                                        {c.render ? c.render(row, index, value) : (
                                            <Text {...baseText} textAlign={c.align} numberOfLines={c.numberOfLines} {...c._text}>
                                                {c.format ? c.format(value, row, index) : value == null ? '' : String(value)}
                                            </Text>
                                        )}
                                    </Box>
                                );
                            })}
                        </Box>
        );
        return (
            <View key={key}>
                {/* Solo las filas que se pueden tocar llevan Pressable (más ligero con muchas filas) */}
                {press || onRowLongPress ? (
                    <Pressable onPress={press} onLongPress={onRowLongPress ? () => onRowLongPress(row, index) : undefined}
                        accessibilityRole="button" accessibilityState={selectable ? { selected: isSelected } : undefined}>
                        {({ pressed }) => content(pressed)}
                    </Pressable>
                ) : (
                    <View accessibilityState={selectable ? { selected: isSelected } : undefined}>{content(false)}</View>
                )}
                {isExpanded && (
                    <Box px={s.px} py={s.py} bg="light.50" borderBottomWidth={StyleSheet.hairlineWidth} borderColor={border as any} {..._expanded}>
                        {renderExpanded!(row, index)}
                    </Box>
                )}
            </View>
        );
    };

    /* ----- Totales ----- */
    let footerCovered = 0;
    const hasFooter = columns.some(c => c.footer != null);
    const footer = hasFooter && !loading && visible.length > 0 && (
        <Box flexDir="row" bg="light.50" borderTopWidth={1} borderColor={border as any} {..._footer}>
            {renderExpanded && <View style={{ width: EXPAND_W }} />}
            {selectable && <View style={{ width: CHECK_W }} />}
            {columns.map((c, i) => {
                if (i < footerCovered) return null;
                const span = Math.max(1, Math.min(columns.length - i, Math.floor(c.footerColSpan ?? 1)));
                footerCovered = i + span;
                const content = typeof c.footer === 'function' ? c.footer(sorted.map(r => r.row)) : c.footer;
                return (
                    <Box key={c.key} style={[{ width: spanWidth(i, span), paddingHorizontal: s.px, paddingVertical: s.py, alignItems: justify(c.align) }, i + span < columns.length ? cellBorder : null]}>
                        {typeof content === 'string' || typeof content === 'number'
                            ? <Text {...baseText} fontWeight="700" textAlign={c.align} {..._footerText}>{content}</Text>
                            : content}
                    </Box>
                );
            })}
        </Box>
    );

    /* ----- Cuerpo ----- */
    const body = loading ? (
        Array.from({ length: Math.min(pageSize ?? 5, 8) }, (_, i) => (
            <Skeleton key={i} gap={s.py / 2} structure={[{ w: Math.max(40, contentWidth - 8), h: s.fs }]} borderBottomWidth={StyleSheet.hairlineWidth} borderColor={border as any} />
        ))
    ) : visible.length === 0 ? (
        <Box p={4} alignItems="center" w={scrollX ? width : undefined}>
            {store?.status === 'error'
                ? <StoreFooter store={store} accent={accent} />
                : emptyComponent ?? <Text color="silver.100" fontSize={s.fs} {..._emptyText}>{emptyText ?? libT('noData')}</Text>}
        </Box>
    ) : height != null ? (
        // Con alto: solo el cuerpo hace scroll (la cabecera queda fija); FlatList pinta solo las filas visibles
        // Tiene su propio alto y su propio scroll: aunque la pantalla sea un ScrollView, no está "anidada" (el aviso
        // de React Native no aplica), así que se le quita ese contexto
        <NotNested>
            <FlatList data={visible} keyExtractor={r => r.key} renderItem={renderRow} style={{ height }} nestedScrollEnabled
                initialNumToRender={20} windowSize={7} extraData={[selected, expanded, widths, striped]}
                // Con store: al llegar al final, la siguiente página
                onEndReached={store ? () => { store.loadMore() } : undefined} onEndReachedThreshold={0.5}
                ListFooterComponent={store ? <StoreFooter store={store} accent={accent} auto /> : null} />
        </NotNested>
    ) : (
        visible.map((item, index) => renderRow({ item, index }))
    );

    const table = (
        <View style={{ width: scrollX ? contentWidth : '100%' }}>
            {header}
            {body}
            {/* Con store y sin height: "Cargar más" bajo las filas */}
            {store && height == null && visible.length > 0 && <StoreFooter store={store} accent={accent} />}
            {footer}
        </View>
    );

    /* ----- Paginador ----- */
    const from = sorted.length ? currentPage * (pageSize ?? 0) + 1 : 0;
    const to = Math.min(sorted.length, (currentPage + 1) * (pageSize ?? 0));
    const pager = pageSize != null && !loading && sorted.length > 0 && (
        <Box flexDir="row" alignItems="center" justifyContent="flex-end" gap={2} px={2} py={1.5} borderTopWidth={StyleSheet.hairlineWidth} borderColor={border as any} {..._pagination}>
            <Text fontSize={12} color="gray">{libT('pageRange', { from, to, total: sorted.length })}</Text>
            {(['first', 'prev', 'next', 'last'] as const).map(dir => {
                const target = dir === 'first' ? 0 : dir === 'prev' ? currentPage - 1 : dir === 'next' ? currentPage + 1 : pages - 1;
                const disabled = target < 0 || target > pages - 1 || target === currentPage;
                const icon = { first: 'page-first', prev: 'chevron-left', next: 'chevron-right', last: 'page-last' }[dir];
                return (
                    <Pressable key={dir} disabled={disabled} onPress={() => setPage(target)} accessibilityRole="button" accessibilityLabel={dir} hitSlop={6}
                        style={({ pressed }) => ({ opacity: disabled ? 0.3 : pressed ? 0.5 : 1, padding: 2 })}>
                        <Icon as="MaterialCommunityIcons" name={icon as any} size={22} color={(disabled ? 'silver.100' : accent) as any} />
                    </Pressable>
                );
            })}
        </Box>
    );

    return (
        <Box borderWidth={1} borderColor={border as any} rounded={1} overflow="hidden" {...boxProps}>
            <View onLayout={onLayout}>
                {scrollX
                    ? <ScrollView horizontal nestedScrollEnabled showsHorizontalScrollIndicator>{table}</ScrollView>
                    : table}
            </View>
            {pager}
        </Box>
    );
}

/** Con store: spinner al cargar más, error con reintentar y (sin scroll propio) el botón "Cargar más" */
const StoreFooter = ({ store, accent, auto }: { store: ListStore<any, any>; accent: string; auto?: boolean }) => {
    const { status, hasMore, data } = useSyncExternalStore(store.subscribe, store.getState);
    if (status === 'loadingMore') return <Box p={3} alignItems="center"><Spinner color={accent as any} /></Box>;
    const button = (label: string, onPress: () => void, icon: string) => (
        <Pressable onPress={onPress} accessibilityRole="button" hitSlop={8}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 12 })}>
            <Icon as="Feather" name={icon as any} size={14} color={accent as any} />
            <Text color={accent as any} fontWeight="700" fontSize={13}>{label}</Text>
        </Pressable>
    );
    if (status === 'error') return (
        <Box alignItems="center">
            <Text color="gray" fontSize={13} pt={2}>{libT('loadError')}</Text>
            {button(libT('retry'), () => { store.retry() }, 'refresh-cw')}
        </Box>
    );
    if (!auto && hasMore && data.length > 0 && status === 'success') return button(libT('loadMore'), () => { store.loadMore() }, 'chevron-down');
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
export const Table = TableBase as <T>(props: TableProps<T>) => React.ReactElement;
