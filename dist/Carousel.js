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
const react_1 = require("react");
const FlatList_1 = require("./FlatList");
const Button_1 = require("./Button");
const react_native_reanimated_1 = __importStar(require("react-native-reanimated"));
const Box_1 = require("./Box");
const Icon_1 = require("./Icon");
const CarouselItem = () => null;
const BoxAnimated = react_native_reanimated_1.default.createAnimatedComponent(Box_1.Box);
const Carousel = (_a) => {
    var _b;
    var { tabs = true, arrows = true } = _a, props = __rest(_a, ["tabs", "arrows"]);
    const contentRef = (0, react_1.useRef)(null);
    const width = (0, react_native_reanimated_1.useSharedValue)(0);
    const i = (0, react_native_reanimated_1.useSharedValue)(0);
    const bodyStyle = (0, react_native_reanimated_1.useAnimatedStyle)(() => ({
        width: width.value,
    }));
    const data = Array.isArray(props.children) ? props.children : [props.children];
    return (<Box_1.Box {...props}>
            {tabs &&
            <FlatList_1.FlatList data={data} horizontal flexGrow={0} showsHorizontalScrollIndicator={false} scrollEnabled={false} renderItem={({ index, item }) => <TabItem {...{ item, index, i, width, contentRef, tabStyle: props._tabStyle, tabActiveStyle: props._tabActiveStyle }}/>} {...props._contentTabStyle} _contentContainerStyle={Object.assign({ justifyContent: 'center', minW: '100%', gap: 4, p: 2 }, (_b = props._contentTabStyle) === null || _b === void 0 ? void 0 : _b._contentContainerStyle)}/>}
            <FlatList_1.FlatList ref={contentRef} data={data} initialNumToRender={1} maxToRenderPerBatch={3} updateCellsBatchingPeriod={100} removeClippedSubviews={true} onLayout={e => {
            width.value = e.nativeEvent.layout.width;
        }} horizontal pagingEnabled showsHorizontalScrollIndicator={false} keyExtractor={(_, i) => i.toString()} onMomentumScrollEnd={e => {
            i.value = Math.round(e.nativeEvent.contentOffset.x / width.value);
        }} renderItem={({ item, index }) => {
            console.log('RENDERITEM', index);
            return (<BoxAnimated style={bodyStyle} {...item.props}/>);
        }} {...props._contentStyle}/>
            {arrows &&
            <>
                    <ArrowCarousel {...{ i, width, contentRef, lenght: data.length, arrow: 'chevron-left', arrowProps: props._arrow }}/>
                    <ArrowCarousel {...{ i, width, contentRef, lenght: data.length, arrow: 'chevron-right', arrowProps: props._arrow }}/>
                </>}
        </Box_1.Box>);
};
exports.Carousel = Carousel;
const TabItem = ({ item, index, i, width, contentRef, tabStyle, tabActiveStyle }) => {
    var _a;
    const [isActive, setIsActive] = (0, react_1.useState)(false);
    (0, react_native_reanimated_1.useAnimatedReaction)(() => i.value, (val) => {
        const active = val === index;
        (0, react_native_reanimated_1.runOnJS)(setIsActive)(active);
    });
    return (<Button_1.Button variant={isActive ? 'solid' : 'outline'} borderWidth={1} borderColor={isActive ? 'transparent' : 'light'} p={6.5} rounded={40} onPress={e => {
            i.value = index;
            contentRef.current.scrollToOffset({ offset: width.value * index, animated: true });
        }} children={(_a = item.props) === null || _a === void 0 ? void 0 : _a['tab']} {...tabStyle} {...(isActive ? tabActiveStyle : {})}/>);
};
const ArrowCarousel = ({ i, width, contentRef, arrow, lenght, arrowProps }) => {
    const [isActive, setIsActive] = (0, react_1.useState)(false);
    (0, react_native_reanimated_1.useAnimatedReaction)(() => i.value, (val) => {
        const active = (arrow == 'chevron-left' && val > 0) || (arrow == 'chevron-right' && val < lenght - 1);
        (0, react_native_reanimated_1.runOnJS)(setIsActive)(active);
    });
    if (!isActive)
        return null;
    return (<Button_1.Button variant={'ghost'} top={0} bottom={0} p={6.5} justifyContent={'center'} position={'absolute'} {...(arrow == 'chevron-left' ? { left: 0 } : { right: 0 })} onPress={e => {
            const index = arrow == 'chevron-left' ? i.value - 1 : i.value + 1;
            i.value = index;
            contentRef.current.scrollToOffset({ offset: width.value * index, animated: true });
        }} icon={<Icon_1.Icon name={arrow} as={'Feather'} size={24}/>} {...arrowProps}/>);
};
exports.Carousel.Item = CarouselItem;
//# sourceMappingURL=Carousel.js.map