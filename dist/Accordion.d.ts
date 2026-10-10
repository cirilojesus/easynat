import React, { ReactElement } from "react";
import { CollapseProps } from "./Collapse";
import { EABoxProps } from "./Box";
export type AccordionProps = EABoxProps & {
    children: ReactElement<AccordionItemProps>[] | ReactElement<AccordionItemProps>;
    /** Índice (o índices con allowMultiple) abiertos al empezar */
    defaultIndex?: number | number[];
    /** @deprecated usa defaultIndex */
    showIndex?: number;
    /** Controlado: índice abierto (o índices con allowMultiple); -1 / [] para ninguno */
    index?: number | number[];
    /** Se llama al abrir o cerrar un item, con el índice abierto (o los índices con allowMultiple) */
    onChange?: (index: number | number[]) => void;
    /** Permite tener varios items abiertos a la vez (por defecto, abrir uno cierra el anterior) */
    allowMultiple?: boolean;
};
export type AccordionItemProps = Omit<CollapseProps, 'isOpen' | 'defaultOpen'>;
declare const AccordionItem: React.FC<AccordionItemProps>;
export declare const Accordion: React.FC<AccordionProps> & {
    Item: typeof AccordionItem;
};
export {};
