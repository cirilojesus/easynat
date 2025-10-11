import { Children, useEffect, useRef, useState } from "react"
import { Box } from './Box';
import { BSTextInputProps, InputText } from "./Input"
import { Icon } from "./Icon"
import { BSButtonProps, Button } from "./Button"
import { BSMenuProps, Menu, MenuRef } from "./Menu"

export type SearchInputModel<T = any> = BSMenuProps<T> & {
    value: T[] | T | null,
    multiple?: boolean;
    children?: React.ReactElement<EASearchInputItem>[];
    _item?: BSButtonProps & { label: keyof T, value: keyof T },
    onChange?: (value: T[] | T | null) => any,
    _input?: BSTextInputProps
}

export type EASearchInputItem = BSButtonProps & {
    label: string | number;
    value: string | number;
};

const SearchInputItem: React.FC<EASearchInputItem> = () => null;

export const SearchInput = <T,>({ value, multiple, _item, ...props }: SearchInputModel<T>) => {
    const [text, setText] = useState('')
    const menuRef = useRef<MenuRef>(null)

    if (multiple && !Array.isArray(value)) value = []

    const onSelect = (item) => {
        if (Array.isArray(value) && multiple) {
            value.push(item)
            props.onChange?.([...value])
        } else {
            setText(item[_item?.label] || item['props']?.label)
            props.onChange?.(item)
        }
    }

    useEffect(() => {
        if (!multiple && !Array.isArray(value) && value) {
            setText(value[_item?.label] || value['props']?.label)
        }
    }, [value])

    return (
        <>
            <Menu
                ref={menuRef}
                backdrop={false}
                useTriggerWidth
                trigger={({ onPress }) =>
                    <InputText
                        value={text}
                        {...props?._input}
                        onChangeText={e => {
                            if (value && !multiple) props.onChange(null)
                            setText(e)
                        }}
                        onFocus={onPress}
                        onBlur={menuRef.current?.close}
                    />
                }
                renderItem={({ item }) => {
                    const label = item[_item?.label] || item['props']?.label
                    return (
                        <Button variant={'ghost'} onPress={() => onSelect(item)} {..._item} {...item['props']}>
                            {label}
                        </Button>
                    )
                }}
                {...props}
                data={(props.data || Children.toArray(props.children) as any).filter(item => {
                    const label = item[_item?.label] || item['props']?.label
                    const itemValue = item[_item?.value] || item['props']?.value
                    return label.toUpperCase().includes(text.toUpperCase())
                        && (Array.isArray(value) ? !value.some(x => (x[_item?.value] || x['props']?.value) == itemValue) : (value?.[_item?.value] || value?.['props']?.value) != itemValue)
                })}
            />
            {Array.isArray(value) &&
                <Box flexDir="row" flexWrap={'wrap'} py={value.length ? 2 : 0} gap={8}>
                    {value.map((item, i) => {
                        const label = item[_item?.label] || item['props']?.label
                        return (
                            <Box key={label + i} variant={'badge'}>
                                {label}
                                <Button
                                    rounded={40}
                                    colorScheme={'danger'}
                                    p={1}
                                    icon={<Icon name="close" as={'AntDesign'} size={12} />}
                                    onPress={() => {
                                        value.splice(i, 1)
                                        props.onChange?.([...value])
                                    }}
                                />
                            </Box>
                        )
                    })}
                </Box>
            }
        </>
    )
}

SearchInput.Item = SearchInputItem;
