import React from "react";
import { EABoxProps } from "./Box";
export type ImageEditorTool = 'move' | 'pencil' | 'highlighter' | 'line' | 'arrow' | 'doubleArrow' | 'square' | 'rounded' | 'circle' | 'triangle' | 'star' | 'bubble' | 'text' | 'sticker' | 'fill' | 'pixelate' | 'blur' | 'eraser';
/** Fondo de un texto: sin fondo, con borde (se lee sobre cualquier foto), caja del color o caja oscura */
export type ImageEditorTextBg = 'none' | 'outline' | 'solid' | 'soft';
export type ImageEditorFill = 'none' | 'solid' | 'soft';
export type ImageEditorDash = 'solid' | 'dashed' | 'dotted';
/** Bote de relleno: dentro de lo dibujado (las líneas hacen de borde) o la zona de la foto de un color parecido */
export type ImageEditorFillMode = 'drawing' | 'image';
/** Una fuente para los textos: `css` es la del lienzo (con alternativas); `ios` / `android`, la de la vista previa */
export type ImageEditorFont = {
    id: string;
    label: string;
    css: string;
    weight?: number;
    ios?: string;
    android?: string;
};
/** Un sticker: una imagen (https, file://, data URI o require('./x.png')), con miniatura opcional para el selector */
export type ImageEditorSticker = string | number | {
    uri: string | number;
    thumbnail?: string | number;
    label?: string;
};
export type ImageEditorAdjustKey = 'exposure' | 'brightness' | 'contrast' | 'saturation' | 'vibrance' | 'warmth' | 'tint' | 'highlights' | 'shadows' | 'vignette';
/** Ajustes de -100 a 100 (0 = sin cambio); mono y sepia de 0 a 100 */
export type ImageEditorAdjust = Partial<Record<ImageEditorAdjustKey | 'mono' | 'sepia', number>>;
export type ImageEditorFilter = {
    id: string;
    label: string;
    adjust: ImageEditorAdjust;
};
export type ImageEditorTextOptions = {
    color?: string;
    bg?: ImageEditorTextBg;
    font?: string;
    align?: 'left' | 'center' | 'right';
    size?: number;
};
export type ImageEditorResult = {
    /** data:image/...;base64,... */
    dataUri: string;
    /** Solo el base64 (sin el "data:...;base64,") */
    base64: string;
    mimeType: 'image/png' | 'image/jpeg';
    width: number;
    height: number;
};
export type ImageEditorRef = {
    /** Exporta la imagen editada */
    save: () => Promise<ImageEditorResult>;
    undo: () => void;
    redo: () => void;
    /** Borra todo lo dibujado (el giro, el recorte y los ajustes se quedan) */
    clear: () => void;
    rotate: (direction?: 'left' | 'right') => void;
    setTool: (tool: ImageEditorTool | 'crop' | 'adjust') => void;
    /** Añade un texto en el centro (seleccionado, para moverlo) */
    addText: (text: string, options?: ImageEditorTextOptions) => void;
    /** Añade un sticker (una imagen) en el centro */
    addSticker: (sticker: ImageEditorSticker) => void;
    /** Cambia los ajustes de la foto (con deshacer) */
    setAdjust: (adjust: ImageEditorAdjust) => void;
    /** Borra el elemento seleccionado */
    deleteSelected: () => void;
    resetZoom: () => void;
};
export type ImageEditorProps = Omit<EABoxProps, 'children'> & {
    /** La imagen: https, file://, content:// o data URI */
    source: string;
    /** Herramientas (en orden; las formas y las de privacidad se agrupan en un botón). Por defecto todas */
    tools?: ImageEditorTool[];
    /** Botón de girar. Por defecto true */
    rotate?: boolean;
    /** Herramienta de recortar. Por defecto true */
    crop?: boolean;
    /** Ajustes de la foto (exposición, brillo, contraste...). true = todos; o la lista; false = ninguno. Por defecto true */
    adjust?: boolean | ImageEditorAdjustKey[];
    /** Filtros (combinaciones de ajustes). Por defecto unos cuantos; [] para quitarlos */
    filters?: ImageEditorFilter[];
    /** Cuentagotas en el menú de color (tomar un color de la foto). Por defecto true */
    eyedropper?: boolean;
    /** Imán y guías al centro de la foto al mover. Por defecto false */
    snapGuides?: boolean;
    /** Zoom máximo (dos dedos). Por defecto 8 */
    maxZoom?: number;
    colors?: string[];
    /** Grosores (en px de pantalla) */
    lineWidths?: number[];
    /** Fuentes de los textos. Por defecto 6 del sistema (sin descargar nada) */
    fonts?: ImageEditorFont[];
    /** Stickers (imágenes) del selector. Sin stickers no sale el botón */
    stickers?: ImageEditorSticker[];
    defaultTool?: ImageEditorTool;
    defaultColor?: string;
    defaultLineWidth?: number;
    /** Formato de salida. Por defecto 'jpeg' (fotos); 'png' para transparencias o capturas */
    format?: 'png' | 'jpeg';
    /** Calidad del jpeg (0-1). Por defecto 0.9 */
    quality?: number;
    /** Lado mayor máximo de la imagen exportada en px (para no mandar fotos enormes). Por defecto el original */
    maxSize?: number;
    /** Al pulsar guardar (✓): la imagen editada */
    onSave?: (result: ImageEditorResult) => void;
    /** Al pulsar cancelar (×) */
    onCancel?: () => void;
    /** Fondo del editor. Por defecto casi negro */
    backgroundColor?: string;
    _toolbar?: EABoxProps;
    variant?: (string & {});
};
/** Todas las herramientas del editor, en el orden de la barra (la prop `tools` usa estas por defecto) */
export declare const IMAGE_EDITOR_TOOLS: ImageEditorTool[];
/** Las fuentes de los textos por defecto: del sistema, sin descargar nada (la prop `fonts` las cambia) */
export declare const IMAGE_EDITOR_FONTS: ImageEditorFont[];
/** Los ajustes de la foto que se muestran por defecto (la prop `adjust` los elige) */
export declare const IMAGE_EDITOR_ADJUSTMENTS: ImageEditorAdjustKey[];
/** Los filtros por defecto: cada uno es una combinación de ajustes (la prop `filters` los cambia) */
export declare const IMAGE_EDITOR_FILTERS: ImageEditorFilter[];
/**
 * Editor de imágenes: dibujar, textos, stickers, relleno, pixelar, ajustes y filtros, seleccionar y mover, zoom, girar
 * y recortar. Necesita react-native-webview (dependencia opcional)
 * @example <ImageEditor source={foto.uri} onSave={r => subir(r.dataUri)} onCancel={volver} />
 * @example const r = await openImageEditor(foto.uri); if (r) guardar(r.base64);
 */
