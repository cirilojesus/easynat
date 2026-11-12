import React from "react";
import { ViewProps } from "react-native";
import { EADefaultProps } from "./utils/DEFAULT_PROPS";
import { EAPressableProps } from "./Pressable";
import { EATextProps } from "./Text";
import { EAMenuProps } from "./Menu";
import { COLOR_SCHEME } from "./theme";
/** Una opción del desplegable de un elemento */
export type BreadcrumbOption = {
    label: string | number;
    onPress?: () => void;
    icon?: React.ReactElement;
    /** Marcada (p. ej. la opción en la que estás) */
    selected?: boolean;
    disabled?: boolean;
    key?: string | number;
};
export type BreadcrumbItem = {
    label: React.ReactNode;
    /** Al tocarlo (sin onPress ni options no se puede pulsar). El último es la página actual y no navega */
    onPress?: () => void;
    /** Icono delante del texto (p. ej. una casa en el primero) */
    icon?: React.ReactElement;
    /** Desplegable al tocarlo (p. ej. elegir otra carpeta o proyecto del mismo nivel). Lleva un chevron */
    options?: BreadcrumbOption[];
    /** Color de este elemento en variant="chips" / "arrows" (por defecto el colorScheme de Breadcrumbs) */
    colorScheme?: COLOR_SCHEME;
    /** Clave para la lista (por defecto, su posición) */
    key?: string | number;
    disabled?: boolean;
};
export type BreadcrumbsVariant = 'text' | 'underline' | 'chips' | 'arrows';
/**
 * Ruta de navegación: "Inicio › Productos › Zapatillas". El último es la página actual (resaltado y sin navegar).
 * Las props de estilo van a la fila.
 * @example
 * <Breadcrumbs items={[
 *     { label: 'Inicio', icon: <Icon as="Feather" name="home" size={14} />, onPress: () => nav.navigate('Home') },
 *     { label: 'Proyectos', options: proyectos.map(p => ({ label: p.nombre, onPress: () => abrir(p) })) },
 *     { label: 'Zapatillas' },
 * ]} />
 */
export type EABreadcrumbsProps = Omit<ViewProps, 'children'> & EADefaultProps & {
    items: BreadcrumbItem[];
    /**
     * Estilo: 'text' (por defecto, enlaces de color), 'underline' (enlaces subrayados), 'chips' (cada elemento en una
     * etiqueta de color) o 'arrows' (barra de flechas encadenadas, tipo pasos de un proceso)
     */
    variant?: BreadcrumbsVariant | (string & {});
    /** Color de los enlaces, chips y flechas. Por defecto 'primary' */
    colorScheme?: COLOR_SCHEME;
    /** Separador: 'chevron' (por defecto), 'slash', un texto ("›", "/") o un elemento. En 'arrows' no se usa */
    separator?: 'chevron' | 'slash' | React.ReactNode;
    /**
     * Máximo de elementos visibles: si hay más, se ven el primero, "…" y los últimos. Al tocar "…" se abre un menú
     * con los que faltan. Por defecto, todos
     */
    maxItems?: number;
    /** true: una sola línea con scroll horizontal (empezando por el final). Por defecto false: salta de línea */
    scrollable?: boolean;
    /** Delante de la ruta (p. ej. botones atrás / adelante) */
    startContent?: React.ReactNode;
    /** Detrás de la ruta */
    endContent?: React.ReactNode;
    /** Estilo de cada elemento pulsable */
    _item?: EAPressableProps;
    /** Estilo del texto de los elementos */
    _text?: EATextProps;
    /** Estilo del texto del elemento actual (el último) */
    _current?: EATextProps;
    /** Estilo del separador (si es un texto) */
    _separator?: EATextProps;
    /** Props de los menús desplegables (del "…" y de los elementos con options) */
    _menu?: Partial<EAMenuProps>;
    _ios?: Omit<EABreadcrumbsProps, '_ios' | '_android' | '_web'>;
    _android?: Omit<EABreadcrumbsProps, '_ios' | '_android' | '_web'>;
    _web?: Omit<EABreadcrumbsProps, '_ios' | '_android' | '_web'>;
};
/** Ruta de navegación con el último elemento como página actual */
export declare const Breadcrumbs: React.FC<EABreadcrumbsProps>;
