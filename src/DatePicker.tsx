import React, { useState, useRef, useEffect, useMemo, useCallback, memo } from "react";
import { EAPressableProps, Pressable } from "./Pressable";
import { EATextProps, Text } from "./Text";
import { Icon, IconProps } from "./Icon";
import { EAModalRef, Modal } from "./Modal";
import { Box, EABoxProps } from "./Box";
import { EAButtonProps, Button } from "./Button";
import { COLOR_SCHEME } from "./theme";
import { FlatList } from "./FlatList";
import { View } from "react-native";
import { Menu } from "./Menu";
import { Label, LabelRef } from "./Label";
import { useThemeProps } from "./utils/useThemeProps";
import { libT } from "./utils/translate";

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
}>

type AtLeastOne<T, Keys extends keyof T = keyof T> =
    Keys extends keyof T
    ? Required<Pick<T, Keys>> & Partial<Omit<T, Keys>>
    : never;

export type CommonLocale = "en" | "en-US" | "en-GB" | "es" | "es-ES" | "es-MX"
    | "fr" | "fr-FR" | "de" | "de-DE" | "it" | "pt" | "pt-BR"
    | "ja" | "ja-JP" | "ko" | "ko-KR" | "zh" | "zh-CN" | "zh-TW"
    | "ru" | "ar" | "hi" | "nl" | "sv" | "pl" | "tr" | "he" | (string & {});

export type DateUnit = 'year' | 'month' | 'day' | 'hour' | 'minute' | 'weekday';
type DateFields = Partial<Record<DateUnit, number>>;
export type DisabledDate = Date | (string & {}) | number | 'today' | DateFields;

/** 0 = domingo, 1 = lunes... 6 = sábado */
export type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type DatePickerType = EAPressableProps & DateConfigType & Intl.DateTimeFormatOptions & {
    value?: Date | (string & {}) | number | "today" | DateObjectType;
    placeholder?: string;
    onChange?: (res: DateDetailsType | { start: DateDetailsType, end: DateDetailsType }) => void;
    _months?: { locale?: CommonLocale; config?: Intl.DateTimeFormatOptions["month"]; _text?: EATextProps };
    _weekdays?: { locale?: CommonLocale; config?: Intl.DateTimeFormatOptions["weekday"]; _text?: EATextProps };
    _years?: { locale?: CommonLocale; config?: Intl.DateTimeFormatOptions["year"]; _text?: EATextProps };
    _days?: { locale?: CommonLocale; config?: Intl.DateTimeFormatOptions["day"]; _button?: EAButtonProps };
    /**
     * Idioma y formato del valor elegido (el texto del campo y el `format` de onChange), si debe ser
     * distinto del resto del picker. Por defecto, `locale` y `config`
     */
    _value?: { locale?: CommonLocale; config?: Intl.DateTimeFormatOptions };
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
    icon?: React.ReactElement | boolean,
    label?: string;
    _label?: EATextProps,
    isFloat?: boolean;
    isRequired?: boolean;
};

/* ---------------- Formateo (con caché) ---------------- */

// Crear un Intl.DateTimeFormat es caro (sobre todo en Android con Hermes) y toLocaleString crea uno nuevo
// en cada llamada: se crea uno por locale + opciones y se reutiliza
const formatters = new Map<string, any>();
const cached = <F,>(key: string, create: () => F): F => {
    let f = formatters.get(key) as F | undefined;
    if (!f) {
        f = create();
        formatters.set(key, f as any);
    }
    return f;
};
const dateFormatter = (locale: string, options: Intl.DateTimeFormatOptions) =>
    cached('d' + locale + JSON.stringify(options), () => new Intl.DateTimeFormat(locale, options));
const formatWith = (d: Date, locale: string, options: Intl.DateTimeFormatOptions) => dateFormatter(locale, options).format(d);
/**
 * Formatea con Intl reutilizando el formateador (crearlo es lo caro, sobre todo en Android).
 * @example formatDateWith(new Date(), 'es', { weekday: 'long' }) // "miércoles"
 */
export const formatDateWith = formatWith;

/**
 * Número con los dígitos del idioma (minutos). Intl.DateTimeFormat ignora minute: "2-digit" si se
 * formatea solo el minuto (da "5"), y rellenar con padStart mezclaba un "0" latino ("0٥" en árabe)
 */
const formatNumber = (n: number, locale: string, digits = 2) =>
    cached('n' + locale + digits, () => new Intl.NumberFormat(locale, { minimumIntegerDigits: digits, useGrouping: false })).format(n);

/**
 * Unidades de hora y minuto del idioma para las listas (ja 時 / 分, ko 시 / 분, th นาฬิกา / นาที), sacadas de
 * su formato de hora completo ("8時05分00秒"). null si el idioma usa ":" (es, en, zh, ar...) o el motor no lo soporta
 */
const timeUnits = (locale: string): { hour: string; minute: string } | null => cached('u' + locale, () => {
    try {
        const parts = new Intl.DateTimeFormat(locale, { timeStyle: 'full', hourCycle: 'h23' } as Intl.DateTimeFormatOptions)
            .formatToParts(new Date(2000, 0, 1, 8, 5, 0));
        const after = (type: string) => {
            const i = parts.findIndex(p => p.type === type);
            return i >= 0 && parts[i + 1]?.type === 'literal' ? parts[i + 1].value : '';
        };
        const hour = after('hour');
        return !hour || /^[\s:.]*$/.test(hour) ? null : { hour: hour.trimEnd(), minute: after('minute').trimEnd() };
    } catch {
        return null;
    }
});

const DATE_PARTS = new Set(['day', 'month', 'year']);
const withLocale = (locale: string, cfg: DateConfigType): DateConfigType => ({ ...cfg, locale });

/**
 * Formatea una fecha como el valor del DatePicker. Acepta Date, timestamp, "AAAA-MM-DD" (fecha local),
 * "today" o cualquier texto que entienda Date. Devuelve "" si no es una fecha válida.
 * @example formatDate('2026-03-15', { locale: 'es' })                    // "15/03/2026"
 * @example formatDate(new Date(), { locale: 'de', separate: '-' })       // "15-03-2026"
 * @example formatDate(fecha, { locale: 'es', config: { month: 'long' } }) // "15 de marzo de 2026"
 */
