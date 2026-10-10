import React, { useEffect } from 'react';
import { View, DimensionValue, ViewProps } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';
import { Box, EABoxProps } from './Box';
import { useThemeProps } from './utils/useThemeProps';

export interface SkeletonProps extends EABoxProps {
    structure: SkeletonItem[]
}

type SkeletonItem = ViewProps & {
    w?: DimensionValue;
    h?: DimensionValue;
    rounded?: number | string;
    bg?: string;
}

export const Skeleton = (rawProps: SkeletonProps) => {
    // Defaults → theme.components.Skeleton → variante → props → plataforma
    const [{ structure = [], gap = 4, variant: _variant, ...props }, theme] = useThemeProps<SkeletonProps>('Skeleton', rawProps);
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
                            { height: x.h || 10, borderRadius: x.rounded || 10, backgroundColor: (x.bg && (theme.colors?.[x.bg as string] ?? x.bg)) || theme.colors?.['light.200'] || '#ddd' },
                            animatedStyle,
                            x.style,
                        ]}
                    />
                </View>
            )}
        </Box>
    );
};
