import { useState, useEffect } from "react";
import { Box, BSBoxProps, BSTextInputProps, InputText, Select, Text, BSSelectProps, CheckBox, EACheckBoxProps, Radio, Switch, EASwitchProps } from ".";
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

type ControlType = {
    value: any,
    error: string,
    setValue: (value: any) => any,
    validate: (value: any) => any,
    validation: InputValidation
}
type CombinedProps = Omit<Partial<BSSelectProps>, '_android' | '_ios' | '_web'> &
    Omit<Partial<BSTextInputProps>, '_android' | '_ios' | '_web'> &
    Omit<Partial<EASwitchProps>, '_android' | '_ios' | '_web'> &
    Omit<Partial<EACheckBoxProps>, '_android' | '_ios' | '_web'> & {
        _android?: CombinedProps;
        _ios?: CombinedProps;
        _web?: CombinedProps;
    } & DatePickerType & Partial<SearchInputModel>

interface InputFormParams<T extends Record<string, [any, InputValidation?]>> extends CombinedProps {
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

interface FormListenerProps<T extends Record<string, [any, InputValidation?]>> {
    formGroup: FormGroupRef<T>;
    children: (value: FormGroupRef<T>) => React.ReactNode;
    formControl?: keyof T | 'FORM_REF'
};

export type EAFormItemProps = Omit<CombinedProps, 'label' | 'value'> & {
    label: string | number;
    value: string | number;
};

const ContorlItem: React.FC<EAFormItemProps> = () => null;

const emailValidator =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const validateField = <T extends Record<string, [any, InputValidation?]>>(form: FormGroupRef<T>['controls'], formControl: keyof T, rules?: InputValidation) => {
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

export class FormGroupRef<T extends Record<string, [any, InputValidation?]>> {
    controls: Record<keyof T, ControlType> = {} as any;
    value: Record<keyof T, any> = {} as any;
    initValue: T = {} as any;
    #listeners: Record<keyof T, Set<(val: any) => void>> = {} as any;

    constructor(form: T) {
        Object.keys(form).map(x => {
            this.createControl(x, form[x])
        })
    }

    subscribe(control: keyof T | 'FORM_REF', callback: (val: any) => void) {
        if (!this.#listeners[control]) this.#listeners[control] = new Set();
        this.#listeners[control].add(callback);
        callback(control == 'FORM_REF' ? this : this.controls[control]);
        return () => {
            this.#listeners[control].delete(callback)
        };
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

    setControlValue(control: keyof T, value: any, validate: boolean = true) {
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

    createControl(control: keyof T, props: [any, InputValidation?]) {
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
            validation: props[1]
        }
        this.initValue[control] = props[0]
    }

    private notify(control: keyof T) {
        this.#listeners[control]?.forEach((cb) => cb(control == 'FORM_REF' ? this : this.controls[control]))
    }
}

export const Control = <T extends Record<string, [any, InputValidation?]>>({
    formGroup,
    formControl,
    ...props
}: InputFormParams<T> & { Item?: React.FC<EAFormItemProps> }) => {
    const [control, setControl] = useState(formGroup.controls[formControl]);

    useEffect(() => {
        return formGroup.subscribe(formControl, e => {
            setControl({ ...e })
        })
    }, []);

    return (
        <Box {...props._box}>
            {props.isSelect ?
                <Select
                    defaultValue={control.value}
                    onChange={e => control.setValue(e)}
                    borderColor={control.error ? 'danger' : 'light'}
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
                                <DatePicker value={control.value} borderColor={control.error ? 'danger' : 'light'} onChange={props?.onChange} {...props} />
                                :
                                props.isSearch ?
                                    <SearchInput
                                        value={control.value}
                                        onChange={e => control.setValue(e)}
                                        {...props}
                                        _input={{ label: props.label, isFloat: props.isFloat, _containerStyle: control.error ? { borderColor: 'danger' } : {}, ...props._input }}
                                    />
                                    :
                                    <InputText
                                        value={control.value}
                                        onChangeText={e => control.setValue(e)}
                                        _containerStyle={control.error ? { borderColor: 'danger' } : {}}
                                        {...props}
                                    />
            }
            {control.error ? <Text color={'danger'}>{control.error}</Text> : null}
        </Box>
    );
};

export const FormListener = <T extends Record<string, [any, InputValidation?]>>({
    formGroup,
    children,
    formControl = "FORM_REF",
}: FormListenerProps<T>) => {
    const [form, setForm] = useState(formGroup);

    useEffect(() => {
        return formGroup.subscribe(formControl, e => {
            setForm({ ...e })
        })
    }, []);

    return children(form)
}

Control.Item = ContorlItem