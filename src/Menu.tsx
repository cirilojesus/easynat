import React, {
    ReactElement,
    useRef,
    useState,
    forwardRef,
    useImperativeHandle,
    useCallback,
    useEffect,
    useMemo,
} from "react";
import {
    StyleSheet,
    ViewStyle,
    Animated,
    ViewProps,
    View,
    ListRenderItemInfo,
    BackHandler,
    useWindowDimensions,
} from "react-native";
import { EADefaultProps, DEFAULT_PROPS } from "./utils/DEFAULT_PROPS";
import { Pressable } from "./Pressable";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Portal } from "./Portal";
import { EAFlatListProps, FlatList } from "./FlatList";
import { EAButtonProps, Button } from "./Button";
import { useKeyboardHeight } from "./utils/keyboard";
import { useThemeProps } from "./utils/useThemeProps";
import { Box, EABoxProps } from "./Box";
import { Text, EATextProps } from "./Text";

/* ---------------- Types ---------------- */
/** bottom / top: debajo o encima del trigger · right / left: a su lado (útil para submenús) */
export type Placement = "bottom" | "top" | "right" | "left";
/** left: alinea el borde izquierdo con el trigger (crece hacia la derecha) · right: alinea el borde derecho (crece hacia la izquierda) */
export type MenuDir = "left" | "right";

/** Item por defecto para Menu.Item (si usas children). `disabled` lo muestra atenuado y sin respuesta */
export type EAMenuItemType = EAButtonProps & {
    label?: string | number;
    value?: string | number;
    /** false: elegirlo no cierra el menú (p. ej. opciones que se marcan y desmarcan). Por defecto, el del Menu */
    closeOnSelect?: boolean;
};

/** Menu.Group: título de sección seguido de sus items */
export type EAMenuGroupProps = {
    title: React.ReactNode;
    children?: React.ReactNode;
    /** Estilo del título de este grupo (se suma al _groupTitle del Menu) */
    _title?: EATextProps;
};

export type MenuRef = {
    open: () => void;
    close: () => void;
    toggle: () => void;
    isOpen: () => boolean;
};

/** Lo que recibe la función `trigger` */
export type EAMenuTriggerProps = {
    /** Alterna abrir / cerrar (para onPress de un botón) */
    onPress: (e?: any) => void;
    open: () => void;
    close: () => void;
    isOpen: boolean;
};

/** Lo que recibe `renderItem`: lo de FlatList más close() para cerrar el menú al elegir */
export type EAMenuRenderItemInfo<T> = ListRenderItemInfo<T> & { close: () => void };

export type EAMenuProps<T = unknown> = ViewProps & EADefaultProps & {
    trigger?: (props: EAMenuTriggerProps) => React.ReactNode;
    /** El menú monta ya abierto (sin animación de entrada) */
    defaultOpen?: boolean;
    /** Lado preferido; si no cabe y hay más espacio en el otro, se coloca en el otro (salvo fixedPlacement) */
    placement?: Placement;
    menuDir?: MenuDir;
    _ios?: EAMenuProps<T>;
    _android?: EAMenuProps<T>;
    _web?: EAMenuProps<T>;
    /** Menu.Item u otros elementos (los falsy, p. ej. {cond && <Menu.Item/>}, se ignoran) */
    children?: React.ReactNode;
    _contentStyle?: Partial<EAFlatListProps<T>>;
    data?: T[];
    renderItem?: (info: EAMenuRenderItemInfo<T>) => React.ReactElement | null;
    backdrop?: boolean | 'static';
    useTriggerWidth?: boolean;
    /** Usa siempre el lado de `placement`, aunque no quepa (sin cambiar al otro lado) */
    fixedPlacement?: boolean;
    /** false: elegir un Menu.Item no cierra el menú (se puede cambiar por item). Por defecto true */
    closeOnSelect?: boolean;
    /** Contenido a mostrar cuando no hay items (p. ej. "Sin resultados"); sin él, el menú vacío no se muestra */
    emptyContent?: React.ReactNode;
    /** Duración de la animación en ms (por defecto 150 al abrir y 120 al cerrar) */
    duration?: number;
    /** Se llama cuando el menú termina de abrirse */
    onOpen?: () => void;
    /** Se llama cuando el menú se cierra (por cualquier vía) */
    onClose?: () => void;
    /** Estilo del contenedor del trigger (p. ej. { flex: 1 } si el trigger debe ocupar el espacio en una fila) */
    _trigger?: EADefaultProps & ViewProps;
    /** Estilo de todos los Menu.Divider de este menú */
    _divider?: EABoxProps;
    /** Estilo de todos los títulos de Menu.Group de este menú */
    _groupTitle?: EATextProps;
    variant?: (string & {});
};

