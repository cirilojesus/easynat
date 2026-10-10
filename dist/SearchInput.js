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
exports.SearchInput = void 0;
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const react_native_safe_area_context_1 = require("react-native-safe-area-context");
const keyboard_1 = require("./utils/keyboard");
const Box_1 = require("./Box");
const Input_1 = require("./Input");
const Icon_1 = require("./Icon");
const Button_1 = require("./Button");
const Menu_1 = require("./Menu");
const Spinner_1 = require("./Spinner");
const Text_1 = require("./Text");
const useThemeProps_1 = require("./utils/useThemeProps");
const SearchInputItem = () => null;
SearchInputItem.displayName = "SearchInputItem";
// Minúsculas y sin acentos, para buscar "malaga" y encontrar "Málaga"
const ACCENTS = {
    á: 'a', à: 'a', ä: 'a', â: 'a', ã: 'a', é: 'e', è: 'e', ë: 'e', ê: 'e', í: 'i', ì: 'i', ï: 'i', î: 'i',
    ó: 'o', ò: 'o', ö: 'o', ô: 'o', õ: 'o', ú: 'u', ù: 'u', ü: 'u', û: 'u', ñ: 'n', ç: 'c',
};
const normalize = (s) => String(s !== null && s !== void 0 ? s : '').toLowerCase().replace(/[^\u0000-\u007f]/g, c => { var _a; return (_a = ACCENTS[c]) !== null && _a !== void 0 ? _a : c; });
// Separación entre input y lista, y margen mínimo con los bordes de la pantalla
const GAP = 4;
const EDGE = 8;
/**
 * Lista en position absolute junto al input (modo listType="absolute").
 * Mide el espacio real (pantalla, teclado y safe area) al abrirse y cuando cambia el teclado,
 * se coloca en el lado de `placement` (o en el otro si no cabe) y limita su alto al espacio disponible.
 */
