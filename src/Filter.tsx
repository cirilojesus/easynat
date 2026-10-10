// Filter: campos de filtro declarativos (texto, select, autocompletar, fecha, rango, switch, checkbox, radio) sobre
// un FormGroupRef propio. Es solo el contenido: va donde se quiera (en la pantalla, en un Collapse, en un modal).
// Avisa con los valores ya limpios (sin vacíos), o escribe directamente en un ListStore. Con FilterChips se ven
// los filtros activos en otra parte, con filterCount se cuentan y con filterData se filtran datos locales (Table)
import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Pressable } from "react-native";
import type { ListStore } from "./AsyncList";
import { Box, EABoxProps } from "./Box";
import { Button, EAButtonProps } from "./Button";
import { Control, FormGroupRef } from "./EAForm";
import { Icon } from "./Icon";
import { Select } from "./Select";
import { EATextProps, Text } from "./Text";
import { getLang, libT } from "./utils/translate";
import { useThemeProps } from "./utils/useThemeProps";

/* ---------------- Tipos ---------------- */

export type FilterOption = { label: string; value: string | number };

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

/* ---------------- Utilidades (también públicas) ---------------- */

const isEmptyValue = (v: unknown) =>
    v === undefined || v === null || v === '' || v === false
    || (Array.isArray(v) && v.length === 0)
    || (typeof v === 'object' && !Array.isArray(v) && v !== null && 'start' in (v as any) && !(v as any).start && !(v as any).end);

/** El vacío de cada tipo (lo que tiene un campo sin filtro) */
const emptyOf = (f: FilterField) => (f.type === 'switch' || f.type === 'checkbox' ? false : f.type === 'autocomplete' && f.props?.multiple ? [] : null);

/** El valor de un campo tal y como se le pasa a la API (autocomplete: el value de la opción) */
const outValue = (field: FilterField, v: any) => {
    if (field.type === 'autocomplete') return Array.isArray(v) ? v.map(o => o?.value ?? o) : v?.value ?? v;
    return v;
};

/** Los filtros activos (sin vacíos) de estos campos, listos para la API */
export const cleanFilters = (fields: FilterField[], values: FilterValues): FilterValues => Object.fromEntries(
    fields.filter(f => !isEmptyValue(values?.[f.name])).map(f => [f.name, outValue(f, values[f.name])]),
);

/** Cuántos filtros hay activos (para un "Filtros (2)" en tu botón) */
export const filterCount = (fields: FilterField[], values: FilterValues) => fields.filter(f => !isEmptyValue(values?.[f.name])).length;

const dateText = (iso: string) => {
    const d = new Date(iso);
    return isNaN(d.getTime()) ? String(iso) : d.toLocaleDateString(getLang());
};

/** El texto del chip de un filtro activo */
const chipText = (field: FilterField, v: any): string => {
    if (field.formatChip) return field.formatChip(v);
    const label = field.label ?? field.name;
    const option = (val: any) => field.options?.find(o => o.value == (val?.value ?? val))?.label ?? String(val?.label ?? val);
    switch (field.type) {
        case 'switch': case 'checkbox': return label;
        case 'select': case 'radio': return `${label}: ${option(v)}`;
        case 'autocomplete': return `${label}: ${Array.isArray(v) ? v.map(option).join(', ') : option(v)}`;
        case 'date': return `${label}: ${dateText(v)}`;
        case 'dateRange': return `${label}: ${v.start ? dateText(v.start) : '…'} – ${v.end ? dateText(v.end) : '…'}`;
        // Texto sin label (p. ej. la búsqueda): solo lo escrito
        default: return field.label ? `${label}: ${v}` : `“${v}”`;
    }
};

const normalize = (s: unknown) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const day = (v: unknown) => (v instanceof Date ? v.toISOString() : String(v ?? '')).slice(0, 10);

/**
 * Filtra datos locales (p. ej. las filas de un Table) con los valores de un Filter y sus campos. Texto: contiene
 * (sin mayúsculas ni acentos, en searchIn); select / radio / autocomplete: igual (o está entre los elegidos);
 * switch / checkbox: verdadero; fecha: desde (compare 'to' para hasta); rango: entre. match lo cambia por campo
 * @example <Table data={filterData(productos, filtros, CAMPOS)} columns={...} />
 */
export function filterData<R>(rows: R[], values: FilterValues, fields: FilterField<R>[]): R[] {
    const active = fields.filter(f => !isEmptyValue(values?.[f.name]));
    if (!active.length) return rows;
    return rows.filter(row => active.every(f => {
        const raw = values[f.name];
        if (f.match) return f.match(row, outValue(f, raw));
        const keys = (f.searchIn?.length ? f.searchIn : [f.name]) as string[];
        const cell = (row as any)?.[keys[0]];
        switch (f.type ?? 'text') {
            case 'text': { const q = normalize(raw); return keys.some(k => normalize((row as any)?.[k]).includes(q)) }
            case 'select': case 'radio': return cell == raw;
            case 'autocomplete': { const v = outValue(f, raw); return Array.isArray(v) ? v.some(x => x == cell) : cell == v }
            case 'switch': case 'checkbox': return !!cell;
            case 'date': { const a = day(cell), b = day(raw); return f.compare === 'to' ? a <= b : f.compare === 'equal' ? a === b : a >= b }
            case 'dateRange': { const a = day(cell); return (!raw.start || a >= day(raw.start)) && (!raw.end || a <= day(raw.end)) }
            default: return true;
        }
    }));
}

