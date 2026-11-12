"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ago = ago;
const translate_1 = require("./translate");
const MINUTE = 60000;
const HOUR = 3600000;
const DAY = 86400000;
/**
 * Tiempo relativo corto en el idioma actual: "ahora", "hace 5 min", "hace 3 h", "hace 2 d"; a partir de 30 días, la
 * fecha (toLocaleDateString). Acepta milisegundos, Date o un texto de fecha. Las fechas futuras cuentan como "ahora".
 * Los textos se cambian con la clave `easynat` de initTranslate (agoNow, agoMinutes, agoHours, agoDays)
 * @example ago(mensaje.createdAt);                 // "hace 5 min"
 * ago('2026-01-02T10:00:00Z', Date.now());          // "2/1/2026" (más de 30 días)
 */
function ago(ts, now = Date.now()) {
    const time = ts instanceof Date ? ts.getTime() : typeof ts === 'string' ? new Date(ts).getTime() : ts;
    const diff = +now - time;
    if (!Number.isFinite(diff))
        return '';
    if (diff < MINUTE)
        return (0, translate_1.libT)('agoNow');
    if (diff < HOUR)
        return (0, translate_1.libT)('agoMinutes', { n: Math.floor(diff / MINUTE) });
    if (diff < DAY)
        return (0, translate_1.libT)('agoHours', { n: Math.floor(diff / HOUR) });
    if (diff < 30 * DAY)
        return (0, translate_1.libT)('agoDays', { n: Math.floor(diff / DAY) });
    return new Date(time).toLocaleDateString((0, translate_1.getLang)());
}
