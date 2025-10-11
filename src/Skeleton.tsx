import React, { useEffect } from 'react';
import { View, DimensionValue, ViewProps } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';
import { Box, BSBoxProps } from './Box';

interface SkeletonProps extends BSBoxProps {
    structure: SkeletonItem[]
}

type SkeletonItem = ViewProps & {
    w?: DimensionValue;
    h?: DimensionValue;
    rounded?: number | string;
    bg?: string;
}

export const Skeleton = ({
    structure = [],
    gap = 4,
    ...props
}: SkeletonProps) => {
    const opacity = useSharedValue(0.1);

    useEffect(() => {
        opacity.value = withRepeat(
            withTiming(1, { duration: 800 }),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    return (
        <Box flexDir='row' flexWrap={'wrap'} padding={Number(gap) / 2} {...props} gap={0}>
            {structure.map((x, i) =>
                <View key={i} style={{ padding: gap as any, width: x.w || '100%' }}>
                    <Animated.View
                        {...x}
                        style={[
                            { height: x.h || 10, borderRadius: x.rounded || 10, backgroundColor: x.bg || '#ddd' },
                            animatedStyle,
                            x.style,
                        ]}
                    />
                </View>
            )}
        </Box>
    );
};
