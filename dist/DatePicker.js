"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDate = exports.toDateDetails = exports.formatDate = exports.formatDateWith = void 0;
exports.DatePicker = DatePicker;
const react_1 = __importStar(require("react"));
const Pressable_1 = require("./Pressable");
const Text_1 = require("./Text");
const Icon_1 = require("./Icon");
const Modal_1 = require("./Modal");
const Box_1 = require("./Box");
const Button_1 = require("./Button");
const FlatList_1 = require("./FlatList");
const react_native_1 = require("react-native");
const Menu_1 = require("./Menu");
const Label_1 = require("./Label");
const useThemeProps_1 = require("./utils/useThemeProps");
const translate_1 = require("./utils/translate");
/* ---------------- Formateo (con caché) ---------------- */
// Crear un Intl.DateTimeFormat es caro (sobre todo en Android con Hermes) y toLocaleString crea uno nuevo
// en cada llamada: se crea uno por locale + opciones y se reutiliza
const formatters = new Map();
const cached = (key, create) => {
    let f = formatters.get(key);
    if (!f) {
        f = create();
        formatters.set(key, f);
    }
    return f;
};
const dateFormatter = (locale, options) => cached('d' + locale + JSON.stringify(options), () => new Intl.DateTimeFormat(locale, options));
const formatWith = (d, locale, options) => dateFormatter(locale, options).format(d);
/**
 * Formatea con Intl reutilizando el formateador (crearlo es lo caro, sobre todo en Android).
 * @example formatDateWith(new Date(), 'es', { weekday: 'long' }) // "miércoles"
 */
exports.formatDateWith = formatWith;
/**
 * Número con los dígitos del idioma (minutos). Intl.DateTimeFormat ignora minute: "2-digit" si se
 * formatea solo el minuto (da "5"), y rellenar con padStart mezclaba un "0" latino ("0٥" en árabe)
 */
const formatNumber = (n, locale, digits = 2) => cached('n' + locale + digits, () => new Intl.NumberFormat(locale, { minimumIntegerDigits: digits, useGrouping: false })).format(n);
/**
 * Unidades de hora y minuto del idioma para las listas (ja 時 / 分, ko 시 / 분, th นาฬิกา / นาที), sacadas de
 * su formato de hora completo ("8時05分00秒"). null si el idioma usa ":" (es, en, zh, ar...) o el motor no lo soporta
 */
const timeUnits = (locale) => cached('u' + locale, () => {
    try {
        const parts = new Intl.DateTimeFormat(locale, { timeStyle: 'full', hourCycle: 'h23' })
            .formatToParts(new Date(2000, 0, 1, 8, 5, 0));
        const after = (type) => {
            var _a;
            const i = parts.findIndex(p => p.type === type);
            return i >= 0 && ((_a = parts[i + 1]) === null || _a === void 0 ? void 0 : _a.type) === 'literal' ? parts[i + 1].value : '';
        };
        const hour = after('hour');
        return !hour || /^[\s:.]*$/.test(hour) ? null : { hour: hour.trimEnd(), minute: after('minute').trimEnd() };
    }
    catch (_a) {
        return null;
    }
});
const DATE_PARTS = new Set(['day', 'month', 'year']);
const withLocale = (locale, cfg) => (Object.assign(Object.assign({}, cfg), { locale }));
/**
 * Formatea una fecha como el valor del DatePicker. Acepta Date, timestamp, "AAAA-MM-DD" (fecha local),
 * "today" o cualquier texto que entienda Date. Devuelve "" si no es una fecha válida.
 * @example formatDate('2026-03-15', { locale: 'es' })                    // "15/03/2026"
 * @example formatDate(new Date(), { locale: 'de', separate: '-' })       // "15-03-2026"
 * @example formatDate(fecha, { locale: 'es', config: { month: 'long' } }) // "15 de marzo de 2026"
 */
const formatDate = (date, cfg) => {
    const d = date instanceof Date ? date : (0, exports.parseDate)(date);
    if (!(d instanceof Date) || isNaN(d.getTime()))
        return '';
    const options = Object.assign({ day: "2-digit", month: "2-digit", year: "numeric" }, ((cfg === null || cfg === void 0 ? void 0 : cfg.config) || {}));
    const f = dateFormatter((cfg === null || cfg === void 0 ? void 0 : cfg.locale) || "en-US", options);
    const sep = cfg === null || cfg === void 0 ? void 0 : cfg.separate;
    // Sin separador propio, con el mes en texto ("15 de marzo"), o sin formatToParts: tal cual lo da el idioma
    if (!sep || ['long', 'short', 'narrow'].includes(options.month) || !f.formatToParts)
        return f.format(d);
    // Se sustituye lo que hay ENTRE día, mes y año ("/", "." o "-" según el idioma), no el resto (", 14:30")
    const parts = f.formatToParts(d);
    return parts.map((p, i) => {
        var _a;
        if (p.type !== 'literal')
            return p.value;
        const prevDate = DATE_PARTS.has((_a = parts[i - 1]) === null || _a === void 0 ? void 0 : _a.type);
        const next = parts[i + 1];
        if (prevDate && next && DATE_PARTS.has(next.type))
            return sep;
        // Punto final de la fecha en algunos idiomas ("2026. 03. 15." en coreano): sobra con otro separador
        if (prevDate && /^[.\s]+$/.test(p.value))
            return next ? ' ' : '';
        return p.value;
    }).join('');
};
exports.formatDate = formatDate;
/** Detalles de una fecha: lo mismo que devuelve onChange (year, month, day, hour, minute, weekday, timestamp, iso, format) */
const toDateDetails = (d, cfg) => toDetails(d, cfg);
exports.toDateDetails = toDateDetails;
const toDetails = (d, cfg) => ({
    year: d.getFullYear(),
    month: d.getMonth(),
    day: d.getDate(),
    hour: d.getHours(),
    minute: d.getMinutes(),
    weekday: d.getDay(),
    timestamp: d.getTime(),
    iso: d.toISOString(),
    format: (0, exports.formatDate)(d, cfg),
});
/**
 * Convierte lo que acepta `value` en Date: Date, timestamp, "AAAA-MM-DD" (fecha local), "today", un objeto
 * ({ year, month, day, hour, minute } o { weekday }) o un rango ({ start, end }, devuelve { start, end }).
 * null si no es válido.
 */