type Layout = { x: number; y: number; width: number; height: number };

const MenuItem: React.FC<EAMenuItemType> = () => null;
MenuItem.displayName = "MenuItem";
/** Línea separadora entre items */
// Estilos del Menu para sus separadores y títulos: les llegan por el contexto (se pintan dentro del portal)
const MenuDivider: React.FC<EABoxProps> = (props) => {
    const menu = React.useContext(MenuContext);
    return <Box style={{ height: StyleSheet.hairlineWidth }} bg="light.200" my={1} {...menu?._divider} {...props} />;
};
MenuDivider.displayName = "MenuDivider";
const MenuGroup: React.FC<EAMenuGroupProps> = () => null;
MenuGroup.displayName = "MenuGroup";
const MenuGroupTitle = ({ title, _title }: Pick<EAMenuGroupProps, 'title' | '_title'>) => {
    const menu = React.useContext(MenuContext);
    return typeof title === 'string' || typeof title === 'number'
        ? <Text px={2.5} pt={2} pb={1} fontSize={12} color="silver" {...menu?._groupTitle} {..._title}>{title}</Text>
        : <>{title}</>;
};

// Aplana los children: Menu.Group se convierte en su título seguido de sus items (keys únicas por grupo)
const flattenItems = (children: React.ReactNode, prefix = ''): React.ReactElement<any>[] =>
    React.Children.toArray(children).flatMap((child: any) => {
        if (!React.isValidElement(child)) return [];
        const key = prefix + String(child.key);
        if (child.type === MenuGroup) {
            const { title, _title, children: groupChildren } = child.props as EAMenuGroupProps;
            return [<MenuGroupTitle key={key + ':title'} title={title} _title={_title} />, ...flattenItems(groupChildren, key + '/')];
        }
        return [prefix ? React.cloneElement(child, { key }) : child];
    });

// Separación entre el trigger y el menú, y margen mínimo con los bordes de la pantalla
const GAP = 4;
const EDGE = 8;
// Si en el lado preferido hay menos de esto y en el otro hay más, se cambia de lado
const MIN_SPACE = 160;

/* ---------- Contenido: solo se monta con el menú abierto (escucha el teclado solo entonces) ---------- */

type ContentProps = {
    triggerLayout: Layout;
    /** El trigger ya se midió: hasta entonces no se muestra (evita pintarlo en 0,0) */
    positioned: boolean;
    placement: Placement;
    menuDir: MenuDir;
    useTriggerWidth?: boolean;
    animation: Animated.Value;
    style: ViewStyle;
    /** Ya está en su sitio y con su tamaño: se puede mostrar */
    onReady: () => void;
    fixedPlacement?: boolean;
    children: React.ReactNode;
};

