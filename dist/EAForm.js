"use strict";
// import { useSyncExternalStore } from "react";
// import { Box, BSBoxProps, InputText, Select, Text, CheckBox, Radio, Switch } from ".";
// import { DatePicker } from "./DatePicker";
// import { SearchInput } from "./SearchInput";
// import { BSDefaultProps } from "./utils/DEFAULT_PROPS";
// import { COLOR_SCHEME } from "./theme";
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
var _FormGroupRef_listeners, _FormGroupRef_snapshots;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Control = exports.ListenerForm = exports.useFormGroup = exports.useFormControl = exports.FormGroupRef = void 0;
// export interface InputValidation {
//     required?: boolean;
//     email?: boolean;
//     number?: boolean;
//     minLength?: number;
//     custom?: (controls: FormGroupRef<any>['controls']) => any;
//     pattern?: RegExp
// }
// export type FormSchema = Record<string, [any, InputValidation?]>;
// type ControlType = {
//     value: any,
//     error: string,
//     setValue: (value: any) => any,
//     validate: (value: any) => any,
//     validation: InputValidation
// }
// interface CombinedProps extends BSDefaultProps {
//     // Pressable / Button
//     onPress?: (...args: any[]) => void;
//     onLongPress?: (...args: any[]) => void;
//     onPressIn?: (...args: any[]) => void;
//     onPressOut?: (...args: any[]) => void;
//     disabled?: boolean;
//     children?: any;
//     variant?: string;
//     _pressed?: any;
//     _text?: any;
//     // Input
//     label?: string;
//     _label?: any;
//     isPassword?: boolean;
//     isFloat?: boolean;
//     isRequired?: boolean;
//     placeholder?: string;
//     value?: any;
//     onChangeText?: (text: string) => void;
//     defaultValue?: string | number;
//     multiline?: boolean;
//     numberOfLines?: number;
//     keyboardType?: string;
//     returnKeyType?: string;
//     autoCapitalize?: string;
//     autoComplete?: string;
//     autoCorrect?: boolean;
//     autoFocus?: boolean;
//     secureTextEntry?: boolean;
//     maxLength?: number;
//     editable?: boolean;
//     selectTextOnFocus?: boolean;
//     onFocus?: (...args: any[]) => void;
//     onBlur?: (...args: any[]) => void;
//     onSubmitEditing?: (...args: any[]) => void;
//     iconLeft?: React.ReactElement;
//     iconRight?: React.ReactElement;
//     _containerStyle?: any;
//     _focus?: any;
//     _iconRight?: any;
//     color?: COLOR_SCHEME;
//     // Select
//     onChange?: (val: any) => void;
//     _menu?: any;
//     _option?: any;
//     _selected?: any;
//     _icon?: any;
//     icon?: boolean | React.ReactElement<any>;
//     // Button
//     colorScheme?: COLOR_SCHEME;
//     size?: number | string;
//     // Switch / CheckBox / Radio
//     checked?: boolean;
//     pointerBox?: boolean;
//     // DatePicker
//     type?: "calendar" | "date-range" | "month-year" | "month" | "year" | "time" | "weekday" | "datetime";
//     _months?: any;
//     _weekdays?: any;
//     _years?: any;
//     _days?: any;
//     _time?: any;
//     _buttonCancel?: any;
//     _buttonDone?: any;
//     unSelect?: boolean;
//     minValue?: any;
//     maxValue?: any;
//     config?: any;
//     locale?: string;
//     separate?: string;
//     // SearchInput
//     multiple?: boolean;
//     _item?: any;
//     _input?: any;
//     data?: any[];
//     renderItem?: any;
//     backdrop?: boolean | 'static';
//     placement?: "bottom" | "top";
//     menuDir?: "left" | "right";
//     useTriggerWidth?: boolean;
//     // Platform
//     _android?: CombinedProps;
//     _ios?: CombinedProps;
//     _web?: CombinedProps;
// }
// export interface InputFormParams<T extends FormSchema> extends CombinedProps {
//     formControl: keyof T;
//     formGroup: FormGroupRef<T>;
//     _box?: BSBoxProps;
//     isSelect?: boolean;
//     isCheckBox?: boolean;
//     isRadio?: boolean;
//     isSwitch?: boolean;
//     isDate?: boolean;
//     isSearch?: boolean;
// }
// export interface EAFormItemProps extends BSDefaultProps {
//     label: string | number;
//     value: string | number;
//     onPress?: (...args: any[]) => void;
//     onLongPress?: (...args: any[]) => void;
//     disabled?: boolean;
//     children?: React.ReactNode;
//     variant?: string;
//     colorScheme?: COLOR_SCHEME;
//     color?: COLOR_SCHEME;
//     _pressed?: any;
//     _text?: any;
//     _icon?: any;
//     _iconRight?: any;
//     icon?: React.ReactElement;
//     iconRight?: React.ReactElement;
//     size?: 'sm' | 'md' | 'lg' | 'xl';
//     _android?: EAFormItemProps;
//     _ios?: EAFormItemProps;
//     _web?: EAFormItemProps;
// }
// const ControlItem: React.FC<EAFormItemProps> = () => null;
// const emailValidator =
//     /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
// const validateField = <T extends FormSchema>(form: FormGroupRef<T>['controls'], formControl: keyof T, rules?: InputValidation) => {
//     if (rules?.required && !form[formControl].value) return "Campo requerido";
//     else if (rules?.email && !emailValidator.test(form[formControl].value)) {
//         return "Correo inválido";
//     } else if (rules?.number && !/^[-+]?\d*([.,]?\d+)?$/.test(form[formControl].value))
//         return "Debe ser un valor numérico";
//     else if (rules?.minLength && form[formControl].value.length < rules?.minLength)
//         return `El mínimo es de ${rules.minLength} valores`;
//     else if (rules?.['custon']) {
//         return rules.custom(form)
//     } else if (rules?.pattern && !rules.pattern.test(form[formControl].value)) {
//         return 'El valor no coincide con el formato esperado.'
//     }
//     return "";
// };
// export class FormGroupRef<T extends FormSchema> {
//     controls: Record<keyof T, ControlType> = {} as any;
//     value: Record<keyof T, any> = {} as any;
//     initValue: T = {} as any;
//     #listeners: Record<keyof T | 'FORM_REF', Set<() => void>> = {} as any;
//     #snapshots: Record<keyof T | 'FORM_REF', any> = {} as any;
//     constructor(form: T) {
//         Object.keys(form).map(x => {
//             this.createControl(x, form[x])
//         })
//         this.#snapshots['FORM_REF'] = this;
//     }
//     subscribe = (control: keyof T | 'FORM_REF') => (callback: () => void) => {
//         if (!this.#listeners[control]) this.#listeners[control] = new Set();
//         this.#listeners[control].add(callback);
//         return () => this.#listeners[control].delete(callback);
//     }
//     getSnapshot = (control: keyof T | 'FORM_REF') => () => {
//         return this.#snapshots[control];
//     }
//     setValue(value: Partial<Record<keyof T, any>>, validate: boolean = false) {
//         Object.assign(this.value, value)
//         Object.keys(value).map((control: keyof T) => {
//             this.value[control] = value[control]
//             this.controls[control].value = value[control]
//             if (validate) this.controls[control].validate(value[control])
//             this.notify(control)
//         })
//         this.notify('FORM_REF')
//     }
//     validate(): boolean {
//         let valid = true
//         Object.keys(this.controls).map(x => {
//             const err = this.controls[x].validate(this.value[x])
//             this.notify(x)
//             if (err) valid = false
//         })
//         this.notify('FORM_REF')
//         return valid
//     }
//     isInvalid() {
//         let error = false
//         Object.keys(this.controls).map(x => {
//             if (this.controls[x].validation) {
//                 const err = validateField(this.controls, x, this.controls[x].validation)
//                 if (err) error = true
//             }
//         })
//         return error
//     }
//     reset(): void {
//         this.value = { ...this.initValue }
//         Object.keys(this.value).map(x => {
//             this.controls[x].value = this.initValue[x]
//             this.controls[x].error = ''
//             this.notify(x)
//         })
//         this.notify('FORM_REF')
//     }
//     setControlValue(control: keyof T, value: any, validate: boolean = true) {
//         this.value[control] = value
//         this.controls[control].value = value
//         if (validate) this.controls[control].validate(value)
//         this.notify(control)
//         this.notify('FORM_REF')
//     }
//     validateControl(control: keyof T, validation: InputValidation) {
//         if (validation) {
//             const error = validateField(this.controls, control, validation)
//             this.controls[control].error = error
//         }
//         this.notify(control)
//     }
//     createControl(control: keyof T, props: [any, InputValidation?]) {
//         this.value[control] = props[0]
//         this.controls[control] = {
//             value: props[0],
//             error: this.controls[control]?.error,
//             setValue: (value: any) => this.setControlValue(control, value),
//             validate: (value: any) => {
//                 if (props[1]) {
//                     const error = validateField(this.controls, control, props[1])
//                     this.controls[control].error = error
//                     return error
//                 }
//             },
//             validation: props[1]
//         }
//         this.initValue[control] = props[0]
//         this.#snapshots[control] = { ...this.controls[control] }
//     }
//     private notify(control: keyof T | 'FORM_REF') {
//         if (control === 'FORM_REF') {
//             this.#snapshots['FORM_REF'] = { ...this }
//         } else {
//             this.#snapshots[control] = { ...this.controls[control] }
//         }
//         this.#listeners[control]?.forEach((cb) => cb())
//     }
// }
// export const useFormControl = <T extends FormSchema>(
//     formGroup: FormGroupRef<T>,
//     formControl: keyof T
// ): ControlType => {
//     return useSyncExternalStore(
//         formGroup.subscribe(formControl),
//         formGroup.getSnapshot(formControl)
//     );
// }
// export const useFormGroup = <T extends FormSchema>(
//     formGroup: FormGroupRef<T>
// ): FormGroupRef<T> => {
//     return useSyncExternalStore(
//         formGroup.subscribe('FORM_REF'),
//         formGroup.getSnapshot('FORM_REF')
//     );
// }
// export const ListenerForm = <T extends FormSchema>({
//     formGroup,
//     formControl,
//     children,
// }: {
//     formGroup: FormGroupRef<T>;
//     formControl?: keyof T;
//     children: (value: ControlType | FormGroupRef<T>) => React.ReactNode;
// }) => {
//     const value = formControl
//         ? useFormControl(formGroup, formControl)
//         : useFormGroup(formGroup);
//     return children(value as any);
// }
// export const Control = <T extends FormSchema>({
//     formGroup,
//     formControl,
//     ...props
// }: InputFormParams<T> & { Item?: React.FC<EAFormItemProps> }) => {
//     const control = useFormControl(formGroup, formControl);
//     return (
//         <Box {...props._box}>
//             {props.isSelect ?
//                 <Select
//                     defaultValue={control.value}
//                     onChange={e => control.setValue(e)}
//                     borderColor={control.error ? 'danger.100' : 'light.100'}
//                     {...props}
//                 />
//                 : props.isCheckBox ?
//                     <CheckBox checked={control.value} onChange={e => control.setValue(e)} {...props} />
//                     : props.isSwitch ?
//                         <Switch value={control.value} onValueChange={e => control.setValue(e)} {...props} />
//                         : props.isRadio ?
//                             props.children.map(x => <Radio key={x.props.value} checked={control.value == x.props.value} onChange={e => control.setValue(e)} {...props} {...x.props} />)
//                             :
//                             props.isDate ?
//                                 <DatePicker value={control.value} borderColor={control.error ? 'danger.100' : 'light.100'} onChange={props?.onChange} {...props} />
//                                 :
//                                 props.isSearch ?
//                                     <SearchInput
//                                         value={control.value}
//                                         onChange={e => control.setValue(e)}
//                                         {...props}
//                                         _input={{ label: props.label, isFloat: props.isFloat, _containerStyle: control.error ? { borderColor: 'danger.100' } : {}, ...props._input }}
//                                     />
//                                     :
//                                     <InputText
//                                         value={control.value}
//                                         onChangeText={e => control.setValue(e)}
//                                         _containerStyle={control.error ? { borderColor: 'danger.100' } : {}}
//                                         {...props}
//                                     />
//             }
//             {control.error ? <Text color={'danger.100'}>{control.error}</Text> : null}
//         </Box>
//     );
// };
// Control.Item = ControlItem
const react_1 = require("react");
const _1 = require(".");
const DatePicker_1 = require("./DatePicker");
const SearchInput_1 = require("./SearchInput");
const ControlItem = () => null;
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
        _FormGroupRef_snapshots.set(this, {});
        this.subscribe = (control) => (callback) => {
            if (!__classPrivateFieldGet(this, _FormGroupRef_listeners, "f")[control])
                __classPrivateFieldGet(this, _FormGroupRef_listeners, "f")[control] = new Set();
            __classPrivateFieldGet(this, _FormGroupRef_listeners, "f")[control].add(callback);
            return () => __classPrivateFieldGet(this, _FormGroupRef_listeners, "f")[control].delete(callback);
        };
        this.getSnapshot = (control) => () => {
            return __classPrivateFieldGet(this, _FormGroupRef_snapshots, "f")[control];
        };
        Object.keys(form).map(x => {
            this.createControl(x, form[x]);
        });
        __classPrivateFieldGet(this, _FormGroupRef_snapshots, "f")['FORM_REF'] = this;
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
        __classPrivateFieldGet(this, _FormGroupRef_snapshots, "f")[control] = Object.assign({}, this.controls[control]);
    }
    notify(control) {
        var _a;
        if (control === 'FORM_REF') {
            __classPrivateFieldGet(this, _FormGroupRef_snapshots, "f")['FORM_REF'] = Object.assign({}, this);
        }
        else {
            __classPrivateFieldGet(this, _FormGroupRef_snapshots, "f")[control] = Object.assign({}, this.controls[control]);
        }
        (_a = __classPrivateFieldGet(this, _FormGroupRef_listeners, "f")[control]) === null || _a === void 0 ? void 0 : _a.forEach((cb) => cb());
    }
}
exports.FormGroupRef = FormGroupRef;
_FormGroupRef_listeners = new WeakMap(), _FormGroupRef_snapshots = new WeakMap();
const useFormControl = (formGroup, formControl) => {
    return (0, react_1.useSyncExternalStore)(formGroup.subscribe(formControl), formGroup.getSnapshot(formControl));
};
exports.useFormControl = useFormControl;
const useFormGroup = (formGroup) => {
    return (0, react_1.useSyncExternalStore)(formGroup.subscribe('FORM_REF'), formGroup.getSnapshot('FORM_REF'));
};
exports.useFormGroup = useFormGroup;
const ListenerForm = ({ formGroup, formControl, children, }) => {
    const value = formControl
        ? (0, exports.useFormControl)(formGroup, formControl)
        : (0, exports.useFormGroup)(formGroup);
    return children(value);
};
exports.ListenerForm = ListenerForm;
const Control = (_a) => {
    var { formGroup, formControl } = _a, props = __rest(_a, ["formGroup", "formControl"]);
    const control = (0, exports.useFormControl)(formGroup, formControl);
    return (<_1.Box {...props._box}>
            {props.isSelect ?
            <_1.Select defaultValue={control.value} onChange={e => control.setValue(e)} borderColor={control.error ? 'danger.100' : 'light.100'} {...props}/>
            : props.isCheckBox ?
                <_1.CheckBox checked={control.value} onChange={e => control.setValue(e)} {...props}/>
                : props.isSwitch ?
                    <_1.Switch value={control.value} onValueChange={e => control.setValue(e)} {...props}/>
                    : props.isRadio ?
                        props.children.map(x => <_1.Radio key={x.props.value} checked={control.value == x.props.value} onChange={e => control.setValue(e)} {...props} {...x.props}/>)
                        :
                            props.isDate ?
                                <DatePicker_1.DatePicker value={control.value} borderColor={control.error ? 'danger.100' : 'light.100'} onChange={props === null || props === void 0 ? void 0 : props.onChange} {...props}/>
                                :
                                    props.isSearch ?
                                        <SearchInput_1.SearchInput value={control.value} onChange={e => control.setValue(e)} {...props} _input={Object.assign({ label: props.label, isFloat: props.isFloat, _containerStyle: control.error ? { borderColor: 'danger.100' } : {} }, props._input)}/>
                                        :
                                            <_1.InputText value={control.value} onChangeText={e => control.setValue(e)} _containerStyle={control.error ? { borderColor: 'danger.100' } : {}} {...props}/>}
            {control.error ? <_1.Text color={'danger.100'}>{control.error}</_1.Text> : null}
        </_1.Box>);
};
exports.Control = Control;
exports.Control.Item = ControlItem;
