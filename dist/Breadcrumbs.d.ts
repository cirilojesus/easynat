import React from "react";
import { ViewProps } from "react-native";
import { EADefaultProps } from "./utils/DEFAULT_PROPS";
import { EAPressableProps } from "./Pressable";
import { EATextProps } from "./Text";
export type BreadcrumbItem = {
    label: React.ReactNode;
    /** Al tocarlo (sin onPress no se puede pulsar). El último es la página actual y nunca se pulsa */
    onPress?: () => void;
    /** Icono delante del texto (p. ej. una casa en el primero) */
    icon?: React.ReactElement;
    /** Clave para la lista (por defecto, su posición) */
    key?: string | number;
    disabled?: boolean;
};
/**
 * Ruta de navegación: "Inicio › Productos › Zapatillas". El último es la página actual (resaltado y sin pulsar).
 * Las props de estilo van a la fila.
 * @example
 * <Breadcrumbs items={[
 *     { label: 'Inicio', icon: <Icon name="home" size={14} />, onPress: () => nav.navigate('Home') },
 *     { label: 'Productos', onPress: () => nav.navigate('Products') },
 *     { label: 'Zapatillas' },
 * ]} />
 */
export type EABreadcrumbsProps = ViewProps & EADefaultProps & {
    items: BreadcrumbItem[];
    /** Separador: un texto ("/", "›") o un elemento. Por defecto, un icono chevron */
    separator?: React.ReactNode;
    /**
     * Máximo de elementos visibles: si hay más, se muestran el primero y los últimos con "…" en medio (al tocarlo se
     * despliegan todos). Por defecto, todos
     */
    maxItems?: number;
    /** true: una sola línea con scroll horizontal (empezando por el final). Por defecto false: salta de línea si no cabe */
    scrollable?: boolean;
    /** Estilo de cada elemento pulsable */
    _item?: EAPressableProps;
    /** Estilo del texto de los elementos */
    _text?: EATextProps;
    /** Estilo del texto del elemento actual (el último) */
    _current?: EATextProps;
    /** Estilo del separador (si es un texto) */
    _separator?: EATextProps;
    _ios?: Omit<EABreadcrumbsProps, '_ios' | '_android' | '_web'>;
    _android?: Omit<EABreadcrumbsProps, '_ios' | '_android' | '_web'>;
    _web?: Omit<EABreadcrumbsProps, '_ios' | '_android' | '_web'>;
    variant?: (string & {});
};
/** Ruta de navegación con el último elemento como página actual */
export declare const Breadcrumbs: React.FC<EABreadcrumbsProps>;
