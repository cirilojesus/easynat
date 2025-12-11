import { useState, useRef, useEffect } from "react";
import { BSPressableProps, Pressable } from "./Pressable";
import { BSTextProps, Text } from "./Text";
import { Icon, IconProps } from "./Icon";
import { BSModalRef, Modal } from "./Modal";
import { Box, BSBoxProps } from "./Box";
import { BSButtonProps, Button } from "./Button";
import { COLOR_SCHEME } from "./theme";
import { BSFlatListInstance, FlatList } from "./FlatList";
import { Animated } from "react-native";

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
}>

type AtLeastOne<T, Keys extends keyof T = keyof T> =
    Keys extends keyof T
    ? Required<Pick<T, Keys>> & Partial<Omit<T, Keys>>
    : never;

export type CommonLocale = "en" | "en-US" | "en-GB" | "es" | "es-ES" | "es-MX"
    | "fr" | "fr-FR" | "de" | "de-DE" | "it" | "pt" | "pt-BR"
    | "ja" | "ja-JP" | "ko" | "ko-KR" | "zh" | "zh-CN" | "zh-TW"
    | "ru" | "ar" | "hi" | "nl" | "sv" | "pl" | "tr" | "he" | (string & {});

export type DatePickerType = BSPressableProps & DateConfigType & Intl.DateTimeFormatOptions & {
    value?: Date | (string & {}) | number | "today" | DateObjectType;
    placeholder?: string;
    onChange?: (res: DateDetailsType | { start: DateDetailsType, end: DateDetailsType }) => void;
    _months?: { locale?: CommonLocale; config?: Intl.DateTimeFormatOptions["month"]; _text?: BSTextProps };
    _weekdays?: { locale?: CommonLocale; config?: Intl.DateTimeFormatOptions["weekday"]; _text?: BSTextProps };
    _years?: { locale?: CommonLocale; config?: Intl.DateTimeFormatOptions["year"]; _text?: BSTextProps };
    _days?: { locale?: CommonLocale; config?: Intl.DateTimeFormatOptions["day"]; _button?: BSButtonProps };
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
    icon?: React.ReactElement | boolean,
    label?: string;
    _label?: BSTextProps,
    isFloat?: boolean;
    isRequired?: boolean;
};

const formatDate = (d: Date, cfg: DateConfigType) => d.toLocaleString(cfg?.locale || "en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...(cfg?.config || {}),
}).replaceAll("/", cfg?.separate || "/");

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

const parseDate = (v?: DatePickerType['value']) => {
    if (typeof v === 'object' && ("year" in v || "month" in v || "day" in v || "hour" in v || "weekday" in v || "minute" in v)) {
        return new Date(
            v.year ?? 2012,
            v.month ?? 0,
            v.day ?? v?.weekday ?? 1,
            v.hour ?? 0,
            v.minute ?? 0,
        )
    } else if (typeof v == 'object' && ('start' in v || 'end' in v)) {
        const start = parseDate(v.start)
        const end = parseDate(v.end)
        return { start, end }
    }
    return (v === null || v === undefined || v === '') ? null : v == "today" ? new Date() : new Date(v)
}

function Stepper({
    value,
    onChange,
    min = -Infinity,
    max = Infinity,
    format,
    colorScheme,
    iconLeft = <Icon name="minus" as="AntDesign" />,   // 👈 icono por defecto
    iconRight = <Icon name="plus" as="AntDesign" />,
    minValue,
    maxValue,
    ...props                                           // 👈 props extra para el Box
}: {
    value: number;
    onChange: (next: number) => void;
    min?: number;
    max?: number;
    format: (v: number) => string;
    colorScheme: COLOR_SCHEME;
    iconLeft?: React.ReactElement<IconProps>;   // 👈 icono izquierdo
    iconRight?: React.ReactElement<IconProps>;  // 👈 icono derecho
    minValue?: boolean;
    maxValue?: boolean;
} & BSBoxProps) {
    return (
        <Box flexDir="row" alignItems="center" flex={1} {...props}>
            <Button
                variant="ghost"
                colorScheme={colorScheme}
                rounded={40}
                icon={iconLeft}      // 👈 usa el icono recibido
                disabled={value <= min || minValue}
                onPress={() => onChange(value - 1)}
            />
            <Text flex={1} textAlign="center">{format(value)}</Text>
            <Button
                variant="ghost"
                colorScheme={colorScheme}
                rounded={40}
                icon={iconRight}     // 👈 usa el icono recibido
                disabled={value >= max || maxValue}
                onPress={() => onChange(value + 1)}
            />
        </Box>
    );
}

