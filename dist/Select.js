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
exports.Select = void 0;
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const Pressable_1 = require("./Pressable");
const Icon_1 = require("./Icon");
const Modal_1 = require("./Modal");
const Box_1 = require("./Box");
const Text_1 = require("./Text");
const Input_1 = require("./Input");
const Button_1 = require("./Button");
const Label_1 = require("./Label");
const useThemeProps_1 = require("./utils/useThemeProps");
const translate_1 = require("./utils/translate");
const color_1 = require("./utils/color");
const SelectItem = () => null;
const SELECT_SIZES = {
    sm: { p: 1.5, _text: { fontSize: 12 }, _label: { fontSize: 12 } },
    md: { p: 2, _text: { fontSize: 14 }, _label: { fontSize: 14 } },
    lg: { p: 2.5, _text: { fontSize: 16 }, _label: { fontSize: 16 } },
    xl: { p: 3, _text: { fontSize: 18 }, _label: { fontSize: 18 } },
};
// Sin acentos ni mayúsculas
const norm = (s) => String(s !== null && s !== void 0 ? s : '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const asArray = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);
// Una clave para comparar estilos por su contenido (si tienen algo que no se puede serializar, siempre distinta)
const safeKey = (v) => { try {
    return JSON.stringify(v);
}
catch (_a) {
    return String(Math.random());
} };
const sameProps = (a, b) => {
    if (a === b)
        return true;
    const ka = Object.keys(a), kb = Object.keys(b);
    return ka.length === kb.length && ka.every(k => a[k] === b[k] || (typeof a[k] === 'object' && safeKey(a[k]) === safeKey(b[k])));
};
const sameOption = (a, b) => a === b || (a.value === b.value && a.label === b.label
    && a.description === b.description && a.disabled === b.disabled && a.group === b.group && a.icon === b.icon);
// Una opción de la lista. Memorizada: al marcar una, solo se repintan las que cambian (con miles de opciones se nota)
const OptionRow = react_1.default.memo(({ option: o, itemProps, isSelected, disabled, multiple, look, onPick }) => {
    const { _option, _selected, _check, selectedBg } = look;
    return (<Pressable_1.Pressable p={3} px={4} flexDir="row" alignItems="center" gap={3} borderBottomWidth={1} borderBottomColor="light.100" bg={isSelected && !multiple ? selectedBg : undefined} onPress={() => onPick(o)} _pressed={{ opacity: 0.5 }} accessibilityRole={multiple ? 'checkbox' : 'button'} accessibilityState={{ selected: isSelected, checked: multiple ? isSelected : undefined, disabled }} {..._option} {...itemProps} disabled={disabled} {...(itemProps.onPress ? { onPress: (e) => onPick(o, itemProps.onPress, e) } : {})} {...(isSelected ? _selected : {})}>
            {o.icon}
            <Box_1.Box flex={1} minW={0}>
                <Text_1.Text {..._option === null || _option === void 0 ? void 0 : _option._text} {...itemProps._text} {...(isSelected ? _selected === null || _selected === void 0 ? void 0 : _selected._text : null)}>{o.label}</Text_1.Text>
                {o.description ? <Text_1.Text variant="caption" mt={0.5}>{o.description}</Text_1.Text> : null}
            </Box_1.Box>
            {_check !== false && (multiple || isSelected) && (<Icon_1.Icon as="Feather" name={multiple ? (isSelected ? 'check-square' : 'square') : 'check'} size={18} color={isSelected ? 'primary.100' : 'text.subtle'} {..._check}/>)}
        </Pressable_1.Pressable>);
}, (a, b) => a.isSelected === b.isSelected && a.disabled === b.disabled && a.multiple === b.multiple && a.look === b.look
    && a.onPick === b.onPick && sameOption(a.option, b.option) && sameProps(a.itemProps, b.itemProps));
exports.Select = (0, react_1.forwardRef)((props, ref) => {
    var _a, _b, _c;
    const modal = (0, react_1.useRef)(null);
    const labelRef = (0, react_1.useRef)(null);
    const [fieldHeight, setFieldHeight] = (0, react_1.useState)(0);
    const [open, setOpen] = (0, react_1.useState)(false);
    const [query, setQuery] = (0, react_1.useState)('');
    // Defaults → theme.components.Select → variante → tamaño → props → plataforma
    // (todas sus props, incluidas _option, _selected, _menu e _icon, se pueden definir en el tema)
    const [_d, theme] = (0, useThemeProps_1.useThemeProps)('Select', props, { sizes: SELECT_SIZES }), { children, value, defaultValue, onChange, options, multiple, maxSelected, searchable, searchPlaceholder, emptyText, clearable, title, isInvalid, closeOnSelect = !multiple, renderValue, onOpen, onClose, _option, _selected, _menu, _group, _search, _check, icon = true, _icon, isFloat, label, _label, isRequired, _containerStyle, placeholder, _text, variant: _variant, size: _size } = _d, pressableProps = __rest(_d, ["children", "value", "defaultValue", "onChange", "options", "multiple", "maxSelected", "searchable", "searchPlaceholder", "emptyText", "clearable", "title", "isInvalid", "closeOnSelect", "renderValue", "onOpen", "onClose", "_option", "_selected", "_menu", "_group", "_search", "_check", "icon", "_icon", "isFloat", "label", "_label", "isRequired", "_containerStyle", "placeholder", "_text", "variant", "size"]);
    // Fondo de la opción elegida: el primary muy suave (con primary.50 el texto quedaba apagado)
    const selectedBg = (0, color_1.withAlpha)(String((_b = (_a = theme.colors) === null || _a === void 0 ? void 0 : _a['primary.100']) !== null && _b !== void 0 ? _b : '#4F46E5'), 0.1);
    // Las opciones: las de `options` y las de <Select.Item> (sus otras props van al botón de la opción)
    const all = (0, react_1.useMemo)(() => {
        const fromChildren = react_1.default.Children.toArray(children).filter(react_1.default.isValidElement)
            .map(el => {
            const _a = el.props, { label: l, value: v, description, icon: ic, group } = _a, rest = __rest(_a, ["label", "value", "description", "icon", "group"]);
            return { option: { label: l, value: v, description, icon: ic, group, disabled: !!rest.disabled }, props: rest };
        });
        return [...(options !== null && options !== void 0 ? options : []).map(o => ({ option: o, props: {} })), ...fromChildren];
    }, [options, children]);
    // Controlado (value) o no (estado propio, que sigue a defaultValue si cambia: así lo usa el formulario)
    const controlled = value !== undefined;
    const [inner, setInner] = (0, react_1.useState)(defaultValue);
    (0, react_1.useEffect)(() => { if (!controlled)
        setInner(defaultValue); }, [defaultValue, controlled]);
    const current = controlled ? value : inner;
    const values = asArray(current);
    // Buscar por valor en un Map (con miles de opciones, find por cada valor se notaba)
    const byValue = (0, react_1.useMemo)(() => new Map(all.map(o => [o.option.value, o.option])), [all]);
    const selected = values.map(v => byValue.get(v)).filter(Boolean);
    // != null y no un if (valor): con el valor 0 el label flotante no subía
    const hasValue = selected.length > 0;
    (0, react_1.useEffect)(() => { var _a; (_a = labelRef.current) === null || _a === void 0 ? void 0 : _a.animate(hasValue || open); }, [hasValue, open]);
    const emit = (next) => {
        if (!controlled)
            setInner(next);
        if (multiple) {
            const arr = asArray(next);
            onChange === null || onChange === void 0 ? void 0 : onChange(arr, arr.map(v => byValue.get(v)).filter(Boolean));
        }
        else
            onChange === null || onChange === void 0 ? void 0 : onChange(next, next == null ? undefined : byValue.get(next));
    };
    const openMenu = () => { var _a; react_native_1.Keyboard.dismiss(); setOpen(true); (_a = modal.current) === null || _a === void 0 ? void 0 : _a.open(); };
    // Cerrado en cuanto se pide (el label baja, el borde y la flecha vuelven); afterClose lo confirma sea cual sea la vía
    const closeMenu = () => { var _a; setOpen(false); (_a = modal.current) === null || _a === void 0 ? void 0 : _a.close(); };
    const clear = () => emit(multiple ? [] : null);
    (0, react_1.useImperativeHandle)(ref, () => ({ open: openMenu, close: closeMenu, clear, isOpen: () => { var _a; return !!((_a = modal.current) === null || _a === void 0 ? void 0 : _a.isOpen()); } }));
    const choose = (o) => {
        if (multiple) {
            const on = selectedSet.has(o.value);
            emit(on ? values.filter(v => v !== o.value) : [...values, o.value]);
        }
        else
            emit(o.value);
        if (closeOnSelect)
            closeMenu();
    };
    const full = multiple && maxSelected != null && values.length >= maxSelected;
    const selectedSet = (0, react_1.useMemo)(() => new Set(values), [JSON.stringify(values)]);
    // Las filas no se repintan si no cambia lo suyo: el handler es estable (lee la última versión) y el estilo solo
    // cambia si cambia su contenido (el tema crea objetos nuevos en cada render)
    const chooseRef = (0, react_1.useRef)(choose);
    chooseRef.current = choose;
    const itemPressRef = (0, react_1.useRef)(closeMenu);
    itemPressRef.current = closeMenu;
    const onPick = (0, react_1.useRef)((o, itemOnPress, e) => {
        if (itemOnPress) {
            itemPressRef.current();
            itemOnPress(e);
        }
        else
            chooseRef.current(o);
    }).current;
    const lookKey = safeKey([_option, _selected, _check, selectedBg]);
    const look = (0, react_1.useMemo)(() => ({ _option, _selected, _check, selectedBg }), [lookKey]);
    const rowsVersion = `${[...selectedSet].join('\u0000')}|${full}|${lookKey}`;
    // Filas de la lista: títulos de grupo y opciones (filtradas por la búsqueda)
    const rows = (0, react_1.useMemo)(() => {
        const q = norm(query.trim());
        const shown = q ? all.filter(o => norm(o.option.label).includes(q) || norm(o.option.description).includes(q)) : all;
        const out = [];
        const groups = [...new Set(shown.map(o => o.option.group))];
        for (const g of groups) {
            if (g)
                out.push({ type: 'group', title: g });
            for (const o of shown)
                if (o.option.group === g)
                    out.push(Object.assign({ type: 'option' }, o));
        }
        return out;
    }, [all, query]);
    const shownValue = renderValue ? renderValue(selected) : selected.map(o => o.label).join(', ');
    const panelTitle = title === false ? null : title !== null && title !== void 0 ? title : label;
    const borderColor = isInvalid ? 'danger.100' : open ? 'primary.100' : (_c = pressableProps.borderColor) !== null && _c !== void 0 ? _c : 'light.100';
    return (<Box_1.Box {..._containerStyle}>
            {label && <Label_1.Label ref={labelRef} isFloat={isFloat} isRequired={isRequired} fieldHeight={fieldHeight} {..._label}>{label}</Label_1.Label>}
            <Pressable_1.Pressable flexDir="row" alignItems="center" gap={1} p={2} borderWidth={1} _pressed={{ opacity: .5 }} rounded={1} accessibilityRole="button" accessibilityLabel={label !== null && label !== void 0 ? label : placeholder} accessibilityState={{ expanded: open, disabled: !!pressableProps.disabled }} accessibilityValue={hasValue ? { text: selected.map(o => String(o.label)).join(', ') } : undefined} {...pressableProps} borderColor={borderColor} onLayout={e => {
            var _a;
            setFieldHeight(e.nativeEvent.layout.height);
            (_a = pressableProps.onLayout) === null || _a === void 0 ? void 0 : _a.call(pressableProps, e);
        }} onPress={e => { var _a; openMenu(); (_a = pressableProps.onPress) === null || _a === void 0 ? void 0 : _a.call(pressableProps, e); }}>
                <Box_1.Box flex={1} minW={0}>
                    {hasValue
            ? (typeof shownValue === 'string' || typeof shownValue === 'number'
                ? <Text_1.Text numberOfLines={1} {..._text}>{shownValue}</Text_1.Text>
                : shownValue)
            // Label flotante abajo (sin valor): hace de placeholder (el espacio mantiene el alto)
            : <Text_1.Text numberOfLines={1} color="text.subtle" {..._text}>{isFloat && label ? ' ' : placeholder || ' '}</Text_1.Text>}
                </Box_1.Box>
                {clearable && hasValue && !pressableProps.disabled && (<Pressable_1.Pressable onPress={clear} hitSlop={10} accessibilityRole="button" accessibilityLabel={(0, translate_1.libT)('clear')} _pressed={{ opacity: .5 }}>
                        <Icon_1.Icon as="Feather" name="x" size={18} color="text.subtle"/>
                    </Pressable_1.Pressable>)}
                {icon === true ? <Icon_1.Icon as="Feather" name={open ? 'chevron-up' : 'chevron-down'} size={20} {..._icon}/> : icon && icon}
            </Pressable_1.Pressable>
            <Modal_1.Modal ref={modal} header={{
            children: (<Box_1.Box w="100%" gap={2}>
                            <Box_1.Box height={1} mx="auto" w={40} rounded={4} bg="muted.100"/>
                            {panelTitle ? <Text_1.Text variant="title" px={2}>{panelTitle}</Text_1.Text> : null}
                            {searchable && (<Input_1.Input value={query} onChangeText={setQuery} placeholder={searchPlaceholder !== null && searchPlaceholder !== void 0 ? searchPlaceholder : (0, translate_1.libT)('search')} variant="filled" autoCorrect={false} iconLeft={<Icon_1.Icon as="Feather" name="search" size={16} ml={3} color="text.subtle"/>} {..._search}/>)}
                        </Box_1.Box>),
            px: 4, pt: 2, pb: 2,
        }} _contentStyle={Object.assign({ h: "auto", maxH: "90%", roundedTop: 40 }, _menu)} buttonClose={false} onOpen={() => { setOpen(true); onOpen === null || onOpen === void 0 ? void 0 : onOpen(); }} 
    // El Modal solo avisa con onClose si lo cierra el usuario (atrás, fuera); afterClose llega siempre
    onClose={() => setOpen(false)} afterClose={() => { setOpen(false); setQuery(''); onClose === null || onClose === void 0 ? void 0 : onClose(); }}>
                <react_native_1.FlatList data={rows} initialNumToRender={20} windowSize={10} keyboardShouldPersistTaps="handled" keyExtractor={(r, index) => { var _a; return (r.type === 'group' ? `g:${r.title}` : `o:${String((_a = r.option.value) !== null && _a !== void 0 ? _a : index)}`); }} ListEmptyComponent={<Text_1.Text textAlign="center" color="text.subtle" p={6}>{emptyText !== null && emptyText !== void 0 ? emptyText : (0, translate_1.libT)('noResults')}</Text_1.Text>} extraData={rowsVersion} renderItem={({ item: row }) => {
            if (row.type === 'group') {
                return <Text_1.Text variant="overline" px={4} pt={3} pb={1} {..._group}>{row.title}</Text_1.Text>;
            }
            const isSelected = selectedSet.has(row.option.value);
            return (<OptionRow option={row.option} itemProps={row.props} isSelected={isSelected} disabled={!!row.option.disabled || (full && !isSelected)} multiple={!!multiple} look={look} onPick={onPick}/>);
        }}/>
                {multiple && (<Box_1.Box flexDir="row" gap={2} p={3} px={4} borderTopWidth={1} borderColor="border" safeAreaBottom>
                        {clearable !== false && values.length > 0 && <Button_1.Button variant="ghost" onPress={clear}>{(0, translate_1.libT)('clear')}</Button_1.Button>}
                        <Button_1.Button flex={1} onPress={closeMenu}>{`${(0, translate_1.libT)('done')}${values.length ? ` (${values.length})` : ''}`}</Button_1.Button>
                    </Box_1.Box>)}
            </Modal_1.Modal>
        </Box_1.Box>);
});
exports.Select.Item = SelectItem;
