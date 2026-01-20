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
exports.Label = void 0;
const Text_1 = require("./Text");
const react_1 = require("react");
const react_native_1 = require("react-native");
const AnimatedText = react_native_1.Animated.createAnimatedComponent(Text_1.Text);
exports.Label = (0, react_1.forwardRef)((_a, ref) => {
    var { isFloat, isRequired } = _a, props = __rest(_a, ["isFloat", "isRequired"]);
    const animation = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    (0, react_1.useImperativeHandle)(ref, () => ({
        animate: (value) => {
            react_native_1.Animated.timing(animation, {
                toValue: value ? 1 : 0,
                duration: 100,
                useNativeDriver: true,
            }).start();
        }
    }), []);
    return (<AnimatedText pointerEvents="none" style={[
            (isFloat ?
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
        ]} {...props}>
            {props.children}{isRequired && <Text_1.Text color={'danger.100'}> *</Text_1.Text>}
        </AnimatedText>);
});
