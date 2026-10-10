"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.theme = exports.defaultTheme = exports.DARK_COLORS = exports.COLORS_THEME = void 0;
/**
 * Los colores por defecto. Cada uno tiene .50 (suave, translúcido), .100 (normal) y .200 (oscuro). Se usan por nombre
 * en las props de color (bg="primary.100") y se cambian en el tema del ThemeProvider
 */
exports.COLORS_THEME = {
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
    // Semánticos: lo que usan los componentes para el fondo, las superficies, los bordes y el texto. Cambian con el modo
    'background': "#ffffff",
    'surface': "#ffffff",
    'surface.50': "#f4f4f5",
    'border': "#e2e2e2",
    'text': "#0F0F0F",
    'text.muted': "#4f4f4f",
    'text.subtle': "#a0a0a0",
    /** Texto e iconos encima de un color (botones solid, etiquetas): blanco en los dos modos */
    'contrast': "#ffffff",
};
/**
 * Los colores del modo oscuro que cambian respecto al claro: los semánticos y la escala de grises (invertida: "light"
 * sigue siendo el gris suave de fondos y bordes, "dark" el texto fuerte). Los de marca (primary, success…) son los mismos.
 * Se cambian en theme.dark.colors del ThemeProvider
 */
exports.DARK_COLORS = {
    'background': "#0b0b0f",
    'surface': "#17171c",
    'surface.50': "#202027",
    'border': "#2c2c35",
    'text': "#ececf1",
    'text.muted': "#b4b4bd",
    'text.subtle': "#80808a",
    'contrast': "#ffffff",
    'light': '#2c2c35',
    'light.50': '#ffffff12',
    'light.100': '#2c2c35',
    'light.200': '#363640',
    'muted': '#4a4a55',
    'muted.50': '#4a4a5566',
    'muted.100': '#4a4a55',
    'muted.200': '#575763',
    'silver': '#8b8b95',
    'silver.50': '#8b8b9566',
    'silver.100': '#8b8b95',
    'silver.200': '#9a9aa4',
    'gray': '#b4b4bd',
    'gray.50': '#b4b4bd59',
    'gray.100': '#b4b4bd',
    'gray.200': '#c8c8d0',
    'dark': '#e4e4e9',
    'dark.50': '#e4e4e950',
    'dark.100': '#e4e4e9',
    'dark.200': '#f4f4f7',
};
exports.defaultTheme = {
    colors: exports.COLORS_THEME,
    shadows: {
        1: { shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.12, shadowRadius: 2, elevation: 2 },
        2: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.16, shadowRadius: 4, elevation: 4 },
        3: { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.20, shadowRadius: 6, elevation: 8 },
        4: { shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.24, shadowRadius: 10, elevation: 12 },
        5: { shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.28, shadowRadius: 14, elevation: 16 },
        6: { shadowColor: "#000", shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.32, shadowRadius: 18, elevation: 24 },
    }
};
exports.theme = {
    light: Object.assign({}, exports.defaultTheme),
    dark: Object.assign(Object.assign({}, exports.defaultTheme), { colors: Object.assign(Object.assign({}, exports.COLORS_THEME), exports.DARK_COLORS), 
        // En oscuro las sombras apenas se ven: un poco más marcadas
        shadows: Object.fromEntries(Object.entries(exports.defaultTheme.shadows).map(([k, v]) => [k, Object.assign(Object.assign({}, v), { shadowOpacity: Math.min(0.6, v.shadowOpacity * 2) })])) })
};
