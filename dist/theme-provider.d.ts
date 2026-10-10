import React, { ReactNode } from "react";
import { theme as libTheme, Theme } from "./theme";
export type ThemeType = typeof libTheme;
export type ThemeMode = 'light' | 'dark';
/** Lo que se elige: claro, oscuro o el del sistema (sigue al móvil en vivo) */
export type ThemeModeSetting = ThemeMode | 'system';
export type ThemeContextValue = {
    theme: Theme;
    /** El modo que se ve ahora (con 'system', el del móvil) */
    mode: ThemeMode;
    /** Lo elegido: 'light', 'dark' o 'system' */
    setting: ThemeModeSetting;
    /** Cambia el modo y lo recuerda para la próxima vez */
    setMode: (mode: ThemeModeSetting) => void;
    /** Alterna entre claro y oscuro */
    toggleTheme: () => void;
};
export type ThemeProviderProps = {
    children: ReactNode;
    /** Tu tema: colores, sombras, fuentes y components por modo ({ light, dark }). El oscuro hereda lo de light */
    theme?: Partial<ThemeType>;
    /**
     * Modo con el que empieza si el usuario no ha elegido otro (lo elegido con setMode se recuerda). 'system' sigue al
     * móvil. Por defecto 'light'
     */
    defaultMode?: ThemeModeSetting;
};
/**
 * Envuelve la app: el tema (claro y oscuro), el área segura y la capa donde se pintan modales, menús, avisos y spinners
 * @example <ThemeProvider defaultMode="system" theme={{ light: { colors: { 'primary.100': '#0EA5E9' } } }}>…</ThemeProvider>
 */
export declare const ThemeProvider: ({ children, theme, defaultMode }: ThemeProviderProps) => React.JSX.Element;
/**
 * Hook: el tema actual (colores, sombras, fuentes y components), el modo (mode: 'light' | 'dark') y cómo cambiarlo
 * (setMode('dark' | 'light' | 'system') o toggleTheme()). Lo elegido se recuerda entre sesiones
 * @example const { theme, mode, setMode, toggleTheme } = useTheme();
 * <View style={{ backgroundColor: theme.colors['primary.100'] }} />
 */
export declare const useTheme: () => ThemeContextValue;
