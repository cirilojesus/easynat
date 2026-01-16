import React from "react";
import { ViewProps, ListRenderItem } from "react-native";
import { BSDefaultProps } from "./utils/DEFAULT_PROPS";
import { BSFlatListProps } from "./FlatList";
import { BSButtonProps } from "./Button";
export type Placement = "bottom" | "top";
export type MenuDir = "left" | "right";
/** Item por defecto para Menu.Item (si usas children) */
export type EAMenuItemType = BSButtonProps & {
    label?: string | number;
    value?: string | number;
};
export type MenuRef = {
    open: () => void;
    close: () => void;
    toggle: () => void;
    isOpen: () => boolean;
};
export type BSMenuProps<T = unknown> = ViewProps & BSDefaultProps & {
    trigger?: (props: {
        onPress: (e: any) => void;
    }) => React.ReactNode;
    defaultOpen?: boolean;
    placement?: Placement;
    menuDir?: MenuDir;
    _ios?: BSMenuProps<T>;
    _android?: BSMenuProps<T>;
    _web?: BSMenuProps<T>;
    children?: React.ReactElement<any> | React.ReactElement<any>[];
    _contentStyle?: Partial<BSFlatListProps<T>>;
    data?: T[];
    renderItem?: ListRenderItem<T>;
    backdrop?: boolean | 'static';
    useTriggerWidth?: boolean;
};
type MenuComponent = (<T = unknown>(props: BSMenuProps<T> & {
    ref?: React.Ref<MenuRef>;
}) => React.ReactElement | null) & {
    Item: React.FC<EAMenuItemType>;
};
export declare const Menu: MenuComponent;
export {};
