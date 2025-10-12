import { BSDefaultProps } from "./utils/DEFAULT_PROPS";
import { Theme } from "./theme";
import { BSBoxProps } from "./Box";
export type EAProgressBarProps = BSBoxProps & BSDefaultProps & {
    progress: number;
    color?: keyof Theme["colors"];
    text?: boolean | string;
    _ios?: EAProgressBarProps;
    _android?: EAProgressBarProps;
    _web?: EAProgressBarProps;
};
export declare const ProgressBar: React.FC<EAProgressBarProps>;
