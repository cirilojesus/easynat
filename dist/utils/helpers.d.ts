import { DimensionValue } from "react-native";
import { ThemeType } from "../theme-provider";
import { BSTextProps } from "../Text";
import React from "react";
export declare const calcSize: (size: DimensionValue) => any;
export declare const mergeTheme: (libTheme: any, theme: any) => ThemeType;
export declare const renderChild: (children: React.ReactNode, props: BSTextProps) => (bigint | React.JSX.Element | Iterable<React.ReactNode> | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined>)[] | null | undefined;
