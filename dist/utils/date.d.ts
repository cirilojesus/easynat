/**
 * Tiempo relativo corto en el idioma actual: "ahora", "hace 5 min", "hace 3 h", "hace 2 d"; a partir de 30 días, la
 * fecha (toLocaleDateString). Acepta milisegundos, Date o un texto de fecha. Las fechas futuras cuentan como "ahora".
 * Los textos se cambian con la clave `easynat` de initTranslate (agoNow, agoMinutes, agoHours, agoDays)
 * @example ago(mensaje.createdAt);                 // "hace 5 min"
 * ago('2026-01-02T10:00:00Z', Date.now());          // "2/1/2026" (más de 30 días)
 */
export declare function ago(ts: number | Date | string, now?: number | Date): string;
