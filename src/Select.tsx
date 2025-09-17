import { useRef, useState, useEffect } from "react";
import { FlatList } from "react-native";
import { BSPressableProps, Pressable } from "./Pressable";
import { Icon, IconProps } from "./Icon";
import { BSModalRef, Modal } from "./Modal";
import { Box, BSBoxProps } from "./Box";

export type BSSelectProps = BSPressableProps & {
    placeholder?: string;
    defaultValue?: string | number;
    onChange?: (val: string | number) => void;
    _menu?: Partial<BSBoxProps>;
    _option?: Partial<BSPressableProps>;
    _selected?: Partial<BSPressableProps>;
    _icon?: IconProps;
    icon?: boolean | typeof Icon
    children: React.ReactElement<BSSelectItemProps>[];
};

export type BSSelectItemProps = BSPressableProps & {
    label: string;
    value: string | number;
};

const SelectItem: React.FC<BSSelectItemProps> = () => null;

export const Select: React.FC<BSSelectProps> & { Item: React.FC<BSSelectItemProps> } = ({
    children,
    placeholder = "Selecciona...",
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
    const modal = useRef<BSModalRef>();

    useEffect(() => {
        if (defaultValue !== undefined) {
            const match = children.find(i => i.props.value === defaultValue);
            if (match) setSelected(match);
        }
    }, [defaultValue, children]);

    const handleSelect = (item: React.ReactElement<BSSelectItemProps>) => {
        setSelected(item);
        onChange?.(item.props.value);
        modal.current.close();
    };

    return (
        <>
            <Pressable
                flexDir="row"
                alignItems="center"
                justifyContent="space-between"
                p={3}
                borderWidth={1}
                borderColor="light"
                rounded={1}
                {...props}
                onPress={e => { modal.current.open(); props.onPress?.(e); }}
            >
                {selected?.props.label || placeholder}
                {icon === true ? <Icon as="Feather" name="chevron-down" size={20} {..._icon} /> : icon && icon({ ..._icon })}
            </Pressable>
            <Modal
                ref={modal}
                header={{ children: <Box h={3.5} mx="auto" w={60} bg="dark" /> }}
                _contentStyle={{ ..._menu, h: "auto", maxH: "90%", pt: 7, roundedTop: 40 }}
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
        </>
    );
};

Select.Item = SelectItem;
