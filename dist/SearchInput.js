import { Children, useEffect, useRef, useState } from "react";
import { Box } from './Box';
import { InputText } from "./Input";
import { Icon } from "./Icon";
import { Button } from "./Button";
import { Menu } from "./Menu";
const SearchInputItem = () => null;
export const SearchInput = ({ value, multiple, _item, ...props }) => {
    const [text, setText] = useState('');
    const menuRef = useRef(null);
    if (multiple && !Array.isArray(value))
        value = [];
    const onSelect = (item) => {
        if (Array.isArray(value) && multiple) {
            value.push(item);
            props.onChange?.([...value]);
        }
        else {
            setText(item[_item?.label] || item['props']?.label);
            props.onChange?.(item);
        }
    };
    useEffect(() => {
        if (!multiple && !Array.isArray(value) && value) {
            setText(value[_item?.label] || value['props']?.label);
        }
    }, [value]);
    return (<>
            <Menu ref={menuRef} backdrop={false} useTriggerWidth trigger={({ onPress }) => <InputText value={text} {...props?._input} onChangeText={e => {
                if (value && !multiple)
                    props.onChange(null);
                setText(e);
            }} onFocus={onPress} onBlur={menuRef.current?.close}/>} renderItem={({ item }) => {
            const label = item[_item?.label] || item['props']?.label;
            return (<Button variant={'ghost'} onPress={() => onSelect(item)} {..._item} {...item['props']}>
                            {label}
                        </Button>);
        }} {...props} data={(props.data || Children.toArray(props.children)).filter(item => {
            const label = item[_item?.label] || item['props']?.label;
            const itemValue = item[_item?.value] || item['props']?.value;
            return label.toUpperCase().includes(text.toUpperCase())
                && (Array.isArray(value) ? !value.some(x => (x[_item?.value] || x['props']?.value) == itemValue) : (value?.[_item?.value] || value?.['props']?.value) != itemValue);
        })}/>
            {Array.isArray(value) &&
            <Box flexDir="row" flexWrap={'wrap'} py={value.length ? 2 : 0} gap={8}>
                    {value.map((item, i) => {
                    const label = item[_item?.label] || item['props']?.label;
                    return (<Box key={label + i} variant={'badge'}>
                                {label}
                                <Button rounded={40} colorScheme={'danger'} p={1} icon={<Icon name="close" as={'AntDesign'} size={12}/>} onPress={() => {
                            value.splice(i, 1);
                            props.onChange?.([...value]);
                        }}/>
                            </Box>);
                })}
                </Box>}
        </>);
};
SearchInput.Item = SearchInputItem;
