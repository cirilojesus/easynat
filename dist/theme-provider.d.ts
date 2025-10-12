import React, { ReactNode } from "react";
import { theme as libTheme, Theme } from "./theme";
export type ThemeType = typeof libTheme;
export declare const ThemeProvider: ({ children, theme }: {
    children: ReactNode;
    theme: Partial<ThemeType>;
}) => React.JSX.Element;
export declare const useTheme: () => {
    theme: Theme;
    toggleTheme: () => any;
};