const AnimatedText = Animated.createAnimatedComponent(Text);

export function DatePicker({
    value,
    placeholder,
    onChange,
    _months,
    _weekdays,
    _years,
    _days,
    _time,
    locale = "en-US",
    colorScheme = "primary",
    _buttonCancel,
    _buttonDone,
    type = "calendar",
    unSelect = false,
    config,
    separate = "-",
    minValue,
    maxValue,
    icon = true,
    _icon,
    ...props
}: DatePickerType) {
    const defaultCfg: DateConfigType = type === "month-year" ? { locale, separate, config: { day: undefined, ...config } }
        : type === "datetime" ? { locale, separate, config: { hour: "2-digit", minute: "2-digit", hourCycle: "h24", ...config } }
            : type === "year" ? { locale, separate, config: { day: undefined, month: undefined, ...config } }
                : type === "month" ? { locale, separate, config: { day: undefined, year: undefined, month: 'long', ...config } }
                    : type === "time" ? { locale, separate, config: { day: undefined, year: undefined, month: undefined, hour: "2-digit", minute: "2-digit", hourCycle: "h24", ...config } }
                        : type === 'weekday' ? { locale, separate, config: { day: undefined, year: undefined, month: undefined, weekday: 'long', ...config } }
                            : { locale, separate, config };

    placeholder = placeholder || (type === "month-year" ? '0000-00'
        : type === "datetime" ? '0000-00-00 00:00'
            : type === "year" ? '0000'
                : type === "month" ? '- SELECCIONE -'
                    : type === 'date-range' ? '0000-00-00 - 0000-00-00'
                        : type === 'time' ? '00:00'
                            : type === 'weekday' ? '- SELECCIONE -'
                                : "0000-00-00")

    const initDatePicker = () => {
        const d = parseDate(value) || new Date;
        if (type !== "datetime") {
            (d?.start || d).setHours(0, 0, 0, 0)
            d?.end?.setHours(0, 0, 0, 0)
        };
        const start = toDetails(d?.start || d, defaultCfg);
        const end = d?.end && toDetails(d.end, defaultCfg);
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
    }

    const [state, setState] = useState(initDatePicker);

    const setPart = <K extends keyof typeof state>(k: K, v: typeof state[K]) => setState(s => ({ ...s, [k]: v }));

    const modal = useRef<BSModalRef>(null);
    const animation = useRef(new Animated.Value(0)).current;

    const open = () => {
        const d = new Date;
        if (type !== "datetime") d.setHours(0, 0, 0, 0);
        const confirmed = state.confirmed;
        const temp = (type === "date-range" ? (state.confirmed as any)?.start : state.confirmed) || toDetails(d, defaultCfg);

        setState(p => ({ ...p, draft: confirmed, temp }));
        modal.current.open();
    };

    const commit = () => {
        setPart("confirmed", state.draft);
        onChange?.(state.draft);
        modal.current.close();
    };

    const inRange = (day: number) => {
        if (type !== "date-range") return false;
        const d = state.draft as { start: DateDetailsType | null; end: DateDetailsType | null };
        if (!d?.start || !d?.end) return false;
        const t = new Date(state.temp.year!, state.temp.month!, day).getTime();
        return t >= d.start.timestamp! && t <= d.end.timestamp!;
    };

    const adjustTime = (field: "hour" | "minute", delta: number) => {
        setPart("temp", { ...state.temp, [field]: state.temp[field]! + delta });
        const draft = state.draft as DateDetailsType;
        if (draft?.day != null) {
            const date = toDetails(
                new Date(
                    draft.year!, draft.month!, draft.day!,
                    field === "hour" ? draft.hour! + delta : draft.hour!,
                    field === "minute" ? draft.minute! + delta : draft.minute!
                ),
                defaultCfg
            );
            setPart("draft", date);
        }
    };

    const { year, month, day, hour, minute } = state.temp;
    const daysInMonth = new Date(year!, month! + 1, 0).getDate();

    const confirmed: any = state.confirmed;

    useEffect(() => {
        animate(value)
        setState(initDatePicker)
    }, [value, type, maxValue, minValue, config])

    const animate = (text) => {
        Animated.timing(animation, {
            toValue: text ? 1 : 0,
            duration: 100,
            useNativeDriver: true,
        }).start();
    }

    return (
        <>
            {props.label &&
                <AnimatedText
                    pointerEvents="none"
                    style={[
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
                    ]}
                    {...props._label}
                >
                    {props.label} {props.isRequired && <Text color={'danger'}>*</Text>}
                </AnimatedText>
            }
            <Pressable
                _pressed={{ opacity: 0.7 }}
                borderWidth={1}
                borderColor="light"
                rounded={1}
                py={2}
                px={3}
                flexDir="row"
                justifyContent={'space-between'}
                alignItems="center"
                {...props}
                onPress={e => {
                    open();
                    props.onPress?.(e);
                }}
            >
                {`${confirmed?.start?.format || confirmed?.format || placeholder}${confirmed?.end?.format ? " - " + confirmed.end.format : ""}`}
                {icon === true ? <Icon name="calendar" as={'Feather'} color={'dark.50'} {..._icon} /> : icon}
            </Pressable>

            <Modal ref={modal} _contentStyle={{ h: "auto", roundedTop: 40 }}>

                {(type == 'calendar' || type == 'datetime' || type == 'date-range') &&
                    <>
                        <Box flexDir="row" p={3}>
                            <Stepper
                                value={year!}
                                iconLeft={<Icon name="arrowleft" as="AntDesign" />}
                                iconRight={<Icon name="arrowright" as="AntDesign" />}
                                onChange={v => setPart("temp", { ...state.temp, year: v })}
                                format={v => new Date(v, 0).toLocaleString(_years?.locale || locale, {
                                    year: _years?.config || 'numeric',
                                })}
                                colorScheme={colorScheme}
                            />
                            <Stepper
                                value={month!}
                                min={0}
                                max={11}
                                iconLeft={<Icon name="arrowleft" as="AntDesign" />}
                                iconRight={<Icon name="arrowright" as="AntDesign" />}
                                onChange={v => setPart("temp", { ...state.temp, month: v })}
                                format={v =>
                                    new Date(0, v).toLocaleString(_months?.locale || locale, {
                                        month: _months?.config || "long",
                                    })
                                }
                                colorScheme={colorScheme}
                            />
                        </Box>
                        <Box flexDir="row" p={2} bg="light.50">
                            {Array.from({ length: 7 }, (_, i) =>
                                <Text key={i} w="11%" mx="1.5%" textAlign="center">
                                    {new Date(year, month, i + 1).toLocaleString(_weekdays?.locale || locale, {
                                        weekday: _weekdays?.config || "short",
                                    })}
                                </Text>
                            )}
                        </Box>
                        <FlatList
                            data={Array(daysInMonth)}
                            removeClippedSubviews
                            initialNumToRender={1}
                            maxToRenderPerBatch={10}
                            updateCellsBatchingPeriod={10}
                            windowSize={30}
                            scrollEnabled={false}
                            h={260}
                            p={2}
                            numColumns={7}
                            keyExtractor={(_, i) => 'day' + i}
                            renderItem={({ index }) => {
                                const d = index + 1;
                                const details = toDetails(new Date(year!, month!, d, hour!, minute!), defaultCfg);
                                const draft: any = state.draft;
                                const s = type === "date-range" ? draft?.start?.timestamp === details.timestamp : draft?.timestamp === details.timestamp;
                                const e = type === "date-range" ? draft?.end?.timestamp === details.timestamp : false;
                                const range = inRange(d);
                                return (
                                    <Button
                                        colorScheme={colorScheme}
                                        variant={s || e ? "solid" : range ? "outline" : "ghost"}
                                        w={'11%'}
                                        mx="1.5%"
                                        my={1}
                                        px={1}
                                        py={10}
                                        borderWidth={1}
                                        disabled={details.timestamp > state.max?.timestamp || details.timestamp < state.min?.timestamp}
                                        _text={{ color: s || e ? "white" : "dark", textAlign: "center", numberOfLines: 1 }}
                                        {...((s || e || !range) ? { borderColor: "transparent" } : {})}
                                        {..._days?._button}
                                        onPress={() => {
                                            if (s && unSelect) return setPart("draft", null);

                                            if (type !== "date-range") return setPart("draft", details)

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
                                                setPart("draft",
                                                    distStart <= distEnd ? { start: details, end: draft.end } : { start: draft.start, end: details }
                                                );
                                            }
                                        }}
                                    >
                                        {new Date(0, 0, d).toLocaleString(_days?.locale || locale, { day: _days?.config || "numeric" })}
                                    </Button>
                                );
                            }}
                        />
                    </>
                }

                {type === "datetime" && (
                    <Box flexDir="row" p={3} gap={12} alignItems="center">
                        <Stepper
                            value={hour!}
                            min={0}
                            max={23}
                            borderWidth={1}
                            borderColor="light"
                            rounded={2}
                            maxValue={new Date(((state.draft as any)?.start || state.draft)?.timestamp).setHours(((state.draft as any)?.start || state.draft)?.hour + 1) > state.max?.timestamp}
                            minValue={new Date(((state.draft as any)?.start || state.draft)?.timestamp).setHours(((state.draft as any)?.start || state.draft)?.hour - 1) < state.min?.timestamp}
                            onChange={v => adjustTime("hour", v - hour!)}
                            format={h =>
                                new Date(year!, month!, day!, h, minute!).toLocaleTimeString(
                                    _time?.locale || locale,
                                    { hour: _time?.config?.hour || "2-digit", hourCycle: _time?.config?.hourCycle || 'h24' }
                                )
                            }
                            colorScheme={colorScheme}
                        />
                        :
                        <Stepper
                            value={minute!}
                            min={0}
                            max={59}
                            borderWidth={1}
                            borderColor="light"
                            rounded={2}
                            maxValue={((state.draft as any)?.start || state.draft)?.timestamp >= state.max?.timestamp}
                            minValue={((state.draft as any)?.start || state.draft)?.timestamp <= state.min?.timestamp}
                            onChange={v => adjustTime("minute", v - minute!)}
                            format={m =>
                                new Date(year!, month!, day!, hour!, m).toLocaleTimeString(
                                    _time?.locale || locale,
                                    { minute: _time?.config?.minute || "2-digit" }
                                )
                            }
                            colorScheme={colorScheme}
                        />
                    </Box>
                )}

                {(type == 'month-year' || type == 'year' || type == 'month') &&
                    <Box flexDir="row" px={1} pt={4}>
                        {(type == 'month-year' || type == 'year') &&
                            <ListYears
                                year={(state.draft as any)?.year}
                                colorScheme={colorScheme}
                                onChange={e => {
                                    const date = toDetails(new Date(e, (state.draft as any)?.month || 0), defaultCfg)
                                    setPart('draft', date)
                                }}
                            />
                        }
                        {(type == 'month-year' || type == 'month') &&
                            <ListMonths
                                month={(state.draft as any)?.month}
                                locale={_months?.locale || locale}
                                config={_months?.config}
                                colorScheme={colorScheme}
                                onChange={e => {
                                    const date = toDetails(new Date((state.draft as any)?.year || 0, e), defaultCfg)
                                    setPart('draft', date)
                                }}
                            />
                        }
                    </Box>
                }

                {type == 'time' &&
                    <Box flexDir="row" px={1} pt={4}>
                        <ListHours
                            hour={(state.draft as any)?.hour}
                            colorScheme={colorScheme}
                            locale={locale}
                            config={_time?.config}
                            onChange={e => {
                                const date = toDetails(new Date(2000, 0, 1, e, (state.draft as any)?.minute || 0), defaultCfg)
                                setPart('draft', { ...date, minute: (state.draft as any)?.minute })
                            }}
                        />
                        <ListMinutes
                            minute={(state.draft as any)?.minute}
                            colorScheme={colorScheme}
                            locale={locale}
                            config={_time?.config}
                            onChange={e => {
                                const date = toDetails(new Date(2000, 0, 1, (state.draft as any)?.hour || 0, e), defaultCfg)
                                setPart('draft', { ...date, hour: (state.draft as any)?.hour })
                            }}
                        />
                    </Box>
                }

                {type == 'weekday' &&
                    <Box px={1} pt={4}>
                        <ListWeekDays
                            weekday={(state.draft as any)?.weekday}
                            colorScheme={colorScheme}
                            locale={locale}
                            config={_time?.config}
                            onChange={e => {
                                const date = toDetails(new Date(2012, 0, e), defaultCfg)
                                setPart('draft', date)
                            }}
                        />
                    </Box>
                }

                <Box flexDir="row" p={3} mt={1} style={{ gap: 12 }}>
                    <Button
                        variant="outline"
                        colorScheme={colorScheme}
                        flex={1}
                        children="Cancel"
                        {..._buttonCancel}
                        onPress={() => modal.current?.close()}
                    />
                    <Button
                        flex={1}
                        colorScheme={colorScheme}
                        children="Done"
                        {..._buttonDone}
                        onPress={commit}
                    />
                </Box>
            </Modal>
        </>
    );
}

