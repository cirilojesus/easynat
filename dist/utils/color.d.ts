/**
 * El mismo color con otra transparencia (0-1). Si no es un hex, se devuelve tal cual
 * @example withAlpha('#4F46E5', 0.12) // '#4F46E51f'
 */
export declare const withAlpha: (hex: string, alpha: number) => string;
/**
 * Negro o blanco, el que mejor se lea encima de ese color (p. ej. el texto de un botón o una etiqueta)
 * @example readableColor('#facc15') // '#111111'
 */
export declare const readableColor: (hex: string, dark?: string, light?: string) => string;
