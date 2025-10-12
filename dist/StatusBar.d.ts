import { StatusBarProps as RNStatusBarProps } from "react-native";
import { BSDefaultProps } from "./utils/DEFAULT_PROPS";
export type BSStatusBarProps = RNStatusBarProps & BSDefaultProps & {
    _ios?: BSStatusBarProps;
    _android?: BSStatusBarProps;
    _web?: BSStatusBarProps;
};
export declare const StatusBar: React.FC<BSStatusBarProps>;
