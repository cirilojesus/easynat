import React from "react";
import { EABoxProps } from "./Box";
import { EATextInputProps } from "./Input";
import { EASelectProps } from "./Select";
import { EATextProps } from "./Text";
import { EAButtonProps } from "./Button";
import { EACheckBoxProps } from "./CheckBox";
import { EASwitchProps } from "./Switch";
import { DatePickerType } from "./DatePicker";
import { SearchInputModel } from "./SearchInput";
import { SliderProps } from "./Slider";
/** Un archivo como lo dan los selectores (expo-image-picker, expo-document-picker...) o solo su nombre / URI */
export type FormFile = string | {
    name?: string;
    fileName?: string;
    uri?: string;
    mimeType?: string;
    type?: string;
    size?: number;
    fileSize?: number;
};
export interface InputValidation {
    required?: boolean;
    email?: boolean;
    /** Número (acepta decimales con "." o ",") */
    number?: boolean;
    /** Número entero */
    integer?: boolean;
    /** Número mayor que 0 */
    positive?: boolean;
    /** Valor numérico mínimo / máximo */
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    /** Teléfono: dígitos con +, espacios, guiones o paréntesis; de 7 a 15 dígitos */
    phone?: boolean;
    /** URL (con o sin http/https) */
    url?: boolean;
    /** Solo letras (con acentos y ñ) y espacios */
    alpha?: boolean;
    /** Solo letras, números y espacios */
    alphanumeric?: boolean;
    /** Igual que otro campo del formulario (p. ej. confirmar contraseña: sameAs: 'password') */
    sameAs?: string;
    /** Listas (p. ej. un SearchInput múltiple): mínimo / máximo de elementos */
    minItems?: number;
    maxItems?: number;
    /** Tipos de archivo permitidos: extensiones ('png', '.mp4') o tipos MIME ('image/*', 'application/pdf') */
    fileTypes?: string[];
    /** Tamaño máximo de archivo en bytes (p. ej. 5 * 1024 * 1024) */
    maxFileSize?: number;
    custom?: (controls: FormGroupRef<any>['controls']) => any;
    pattern?: RegExp;
    /** Mensajes propios por regla: { required: 'Pon tu nombre', min: 'Mínimo {{min}} años' } */
    messages?: Partial<Record<Exclude<keyof InputValidation, 'messages' | 'custom'>, string>>;
}
export type FormSchema = Record<string, [any, InputValidation?]>;
export type FormValues<T extends FormSchema> = {
    [K in keyof T]: T[K][0];
};
type ControlType<T> = {
    value: T;
    error: string;
    /** Deshabilitado: el campo no se puede editar y validate() / isInvalid() lo ignoran */
    disabled?: boolean;
    setValue: (value: T) => void;
    validate: (value: T) => string;
    reset: () => void;
    validation: InputValidation;
};
type PlatformKeys = '_android' | '_ios' | '_web';
type SharedKeys = PlatformKeys | 'value' | 'onChange' | 'size' | 'label' | 'variant' | 'children' | 'color' | 'icon' | '_icon' | 'placeholder' | '_containerStyle' | '_label';
type CombinedProps = Omit<Partial<EASelectProps>, SharedKeys> & Omit<Partial<EATextInputProps>, SharedKeys> & Omit<Partial<EASwitchProps>, SharedKeys> & Omit<Partial<EACheckBoxProps>, SharedKeys> & Omit<DatePickerType, SharedKeys> & Omit<Partial<SearchInputModel>, SharedKeys> & Omit<Partial<SliderProps>, SharedKeys | 'defaultValue' | 'onChangeEnd' | 'onChangeStart'> & {
    value?: any;
    onChange?: (e: any) => void;
    size?: any;
    label?: string | number;
    variant?: string;
    children?: React.ReactNode;
    color?: string;
    icon?: any;
    _icon?: any;
    placeholder?: string;
    _containerStyle?: EABoxProps | EAButtonProps;
    _label?: EATextProps;
    _android?: Omit<CombinedProps, PlatformKeys>;
    _ios?: Omit<CombinedProps, PlatformKeys>;
    _web?: Omit<CombinedProps, PlatformKeys>;
};
export interface InputFormParams<T extends FormSchema> extends CombinedProps {
    formControl: keyof T;
    formGroup: FormGroupRef<T>;
    _box?: EABoxProps;
    /** Estilo del mensaje de error de validación */
    _error?: EATextProps;
    isSelect?: boolean;
    isCheckBox?: boolean;
    isRadio?: boolean;
    isSwitch?: boolean;
    isDate?: boolean;
    isSearch?: boolean;
    /** Slider (un valor o rango [desde, hasta] con range) */
    isSlider?: boolean;
}
export type EAFormItemProps = Omit<CombinedProps, 'label' | 'value'> & {
    label: string | number;
    value: string | number;
};
type Errors<T> = Partial<Record<keyof T, string>>;
/**
 * Un formulario: sus campos con el valor inicial y las reglas de validación de cada uno. Se crea una vez (fuera del
 * componente o con useRef) y cada Control se conecta a un campo con formGroup y formControl
 * @example const form = new FormGroupRef({
 *     email: ['', { required: true, email: true }],
 *     edad: ['', { integer: true, min: 18 }],
 * });
 * form.submit(valores => api.guardar(valores));
 */
