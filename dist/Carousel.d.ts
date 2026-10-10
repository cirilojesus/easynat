import React from 'react';
import { EABoxProps } from './Box';
import { EAButtonProps } from './Button';
import { EAFlatListProps } from './FlatList';
export type CarouselRef = {
    /** Va a una diapositiva (desde 0) */
    goTo: (index: number, animated?: boolean) => void;
    next: () => void;
    prev: () => void;
    getIndex: () => number;
};
export type CarouselType<T = any> = EABoxProps & {
    /** En lugar de hijos: los datos y cómo pintar cada uno */
    data?: T[];
    renderItem?: (item: T, index: number) => React.ReactNode;
    keyExtractor?: (item: T, index: number) => string;
    /** Texto de la pestaña de cada dato (con data) */
    tabLabel?: (item: T, index: number) => string;
    /** Diapositiva visible (controlada) */
    index?: number;
    /** Con la que empieza (no controlada). Por defecto 0 */
    defaultIndex?: number;
    onIndexChange?: (index: number) => void;
    /** Pestañas. Por defecto, si algún item tiene `tab` (o hay tabLabel) */
    tabs?: boolean;
    tabsPosition?: 'top' | 'bottom';
    /** Flechas a los lados. Por defecto true */
    arrows?: boolean;
    /** Puntos abajo. Por defecto cuando no hay pestañas */
    dots?: boolean;
    /** Pasar solas cada X ms (true = 4000). Se para mientras se toca */
    autoplay?: boolean | number;
    /** Al llegar al final vuelve al principio (flechas, autoplay y next / prev). Por defecto false */
    loop?: boolean;
    /** Cuántas se ven a la vez (1.2 = una y un trozo de la siguiente). Por defecto 1 */
    itemsPerView?: number;
    /** Separación entre diapositivas (px). Por defecto 0 */
    gap?: number;
    /** Margen a los lados (px): con itemsPerView 1 deja ver un trozo de las de al lado, centrada. Por defecto 0 */
    inset?: number;
    /** Efecto al pasar: las de al lado más pequeñas ('scale') o más transparentes ('fade') */
    effect?: 'none' | 'scale' | 'fade';
    /** Deslizar con el dedo. Por defecto true */
    swipeEnabled?: boolean;
    _contentStyle?: Partial<EAFlatListProps<any>>;
    _contentTabStyle?: EABoxProps;
    _tabStyle?: EAButtonProps;
    _tabActiveStyle?: EAButtonProps;
    _arrow?: EAButtonProps;
    _dots?: EABoxProps;
    _dot?: EABoxProps;
    _dotActive?: EABoxProps;
    /** Estilo de cada diapositiva */
    _item?: EABoxProps;
    variant?: (string & {});
};
export type EACarouselItem = EABoxProps & {
    /** Texto de su pestaña */
    tab?: string;
};
declare const CarouselItem: React.FC<EACarouselItem>;
type CarouselComponent = (<T = any>(props: CarouselType<T> & {
    ref?: React.Ref<CarouselRef>;
}) => React.ReactElement | null) & {
    Item: typeof CarouselItem;
};
export declare const Carousel: CarouselComponent;
export {};
