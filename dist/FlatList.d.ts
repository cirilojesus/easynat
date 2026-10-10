import React from "react";
import { FlatList as RNFlatList, FlatListProps } from "react-native";
import { EADefaultProps } from "./utils/DEFAULT_PROPS";
import { EABoxProps } from "./Box";
/** Props extra de tu proyecto */
export type EAFlatListProps<T> = FlatListProps<T> & EADefaultProps & {
    _ios?: EAFlatListProps<T>;
    _android?: EAFlatListProps<T>;
    _web?: EAFlatListProps<T>;
    _contentContainerStyle?: EABoxProps;
    variant?: (string & {});
};
/** Tipo de instancia que expondrá la ref */
export type EAFlatListInstance<T> = RNFlatList<T>;
/** Tipo del componente genérico (igual patrón que Menu) */
type FlatListComponent = <T = any>(props: EAFlatListProps<T> & {
    ref?: React.Ref<RNFlatList<T>>;
}) => React.ReactElement | null;
/** ✅ EXPORT FINAL (CLAVE para que el .d.ts NO colapse a any) */
export declare const FlatList: FlatListComponent;
export {};