export declare const ImageEditor: React.ForwardRefExoticComponent<Omit<EABoxProps, "children"> & {
    /** La imagen: https, file://, content:// o data URI */
    source: string;
    /** Herramientas (en orden; las formas y las de privacidad se agrupan en un botón). Por defecto todas */
    tools?: ImageEditorTool[];
    /** Botón de girar. Por defecto true */
    rotate?: boolean;
    /** Herramienta de recortar. Por defecto true */
    crop?: boolean;
    /** Ajustes de la foto (exposición, brillo, contraste...). true = todos; o la lista; false = ninguno. Por defecto true */
    adjust?: boolean | ImageEditorAdjustKey[];
    /** Filtros (combinaciones de ajustes). Por defecto unos cuantos; [] para quitarlos */
    filters?: ImageEditorFilter[];
    /** Cuentagotas en el menú de color (tomar un color de la foto). Por defecto true */
    eyedropper?: boolean;
    /** Imán y guías al centro de la foto al mover. Por defecto false */
    snapGuides?: boolean;
    /** Zoom máximo (dos dedos). Por defecto 8 */
    maxZoom?: number;
    colors?: string[];
    /** Grosores (en px de pantalla) */
    lineWidths?: number[];
    /** Fuentes de los textos. Por defecto 6 del sistema (sin descargar nada) */
    fonts?: ImageEditorFont[];
    /** Stickers (imágenes) del selector. Sin stickers no sale el botón */
    stickers?: ImageEditorSticker[];
    defaultTool?: ImageEditorTool;
    defaultColor?: string;
    defaultLineWidth?: number;
    /** Formato de salida. Por defecto 'jpeg' (fotos); 'png' para transparencias o capturas */
    format?: "png" | "jpeg";
    /** Calidad del jpeg (0-1). Por defecto 0.9 */
    quality?: number;
    /** Lado mayor máximo de la imagen exportada en px (para no mandar fotos enormes). Por defecto el original */
    maxSize?: number;
    /** Al pulsar guardar (✓): la imagen editada */
    onSave?: (result: ImageEditorResult) => void;
    /** Al pulsar cancelar (×) */
    onCancel?: () => void;
    /** Fondo del editor. Por defecto casi negro */
    backgroundColor?: string;
    _toolbar?: EABoxProps;
    variant?: (string & {});
} & React.RefAttributes<ImageEditorRef>>;
/**
 * Abre el editor a pantalla completa. Se resuelve con la imagen editada al guardar, o null si se cancela
 * @example const r = await openImageEditor(foto.uri, { format: 'png' }); if (r) subir(r.dataUri);
 */
export declare const openImageEditor: (source: string, options?: Omit<ImageEditorProps, "source" | "onSave" | "onCancel">) => Promise<ImageEditorResult>;
