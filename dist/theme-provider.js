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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTheme = exports.ThemeProvider = void 0;
const react_1 = __importStar(require("react"));
const theme_1 = require("./theme");
const async_storage_1 = __importDefault(require("@react-native-async-storage/async-storage"));
const helpers_1 = require("./utils/helpers");
const THEME_KEY = "@app_theme";
const ThemeContext = (0, react_1.createContext)({ theme: theme_1.defaultTheme, toggleTheme: () => null });
const ThemeProvider = ({ children, theme }) => {
    const [mode, setMode] = (0, react_1.useState)('light');
    (0, react_1.useEffect)(() => {
        (() => __awaiter(void 0, void 0, void 0, function* () {
            const saved = yield async_storage_1.default.getItem(THEME_KEY);
            if (saved) {
                setMode(saved);
            }
            else {
                yield async_storage_1.default.setItem(THEME_KEY, mode);
            }
        }))();
    }, []);
    const toggleTheme = () => {
        setMode(mode == 'light' ? 'dark' : 'light');
    };
    const themeMerge = (0, helpers_1.mergeTheme)(theme_1.theme, theme);
    return (<ThemeContext.Provider value={{ theme: Object.assign({}, themeMerge[mode]), toggleTheme }}>{children}</ThemeContext.Provider>);
};
exports.ThemeProvider = ThemeProvider;
const useTheme = () => (0, react_1.useContext)(ThemeContext);
exports.useTheme = useTheme;
