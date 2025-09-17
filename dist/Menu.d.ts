import React from "react";
import { ViewProps } from "react-native";
import { BSDefaultProps } from "./utils/DEFAULT_PROPS";
import { BSScrollBoxProps } from "./Scrollview";
export type Placement = "bottom" | "top";
export type MenuDir = "left" | "right";
export type BSMenuProps = ViewProps & BSDefaultProps & {
    trigger?: (props: {
        onPress: (e: any) => void;
    }) => React.ReactNode;
    defaultOpen?: boolean;
    placement?: Placement;
    menuDir?: MenuDir;
    _ios?: BSMenuProps;
    _android?: BSMenuProps;
    _web?: BSMenuProps;
    children?: React.ReactElement<any> | React.ReactElement<any>[];
    _contentStyle?: BSScrollBoxProps;
};
export declare const Menu: React.FC<BSMenuProps>;
