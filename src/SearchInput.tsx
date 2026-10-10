import React, { Children, useEffect, useMemo, useRef, useState } from "react";
import { Keyboard, ScrollView, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useKeyboardHeight } from "./utils/keyboard";
import { Box, EABoxProps } from './Box';
import { EATextInputProps, Input } from "./Input"
import { Icon } from "./Icon"
import { EAButtonProps, Button } from "./Button"
import { EAMenuProps, Menu } from "./Menu"
import { EASpinnerProps, Spinner } from "./Spinner"
import { EATextProps, Text } from "./Text"
import { useThemeProps } from "./utils/useThemeProps"

export type SearchInputModel<T = any> = EAMenuProps<T> & {
    value: T[] | T | null,
    multiple?: boolean;
    children?: React.ReactNode;
    _item?: EAButtonProps & { label: keyof T, value: keyof T },
    onChange?: (value: T[] | T | null) => any,
    _input?: EATextInputProps
    /**
     * Cómo se muestra la lista de opciones:
     * - menu (por defecto): en un Menu flotante por encima de la app (sin backdrop; actívalo con backdrop)
     * - absolute: en una lista en position absolute bajo el input, dentro de la pantalla (se mueve con el scroll).
     *   Al estar en el layout normal, un padre con overflow hidden la recorta y hermanos posteriores de otro
     *   contenedor pueden taparla
     */
    listType?: 'menu' | 'absolute';
    /** Estilo de la lista en modo absolute */
    _list?: EABoxProps;
    /** Alto máximo de la lista en modo absolute (por defecto 220) */
    maxListHeight?: number;
    /**
     * Cómo se filtran las opciones con el texto escrito. Por defecto: el label contiene el texto, sin
     * distinguir mayúsculas ni acentos ("malaga" encuentra "Málaga"). false: no filtra (datos remotos)
     */
    filter?: ((item: T, text: string) => boolean) | false;
    /** Texto (o contenido) cuando lo escrito no tiene resultados. null lo desactiva. Por defecto "Sin resultados" */
    emptyText?: React.ReactNode;
    /**
     * Búsqueda remota: se llama con el texto escrito tras `debounce` ms sin escribir. Con onSearch el filtro
     * local se desactiva por defecto (el servidor decide qué coincide); actualiza `data` con lo que devuelva
     */
    onSearch?: (text: string) => void;
    /** Espera en ms tras dejar de escribir antes de llamar a onSearch (por defecto 300) */
    debounce?: number;
    /** Muestra un indicador de carga en la lista (p. ej. mientras llega la respuesta de onSearch) */
    loading?: boolean;
    /** Botón (×) para borrar el texto (y el valor en modo simple) */
    clearable?: boolean;
    /** Múltiple: máximo de elementos elegidos; al llegar, la lista ya no se muestra */
    maxSelected?: number;
    /** Estilo del texto "Sin resultados" (cuando emptyText es un texto) */
    _emptyText?: EATextProps;
    /** Estilo del indicador de carga; _container es la fila que lo contiene */
    _loading?: EASpinnerProps & { _container?: EABoxProps };
    /** Props del botón (×) de clearable (p. ej. icon para cambiar el icono, colorScheme, p...) */
    _clearable?: EAButtonProps;
    /** Múltiple: contenedor de las etiquetas de los elegidos */
    _tags?: EABoxProps;
    /** Múltiple: cada etiqueta (_text para su texto) */
    _tag?: EABoxProps;
    /** Múltiple: botón (×) para quitar cada etiqueta */
    _tagRemove?: EAButtonProps;
}

export type EASearchInputItem = EAButtonProps & {
    label: string | number;
    value: string | number;
};

const SearchInputItem: React.FC<EASearchInputItem> = () => null;
SearchInputItem.displayName = "SearchInputItem";

// Minúsculas y sin acentos, para buscar "malaga" y encontrar "Málaga"
const ACCENTS: Record<string, string> = {
    á: 'a', à: 'a', ä: 'a', â: 'a', ã: 'a', é: 'e', è: 'e', ë: 'e', ê: 'e', í: 'i', ì: 'i', ï: 'i', î: 'i',
    ó: 'o', ò: 'o', ö: 'o', ô: 'o', õ: 'o', ú: 'u', ù: 'u', ü: 'u', û: 'u', ñ: 'n', ç: 'c',
};
const normalize = (s: unknown) => String(s ?? '').toLowerCase().replace(/[^\u0000-\u007f]/g, c => ACCENTS[c] ?? c);

