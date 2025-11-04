"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useI18n = exports.subscribe = exports.t = exports.getLang = exports.setLang = exports.setLanguages = exports.initTranslate = void 0;
const react_1 = require("react");
const helpers_1 = require("./helpers");
const async_storage_1 = __importDefault(require("@react-native-async-storage/async-storage"));
const languages = { en: {}, es: {} };
let currentLang = (0, helpers_1.getDeviceLanguage)();
let translations = languages[currentLang];
let listeners = [];
const LANGUAGE_KEY = '@app_language';
const initTranslate = (languagesJSON) => {
    (async () => {
        const saved = await async_storage_1.default.getItem(LANGUAGE_KEY);
        if (saved) {
            (0, exports.setLang)(saved);
        }
        else {
            await async_storage_1.default.setItem(LANGUAGE_KEY, currentLang);
        }
    })();
    (0, exports.setLanguages)(languagesJSON);
};
exports.initTranslate = initTranslate;
const setLanguages = (languagesJSON) => {
    Object.assign(languages, languagesJSON);
    translations = languages[currentLang];
};
exports.setLanguages = setLanguages;
const setLang = async (lang) => {
    if (!languages[lang])
        return;
    currentLang = lang;
    translations = languages[lang];
    listeners.forEach(fn => fn());
    await async_storage_1.default.setItem(LANGUAGE_KEY, lang);
};
exports.setLang = setLang;
const getLang = () => currentLang;
exports.getLang = getLang;
const t = (key, params, option) => {
    let text = key.split('.').reduce((prev, curr) => prev[curr], translations) || key;
    text = text.split(' | ').reverse().reduce((prev, curr, i, arr) => {
        var _a;
        const opt = (_a = curr.split(':')) === null || _a === void 0 ? void 0 : _a[0];
        return (option === null || option === void 0 ? void 0 : option[opt]) ? curr.replace(opt + ': ', '') : (prev || arr.at(-1));
    }, '');
    if (params) {
        for (const [k, v] of Object.entries(params)) {
            text = text.replace(new RegExp(`{{${k}}}`, 'g'), String(v));
        }
    }
    return text;
};
exports.t = t;
const subscribe = (listener) => {
    listeners.push(listener);
    return () => {
        listeners = listeners.filter(fn => fn !== listener);
    };
};
exports.subscribe = subscribe;
function useI18n() {
    const lang = (0, react_1.useSyncExternalStore)(exports.subscribe, exports.getLang);
    return { t: exports.t, lang, setLang: exports.setLang, setLanguages: exports.setLanguages };
}
exports.useI18n = useI18n;
