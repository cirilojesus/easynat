import React, { useRef, ReactElement } from "react";
import { Collapse, CollapseProps, CollapseHandle } from "./Collapse";
import { BSFlatListProps, FlatList } from "./FlatList";
import { ListRenderItemInfo } from "react-native";

type AccordionProps = Partial<BSFlatListProps<any>> & {
    children: ReactElement<AccordionItemProps>[] | ReactElement<AccordionItemProps>;
    showIndex?: number;
}

export type AccordionItemProps = CollapseProps;

const AccordionItem: React.FC<AccordionItemProps> = () => null;

export const Accordion: React.FC<AccordionProps> & { Item: typeof AccordionItem } = ({ children, showIndex, ...props }) => {
    const refs = useRef<CollapseHandle[]>([]);
    const lastIndex = useRef<number | null>(null);

    return (
        <FlatList
            removeClippedSubviews
            initialNumToRender={5}
            windowSize={10}
            nestedScrollEnabled
            scrollEnabled={false}
            {...props}
            data={React.Children.toArray(children)}
            keyExtractor={(_, i) => i.toString()}
            renderItem={({ item, index }: ListRenderItemInfo<ReactElement<AccordionItemProps>>) =>
                <Collapse
                    {...item.props}
                    ref={(ref) => {
                        refs.current[index] = ref as CollapseHandle;
                    }}
                    trigger={({ onPress, ...rest }) => {
                        const handlePress = (e) => {
                            if (lastIndex.current !== null && lastIndex.current !== index) {
                                refs.current[lastIndex.current]?.close();
                            }
                            lastIndex.current = index;
                            onPress?.(e);
                        };

                        return item.props.trigger
                            ? item.props.trigger({ onPress: handlePress, ...rest })
                            : null;
                    }}
                />
            }
        />
    );
};

Accordion.Item = AccordionItem;
