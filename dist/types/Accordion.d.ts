import React, { ReactElement } from "react";
import { CollapseProps } from "./Collapse";
import { BSFlatListProps } from "./FlatList";
type AccordionProps = Partial<BSFlatListProps<any>> & {
    children: ReactElement<AccordionItemProps>[] | ReactElement<AccordionItemProps>;
    showIndex?: number;
};
export type AccordionItemProps = CollapseProps;
declare const AccordionItem: React.FC<AccordionItemProps>;
export declare const Accordion: React.FC<AccordionProps> & {
    Item: typeof AccordionItem;
};
export {};