export const formatDate = (date: Date | string | number, cfg?: DateConfigType) => {
    const d = date instanceof Date ? date : parseDate(date as DatePickerType['value']);
    if (!(d instanceof Date) || isNaN(d.getTime())) return '';
    const options: Intl.DateTimeFormatOptions = { day: "2-digit", month: "2-digit", year: "numeric", ...(cfg?.config || {}) };
    const f = dateFormatter(cfg?.locale || "en-US", options);
    const sep = cfg?.separate;
    // Sin separador propio, con el mes en texto ("15 de marzo"), o sin formatToParts: tal cual lo da el idioma
    if (!sep || ['long', 'short', 'narrow'].includes(options.month as string) || !f.formatToParts) return f.format(d);
    // Se sustituye lo que hay ENTRE día, mes y año ("/", "." o "-" según el idioma), no el resto (", 14:30")
    const parts = f.formatToParts(d);
    return parts.map((p, i) => {
        if (p.type !== 'literal') return p.value;
        const prevDate = DATE_PARTS.has(parts[i - 1]?.type);
        const next = parts[i + 1];
        if (prevDate && next && DATE_PARTS.has(next.type)) return sep;
        // Punto final de la fecha en algunos idiomas ("2026. 03. 15." en coreano): sobra con otro separador
        if (prevDate && /^[.\s]+$/.test(p.value)) return next ? ' ' : '';
        return p.value;
    }).join('');
};

/** Detalles de una fecha: lo mismo que devuelve onChange (year, month, day, hour, minute, weekday, timestamp, iso, format) */
export const toDateDetails = (d: Date, cfg?: DateConfigType): DateDetailsType => toDetails(d, cfg);

const toDetails = (d: Date, cfg?: DateConfigType): DateDetailsType => ({
    year: d.getFullYear(),
    month: d.getMonth(),
    day: d.getDate(),
    hour: d.getHours(),
    minute: d.getMinutes(),
    weekday: d.getDay(),
    timestamp: d.getTime(),
    iso: d.toISOString(),
    format: formatDate(d, cfg),
});

/**
 * Convierte lo que acepta `value` en Date: Date, timestamp, "AAAA-MM-DD" (fecha local), "today", un objeto
 * ({ year, month, day, hour, minute } o { weekday }) o un rango ({ start, end }, devuelve { start, end }).
 * null si no es válido.
 */
export const parseDate = (v?: DatePickerType['value']): Date | { start: Date; end: Date | null } | null => {
    // Va primero: typeof null === 'object', y `"year" in null` lanza TypeError
    if (v === null || v === undefined || v === '') return null
    if (typeof v === 'object' && ("year" in v || "month" in v || "day" in v || "hour" in v || "weekday" in v || "minute" in v)) {
        // Solo weekday (0 domingo... 6 sábado): el 1 de enero de 2012 fue domingo, así que es el día weekday + 1
        if (v.day == null && v.weekday != null) return new Date(2012, 0, 1 + v.weekday, v.hour ?? 0, v.minute ?? 0)
        return new Date(
            v.year ?? 2012,
            v.month ?? 0,
            v.day ?? 1,
            v.hour ?? 0,
            v.minute ?? 0,
        )
    } else if (typeof v == 'object' && ('start' in v || 'end' in v)) {
        const start = parseDate(v.start) as Date | null
        const end = parseDate(v.end) as Date | null
        if (!start && !end) return null
        return start ? { start, end } : { start: end, end: null }
    }
    // "AAAA-MM-DD" sin hora: new Date() lo toma como UTC y, al oeste de Greenwich (toda América),
    // queda en el día anterior. Se interpreta como fecha local
    const dateOnly = typeof v === 'string' && /^(\d{4})-(\d{2})-(\d{2})$/.exec(v)
    const d = v == "today" ? new Date()
        : dateOnly ? new Date(+dateOnly[1], +dateOnly[2] - 1, +dateOnly[3])
            : new Date(v as any)
    return isNaN(d.getTime()) ? null : d
}

const DAY_MS = 86400000;
const startOfDay = (y: number, m: number, d: number) => new Date(y, m, d).getTime();

// Locales cuya semana empieza en domingo (el resto, en lunes)
const SUNDAY_FIRST = ['en-US', 'en', 'en-CA', 'ja', 'ja-JP', 'ko', 'ko-KR', 'zh', 'zh-CN', 'zh-TW', 'he', 'pt-BR', 'hi'];
const defaultFirstDay = (locale: string): WeekDay => (SUNDAY_FIRST.includes(locale) ? 0 : 1);

/* ---------------- Límites (minValue / maxValue) ---------------- */

type PickerType = NonNullable<DatePickerType['type']>;
const HOUR_MS = 3600000;
const MIN_MS = 60000;

/**
 * Valor comparable de una fecha según el tipo: cada picker se limita en su unidad (en `time`, la hora del
 * día; en `month`, el mes; en `month-year`, año y mes; en `weekday`, el día de la semana...)
 */
const keyOf = (type: PickerType, d: DateDetailsType) => {
    switch (type) {
        case 'time': return d.hour! * 60 + d.minute!;
        case 'year': return d.year!;
        case 'month': return d.month!;
        case 'month-year': return d.year! * 12 + d.month!;
        case 'weekday': return d.weekday!;
        default: return d.timestamp!;
    }
};

/* ---------------- disabledDates ---------------- */

/** Patrones: una fecha concreta es su día (año, mes y día); un objeto, sus campos tal cual */
const toMatchers = (list?: DisabledDate[]): DateFields[] => (list ?? []).map(v => {
    if (v && typeof v === 'object' && !(v instanceof Date)) return v as DateFields;
    const d = parseDate(v as DatePickerType['value']);
    return d instanceof Date ? { year: d.getFullYear(), month: d.getMonth(), day: d.getDate() } : {};
}).filter(m => Object.keys(m).length > 0);

/**
 * ¿La opción encaja con algún patrón? Solo cuenta un patrón si la opción tiene todos sus campos: { hour: 13 }
 * deshabilita la hora 13 pero no días enteros; { weekday: 0 } los domingos del calendario y de la lista
 */
const matchesAny = (matchers: DateFields[], fields: DateFields) =>
    matchers.some(m => (Object.keys(m) as DateUnit[]).every(k => fields[k] !== undefined && fields[k] === m[k]));

const dayFields = (y: number, m: number, d: number): DateFields => ({ year: y, month: m, day: d, weekday: new Date(y, m, d).getDay() });

