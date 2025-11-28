import React, { forwardRef } from "react";
import {
    FlatList as RNFlatList,
    FlatListProps,
    Platform,
    StyleSheet,
    ViewStyle,
} from "react-native";
import { useTheme } from "./theme-provider";
import { BSDefaultProps, DEFAULT_PROPS } from "./utils/DEFAULT_PROPS";
import { BSBoxProps } from "./Box";

/** Props extra de tu proyecto */
export type BSFlatListProps<T> = FlatListProps<T> & BSDefaultProps & {
    _ios?: BSFlatListProps<T>;
    _android?: BSFlatListProps<T>;
    _web?: BSFlatListProps<T>;
    _contentContainerStyle?: BSBoxProps;
    variant?: BSFlatListProps<T>
};

/** Tipo de instancia que expondrá la ref */
export type BSFlatListInstance<T> = RNFlatList<T>;

/**
 * FlatList extendida con:
 * - forwardRef
 * - estilos por plataforma
 * - inferencia de tipo
 */
export const FlatList = forwardRef(
    <T,>(
        { style, ...props }: BSFlatListProps<T>,
        ref: React.Ref<RNFlatList<T>>
    ) => {
        const { theme } = useTheme();
        const props_default = theme?.components?.FlatList || {}
        const props_variant = theme?.components?.FlatList?.variants || {}

        const combinedProps: BSFlatListProps<T> = {
            ...props,
            ...(Platform.OS === "ios" ? props._ios : {}),
            ...(Platform.OS === "android" ? props._android : {}),
            ...(Platform.OS === "web" ? props._web : {}),
        };

        const styles = DEFAULT_PROPS({ ...props_default, ...props_variant[combinedProps.variant], ...combinedProps }, theme);
        const baseStyle = StyleSheet.flatten<ViewStyle>([style, ...styles]);
        const contentStyles = DEFAULT_PROPS(
            combinedProps?._contentContainerStyle || {},
            theme
        );

        return (
            <RNFlatList
                ref={ref}
                contentContainerStyle={[
                    combinedProps.contentContainerStyle,
                    ...contentStyles,
                ]}
                {...combinedProps}
                style={baseStyle}
            />
        );
    }
) as <T>(
    props: BSFlatListProps<T> & React.RefAttributes<RNFlatList<T>>
) => React.ReactElement;
