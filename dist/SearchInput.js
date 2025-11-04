"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchInput = void 0;
const react_1 = require("react");
const Box_1 = require("./Box");
const Input_1 = require("./Input");
const Icon_1 = require("./Icon");
const Button_1 = require("./Button");
const Menu_1 = require("./Menu");
const SearchInputItem = () => null;
const SearchInput = (_a) => {
    var { value, multiple, _item } = _a, props = __rest(_a, ["value", "multiple", "_item"]);
    const [text, setText] = (0, react_1.useState)('');
    const menuRef = (0, react_1.useRef)(null);
    if (multiple && !Array.isArray(value))
        value = [];
    const onSelect = (item) => {
        var _a, _b, _c;
        if (Array.isArray(value) && multiple) {
            value.push(item);
            (_a = props.onChange) === null || _a === void 0 ? void 0 : _a.call(props, [...value]);
        }
        else {
            setText(item[_item === null || _item === void 0 ? void 0 : _item.label] || ((_b = item['props']) === null || _b === void 0 ? void 0 : _b.label));
            (_c = props.onChange) === null || _c === void 0 ? void 0 : _c.call(props, item);
        }
    };
    (0, react_1.useEffect)(() => {
        var _a;
        if (!multiple && !Array.isArray(value) && value) {
            setText(value[_item === null || _item === void 0 ? void 0 : _item.label] || ((_a = value['props']) === null || _a === void 0 ? void 0 : _a.label));
        }
    }, [value]);
    return (<>
            <Menu_1.Menu ref={menuRef} backdrop={false} useTriggerWidth trigger={({ onPress }) => {
            var _a;
            return <Input_1.InputText value={text} {...props === null || props === void 0 ? void 0 : props._input} onChangeText={e => {
                    if (value && !multiple)
                        props.onChange(null);
                    setText(e);
                }} onFocus={onPress} onBlur={(_a = menuRef.current) === null || _a === void 0 ? void 0 : _a.close}/>;
        }} renderItem={({ item }) => {
            var _a;
            const label = item[_item === null || _item === void 0 ? void 0 : _item.label] || ((_a = item['props']) === null || _a === void 0 ? void 0 : _a.label);
            return (<Button_1.Button variant={'ghost'} onPress={() => onSelect(item)} {..._item} {...item['props']}>
                            {label}
                        </Button_1.Button>);
        }} {...props} data={(props.data || react_1.Children.toArray(props.children)).filter(item => {
            var _a, _b, _c;
            const label = item[_item === null || _item === void 0 ? void 0 : _item.label] || ((_a = item['props']) === null || _a === void 0 ? void 0 : _a.label);
            const itemValue = item[_item === null || _item === void 0 ? void 0 : _item.value] || ((_b = item['props']) === null || _b === void 0 ? void 0 : _b.value);
            return label.toUpperCase().includes(text.toUpperCase())
                && (Array.isArray(value) ? !value.some(x => { var _a; return (x[_item === null || _item === void 0 ? void 0 : _item.value] || ((_a = x['props']) === null || _a === void 0 ? void 0 : _a.value)) == itemValue; }) : ((value === null || value === void 0 ? void 0 : value[_item === null || _item === void 0 ? void 0 : _item.value]) || ((_c = value === null || value === void 0 ? void 0 : value['props']) === null || _c === void 0 ? void 0 : _c.value)) != itemValue);
        })}/>
            {Array.isArray(value) &&
            <Box_1.Box flexDir="row" flexWrap={'wrap'} py={value.length ? 2 : 0} gap={8}>
                    {value.map((item, i) => {
                    var _a;
                    const label = item[_item === null || _item === void 0 ? void 0 : _item.label] || ((_a = item['props']) === null || _a === void 0 ? void 0 : _a.label);
                    return (<Box_1.Box key={label + i} variant={'badge'}>
                                {label}
                                <Button_1.Button rounded={40} colorScheme={'danger'} p={1} icon={<Icon_1.Icon name="close" as={'AntDesign'} size={12}/>} onPress={() => {
                            var _a;
                            value.splice(i, 1);
                            (_a = props.onChange) === null || _a === void 0 ? void 0 : _a.call(props, [...value]);
                        }}/>
                            </Box_1.Box>);
                })}
                </Box_1.Box>}
        </>);
};
exports.SearchInput = SearchInput;
exports.SearchInput.Item = SearchInputItem;
