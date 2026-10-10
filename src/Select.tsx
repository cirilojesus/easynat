import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { FlatList, Keyboard } from "react-native";
import { EAPressableProps, Pressable } from "./Pressable";
import { Icon, IconProps } from "./Icon";
import { EAModalRef, Modal } from "./Modal";
import { Box, EABoxProps } from "./Box";
import { EATextProps, Text } from "./Text";
import { Input, EATextInputProps } from "./Input";
import { Button } from "./Button";
import { Label, LabelRef } from "./Label";
import { useThemeProps } from "./utils/useThemeProps";
import { libT } from "./utils/translate";
import { withAlpha } from "./utils/color";

export type SelectValue = string | number;

/** Una opción: con `options` o con <Select.Item> */
export type SelectOption = {
    label: string | number;
    value: SelectValue;
    /** Texto pequeño debajo del label */
    description?: string;
    /** Icono o elemento a la izquierda */
    icon?: React.ReactElement<any>;
    disabled?: boolean;
    /** Las opciones con el mismo group se agrupan bajo ese título (en el orden en que aparecen) */
    group?: string;
};

export type EASelectProps = Omit<EAPressableProps, 'onChange' | 'children'> & {
    placeholder?: string;
    /** Valor elegido (controlado). Con multiple, un array */
    value?: SelectValue | SelectValue[] | null;
    /** Valor inicial (sin controlar); si cambia, también se aplica */
    defaultValue?: SelectValue | SelectValue[] | null;
    /** El valor (con multiple, el array) y la opción u opciones elegidas. Con clearable, null al borrar */
    onChange?: (value: any, option?: SelectOption | SelectOption[]) => void;
    /** Las opciones como array (en vez de <Select.Item>) */
    options?: SelectOption[];
    /** Elegir varias: el panel no se cierra al tocar y tiene botón de listo */
    multiple?: boolean;
    /** Con multiple: cuántas como máximo (las demás se deshabilitan al llegar) */
    maxSelected?: number;
    /** Buscador encima de la lista (sin acentos ni mayúsculas, en el label y la descripción) */
    searchable?: boolean;
    searchPlaceholder?: string;
    /** Texto cuando la búsqueda no encuentra nada */
    emptyText?: string;
    /** Botón × para borrar lo elegido */
    clearable?: boolean;
    /** Título del panel. Por defecto el label; false para quitarlo */
    title?: string | false;
    /** Borde de error (danger) */
    isInvalid?: boolean;
    /** Cerrar al elegir. Por defecto true (con multiple, false) */
    closeOnSelect?: boolean;
    /** Lo que se muestra en el campo. Por defecto el label (con multiple, los labels separados por comas) */
    renderValue?: (selected: SelectOption[]) => React.ReactNode;
    onOpen?: () => void;
    onClose?: () => void;
    /** El panel (contenido del modal) */
    _menu?: Partial<EABoxProps>;
    _option?: Partial<EAPressableProps>;
    _selected?: Partial<EAPressableProps>;
    /** El título de cada grupo */
    _group?: Partial<EATextProps>;
    _search?: Partial<EATextInputProps>;
    /** El check de las opciones elegidas (false para quitarlo) */
    _check?: Partial<IconProps<any>> | false;
    _icon?: Partial<IconProps<any>>;
    icon?: boolean | React.ReactElement<any>
    children?: React.ReactNode;
    label?: string;
    _label?: EATextProps,
    isFloat?: boolean;
    isRequired?: boolean;
    _containerStyle?: EABoxProps;
    variant?: (string & {});
    size?: 'sm' | 'md' | 'lg' | 'xl';
};

export type EASelectItemProps = EAPressableProps & Omit<SelectOption, 'disabled'>;

export type SelectRef = {
    open: () => void;
    close: () => void;
    /** Borra lo elegido (llama a onChange con null, o [] con multiple) */
    clear: () => void;
    isOpen: () => boolean;
};

const SelectItem: React.FC<EASelectItemProps> = () => null;

const SELECT_SIZES: Record<NonNullable<EASelectProps['size']>, EASelectProps> = {
    sm: { p: 1.5, _text: { fontSize: 12 }, _label: { fontSize: 12 } },
    md: { p: 2, _text: { fontSize: 14 }, _label: { fontSize: 14 } },
    lg: { p: 2.5, _text: { fontSize: 16 }, _label: { fontSize: 16 } },
    xl: { p: 3, _text: { fontSize: 18 }, _label: { fontSize: 18 } },
};

// Sin acentos ni mayúsculas
const norm = (s: unknown) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const asArray = (v: EASelectProps['value']): SelectValue[] => (v == null ? [] : Array.isArray(v) ? v : [v]);

