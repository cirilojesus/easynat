"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTheme = exports.ThemeProvider = void 0;
const react_1 = __importStar(require("react"));
const theme_1 = require("./theme");
const async_storage_1 = __importDefault(require("@react-native-async-storage/async-storage"));
const helpers_1 = require("./utils/helpers");
const react_native_root_siblings_1 = require("react-native-root-siblings");
const react_native_safe_area_context_1 = require("react-native-safe-area-context");
const react_native_1 = require("react-native");
const touches_1 = require("./utils/touches");
const THEME_KEY = "@app_theme";
const ThemeContext = (0, react_1.createContext)({ theme: theme_1.defaultTheme, mode: 'light', setting: 'light', setMode: () => null, toggleTheme: () => null });
/**
 * Envuelve la app: el tema (claro y oscuro), el área segura y la capa donde se pintan modales, menús, avisos y spinners
 * @example <ThemeProvider defaultMode="system" theme={{ light: { colors: { 'primary.100': '#0EA5E9' } } }}>…</ThemeProvider>
 */
const ThemeProvider = ({ children, theme, defaultMode = 'light' }) => {
    var _a;
    const [setting, setSetting] = (0, react_1.useState)(defaultMode);
    const system = (0, react_native_1.useColorScheme)();
    const mode = setting === 'system' ? (system === 'dark' ? 'dark' : 'light') : setting;
    // Si se cambia el modo antes de leer el guardado, lo guardado no lo pisa
    const changed = (0, react_1.useRef)(false);
    (0, react_1.useEffect)(() => {
        (async () => {
            const saved = await async_storage_1.default.getItem(THEME_KEY);
            if (!changed.current && (saved === 'light' || saved === 'dark' || saved === 'system'))
                setSetting(saved);
        })();
    }, []);
    const setMode = (0, react_1.useCallback)((next) => {
        changed.current = true;
        setSetting(next);
        async_storage_1.default.setItem(THEME_KEY, next);
    }, []);
    const toggleTheme = (0, react_1.useCallback)(() => {
        changed.current = true;
        setSetting(prev => {
            const current = prev === 'system' ? (react_native_1.Appearance.getColorScheme() === 'dark' ? 'dark' : 'light') : prev;
            const next = current === 'light' ? 'dark' : 'light';
            async_storage_1.default.setItem(THEME_KEY, next);
            return next;
        });
    }, []);
    const themeMerge = (0, react_1.useMemo)(() => (0, helpers_1.mergeTheme)(theme_1.theme, theme), [theme]);
    // Valor estable: si se creara en cada render, todos los componentes de la app se re-renderizarían
    // cada vez que se re-renderiza el ThemeProvider (aunque el tema no haya cambiado)
    const value = (0, react_1.useMemo)(() => ({ theme: themeMerge[mode], mode, setting, setMode, toggleTheme }), [themeMerge, mode, setting, setMode, toggleTheme]);
    return (<react_native_safe_area_context_1.SafeAreaProvider>
            <ThemeContext.Provider value={value}>
                <react_native_root_siblings_1.RootSiblingParent>
                    {/* Avisa de los toques (sin quedárselos) para cerrar cosas al tocar fuera. Los menús se pintan
            fuera de esta vista: tocarlos no cuenta como "fuera" (los modales avisan por su cuenta) */}
                    <react_native_1.View style={{ flex: 1, backgroundColor: (_a = value.theme.colors) === null || _a === void 0 ? void 0 : _a.background }} {...touches_1.touchHandlers}>
                        {children}
                    </react_native_1.View>
                </react_native_root_siblings_1.RootSiblingParent>
            </ThemeContext.Provider>
        </react_native_safe_area_context_1.SafeAreaProvider>);
};
exports.ThemeProvider = ThemeProvider;
/**
 * Hook: el tema actual (colores, sombras, fuentes y components), el modo (mode: 'light' | 'dark') y cómo cambiarlo
 * (setMode('dark' | 'light' | 'system') o toggleTheme()). Lo elegido se recuerda entre sesiones
 * @example const { theme, mode, setMode, toggleTheme } = useTheme();
 * <View style={{ backgroundColor: theme.colors['primary.100'] }} />
 */
const useTheme = () => (0, react_1.useContext)(ThemeContext);
exports.useTheme = useTheme;
