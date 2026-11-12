import React, { useState } from "react";
import { View } from "react-native";
import { useThemeProps } from "./utils/useThemeProps";
import { libT } from "./utils/translate";
import { Text, EATextProps } from "./Text";
import { Pressable } from "./Pressable";

/**
 * Texto recortado a unas líneas con "Leer más" / "Leer menos". El enlace solo sale si el texto no cabe.
 * Las props de texto (fontSize, color, variant…) van al texto.
 * @example <ReadMore numberOfLines={3}>{producto.descripcion}</ReadMore>
 */
export type EAReadMoreProps = Omit<EATextProps, 'numberOfLines' | '_ios' | '_android' | '_web'> & {
    /** Líneas visibles recortado. Por defecto 3 */
    numberOfLines?: number;
    /** Empieza desplegado */
    defaultExpanded?: boolean;
    /** Desplegado (controlado; con onToggle) */
    expanded?: boolean;
    onToggle?: (expanded: boolean) => void;
    /** Texto del enlace para desplegar (por defecto "Leer más" en el idioma actual) */
    readMoreText?: string;
    /** Texto del enlace para recoger (por defecto "Leer menos") */
    readLessText?: string;
    /** false: una vez desplegado no se puede recoger. Por defecto true */
    showLess?: boolean;
    /** Estilo del enlace */
    _readMore?: EATextProps;
    _ios?: Omit<EAReadMoreProps, '_ios' | '_android' | '_web'>;
    _android?: Omit<EAReadMoreProps, '_ios' | '_android' | '_web'>;
    _web?: Omit<EAReadMoreProps, '_ios' | '_android' | '_web'>;
};

export const ReadMore: React.FC<EAReadMoreProps> = (rawProps) => {
    // Defaults → theme.components.ReadMore → variante → props → plataforma
    // (variant es del texto: se pasa al Text)
    const [{
        numberOfLines = 3, defaultExpanded, expanded: controlled, onToggle, readMoreText, readLessText, showLess = true,
        _readMore, children, ...textProps
    }] = useThemeProps<EAReadMoreProps>('ReadMore', rawProps);
    const [internal, setInternal] = useState(!!defaultExpanded);
    const expanded = controlled ?? internal;
    // Líneas del texto completo: se miden con una copia invisible sin límite (con el límite, iOS solo
    // informa de las visibles). null hasta medirlo
    const [lines, setLines] = useState<number | null>(null);
    const overflows = lines !== null && lines > numberOfLines;

    const toggle = () => {
        const next = !expanded;
        if (controlled === undefined) setInternal(next);
        onToggle?.(next);
    };

    return (
        <View>
            <Text {...textProps} numberOfLines={expanded ? undefined : numberOfLines}>{children}</Text>
            {/* Copia invisible para saber cuántas líneas ocupa entero (mismo ancho y estilo) */}
            <Text
                {...textProps}
                aria-hidden
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
                pointerEvents="none"
                style={[textProps.style, { position: 'absolute', left: 0, right: 0, top: 0, opacity: 0 }]}
                onTextLayout={e => {
                    const n = e.nativeEvent.lines.length;
                    if (n !== lines) setLines(n);
                }}
            >
                {children}
            </Text>
            {overflows && (expanded ? showLess : true) && (
                <Pressable onPress={toggle} accessibilityRole="button" accessibilityState={{ expanded }} alignSelf="flex-start" mt={1}
                    hitSlop={8}>
                    <Text color="primary.100" fontWeight="600" fontSize={textProps.fontSize} {..._readMore}>
                        {expanded ? readLessText ?? libT('readLess') : readMoreText ?? libT('readMore')}
                    </Text>
                </Pressable>
            )}
        </View>
    );
};
