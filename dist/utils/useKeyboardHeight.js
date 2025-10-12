"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useKeyboardHeight = useKeyboardHeight;
// useKeyboardHeight.ts
const react_1 = require("react");
const react_native_1 = require("react-native");
function useKeyboardHeight() {
    const [keyboardHeight, setKeyboardHeight] = (0, react_1.useState)(0);
    (0, react_1.useEffect)(() => {
        const showSub = react_native_1.Keyboard.addListener("keyboardDidShow", (e) => {
            if (keyboardHeight != e.endCoordinates.height)
                setKeyboardHeight(e.endCoordinates.height);
        });
        const hideSub = react_native_1.Keyboard.addListener("keyboardDidHide", () => setKeyboardHeight(0));
        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);
    return keyboardHeight;
}
//# sourceMappingURL=useKeyboardHeight.js.map