type Row = { type: 'group'; title: string } | { type: 'option'; option: SelectOption; props: Record<string, any> };

// Una clave para comparar estilos por su contenido (si tienen algo que no se puede serializar, siempre distinta)
const safeKey = (v: unknown) => { try { return JSON.stringify(v) } catch { return String(Math.random()) } };
const sameProps = (a: Record<string, any>, b: Record<string, any>) => {
    if (a === b) return true;
    const ka = Object.keys(a), kb = Object.keys(b);
    return ka.length === kb.length && ka.every(k => a[k] === b[k] || (typeof a[k] === 'object' && safeKey(a[k]) === safeKey(b[k])));
};
const sameOption = (a: SelectOption, b: SelectOption) => a === b || (a.value === b.value && a.label === b.label
    && a.description === b.description && a.disabled === b.disabled && a.group === b.group && a.icon === b.icon);

type Look = { _option?: Partial<EAPressableProps>; _selected?: Partial<EAPressableProps>; _check?: Partial<IconProps<any>> | false; selectedBg: string };
type OptionRowProps = {
    option: SelectOption; itemProps: Record<string, any>; isSelected: boolean; disabled: boolean; multiple: boolean; look: Look;
    onPick: (o: SelectOption, itemOnPress?: (e: any) => void, e?: any) => void;
};

// Una opción de la lista. Memorizada: al marcar una, solo se repintan las que cambian (con miles de opciones se nota)
const OptionRow = React.memo(({ option: o, itemProps, isSelected, disabled, multiple, look, onPick }: OptionRowProps) => {
    const { _option, _selected, _check, selectedBg } = look;
    return (
        <Pressable
            p={3}
            px={4}
            flexDir="row"
            alignItems="center"
            gap={3}
            borderBottomWidth={1}
            borderBottomColor="light.100"
            bg={isSelected && !multiple ? selectedBg : undefined}
            onPress={() => onPick(o)}
            _pressed={{ opacity: 0.5 }}
            accessibilityRole={multiple ? 'checkbox' : 'button'}
            accessibilityState={{ selected: isSelected, checked: multiple ? isSelected : undefined, disabled }}
            {..._option}
            {...itemProps}
            disabled={disabled}
            {...(itemProps.onPress ? { onPress: (e: any) => onPick(o, itemProps.onPress, e) } : {})}
            {...(isSelected ? _selected : {})}
        >
            {o.icon}
            <Box flex={1} minW={0}>
                <Text {..._option?._text} {...itemProps._text} {...(isSelected ? _selected?._text : null)}>{o.label}</Text>
                {o.description ? <Text variant="caption" mt={0.5}>{o.description}</Text> : null}
            </Box>
            {_check !== false && (multiple || isSelected) && (
                <Icon as="Feather" name={multiple ? (isSelected ? 'check-square' : 'square') : 'check'} size={18}
                    color={isSelected ? 'primary.100' : 'text.subtle'} {..._check} />
            )}
        </Pressable>
    );
}, (a, b) => a.isSelected === b.isSelected && a.disabled === b.disabled && a.multiple === b.multiple && a.look === b.look
    && a.onPick === b.onPick && sameOption(a.option, b.option) && sameProps(a.itemProps, b.itemProps));

