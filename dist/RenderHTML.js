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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RenderHTML = exports.htmlToText = exports.resolveUrl = exports.parseHTML = exports.decodeHtmlEntities = void 0;
exports.renderHTML = renderHTML;
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const react_native_svg_1 = __importStar(require("react-native-svg"));
const Button_1 = require("./Button");
const Collapse_1 = require("./Collapse");
const translate_1 = require("./utils/translate");
const ScrollView_1 = require("./ScrollView");
const Text_1 = require("./Text");
const Box_1 = require("./Box");
const useThemeProps_1 = require("./utils/useThemeProps");
/* ---------------- Entidades ---------------- */
const NAMED_ENTITIES = {
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
const decodeHtmlEntities = (text) => text.replace(/&(#x[0-9a-f]+|#\d+|[a-z][a-z0-9]*);/gi, (match, code) => {
    var _a, _c;
    if (code[0] === '#') {
        const n = code[1] === 'x' || code[1] === 'X' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
        return Number.isFinite(n) && n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : match;
    }
    return (_c = (_a = NAMED_ENTITIES[code]) !== null && _a !== void 0 ? _a : NAMED_ENTITIES[code.toLowerCase()]) !== null && _c !== void 0 ? _c : match;
});
exports.decodeHtmlEntities = decodeHtmlEntities;
/* ---------------- Parser ---------------- */
const VOID_TAGS = new Set(['br', 'img', 'input', 'hr', 'meta', 'link', 'source', 'track', 'wbr', 'area', 'base', 'col', 'embed', 'param']);
const INLINE_TAGS = new Set(['a', 'abbr', 'b', 'bdi', 'bdo', 'big', 'br', 'cite', 'code', 'data', 'del', 'dfn', 'em', 'font', 'i', 'img', 'input', 'ins', 'kbd', 'label', 'mark', 'q', 's', 'samp', 'small', 'span', 'strike', 'strong', 'sub', 'sup', 'time', 'tt', 'u', 'var']);
// Abrir uno de estos cierra el mismo que siga abierto (HTML descuidado: <li>a<li>b, <p>a<p>b)
const AUTO_CLOSE = new Set(['li', 'p', 'tr', 'td', 'th', 'option']);
const ATTR_REGEX = /([^\s"'>\/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
const parseAttributes = (str) => {
    var _a;
    const attrs = {};
    for (const [, name, dq, sq, uq] of str.matchAll(ATTR_REGEX)) {
        const value = (_a = dq !== null && dq !== void 0 ? dq : sq) !== null && _a !== void 0 ? _a : uq;
        attrs[name.toLowerCase()] = value === undefined ? true : (0, exports.decodeHtmlEntities)(value);
    }
    return attrs;
};
const stripIgnored = (html) => html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(script|style|head)\b[\s\S]*?<\/\1\s*>/gi, '');
/**
 * Convierte HTML en un árbol de nodos. Tolerante: etiquetas en mayúsculas, atributos con comillas simples
 * o sin valor, etiquetas sin cerrar o mal cerradas; ignora comentarios, <script> y <style>
 */
const parseHTML = (html) => {
    const root = { type: 'element', name: 'root', attrs: {}, children: [] };
    const stack = [root];
    const top = () => stack[stack.length - 1];
    for (const [match, closing, rawName, rawAttrs, text] of stripIgnored(String(html !== null && html !== void 0 ? html : '')).matchAll(/<(\/)?([a-zA-Z][a-zA-Z0-9-]*)([^>]*)>|([^<]+|<)/g)) {
        if (text !== undefined) {
            top().children.push({ type: 'text', text });
            continue;
        }
        const name = rawName.toLowerCase();
        if (closing) {
            // Cierra hasta la última etiqueta abierta con ese nombre (si no hay ninguna, se ignora)
            const i = stack.map(n => n.name).lastIndexOf(name);
            if (i > 0)
                stack.length = i;
            continue;
        }
        if (AUTO_CLOSE.has(name) && top().name === name)
            stack.pop();
        const node = { type: 'element', name, attrs: parseAttributes(rawAttrs), children: [] };
        top().children.push(node);
        if (!VOID_TAGS.has(name) && !match.endsWith('/>'))
            stack.push(node);
    }
    return root.children;
};
exports.parseHTML = parseHTML;
/* ---------------- CSS en línea ---------------- */
const BASE_FONT_SIZE = 14;
const FONT_SIZE_KEYWORDS = { 'xx-small': 9, 'x-small': 10, small: 12, medium: 14, large: 18, 'x-large': 24, 'xx-large': 32 };
const FONT_TAG_SIZES = { 1: 10, 2: 12, 3: 14, 4: 18, 5: 24, 6: 32, 7: 48 };
const cssLength = (value, base = BASE_FONT_SIZE) => {
    const v = value.trim().toLowerCase();
    if (v in FONT_SIZE_KEYWORDS)
        return FONT_SIZE_KEYWORDS[v];
    const m = /^(-?[\d.]+)(px|pt|em|rem|%)?$/.exec(v);
    if (!m)
        return undefined;
    const n = parseFloat(m[1]);
    switch (m[2]) {
        case 'pt': return n * 4 / 3;
        case 'em':
        case 'rem': return n * base;
        case '%': return base * n / 100;
        default: return n;
    }
};
/** style="..." → props de texto (color, fontSize...) y de caja (bg, margin, padding) */
const parseStyle = (css, ctx) => {
    var _a;
    const text = {};
    const box = {};
    if (typeof css !== 'string')
        return { text, box };
    const base = baseSize(ctx);
    for (const rule of css.split(';')) {
        const i = rule.indexOf(':');
        if (i < 0)
            continue;
        const prop = rule.slice(0, i).trim().toLowerCase();
        const value = rule.slice(i + 1).trim().replace(/\s*!important$/i, '');
        if (!value || ctx.ignored.has(prop))
            continue;
        switch (prop) {
            case 'color':
                text.color = value;
                break;
            case 'background-color':
            case 'background':
                text.bg = value;
                box.bg = value;
                break;
            case 'font-size': {
                const n = cssLength(value, base);
                if (n)
                    text.fontSize = n;
                break;
            }
            case 'font-weight':
                text.fontWeight = value === 'bold' || value === 'bolder' ? '700' : value === 'normal' || value === 'lighter' ? '400' : value;
                break;
            case 'font-style':
                text.fontStyle = value === 'italic' || value === 'oblique' ? 'italic' : 'normal';
                break;
            case 'text-decoration':
            case 'text-decoration-line':
                text.textDecorationLine = /underline/.test(value) && /line-through/.test(value) ? 'underline line-through'
                    : /underline/.test(value) ? 'underline' : /line-through/.test(value) ? 'line-through' : 'none';
                break;
            case 'text-align':
                if (['left', 'right', 'center', 'justify'].includes(value))
                    text.textAlign = value;
                break;
            case 'letter-spacing': {
                const n = value === 'normal' ? 0 : cssLength(value, base);
                if (n != null)
                    text.letterSpacing = n;
                break;
            }
            case 'line-height': {
                const n = /^[\d.]+$/.test(value) ? parseFloat(value) * ((_a = text.fontSize) !== null && _a !== void 0 ? _a : base) : cssLength(value, base);
                if (n)
                    text.lineHeight = n;
                break;
            }
            default: {
                // margin / padding (y sus lados), en px
                const m = /^(margin|padding)(?:-(top|right|bottom|left))?$/.exec(prop);
                const n = m && cssLength(value.split(/\s+/)[0], base);
                if (m && n != null)
                    box[`${m[1]}${m[2] ? m[2][0].toUpperCase() + m[2].slice(1) : ''}`] = n;
            }
        }
    }
    return { text, box };
};
/* ---------------- Estilos por defecto de cada etiqueta ---------------- */
const MONO = react_native_1.Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' });
const HEADINGS = { h1: 26, h2: 22, h3: 20, h4: 18, h5: 16, h6: 14 };
const INLINE_DEFAULTS = {
    b: { fontWeight: '700' }, strong: { fontWeight: '700' },
    i: { fontStyle: 'italic' }, em: { fontStyle: 'italic' }, cite: { fontStyle: 'italic' }, dfn: { fontStyle: 'italic' }, var: { fontStyle: 'italic' },
    a: { color: 'primary.100' },
    code: { fontFamily: MONO, bg: 'light.50' }, kbd: { fontFamily: MONO, bg: 'light.50' }, samp: { fontFamily: MONO }, tt: { fontFamily: MONO },
    mark: { bg: '#fff3a3' },
    small: { fontSize: 12 }, sub: { fontSize: 10 }, sup: { fontSize: 10 }, big: { fontSize: 18 },
};
const isElement = (n) => n.type === 'element';
const isImg = (n) => isElement(n) && n.name === 'img';
const isInline = (n) => n.type === 'text' || INLINE_TAGS.has(n.name);
const decoLine = (d) => (d.underline && d.strike ? 'underline line-through' : d.underline ? 'underline' : d.strike ? 'line-through' : undefined);
const tagStyle = (ctx, name) => { var _a; return (_a = ctx.opts.tagsStyles) === null || _a === void 0 ? void 0 : _a[name]; };
const baseSize = (ctx) => { var _a; return (typeof ((_a = ctx.opts._text) === null || _a === void 0 ? void 0 : _a.fontSize) === 'number' ? ctx.opts._text.fontSize : BASE_FONT_SIZE); };
/** tagsStyles de la etiqueta + classesStyles de sus clases (en ese orden) */
const customStyle = (ctx, node) => {
    const cls = node.attrs.class;
    const byClass = typeof cls === 'string' && ctx.opts.classesStyles ? cls.split(/\s+/).map(c => ctx.opts.classesStyles[c]) : [];
    return byClass.length ? (0, useThemeProps_1.mergeProps)(tagStyle(ctx, node.name), ...byClass) : tagStyle(ctx, node.name);
};
const openLink = (ctx, href) => (ctx.opts.onLinkPress ? ctx.opts.onLinkPress(href) : react_native_1.Linking.openURL(href).catch(() => { }));
/**
 * URL relativa → absoluta con baseUrl: "/a.png", "img/a.png", "../a.png" y "//cdn.com/a.png".
 * Las que ya tienen esquema (https:, mailto:, tel:, data:...) y las anclas (#) se quedan igual
 */
const resolveUrl = (url, base) => {
    var _a, _c;
    if (!base || !url || url.startsWith('#') || /^[a-z][a-z0-9+.-]*:/i.test(url))
        return url;
    if (url.startsWith('//'))
        return ((_c = (_a = /^([a-z][a-z0-9+.-]*:)/i.exec(base)) === null || _a === void 0 ? void 0 : _a[1]) !== null && _c !== void 0 ? _c : 'https:') + url;
    const m = /^([a-z][a-z0-9+.-]*:\/\/[^/?#]+)([^?#]*)/i.exec(base);
    if (!m)
        return url;
    if (url.startsWith('/'))
        return m[1] + url;
    const parts = [];
    for (const p of ((m[2] || '/').replace(/[^/]*$/, '') + url).split('/')) {
        if (p === '..') {
            if (parts.length > 1)
                parts.pop();
        }
        else if (p !== '.')
            parts.push(p);
    }
    return m[1] + parts.join('/');
};
exports.resolveUrl = resolveUrl;
/** Atributos con href y src completados con baseUrl */
const urlAttrs = (node, ctx) => {
    const { href, src } = node.attrs;
    if (!ctx.opts.baseUrl || (typeof href !== 'string' && typeof src !== 'string'))
        return node.attrs;
    return Object.assign(Object.assign(Object.assign({}, node.attrs), (typeof href === 'string' && { href: (0, exports.resolveUrl)(href, ctx.opts.baseUrl) })), (typeof src === 'string' && { src: (0, exports.resolveUrl)(src, ctx.opts.baseUrl) }));
};
/** Un renderer propio para la etiqueta (undefined = el de por defecto) */
const customRender = (node, ctx, key, inline, children) => {
    var _a;
    const renderer = (_a = ctx.opts.renderers) === null || _a === void 0 ? void 0 : _a[node.name];
    if (!renderer)
        return undefined;
    const out = renderer({ node, attrs: urlAttrs(node, ctx), children: children(), inline });
    return out === undefined ? undefined : <react_1.default.Fragment key={key}>{out}</react_1.default.Fragment>;
};
/** Texto plano de unos nodos (para <summary>) */
const nodesText = (nodes) => nodes.map(n => (n.type === 'text' ? (0, exports.decodeHtmlEntities)(n.text) : n.name === 'br' ? ' ' : nodesText(n.children))).join('').replace(/\s+/g, ' ').trim();
/** Imagen: con su proporción (de width/height o, si no, de la propia imagen) y sin pasar del ancho disponible */
const HtmlImage = ({ src, width, height, box, image, onPress }) => {
    const [ratio, setRatio] = (0, react_1.useState)(width && height ? width / height : null);
    (0, react_1.useEffect)(() => {
        if (ratio || !src)
            return;
        let alive = true;
        react_native_1.Image.getSize(src, (w, h) => { if (alive && h > 0)
            setRatio(w / h); }, () => { if (alive)
            setRatio(16 / 9); });
        return () => { alive = false; };
    }, [src]);
    // El estilo (_image: rounded, borde...) va en una caja del tamaño exacto de la imagen
    const img = (<Box_1.Box overflow="hidden" {...image} style={{ width: width !== null && width !== void 0 ? width : '100%', maxWidth: '100%', aspectRatio: ratio !== null && ratio !== void 0 ? ratio : 16 / 9 }}>
            <react_native_1.Image source={{ uri: src }} resizeMode="cover" style={{ width: '100%', height: '100%' }}/>
        </Box_1.Box>);
    return (<Box_1.Box my={1} alignItems="flex-start" {...box}>
            {onPress ? <react_native_1.Pressable onPress={onPress} accessibilityRole="imagebutton" style={{ width: width !== null && width !== void 0 ? width : '100%', maxWidth: '100%' }}>{img}</react_native_1.Pressable> : img}
        </Box_1.Box>);
};
/** <input type="checkbox|radio">: una caja en línea con el texto (RN admite vistas con tamaño dentro de un Text) */
const renderCheck = (node, key) => {
    if (node.attrs.type !== 'checkbox' && node.attrs.type !== 'radio')
        return null;
    const checked = node.attrs.checked != null && node.attrs.checked !== 'false';
    return (<Box_1.Box key={key} w={16} h={16} mr={4} style={{ transform: [{ translateY: 3 }] }} borderWidth={1} borderColor={checked ? 'primary.100' : 'gray.50'} bg={checked ? 'primary.100' : undefined} rounded={node.attrs.type === 'radio' ? 40 : 1} alignItems="center" justifyContent="center" _text={{ color: 'white', fontSize: 11, fontWeight: '700', lineHeight: 14 }}>
            {checked ? '✓' : ''}
        </Box_1.Box>);
};
function renderInline(node, ctx, key) {
    var _a, _c, _d;
    if (node.type === 'text')
        return node.text;
    const name = node.name;
    if (name === 'br')
        return '\n';
    if (name === 'img')
        return null; // las imágenes van como bloque (renderBlocks las saca del párrafo)
    if (name === 'input')
        return renderCheck(node, key);
    const own = customRender(node, ctx, key, true, () => node.children.map((c, i) => renderInline(c, ctx, `${key}.${i}`)));
    if (own !== undefined)
        return own;
    const style = parseStyle(node.attrs.style, ctx);
    const line = style.text.textDecorationLine;
    const deco = {
        underline: ctx.deco.underline || ((name === 'u' || name === 'ins' || name === 'a') && line !== 'none') || !!(line === null || line === void 0 ? void 0 : line.includes('underline')),
        strike: ctx.deco.strike || ['s', 'strike', 'del'].includes(name) || !!(line === null || line === void 0 ? void 0 : line.includes('line-through')),
    };
    const fontProps = name === 'font' ? Object.assign(Object.assign(Object.assign({}, (typeof node.attrs.color === 'string' && !ctx.ignored.has('color') && { color: node.attrs.color })), (node.attrs.size != null && { fontSize: (_a = FONT_TAG_SIZES[String(node.attrs.size)]) !== null && _a !== void 0 ? _a : BASE_FONT_SIZE })), (typeof node.attrs.face === 'string' && { fontFamily: node.attrs.face.split(',')[0].trim().replace(/['"]/g, '') })) : {};
    const props = (0, useThemeProps_1.mergeProps)(INLINE_DEFAULTS[name], fontProps, style.text, customStyle(ctx, node), { textDecorationLine: decoLine(deco) });
    const inner = Object.assign(Object.assign({}, ctx), { deco });
    const href = name === 'a' && typeof node.attrs.href === 'string' ? (0, exports.resolveUrl)(node.attrs.href, ctx.opts.baseUrl) : undefined;
    // Subíndice y superíndice: en RN un Text no tiene vertical-align, así que van en una vista en línea desplazada
    // (dentro de la vista no se hereda el estilo del párrafo: se le pasa)
    if (name === 'sub' || name === 'sup') {
        const base = (0, useThemeProps_1.mergeProps)(ctx.opts._text, ctx.text);
        const size = typeof base.fontSize === 'number' ? base.fontSize : baseSize(ctx);
        return (<react_native_1.View key={key} style={{ transform: [{ translateY: name === 'sup' ? -size * 0.38 : size * 0.22 }] }}>
                <Text_1.Text {...base} {...props} lineHeight={undefined} fontSize={(_d = (_c = customStyle(ctx, node)) === null || _c === void 0 ? void 0 : _c.fontSize) !== null && _d !== void 0 ? _d : Math.round(size * 0.72)}>{node.children.map((c, i) => renderInline(c, inner, `${key}.${i}`))}</Text_1.Text>
            </react_native_1.View>);
    }
    return (<Text_1.Text key={key} {...props} {...(href && { accessibilityRole: 'link', onPress: () => openLink(ctx, href) })}>
            {name === 'q' && '“'}
            {node.children.map((c, i) => renderInline(c, inner, `${key}.${i}`))}
            {name === 'q' && '”'}
        </Text_1.Text>);
}
/** Espacios como en HTML: los saltos y la sangría del código se juntan en un espacio (salvo en <pre>) */
const normalizeRun = (run, pre) => {
    const decode = (n) => n.type === 'text'
        ? { type: 'text', text: (0, exports.decodeHtmlEntities)(pre ? n.text : n.text.replace(/[ \t\r\n\f]+/g, ' ')) }
        : Object.assign(Object.assign({}, n), { children: n.children.map(decode) });
    const out = run.map(decode);
    if (pre)
        return out;
    // Sin espacios al principio ni al final del párrafo, ni junto a un <br>
    const trimEdge = (nodes, end) => {
        const n = nodes[end ? nodes.length - 1 : 0];
        if (!n)
            return;
        if (n.type === 'text')
            nodes[end ? nodes.length - 1 : 0] = { type: 'text', text: end ? n.text.replace(/ +$/, '') : n.text.replace(/^ +/, '') };
        else if (n.name !== 'br')
            trimEdge(n.children, end);
    };
    trimEdge(out, false);
    trimEdge(out, true);
    out.forEach((n, i) => {
        if (!isElement(n) || n.name !== 'br')
            return;
        if (out[i - 1])
            trimEdge([out[i - 1]], true);
        if (out[i + 1])
            trimEdge([out[i + 1]], false);
    });
    return out;
};
const hasContent = (nodes) => nodes.some(n => (n.type === 'text' ? n.text.trim() !== '' : n.name === 'br' || n.name === 'input' || hasContent(n.children)));
/** Saca las imágenes de dentro de un enlace o un span: en RN una imagen no puede ir en medio de un texto */
const splitImages = (n) => {
    if (!isElement(n))
        return { inline: n, images: [] };
    const images = [];
    const children = n.children.flatMap(c => {
        if (isImg(c)) {
            images.push(c);
            return [];
        }
        const r = splitImages(c);
        images.push(...r.images);
        return [r.inline];
    });
    return { inline: Object.assign(Object.assign({}, n), { children }), images };
};
function renderBlocks(nodes, ctx, key) {
    const out = [];
    let run = [];
    // Texto y etiquetas en línea seguidos van en un mismo <Text>: así un párrafo con negritas o enlaces fluye
    const flush = () => {
        if (run.length && (ctx.pre || hasContent(run))) {
            const k = `${key}.t${out.length}`;
            out.push(<Text_1.Text key={k} selectable={ctx.opts.selectable} {...(0, useThemeProps_1.mergeProps)(ctx.opts._text, ctx.text, { textDecorationLine: decoLine(ctx.deco) })}>
                    {normalizeRun(run, ctx.pre).map((n, i) => renderInline(n, ctx, `${k}.${i}`))}
                </Text_1.Text>);
        }
        run = [];
    };
    nodes.forEach((n, i) => {
        if (isImg(n)) {
            flush();
            out.push(renderBlock(n, ctx, `${key}.${i}`));
        }
        else if (isInline(n)) {
            const { inline, images } = splitImages(n);
            run.push(inline);
            if (images.length) {
                flush();
                images.forEach((img, j) => out.push(renderBlock(img, ctx, `${key}.${i}.img${j}`)));
            }
        }
        else {
            flush();
            out.push(renderBlock(n, ctx, `${key}.${i}`));
        }
    });
    flush();
    return out;
}
function renderBlock(node, ctx, key) {
    var _a;
    const name = node.name;
    const style = parseStyle(node.attrs.style, ctx);
    const custom = customStyle(ctx, node);
    const align = typeof node.attrs.align === 'string' ? { textAlign: node.attrs.align } : {};
    // Lo heredan sus párrafos (el fondo no: ya lo pinta la caja)
    const withText = (extra) => (Object.assign(Object.assign({}, ctx), { text: (0, useThemeProps_1.mergeProps)(ctx.text, extra, align, Object.assign(Object.assign({}, style.text), { bg: undefined }), custom) }));
    const children = (c = withText()) => renderBlocks(node.children, c, key);
    const box = Object.assign(Object.assign({}, style.box), custom);
    const own = customRender(node, ctx, key, false, () => children());
    if (own !== undefined)
        return own;
    switch (name) {
        case 'h1':
        case 'h2':
        case 'h3':
        case 'h4':
        case 'h5':
        case 'h6':
            return <Box_1.Box key={key} mt={2} mb={1} {...box}>{children(withText({ fontSize: HEADINGS[name], fontWeight: '700' }))}</Box_1.Box>;
        case 'p':
            return <Box_1.Box key={key} mb={2} {...box}>{children()}</Box_1.Box>;
        case 'blockquote':
            return (<Box_1.Box key={key} borderLeftWidth={3} borderColor="light.200" pl={3} my={2} {...box}>
                    {children(withText({ color: 'gray', fontStyle: 'italic' }))}
                </Box_1.Box>);
        case 'pre':
            return (<Box_1.Box key={key} bg="light.50" p={3} rounded={1} my={2} {...box}>
                    {renderBlocks(node.children, Object.assign(Object.assign({}, withText({ fontFamily: MONO, fontSize: 13 })), { pre: true }), key)}
                </Box_1.Box>);
        case 'hr':
            return <Box_1.Box key={key} style={{ height: react_native_1.StyleSheet.hairlineWidth }} bg="light.200" my={3} {...box}/>;
        case 'ul':
        case 'ol': {
            const start = Number(node.attrs.start) || 1;
            let n = 0;
            const inner = Object.assign(Object.assign({}, withText()), { depth: ctx.depth + 1 });
            return (<Box_1.Box key={key} pl={ctx.depth ? 3 : 0} mb={ctx.depth ? 0 : 2} {...box}>
                    {node.children.map((li, i) => {
                    if (!isElement(li) || li.name !== 'li')
                        return hasContent([li]) ? renderBlocks([li], inner, `${key}.${i}`) : null;
                    const marker = name === 'ol' ? `${start + n++}.` : ctx.depth % 2 ? '◦' : '•';
                    // Lista de tareas (la del RichTextEditor): <ul class="checklist"><li data-checked="true">
                    const isTask = name === 'ul' && typeof node.attrs.class === 'string' && /(^|\s)checklist(\s|$)/.test(node.attrs.class);
                    const done = li.attrs['data-checked'] === 'true';
                    const liStyle = parseStyle(li.attrs.style, ctx);
                    const liText = (0, useThemeProps_1.mergeProps)(inner.text, Object.assign(Object.assign({}, liStyle.text), { bg: undefined }));
                    return (<Box_1.Box key={`${key}.${i}`} flexDir="row" mb={1} {...liStyle.box} {...customStyle(ctx, li)}>
                                {isTask
                            ? <Box_1.Box w={22} mr={6} pt={0.5} alignItems="flex-end">{renderCheck({ type: 'element', name: 'input', attrs: Object.assign({ type: 'checkbox' }, (done && { checked: true })), children: [] }, `${key}.${i}.c`)}</Box_1.Box>
                            : <Text_1.Text w={22} textAlign="right" mr={6} {...(0, useThemeProps_1.mergeProps)(ctx.opts._text, liText, ctx.opts._bullet)}>{marker}</Text_1.Text>}
                                {/* flex 1: si no, un texto largo se sale de la pantalla */}
                                <Box_1.Box flex={1}>{renderBlocks(li.children, Object.assign(Object.assign({}, inner), { text: liText }), `${key}.${i}`)}</Box_1.Box>
                            </Box_1.Box>);
                })}
                </Box_1.Box>);
        }
        case 'img': {
            const src = typeof node.attrs.src === 'string' ? (0, exports.resolveUrl)(node.attrs.src, ctx.opts.baseUrl) : '';
            if (!src)
                return null;
            const num = (v) => (typeof v === 'string' && /^\d+(px)?$/.test(v) ? parseInt(v, 10) : undefined);
            const onImagePress = ctx.opts.onImagePress;
            return (<HtmlImage key={key} src={src} width={num(node.attrs.width)} height={num(node.attrs.height)} box={box} image={ctx.opts._image} onPress={onImagePress && (() => onImagePress(src, { index: Math.max(0, ctx.images.indexOf(src)), images: ctx.images }))}/>);
        }
        case 'details': {
            // Desplegable con Collapse: el <summary> es el botón y el resto, el contenido
            const summary = node.children.find(c => isElement(c) && c.name === 'summary');
            const rest = node.children.filter(c => c !== summary);
            return (<Collapse_1.Collapse key={key} my={1} {...box} defaultOpen={node.attrs.open != null && node.attrs.open !== 'false'} trigger={props => (<Button_1.Button {...props} variant="ghost" justifyContent="space-between" px={0} {...tagStyle(ctx, 'summary')}>
                            {summary ? nodesText(summary.children) || '…' : '…'}
                        </Button_1.Button>)}>
                    {renderBlocks(rest, withText(), key)}
                </Collapse_1.Collapse>);
        }
        case 'table': {
            const table = <Box_1.Box borderWidth={1} borderColor="light.200" {...(ctx.opts.tableScroll === false && { my: 2 })} {...box}>{children()}</Box_1.Box>;
            if (ctx.opts.tableScroll === false)
                return <react_1.default.Fragment key={key}>{table}</react_1.default.Fragment>;
            // Si las columnas caben, minWidth 100% hace que ocupe el ancho; si no, se desplaza de lado
            return (<react_native_1.ScrollView key={key} horizontal showsHorizontalScrollIndicator nestedScrollEnabled style={{ marginVertical: 8 }} contentContainerStyle={{ minWidth: '100%' }}>
                    <react_native_1.View style={{ flex: 1 }}>{table}</react_native_1.View>
                </react_native_1.ScrollView>);
        }
        case 'tr':
            return <Box_1.Box key={key} flexDir="row" borderBottomWidth={react_native_1.StyleSheet.hairlineWidth} borderColor="light.200" {...box}>{children()}</Box_1.Box>;
        case 'td':
        case 'th': {
            const span = Number(node.attrs.colspan) || 1;
            return (<Box_1.Box key={key} flex={span} p={1.5} {...(ctx.opts.tableScroll !== false && { minW: ((_a = ctx.opts.tableColumnWidth) !== null && _a !== void 0 ? _a : 100) * span })} {...box}>
                    {children(withText(name === 'th' ? { fontWeight: '700' } : undefined))}
                </Box_1.Box>);
        }
        default:
            // div, section, article, thead, tbody, li suelto... (y las desconocidas): un bloque con sus hijos
            return <Box_1.Box key={key} {...box}>{children()}</Box_1.Box>;
    }
}
/**
 * Convierte HTML en elementos de React Native (para usarlo sin el componente).
 * @example <View>{renderHTML('<p>Hola <b>mundo</b></p>')}</View>
 */
function renderHTML(html, options = {}) {
    return renderTree((0, exports.parseHTML)(html), options);
}
/** ¿Se vería algo? Texto, imágenes, casillas, <hr> o etiquetas con renderer propio */
const isVisible = (nodes, renderers) => nodes.some(n => (n.type === 'text'
    ? (0, exports.decodeHtmlEntities)(n.text).trim() !== ''
    : ['img', 'input', 'hr'].includes(n.name) || !!(renderers === null || renderers === void 0 ? void 0 : renderers[n.name]) || isVisible(n.children, renderers)));
function renderTree(tree, options) {
    var _a;
    // Todas las imágenes en orden (onImagePress recibe la lista para un visor)
    const images = [];
    const walk = (nodes) => nodes.forEach(n => {
        if (!isElement(n))
            return;
        if (n.name === 'img' && typeof n.attrs.src === 'string' && n.attrs.src)
            images.push((0, exports.resolveUrl)(n.attrs.src, options.baseUrl));
        walk(n.children);
    });
    walk(tree);
    const ctx = {
        opts: options, ignored: new Set(((_a = options.ignoredStyles) !== null && _a !== void 0 ? _a : []).map(s => s.toLowerCase())), images,
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
const htmlToText = (html, { lineBreaks = false } = {}) => {
    if (!html)
        return '';
    const text = (0, exports.decodeHtmlEntities)(stripIgnored(String(html))
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<li\b[^>]*>/gi, lineBreaks ? '\n• ' : ' ')
        .replace(/<\/(p|div|li|tr|td|th|h[1-6]|blockquote|pre|ul|ol|table|section|article|header|footer)\s*>/gi, '\n')
        .replace(/<[^>]*>/g, ''))
        .replace(/ /g, ' ');
    if (!lineBreaks)
        return text.replace(/\s+/g, ' ').trim();
    return text.split('\n').map(l => l.replace(/[ \t]+/g, ' ').trim()).filter(Boolean).join('\n');
};
exports.htmlToText = htmlToText;
/* ---------------- Componente ---------------- */
/** Recorta el contenido a `height` con un botón para verlo entero (solo si es más largo) */
const Collapsible = ({ height, fadeColor, readMore, readLess, _readMore, children }) => {
    const [expanded, setExpanded] = (0, react_1.useState)(false);
    const [full, setFull] = (0, react_1.useState)(0);
    // Un margen: si solo sobran unos píxeles, mejor mostrarlo todo que poner el botón
    const long = full > height + 24;
    return (<>
            <react_native_1.View style={{ maxHeight: long && !expanded ? height : undefined, overflow: 'hidden' }}>
                <react_native_1.View onLayout={e => { const h = Math.round(e.nativeEvent.layout.height); setFull(f => (f === h ? f : h)); }}>{children}</react_native_1.View>
                {long && !expanded && fadeColor ? (<react_native_svg_1.default pointerEvents="none" width="100%" height={48} style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}>
                        <react_native_svg_1.Defs>
                            <react_native_svg_1.LinearGradient id="readMoreFade" x1="0" y1="0" x2="0" y2="1">
                                <react_native_svg_1.Stop offset="0" stopColor={fadeColor} stopOpacity={0}/>
                                <react_native_svg_1.Stop offset="1" stopColor={fadeColor} stopOpacity={1}/>
                            </react_native_svg_1.LinearGradient>
                        </react_native_svg_1.Defs>
                        <react_native_svg_1.Rect x="0" y="0" width="100%" height="48" fill="url(#readMoreFade)"/>
                    </react_native_svg_1.default>) : null}
            </react_native_1.View>
            {long && (<react_native_1.Pressable onPress={() => setExpanded(v => !v)} accessibilityRole="button" hitSlop={8} style={{ paddingVertical: 6 }}>
                    <Text_1.Text color="primary.100" fontWeight="600" {..._readMore}>{expanded ? readLess : readMore}</Text_1.Text>
                </react_native_1.Pressable>)}
        </>);
};
const RenderHTML = (rawProps) => {
    // Defaults → theme.components.RenderHTML → variante → props → plataforma (el variant no pasa al ScrollView)
    const [_a] = (0, useThemeProps_1.useThemeProps)('RenderHTML', rawProps, {
        defaults: { _android: { removeClippedSubviews: true }, bounces: false, overScrollMode: "never" },
    }), { html, scroll = true, _text, tagsStyles, classesStyles, renderers, baseUrl, ignoredStyles, onLinkPress, onImagePress, selectable, _image, _bullet, tableScroll, tableColumnWidth, emptyText, collapsedHeight, fadeColor, readMoreText, readLessText, _readMore, variant: _variant } = _a, props = __rest(_a, ["html", "scroll", "_text", "tagsStyles", "classesStyles", "renderers", "baseUrl", "ignoredStyles", "onLinkPress", "onImagePress", "selectable", "_image", "_bullet", "tableScroll", "tableColumnWidth", "emptyText", "collapsedHeight", "fadeColor", "readMoreText", "readLessText", "_readMore", "variant"]);
    // Los callbacks van por ref: si el padre los crea en cada render, no obligan a volver a parsear
    const linkRef = (0, react_1.useRef)(onLinkPress);
    linkRef.current = onLinkPress;
    const imageRef = (0, react_1.useRef)(onImagePress);
    imageRef.current = onImagePress;
    // Solo se vuelve a parsear si cambian el HTML, los estilos o los renderers, no en cada render
    // (los renderers, mejor definidos fuera del componente o con useMemo)
    const stylesKey = JSON.stringify([_text, tagsStyles, classesStyles, selectable, baseUrl, ignoredStyles, _image, _bullet, tableScroll, tableColumnWidth]);
    const hasImagePress = !!onImagePress;
    const { content, empty } = (0, react_1.useMemo)(() => {
        const tree = (0, exports.parseHTML)(html);
        if (!isVisible(tree, renderers))
            return { content: [], empty: true };
        return {
            empty: false, content: renderTree(tree, {
                _text, tagsStyles, classesStyles, renderers, baseUrl, ignoredStyles, selectable, _image, _bullet, tableScroll, tableColumnWidth,
                onLinkPress: href => (linkRef.current ? linkRef.current(href) : react_native_1.Linking.openURL(href).catch(() => { })),
                onImagePress: hasImagePress ? (src, info) => { var _a; return (_a = imageRef.current) === null || _a === void 0 ? void 0 : _a.call(imageRef, src, info); } : undefined,
            }),
        };
    }, [html, stylesKey, renderers, hasImagePress]);
    const body = empty
        ? (emptyText ? <Text_1.Text color="silver.100" {..._text}>{emptyText}</Text_1.Text> : null)
        : collapsedHeight
            ? <Collapsible height={collapsedHeight} fadeColor={fadeColor} _readMore={_readMore} readMore={readMoreText !== null && readMoreText !== void 0 ? readMoreText : (0, translate_1.libT)('readMore')} readLess={readLessText !== null && readLessText !== void 0 ? readLessText : (0, translate_1.libT)('readLess')}>{content}</Collapsible>
            : content;
    if (!scroll) {
        // Sin las props propias del ScrollView (removeClippedSubviews en una View puede ocultar contenido)
        const { _contentContainerStyle, bounces: _b, overScrollMode: _o, removeClippedSubviews: _r, _android } = props, boxProps = __rest(props, ["_contentContainerStyle", "bounces", "overScrollMode", "removeClippedSubviews", "_android"]);
        return <Box_1.Box {...boxProps} {..._contentContainerStyle}>{body}</Box_1.Box>;
    }
    return <ScrollView_1.ScrollView {...props}>{body}</ScrollView_1.ScrollView>;
};
exports.RenderHTML = RenderHTML;
