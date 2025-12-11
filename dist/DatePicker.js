"use strict";
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
exports.DatePicker = void 0;
const react_1 = require("react");
const Pressable_1 = require("./Pressable");
const Text_1 = require("./Text");
const Icon_1 = require("./Icon");
const Modal_1 = require("./Modal");
const Box_1 = require("./Box");
const Button_1 = require("./Button");
const FlatList_1 = require("./FlatList");
const react_native_1 = require("react-native");
const formatDate = (d, cfg) => d.toLocaleString((cfg === null || cfg === void 0 ? void 0 : cfg.locale) || "en-US", Object.assign({ day: "2-digit", month: "2-digit", year: "numeric" }, ((cfg === null || cfg === void 0 ? void 0 : cfg.config) || {}))).replaceAll("/", (cfg === null || cfg === void 0 ? void 0 : cfg.separate) || "/");
const toDetails = (d, cfg) => ({
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
const parseDate = (v) => {
    var _a, _b, _c, _d, _e, _f;
    if (typeof v === 'object' && ("year" in v || "month" in v || "day" in v || "hour" in v || "weekday" in v || "minute" in v)) {
        return new Date((_a = v.year) !== null && _a !== void 0 ? _a : 2012, (_b = v.month) !== null && _b !== void 0 ? _b : 0, (_d = (_c = v.day) !== null && _c !== void 0 ? _c : v === null || v === void 0 ? void 0 : v.weekday) !== null && _d !== void 0 ? _d : 1, (_e = v.hour) !== null && _e !== void 0 ? _e : 0, (_f = v.minute) !== null && _f !== void 0 ? _f : 0);
    }
    else if (typeof v == 'object' && ('start' in v || 'end' in v)) {
        const start = parseDate(v.start);
        const end = parseDate(v.end);
        return { start, end };
    }
    return (v === null || v === undefined || v === '') ? null : v == "today" ? new Date() : new Date(v);
};
function Stepper(_a) {
    var { value, onChange, min = -Infinity, max = Infinity, format, colorScheme, iconLeft = <Icon_1.Icon name="minus" as="AntDesign"/>, // 👈 icono por defecto
    iconRight = <Icon_1.Icon name="plus" as="AntDesign"/>, minValue, maxValue } = _a, props = __rest(_a, ["value", "onChange", "min", "max", "format", "colorScheme", "iconLeft", "iconRight", "minValue", "maxValue"]) // 👈 props extra para el Box
    ;
    return (<Box_1.Box flexDir="row" alignItems="center" flex={1} {...props}>
            <Button_1.Button variant="ghost" colorScheme={colorScheme} rounded={40} icon={iconLeft} // 👈 usa el icono recibido
     disabled={value <= min || minValue} onPress={() => onChange(value - 1)}/>
            <Text_1.Text flex={1} textAlign="center">{format(value)}</Text_1.Text>
            <Button_1.Button variant="ghost" colorScheme={colorScheme} rounded={40} icon={iconRight} // 👈 usa el icono recibido
     disabled={value >= max || maxValue} onPress={() => onChange(value + 1)}/>
        </Box_1.Box>);
}
const AnimatedText = react_native_1.Animated.createAnimatedComponent(Text_1.Text);
function DatePicker(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z;
    var { value, placeholder, onChange, _months, _weekdays, _years, _days, _time, locale = "en-US", colorScheme = "primary", _buttonCancel, _buttonDone, type = "calendar", unSelect = false, config, separate = "-", minValue, maxValue, icon = true, _icon } = _a, props = __rest(_a, ["value", "placeholder", "onChange", "_months", "_weekdays", "_years", "_days", "_time", "locale", "colorScheme", "_buttonCancel", "_buttonDone", "type", "unSelect", "config", "separate", "minValue", "maxValue", "icon", "_icon"]);
    const defaultCfg = type === "month-year" ? { locale, separate, config: Object.assign({ day: undefined }, config) }
        : type === "datetime" ? { locale, separate, config: Object.assign({ hour: "2-digit", minute: "2-digit", hourCycle: "h24" }, config) }
            : type === "year" ? { locale, separate, config: Object.assign({ day: undefined, month: undefined }, config) }
                : type === "month" ? { locale, separate, config: Object.assign({ day: undefined, year: undefined, month: 'long' }, config) }
                    : type === "time" ? { locale, separate, config: Object.assign({ day: undefined, year: undefined, month: undefined, hour: "2-digit", minute: "2-digit", hourCycle: "h24" }, config) }
                        : type === 'weekday' ? { locale, separate, config: Object.assign({ day: undefined, year: undefined, month: undefined, weekday: 'long' }, config) }
                            : { locale, separate, config };
    placeholder = placeholder || (type === "month-year" ? '0000-00'
        : type === "datetime" ? '0000-00-00 00:00'
            : type === "year" ? '0000'
                : type === "month" ? '- SELECCIONE -'
                    : type === 'date-range' ? '0000-00-00 - 0000-00-00'
                        : type === 'time' ? '00:00'
                            : type === 'weekday' ? '- SELECCIONE -'
                                : "0000-00-00");
    const initDatePicker = () => {
        var _a;
        const d = parseDate(value) || new Date;
        if (type !== "datetime") {
            ((d === null || d === void 0 ? void 0 : d.start) || d).setHours(0, 0, 0, 0);
            (_a = d === null || d === void 0 ? void 0 : d.end) === null || _a === void 0 ? void 0 : _a.setHours(0, 0, 0, 0);
        }
        ;
        const start = toDetails((d === null || d === void 0 ? void 0 : d.start) || d, defaultCfg);
        const end = (d === null || d === void 0 ? void 0 : d.end) && toDetails(d.end, defaultCfg);
        if (!value) {
            return {
                confirmed: type === "date-range" ? { start: null, end: null } : null,
                draft: type === "date-range" ? { start: null, end: null } : null,
                temp: start,
                max: maxValue && toDetails(parseDate(maxValue)),
                min: minValue && toDetails(parseDate(minValue))
            };
        }
        return {
            confirmed: type === "date-range" ? { start, end } : start,
            draft: type === "date-range" ? { start, end } : start,
            temp: start,
            max: maxValue && toDetails(parseDate(maxValue)),
            min: minValue && toDetails(parseDate(minValue))
        };
    };
    const [state, setState] = (0, react_1.useState)(initDatePicker);
    const setPart = (k, v) => setState(s => (Object.assign(Object.assign({}, s), { [k]: v })));
    const modal = (0, react_1.useRef)(null);
    const animation = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    const open = () => {
        var _a;
        const d = new Date;
        if (type !== "datetime")
            d.setHours(0, 0, 0, 0);
        const confirmed = state.confirmed;
        const temp = (type === "date-range" ? (_a = state.confirmed) === null || _a === void 0 ? void 0 : _a.start : state.confirmed) || toDetails(d, defaultCfg);
        setState(p => (Object.assign(Object.assign({}, p), { draft: confirmed, temp })));
        modal.current.open();
    };
    const commit = () => {
        setPart("confirmed", state.draft);
        onChange === null || onChange === void 0 ? void 0 : onChange(state.draft);
        modal.current.close();
    };
    const inRange = (day) => {
        if (type !== "date-range")
            return false;
        const d = state.draft;
        if (!(d === null || d === void 0 ? void 0 : d.start) || !(d === null || d === void 0 ? void 0 : d.end))
            return false;
        const t = new Date(state.temp.year, state.temp.month, day).getTime();
        return t >= d.start.timestamp && t <= d.end.timestamp;
    };
    const adjustTime = (field, delta) => {
        setPart("temp", Object.assign(Object.assign({}, state.temp), { [field]: state.temp[field] + delta }));
        const draft = state.draft;
        if ((draft === null || draft === void 0 ? void 0 : draft.day) != null) {
            const date = toDetails(new Date(draft.year, draft.month, draft.day, field === "hour" ? draft.hour + delta : draft.hour, field === "minute" ? draft.minute + delta : draft.minute), defaultCfg);
            setPart("draft", date);
        }
    };
    const { year, month, day, hour, minute } = state.temp;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const confirmed = state.confirmed;
    (0, react_1.useEffect)(() => {
        animate(value);
        setState(initDatePicker);
    }, [value, type, maxValue, minValue, config]);
    const animate = (text) => {
        react_native_1.Animated.timing(animation, {
            toValue: text ? 1 : 0,
            duration: 100,
            useNativeDriver: true,
        }).start();
    };
    return (<>
            {props.label &&
            <AnimatedText pointerEvents="none" style={[
                    (props.isFloat ?
                        {
                            padding: 3,
                            marginLeft: 10,
                            backgroundColor: '#fff',
                            zIndex: 1000,
                            marginRight: 'auto',
                            marginBottom: -11,
                            transform: [
                                {
                                    translateY: animation.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [20, 1],
                                    })
                                }
                            ]
                        } :
                        { marginBottom: 4 }),
                ]} {...props._label}>
                    {props.label} {props.isRequired && <Text_1.Text color={'danger'}>*</Text_1.Text>}
                </AnimatedText>}
            <Pressable_1.Pressable _pressed={{ opacity: 0.7 }} borderWidth={1} borderColor="light" rounded={1} py={2} px={3} flexDir="row" justifyContent={'space-between'} alignItems="center" {...props} onPress={e => {
            var _a;
            open();
            (_a = props.onPress) === null || _a === void 0 ? void 0 : _a.call(props, e);
        }}>
                {`${((_b = confirmed === null || confirmed === void 0 ? void 0 : confirmed.start) === null || _b === void 0 ? void 0 : _b.format) || (confirmed === null || confirmed === void 0 ? void 0 : confirmed.format) || placeholder}${((_c = confirmed === null || confirmed === void 0 ? void 0 : confirmed.end) === null || _c === void 0 ? void 0 : _c.format) ? " - " + confirmed.end.format : ""}`}
                {icon === true ? <Icon_1.Icon name="calendar" as={'Feather'} color={'dark.50'} {..._icon}/> : icon}
            </Pressable_1.Pressable>

            <Modal_1.Modal ref={modal} _contentStyle={{ h: "auto", roundedTop: 40 }}>

                {(type == 'calendar' || type == 'datetime' || type == 'date-range') &&
            <>
                        <Box_1.Box flexDir="row" p={3}>
                            <Stepper value={year} iconLeft={<Icon_1.Icon name="arrowleft" as="AntDesign"/>} iconRight={<Icon_1.Icon name="arrowright" as="AntDesign"/>} onChange={v => setPart("temp", Object.assign(Object.assign({}, state.temp), { year: v }))} format={v => new Date(v, 0).toLocaleString((_years === null || _years === void 0 ? void 0 : _years.locale) || locale, {
                    year: (_years === null || _years === void 0 ? void 0 : _years.config) || 'numeric',
                })} colorScheme={colorScheme}/>
                            <Stepper value={month} min={0} max={11} iconLeft={<Icon_1.Icon name="arrowleft" as="AntDesign"/>} iconRight={<Icon_1.Icon name="arrowright" as="AntDesign"/>} onChange={v => setPart("temp", Object.assign(Object.assign({}, state.temp), { month: v }))} format={v => new Date(0, v).toLocaleString((_months === null || _months === void 0 ? void 0 : _months.locale) || locale, {
                    month: (_months === null || _months === void 0 ? void 0 : _months.config) || "long",
                })} colorScheme={colorScheme}/>
                        </Box_1.Box>
                        <Box_1.Box flexDir="row" p={2} bg="light.50">
                            {Array.from({ length: 7 }, (_, i) => <Text_1.Text key={i} w="11%" mx="1.5%" textAlign="center">
                                    {new Date(year, month, i + 1).toLocaleString((_weekdays === null || _weekdays === void 0 ? void 0 : _weekdays.locale) || locale, {
                        weekday: (_weekdays === null || _weekdays === void 0 ? void 0 : _weekdays.config) || "short",
                    })}
                                </Text_1.Text>)}
                        </Box_1.Box>
                        <FlatList_1.FlatList data={Array(daysInMonth)} removeClippedSubviews initialNumToRender={1} maxToRenderPerBatch={10} updateCellsBatchingPeriod={10} windowSize={30} scrollEnabled={false} h={260} p={2} numColumns={7} keyExtractor={(_, i) => 'day' + i} renderItem={({ index }) => {
                    var _a, _b, _c, _d;
                    const d = index + 1;
                    const details = toDetails(new Date(year, month, d, hour, minute), defaultCfg);
                    const draft = state.draft;
                    const s = type === "date-range" ? ((_a = draft === null || draft === void 0 ? void 0 : draft.start) === null || _a === void 0 ? void 0 : _a.timestamp) === details.timestamp : (draft === null || draft === void 0 ? void 0 : draft.timestamp) === details.timestamp;
                    const e = type === "date-range" ? ((_b = draft === null || draft === void 0 ? void 0 : draft.end) === null || _b === void 0 ? void 0 : _b.timestamp) === details.timestamp : false;
                    const range = inRange(d);
                    return (<Button_1.Button colorScheme={colorScheme} variant={s || e ? "solid" : range ? "outline" : "ghost"} w={'11%'} mx="1.5%" my={1} px={1} py={10} borderWidth={1} disabled={details.timestamp > ((_c = state.max) === null || _c === void 0 ? void 0 : _c.timestamp) || details.timestamp < ((_d = state.min) === null || _d === void 0 ? void 0 : _d.timestamp)} _text={{ color: s || e ? "white" : "dark", textAlign: "center", numberOfLines: 1 }} {...((s || e || !range) ? { borderColor: "transparent" } : {})} {..._days === null || _days === void 0 ? void 0 : _days._button} onPress={() => {
                            if (s && unSelect)
                                return setPart("draft", null);
                            if (type !== "date-range")
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
                        }}>
                                        {new Date(0, 0, d).toLocaleString((_days === null || _days === void 0 ? void 0 : _days.locale) || locale, { day: (_days === null || _days === void 0 ? void 0 : _days.config) || "numeric" })}
                                    </Button_1.Button>);
                }}/>
                    </>}

                {type === "datetime" && (<Box_1.Box flexDir="row" p={3} gap={12} alignItems="center">
                        <Stepper value={hour} min={0} max={23} borderWidth={1} borderColor="light" rounded={2} maxValue={new Date((_e = (((_d = state.draft) === null || _d === void 0 ? void 0 : _d.start) || state.draft)) === null || _e === void 0 ? void 0 : _e.timestamp).setHours(((_g = (((_f = state.draft) === null || _f === void 0 ? void 0 : _f.start) || state.draft)) === null || _g === void 0 ? void 0 : _g.hour) + 1) > ((_h = state.max) === null || _h === void 0 ? void 0 : _h.timestamp)} minValue={new Date((_k = (((_j = state.draft) === null || _j === void 0 ? void 0 : _j.start) || state.draft)) === null || _k === void 0 ? void 0 : _k.timestamp).setHours(((_m = (((_l = state.draft) === null || _l === void 0 ? void 0 : _l.start) || state.draft)) === null || _m === void 0 ? void 0 : _m.hour) - 1) < ((_o = state.min) === null || _o === void 0 ? void 0 : _o.timestamp)} onChange={v => adjustTime("hour", v - hour)} format={h => {
                var _a, _b;
                return new Date(year, month, day, h, minute).toLocaleTimeString((_time === null || _time === void 0 ? void 0 : _time.locale) || locale, { hour: ((_a = _time === null || _time === void 0 ? void 0 : _time.config) === null || _a === void 0 ? void 0 : _a.hour) || "2-digit", hourCycle: ((_b = _time === null || _time === void 0 ? void 0 : _time.config) === null || _b === void 0 ? void 0 : _b.hourCycle) || 'h24' });
            }} colorScheme={colorScheme}/>
                        :
                        <Stepper value={minute} min={0} max={59} borderWidth={1} borderColor="light" rounded={2} maxValue={((_q = (((_p = state.draft) === null || _p === void 0 ? void 0 : _p.start) || state.draft)) === null || _q === void 0 ? void 0 : _q.timestamp) >= ((_r = state.max) === null || _r === void 0 ? void 0 : _r.timestamp)} minValue={((_t = (((_s = state.draft) === null || _s === void 0 ? void 0 : _s.start) || state.draft)) === null || _t === void 0 ? void 0 : _t.timestamp) <= ((_u = state.min) === null || _u === void 0 ? void 0 : _u.timestamp)} onChange={v => adjustTime("minute", v - minute)} format={m => {
                var _a;
                return new Date(year, month, day, hour, m).toLocaleTimeString((_time === null || _time === void 0 ? void 0 : _time.locale) || locale, { minute: ((_a = _time === null || _time === void 0 ? void 0 : _time.config) === null || _a === void 0 ? void 0 : _a.minute) || "2-digit" });
            }} colorScheme={colorScheme}/>
                    </Box_1.Box>)}

                {(type == 'month-year' || type == 'year' || type == 'month') &&
            <Box_1.Box flexDir="row" px={1} pt={4}>
                        {(type == 'month-year' || type == 'year') &&
                    <ListYears year={(_v = state.draft) === null || _v === void 0 ? void 0 : _v.year} colorScheme={colorScheme} onChange={e => {
                            var _a;
                            const date = toDetails(new Date(e, ((_a = state.draft) === null || _a === void 0 ? void 0 : _a.month) || 0), defaultCfg);
                            setPart('draft', date);
                        }}/>}
                        {(type == 'month-year' || type == 'month') &&
                    <ListMonths month={(_w = state.draft) === null || _w === void 0 ? void 0 : _w.month} locale={(_months === null || _months === void 0 ? void 0 : _months.locale) || locale} config={_months === null || _months === void 0 ? void 0 : _months.config} colorScheme={colorScheme} onChange={e => {
                            var _a;
                            const date = toDetails(new Date(((_a = state.draft) === null || _a === void 0 ? void 0 : _a.year) || 0, e), defaultCfg);
                            setPart('draft', date);
                        }}/>}
                    </Box_1.Box>}

                {type == 'time' &&
            <Box_1.Box flexDir="row" px={1} pt={4}>
                        <ListHours hour={(_x = state.draft) === null || _x === void 0 ? void 0 : _x.hour} colorScheme={colorScheme} locale={locale} config={_time === null || _time === void 0 ? void 0 : _time.config} onChange={e => {
                    var _a, _b;
                    const date = toDetails(new Date(2000, 0, 1, e, ((_a = state.draft) === null || _a === void 0 ? void 0 : _a.minute) || 0), defaultCfg);
                    setPart('draft', Object.assign(Object.assign({}, date), { minute: (_b = state.draft) === null || _b === void 0 ? void 0 : _b.minute }));
                }}/>
                        <ListMinutes minute={(_y = state.draft) === null || _y === void 0 ? void 0 : _y.minute} colorScheme={colorScheme} locale={locale} config={_time === null || _time === void 0 ? void 0 : _time.config} onChange={e => {
                    var _a, _b;
                    const date = toDetails(new Date(2000, 0, 1, ((_a = state.draft) === null || _a === void 0 ? void 0 : _a.hour) || 0, e), defaultCfg);
                    setPart('draft', Object.assign(Object.assign({}, date), { hour: (_b = state.draft) === null || _b === void 0 ? void 0 : _b.hour }));
                }}/>
                    </Box_1.Box>}

                {type == 'weekday' &&
            <Box_1.Box px={1} pt={4}>
                        <ListWeekDays weekday={(_z = state.draft) === null || _z === void 0 ? void 0 : _z.weekday} colorScheme={colorScheme} locale={locale} config={_time === null || _time === void 0 ? void 0 : _time.config} onChange={e => {
                    const date = toDetails(new Date(2012, 0, e), defaultCfg);
                    setPart('draft', date);
                }}/>
                    </Box_1.Box>}

                <Box_1.Box flexDir="row" p={3} mt={1} style={{ gap: 12 }}>
                    <Button_1.Button variant="outline" colorScheme={colorScheme} flex={1} children="Cancel" {..._buttonCancel} onPress={() => { var _a; return (_a = modal.current) === null || _a === void 0 ? void 0 : _a.close(); }}/>
                    <Button_1.Button flex={1} colorScheme={colorScheme} children="Done" {..._buttonDone} onPress={commit}/>
                </Box_1.Box>
            </Modal_1.Modal>
        </>);
}
exports.DatePicker = DatePicker;
const ListYears = ({ year, onChange, colorScheme, offset = 3 }) => {
    const [years, setYears] = (0, react_1.useState)(year ? Array.from({ length: 10 }, (_, i) => year + i) : Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i));
    const flRef = (0, react_1.useRef)(null);
    return (<FlatList_1.FlatList ref={flRef} data={years} style={{ height: 365 }} initialNumToRender={1} maxToRenderPerBatch={10} updateCellsBatchingPeriod={10} windowSize={2} removeClippedSubviews contentContainerStyle={{ padding: 8 }} onStartReached={e => {
            if (years[0] == 0)
                return;
            setYears([...Array.from({ length: 1 * offset }, (_, i) => years[0] - (i + 1)).reverse().filter(x => x > -1), ...years]);
            flRef.current.scrollToOffset({ animated: false, offset: 42 * offset });
        }} onEndReached={e => {
            setYears([...years, ...Array.from({ length: 10 }, (_, i) => years.at(-1) + (i + 1))]);
        }} scrollEventThrottle={16} renderItem={({ item }) => {
            return (<Button_1.Button variant={year == item ? "solid" : "ghost"} colorScheme={colorScheme} h={42} onPress={() => onChange(item)}>
                        {item}
                    </Button_1.Button>);
        }}/>);
};
const ListMonths = ({ locale, config, month, onChange, colorScheme }) => {
    return (<FlatList_1.FlatList data={Array.from({ length: 12 }, (_, i) => new Date(0, i).toLocaleString(locale, { month: config || "long" }))} style={{ height: 365 }} initialNumToRender={1} maxToRenderPerBatch={10} updateCellsBatchingPeriod={10} windowSize={2} contentContainerStyle={{ padding: 8 }} renderItem={({ item, index }) => {
            return (<Button_1.Button variant={month == index ? "solid" : "ghost"} colorScheme={colorScheme} h={42} onPress={() => onChange(index)}>
                        {item}
                    </Button_1.Button>);
        }}/>);
};
const ListHours = ({ locale, config, hour, onChange, colorScheme }) => {
    return (<FlatList_1.FlatList data={Array(24)} style={{ height: 365 }} initialNumToRender={1} maxToRenderPerBatch={10} updateCellsBatchingPeriod={10} windowSize={2} contentContainerStyle={{ padding: 8 }} renderItem={({ index }) => {
            return (<Button_1.Button variant={hour == index ? "solid" : "ghost"} colorScheme={colorScheme} h={42} onPress={() => onChange(index)}>
                        {new Date(2000, 0, 1, index).toLocaleString(locale, { hour: (config === null || config === void 0 ? void 0 : config.hour) || "2-digit", hourCycle: (config === null || config === void 0 ? void 0 : config.hourCycle) || 'h24' }).padStart(2, '0')}
                    </Button_1.Button>);
        }}/>);
};
const ListMinutes = ({ locale, config, minute, onChange, colorScheme }) => {
    return (<FlatList_1.FlatList data={Array(60)} style={{ height: 365 }} initialNumToRender={1} maxToRenderPerBatch={10} updateCellsBatchingPeriod={10} windowSize={2} contentContainerStyle={{ padding: 8 }} renderItem={({ index }) => {
            return (<Button_1.Button variant={minute == index ? "solid" : "ghost"} colorScheme={colorScheme} h={42} onPress={() => onChange(index)}>
                        {new Date(2000, 0, 1, 0, index).toLocaleString(locale, { minute: (config === null || config === void 0 ? void 0 : config.minute) || "2-digit" }).padStart(2, '0')}
                    </Button_1.Button>);
        }}/>);
};
const ListWeekDays = ({ locale, config, weekday, onChange, colorScheme }) => {
    return (<FlatList_1.FlatList data={Array(7)} initialNumToRender={1} maxToRenderPerBatch={10} updateCellsBatchingPeriod={10} windowSize={2} contentContainerStyle={{ padding: 8 }} renderItem={({ index }) => {
            return (<Button_1.Button variant={weekday == index ? "solid" : "ghost"} colorScheme={colorScheme} h={42} onPress={() => onChange(index + 1)}>
                        {new Date(2012, 0, index + 1).toLocaleString(locale, { weekday: config || 'long' })}
                    </Button_1.Button>);
        }}/>);
};