const isTyping = (field?: FilterField) => !field || !field.type || field.type === 'text';

/** Los params de un store (o {} sin store), con re-render al cambiar */
const noop = () => () => { };
const EMPTY = {};
const useStoreParams = (store?: ListStore<any, any>) =>
    useSyncExternalStore(store ? store.subscribe : noop, () => (store ? store.getState().params : EMPTY));

/* ---------------- FilterChips ---------------- */

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
export const FilterChips: React.FC<FilterChipsProps> = ({ fields, value, store, onChange, showClearAll, _chip, _chipText, ...boxProps }) => {
    const params = useStoreParams(store);
    const values = store ? params : value ?? {};
    const active = fields.filter(f => !isEmptyValue(values[f.name]));
    if (!active.length) return null;
    const remove = (names: string[]) => {
        const next = { ...values };
        names.forEach(n => delete next[n]);
        if (store) store.setParams(Object.fromEntries(names.map(n => [n, undefined])));
        onChange?.(cleanFilters(fields, next));
    };
    const chip = (key: string, text: string, onPress: () => void, label: string) => (
        <Box key={key} flexDir="row" alignItems="center" gap={1} bg="light.50" rounded={20} pl={2.5} pr={1} py={1} {..._chip}>
            <Text fontSize={12} numberOfLines={1} style={{ maxWidth: 220 }} {..._chipText}>{text}</Text>
            <Pressable onPress={onPress} hitSlop={8} accessibilityRole="button" accessibilityLabel={label}>
                <Icon as="Feather" name="x" size={14} color="gray.100" />
            </Pressable>
        </Box>
    );
    return (
        <Box flexDir="row" flexWrap="wrap" gap={6} {...boxProps}>
            {active.map(f => chip(f.name, chipText(f, values[f.name]), () => remove([f.name]), `× ${f.label ?? f.name}`))}
            {showClearAll && active.length > 1 && chip('__all', libT('clearFilters'), () => remove(active.map(f => f.name)), libT('clearFilters'))}
        </Box>
    );
};

/* ---------------- Filter ---------------- */

/**
 * Campos de filtro. Es solo el contenido: va directo en la pantalla, dentro de un Collapse o en un modal
 * @example
 * <Filter fields={[{ name: 'q', placeholder: 'Buscar…' }]} store={pedidos} />          // búsqueda en la pantalla
 * <Filter fields={FILTROS} store={pedidos} mode="apply" onApply={() => close()} />    // el resto, en un modal
 * <Filter fields={CAMPOS} onChange={setFiltros} />  +  <Table data={filterData(filas, filtros, CAMPOS)} />
 */