const parseDate = (v) => {
    var _a, _b, _c, _d, _e, _f, _g;
    // Va primero: typeof null === 'object', y `"year" in null` lanza TypeError
    if (v === null || v === undefined || v === '')
        return null;
    if (typeof v === 'object' && ("year" in v || "month" in v || "day" in v || "hour" in v || "weekday" in v || "minute" in v)) {
        // Solo weekday (0 domingo... 6 sábado): el 1 de enero de 2012 fue domingo, así que es el día weekday + 1
        if (v.day == null && v.weekday != null)
            return new Date(2012, 0, 1 + v.weekday, (_a = v.hour) !== null && _a !== void 0 ? _a : 0, (_b = v.minute) !== null && _b !== void 0 ? _b : 0);
        return new Date((_c = v.year) !== null && _c !== void 0 ? _c : 2012, (_d = v.month) !== null && _d !== void 0 ? _d : 0, (_e = v.day) !== null && _e !== void 0 ? _e : 1, (_f = v.hour) !== null && _f !== void 0 ? _f : 0, (_g = v.minute) !== null && _g !== void 0 ? _g : 0);
    }
    else if (typeof v == 'object' && ('start' in v || 'end' in v)) {
        const start = (0, exports.parseDate)(v.start);
        const end = (0, exports.parseDate)(v.end);
        if (!start && !end)
            return null;
        return start ? { start, end } : { start: end, end: null };
    }
    // "AAAA-MM-DD" sin hora: new Date() lo toma como UTC y, al oeste de Greenwich (toda América),
    // queda en el día anterior. Se interpreta como fecha local
    const dateOnly = typeof v === 'string' && /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
    const d = v == "today" ? new Date()
        : dateOnly ? new Date(+dateOnly[1], +dateOnly[2] - 1, +dateOnly[3])
            : new Date(v);
    return isNaN(d.getTime()) ? null : d;
};
exports.parseDate = parseDate;
const DAY_MS = 86400000;
const startOfDay = (y, m, d) => new Date(y, m, d).getTime();
// Locales cuya semana empieza en domingo (el resto, en lunes)
const SUNDAY_FIRST = ['en-US', 'en', 'en-CA', 'ja', 'ja-JP', 'ko', 'ko-KR', 'zh', 'zh-CN', 'zh-TW', 'he', 'pt-BR', 'hi'];
const defaultFirstDay = (locale) => (SUNDAY_FIRST.includes(locale) ? 0 : 1);
const HOUR_MS = 3600000;
const MIN_MS = 60000;
/**
 * Valor comparable de una fecha según el tipo: cada picker se limita en su unidad (en `time`, la hora del
 * día; en `month`, el mes; en `month-year`, año y mes; en `weekday`, el día de la semana...)
 */
const keyOf = (type, d) => {
    switch (type) {
        case 'time': return d.hour * 60 + d.minute;
        case 'year': return d.year;
        case 'month': return d.month;
        case 'month-year': return d.year * 12 + d.month;
        case 'weekday': return d.weekday;
        default: return d.timestamp;
    }
};
/* ---------------- disabledDates ---------------- */
/** Patrones: una fecha concreta es su día (año, mes y día); un objeto, sus campos tal cual */
const toMatchers = (list) => (list !== null && list !== void 0 ? list : []).map(v => {
    if (v && typeof v === 'object' && !(v instanceof Date))
        return v;
    const d = (0, exports.parseDate)(v);
    return d instanceof Date ? { year: d.getFullYear(), month: d.getMonth(), day: d.getDate() } : {};
}).filter(m => Object.keys(m).length > 0);
/**
 * ¿La opción encaja con algún patrón? Solo cuenta un patrón si la opción tiene todos sus campos: { hour: 13 }
 * deshabilita la hora 13 pero no días enteros; { weekday: 0 } los domingos del calendario y de la lista
 */
const matchesAny = (matchers, fields) => matchers.some(m => Object.keys(m).every(k => fields[k] !== undefined && fields[k] === m[k]));
const dayFields = (y, m, d) => ({ year: y, month: m, day: d, weekday: new Date(y, m, d).getDay() });
/** ¿El intervalo [from, to] toca el rango permitido [min, max]? */
const overlaps = (from, to, min, max) => (min == null || to >= min) && (max == null || from <= max);
const ITEM_HEIGHT = 42;
const itemLayout = (_, i) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * i, index: i });
/**
 * Rango de números que crece por los dos extremos al llegar a ellos (lista "infinita" de años).
 * Si el valor se sale del rango (p. ej. con las flechas), se vuelve a centrar en él
 */
const CHUNK = 60;
const useInfiniteRange = (center, min = 1, max = 9999) => {
    const around = (c) => ({ from: Math.max(min, c - CHUNK), to: Math.min(max, c + CHUNK) });
    const [range, setRange] = (0, react_1.useState)(() => around(center));
    (0, react_1.useEffect)(() => {
        if (center < range.from || center > range.to)
            setRange(around(center));
    }, [center]);
    const values = (0, react_1.useMemo)(() => Array.from({ length: Math.max(range.to - range.from + 1, 0) }, (_, i) => range.from + i), [range]);
    return {
        values,
        onStartReached: () => range.from > min && setRange(r => (Object.assign(Object.assign({}, r), { from: Math.max(min, r.from - CHUNK) }))),
        onEndReached: () => range.to < max && setRange(r => (Object.assign(Object.assign({}, r), { to: Math.min(max, r.to + CHUNK) }))),
    };
};
// Props de FlatList para listas de alto fijo: abre en la opción elegida y, si es infinita, crece sin saltos
// `anchor`: dónde se coloca al abrir si no hay nada elegido (p. ej. el año que se está viendo)
const listProps = (options, selected, infinite, anchor) => {
    const index = options.findIndex(o => o.value === (selected !== null && selected !== void 0 ? selected : anchor));
    return Object.assign({ keyExtractor: (o) => String(o.value), getItemLayout: itemLayout, initialScrollIndex: index > 2 ? index - 2 : 0, initialNumToRender: 12, windowSize: 5 }, (infinite && {
        onStartReached: infinite.onStartReached,
        onEndReached: infinite.onEndReached,
        // Al añadir años arriba, la lista se queda donde estaba (sin saltos)
        maintainVisibleContentPosition: { minIndexForVisible: 0 },
    }));
};
const OptionButton = ({ option, selected, colorScheme, onPress }) => (<Button_1.Button h={ITEM_HEIGHT} rounded={0} variant={selected ? "solid" : "ghost"} colorScheme={colorScheme} disabled={option.disabled} onPress={onPress}>
        {option.label}
    </Button_1.Button>);
