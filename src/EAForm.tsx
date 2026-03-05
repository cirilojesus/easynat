

import { useSyncExternalStore } from "react";
import { Box, BSBoxProps, BSTextInputProps, Input, Select, Text, BSSelectProps, CheckBox, EACheckBoxProps, Radio, Switch, EASwitchProps } from ".";
import { DatePicker, DatePickerType } from "./DatePicker";
import { SearchInput, SearchInputModel } from "./SearchInput";

export interface InputValidation {
    required?: boolean;
    email?: boolean;
    number?: boolean;
    minLength?: number;
    custom?: (controls: FormGroupRef<any>['controls']) => any;
    pattern?: RegExp
}

export type FormSchema = Record<string, [any, InputValidation?]>;
export type FormValues<T extends FormSchema> = {
    [K in keyof T]: T[K][0]
}

type ControlType = {
    value: any,
    error: string,
    setValue: (value: any) => void,
    validate: (value: any) => string,
    reset: () => void,
    validation: InputValidation
}

interface CombinedProps extends Omit<Partial<BSSelectProps>, '_android' | '_ios' | '_web'>,
    Omit<Partial<BSTextInputProps>, '_android' | '_ios' | '_web'>,
    Omit<Partial<EASwitchProps>, '_android' | '_ios' | '_web'>,
    Omit<Partial<EACheckBoxProps>, '_android' | '_ios' | '_web'>,
    DatePickerType,
    Partial<SearchInputModel> {
    _android?: Omit<CombinedProps, '_android' | '_ios' | '_web'>;
    _ios?: Omit<CombinedProps, '_android' | '_ios' | '_web'>;
    _web?: Omit<CombinedProps, '_android' | '_ios' | '_web'>;
    onChange?: (e: any) => void
}

export interface InputFormParams<T extends FormSchema> extends CombinedProps {
    formControl: keyof T;
    formGroup: FormGroupRef<T>;
    _box?: BSBoxProps;
    isSelect?: boolean;
    isCheckBox?: boolean;
    isRadio?: boolean;
    isSwitch?: boolean;
    isDate?: boolean;
    isSearch?: boolean;
}

export type EAFormItemProps = Omit<CombinedProps, 'label' | 'value'> & {
    label: string | number;
    value: string | number;
};

const ControlItem: React.FC<EAFormItemProps> = () => null;

const emailValidator =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const validateField = <T extends FormSchema>(form: FormGroupRef<T>['controls'], formControl: keyof T, rules?: InputValidation) => {
    if (rules?.required && !form[formControl].value) return "Campo requerido";
    else if (rules?.email && !emailValidator.test(form[formControl].value)) {
        return "Correo inválido";
    } else if (rules?.number && !/^[-+]?\d*([.,]?\d+)?$/.test(form[formControl].value))
        return "Debe ser un valor numérico";
    else if (rules?.minLength && form[formControl].value.length < rules?.minLength)
        return `El mínimo es de ${rules.minLength} valores`;
    else if (rules?.['custon']) {
        return rules.custom(form)
    } else if (rules?.pattern && !rules.pattern.test(form[formControl].value)) {
        return 'El valor no coincide con el formato esperado.'
    }
    return "";
};

export class FormGroupRef<T extends FormSchema> {
    controls: Record<keyof T, ControlType> = {} as any;
    value: FormValues<T> = {} as any;
    initValue: T = {} as any;
    #listeners: Record<keyof T | 'FORM_REF', Set<() => void>> = {} as any;
    #snapshots: Record<keyof T | 'FORM_REF', any> = {} as any;

    constructor(form: T) {
        Object.keys(form).map(x => {
            this.createControl(x, form[x])
        })
        this.#snapshots['FORM_REF'] = this;
    }