const ListYears = ({ year, onChange, colorScheme, offset = 3 }) => {
    const [years, setYears] = useState<number[]>(
        year ? Array.from({ length: 10 }, (_, i) => year + i) : Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i)
    )
    const flRef = useRef<BSFlatListInstance<number>>(null)

    return (
        <FlatList
            ref={flRef}
            data={years}
            style={{ height: 365 }}
            initialNumToRender={1}
            maxToRenderPerBatch={10}
            updateCellsBatchingPeriod={10}
            windowSize={2}
            removeClippedSubviews
            contentContainerStyle={{ padding: 8 }}
            onStartReached={e => {
                if (years[0] == 0) return
                setYears([...Array.from({ length: 1 * offset }, (_, i) => years[0] - (i + 1)).reverse().filter(x => x > -1), ...years])
                flRef.current.scrollToOffset({ animated: false, offset: 42 * offset })
            }}
            onEndReached={e => {
                setYears([...years, ...Array.from({ length: 10 }, (_, i) => years.at(-1) + (i + 1))])
            }}
            scrollEventThrottle={16}
            renderItem={({ item }) => {
                return (
                    <Button
                        variant={year == item ? "solid" : "ghost"}
                        colorScheme={colorScheme}
                        h={42}
                        onPress={() => onChange(item)}
                    >
                        {item}
                    </Button>
                )
            }}
        />
    )
}

