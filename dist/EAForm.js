"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var _FormGroupRef_listeners;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormListener = exports.Control = exports.FormGroupRef = void 0;
const react_1 = require("react");
const _1 = require(".");
const DatePicker_1 = require("./DatePicker");
const SearchInput_1 = require("./SearchInput");
;
const ContorlItem = () => null;
const emailValidator = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const validateField = (form, formControl, rules) => {
    if ((rules === null || rules === void 0 ? void 0 : rules.required) && !form[formControl].value)
        return "Campo requerido";
    else if ((rules === null || rules === void 0 ? void 0 : rules.email) && !emailValidator.test(form[formControl].value)) {
        return "Correo inválido";
    }
    else if ((rules === null || rules === void 0 ? void 0 : rules.number) && !/^[-+]?\d*([.,]?\d+)?$/.test(form[formControl].value))
        return "Debe ser un valor numérico";
    else if ((rules === null || rules === void 0 ? void 0 : rules.minLength) && form[formControl].value.length < (rules === null || rules === void 0 ? void 0 : rules.minLength))
        return `El mínimo es de ${rules.minLength} valores`;
    else if (rules === null || rules === void 0 ? void 0 : rules['custon']) {
        return rules.custom(form);
    }
    else if ((rules === null || rules === void 0 ? void 0 : rules.pattern) && !rules.pattern.test(form[formControl].value)) {
        return 'El valor no coincide con el formato esperado.';
    }
    return "";
};
class FormGroupRef {
    constructor(form) {
        this.controls = {};
        this.value = {};
        this.initValue = {};
        _FormGroupRef_listeners.set(this, {});
        Object.keys(form).map(x => {
            this.createControl(x, form[x]);
        });
    }
    subscribe(control, callback) {
        if (!__classPrivateFieldGet(this, _FormGroupRef_listeners, "f")[control])
            __classPrivateFieldGet(this, _FormGroupRef_listeners, "f")[control] = new Set();
        __classPrivateFieldGet(this, _FormGroupRef_listeners, "f")[control].add(callback);
        callback(control == 'FORM_REF' ? this : this.controls[control]);
        return () => {
            __classPrivateFieldGet(this, _FormGroupRef_listeners, "f")[control].delete(callback);
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
        this.value = Object.assign({}, this.initValue);
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
        var _a;
        this.value[control] = props[0];
        this.controls[control] = {
            value: props[0],
            error: (_a = this.controls[control]) === null || _a === void 0 ? void 0 : _a.error,
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
        var _a;
        (_a = __classPrivateFieldGet(this, _FormGroupRef_listeners, "f")[control]) === null || _a === void 0 ? void 0 : _a.forEach((cb) => cb(control == 'FORM_REF' ? this : this.controls[control]));
    }
}
exports.FormGroupRef = FormGroupRef;
_FormGroupRef_listeners = new WeakMap();
const Control = (_a) => {
    var { formGroup, formControl } = _a, props = __rest(_a, ["formGroup", "formControl"]);
    const [control, setControl] = (0, react_1.useState)(formGroup.controls[formControl]);
    (0, react_1.useEffect)(() => {
        return formGroup.subscribe(formControl, e => {
            setControl(Object.assign({}, e));
        });
    }, []);
    return (<_1.Box {...props._box}>
            {props.isSelect ?
            <_1.Select defaultValue={control.value} onChange={e => control.setValue(e)} borderColor={control.error ? 'danger' : 'light'} {...props}/>
            : props.isCheckBox ?
                <_1.CheckBox checked={control.value} onChange={e => control.setValue(e)} {...props}/>
                : props.isSwitch ?
                    <_1.Switch value={control.value} onValueChange={e => control.setValue(e)} {...props}/>
                    : props.isRadio ?
                        props.children.map(x => <_1.Radio key={x.props.value} checked={control.value == x.props.value} onChange={e => control.setValue(e)} {...props} {...x.props}/>)
                        :
                            props.isDate ?
                                <DatePicker_1.DatePicker value={control.value} borderColor={control.error ? 'danger' : 'light'} onChange={props === null || props === void 0 ? void 0 : props.onChange} {...props}/>
                                :
                                    props.isSearch ?
                                        <SearchInput_1.SearchInput value={control.value} onChange={e => control.setValue(e)} {...props} _input={Object.assign({ label: props.label, isFloat: props.isFloat, _containerStyle: control.error ? { borderColor: 'danger' } : {} }, props._input)}/>
                                        :
                                            <_1.InputText value={control.value} onChangeText={e => control.setValue(e)} _containerStyle={control.error ? { borderColor: 'danger' } : {}} {...props}/>}
            {control.error ? <_1.Text color={'danger'}>{control.error}</_1.Text> : null}
        </_1.Box>);
};
exports.Control = Control;
const FormListener = ({ formGroup, children, formControl = "FORM_REF", }) => {
    const [form, setForm] = (0, react_1.useState)(formGroup);
    (0, react_1.useEffect)(() => {
        return formGroup.subscribe(formControl, e => {
            setForm(Object.assign({}, e));
        });
    }, []);
    return children(form);
};
exports.FormListener = FormListener;
exports.Control.Item = ContorlItem;
