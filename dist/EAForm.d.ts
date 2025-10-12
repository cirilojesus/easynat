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
    formControl?: keyof T | 'FORM_REF';
}
export type EAFormItemProps = Omit<CombinedProps, 'label' | 'value'> & {
    label: string | number;
    value: string | number;
};
export declare class FormGroupRef<T extends Record<string, [any, InputValidation?]>> {
    #private;
    controls: Record<keyof T, ControlType>;
    value: Record<keyof T, any>;
    initValue: T;
    constructor(form: T);
    subscribe(control: keyof T | 'FORM_REF', callback: (val: any) => void): () => void;
    setValue(value: Partial<Record<keyof T, any>>, validate?: boolean): void;
    validate(): boolean;
    isInvalid(): boolean;
    reset(): void;
    setControlValue(control: keyof T, value: any, validate?: boolean): void;
    validateControl(control: keyof T, validation: InputValidation): void;
    createControl(control: keyof T, props: [any, InputValidation?]): void;
    private notify;
}
export declare const Control: {
    <T extends Record<string, [any, InputValidation?]>>({ formGroup, formControl, ...props }: InputFormParams<T> & {
        Item?: React.FC<EAFormItemProps>;
    }): import("react").JSX.Element;
    Item: import("react").FC<EAFormItemProps>;
};
export declare const FormListener: <T extends Record<string, [any, InputValidation?]>>({ formGroup, children, formControl, }: FormListenerProps<T>) => import("react").ReactNode;
export {};
