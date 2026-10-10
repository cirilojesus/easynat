import { DimensionValue } from "react-native";
import { ThemeType } from "../theme-provider";
import { EATextProps } from "../Text";
import React from "react";
export declare const calcSize: (size: DimensionValue) => DimensionValue;
/**
 * Junta el tema de la librería con el tuyo (lo hace el ThemeProvider). Por cada modo, tus colores, sombras y components
 * se mezclan con los de la librería en vez de reemplazarlos. El modo oscuro hereda lo que pongas en `light` (tus colores
 * de marca, fuentes, components…) salvo los colores que tienen versión oscura (semánticos y grises), y encima lo de `dark`
 * @example mergeTheme(libTheme, { light: { colors: { 'primary.100': '#0EA5E9' } } }) // primary también en oscuro
 */
export declare const mergeTheme: (libTheme: ThemeType, theme?: Partial<ThemeType>) => ThemeType;
export declare const renderChild: (children: React.ReactNode, props: EATextProps) => (bigint | Iterable<React.ReactNode> | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode>> | React.JSX.Element)[];
/**
 * El idioma del dispositivo, sin la región ('es-MX' → 'es'). Es el idioma inicial de las traducciones
 * @example getDeviceLanguage(); // 'es'
 */
export declare function getDeviceLanguage(): string;
/**
 * La configuración regional del dispositivo según Intl: locale, calendario, sistema de números y zona horaria
 * @example getDeviceLocaleInfo().timeZone; // 'Europe/Madrid'
 */
export declare function getDeviceLocaleInfo(options?: Intl.DateTimeFormatOptions): Intl.ResolvedDateTimeFormatOptions;
