import { useSyncExternalStore } from 'react';
import { getDeviceLanguage } from './helpers';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Lang = 'en' | 'es' | (string & {});
export type LanguagesType = Record<Lang, Record<string, any>>

const languages: LanguagesType = { en: {}, es: {} };

let currentLang: Lang = getDeviceLanguage();
let translations: Record<string, any> = languages[currentLang] || {};
let listeners: (() => void)[] = [];

const LANGUAGE_KEY = '@app_language'

// Textos internos de la librería. Se pueden sobrescribir con la clave `easynat` en cada idioma:
// initTranslate({ es: { easynat: { done: 'Listo' } } })
const LIB_TEXTS = {
    en: {
        required: 'Required field',
        email: 'Invalid email',
        number: 'Must be a numeric value',
        minLength: 'Minimum length is {{min}}',
        pattern: 'The value does not match the expected format.',
        maxLength: 'Maximum length is {{max}}',
        phone: 'Invalid phone number',
        url: 'Invalid URL',
        integer: 'Must be a whole number',
        positive: 'Must be greater than 0',
        min: 'Minimum value is {{min}}',
        max: 'Maximum value is {{max}}',
        sameAs: 'Values do not match',
        alpha: 'Only letters are allowed',
        alphanumeric: 'Only letters and numbers are allowed',
        minItems: 'Select at least {{min}}',
        maxItems: 'Select at most {{max}}',
        fileTypes: 'File type not allowed ({{types}})',
        maxFileSize: 'File is too large (max {{size}})',
        cancel: 'Cancel',
        done: 'Done',
        clear: 'Clear',
        noData: 'No data',
        others: 'Others',
        readMore: 'Read more',
        readLess: 'Read less',
        normal: 'Normal',
        heading: 'Heading {{n}}',
        fontSmall: 'Small',
        fontNormal: 'Normal',
        fontLarge: 'Large',
        fontHuge: 'Huge',
        insertLink: 'Insert link',
        linkUrl: 'URL',
        linkText: 'Text',
        removeLink: 'Remove',
        textColor: 'Text color',
        highlight: 'Highlight',
        noColor: 'No color',
        insertImage: 'Insert image',
        imageUrl: 'Image URL',
        table: 'Table',
        insertTable: 'Table {{size}}',
        addRow: 'Add row',
        addColumn: 'Add column',
        deleteRow: 'Delete row',
        deleteColumn: 'Delete column',
        deleteTable: 'Delete table',
        lineHeight: 'Line spacing',
        letterSpacing: 'Letter spacing',
        pageRange: '{{from}}–{{to}} of {{total}}',
        filters: 'Filters',
        clearFilters: 'Clear filters',
        apply: 'Apply',
        loading: 'Loading…',
        noResults: 'No results',
        loadError: 'Could not load',
        cropHint: 'Drag to select the area to keep',
        typeText: 'Type something…',
        discardHint: 'Press back again to discard the changes',
        pixelate: 'Pixelate',
        blur: 'Blur',
        pickColor: 'Pick from the photo',
        pickHint: 'Tap the photo to pick a color',
        fillHint: 'Tap an area to fill it',
        fillInside: 'Inside the drawing',
        fillByColor: 'By color of the photo',
        exposure: 'Exposure',
        brightness: 'Brightness',
        contrast: 'Contrast',
        saturation: 'Saturation',
        vibrance: 'Vibrance',
        warmth: 'Warmth',
        tint: 'Tint',
        highlights: 'Highlights',
        shadows: 'Shadows',
        vignette: 'Vignette',
        pdfPassword: 'This PDF is password protected',
        wrongPassword: 'Wrong password',
        password: 'Password',
        open: 'Open',
        pdfError: 'Could not open the PDF',
        search: 'Search',
        slideToConfirm: 'Slide to confirm',
        holdHint: 'Press and hold to confirm',
        retry: 'Retry',
        loadMore: 'Load more',
        total: 'Total',
        select: '- SELECT -',
    },
    es: {
        required: 'Campo requerido',
        email: 'Correo inválido',
        number: 'Debe ser un valor numérico',
        minLength: 'El mínimo es de {{min}} valores',
        pattern: 'El valor no coincide con el formato esperado.',
        maxLength: 'El máximo es de {{max}} caracteres',
        phone: 'Teléfono no válido',
        url: 'URL no válida',
        integer: 'Debe ser un número entero',
        positive: 'Debe ser mayor que 0',
        min: 'El valor mínimo es {{min}}',
        max: 'El valor máximo es {{max}}',
        sameAs: 'Los valores no coinciden',
        alpha: 'Solo se permiten letras',
        alphanumeric: 'Solo se permiten letras y números',
        minItems: 'Elige al menos {{min}}',
        maxItems: 'Elige como máximo {{max}}',
        fileTypes: 'Tipo de archivo no permitido ({{types}})',
        maxFileSize: 'El archivo es demasiado grande (máx. {{size}})',
        cancel: 'Cancelar',
        done: 'Aceptar',
        clear: 'Limpiar',
        noData: 'Sin datos',
        others: 'Otros',
        readMore: 'Leer más',
        readLess: 'Leer menos',
        normal: 'Normal',
        heading: 'Título {{n}}',
        fontSmall: 'Pequeño',
        fontNormal: 'Normal',
        fontLarge: 'Grande',
        fontHuge: 'Enorme',
        insertLink: 'Insertar enlace',
        linkUrl: 'URL',
        linkText: 'Texto',
        removeLink: 'Quitar',
        textColor: 'Color del texto',
        highlight: 'Resaltado',
        noColor: 'Sin color',
        insertImage: 'Insertar imagen',
        imageUrl: 'URL de la imagen',
        table: 'Tabla',
        insertTable: 'Tabla {{size}}',
        addRow: 'Añadir fila',
        addColumn: 'Añadir columna',
        deleteRow: 'Eliminar fila',
        deleteColumn: 'Eliminar columna',
        deleteTable: 'Eliminar tabla',
        lineHeight: 'Interlineado',
        letterSpacing: 'Espaciado',
        pageRange: '{{from}}–{{to}} de {{total}}',
        filters: 'Filtros',
        clearFilters: 'Limpiar filtros',
        apply: 'Aplicar',
        loading: 'Cargando…',
        noResults: 'Sin resultados',
        loadError: 'No se pudo cargar',
        cropHint: 'Arrastra para elegir la zona que quieres conservar',
        typeText: 'Escribe algo…',
        discardHint: 'Pulsa atrás otra vez para descartar los cambios',
        pixelate: 'Pixelar',
        blur: 'Desenfocar',
        pickColor: 'Tomar de la foto',
        pickHint: 'Toca la foto para tomar un color',
        fillHint: 'Toca una zona para rellenarla',
        fillInside: 'Dentro de lo dibujado',
        fillByColor: 'Por el color de la foto',
        exposure: 'Exposición',
        brightness: 'Brillo',
        contrast: 'Contraste',
        saturation: 'Saturación',
        vibrance: 'Intensidad',
        warmth: 'Calidez',
        tint: 'Tinte',
        highlights: 'Luces',
        shadows: 'Sombras',
        vignette: 'Viñeta',
        pdfPassword: 'Este PDF tiene contraseña',
        wrongPassword: 'Contraseña incorrecta',
        password: 'Contraseña',
        open: 'Abrir',
        pdfError: 'No se pudo abrir el PDF',
        search: 'Buscar',
        slideToConfirm: 'Desliza para confirmar',
        holdHint: 'Mantén pulsado para confirmar',
        retry: 'Reintentar',
        loadMore: 'Cargar más',
        total: 'Total',
        select: '- SELECCIONE -',
    },
};

