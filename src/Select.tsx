import { useRef, useState, useEffect } from "react";
import { Animated, FlatList, Keyboard } from "react-native";
import { BSPressableProps, Pressable } from "./Pressable";
import { Icon, IconProps } from "./Icon";
import { BSModalRef, Modal } from "./Modal";
import { Box, BSBoxProps } from "./Box";
import { BSTextProps, Text } from "./Text";
import { useTheme } from "./theme-provider";

export type BSSelectProps = BSPressableProps & {
    placeholder?: string;
    defaultValue?: string | number;
    onChange?: (val: string | number) => void;
    _menu?: Partial<BSBoxProps>;
    _option?: Partial<BSPressableProps>;
    _selected?: Partial<BSPressableProps>;
    _icon?: IconProps;
    icon?: boolean | React.ReactElement<any>
    children?: React.ReactElement<BSSelectItemProps>[];
    label?: string;
    _label?: BSTextProps,
    isFloat?: boolean;
    isRequired?: boolean;
    _containerStyle?: BSBoxProps
};

export type BSSelectItemProps = BSPressableProps & {
    label: string | number;
    value: string | number;
};

const SelectItem: React.FC<BSSelectItemProps> = () => null;

const AnimatedText = Animated.createAnimatedComponent(Text);

export const Select: React.FC<BSSelectProps> & { Item: React.FC<BSSelectItemProps> } = ({
    children,
    defaultValue,
    onChange,
    _option,
    _selected,
    _menu,
    icon = true,
    _icon,
    ...props
}) => {
    const [selected, setSelected] = useState<React.ReactElement<BSSelectItemProps>>();
    const modal = useRef<BSModalRef>(null);
    const animation = useRef(new Animated.Value(0)).current;
    const { theme } = useTheme();
    const styles_default = theme?.components?.Select || {};
    const { isFloat, label, _label, isRequired, _containerStyle } = { ...styles_default, ...props, }

    useEffect(() => {
        animate(defaultValue)
        if (defaultValue != selected?.props?.value) {
            const match = children.find(i => i.props.value === defaultValue);
            setSelected(match);
        }
    }, [defaultValue, children]);

    const handleSelect = (item: React.ReactElement<BSSelectItemProps>) => {
        modal.current.close();
        setSelected(item);
        onChange?.(item.props.value);
        animate(item.props.value)
    };

    const animate = (text) => {
        Animated.timing(animation, {
            toValue: text ? 1 : 0,
            duration: 100,
            useNativeDriver: true,
        }).start();
    }

    return (
        <Box {..._containerStyle}>
            {label &&
                <AnimatedText
                    pointerEvents="none"
                    style={[
                        (isFloat ?
                            {
                                padding: 3,
                                marginLeft: 10,
                                backgroundColor: '#fff',
                                zIndex: 1000,
                                marginRight: 'auto',
                                marginBottom: -11,
                                transform: [
                                    {
                                        translateY: animation.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [20, 1],
                                        })
                                    }
                                ]
                            } :
                            { marginBottom: 4 }),
                    ]}
                    {..._label}
                >
                    {label} {isRequired && <Text color={'danger'}>*</Text>}
                </AnimatedText>
            }
            <Pressable
                flexDir="row"
                alignItems="center"
                justifyContent="space-between"
                p={2}
                borderWidth={1}
                borderColor="light"
                _pressed={{ opacity: .5 }}
                rounded={1}
                {...props}
                _text={{ flexShrink: 1, ...props._text }}
                onPress={e => { Keyboard.dismiss(), modal.current.open(); props.onPress?.(e) }}
            >
                {selected?.props.label || props.placeholder || ''}
                {icon === true ? <Icon as="Feather" name="chevron-down" size={20} {..._icon} /> : icon && icon}
            </Pressable>
            <Modal
                ref={modal}
                header={{ children: <Box h={3.5} mx="auto" w={60} bg="dark" />, py: 1 }}
                _contentStyle={{ ..._menu, h: "auto", maxH: "90%", pt: 7, roundedTop: 40 }}
                buttonClose={false}
            >
                <FlatList
                    data={children}
                    initialNumToRender={1}
                    maxToRenderPerBatch={10}
                    updateCellsBatchingPeriod={10}
                    windowSize={10}
                    keyExtractor={i => i.props.value.toString()}
                    renderItem={({ item }) => {
                        const isSelected = item.props.value === selected?.props.value;
                        return (
                            <Pressable
                                p={3}
                                borderBottomWidth={1}
                                borderBottomColor="light"
                                bg={isSelected ? "primary.50" : undefined}
                                onPress={() => handleSelect(item)}
                                _pressed={{ opacity: 0.5 }}
                                {..._option}
                                {...item.props}
                                {...(isSelected ? _selected : {})}
                            >
                                {item.props.label}
                            </Pressable>
                        );
                    }}
                />
            </Modal>
        </Box>
    );
};

Select.Item = SelectItem;
