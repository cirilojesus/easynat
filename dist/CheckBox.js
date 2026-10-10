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
exports.CheckBox = void 0;
const react_1 = __importDefault(require("react"));
const Box_1 = require("./Box");
const Icon_1 = require("./Icon");
const Button_1 = require("./Button");
const useThemeProps_1 = require("./utils/useThemeProps");
const CHECKBOX_SIZES = {
    sm: { _containerIcon: { w: 18, height: 18 }, _icon: { size: 12 }, _text: { fontSize: 12 } },
    md: { _containerIcon: { w: 22, height: 22 }, _icon: { size: 14 }, _text: { fontSize: 14 } },
    lg: { _containerIcon: { w: 26, height: 26 }, _icon: { size: 16 }, _text: { fontSize: 16 } },
    xl: { _containerIcon: { w: 30, height: 30 }, _icon: { size: 18 }, _text: { fontSize: 18 } },
};
const CheckBox = (props) => {
    var _a;
    // Defaults → theme.components.CheckBox → variante → tamaño → props → plataforma
    const [combinedProps, theme] = (0, useThemeProps_1.useThemeProps)('CheckBox', props, { defaults: { colorScheme: 'primary' }, sizes: CHECKBOX_SIZES });
    const { checked = false, onChange, label, pointerBox = false, 
    // variant y size son del CheckBox, no del Button interno
    variant: _variant, size: _size } = combinedProps, rest = __rest(combinedProps, ["checked", "onChange", "label", "pointerBox", "variant", "size"]);
    return (<Button_1.Button variant={'unstyle'} flexDir="row" alignItems={'center'} justifyContent={'flex-start'} pointerEvents={pointerBox ? 'box-only' : 'box-none'} p={0} accessibilityRole="checkbox" accessibilityState={{ checked, disabled: !!rest.disabled }} {...rest} _pressed={(0, useThemeProps_1.mergeProps)(combinedProps._pressed, {
            _icon: Object.assign({ bg: checked ? theme.colors[combinedProps.colorScheme + '.200'] : theme.colors[combinedProps.colorScheme + '.50'] }, (_a = combinedProps._pressed) === null || _a === void 0 ? void 0 : _a._icon)
        })} onPress={(e) => {
            var _a;
            onChange === null || onChange === void 0 ? void 0 : onChange(!checked);
            (_a = rest.onPress) === null || _a === void 0 ? void 0 : _a.call(rest, e);
        }} icon={<Box_1.Box w={22} height={22} borderWidth={1} bg={checked ? combinedProps.colorScheme + '.100' : 'transparent'} borderColor={checked ? combinedProps.colorScheme + '.100' : 'light.200'} rounded={1} 
        // Centrado: la marca quedaba arriba a la izquierda de la caja
        alignItems="center" justifyContent="center" {...combinedProps._containerIcon}>
                    {checked ? combinedProps.icon || <Icon_1.Icon name={'check'} as={'Feather'} color="white" {...combinedProps._icon}/> : null}
                </Box_1.Box>} _text={Object.assign({ textAlign: 'left' }, combinedProps._text)}>
            {label}
        </Button_1.Button>);
};
exports.CheckBox = CheckBox;