/** Lista de opciones (pickers de año, mes, hora, minuto, día de la semana) */
const OptionList = ({ options, selected, anchor, onChange, colorScheme, height = 365, infinite }) => (<FlatList_1.FlatList data={options} 
// En fila (año + mes, hora + minuto) se reparten el ancho; con alto automático, sin flex
flex={height === 'auto' ? undefined : 1} style={height === 'auto' ? undefined : { height }} contentContainerStyle={{ paddingHorizontal: 8 }} {...listProps(options, selected, infinite, anchor)} renderItem={({ item }) => <OptionButton option={item} selected={selected === item.value} colorScheme={colorScheme} onPress={() => onChange(item.value)}/>}/>);
/** Texto del selector (año, mes, hora, minuto) que abre un menú con la lista para elegir rápido */
const PickerMenu = ({ label, options, selected, onSelect, colorScheme, infinite }) => (<Menu_1.Menu useTriggerWidth _trigger={{ flex: 1 }} trigger={({ onPress }) => (<Pressable_1.Pressable onPress={onPress} alignItems="center" justifyContent="center" py={1.5} rounded={1} _pressed={{ bg: 'light.50' }}>
                <Text_1.Text fontWeight="500">{label}</Text_1.Text>
            </Pressable_1.Pressable>)} data={options} renderItem={({ item, close }) => (<OptionButton option={item} selected={selected === item.value} colorScheme={colorScheme} onPress={() => { onSelect(item.value); close(); }}/>)} _contentStyle={Object.assign({ maxH: 280 }, listProps(options, selected, infinite))}/>);
/** Flechas + valor en medio (el valor puede ser un menú para elegir de una lista) */
function Stepper(_a) {
    var { label, menu, onPrev, onNext, prevDisabled, nextDisabled, colorScheme, iconLeft, iconRight } = _a, props = __rest(_a, ["label", "menu", "onPrev", "onNext", "prevDisabled", "nextDisabled", "colorScheme", "iconLeft", "iconRight"]);
    return (<Box_1.Box flexDir="row" alignItems="center" flex={1} {...props}>
            <Button_1.Button variant="ghost" colorScheme={colorScheme} rounded={40} icon={iconLeft || <Icon_1.Icon name="minus" as="AntDesign"/>} disabled={prevDisabled} onPress={onPrev}/>
            {menu
            ? <PickerMenu label={label} colorScheme={colorScheme} {...menu}/>
            : <Text_1.Text flex={1} textAlign="center">{label}</Text_1.Text>}
            <Button_1.Button variant="ghost" colorScheme={colorScheme} rounded={40} icon={iconRight || <Icon_1.Icon name="plus" as="AntDesign"/>} disabled={nextDisabled} onPress={onNext}/>
        </Box_1.Box>);
}
/** Un día del calendario. Memorizado: al elegir un día solo se repintan los que cambian de estado */
const DayCell = (0, react_1.memo)(({ day, label, status, disabled, colorScheme, button, onPress }) => (<Button_1.Button colorScheme={colorScheme} variant={status === 'edge' ? "solid" : status === 'range' ? "outline" : "ghost"} w={'11%'} mx="1.5%" my={1} px={1} py={10} borderWidth={1} borderColor={status === 'range' ? undefined : "transparent"} disabled={disabled} _text={{ color: status === 'edge' ? "white.100" : "dark.100", textAlign: "center", numberOfLines: 1 }} {...button} onPress={() => onPress(day)}>
        {label}
    </Button_1.Button>));
/**
 * Cuadrícula del mes: filas de 7, con el día 1 en la columna de su día de la semana. Sin FlatList
 * (sin scroll no aporta nada y pintaba los días por tandas): se pinta entero en un frame.
 */
