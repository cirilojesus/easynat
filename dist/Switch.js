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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Switch = void 0;
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const theme_provider_1 = require("./theme-provider");
const DEFAULT_PROPS_1 = require("./utils/DEFAULT_PROPS");
const Button_1 = require("./Button");
const Switch = (props) => {
    var _a;
    const { theme } = (0, theme_provider_1.useTheme)();
    const styles_default = ((_a = theme === null || theme === void 0 ? void 0 : theme.components) === null || _a === void 0 ? void 0 : _a.Switch) || {};
    const combinedProps = Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, styles_default), props), (react_native_1.Platform.OS === "ios" ? props._ios : {})), (react_native_1.Platform.OS === "android" ? props._android : {})), (react_native_1.Platform.OS === "web" ? props._web : {}));
    const styles = (0, DEFAULT_PROPS_1.DEFAULT_PROPS)(combinedProps, theme);
    const { colorScheme = "primary", _containerStyle, pointerBox, size = 1 } = combinedProps, rest = __rest(combinedProps, ["colorScheme", "_containerStyle", "pointerBox", "size"]);
    const scale = 1 + 0.1 * (size - 1);
    const rightOffset = ((52 * (scale - 1)) / 2);
    return (<Button_1.Button variant="unstyle" height={36 + size * 4} onPress={() => props.onValueChange(!props.value)} _text={{ ml: 1 }} _pressed={{ _text: { color: theme.colors[colorScheme + '.100'] } }} p={0} ml={-10} flexDir="row" alignItems="center" pointerEvents={pointerBox ? 'auto' : 'box-none'} {..._containerStyle}>
            <react_native_1.Switch trackColor={{
            false: theme.colors['light'],
            true: theme.colors[colorScheme + '.100'],
        }} thumbColor={combinedProps.value
            ? theme.colors[colorScheme + '.100']
            : theme.colors['light']} {...rest} style={[
            {
                width: 52 + (rightOffset / 2),
                marginRight: (rightOffset * 2),
                transform: [{ scale }],
            },
            rest.style,
            ...styles
        ]}/>
            LABEL
        </Button_1.Button>);
};
exports.Switch = Switch;
