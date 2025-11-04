import React from "react";
import { Dimensions } from "react-native";
import Animated, { useAnimatedScrollHandler, useSharedValue, useAnimatedStyle, interpolate, Extrapolate, } from "react-native-reanimated";
import { Box } from "./Box";
const { width: screenWidth } = Dimensions.get("window");
const DATA = [
    { id: "1", color: "#ff7675" },
    { id: "2", color: "#74b9ff" },
    { id: "3", color: "#55efc4" },
    { id: "4", color: "#ffeaa7" },
    { id: "5", color: "#a29bfe" },
];
const ITEM_WIDTH = screenWidth * .8;
const SPACING = (screenWidth - ITEM_WIDTH) / 2;
export const PeekCarousel = () => {
    const scrollX = useSharedValue(0);
    const onScroll = useAnimatedScrollHandler({
        onScroll: (e) => {
            scrollX.value = e.contentOffset.x;
        },
    });
    return (<Animated.FlatList data={DATA} keyExtractor={(item) => item.id} horizontal showsHorizontalScrollIndicator={false} snapToInterval={ITEM_WIDTH} decelerationRate="fast" bounces={false} contentContainerStyle={{
            paddingHorizontal: SPACING,
        }} onScroll={onScroll} scrollEventThrottle={16} renderItem={({ item, index }) => (<CarouselItem item={item} index={index} scrollX={scrollX}/>)}/>);
};
const CarouselItem = ({ item, index, scrollX }) => {
    const style = useAnimatedStyle(() => {
        const inputRange = [
            (index - 1) * ITEM_WIDTH,
            index * ITEM_WIDTH,
            (index + 1) * ITEM_WIDTH,
        ];
        const scale = interpolate(scrollX.value, inputRange, [0.9, 1, 0.9], Extrapolate.CLAMP);
        const opacity = interpolate(scrollX.value, inputRange, [0.5, 1, 0.5], Extrapolate.CLAMP);
        return {
            transform: [{ scale }],
            opacity,
        };
    });
    return (<Animated.View style={[
            {
                width: ITEM_WIDTH,
                padding: 5,
            },
            style,
        ]}>
            <A item={item}/>
        </Animated.View>);
};
const A = ({ item }) => {
    console.log('RENDERITEMPEEEK');
    return (<Box bg={item.color} h={300} rounded={10} p={3}>
            sdsd
        </Box>);
};
