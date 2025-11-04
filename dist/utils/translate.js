import { useSyncExternalStore } from 'react';
import { getDeviceLanguage } from './helpers';
import AsyncStorage from '@react-native-async-storage/async-storage';
const languages = { en: {}, es: {} };
let currentLang = getDeviceLanguage();
let translations = languages[currentLang];
let listeners = [];
const LANGUAGE_KEY = '@app_language';
export const initTranslate = (languagesJSON) => {
    (async () => {
        const saved = await AsyncStorage.getItem(LANGUAGE_KEY);
        if (saved) {
            setLang(saved);
        }
        else {
            await AsyncStorage.setItem(LANGUAGE_KEY, currentLang);
        }
    })();
    setLanguages(languagesJSON);
};
export const setLanguages = (languagesJSON) => {
    Object.assign(languages, languagesJSON);
    translations = languages[currentLang];
};
export const setLang = async (lang) => {
    if (!languages[lang])
        return;
    currentLang = lang;
    translations = languages[lang];
    listeners.forEach(fn => fn());
    await AsyncStorage.setItem(LANGUAGE_KEY, lang);
};
export const getLang = () => currentLang;
export const t = (key, params, option) => {
    let text = key.split('.').reduce((prev, curr) => prev[curr], translations) || key;
    text = text.split(' | ').reverse().reduce((prev, curr, i, arr) => {
        const opt = curr.split(':')?.[0];
        return option?.[opt] ? curr.replace(opt + ': ', '') : (prev || arr.at(-1));
    }, '');
    if (params) {
        for (const [k, v] of Object.entries(params)) {
            text = text.replace(new RegExp(`{{${k}}}`, 'g'), String(v));
        }
    }
    return text;
};
export const subscribe = (listener) => {
    listeners.push(listener);
    return () => {
        listeners = listeners.filter(fn => fn !== listener);
    };
};
export function useI18n() {
    const lang = useSyncExternalStore(subscribe, getLang);
    return { t, lang, setLang, setLanguages };
}
