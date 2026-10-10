import React from "react";
import { ViewProps, ListRenderItemInfo } from "react-native";
import { EADefaultProps } from "./utils/DEFAULT_PROPS";
import { EAFlatListProps } from "./FlatList";
import { EAButtonProps } from "./Button";
import { EABoxProps } from "./Box";
import { EATextProps } from "./Text";
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
export type EAMenuRenderItemInfo<T> = ListRenderItemInfo<T> & {
    close: () => void;
};
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
type MenuComponent = (<T = unknown>(props: EAMenuProps<T> & {
    ref?: React.Ref<MenuRef>;
}) => React.ReactElement | null) & {
    Item: React.FC<EAMenuItemType>;
    Divider: React.FC<EABoxProps>;
    Group: React.FC<EAMenuGroupProps>;
};
export declare const Menu: MenuComponent;
export {};
