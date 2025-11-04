import * as COMPONENTS from '.';

export type COLOR_SCHEME = 'primary' | 'secondary' | 'success' | 'danger' | 'light' | (string & {})
export type VARIANT_BUTTON = "solid" | "outline" | "ghost" | 'link'

export const COLORS_THEME = {
    'primary': "#4F46E5",
    'primary.50': "#4e46e56f",
    'primary.100': "#4F46E5",
    'primary.200': "#3e36ceff",
    'secondary': "#EC4899",
    'secondary.50': "#ec489a6a",
    'secondary.100': "#EC4899",
    'secondary.200': "#d53786ff",
    'white': "#ffffff",
    'white.50': "#ffffff7c",
    'dark': "#000000",
    'dark.50': "#00000064",
    'light': '#cccccc',
    'light.50': '#cccccc5e',
    'light.100': '#cccccc',
    'light.200': '#bbbbbb',
    'success': "#63c257ff",
    'success.50': "#63c2571e",
    'success.100': "#63c257ff",
    'success.200': "#4daa41ff",
    'danger': "#c25757ff",
    'danger.50': "#c257571e",
    'danger.100': "#c25757ff",
    'danger.200': "#ab4242ff",
}

export type ALL_PROPS = COMPONENTS.BSTextProps & COMPONENTS.BSTextInputProps & COMPONENTS.BSBoxProps
export type VARIANTS_TYPE = Record<string, Partial<ALL_PROPS>>

export const defaultTheme: {
    colors?: Partial<Record<keyof typeof COLORS_THEME | (string & {}), string>>,
    shadows?: Record<1 | 2 | 3 | 4 | 5 | 6 | string, any>,
    fontFamily?: string,
    components?: Partial<Omit<
        Record<keyof typeof COMPONENTS, Partial<Record<'variants', VARIANTS_TYPE> & Partial<ALL_PROPS>>>,
        "theme" | "defaultTheme" | "ThemeProvider" | "useTheme"
    >>
} = {
    colors: COLORS_THEME,
    shadows: {
        1: { shadowColor: "#0005", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.23, shadowRadius: 2.62, elevation: 4 },
        2: { shadowColor: "#0005", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4.65, elevation: 8 },
        3: { shadowColor: "#0005", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.37, shadowRadius: 7.49, elevation: 12 },
        4: { shadowColor: "#0005", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.44, shadowRadius: 10.32, elevation: 16 },
        5: { shadowColor: "#0005", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.51, shadowRadius: 13.16, elevation: 20 },
        6: { shadowColor: "#0005", shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.58, shadowRadius: 16, elevation: 24 },
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
