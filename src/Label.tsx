import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { Animated } from "react-native";
import { Text, BSTextProps } from "./Text";

export type LabelType = BSTextProps & {
    isFloat?: boolean;
    isRequired?: boolean;
}

export type LabelRef = {
    animate: (value: boolean) => void
}

const AnimatedText = Animated.createAnimatedComponent(Text);

type LabelComponent = React.ForwardRefExoticComponent<
    LabelType & React.RefAttributes<LabelRef>
>;

export const Label = forwardRef<LabelRef, LabelType>(
    ({ isFloat, isRequired, ...props }, ref) => {
        const animation = useRef(new Animated.Value(0)).current;

        useImperativeHandle(ref, () => ({
            animate: (value: boolean) => {
                Animated.timing(animation, {
                    toValue: value ? 1 : 0,
                    duration: 100,
                    useNativeDriver: true,
                }).start();
            }
        }), []);

        return (
            <AnimatedText
                pointerEvents="none"
                style={[
                    isFloat
                        ? {
                            padding: 3,
                            marginLeft: 10,
                            backgroundColor: '#fff',
                            zIndex: 1000,
                            marginRight: 'auto',
                            marginBottom: -10,
                            transform: [
                                {
                                    translateY: animation.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [20, 1],
                                    })
                                }
                            ]
                        }
                        : { marginBottom: 4 },
                ]}
                {...props}
            >
                {props.children}
                {isRequired && <Text color={'danger.100'}> *</Text>}
            </AnimatedText>
        );
    }
) as LabelComponent;
