import React from "react";
import { EABoxProps } from "./Box";
import { EATextProps } from "./Text";
import { COLOR_SCHEME } from "./theme";
export type SliderValue = number | [number, number];
export type SliderMark = number | {
    value: number;
    label?: string;
};
export type SliderProps = Omit<EABoxProps, 'children'> & {
    /** Valor (controlado). Un número, o [desde, hasta] para un rango con dos tiradores */
    value?: SliderValue;
    /** Valor inicial (sin controlar). Por defecto min (o [min, max] con range) */
    defaultValue?: SliderValue;
    /** Rango con dos tiradores aunque no haya value / defaultValue */
    range?: boolean;
    /** Por defecto 0 */
    min?: number;
    /** Por defecto 100 */
    max?: number;
    /** Salto entre valores. Por defecto 1 (0 = continuo) */
    step?: number;
    /** Rango: distancia mínima entre los dos tiradores. Por defecto 0 */
    minDistance?: number;
    /** Mientras se arrastra (en cada cambio de valor) */
    onChange?: (value: any) => void;
    /** Al soltar */
    onChangeEnd?: (value: any) => void;
    onChangeStart?: (value: any) => void;
    disabled?: boolean;
    /** Color del relleno y del borde del tirador. Por defecto primary */
    colorScheme?: COLOR_SCHEME;
    size?: 'sm' | 'md' | 'lg';
    /** Burbuja con el valor encima del tirador: siempre (true) o solo al arrastrar ('drag') */
    showValue?: boolean | 'drag';
    /** El texto del valor (burbuja, mínimo / máximo y marcas) */
    formatValue?: (value: number) => string;
    /** Marcas debajo: true = en cada step (si son pocas), o una lista de valores / { value, label } */
    marks?: boolean | SliderMark[];
    /** El mínimo y el máximo debajo, a los lados */
    showMinMax?: boolean;
    label?: string;
    isRequired?: boolean;
    /** El valor a la derecha del label */
    showLabelValue?: boolean;
    _label?: EATextProps;
    /** El carril (sin rellenar) */
    _track?: EABoxProps;
    /** La parte rellena */
    _fill?: EABoxProps;
    _thumb?: EABoxProps;
    /** La burbuja del valor (_text para su texto) */
    _tooltip?: EABoxProps;
    _mark?: EATextProps;
    variant?: 'default' | 'filled' | 'outline' | (string & {});
};
export type SliderRef = {
    /** Cambia el valor (sin llamar a onChange) */
    setValue: (value: SliderValue) => void;
    getValue: () => SliderValue;
};
export declare const Slider: React.ForwardRefExoticComponent<Omit<EABoxProps, "children"> & {
    /** Valor (controlado). Un número, o [desde, hasta] para un rango con dos tiradores */
    value?: SliderValue;
    /** Valor inicial (sin controlar). Por defecto min (o [min, max] con range) */
    defaultValue?: SliderValue;
    /** Rango con dos tiradores aunque no haya value / defaultValue */
    range?: boolean;
    /** Por defecto 0 */
    min?: number;
    /** Por defecto 100 */
    max?: number;
    /** Salto entre valores. Por defecto 1 (0 = continuo) */
    step?: number;
    /** Rango: distancia mínima entre los dos tiradores. Por defecto 0 */
    minDistance?: number;
    /** Mientras se arrastra (en cada cambio de valor) */
    onChange?: (value: any) => void;
    /** Al soltar */
    onChangeEnd?: (value: any) => void;
    onChangeStart?: (value: any) => void;
    disabled?: boolean;
    /** Color del relleno y del borde del tirador. Por defecto primary */
    colorScheme?: COLOR_SCHEME;
    size?: "sm" | "md" | "lg";
    /** Burbuja con el valor encima del tirador: siempre (true) o solo al arrastrar ('drag') */
    showValue?: boolean | "drag";
    /** El texto del valor (burbuja, mínimo / máximo y marcas) */
    formatValue?: (value: number) => string;
    /** Marcas debajo: true = en cada step (si son pocas), o una lista de valores / { value, label } */
    marks?: boolean | SliderMark[];
    /** El mínimo y el máximo debajo, a los lados */
    showMinMax?: boolean;
    label?: string;
    isRequired?: boolean;
    /** El valor a la derecha del label */
    showLabelValue?: boolean;
    _label?: EATextProps;
    /** El carril (sin rellenar) */
    _track?: EABoxProps;
    /** La parte rellena */
    _fill?: EABoxProps;
    _thumb?: EABoxProps;
    /** La burbuja del valor (_text para su texto) */
    _tooltip?: EABoxProps;
    _mark?: EATextProps;
    variant?: "default" | "filled" | "outline" | (string & {});
} & React.RefAttributes<SliderRef>>;
