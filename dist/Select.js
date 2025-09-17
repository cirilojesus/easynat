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
exports.Select = void 0;
const react_1 = require("react");
const react_native_1 = require("react-native");
const Pressable_1 = require("./Pressable");
const Icon_1 = require("./Icon");
const Modal_1 = require("./Modal");
const Box_1 = require("./Box");
const SelectItem = () => null;
const Select = (_a) => {
    var { children, placeholder = "Selecciona...", defaultValue, onChange, _option, _selected, _menu, icon = true, _icon } = _a, props = __rest(_a, ["children", "placeholder", "defaultValue", "onChange", "_option", "_selected", "_menu", "icon", "_icon"]);
    const [selected, setSelected] = (0, react_1.useState)();
    const modal = (0, react_1.useRef)();
    (0, react_1.useEffect)(() => {
        if (defaultValue !== undefined) {
            const match = children.find(i => i.props.value === defaultValue);
            if (match)
                setSelected(match);
        }
    }, [defaultValue, children]);
    const handleSelect = (item) => {
        setSelected(item);
        onChange === null || onChange === void 0 ? void 0 : onChange(item.props.value);
        modal.current.close();
    };
    return (<>
            <Pressable_1.Pressable flexDir="row" alignItems="center" justifyContent="space-between" p={3} borderWidth={1} borderColor="light" rounded={1} {...props} onPress={e => { var _a; modal.current.open(); (_a = props.onPress) === null || _a === void 0 ? void 0 : _a.call(props, e); }}>
                {(selected === null || selected === void 0 ? void 0 : selected.props.label) || placeholder}
                {icon === true ? <Icon_1.Icon as="Feather" name="chevron-down" size={20} {..._icon}/> : icon && icon(Object.assign({}, _icon))}
            </Pressable_1.Pressable>
            <Modal_1.Modal ref={modal} header={{ children: <Box_1.Box h={3.5} mx="auto" w={60} bg="dark"/> }} _contentStyle={Object.assign(Object.assign({}, _menu), { h: "auto", maxH: "90%", pt: 7, roundedTop: 40 })}>
                <react_native_1.FlatList data={children} initialNumToRender={1} maxToRenderPerBatch={10} updateCellsBatchingPeriod={10} windowSize={10} keyExtractor={i => i.props.value.toString()} renderItem={({ item }) => {
            const isSelected = item.props.value === (selected === null || selected === void 0 ? void 0 : selected.props.value);
            return (<Pressable_1.Pressable p={3} borderBottomWidth={1} borderBottomColor="light" bg={isSelected ? "primary.50" : undefined} onPress={() => handleSelect(item)} _pressed={{ opacity: 0.5 }} {..._option} {...item.props} {...(isSelected ? _selected : {})}>
                                {item.props.label}
                            </Pressable_1.Pressable>);
        }}/>
            </Modal_1.Modal>
        </>);
};
exports.Select = Select;
exports.Select.Item = SelectItem;