/** ¿El intervalo [from, to] toca el rango permitido [min, max]? */
const overlaps = (from: number, to: number, min?: number, max?: number) => (min == null || to >= min) && (max == null || from <= max);

/* ---------------- Piezas ---------------- */

type Option = { value: number; label: string; disabled?: boolean };
const ITEM_HEIGHT = 42;
const itemLayout = (_: any, i: number) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * i, index: i });

/**
 * Rango de números que crece por los dos extremos al llegar a ellos (lista "infinita" de años).
 * Si el valor se sale del rango (p. ej. con las flechas), se vuelve a centrar en él
 */
const CHUNK = 60;
const useInfiniteRange = (center: number, min = 1, max = 9999) => {
    const around = (c: number) => ({ from: Math.max(min, c - CHUNK), to: Math.min(max, c + CHUNK) });
    const [range, setRange] = useState(() => around(center));
    useEffect(() => {
        if (center < range.from || center > range.to) setRange(around(center));
    }, [center]);
    const values = useMemo(() => Array.from({ length: Math.max(range.to - range.from + 1, 0) }, (_, i) => range.from + i), [range]);
    return {
        values,
        onStartReached: () => range.from > min && setRange(r => ({ ...r, from: Math.max(min, r.from - CHUNK) })),
        onEndReached: () => range.to < max && setRange(r => ({ ...r, to: Math.min(max, r.to + CHUNK) })),
    };
};

// Props de FlatList para listas de alto fijo: abre en la opción elegida y, si es infinita, crece sin saltos
// `anchor`: dónde se coloca al abrir si no hay nada elegido (p. ej. el año que se está viendo)
const listProps = (options: Option[], selected: number | null | undefined, infinite?: { onStartReached: () => void; onEndReached: () => void }, anchor?: number | null) => {
    const index = options.findIndex(o => o.value === (selected ?? anchor));
    return {
        keyExtractor: (o: Option) => String(o.value),
        getItemLayout: itemLayout,
        initialScrollIndex: index > 2 ? index - 2 : 0,
        initialNumToRender: 12,
        windowSize: 5,
        ...(infinite && {
            onStartReached: infinite.onStartReached,
            onEndReached: infinite.onEndReached,
            // Al añadir años arriba, la lista se queda donde estaba (sin saltos)
            maintainVisibleContentPosition: { minIndexForVisible: 0 },
        }),
    };
};

const OptionButton = ({ option, selected, colorScheme, onPress }: { option: Option; selected: boolean; colorScheme: COLOR_SCHEME; onPress: () => void }) => (
    <Button h={ITEM_HEIGHT} rounded={0} variant={selected ? "solid" : "ghost"} colorScheme={colorScheme} disabled={option.disabled} onPress={onPress}>
        {option.label}
    </Button>
);

/** Lista de opciones (pickers de año, mes, hora, minuto, día de la semana) */
const OptionList = ({ options, selected, anchor, onChange, colorScheme, height = 365, infinite }: {
    options: Option[]; selected?: number | null; anchor?: number | null; onChange: (value: number) => void;
    colorScheme: COLOR_SCHEME; height?: number | 'auto'; infinite?: { onStartReached: () => void; onEndReached: () => void };
}) => (
    <FlatList
        data={options}
        // En fila (año + mes, hora + minuto) se reparten el ancho; con alto automático, sin flex
        flex={height === 'auto' ? undefined : 1}
        style={height === 'auto' ? undefined : { height }}
        contentContainerStyle={{ paddingHorizontal: 8 }}
        {...listProps(options, selected, infinite, anchor)}
        renderItem={({ item }) => <OptionButton option={item} selected={selected === item.value} colorScheme={colorScheme} onPress={() => onChange(item.value)} />}
    />
);

/** Texto del selector (año, mes, hora, minuto) que abre un menú con la lista para elegir rápido */
const PickerMenu = ({ label, options, selected, onSelect, colorScheme, infinite }: {
    label: string; options: Option[]; selected: number; onSelect: (value: number) => void;
    colorScheme: COLOR_SCHEME; infinite?: { onStartReached: () => void; onEndReached: () => void };
}) => (
    <Menu
        useTriggerWidth
        _trigger={{ flex: 1 }}
        trigger={({ onPress }) => (
            <Pressable onPress={onPress} alignItems="center" justifyContent="center" py={1.5} rounded={1} _pressed={{ bg: 'light.50' }}>
                <Text fontWeight="500">{label}</Text>
            </Pressable>
        )}
        data={options}
        renderItem={({ item, close }) => (
            <OptionButton option={item} selected={selected === item.value} colorScheme={colorScheme} onPress={() => { onSelect(item.value); close(); }} />
        )}
        _contentStyle={{ maxH: 280, ...listProps(options, selected, infinite) } as any}
    />
);

/** Flechas + valor en medio (el valor puede ser un menú para elegir de una lista) */
function Stepper({ label, menu, onPrev, onNext, prevDisabled, nextDisabled, colorScheme, iconLeft, iconRight, ...props }: {
    label: string;
    menu?: Omit<React.ComponentProps<typeof PickerMenu>, 'label' | 'colorScheme'>;
    onPrev: () => void;
    onNext: () => void;
    prevDisabled?: boolean;
    nextDisabled?: boolean;
    colorScheme: COLOR_SCHEME;
    iconLeft?: React.ReactElement<IconProps<any>>;
    iconRight?: React.ReactElement<IconProps<any>>;
} & EABoxProps) {
    return (
        <Box flexDir="row" alignItems="center" flex={1} {...props}>
            <Button variant="ghost" colorScheme={colorScheme} rounded={40} icon={iconLeft || <Icon name="minus" as="AntDesign" />}
                disabled={prevDisabled} onPress={onPrev} />
            {menu
                ? <PickerMenu label={label} colorScheme={colorScheme} {...menu} />
                : <Text flex={1} textAlign="center">{label}</Text>}
            <Button variant="ghost" colorScheme={colorScheme} rounded={40} icon={iconRight || <Icon name="plus" as="AntDesign" />}
                disabled={nextDisabled} onPress={onNext} />
        </Box>
    );
}

type DayStatus = 'edge' | 'range' | 'none';

