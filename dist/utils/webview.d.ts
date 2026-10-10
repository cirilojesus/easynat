import React from "react";
import { EABoxProps } from "../Box";
/** Lo poco que se usa del WebView (así los tipos de la librería no dependen de que esté instalado) */
export type WebViewHandle = {
    injectJavaScript: (js: string) => void;
    requestFocus?: () => void;
};
export type WebViewMessageEvent = {
    nativeEvent: {
        data: string;
    };
};
/**
 * El WebView si está instalado (si no, null: se vuelve a intentar la próxima vez). require en try/catch: Metro lo
 * trata como dependencia opcional, así que quien no la instala puede compilar igual
 */
export declare const loadWebView: () => React.ComponentType<any>;
/** ¿Está instalado react-native-webview? (RichTextEditor, ImageViewer, ImageEditor y PDFViewer lo necesitan) */
export declare const isWebViewAvailable: () => boolean;
/** Lo que se pinta si falta react-native-webview (y un aviso en la consola, una vez por componente) */
export declare const MissingWebView: ({ name, ...props }: EABoxProps & {
    name: string;
}) => React.JSX.Element;
/** JSON para meter en JS del WebView sin que un "</script>" del contenido lo rompa */
export declare const jsValue: (v: unknown) => string;
/**
 * Un archivo como data URI (data:tipo;base64,…): https (con cabeceras), file:// y content://. Los que ya lo son se
 * quedan igual. En React Native no hay CORS, así que vale para pasar imágenes o PDFs a un WebView o para subirlos
 * @example const data = await toDataUri(foto.uri); const base64 = data.split(',')[1];
 */
export declare const toDataUri: (uri: string, headers?: Record<string, string>) => Promise<string>;
/** ¿La puede cargar el WebView tal cual? (http, https, data). Las demás (file://, content://...) se convierten */
export declare const webViewCanLoad: (uri: string) => boolean;
