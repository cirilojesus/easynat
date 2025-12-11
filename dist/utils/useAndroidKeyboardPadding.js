"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAndroidKeyboardPadding = void 0;
const react_native_1 = require("react-native");
const react_1 = require("react");
const useAndroidKeyboardPadding = (ref) => {
    (0, react_1.useEffect)(() => {
        if (react_native_1.Platform.OS !== "android")
            return;
        const showSub = react_native_1.Keyboard.addListener("keyboardDidShow", (e) => {
            var _a, _b;
            (_b = (_a = ref.current) === null || _a === void 0 ? void 0 : _a.setNativeProps) === null || _b === void 0 ? void 0 : _b.call(_a, {
                style: {
                    paddingBottom: e.endCoordinates.height - 24,
                    marginBottom: 24,
                },
            });
        });
        const hideSub = react_native_1.Keyboard.addListener("keyboardDidHide", () => {
            var _a, _b;
            (_b = (_a = ref.current) === null || _a === void 0 ? void 0 : _a.setNativeProps) === null || _b === void 0 ? void 0 : _b.call(_a, {
                style: {
                    paddingBottom: 0,
                    marginBottom: 0,
                },
            });
        });
        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);
};
exports.useAndroidKeyboardPadding = useAndroidKeyboardPadding;
