export type Lang = 'en' | 'es' | (string & {});
export type LanguagesType = Record<Lang, Record<string, any>>;
declare const LIB_TEXTS: {
    en: {
        required: string;
        email: string;
        number: string;
        minLength: string;
        pattern: string;
        maxLength: string;
        phone: string;
        url: string;
        integer: string;
        positive: string;
        min: string;
        max: string;
        sameAs: string;
        alpha: string;
        alphanumeric: string;
        minItems: string;
        maxItems: string;
        fileTypes: string;
        maxFileSize: string;
        cancel: string;
        done: string;
        clear: string;
        noData: string;
        others: string;
        readMore: string;
        readLess: string;
        normal: string;
        heading: string;
        fontSmall: string;
        fontNormal: string;
        fontLarge: string;
        fontHuge: string;
        insertLink: string;
        linkUrl: string;
        linkText: string;
        removeLink: string;
        textColor: string;
        highlight: string;
        noColor: string;
        insertImage: string;
        imageUrl: string;
        table: string;
        insertTable: string;
        addRow: string;
        addColumn: string;
        deleteRow: string;
        deleteColumn: string;
        deleteTable: string;
        lineHeight: string;
        letterSpacing: string;
        pageRange: string;
        filters: string;
        clearFilters: string;
        apply: string;
        loading: string;
        noResults: string;
        loadError: string;
        cropHint: string;
        typeText: string;
        discardHint: string;
        pixelate: string;
        blur: string;
        pickColor: string;
        pickHint: string;
        fillHint: string;
        fillInside: string;
        fillByColor: string;
        exposure: string;
        brightness: string;
        contrast: string;
        saturation: string;
        vibrance: string;
        warmth: string;
        tint: string;
        highlights: string;
        shadows: string;
        vignette: string;
        pdfPassword: string;
        wrongPassword: string;
        password: string;
        open: string;
        pdfError: string;
        search: string;
        slideToConfirm: string;
        holdHint: string;
        retry: string;
        loadMore: string;
        total: string;
        select: string;
    };
    es: {
        required: string;
        email: string;
        number: string;
        minLength: string;
        pattern: string;
        maxLength: string;
        phone: string;
        url: string;
        integer: string;
        positive: string;
        min: string;
        max: string;
        sameAs: string;
        alpha: string;
        alphanumeric: string;
        minItems: string;
        maxItems: string;
        fileTypes: string;
        maxFileSize: string;
        cancel: string;
        done: string;
        clear: string;
        noData: string;
        others: string;
        readMore: string;
        readLess: string;
        normal: string;
        heading: string;
        fontSmall: string;
        fontNormal: string;
        fontLarge: string;
        fontHuge: string;
        insertLink: string;
        linkUrl: string;
        linkText: string;
        removeLink: string;
        textColor: string;
        highlight: string;
        noColor: string;
        insertImage: string;
        imageUrl: string;
        table: string;
        insertTable: string;
        addRow: string;
        addColumn: string;
        deleteRow: string;
        deleteColumn: string;
        deleteTable: string;
        lineHeight: string;
        letterSpacing: string;
        pageRange: string;
        filters: string;
        clearFilters: string;
        apply: string;
        loading: string;
        noResults: string;
        loadError: string;
        cropHint: string;
        typeText: string;
        discardHint: string;
        pixelate: string;
        blur: string;
        pickColor: string;
        pickHint: string;
        fillHint: string;
        fillInside: string;
        fillByColor: string;
        exposure: string;
        brightness: string;
        contrast: string;
        saturation: string;
        vibrance: string;
        warmth: string;
        tint: string;
        highlights: string;
        shadows: string;
        vignette: string;
        pdfPassword: string;
        wrongPassword: string;
        password: string;
        open: string;
        pdfError: string;
        search: string;
        slideToConfirm: string;
        holdHint: string;
        retry: string;
        loadMore: string;
        total: string;
        select: string;
    };
};
export type LibTextKey = keyof typeof LIB_TEXTS['en'];
/**
 * Carga las traducciones de la app (una vez, al arrancar). Cada idioma es un objeto con tus textos; las claves pueden
 * ir anidadas y se leen con puntos (t('perfil.titulo')). Dentro de `easynat` se cambian los textos de la librería
 * (validaciones, botones de los selectores…). Recupera el idioma guardado la última vez; si no hay, usa el del dispositivo
 * @example initTranslate({
 *     es: { hola: 'Hola, {{nombre}}', perfil: { titulo: 'Mi perfil' }, easynat: { required: 'Obligatorio' } },
 *     en: { hola: 'Hello, {{nombre}}', perfil: { titulo: 'My profile' } },
 * });
 */
export declare const initTranslate: (languagesJSON: LanguagesType) => void;
/**
 * Añade o cambia traducciones sin tocar el idioma elegido (p. ej. textos que llegan del servidor). Se mezclan con las
 * que ya hay por idioma
 * @example setLanguages({ es: { promo: 'Envío gratis hoy' } });
 */
export declare const setLanguages: (languagesJSON: LanguagesType) => void;
/**
 * Cambia el idioma de la app y lo recuerda para la próxima vez. Los componentes que usan useI18n() (y los textos de la
 * librería) se actualizan solos. Si el idioma no está cargado, no hace nada
 * @example setLang('en');
 */
export declare const setLang: (lang: Lang) => Promise<void>;
/**
 * El idioma actual ('es', 'en'…)
 * @example if (getLang() === 'es') …
 */
export declare const getLang: () => Lang;
/**
 * El texto de una clave en el idioma actual (si no existe, devuelve la clave). `params` rellena los {{huecos}}.
 * Un texto puede tener variantes separadas por " | " ("texto normal | nombre: otro texto"): `option` elige la que
 * venga a true; sin ninguna, se usa la primera
 * @example t('hola', { nombre: 'Ana' });                 // 'Hola, {{nombre}}' → "Hola, Ana"
 * t('mensajes', { n }, { uno: n === 1 });                // 'Tienes {{n}} mensajes | uno: Tienes un mensaje'
 */
export declare const t: (key: keyof Record<string, string>, params?: Record<string, string | number>, option?: Record<string, boolean>) => string;
/** Textos internos de la librería (los que cambias con la clave `easynat` en initTranslate). Para tu app, usa t() */
export declare const libT: (key: LibTextKey, params?: Record<string, string | number>) => string;
export declare const subscribe: (listener: () => void) => () => void;
/**
 * Hook: t, el idioma actual y cómo cambiarlo. El componente se vuelve a pintar cuando cambia el idioma
 * @example const { t, lang, setLang } = useI18n();
 * <Button onPress={() => setLang(lang === 'es' ? 'en' : 'es')}>{t('cambiarIdioma')}</Button>
 */
export declare function useI18n(): {
    t: (key: keyof Record<string, string>, params?: Record<string, string | number>, option?: Record<string, boolean>) => string;
    lang: Lang;
    setLang: (lang: Lang) => Promise<void>;
    setLanguages: (languagesJSON: LanguagesType) => void;
};
export {};