export type LibTextKey = keyof typeof LIB_TEXTS['en'];

const interpolate = (text: string, params?: Record<string, string | number>) => {
    if (params) {
        for (const [k, v] of Object.entries(params)) {
            text = text.replace(new RegExp(`{{${k}}}`, 'g'), String(v));
        }
    }
    return text;
};

/**
 * Carga las traducciones de la app (una vez, al arrancar). Cada idioma es un objeto con tus textos; las claves pueden
 * ir anidadas y se leen con puntos (t('perfil.titulo')). Dentro de `easynat` se cambian los textos de la librería
 * (validaciones, botones de los selectores…). Recupera el idioma guardado la última vez; si no hay, usa el del dispositivo
 * @example initTranslate({
 *     es: { hola: 'Hola, {{nombre}}', perfil: { titulo: 'Mi perfil' }, easynat: { required: 'Obligatorio' } },
 *     en: { hola: 'Hello, {{nombre}}', perfil: { titulo: 'My profile' } },
 * });
 */
export const initTranslate = (languagesJSON: LanguagesType) => {
    (async () => {
        const saved = await AsyncStorage.getItem(LANGUAGE_KEY);
        if (saved) {
            setLang(saved);
        } else {
            await AsyncStorage.setItem(LANGUAGE_KEY, currentLang)
        }
    })()
    setLanguages(languagesJSON)
}