const ListMonths = ({ locale, config, month, onChange, colorScheme }) => {
    return (
        <FlatList
            data={Array.from({ length: 12 }, (_, i) => new Date(0, i).toLocaleString(locale, { month: config || "long" }))}
            style={{ height: 365 }}
            initialNumToRender={1}
            maxToRenderPerBatch={10}
            updateCellsBatchingPeriod={10}
            windowSize={2}
            contentContainerStyle={{ padding: 8 }}
            renderItem={({ item, index }) => {
                return (
                    <Button
                        variant={month == index ? "solid" : "ghost"}
                        colorScheme={colorScheme}
                        h={42}
                        onPress={() => onChange(index)}
                    >
                        {item}
                    </Button>
                )
            }}
        />
    )
}

const ListHours = ({ locale, config, hour, onChange, colorScheme }) => {
    return (
        <FlatList
            data={Array(24)}
            style={{ height: 365 }}
            initialNumToRender={1}
            maxToRenderPerBatch={10}
            updateCellsBatchingPeriod={10}
            windowSize={2}
            contentContainerStyle={{ padding: 8 }}
            renderItem={({ index }) => {
                return (
                    <Button
                        variant={hour == index ? "solid" : "ghost"}
                        colorScheme={colorScheme}
                        h={42}
                        onPress={() => onChange(index)}
                    >
                        {new Date(2000, 0, 1, index).toLocaleString(locale, { hour: config?.hour || "2-digit", hourCycle: config?.hourCycle || 'h24' }).padStart(2, '0')}
                    </Button>
                )
            }}
        />
    )
}

