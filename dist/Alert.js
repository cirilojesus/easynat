"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hideAlert = exports.showAlert = void 0;
const react_native_1 = require("react-native");
const react_native_root_siblings_1 = __importDefault(require("react-native-root-siblings"));
const Box_1 = require("./Box");
let currentAlert = null;
let timer = null;
const AnimatedPressable = react_native_1.Animated.createAnimatedComponent(react_native_1.Pressable);
let animate = (value, callBack) => null;
const showAlert = (message, colorScheme, props, duration = 3000) => {
    if (currentAlert)
        animate(0);
    let opacity = new react_native_1.Animated.Value(0);
    animate = (value, callBack) => {
        react_native_1.Animated.timing(opacity, {
            toValue: value,
            duration: 200,
            useNativeDriver: true,
        }).start(({ finished }) => {
            if (finished)
                callBack === null || callBack === void 0 ? void 0 : callBack();
        });
    };
    setTimeout(() => {
        if (currentAlert) {
            currentAlert.destroy();
            currentAlert = null;
            clearTimeout(timer);
        }
        currentAlert = new react_native_root_siblings_1.default(<AnimatedPressable style={[
                {
                    transform: [
                        {
                            translateY: opacity.interpolate({
                                inputRange: [0, 1],
                                outputRange: [-100, 0],
                            })
                        }
                    ],
                    width: '100%',
                    top: 0,
                    position: "absolute",
                    alignSelf: "center",
                    zIndex: 10000,
                },
                { opacity },
            ]} onPress={exports.hideAlert}>
                <Box_1.Box safeAreaTop bg={colorScheme + '.100'} _text={{ color: 'white' }} p={3} {...props}>
                    {message}
                </Box_1.Box>
            </AnimatedPressable>);
        animate(1);
        timer = setTimeout(exports.hideAlert, duration);
    }, 50);
};
exports.showAlert = showAlert;
const hideAlert = () => {
    if (currentAlert) {
        animate(0, () => {
            currentAlert.destroy();
            currentAlert = null;
            clearTimeout(timer);
        });
    }
};
exports.hideAlert = hideAlert;
//# sourceMappingURL=Alert.js.map