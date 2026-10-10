import React, { forwardRef } from "react";
import {
    FlatList as RNFlatList,
    FlatListProps,
    StyleSheet,
    ViewStyle,
} from "react-native";
import { EADefaultProps, DEFAULT_PROPS } from "./utils/DEFAULT_PROPS";
import { EABoxProps } from "./Box";
import { useThemeProps } from "./utils/useThemeProps";

/** Props extra de tu proyecto */
export type EAFlatListProps<T> = FlatListProps<T> &
    EADefaultProps & {
        _ios?: EAFlatListProps<T>;
        _android?: EAFlatListProps<T>;
        _web?: EAFlatListProps<T>;
        _contentContainerStyle?: EABoxProps;
        variant?: (string & {});
    };

/** Tipo de instancia que expondrá la ref */
export type EAFlatListInstance<T> = RNFlatList<T>;

/** Tipo del componente genérico (igual patrón que Menu) */
type FlatListComponent =
    <T = any>(
        props: EAFlatListProps<T> & { ref?: React.Ref<RNFlatList<T>> }
    ) => React.ReactElement | null;

/** Implementación interna */
const FlatListBase = forwardRef(
    <T,>(
        props: EAFlatListProps<T>,
        ref: React.Ref<RNFlatList<T>>
    ) => {
        // Defaults → theme.components.FlatList → variante → props → plataforma (también props no visuales)
        const [{ style, variant: _variant, ...combinedProps }, theme] = useThemeProps<EAFlatListProps<T>>('FlatList', props);
        const styles = DEFAULT_PROPS(combinedProps, theme);
        const baseStyle = StyleSheet.flatten<ViewStyle>([style, ...styles]);
        const contentStyles = DEFAULT_PROPS(combinedProps._contentContainerStyle ?? {}, theme);

        return (
            <RNFlatList
                ref={ref}
                {...combinedProps}
                style={baseStyle}
                contentContainerStyle={[
                    combinedProps.contentContainerStyle,
                    ...contentStyles,
                ]}
            />
        );
    }
) as unknown as FlatListComponent;

/** ✅ EXPORT FINAL (CLAVE para que el .d.ts NO colapse a any) */
export const FlatList = FlatListBase as FlatListComponent;
