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
type ControlType = {
    value: any;
    error: string;
    setValue: (value: any) => any;
    validate: (value: any) => any;
    validation: InputValidation;
};
type CombinedProps = Omit<Partial<BSSelectProps>, '_android' | '_ios' | '_web'> & Omit<Partial<BSTextInputProps>, '_android' | '_ios' | '_web'> & Omit<Partial<EASwitchProps>, '_android' | '_ios' | '_web'> & Omit<Partial<EACheckBoxProps>, '_android' | '_ios' | '_web'> & {
    _android?: CombinedProps;
    _ios?: CombinedProps;
    _web?: CombinedProps;
} & DatePickerType & Partial<SearchInputModel>;
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
    value: Record<keyof T, any>;
    initValue: T;
    constructor(form: T);
    subscribe: (control: keyof T | 'FORM_REF') => (callback: () => void) => () => boolean;
    getSnapshot: (control: keyof T | 'FORM_REF') => () => Record<keyof T | "FORM_REF", any>[keyof T | "FORM_REF"];
    setValue(value: Partial<Record<keyof T, any>>, validate?: boolean): void;
    validate(): boolean;
    isInvalid(): boolean;
    reset(): void;
    setControlValue(control: keyof T, value: any, validate?: boolean): void;
    validateControl(control: keyof T, validation: InputValidation): void;
    createControl(control: keyof T, props: [any, InputValidation?]): void;
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
