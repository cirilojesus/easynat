import React from "react";
import { EADefaultProps } from "./utils/DEFAULT_PROPS";
import { EAScrollViewProps } from "./ScrollView";
import { EATextProps } from "./Text";
import { EABoxProps } from "./Box";
export type HtmlElementNode = {
    type: 'element';
    name: string;
    attrs: Record<string, string | true>;
    children: HtmlNode[];
};
export type HtmlNode = {
    type: 'text';
    text: string;
} | HtmlElementNode;
/** Estilo por etiqueta: props de texto (color, fontSize...) y, en las de bloque, también de caja (bg, p, m...) */
export type HtmlTagsStyles = Partial<Record<string, EATextProps & EABoxProps>>;
/** Lo que recibe un renderer: el nodo, sus atributos (con las URL ya completas) y sus hijos ya pintados */
export type HtmlRendererInfo = {
    node: HtmlElementNode;
    attrs: Record<string, string | true>;
    children: React.ReactNode;
    /** true si está dentro de un texto (un <span>, un <b>...): debe devolver texto o un <Text> */
    inline: boolean;
};
/** Pinta una etiqueta a tu manera. Devolver undefined usa el render por defecto */
export type HtmlRenderer = (info: HtmlRendererInfo) => React.ReactNode | undefined;
export type RenderHTMLOptions = {
    /** Estilo base de todo el texto (su fontSize es la base de em, rem y %) */
    _text?: EATextProps;
    /** Estilo por etiqueta: { p: { mb: 2 }, h1: { color: 'primary.100' }, a: { color: 'secondary.100' } } */
    tagsStyles?: HtmlTagsStyles;
    /** Estilo por clase (class="destacado"): { destacado: { bg: 'warning.100', p: 2 } }. Va por encima de tagsStyles */
    classesStyles?: HtmlTagsStyles;
    /**
     * Pinta etiquetas a tu manera, también las propias del CMS:
     * { img: ({ attrs }) => <Image ... />, producto: ({ attrs }) => <Tarjeta id={attrs.id} /> }
     */
    renderers?: Record<string, HtmlRenderer>;
    /** Base para las URL relativas de enlaces e imágenes (src="/uploads/a.png" → https://miweb.com/uploads/a.png) */
    baseUrl?: string;
    /** Propiedades del style="" que se ignoran, p. ej. ['color', 'background-color'] para respetar el tema (modo oscuro) */
    ignoredStyles?: string[];
    /** Al pulsar un enlace. Por defecto lo abre con Linking.openURL */
    onLinkPress?: (href: string) => void;
    /** Al pulsar una imagen: su src, su posición y todas las del contenido (para abrir un visor) */
    onImagePress?: (src: string, info: {
        index: number;
        images: string[];
    }) => void;
    /** El texto se puede seleccionar y copiar */
    selectable?: boolean;
    /** Estilo de las imágenes (rounded, borde...) */
    _image?: EABoxProps;
    /**
     * Tablas con scroll horizontal cuando sus columnas no caben (si caben, ocupan el ancho como siempre).
     * Por defecto true
     */
    tableScroll?: boolean;
    /** Ancho mínimo de cada columna con tableScroll, en px. Por defecto 100 */
    tableColumnWidth?: number;
    /** Estilo de las viñetas y números de las listas */
    _bullet?: EATextProps;
};
export type EARenderHTMLProps = EAScrollViewProps & EADefaultProps & RenderHTMLOptions & {
    html: string;
    /** false: se pinta sin ScrollView (dentro de una pantalla que ya tiene scroll, una tarjeta...). Por defecto true */
    scroll?: boolean;
    /** Texto cuando el HTML viene vacío */
    emptyText?: string;
    /** Recorta el contenido a este alto con un botón "Leer más" (solo si es más largo) */
    collapsedHeight?: number;
    /** Color del degradado sobre el corte de collapsedHeight (el del fondo). Sin él, corte limpio */
    fadeColor?: string;
    readMoreText?: string;
    readLessText?: string;
    /** Estilo del texto de "Leer más" / "Leer menos" */
    _readMore?: EATextProps;
    _ios?: EAScrollViewProps & {
        html?: string;
    };
    _android?: EAScrollViewProps & {
        html?: string;
    };
    _web?: EAScrollViewProps & {
        html?: string;
    };
};
/**
 * Decodifica las entidades HTML en una sola pasada (&amp;lt; da "&lt;", no "<"): con nombre (&eacute;,
 * &ntilde;, &hellip;...) y numéricas (&#233;, &#x1F600;). Las desconocidas se dejan tal cual.
 */
export declare const decodeHtmlEntities: (text: string) => string;
/**
 * Convierte HTML en un árbol de nodos. Tolerante: etiquetas en mayúsculas, atributos con comillas simples
 * o sin valor, etiquetas sin cerrar o mal cerradas; ignora comentarios, <script> y <style>
 */
export declare const parseHTML: (html: string) => HtmlNode[];
/**
 * URL relativa → absoluta con baseUrl: "/a.png", "img/a.png", "../a.png" y "//cdn.com/a.png".
 * Las que ya tienen esquema (https:, mailto:, tel:, data:...) y las anclas (#) se quedan igual
 */
export declare const resolveUrl: (url: string, base?: string) => string;
/**
 * Convierte HTML en elementos de React Native (para usarlo sin el componente).
 * @example <View>{renderHTML('<p>Hola <b>mundo</b></p>')}</View>
 */
export declare function renderHTML(html: string, options?: RenderHTMLOptions): React.ReactNode[];
/**
 * Texto plano de un HTML: quita etiquetas, comentarios, <script> y <style> y decodifica las entidades
 * (&eacute;, &#233;...). Con `lineBreaks`, los párrafos, <br> y elementos de lista quedan en líneas.
 * @example htmlToText('<p>Hola&nbsp;<b>mundo</b></p>')                          // "Hola mundo"
 * @example htmlToText('<ul><li>Uno</li><li>Dos</li></ul>', { lineBreaks: true }) // "• Uno\n• Dos"
 */
export declare const htmlToText: (html?: string | null, { lineBreaks }?: {
    lineBreaks?: boolean;
}) => string;
export declare const RenderHTML: React.FC<EARenderHTMLProps>;
