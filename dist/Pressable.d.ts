/// <reference types="react" />
import { PressableProps } from "react-native";
import { BSDefaultProps } from "./utils/DEFAULT_PROPS";
import { BSTextProps } from "./Text";
export type BSPressableProps = PressableProps & BSDefaultProps & {
    _text?: BSTextProps;
    _ios?: Omit<BSPressableProps, '_ios' | '_android' | '_web'>;
    _android?: Omit<BSPressableProps, '_ios' | '_android' | '_web'>;
    _web?: Omit<BSPressableProps, '_ios' | '_android' | '_web'>;
    _pressed?: Omit<BSPressableProps, '_pressed' | '_ios' | '_android' | '_web'>;
    variant?: (string & {});
};
export declare const Pressable: React.FC<BSPressableProps>;