export declare class FormGroupRef<T extends FormSchema> {
    #private;
    controls: {
        [K in keyof T]: ControlType<T[K][0]>;
    };
    value: FormValues<T>;
    initValue: FormValues<T>;
    constructor(form: T);
    subscribe: (control: keyof T | "FORM_REF") => (callback: () => void) => () => void;
    getSnapshot: (control: keyof T | "FORM_REF") => () => any;
    setInitValue(value: Partial<Record<keyof T, any>>, setControls?: boolean): void;
    setValue(value: Partial<Record<keyof T, any>>, validate?: boolean): void;
    setControlValue<K extends keyof T>(control: K, value: T[K][0], validate?: boolean): void;
    /** Valor de un campo */
    getValue<K extends keyof T>(control: K): T[K][0];
    /** Copia de todos los valores */
    getValues(): FormValues<T>;
    /** ¿Ha cambiado respecto al valor inicial? Un campo, o cualquiera si no se indica */
    isDirty(control?: keyof T): boolean;
    /** Solo los campos que han cambiado (p. ej. para enviar un PATCH) */
    getDirtyValues(): Partial<FormValues<T>>;
    /** Valida todos los campos (salvo los deshabilitados) y muestra sus errores. true si todo es válido */
    validate(): boolean;
    /** ¿Hay algún campo inválido? Sin mostrar errores (p. ej. para deshabilitar el botón de enviar) */
    isInvalid(): boolean;
    validateControl(control: keyof T, validation?: InputValidation): void;
    /** Valida y, si todo es válido, llama a onValid con los valores; si no, a onInvalid con los errores */
    submit(onValid: (values: FormValues<T>) => any, onInvalid?: (errors: Errors<T>) => any): any;
    /** Cambia las reglas de un campo (las reemplaza) y lo revalida si ya se había tocado */
    setValidation(control: keyof T, validation?: InputValidation): void;
    /** Añade reglas a las que ya tiene (p. ej. hacerlo obligatorio según otro campo) */
    addValidation(control: keyof T, validation: InputValidation): void;
    /** Quita reglas concretas (['required', 'min']) o todas si no se indican */
    removeValidation(control: keyof T, rules?: (keyof InputValidation)[]): void;
    /** Pone un error a mano (p. ej. uno del servidor: "ese email ya existe") */
    setError(control: keyof T, error: string): void;
    /** Varios errores a la vez: { email: 'Ya existe', usuario: 'No disponible' } */
    setErrors(errors: Errors<T>): void;
    /** Quita los errores de unos campos, o de todos */
    clearErrors(controls?: (keyof T)[]): void;
    /** Errores visibles ahora: { campo: mensaje } (solo los que tienen) */
    getErrors(): Errors<T>;
    /** Deshabilita un campo: no se puede editar y validate() / isInvalid() lo ignoran (su valor se mantiene) */
    disable(control: keyof T): void;
    enable(control: keyof T): void;
    isDisabled(control: keyof T): boolean;
    hasControl(control: PropertyKey): control is keyof T;
    /**
     * Añade un campo (p. ej. "añadir otro teléfono"). Si ya existe, no hace nada.
     * Sin definición, restaura uno quitado con removeControl (con sus reglas, su valor y su valor inicial)
     */
    addControl(control: string, definition?: [any, InputValidation?]): void;
    /**
     * Quita un campo del formulario (su valor, su valor inicial y sus errores): deja de validarse y de salir
     * en getValues. Su input sigue en pantalla con lo escrito; addControl(nombre) lo vuelve a conectar
     */
    removeControl(control: keyof T): void;
    /** Vuelve a los valores iniciales (o a estos valores, si se pasan) y quita los errores */
    reset(values?: Partial<Record<keyof T, any>>): void;
    /** Vuelve un campo a su valor inicial y le quita el error */
    resetControl(control: keyof T): void;
    /**
     * Llama a `listener` con los valores cada vez que cambia un VALOR del formulario (o de ese campo); no
     * con cambios de errores o de disable. Devuelve la función para dejar de escuchar.
     * @example const stop = form.watch(values => guardarBorrador(values)); ... stop();
     */
    watch(listener: (values: FormValues<T>) => void, control?: keyof T): () => void;
    /**
     * Pinta algo que depende del formulario y se actualiza solo, directamente en el JSX.
     * Con `control`, solo se redibuja cuando cambia ese campo; sin él, con cualquier cambio.
     * Si devuelve texto o un número se envuelve en un <Text> (vale dentro de cualquier Box).
     * @example <Box>{form.listener(v => v.nombre, 'nombre')}</Box>
     * @example {form.listener(v => `Total: ${v.precio * v.cantidad} €`)}
     * @example {form.listener(v => v.acepto ? <Button>Enviar</Button> : null, 'acepto')}
     */
    listener(render: (values: FormValues<T>, form: this) => React.ReactNode, control?: keyof T): React.ReactElement;
    /**
     * Hook: el valor plano (texto, número, lo que devuelva `select`) para usarlo donde quieras (props,
     * concatenar, condiciones). Re-renderiza el componente cuando cambia ese campo (o cualquiera, sin `control`).
     * Va en el cuerpo de un componente, como cualquier hook.
     * @example const nombre = form.useListener(v => v.nombre, 'nombre'); <Input placeholder={`Hola ${nombre}`} />
     */
    useListener<R>(select: (values: FormValues<T>, form: this) => R, control?: keyof T): R;
    createControl<K extends keyof T>(control: K, props: [any, InputValidation?]): void;
    private notify;
}
/**
 * Hook: un campo del formulario (value, error, setValue…). El componente solo se vuelve a pintar cuando cambia ese campo
 * @example const email = useFormControl(form, 'email');
 * <Text>{email.error ?? email.value}</Text>
 */
