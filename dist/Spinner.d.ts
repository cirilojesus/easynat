/// <reference types="react" />
import { ActivityIndicatorProps } from "react-native";
import { BSDefaultProps } from "./utils/DEFAULT_PROPS";
import { Theme } from "./theme";
export type EASpinnerProps = ActivityIndicatorProps & BSDefaultProps & {
    color?: keyof Theme["colors"];
    _ios?: EASpinnerProps;
    _android?: EASpinnerProps;
    _web?: EASpinnerProps;
};
export declare const Spinner: React.FC<EASpinnerProps>;
