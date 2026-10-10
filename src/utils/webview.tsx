// Lo común de los componentes que usan react-native-webview (opcional): cargarlo solo si está instalado, el aviso
// si falta, y convertir imágenes locales en data URI (un WebView en iOS no puede leer file://)
import React from "react";
import { Box, EABoxProps } from "../Box";
import { Text } from "../Text";

/** Lo poco que se usa del WebView (así los tipos de la librería no dependen de que esté instalado) */
export type WebViewHandle = { injectJavaScript: (js: string) => void; requestFocus?: () => void };
export type WebViewMessageEvent = { nativeEvent: { data: string } };

let WebViewComponent: React.ComponentType<any> | null = null;
/**
 * El WebView si está instalado (si no, null: se vuelve a intentar la próxima vez). require en try/catch: Metro lo
 * trata como dependencia opcional, así que quien no la instala puede compilar igual
 */
export const loadWebView = () => {
    if (!WebViewComponent) {
        try { WebViewComponent = require('react-native-webview').WebView ?? null } catch { WebViewComponent = null }
    }
    return WebViewComponent;
};

/** ¿Está instalado react-native-webview? (RichTextEditor, ImageViewer, ImageEditor y PDFViewer lo necesitan) */
export const isWebViewAvailable = () => !!loadWebView();

const warned = new Set<string>();
/** Lo que se pinta si falta react-native-webview (y un aviso en la consola, una vez por componente) */
export const MissingWebView = ({ name, ...props }: EABoxProps & { name: string }) => {
    if (!warned.has(name)) { warned.add(name); console.warn(`[${name}] Necesita react-native-webview: npx expo install react-native-webview`) }
    return (
        <Box borderWidth={1} borderColor="warning.100" rounded={1} p={3} {...props}>
            <Text fontSize={13} color="gray">{`${name} necesita react-native-webview:`}</Text>
            <Text fontSize={13} fontWeight="700">npx expo install react-native-webview</Text>
        </Box>
    );
};

/** JSON para meter en JS del WebView sin que un "</script>" del contenido lo rompa */
export const jsValue = (v: unknown) => JSON.stringify(v ?? null).replace(/</g, '\\u003c');

/**
 * Un archivo como data URI (data:tipo;base64,…): https (con cabeceras), file:// y content://. Los que ya lo son se
 * quedan igual. En React Native no hay CORS, así que vale para pasar imágenes o PDFs a un WebView o para subirlos
 * @example const data = await toDataUri(foto.uri); const base64 = data.split(',')[1];
 */
export const toDataUri = async (uri: string, headers?: Record<string, string>): Promise<string> => {
    if (uri.startsWith('data:')) return uri;
    const res = await fetch(uri, headers ? { headers } : undefined);
    // file:// y content:// no tienen estado HTTP (status 0): solo se miran las respuestas de un servidor
    if (res.status >= 400) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error ?? new Error('No se pudo leer el archivo'));
        reader.readAsDataURL(blob);
    });
};

/** ¿La puede cargar el WebView tal cual? (http, https, data). Las demás (file://, content://...) se convierten */
export const webViewCanLoad = (uri: string) => /^(https?:|data:)/i.test(uri);
