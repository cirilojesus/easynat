import { BSPressableProps } from "./Pressable";
import { IconProps } from "./Icon";
import { BSBoxProps } from "./Box";
import { BSTextProps } from "./Text";
export type BSSelectProps = BSPressableProps & {
    placeholder?: string;
    defaultValue?: string | number;
    onChange?: (val: string | number) => void;
    _menu?: Partial<BSBoxProps>;
    _option?: Partial<BSPressableProps>;
    _selected?: Partial<BSPressableProps>;
    _icon?: IconProps;
    icon?: boolean | React.ReactElement<any>;
    children?: React.ReactElement<BSSelectItemProps>[];
    label?: string;
    _label?: BSTextProps;
    isFloat?: boolean;
    isRequired?: boolean;
};
export type BSSelectItemProps = BSPressableProps & {
    label: string | number;
    value: string | number;
};
export declare const Select: React.FC<BSSelectProps> & {
    Item: React.FC<BSSelectItemProps>;
};
