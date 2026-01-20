import * as COMPONENTS from './';

export type COLOR_SCHEME = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' |
    'white' | 'light' | 'muted' | 'silver' | 'gray' | 'dark' | 'black' | (string & {})
export type VARIANT_BUTTON = "solid" | "outline" | "ghost" | 'link' | 'subtle'

export const COLORS_THEME = {
    'primary.50': "#4e46e56f",
    'primary.100': "#4F46E5",
    'primary.200': "#3e36ceff",
    'secondary.50': "#ec489a6a",
    'secondary.100': "#EC4899",
    'secondary.200': "#d53786ff",
    'white': "#ffffff",
    'white.50': "#ffffff7c",
    'white.100': "#ffffff",
    'white.200': "#e9e9e9ff",
    'light': '#e2e2e2ff',
    'light.50': '#e2e2e26a',
    'light.100': '#e2e2e2ff',
    'light.200': '#dbdbdbff',
    'muted': '#c7c7c7ff',
    'muted.50': '#c7c7c770',
    'muted.100': '#c7c7c7ff',
    'muted.200': '#bfbfbfff',
    'silver': '#a0a0a0ff',
    'silver.50': '#a0a0a06d',
    'silver.100': '#a0a0a0ff',
    'silver.200': '#9d9d9dff',
    'gray': "#4f4f4fff",
    'gray.50': "#4f4f4f59",
    'gray.100': "#4f4f4fff",
    'gray.200': "#3e3e3eff",
    'dark': "#282828ff",
    'dark.50': "#28282850",
    'dark.100': "#282828ff",
    'dark.200': "#1d1d1dff",
    'black': "#0F0F0F",
    'black.50': "#0f0f0f56",
    'black.100': "#0F0F0F",
    'black.200': "#000000ff",
    'success.50': "#63c2571e",
    'success.100': "#63c257ff",
    'success.200': "#4daa41ff",
    'danger.50': "#c257571e",
    'danger.100': "#c25757ff",
    'danger.200': "#ab4242ff",
    'warning.50': "#e3cf4a66",
    'warning.100': "#e3cf4aff",
    'warning.200': "#cdb939ff",
    'info.50': "#4ac4e370",
    'info.100': "#4ac4e3ff",
    'info.200': "#35adcbff",
}

export type ALL_PROPS = COMPONENTS.BSTextProps & COMPONENTS.BSTextInputProps
    & COMPONENTS.BSBoxProps & COMPONENTS.BSFlatListProps<any>
    & COMPONENTS.BSPressableProps
    & COMPONENTS.BSModalProps & COMPONENTS.BSButtonProps

export type VARIANTS_TYPE = Record<string, Partial<ALL_PROPS>>

export const defaultTheme: {
    colors?: Partial<Record<keyof typeof COLORS_THEME | (string & {}), string>>,
    shadows?: Record<1 | 2 | 3 | 4 | 5 | 6 | string, any>,
    fontFamily?: string,
    fonts?: Record<string, string>
    components?: Partial<Omit<
        Record<keyof typeof COMPONENTS, Partial<Record<'variants', VARIANTS_TYPE> & Partial<ALL_PROPS>>>,
        "theme" | "defaultTheme" | "ThemeProvider" | "useTheme"
    >>
} = {
    colors: COLORS_THEME,
    shadows: {
        1: { shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.12, shadowRadius: 2, elevation: 2 },
        2: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.16, shadowRadius: 4, elevation: 4 },
        3: { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.20, shadowRadius: 6, elevation: 8 },
        4: { shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.24, shadowRadius: 10, elevation: 12 },
        5: { shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.28, shadowRadius: 14, elevation: 16 },
        6: { shadowColor: "#000", shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.32, shadowRadius: 18, elevation: 24 },
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
