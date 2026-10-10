// Carousel: diapositivas que se deslizan, con pestañas, flechas, puntos, autoplay, bucle, varias por vista (asomando las
// de al lado) y efecto al pasar (escala / opacidad). Con hijos <Carousel.Item tab="…"> o con data + renderItem
import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { FlatList as RNFlatList, ListRenderItemInfo, ScrollView as RNScrollView, StyleSheet, View } from 'react-native';
import Animated, { Extrapolation, interpolate, SharedValue, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { Box, EABoxProps } from './Box';
import { Button, EAButtonProps } from './Button';
import { EAFlatListProps } from './FlatList';
import { Icon } from './Icon';
import { Pressable } from './Pressable';
import { DEFAULT_PROPS } from './utils/DEFAULT_PROPS';
import { useThemeProps } from './utils/useThemeProps';

export type CarouselRef = {
    /** Va a una diapositiva (desde 0) */
    goTo: (index: number, animated?: boolean) => void;
    next: () => void;
    prev: () => void;
    getIndex: () => number;
};

export type CarouselType<T = any> = EABoxProps & {
    /** En lugar de hijos: los datos y cómo pintar cada uno */
    data?: T[];
    renderItem?: (item: T, index: number) => React.ReactNode;
    keyExtractor?: (item: T, index: number) => string;
    /** Texto de la pestaña de cada dato (con data) */
    tabLabel?: (item: T, index: number) => string;
    /** Diapositiva visible (controlada) */
    index?: number;
    /** Con la que empieza (no controlada). Por defecto 0 */
    defaultIndex?: number;
    onIndexChange?: (index: number) => void;
    /** Pestañas. Por defecto, si algún item tiene `tab` (o hay tabLabel) */
    tabs?: boolean;
    tabsPosition?: 'top' | 'bottom';
    /** Flechas a los lados. Por defecto true */
    arrows?: boolean;
    /** Puntos abajo. Por defecto cuando no hay pestañas */
    dots?: boolean;
    /** Pasar solas cada X ms (true = 4000). Se para mientras se toca */
    autoplay?: boolean | number;
    /** Al llegar al final vuelve al principio (flechas, autoplay y next / prev). Por defecto false */
    loop?: boolean;
    /** Cuántas se ven a la vez (1.2 = una y un trozo de la siguiente). Por defecto 1 */
    itemsPerView?: number;
    /** Separación entre diapositivas (px). Por defecto 0 */
    gap?: number;
    /** Margen a los lados (px): con itemsPerView 1 deja ver un trozo de las de al lado, centrada. Por defecto 0 */
    inset?: number;
    /** Efecto al pasar: las de al lado más pequeñas ('scale') o más transparentes ('fade') */
    effect?: 'none' | 'scale' | 'fade';
    /** Deslizar con el dedo. Por defecto true */
    swipeEnabled?: boolean;
    _contentStyle?: Partial<EAFlatListProps<any>>;
    _contentTabStyle?: EABoxProps;
    _tabStyle?: EAButtonProps;
    _tabActiveStyle?: EAButtonProps;
    _arrow?: EAButtonProps;
    _dots?: EABoxProps;
    _dot?: EABoxProps;
    _dotActive?: EABoxProps;
    /** Estilo de cada diapositiva */
    _item?: EABoxProps;
    variant?: (string & {});
};

export type EACarouselItem = EABoxProps & {
    /** Texto de su pestaña */
    tab?: string;
};

const CarouselItem: React.FC<EACarouselItem> = () => null;

type Slide = { key: string; tab?: string; render: () => React.ReactNode; props?: EABoxProps };

/** Una diapositiva con el efecto según lo lejos que esté de las que se ven enteras */
const AnimatedSlide = ({ index, step, perView, scrollX, effect, width, children }: { index: number; step: number; perView: number; scrollX: SharedValue<number>; effect: 'none' | 'scale' | 'fade'; width: number; children: React.ReactNode }) => {
    const style = useAnimatedStyle(() => {
        if (effect === 'none' || !step) return {};
        const pos = scrollX.value / step, last = pos + Math.max(1, Math.floor(perView)) - 1;
        const d = index < pos ? pos - index : index > last ? index - last : 0;
        return effect === 'scale'
            ? { transform: [{ scale: interpolate(d, [0, 1], [1, 0.88], Extrapolation.CLAMP) }], opacity: interpolate(d, [0, 1], [1, 0.75], Extrapolation.CLAMP) }
            : { opacity: interpolate(d, [0, 1], [1, 0.35], Extrapolation.CLAMP) };
    }, [effect, step, index, perView]);
    return <Animated.View style={[{ width }, style]}>{children}</Animated.View>;
};

const CarouselBase = forwardRef<CarouselRef, CarouselType>((rawProps, ref) => {
    // Defaults → theme.components.Carousel → variante → props → plataforma
    const [{
        data, renderItem, keyExtractor, tabLabel, index: indexProp, defaultIndex = 0, onIndexChange,
        tabs: tabsProp, tabsPosition = 'top', arrows = true, dots: dotsProp, autoplay, loop = false,
        itemsPerView = 1, gap = 0, inset = 0, effect = 'none', swipeEnabled = true,
        _contentStyle, _contentTabStyle, _tabStyle, _tabActiveStyle, _arrow, _dots, _dot, _dotActive, _item,
        variant: _variant, children, ...props
    }, theme] = useThemeProps<CarouselType>('Carousel', rawProps);

    // Las diapositivas: de los hijos (ignorando null / false de los condicionales) o de data
    const slides: Slide[] = useMemo(() => data
        ? data.map((item, i) => ({ key: keyExtractor?.(item, i) ?? String(i), tab: tabLabel?.(item, i), render: () => renderItem?.(item, i) }))
        : React.Children.toArray(children).filter(React.isValidElement).map((child: any, i) => {
            const { tab, children: c, ...itemProps } = child.props ?? {};
            return { key: String(child.key ?? i), tab, props: itemProps, render: () => c };
        }), [data, children, renderItem, keyExtractor, tabLabel]);
    const count = slides.length;
    const tabs = tabsProp ?? slides.some(s => s.tab != null);
    const dots = dotsProp ?? !tabs;

    const list = useRef<RNFlatList<Slide>>(null);
    const tabScroll = useRef<RNScrollView>(null);
    const tabLayouts = useRef<{ x: number; width: number }[]>([]);
    const [width, setWidth] = useState(0);
    const itemWidth = width ? Math.max(1, (width - inset * 2 - gap * (Math.max(1, itemsPerView) - 1)) / itemsPerView) : 0;
    const step = itemWidth + gap;
    const maxIndex = Math.max(0, Math.ceil(count - itemsPerView - 1e-6));
    // Los temporizadores (autoplay) llaman a goTo de un render anterior: lo que usa va en un ref
    const geo = useRef({ step, maxIndex, loop });
    geo.current = { step, maxIndex, loop };
    const onChange = useRef(onIndexChange);
    onChange.current = onIndexChange;
    const clampIndex = (i: number) => Math.max(0, Math.min(geo.current.maxIndex, i));

    const [current, setCurrent] = useState(clampIndex(indexProp ?? defaultIndex));
    const currentRef = useRef(current);
    currentRef.current = current;
    const scrollX = useSharedValue(current * step);
    // Mientras se arrastra no avanza el autoplay
    const [dragging, setDragging] = useState(false);

    const select = (i: number) => {
        if (i === currentRef.current) return;
        currentRef.current = i;
        setCurrent(i);
        onChange.current?.(i);
    };
    const goTo = (target: number, animated = true) => {
        const { step: st, maxIndex: max, loop: lp } = geo.current;
        const i = clampIndex(lp ? ((target % (max + 1)) + max + 1) % (max + 1) : target);
        if (st) list.current?.scrollToOffset({ offset: i * st, animated });
        select(i);
    };
    useImperativeHandle(ref, () => ({ goTo, next: () => goTo(currentRef.current + 1), prev: () => goTo(currentRef.current - 1), getIndex: () => currentRef.current }));

    // Controlado: la prop manda
    useEffect(() => { if (indexProp != null && indexProp !== currentRef.current) goTo(indexProp) }, [indexProp]);
    // Al cambiar el ancho (girar el móvil...) se queda en la misma diapositiva
    useEffect(() => { if (step) { list.current?.scrollToOffset({ offset: currentRef.current * step, animated: false }); scrollX.value = currentRef.current * step } }, [step]);
    // Si quitan diapositivas, no quedarse fuera
    useEffect(() => { if (current > maxIndex) goTo(maxIndex, false) }, [maxIndex]);

    // Autoplay: se reinicia al cambiar de diapositiva y se para mientras se arrastra
    const interval = autoplay === true ? 4000 : typeof autoplay === 'number' ? autoplay : 0;
    useEffect(() => {
        if (!interval || count < 2 || dragging) return;
        const id = setTimeout(() => {
            if (!loop && currentRef.current >= maxIndex) goTo(0); else goTo(currentRef.current + 1);
        }, interval);
        return () => clearTimeout(id);
    }, [interval, current, count, loop, maxIndex, dragging]);

    // La pestaña activa, a la vista
    useEffect(() => {
        const l = tabLayouts.current[current];
        if (tabs && l) tabScroll.current?.scrollTo({ x: Math.max(0, l.x - 24), animated: true });
    }, [current, tabs]);

    const onScroll = useAnimatedScrollHandler({ onScroll: e => { scrollX.value = e.contentOffset.x } });
    // La diapositiva actual al terminar de deslizar (y al soltar sin inercia)
    const settle = (x: number) => { setDragging(false); if (step) select(clampIndex(Math.round(x / step))) };

    const listStyle = StyleSheet.flatten(DEFAULT_PROPS(_contentStyle ?? {}, theme));
    const contentStyles = DEFAULT_PROPS(_contentStyle?._contentContainerStyle ?? {}, theme);
    const canPrev = loop ? count > 1 : current > 0;
    const canNext = loop ? count > 1 : current < maxIndex;

    const tabBar = tabs && count > 0 ? (
        <Box {..._contentTabStyle}>
            <RNScrollView ref={tabScroll} horizontal showsHorizontalScrollIndicator={false}
                contentContainerStyle={StyleSheet.flatten([{ flexGrow: 1, justifyContent: 'center', gap: 4, padding: 8 }, ...DEFAULT_PROPS((_contentTabStyle as any)?._contentContainerStyle ?? {}, theme)])}>
                {slides.map((s, i) => (
                    <View key={s.key} onLayout={e => { tabLayouts.current[i] = { x: e.nativeEvent.layout.x, width: e.nativeEvent.layout.width } }}>
                        <Button
                            variant={i === current ? 'solid' : 'outline'}
                            borderWidth={1}
                            borderColor={i === current ? 'transparent' : 'light.100'}
                            p={6.5}
                            rounded={40}
                            accessibilityRole="tab"
                            accessibilityState={{ selected: i === current }}
                            onPress={() => goTo(i)}
                            children={s.tab ?? String(i + 1)}
                            {..._tabStyle}
                            {...(i === current ? _tabActiveStyle : null)}
                        />
                    </View>
                ))}
            </RNScrollView>
        </Box>
    ) : null;

    return (
        <Box {...props}>
            {tabsPosition === 'top' && tabBar}
            <View style={{ flex: 1 }} onLayout={e => setWidth(e.nativeEvent.layout.width)}>
                {width > 0 && (
                    <Animated.FlatList
                        ref={list as any}
                        data={slides}
                        keyExtractor={s => s.key}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        scrollEnabled={swipeEnabled}
                        // Una por vista sin márgenes: paginación nativa; si no, que encaje en cada diapositiva
                        pagingEnabled={itemsPerView === 1 && !gap && !inset}
                        snapToInterval={itemsPerView === 1 && !gap && !inset ? undefined : step}
                        snapToAlignment="start"
                        decelerationRate="fast"
                        disableIntervalMomentum
                        initialScrollIndex={current || undefined}
                        getItemLayout={(_, i) => ({ length: step, offset: inset + step * i, index: i })}
                        initialNumToRender={Math.ceil(itemsPerView) + 1}
                        maxToRenderPerBatch={3}
                        windowSize={5}
                        onScroll={onScroll}
                        scrollEventThrottle={16}
                        onScrollBeginDrag={() => setDragging(true)}
                        onScrollEndDrag={e => { if (!e.nativeEvent.velocity || Math.abs(e.nativeEvent.velocity.x) < 0.05) settle(e.nativeEvent.contentOffset.x) }}
                        onMomentumScrollEnd={e => settle(e.nativeEvent.contentOffset.x)}
                        ItemSeparatorComponent={gap ? () => <View style={{ width: gap }} /> : undefined}
                        renderItem={({ item, index }: ListRenderItemInfo<Slide>) => (
                            <AnimatedSlide index={index} step={step} perView={itemsPerView} scrollX={scrollX} effect={effect} width={itemWidth}>
                                <Box flex={1} {..._item} {...item.props}>{item.render()}</Box>
                            </AnimatedSlide>
                        )}
                        {...(_contentStyle as any)}
                        style={[{ flex: 1 }, listStyle]}
                        contentContainerStyle={[{ paddingHorizontal: inset }, ...contentStyles]}
                    />
                )}
                {arrows && count > 1 && canPrev && (
                    <Button variant="ghost" position="absolute" top="50%" mt={-5} left={4} w={40} h={40} rounded={40} p={0} bg="white.50"
                        accessibilityLabel="prev" onPress={() => goTo(current - 1)} icon={<Icon name="chevron-left" as="Feather" size={24} />} {..._arrow} />
                )}
                {arrows && count > 1 && canNext && (
                    <Button variant="ghost" position="absolute" top="50%" mt={-5} right={4} w={40} h={40} rounded={40} p={0} bg="white.50"
                        accessibilityLabel="next" onPress={() => goTo(current + 1)} icon={<Icon name="chevron-right" as="Feather" size={24} />} {..._arrow} />
                )}
            </View>
            {dots && maxIndex > 0 && (
                <Box flexDir="row" justifyContent="center" alignItems="center" gap={1.5} py={2} {..._dots}>
                    {Array.from({ length: maxIndex + 1 }, (_, i) => (
                        <Pressable key={i} onPress={() => goTo(i)} hitSlop={6} accessibilityRole="button" accessibilityLabel={`${i + 1}`} accessibilityState={{ selected: i === current }}>
                            <Box w={i === current ? 18 : 7} h={7} rounded={4} bg={i === current ? 'primary.100' : 'muted.100'} {..._dot} {...(i === current ? _dotActive : null)} />
                        </Pressable>
                    ))}
                </Box>
            )}
            {tabsPosition === 'bottom' && tabBar}
        </Box>
    );
});

type CarouselComponent = (<T = any>(props: CarouselType<T> & { ref?: React.Ref<CarouselRef> }) => React.ReactElement | null) & { Item: typeof CarouselItem };

export const Carousel = CarouselBase as unknown as CarouselComponent;
Carousel.Item = CarouselItem;
