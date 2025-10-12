import { BSPressableProps } from "./Pressable";
import { BSTextProps } from "./Text";
import { IconProps } from "./Icon";
import { BSButtonProps } from "./Button";
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
type DateConfigType = {
    config?: Intl.DateTimeFormatOptions;
    locale?: CommonLocale;
    separate?: string;
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
export type DatePickerType = BSPressableProps & DateConfigType & Intl.DateTimeFormatOptions & {
    value?: Date | (string & {}) | number | "today" | DateObjectType;
    placeholder?: string;
    onChange?: (res: DateDetailsType | {
        start: DateDetailsType;
        end: DateDetailsType;
    }) => void;
    _months?: {
        locale?: CommonLocale;
        config?: Intl.DateTimeFormatOptions["month"];
        _text?: BSTextProps;
    };
    _weekdays?: {
        locale?: CommonLocale;
        config?: Intl.DateTimeFormatOptions["weekday"];
        _text?: BSTextProps;
    };
    _years?: {
        locale?: CommonLocale;
        config?: Intl.DateTimeFormatOptions["year"];
        _text?: BSTextProps;
    };
    _days?: {
        locale?: CommonLocale;
        config?: Intl.DateTimeFormatOptions["day"];
        _button?: BSButtonProps;
    };
    _time?: {
        locale?: CommonLocale;
        config?: {
            hour: Intl.DateTimeFormatOptions["hour"];
            minute: Intl.DateTimeFormatOptions["minute"];
            hourCycle: Intl.DateTimeFormatOptions["hourCycle"];
        };
        _text?: BSTextProps;
    };
    type?: "calendar" | "date-range" | "month-year" | "month" | "year" | "time" | "weekday" | "datetime";
    colorScheme?: COLOR_SCHEME;
    _buttonCancel?: BSButtonProps;
    _buttonDone?: BSButtonProps;
    unSelect?: boolean;
    minValue?: Date | (string & {}) | number | "today" | AtLeastOne<Omit<DateObjectType, "start" | "end">>;
    maxValue?: Date | (string & {}) | number | "today" | AtLeastOne<Omit<DateObjectType, "start" | "end">>;
    _icon?: Partial<IconProps>;
    icon?: React.ReactElement | boolean;
    label?: string;
    _label?: BSTextProps;
    isFloat?: boolean;
    isRequired?: boolean;
};
export declare function DatePicker({ value, placeholder, onChange, _months, _weekdays, _years, _days, _time, locale, colorScheme, _buttonCancel, _buttonDone, type, unSelect, config, separate, minValue, maxValue, icon, _icon, ...props }: DatePickerType): import("react").JSX.Element;
export {};
