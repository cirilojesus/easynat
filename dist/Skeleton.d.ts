import React from 'react';
import { DimensionValue, ViewProps } from 'react-native';
import { BSBoxProps } from './Box';
interface SkeletonProps extends BSBoxProps {
    structure: SkeletonItem[];
}
type SkeletonItem = ViewProps & {
    w?: DimensionValue;
    h?: DimensionValue;
    rounded?: number | string;
    bg?: string;
};
export declare const Skeleton: ({ structure, gap, ...props }: SkeletonProps) => React.JSX.Element;
export {};
