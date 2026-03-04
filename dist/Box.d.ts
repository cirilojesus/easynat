/// <reference types="react" />
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
    _ios?: Omit<BSBoxProps, '_ios' | '_android' | '_web'>;
    _android?: Omit<BSBoxProps, '_ios' | '_android' | '_web'>;
    _web?: Omit<BSBoxProps, '_ios' | '_android' | '_web'>;
    padding?: number;
    paddingTop?: number;
    paddingBottom?: number;
    paddingLeft?: number;
    paddingRight?: number;
    paddingHorizontal?: number;
    paddingVertical?: number;
    variant?: 'badge' | (string & {});
};
export declare const Box: React.FC<BSBoxProps>;
