import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { AccessibilityActionEvent, Animated, LayoutChangeEvent, PanResponder, StyleSheet, View } from "react-native";
import { Box, EABoxProps } from "./Box";
import { EATextProps, Text } from "./Text";
import { Label } from "./Label";
import { COLOR_SCHEME } from "./theme";
import { useThemeProps } from "./utils/useThemeProps";
import { DEFAULT_PROPS } from "./utils/DEFAULT_PROPS";

export type SliderValue = number | [number, number];
export type SliderMark = number | { value: number; label?: string };

export type SliderProps = Omit<EABoxProps, 'children'> & {
    /** Valor (controlado). Un número, o [desde, hasta] para un rango con dos tiradores */
    value?: SliderValue;
    /** Valor inicial (sin controlar). Por defecto min (o [min, max] con range) */
    defaultValue?: SliderValue;
    /** Rango con dos tiradores aunque no haya value / defaultValue */
    range?: boolean;
    /** Por defecto 0 */
    min?: number;
    /** Por defecto 100 */
    max?: number;
    /** Salto entre valores. Por defecto 1 (0 = continuo) */
    step?: number;
    /** Rango: distancia mínima entre los dos tiradores. Por defecto 0 */
    minDistance?: number;
    /** Mientras se arrastra (en cada cambio de valor) */
    onChange?: (value: any) => void;
    /** Al soltar */
    onChangeEnd?: (value: any) => void;
    onChangeStart?: (value: any) => void;
    disabled?: boolean;
    /** Color del relleno y del borde del tirador. Por defecto primary */
    colorScheme?: COLOR_SCHEME;
    size?: 'sm' | 'md' | 'lg';
    /** Burbuja con el valor encima del tirador: siempre (true) o solo al arrastrar ('drag') */
    showValue?: boolean | 'drag';
    /** El texto del valor (burbuja, mínimo / máximo y marcas) */
    formatValue?: (value: number) => string;
    /** Marcas debajo: true = en cada step (si son pocas), o una lista de valores / { value, label } */
    marks?: boolean | SliderMark[];
    /** El mínimo y el máximo debajo, a los lados */
    showMinMax?: boolean;
    label?: string;
    isRequired?: boolean;
    /** El valor a la derecha del label */
    showLabelValue?: boolean;
    _label?: EATextProps;
    /** El carril (sin rellenar) */
    _track?: EABoxProps;
    /** La parte rellena */
    _fill?: EABoxProps;
    _thumb?: EABoxProps;
    /** La burbuja del valor (_text para su texto) */
    _tooltip?: EABoxProps;
    _mark?: EATextProps;
    variant?: 'default' | 'filled' | 'outline' | (string & {});
};

export type SliderRef = {
    /** Cambia el valor (sin llamar a onChange) */
    setValue: (value: SliderValue) => void;
    getValue: () => SliderValue;
};

const SIZES = { sm: { track: 4, thumb: 16 }, md: { track: 6, thumb: 22 }, lg: { track: 8, thumb: 28 } };

