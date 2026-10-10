import React from "react";
import { ViewProps } from "react-native";
import { EATextProps } from "./Text";
import { EADefaultProps } from "./utils/DEFAULT_PROPS";
export type EABoxProps = ViewProps & EADefaultProps & {
    _text?: EATextProps;
    safeArea?: boolean;
    safeAreaTop?: boolean;
    safeAreaBottom?: boolean;
    safeAreaLeft?: boolean;
    safeAreaRight?: boolean;
    _ios?: Omit<EABoxProps, '_ios' | '_android' | '_web'>;
    _android?: Omit<EABoxProps, '_ios' | '_android' | '_web'>;
    _web?: Omit<EABoxProps, '_ios' | '_android' | '_web'>;
    padding?: number;
    paddingTop?: number;
    paddingBottom?: number;
    paddingLeft?: number;
    paddingRight?: number;
    paddingHorizontal?: number;
    paddingVertical?: number;
    variant?: BoxVariant | `${BoxVariant} ${string}` | (string & {});
};
export type BoxVariant = 'card' | 'card_sm' | 'card_flat' | 'card_elevated' | 'card_outline' | 'badge' | 'badge_sm' | 'badge_lg' | 'badge_outline' | 'dot' | 'row' | 'row_between' | 'column' | 'center' | 'fill' | 'absolute_fill' | 'overlay' | 'grid_sm' | 'grid' | 'grid_lg' | 'grid_xl' | 'col_1' | 'col_2' | 'col_3' | 'col_4' | 'col_5' | 'col_6' | 'divider' | 'divider_vertical' | 'section' | 'screen' | 'avatar' | 'avatar_sm' | 'avatar_lg' | 'chip' | 'surface' | 'footer';
/** Separación entre columnas (y entre filas) de cada rejilla, en px: las columnas llevan la mitad a cada lado */
export declare const GRID_GUTTERS: Record<string, number>;
export declare const Box: React.FC<EABoxProps>;
