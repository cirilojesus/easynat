import React from "react";
import { FlatList as RNFlatList, FlatListProps } from "react-native";
import { BSDefaultProps } from "./utils/DEFAULT_PROPS";
import { BSBoxProps } from "./Box";
/** Props extra de tu proyecto */
export type BSFlatListProps<T> = FlatListProps<T> & BSDefaultProps & {
    _ios?: BSFlatListProps<T>;
    _android?: BSFlatListProps<T>;
    _web?: BSFlatListProps<T>;
    _contentContainerStyle?: BSBoxProps;
    variant?: BSFlatListProps<T>;
};
/** Tipo de instancia que expondrá la ref */
export type BSFlatListInstance<T> = RNFlatList<T>;
/**
 * FlatList extendida con:
 * - forwardRef
 * - estilos por plataforma
 * - inferencia de tipo
 */
export declare const FlatList: <T>(props: any) => React.ReactElement;
