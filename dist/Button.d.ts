/// <reference types="react" />
import { BSDefaultProps } from "./utils/DEFAULT_PROPS";
import { COLOR_SCHEME, VARIANT_BUTTON } from './theme';
import { BSPressableProps } from "./Pressable";
import { IconProps } from "./Icon";
export type BSButtonProps = Omit<BSPressableProps, 'variant'> & BSDefaultProps & {
    variant?: VARIANT_BUTTON | (string & {});
    colorScheme?: COLOR_SCHEME;
    _ios?: BSButtonProps;
    _android?: BSButtonProps;
    _web?: BSButtonProps;
    _icon?: Partial<IconProps<any>>;
    _iconRight?: Partial<IconProps<any>>;
    icon?: React.ReactElement<IconProps<any>>;
    iconRight?: React.ReactElement<IconProps<any>>;
    _pressed?: BSButtonProps;
    size?: 'sm' | 'md' | 'lg' | 'xl';
};
export declare const Button: React.FC<BSButtonProps>;
