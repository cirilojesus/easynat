import { getLang, libT } from './translate';

const MINUTE = 60_000;
const HOUR = 3_600_000;
const DAY = 86_400_000;

/**
 * Tiempo relativo corto en el idioma actual: "ahora", "hace 5 min", "hace 3 h", "hace 2 d"; a partir de 30 días, la
 * fecha (toLocaleDateString). Acepta milisegundos, Date o un texto de fecha. Las fechas futuras cuentan como "ahora".
 * Los textos se cambian con la clave `easynat` de initTranslate (agoNow, agoMinutes, agoHours, agoDays)
 * @example ago(mensaje.createdAt);                 // "hace 5 min"
 * ago('2026-01-02T10:00:00Z', Date.now());          // "2/1/2026" (más de 30 días)
 */
export function ago(ts: number | Date | string, now: number | Date = Date.now()): string {
    const time = ts instanceof Date ? ts.getTime() : typeof ts === 'string' ? new Date(ts).getTime() : ts;
    const diff = +now - time;
    if (!Number.isFinite(diff)) return '';
    if (diff < MINUTE) return libT('agoNow');
    if (diff < HOUR) return libT('agoMinutes', { n: Math.floor(diff / MINUTE) });
    if (diff < DAY) return libT('agoHours', { n: Math.floor(diff / HOUR) });
    if (diff < 30 * DAY) return libT('agoDays', { n: Math.floor(diff / DAY) });
    return new Date(time).toLocaleDateString(getLang());
}
