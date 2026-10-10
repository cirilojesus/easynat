"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.Input = void 0;
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const DEFAULT_PROPS_1 = require("./utils/DEFAULT_PROPS");
const Icon_1 = require("./Icon");
const Button_1 = require("./Button");
const Label_1 = require("./Label");
const Box_1 = require("./Box");
const useThemeProps_1 = require("./utils/useThemeProps");
// Variantes: la caja del campo (_containerStyle). Con foco, el borde pasa al color primary (o al de _focus)
const INPUT_VARIANTS = {
    outline: {},
    filled: { _containerStyle: { bg: 'light.50', borderColor: 'transparent' } },
    underlined: { _containerStyle: { borderWidth: 0, borderBottomWidth: 1, rounded: 0 } },
    rounded: { _containerStyle: { rounded: 40, px: 1.5 } },
    unstyled: { _containerStyle: { borderWidth: 0, bg: 'transparent' } },
};
const INPUT_SIZES = {
    sm: { fontSize: 12, _label: { fontSize: 12 } },
    md: { fontSize: 14, _label: { fontSize: 14 } },
    lg: { fontSize: 16, _label: { fontSize: 16 } },
    xl: { fontSize: 18, _label: { fontSize: 18 } },
};
const isFilled = (v) => v != null && v !== '';
const Input = (_a) => {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    var { style } = _a, props = __rest(_a, ["style"]);
    const [focus, setFocus] = (0, react_1.useState)(false);
    const [showPassword, setShowPassword] = (0, react_1.useState)(false);
    // Texto escrito cuando el input no es controlado (sin value): para saber si el label flotante debe quedar arriba
    const [typed, setTyped] = (0, react_1.useState)(() => isFilled(props.defaultValue));
    const labelRef = (0, react_1.useRef)(null);
    const [fieldHeight, setFieldHeight] = (0, react_1.useState)(0);
    // Defaults → theme.components.Input → variante → tamaño → props → plataforma; y _focus con foco
    const [themed, theme] = (0, useThemeProps_1.useThemeProps)('Input', props, { sizes: INPUT_SIZES, variants: INPUT_VARIANTS });
    const combinedProps = focus && themed._focus ? (0, useThemeProps_1.mergeProps)(themed, themed._focus) : themed;
    // Props del Input (no del TextInput nativo)
    const { label, _label, isFloat, isRequired, isPassword, iconLeft, iconRight, _iconRight, _containerStyle, _focus, variant: _variant, size: _size, color, placeholder } = combinedProps, inputProps = __rest(combinedProps, ["label", "_label", "isFloat", "isRequired", "isPassword", "iconLeft", "iconRight", "_iconRight", "_containerStyle", "_focus", "variant", "size", "color", "placeholder"]);
    const styles = (0, DEFAULT_PROPS_1.DEFAULT_PROPS)(combinedProps, theme);
    const inputStyle = react_native_1.StyleSheet.flatten([
        {
            fontSize: 14,
            paddingVertical: 8,
            paddingHorizontal: 12,
            flex: 1,
        },
        style,
        ...styles,
        { color: theme.colors[color !== null && color !== void 0 ? color : 'text'] || color }
    ]);
    // El label flotante sube con foco o con texto (controlado por value, o escrito sin value)
    const hasText = props.value !== undefined ? isFilled(props.value) : typed;
    const raised = focus || hasText;
    (0, react_1.useEffect)(() => { var _a; (_a = labelRef.current) === null || _a === void 0 ? void 0 : _a.animate(raised); }, [raised]);
    // La caja del campo (borde, iconos y TextInput)
    const field = (<Box_1.Box alignItems={'center'} flexDir="row" rounded={1} borderWidth={1} {..._containerStyle} onLayout={e => {
            var _a;
            setFieldHeight(e.nativeEvent.layout.height);
            (_a = _containerStyle === null || _containerStyle === void 0 ? void 0 : _containerStyle.onLayout) === null || _a === void 0 ? void 0 : _a.call(_containerStyle, e);
        }} 
    // Con foco: el de _focus, o el que se pase en las props, o primary; sin foco: el del tema/props o light
    borderColor={focus
            ? (_f = (_d = (_c = (_b = themed._focus) === null || _b === void 0 ? void 0 : _b._containerStyle) === null || _c === void 0 ? void 0 : _c.borderColor) !== null && _d !== void 0 ? _d : (_e = props._containerStyle) === null || _e === void 0 ? void 0 : _e.borderColor) !== null && _f !== void 0 ? _f : 'primary.100'
            : (_h = (_g = themed._containerStyle) === null || _g === void 0 ? void 0 : _g.borderColor) !== null && _h !== void 0 ? _h : 'light.100'}>
                {iconLeft}
                <react_native_1.TextInput {...inputProps} 
    // Label flotante abajo (vacío y sin foco): hace de placeholder, el placeholder taparía con él
    placeholder={isFloat && label && !raised ? undefined : placeholder} placeholderTextColor={(_j = inputProps.placeholderTextColor) !== null && _j !== void 0 ? _j : (_k = theme.colors) === null || _k === void 0 ? void 0 : _k['text.subtle']} secureTextEntry={isPassword && !showPassword} style={[
            theme.fontFamily && { fontFamily: ((_l = theme === null || theme === void 0 ? void 0 : theme.fonts) === null || _l === void 0 ? void 0 : _l[theme.fontFamily + '_' + ((inputStyle === null || inputStyle === void 0 ? void 0 : inputStyle.fontWeight) || '400')]) || theme.fontFamily + '_' + ((inputStyle === null || inputStyle === void 0 ? void 0 : inputStyle.fontWeight) || '400') },
            inputStyle,
            theme.fontFamily && { fontWeight: undefined }
        ]} onChangeText={t => {
            var _a;
            if (props.value === undefined)
                setTyped(isFilled(t));
            (_a = props.onChangeText) === null || _a === void 0 ? void 0 : _a.call(props, t);
        }} onFocus={e => {
            var _a;
            (_a = props.onFocus) === null || _a === void 0 ? void 0 : _a.call(props, e);
            setFocus(true);
        }} onBlur={e => {
            var _a;
            (_a = props.onBlur) === null || _a === void 0 ? void 0 : _a.call(props, e);
            setFocus(false);
        }}/>
                {isPassword && (<Button_1.Button onPress={() => setShowPassword(!showPassword)} variant={'ghost'} rounded={40} p={1} mr={2} marginVertical={4.5} accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'} icon={<Icon_1.Icon name={showPassword ? "eye-off" : 'eye'} as={'Feather'} size={16}/>} {..._iconRight}/>)}
                {iconRight}
            </Box_1.Box>);
    if (!label)
        return field;
    // Con label: label y campo juntos en una vista propia. Si fueran hermanos sueltos (Fragment), el `gap`
    // del contenedor se metía entre ellos y el label flotante no se colocaba sobre el campo
    return (<react_native_1.View>
            <Label_1.Label ref={labelRef} isFloat={isFloat} isRequired={isRequired} fieldHeight={fieldHeight} {..._label}>{label}</Label_1.Label>
            {field}
        </react_native_1.View>);
};
exports.Input = Input;