export const Select = forwardRef<SelectRef, EASelectProps>((props, ref) => {
    const modal = useRef<EAModalRef>(null);
    const labelRef = useRef<LabelRef>(null);
    const [fieldHeight, setFieldHeight] = useState(0);
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');

    // Defaults → theme.components.Select → variante → tamaño → props → plataforma
    // (todas sus props, incluidas _option, _selected, _menu e _icon, se pueden definir en el tema)
    const [{
        children, value, defaultValue, onChange, options, multiple, maxSelected, searchable, searchPlaceholder, emptyText,
        clearable, title, isInvalid, closeOnSelect = !multiple, renderValue, onOpen, onClose,
        _option, _selected, _menu, _group, _search, _check, icon = true, _icon,
        isFloat, label, _label, isRequired, _containerStyle, placeholder, _text,
        variant: _variant, size: _size,
        ...pressableProps
    }, theme] = useThemeProps<EASelectProps>('Select', props, { sizes: SELECT_SIZES });
    // Fondo de la opción elegida: el primary muy suave (con primary.50 el texto quedaba apagado)
    const selectedBg = withAlpha(String(theme.colors?.['primary.100'] ?? '#4F46E5'), 0.1);

    // Las opciones: las de `options` y las de <Select.Item> (sus otras props van al botón de la opción)
    const all = useMemo(() => {
        const fromChildren = (React.Children.toArray(children).filter(React.isValidElement) as React.ReactElement<EASelectItemProps>[])
            .map(el => {
                const { label: l, value: v, description, icon: ic, group, ...rest } = el.props;
                return { option: { label: l, value: v, description, icon: ic, group, disabled: !!rest.disabled }, props: rest };
            });
        return [...(options ?? []).map(o => ({ option: o, props: {} as Record<string, any> })), ...fromChildren];
    }, [options, children]);

    // Controlado (value) o no (estado propio, que sigue a defaultValue si cambia: así lo usa el formulario)
    const controlled = value !== undefined;
    const [inner, setInner] = useState(defaultValue);
    useEffect(() => { if (!controlled) setInner(defaultValue) }, [defaultValue, controlled]);
    const current = controlled ? value : inner;
    const values = asArray(current);
    // Buscar por valor en un Map (con miles de opciones, find por cada valor se notaba)
    const byValue = useMemo(() => new Map(all.map(o => [o.option.value, o.option])), [all]);
    const selected = values.map(v => byValue.get(v)).filter(Boolean) as SelectOption[];

    // != null y no un if (valor): con el valor 0 el label flotante no subía
    const hasValue = selected.length > 0;
    useEffect(() => { labelRef.current?.animate(hasValue || open) }, [hasValue, open]);

    const emit = (next: SelectValue[] | SelectValue | null) => {
        if (!controlled) setInner(next);
        if (multiple) {
            const arr = asArray(next);
            onChange?.(arr, arr.map(v => byValue.get(v)).filter(Boolean) as SelectOption[]);
        } else onChange?.(next, next == null ? undefined : byValue.get(next as SelectValue));
    };

    const openMenu = () => { Keyboard.dismiss(); setOpen(true); modal.current?.open(); };
    // Cerrado en cuanto se pide (el label baja, el borde y la flecha vuelven); afterClose lo confirma sea cual sea la vía
    const closeMenu = () => { setOpen(false); modal.current?.close(); };
    const clear = () => emit(multiple ? [] : null);
    useImperativeHandle(ref, () => ({ open: openMenu, close: closeMenu, clear, isOpen: () => !!modal.current?.isOpen() }));

    const choose = (o: SelectOption) => {
        if (multiple) {
            const on = selectedSet.has(o.value);
            emit(on ? values.filter(v => v !== o.value) : [...values, o.value]);
        } else emit(o.value);
        if (closeOnSelect) closeMenu();
    };

    const full = multiple && maxSelected != null && values.length >= maxSelected;
    const selectedSet = useMemo(() => new Set(values), [JSON.stringify(values)]);
    // Las filas no se repintan si no cambia lo suyo: el handler es estable (lee la última versión) y el estilo solo
    // cambia si cambia su contenido (el tema crea objetos nuevos en cada render)
    const chooseRef = useRef(choose);
    chooseRef.current = choose;
    const itemPressRef = useRef(closeMenu);
    itemPressRef.current = closeMenu;
    const onPick = useRef((o: SelectOption, itemOnPress?: (e: any) => void, e?: any) => {
        if (itemOnPress) { itemPressRef.current(); itemOnPress(e); }
        else chooseRef.current(o);
    }).current;
    const lookKey = safeKey([_option, _selected, _check, selectedBg]);
    const look = useMemo(() => ({ _option, _selected, _check, selectedBg }), [lookKey]);
    const rowsVersion = `${[...selectedSet].join('\u0000')}|${full}|${lookKey}`;
    // Filas de la lista: títulos de grupo y opciones (filtradas por la búsqueda)
    const rows = useMemo(() => {
        const q = norm(query.trim());
        const shown = q ? all.filter(o => norm(o.option.label).includes(q) || norm(o.option.description).includes(q)) : all;
        const out: Row[] = [];
        const groups = [...new Set(shown.map(o => o.option.group))];
        for (const g of groups) {
            if (g) out.push({ type: 'group', title: g });
            for (const o of shown) if (o.option.group === g) out.push({ type: 'option', ...o });
        }
        return out;
    }, [all, query]);

    const shownValue = renderValue ? renderValue(selected) : selected.map(o => o.label).join(', ');
    const panelTitle = title === false ? null : title ?? label;
    const borderColor = isInvalid ? 'danger.100' : open ? 'primary.100' : pressableProps.borderColor ?? 'light.100';

    return (
        <Box {..._containerStyle}>
            {label && <Label ref={labelRef} isFloat={isFloat} isRequired={isRequired} fieldHeight={fieldHeight} {..._label}>{label}</Label>}
            <Pressable
                flexDir="row"
                alignItems="center"
                gap={1}
                p={2}
                borderWidth={1}
                _pressed={{ opacity: .5 }}
                rounded={1}
                accessibilityRole="button"
                accessibilityLabel={label ?? placeholder}
                accessibilityState={{ expanded: open, disabled: !!pressableProps.disabled }}
                accessibilityValue={hasValue ? { text: selected.map(o => String(o.label)).join(', ') } : undefined}
                {...pressableProps}
                borderColor={borderColor}
                onLayout={e => {
                    setFieldHeight(e.nativeEvent.layout.height);
                    pressableProps.onLayout?.(e);
                }}
                onPress={e => { openMenu(); pressableProps.onPress?.(e) }}
            >
                <Box flex={1} minW={0}>
                    {hasValue
                        ? (typeof shownValue === 'string' || typeof shownValue === 'number'
                            ? <Text numberOfLines={1} {..._text}>{shownValue}</Text>
                            : shownValue)
                        // Label flotante abajo (sin valor): hace de placeholder (el espacio mantiene el alto)
                        : <Text numberOfLines={1} color="text.subtle" {..._text}>{isFloat && label ? ' ' : placeholder || ' '}</Text>}
                </Box>
                {clearable && hasValue && !pressableProps.disabled && (
                    <Pressable onPress={clear} hitSlop={10} accessibilityRole="button" accessibilityLabel={libT('clear')} _pressed={{ opacity: .5 }}>
                        <Icon as="Feather" name="x" size={18} color="text.subtle" />
                    </Pressable>
                )}
                {icon === true ? <Icon as="Feather" name={open ? 'chevron-up' : 'chevron-down'} size={20} {..._icon} /> : icon && icon}
            </Pressable>
            <Modal
                ref={modal}
                header={{
                    children: (
                        <Box w="100%" gap={2}>
                            <Box height={1} mx="auto" w={40} rounded={4} bg="muted.100" />
                            {panelTitle ? <Text variant="title" px={2}>{panelTitle}</Text> : null}
                            {searchable && (
                                <Input
                                    value={query}
                                    onChangeText={setQuery}
                                    placeholder={searchPlaceholder ?? libT('search')}
                                    variant="filled"
                                    autoCorrect={false}
                                    iconLeft={<Icon as="Feather" name="search" size={16} ml={3} color="text.subtle" />}
                                    {..._search}
                                />
                            )}
                        </Box>
                    ),
                    px: 4, pt: 2, pb: 2,
                }}
                _contentStyle={{ h: "auto", maxH: "90%", roundedTop: 40, ..._menu }}
                buttonClose={false}
                onOpen={() => { setOpen(true); onOpen?.(); }}
                // El Modal solo avisa con onClose si lo cierra el usuario (atrás, fuera); afterClose llega siempre
                onClose={() => setOpen(false)}
                afterClose={() => { setOpen(false); setQuery(''); onClose?.(); }}
            >
                <FlatList
                    data={rows}
                    initialNumToRender={20}
                    windowSize={10}
                    keyboardShouldPersistTaps="handled"
                    keyExtractor={(r, index) => (r.type === 'group' ? `g:${r.title}` : `o:${String(r.option.value ?? index)}`)}
                    ListEmptyComponent={<Text textAlign="center" color="text.subtle" p={6}>{emptyText ?? libT('noResults')}</Text>}
                    extraData={rowsVersion}
                    renderItem={({ item: row }) => {
                        if (row.type === 'group') {
                            return <Text variant="overline" px={4} pt={3} pb={1} {..._group}>{row.title}</Text>;
                        }
                        const isSelected = selectedSet.has(row.option.value);
                        return (
                            <OptionRow
                                option={row.option}
                                itemProps={row.props}
                                isSelected={isSelected}
                                disabled={!!row.option.disabled || (full && !isSelected)}
                                multiple={!!multiple}
                                look={look}
                                onPick={onPick}
                            />
                        );
                    }}
                />
                {multiple && (
                    <Box flexDir="row" gap={2} p={3} px={4} borderTopWidth={1} borderColor="border" safeAreaBottom>
                        {clearable !== false && values.length > 0 && <Button variant="ghost" onPress={clear}>{libT('clear')}</Button>}
                        <Button flex={1} onPress={closeMenu}>{`${libT('done')}${values.length ? ` (${values.length})` : ''}`}</Button>
                    </Box>
                )}
            </Modal>
        </Box>
    );
}) as React.ForwardRefExoticComponent<EASelectProps & React.RefAttributes<SelectRef>> & { Item: React.FC<EASelectItemProps> };

Select.Item = SelectItem;
