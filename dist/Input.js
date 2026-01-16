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
exports.InputText = void 0;
const react_1 = require("react");
const react_native_1 = require("react-native");
const theme_provider_1 = require("./theme-provider");
const DEFAULT_PROPS_1 = require("./utils/DEFAULT_PROPS");
const Icon_1 = require("./Icon");
const Button_1 = require("./Button");
const Text_1 = require("./Text");
const Box_1 = require("./Box");
const AnimatedText = react_native_1.Animated.createAnimatedComponent(Text_1.Text);
const InputText = (_a) => {
    var _b, _c, _d, _e;
    var { style } = _a, props = __rest(_a, ["style"]);
    const { theme } = (0, theme_provider_1.useTheme)();
    const styles_default = ((_b = theme === null || theme === void 0 ? void 0 : theme.components) === null || _b === void 0 ? void 0 : _b.InputText) || {};
    const [focus, setFocus] = (0, react_1.useState)(false);
    const [showPassword, setShowPassword] = (0, react_1.useState)(false);
    const animation = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    const combinedProps = Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, styles_default), props), (focus && props._focus)), (react_native_1.Platform.OS === "ios"
        ? Object.assign(Object.assign({}, styles_default === null || styles_default === void 0 ? void 0 : styles_default._ios), props === null || props === void 0 ? void 0 : props._ios) : {})), (react_native_1.Platform.OS === "android"
        ? Object.assign(Object.assign({}, styles_default === null || styles_default === void 0 ? void 0 : styles_default._android), props === null || props === void 0 ? void 0 : props._android) : {})), (react_native_1.Platform.OS === "web"
        ? Object.assign(Object.assign({}, styles_default === null || styles_default === void 0 ? void 0 : styles_default._web), props === null || props === void 0 ? void 0 : props._web) : {}));
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
        { color: theme.colors[combinedProps.color] || combinedProps.color }
    ]);
    const animate = (text) => {
        react_native_1.Animated.timing(animation, {
            toValue: text ? 1 : 0,
            duration: 100,
            useNativeDriver: true,
        }).start();
    };
    (0, react_1.useEffect)(() => {
        if (!focus)
            animate(props.value);
    }, [props.value]);
    return (<>
            {combinedProps.label &&
            <AnimatedText pointerEvents="none" style={[
                    (combinedProps.isFloat ?
                        {
                            padding: 3,
                            marginLeft: 10,
                            backgroundColor: '#fff',
                            zIndex: 1000,
                            marginRight: 'auto',
                            marginBottom: -10,
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
                ]} {...combinedProps._label}>
                    {combinedProps.label}{combinedProps.isRequired && <Text_1.Text color={'danger.100'}> *</Text_1.Text>}
                </AnimatedText>}
            <Box_1.Box alignItems={'center'} flexDir="row" rounded={1} borderWidth={1} {...Object.assign(Object.assign({}, styles_default._containerStyle), combinedProps._containerStyle)} borderColor={((_c = styles_default === null || styles_default === void 0 ? void 0 : styles_default._containerStyle) === null || _c === void 0 ? void 0 : _c.borderColor) || ((_d = combinedProps._containerStyle) === null || _d === void 0 ? void 0 : _d.borderColor) || (focus ? 'primary.100' : 'light.100')}>
                {combinedProps.iconLeft}
                <react_native_1.TextInput {...combinedProps} secureTextEntry={combinedProps.isPassword && !showPassword} style={[
            theme.fontFamily && { fontFamily: ((_e = theme === null || theme === void 0 ? void 0 : theme.fonts) === null || _e === void 0 ? void 0 : _e[theme.fontFamily + '_' + ((inputStyle === null || inputStyle === void 0 ? void 0 : inputStyle.fontWeight) || '400')]) || theme.fontFamily + '_' + ((inputStyle === null || inputStyle === void 0 ? void 0 : inputStyle.fontWeight) || '400') },
            inputStyle,
            theme.fontFamily && { fontWeight: undefined }
        ]} onFocus={e => {
            var _a;
            animate(true);
            (_a = props.onFocus) === null || _a === void 0 ? void 0 : _a.call(props, e);
            setFocus(true);
        }} onBlur={e => {
            var _a;
            animate(props.value);
            (_a = props.onBlur) === null || _a === void 0 ? void 0 : _a.call(props, e);
            setFocus(false);
        }}/>
                {combinedProps.isPassword && (<Button_1.Button onPress={() => setShowPassword(!showPassword)} variant={'ghost'} rounded={40} p={1} mr={2} marginVertical={4.5} icon={<Icon_1.Icon name={showPassword ? "eye-off" : 'eye'} as={'Feather'} size={16}/>} {...combinedProps._iconRight}/>)}
            </Box_1.Box>
        </>);
};
exports.InputText = InputText;
