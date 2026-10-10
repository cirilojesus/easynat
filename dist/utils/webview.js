"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.webViewCanLoad = exports.toDataUri = exports.jsValue = exports.MissingWebView = exports.isWebViewAvailable = exports.loadWebView = void 0;
// Lo común de los componentes que usan react-native-webview (opcional): cargarlo solo si está instalado, el aviso
// si falta, y convertir imágenes locales en data URI (un WebView en iOS no puede leer file://)
const react_1 = __importDefault(require("react"));
const Box_1 = require("../Box");
const Text_1 = require("../Text");
let WebViewComponent = null;
/**
 * El WebView si está instalado (si no, null: se vuelve a intentar la próxima vez). require en try/catch: Metro lo
 * trata como dependencia opcional, así que quien no la instala puede compilar igual
 */
const loadWebView = () => {
    var _a;
    if (!WebViewComponent) {
        try {
            WebViewComponent = (_a = require('react-native-webview').WebView) !== null && _a !== void 0 ? _a : null;
        }
        catch (_b) {
            WebViewComponent = null;
        }
    }
    return WebViewComponent;
};
exports.loadWebView = loadWebView;
/** ¿Está instalado react-native-webview? (RichTextEditor, ImageViewer, ImageEditor y PDFViewer lo necesitan) */
const isWebViewAvailable = () => !!(0, exports.loadWebView)();
exports.isWebViewAvailable = isWebViewAvailable;
const warned = new Set();
/** Lo que se pinta si falta react-native-webview (y un aviso en la consola, una vez por componente) */
const MissingWebView = (_a) => {
    var { name } = _a, props = __rest(_a, ["name"]);
    if (!warned.has(name)) {
        warned.add(name);
        console.warn(`[${name}] Necesita react-native-webview: npx expo install react-native-webview`);
    }
    return (<Box_1.Box borderWidth={1} borderColor="warning.100" rounded={1} p={3} {...props}>
            <Text_1.Text fontSize={13} color="gray">{`${name} necesita react-native-webview:`}</Text_1.Text>
            <Text_1.Text fontSize={13} fontWeight="700">npx expo install react-native-webview</Text_1.Text>
        </Box_1.Box>);
};
exports.MissingWebView = MissingWebView;
/** JSON para meter en JS del WebView sin que un "</script>" del contenido lo rompa */
const jsValue = (v) => JSON.stringify(v !== null && v !== void 0 ? v : null).replace(/</g, '\\u003c');
exports.jsValue = jsValue;
/**
 * Un archivo como data URI (data:tipo;base64,…): https (con cabeceras), file:// y content://. Los que ya lo son se
 * quedan igual. En React Native no hay CORS, así que vale para pasar imágenes o PDFs a un WebView o para subirlos
 * @example const data = await toDataUri(foto.uri); const base64 = data.split(',')[1];
 */
const toDataUri = async (uri, headers) => {
    if (uri.startsWith('data:'))
        return uri;
    const res = await fetch(uri, headers ? { headers } : undefined);
    // file:// y content:// no tienen estado HTTP (status 0): solo se miran las respuestas de un servidor
    if (res.status >= 400)
        throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => { var _a; return reject((_a = reader.error) !== null && _a !== void 0 ? _a : new Error('No se pudo leer el archivo')); };
        reader.readAsDataURL(blob);
    });
};
exports.toDataUri = toDataUri;
/** ¿La puede cargar el WebView tal cual? (http, https, data). Las demás (file://, content://...) se convierten */
const webViewCanLoad = (uri) => /^(https?:|data:)/i.test(uri);
exports.webViewCanLoad = webViewCanLoad;
