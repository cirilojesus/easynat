import React, { createContext, useContext, useState, useEffect } from "react";
import { defaultTheme, theme as libTheme } from "./theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { mergeTheme } from "./utils/helpers";
import { RootSiblingParent } from "react-native-root-siblings";
import { SafeAreaProvider } from "react-native-safe-area-context";
const THEME_KEY = "@app_theme";
const ThemeContext = createContext({ theme: defaultTheme, toggleTheme: () => null });
export const ThemeProvider = ({ children, theme }) => {
    const [mode, setMode] = useState('light');
    useEffect(() => {
        (async () => {
            const saved = await AsyncStorage.getItem(THEME_KEY);
            if (saved) {
                setMode(saved);
            }
            else {
                await AsyncStorage.setItem(THEME_KEY, mode);
            }
        })();
    }, []);
    const toggleTheme = () => {
        setMode(mode == 'light' ? 'dark' : 'light');
    };
    const themeMerge = mergeTheme(libTheme, theme);
    return (<SafeAreaProvider>
            <ThemeContext.Provider value={{ theme: { ...themeMerge[mode] }, toggleTheme }}>
                <RootSiblingParent>
                    {children}
                </RootSiblingParent>
            </ThemeContext.Provider>
        </SafeAreaProvider>);
};
export const useTheme = () => useContext(ThemeContext);
