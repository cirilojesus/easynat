import React, { createContext, useContext, ReactNode, useState, useEffect, useMemo, useCallback, useRef } from "react";
import { defaultTheme, theme as libTheme, Theme } from "./theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { mergeTheme } from "./utils/helpers";
import { RootSiblingParent } from "react-native-root-siblings";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Appearance, View, useColorScheme } from "react-native";
import { touchHandlers } from "./utils/touches";

const THEME_KEY = "@app_theme";

export type ThemeType = typeof libTheme

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

const ThemeContext = createContext<ThemeContextValue>({ theme: defaultTheme, mode: 'light', setting: 'light', setMode: () => null, toggleTheme: () => null });

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
export const ThemeProvider = ({ children, theme, defaultMode = 'light' }: ThemeProviderProps) => {
    const [setting, setSetting] = useState<ThemeModeSetting>(defaultMode);
    const system = useColorScheme();
    const mode: ThemeMode = setting === 'system' ? (system === 'dark' ? 'dark' : 'light') : setting;
    // Si se cambia el modo antes de leer el guardado, lo guardado no lo pisa
    const changed = useRef(false);

    useEffect(() => {
        (async () => {
            const saved = await AsyncStorage.getItem(THEME_KEY);
            if (!changed.current && (saved === 'light' || saved === 'dark' || saved === 'system')) setSetting(saved);
        })();
    }, []);

    const setMode = useCallback((next: ThemeModeSetting) => {
        changed.current = true;
        setSetting(next);
        AsyncStorage.setItem(THEME_KEY, next);
    }, []);
    const toggleTheme = useCallback(() => {
        changed.current = true;
        setSetting(prev => {
            const current = prev === 'system' ? (Appearance.getColorScheme() === 'dark' ? 'dark' : 'light') : prev;
            const next = current === 'light' ? 'dark' : 'light';
            AsyncStorage.setItem(THEME_KEY, next);
            return next;
        });
    }, []);

    const themeMerge = useMemo(() => mergeTheme(libTheme, theme), [theme])
    // Valor estable: si se creara en cada render, todos los componentes de la app se re-renderizarían
    // cada vez que se re-renderiza el ThemeProvider (aunque el tema no haya cambiado)
    const value = useMemo(() => ({ theme: themeMerge[mode], mode, setting, setMode, toggleTheme }), [themeMerge, mode, setting, setMode, toggleTheme])

    return (
        <SafeAreaProvider>
            <ThemeContext.Provider value={value}>
                <RootSiblingParent>
                    {/* Avisa de los toques (sin quedárselos) para cerrar cosas al tocar fuera. Los menús se pintan
                        fuera de esta vista: tocarlos no cuenta como "fuera" (los modales avisan por su cuenta) */}
                    <View style={{ flex: 1, backgroundColor: value.theme.colors?.background }} {...touchHandlers}>
                        {children}
                    </View>
                </RootSiblingParent>
            </ThemeContext.Provider>
        </SafeAreaProvider>
    );
};

/**
 * Hook: el tema actual (colores, sombras, fuentes y components), el modo (mode: 'light' | 'dark') y cómo cambiarlo
 * (setMode('dark' | 'light' | 'system') o toggleTheme()). Lo elegido se recuerda entre sesiones
 * @example const { theme, mode, setMode, toggleTheme } = useTheme();
 * <View style={{ backgroundColor: theme.colors['primary.100'] }} />
 */
export const useTheme = () => useContext(ThemeContext);
