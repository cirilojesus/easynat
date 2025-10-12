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
};
/** Tipo de instancia que expondrá la ref */
export type BSFlatListInstance<T> = RNFlatList<T>;
/**
 * Componente FlatList con:
 *  - forwardRef (para refs nativas)
 *  - overrides por plataforma
 *  - inferencia de tipo T igual al FlatList nativo
 */
export declare const FlatList: <T>(p: BSFlatListProps<T> & {
    ref?: React.Ref<RNFlatList<T>>;
}) => React.ReactElement;
