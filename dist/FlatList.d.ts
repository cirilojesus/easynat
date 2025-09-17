import { FlatListProps } from "react-native";
import { BSDefaultProps } from "./utils/DEFAULT_PROPS";
export type BSFlatListProps<T> = FlatListProps<T> & BSDefaultProps & {
    _ios?: BSFlatListProps<T>;
    _android?: BSFlatListProps<T>;
    _web?: BSFlatListProps<T>;
};
export declare function FlatList<T>({ style, ...props }: BSFlatListProps<T>): import("react").JSX.Element;
