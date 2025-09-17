import { ViewProps } from "react-native";
import { BSTextProps } from "./Text";
import { BSDefaultProps } from "./utils/DEFAULT_PROPS";
export type BSBoxProps = ViewProps & BSDefaultProps & {
    _text?: BSTextProps;
    safeArea?: boolean;
    safeAreaTop?: boolean;
    safeAreaBottom?: boolean;
    safeAreaLeft?: boolean;
    safeAreaRight?: boolean;
    _ios?: BSBoxProps;
    _android?: BSBoxProps;
    _web?: BSBoxProps;
};
export declare const Box: React.FC<BSBoxProps>;
