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
exports.Portal = void 0;
const react_1 = __importStar(require("react"));
const react_native_root_siblings_1 = __importDefault(require("react-native-root-siblings"));
const createStore = (initial) => {
    let value = initial;
    const listeners = new Set();
    return {
        get: () => value,
        set: next => {
            value = next;
            listeners.forEach(listener => listener());
        },
        subscribe: listener => {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
    };
};
const PortalHost = ({ store }) => {
    const content = (0, react_1.useSyncExternalStore)(store.subscribe, store.get);
    return <>{content}</>;
};
/**
 * Renderiza su contenido por encima de toda la app (overlays, tooltips, toasts propios, etc.).
 * Requiere estar dentro de ThemeProvider.
 *
 * El contenido se monta junto a ThemeProvider, no donde se declara el Portal: recibe el tema de
 * la librería, pero NO los contextos de la pantalla (p. ej. useNavigation() o providers propios
 * montados debajo de ThemeProvider).
 *
 * @example
 * // Overlay de carga que bloquea la pantalla mientras se guarda
 * {saving && (
 *     <Portal>
 *         <Box style={StyleSheet.absoluteFill} bg="black.50" justifyContent="center" alignItems="center">
 *             <Spinner size="large" color="white" />
 *         </Box>
 *     </Portal>
 * )}
 */
const Portal = ({ children }) => {
    const [store] = (0, react_1.useState)(() => createStore(children));
    // Tras cada render se publica el contenido actual en el sibling
    (0, react_1.useLayoutEffect)(() => {
        store.set(children);
    });
    (0, react_1.useEffect)(() => {
        const sibling = new react_native_root_siblings_1.default(<PortalHost store={store}/>);
        return () => sibling.destroy();
    }, [store]);
    return null;
};
exports.Portal = Portal;
