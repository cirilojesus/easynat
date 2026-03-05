/// <reference types="react" />
import { BSBoxProps, BSTextInputProps, BSSelectProps, EACheckBoxProps, EASwitchProps } from ".";
import { DatePickerType } from "./DatePicker";
import { SearchInputModel } from "./SearchInput";
export interface InputValidation {
    required?: boolean;
    email?: boolean;
    number?: boolean;
    minLength?: number;
    custom?: (controls: FormGroupRef<any>['controls']) => any;
    pattern?: RegExp;
}
export type FormSchema = Record<string, [any, InputValidation?]>;
export type FormValues<T extends FormSchema> = {
    [K in keyof T]: T[K][0];
};
type ControlType = {
    value: any;
    error: string;
    setValue: (value: any) => void;
    validate: (value: any) => string;
    reset: () => void;
    validation: InputValidation;
};
interface CombinedProps extends Omit<Partial<BSSelectProps>, '_android' | '_ios' | '_web'>, Omit<Partial<BSTextInputProps>, '_android' | '_ios' | '_web'>, Omit<Partial<EASwitchProps>, '_android' | '_ios' | '_web'>, Omit<Partial<EACheckBoxProps>, '_android' | '_ios' | '_web'>, DatePickerType, Partial<SearchInputModel> {
    _android?: Omit<CombinedProps, '_android' | '_ios' | '_web'>;
    _ios?: Omit<CombinedProps, '_android' | '_ios' | '_web'>;
    _web?: Omit<CombinedProps, '_android' | '_ios' | '_web'>;
    onChange?: (e: any) => void;
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
export declare class FormGroupRef<T extends FormSchema> {
    #private;
    controls: Record<keyof T, ControlType>;
    value: FormValues<T>;
    initValue: T;
    constructor(form: T);
    subscribe: (control: keyof T | 'FORM_REF') => (callback: () => void) => () => boolean;
    getSnapshot: (control: keyof T | 'FORM_REF') => () => Record<keyof T | "FORM_REF", any>[keyof T | "FORM_REF"];
    setInitValue(value: Partial<Record<keyof T, any>>, setControls?: boolean): void;
    setValue(value: Partial<Record<keyof T, any>>, validate?: boolean): void;
    validate(): boolean;
    isInvalid(): boolean;
    reset(): void;
    setControlValue<K extends keyof T>(control: K, value: T[K][0], validate?: boolean): void;
    validateControl(control: keyof T, validation: InputValidation): void;
    createControl<K extends keyof T>(control: K, props: [any, InputValidation?]): void;
    private notify;
}
export declare const useFormControl: <T extends FormSchema>(formGroup: FormGroupRef<T>, formControl: keyof T) => ControlType;
export declare const useFormGroup: <T extends FormSchema>(formGroup: FormGroupRef<T>) => FormGroupRef<T>;
export declare const ListenerForm: <T extends FormSchema>({ formGroup, formControl, children, }: {
    formGroup: FormGroupRef<T>;
    formControl?: keyof T;
    children: (value: ControlType | FormGroupRef<T>) => React.ReactNode;
}) => import("react").ReactNode;
export declare const Control: {
    <T extends FormSchema>({ formGroup, formControl, ...props }: InputFormParams<T> & {
        Item?: React.FC<EAFormItemProps>;
    }): import("react").JSX.Element;
    Item: import("react").FC<EAFormItemProps>;
};
export {};
