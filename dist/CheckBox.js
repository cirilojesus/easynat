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
exports.CheckBox = void 0;
const react_native_1 = require("react-native");
const theme_provider_1 = require("./theme-provider");
const Box_1 = require("./Box");
const Icon_1 = require("./Icon");
const Button_1 = require("./Button");
const CheckBox = (props) => {
    var _a, _b;
    const { theme } = (0, theme_provider_1.useTheme)();
    const styles_default = ((_a = theme === null || theme === void 0 ? void 0 : theme.components) === null || _a === void 0 ? void 0 : _a.CheckBox) || {};
    const combinedProps = Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({ colorScheme: 'primary' }, styles_default), props), (react_native_1.Platform.OS === "ios" ? props._ios : {})), (react_native_1.Platform.OS === "android" ? props._android : {})), (react_native_1.Platform.OS === "web" ? props._web : {}));
    const { checked = false, onChange, label, pointerBox = false } = combinedProps, rest = __rest(combinedProps, ["checked", "onChange", "label", "pointerBox"]);
    return (<Button_1.Button variant={'unstyle'} flexDir="row" alignItems={'center'} pointerEvents={pointerBox ? 'box-only' : 'box-none'} p={0} {...rest} _pressed={Object.assign(Object.assign({}, combinedProps._pressed), { _icon: Object.assign({ bg: checked ? theme.colors[combinedProps.colorScheme + '.200'] : theme.colors[combinedProps.colorScheme + '.50'] }, (_b = combinedProps._pressed) === null || _b === void 0 ? void 0 : _b._icon) })} onPress={(e) => {
            var _a;
            onChange === null || onChange === void 0 ? void 0 : onChange(!checked);
            (_a = rest.onPress) === null || _a === void 0 ? void 0 : _a.call(rest, e);
        }} icon={<Box_1.Box w={22} height={22} borderWidth={1} bg={checked ? 'primary' : 'transparent'} borderColor={'light'} rounded={1}>
                    {checked ? combinedProps.icon || <Icon_1.Icon name={'check'} as={'Feather'} color="white" {...combinedProps._icon}/> : ''}
                </Box_1.Box>} _text={Object.assign({ ml: 2, textAlign: 'left' }, combinedProps._text)}>
            {label}
        </Button_1.Button>);
};
exports.CheckBox = CheckBox;