/**
 * Añade o cambia traducciones sin tocar el idioma elegido (p. ej. textos que llegan del servidor). Se mezclan con las
 * que ya hay por idioma
 * @example setLanguages({ es: { promo: 'Envío gratis hoy' } });
 */
export const setLanguages = (languagesJSON: LanguagesType) => {
    Object.assign(languages, languagesJSON)
    translations = languages[currentLang] || {};
}

/**
 * Cambia el idioma de la app y lo recuerda para la próxima vez. Los componentes que usan useI18n() (y los textos de la
 * librería) se actualizan solos. Si el idioma no está cargado, no hace nada
 * @example setLang('en');
 */
export const setLang = async (lang: Lang) => {
    if (!languages[lang]) return;
    currentLang = lang;
    translations = languages[lang];
    listeners.forEach(fn => fn());
    await AsyncStorage.setItem(LANGUAGE_KEY, lang)
};

/**
 * El idioma actual ('es', 'en'…)
 * @example if (getLang() === 'es') …
 */
export const getLang = () => currentLang;

/**
 * El texto de una clave en el idioma actual (si no existe, devuelve la clave). `params` rellena los {{huecos}}.
 * Un texto puede tener variantes separadas por " | " ("texto normal | nombre: otro texto"): `option` elige la que
 * venga a true; sin ninguna, se usa la primera
 * @example t('hola', { nombre: 'Ana' });                 // 'Hola, {{nombre}}' → "Hola, Ana"
 * t('mensajes', { n }, { uno: n === 1 });                // 'Tienes {{n}} mensajes | uno: Tienes un mensaje'
 */
export const t = (
    key: keyof Record<string, string>,
    params?: Record<string, string | number>,
    option?: Record<string, boolean>
): string => {
    const value = key.split('.').reduce((prev, curr) => prev?.[curr], translations as any);
    let text: string = typeof value === 'string' ? value : key;
    text = text.split(' | ').reverse().reduce((prev, curr, i, arr) => {
        const opt = curr.split(':')?.[0]
        return option?.[opt] ? curr.replace(opt + ': ', '') : (prev || arr.at(-1))
    }, '')
    return interpolate(text, params);
};

/** Textos internos de la librería (los que cambias con la clave `easynat` en initTranslate). Para tu app, usa t() */
export const libT = (key: LibTextKey, params?: Record<string, string | number>): string => {
    const custom = translations?.easynat?.[key];
    const text = typeof custom === 'string' ? custom : (LIB_TEXTS[currentLang] || LIB_TEXTS.en)[key];
    return interpolate(text, params);
};

export const subscribe = (listener: () => void) => {
    listeners.push(listener);
    return () => {
        listeners = listeners.filter(fn => fn !== listener);
    };
};

/**
 * Hook: t, el idioma actual y cómo cambiarlo. El componente se vuelve a pintar cuando cambia el idioma
 * @example const { t, lang, setLang } = useI18n();
 * <Button onPress={() => setLang(lang === 'es' ? 'en' : 'es')}>{t('cambiarIdioma')}</Button>
 */
export function useI18n() {
    const lang = useSyncExternalStore(subscribe, getLang);
    return { t, lang, setLang, setLanguages };
}
