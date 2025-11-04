import { useState, useEffect } from "react";
import { Box, InputText, Select, Text, CheckBox, Radio, Switch } from ".";
import { DatePicker } from "./DatePicker";
import { SearchInput } from "./SearchInput";
;
const ControlItem = () => null;
const emailValidator = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const validateField = (form, formControl, rules) => {
    if (rules?.required && !form[formControl].value)
        return "Campo requerido";
    else if (rules?.email && !emailValidator.test(form[formControl].value)) {
        return "Correo inválido";
    }
    else if (rules?.number && !/^[-+]?\d*([.,]?\d+)?$/.test(form[formControl].value))
        return "Debe ser un valor numérico";
    else if (rules?.minLength && form[formControl].value.length < rules?.minLength)
        return `El mínimo es de ${rules.minLength} valores`;
    else if (rules?.['custon']) {
        return rules.custom(form);
    }
    else if (rules?.pattern && !rules.pattern.test(form[formControl].value)) {
        return 'El valor no coincide con el formato esperado.';
    }
    return "";
};
export class FormGroupRef {
    controls = {};
    value = {};
    initValue = {};
    #listeners = {};
    constructor(form) {
        Object.keys(form).map(x => {
            this.createControl(x, form[x]);
        });
    }
    subscribe(control, callback) {
        if (!this.#listeners[control])
            this.#listeners[control] = new Set();
        this.#listeners[control].add(callback);
        callback(control == 'FORM_REF' ? this : this.controls[control]);
        return () => {
            this.#listeners[control].delete(callback);
        };
    }
    setValue(value, validate = false) {
        Object.assign(this.value, value);
        Object.keys(value).map((control) => {
            this.value[control] = value[control];
            this.controls[control].value = value[control];
            if (validate)
                this.controls[control].validate(value[control]);
            this.notify(control);
        });
        this.notify('FORM_REF');
    }
    validate() {
        let valid = true;
        Object.keys(this.controls).map(x => {
            const err = this.controls[x].validate(this.value[x]);
            this.notify(x);
            if (err)
                valid = false;
        });
        this.notify('FORM_REF');
        return valid;
    }
    isInvalid() {
        let error = false;
        Object.keys(this.controls).map(x => {
            if (this.controls[x].validation) {
                const err = validateField(this.controls, x, this.controls[x].validation);
                if (err)
                    error = true;
            }
        });
        return error;
    }
    reset() {
        this.value = { ...this.initValue };
        Object.keys(this.value).map(x => {
            this.controls[x].value = this.initValue[x];
            this.controls[x].error = '';
            this.notify(x);
        });
        this.notify('FORM_REF');
    }
    setControlValue(control, value, validate = true) {
        this.value[control] = value;
        this.controls[control].value = value;
        if (validate)
            this.controls[control].validate(value);
        this.notify(control);
        this.notify('FORM_REF');
    }
    validateControl(control, validation) {
        if (validation) {
            const error = validateField(this.controls, control, validation);
            this.controls[control].error = error;
        }
        this.notify(control);
    }
    createControl(control, props) {
        this.value[control] = props[0];
        this.controls[control] = {
            value: props[0],
            error: this.controls[control]?.error,
            setValue: (value) => this.setControlValue(control, value),
            validate: (value) => {
                if (props[1]) {
                    const error = validateField(this.controls, control, props[1]);
                    this.controls[control].error = error;
                    return error;
                }
            },
            validation: props[1]
        };
        this.initValue[control] = props[0];
    }
    notify(control) {
        this.#listeners[control]?.forEach((cb) => cb(control == 'FORM_REF' ? this : this.controls[control]));
    }
}
export const Control = ({ formGroup, formControl, ...props }) => {
    const [control, setControl] = useState(formGroup.controls[formControl]);
    useEffect(() => {
        return formGroup.subscribe(formControl, e => {
            setControl({ ...e });
        });
    }, []);
    return (<Box {...props._box}>
            {props.isSelect ?
            <Select defaultValue={control.value} onChange={e => control.setValue(e)} borderColor={control.error ? 'danger' : 'light'} {...props}/>
            : props.isCheckBox ?
                <CheckBox checked={control.value} onChange={e => control.setValue(e)} {...props}/>
                : props.isSwitch ?
                    <Switch value={control.value} onValueChange={e => control.setValue(e)} {...props}/>
                    : props.isRadio ?
                        props.children.map(x => <Radio key={x.props.value} checked={control.value == x.props.value} onChange={e => control.setValue(e)} {...props} {...x.props}/>)
                        :
                            props.isDate ?
                                <DatePicker value={control.value} borderColor={control.error ? 'danger' : 'light'} onChange={props?.onChange} {...props}/>
                                :
                                    props.isSearch ?
                                        <SearchInput value={control.value} onChange={e => control.setValue(e)} {...props} _input={{ label: props.label, isFloat: props.isFloat, _containerStyle: control.error ? { borderColor: 'danger' } : {}, ...props._input }}/>
                                        :
                                            <InputText value={control.value} onChangeText={e => control.setValue(e)} _containerStyle={control.error ? { borderColor: 'danger' } : {}} {...props}/>}
            {control.error ? <Text color={'danger'}>{control.error}</Text> : null}
        </Box>);
};
export const FormListener = ({ formGroup, children, formControl = "FORM_REF", }) => {
    const [form, setForm] = useState(formGroup);
    useEffect(() => {
        return formGroup.subscribe(formControl, e => {
            setForm({ ...e });
        });
    }, []);
    return children(form);
};
Control.Item = ControlItem;
