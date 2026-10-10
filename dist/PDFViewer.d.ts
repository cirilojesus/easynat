import React from "react";
import { EABoxProps } from "./Box";
/** Versión de pdf.js del CDN (la última que se carga como script normal: funciona en WebViews antiguos) */
export declare const PDFJS_VERSION = "3.11.174";
type PdfJsBundle = {
    version: string;
    main: string;
    worker: string;
};
/** Registra pdf.js dentro de la app (lo hace `import 'easynat/dist/utils/pdfjs'`): así no hace falta internet */
export declare const registerPdfJs: (lib: PdfJsBundle) => void;
/** Un PDF: su uri (https, file://, content://, data:), con cabeceras (p. ej. Authorization), o su base64 */
export type PDFSource = string | {
    uri: string;
    headers?: Record<string, string>;
} | {
    base64: string;
};
export type PDFViewerError = {
    code: 'password' | 'invalid' | 'network' | 'lib' | 'unknown';
    message: string;
};
export type PDFViewerRef = {
    /** Va a una página (desde 1) */
    goToPage: (page: number) => void;
    /** Busca un texto (sin distinguir mayúsculas ni acentos): devuelve cuántas veces aparece y va a la primera */
    search: (query: string) => Promise<number>;
    searchNext: () => void;
    searchPrev: () => void;
    clearSearch: () => void;
    /** Zoom (1 = ajustado) */
    setZoom: (zoom: number) => void;
    /** Quita la selección de texto */
    clearSelection: () => void;
};
export type PDFViewerProps = Omit<EABoxProps, 'children'> & {
    source: PDFSource;
    /** Contraseña (si no se da y el PDF la pide, se pregunta) */
    password?: string;
    /** Página con la que empieza (desde 1) */
    initialPage?: number;
    /** 'width': las páginas ocupan el ancho (por defecto); 'page': se ve la página entera */
    fit?: 'width' | 'page';
    /** Separación entre páginas (px). Por defecto 8 */
    spacing?: number;
    /** Zoom máximo. Por defecto 5 */
    maxZoom?: number;
    /** Zoom del doble toque. Por defecto 2.5 */
    doubleTapZoom?: number;
    /** "3 / 12" abajo. Por defecto true */
    showPageIndicator?: boolean;
    /** Botón de buscar. Por defecto true */
    showSearch?: boolean;
    /** Seleccionar y copiar texto (mantén pulsado; copiar sale en el menú del sistema). Por defecto true */
    textSelection?: boolean;
    /** El texto seleccionado ('' al quitar la selección) */
    onTextSelect?: (text: string) => void;
    /** Fondo. Por defecto gris oscuro, como los visores de PDF */
    backgroundColor?: string;
    /** pdf.js de otro sitio (p. ej. tu servidor): la carpeta de pdfjs-dist (con legacy/build, cmaps y standard_fonts) */
    pdfjsUrl?: string;
    onLoad?: (info: {
        numPages: number;
        title?: string;
    }) => void;
    onPageChange?: (page: number, numPages: number) => void;
    onError?: (error: PDFViewerError) => void;
    /** Un enlace a una web. Por defecto se abre con Linking; devuelve false para no abrirlo */
    onLinkPress?: (url: string) => boolean | void;
    /** Botón de cerrar (arriba a la izquierda) */
    onClose?: () => void;
    variant?: (string & {});
};
/**
 * Visor de PDF. Necesita react-native-webview (dependencia opcional). pdf.js sale del CDN; para usarlo sin
 * internet, importa una vez 'easynat/dist/utils/pdfjs'
 * @example <PDFViewer source={{ uri: 'https://…/factura.pdf' }} onPageChange={p => …} />
 * @example openPDFViewer(archivo.uri, { initialPage: 3 })
 */
export declare const PDFViewer: React.ForwardRefExoticComponent<Omit<EABoxProps, "children"> & {
    source: PDFSource;
    /** Contraseña (si no se da y el PDF la pide, se pregunta) */
    password?: string;
    /** Página con la que empieza (desde 1) */
    initialPage?: number;
    /** 'width': las páginas ocupan el ancho (por defecto); 'page': se ve la página entera */
    fit?: "width" | "page";
    /** Separación entre páginas (px). Por defecto 8 */
    spacing?: number;
    /** Zoom máximo. Por defecto 5 */
    maxZoom?: number;
    /** Zoom del doble toque. Por defecto 2.5 */
    doubleTapZoom?: number;
    /** "3 / 12" abajo. Por defecto true */
    showPageIndicator?: boolean;
    /** Botón de buscar. Por defecto true */
    showSearch?: boolean;
    /** Seleccionar y copiar texto (mantén pulsado; copiar sale en el menú del sistema). Por defecto true */
    textSelection?: boolean;
    /** El texto seleccionado ('' al quitar la selección) */
    onTextSelect?: (text: string) => void;
    /** Fondo. Por defecto gris oscuro, como los visores de PDF */
    backgroundColor?: string;
    /** pdf.js de otro sitio (p. ej. tu servidor): la carpeta de pdfjs-dist (con legacy/build, cmaps y standard_fonts) */
    pdfjsUrl?: string;
    onLoad?: (info: {
        numPages: number;
        title?: string;
    }) => void;
    onPageChange?: (page: number, numPages: number) => void;
    onError?: (error: PDFViewerError) => void;
    /** Un enlace a una web. Por defecto se abre con Linking; devuelve false para no abrirlo */
    onLinkPress?: (url: string) => boolean | void;
    /** Botón de cerrar (arriba a la izquierda) */
    onClose?: () => void;
    variant?: (string & {});
} & React.RefAttributes<PDFViewerRef>>;
/**
 * Abre el visor de PDF a pantalla completa (con botón de cerrar). Devuelve el control del modal
 * @example openPDFViewer('https://…/manual.pdf', { initialPage: 3 })
 */
export declare const openPDFViewer: (source: PDFSource, options?: Omit<PDFViewerProps, "source" | "onClose">) => import("./Modal").EAModalHandle<any, any>;
export {};
