export type Lang = 'en' | 'es' | (string & {});
export type LanguagesType = Record<Lang, Record<string, any>>;
export declare const initTranslate: (languagesJSON: LanguagesType) => void;
export declare const setLanguages: (languagesJSON: LanguagesType) => void;
export declare const setLang: (lang: Lang) => Promise<void>;
export declare const getLang: () => Lang;
export declare const t: (key: keyof Record<string, string>, params?: Record<string, string | number>, option?: Record<string, boolean>) => string;
export declare const subscribe: (listener: () => void) => () => void;
export declare function useI18n(): {
    t: (key: string, params?: Record<string, string | number>, option?: Record<string, boolean>) => string;
    lang: Lang;
    setLang: (lang: Lang) => Promise<void>;
    setLanguages: (languagesJSON: LanguagesType) => void;
};
