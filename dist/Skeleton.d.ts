import React from 'react';
import { DimensionValue, ViewProps } from 'react-native';
import { EABoxProps } from './Box';
export interface SkeletonProps extends EABoxProps {
    structure: SkeletonItem[];
}
type SkeletonItem = ViewProps & {
    w?: DimensionValue;
    h?: DimensionValue;
    rounded?: number | string;
    bg?: string;
};
export declare const Skeleton: (rawProps: SkeletonProps) => React.JSX.Element;
export {};
