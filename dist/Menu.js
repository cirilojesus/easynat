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
exports.Menu = void 0;
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const DEFAULT_PROPS_1 = require("./utils/DEFAULT_PROPS");
const Pressable_1 = require("./Pressable");
const react_native_safe_area_context_1 = require("react-native-safe-area-context");
const Portal_1 = require("./Portal");
const FlatList_1 = require("./FlatList");
const Button_1 = require("./Button");
const keyboard_1 = require("./utils/keyboard");
const useThemeProps_1 = require("./utils/useThemeProps");
const Box_1 = require("./Box");
const Text_1 = require("./Text");
const MenuItem = () => null;
MenuItem.displayName = "MenuItem";
/** Línea separadora entre items */
// Estilos del Menu para sus separadores y títulos: les llegan por el contexto (se pintan dentro del portal)
const MenuDivider = (props) => {
    const menu = react_1.default.useContext(MenuContext);
    return <Box_1.Box style={{ height: react_native_1.StyleSheet.hairlineWidth }} bg="light.200" my={1} {...menu === null || menu === void 0 ? void 0 : menu._divider} {...props}/>;
};
MenuDivider.displayName = "MenuDivider";
const MenuGroup = () => null;
MenuGroup.displayName = "MenuGroup";
const MenuGroupTitle = ({ title, _title }) => {
    const menu = react_1.default.useContext(MenuContext);
    return typeof title === 'string' || typeof title === 'number'
        ? <Text_1.Text px={2.5} pt={2} pb={1} fontSize={12} color="silver" {...menu === null || menu === void 0 ? void 0 : menu._groupTitle} {..._title}>{title}</Text_1.Text>
        : <>{title}</>;
};
// Aplana los children: Menu.Group se convierte en su título seguido de sus items (keys únicas por grupo)
const flattenItems = (children, prefix = '') => react_1.default.Children.toArray(children).flatMap((child) => {
    if (!react_1.default.isValidElement(child))
        return [];
    const key = prefix + String(child.key);
    if (child.type === MenuGroup) {
        const { title, _title, children: groupChildren } = child.props;
        return [<MenuGroupTitle key={key + ':title'} title={title} _title={_title}/>, ...flattenItems(groupChildren, key + '/')];
    }
    return [prefix ? react_1.default.cloneElement(child, { key }) : child];
});
// Separación entre el trigger y el menú, y margen mínimo con los bordes de la pantalla
const GAP = 4;
const EDGE = 8;
// Si en el lado preferido hay menos de esto y en el otro hay más, se cambia de lado
const MIN_SPACE = 160;
function MenuContent({ triggerLayout, positioned, placement, menuDir, useTriggerWidth, fixedPlacement, animation, style, onReady, children }) {
    const window = (0, react_native_1.useWindowDimensions)();
    const insets = (0, react_native_safe_area_context_1.useSafeAreaInsets)();
    const keyboardHeight = (0, keyboard_1.useKeyboardHeight)();
    // Tamaño del menú (se conoce tras el primer layout; hasta entonces no se muestra)
    const [menuSize, setMenuSize] = (0, react_1.useState)({ w: 0, h: 0 });
    const width = useTriggerWidth ? triggerLayout.width : menuSize.w;
    const clampLeft = (x) => Math.min(Math.max(x, EDGE), Math.max(window.width - width - EDGE, EDGE));
    const spaceBelow = window.height - keyboardHeight - insets.bottom - (triggerLayout.y + triggerLayout.height) - GAP - EDGE;
    const spaceAbove = triggerLayout.y - insets.top - GAP - EDGE;
    let position;
    let offset;
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
    }
    else {
        // Arriba o abajo; si en el lado preferido no hay sitio y en el otro hay más, cambia de lado
        const side = fixedPlacement ? placement : placement === 'bottom'
            ? (spaceBelow < MIN_SPACE && spaceAbove > spaceBelow ? 'top' : 'bottom')
            : (spaceAbove < MIN_SPACE && spaceBelow > spaceAbove ? 'bottom' : 'top');
        // Horizontal: alineado con el trigger según menuDir y sin salirse de la pantalla
        const desiredLeft = menuDir === 'left' ? triggerLayout.x : triggerLayout.x + triggerLayout.width - width;
        if (side === 'bottom') {
            position = { left: clampLeft(desiredLeft), top: triggerLayout.y + triggerLayout.height + GAP, maxHeight: Math.max(spaceBelow, 0) };
        }
        else {
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
    if (!sized)
        position = { left: 0, top: 0 };
    // Se muestra y anima cuando ya está en su sitio (trigger medido y tamaño conocido)
    (0, react_1.useEffect)(() => {
        if (positioned && sized)
            onReady();
    }, [positioned, sized]);
    return (<react_native_1.Animated.View accessibilityRole="menu" onLayout={e => {
            const { width: w, height: hgt } = e.nativeEvent.layout;
            if (Math.round(w) !== Math.round(menuSize.w) || Math.round(hgt) !== Math.round(menuSize.h))
                setMenuSize({ w, h: hgt });
        }} style={[
            style,
            Object.assign(Object.assign({ position: 'absolute' }, position), { width: useTriggerWidth ? triggerLayout.width : style.width, maxWidth: window.width - EDGE * 2, 
                // Mientras no se conoce su tamaño (primer layout) no se muestra, para que no salte
                opacity: positioned && sized ? animation : 0, transform: [offset] }),
        ]}>
            {children}
        </react_native_1.Animated.View>);
}
const MenuContext = react_1.default.createContext(null);
// Estilo por defecto de la caja del menú (theme.components.Menu puede cambiarlo)
const MENU_DEFAULTS = {
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
function InternalMenu(rawProps, ref) {
    // Defaults → theme.components.Menu → variante → props → plataforma
    // (placement, menuDir, backdrop, closeOnSelect... también se pueden definir en el tema)
    const [_a, theme] = (0, useThemeProps_1.useThemeProps)('Menu', rawProps, { defaults: MENU_DEFAULTS }), { trigger, children, style, defaultOpen, placement, menuDir, data, renderItem, variant: _variant } = _a, combinedProps = __rest(_a, ["trigger", "children", "style", "defaultOpen", "placement", "menuDir", "data", "renderItem", "variant"]);
    const parentMenu = react_1.default.useContext(MenuContext);
    // 'closing' mantiene el contenido montado mientras se anima el cierre
    const [status, setStatus] = (0, react_1.useState)(defaultOpen ? 'open' : 'closed');
    // Posición del trigger en la ventana; null hasta medirlo (mientras tanto el menú no se muestra)
    const [layout, setLayout] = (0, react_1.useState)(null);
    const animation = (0, react_1.useRef)(new react_native_1.Animated.Value(defaultOpen ? 1 : 0)).current;
    const triggerRef = (0, react_1.useRef)(null);
    // Estado síncrono para callbacks y animaciones (sin re-renders)
    const isOpen = (0, react_1.useRef)(!!defaultOpen);
    // Qué falta hacer cuando el contenido esté en su sitio (onReady): animar la apertura,
    // o (con defaultOpen, que monta abierto) solo avisar con onOpen
    const pending = (0, react_1.useRef)(defaultOpen ? 'notify' : null);
    // Últimas props para los callbacks estables
    const propsRef = (0, react_1.useRef)(combinedProps);
    propsRef.current = combinedProps;
    const styles = (0, DEFAULT_PROPS_1.DEFAULT_PROPS)(combinedProps, theme);
    const contentStyle = react_native_1.StyleSheet.flatten([style, ...styles]);
    const animate = (0, react_1.useCallback)((toValue, callBack) => {
        var _a;
        react_native_1.Animated.timing(animation, {
            toValue,
            duration: (_a = propsRef.current.duration) !== null && _a !== void 0 ? _a : 150,
            useNativeDriver: true,
        }).start(({ finished }) => finished && (callBack === null || callBack === void 0 ? void 0 : callBack()));
    }, []);
    // El contenido ya está colocado y con su tamaño
    const onContentReady = () => {
        var _a, _b;
        const action = pending.current;
        if (!action)
            return;
        pending.current = null;
        if (action === 'notify')
            isOpen.current && ((_b = (_a = propsRef.current).onOpen) === null || _b === void 0 ? void 0 : _b.call(_a));
        else
            animate(1, () => { var _a, _b; return isOpen.current && ((_b = (_a = propsRef.current).onOpen) === null || _b === void 0 ? void 0 : _b.call(_a)); });
    };
    // Mide el trigger desde su contenedor (funciona con o sin evento, y abriendo por ref)
    const measureTrigger = () => {
        const node = triggerRef.current;
        // Solo re-renderiza si la posición cambió de verdad (se mide a menudo mientras está abierto)
        const done = (l) => setLayout(prev => prev && Math.abs(prev.x - l.x) < 1 && Math.abs(prev.y - l.y) < 1
            && Math.abs(prev.width - l.width) < 1 && Math.abs(prev.height - l.height) < 1 ? prev : l);
        if (!(node === null || node === void 0 ? void 0 : node.measureInWindow))
            return done({ x: 0, y: 0, width: 0, height: 0 });
        node.measureInWindow((x, y, width, height) => done({ x, y, width, height }));
    };
    const open = (0, react_1.useCallback)(() => {
        if (isOpen.current)
            return;
        isOpen.current = true;
        pending.current = 'animate';
        // La posición de una apertura anterior ya no vale (el trigger puede haberse movido)
        setLayout(null);
        setStatus('open');
        measureTrigger();
    }, []);
    const close = (0, react_1.useCallback)(() => {
        var _a, _b;
        if (!isOpen.current)
            return;
        isOpen.current = false;
        pending.current = null;
        setStatus('closing');
        (_b = (_a = propsRef.current).onClose) === null || _b === void 0 ? void 0 : _b.call(_a);
        animate(0, () => {
            if (!isOpen.current)
                setStatus('closed');
        });
    }, []);
    const toggle = (0, react_1.useCallback)(() => (isOpen.current ? close() : open()), []);
    // Cierra este menú y los menús padre (al elegir un item en un submenú)
    const closeAll = (0, react_1.useCallback)(() => {
        close();
        parentMenu === null || parentMenu === void 0 ? void 0 : parentMenu.closeAll();
    }, [parentMenu]);
    // Mientras está abierto sigue al trigger: el teclado, un KeyboardAvoidingView o un scroll pueden moverlo
    // con animaciones de duración variable (en iOS terminan después del evento del teclado). Una medida
    // nativa cada ~100 ms solo con el menú abierto, y solo re-renderiza si la posición cambió
    (0, react_1.useEffect)(() => {
        if (status !== 'open')
            return;
        const timer = setInterval(() => isOpen.current && measureTrigger(), 100);
        return () => clearInterval(timer);
    }, [status]);
    // defaultOpen: monta abierto; solo hace falta medir el trigger
    (0, react_1.useEffect)(() => {
        if (defaultOpen)
            measureTrigger();
    }, []);
    const mounted = status !== 'closed';
    // Botón atrás de Android: cierra el menú si está abierto (el último registrado responde primero)
    (0, react_1.useEffect)(() => {
        if (!mounted)
            return;
        const sub = react_native_1.BackHandler.addEventListener("hardwareBackPress", () => {
            if (!isOpen.current)
                return false;
            close();
            return true;
        });
        return () => sub.remove();
    }, [mounted]);
    (0, react_1.useImperativeHandle)(ref, () => ({ open, close, toggle, isOpen: () => isOpen.current }), []);
    const renderItemDefault = ({ item }) => {
        // Cualquier otro elemento se pinta tal cual (recrearlo con <item.type {...props}> perdía el ref)
        if ((item === null || item === void 0 ? void 0 : item.type) !== MenuItem)
            return item;
        const _a = item.props, { label, value: _value, closeOnSelect } = _a, buttonProps = __rest(_a, ["label", "value", "closeOnSelect"]);
        return (<Button_1.Button children={label} variant={"ghost"} _text={{ color: 'text' }} rounded={0} justifyContent="flex-start" accessibilityRole="menuitem" accessibilityState={{ disabled: !!buttonProps.disabled }} {...buttonProps} onPress={(e) => {
                var _a, _b;
                (_a = buttonProps.onPress) === null || _a === void 0 ? void 0 : _a.call(buttonProps, e);
                if ((_b = closeOnSelect !== null && closeOnSelect !== void 0 ? closeOnSelect : combinedProps.closeOnSelect) !== null && _b !== void 0 ? _b : true)
                    closeAll();
            }}/>);
    };
    const items = data || flattenItems(children);
    const contextValue = (0, react_1.useMemo)(() => ({ closeAll, _divider: combinedProps._divider, _groupTitle: combinedProps._groupTitle }), [closeAll, combinedProps._divider, combinedProps._groupTitle]);
    const { emptyContent } = combinedProps;
    const renderFlatListItem = renderItem
        ? (info) => renderItem(Object.assign(Object.assign({}, info), { close }))
        : renderItemDefault;
    return (<>
            {/* Contenedor medible del trigger: permite posicionar el menú aunque se abra por ref */}
            <react_native_1.View ref={triggerRef} collapsable={false} style={react_native_1.StyleSheet.flatten((0, DEFAULT_PROPS_1.DEFAULT_PROPS)(combinedProps._trigger || {}, theme))}>
                {trigger === null || trigger === void 0 ? void 0 : trigger({ onPress: toggle, open, close, isOpen: status === 'open' })}
            </react_native_1.View>
            {/* Sin items (y sin emptyContent) no se pinta la caja vacía */}
            {mounted && (items.length > 0 || emptyContent != null) && (<Portal_1.Portal>
                    {/* El contexto va dentro del Portal para llegar al contenido (que se monta en otra capa) */}
                    <MenuContext.Provider value={contextValue}>
                        <react_native_1.View style={react_native_1.StyleSheet.absoluteFill} pointerEvents={"box-none"}>
                            {combinedProps.backdrop && <Pressable_1.Pressable onPress={() => combinedProps.backdrop != 'static' && close()} flex={1}/>}
                            <MenuContent triggerLayout={layout !== null && layout !== void 0 ? layout : { x: 0, y: 0, width: 0, height: 0 }} positioned={layout !== null} placement={placement} menuDir={menuDir} useTriggerWidth={combinedProps.useTriggerWidth} animation={animation} style={contentStyle} onReady={onContentReady} fixedPlacement={combinedProps.fixedPlacement}>
                                <FlatList_1.FlatList initialNumToRender={15} maxToRenderPerBatch={10} windowSize={10} nestedScrollEnabled keyboardShouldPersistTaps={"handled"} ListEmptyComponent={emptyContent} {...combinedProps._contentStyle} data={items} renderItem={renderFlatListItem}/>
                            </MenuContent>
                        </react_native_1.View>
                    </MenuContext.Provider>
                </Portal_1.Portal>)}
        </>);
}
// cast seguro: forwardRef devuelve un React component no-genérico, así que casteamos.
const MenuBase = (0, react_1.forwardRef)(InternalMenu);
// asignar la prop estática
MenuBase.Item = MenuItem;
MenuBase.Divider = MenuDivider;
MenuBase.Group = MenuGroup;
// export
exports.Menu = MenuBase;