// Variantes: cómo es el tirador
const SLIDER_VARIANTS: Record<string, SliderProps> = {
    /** Blanco con sombra */
    default: {},
    /** Del color del relleno */
    filled: { _thumb: { bg: '__fill__' } },
    /** Con borde del color */
    outline: { _thumb: { borderWidth: 2, borderColor: '__fill__', shadow: 'none' } },
};

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export const Slider = forwardRef<SliderRef, SliderProps>((rawProps, ref) => {
    const [{
        value, defaultValue, range: rangeProp, min = 0, max = 100, step = 1, minDistance = 0, onChange, onChangeEnd, onChangeStart,
        disabled, colorScheme = 'primary', size = 'md', showValue = false, formatValue = v => String(v), marks, showMinMax,
        label, isRequired, showLabelValue, _label, _track, _fill, _thumb, _tooltip, _mark, variant: _variant, ...boxProps
    }, theme] = useThemeProps<SliderProps>('Slider', rawProps, { variants: SLIDER_VARIANTS });

    const range = rangeProp ?? (Array.isArray(value ?? defaultValue));
    const color = (c?: string) => (c ? theme.colors?.[c as keyof typeof theme.colors] ?? c : undefined);
    const fillColor = color(String(_fill?.bg ?? `${colorScheme}.100`))!;
    const { track: trackH, thumb: thumbSize } = SIZES[size] ?? SIZES.md;

    // Normaliza: dentro de [min, max], en el step, y el rango ordenado y con su distancia mínima
    const snap = (v: number) => {
        const s = step > 0 ? Math.round((v - min) / step) * step + min : v;
        return clamp(Number(s.toFixed(10)), min, max);
    };
    const normalize = (v: SliderValue | undefined): [number, number] => {
        if (Array.isArray(v)) { const a = snap(Math.min(v[0], v[1])), b = snap(Math.max(v[0], v[1])); return [a, Math.max(b, a)]; }
        if (v == null) return range ? [min, max] : [snap(min), snap(min)];
        return [snap(v), snap(v)];
    };
    const out = (v: [number, number]): SliderValue => (range ? [v[0], v[1]] : v[1]);

    const controlled = value !== undefined;
    const [vals, setVals] = useState<[number, number]>(() => normalize(controlled ? value : defaultValue));
    const valsRef = useRef(vals);
    const [width, setWidth] = useState(0);
    const widthRef = useRef(0);
    const [dragging, setDragging] = useState<0 | 1 | null>(null);

    // Posición en px de cada tirador (0 = el de abajo del rango; 1 = el de arriba, o el único)
    const pos = useRef([new Animated.Value(0), new Animated.Value(0)]).current;
    const toPx = (v: number) => (max === min ? 0 : ((v - min) / (max - min)) * widthRef.current);
    const place = (v: [number, number]) => { pos[0].setValue(toPx(v[0])); pos[1].setValue(toPx(v[1])); };
    const commit = (v: [number, number]) => { valsRef.current = v; setVals(v); place(v); };
    // Mientras se arrastra, los tiradores se mueven sin repintar (Animated). Solo se repinta si algo enseña el valor
    // (burbuja, valor del label, marcas), y como mucho una vez por fotograma
    const frame = useRef<number | null>(null);
    const scheduled = useRef(false);
    const live = useRef(false);
    const commitDrag = (v: [number, number]) => {
        valsRef.current = v; place(v);
        if (!live.current || scheduled.current) return;
        scheduled.current = true;
        frame.current = requestAnimationFrame(() => { scheduled.current = false; frame.current = null; setVals(valsRef.current); });
    };
    useEffect(() => () => { if (frame.current != null) cancelAnimationFrame(frame.current); }, []);

    // Controlado: el valor de fuera manda (si no se está arrastrando)
    // (al soltar también: si el padre no aceptó el valor, vuelve al suyo)
    const external = controlled ? JSON.stringify(normalize(value)) : null;
    const [released, setReleased] = useState(0);
    useEffect(() => { if (external && dragging == null) commit(JSON.parse(external)); }, [external, dragging, released]);
    useEffect(() => { place(valsRef.current); }, [width, min, max]);

    useImperativeHandle(ref, () => ({ setValue: v => commit(normalize(v)), getValue: () => out(valsRef.current) }));

    // El gesto lee siempre lo último (el PanResponder se crea una vez)
    const live0 = showValue !== false || !!showLabelValue || !!marks;
    const latest = useRef({ onChange, onChangeEnd, onChangeStart, disabled, range, minDistance, controlled, live: live0 });
    latest.current = { onChange, onChangeEnd, onChangeStart, disabled, range, minDistance, controlled, live: live0 };
    const drag = useRef({ thumb: 1 as 0 | 1, startX: 0, start: [0, 0] as [number, number] });

    const end = () => {
        if (frame.current != null) cancelAnimationFrame(frame.current);
        frame.current = null; scheduled.current = false;
        setVals(valsRef.current);
        setDragging(null);
        setReleased(r => r + 1);
        latest.current.onChangeEnd?.(out(valsRef.current));
    };

    const valueAt = (x: number) => snap(min + (clamp(x, 0, widthRef.current) / (widthRef.current || 1)) * (max - min));
    const moveTo = (x: number) => {
        const { thumb } = drag.current;
        const cur = valsRef.current;
        let v = valueAt(x);
        let next: [number, number];
        if (!latest.current.range) next = [v, v];
        else if (thumb === 0) { v = Math.min(v, cur[1] - latest.current.minDistance); next = [Math.max(min, v), cur[1]]; }
        else { v = Math.max(v, cur[0] + latest.current.minDistance); next = [cur[0], Math.min(max, v)]; }
        if (next[0] === cur[0] && next[1] === cur[1]) return;
        // Controlado: se mueve igual mientras se arrastra (al soltar, manda el value de fuera)
        commitDrag(next);
        latest.current.onChange?.(out(next));
    };

    const responder = useMemo(() => PanResponder.create({
        onStartShouldSetPanResponder: () => !latest.current.disabled,
        // Horizontal: el slider se queda el gesto; vertical: lo deja para el scroll
        onMoveShouldSetPanResponder: (_, g) => !latest.current.disabled && Math.abs(g.dx) > Math.abs(g.dy),
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: e => {
            const x = e.nativeEvent.locationX - thumbSize / 2;
            const cur = valsRef.current;
            // Rango: el tirador más cercano (si están juntos, el que puede moverse hacia donde se toca)
            let thumb: 0 | 1 = 1;
            if (latest.current.range) {
                const d0 = Math.abs(toPx(cur[0]) - x), d1 = Math.abs(toPx(cur[1]) - x);
                thumb = d0 < d1 || (d0 === d1 && x < toPx(cur[0])) ? 0 : 1;
            }
            drag.current = { thumb, startX: x, start: cur };
            live.current = latest.current.live;
            setDragging(thumb);
            latest.current.onChangeStart?.(out(cur));
            moveTo(x);
        },
        onPanResponderMove: (_, g) => moveTo(drag.current.startX + g.dx),
        onPanResponderRelease: () => end(),
        onPanResponderTerminate: () => end(),
    }), [thumbSize, min, max, step, range]);

    const onLayout = (e: LayoutChangeEvent) => {
        const w = Math.max(0, e.nativeEvent.layout.width - thumbSize);
        widthRef.current = w;
        setWidth(w);
    };

    // Accesibilidad (un solo valor): deslizar arriba / abajo con el lector de pantalla
    const onAccessibilityAction = (e: AccessibilityActionEvent) => {
        const inc = step > 0 ? step : (max - min) / 20;
        const cur = valsRef.current[1];
        const v = snap(e.nativeEvent.actionName === 'increment' ? cur + inc : cur - inc);
        if (v === cur) return;
        const next: [number, number] = [v, v];
        commit(next);
        onChange?.(out(next)); onChangeEnd?.(out(next));
    };

    // Marcas
    const markList = useMemo((): { value: number; label?: string }[] => {
        if (!marks) return [];
        if (marks === true) {
            const n = step > 0 ? Math.floor((max - min) / step) : 0;
            return n > 0 && n <= 20 ? Array.from({ length: n + 1 }, (_, i) => ({ value: snap(min + i * step) })) : [];
        }
        return marks.map(m => (typeof m === 'number' ? { value: m } : m)).filter(m => m.value >= min && m.value <= max);
    }, [marks, min, max, step]);

    const track = StyleSheet.flatten(DEFAULT_PROPS({ bg: 'light.100', rounded: 40, ..._track } as any, theme));
    const fill = StyleSheet.flatten(DEFAULT_PROPS({ rounded: 40, ..._fill, bg: undefined } as any, theme));
    const thumbProps = { ..._thumb, bg: _thumb?.bg === '__fill__' ? fillColor : _thumb?.bg ?? 'white', borderColor: _thumb?.borderColor === '__fill__' ? fillColor : _thumb?.borderColor };
    // Deshabilitado, sin sombra (con la opacidad, en Android deja un halo)
    const thumbStyle = StyleSheet.flatten(DEFAULT_PROPS({ shadow: disabled ? 'none' : 2, ...thumbProps } as any, theme));
    // La burbuja: del color del texto (oscura en claro, clara en oscuro)
    const tooltip = StyleSheet.flatten(DEFAULT_PROPS({ bg: 'text', rounded: 2, px: 2, py: 1, ..._tooltip } as any, theme));
    const tooltipText = _tooltip?._text;
    const height = Math.max(thumbSize, 32);
    const top = (height - trackH) / 2;
    const label0 = formatValue(vals[0]), label1 = formatValue(vals[1]);

    const renderThumb = (i: 0 | 1) => {
        const show = showValue === true || (showValue === 'drag' && dragging === i);
        return (
            <Animated.View key={i} pointerEvents="none" style={{
                position: 'absolute', left: 0, top: (height - thumbSize) / 2, width: thumbSize, height: thumbSize,
                transform: [{ translateX: pos[i] }, { scale: dragging === i ? 1.12 : 1 }],
                zIndex: dragging === i ? 3 : 2,
            }}>
                <View style={[{ width: thumbSize, height: thumbSize, borderRadius: thumbSize / 2 }, thumbStyle]} />
                {show && (
                    <View style={{ position: 'absolute', bottom: thumbSize + 6, left: -40, right: -40, alignItems: 'center' }}>
                        <View style={tooltip}>
                            <Text fontSize={12} fontWeight="600" color="background" {...tooltipText}>{i === 0 ? label0 : label1}</Text>
                        </View>
                    </View>
                )}
            </Animated.View>
        );
    };

    const fillLeft = range ? pos[0] : 0;
    const fillWidth = range ? Animated.subtract(pos[1], pos[0]) : pos[1];

    return (
        <Box opacity={disabled ? 0.5 : 1} {...boxProps}>
            {(label || showLabelValue) && (
                <Box flexDir="row" alignItems="center" mb={showValue === true ? 6 : 1}>
                    <Box flex={1}>{label ? <Label isRequired={isRequired} {..._label}>{label}</Label> : null}</Box>
                    {showLabelValue && <Text fontWeight="600" fontSize={13} color="text.muted">{range ? `${label0} – ${label1}` : label1}</Text>}
                </Box>
            )}
            {!label && !showLabelValue && showValue === true && <Box h={6} />}
            <View
                {...responder.panHandlers}
                onLayout={onLayout}
                style={{ height, justifyContent: 'center' }}
                accessible
                accessibilityRole="adjustable"
                accessibilityLabel={label}
                accessibilityState={{ disabled: !!disabled }}
                accessibilityValue={range ? { text: `${label0} – ${label1}` } : { min, max, now: vals[1], text: label1 }}
                accessibilityActions={range ? undefined : [{ name: 'increment' }, { name: 'decrement' }]}
                onAccessibilityAction={range ? undefined : onAccessibilityAction}
            >
                <View pointerEvents="none" style={[{ position: 'absolute', left: thumbSize / 2, right: thumbSize / 2, top, height: trackH }, track]} />
                <Animated.View pointerEvents="none" style={[{
                    position: 'absolute', top, height: trackH, left: thumbSize / 2, width: fillWidth, backgroundColor: fillColor,
                    transform: [{ translateX: fillLeft }],
                }, fill]} />
                {markList.map(m => (
                    <View key={m.value} pointerEvents="none" style={{
                        position: 'absolute', top: top + trackH / 2 - 2, width: 4, height: 4, borderRadius: 2,
                        left: thumbSize / 2 + toPx(m.value) - 2,
                        // Dentro del relleno, clara; fuera, gris
                        backgroundColor: (range ? m.value >= vals[0] && m.value <= vals[1] : m.value <= vals[1]) ? 'rgba(255,255,255,0.7)' : color('silver.100'),
                    }} />
                ))}
                {range && renderThumb(0)}
                {renderThumb(1)}
            </View>
            {(showMinMax || markList.some(m => m.label != null)) && (
                <View style={{ height: 18, marginHorizontal: thumbSize / 2 }}>
                    {showMinMax && <Text variant="caption" position="absolute" left={0} {..._mark}>{formatValue(min)}</Text>}
                    {showMinMax && <Text variant="caption" position="absolute" right={0} {..._mark}>{formatValue(max)}</Text>}
                    {markList.filter(m => m.label != null).map(m => (
                        <View key={m.value} style={{ position: 'absolute', left: toPx(m.value) - 40, width: 80, alignItems: 'center' }}>
                            <Text variant="caption" {..._mark}>{m.label}</Text>
                        </View>
                    ))}
                </View>
            )}
        </Box>
    );
});
