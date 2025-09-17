import { BSDefaultProps } from "./utils/DEFAULT_PROPS";
import { COLOR_SCHEME, VARIANT_BUTTON } from './theme';
import { BSPressableProps } from "./Pressable";
export type BSButtonProps = BSPressableProps & BSDefaultProps & {
    variant?: VARIANT_BUTTON | (string & {});
    colorScheme?: COLOR_SCHEME;
    _ios?: BSButtonProps;
    _android?: BSButtonProps;
    _web?: BSButtonProps;
};
export declare const Button: React.FC<BSButtonProps>;
