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
exports.Button = void 0;
const theme_provider_1 = require("./theme-provider");
const Pressable_1 = require("./Pressable");
const Button = (_a) => {
    var _b, _c;
    var { colorScheme = "primary", variant = "solid" } = _a, props = __rest(_a, ["colorScheme", "variant"]);
    const { theme } = (0, theme_provider_1.useTheme)();
    const variantStyles = Object.assign({ solid: {
            bg: theme.colors[colorScheme + '.100'],
            _pressed: {
                bg: theme.colors[colorScheme + '.200']
            },
            _text: {
                color: theme.colors['white']
            }
        }, outline: {
            borderWidth: 1,
            borderColor: theme.colors[colorScheme + '.100'],
            _pressed: {
                bg: theme.colors[colorScheme + '.50']
            }
        }, ghost: {
            _pressed: {
                bg: theme.colors[colorScheme + '.50']
            }
        }, link: {
            _pressed: {
                _text: {
                    color: theme.colors[colorScheme + '.100'],
                    textDecorationLine: 'underline'
                }
            }
        } }, (_c = (_b = theme === null || theme === void 0 ? void 0 : theme.components) === null || _b === void 0 ? void 0 : _b.Button) === null || _c === void 0 ? void 0 : _c.variants);
    return (<Pressable_1.Pressable p={3} rounded={2} {...props} {...variantStyles[variant]} _pressed={Object.assign(Object.assign({}, variantStyles[variant]._pressed), props._pressed)} _text={Object.assign(Object.assign({}, variantStyles[variant]._text), props._text)}/>);
};
exports.Button = Button;
