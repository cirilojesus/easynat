export type WatermarkPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center' | 'tile';
export type WatermarkOptions = {
    /** Texto de la marca. Varias líneas con un array o con "\n" */
    text: string | string[];
    /** Añade una línea con la fecha y hora actuales (toLocaleString). Por defecto false */
    date?: boolean;
    /** Dónde va: una esquina, el centro, o 'tile' (repetida en diagonal por toda la imagen). Por defecto 'bottom-right' */
    position?: WatermarkPosition;
    /** Tamaño del texto en px de la imagen. Por defecto el 3,5% del lado menor (se ve igual en fotos grandes y pequeñas) */
    fontSize?: number;
    /** Color del texto (cualquier color CSS, con transparencia: '#000000b3', 'rgba(255,255,255,0.6)'). Por defecto '#000000b3' */
    color?: string;
    /** Fondo detrás del texto (null: sin fondo). Por defecto '#dddddd77'. En 'tile' no se usa */
    background?: string | null;
    /** Negrita. Por defecto false */
    bold?: boolean;
    /** Separación con los bordes de la imagen y relleno del fondo, en px. Por defecto la mitad de fontSize */
    margin?: number;
    /** Giro en grados del mosaico ('tile'). Por defecto -30 */
    angle?: number;
    /** Lado mayor máximo de la imagen resultante en px (las fotos de cámara pesan mucho). Por defecto sin cambiar */
    maxSize?: number;
    /** 'jpeg' (por defecto) o 'png' */
    format?: 'jpeg' | 'png';
    /** Calidad del jpeg, de 0 a 1. Por defecto 0.9 */
    quality?: number;
    /** Cabeceras para descargar la imagen si es https (p. ej. Authorization) */
    headers?: Record<string, string>;
    /** Tiempo máximo en ms. Por defecto 30000 */
    timeout?: number;
};
export type WatermarkResult = {
    /** data:image/...;base64,... */
    dataUri: string;
    /** Solo el base64 (sin el "data:...;base64,") */
    base64: string;
    mimeType: 'image/jpeg' | 'image/png';
    width: number;
    height: number;
};
/**
 * Graba una marca de agua (texto) en una imagen y devuelve la imagen nueva. No hay que montar nada: usa un WebView
 * invisible que crea y quita ella sola (necesita react-native-webview y el ThemeProvider). Acepta file://, content://,
 * https o data:. Para guardarla como archivo, escribe `base64` con expo-file-system (u otra librería)
 * @example
 * const r = await watermarkImage(foto.uri, { text: usuario.nombre, date: true });
 * const archivo = new File(Paths.cache, 'foto.jpg'); archivo.write(r.base64, { encoding: 'base64' });
 * // Repetida en diagonal por toda la imagen
 * await watermarkImage(uri, { text: 'CONFIDENCIAL', position: 'tile', color: '#ff000040', bold: true });
 */
export declare const watermarkImage: (source: string, options: WatermarkOptions) => Promise<WatermarkResult>;
