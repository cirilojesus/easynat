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
/** Tipo del componente genérico (igual patrón que Menu) */
type FlatListComponent = <T = any>(props: BSFlatListProps<T> & {
    ref?: React.Ref<RNFlatList<T>>;
}) => React.ReactElement | null;
/** ✅ EXPORT FINAL (CLAVE para que el .d.ts NO colapse a any) */
export declare const FlatList: FlatListComponent;
export {};
