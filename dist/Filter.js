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
exports.Filter = exports.FilterChips = exports.filterCount = exports.cleanFilters = void 0;
exports.filterData = filterData;
// Filter: campos de filtro declarativos (texto, select, autocompletar, fecha, rango, switch, checkbox, radio) sobre
// un FormGroupRef propio. Es solo el contenido: va donde se quiera (en la pantalla, en un Collapse, en un modal).
// Avisa con los valores ya limpios (sin vacíos), o escribe directamente en un ListStore. Con FilterChips se ven
// los filtros activos en otra parte, con filterCount se cuentan y con filterData se filtran datos locales (Table)
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const Box_1 = require("./Box");
const Button_1 = require("./Button");
const EAForm_1 = require("./EAForm");
const Icon_1 = require("./Icon");
const Select_1 = require("./Select");
const Text_1 = require("./Text");
const translate_1 = require("./utils/translate");
const useThemeProps_1 = require("./utils/useThemeProps");
/* ---------------- Utilidades (también públicas) ---------------- */
const isEmptyValue = (v) => v === undefined || v === null || v === '' || v === false
    || (Array.isArray(v) && v.length === 0)
    || (typeof v === 'object' && !Array.isArray(v) && v !== null && 'start' in v && !v.start && !v.end);
/** El vacío de cada tipo (lo que tiene un campo sin filtro) */
const emptyOf = (f) => { var _a; return (f.type === 'switch' || f.type === 'checkbox' ? false : f.type === 'autocomplete' && ((_a = f.props) === null || _a === void 0 ? void 0 : _a.multiple) ? [] : null); };
/** El valor de un campo tal y como se le pasa a la API (autocomplete: el value de la opción) */
const outValue = (field, v) => {
    var _a;
    if (field.type === 'autocomplete')
        return Array.isArray(v) ? v.map(o => { var _a; return (_a = o === null || o === void 0 ? void 0 : o.value) !== null && _a !== void 0 ? _a : o; }) : (_a = v === null || v === void 0 ? void 0 : v.value) !== null && _a !== void 0 ? _a : v;
    return v;
};
/** Los filtros activos (sin vacíos) de estos campos, listos para la API */
const cleanFilters = (fields, values) => Object.fromEntries(fields.filter(f => !isEmptyValue(values === null || values === void 0 ? void 0 : values[f.name])).map(f => [f.name, outValue(f, values[f.name])]));
exports.cleanFilters = cleanFilters;
/** Cuántos filtros hay activos (para un "Filtros (2)" en tu botón) */
const filterCount = (fields, values) => fields.filter(f => !isEmptyValue(values === null || values === void 0 ? void 0 : values[f.name])).length;
exports.filterCount = filterCount;
const dateText = (iso) => {
    const d = new Date(iso);
    return isNaN(d.getTime()) ? String(iso) : d.toLocaleDateString((0, translate_1.getLang)());
};
/** El texto del chip de un filtro activo */
const chipText = (field, v) => {
    var _a;
    if (field.formatChip)
        return field.formatChip(v);
    const label = (_a = field.label) !== null && _a !== void 0 ? _a : field.name;
    const option = (val) => { var _a, _b, _c, _d; return (_c = (_b = (_a = field.options) === null || _a === void 0 ? void 0 : _a.find(o => { var _a; return o.value == ((_a = val === null || val === void 0 ? void 0 : val.value) !== null && _a !== void 0 ? _a : val); })) === null || _b === void 0 ? void 0 : _b.label) !== null && _c !== void 0 ? _c : String((_d = val === null || val === void 0 ? void 0 : val.label) !== null && _d !== void 0 ? _d : val); };
    switch (field.type) {
        case 'switch':
        case 'checkbox': return label;
        case 'select':
        case 'radio': return `${label}: ${option(v)}`;
        case 'autocomplete': return `${label}: ${Array.isArray(v) ? v.map(option).join(', ') : option(v)}`;
        case 'date': return `${label}: ${dateText(v)}`;
        case 'dateRange': return `${label}: ${v.start ? dateText(v.start) : '…'} – ${v.end ? dateText(v.end) : '…'}`;
        // Texto sin label (p. ej. la búsqueda): solo lo escrito
        default: return field.label ? `${label}: ${v}` : `“${v}”`;
    }
};
const normalize = (s) => String(s !== null && s !== void 0 ? s : '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const day = (v) => (v instanceof Date ? v.toISOString() : String(v !== null && v !== void 0 ? v : '')).slice(0, 10);
/**
 * Filtra datos locales (p. ej. las filas de un Table) con los valores de un Filter y sus campos. Texto: contiene
 * (sin mayúsculas ni acentos, en searchIn); select / radio / autocomplete: igual (o está entre los elegidos);
 * switch / checkbox: verdadero; fecha: desde (compare 'to' para hasta); rango: entre. match lo cambia por campo
 * @example <Table data={filterData(productos, filtros, CAMPOS)} columns={...} />
 */
function filterData(rows, values, fields) {
    const active = fields.filter(f => !isEmptyValue(values === null || values === void 0 ? void 0 : values[f.name]));
    if (!active.length)
        return rows;
    return rows.filter(row => active.every(f => {
        var _a, _b;
        const raw = values[f.name];
        if (f.match)
            return f.match(row, outValue(f, raw));
        const keys = (((_a = f.searchIn) === null || _a === void 0 ? void 0 : _a.length) ? f.searchIn : [f.name]);
        const cell = row === null || row === void 0 ? void 0 : row[keys[0]];
        switch ((_b = f.type) !== null && _b !== void 0 ? _b : 'text') {
            case 'text': {
                const q = normalize(raw);
                return keys.some(k => normalize(row === null || row === void 0 ? void 0 : row[k]).includes(q));
            }
            case 'select':
            case 'radio': return cell == raw;
            case 'autocomplete': {
                const v = outValue(f, raw);
                return Array.isArray(v) ? v.some(x => x == cell) : cell == v;
            }
            case 'switch':
            case 'checkbox': return !!cell;
            case 'date': {
                const a = day(cell), b = day(raw);
                return f.compare === 'to' ? a <= b : f.compare === 'equal' ? a === b : a >= b;
            }
            case 'dateRange': {
                const a = day(cell);
                return (!raw.start || a >= day(raw.start)) && (!raw.end || a <= day(raw.end));
            }
            default: return true;
        }
    }));
}
const isTyping = (field) => !field || !field.type || field.type === 'text';
/** Los params de un store (o {} sin store), con re-render al cambiar */
const noop = () => () => { };
const EMPTY = {};
const useStoreParams = (store) => (0, react_1.useSyncExternalStore)(store ? store.subscribe : noop, () => (store ? store.getState().params : EMPTY));
/** Los filtros activos como chips (cada uno se quita con su ×). Va donde se quiera: p. ej. fuera del modal de filtros */
const FilterChips = (_a) => {
    var { fields, value, store, onChange, showClearAll, _chip, _chipText } = _a, boxProps = __rest(_a, ["fields", "value", "store", "onChange", "showClearAll", "_chip", "_chipText"]);
    const params = useStoreParams(store);
    const values = store ? params : value !== null && value !== void 0 ? value : {};
    const active = fields.filter(f => !isEmptyValue(values[f.name]));
    if (!active.length)
        return null;
    const remove = (names) => {
        const next = Object.assign({}, values);
        names.forEach(n => delete next[n]);
        if (store)
            store.setParams(Object.fromEntries(names.map(n => [n, undefined])));
        onChange === null || onChange === void 0 ? void 0 : onChange((0, exports.cleanFilters)(fields, next));
    };
    const chip = (key, text, onPress, label) => (<Box_1.Box key={key} flexDir="row" alignItems="center" gap={1} bg="light.50" rounded={20} pl={2.5} pr={1} py={1} {..._chip}>
            <Text_1.Text fontSize={12} numberOfLines={1} style={{ maxWidth: 220 }} {..._chipText}>{text}</Text_1.Text>
            <react_native_1.Pressable onPress={onPress} hitSlop={8} accessibilityRole="button" accessibilityLabel={label}>
                <Icon_1.Icon as="Feather" name="x" size={14} color="gray.100"/>
            </react_native_1.Pressable>
        </Box_1.Box>);
    return (<Box_1.Box flexDir="row" flexWrap="wrap" gap={6} {...boxProps}>
            {active.map(f => { var _a; return chip(f.name, chipText(f, values[f.name]), () => remove([f.name]), `× ${(_a = f.label) !== null && _a !== void 0 ? _a : f.name}`); })}
            {showClearAll && active.length > 1 && chip('__all', (0, translate_1.libT)('clearFilters'), () => remove(active.map(f => f.name)), (0, translate_1.libT)('clearFilters'))}
        </Box_1.Box>);
};
exports.FilterChips = FilterChips;
/* ---------------- Filter ---------------- */
/**
 * Campos de filtro. Es solo el contenido: va directo en la pantalla, dentro de un Collapse o en un modal
 * @example
 * <Filter fields={[{ name: 'q', placeholder: 'Buscar…' }]} store={pedidos} />          // búsqueda en la pantalla
 * <Filter fields={FILTROS} store={pedidos} mode="apply" onApply={() => close()} />    // el resto, en un modal
 * <Filter fields={CAMPOS} onChange={setFiltros} />  +  <Table data={filterData(filas, filtros, CAMPOS)} />
 */
exports.Filter = (0, react_1.forwardRef)((rawProps, ref) => {
    // Defaults → theme.components.Filter → variante → props → plataforma
    const [p] = (0, useThemeProps_1.useThemeProps)('Filter', rawProps);
    const { fields, onChange, store, value: valueProp, mode = 'live', onApply, debounce = 400, showChips = false, showClear = fields.length > 1, clearText, applyText, _control, _actions, _clear, _apply, _chip, _chipText, variant: _v } = p, boxProps = __rest(p, ["fields", "onChange", "store", "value", "mode", "onApply", "debounce", "showChips", "showClear", "clearText", "applyText", "_control", "_actions", "_clear", "_apply", "_chip", "_chipText", "variant"]);
    const storeParams = useStoreParams(store);
    const value = store ? storeParams : valueProp;
    const byName = (0, react_1.useMemo)(() => Object.fromEntries(fields.map(f => [f.name, f])), [fields]);
    // Lo que tiene cada campo al empezar: lo que ya haya (value / params del store) o su defaultValue
    const initialOf = (f) => {
        var _a, _b, _c;
        const v = value === null || value === void 0 ? void 0 : value[f.name];
        if (v === undefined || v === null)
            return (_a = f.defaultValue) !== null && _a !== void 0 ? _a : emptyOf(f);
        // autocomplete: el value que viene de la API se vuelve a convertir en su opción
        if (f.type === 'autocomplete')
            return Array.isArray(v) ? v.map(x => { var _a, _b; return (_b = (_a = f.options) === null || _a === void 0 ? void 0 : _a.find(o => o.value == x)) !== null && _b !== void 0 ? _b : x; }) : (_c = (_b = f.options) === null || _b === void 0 ? void 0 : _b.find(o => o.value == v)) !== null && _c !== void 0 ? _c : v;
        return v;
    };
    // El formulario interno se crea una sola vez
    const [form] = (0, react_1.useState)(() => new EAForm_1.FormGroupRef(Object.fromEntries(fields.map(f => [f.name, [initialOf(f)]]))));
    const onChangeRef = (0, react_1.useRef)(onChange);
    onChangeRef.current = onChange;
    // Lo último de cada render para la suscripción (fields puede ser un array nuevo en cada render: así no se rehace)
    const latest = (0, react_1.useRef)({ fields, byName, store });
    latest.current = { fields, byName, store };
    // Campos que llegan después de montar: entran en el formulario
    (0, react_1.useEffect)(() => { fields.forEach(f => { if (!form.hasControl(f.name))
        form.addControl(f.name, [initialOf(f)]); }); }, [fields]);
    // Lo último aplicado (los chips muestran esto)
    const [applied, setApplied] = (0, react_1.useState)(() => form.getValues());
    const emit = (all) => {
        var _a;
        const { fields, store } = latest.current;
        setApplied(all);
        const clean = (0, exports.cleanFilters)(fields, all);
        // Con store: solo sus campos (los vacíos se quitan de los params; los de otros Filter se quedan)
        store === null || store === void 0 ? void 0 : store.setParams(Object.fromEntries(fields.map(f => [f.name, clean[f.name]])));
        (_a = onChangeRef.current) === null || _a === void 0 ? void 0 : _a.call(onChangeRef, clean, all);
        return clean;
    };
    // Cambios del formulario: al momento, o con debounce si se está escribiendo (los de texto)
    const timer = (0, react_1.useRef)(undefined);
    (0, react_1.useEffect)(() => {
        let prev = form.getValues();
        const unsubscribe = form.subscribe('FORM_REF')(() => {
            const now = form.getValues();
            const changed = Object.keys(now).find(k => JSON.stringify(now[k]) !== JSON.stringify(prev[k]));
            prev = now;
            if (!changed || mode !== 'live')
                return;
            clearTimeout(timer.current);
            if (isTyping(latest.current.byName[changed]) && debounce > 0)
                timer.current = setTimeout(() => emit(form.getValues()), debounce);
            else
                emit(now);
        });
        return () => { unsubscribe(); clearTimeout(timer.current); };
    }, [mode, debounce]);
    // value (o los params del store) que cambia desde fuera: se carga sin volver a avisar
    const valueKey = JSON.stringify((0, exports.cleanFilters)(fields, value !== null && value !== void 0 ? value : {}));
    (0, react_1.useEffect)(() => {
        if (!value)
            return;
        if (JSON.stringify((0, exports.cleanFilters)(fields, form.getValues())) === valueKey)
            return;
        const next = Object.fromEntries(fields.map(f => [f.name, initialOf(f)]));
        clearTimeout(timer.current);
        form.setValue(next);
        setApplied(next);
    }, [valueKey]);
    const clearFields = (names) => {
        clearTimeout(timer.current);
        form.setValue(Object.fromEntries(fields.filter(f => names.includes(f.name)).map(f => [f.name, emptyOf(f)])));
        emit(form.getValues());
    };
    const clear = () => clearFields(fields.map(f => f.name));
    const apply = () => { clearTimeout(timer.current); onApply === null || onApply === void 0 ? void 0 : onApply(emit(form.getValues())); };
    (0, react_1.useImperativeHandle)(ref, () => ({ clear, apply, getValues: () => (0, exports.cleanFilters)(fields, form.getValues()) }));
    /* ----- Un campo ----- */
    const renderField = (f) => {
        var _a, _b, _c, _d, _e;
        const type = (_a = f.type) !== null && _a !== void 0 ? _a : 'text';
        const flags = {
            isSelect: type === 'select', isSearch: type === 'autocomplete', isDate: type === 'date' || type === 'dateRange',
            isSwitch: type === 'switch', isCheckBox: type === 'checkbox', isRadio: type === 'radio',
        };
        const extra = Object.assign(Object.assign(Object.assign({}, (type === 'dateRange' && { type: 'date-range' })), (type === 'autocomplete' && { data: (_b = f.options) !== null && _b !== void 0 ? _b : [], _item: { label: 'label', value: 'value' } })), (type === 'text' && !f.label && { iconLeft: <Icon_1.Icon as="Feather" name="search" size={16} color="silver.100" ml={3}/>, returnKeyType: 'search' }));
        const options = type === 'select'
            ? ((_c = f.options) !== null && _c !== void 0 ? _c : []).map(o => <Select_1.Select.Item key={String(o.value)} label={o.label} value={o.value}/>)
            : type === 'radio' ? ((_d = f.options) !== null && _d !== void 0 ? _d : []).map(o => <EAForm_1.Control.Item key={String(o.value)} label={o.label} value={o.value}/>) : undefined;
        return (<Box_1.Box key={f.name} style={{ flexBasis: f.width === 'half' ? '45%' : '100%', flexGrow: 1 }}>
                <EAForm_1.Control formGroup={form} formControl={f.name} label={f.label} 
        // Sin placeholder: el label en los de texto y "Selecciona" en los de elegir (el DatePicker mostraría 0000-00-00)
        placeholder={(_e = f.placeholder) !== null && _e !== void 0 ? _e : (type === 'text' ? f.label : ['select', 'date', 'dateRange', 'autocomplete'].includes(type) ? (0, translate_1.libT)('select') : undefined)} {...flags} {...extra} {..._control} {...f.props}>
                    {options}
                </EAForm_1.Control>
            </Box_1.Box>);
    };
    return (<Box_1.Box flexDir="row" flexWrap="wrap" gap={10} {...boxProps}>
            {fields.map(renderField)}
            {(showClear || mode === 'apply') && (<Box_1.Box flexDir="row" gap={8} style={{ flexBasis: '100%' }} {..._actions}>
                    {showClear && <Button_1.Button flex={1} size="sm" variant="outline" onPress={clear} {..._clear}>{clearText !== null && clearText !== void 0 ? clearText : (0, translate_1.libT)('clearFilters')}</Button_1.Button>}
                    {mode === 'apply' && <Button_1.Button flex={1} size="sm" onPress={apply} {..._apply}>{applyText !== null && applyText !== void 0 ? applyText : (0, translate_1.libT)('apply')}</Button_1.Button>}
                </Box_1.Box>)}
            {showChips && (
        // Quitar un chip vacía ese campo (y avisa)
        <exports.FilterChips fields={fields} value={applied} style={{ flexBasis: '100%' }} _chip={_chip} _chipText={_chipText} onChange={next => clearFields(fields.filter(f => !(f.name in next)).map(f => f.name))}/>)}
        </Box_1.Box>);
});