    subscribe = (control: keyof T | 'FORM_REF') => (callback: () => void) => {
        if (!this.#listeners[control]) this.#listeners[control] = new Set();
        this.#listeners[control].add(callback);
        return () => this.#listeners[control].delete(callback);
    }

    getSnapshot = (control: keyof T | 'FORM_REF') => () => {
        return this.#snapshots[control];
    }

    setInitValue(value: Partial<Record<keyof T, any>>, setControls: boolean = true) {
        Object.assign(this.initValue, value)
        if (setControls) this.setValue(value)
    }

    setValue(value: Partial<Record<keyof T, any>>, validate: boolean = false) {
        Object.assign(this.value, value)
        Object.keys(value).map((control: keyof T) => {
            this.value[control] = value[control]
            this.controls[control].value = value[control]
            if (validate) this.controls[control].validate(value[control])
            this.notify(control)
        })
        this.notify('FORM_REF')
    }

    validate(): boolean {
        let valid = true
        Object.keys(this.controls).map(x => {
            const err = this.controls[x].validate(this.value[x])
            this.notify(x)
            if (err) valid = false
        })
        this.notify('FORM_REF')
        return valid
    }

    isInvalid() {
        let error = false
        Object.keys(this.controls).map(x => {
            if (this.controls[x].validation) {
                const err = validateField(this.controls, x, this.controls[x].validation)
                if (err) error = true
            }
        })
        return error
    }

    reset(): void {
        this.value = { ...this.initValue }
        Object.keys(this.value).map(x => {
            this.controls[x].value = this.initValue[x]
            this.controls[x].error = ''
            this.notify(x)
        })
        this.notify('FORM_REF')
    }

    setControlValue<K extends keyof T>(control: K, value: T[K][0], validate: boolean = true) {
        this.value[control] = value
        this.controls[control].value = value
        if (validate) this.controls[control].validate(value)
        this.notify(control)
        this.notify('FORM_REF')
    }

    validateControl(control: keyof T, validation: InputValidation) {
        if (validation) {
            const error = validateField(this.controls, control, validation)
            this.controls[control].error = error
        }
        this.notify(control)
    }

    createControl<K extends keyof T>(control: K, props: [any, InputValidation?]) {
        this.value[control] = props[0]
        this.controls[control] = {
            value: props[0],
            error: this.controls[control]?.error,
            setValue: (value: any) => this.setControlValue(control, value),
            validate: (value: any) => {
                if (props[1]) {
                    const error = validateField(this.controls, control, props[1])
                    this.controls[control].error = error
                    return error
                }
            },
            reset: () => {
                this.controls[control].value = this.initValue[control]
                this.controls[control].error = ''
                this.notify(control)
            },
            validation: props[1]
        }
        this.initValue[control] = props[0]
        this.#snapshots[control] = { ...this.controls[control] }
    }

    private notify(control: keyof T | 'FORM_REF') {
        if (control === 'FORM_REF') {
            this.#snapshots['FORM_REF'] = { ...this }
        } else {
            this.#snapshots[control] = { ...this.controls[control] }
        }
        this.#listeners[control]?.forEach((cb) => cb())
    }
}

export const useFormControl = <T extends FormSchema>(
    formGroup: FormGroupRef<T>,
    formControl: keyof T
): ControlType => {
    return useSyncExternalStore(
        formGroup.subscribe(formControl),
        formGroup.getSnapshot(formControl)
    );
}

export const useFormGroup = <T extends FormSchema>(
    formGroup: FormGroupRef<T>
): FormGroupRef<T> => {
    return useSyncExternalStore(
        formGroup.subscribe('FORM_REF'),
        formGroup.getSnapshot('FORM_REF')
    );
}

export const ListenerForm = <T extends FormSchema>({
    formGroup,
    formControl,
    children,
}: {
    formGroup: FormGroupRef<T>;
    formControl?: keyof T;
    children: (value: ControlType | FormGroupRef<T>) => React.ReactNode;
}) => {
    const value = formControl
        ? useFormControl(formGroup, formControl)
        : useFormGroup(formGroup);
    return children(value as any);
}

export const Control = <T extends FormSchema>({
    formGroup,
    formControl,
    ...props
}: InputFormParams<T> & { Item?: React.FC<EAFormItemProps> }) => {
    const control = useFormControl(formGroup, formControl);

    return (
        <Box {...props._box}>
            {props.isSelect ?
                <Select
                    defaultValue={control.value}
                    onChange={e => control.setValue(e)}
                    borderColor={control.error ? 'danger.100' : 'light.100'}
                    {...props}
                />
                : props.isCheckBox ?
                    <CheckBox checked={control.value} onChange={e => control.setValue(e)} {...props} />
                    : props.isSwitch ?
                        <Switch value={control.value} onValueChange={e => control.setValue(e)} {...props} />
                        : props.isRadio ?
                            props.children.map(x => <Radio key={x.props.value} checked={control.value == x.props.value} onChange={e => control.setValue(e)} {...props} {...x.props} />)
                            :
                            props.isDate ?
                                <DatePicker value={control.value} borderColor={control.error ? 'danger.100' : 'light.100'} onChange={e => control.setValue(e.iso)} {...props} />
                                :
                                props.isSearch ?
                                    <SearchInput
                                        value={control.value}
                                        onChange={e => control.setValue(e)}
                                        {...props}
                                        _input={{ label: props.label, isFloat: props.isFloat, _containerStyle: control.error ? { borderColor: 'danger.100' } : {}, ...props._input }}
                                    />
                                    :
                                    <Input
                                        value={control.value}
                                        onChangeText={e => control.setValue(e)}
                                        _containerStyle={control.error ? { borderColor: 'danger.100' } : {}}
                                        {...props}
                                    />
            }
            {control.error ? <Text color={'danger.100'}>{control.error}</Text> : null}
        </Box>
    );
};

Control.Item = ControlItem