// Separación entre input y lista, y margen mínimo con los bordes de la pantalla
const GAP = 4;
const EDGE = 8;

type AbsoluteDropdownProps = {
    /** La lista se ve (input con foco y hay algo que mostrar) */
    open: boolean;
    /** El input tiene foco: la lista sigue montada aunque no se vea */
    focused: boolean;
    placement: 'bottom' | 'top';
    fixedPlacement?: boolean;
    maxListHeight: number;
    _list?: EABoxProps;
    input: React.ReactNode;
    children: React.ReactNode;
};

/**
 * Lista en position absolute junto al input (modo listType="absolute").
 * Mide el espacio real (pantalla, teclado y safe area) al abrirse y cuando cambia el teclado,
 * se coloca en el lado de `placement` (o en el otro si no cabe) y limita su alto al espacio disponible.
 */
const AbsoluteDropdown = ({ open, focused, placement, fixedPlacement, maxListHeight, _list, input, children }: AbsoluteDropdownProps) => {
    const anchorRef = useRef<View>(null);
    const window = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const keyboardHeight = useKeyboardHeight();
    const [inputHeight, setInputHeight] = useState(0);
    const [listHeight, setListHeight] = useState(0);
    // Espacio libre arriba y abajo del input; null hasta medirlo (mientras tanto la lista no se muestra)
    const [space, setSpace] = useState<{ above: number; below: number } | null>(null);

    const measure = () => {
        anchorRef.current?.measureInWindow?.((_x, y, _w, h) => {
            const bottomLimit = window.height - (keyboardHeight || insets.bottom);
            const next = { below: bottomLimit - (y + h) - GAP - EDGE, above: y - insets.top - GAP - EDGE };
            // Solo re-renderiza si cambió (se mide a menudo mientras está abierta)
            setSpace(prev => prev && Math.abs(prev.below - next.below) < 1 && Math.abs(prev.above - next.above) < 1 ? prev : next);
        });
    };

    // Mientras está abierta se mide cada ~100 ms: el teclado, un KeyboardAvoidingView o el scroll mueven
    // el input con animaciones de duración variable. Solo re-renderiza si el espacio cambió
    useEffect(() => {
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
        <View collapsable={false} style={containerStyle}>
            <View ref={anchorRef} collapsable={false} onLayout={e => {
                const h = e.nativeEvent.layout.height;
                if (Math.round(h) !== Math.round(inputHeight)) setInputHeight(h);
            }}>
                {input}
            </View>
            {/* Montada mientras el input tiene foco, aunque no tenga contenido (oculta y sin toques): en
                Android, desmontarla con el input enfocado (p. ej. al llegar a maxSelected o al quedarse
                sin resultados) le quita el foco y lo pasa a otro input */}
            {(open || focused) && (
                <Box
                    pointerEvents={open ? 'auto' : 'none'}
                    onLayout={e => {
                        const h = e.nativeEvent.layout.height;
                        if (Math.round(h) !== Math.round(listHeight)) setListHeight(h);
                    }}
                    position="absolute"
                    // Abajo: bajo el input; arriba: en el padding superior del contenedor
                    top={side === 'bottom' ? inputHeight + GAP : 0}
                    left={0}
                    right={0}
                    bg="surface"
                    borderWidth={1}
                    borderColor="light.100"
                    rounded={2}
                    shadow={3}
                    overflow="hidden"
                    maxH={listMaxHeight}
                    {..._list}
                    opacity={open && space ? 1 : 0}
                >
                    <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled">
                        {children}
                    </ScrollView>
                </Box>
            )}
        </View>
    );
};

export const SearchInput = <T,>(rawProps: SearchInputModel<T>) => {
    // Defaults → theme.components.SearchInput → variante → props → plataforma
    // (listType, emptyText, debounce, clearable, _tag... también se pueden definir en el tema)
    let [{
        value, multiple, _item, listType = 'menu', _list, maxListHeight = 220,
        filter, emptyText = 'Sin resultados', onSearch, debounce = 300, loading, clearable, maxSelected,
        _emptyText, _loading, _clearable, _tags, _tag, _tagRemove,
        variant: _variant,
        ...props
    }] = useThemeProps<SearchInputModel<T>>('SearchInput', rawProps);
    const [text, setText] = useState('')
    const searchTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
    useEffect(() => () => clearTimeout(searchTimer.current), [])
    // Solo se usa en modo absolute (en modo menu el estado de apertura lo lleva el Menu)
    const [listOpen, setListOpen] = useState(false)
    // Último label mostrado por un valor elegido (para limpiarlo si el valor se borra desde fuera)
    const shownLabel = useRef<string | null>(null)

    // label y value de _item son los nombres de los campos, no props del botón
    const { label: labelKey, value: valueKey, ...itemProps } = _item ?? ({} as NonNullable<typeof _item>)
    // ?? y no ||: un label o value como 0 o '' es válido (con || se perdía, p. ej. un item con id 0)
    const getLabel = (item: any) => item?.[labelKey as any] ?? item?.['props']?.label
    const getValue = (item: any) => item?.[valueKey as any] ?? item?.['props']?.value

    if (multiple && !Array.isArray(value)) value = []

    const onSelect = (item) => {
        if (Array.isArray(value) && multiple) {
            props.onChange?.([...value, item])
        } else {
            setText(getLabel(item))
            props.onChange?.(item)
        }
    }

    // Simple: el texto muestra el valor elegido; si el valor se borra desde fuera (p. ej. reset de un
    // formulario) se limpia, pero no si el usuario está escribiendo (al escribir el valor pasa a null)
    useEffect(() => {
        if (multiple || Array.isArray(value)) return
        if (value != null) {
            shownLabel.current = String(getLabel(value) ?? '')
            setText(shownLabel.current)
        } else if (shownLabel.current !== null) {
            setText(t => (t === shownLabel.current ? '' : t))
            shownLabel.current = null
        }
    }, [value])

    // Opciones filtradas por el texto y sin las ya elegidas (con onSearch, por defecto sin filtro local).
    // Memorizado: solo se recalcula si cambian los datos, el texto o la selección (no en cada render)
    const maxReached = Array.isArray(value) && maxSelected != null && value.length >= maxSelected
    const options = useMemo(() => {
        if (maxReached) return []
        const items = (props.data || Children.toArray(props.children)) as any[]
        // Múltiple: los elegidos (ya en etiquetas) no se repiten; en un Set, comprobar cada opción es O(1).
        // Simple: el elegido sigue en la lista (al reabrir con su texto, aparece él y no "Sin resultados")
        const selected = new Set((Array.isArray(value) ? value : []).map(x => String(getValue(x))))
        const query = normalize(text)
        const matches = filter ?? (onSearch ? false : (item: any) => normalize(getLabel(item)).includes(query))
        return items.filter(item => !selected.has(String(getValue(item))) && (!matches || !text || matches(item, text)))
    }, [props.data, props.children, text, value, maxReached, filter, onSearch, labelKey, valueKey])

    // Fila de estado: cargando, o sin resultados (solo si se escribió algo)
    const { _container: loadingContainer, ...spinnerProps } = _loading ?? {}
    const statusRow = loading
        ? <Box py={3} alignItems="center" {...loadingContainer}><Spinner size="small" color="primary.100" {...spinnerProps} /></Box>
        : options.length === 0 && !maxReached && text !== '' && emptyText != null && emptyText !== false
            ? (typeof emptyText === 'string' ? <Text px={2.5} py={2.5} color="silver" {..._emptyText}>{emptyText}</Text> : <>{emptyText}</>)
            : null

    const changeText = (t: string) => {
        setText(t)
        if (onSearch) {
            clearTimeout(searchTimer.current)
            searchTimer.current = setTimeout(() => onSearch(t), debounce)
        }
    }

    const renderOption = (item: any, close: () => void) => {
        // SearchInput.Item: su label y value tampoco son props del botón
        const { label: _label, value: _value, ...optionProps } = item?.props ?? {}
        return <Button variant={'ghost'} rounded={0} onPress={() => {
            onSelect(item)
            // En modo simple ya hay valor: se cierra y se quita el foco (si no, al cerrarse la lista
            // Android reasigna el foco al siguiente input); en múltiple sigue abierto para elegir más
            if (!multiple) {
                close()
                Keyboard.dismiss()
            }
        }} {...itemProps} {...optionProps}>
            {getLabel(item)}
        </Button>
    }

    const renderInput = (open: () => void, close: () => void) => (
        <Input
            value={text}
            {...props?._input}
            iconRight={(clearable && (text !== '' || (!multiple && value != null))) || props?._input?.iconRight ? (
                <>
                    {clearable && (text !== '' || (!multiple && value != null)) && (
                        <Button
                            variant="ghost"
                            colorScheme="secondary"
                            rounded={40}
                            p={1}
                            mr={2}
                            accessibilityLabel="Borrar"
                            icon={<Icon name="close" as="AntDesign" size={14} color="silver" />}
                            {..._clearable}
                            onPress={(e) => {
                                changeText('')
                                if (!multiple && value != null) props.onChange?.(null)
                                _clearable?.onPress?.(e)
                            }}
                        />
                    )}
                    {props?._input?.iconRight}
                </>
            ) : undefined}
            onChangeText={e => {
                if (value && !multiple) props.onChange?.(null)
                changeText(e)
                // Escribir vuelve a mostrar las opciones (p. ej. tras elegir una y borrar)
                open()
            }}
            onFocus={e => {
                open()
                props?._input?.onFocus?.(e)
            }}
            // Abre también al tocar el input si ya tenía el foco (onFocus no se repite).
            // onPress y no onPressIn: onPressIn salta al empezar un scroll encima del input
            onPress={e => {
                open()
                props?._input?.onPress?.(e)
            }}
            onBlur={e => {
                close()
                props?._input?.onBlur?.(e)
            }}
        />
    )

    const openList = () => setListOpen(true)
    const closeList = () => setListOpen(false)

    return (
        <>
            {listType === 'absolute' ? (
                <AbsoluteDropdown
                    open={listOpen && (options.length > 0 || statusRow != null)}
                    focused={listOpen}
                    placement={props.placement === 'top' ? 'top' : 'bottom'}
                    fixedPlacement={props.fixedPlacement}
                    maxListHeight={maxListHeight}
                    _list={_list}
                    input={renderInput(openList, closeList)}
                >
                    {loading && statusRow}
                    {options.map((item, i) => (
                        <React.Fragment key={String(getValue(item) ?? i)}>{renderOption(item, closeList)}</React.Fragment>
                    ))}
                    {!loading && statusRow}
                </AbsoluteDropdown>
            ) : (
                <Menu
                    backdrop={false}
                    useTriggerWidth
                    trigger={({ open, close }) => renderInput(open, close)}
                    renderItem={({ item, close }) => renderOption(item, close)}
                    {...props}
                    data={options}
                    emptyContent={options.length === 0 ? statusRow : undefined}
                    // Cargando con resultados previos: el indicador va encima de la lista
                    _contentStyle={{ ...props._contentStyle, ListHeaderComponent: loading && options.length > 0 ? statusRow : props._contentStyle?.ListHeaderComponent }}
                />
            )}
            {Array.isArray(value) &&
                <Box flexDir="row" flexWrap={'wrap'} py={value.length ? 2 : 0} gap={8} {..._tags}>
                    {value.map((item, i) => {
                        const label = getLabel(item)
                        return (
                            <Box key={label + i} variant={'badge'} {..._tag}>
                                {label}
                                <Button
                                    rounded={40}
                                    colorScheme={'danger'}
                                    p={1}
                                    accessibilityLabel={`Quitar ${label}`}
                                    icon={<Icon name="close" as={'AntDesign'} size={12} />}
                                    {..._tagRemove}
                                    onPress={(e) => {
                                        props.onChange?.((value as T[]).filter((_, j) => j !== i))
                                        _tagRemove?.onPress?.(e)
                                    }}
                                />
                            </Box>
                        )
                    })}
                </Box>
            }
        </>
    )
}

SearchInput.Item = SearchInputItem;
