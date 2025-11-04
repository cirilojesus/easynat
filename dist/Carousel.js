import { useRef, useState } from 'react';
import { FlatList } from './FlatList';
import { Button } from './Button';
import Animated, { runOnJS, useAnimatedReaction, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { Box } from './Box';
import { Icon } from './Icon';
const CarouselItem = () => null;
const BoxAnimated = Animated.createAnimatedComponent(Box);
export const Carousel = ({ tabs = true, arrows = true, ...props }) => {
    const contentRef = useRef(null);
    const width = useSharedValue(0);
    const i = useSharedValue(0);
    const bodyStyle = useAnimatedStyle(() => ({
        width: width.value,
    }));
    const data = Array.isArray(props.children) ? props.children : [props.children];
    return (<Box {...props}>
            {tabs &&
            <FlatList data={data} horizontal flexGrow={0} showsHorizontalScrollIndicator={false} scrollEnabled={false} renderItem={({ index, item }) => <TabItem {...{ item, index, i, width, contentRef, tabStyle: props._tabStyle, tabActiveStyle: props._tabActiveStyle }}/>} {...props._contentTabStyle} _contentContainerStyle={{ justifyContent: 'center', minW: '100%', gap: 4, p: 2, ...props._contentTabStyle?._contentContainerStyle }}/>}
            <FlatList ref={contentRef} data={data} initialNumToRender={1} maxToRenderPerBatch={3} updateCellsBatchingPeriod={100} removeClippedSubviews={true} onLayout={e => {
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
        </Box>);
};
const TabItem = ({ item, index, i, width, contentRef, tabStyle, tabActiveStyle }) => {
    const [isActive, setIsActive] = useState(false);
    useAnimatedReaction(() => i.value, (val) => {
        const active = val === index;
        runOnJS(setIsActive)(active);
    });
    return (<Button variant={isActive ? 'solid' : 'outline'} borderWidth={1} borderColor={isActive ? 'transparent' : 'light'} p={6.5} rounded={40} onPress={e => {
            i.value = index;
            contentRef.current.scrollToOffset({ offset: width.value * index, animated: true });
        }} children={item.props?.['tab']} {...tabStyle} {...(isActive ? tabActiveStyle : {})}/>);
};
const ArrowCarousel = ({ i, width, contentRef, arrow, lenght, arrowProps }) => {
    const [isActive, setIsActive] = useState(false);
    useAnimatedReaction(() => i.value, (val) => {
        const active = (arrow == 'chevron-left' && val > 0) || (arrow == 'chevron-right' && val < lenght - 1);
        runOnJS(setIsActive)(active);
    });
    if (!isActive)
        return null;
    return (<Button variant={'ghost'} top={0} bottom={0} p={6.5} justifyContent={'center'} position={'absolute'} {...(arrow == 'chevron-left' ? { left: 0 } : { right: 0 })} onPress={e => {
            const index = arrow == 'chevron-left' ? i.value - 1 : i.value + 1;
            i.value = index;
            contentRef.current.scrollToOffset({ offset: width.value * index, animated: true });
        }} icon={<Icon name={arrow} as={'Feather'} size={24}/>} {...arrowProps}/>);
};
Carousel.Item = CarouselItem;