const AbsoluteDropdown = ({ open, focused, placement, fixedPlacement, maxListHeight, _list, input, children }) => {
    const anchorRef = (0, react_1.useRef)(null);
    const window = (0, react_native_1.useWindowDimensions)();
    const insets = (0, react_native_safe_area_context_1.useSafeAreaInsets)();
    const keyboardHeight = (0, keyboard_1.useKeyboardHeight)();
    const [inputHeight, setInputHeight] = (0, react_1.useState)(0);
    const [listHeight, setListHeight] = (0, react_1.useState)(0);
    // Espacio libre arriba y abajo del input; null hasta medirlo (mientras tanto la lista no se muestra)
    const [space, setSpace] = (0, react_1.useState)(null);
    const measure = () => {
        var _a, _b;
        (_b = (_a = anchorRef.current) === null || _a === void 0 ? void 0 : _a.measureInWindow) === null || _b === void 0 ? void 0 : _b.call(_a, (_x, y, _w, h) => {
            const bottomLimit = window.height - (keyboardHeight || insets.bottom);
            const next = { below: bottomLimit - (y + h) - GAP - EDGE, above: y - insets.top - GAP - EDGE };
            // Solo re-renderiza si cambió (se mide a menudo mientras está abierta)
            setSpace(prev => prev && Math.abs(prev.below - next.below) < 1 && Math.abs(prev.above - next.above) < 1 ? prev : next);
        });
    };
    // Mientras está abierta se mide cada ~100 ms: el teclado, un KeyboardAvoidingView o el scroll mueven
    // el input con animaciones de duración variable. Solo re-renderiza si el espacio cambió
    (0, react_1.useEffect)(() => {
        if (!open) {
            setSpace(null);
            return;
        }
        measure();
        const timer = setInterval(measure, 100);
        return () => clearInterval(timer);
    }, [open, keyboardHeight, window.height]);
    // Lado: el preferido salvo que no quepa y en el otro haya más sitio
    const needed = Math.min(maxListHeight, 160);
    const side = !space || fixedPlacement ? placement
        : placement === 'bottom'
            ? (space.below < needed && space.above > space.below ? 'top' : 'bottom')
            : (space.above < needed && space.below > space.above ? 'bottom' : 'top');
    const available = space ? (side === 'bottom' ? space.below : space.above) : maxListHeight;
    const listMaxHeight = Math.max(Math.min(maxListHeight, available), 80);
    // zIndex/elevation para quedar por encima de los elementos que siguen en el mismo contenedor. Se
    // mantienen mientras el input tiene foco aunque la lista no se vea: Fabric ordena los hermanos por
    // zIndex y quitarlo mueve la vista, y Android le quita el foco al input (p. ej. al llegar a maxSelected).
    // Android no entrega toques a vistas que sobresalen de su contenedor: mientras la lista se ve, el
    // contenedor se amplía (padding) hasta cubrirla y un margin negativo compensa, así recibe los
    // toques sin mover el layout de alrededor
    const extra = open ? listHeight + GAP : 0;
    const containerStyle = focused || open
        ? side === 'bottom'
            ? { zIndex: 1000, elevation: 1000, paddingBottom: extra, marginBottom: -extra }
            : { zIndex: 1000, elevation: 1000, paddingTop: extra, marginTop: -extra }
        : undefined;
    return (
    // collapsable={false}: el contenedor siempre existe como vista nativa. Si no, en Fabric una vista sin
    // estilo se "aplana" y al abrir la lista (al ganar zIndex/padding) se crea y re-parenta sus hijos:
    // el input nativo se remonta, pierde el foco y Android se lo pasa a otro input
    <react_native_1.View collapsable={false} style={containerStyle}>
            <react_native_1.View ref={anchorRef} collapsable={false} onLayout={e => {
            const h = e.nativeEvent.layout.height;
            if (Math.round(h) !== Math.round(inputHeight))
                setInputHeight(h);
        }}>
                {input}
            </react_native_1.View>
            {/* Montada mientras el input tiene foco, aunque no tenga contenido (oculta y sin toques): en
            Android, desmontarla con el input enfocado (p. ej. al llegar a maxSelected o al quedarse
            sin resultados) le quita el foco y lo pasa a otro input */}
            {(open || focused) && (<Box_1.Box pointerEvents={open ? 'auto' : 'none'} onLayout={e => {
                const h = e.nativeEvent.layout.height;
                if (Math.round(h) !== Math.round(listHeight))
                    setListHeight(h);
            }} position="absolute" 
        // Abajo: bajo el input; arriba: en el padding superior del contenedor
        top={side === 'bottom' ? inputHeight + GAP : 0} left={0} right={0} bg="surface" borderWidth={1} borderColor="light.100" rounded={2} shadow={3} overflow="hidden" maxH={listMaxHeight} {..._list} opacity={open && space ? 1 : 0}>
                    <react_native_1.ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled">
                        {children}
                    </react_native_1.ScrollView>
                </Box_1.Box>)}
        </react_native_1.View>);
};
const SearchInput = (rawProps) => {
    var _a;
    // Defaults → theme.components.SearchInput → variante → props → plataforma
    // (listType, emptyText, debounce, clearable, _tag... también se pueden definir en el tema)
    let [_b] = (0, useThemeProps_1.useThemeProps)('SearchInput', rawProps), { value, multiple, _item, listType = 'menu', _list, maxListHeight = 220, filter, emptyText = 'Sin resultados', onSearch, debounce = 300, loading, clearable, maxSelected, _emptyText, _loading, _clearable, _tags, _tag, _tagRemove, variant: _variant } = _b, props = __rest(_b, ["value", "multiple", "_item", "listType", "_list", "maxListHeight", "filter", "emptyText", "onSearch", "debounce", "loading", "clearable", "maxSelected", "_emptyText", "_loading", "_clearable", "_tags", "_tag", "_tagRemove", "variant"]);
    const [text, setText] = (0, react_1.useState)('');
    const searchTimer = (0, react_1.useRef)(undefined);
    (0, react_1.useEffect)(() => () => clearTimeout(searchTimer.current), []);
    // Solo se usa en modo absolute (en modo menu el estado de apertura lo lleva el Menu)
    const [listOpen, setListOpen] = (0, react_1.useState)(false);
    // Último label mostrado por un valor elegido (para limpiarlo si el valor se borra desde fuera)
    const shownLabel = (0, react_1.useRef)(null);
    // label y value de _item son los nombres de los campos, no props del botón
    const _c = _item !== null && _item !== void 0 ? _item : {}, { label: labelKey, value: valueKey } = _c, itemProps = __rest(_c, ["label", "value"]);
    // ?? y no ||: un label o value como 0 o '' es válido (con || se perdía, p. ej. un item con id 0)
    const getLabel = (item) => { var _a, _b; return (_a = item === null || item === void 0 ? void 0 : item[labelKey]) !== null && _a !== void 0 ? _a : (_b = item === null || item === void 0 ? void 0 : item['props']) === null || _b === void 0 ? void 0 : _b.label; };
    const getValue = (item) => { var _a, _b; return (_a = item === null || item === void 0 ? void 0 : item[valueKey]) !== null && _a !== void 0 ? _a : (_b = item === null || item === void 0 ? void 0 : item['props']) === null || _b === void 0 ? void 0 : _b.value; };
    if (multiple && !Array.isArray(value))
        value = [];
    const onSelect = (item) => {
        var _a, _b;
        if (Array.isArray(value) && multiple) {
            (_a = props.onChange) === null || _a === void 0 ? void 0 : _a.call(props, [...value, item]);
        }
        else {
            setText(getLabel(item));
            (_b = props.onChange) === null || _b === void 0 ? void 0 : _b.call(props, item);
        }
    };
    // Simple: el texto muestra el valor elegido; si el valor se borra desde fuera (p. ej. reset de un
    // formulario) se limpia, pero no si el usuario está escribiendo (al escribir el valor pasa a null)
    (0, react_1.useEffect)(() => {
        var _a;
        if (multiple || Array.isArray(value))
            return;
        if (value != null) {
            shownLabel.current = String((_a = getLabel(value)) !== null && _a !== void 0 ? _a : '');
            setText(shownLabel.current);
        }
        else if (shownLabel.current !== null) {
            setText(t => (t === shownLabel.current ? '' : t));
            shownLabel.current = null;
        }
    }, [value]);
    // Opciones filtradas por el texto y sin las ya elegidas (con onSearch, por defecto sin filtro local).
    // Memorizado: solo se recalcula si cambian los datos, el texto o la selección (no en cada render)
    const maxReached = Array.isArray(value) && maxSelected != null && value.length >= maxSelected;
    const options = (0, react_1.useMemo)(() => {
        if (maxReached)
            return [];
        const items = (props.data || react_1.Children.toArray(props.children));
        // Múltiple: los elegidos (ya en etiquetas) no se repiten; en un Set, comprobar cada opción es O(1).
        // Simple: el elegido sigue en la lista (al reabrir con su texto, aparece él y no "Sin resultados")
        const selected = new Set((Array.isArray(value) ? value : []).map(x => String(getValue(x))));
        const query = normalize(text);
        const matches = filter !== null && filter !== void 0 ? filter : (onSearch ? false : (item) => normalize(getLabel(item)).includes(query));
        return items.filter(item => !selected.has(String(getValue(item))) && (!matches || !text || matches(item, text)));
    }, [props.data, props.children, text, value, maxReached, filter, onSearch, labelKey, valueKey]);
    // Fila de estado: cargando, o sin resultados (solo si se escribió algo)
    const _d = _loading !== null && _loading !== void 0 ? _loading : {}, { _container: loadingContainer } = _d, spinnerProps = __rest(_d, ["_container"]);
    const statusRow = loading
        ? <Box_1.Box py={3} alignItems="center" {...loadingContainer}><Spinner_1.Spinner size="small" color="primary.100" {...spinnerProps}/></Box_1.Box>
        : options.length === 0 && !maxReached && text !== '' && emptyText != null && emptyText !== false
            ? (typeof emptyText === 'string' ? <Text_1.Text px={2.5} py={2.5} color="silver" {..._emptyText}>{emptyText}</Text_1.Text> : <>{emptyText}</>)
            : null;
    const changeText = (t) => {
        setText(t);
        if (onSearch) {
            clearTimeout(searchTimer.current);
            searchTimer.current = setTimeout(() => onSearch(t), debounce);
        }
    };
    const renderOption = (item, close) => {
        var _a;
        // SearchInput.Item: su label y value tampoco son props del botón
        const _b = (_a = item === null || item === void 0 ? void 0 : item.props) !== null && _a !== void 0 ? _a : {}, { label: _label, value: _value } = _b, optionProps = __rest(_b, ["label", "value"]);
        return <Button_1.Button variant={'ghost'} rounded={0} onPress={() => {
                onSelect(item);
                // En modo simple ya hay valor: se cierra y se quita el foco (si no, al cerrarse la lista
                // Android reasigna el foco al siguiente input); en múltiple sigue abierto para elegir más
                if (!multiple) {
                    close();
                    react_native_1.Keyboard.dismiss();
                }
            }} {...itemProps} {...optionProps}>
            {getLabel(item)}
        </Button_1.Button>;
    };
    const renderInput = (open, close) => {
        var _a, _b;
        return (<Input_1.Input value={text} {...props === null || props === void 0 ? void 0 : props._input} iconRight={(clearable && (text !== '' || (!multiple && value != null))) || ((_a = props === null || props === void 0 ? void 0 : props._input) === null || _a === void 0 ? void 0 : _a.iconRight) ? (<>
                    {clearable && (text !== '' || (!multiple && value != null)) && (<Button_1.Button variant="ghost" colorScheme="secondary" rounded={40} p={1} mr={2} accessibilityLabel="Borrar" icon={<Icon_1.Icon name="close" as="AntDesign" size={14} color="silver"/>} {..._clearable} onPress={(e) => {
                        var _a, _b;
                        changeText('');
                        if (!multiple && value != null)
                            (_a = props.onChange) === null || _a === void 0 ? void 0 : _a.call(props, null);
                        (_b = _clearable === null || _clearable === void 0 ? void 0 : _clearable.onPress) === null || _b === void 0 ? void 0 : _b.call(_clearable, e);
                    }}/>)}
                    {(_b = props === null || props === void 0 ? void 0 : props._input) === null || _b === void 0 ? void 0 : _b.iconRight}
                </>) : undefined} onChangeText={e => {
                var _a;
                if (value && !multiple)
                    (_a = props.onChange) === null || _a === void 0 ? void 0 : _a.call(props, null);
                changeText(e);
                // Escribir vuelve a mostrar las opciones (p. ej. tras elegir una y borrar)
                open();
            }} onFocus={e => {
                var _a, _b;
                open();
                (_b = (_a = props === null || props === void 0 ? void 0 : props._input) === null || _a === void 0 ? void 0 : _a.onFocus) === null || _b === void 0 ? void 0 : _b.call(_a, e);
            }} 
        // Abre también al tocar el input si ya tenía el foco (onFocus no se repite).
        // onPress y no onPressIn: onPressIn salta al empezar un scroll encima del input
        onPress={e => {
                var _a, _b;
                open();
                (_b = (_a = props === null || props === void 0 ? void 0 : props._input) === null || _a === void 0 ? void 0 : _a.onPress) === null || _b === void 0 ? void 0 : _b.call(_a, e);
            }} onBlur={e => {
                var _a, _b;
                close();
                (_b = (_a = props === null || props === void 0 ? void 0 : props._input) === null || _a === void 0 ? void 0 : _a.onBlur) === null || _b === void 0 ? void 0 : _b.call(_a, e);
            }}/>);
    };
    const openList = () => setListOpen(true);
    const closeList = () => setListOpen(false);
    return (<>
            {listType === 'absolute' ? (<AbsoluteDropdown open={listOpen && (options.length > 0 || statusRow != null)} focused={listOpen} placement={props.placement === 'top' ? 'top' : 'bottom'} fixedPlacement={props.fixedPlacement} maxListHeight={maxListHeight} _list={_list} input={renderInput(openList, closeList)}>
                    {loading && statusRow}
                    {options.map((item, i) => {
                var _a;
                return (<react_1.default.Fragment key={String((_a = getValue(item)) !== null && _a !== void 0 ? _a : i)}>{renderOption(item, closeList)}</react_1.default.Fragment>);
            })}
                    {!loading && statusRow}
                </AbsoluteDropdown>) : (<Menu_1.Menu backdrop={false} useTriggerWidth trigger={({ open, close }) => renderInput(open, close)} renderItem={({ item, close }) => renderOption(item, close)} {...props} data={options} emptyContent={options.length === 0 ? statusRow : undefined} 
        // Cargando con resultados previos: el indicador va encima de la lista
        _contentStyle={Object.assign(Object.assign({}, props._contentStyle), { ListHeaderComponent: loading && options.length > 0 ? statusRow : (_a = props._contentStyle) === null || _a === void 0 ? void 0 : _a.ListHeaderComponent })}/>)}
            {Array.isArray(value) &&
            <Box_1.Box flexDir="row" flexWrap={'wrap'} py={value.length ? 2 : 0} gap={8} {..._tags}>
                    {value.map((item, i) => {
                    const label = getLabel(item);
                    return (<Box_1.Box key={label + i} variant={'badge'} {..._tag}>
                                {label}
                                <Button_1.Button rounded={40} colorScheme={'danger'} p={1} accessibilityLabel={`Quitar ${label}`} icon={<Icon_1.Icon name="close" as={'AntDesign'} size={12}/>} {..._tagRemove} onPress={(e) => {
                            var _a, _b;
                            (_a = props.onChange) === null || _a === void 0 ? void 0 : _a.call(props, value.filter((_, j) => j !== i));
                            (_b = _tagRemove === null || _tagRemove === void 0 ? void 0 : _tagRemove.onPress) === null || _b === void 0 ? void 0 : _b.call(_tagRemove, e);
                        }}/>
                            </Box_1.Box>);
                })}
                </Box_1.Box>}
        </>);
};
exports.SearchInput = SearchInput;
exports.SearchInput.Item = SearchInputItem;
