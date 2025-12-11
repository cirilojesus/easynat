import { Keyboard, Platform, View } from "react-native";
import { useEffect } from "react";

export const useAndroidKeyboardPadding = (ref: React.RefObject<View>) => {
    useEffect(() => {
        if (Platform.OS !== "android") return;

        const showSub = Keyboard.addListener("keyboardDidShow", (e) => {
            ref.current?.setNativeProps?.({
                style: {
                    paddingBottom: e.endCoordinates.height - 24,
                    marginBottom: 24,
                },
            });
        });

        const hideSub = Keyboard.addListener("keyboardDidHide", () => {
            ref.current?.setNativeProps?.({
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
