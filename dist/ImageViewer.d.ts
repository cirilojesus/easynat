import React from "react";
import { EABoxProps } from "./Box";
import { EATextProps } from "./Text";
/** Una imagen: su uri (https, file://, data:) o con título y miniatura */
export type ImageViewerItem = string | {
    uri: string;
    title?: string;
    thumbnail?: string;
};
export type ImageViewerRef = {
    goTo: (index: number) => void;
    next: () => void;
    prev: () => void;
    resetZoom: () => void;
};
export type ImageViewerProps = Omit<EABoxProps, 'children'> & {
    images: ImageViewerItem[];
    /** La imagen con la que empieza. Por defecto 0 */
    initialIndex?: number;
    onIndexChange?: (index: number) => void;
    /** Zoom máximo. Por defecto 5 */
    maxZoom?: number;
    /** Zoom del doble toque. Por defecto 2.5 */
    doubleTapZoom?: number;
    /** Cómo se indica en cuál se está: puntos, miniaturas, "2 / 5" o nada. Por defecto puntos (o "2 / 5" con más de 10) */
    indicator?: 'dots' | 'thumbnails' | 'counter' | 'none';
    /** Flechas a los lados para pasar de imagen. Por defecto true (con más de una) */
    showArrows?: boolean;
    /** Botón de cerrar (arriba a la derecha) */
    onClose?: () => void;
    /** Un toque en la imagen. Por defecto muestra u oculta los controles */
    onTap?: (index: number) => void;
    /** Fondo. Por defecto negro */
    backgroundColor?: string;
    /** Contenido propio abajo (p. ej. botones de compartir o borrar) */
    renderFooter?: (index: number, item: ImageViewerItem) => React.ReactNode;
    _title?: EATextProps;
    _footer?: EABoxProps;
    variant?: (string & {});
};
/**
 * Visor de imágenes con zoom. Necesita react-native-webview (dependencia opcional)
 * @example <ImageViewer images={fotos} initialIndex={2} h={300} />
 * @example openImageViewer(fotos, { index: 2 })
 */
export declare const ImageViewer: React.ForwardRefExoticComponent<Omit<EABoxProps, "children"> & {
    images: ImageViewerItem[];
    /** La imagen con la que empieza. Por defecto 0 */
    initialIndex?: number;
    onIndexChange?: (index: number) => void;
    /** Zoom máximo. Por defecto 5 */
    maxZoom?: number;
    /** Zoom del doble toque. Por defecto 2.5 */
    doubleTapZoom?: number;
    /** Cómo se indica en cuál se está: puntos, miniaturas, "2 / 5" o nada. Por defecto puntos (o "2 / 5" con más de 10) */
    indicator?: "dots" | "thumbnails" | "counter" | "none";
    /** Flechas a los lados para pasar de imagen. Por defecto true (con más de una) */
    showArrows?: boolean;
    /** Botón de cerrar (arriba a la derecha) */
    onClose?: () => void;
    /** Un toque en la imagen. Por defecto muestra u oculta los controles */
    onTap?: (index: number) => void;
    /** Fondo. Por defecto negro */
    backgroundColor?: string;
    /** Contenido propio abajo (p. ej. botones de compartir o borrar) */
    renderFooter?: (index: number, item: ImageViewerItem) => React.ReactNode;
    _title?: EATextProps;
    _footer?: EABoxProps;
    variant?: (string & {});
} & React.RefAttributes<ImageViewerRef>>;
/**
 * Abre el visor a pantalla completa (con su botón de cerrar). Devuelve el control del modal
 * @example openImageViewer(['https://…/1.jpg', { uri: fotoLocal, title: 'Recibo' }], { index: 1 })
 */
export declare const openImageViewer: (images: ImageViewerItem[], options?: Omit<ImageViewerProps, "images" | "onClose"> & {
    index?: number;
}) => import("./Modal").EAModalHandle<any, any>;
