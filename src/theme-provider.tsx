import React, { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { defaultTheme, theme as libTheme, Theme } from "./theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { mergeTheme } from "./utils/helpers";

const THEME_KEY = "@app_theme";

export type ThemeType = typeof libTheme

const ThemeContext = createContext<{ theme: Theme, toggleTheme: () => any }>({ theme: defaultTheme, toggleTheme: () => null });

export const ThemeProvider = ({ children, theme }: { children: ReactNode, theme: Partial<ThemeType> }) => {
    const [mode, setMode] = useState<'light' | 'dark'>('light')

    useEffect(() => {
        (async () => {
            const saved = await AsyncStorage.getItem(THEME_KEY);
            if (saved) {
                setMode(saved as any);
            } else {
                await AsyncStorage.setItem(THEME_KEY, mode)
            }
        })();
    }, []);

    const toggleTheme = () => {
        setMode(mode == 'light' ? 'dark' : 'light')
    }

    const themeMerge = mergeTheme(libTheme, theme)

    return (
        <ThemeContext.Provider value={{ theme: { ...themeMerge[mode] }, toggleTheme }}>{children}</ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
