"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.theme = exports.defaultTheme = exports.COLORS_THEME = void 0;
exports.COLORS_THEME = {
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
};
exports.defaultTheme = {
    colors: exports.COLORS_THEME,
    shadows: {
        1: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.23, shadowRadius: 2.62, elevation: 4 },
        2: { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4.65, elevation: 8 },
        3: { shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.37, shadowRadius: 7.49, elevation: 12 },
        4: { shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.44, shadowRadius: 10.32, elevation: 16 },
        5: { shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.51, shadowRadius: 13.16, elevation: 20 },
        6: { shadowColor: "#000", shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.58, shadowRadius: 16, elevation: 24 },
    }
};
exports.theme = {
    light: Object.assign({}, exports.defaultTheme),
    dark: Object.assign({}, exports.defaultTheme)
};
