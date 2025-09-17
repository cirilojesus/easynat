import * as COMPONENTS from './';
export type COLOR_SCHEME = 'primary' | 'secondary' | 'success' | 'danger' | 'light';
export type VARIANT_BUTTON = "solid" | "outline" | "ghost" | 'link';
export declare const COLORS_THEME: {
    primary: string;
    'primary.50': string;
    'primary.100': string;
    'primary.200': string;
    secondary: string;
    white: string;
    'white.50': string;
    dark: string;
    'dark.50': string;
    light: string;
    success: string;
    'success.50': string;
    'success.100': string;
    'success.200': string;
    danger: string;
    'danger.50': string;
    'danger.100': string;
    'danger.200': string;
};
export type ALL_PROPS = COMPONENTS.BSTextProps & COMPONENTS.BSTextInputProps;
export declare const defaultTheme: {
    colors?: Partial<Record<keyof typeof COLORS_THEME | (string & {}), string>>;
    shadows?: Record<1 | 2 | 3 | 4 | 5 | 6 | string, any>;
    components?: Partial<Omit<Record<keyof typeof COMPONENTS, Partial<Record<'variants', Record<string, Partial<ALL_PROPS>>> & Partial<ALL_PROPS>>>, "theme" | "defaultTheme" | "ThemeProvider" | "useTheme">>;
};
export declare const theme: {
    light: typeof defaultTheme;
    dark: typeof defaultTheme;
};
export type Theme = typeof defaultTheme;