/** Un día del calendario. Memorizado: al elegir un día solo se repintan los que cambian de estado */
const DayCell = memo(({ day, label, status, disabled, colorScheme, button, onPress }: {
    day: number; label: string; status: DayStatus; disabled: boolean; colorScheme: COLOR_SCHEME;
    button?: EAButtonProps; onPress: (day: number) => void;
}) => (
    <Button
        colorScheme={colorScheme}
        variant={status === 'edge' ? "solid" : status === 'range' ? "outline" : "ghost"}
        w={'11%'}
        mx="1.5%"
        my={1}
        px={1}
        py={10}
        borderWidth={1}
        borderColor={status === 'range' ? undefined : "transparent"}
        disabled={disabled}
        _text={{ color: status === 'edge' ? "white.100" : "dark.100", textAlign: "center", numberOfLines: 1 }}
        {...button}
        onPress={() => onPress(day)}
    >
        {label}
    </Button>
));

/**
 * Cuadrícula del mes: filas de 7, con el día 1 en la columna de su día de la semana. Sin FlatList
 * (sin scroll no aporta nada y pintaba los días por tandas): se pinta entero en un frame.
 */
const CalendarGrid = memo(({ year, month, firstDay, dayLabels, isEdge, isDayDisabled, rangeStart, rangeEnd, lo, hi, colorScheme, button, onDay }: {
    year: number; month: number; firstDay: WeekDay; dayLabels: string[];
    isEdge: (day: number) => boolean; isDayDisabled: (y: number, m: number, d: number) => boolean; rangeStart?: number; rangeEnd?: number;
    lo?: number; hi?: number; colorScheme: COLOR_SCHEME; button?: EAButtonProps; onDay: (day: number) => void;
}) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const offset = (new Date(year, month, 1).getDay() - firstDay + 7) % 7;
    const cells: (number | null)[] = [...Array(offset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
    while (cells.length % 7) cells.push(null);

    const rows: (number | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));

    return (
        <Box p={2}>
            {rows.map((row, r) => (
                <Box key={r} flexDir="row">
                    {row.map((day, c) => {
                        if (day == null) return <Box key={c} w="11%" mx="1.5%" />;
                        const ts = startOfDay(year, month, day);
                        const status: DayStatus = isEdge(day) ? 'edge'
                            : rangeStart != null && rangeEnd != null && ts > rangeStart && ts < rangeEnd ? 'range' : 'none';
                        return (
                            <DayCell key={c} day={day} label={dayLabels[day - 1]} status={status}
                                // Por día completo: con minValue="today" el día de hoy se puede elegir
                                disabled={!overlaps(ts, ts + DAY_MS - 1, lo, hi) || isDayDisabled(year, month, day)}
                                colorScheme={colorScheme} button={button} onPress={onDay} />
                        );
                    })}
                </Box>
            ))}
        </Box>
    );
});

/* ---------------- DatePicker ---------------- */