export const Filter = forwardRef<FilterRef, FilterProps>((rawProps, ref) => {
    // Defaults → theme.components.Filter → variante → props → plataforma
    const [p] = useThemeProps<FilterProps>('Filter', rawProps);
    const {
        fields, onChange, store, value: valueProp, mode = 'live', onApply, debounce = 400, showChips = false,
        showClear = fields.length > 1, clearText, applyText, _control, _actions, _clear, _apply, _chip, _chipText,
        variant: _v, ...boxProps
    } = p;
    const storeParams = useStoreParams(store);
    const value = store ? storeParams : valueProp;
    const byName = useMemo(() => Object.fromEntries(fields.map(f => [f.name, f])), [fields]);

    // Lo que tiene cada campo al empezar: lo que ya haya (value / params del store) o su defaultValue
    const initialOf = (f: FilterField) => {
        const v = value?.[f.name];
        if (v === undefined || v === null) return f.defaultValue ?? emptyOf(f);
        // autocomplete: el value que viene de la API se vuelve a convertir en su opción
        if (f.type === 'autocomplete') return Array.isArray(v) ? v.map(x => f.options?.find(o => o.value == x) ?? x) : f.options?.find(o => o.value == v) ?? v;
        return v;
    };
    // El formulario interno se crea una sola vez
    const [form] = useState(() => new FormGroupRef(Object.fromEntries(fields.map(f => [f.name, [initialOf(f)]])) as Record<string, [any]>));

    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;
    // Lo último de cada render para la suscripción (fields puede ser un array nuevo en cada render: así no se rehace)
    const latest = useRef({ fields, byName, store });
    latest.current = { fields, byName, store };
    // Campos que llegan después de montar: entran en el formulario
    useEffect(() => { fields.forEach(f => { if (!form.hasControl(f.name)) form.addControl(f.name, [initialOf(f)]) }) }, [fields]);
    // Lo último aplicado (los chips muestran esto)
    const [applied, setApplied] = useState<FilterValues>(() => form.getValues());
    const emit = (all: FilterValues) => {
        const { fields, store } = latest.current;
        setApplied(all);
        const clean = cleanFilters(fields, all);
        // Con store: solo sus campos (los vacíos se quitan de los params; los de otros Filter se quedan)
        store?.setParams(Object.fromEntries(fields.map(f => [f.name, clean[f.name]])));
        onChangeRef.current?.(clean, all);
        return clean;
    };

    // Cambios del formulario: al momento, o con debounce si se está escribiendo (los de texto)
    const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    useEffect(() => {
        let prev = form.getValues();
        const unsubscribe = form.subscribe('FORM_REF')(() => {
            const now = form.getValues();
            const changed = Object.keys(now).find(k => JSON.stringify(now[k]) !== JSON.stringify(prev[k]));
            prev = now;
            if (!changed || mode !== 'live') return;
            clearTimeout(timer.current);
            if (isTyping(latest.current.byName[changed]) && debounce > 0) timer.current = setTimeout(() => emit(form.getValues()), debounce);
            else emit(now);
        });
        return () => { unsubscribe(); clearTimeout(timer.current) };
    }, [mode, debounce]);

    // value (o los params del store) que cambia desde fuera: se carga sin volver a avisar
    const valueKey = JSON.stringify(cleanFilters(fields, value ?? {}));
    useEffect(() => {
        if (!value) return;
        if (JSON.stringify(cleanFilters(fields, form.getValues())) === valueKey) return;
        const next = Object.fromEntries(fields.map(f => [f.name, initialOf(f)]));
        clearTimeout(timer.current);
        form.setValue(next);
        setApplied(next);
    }, [valueKey]);

    const clearFields = (names: string[]) => {
        clearTimeout(timer.current);
        form.setValue(Object.fromEntries(fields.filter(f => names.includes(f.name)).map(f => [f.name, emptyOf(f)])));
        emit(form.getValues());
    };
    const clear = () => clearFields(fields.map(f => f.name));
    const apply = () => { clearTimeout(timer.current); onApply?.(emit(form.getValues())) };
    useImperativeHandle(ref, () => ({ clear, apply, getValues: () => cleanFilters(fields, form.getValues()) }));

    /* ----- Un campo ----- */
    const renderField = (f: FilterField) => {
        const type = f.type ?? 'text';
        const flags = {
            isSelect: type === 'select', isSearch: type === 'autocomplete', isDate: type === 'date' || type === 'dateRange',
            isSwitch: type === 'switch', isCheckBox: type === 'checkbox', isRadio: type === 'radio',
        };
        const extra: Record<string, any> = {
            ...(type === 'dateRange' && { type: 'date-range' }),
            ...(type === 'autocomplete' && { data: f.options ?? [], _item: { label: 'label', value: 'value' } }),
            // Texto sin label: una búsqueda (con su lupa)
            ...(type === 'text' && !f.label && { iconLeft: <Icon as="Feather" name="search" size={16} color="silver.100" ml={3} />, returnKeyType: 'search' }),
        };
        const options = type === 'select'
            ? (f.options ?? []).map(o => <Select.Item key={String(o.value)} label={o.label} value={o.value} />)
            : type === 'radio' ? (f.options ?? []).map(o => <Control.Item key={String(o.value)} label={o.label} value={o.value} />) : undefined;
        return (
            <Box key={f.name} style={{ flexBasis: f.width === 'half' ? '45%' : '100%', flexGrow: 1 }}>
                <Control
                    formGroup={form}
                    formControl={f.name}
                    label={f.label}
                    // Sin placeholder: el label en los de texto y "Selecciona" en los de elegir (el DatePicker mostraría 0000-00-00)
                    placeholder={f.placeholder ?? (type === 'text' ? f.label : ['select', 'date', 'dateRange', 'autocomplete'].includes(type) ? libT('select') : undefined)}
                    {...flags}
                    {...extra}
                    {..._control}
                    {...f.props}
                >
                    {options}
                </Control>
            </Box>
        );
    };

    return (
        <Box flexDir="row" flexWrap="wrap" gap={10} {...boxProps}>
            {fields.map(renderField)}
            {(showClear || mode === 'apply') && (
                <Box flexDir="row" gap={8} style={{ flexBasis: '100%' }} {..._actions}>
                    {showClear && <Button flex={1} size="sm" variant="outline" onPress={clear} {..._clear}>{clearText ?? libT('clearFilters')}</Button>}
                    {mode === 'apply' && <Button flex={1} size="sm" onPress={apply} {..._apply}>{applyText ?? libT('apply')}</Button>}
                </Box>
            )}
            {showChips && (
                // Quitar un chip vacía ese campo (y avisa)
                <FilterChips fields={fields} value={applied} style={{ flexBasis: '100%' }} _chip={_chip} _chipText={_chipText}
                    onChange={next => clearFields(fields.filter(f => !(f.name in next)).map(f => f.name))} />
            )}
        </Box>
    );
});
