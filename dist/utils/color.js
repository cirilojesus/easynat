"use strict";
// Ayudas de color (públicas)
Object.defineProperty(exports, "__esModule", { value: true });
exports.readableColor = exports.withAlpha = void 0;
/** Normaliza #rgb / #rrggbb / #rrggbbaa a 6 dígitos (sin #); null si no es un hex */
const hex6 = (hex) => {
    if (typeof hex !== 'string' || hex[0] !== '#')
        return null;
    let h = hex.slice(1);
    if (h.length === 3 || h.length === 4)
        h = h.split('').map(x => x + x).join('');
    return /^[0-9a-f]{6}/i.test(h) ? h.slice(0, 6) : null;
};
/**
 * El mismo color con otra transparencia (0-1). Si no es un hex, se devuelve tal cual
 * @example withAlpha('#4F46E5', 0.12) // '#4F46E51f'
 */
const withAlpha = (hex, alpha) => {
    const h = hex6(hex);
    return h ? `#${h}${Math.round(Math.max(0, Math.min(1, alpha)) * 255).toString(16).padStart(2, '0')}` : hex;
};
exports.withAlpha = withAlpha;
/**
 * Negro o blanco, el que mejor se lea encima de ese color (p. ej. el texto de un botón o una etiqueta)
 * @example readableColor('#facc15') // '#111111'
 */
const readableColor = (hex, dark = '#111111', light = '#ffffff') => {
    const h = hex6(hex);
    if (!h)
        return light;
    const n = parseInt(h, 16);
    return (0.299 * (n >> 16 & 255) + 0.587 * (n >> 8 & 255) + 0.114 * (n & 255)) / 255 > 0.6 ? dark : light;
};
exports.readableColor = readableColor;
