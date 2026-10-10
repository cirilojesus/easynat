import { SvgProps, RectProps } from "react-native-svg";
import { EADefaultProps } from "./utils/DEFAULT_PROPS";
import { ThemeColor } from "./theme";
import React from "react";
export type GradientColor = {
    color: ThemeColor;
    offset?: number;
    opacity?: number;
};
export type EALinearGradientProps = SvgProps & EADefaultProps & {
    colors: GradientColor[];
    angle?: number;
    type?: "linear" | "radial";
    _rect?: RectProps;
    _ios?: EALinearGradientProps;
    _android?: EALinearGradientProps;
    _web?: EALinearGradientProps;
    variant?: (string & {});
};
export declare const EALinearGradient: React.FC<EALinearGradientProps>;
