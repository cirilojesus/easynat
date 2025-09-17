import * as COMPONENTS from './';

export type COLOR_SCHEME = 'primary' | 'secondary' | 'success' | 'danger' | 'light'
export type VARIANT_BUTTON = "solid" | "outline" | "ghost" | 'link'

export const COLORS_THEME = {
    'primary': "#4F46E5",
    'primary.50': "#4e46e56f",
    'primary.100': "#4F46E5",
    'primary.200': "#3e36ceff",
    'secondary': "#EC4899",
    'white': "#ffffff",
    'white.50': "#ffffff7c",
    'dark': "#000000",
    'dark.50': "#00000064",
    'light': '#cccccc',
    'success': "#6bdc5cff",
    'success.50': "#6bdc5c7b",
    'success.100': "#6bdc5cff",
    'success.200': "#51ba44ff",
    'danger': "#dc5c5cff",
    'danger.50': "#dc5c5c80",
    'danger.100': "#dc5c5cff",
    'danger.200': "#ba4545ff",
}

export type ALL_PROPS = COMPONENTS.BSTextProps & COMPONENTS.BSTextInputProps

export const defaultTheme: {
    colors?: Partial<Record<keyof typeof COLORS_THEME | (string & {}), string>>,
    shadows?: Record<1 | 2 | 3 | 4 | 5 | 6 | string, any>,
    components?: Partial<Omit<
        Record<keyof typeof COMPONENTS, Partial<Record<'variants', Record<string, Partial<ALL_PROPS>>> & Partial<ALL_PROPS>>>,
        "theme" | "defaultTheme" | "ThemeProvider" | "useTheme"
    >>
} = {
    colors: COLORS_THEME,
    shadows: {
        1: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.23, shadowRadius: 2.62, elevation: 4 },
        2: { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4.65, elevation: 8 },
        3: { shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.37, shadowRadius: 7.49, elevation: 12 },
        4: { shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.44, shadowRadius: 10.32, elevation: 16 },
        5: { shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.51, shadowRadius: 13.16, elevation: 20 },
        6: { shadowColor: "#000", shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.58, shadowRadius: 16, elevation: 24 },
    }
}

export const theme: {
    light: typeof defaultTheme
    dark: typeof defaultTheme
} = {
    light: {
        ...defaultTheme
    },
    dark: {
        ...defaultTheme
    }
};

export type Theme = typeof defaultTheme;
