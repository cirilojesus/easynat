import React, { ReactElement, useState } from "react";
import { Collapse, CollapseProps } from "./Collapse";
import { Box, EABoxProps } from "./Box";
import { useThemeProps } from "./utils/useThemeProps";

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
}

export type AccordionItemProps = Omit<CollapseProps, 'isOpen' | 'defaultOpen'>;

const AccordionItem: React.FC<AccordionItemProps> = () => null;

const toList = (v?: number | number[]) => (v == null ? [] : Array.isArray(v) ? v : v < 0 ? [] : [v]);

export const Accordion: React.FC<AccordionProps> & { Item: typeof AccordionItem } = (rawProps) => {
    // Defaults → theme.components.Accordion → variante → props → plataforma (el variant no pasa al Box)
    const [{ children, defaultIndex, showIndex, index, onChange, allowMultiple, variant: _variant, ...props }] =
        useThemeProps<AccordionProps>('Accordion', rawProps, { defaults: { gap: 8 } });

    // Cada item es un Collapse controlado: el Accordion decide cuáles están abiertos
    const [inner, setInner] = useState<number[]>(() => toList(defaultIndex ?? showIndex));
    const openList = index !== undefined ? toList(index) : inner;

    const toggle = (i: number, open: boolean) => {
        const next = open
            ? (allowMultiple ? [...openList.filter(x => x !== i), i] : [i])
            : openList.filter(x => x !== i);
        if (index === undefined) setInner(next);
        onChange?.(allowMultiple ? next : (next[0] ?? -1));
    };

    const items = React.Children.toArray(children).filter(React.isValidElement) as ReactElement<AccordionItemProps>[];

    return (
        <Box {...props}>
            {items.map((item, i) => (
                <Collapse
                    key={item.key ?? i}
                    {...item.props}
                    isOpen={openList.includes(i)}
                    onChange={open => {
                        toggle(i, open);
                        item.props.onChange?.(open);
                    }}
                />
            ))}
        </Box>
    );
};

Accordion.Item = AccordionItem;
