// useKeyboardHeight.ts
import { useEffect, useState } from "react";
import { Keyboard, KeyboardEvent } from "react-native";

export function useKeyboardHeight() {
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    useEffect(() => {
        const showSub = Keyboard.addListener("keyboardDidShow", (e: KeyboardEvent) => {
            if (keyboardHeight != e.endCoordinates.height) setKeyboardHeight(e.endCoordinates.height)
        });
        const hideSub = Keyboard.addListener("keyboardDidHide", () => setKeyboardHeight(0));
        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);

    return keyboardHeight;
}
