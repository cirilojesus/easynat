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
const Text_1 = require("./Text");
const theme_provider_1 = require("./theme-provider");
const SelectItem = () => null;
const AnimatedText = react_native_1.Animated.createAnimatedComponent(Text_1.Text);
const Select = (_a) => {
    var _b, _c, _d;
    var { children, defaultValue, onChange, _option, _selected, _menu, icon = true, _icon } = _a, props = __rest(_a, ["children", "defaultValue", "onChange", "_option", "_selected", "_menu", "icon", "_icon"]);
    const [selected, setSelected] = (0, react_1.useState)();
    const modal = (0, react_1.useRef)(null);
    const animation = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    const { theme } = (0, theme_provider_1.useTheme)();
    const styles_default = ((_b = theme === null || theme === void 0 ? void 0 : theme.components) === null || _b === void 0 ? void 0 : _b.Select) || {};
    const props_variant = ((_d = (_c = theme === null || theme === void 0 ? void 0 : theme.components) === null || _c === void 0 ? void 0 : _c.Select) === null || _d === void 0 ? void 0 : _d.variants) || {};
    const sizeStyle = {
        sm: { p: 1.5, _text: { fontSize: 12 } },
        md: { p: 2, _text: { fontSize: 14 } },
        lg: { p: 2.5, _text: { fontSize: 16 } },
        xl: { p: 3, _text: { fontSize: 18 } },
    };
    const { isFloat, label, _label, isRequired, _containerStyle } = Object.assign(Object.assign(Object.assign(Object.assign({}, styles_default), props_variant[styles_default.variant || props.variant]), sizeStyle[props.size]), props);
    (0, react_1.useEffect)(() => {
        var _a;
        animate(defaultValue);
        if (defaultValue != ((_a = selected === null || selected === void 0 ? void 0 : selected.props) === null || _a === void 0 ? void 0 : _a.value)) {
            const match = children.find(i => i.props.value === defaultValue);
            setSelected(match);
        }
    }, [defaultValue, children]);
    const handleSelect = (item) => {
        modal.current.close();
        setSelected(item);
        onChange === null || onChange === void 0 ? void 0 : onChange(item.props.value);
        animate(item.props.value);
    };
    const animate = (text) => {
        react_native_1.Animated.timing(animation, {
            toValue: text ? 1 : 0,
            duration: 100,
            useNativeDriver: true,
        }).start();
    };
    return (<Box_1.Box {..._containerStyle}>
            {label &&
            <AnimatedText pointerEvents="none" style={[
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
                ]} {..._label}>
                    {label} {isRequired && <Text_1.Text color={'danger.100'}>*</Text_1.Text>}
                </AnimatedText>}
            <Pressable_1.Pressable flexDir="row" alignItems="center" justifyContent="space-between" p={2} borderWidth={1} borderColor="light.100" _pressed={{ opacity: .5 }} rounded={1} {...props} _text={Object.assign({ flexShrink: 1 }, props._text)} onPress={e => { var _a; react_native_1.Keyboard.dismiss(), modal.current.open(); (_a = props.onPress) === null || _a === void 0 ? void 0 : _a.call(props, e); }}>
                {(selected === null || selected === void 0 ? void 0 : selected.props.label) || props.placeholder || ''}
                {icon === true ? <Icon_1.Icon as="Feather" name="chevron-down" size={20} {..._icon}/> : icon && icon}
            </Pressable_1.Pressable>
            <Modal_1.Modal ref={modal} header={{ children: <Box_1.Box height={3.5} mx="auto" w={60} bg="dark.100"/>, py: 2 }} _contentStyle={Object.assign(Object.assign({}, _menu), { h: "auto", maxH: "90%", roundedTop: 40 })} buttonClose={false}>
                <react_native_1.FlatList data={children} initialNumToRender={1} maxToRenderPerBatch={10} updateCellsBatchingPeriod={10} windowSize={10} keyExtractor={i => i.props.value.toString()} renderItem={({ item }) => {
            var _a;
            const isSelected = item.props.value === (selected === null || selected === void 0 ? void 0 : selected.props.value);
            return (<Pressable_1.Pressable p={3} borderBottomWidth={1} borderBottomColor="light.100" bg={isSelected ? "primary.50" : undefined} onPress={() => handleSelect(item)} _pressed={{ opacity: 0.5 }} {..._option} {...item.props} {...(((_a = item.props) === null || _a === void 0 ? void 0 : _a.onPress) ? {
                onPress: e => {
                    modal.current.close();
                    _option.onPress();
                }
            } : {})} {...(isSelected ? _selected : {})}>
                                {item.props.label}
                            </Pressable_1.Pressable>);
        }}/>
            </Modal_1.Modal>
        </Box_1.Box>);
};
exports.Select = Select;
exports.Select.Item = SelectItem;
