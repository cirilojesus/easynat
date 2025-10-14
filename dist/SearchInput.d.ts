/// <reference types="react" />
import { BSTextInputProps } from "./Input";
import { BSButtonProps } from "./Button";
import { BSMenuProps } from "./Menu";
export type SearchInputModel<T = any> = BSMenuProps<T> & {
    value: T[] | T | null;
    multiple?: boolean;
    children?: React.ReactElement<EASearchInputItem>[];
    _item?: BSButtonProps & {
        label: keyof T;
        value: keyof T;
    };
    onChange?: (value: T[] | T | null) => any;
    _input?: BSTextInputProps;
};
export type EASearchInputItem = BSButtonProps & {
    label: string | number;
    value: string | number;
};
export declare const SearchInput: {
    <T>({ value, multiple, _item, ...props }: any): import("react").JSX.Element;
    Item: import("react").FC<any>;
};
