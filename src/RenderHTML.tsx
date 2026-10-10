import React, { useEffect, useMemo, useRef, useState } from "react";
import { Image as RNImage, Linking, Platform, Pressable, ScrollView as RNScrollView, StyleSheet, View } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { Button } from "./Button";
import { Collapse } from "./Collapse";
import { libT } from "./utils/translate";
import { EADefaultProps } from "./utils/DEFAULT_PROPS";
import { EAScrollViewProps, ScrollView } from "./ScrollView";
import { EATextProps, Text } from "./Text";
import { Box, EABoxProps } from "./Box";
import { mergeProps, useThemeProps } from "./utils/useThemeProps";

/* ---------------- Tipos ---------------- */

export type HtmlElementNode = { type: 'element'; name: string; attrs: Record<string, string | true>; children: HtmlNode[] };
export type HtmlNode = { type: 'text'; text: string } | HtmlElementNode;

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
    onImagePress?: (src: string, info: { index: number; images: string[] }) => void;
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
    _ios?: EAScrollViewProps & { html?: string };
    _android?: EAScrollViewProps & { html?: string };
    _web?: EAScrollViewProps & { html?: string };
};

/* ---------------- Entidades ---------------- */

const NAMED_ENTITIES: Record<string, string> = {
    nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'",
    copy: '©', reg: '®', trade: '™', hellip: '…', mdash: '—', ndash: '–', bull: '•', middot: '·',
    laquo: '«', raquo: '»', ldquo: '“', rdquo: '”', lsquo: '‘', rsquo: '’', sbquo: '‚', bdquo: '„',
    euro: '€', pound: '£', yen: '¥', cent: '¢', deg: '°', plusmn: '±', times: '×', divide: '÷',
    iexcl: '¡', iquest: '¿', sect: '§', para: '¶', ordf: 'ª', ordm: 'º', frac12: '½', frac14: '¼', frac34: '¾',
    aacute: 'á', eacute: 'é', iacute: 'í', oacute: 'ó', uacute: 'ú', yacute: 'ý',
    Aacute: 'Á', Eacute: 'É', Iacute: 'Í', Oacute: 'Ó', Uacute: 'Ú', Yacute: 'Ý',
    agrave: 'à', egrave: 'è', igrave: 'ì', ograve: 'ò', ugrave: 'ù', Agrave: 'À', Egrave: 'È', Igrave: 'Ì', Ograve: 'Ò', Ugrave: 'Ù',
    acirc: 'â', ecirc: 'ê', icirc: 'î', ocirc: 'ô', ucirc: 'û', Acirc: 'Â', Ecirc: 'Ê', Icirc: 'Î', Ocirc: 'Ô', Ucirc: 'Û',
    auml: 'ä', euml: 'ë', iuml: 'ï', ouml: 'ö', uuml: 'ü', yuml: 'ÿ', Auml: 'Ä', Euml: 'Ë', Iuml: 'Ï', Ouml: 'Ö', Uuml: 'Ü',
    atilde: 'ã', otilde: 'õ', Atilde: 'Ã', Otilde: 'Õ', ntilde: 'ñ', Ntilde: 'Ñ', ccedil: 'ç', Ccedil: 'Ç',
    aring: 'å', Aring: 'Å', aelig: 'æ', AElig: 'Æ', oslash: 'ø', Oslash: 'Ø', szlig: 'ß',
};

/**
 * Decodifica las entidades HTML en una sola pasada (&amp;lt; da "&lt;", no "<"): con nombre (&eacute;,
 * &ntilde;, &hellip;...) y numéricas (&#233;, &#x1F600;). Las desconocidas se dejan tal cual.
 */
export const decodeHtmlEntities = (text: string) => text.replace(/&(#x[0-9a-f]+|#\d+|[a-z][a-z0-9]*);/gi, (match, code: string) => {
    if (code[0] === '#') {
        const n = code[1] === 'x' || code[1] === 'X' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
        return Number.isFinite(n) && n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : match;
    }
    return NAMED_ENTITIES[code] ?? NAMED_ENTITIES[code.toLowerCase()] ?? match;
});

/* ---------------- Parser ---------------- */

const VOID_TAGS = new Set(['br', 'img', 'input', 'hr', 'meta', 'link', 'source', 'track', 'wbr', 'area', 'base', 'col', 'embed', 'param']);
const INLINE_TAGS = new Set(['a', 'abbr', 'b', 'bdi', 'bdo', 'big', 'br', 'cite', 'code', 'data', 'del', 'dfn', 'em', 'font', 'i', 'img', 'input', 'ins', 'kbd', 'label', 'mark', 'q', 's', 'samp', 'small', 'span', 'strike', 'strong', 'sub', 'sup', 'time', 'tt', 'u', 'var']);
// Abrir uno de estos cierra el mismo que siga abierto (HTML descuidado: <li>a<li>b, <p>a<p>b)
const AUTO_CLOSE = new Set(['li', 'p', 'tr', 'td', 'th', 'option']);

