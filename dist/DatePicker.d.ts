import React from "react";
import { EAPressableProps } from "./Pressable";
import { EATextProps } from "./Text";
import { IconProps } from "./Icon";
import { EAButtonProps } from "./Button";
import { COLOR_SCHEME } from "./theme";
export type DateDetailsType = {
    year: number | null;
    month: number | null;
    day: number | null;
    timestamp: number | null;
    hour: number | null;
    minute: number | null;
    weekday: number | null;
    iso?: string;
    format: string;
};
/** Formato de fecha: idioma, opciones de Intl y separador (lo usan formatDate y toDateDetails) */
export type DateConfigType = {
    config?: Intl.DateTimeFormatOptions;
    locale?: CommonLocale;
    /**
     * Separador entre día, mes y año: sustituye el del idioma ("/", "." o "-"). Por defecto ninguno:
     * la fecha sale tal cual la da el idioma (15/03/2026 en es, 15.03.2026 en de). false: igual que sin él. No se aplica si el mes es texto (month: "long" / "short")
     */
    separate?: string | false;
};
type DateObjectType = AtLeastOne<{
    year?: number;
    month?: number;
    day?: number;
    hour?: number;
    minute?: number;
    weekday?: number;
    start?: Date | (string & {}) | number | "today";
    end?: Date | (string & {}) | number | "today";
}>;
type AtLeastOne<T, Keys extends keyof T = keyof T> = Keys extends keyof T ? Required<Pick<T, Keys>> & Partial<Omit<T, Keys>> : never;
export type CommonLocale = "en" | "en-US" | "en-GB" | "es" | "es-ES" | "es-MX" | "fr" | "fr-FR" | "de" | "de-DE" | "it" | "pt" | "pt-BR" | "ja" | "ja-JP" | "ko" | "ko-KR" | "zh" | "zh-CN" | "zh-TW" | "ru" | "ar" | "hi" | "nl" | "sv" | "pl" | "tr" | "he" | (string & {});
export type DateUnit = 'year' | 'month' | 'day' | 'hour' | 'minute' | 'weekday';
type DateFields = Partial<Record<DateUnit, number>>;
export type DisabledDate = Date | (string & {}) | number | 'today' | DateFields;
/** 0 = domingo, 1 = lunes... 6 = sábado */
export type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type DatePickerType = EAPressableProps & DateConfigType & Intl.DateTimeFormatOptions & {
    value?: Date | (string & {}) | number | "today" | DateObjectType;
    placeholder?: string;
    onChange?: (res: DateDetailsType | {
        start: DateDetailsType;
        end: DateDetailsType;
    }) => void;
    _months?: {
        locale?: CommonLocale;
        config?: Intl.DateTimeFormatOptions["month"];
        _text?: EATextProps;
    };
    _weekdays?: {
        locale?: CommonLocale;
        config?: Intl.DateTimeFormatOptions["weekday"];
        _text?: EATextProps;
    };
    _years?: {
        locale?: CommonLocale;
        config?: Intl.DateTimeFormatOptions["year"];
        _text?: EATextProps;
    };
    _days?: {
        locale?: CommonLocale;
        config?: Intl.DateTimeFormatOptions["day"];
        _button?: EAButtonProps;
    };
    /**
     * Idioma y formato del valor elegido (el texto del campo y el `format` de onChange), si debe ser
     * distinto del resto del picker. Por defecto, `locale` y `config`
     */
    _value?: {
        locale?: CommonLocale;
        config?: Intl.DateTimeFormatOptions;
    };
    _time?: {
        locale?: CommonLocale;
        config?: {
            hour: Intl.DateTimeFormatOptions["hour"];
            minute: Intl.DateTimeFormatOptions["minute"];
            hourCycle: Intl.DateTimeFormatOptions["hourCycle"];
        };
        _text?: EATextProps;
    };
    type?: "calendar" | "date-range" | "month-year" | "month" | "year" | "time" | "weekday" | "datetime";
    colorScheme?: COLOR_SCHEME;
    _buttonCancel?: EAButtonProps;
    _buttonDone?: EAButtonProps;
    /** Muestra el botón "Limpiar": borra la fecha (onChange con null) y cierra. Por defecto no aparece */
    clearable?: boolean;
    _buttonClear?: EAButtonProps;
    unSelect?: boolean;
    minValue?: Date | (string & {}) | number | "today" | AtLeastOne<Omit<DateObjectType, "start" | "end">>;
    maxValue?: Date | (string & {}) | number | "today" | AtLeastOne<Omit<DateObjectType, "start" | "end">>;
    /** Primer día de la semana del calendario (0 domingo, 1 lunes...). Por defecto según el locale */
    firstDayOfWeek?: WeekDay;
    /**
     * Fechas, horas, días... que no se pueden elegir. Una lista o una función:
     * - Lista: una fecha concreta ('2026-12-25', Date, 'today') deshabilita ese día; un objeto, todo lo que
     *   encaje con sus campos: { weekday: 0 } los domingos, { month: 11, day: 24 } cada 24 de diciembre,
     *   { hour: 13 } la hora 13, { hour: 9, minute: 30 } las 09:30, { weekday: 6, hour: 8 } los sábados a las 8
     * - Función: (date, unit) => true para deshabilitar; unit dice qué se está decidiendo
     *   ('day', 'hour', 'minute', 'month', 'year' o 'weekday')
     */
    disabledDates?: DisabledDate[] | ((date: Date, unit: DateUnit) => boolean);
    _icon?: Partial<IconProps<any>>;
    icon?: React.ReactElement | boolean;
    label?: string;
    _label?: EATextProps;
    isFloat?: boolean;
    isRequired?: boolean;
};
/**
 * Formatea con Intl reutilizando el formateador (crearlo es lo caro, sobre todo en Android).
 * @example formatDateWith(new Date(), 'es', { weekday: 'long' }) // "miércoles"
 */
export declare const formatDateWith: (d: Date, locale: string, options: Intl.DateTimeFormatOptions) => string;
/**
 * Formatea una fecha como el valor del DatePicker. Acepta Date, timestamp, "AAAA-MM-DD" (fecha local),
 * "today" o cualquier texto que entienda Date. Devuelve "" si no es una fecha válida.
 * @example formatDate('2026-03-15', { locale: 'es' })                    // "15/03/2026"
 * @example formatDate(new Date(), { locale: 'de', separate: '-' })       // "15-03-2026"
 * @example formatDate(fecha, { locale: 'es', config: { month: 'long' } }) // "15 de marzo de 2026"
 */
export declare const formatDate: (date: Date | string | number, cfg?: DateConfigType) => string;
/** Detalles de una fecha: lo mismo que devuelve onChange (year, month, day, hour, minute, weekday, timestamp, iso, format) */
export declare const toDateDetails: (d: Date, cfg?: DateConfigType) => DateDetailsType;
/**
 * Convierte lo que acepta `value` en Date: Date, timestamp, "AAAA-MM-DD" (fecha local), "today", un objeto
 * ({ year, month, day, hour, minute } o { weekday }) o un rango ({ start, end }, devuelve { start, end }).
 * null si no es válido.
 */
export declare const parseDate: (v?: DatePickerType["value"]) => Date | {
    start: Date;
    end: Date | null;
} | null;
export declare function DatePicker(rawProps: DatePickerType): React.JSX.Element;
export {};
