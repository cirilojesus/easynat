import React, { useContext, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Box, EABoxProps } from "./Box";
import { EATextInputProps, Input } from "./Input";
import { EASelectProps, Select } from "./Select";
import { EATextProps, Text, InsideTextContext } from "./Text";
import { EAButtonProps } from "./Button";
import { CheckBox, EACheckBoxProps } from "./CheckBox";
import { Radio } from "./Radio";
import { EASwitchProps, Switch } from "./Switch";
import { DatePicker, DatePickerType } from "./DatePicker";
import { SearchInput, SearchInputModel } from "./SearchInput";
import { Slider, SliderProps } from "./Slider";
import { libT } from "./utils/translate";
import { Label } from "./Label";
import { useThemeProps } from "./utils/useThemeProps";

/** Un archivo como lo dan los selectores (expo-image-picker, expo-document-picker...) o solo su nombre / URI */
export type FormFile = string | { name?: string; fileName?: string; uri?: string; mimeType?: string; type?: string; size?: number; fileSize?: number };

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
    [K in keyof T]: T[K][0]
}

type ControlType<T> = {
    value: T,
    error: string,
    /** Deshabilitado: el campo no se puede editar y validate() / isInvalid() lo ignoran */
    disabled?: boolean,
    setValue: (value: T) => void,
    validate: (value: T) => string,
    reset: () => void,
    validation: InputValidation
}

type PlatformKeys = '_android' | '_ios' | '_web'
// Props que cada control define con tipos distintos; aquí se aceptan de forma laxa
type SharedKeys = PlatformKeys | 'value' | 'onChange' | 'size' | 'label' | 'variant' | 'children'
    | 'color' | 'icon' | '_icon' | 'placeholder' | '_containerStyle' | '_label'

type CombinedProps = Omit<Partial<EASelectProps>, SharedKeys>
    & Omit<Partial<EATextInputProps>, SharedKeys>
    & Omit<Partial<EASwitchProps>, SharedKeys>
    & Omit<Partial<EACheckBoxProps>, SharedKeys>
    & Omit<DatePickerType, SharedKeys>
    & Omit<Partial<SearchInputModel>, SharedKeys>
    & Omit<Partial<SliderProps>, SharedKeys | 'defaultValue' | 'onChangeEnd' | 'onChangeStart'>
    & {
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
    }

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

const ControlItem: React.FC<EAFormItemProps> = () => null;