const ATTR_REGEX = /([^\s"'>\/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
const parseAttributes = (str: string) => {
    const attrs: Record<string, string | true> = {};
    for (const [, name, dq, sq, uq] of str.matchAll(ATTR_REGEX)) {
        const value = dq ?? sq ?? uq;
        attrs[name.toLowerCase()] = value === undefined ? true : decodeHtmlEntities(value);
    }
    return attrs;
};

const stripIgnored = (html: string) => html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(script|style|head)\b[\s\S]*?<\/\1\s*>/gi, '');

/**
 * Convierte HTML en un árbol de nodos. Tolerante: etiquetas en mayúsculas, atributos con comillas simples
 * o sin valor, etiquetas sin cerrar o mal cerradas; ignora comentarios, <script> y <style>
 */
export const parseHTML = (html: string): HtmlNode[] => {
    const root: HtmlElementNode = { type: 'element', name: 'root', attrs: {}, children: [] };
    const stack = [root];
    const top = () => stack[stack.length - 1];

    for (const [match, closing, rawName, rawAttrs, text] of stripIgnored(String(html ?? '')).matchAll(/<(\/)?([a-zA-Z][a-zA-Z0-9-]*)([^>]*)>|([^<]+|<)/g)) {
        if (text !== undefined) {
            top().children.push({ type: 'text', text });
            continue;
        }
        const name = rawName.toLowerCase();
        if (closing) {
            // Cierra hasta la última etiqueta abierta con ese nombre (si no hay ninguna, se ignora)
            const i = stack.map(n => n.name).lastIndexOf(name);
            if (i > 0) stack.length = i;
            continue;
        }
        if (AUTO_CLOSE.has(name) && top().name === name) stack.pop();
        const node: HtmlElementNode = { type: 'element', name, attrs: parseAttributes(rawAttrs), children: [] };
        top().children.push(node);
        if (!VOID_TAGS.has(name) && !match.endsWith('/>')) stack.push(node);
    }
    return root.children;
};

/* ---------------- CSS en línea ---------------- */

const BASE_FONT_SIZE = 14;
const FONT_SIZE_KEYWORDS: Record<string, number> = { 'xx-small': 9, 'x-small': 10, small: 12, medium: 14, large: 18, 'x-large': 24, 'xx-large': 32 };
const FONT_TAG_SIZES: Record<string, number> = { 1: 10, 2: 12, 3: 14, 4: 18, 5: 24, 6: 32, 7: 48 };

const cssLength = (value: string, base = BASE_FONT_SIZE): number | undefined => {
    const v = value.trim().toLowerCase();
    if (v in FONT_SIZE_KEYWORDS) return FONT_SIZE_KEYWORDS[v];
    const m = /^(-?[\d.]+)(px|pt|em|rem|%)?$/.exec(v);
    if (!m) return undefined;
    const n = parseFloat(m[1]);
    switch (m[2]) {
        case 'pt': return n * 4 / 3;
        case 'em': case 'rem': return n * base;
        case '%': return base * n / 100;
        default: return n;
    }
};

/** style="..." → props de texto (color, fontSize...) y de caja (bg, margin, padding) */
const parseStyle = (css: string | true | undefined, ctx: Ctx): { text: EATextProps; box: EABoxProps } => {
    const text: Record<string, any> = {};
    const box: Record<string, any> = {};
    if (typeof css !== 'string') return { text, box };
    const base = baseSize(ctx);
    for (const rule of css.split(';')) {
        const i = rule.indexOf(':');
        if (i < 0) continue;
        const prop = rule.slice(0, i).trim().toLowerCase();
        const value = rule.slice(i + 1).trim().replace(/\s*!important$/i, '');
        if (!value || ctx.ignored.has(prop)) continue;
        switch (prop) {
            case 'color': text.color = value; break;
            case 'background-color': case 'background': text.bg = value; box.bg = value; break;
            case 'font-size': { const n = cssLength(value, base); if (n) text.fontSize = n; break; }
            case 'font-weight': text.fontWeight = value === 'bold' || value === 'bolder' ? '700' : value === 'normal' || value === 'lighter' ? '400' : value; break;
            case 'font-style': text.fontStyle = value === 'italic' || value === 'oblique' ? 'italic' : 'normal'; break;
            case 'text-decoration': case 'text-decoration-line':
                text.textDecorationLine = /underline/.test(value) && /line-through/.test(value) ? 'underline line-through'
                    : /underline/.test(value) ? 'underline' : /line-through/.test(value) ? 'line-through' : 'none';
                break;
            case 'text-align': if (['left', 'right', 'center', 'justify'].includes(value)) text.textAlign = value; break;
            case 'letter-spacing': { const n = value === 'normal' ? 0 : cssLength(value, base); if (n != null) text.letterSpacing = n; break; }
            case 'line-height': { const n = /^[\d.]+$/.test(value) ? parseFloat(value) * (text.fontSize ?? base) : cssLength(value, base); if (n) text.lineHeight = n; break; }
            default: {
                // margin / padding (y sus lados), en px
                const m = /^(margin|padding)(?:-(top|right|bottom|left))?$/.exec(prop);
                const n = m && cssLength(value.split(/\s+/)[0], base);
                if (m && n != null) box[`${m[1]}${m[2] ? m[2][0].toUpperCase() + m[2].slice(1) : ''}`] = n;
            }
        }
    }
    return { text, box };
};

/* ---------------- Estilos por defecto de cada etiqueta ---------------- */

const MONO = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' });
const HEADINGS: Record<string, number> = { h1: 26, h2: 22, h3: 20, h4: 18, h5: 16, h6: 14 };

const INLINE_DEFAULTS: Record<string, EATextProps> = {
    b: { fontWeight: '700' }, strong: { fontWeight: '700' },
    i: { fontStyle: 'italic' }, em: { fontStyle: 'italic' }, cite: { fontStyle: 'italic' }, dfn: { fontStyle: 'italic' }, var: { fontStyle: 'italic' },
    a: { color: 'primary.100' },
    code: { fontFamily: MONO, bg: 'light.50' }, kbd: { fontFamily: MONO, bg: 'light.50' }, samp: { fontFamily: MONO }, tt: { fontFamily: MONO },
    mark: { bg: '#fff3a3' },
    small: { fontSize: 12 }, sub: { fontSize: 10 }, sup: { fontSize: 10 }, big: { fontSize: 18 },
};

/* ---------------- Render ---------------- */

type Ctx = {
    opts: RenderHTMLOptions;
    /** Propiedades CSS ignoradas (ignoredStyles, en minúsculas) */
    ignored: Set<string>;
    /** Las src de todas las imágenes, en orden (para onImagePress) */
    images: string[];
    /** Estilo de texto heredado de los bloques de fuera (color, fontSize, textAlign...) */
    text: EATextProps;
    /** Decoraciones acumuladas: en RN el textDecorationLine de dentro reemplaza al de fuera, así que se suman aquí */
    deco: { underline: boolean; strike: boolean };
    pre: boolean;
    depth: number;
};

const isElement = (n: HtmlNode): n is HtmlElementNode => n.type === 'element';
const isImg = (n: HtmlNode) => isElement(n) && n.name === 'img';
const isInline = (n: HtmlNode) => n.type === 'text' || INLINE_TAGS.has(n.name);
const decoLine = (d: Ctx['deco']) => (d.underline && d.strike ? 'underline line-through' : d.underline ? 'underline' : d.strike ? 'line-through' : undefined) as EATextProps['textDecorationLine'];
const tagStyle = (ctx: Ctx, name: string) => ctx.opts.tagsStyles?.[name];
const baseSize = (ctx: Ctx) => (typeof ctx.opts._text?.fontSize === 'number' ? ctx.opts._text.fontSize : BASE_FONT_SIZE);
/** tagsStyles de la etiqueta + classesStyles de sus clases (en ese orden) */
const customStyle = (ctx: Ctx, node: HtmlElementNode) => {
    const cls = node.attrs.class;
    const byClass = typeof cls === 'string' && ctx.opts.classesStyles ? cls.split(/\s+/).map(c => ctx.opts.classesStyles![c]) : [];
    return byClass.length ? mergeProps<EATextProps & EABoxProps>(tagStyle(ctx, node.name), ...byClass) : tagStyle(ctx, node.name);
};
const openLink = (ctx: Ctx, href: string) => (ctx.opts.onLinkPress ? ctx.opts.onLinkPress(href) : Linking.openURL(href).catch(() => { }));

/**
 * URL relativa → absoluta con baseUrl: "/a.png", "img/a.png", "../a.png" y "//cdn.com/a.png".
 * Las que ya tienen esquema (https:, mailto:, tel:, data:...) y las anclas (#) se quedan igual
 */
export const resolveUrl = (url: string, base?: string) => {
    if (!base || !url || url.startsWith('#') || /^[a-z][a-z0-9+.-]*:/i.test(url)) return url;
    if (url.startsWith('//')) return (/^([a-z][a-z0-9+.-]*:)/i.exec(base)?.[1] ?? 'https:') + url;
    const m = /^([a-z][a-z0-9+.-]*:\/\/[^/?#]+)([^?#]*)/i.exec(base);
    if (!m) return url;
    if (url.startsWith('/')) return m[1] + url;
    const parts: string[] = [];
    for (const p of ((m[2] || '/').replace(/[^/]*$/, '') + url).split('/')) {
        if (p === '..') { if (parts.length > 1) parts.pop() } else if (p !== '.') parts.push(p);
    }
    return m[1] + parts.join('/');
};
/** Atributos con href y src completados con baseUrl */
const urlAttrs = (node: HtmlElementNode, ctx: Ctx) => {
    const { href, src } = node.attrs;
    if (!ctx.opts.baseUrl || (typeof href !== 'string' && typeof src !== 'string')) return node.attrs;
    return {
        ...node.attrs,
        ...(typeof href === 'string' && { href: resolveUrl(href, ctx.opts.baseUrl) }),
        ...(typeof src === 'string' && { src: resolveUrl(src, ctx.opts.baseUrl) }),
    };
};
/** Un renderer propio para la etiqueta (undefined = el de por defecto) */
const customRender = (node: HtmlElementNode, ctx: Ctx, key: string, inline: boolean, children: () => React.ReactNode) => {
    const renderer = ctx.opts.renderers?.[node.name];
    if (!renderer) return undefined;
    const out = renderer({ node, attrs: urlAttrs(node, ctx), children: children(), inline });
    return out === undefined ? undefined : <React.Fragment key={key}>{out}</React.Fragment>;
};
/** Texto plano de unos nodos (para <summary>) */
const nodesText = (nodes: HtmlNode[]): string =>
    nodes.map(n => (n.type === 'text' ? decodeHtmlEntities(n.text) : n.name === 'br' ? ' ' : nodesText(n.children))).join('').replace(/\s+/g, ' ').trim();

/** Imagen: con su proporción (de width/height o, si no, de la propia imagen) y sin pasar del ancho disponible */
const HtmlImage = ({ src, width, height, box, image, onPress }: { src: string; width?: number; height?: number; box?: EABoxProps; image?: EABoxProps; onPress?: () => void }) => {
    const [ratio, setRatio] = useState<number | null>(width && height ? width / height : null);
    useEffect(() => {
        if (ratio || !src) return;
        let alive = true;
        RNImage.getSize(src, (w, h) => { if (alive && h > 0) setRatio(w / h) }, () => { if (alive) setRatio(16 / 9) });
        return () => { alive = false };
    }, [src]);
    // El estilo (_image: rounded, borde...) va en una caja del tamaño exacto de la imagen
    const img = (
        <Box overflow="hidden" {...image} style={{ width: width ?? '100%', maxWidth: '100%', aspectRatio: ratio ?? 16 / 9 }}>
            <RNImage source={{ uri: src }} resizeMode="cover" style={{ width: '100%', height: '100%' }} />
        </Box>
    );
    return (
        <Box my={1} alignItems="flex-start" {...box}>
            {onPress ? <Pressable onPress={onPress} accessibilityRole="imagebutton" style={{ width: width ?? '100%', maxWidth: '100%' }}>{img}</Pressable> : img}
        </Box>
    );
};

/** <input type="checkbox|radio">: una caja en línea con el texto (RN admite vistas con tamaño dentro de un Text) */
const renderCheck = (node: HtmlElementNode, key: string) => {
    if (node.attrs.type !== 'checkbox' && node.attrs.type !== 'radio') return null;
    const checked = node.attrs.checked != null && node.attrs.checked !== 'false';
    return (
        <Box key={key} w={16} h={16} mr={4} style={{ transform: [{ translateY: 3 }] }} borderWidth={1} borderColor={checked ? 'primary.100' : 'gray.50'} bg={checked ? 'primary.100' : undefined}
            rounded={node.attrs.type === 'radio' ? 40 : 1} alignItems="center" justifyContent="center" _text={{ color: 'white', fontSize: 11, fontWeight: '700', lineHeight: 14 }}>
            {checked ? '✓' : ''}
        </Box>
    );
};

function renderInline(node: HtmlNode, ctx: Ctx, key: string): React.ReactNode {
    if (node.type === 'text') return node.text;
    const name = node.name;
    if (name === 'br') return '\n';
    if (name === 'img') return null; // las imágenes van como bloque (renderBlocks las saca del párrafo)
    if (name === 'input') return renderCheck(node, key);
    const own = customRender(node, ctx, key, true, () => node.children.map((c, i) => renderInline(c, ctx, `${key}.${i}`)));
    if (own !== undefined) return own;

    const style = parseStyle(node.attrs.style, ctx);
    const line = style.text.textDecorationLine;
    const deco = {
        underline: ctx.deco.underline || ((name === 'u' || name === 'ins' || name === 'a') && line !== 'none') || !!line?.includes('underline'),
        strike: ctx.deco.strike || ['s', 'strike', 'del'].includes(name) || !!line?.includes('line-through'),
    };
    const fontProps: EATextProps = name === 'font' ? {
        ...(typeof node.attrs.color === 'string' && !ctx.ignored.has('color') && { color: node.attrs.color }),
        ...(node.attrs.size != null && { fontSize: FONT_TAG_SIZES[String(node.attrs.size)] ?? BASE_FONT_SIZE }),
        ...(typeof node.attrs.face === 'string' && { fontFamily: node.attrs.face.split(',')[0].trim().replace(/['"]/g, '') }),
    } : {};
    const props = mergeProps<EATextProps>(INLINE_DEFAULTS[name], fontProps, style.text, customStyle(ctx, node), { textDecorationLine: decoLine(deco) });
    const inner = { ...ctx, deco };
    const href = name === 'a' && typeof node.attrs.href === 'string' ? resolveUrl(node.attrs.href, ctx.opts.baseUrl) : undefined;

    // Subíndice y superíndice: en RN un Text no tiene vertical-align, así que van en una vista en línea desplazada
    // (dentro de la vista no se hereda el estilo del párrafo: se le pasa)
    if (name === 'sub' || name === 'sup') {
        const base = mergeProps<EATextProps>(ctx.opts._text, ctx.text);
        const size = typeof base.fontSize === 'number' ? base.fontSize : baseSize(ctx);
        return (
            <View key={key} style={{ transform: [{ translateY: name === 'sup' ? -size * 0.38 : size * 0.22 }] }}>
                <Text {...base} {...props} lineHeight={undefined} fontSize={(customStyle(ctx, node)?.fontSize as number | undefined) ?? Math.round(size * 0.72)}>{node.children.map((c, i) => renderInline(c, inner, `${key}.${i}`))}</Text>
            </View>
        );
    }
    return (
        <Text key={key} {...props} {...(href && { accessibilityRole: 'link' as const, onPress: () => openLink(ctx, href) })}>
            {name === 'q' && '“'}
            {node.children.map((c, i) => renderInline(c, inner, `${key}.${i}`))}
            {name === 'q' && '”'}
        </Text>
    );
}

/** Espacios como en HTML: los saltos y la sangría del código se juntan en un espacio (salvo en <pre>) */
const normalizeRun = (run: HtmlNode[], pre: boolean): HtmlNode[] => {
    const decode = (n: HtmlNode): HtmlNode => n.type === 'text'
        ? { type: 'text', text: decodeHtmlEntities(pre ? n.text : n.text.replace(/[ \t\r\n\f]+/g, ' ')) }
        : { ...n, children: n.children.map(decode) };
    const out = run.map(decode);
    if (pre) return out;
    // Sin espacios al principio ni al final del párrafo, ni junto a un <br>
    const trimEdge = (nodes: HtmlNode[], end: boolean) => {
        const n = nodes[end ? nodes.length - 1 : 0];
        if (!n) return;
        if (n.type === 'text') nodes[end ? nodes.length - 1 : 0] = { type: 'text', text: end ? n.text.replace(/ +$/, '') : n.text.replace(/^ +/, '') };
        else if (n.name !== 'br') trimEdge(n.children, end);
    };
    trimEdge(out, false);
    trimEdge(out, true);
    out.forEach((n, i) => {
        if (!isElement(n) || n.name !== 'br') return;
        if (out[i - 1]) trimEdge([out[i - 1]], true);
        if (out[i + 1]) trimEdge([out[i + 1]], false);
    });
    return out;
};

const hasContent = (nodes: HtmlNode[]): boolean =>
    nodes.some(n => (n.type === 'text' ? n.text.trim() !== '' : n.name === 'br' || n.name === 'input' || hasContent(n.children)));

/** Saca las imágenes de dentro de un enlace o un span: en RN una imagen no puede ir en medio de un texto */
const splitImages = (n: HtmlNode): { inline: HtmlNode; images: HtmlElementNode[] } => {
    if (!isElement(n)) return { inline: n, images: [] };
    const images: HtmlElementNode[] = [];
    const children = n.children.flatMap(c => {
        if (isImg(c)) { images.push(c as HtmlElementNode); return [] }
        const r = splitImages(c);
        images.push(...r.images);
        return [r.inline];
    });
    return { inline: { ...n, children }, images };
};

function renderBlocks(nodes: HtmlNode[], ctx: Ctx, key: string): React.ReactNode[] {
    const out: React.ReactNode[] = [];
    let run: HtmlNode[] = [];

    // Texto y etiquetas en línea seguidos van en un mismo <Text>: así un párrafo con negritas o enlaces fluye
    const flush = () => {
        if (run.length && (ctx.pre || hasContent(run))) {
            const k = `${key}.t${out.length}`;
            out.push(
                <Text key={k} selectable={ctx.opts.selectable} {...mergeProps<EATextProps>(ctx.opts._text, ctx.text, { textDecorationLine: decoLine(ctx.deco) })}>
                    {normalizeRun(run, ctx.pre).map((n, i) => renderInline(n, ctx, `${k}.${i}`))}
                </Text>
            );
        }
        run = [];
    };

    nodes.forEach((n, i) => {
        if (isImg(n)) {
            flush();
            out.push(renderBlock(n as HtmlElementNode, ctx, `${key}.${i}`));
        } else if (isInline(n)) {
            const { inline, images } = splitImages(n);
            run.push(inline);
            if (images.length) {
                flush();
                images.forEach((img, j) => out.push(renderBlock(img, ctx, `${key}.${i}.img${j}`)));
            }
        } else {
            flush();
            out.push(renderBlock(n as HtmlElementNode, ctx, `${key}.${i}`));
        }
    });
    flush();
    return out;
}

function renderBlock(node: HtmlElementNode, ctx: Ctx, key: string): React.ReactNode {
    const name = node.name;
    const style = parseStyle(node.attrs.style, ctx);
    const custom = customStyle(ctx, node);
    const align: EATextProps = typeof node.attrs.align === 'string' ? { textAlign: node.attrs.align as any } : {};
    // Lo heredan sus párrafos (el fondo no: ya lo pinta la caja)
    const withText = (extra?: EATextProps): Ctx => ({ ...ctx, text: mergeProps<EATextProps>(ctx.text, extra, align, { ...style.text, bg: undefined }, custom) });
    const children = (c: Ctx = withText()) => renderBlocks(node.children, c, key);
    const box = { ...style.box, ...custom };
    const own = customRender(node, ctx, key, false, () => children());
    if (own !== undefined) return own;

    switch (name) {
        case 'h1': case 'h2': case 'h3': case 'h4': case 'h5': case 'h6':
            return <Box key={key} mt={2} mb={1} {...box}>{children(withText({ fontSize: HEADINGS[name], fontWeight: '700' }))}</Box>;
        case 'p':
            return <Box key={key} mb={2} {...box}>{children()}</Box>;
        case 'blockquote':
            return (
                <Box key={key} borderLeftWidth={3} borderColor="light.200" pl={3} my={2} {...box}>
                    {children(withText({ color: 'gray', fontStyle: 'italic' }))}
                </Box>
            );
        case 'pre':
            return (
                <Box key={key} bg="light.50" p={3} rounded={1} my={2} {...box}>
                    {renderBlocks(node.children, { ...withText({ fontFamily: MONO, fontSize: 13 }), pre: true }, key)}
                </Box>
            );
        case 'hr':
            return <Box key={key} style={{ height: StyleSheet.hairlineWidth }} bg="light.200" my={3} {...box} />;
        case 'ul': case 'ol': {
            const start = Number(node.attrs.start) || 1;
            let n = 0;
            const inner: Ctx = { ...withText(), depth: ctx.depth + 1 };
            return (
                <Box key={key} pl={ctx.depth ? 3 : 0} mb={ctx.depth ? 0 : 2} {...box}>
                    {node.children.map((li, i) => {
                        if (!isElement(li) || li.name !== 'li') return hasContent([li]) ? renderBlocks([li], inner, `${key}.${i}`) : null;
                        const marker = name === 'ol' ? `${start + n++}.` : ctx.depth % 2 ? '◦' : '•';
                        // Lista de tareas (la del RichTextEditor): <ul class="checklist"><li data-checked="true">
                        const isTask = name === 'ul' && typeof node.attrs.class === 'string' && /(^|\s)checklist(\s|$)/.test(node.attrs.class);
                        const done = li.attrs['data-checked'] === 'true';
                        const liStyle = parseStyle(li.attrs.style, ctx);
                        const liText = mergeProps<EATextProps>(inner.text, { ...liStyle.text, bg: undefined });
                        return (
                            <Box key={`${key}.${i}`} flexDir="row" mb={1} {...liStyle.box} {...customStyle(ctx, li)}>
                                {isTask
                                    ? <Box w={22} mr={6} pt={0.5} alignItems="flex-end">{renderCheck({ type: 'element', name: 'input', attrs: { type: 'checkbox', ...(done && { checked: true }) }, children: [] }, `${key}.${i}.c`)}</Box>
                                    : <Text w={22} textAlign="right" mr={6} {...mergeProps<EATextProps>(ctx.opts._text, liText, ctx.opts._bullet)}>{marker}</Text>}
                                {/* flex 1: si no, un texto largo se sale de la pantalla */}
                                <Box flex={1}>{renderBlocks(li.children, { ...inner, text: liText }, `${key}.${i}`)}</Box>
                            </Box>
                        );
                    })}
                </Box>
            );
        }
        case 'img': {
            const src = typeof node.attrs.src === 'string' ? resolveUrl(node.attrs.src, ctx.opts.baseUrl) : '';
            if (!src) return null;
            const num = (v?: string | true) => (typeof v === 'string' && /^\d+(px)?$/.test(v) ? parseInt(v, 10) : undefined);
            const onImagePress = ctx.opts.onImagePress;
            return (
                <HtmlImage key={key} src={src} width={num(node.attrs.width)} height={num(node.attrs.height)} box={box} image={ctx.opts._image}
                    onPress={onImagePress && (() => onImagePress(src, { index: Math.max(0, ctx.images.indexOf(src)), images: ctx.images }))} />
            );
        }
        case 'details': {
            // Desplegable con Collapse: el <summary> es el botón y el resto, el contenido
            const summary = node.children.find(c => isElement(c) && c.name === 'summary') as HtmlElementNode | undefined;
            const rest = node.children.filter(c => c !== summary);
            return (
                <Collapse
                    key={key} my={1} {...box}
                    defaultOpen={node.attrs.open != null && node.attrs.open !== 'false'}
                    trigger={props => (
                        <Button {...props} variant="ghost" justifyContent="space-between" px={0} {...tagStyle(ctx, 'summary')}>
                            {summary ? nodesText(summary.children) || '…' : '…'}
                        </Button>
                    )}
                >
                    {renderBlocks(rest, withText(), key)}
                </Collapse>
            );
        }
        case 'table': {
            const table = <Box borderWidth={1} borderColor="light.200" {...(ctx.opts.tableScroll === false && { my: 2 })} {...box}>{children()}</Box>;
            if (ctx.opts.tableScroll === false) return <React.Fragment key={key}>{table}</React.Fragment>;
            // Si las columnas caben, minWidth 100% hace que ocupe el ancho; si no, se desplaza de lado
            return (
                <RNScrollView key={key} horizontal showsHorizontalScrollIndicator nestedScrollEnabled
                    style={{ marginVertical: 8 }} contentContainerStyle={{ minWidth: '100%' }}>
                    <View style={{ flex: 1 }}>{table}</View>
                </RNScrollView>
            );
        }
        case 'tr':
            return <Box key={key} flexDir="row" borderBottomWidth={StyleSheet.hairlineWidth} borderColor="light.200" {...box}>{children()}</Box>;
        case 'td': case 'th': {
            const span = Number(node.attrs.colspan) || 1;
            return (
                <Box key={key} flex={span} p={1.5} {...(ctx.opts.tableScroll !== false && { minW: (ctx.opts.tableColumnWidth ?? 100) * span })} {...box}>
                    {children(withText(name === 'th' ? { fontWeight: '700' } : undefined))}
                </Box>
            );
        }
        default:
            // div, section, article, thead, tbody, li suelto... (y las desconocidas): un bloque con sus hijos
            return <Box key={key} {...box}>{children()}</Box>;
    }
}

/**
 * Convierte HTML en elementos de React Native (para usarlo sin el componente).
 * @example <View>{renderHTML('<p>Hola <b>mundo</b></p>')}</View>
 */
export function renderHTML(html: string, options: RenderHTMLOptions = {}): React.ReactNode[] {
    return renderTree(parseHTML(html), options);
}

/** ¿Se vería algo? Texto, imágenes, casillas, <hr> o etiquetas con renderer propio */
const isVisible = (nodes: HtmlNode[], renderers?: Record<string, HtmlRenderer>): boolean => nodes.some(n => (n.type === 'text'
    ? decodeHtmlEntities(n.text).trim() !== ''
    : ['img', 'input', 'hr'].includes(n.name) || !!renderers?.[n.name] || isVisible(n.children, renderers)));

function renderTree(tree: HtmlNode[], options: RenderHTMLOptions): React.ReactNode[] {
    // Todas las imágenes en orden (onImagePress recibe la lista para un visor)
    const images: string[] = [];
    const walk = (nodes: HtmlNode[]) => nodes.forEach(n => {
        if (!isElement(n)) return;
        if (n.name === 'img' && typeof n.attrs.src === 'string' && n.attrs.src) images.push(resolveUrl(n.attrs.src, options.baseUrl));
        walk(n.children);
    });
    walk(tree);
    const ctx: Ctx = {
        opts: options, ignored: new Set((options.ignoredStyles ?? []).map(s => s.toLowerCase())), images,
        text: {}, deco: { underline: false, strike: false }, pre: false, depth: 0,
    };
    return renderBlocks(tree, ctx, 'h');
}

/**
 * Texto plano de un HTML: quita etiquetas, comentarios, <script> y <style> y decodifica las entidades
 * (&eacute;, &#233;...). Con `lineBreaks`, los párrafos, <br> y elementos de lista quedan en líneas.
 * @example htmlToText('<p>Hola&nbsp;<b>mundo</b></p>')                          // "Hola mundo"
 * @example htmlToText('<ul><li>Uno</li><li>Dos</li></ul>', { lineBreaks: true }) // "• Uno\n• Dos"
 */
export const htmlToText = (html?: string | null, { lineBreaks = false }: { lineBreaks?: boolean } = {}) => {
    if (!html) return '';
    const text = decodeHtmlEntities(stripIgnored(String(html))
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<li\b[^>]*>/gi, lineBreaks ? '\n• ' : ' ')
        .replace(/<\/(p|div|li|tr|td|th|h[1-6]|blockquote|pre|ul|ol|table|section|article|header|footer)\s*>/gi, '\n')
        .replace(/<[^>]*>/g, ''))
        .replace(/ /g, ' ');
    if (!lineBreaks) return text.replace(/\s+/g, ' ').trim();
    return text.split('\n').map(l => l.replace(/[ \t]+/g, ' ').trim()).filter(Boolean).join('\n');
};

/* ---------------- Componente ---------------- */

/** Recorta el contenido a `height` con un botón para verlo entero (solo si es más largo) */
const Collapsible = ({ height, fadeColor, readMore, readLess, _readMore, children }: {
    height: number; fadeColor?: string; readMore: string; readLess: string; _readMore?: EATextProps; children: React.ReactNode;
}) => {
    const [expanded, setExpanded] = useState(false);
    const [full, setFull] = useState(0);
    // Un margen: si solo sobran unos píxeles, mejor mostrarlo todo que poner el botón
    const long = full > height + 24;
    return (
        <>
            <View style={{ maxHeight: long && !expanded ? height : undefined, overflow: 'hidden' }}>
                <View onLayout={e => { const h = Math.round(e.nativeEvent.layout.height); setFull(f => (f === h ? f : h)) }}>{children}</View>
                {long && !expanded && fadeColor ? (
                    <Svg pointerEvents="none" width="100%" height={48} style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}>
                        <Defs>
                            <LinearGradient id="readMoreFade" x1="0" y1="0" x2="0" y2="1">
                                <Stop offset="0" stopColor={fadeColor} stopOpacity={0} />
                                <Stop offset="1" stopColor={fadeColor} stopOpacity={1} />
                            </LinearGradient>
                        </Defs>
                        <Rect x="0" y="0" width="100%" height="48" fill="url(#readMoreFade)" />
                    </Svg>
                ) : null}
            </View>
            {long && (
                <Pressable onPress={() => setExpanded(v => !v)} accessibilityRole="button" hitSlop={8} style={{ paddingVertical: 6 }}>
                    <Text color="primary.100" fontWeight="600" {..._readMore}>{expanded ? readLess : readMore}</Text>
                </Pressable>
            )}
        </>
    );
};

export const RenderHTML: React.FC<EARenderHTMLProps> = (rawProps) => {
    // Defaults → theme.components.RenderHTML → variante → props → plataforma (el variant no pasa al ScrollView)
    const [{
        html, scroll = true, _text, tagsStyles, classesStyles, renderers, baseUrl, ignoredStyles, onLinkPress, onImagePress, selectable,
        _image, _bullet, tableScroll, tableColumnWidth, emptyText, collapsedHeight, fadeColor, readMoreText, readLessText, _readMore, variant: _variant, ...props
    }] = useThemeProps<EARenderHTMLProps>('RenderHTML', rawProps, {
        defaults: { _android: { removeClippedSubviews: true }, bounces: false, overScrollMode: "never" },
    });

    // Los callbacks van por ref: si el padre los crea en cada render, no obligan a volver a parsear
    const linkRef = useRef(onLinkPress);
    linkRef.current = onLinkPress;
    const imageRef = useRef(onImagePress);
    imageRef.current = onImagePress;
    // Solo se vuelve a parsear si cambian el HTML, los estilos o los renderers, no en cada render
    // (los renderers, mejor definidos fuera del componente o con useMemo)
    const stylesKey = JSON.stringify([_text, tagsStyles, classesStyles, selectable, baseUrl, ignoredStyles, _image, _bullet, tableScroll, tableColumnWidth]);
    const hasImagePress = !!onImagePress;
    const { content, empty } = useMemo(() => {
        const tree = parseHTML(html);
        if (!isVisible(tree, renderers)) return { content: [], empty: true };
        return {
            empty: false, content: renderTree(tree, {
            _text, tagsStyles, classesStyles, renderers, baseUrl, ignoredStyles, selectable, _image, _bullet, tableScroll, tableColumnWidth,
            onLinkPress: href => (linkRef.current ? linkRef.current(href) : Linking.openURL(href).catch(() => { })),
                onImagePress: hasImagePress ? (src, info) => imageRef.current?.(src, info) : undefined,
            }),
        };
    }, [html, stylesKey, renderers, hasImagePress]);

    const body = empty
        ? (emptyText ? <Text color="silver.100" {..._text}>{emptyText}</Text> : null)
        : collapsedHeight
            ? <Collapsible height={collapsedHeight} fadeColor={fadeColor} _readMore={_readMore}
                readMore={readMoreText ?? libT('readMore')} readLess={readLessText ?? libT('readLess')}>{content}</Collapsible>
            : content;

    if (!scroll) {
        // Sin las props propias del ScrollView (removeClippedSubviews en una View puede ocultar contenido)
        const { _contentContainerStyle, bounces: _b, overScrollMode: _o, removeClippedSubviews: _r, _android, ...boxProps } = props;
        return <Box {...(boxProps as EABoxProps)} {...(_contentContainerStyle as EABoxProps)}>{body}</Box>;
    }
    return <ScrollView {...props}>{body}</ScrollView>;
};
