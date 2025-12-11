import {
    forwardRef,
    useImperativeHandle,
    useState,
} from 'react';
import Animated, {
    useSharedValue,
    useDerivedValue,
    useAnimatedStyle,
    withTiming,
    useAnimatedReaction,
    runOnJS,
} from 'react-native-reanimated';

import { Box, BSBoxProps } from './Box';
import { BSButtonProps } from './Button';
import { Icon } from './Icon';

/* ----------------------- TYPES ------------------------- */

export type CollapseHandle = {
    open: () => void;
    close: () => void;
    toggle: () => void;
};

export type CollapseProps = BSBoxProps & {
    trigger: (props: {
        isOpen: boolean;
        onPress: () => void;
    } & BSButtonProps) => React.ReactNode;

    _contentStyle?: BSBoxProps;
    _open?: BSButtonProps;
    _trigger?: BSButtonProps;
};

const IconAnimated = Animated.createAnimatedComponent(Icon);

/* ---------------- INTERNAL COMPONENT ------------------- */

function InternalCollapse(
    { trigger, ...props }: CollapseProps,
    ref: React.Ref<CollapseHandle>
) {
    const height = useSharedValue(0);
    const isExpanded = useSharedValue(false);
    const [openState, setOpenState] = useState(false);

    useAnimatedReaction(
        () => isExpanded.value,
        (val) => runOnJS(setOpenState)(val)
    );

    const derivedHeight = useDerivedValue(() =>
        withTiming(isExpanded.value ? height.value : 0, { duration: 300 })
    );

    const bodyStyle = useAnimatedStyle(() => ({
        height: derivedHeight.value,
        overflow: 'hidden',
    }));

    const iconStyle = useAnimatedStyle(() => ({
        transform: [
            {
                rotate: withTiming(
                    `${!isExpanded.value ? 0 : 180}deg`,
                    { duration: 200 }
                )
            },
        ]
    }));

    useImperativeHandle(ref, () => ({
        open: () => (isExpanded.value = true),
        close: () => (isExpanded.value = false),
        toggle: () => (isExpanded.value = !isExpanded.value),
    }));

    return (
        <Box {...props}>
            {trigger({
                onPress: () => (isExpanded.value = !isExpanded.value),
                isOpen: openState,
                p: 3,
                borderWidth: 1,
                borderColor: 'light',
                rounded: 1,
                flexDir: 'row',
                justifyContent: 'space-between',
                icon: (
                    <IconAnimated
                        as="Feather"
                        name="chevron-down"
                        {...props._trigger?._icon}
                        style={iconStyle}
                    />
                ),
                ...(openState ? props._open : props._trigger),
            })}

            <Animated.View style={bodyStyle}>
                <Box
                    onLayout={(e) =>
                        (height.value = e.nativeEvent.layout.height)
                    }
                    style={{ width: '100%', position: 'absolute' }}
                    {...props._contentStyle}
                >
                    {props.children}
                </Box>
            </Animated.View>
        </Box>
    );
}

/* ----------------- FIX AUTOCOMPLETADO ------------------ */

export type CollapseComponent = (
    props: CollapseProps & { ref?: React.Ref<CollapseHandle> }
) => React.ReactElement | null;

/**
 * forwardRef pierde los tipos al compilar.
 * Aquí los restauramos para que funcione el autocompletado
 * en el proyecto donde usas la librería.
 */
export const Collapse = forwardRef(InternalCollapse) as unknown as CollapseComponent;
