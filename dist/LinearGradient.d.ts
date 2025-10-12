import { SvgProps, RectProps } from "react-native-svg";
import { BSDefaultProps } from "./utils/DEFAULT_PROPS";
import { Theme } from "./theme";
export type GradientColor = {
    color: keyof Theme["colors"];
    offset?: number;
    opacity?: number;
};
export type BSLinearGradientProps = SvgProps & BSDefaultProps & {
    colors: GradientColor[];
    angle?: number;
    type?: "linear" | "radial";
    _rect?: RectProps;
    _ios?: BSLinearGradientProps;
    _android?: BSLinearGradientProps;
    _web?: BSLinearGradientProps;
};
export declare const BSLinearGradient: React.FC<BSLinearGradientProps>;
