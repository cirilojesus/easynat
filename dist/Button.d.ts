/// <reference types="react" />
import { COLOR_SCHEME, VARIANT_BUTTON } from './theme';
import { BSPressableProps } from "./Pressable";
import { IconProps } from "./Icon";
export type BSButtonProps = Omit<BSPressableProps, 'variant' | '_ios' | '_android' | '_web' | '_pressed'> & {
    variant?: VARIANT_BUTTON | (string & {});
    colorScheme?: COLOR_SCHEME;
    _ios?: Omit<BSButtonProps, '_ios' | '_android' | '_web'>;
    _android?: Omit<BSButtonProps, '_ios' | '_android' | '_web'>;
    _web?: Omit<BSButtonProps, '_ios' | '_android' | '_web'>;
    _icon?: Partial<IconProps<any>>;
    _iconRight?: Partial<IconProps<any>>;
    icon?: React.ReactElement<IconProps<any>>;
    iconRight?: React.ReactElement<IconProps<any>>;
    _pressed?: Omit<BSButtonProps, '_ios' | '_android' | '_web' | '_pressed'>;
    size?: 'sm' | 'md' | 'lg' | 'xl';
};
export declare const Button: React.FC<BSButtonProps>;