const emailValidator =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const urlValidator = /^(https?:\/\/)?([\w-]+\.)+[a-z]{2,}(:\d+)?([/?#]\S*)?$/i;
const phoneValidator = /^\+?[\d\s().-]+$/;
const LETTERS = 'a-zA-ZÀ-ÖØ-öø-ÿĀ-žñÑ';
const alphaValidator = new RegExp(`^[${LETTERS}\\s]+$`);
const alphanumericValidator = new RegExp(`^[${LETTERS}0-9\\s]+$`);

const toNumber = (v: any) => (typeof v === 'number' ? v : Number(String(v).trim().replace(',', '.')));
const formatBytes = (b: number) => b >= 1048576 ? `${+(b / 1048576).toFixed(1)} MB` : b >= 1024 ? `${Math.round(b / 1024)} KB` : `${b} B`;

// Archivo(s) del valor: nombre, tipo MIME y tamaño, vengan como texto (nombre / URI) o como objeto del selector
const filesOf = (value: any) => (Array.isArray(value) ? value : [value]).map((f: FormFile) => {
    const name = typeof f === 'string' ? f : (f?.name ?? f?.fileName ?? f?.uri ?? '');
    const mime = typeof f === 'string' ? '' : (f?.mimeType ?? (f?.type?.includes('/') ? f.type : '') ?? '');
    return {
        ext: (name.split(/[?#]/)[0].split('.').pop() || '').toLowerCase(),
        mime: (mime || '').toLowerCase(),
        size: typeof f === 'string' ? undefined : (f?.size ?? f?.fileSize),
    };
});
const typeAllowed = (file: { ext: string; mime: string }, types: string[]) => types.some(t => {
    const type = t.toLowerCase().replace(/^\./, '');
    if (!type.includes('/')) return file.ext === type;
    return type.endsWith('/*') ? file.mime.startsWith(type.slice(0, -1)) : file.mime === type;
});

const validateField = <T extends FormSchema>(form: FormGroupRef<T>['controls'], formControl: keyof T, rules?: InputValidation) => {
    const value = form[formControl].value
    // El mensaje propio de la regla (messages) o el de la librería, con sus parámetros
    const fail = (rule: keyof NonNullable<InputValidation['messages']>, params?: Record<string, string | number>) => {
        const custom = rules?.messages?.[rule];
        return custom ? custom.replace(/{{(\w+)}}/g, (_, k) => String(params?.[k] ?? '')) : libT(rule as any, params);
    };
    const isEmpty = value === null || value === undefined || value === '' || (Array.isArray(value) && !value.length)
    if (rules?.required && (isEmpty || value === false)) return fail("required");
    if (rules?.custom) {
        const error = rules.custom(form)
        if (error) return error
    }
    if (rules?.sameAs && value !== form[rules.sameAs]?.value) return fail("sameAs");
    if (isEmpty) return "";
    const text = typeof value === 'string' ? value : String(value);
    const num = toNumber(value);
    if (rules?.email && !emailValidator.test(text)) return fail("email");
    if (rules?.number && !/^[-+]?\d*([.,]?\d+)?$/.test(text)) return fail("number");
    if (rules?.integer && !/^[-+]?\d+$/.test(text.trim())) return fail("integer");
    if (rules?.positive && !(num > 0)) return fail("positive");
    if (rules?.min != null && !(num >= rules.min)) return fail("min", { min: rules.min });
    if (rules?.max != null && !(num <= rules.max)) return fail("max", { max: rules.max });
    if (rules?.minLength && (value.length ?? text.length) < rules.minLength) return fail("minLength", { min: rules.minLength });
    if (rules?.maxLength && (value.length ?? text.length) > rules.maxLength) return fail("maxLength", { max: rules.maxLength });
    if (rules?.phone) {
        const digits = text.replace(/\D/g, '').length;
        if (!phoneValidator.test(text) || digits < 7 || digits > 15) return fail("phone");
    }
    if (rules?.url && !urlValidator.test(text.trim())) return fail("url");
    if (rules?.alpha && !alphaValidator.test(text)) return fail("alpha");
    if (rules?.alphanumeric && !alphanumericValidator.test(text)) return fail("alphanumeric");
    if (rules?.minItems != null && Array.isArray(value) && value.length < rules.minItems) return fail("minItems", { min: rules.minItems });
    if (rules?.maxItems != null && Array.isArray(value) && value.length > rules.maxItems) return fail("maxItems", { max: rules.maxItems });
    if (rules?.fileTypes?.length && filesOf(value).some(f => !typeAllowed(f, rules.fileTypes!)))
        return fail("fileTypes", { types: rules.fileTypes.join(', ') });
    if (rules?.maxFileSize && filesOf(value).some(f => f.size != null && f.size > rules.maxFileSize!))
        return fail("maxFileSize", { size: formatBytes(rules.maxFileSize) });
    if (rules?.pattern && !rules.pattern.test(text)) return fail("pattern")
    return "";
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
export class FormGroupRef<T extends FormSchema> {
    controls: { [K in keyof T]: ControlType<T[K][0]> } = {} as any;
    value: FormValues<T> = {} as any;
    initValue: FormValues<T> = {} as any;
    #listeners: Record<keyof T | 'FORM_REF', Set<() => void>> = {} as any;
    #snapshots: Record<keyof T | 'FORM_REF', any> = {} as any;

    constructor(form: T) {
        Object.keys(form).map(x => {
            this.createControl(x, form[x])
        })
        this.#snapshots['FORM_REF'] = {};
    }

    // Una función por control, siempre la misma: useSyncExternalStore se resuscribe si cambia
    // (antes se creaba una nueva en cada render y cada control se resuscribía en cada render)
    #subscribers: Record<string, (callback: () => void) => () => void> = {};
    #getters: Record<string, () => any> = {};

    subscribe = (control: keyof T | 'FORM_REF') => this.#subscribers[control as string] ??= (callback: () => void) => {
        if (!this.#listeners[control]) this.#listeners[control] = new Set();
        this.#listeners[control].add(callback);
        return () => this.#listeners[control].delete(callback);
    }

    getSnapshot = (control: keyof T | 'FORM_REF') => this.#getters[control as string] ??= () => this.#snapshots[control];

    /* ---------------- Valores ---------------- */

    setInitValue(value: Partial<Record<keyof T, any>>, setControls: boolean = true) {
        Object.assign(this.initValue, value)
        if (setControls) this.setValue(value)
    }

    setValue(value: Partial<Record<keyof T, any>>, validate: boolean = false) {
        // Solo los campos que existen en el formulario (uno desconocido rompía la app)
        Object.keys(value).filter(k => k in this.controls).map((control: keyof T) => {
            this.value[control] = value[control]
            this.controls[control].value = value[control]
            if (validate) this.controls[control].validate(value[control])
            this.notify(control)
        })
        this.notify('FORM_REF')
    }

    setControlValue<K extends keyof T>(control: K, value: T[K][0], validate: boolean = true) {
        if (!this.hasControl(control)) return;
        this.value[control] = value
        this.controls[control].value = value
        if (validate) {
            this.controls[control].validate(value)
            // Campos con sameAs de este (p. ej. confirmar contraseña): si ya se habían tocado, se revalidan
            // (si no, al cambiar la contraseña el error de "no coinciden" se quedaba desactualizado)
            Object.keys(this.controls).forEach(k => {
                const other = this.controls[k];
                if (k !== control && other.validation?.sameAs === control && this.#touched(k)) {
                    other.validate(other.value);
                    this.notify(k);
                }
            });
        }
        this.notify(control)
        this.notify('FORM_REF')
    }

    /** Valor de un campo */
    getValue<K extends keyof T>(control: K): T[K][0] {
        return this.value[control];
    }

    /** Copia de todos los valores */
    getValues(): FormValues<T> {
        return { ...this.value };
    }

    /** ¿Ha cambiado respecto al valor inicial? Un campo, o cualquiera si no se indica */
    isDirty(control?: keyof T): boolean {
        const changed = (k: keyof T) => JSON.stringify(this.value[k]) !== JSON.stringify(this.initValue[k]);
        return control != null ? changed(control) : Object.keys(this.controls).some(changed);
    }

    /** Solo los campos que han cambiado (p. ej. para enviar un PATCH) */
    getDirtyValues(): Partial<FormValues<T>> {
        return Object.fromEntries(Object.keys(this.controls).filter(k => this.isDirty(k)).map(k => [k, this.value[k]])) as Partial<FormValues<T>>;
    }

    /* ---------------- Validación ---------------- */

    /** Valida todos los campos (salvo los deshabilitados) y muestra sus errores. true si todo es válido */
    validate(): boolean {
        let valid = true
        Object.keys(this.controls).map(x => {
            if (this.controls[x].disabled) return
            const err = this.controls[x].validate(this.value[x])
            this.notify(x)
            if (err) valid = false
        })
        this.notify('FORM_REF')
        return valid
    }

    /** ¿Hay algún campo inválido? Sin mostrar errores (p. ej. para deshabilitar el botón de enviar) */
    isInvalid() {
        return Object.keys(this.controls).some(x =>
            !this.controls[x].disabled && this.controls[x].validation && !!validateField(this.controls, x, this.controls[x].validation))
    }

    validateControl(control: keyof T, validation?: InputValidation) {
        const rules = validation ?? this.controls[control]?.validation
        if (rules) this.controls[control].error = validateField(this.controls, control, rules)
        this.notify(control)
    }

    /** Valida y, si todo es válido, llama a onValid con los valores; si no, a onInvalid con los errores */
    submit(onValid: (values: FormValues<T>) => any, onInvalid?: (errors: Errors<T>) => any) {
        return this.validate() ? onValid(this.getValues()) : onInvalid?.(this.getErrors());
    }

    /** Cambia las reglas de un campo (las reemplaza) y lo revalida si ya se había tocado */
    setValidation(control: keyof T, validation?: InputValidation) {
        if (!this.hasControl(control)) return;
        this.controls[control].validation = validation
        if (!validation) this.controls[control].error = ''
        else if (this.#touched(control)) this.controls[control].validate(this.value[control])
        this.notify(control)
        this.notify('FORM_REF')
    }

    /** Añade reglas a las que ya tiene (p. ej. hacerlo obligatorio según otro campo) */
    addValidation(control: keyof T, validation: InputValidation) {
        if (!this.hasControl(control)) return;
        this.setValidation(control, { ...this.controls[control].validation, ...validation })
    }

    /** Quita reglas concretas (['required', 'min']) o todas si no se indican */
    removeValidation(control: keyof T, rules?: (keyof InputValidation)[]) {
        if (!this.hasControl(control)) return;
        if (!rules) return this.setValidation(control, undefined)
        const next = { ...this.controls[control].validation }
        rules.forEach(r => delete next[r])
        this.setValidation(control, Object.keys(next).length ? next : undefined)
    }

    /* ---------------- Errores ---------------- */

    /** Pone un error a mano (p. ej. uno del servidor: "ese email ya existe") */
    setError(control: keyof T, error: string) {
        if (!this.hasControl(control)) return;
        this.controls[control].error = error
        this.notify(control)
        this.notify('FORM_REF')
    }

    /** Varios errores a la vez: { email: 'Ya existe', usuario: 'No disponible' } */
    setErrors(errors: Errors<T>) {
        Object.entries(errors).forEach(([k, e]) => this.hasControl(k) && (this.controls[k].error = e as string, this.notify(k)))
        this.notify('FORM_REF')
    }

    /** Quita los errores de unos campos, o de todos */
    clearErrors(controls?: (keyof T)[]) {
        (controls ?? Object.keys(this.controls)).forEach(k => {
            if (!this.hasControl(k)) return
            this.controls[k].error = ''
            this.notify(k)
        })
        this.notify('FORM_REF')
    }

    /** Errores visibles ahora: { campo: mensaje } (solo los que tienen) */
    getErrors(): Errors<T> {
        return Object.fromEntries(Object.keys(this.controls).filter(k => this.controls[k].error).map(k => [k, this.controls[k].error])) as Errors<T>;
    }

    /* ---------------- Habilitar / deshabilitar ---------------- */

    /** Deshabilita un campo: no se puede editar y validate() / isInvalid() lo ignoran (su valor se mantiene) */
    disable(control: keyof T) {
        this.#setDisabled(control, true)
    }

    enable(control: keyof T) {
        this.#setDisabled(control, false)
    }

    isDisabled(control: keyof T): boolean {
        return !!this.controls[control]?.disabled
    }

    #setDisabled(control: keyof T, disabled: boolean) {
        if (!this.hasControl(control)) return;
        this.controls[control].disabled = disabled
        if (disabled) this.controls[control].error = ''
        this.notify(control)
        this.notify('FORM_REF')
    }

    /* ---------------- Campos dinámicos ---------------- */

    hasControl(control: PropertyKey): control is keyof T {
        return control in this.controls
    }

    // Campos quitados con removeControl: para restaurarlos con addControl(nombre) sin definición
    #removed: Record<string, { value: any; initValue: any; validation?: InputValidation }> = {};

    /**
     * Añade un campo (p. ej. "añadir otro teléfono"). Si ya existe, no hace nada.
     * Sin definición, restaura uno quitado con removeControl (con sus reglas, su valor y su valor inicial)
     */
    addControl(control: string, definition?: [any, InputValidation?]) {
        if (this.hasControl(control)) return;
        const removed = this.#removed[control]
        if (!definition && !removed) return;
        this.createControl(control as keyof T, definition ?? [removed.value, removed.validation])
        if (!definition && removed) this.initValue[control as keyof T] = removed.initValue
        delete this.#removed[control]
        this.notify(control as keyof T)
        this.notify('FORM_REF')
    }

    /**
     * Quita un campo del formulario (su valor, su valor inicial y sus errores): deja de validarse y de salir
     * en getValues. Su input sigue en pantalla con lo escrito; addControl(nombre) lo vuelve a conectar
     */
    removeControl(control: keyof T) {
        if (!this.hasControl(control)) return;
        this.#removed[control as string] = { value: this.value[control], initValue: this.initValue[control], validation: this.controls[control].validation }
        delete this.controls[control]
        delete this.value[control]
        delete this.initValue[control]
        this.#snapshots[control] = undefined
        this.#listeners[control]?.forEach(cb => cb())
        this.notify('FORM_REF')
    }

    /* ---------------- Reiniciar ---------------- */

    /** Vuelve a los valores iniciales (o a estos valores, si se pasan) y quita los errores */
    reset(values?: Partial<Record<keyof T, any>>): void {
        Object.keys(this.controls).map(x => {
            const v = values && x in values ? values[x] : this.initValue[x]
            this.value[x as keyof T] = v
            this.controls[x].value = v
            this.controls[x].error = ''
            this.notify(x)
        })
        this.notify('FORM_REF')
    }

    /** Vuelve un campo a su valor inicial y le quita el error */
    resetControl(control: keyof T) {
        if (!this.hasControl(control)) return;
        this.value[control] = this.initValue[control]
        this.controls[control].value = this.initValue[control]
        this.controls[control].error = ''
        this.notify(control)
        this.notify('FORM_REF')
    }

    /* ---------------- Escuchar cambios (fuera de React) ---------------- */

    /**
     * Llama a `listener` con los valores cada vez que cambia un VALOR del formulario (o de ese campo); no
     * con cambios de errores o de disable. Devuelve la función para dejar de escuchar.
     * @example const stop = form.watch(values => guardarBorrador(values)); ... stop();
     */
    watch(listener: (values: FormValues<T>) => void, control?: keyof T): () => void {
        const read = () => JSON.stringify(control != null ? this.value[control] : this.value)
        let last = read()
        return this.subscribe(control ?? 'FORM_REF')(() => {
            const now = read()
            if (now === last) return
            last = now
            listener(this.getValues())
        })
    }

    /**
     * Pinta algo que depende del formulario y se actualiza solo, directamente en el JSX.
     * Con `control`, solo se redibuja cuando cambia ese campo; sin él, con cualquier cambio.
     * Si devuelve texto o un número se envuelve en un <Text> (vale dentro de cualquier Box).
     * @example <Box>{form.listener(v => v.nombre, 'nombre')}</Box>
     * @example {form.listener(v => `Total: ${v.precio * v.cantidad} €`)}
     * @example {form.listener(v => v.acepto ? <Button>Enviar</Button> : null, 'acepto')}
     */
    listener(render: (values: FormValues<T>, form: this) => React.ReactNode, control?: keyof T): React.ReactElement {
        return React.createElement(FormListener, { form: this, render, control })
    }

    /**
     * Hook: el valor plano (texto, número, lo que devuelva `select`) para usarlo donde quieras (props,
     * concatenar, condiciones). Re-renderiza el componente cuando cambia ese campo (o cualquiera, sin `control`).
     * Va en el cuerpo de un componente, como cualquier hook.
     * @example const nombre = form.useListener(v => v.nombre, 'nombre'); <Input placeholder={`Hola ${nombre}`} />
     */
    useListener<R>(select: (values: FormValues<T>, form: this) => R, control?: keyof T): R {
        useSyncExternalStore(this.subscribe(control ?? 'FORM_REF'), this.getSnapshot(control ?? 'FORM_REF'));
        return select(this.getValues(), this);
    }

    /* ---------------- Interno ---------------- */

    createControl<K extends keyof T>(control: K, props: [any, InputValidation?]) {
        this.value[control] = props[0]
        this.controls[control] = {
            value: props[0],
            error: this.controls[control]?.error ?? '',
            disabled: false,
            setValue: (value: any) => this.setControlValue(control, value),
            // Usa las reglas ACTUALES del control (setValidation / addValidation las pueden cambiar)
            validate: () => {
                const rules = this.controls[control]?.validation
                const error = rules ? validateField(this.controls, control, rules) : ''
                if (this.controls[control]) this.controls[control].error = error
                return error
            },
            reset: () => this.resetControl(control),
            validation: props[1]
        }
        this.initValue[control] = props[0]
        this.#snapshots[control] = { ...this.controls[control] }
    }

    // ¿El usuario ya lo tocó? (tiene error o algún valor): para revalidar sin mostrar errores en campos vírgenes
    #touched(control: keyof T) {
        const c = this.controls[control]
        return !!c && (!!c.error || (c.value != null && c.value !== '' && !(Array.isArray(c.value) && !c.value.length)))
    }

    private notify(control: keyof T | 'FORM_REF') {
        if (control === 'FORM_REF') {
            // Nueva referencia para que useSyncExternalStore detecte el cambio
            this.#snapshots['FORM_REF'] = {}
        } else if (this.controls[control]) {
            this.#snapshots[control] = { ...this.controls[control] }
        }
        this.#listeners[control]?.forEach((cb) => cb())
    }
}

// Lo que pinta form.listener: se suscribe al campo (o al formulario) y vuelve a pintar al cambiar
const FormListener = ({ form, render, control }: { form: FormGroupRef<any>; render: (values: any, form: any) => React.ReactNode; control?: PropertyKey }) => {
    useSyncExternalStore(form.subscribe(control ?? 'FORM_REF'), form.getSnapshot(control ?? 'FORM_REF'));
    const insideText = useContext(InsideTextContext);
    const result = render(form.getValues(), form);
    // Texto o número: dentro de un <Text> se pinta tal cual (hereda su estilo); fuera, React Native exige
    // un <Text> para cualquier texto, así que se envuelve en uno
    if (typeof result === 'string' || typeof result === 'number') return insideText ? result : <Text>{result}</Text>;
    return result;
};

/**
 * Hook: un campo del formulario (value, error, setValue…). El componente solo se vuelve a pintar cuando cambia ese campo
 * @example const email = useFormControl(form, 'email');
 * <Text>{email.error ?? email.value}</Text>
 */
export const useFormControl = <
    T extends FormSchema,
    K extends keyof T
>(
    formGroup: FormGroupRef<T>,
    formControl: K
): ControlType<T[K][0]> => {
    return useSyncExternalStore(
        formGroup.subscribe(formControl),
        formGroup.getSnapshot(formControl)
    );
}

/**
 * Hook: el formulario entero. El componente se vuelve a pintar con cualquier cambio (para isInvalid(), contadores…)
 * @example const f = useFormGroup(form);
 * <Button disabled={f.isInvalid()}>Enviar</Button>
 */
export const useFormGroup = <T extends FormSchema>(
    formGroup: FormGroupRef<T>
): FormGroupRef<T> => {
    useSyncExternalStore(
        formGroup.subscribe('FORM_REF'),
        formGroup.getSnapshot('FORM_REF')
    );
    return formGroup;
}

export function ListenerForm<T extends FormSchema, K extends keyof T>(
    props: {
        formGroup: FormGroupRef<T>;
        formControl: K;
        children: (value: ControlType<T[K][0]>) => React.ReactNode;
    }
): React.ReactNode;

export function ListenerForm<T extends FormSchema>(
    props: {
        formGroup: FormGroupRef<T>;
        formControl?: undefined;
        children: (value: FormGroupRef<T>) => React.ReactNode;
    }
): React.ReactNode;

export function ListenerForm({ formGroup, formControl, children }) {
    const value = formControl
        ? useFormControl(formGroup, formControl)
        : useFormGroup(formGroup);

    return children(value);
}

export const Control = <T extends FormSchema>({
    formGroup,
    formControl,
    _box: boxProp,
    _error: errorProp,
    isSelect,
    isCheckBox,
    isRadio,
    isSwitch,
    isDate,
    isSearch,
    isSlider,
    ...props
}: InputFormParams<T> & { Item?: React.FC<EAFormItemProps> }) => {
    const formControlState = useFormControl(formGroup, formControl);
    // Campo quitado con removeControl: el input se queda en pantalla con su valor (en un estado local) pero
    // fuera del formulario (sin validar, ni en getValues). Con addControl se vuelve a conectar al mismo input
    const lastValue = useRef(formControlState?.value);
    if (formControlState) lastValue.current = formControlState.value;
    const [detachedValue, setDetachedValue] = useState<any>(undefined);
    // Al volver (addControl), lo escrito mientras estaba fuera pasa al formulario
    useEffect(() => {
        if (formControlState && detachedValue !== undefined) {
            formGroup.setControlValue(formControl, detachedValue, false);
            setDetachedValue(undefined);
        }
    }, [!!formControlState]);
    const control = formControlState ?? {
        value: detachedValue !== undefined ? detachedValue : lastValue.current,
        error: '',
        disabled: false,
        setValue: setDetachedValue,
    } as unknown as typeof formControlState;
    // theme.components.EAForm: solo sus props propias (_box y _error); el resto lo tematiza cada control
    const [{ _box, _error }] = useThemeProps<Pick<InputFormParams<T>, '_box' | '_error'>>('EAForm', { _box: boxProp, _error: errorProp });
    // Cada control recibe un subconjunto distinto de estas props
    const rest = props as any;
    const errorBorder = control.error ? { borderColor: 'danger.100' } : {};
    // form.disable('campo') (o disabled en las props): no se puede editar
    const disabled = !!control.disabled || !!rest.disabled;
    const disabledStyle = disabled ? { opacity: 0.5 } : {};

    const onChange = (value: any) => {
        control.setValue(value);
        props.onChange?.(value);
    };

    const onDateChange = (e: any) => {
        const value = !e ? null : 'start' in e ? { start: e.start?.iso ?? null, end: e.end?.iso ?? null } : e.iso;
        control.setValue(value);
        props.onChange?.(e);
    };

    return (
        <Box {..._box}>
            {isSelect ?
                <Select
                    defaultValue={control.value}
                    borderColor={control.error ? 'danger.100' : 'light.100'}
                    {...rest}
                    disabled={disabled}
                    onChange={onChange}
                />
                : isCheckBox ?
                    <CheckBox checked={!!control.value} {...rest} disabled={disabled} onChange={onChange} />
                    : isSwitch ?
                        <Switch
                            value={!!control.value}
                            {...rest}
                            disabled={disabled}
                            onValueChange={e => {
                                onChange(e);
                                props.onValueChange?.(e);
                            }}
                        />
                        : isRadio ?
                            // El label del grupo va arriba (cada opción tiene el suyo y antes lo pisaba)
                            <Box gap={6} accessibilityRole="radiogroup">
                                {props.label != null && <Label isRequired={props.isRequired} {...props._label}>{props.label}</Label>}
                                {React.Children.toArray(props.children).filter(React.isValidElement).map((x: React.ReactElement<any>) => {
                                    const { label: _groupLabel, _label: _gl, isRequired: _req, children: _ch, ...radioProps } = rest;
                                    return <Radio key={x.props.value} checked={control.value == x.props.value} {...radioProps} {...x.props} disabled={disabled || x.props.disabled} onChange={onChange} />;
                                })}
                            </Box>
                            : isDate ?
                                <DatePicker
                                    value={control.value}
                                    borderColor={control.error ? 'danger.100' : 'light.100'}
                                    {...rest}
                                    disabled={disabled}
                                    onChange={onDateChange}
                                />
                                : isSlider ?
                                    <Slider
                                        value={control.value ?? undefined}
                                        {...rest}
                                        disabled={disabled}
                                        // El formulario se actualiza al soltar (no en cada paso del arrastre)
                                        onChange={props.onChange}
                                        onChangeEnd={(v: any) => control.setValue(v)}
                                    />
                                : isSearch ?
                                    <SearchInput
                                        value={control.value}
                                        {...rest}
                                        onChange={onChange}
                                        _input={{ label: props.label, isFloat: props.isFloat, editable: !disabled, _containerStyle: { ...errorBorder, ...disabledStyle }, ...props._input }}
                                    />
                                    :
                                    <Input
                                        value={control.value}
                                        {...rest}
                                        editable={!disabled && rest.editable !== false}
                                        _containerStyle={{ ...props._containerStyle, ...errorBorder, ...disabledStyle }}
                                        onChangeText={e => {
                                            control.setValue(e);
                                            props.onChangeText?.(e);
                                        }}
                                    />
            }
            {control.error ? <Text color={'danger.100'} {..._error}>{control.error}</Text> : null}
        </Box>
    );
};

Control.Item = ControlItem
