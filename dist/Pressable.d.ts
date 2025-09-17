import { PressableProps } from "react-native";
import { BSDefaultProps } from "./utils/DEFAULT_PROPS";
import { BSTextProps } from "./Text";
export type BSPressableProps = PressableProps & BSDefaultProps & {
    _text?: BSTextProps;
    _ios?: BSPressableProps;
    _android?: BSPressableProps;
    _web?: BSPressableProps;
    _pressed?: BSPressableProps;
};
export declare const Pressable: React.FC<BSPressableProps>;
