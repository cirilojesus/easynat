import { BSPressableProps } from "./Pressable";
import { Icon, IconProps } from "./Icon";
import { BSBoxProps } from "./Box";
export type BSSelectProps = BSPressableProps & {
    placeholder?: string;
    defaultValue?: string | number;
    onChange?: (val: string | number) => void;
    _menu?: Partial<BSBoxProps>;
    _option?: Partial<BSPressableProps>;
    _selected?: Partial<BSPressableProps>;
    _icon?: IconProps;
    icon?: boolean | typeof Icon;
    children: React.ReactElement<BSSelectItemProps>[];
};
export type BSSelectItemProps = BSPressableProps & {
    label: string;
    value: string | number;
};
export declare const Select: React.FC<BSSelectProps> & {
    Item: React.FC<BSSelectItemProps>;
};