function MenuContent({ triggerLayout, positioned, placement, menuDir, useTriggerWidth, fixedPlacement, animation, style, onReady, children }: ContentProps) {
    const window = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const keyboardHeight = useKeyboardHeight();
    // Tamaño del menú (se conoce tras el primer layout; hasta entonces no se muestra)
    const [menuSize, setMenuSize] = useState({ w: 0, h: 0 });

    const width = useTriggerWidth ? triggerLayout.width : menuSize.w;
    const clampLeft = (x: number) => Math.min(Math.max(x, EDGE), Math.max(window.width - width - EDGE, EDGE));
    const spaceBelow = window.height - keyboardHeight - insets.bottom - (triggerLayout.y + triggerLayout.height) - GAP - EDGE;
    const spaceAbove = triggerLayout.y - insets.top - GAP - EDGE;

    let position: ViewStyle;
    let offset: { translateX: Animated.AnimatedInterpolation<number> } | { translateY: Animated.AnimatedInterpolation<number> };

    if (placement === 'right' || placement === 'left') {
        // Al lado del trigger (submenús), alineado con su parte superior; si no cabe, al otro lado
        const spaceRight = window.width - (triggerLayout.x + triggerLayout.width) - GAP - EDGE;
        const spaceLeft = triggerLayout.x - GAP - EDGE;
        const side = fixedPlacement ? placement : placement === 'right'
            ? (spaceRight < width && spaceLeft > spaceRight ? 'left' : 'right')
            : (spaceLeft < width && spaceRight > spaceLeft ? 'right' : 'left');
        const x = side === 'right' ? triggerLayout.x + triggerLayout.width + GAP : triggerLayout.x - width - GAP;
        const minTop = insets.top + EDGE;
        const bottomLimit = window.height - keyboardHeight - insets.bottom - EDGE;
        // Alineado con la parte superior del trigger, pero subiéndolo si no cabe por abajo
        const top = Math.max(Math.min(triggerLayout.y, bottomLimit - menuSize.h), minTop);
        position = { left: clampLeft(x), top, maxHeight: bottomLimit - minTop };
        offset = { translateX: animation.interpolate({ inputRange: [0, 1], outputRange: [side === 'right' ? -6 : 6, 0] }) };
    } else {
        // Arriba o abajo; si en el lado preferido no hay sitio y en el otro hay más, cambia de lado
        const side: Placement = fixedPlacement ? placement : placement === 'bottom'
            ? (spaceBelow < MIN_SPACE && spaceAbove > spaceBelow ? 'top' : 'bottom')
            : (spaceAbove < MIN_SPACE && spaceBelow > spaceAbove ? 'bottom' : 'top');
        // Horizontal: alineado con el trigger según menuDir y sin salirse de la pantalla
        const desiredLeft = menuDir === 'left' ? triggerLayout.x : triggerLayout.x + triggerLayout.width - width;
        if (side === 'bottom') {
            position = { left: clampLeft(desiredLeft), top: triggerLayout.y + triggerLayout.height + GAP, maxHeight: Math.max(spaceBelow, 0) };
        } else {
            // Arriba se ancla con `bottom` para no depender de la altura del menú (sin saltos en el primer frame).
            // Si el trigger quedó bajo el teclado (p. ej. iOS sin scroll automático), el menú no baja de
            // la parte superior del teclado y reduce su alto para caber
            const minBottom = (keyboardHeight || insets.bottom) + EDGE;
            const bottom = Math.max(window.height - triggerLayout.y + GAP, minBottom);
            position = { left: clampLeft(desiredLeft), bottom, maxHeight: Math.max(window.height - bottom - insets.top - EDGE, 0) };
        }
        offset = { translateY: animation.interpolate({ inputRange: [0, 1], outputRange: [side === 'bottom' ? -6 : 6, 0] }) };
    }

    // El tamaño natural se mide primero (oculto) en la esquina, con todo el ancho de la pantalla: en su
    // posición final aún sin conocer su ancho (p. ej. pegado al borde derecho con menuDir="right" o
    // placement="left") el texto se partiría y se mediría un ancho menor del real
    const sized = menuSize.w > 0;
    if (!sized) position = { left: 0, top: 0 };

    // Se muestra y anima cuando ya está en su sitio (trigger medido y tamaño conocido)
    useEffect(() => {
        if (positioned && sized) onReady();
    }, [positioned, sized]);

    return (
        <Animated.View
            accessibilityRole="menu"
            onLayout={e => {
                const { width: w, height: hgt } = e.nativeEvent.layout;
                if (Math.round(w) !== Math.round(menuSize.w) || Math.round(hgt) !== Math.round(menuSize.h)) setMenuSize({ w, h: hgt });
            }}
            style={[
                style,
                {
                    position: 'absolute',
                    ...position,
                    width: useTriggerWidth ? triggerLayout.width : style.width,
                    maxWidth: window.width - EDGE * 2,
                    // Mientras no se conoce su tamaño (primer layout) no se muestra, para que no salte
                    opacity: positioned && sized ? animation : 0,
                    transform: [offset],
                },
            ]}
        >
            {children}
        </Animated.View>
    );
}

/* ---------------- Menu ---------------- */

// Menús anidados: cada menú expone a su contenido cómo cerrar toda la cadena (él y sus padres)
// (y los estilos de sus Menu.Divider y títulos de Menu.Group)
type MenuContextValue = { closeAll: () => void; _divider?: EABoxProps; _groupTitle?: EATextProps };
const MenuContext = React.createContext<MenuContextValue | null>(null);

type Status = 'closed' | 'open' | 'closing';

// Estilo por defecto de la caja del menú (theme.components.Menu puede cambiarlo)
const MENU_DEFAULTS: EAMenuProps<any> = {
    shadow: 3,
    borderWidth: 1,
    borderColor: "border",
    bg: "surface",
    py: 2,
    rounded: 2,
    backdrop: true,
    placement: "bottom",
    menuDir: "left",
};