export declare const useFormControl: <T extends FormSchema, K extends keyof T>(formGroup: FormGroupRef<T>, formControl: K) => ControlType<T[K][0]>;
/**
 * Hook: el formulario entero. El componente se vuelve a pintar con cualquier cambio (para isInvalid(), contadores…)
 * @example const f = useFormGroup(form);
 * <Button disabled={f.isInvalid()}>Enviar</Button>
 */
export declare const useFormGroup: <T extends FormSchema>(formGroup: FormGroupRef<T>) => FormGroupRef<T>;
export declare function ListenerForm<T extends FormSchema, K extends keyof T>(props: {
    formGroup: FormGroupRef<T>;
    formControl: K;
    children: (value: ControlType<T[K][0]>) => React.ReactNode;
}): React.ReactNode;
export declare function ListenerForm<T extends FormSchema>(props: {
    formGroup: FormGroupRef<T>;
    formControl?: undefined;
    children: (value: FormGroupRef<T>) => React.ReactNode;
}): React.ReactNode;
export declare const Control: {
    <T extends FormSchema>({ formGroup, formControl, _box: boxProp, _error: errorProp, isSelect, isCheckBox, isRadio, isSwitch, isDate, isSearch, isSlider, ...props }: InputFormParams<T> & {
        Item?: React.FC<EAFormItemProps>;
    }): React.JSX.Element;
    Item: React.FC<EAFormItemProps>;
};
export {};
