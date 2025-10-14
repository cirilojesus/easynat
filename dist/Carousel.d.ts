/// <reference types="react" />
import { BSFlatListProps } from './FlatList';
import { BSButtonProps } from './Button';
import { BSBoxProps } from './Box';
export type CarouselType<T extends React.ReactElement = any> = BSBoxProps & {
    _contentStyle?: Partial<BSFlatListProps<T>>;
    _contentTabStyle?: Partial<BSFlatListProps<T>>;
    _tabStyle?: BSButtonProps;
    _tabActiveStyle?: BSButtonProps;
    _arrow?: BSButtonProps;
    mode?: 'peek' | 'default';
    arrows?: boolean;
    tabs?: boolean;
};
export type EACarouselItem = BSBoxProps & {
    tab?: string;
};
export declare const Carousel: {
    <T extends import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>>({ tabs, arrows, ...props }: CarouselType): import("react").JSX.Element;
    Item: import("react").FC<any>;
};
