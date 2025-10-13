import { useSyncExternalStore } from 'react';
import { getDeviceLanguage } from './helpers';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Lang = 'en' | 'es' | (string & {});
export type LanguagesType = Record<Lang, Record<string, any>>

const languages: LanguagesType = { en: {}, es: {} };

let currentLang: Lang = getDeviceLanguage();
let translations: Record<string, string> = languages[currentLang];
let listeners: (() => void)[] = [];

const LANGUAGE_KEY = '@app_language'

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

export const setLanguages = (languagesJSON: LanguagesType) => {
    Object.assign(languages, languagesJSON)
    translations = languages[currentLang];
}

export const setLang = async (lang: Lang) => {
    if (!languages[lang]) return;
    currentLang = lang;
    translations = languages[lang];
    listeners.forEach(fn => fn());
    await AsyncStorage.setItem(LANGUAGE_KEY, lang)
};

export const getLang = () => currentLang;

export const t = (
    key: keyof Record<string, string>,
    params?: Record<string, string | number>,
    option?: Record<string, boolean>
): string => {
    let text = key.split('.').reduce((prev, curr) => prev[curr], translations as any) || key;
    text = text.split(' | ').reverse().reduce((prev, curr, i, arr) => {
        const opt = curr.split(':')?.[0]
        return option?.[opt] ? curr.replace(opt + ': ', '') : (prev || arr.at(-1))
    }, '')
    if (params) {
        for (const [k, v] of Object.entries(params)) {
            text = text.replace(new RegExp(`{{${k}}}`, 'g'), String(v));
        }
    }
    return text;
};

export const subscribe = (listener: () => void) => {
    listeners.push(listener);
    return () => {
        listeners = listeners.filter(fn => fn !== listener);
    };
};

export function useI18n() {
    const lang = useSyncExternalStore(subscribe, getLang);
    return { t, lang, setLang, setLanguages };
}