export function DatePicker(rawProps: DatePickerType) {
    // Defaults → theme.components.DatePicker → variante → props → plataforma
    // (locale, colorScheme, type, separate... también se pueden definir en el tema)
    let [{
        locale = "en-US",
        placeholder,
        colorScheme = "primary",
        type = "calendar",
        unSelect = false,
        separate,
        icon = true,
        variant: _variant,
        // Props del DatePicker: no pasan al botón
        label, _label, isRequired, value, onChange, _months, _weekdays, _years, _days, _time,
        _buttonCancel, _buttonDone, clearable, _buttonClear, disabledDates, config: configProp, minValue, maxValue, _icon, isFloat, firstDayOfWeek, _value,
        ...pressableProps
    }] = useThemeProps<DatePickerType>('DatePicker', rawProps);

    // Formato del valor elegido: _value (locale y config) sobre locale y config
    const config = { ...configProp, ..._value?.config };
    const valueLocale = _value?.locale || locale;
    const defaultCfg: DateConfigType = withLocale(valueLocale, type === "month-year" ? { locale, separate, config: { day: undefined, ...config } }
        : type === "datetime" ? { locale, separate, config: { hour: "2-digit", minute: "2-digit", hourCycle: "h23", ...config } }
            : type === "year" ? { locale, separate, config: { day: undefined, month: undefined, ...config } }
                : type === "month" ? { locale, separate, config: { day: undefined, year: undefined, month: 'long', ...config } }
                    : type === "time" ? { locale, separate, config: { day: undefined, year: undefined, month: undefined, hour: "2-digit", minute: "2-digit", hourCycle: "h23", ...config } }
                        : type === 'weekday' ? { locale, separate, config: { day: undefined, year: undefined, month: undefined, weekday: 'long', ...config } }
                            : { locale, separate, config });

    placeholder = placeholder || (type === "month-year" ? '0000-00'
        : type === "datetime" ? '0000-00-00 00:00'
            : type === "year" ? '0000'
                : type === "month" ? libT('select')
                    : type === 'date-range' ? '0000-00-00 - 0000-00-00'
                        : type === 'time' ? '00:00'
                            : type === 'weekday' ? libT('select')
                                : "0000-00-00")

    const limit = (v: DatePickerType['minValue']) => {
        const d = parseDate(v)
        return d instanceof Date ? toDetails(d) : null
    }

    // Solo los tipos sin hora se llevan a las 00:00 (datetime y time conservan la hora)
    const keepsTime = type === "datetime" || type === "time";

    const initDatePicker = () => {
        const d = parseDate(value) || new Date;
        const startDate = d instanceof Date ? d : d.start;
        const endDate = d instanceof Date ? null : d.end;
        if (!keepsTime) {
            startDate.setHours(0, 0, 0, 0)
            endDate?.setHours(0, 0, 0, 0)
        };
        const start = toDetails(startDate, defaultCfg);
        const end = endDate && toDetails(endDate, defaultCfg);
        if (!value) {
            return {
                confirmed: type === "date-range" ? { start: null, end: null } : null,
                draft: type === "date-range" ? { start: null, end: null } : null,
                temp: start,
                max: limit(maxValue),
                min: limit(minValue)
            };
        }
        return {
            confirmed: type === "date-range" ? { start, end } : start,
            draft: type === "date-range" ? { start, end } : start,
            temp: start,
            max: limit(maxValue),
            min: limit(minValue)
        };
    }

    const [state, setState] = useState(initDatePicker);
    const setPart = <K extends keyof typeof state>(k: K, v: typeof state[K]) => setState(s => ({ ...s, [k]: v }));

    const modal = useRef<EAModalRef>(null);
    const labelRef = useRef<LabelRef>(null);
    const [fieldHeight, setFieldHeight] = useState(0);

    const open = () => {
        const d = new Date;
        if (!keepsTime) d.setHours(0, 0, 0, 0);
        const confirmed = state.confirmed;
        let temp = (type === "date-range" ? (state.confirmed as any)?.start : state.confirmed) || toDetails(d, defaultCfg);
        // Sin valor y con hoy fuera de los límites: se abre en el límite más cercano (en los tipos con año)
        if (!(confirmed as any)?.timestamp && !(confirmed as any)?.start && (fullPicker || type === 'year' || type === 'month-year')) {
            if (lo != null && temp.timestamp! < lo) temp = toDetails(new Date(lo), defaultCfg);
            else if (hi != null && temp.timestamp! > hi) temp = toDetails(new Date(hi), defaultCfg);
        }

        setState(p => ({ ...p, draft: confirmed, temp }));
        modal.current.open();
    };

    // Limpiar: deja el campo sin fecha, avisa con onChange y cierra
    const clear = () => {
        const empty = type === "date-range" ? { start: null, end: null } : null;
        setState(p => ({ ...p, confirmed: empty, draft: empty }));
        onChange?.(empty);
        modal.current.close();
    };

    const commit = () => {
        setPart("confirmed", state.draft);
        onChange?.(state.draft);
        modal.current.close();
    };

    const { year, month, day, hour, minute } = state.temp;
    const confirmed: any = state.confirmed;
    const draft: any = state.draft;
    const isRange = type === "date-range";
    const isDatetime = type === "datetime";

    // Si cambian value, type, límites o config desde fuera, se reinicia (JSON: el padre puede pasar
    // objetos nuevos en cada render). La primera vez no: useState ya se inicializó con lo mismo
    const firstSync = useRef(true);
    useEffect(() => {
        if (firstSync.current) { firstSync.current = false; return; }
        setState(initDatePicker)
    }, [JSON.stringify([value, type, maxValue, minValue, config, valueLocale])])

    // El label flotante sube si hay una fecha confirmada (al elegirla, no solo al recibir value)
    const hasValue = !!(confirmed?.format || confirmed?.start?.format);
    useEffect(() => { labelRef.current?.animate(hasValue) }, [hasValue]);

    /* ---- Límites ---- */
    // Pickers completos (calendar, date-range, datetime): en ms. Sin hora, el máximo incluye todo su día
    const lo = state.min ? (isDatetime ? state.min.timestamp! : startOfDay(state.min.year!, state.min.month!, state.min.day!)) : undefined;
    const hi = state.max ? (isDatetime ? state.max.timestamp! : startOfDay(state.max.year!, state.max.month!, state.max.day!) + DAY_MS - 1) : undefined;
    const yearAllowed = (y: number) => overlaps(startOfDay(y, 0, 1), startOfDay(y + 1, 0, 1) - 1, lo, hi);
    const monthAllowed = (y: number, m: number) => overlaps(startOfDay(y, m, 1), startOfDay(y, m + 1, 1) - 1, lo, hi);
    // Listas (time, year, month, month-year, weekday): en la unidad de cada tipo
    const minK = state.min ? keyOf(type, state.min) : undefined;
    const maxK = state.max ? keyOf(type, state.max) : undefined;

    /* ---- Navegación del calendario: el mes pasa de año (dic → ene) ---- */
    const goTo = (y: number, m: number) => {
        const d = new Date(y, m, 1);
        setPart("temp", { ...state.temp, year: d.getFullYear(), month: d.getMonth() });
    };

    /* ---- Hora y minutos de datetime (sobre el día elegido, o el que se está viendo) ---- */
    const activeDraft: DateDetailsType | null = isRange ? draft?.start : draft;
    const baseDay = activeDraft?.day != null ? startOfDay(activeDraft.year!, activeDraft.month!, activeDraft.day!) : startOfDay(year!, month!, day!);
    /* ---- disabledDates: ¿esta opción está bloqueada? ---- */
    // La función se lee por ref (puede venir nueva en cada render); la lista se memoriza por su contenido
    const disabledRef = useRef(disabledDates);
    disabledRef.current = disabledDates;
    const disabledKey = typeof disabledDates === 'function' ? 'fn' : JSON.stringify(disabledDates ?? null);
    const matchers = useMemo(() => (typeof disabledDates === 'function' ? [] : toMatchers(disabledDates)), [disabledKey]);
    const isBlocked = useCallback((fields: DateFields, unit: DateUnit) => {
        const dd = disabledRef.current;
        if (!dd) return false;
        if (typeof dd === 'function') {
            const date = new Date(fields.year ?? 2012, fields.month ?? 0, fields.day ?? 1 + (fields.weekday ?? 0), fields.hour ?? 0, fields.minute ?? 0);
            return !!dd(date, unit);
        }
        return matchesAny(matchers, fields);
    }, [matchers]);
    const isDayDisabled = useCallback((y: number, m: number, d: number) => isBlocked(dayFields(y, m, d), 'day'), [isBlocked]);

    const baseDate = new Date(baseDay);
    const baseFields = dayFields(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
    // ¿Se puede esta hora / este minuto en un día? (límites + disabledDates)
    const hourOk = (dayTs: number, df: DateFields, h: number) =>
        overlaps(dayTs + h * HOUR_MS, dayTs + (h + 1) * HOUR_MS - 1, lo, hi) && !isBlocked({ ...df, hour: h }, 'hour');
    const minuteOk = (dayTs: number, df: DateFields, h: number, m: number) =>
        overlaps(dayTs + h * HOUR_MS + m * MIN_MS, dayTs + h * HOUR_MS + (m + 1) * MIN_MS - 1, lo, hi) && !isBlocked({ ...df, hour: h, minute: m }, 'minute');
    // Primer valor permitido desde `from` en la dirección `dir` (las flechas saltan lo bloqueado)
    const findAllowed = (from: number, dir: 1 | -1, max: number, ok: (v: number) => boolean) => {
        for (let v = from; v >= 0 && v <= max; v += dir) if (ok(v)) return v;
        return null;
    };
    // La hora más cercana permitida (primero hacia delante) y, dentro de ella, el minuto
    const fitTime = (dayTs: number, df: DateFields, h: number, m: number) => {
        const okH = (v: number) => hourOk(dayTs, df, v);
        const hh = okH(h) ? h : findAllowed(h, 1, 23, okH) ?? findAllowed(h, -1, 23, okH) ?? h;
        const okM = (v: number) => minuteOk(dayTs, df, hh, v);
        const mm = okM(m) ? m : findAllowed(m, 1, 59, okM) ?? findAllowed(m, -1, 59, okM) ?? m;
        return [hh, mm] as const;
    };
    const hourAllowed = (h: number) => hourOk(baseDay, baseFields, h);
    const minuteAllowed = (m: number) => minuteOk(baseDay, baseFields, hour!, m);
    const setTime = (h: number, m: number) => {
        setPart("temp", { ...state.temp, hour: h, minute: m });
        if (activeDraft?.day != null) {
            setPart("draft", toDetails(new Date(activeDraft.year!, activeDraft.month!, activeDraft.day!, h, m), defaultCfg));
        }
    };

    /* ---- Etiquetas memorizadas: se formatean una vez por locale, no en cada render ---- */
    const daysLocale = _days?.locale || locale;
    const dayLabels = useMemo(
        () => Array.from({ length: 31 }, (_, i) => formatWith(new Date(2000, 0, i + 1), daysLocale, { day: _days?.config || "numeric" })),
        [daysLocale, _days?.config]
    );
    const firstDay: WeekDay = firstDayOfWeek ?? defaultFirstDay(_weekdays?.locale || locale);
    const weekdayLabels = useMemo(
        // 2023-01-01 fue domingo: de ahí se toman los 7 días empezando por firstDay
        () => Array.from({ length: 7 }, (_, i) => formatWith(new Date(2023, 0, 1 + ((firstDay + i) % 7)), _weekdays?.locale || locale, { weekday: _weekdays?.config || "short" })),
        [_weekdays?.locale, locale, _weekdays?.config, firstDay]
    );
    const monthLabels = useMemo(
        () => Array.from({ length: 12 }, (_, i) => formatWith(new Date(2000, i, 1), _months?.locale || locale, { month: _months?.config || "long" })),
        [_months?.locale, locale, _months?.config]
    );
    // hourCycle h23 (0-23): con h24 la medianoche salía como "24". "2-digit" ya rellena con los dígitos del idioma
    // Horas y minutos con los dígitos del idioma y, si el idioma las usa, sus unidades ("8時" / "05分" en
    // japonés, "8시" / "05분" en coreano); si no, números ("08" / "05"). En 12 h, el formato de Intl, que
    // incluye la marca de mañana / tarde ("午前8時", "8 AM")
    const timeLocale = _time?.locale || locale;
    const units = timeUnits(timeLocale);
    const hourLabels = useMemo(
        () => Array.from({ length: 24 }, (_, i) => {
            const cycle = _time?.config?.hourCycle || 'h23';
            if (cycle !== 'h23' && cycle !== 'h24') {
                return formatWith(new Date(2000, 0, 1, i), timeLocale, { hour: _time?.config?.hour || "2-digit", hourCycle: cycle });
            }
            // Con unidad, sin cero delante salvo que se pida ("8時"); sin unidad, con dos dígitos ("08")
            const digits = units ? (_time?.config?.hour === '2-digit' ? 2 : 1) : (_time?.config?.hour === 'numeric' ? 1 : 2);
            return formatNumber(i, timeLocale, digits) + (units?.hour ?? '');
        }),
        [_time?.locale, locale, _time?.config?.hour, _time?.config?.hourCycle]
    );
    const minuteLabels = useMemo(
        () => Array.from({ length: 60 }, (_, i) => formatNumber(i, timeLocale, _time?.config?.minute === 'numeric' ? 1 : 2) + (units?.minute ?? '')),
        [_time?.locale, locale, _time?.config?.minute]
    );
    const currentYearLabel = useMemo(() => formatWith(new Date(year!, 0, 1), _years?.locale || locale, { year: _years?.config || 'numeric' }), [year, _years?.locale, locale, _years?.config]);

    /* ---- Calendario: qué días están elegidos ---- */
    const dayStamp = (d?: DateDetailsType | null) => (d?.year != null ? startOfDay(d.year, d.month!, d.day!) : undefined);
    const startTs = dayStamp(isRange ? draft?.start : draft);
    const endTs = isRange ? dayStamp(draft?.end) : undefined;
    const isEdge = useCallback((d: number) => {
        const ts = startOfDay(year!, month!, d);
        return ts === startTs || ts === endTs;
    }, [year, month, startTs, endTs]);

    // Callback estable para los días (memorizados): lee el estado actual por ref
    const onDayRef = useRef<(d: number) => void>(null);
    onDayRef.current = (d: number) => {
        let date = new Date(year!, month!, d, hour!, minute!);
        // datetime: si la hora que se estaba viendo queda fuera de los límites en ese día, se ajusta al límite
        if (isDatetime && lo != null && date.getTime() < lo) date = new Date(lo);
        if (isDatetime && hi != null && date.getTime() > hi) date = new Date(hi);
        // y si esa hora o minuto está en disabledDates, se pasa al más cercano permitido de ese día
        if (isDatetime) {
            const [h, m] = fitTime(startOfDay(year!, month!, d), dayFields(year!, month!, d), date.getHours(), date.getMinutes());
            date = new Date(year!, month!, d, h, m);
        }
        const details = toDetails(date, defaultCfg);
        if (isDatetime) setPart("temp", { ...state.temp, hour: details.hour, minute: details.minute });
        const ts = dayStamp(details)!;
        const selected = ts === startTs || ts === endTs;
        if (selected && unSelect && !isRange) return setPart("draft", null);
        if (!isRange) return setPart("draft", details);

        if (!draft?.start) return setPart("draft", { start: details, end: null });
        if (!draft?.end) return setPart("draft",
            draft.start.timestamp > details.timestamp ? { start: details, end: draft.start } : { ...draft, end: details }
        );
        if (details.timestamp! < draft.start.timestamp!) {
            setPart("draft", { start: details, end: draft.end });
        } else if (details.timestamp! > draft.end.timestamp!) {
            setPart("draft", { start: draft.start, end: details });
        } else {
            const distStart = Math.abs(details.timestamp! - draft.start.timestamp!);
            const distEnd = Math.abs(draft.end.timestamp! - details.timestamp!);
            setPart("draft", distStart <= distEnd ? { start: details, end: draft.end } : { start: draft.start, end: details });
        }
    };
    const onDay = useCallback((d: number) => onDayRef.current?.(d), []);

    /* ---- Opciones ---- */
    const fullPicker = type == 'calendar' || isDatetime || isRange;
    // Años "infinitos": del menú del calendario o de la lista de year / month-year
    const listYear = fullPicker ? year! : (draft?.year ?? year!);
    const years = useInfiniteRange(listYear);
    // Memorizadas: se recalculan solo si cambian sus datos (un DatePicker cerrado no hace nada en cada render)
    const yearOptions: Option[] = useMemo(() => years.values.map(y => ({
        value: y,
        label: formatWith(new Date(y, 0, 1), _years?.locale || locale, { year: _years?.config || 'numeric' }),
        disabled: isBlocked({ year: y }, 'year') || (fullPicker ? !overlaps(startOfDay(y, 0, 1), startOfDay(y + 1, 0, 1) - 1, lo, hi)
            : type === 'month-year' ? !overlaps(y * 12, y * 12 + 11, minK, maxK)
                : !overlaps(y, y, minK, maxK)),
    })), [years.values, fullPicker, type, lo, hi, minK, maxK, _years?.locale, locale, _years?.config, isBlocked]);
    const selYear = draft?.year ?? year!;
    const monthOptions: Option[] = useMemo(() => monthLabels.map((label, m) => ({
        value: m,
        label,
        disabled: isBlocked(fullPicker ? { year: year!, month: m } : type === 'month-year' ? { year: selYear, month: m } : { month: m }, 'month')
            || (fullPicker ? !overlaps(startOfDay(year!, m, 1), startOfDay(year!, m + 1, 1) - 1, lo, hi)
                : type === 'month-year' ? !overlaps(selYear * 12 + m, selYear * 12 + m, minK, maxK)
                    : !overlaps(m, m, minK, maxK)),
    })), [monthLabels, fullPicker, type, year, selYear, lo, hi, minK, maxK, isBlocked]);
    const selHour = draft?.hour ?? 0;
    const hourOptions: Option[] = useMemo(() => hourLabels.map((label, h) => ({
        value: h, label,
        disabled: isDatetime ? !hourAllowed(h) : !overlaps(h * 60, h * 60 + 59, minK, maxK) || isBlocked({ hour: h }, 'hour'),
    })), [hourLabels, isDatetime, baseDay, lo, hi, minK, maxK, isBlocked]);
    const minuteOptions: Option[] = useMemo(() => minuteLabels.map((label, m) => ({
        value: m, label,
        disabled: isDatetime
            ? !minuteAllowed(m)
            : !overlaps(selHour * 60 + m, selHour * 60 + m, minK, maxK) || isBlocked({ hour: selHour, minute: m }, 'minute'),
    })), [minuteLabels, isDatetime, baseDay, hour, selHour, lo, hi, minK, maxK, isBlocked]);
    const weekdayOptions: Option[] = useMemo(
        // value = weekday de Date (0 domingo... 6 sábado); el 1 de enero de 2012 fue domingo
        () => Array.from({ length: 7 }, (_, i) => ({
            value: i,
            label: formatWith(new Date(2012, 0, i + 1), _weekdays?.locale || locale, { weekday: _weekdays?.config || 'long' }),
            disabled: !overlaps(i, i, minK, maxK) || isBlocked({ weekday: i }, 'weekday'),
        })),
        [_weekdays?.locale, locale, _weekdays?.config, minK, maxK, isBlocked]
    );

    // Flechas de hora y minuto de datetime: la siguiente opción permitida en cada sentido (o ninguna)
    const prevHour = isDatetime ? findAllowed(hour! - 1, -1, 23, hourAllowed) : null;
    const nextHour = isDatetime ? findAllowed(hour! + 1, 1, 23, hourAllowed) : null;
    const prevMinute = isDatetime ? findAllowed(minute! - 1, -1, 59, minuteAllowed) : null;
    const nextMinute = isDatetime ? findAllowed(minute! + 1, 1, 59, minuteAllowed) : null;

    const prevMonth = new Date(year!, month! - 1, 1);
    const nextMonth = new Date(year!, month! + 1, 1);

    // El campo (botón que abre el picker)
    const field = (
            <Pressable
                _pressed={{ opacity: 0.7 }}
                borderWidth={1}
                borderColor="light.100"
                rounded={1}
                py={2}
                px={3}
                flexDir="row"
                justifyContent={'space-between'}
                alignItems="center"
                {...pressableProps}
                onLayout={e => {
                    setFieldHeight(e.nativeEvent.layout.height);
                    pressableProps.onLayout?.(e);
                }}
                onPress={e => {
                    open();
                    pressableProps.onPress?.(e);
                }}
            >
                {hasValue
                    ? `${confirmed?.start?.format || confirmed?.format}${confirmed?.end?.format ? " - " + confirmed.end.format : ""}`
                    // Label flotante sin valor: el label hace de placeholder (el espacio mantiene el alto)
                    : isFloat && label ? ' ' : placeholder}
                {icon === true ? <Icon name="calendar" as={'Feather'} color={'dark.50'} {..._icon} /> : icon}
            </Pressable>
    );

    return (
        <>
            {/* Con label: label y campo juntos en una vista propia (con hermanos sueltos, el gap del contenedor
                se metía entre ellos y el label flotante no se colocaba sobre el campo). Sin label, el campo tal cual */}
            {label
                ? <View>
                    <Label ref={labelRef} isFloat={isFloat} isRequired={isRequired} fieldHeight={fieldHeight} {..._label}>{label}</Label>
                    {field}
                </View>
                : field}

            <Modal ref={modal} _contentStyle={{ h: "auto", roundedTop: 40 }} buttonClose={false}>

                {fullPicker &&
                    <>
                        <Box flexDir="row" p={3} gap={4}>
                            <Stepper
                                label={currentYearLabel}
                                iconLeft={<Icon name="arrow-left" as="Feather" />}
                                iconRight={<Icon name="arrow-right" as="Feather" />}
                                prevDisabled={!yearAllowed(year! - 1)}
                                nextDisabled={!yearAllowed(year! + 1)}
                                onPrev={() => goTo(year! - 1, month!)}
                                onNext={() => goTo(year! + 1, month!)}
                                menu={{ options: yearOptions, selected: year!, onSelect: y => goTo(y, month!), infinite: years }}
                                colorScheme={colorScheme}
                            />
                            <Stepper
                                label={monthLabels[month!]}
                                iconLeft={<Icon name="arrow-left" as="Feather" />}
                                iconRight={<Icon name="arrow-right" as="Feather" />}
                                prevDisabled={!monthAllowed(prevMonth.getFullYear(), prevMonth.getMonth())}
                                nextDisabled={!monthAllowed(nextMonth.getFullYear(), nextMonth.getMonth())}
                                onPrev={() => goTo(year!, month! - 1)}
                                onNext={() => goTo(year!, month! + 1)}
                                menu={{ options: monthOptions, selected: month!, onSelect: m => goTo(year!, m) }}
                                colorScheme={colorScheme}
                            />
                        </Box>
                        <Box flexDir="row" p={2} bg="light.50">
                            {weekdayLabels.map((w, i) =>
                                <Text key={i} w="11%" mx="1.5%" textAlign="center" {..._weekdays?._text}>{w}</Text>
                            )}
                        </Box>
                        <CalendarGrid
                            year={year!}
                            month={month!}
                            firstDay={firstDay}
                            dayLabels={dayLabels}
                            isEdge={isEdge}
                            isDayDisabled={isDayDisabled}
                            rangeStart={isRange ? startTs : undefined}
                            rangeEnd={isRange ? endTs : undefined}
                            lo={lo}
                            hi={hi}
                            colorScheme={colorScheme}
                            button={_days?._button}
                            onDay={onDay}
                        />
                    </>
                }

                {isDatetime && (
                    <Box flexDir="row" p={3} gap={12} alignItems="center">
                        <Stepper
                            label={hourLabels[hour!]}
                            borderWidth={1}
                            borderColor="light.100"
                            rounded={2}
                            prevDisabled={prevHour == null}
                            nextDisabled={nextHour == null}
                            onPrev={() => prevHour != null && setTime(...fitTime(baseDay, baseFields, prevHour, minute!))}
                            onNext={() => nextHour != null && setTime(...fitTime(baseDay, baseFields, nextHour, minute!))}
                            menu={{ options: hourOptions, selected: hour!, onSelect: h => setTime(...fitTime(baseDay, baseFields, h, minute!)) }}
                            colorScheme={colorScheme}
                        />
                        <Text>:</Text>
                        <Stepper
                            label={minuteLabels[minute!]}
                            borderWidth={1}
                            borderColor="light.100"
                            rounded={2}
                            prevDisabled={prevMinute == null}
                            nextDisabled={nextMinute == null}
                            onPrev={() => prevMinute != null && setTime(hour!, prevMinute)}
                            onNext={() => nextMinute != null && setTime(hour!, nextMinute)}
                            menu={{ options: minuteOptions, selected: minute!, onSelect: m => setTime(hour!, m) }}
                            colorScheme={colorScheme}
                        />
                    </Box>
                )}

                {(type == 'month-year' || type == 'year' || type == 'month') &&
                    <Box flexDir="row" px={1} pt={4}>
                        {(type == 'month-year' || type == 'year') &&
                            <OptionList
                                options={yearOptions}
                                selected={draft?.year}
                                anchor={year}
                                colorScheme={colorScheme}
                                infinite={years}
                                onChange={e => {
                                    // month-year: si con el mes actual (o enero) queda fuera de los límites, el mes se ajusta al límite
                                    let k = e * 12 + (draft?.month ?? 0);
                                    if (type === 'month-year') k = Math.min(Math.max(k, minK ?? k), maxK ?? k);
                                    setPart('draft', toDetails(new Date(Math.floor(k / 12), k % 12), defaultCfg));
                                }}
                            />
                        }
                        {(type == 'month-year' || type == 'month') &&
                            <OptionList
                                options={monthOptions}
                                selected={draft?.month}
                                anchor={month}
                                colorScheme={colorScheme}
                                onChange={e => setPart('draft', toDetails(new Date(draft?.year ?? year, e), defaultCfg))}
                            />
                        }
                    </Box>
                }

                {type == 'time' &&
                    <Box flexDir="row" px={1} pt={4}>
                        <OptionList
                            options={hourOptions}
                            selected={draft?.hour}
                            colorScheme={colorScheme}
                            onChange={e => {
                                const date = toDetails(new Date(2000, 0, 1, e, draft?.minute || 0), defaultCfg)
                                setPart('draft', { ...date, minute: draft?.minute })
                            }}
                        />
                        <OptionList
                            options={minuteOptions}
                            selected={draft?.minute}
                            colorScheme={colorScheme}
                            onChange={e => {
                                const date = toDetails(new Date(2000, 0, 1, draft?.hour || 0, e), defaultCfg)
                                setPart('draft', { ...date, hour: draft?.hour })
                            }}
                        />
                    </Box>
                }

                {type == 'weekday' &&
                    <Box px={1} pt={4}>
                        <OptionList
                            options={weekdayOptions}
                            selected={draft?.weekday}
                            colorScheme={colorScheme}
                            height="auto"
                            onChange={e => setPart('draft', toDetails(new Date(2012, 0, e + 1), defaultCfg))}
                        />
                    </Box>
                }

                <Box flexDir="row" p={3} mt={1} style={{ gap: 12 }}>
                    {clearable &&
                        <Button
                            variant="ghost"
                            colorScheme={colorScheme}
                            flex={1}
                            children={libT("clear")}
                            // Sin nada que borrar (ni confirmado ni elegido) no hace falta
                            disabled={!hasValue && !(isRange ? draft?.start : draft)}
                            {..._buttonClear}
                            onPress={clear}
                        />
                    }
                    <Button
                        variant="outline"
                        colorScheme={colorScheme}
                        flex={1}
                        children={libT("cancel")}
                        {..._buttonCancel}
                        onPress={() => modal.current?.close()}
                    />
                    <Button
                        flex={1}
                        colorScheme={colorScheme}
                        children={libT("done")}
                        {..._buttonDone}
                        // Rango a medias (inicio sin fin): no se puede confirmar hasta elegir las dos fechas
                        disabled={isRange && !!draft?.start && !draft?.end || _buttonDone?.disabled}
                        onPress={commit}
                    />
                </Box>
            </Modal>
        </>
    );
}
