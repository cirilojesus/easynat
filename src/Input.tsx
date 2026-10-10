import React, { useEffect, useRef, useState } from "react";
import { TextInput, TextInputProps, StyleSheet, TextStyle, View } from "react-native";
import { DEFAULT_PROPS } from "./utils/DEFAULT_PROPS";
import { Icon } from "./Icon";
import { EAButtonProps, Button } from "./Button";
import { EATextProps } from "./Text";
import { Label, LabelRef } from "./Label";
import { Box, EABoxProps } from "./Box";
import { ThemeColor } from "./theme";
import { mergeProps, useThemeProps } from "./utils/useThemeProps";

export type EATextInputProps = TextInputProps & Omit<EATextProps, '_ios' | '_android' | '_web'> & {
    _ios?: Omit<EATextInputProps, '_ios' | '_android' | '_web'>;
    _android?: Omit<EATextInputProps, '_ios' | '_android' | '_web'>;
    _web?: Omit<EATextInputProps, '_ios' | '_android' | '_web'>;
    label?: string;
    _label?: EATextProps,
    isPassword?: boolean;
    isFloat?: boolean;
    isRequired?: boolean;
    iconLeft?: React.ReactElement,
    _containerStyle?: EABoxProps,
    _focus?: Omit<EATextInputProps, '_ios' | '_android' | '_web' | '_focus'>;
    _iconRight?: EAButtonProps,
    iconRight?: React.ReactElement,
    color?: ThemeColor;
    variant?: InputVariant | (string & {});
    size?: 'sm' | 'md' | 'lg' | 'xl';
};

export type InputVariant = 'outline' | 'filled' | 'underlined' | 'rounded' | 'unstyled';

// Variantes: la caja del campo (_containerStyle). Con foco, el borde pasa al color primary (o al de _focus)
const INPUT_VARIANTS: Record<InputVariant, EATextInputProps> = {
    outline: {},
    filled: { _containerStyle: { bg: 'light.50', borderColor: 'transparent' } },
    underlined: { _containerStyle: { borderWidth: 0, borderBottomWidth: 1, rounded: 0 } },
    rounded: { _containerStyle: { rounded: 40, px: 1.5 } },
    unstyled: { _containerStyle: { borderWidth: 0, bg: 'transparent' } },
};

const INPUT_SIZES: Record<NonNullable<EATextInputProps['size']>, EATextInputProps> = {
    sm: { fontSize: 12, _label: { fontSize: 12 } },
    md: { fontSize: 14, _label: { fontSize: 14 } },
    lg: { fontSize: 16, _label: { fontSize: 16 } },
    xl: { fontSize: 18, _label: { fontSize: 18 } },
};

const isFilled = (v: unknown) => v != null && v !== '';

export const Input: React.FC<EATextInputProps> = ({ style, ...props }) => {
    const [focus, setFocus] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    // Texto escrito cuando el input no es controlado (sin value): para saber si el label flotante debe quedar arriba
    const [typed, setTyped] = useState(() => isFilled(props.defaultValue));
    const labelRef = useRef<LabelRef>(null);
    const [fieldHeight, setFieldHeight] = useState(0);

    // Defaults → theme.components.Input → variante → tamaño → props → plataforma; y _focus con foco
    const [themed, theme] = useThemeProps<EATextInputProps>('Input', props, { sizes: INPUT_SIZES, variants: INPUT_VARIANTS });
    const combinedProps: EATextInputProps = focus && themed._focus ? mergeProps(themed, themed._focus) : themed;
    // Props del Input (no del TextInput nativo)
    const {
        label, _label, isFloat, isRequired, isPassword, iconLeft, iconRight, _iconRight, _containerStyle, _focus,
        variant: _variant, size: _size, color, placeholder, ...inputProps
    } = combinedProps;

    const styles = DEFAULT_PROPS(combinedProps, theme);

    const inputStyle = StyleSheet.flatten<TextStyle>([
        {
            fontSize: 14,
            paddingVertical: 8,
            paddingHorizontal: 12,
            flex: 1,
        },
        style,
        ...styles,
        { color: theme.colors[color ?? 'text'] || color }
    ]);

    // El label flotante sube con foco o con texto (controlado por value, o escrito sin value)
    const hasText = props.value !== undefined ? isFilled(props.value) : typed;
    const raised = focus || hasText;
    useEffect(() => { labelRef.current?.animate(raised) }, [raised]);

    // La caja del campo (borde, iconos y TextInput)
    const field = (
            <Box
                alignItems={'center'}
                flexDir="row"
                rounded={1}
                borderWidth={1}
                {..._containerStyle}
                onLayout={e => {
                    setFieldHeight(e.nativeEvent.layout.height);
                    _containerStyle?.onLayout?.(e);
                }}
                // Con foco: el de _focus, o el que se pase en las props, o primary; sin foco: el del tema/props o light
                borderColor={focus
                    ? themed._focus?._containerStyle?.borderColor ?? props._containerStyle?.borderColor ?? 'primary.100'
                    : themed._containerStyle?.borderColor ?? 'light.100'}
            >
                {iconLeft}
                <TextInput
                    {...inputProps}
                    // Label flotante abajo (vacío y sin foco): hace de placeholder, el placeholder taparía con él
                    placeholder={isFloat && label && !raised ? undefined : placeholder}
                    placeholderTextColor={inputProps.placeholderTextColor ?? theme.colors?.['text.subtle']}
                    secureTextEntry={isPassword && !showPassword}
                    style={[
                        theme.fontFamily && { fontFamily: theme?.fonts?.[theme.fontFamily + '_' + (inputStyle?.fontWeight || '400')] || theme.fontFamily + '_' + (inputStyle?.fontWeight || '400') },
                        inputStyle,
                        theme.fontFamily && { fontWeight: undefined }
                    ]}
                    onChangeText={t => {
                        if (props.value === undefined) setTyped(isFilled(t))
                        props.onChangeText?.(t)
                    }}
                    onFocus={e => {
                        props.onFocus?.(e)
                        setFocus(true)
                    }}
                    onBlur={e => {
                        props.onBlur?.(e)
                        setFocus(false)
                    }}
                />
                {isPassword && (
                    <Button
                        onPress={() => setShowPassword(!showPassword)}
                        variant={'ghost'}
                        rounded={40}
                        p={1}
                        mr={2}
                        marginVertical={4.5}
                        accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        icon={<Icon name={showPassword ? "eye-off" : 'eye'} as={'Feather'} size={16} />}
                        {..._iconRight}
                    />
                )}
                {iconRight}
            </Box>
    );

    if (!label) return field;
    // Con label: label y campo juntos en una vista propia. Si fueran hermanos sueltos (Fragment), el `gap`
    // del contenedor se metía entre ellos y el label flotante no se colocaba sobre el campo
    return (
        <View>
            <Label ref={labelRef} isFloat={isFloat} isRequired={isRequired} fieldHeight={fieldHeight} {..._label}>{label}</Label>
            {field}
        </View>
    );
};
