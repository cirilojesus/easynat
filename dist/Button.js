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
const react_1 = require("react");
const helpers_1 = require("./utils/helpers");
const Button = (_a) => {
    var _b, _c, _d, _e;
    var { colorScheme = "primary", variant = "solid" } = _a, props = __rest(_a, ["colorScheme", "variant"]);
    const { theme } = (0, theme_provider_1.useTheme)();
    const variantStyles = Object.assign({ solid: {
            bg: theme.colors[colorScheme + '.100'],
            _pressed: {
                bg: theme.colors[colorScheme + '.200']
            },
            _text: {
                color: theme.colors['white']
            },
            _icon: {
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
                },
                _icon: {
                    color: theme.colors[colorScheme + '.100'],
                }
            }
        } }, (_c = (_b = theme === null || theme === void 0 ? void 0 : theme.components) === null || _b === void 0 ? void 0 : _b.Button) === null || _c === void 0 ? void 0 : _c.variants);
    return (<Pressable_1.Pressable p={3} rounded={2} {...Object.assign(Object.assign({}, variantStyles[variant]), props)} _pressed={Object.assign(Object.assign({}, (_d = variantStyles[variant]) === null || _d === void 0 ? void 0 : _d._pressed), props._pressed)} _text={Object.assign(Object.assign({ textAlign: 'center' }, (_e = variantStyles[variant]) === null || _e === void 0 ? void 0 : _e._text), props._text)}>
            {(_a) => {
            var _b, _c, _d;
            var { pressed } = _a, e = __rest(_a, ["pressed"]);
            return <>
                    {e.icon && (0, react_1.cloneElement)(e.icon, Object.assign(Object.assign(Object.assign({}, (_b = variantStyles[variant]) === null || _b === void 0 ? void 0 : _b._icon), props._icon), (pressed ? (_c = props._pressed) === null || _c === void 0 ? void 0 : _c._icon : {})))}
                    {(0, helpers_1.renderChild)(props.children, pressed ? Object.assign(Object.assign({}, e._text), (_d = e._pressed) === null || _d === void 0 ? void 0 : _d._text) : e._text)}
                </>;
        }}
        </Pressable_1.Pressable>);
};
exports.Button = Button;
