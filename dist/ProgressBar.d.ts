import React from "react";
import { EADefaultProps } from "./utils/DEFAULT_PROPS";
import { ThemeColor } from "./theme";
import { EABoxProps } from "./Box";
export type EAProgressBarProps = EABoxProps & EADefaultProps & {
    progress: number;
    color?: ThemeColor;
    text?: boolean | string;
    _ios?: EAProgressBarProps;
    _android?: EAProgressBarProps;
    _web?: EAProgressBarProps;
};
export declare const ProgressBar: React.FC<EAProgressBarProps>;
