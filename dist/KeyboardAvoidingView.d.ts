import { KeyboardAvoidingViewProps } from "react-native";
import { BSDefaultProps } from "./utils/DEFAULT_PROPS";
export type BSKeyboardAvoidingProps = KeyboardAvoidingViewProps & BSDefaultProps & {
    _ios?: BSKeyboardAvoidingProps;
    _android?: BSKeyboardAvoidingProps;
    _web?: BSKeyboardAvoidingProps;
};
export declare const KeyboardAvoidingView: React.FC<BSKeyboardAvoidingProps>;