const ListMinutes = ({ locale, config, minute, onChange, colorScheme }) => {
    return (
        <FlatList
            data={Array(60)}
            style={{ height: 365 }}
            initialNumToRender={1}
            maxToRenderPerBatch={10}
            updateCellsBatchingPeriod={10}
            windowSize={2}
            contentContainerStyle={{ padding: 8 }}
            renderItem={({ index }) => {
                return (
                    <Button
                        variant={minute == index ? "solid" : "ghost"}
                        colorScheme={colorScheme}
                        h={42}
                        onPress={() => onChange(index)}
                    >
                        {new Date(2000, 0, 1, 0, index).toLocaleString(locale, { minute: config?.minute || "2-digit" }).padStart(2, '0')}
                    </Button>
                )
            }}
        />
    )
}

const ListWeekDays = ({ locale, config, weekday, onChange, colorScheme }) => {
    return (
        <FlatList
            data={Array(7)}
            initialNumToRender={1}
            maxToRenderPerBatch={10}
            updateCellsBatchingPeriod={10}
            windowSize={2}
            contentContainerStyle={{ padding: 8 }}
            renderItem={({ index }) => {
                return (
                    <Button
                        variant={weekday == index ? "solid" : "ghost"}
                        colorScheme={colorScheme}
                        h={42}
                        onPress={() => onChange(index + 1)}
                    >
                        {new Date(2012, 0, index + 1).toLocaleString(locale, { weekday: config || 'long' })}
                    </Button>
                )
            }}
        />
    )
}