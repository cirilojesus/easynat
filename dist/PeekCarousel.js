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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PeekCarousel = void 0;
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const react_native_reanimated_1 = __importStar(require("react-native-reanimated"));
const Box_1 = require("./Box");
const { width: screenWidth } = react_native_1.Dimensions.get("window");
const DATA = [
    { id: "1", color: "#ff7675" },
    { id: "2", color: "#74b9ff" },
    { id: "3", color: "#55efc4" },
    { id: "4", color: "#ffeaa7" },
    { id: "5", color: "#a29bfe" },
];
const ITEM_WIDTH = screenWidth * .8;
const SPACING = (screenWidth - ITEM_WIDTH) / 2;
const PeekCarousel = () => {
    const scrollX = (0, react_native_reanimated_1.useSharedValue)(0);
    const onScroll = (0, react_native_reanimated_1.useAnimatedScrollHandler)({
        onScroll: (e) => {
            scrollX.value = e.contentOffset.x;
        },
    });
    return (<react_native_reanimated_1.default.FlatList data={DATA} keyExtractor={(item) => item.id} horizontal showsHorizontalScrollIndicator={false} snapToInterval={ITEM_WIDTH} decelerationRate="fast" bounces={false} contentContainerStyle={{
            paddingHorizontal: SPACING,
        }} onScroll={onScroll} scrollEventThrottle={16} renderItem={({ item, index }) => (<CarouselItem item={item} index={index} scrollX={scrollX}/>)}/>);
};
exports.PeekCarousel = PeekCarousel;
const CarouselItem = ({ item, index, scrollX }) => {
    const style = (0, react_native_reanimated_1.useAnimatedStyle)(() => {
        const inputRange = [
            (index - 1) * ITEM_WIDTH,
            index * ITEM_WIDTH,
            (index + 1) * ITEM_WIDTH,
        ];
        const scale = (0, react_native_reanimated_1.interpolate)(scrollX.value, inputRange, [0.9, 1, 0.9], react_native_reanimated_1.Extrapolate.CLAMP);
        const opacity = (0, react_native_reanimated_1.interpolate)(scrollX.value, inputRange, [0.5, 1, 0.5], react_native_reanimated_1.Extrapolate.CLAMP);
        return {
            transform: [{ scale }],
            opacity,
        };
    });
    return (<react_native_reanimated_1.default.View style={[
            {
                width: ITEM_WIDTH,
                padding: 5,
            },
            style,
        ]}>
            <A item={item}/>
        </react_native_reanimated_1.default.View>);
};
const A = ({ item }) => {
    console.log('RENDERITEMPEEEK');
    return (<Box_1.Box bg={item.color} h={300} rounded={10} p={3}>
            sdsd
        </Box_1.Box>);
};
//# sourceMappingURL=PeekCarousel.js.map