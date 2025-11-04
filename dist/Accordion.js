import React, { useRef } from "react";
import { Collapse } from "./Collapse";
import { FlatList } from "./FlatList";
const AccordionItem = () => null;
export const Accordion = ({ children, showIndex, ...props }) => {
    const refs = useRef([]);
    const lastIndex = useRef(null);
    return (<FlatList removeClippedSubviews initialNumToRender={5} windowSize={10} nestedScrollEnabled scrollEnabled={false} {...props} data={React.Children.toArray(children)} keyExtractor={(_, i) => i.toString()} renderItem={({ item, index }) => <Collapse {...item.props} ref={(ref) => {
                refs.current[index] = ref;
            }} trigger={({ onPress, ...rest }) => {
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
            }}/>}/>);
};
Accordion.Item = AccordionItem;
