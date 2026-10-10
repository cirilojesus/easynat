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
exports.Carousel = void 0;
// Carousel: diapositivas que se deslizan, con pestañas, flechas, puntos, autoplay, bucle, varias por vista (asomando las
// de al lado) y efecto al pasar (escala / opacidad). Con hijos <Carousel.Item tab="…"> o con data + renderItem
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const react_native_reanimated_1 = __importStar(require("react-native-reanimated"));
const Box_1 = require("./Box");
const Button_1 = require("./Button");
const Icon_1 = require("./Icon");
const Pressable_1 = require("./Pressable");
const DEFAULT_PROPS_1 = require("./utils/DEFAULT_PROPS");
const useThemeProps_1 = require("./utils/useThemeProps");
const CarouselItem = () => null;
/** Una diapositiva con el efecto según lo lejos que esté de las que se ven enteras */
const AnimatedSlide = ({ index, step, perView, scrollX, effect, width, children }) => {
    const style = (0, react_native_reanimated_1.useAnimatedStyle)(() => {
        if (effect === 'none' || !step)
            return {};
        const pos = scrollX.value / step, last = pos + Math.max(1, Math.floor(perView)) - 1;
        const d = index < pos ? pos - index : index > last ? index - last : 0;
        return effect === 'scale'
            ? { transform: [{ scale: (0, react_native_reanimated_1.interpolate)(d, [0, 1], [1, 0.88], react_native_reanimated_1.Extrapolation.CLAMP) }], opacity: (0, react_native_reanimated_1.interpolate)(d, [0, 1], [1, 0.75], react_native_reanimated_1.Extrapolation.CLAMP) }
            : { opacity: (0, react_native_reanimated_1.interpolate)(d, [0, 1], [1, 0.35], react_native_reanimated_1.Extrapolation.CLAMP) };
    }, [effect, step, index, perView]);
    return <react_native_reanimated_1.default.View style={[{ width }, style]}>{children}</react_native_reanimated_1.default.View>;
};
const CarouselBase = (0, react_1.forwardRef)((rawProps, ref) => {
    var _a, _b;
    // Defaults → theme.components.Carousel → variante → props → plataforma
    const [_c, theme] = (0, useThemeProps_1.useThemeProps)('Carousel', rawProps), { data, renderItem, keyExtractor, tabLabel, index: indexProp, defaultIndex = 0, onIndexChange, tabs: tabsProp, tabsPosition = 'top', arrows = true, dots: dotsProp, autoplay, loop = false, itemsPerView = 1, gap = 0, inset = 0, effect = 'none', swipeEnabled = true, _contentStyle, _contentTabStyle, _tabStyle, _tabActiveStyle, _arrow, _dots, _dot, _dotActive, _item, variant: _variant, children } = _c, props = __rest(_c, ["data", "renderItem", "keyExtractor", "tabLabel", "index", "defaultIndex", "onIndexChange", "tabs", "tabsPosition", "arrows", "dots", "autoplay", "loop", "itemsPerView", "gap", "inset", "effect", "swipeEnabled", "_contentStyle", "_contentTabStyle", "_tabStyle", "_tabActiveStyle", "_arrow", "_dots", "_dot", "_dotActive", "_item", "variant", "children"]);
    // Las diapositivas: de los hijos (ignorando null / false de los condicionales) o de data
    const slides = (0, react_1.useMemo)(() => data
        ? data.map((item, i) => { var _a; return ({ key: (_a = keyExtractor === null || keyExtractor === void 0 ? void 0 : keyExtractor(item, i)) !== null && _a !== void 0 ? _a : String(i), tab: tabLabel === null || tabLabel === void 0 ? void 0 : tabLabel(item, i), render: () => renderItem === null || renderItem === void 0 ? void 0 : renderItem(item, i) }); })
        : react_1.default.Children.toArray(children).filter(react_1.default.isValidElement).map((child, i) => {
            var _a, _b;
            const _c = (_a = child.props) !== null && _a !== void 0 ? _a : {}, { tab, children: c } = _c, itemProps = __rest(_c, ["tab", "children"]);
            return { key: String((_b = child.key) !== null && _b !== void 0 ? _b : i), tab, props: itemProps, render: () => c };
        }), [data, children, renderItem, keyExtractor, tabLabel]);
    const count = slides.length;
    const tabs = tabsProp !== null && tabsProp !== void 0 ? tabsProp : slides.some(s => s.tab != null);
    const dots = dotsProp !== null && dotsProp !== void 0 ? dotsProp : !tabs;
    const list = (0, react_1.useRef)(null);
    const tabScroll = (0, react_1.useRef)(null);
    const tabLayouts = (0, react_1.useRef)([]);
    const [width, setWidth] = (0, react_1.useState)(0);
    const itemWidth = width ? Math.max(1, (width - inset * 2 - gap * (Math.max(1, itemsPerView) - 1)) / itemsPerView) : 0;
    const step = itemWidth + gap;
    const maxIndex = Math.max(0, Math.ceil(count - itemsPerView - 1e-6));
    // Los temporizadores (autoplay) llaman a goTo de un render anterior: lo que usa va en un ref
    const geo = (0, react_1.useRef)({ step, maxIndex, loop });
    geo.current = { step, maxIndex, loop };
    const onChange = (0, react_1.useRef)(onIndexChange);
    onChange.current = onIndexChange;
    const clampIndex = (i) => Math.max(0, Math.min(geo.current.maxIndex, i));
    const [current, setCurrent] = (0, react_1.useState)(clampIndex(indexProp !== null && indexProp !== void 0 ? indexProp : defaultIndex));
    const currentRef = (0, react_1.useRef)(current);
    currentRef.current = current;
    const scrollX = (0, react_native_reanimated_1.useSharedValue)(current * step);
    // Mientras se arrastra no avanza el autoplay
    const [dragging, setDragging] = (0, react_1.useState)(false);
    const select = (i) => {
        var _a;
        if (i === currentRef.current)
            return;
        currentRef.current = i;
        setCurrent(i);
        (_a = onChange.current) === null || _a === void 0 ? void 0 : _a.call(onChange, i);
    };
    const goTo = (target, animated = true) => {
        var _a;
        const { step: st, maxIndex: max, loop: lp } = geo.current;
        const i = clampIndex(lp ? ((target % (max + 1)) + max + 1) % (max + 1) : target);
        if (st)
            (_a = list.current) === null || _a === void 0 ? void 0 : _a.scrollToOffset({ offset: i * st, animated });
        select(i);
    };
    (0, react_1.useImperativeHandle)(ref, () => ({ goTo, next: () => goTo(currentRef.current + 1), prev: () => goTo(currentRef.current - 1), getIndex: () => currentRef.current }));
    // Controlado: la prop manda
    (0, react_1.useEffect)(() => { if (indexProp != null && indexProp !== currentRef.current)
        goTo(indexProp); }, [indexProp]);
    // Al cambiar el ancho (girar el móvil...) se queda en la misma diapositiva
    (0, react_1.useEffect)(() => { var _a; if (step) {
        (_a = list.current) === null || _a === void 0 ? void 0 : _a.scrollToOffset({ offset: currentRef.current * step, animated: false });
        scrollX.value = currentRef.current * step;
    } }, [step]);
    // Si quitan diapositivas, no quedarse fuera
    (0, react_1.useEffect)(() => { if (current > maxIndex)
        goTo(maxIndex, false); }, [maxIndex]);
    // Autoplay: se reinicia al cambiar de diapositiva y se para mientras se arrastra
    const interval = autoplay === true ? 4000 : typeof autoplay === 'number' ? autoplay : 0;
    (0, react_1.useEffect)(() => {
        if (!interval || count < 2 || dragging)
            return;
        const id = setTimeout(() => {
            if (!loop && currentRef.current >= maxIndex)
                goTo(0);
            else
                goTo(currentRef.current + 1);
        }, interval);
        return () => clearTimeout(id);
    }, [interval, current, count, loop, maxIndex, dragging]);
    // La pestaña activa, a la vista
    (0, react_1.useEffect)(() => {
        var _a;
        const l = tabLayouts.current[current];
        if (tabs && l)
            (_a = tabScroll.current) === null || _a === void 0 ? void 0 : _a.scrollTo({ x: Math.max(0, l.x - 24), animated: true });
    }, [current, tabs]);
    const onScroll = (0, react_native_reanimated_1.useAnimatedScrollHandler)({ onScroll: e => { scrollX.value = e.contentOffset.x; } });
    // La diapositiva actual al terminar de deslizar (y al soltar sin inercia)
    const settle = (x) => { setDragging(false); if (step)
        select(clampIndex(Math.round(x / step))); };
    const listStyle = react_native_1.StyleSheet.flatten((0, DEFAULT_PROPS_1.DEFAULT_PROPS)(_contentStyle !== null && _contentStyle !== void 0 ? _contentStyle : {}, theme));
    const contentStyles = (0, DEFAULT_PROPS_1.DEFAULT_PROPS)((_a = _contentStyle === null || _contentStyle === void 0 ? void 0 : _contentStyle._contentContainerStyle) !== null && _a !== void 0 ? _a : {}, theme);
    const canPrev = loop ? count > 1 : current > 0;
    const canNext = loop ? count > 1 : current < maxIndex;
    const tabBar = tabs && count > 0 ? (<Box_1.Box {..._contentTabStyle}>
            <react_native_1.ScrollView ref={tabScroll} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={react_native_1.StyleSheet.flatten([{ flexGrow: 1, justifyContent: 'center', gap: 4, padding: 8 }, ...(0, DEFAULT_PROPS_1.DEFAULT_PROPS)((_b = _contentTabStyle === null || _contentTabStyle === void 0 ? void 0 : _contentTabStyle._contentContainerStyle) !== null && _b !== void 0 ? _b : {}, theme)])}>
                {slides.map((s, i) => {
            var _a;
            return (<react_native_1.View key={s.key} onLayout={e => { tabLayouts.current[i] = { x: e.nativeEvent.layout.x, width: e.nativeEvent.layout.width }; }}>
                        <Button_1.Button variant={i === current ? 'solid' : 'outline'} borderWidth={1} borderColor={i === current ? 'transparent' : 'light.100'} p={6.5} rounded={40} accessibilityRole="tab" accessibilityState={{ selected: i === current }} onPress={() => goTo(i)} children={(_a = s.tab) !== null && _a !== void 0 ? _a : String(i + 1)} {..._tabStyle} {...(i === current ? _tabActiveStyle : null)}/>
                    </react_native_1.View>);
        })}
            </react_native_1.ScrollView>
        </Box_1.Box>) : null;
    return (<Box_1.Box {...props}>
            {tabsPosition === 'top' && tabBar}
            <react_native_1.View style={{ flex: 1 }} onLayout={e => setWidth(e.nativeEvent.layout.width)}>
                {width > 0 && (<react_native_reanimated_1.default.FlatList ref={list} data={slides} keyExtractor={s => s.key} horizontal showsHorizontalScrollIndicator={false} scrollEnabled={swipeEnabled} 
        // Una por vista sin márgenes: paginación nativa; si no, que encaje en cada diapositiva
        pagingEnabled={itemsPerView === 1 && !gap && !inset} snapToInterval={itemsPerView === 1 && !gap && !inset ? undefined : step} snapToAlignment="start" decelerationRate="fast" disableIntervalMomentum initialScrollIndex={current || undefined} getItemLayout={(_, i) => ({ length: step, offset: inset + step * i, index: i })} initialNumToRender={Math.ceil(itemsPerView) + 1} maxToRenderPerBatch={3} windowSize={5} onScroll={onScroll} scrollEventThrottle={16} onScrollBeginDrag={() => setDragging(true)} onScrollEndDrag={e => { if (!e.nativeEvent.velocity || Math.abs(e.nativeEvent.velocity.x) < 0.05)
            settle(e.nativeEvent.contentOffset.x); }} onMomentumScrollEnd={e => settle(e.nativeEvent.contentOffset.x)} ItemSeparatorComponent={gap ? () => <react_native_1.View style={{ width: gap }}/> : undefined} renderItem={({ item, index }) => (<AnimatedSlide index={index} step={step} perView={itemsPerView} scrollX={scrollX} effect={effect} width={itemWidth}>
                                <Box_1.Box flex={1} {..._item} {...item.props}>{item.render()}</Box_1.Box>
                            </AnimatedSlide>)} {..._contentStyle} style={[{ flex: 1 }, listStyle]} contentContainerStyle={[{ paddingHorizontal: inset }, ...contentStyles]}/>)}
                {arrows && count > 1 && canPrev && (<Button_1.Button variant="ghost" position="absolute" top="50%" mt={-5} left={4} w={40} h={40} rounded={40} p={0} bg="white.50" accessibilityLabel="prev" onPress={() => goTo(current - 1)} icon={<Icon_1.Icon name="chevron-left" as="Feather" size={24}/>} {..._arrow}/>)}
                {arrows && count > 1 && canNext && (<Button_1.Button variant="ghost" position="absolute" top="50%" mt={-5} right={4} w={40} h={40} rounded={40} p={0} bg="white.50" accessibilityLabel="next" onPress={() => goTo(current + 1)} icon={<Icon_1.Icon name="chevron-right" as="Feather" size={24}/>} {..._arrow}/>)}
            </react_native_1.View>
            {dots && maxIndex > 0 && (<Box_1.Box flexDir="row" justifyContent="center" alignItems="center" gap={1.5} py={2} {..._dots}>
                    {Array.from({ length: maxIndex + 1 }, (_, i) => (<Pressable_1.Pressable key={i} onPress={() => goTo(i)} hitSlop={6} accessibilityRole="button" accessibilityLabel={`${i + 1}`} accessibilityState={{ selected: i === current }}>
                            <Box_1.Box w={i === current ? 18 : 7} h={7} rounded={4} bg={i === current ? 'primary.100' : 'muted.100'} {..._dot} {...(i === current ? _dotActive : null)}/>
                        </Pressable_1.Pressable>))}
                </Box_1.Box>)}
            {tabsPosition === 'bottom' && tabBar}
        </Box_1.Box>);
});
exports.Carousel = CarouselBase;
exports.Carousel.Item = CarouselItem;