const CalendarGrid = (0, react_1.memo)(({ year, month, firstDay, dayLabels, isEdge, isDayDisabled, rangeStart, rangeEnd, lo, hi, colorScheme, button, onDay }) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const offset = (new Date(year, month, 1).getDay() - firstDay + 7) % 7;
    const cells = [...Array(offset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
    while (cells.length % 7)
        cells.push(null);
    const rows = [];
    for (let i = 0; i < cells.length; i += 7)
        rows.push(cells.slice(i, i + 7));
    return (<Box_1.Box p={2}>
            {rows.map((row, r) => (<Box_1.Box key={r} flexDir="row">
                    {row.map((day, c) => {
                if (day == null)
                    return <Box_1.Box key={c} w="11%" mx="1.5%"/>;
                const ts = startOfDay(year, month, day);
                const status = isEdge(day) ? 'edge'
                    : rangeStart != null && rangeEnd != null && ts > rangeStart && ts < rangeEnd ? 'range' : 'none';
                return (<DayCell key={c} day={day} label={dayLabels[day - 1]} status={status} 
                // Por día completo: con minValue="today" el día de hoy se puede elegir
                disabled={!overlaps(ts, ts + DAY_MS - 1, lo, hi) || isDayDisabled(year, month, day)} colorScheme={colorScheme} button={button} onPress={onDay}/>);
            })}
                </Box_1.Box>))}
        </Box_1.Box>);
});
/* ---------------- DatePicker ---------------- */
function DatePicker(rawProps) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    // Defaults → theme.components.DatePicker → variante → props → plataforma
    // (locale, colorScheme, type, separate... también se pueden definir en el tema)
    let [_k] = (0, useThemeProps_1.useThemeProps)('DatePicker', rawProps), { locale = "en-US", placeholder, colorScheme = "primary", type = "calendar", unSelect = false, separate, icon = true, variant: _variant, 
    // Props del DatePicker: no pasan al botón
    label, _label, isRequired, value, onChange, _months, _weekdays, _years, _days, _time, _buttonCancel, _buttonDone, clearable, _buttonClear, disabledDates, config: configProp, minValue, maxValue, _icon, isFloat, firstDayOfWeek, _value } = _k, pressableProps = __rest(_k, ["locale", "placeholder", "colorScheme", "type", "unSelect", "separate", "icon", "variant", "label", "_label", "isRequired", "value", "onChange", "_months", "_weekdays", "_years", "_days", "_time", "_buttonCancel", "_buttonDone", "clearable", "_buttonClear", "disabledDates", "config", "minValue", "maxValue", "_icon", "isFloat", "firstDayOfWeek", "_value"]);
    // Formato del valor elegido: _value (locale y config) sobre locale y config
    const config = Object.assign(Object.assign({}, configProp), _value === null || _value === void 0 ? void 0 : _value.config);
    const valueLocale = (_value === null || _value === void 0 ? void 0 : _value.locale) || locale;
    const defaultCfg = withLocale(valueLocale, type === "month-year" ? { locale, separate, config: Object.assign({ day: undefined }, config) }
        : type === "datetime" ? { locale, separate, config: Object.assign({ hour: "2-digit", minute: "2-digit", hourCycle: "h23" }, config) }
            : type === "year" ? { locale, separate, config: Object.assign({ day: undefined, month: undefined }, config) }
                : type === "month" ? { locale, separate, config: Object.assign({ day: undefined, year: undefined, month: 'long' }, config) }
                    : type === "time" ? { locale, separate, config: Object.assign({ day: undefined, year: undefined, month: undefined, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }, config) }
                        : type === 'weekday' ? { locale, separate, config: Object.assign({ day: undefined, year: undefined, month: undefined, weekday: 'long' }, config) }
                            : { locale, separate, config });
    placeholder = placeholder || (type === "month-year" ? '0000-00'
        : type === "datetime" ? '0000-00-00 00:00'
            : type === "year" ? '0000'
                : type === "month" ? (0, translate_1.libT)('select')
                    : type === 'date-range' ? '0000-00-00 - 0000-00-00'
                        : type === 'time' ? '00:00'
                            : type === 'weekday' ? (0, translate_1.libT)('select')
                                : "0000-00-00");
    const limit = (v) => {
        const d = (0, exports.parseDate)(v);
        return d instanceof Date ? toDetails(d) : null;
    };
    // Solo los tipos sin hora se llevan a las 00:00 (datetime y time conservan la hora)
    const keepsTime = type === "datetime" || type === "time";
    const initDatePicker = () => {
        const d = (0, exports.parseDate)(value) || new Date;
        const startDate = d instanceof Date ? d : d.start;
        const endDate = d instanceof Date ? null : d.end;
        if (!keepsTime) {
            startDate.setHours(0, 0, 0, 0);
            endDate === null || endDate === void 0 ? void 0 : endDate.setHours(0, 0, 0, 0);
        }
        ;
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
    };
    const [state, setState] = (0, react_1.useState)(initDatePicker);
    const setPart = (k, v) => setState(s => (Object.assign(Object.assign({}, s), { [k]: v })));
    const modal = (0, react_1.useRef)(null);
    const labelRef = (0, react_1.useRef)(null);
    const [fieldHeight, setFieldHeight] = (0, react_1.useState)(0);
    const open = () => {
        var _a;
        const d = new Date;
        if (!keepsTime)
            d.setHours(0, 0, 0, 0);
        const confirmed = state.confirmed;
        let temp = (type === "date-range" ? (_a = state.confirmed) === null || _a === void 0 ? void 0 : _a.start : state.confirmed) || toDetails(d, defaultCfg);
        // Sin valor y con hoy fuera de los límites: se abre en el límite más cercano (en los tipos con año)
        if (!(confirmed === null || confirmed === void 0 ? void 0 : confirmed.timestamp) && !(confirmed === null || confirmed === void 0 ? void 0 : confirmed.start) && (fullPicker || type === 'year' || type === 'month-year')) {
            if (lo != null && temp.timestamp < lo)
                temp = toDetails(new Date(lo), defaultCfg);
            else if (hi != null && temp.timestamp > hi)
                temp = toDetails(new Date(hi), defaultCfg);
        }
        setState(p => (Object.assign(Object.assign({}, p), { draft: confirmed, temp })));
        modal.current.open();
    };
    // Limpiar: deja el campo sin fecha, avisa con onChange y cierra
    const clear = () => {
        const empty = type === "date-range" ? { start: null, end: null } : null;
        setState(p => (Object.assign(Object.assign({}, p), { confirmed: empty, draft: empty })));
        onChange === null || onChange === void 0 ? void 0 : onChange(empty);
        modal.current.close();
    };
    const commit = () => {
        setPart("confirmed", state.draft);
        onChange === null || onChange === void 0 ? void 0 : onChange(state.draft);
        modal.current.close();
    };
    const { year, month, day, hour, minute } = state.temp;
    const confirmed = state.confirmed;
    const draft = state.draft;
    const isRange = type === "date-range";
    const isDatetime = type === "datetime";
    // Si cambian value, type, límites o config desde fuera, se reinicia (JSON: el padre puede pasar
    // objetos nuevos en cada render). La primera vez no: useState ya se inicializó con lo mismo
    const firstSync = (0, react_1.useRef)(true);
    (0, react_1.useEffect)(() => {
        if (firstSync.current) {
            firstSync.current = false;
            return;
        }
        setState(initDatePicker);
    }, [JSON.stringify([value, type, maxValue, minValue, config, valueLocale])]);
    // El label flotante sube si hay una fecha confirmada (al elegirla, no solo al recibir value)
    const hasValue = !!((confirmed === null || confirmed === void 0 ? void 0 : confirmed.format) || ((_a = confirmed === null || confirmed === void 0 ? void 0 : confirmed.start) === null || _a === void 0 ? void 0 : _a.format));
    (0, react_1.useEffect)(() => { var _a; (_a = labelRef.current) === null || _a === void 0 ? void 0 : _a.animate(hasValue); }, [hasValue]);
    /* ---- Límites ---- */
    // Pickers completos (calendar, date-range, datetime): en ms. Sin hora, el máximo incluye todo su día
    const lo = state.min ? (isDatetime ? state.min.timestamp : startOfDay(state.min.year, state.min.month, state.min.day)) : undefined;
    const hi = state.max ? (isDatetime ? state.max.timestamp : startOfDay(state.max.year, state.max.month, state.max.day) + DAY_MS - 1) : undefined;
    const yearAllowed = (y) => overlaps(startOfDay(y, 0, 1), startOfDay(y + 1, 0, 1) - 1, lo, hi);
    const monthAllowed = (y, m) => overlaps(startOfDay(y, m, 1), startOfDay(y, m + 1, 1) - 1, lo, hi);
    // Listas (time, year, month, month-year, weekday): en la unidad de cada tipo
    const minK = state.min ? keyOf(type, state.min) : undefined;
    const maxK = state.max ? keyOf(type, state.max) : undefined;
    /* ---- Navegación del calendario: el mes pasa de año (dic → ene) ---- */
    const goTo = (y, m) => {
        const d = new Date(y, m, 1);
        setPart("temp", Object.assign(Object.assign({}, state.temp), { year: d.getFullYear(), month: d.getMonth() }));
    };
    /* ---- Hora y minutos de datetime (sobre el día elegido, o el que se está viendo) ---- */
    const activeDraft = isRange ? draft === null || draft === void 0 ? void 0 : draft.start : draft;
    const baseDay = (activeDraft === null || activeDraft === void 0 ? void 0 : activeDraft.day) != null ? startOfDay(activeDraft.year, activeDraft.month, activeDraft.day) : startOfDay(year, month, day);
    /* ---- disabledDates: ¿esta opción está bloqueada? ---- */
    // La función se lee por ref (puede venir nueva en cada render); la lista se memoriza por su contenido
    const disabledRef = (0, react_1.useRef)(disabledDates);
    disabledRef.current = disabledDates;
    const disabledKey = typeof disabledDates === 'function' ? 'fn' : JSON.stringify(disabledDates !== null && disabledDates !== void 0 ? disabledDates : null);
    const matchers = (0, react_1.useMemo)(() => (typeof disabledDates === 'function' ? [] : toMatchers(disabledDates)), [disabledKey]);
    const isBlocked = (0, react_1.useCallback)((fields, unit) => {
        var _a, _b, _c, _d, _e, _f;
        const dd = disabledRef.current;
        if (!dd)
            return false;
        if (typeof dd === 'function') {
            const date = new Date((_a = fields.year) !== null && _a !== void 0 ? _a : 2012, (_b = fields.month) !== null && _b !== void 0 ? _b : 0, (_c = fields.day) !== null && _c !== void 0 ? _c : 1 + ((_d = fields.weekday) !== null && _d !== void 0 ? _d : 0), (_e = fields.hour) !== null && _e !== void 0 ? _e : 0, (_f = fields.minute) !== null && _f !== void 0 ? _f : 0);
            return !!dd(date, unit);
        }
        return matchesAny(matchers, fields);
    }, [matchers]);
    const isDayDisabled = (0, react_1.useCallback)((y, m, d) => isBlocked(dayFields(y, m, d), 'day'), [isBlocked]);
    const baseDate = new Date(baseDay);
    const baseFields = dayFields(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
    // ¿Se puede esta hora / este minuto en un día? (límites + disabledDates)
    const hourOk = (dayTs, df, h) => overlaps(dayTs + h * HOUR_MS, dayTs + (h + 1) * HOUR_MS - 1, lo, hi) && !isBlocked(Object.assign(Object.assign({}, df), { hour: h }), 'hour');
    const minuteOk = (dayTs, df, h, m) => overlaps(dayTs + h * HOUR_MS + m * MIN_MS, dayTs + h * HOUR_MS + (m + 1) * MIN_MS - 1, lo, hi) && !isBlocked(Object.assign(Object.assign({}, df), { hour: h, minute: m }), 'minute');
    // Primer valor permitido desde `from` en la dirección `dir` (las flechas saltan lo bloqueado)
    const findAllowed = (from, dir, max, ok) => {
        for (let v = from; v >= 0 && v <= max; v += dir)
            if (ok(v))
                return v;
        return null;
    };
    // La hora más cercana permitida (primero hacia delante) y, dentro de ella, el minuto
    const fitTime = (dayTs, df, h, m) => {
        var _a, _b, _c, _d;
        const okH = (v) => hourOk(dayTs, df, v);
        const hh = okH(h) ? h : (_b = (_a = findAllowed(h, 1, 23, okH)) !== null && _a !== void 0 ? _a : findAllowed(h, -1, 23, okH)) !== null && _b !== void 0 ? _b : h;
        const okM = (v) => minuteOk(dayTs, df, hh, v);
        const mm = okM(m) ? m : (_d = (_c = findAllowed(m, 1, 59, okM)) !== null && _c !== void 0 ? _c : findAllowed(m, -1, 59, okM)) !== null && _d !== void 0 ? _d : m;
        return [hh, mm];
    };
    const hourAllowed = (h) => hourOk(baseDay, baseFields, h);
    const minuteAllowed = (m) => minuteOk(baseDay, baseFields, hour, m);
    const setTime = (h, m) => {
        setPart("temp", Object.assign(Object.assign({}, state.temp), { hour: h, minute: m }));
        if ((activeDraft === null || activeDraft === void 0 ? void 0 : activeDraft.day) != null) {
            setPart("draft", toDetails(new Date(activeDraft.year, activeDraft.month, activeDraft.day, h, m), defaultCfg));
        }
    };
    /* ---- Etiquetas memorizadas: se formatean una vez por locale, no en cada render ---- */
    const daysLocale = (_days === null || _days === void 0 ? void 0 : _days.locale) || locale;
    const dayLabels = (0, react_1.useMemo)(() => Array.from({ length: 31 }, (_, i) => formatWith(new Date(2000, 0, i + 1), daysLocale, { day: (_days === null || _days === void 0 ? void 0 : _days.config) || "numeric" })), [daysLocale, _days === null || _days === void 0 ? void 0 : _days.config]);
    const firstDay = firstDayOfWeek !== null && firstDayOfWeek !== void 0 ? firstDayOfWeek : defaultFirstDay((_weekdays === null || _weekdays === void 0 ? void 0 : _weekdays.locale) || locale);
    const weekdayLabels = (0, react_1.useMemo)(
    // 2023-01-01 fue domingo: de ahí se toman los 7 días empezando por firstDay
    () => Array.from({ length: 7 }, (_, i) => formatWith(new Date(2023, 0, 1 + ((firstDay + i) % 7)), (_weekdays === null || _weekdays === void 0 ? void 0 : _weekdays.locale) || locale, { weekday: (_weekdays === null || _weekdays === void 0 ? void 0 : _weekdays.config) || "short" })), [_weekdays === null || _weekdays === void 0 ? void 0 : _weekdays.locale, locale, _weekdays === null || _weekdays === void 0 ? void 0 : _weekdays.config, firstDay]);
    const monthLabels = (0, react_1.useMemo)(() => Array.from({ length: 12 }, (_, i) => formatWith(new Date(2000, i, 1), (_months === null || _months === void 0 ? void 0 : _months.locale) || locale, { month: (_months === null || _months === void 0 ? void 0 : _months.config) || "long" })), [_months === null || _months === void 0 ? void 0 : _months.locale, locale, _months === null || _months === void 0 ? void 0 : _months.config]);
    // hourCycle h23 (0-23): con h24 la medianoche salía como "24". "2-digit" ya rellena con los dígitos del idioma
    // Horas y minutos con los dígitos del idioma y, si el idioma las usa, sus unidades ("8時" / "05分" en
    // japonés, "8시" / "05분" en coreano); si no, números ("08" / "05"). En 12 h, el formato de Intl, que
    // incluye la marca de mañana / tarde ("午前8時", "8 AM")
    const timeLocale = (_time === null || _time === void 0 ? void 0 : _time.locale) || locale;
    const units = timeUnits(timeLocale);
    const hourLabels = (0, react_1.useMemo)(() => Array.from({ length: 24 }, (_, i) => {
        var _a, _b, _c, _d, _e;
        const cycle = ((_a = _time === null || _time === void 0 ? void 0 : _time.config) === null || _a === void 0 ? void 0 : _a.hourCycle) || 'h23';
        if (cycle !== 'h23' && cycle !== 'h24') {
            return formatWith(new Date(2000, 0, 1, i), timeLocale, { hour: ((_b = _time === null || _time === void 0 ? void 0 : _time.config) === null || _b === void 0 ? void 0 : _b.hour) || "2-digit", hourCycle: cycle });
        }
        // Con unidad, sin cero delante salvo que se pida ("8時"); sin unidad, con dos dígitos ("08")
        const digits = units ? (((_c = _time === null || _time === void 0 ? void 0 : _time.config) === null || _c === void 0 ? void 0 : _c.hour) === '2-digit' ? 2 : 1) : (((_d = _time === null || _time === void 0 ? void 0 : _time.config) === null || _d === void 0 ? void 0 : _d.hour) === 'numeric' ? 1 : 2);
        return formatNumber(i, timeLocale, digits) + ((_e = units === null || units === void 0 ? void 0 : units.hour) !== null && _e !== void 0 ? _e : '');
    }), [_time === null || _time === void 0 ? void 0 : _time.locale, locale, (_b = _time === null || _time === void 0 ? void 0 : _time.config) === null || _b === void 0 ? void 0 : _b.hour, (_c = _time === null || _time === void 0 ? void 0 : _time.config) === null || _c === void 0 ? void 0 : _c.hourCycle]);
    const minuteLabels = (0, react_1.useMemo)(() => Array.from({ length: 60 }, (_, i) => { var _a, _b; return formatNumber(i, timeLocale, ((_a = _time === null || _time === void 0 ? void 0 : _time.config) === null || _a === void 0 ? void 0 : _a.minute) === 'numeric' ? 1 : 2) + ((_b = units === null || units === void 0 ? void 0 : units.minute) !== null && _b !== void 0 ? _b : ''); }), [_time === null || _time === void 0 ? void 0 : _time.locale, locale, (_d = _time === null || _time === void 0 ? void 0 : _time.config) === null || _d === void 0 ? void 0 : _d.minute]);
    const currentYearLabel = (0, react_1.useMemo)(() => formatWith(new Date(year, 0, 1), (_years === null || _years === void 0 ? void 0 : _years.locale) || locale, { year: (_years === null || _years === void 0 ? void 0 : _years.config) || 'numeric' }), [year, _years === null || _years === void 0 ? void 0 : _years.locale, locale, _years === null || _years === void 0 ? void 0 : _years.config]);
    /* ---- Calendario: qué días están elegidos ---- */
    const dayStamp = (d) => ((d === null || d === void 0 ? void 0 : d.year) != null ? startOfDay(d.year, d.month, d.day) : undefined);
    const startTs = dayStamp(isRange ? draft === null || draft === void 0 ? void 0 : draft.start : draft);
    const endTs = isRange ? dayStamp(draft === null || draft === void 0 ? void 0 : draft.end) : undefined;
    const isEdge = (0, react_1.useCallback)((d) => {
        const ts = startOfDay(year, month, d);
        return ts === startTs || ts === endTs;
    }, [year, month, startTs, endTs]);
    // Callback estable para los días (memorizados): lee el estado actual por ref
    const onDayRef = (0, react_1.useRef)(null);
    onDayRef.current = (d) => {
        let date = new Date(year, month, d, hour, minute);
        // datetime: si la hora que se estaba viendo queda fuera de los límites en ese día, se ajusta al límite
        if (isDatetime && lo != null && date.getTime() < lo)
            date = new Date(lo);
        if (isDatetime && hi != null && date.getTime() > hi)
            date = new Date(hi);
        // y si esa hora o minuto está en disabledDates, se pasa al más cercano permitido de ese día
        if (isDatetime) {
            const [h, m] = fitTime(startOfDay(year, month, d), dayFields(year, month, d), date.getHours(), date.getMinutes());
            date = new Date(year, month, d, h, m);
        }
        const details = toDetails(date, defaultCfg);
        if (isDatetime)
            setPart("temp", Object.assign(Object.assign({}, state.temp), { hour: details.hour, minute: details.minute }));
        const ts = dayStamp(details);
        const selected = ts === startTs || ts === endTs;
        if (selected && unSelect && !isRange)
            return setPart("draft", null);
        if (!isRange)
            return setPart("draft", details);
        if (!(draft === null || draft === void 0 ? void 0 : draft.start))
            return setPart("draft", { start: details, end: null });
        if (!(draft === null || draft === void 0 ? void 0 : draft.end))
            return setPart("draft", draft.start.timestamp > details.timestamp ? { start: details, end: draft.start } : Object.assign(Object.assign({}, draft), { end: details }));
        if (details.timestamp < draft.start.timestamp) {
            setPart("draft", { start: details, end: draft.end });
        }
        else if (details.timestamp > draft.end.timestamp) {
            setPart("draft", { start: draft.start, end: details });
        }
        else {
            const distStart = Math.abs(details.timestamp - draft.start.timestamp);
            const distEnd = Math.abs(draft.end.timestamp - details.timestamp);
            setPart("draft", distStart <= distEnd ? { start: details, end: draft.end } : { start: draft.start, end: details });
        }
    };
    const onDay = (0, react_1.useCallback)((d) => { var _a; return (_a = onDayRef.current) === null || _a === void 0 ? void 0 : _a.call(onDayRef, d); }, []);
    /* ---- Opciones ---- */
    const fullPicker = type == 'calendar' || isDatetime || isRange;
    // Años "infinitos": del menú del calendario o de la lista de year / month-year
    const listYear = fullPicker ? year : ((_e = draft === null || draft === void 0 ? void 0 : draft.year) !== null && _e !== void 0 ? _e : year);
    const years = useInfiniteRange(listYear);
    // Memorizadas: se recalculan solo si cambian sus datos (un DatePicker cerrado no hace nada en cada render)
    const yearOptions = (0, react_1.useMemo)(() => years.values.map(y => ({
        value: y,
        label: formatWith(new Date(y, 0, 1), (_years === null || _years === void 0 ? void 0 : _years.locale) || locale, { year: (_years === null || _years === void 0 ? void 0 : _years.config) || 'numeric' }),
        disabled: isBlocked({ year: y }, 'year') || (fullPicker ? !overlaps(startOfDay(y, 0, 1), startOfDay(y + 1, 0, 1) - 1, lo, hi)
            : type === 'month-year' ? !overlaps(y * 12, y * 12 + 11, minK, maxK)
                : !overlaps(y, y, minK, maxK)),
    })), [years.values, fullPicker, type, lo, hi, minK, maxK, _years === null || _years === void 0 ? void 0 : _years.locale, locale, _years === null || _years === void 0 ? void 0 : _years.config, isBlocked]);
    const selYear = (_f = draft === null || draft === void 0 ? void 0 : draft.year) !== null && _f !== void 0 ? _f : year;
    const monthOptions = (0, react_1.useMemo)(() => monthLabels.map((label, m) => ({
        value: m,
        label,
        disabled: isBlocked(fullPicker ? { year: year, month: m } : type === 'month-year' ? { year: selYear, month: m } : { month: m }, 'month')
            || (fullPicker ? !overlaps(startOfDay(year, m, 1), startOfDay(year, m + 1, 1) - 1, lo, hi)
                : type === 'month-year' ? !overlaps(selYear * 12 + m, selYear * 12 + m, minK, maxK)
                    : !overlaps(m, m, minK, maxK)),
    })), [monthLabels, fullPicker, type, year, selYear, lo, hi, minK, maxK, isBlocked]);
    const selHour = (_g = draft === null || draft === void 0 ? void 0 : draft.hour) !== null && _g !== void 0 ? _g : 0;
    const hourOptions = (0, react_1.useMemo)(() => hourLabels.map((label, h) => ({
        value: h, label,
        disabled: isDatetime ? !hourAllowed(h) : !overlaps(h * 60, h * 60 + 59, minK, maxK) || isBlocked({ hour: h }, 'hour'),
    })), [hourLabels, isDatetime, baseDay, lo, hi, minK, maxK, isBlocked]);
    const minuteOptions = (0, react_1.useMemo)(() => minuteLabels.map((label, m) => ({
        value: m, label,
        disabled: isDatetime
            ? !minuteAllowed(m)
            : !overlaps(selHour * 60 + m, selHour * 60 + m, minK, maxK) || isBlocked({ hour: selHour, minute: m }, 'minute'),
    })), [minuteLabels, isDatetime, baseDay, hour, selHour, lo, hi, minK, maxK, isBlocked]);
    const weekdayOptions = (0, react_1.useMemo)(
    // value = weekday de Date (0 domingo... 6 sábado); el 1 de enero de 2012 fue domingo
    () => Array.from({ length: 7 }, (_, i) => ({
        value: i,
        label: formatWith(new Date(2012, 0, i + 1), (_weekdays === null || _weekdays === void 0 ? void 0 : _weekdays.locale) || locale, { weekday: (_weekdays === null || _weekdays === void 0 ? void 0 : _weekdays.config) || 'long' }),
        disabled: !overlaps(i, i, minK, maxK) || isBlocked({ weekday: i }, 'weekday'),
    })), [_weekdays === null || _weekdays === void 0 ? void 0 : _weekdays.locale, locale, _weekdays === null || _weekdays === void 0 ? void 0 : _weekdays.config, minK, maxK, isBlocked]);
    // Flechas de hora y minuto de datetime: la siguiente opción permitida en cada sentido (o ninguna)
    const prevHour = isDatetime ? findAllowed(hour - 1, -1, 23, hourAllowed) : null;
    const nextHour = isDatetime ? findAllowed(hour + 1, 1, 23, hourAllowed) : null;
    const prevMinute = isDatetime ? findAllowed(minute - 1, -1, 59, minuteAllowed) : null;
    const nextMinute = isDatetime ? findAllowed(minute + 1, 1, 59, minuteAllowed) : null;
    const prevMonth = new Date(year, month - 1, 1);
    const nextMonth = new Date(year, month + 1, 1);
    // El campo (botón que abre el picker)
    const field = (<Pressable_1.Pressable _pressed={{ opacity: 0.7 }} borderWidth={1} borderColor="light.100" rounded={1} py={2} px={3} flexDir="row" justifyContent={'space-between'} alignItems="center" {...pressableProps} onLayout={e => {
            var _a;
            setFieldHeight(e.nativeEvent.layout.height);
            (_a = pressableProps.onLayout) === null || _a === void 0 ? void 0 : _a.call(pressableProps, e);
        }} onPress={e => {
            var _a;
            open();
            (_a = pressableProps.onPress) === null || _a === void 0 ? void 0 : _a.call(pressableProps, e);
        }}>
                {hasValue
            ? `${((_h = confirmed === null || confirmed === void 0 ? void 0 : confirmed.start) === null || _h === void 0 ? void 0 : _h.format) || (confirmed === null || confirmed === void 0 ? void 0 : confirmed.format)}${((_j = confirmed === null || confirmed === void 0 ? void 0 : confirmed.end) === null || _j === void 0 ? void 0 : _j.format) ? " - " + confirmed.end.format : ""}`
            // Label flotante sin valor: el label hace de placeholder (el espacio mantiene el alto)
            : isFloat && label ? ' ' : placeholder}
                {icon === true ? <Icon_1.Icon name="calendar" as={'Feather'} color={'dark.50'} {..._icon}/> : icon}
            </Pressable_1.Pressable>);
    return (<>
            {/* Con label: label y campo juntos en una vista propia (con hermanos sueltos, el gap del contenedor
            se metía entre ellos y el label flotante no se colocaba sobre el campo). Sin label, el campo tal cual */}
            {label
            ? <react_native_1.View>
                    <Label_1.Label ref={labelRef} isFloat={isFloat} isRequired={isRequired} fieldHeight={fieldHeight} {..._label}>{label}</Label_1.Label>
                    {field}
                </react_native_1.View>
            : field}

            <Modal_1.Modal ref={modal} _contentStyle={{ h: "auto", roundedTop: 40 }} buttonClose={false}>

                {fullPicker &&
            <>
                        <Box_1.Box flexDir="row" p={3} gap={4}>
                            <Stepper label={currentYearLabel} iconLeft={<Icon_1.Icon name="arrow-left" as="Feather"/>} iconRight={<Icon_1.Icon name="arrow-right" as="Feather"/>} prevDisabled={!yearAllowed(year - 1)} nextDisabled={!yearAllowed(year + 1)} onPrev={() => goTo(year - 1, month)} onNext={() => goTo(year + 1, month)} menu={{ options: yearOptions, selected: year, onSelect: y => goTo(y, month), infinite: years }} colorScheme={colorScheme}/>
                            <Stepper label={monthLabels[month]} iconLeft={<Icon_1.Icon name="arrow-left" as="Feather"/>} iconRight={<Icon_1.Icon name="arrow-right" as="Feather"/>} prevDisabled={!monthAllowed(prevMonth.getFullYear(), prevMonth.getMonth())} nextDisabled={!monthAllowed(nextMonth.getFullYear(), nextMonth.getMonth())} onPrev={() => goTo(year, month - 1)} onNext={() => goTo(year, month + 1)} menu={{ options: monthOptions, selected: month, onSelect: m => goTo(year, m) }} colorScheme={colorScheme}/>
                        </Box_1.Box>
                        <Box_1.Box flexDir="row" p={2} bg="light.50">
                            {weekdayLabels.map((w, i) => <Text_1.Text key={i} w="11%" mx="1.5%" textAlign="center" {..._weekdays === null || _weekdays === void 0 ? void 0 : _weekdays._text}>{w}</Text_1.Text>)}
                        </Box_1.Box>
                        <CalendarGrid year={year} month={month} firstDay={firstDay} dayLabels={dayLabels} isEdge={isEdge} isDayDisabled={isDayDisabled} rangeStart={isRange ? startTs : undefined} rangeEnd={isRange ? endTs : undefined} lo={lo} hi={hi} colorScheme={colorScheme} button={_days === null || _days === void 0 ? void 0 : _days._button} onDay={onDay}/>
                    </>}

                {isDatetime && (<Box_1.Box flexDir="row" p={3} gap={12} alignItems="center">
                        <Stepper label={hourLabels[hour]} borderWidth={1} borderColor="light.100" rounded={2} prevDisabled={prevHour == null} nextDisabled={nextHour == null} onPrev={() => prevHour != null && setTime(...fitTime(baseDay, baseFields, prevHour, minute))} onNext={() => nextHour != null && setTime(...fitTime(baseDay, baseFields, nextHour, minute))} menu={{ options: hourOptions, selected: hour, onSelect: h => setTime(...fitTime(baseDay, baseFields, h, minute)) }} colorScheme={colorScheme}/>
                        <Text_1.Text>:</Text_1.Text>
                        <Stepper label={minuteLabels[minute]} borderWidth={1} borderColor="light.100" rounded={2} prevDisabled={prevMinute == null} nextDisabled={nextMinute == null} onPrev={() => prevMinute != null && setTime(hour, prevMinute)} onNext={() => nextMinute != null && setTime(hour, nextMinute)} menu={{ options: minuteOptions, selected: minute, onSelect: m => setTime(hour, m) }} colorScheme={colorScheme}/>
                    </Box_1.Box>)}

                {(type == 'month-year' || type == 'year' || type == 'month') &&
            <Box_1.Box flexDir="row" px={1} pt={4}>
                        {(type == 'month-year' || type == 'year') &&
                    <OptionList options={yearOptions} selected={draft === null || draft === void 0 ? void 0 : draft.year} anchor={year} colorScheme={colorScheme} infinite={years} onChange={e => {
                            var _a;
                            // month-year: si con el mes actual (o enero) queda fuera de los límites, el mes se ajusta al límite
                            let k = e * 12 + ((_a = draft === null || draft === void 0 ? void 0 : draft.month) !== null && _a !== void 0 ? _a : 0);
                            if (type === 'month-year')
                                k = Math.min(Math.max(k, minK !== null && minK !== void 0 ? minK : k), maxK !== null && maxK !== void 0 ? maxK : k);
                            setPart('draft', toDetails(new Date(Math.floor(k / 12), k % 12), defaultCfg));
                        }}/>}
                        {(type == 'month-year' || type == 'month') &&
                    <OptionList options={monthOptions} selected={draft === null || draft === void 0 ? void 0 : draft.month} anchor={month} colorScheme={colorScheme} onChange={e => { var _a; return setPart('draft', toDetails(new Date((_a = draft === null || draft === void 0 ? void 0 : draft.year) !== null && _a !== void 0 ? _a : year, e), defaultCfg)); }}/>}
                    </Box_1.Box>}

                {type == 'time' &&
            <Box_1.Box flexDir="row" px={1} pt={4}>
                        <OptionList options={hourOptions} selected={draft === null || draft === void 0 ? void 0 : draft.hour} colorScheme={colorScheme} onChange={e => {
                    const date = toDetails(new Date(2000, 0, 1, e, (draft === null || draft === void 0 ? void 0 : draft.minute) || 0), defaultCfg);
                    setPart('draft', Object.assign(Object.assign({}, date), { minute: draft === null || draft === void 0 ? void 0 : draft.minute }));
                }}/>
                        <OptionList options={minuteOptions} selected={draft === null || draft === void 0 ? void 0 : draft.minute} colorScheme={colorScheme} onChange={e => {
                    const date = toDetails(new Date(2000, 0, 1, (draft === null || draft === void 0 ? void 0 : draft.hour) || 0, e), defaultCfg);
                    setPart('draft', Object.assign(Object.assign({}, date), { hour: draft === null || draft === void 0 ? void 0 : draft.hour }));
                }}/>
                    </Box_1.Box>}

                {type == 'weekday' &&
            <Box_1.Box px={1} pt={4}>
                        <OptionList options={weekdayOptions} selected={draft === null || draft === void 0 ? void 0 : draft.weekday} colorScheme={colorScheme} height="auto" onChange={e => setPart('draft', toDetails(new Date(2012, 0, e + 1), defaultCfg))}/>
                    </Box_1.Box>}

                <Box_1.Box flexDir="row" p={3} mt={1} style={{ gap: 12 }}>
                    {clearable &&
            <Button_1.Button variant="ghost" colorScheme={colorScheme} flex={1} children={(0, translate_1.libT)("clear")} 
            // Sin nada que borrar (ni confirmado ni elegido) no hace falta
            disabled={!hasValue && !(isRange ? draft === null || draft === void 0 ? void 0 : draft.start : draft)} {..._buttonClear} onPress={clear}/>}
                    <Button_1.Button variant="outline" colorScheme={colorScheme} flex={1} children={(0, translate_1.libT)("cancel")} {..._buttonCancel} onPress={() => { var _a; return (_a = modal.current) === null || _a === void 0 ? void 0 : _a.close(); }}/>
                    <Button_1.Button flex={1} colorScheme={colorScheme} children={(0, translate_1.libT)("done")} {..._buttonDone} 
    // Rango a medias (inicio sin fin): no se puede confirmar hasta elegir las dos fechas
    disabled={isRange && !!(draft === null || draft === void 0 ? void 0 : draft.start) && !(draft === null || draft === void 0 ? void 0 : draft.end) || (_buttonDone === null || _buttonDone === void 0 ? void 0 : _buttonDone.disabled)} onPress={commit}/>
                </Box_1.Box>
            </Modal_1.Modal>
        </>);
}