function InternalMenu<T>(
    rawProps: EAMenuProps<T>,
    ref: React.Ref<MenuRef>
) {
    // Defaults → theme.components.Menu → variante → props → plataforma
    // (placement, menuDir, backdrop, closeOnSelect... también se pueden definir en el tema)
    const [{ trigger, children, style, defaultOpen, placement, menuDir, data, renderItem, variant: _variant, ...combinedProps }, theme] =
        useThemeProps<EAMenuProps<T>>('Menu', rawProps, { defaults: MENU_DEFAULTS });
    const parentMenu = React.useContext(MenuContext);
    // 'closing' mantiene el contenido montado mientras se anima el cierre
    const [status, setStatus] = useState<Status>(defaultOpen ? 'open' : 'closed');
    // Posición del trigger en la ventana; null hasta medirlo (mientras tanto el menú no se muestra)
    const [layout, setLayout] = useState<Layout | null>(null);
    const animation = useRef(new Animated.Value(defaultOpen ? 1 : 0)).current;
    const triggerRef = useRef<View>(null);

    // Estado síncrono para callbacks y animaciones (sin re-renders)
    const isOpen = useRef(!!defaultOpen);
    // Qué falta hacer cuando el contenido esté en su sitio (onReady): animar la apertura,
    // o (con defaultOpen, que monta abierto) solo avisar con onOpen
    const pending = useRef<'animate' | 'notify' | null>(defaultOpen ? 'notify' : null);

    // Últimas props para los callbacks estables
    const propsRef = useRef(combinedProps);
    propsRef.current = combinedProps;

    const styles = DEFAULT_PROPS(combinedProps, theme);
    const contentStyle = StyleSheet.flatten<ViewStyle>([style, ...styles]);

    const animate = useCallback((toValue: 0 | 1, callBack?: () => void) => {
        Animated.timing(animation, {
            toValue,
            duration: propsRef.current.duration ?? 150,
            useNativeDriver: true,
        }).start(({ finished }) => finished && callBack?.());
    }, []);

    // El contenido ya está colocado y con su tamaño
    const onContentReady = () => {
        const action = pending.current;
        if (!action) return;
        pending.current = null;
        if (action === 'notify') isOpen.current && propsRef.current.onOpen?.();
        else animate(1, () => isOpen.current && propsRef.current.onOpen?.());
    };

    // Mide el trigger desde su contenedor (funciona con o sin evento, y abriendo por ref)
    const measureTrigger = () => {
        const node = triggerRef.current;
        // Solo re-renderiza si la posición cambió de verdad (se mide a menudo mientras está abierto)
        const done = (l: Layout) => setLayout(prev => prev && Math.abs(prev.x - l.x) < 1 && Math.abs(prev.y - l.y) < 1
            && Math.abs(prev.width - l.width) < 1 && Math.abs(prev.height - l.height) < 1 ? prev : l);
        if (!node?.measureInWindow) return done({ x: 0, y: 0, width: 0, height: 0 });
        node.measureInWindow((x, y, width, height) => done({ x, y, width, height }));
    };

    const open = useCallback(() => {
        if (isOpen.current) return;
        isOpen.current = true;
        pending.current = 'animate';
        // La posición de una apertura anterior ya no vale (el trigger puede haberse movido)
        setLayout(null);
        setStatus('open');
        measureTrigger();
    }, []);

    const close = useCallback(() => {
        if (!isOpen.current) return;
        isOpen.current = false;
        pending.current = null;
        setStatus('closing');
        propsRef.current.onClose?.();
        animate(0, () => {
            if (!isOpen.current) setStatus('closed');
        });
    }, []);

    const toggle = useCallback(() => (isOpen.current ? close() : open()), []);

    // Cierra este menú y los menús padre (al elegir un item en un submenú)
    const closeAll = useCallback(() => {
        close();
        parentMenu?.closeAll();
    }, [parentMenu]);

    // Mientras está abierto sigue al trigger: el teclado, un KeyboardAvoidingView o un scroll pueden moverlo
    // con animaciones de duración variable (en iOS terminan después del evento del teclado). Una medida
    // nativa cada ~100 ms solo con el menú abierto, y solo re-renderiza si la posición cambió
    useEffect(() => {
        if (status !== 'open') return;
        const timer = setInterval(() => isOpen.current && measureTrigger(), 100);
        return () => clearInterval(timer);
    }, [status]);

    // defaultOpen: monta abierto; solo hace falta medir el trigger
    useEffect(() => {
        if (defaultOpen) measureTrigger();
    }, []);

    const mounted = status !== 'closed';

    // Botón atrás de Android: cierra el menú si está abierto (el último registrado responde primero)
    useEffect(() => {
        if (!mounted) return;
        const sub = BackHandler.addEventListener("hardwareBackPress", () => {
            if (!isOpen.current) return false;
            close();
            return true;
        });
        return () => sub.remove();
    }, [mounted]);

    useImperativeHandle(ref, () => ({ open, close, toggle, isOpen: () => isOpen.current }), []);

    const renderItemDefault = ({ item }: ListRenderItemInfo<ReactElement<EAMenuItemType>>) => {
        // Cualquier otro elemento se pinta tal cual (recrearlo con <item.type {...props}> perdía el ref)
        if (item?.type !== MenuItem) return item;
        const { label, value: _value, closeOnSelect, ...buttonProps } = item.props;
        return (
            <Button
                children={label}
                variant={"ghost"}
                _text={{ color: 'text' }}
                rounded={0}
                justifyContent="flex-start"
                accessibilityRole="menuitem"
                accessibilityState={{ disabled: !!buttonProps.disabled }}
                {...buttonProps}
                onPress={(e) => {
                    buttonProps.onPress?.(e);
                    if (closeOnSelect ?? combinedProps.closeOnSelect ?? true) closeAll();
                }}
            />
        );
    };

    const items = data || flattenItems(children);
    const contextValue = useMemo<MenuContextValue>(
        () => ({ closeAll, _divider: combinedProps._divider, _groupTitle: combinedProps._groupTitle }),
        [closeAll, combinedProps._divider, combinedProps._groupTitle]
    );
    const { emptyContent } = combinedProps;
    const renderFlatListItem = renderItem
        ? (info: ListRenderItemInfo<T>) => renderItem({ ...info, close })
        : renderItemDefault;

    return (
        <>
            {/* Contenedor medible del trigger: permite posicionar el menú aunque se abra por ref */}
            <View ref={triggerRef} collapsable={false} style={StyleSheet.flatten(DEFAULT_PROPS(combinedProps._trigger || {}, theme))}>
                {trigger?.({ onPress: toggle, open, close, isOpen: status === 'open' })}
            </View>
            {/* Sin items (y sin emptyContent) no se pinta la caja vacía */}
            {mounted && (items.length > 0 || emptyContent != null) && (
                <Portal>
                    {/* El contexto va dentro del Portal para llegar al contenido (que se monta en otra capa) */}
                    <MenuContext.Provider value={contextValue}>
                        <View style={StyleSheet.absoluteFill} pointerEvents={"box-none"}>
                            {combinedProps.backdrop && <Pressable onPress={() => combinedProps.backdrop != 'static' && close()} flex={1} />}
                            <MenuContent
                                triggerLayout={layout ?? { x: 0, y: 0, width: 0, height: 0 }}
                                positioned={layout !== null}
                                placement={placement}
                                menuDir={menuDir}
                                useTriggerWidth={combinedProps.useTriggerWidth}
                                animation={animation}
                                style={contentStyle}
                                onReady={onContentReady}
                                fixedPlacement={combinedProps.fixedPlacement}
                            >
                                <FlatList<any>
                                    initialNumToRender={15}
                                    maxToRenderPerBatch={10}
                                    windowSize={10}
                                    nestedScrollEnabled
                                    keyboardShouldPersistTaps={"handled"}
                                    ListEmptyComponent={emptyContent as any}
                                    {...combinedProps._contentStyle as any}
                                    data={items}
                                    renderItem={renderFlatListItem as any}
                                />
                            </MenuContent>
                        </View>
                    </MenuContext.Provider>
                </Portal>
            )}
        </>
    );
}

type MenuComponent = (<T = unknown>(props: EAMenuProps<T> & { ref?: React.Ref<MenuRef> }) => React.ReactElement | null) & {
    Item: React.FC<EAMenuItemType>;
    Divider: React.FC<EABoxProps>;
    Group: React.FC<EAMenuGroupProps>;
};

// cast seguro: forwardRef devuelve un React component no-genérico, así que casteamos.
const MenuBase = forwardRef(InternalMenu) as unknown as MenuComponent;

// asignar la prop estática
MenuBase.Item = MenuItem;
MenuBase.Divider = MenuDivider;
MenuBase.Group = MenuGroup;

// export
export const Menu = MenuBase as MenuComponent;
