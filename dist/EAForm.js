"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
var _FormGroupRef_instances, _FormGroupRef_listeners, _FormGroupRef_snapshots, _FormGroupRef_subscribers, _FormGroupRef_getters, _FormGroupRef_setDisabled, _FormGroupRef_removed, _FormGroupRef_touched;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Control = exports.useFormGroup = exports.useFormControl = exports.FormGroupRef = void 0;
exports.ListenerForm = ListenerForm;
const react_1 = __importStar(require("react"));
const Box_1 = require("./Box");
const Input_1 = require("./Input");
const Select_1 = require("./Select");
const Text_1 = require("./Text");
const CheckBox_1 = require("./CheckBox");
const Radio_1 = require("./Radio");
const Switch_1 = require("./Switch");
const DatePicker_1 = require("./DatePicker");
const SearchInput_1 = require("./SearchInput");
const Slider_1 = require("./Slider");
const translate_1 = require("./utils/translate");
const Label_1 = require("./Label");
const useThemeProps_1 = require("./utils/useThemeProps");
const ControlItem = () => null;
const emailValidator = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const urlValidator = /^(https?:\/\/)?([\w-]+\.)+[a-z]{2,}(:\d+)?([/?#]\S*)?$/i;
const phoneValidator = /^\+?[\d\s().-]+$/;
const LETTERS = 'a-zA-ZÀ-ÖØ-öø-ÿĀ-žñÑ';
const alphaValidator = new RegExp(`^[${LETTERS}\\s]+$`);
const alphanumericValidator = new RegExp(`^[${LETTERS}0-9\\s]+$`);
const toNumber = (v) => (typeof v === 'number' ? v : Number(String(v).trim().replace(',', '.')));
const formatBytes = (b) => b >= 1048576 ? `${+(b / 1048576).toFixed(1)} MB` : b >= 1024 ? `${Math.round(b / 1024)} KB` : `${b} B`;
// Archivo(s) del valor: nombre, tipo MIME y tamaño, vengan como texto (nombre / URI) o como objeto del selector
const filesOf = (value) => (Array.isArray(value) ? value : [value]).map((f) => {
    var _a, _b, _c, _d, _e, _f, _g;
    const name = typeof f === 'string' ? f : ((_c = (_b = (_a = f === null || f === void 0 ? void 0 : f.name) !== null && _a !== void 0 ? _a : f === null || f === void 0 ? void 0 : f.fileName) !== null && _b !== void 0 ? _b : f === null || f === void 0 ? void 0 : f.uri) !== null && _c !== void 0 ? _c : '');
    const mime = typeof f === 'string' ? '' : ((_f = (_d = f === null || f === void 0 ? void 0 : f.mimeType) !== null && _d !== void 0 ? _d : (((_e = f === null || f === void 0 ? void 0 : f.type) === null || _e === void 0 ? void 0 : _e.includes('/')) ? f.type : '')) !== null && _f !== void 0 ? _f : '');
    return {
        ext: (name.split(/[?#]/)[0].split('.').pop() || '').toLowerCase(),
        mime: (mime || '').toLowerCase(),
        size: typeof f === 'string' ? undefined : ((_g = f === null || f === void 0 ? void 0 : f.size) !== null && _g !== void 0 ? _g : f === null || f === void 0 ? void 0 : f.fileSize),
    };
});
const typeAllowed = (file, types) => types.some(t => {
    const type = t.toLowerCase().replace(/^\./, '');
    if (!type.includes('/'))
        return file.ext === type;
    return type.endsWith('/*') ? file.mime.startsWith(type.slice(0, -1)) : file.mime === type;
});
const validateField = (form, formControl, rules) => {
    var _a, _b, _c, _d;
    const value = form[formControl].value;
    // El mensaje propio de la regla (messages) o el de la librería, con sus parámetros
    const fail = (rule, params) => {
        var _a;
        const custom = (_a = rules === null || rules === void 0 ? void 0 : rules.messages) === null || _a === void 0 ? void 0 : _a[rule];
        return custom ? custom.replace(/{{(\w+)}}/g, (_, k) => { var _a; return String((_a = params === null || params === void 0 ? void 0 : params[k]) !== null && _a !== void 0 ? _a : ''); }) : (0, translate_1.libT)(rule, params);
    };
    const isEmpty = value === null || value === undefined || value === '' || (Array.isArray(value) && !value.length);
    if ((rules === null || rules === void 0 ? void 0 : rules.required) && (isEmpty || value === false))
        return fail("required");
    if (rules === null || rules === void 0 ? void 0 : rules.custom) {
        const error = rules.custom(form);
        if (error)
            return error;
    }
    if ((rules === null || rules === void 0 ? void 0 : rules.sameAs) && value !== ((_a = form[rules.sameAs]) === null || _a === void 0 ? void 0 : _a.value))
        return fail("sameAs");
    if (isEmpty)
        return "";
    const text = typeof value === 'string' ? value : String(value);
    const num = toNumber(value);
    if ((rules === null || rules === void 0 ? void 0 : rules.email) && !emailValidator.test(text))
        return fail("email");
    if ((rules === null || rules === void 0 ? void 0 : rules.number) && !/^[-+]?\d*([.,]?\d+)?$/.test(text))
        return fail("number");
    if ((rules === null || rules === void 0 ? void 0 : rules.integer) && !/^[-+]?\d+$/.test(text.trim()))
        return fail("integer");
    if ((rules === null || rules === void 0 ? void 0 : rules.positive) && !(num > 0))
        return fail("positive");
    if ((rules === null || rules === void 0 ? void 0 : rules.min) != null && !(num >= rules.min))
        return fail("min", { min: rules.min });
    if ((rules === null || rules === void 0 ? void 0 : rules.max) != null && !(num <= rules.max))
        return fail("max", { max: rules.max });
    if ((rules === null || rules === void 0 ? void 0 : rules.minLength) && ((_b = value.length) !== null && _b !== void 0 ? _b : text.length) < rules.minLength)
        return fail("minLength", { min: rules.minLength });
    if ((rules === null || rules === void 0 ? void 0 : rules.maxLength) && ((_c = value.length) !== null && _c !== void 0 ? _c : text.length) > rules.maxLength)
        return fail("maxLength", { max: rules.maxLength });
    if (rules === null || rules === void 0 ? void 0 : rules.phone) {
        const digits = text.replace(/\D/g, '').length;
        if (!phoneValidator.test(text) || digits < 7 || digits > 15)
            return fail("phone");
    }
    if ((rules === null || rules === void 0 ? void 0 : rules.url) && !urlValidator.test(text.trim()))
        return fail("url");
    if ((rules === null || rules === void 0 ? void 0 : rules.alpha) && !alphaValidator.test(text))
        return fail("alpha");
    if ((rules === null || rules === void 0 ? void 0 : rules.alphanumeric) && !alphanumericValidator.test(text))
        return fail("alphanumeric");
    if ((rules === null || rules === void 0 ? void 0 : rules.minItems) != null && Array.isArray(value) && value.length < rules.minItems)
        return fail("minItems", { min: rules.minItems });
    if ((rules === null || rules === void 0 ? void 0 : rules.maxItems) != null && Array.isArray(value) && value.length > rules.maxItems)
        return fail("maxItems", { max: rules.maxItems });
    if (((_d = rules === null || rules === void 0 ? void 0 : rules.fileTypes) === null || _d === void 0 ? void 0 : _d.length) && filesOf(value).some(f => !typeAllowed(f, rules.fileTypes)))
        return fail("fileTypes", { types: rules.fileTypes.join(', ') });
    if ((rules === null || rules === void 0 ? void 0 : rules.maxFileSize) && filesOf(value).some(f => f.size != null && f.size > rules.maxFileSize))
        return fail("maxFileSize", { size: formatBytes(rules.maxFileSize) });
    if ((rules === null || rules === void 0 ? void 0 : rules.pattern) && !rules.pattern.test(text))
        return fail("pattern");
    return "";
};
/**
 * Un formulario: sus campos con el valor inicial y las reglas de validación de cada uno. Se crea una vez (fuera del
 * componente o con useRef) y cada Control se conecta a un campo con formGroup y formControl
 * @example const form = new FormGroupRef({
 *     email: ['', { required: true, email: true }],
 *     edad: ['', { integer: true, min: 18 }],
 * });
 * form.submit(valores => api.guardar(valores));
 */
class FormGroupRef {
    constructor(form) {
        _FormGroupRef_instances.add(this);
        this.controls = {};
        this.value = {};
        this.initValue = {};
        _FormGroupRef_listeners.set(this, {});
        _FormGroupRef_snapshots.set(this, {});
        // Una función por control, siempre la misma: useSyncExternalStore se resuscribe si cambia
        // (antes se creaba una nueva en cada render y cada control se resuscribía en cada render)
        _FormGroupRef_subscribers.set(this, {});
        _FormGroupRef_getters.set(this, {});
        this.subscribe = (control) => { var _a; var _b, _c; return (_a = (_b = __classPrivateFieldGet(this, _FormGroupRef_subscribers, "f"))[_c = control]) !== null && _a !== void 0 ? _a : (_b[_c] = (callback) => {
            if (!__classPrivateFieldGet(this, _FormGroupRef_listeners, "f")[control])
                __classPrivateFieldGet(this, _FormGroupRef_listeners, "f")[control] = new Set();
            __classPrivateFieldGet(this, _FormGroupRef_listeners, "f")[control].add(callback);
            return () => __classPrivateFieldGet(this, _FormGroupRef_listeners, "f")[control].delete(callback);
        }); };
        this.getSnapshot = (control) => { var _a; var _b, _c; return (_a = (_b = __classPrivateFieldGet(this, _FormGroupRef_getters, "f"))[_c = control]) !== null && _a !== void 0 ? _a : (_b[_c] = () => __classPrivateFieldGet(this, _FormGroupRef_snapshots, "f")[control]); };
        // Campos quitados con removeControl: para restaurarlos con addControl(nombre) sin definición
        _FormGroupRef_removed.set(this, {});
        Object.keys(form).map(x => {
            this.createControl(x, form[x]);
        });
        __classPrivateFieldGet(this, _FormGroupRef_snapshots, "f")['FORM_REF'] = {};
    }
    /* ---------------- Valores ---------------- */
    setInitValue(value, setControls = true) {
        Object.assign(this.initValue, value);
        if (setControls)
            this.setValue(value);
    }
    setValue(value, validate = false) {
        // Solo los campos que existen en el formulario (uno desconocido rompía la app)
        Object.keys(value).filter(k => k in this.controls).map((control) => {
            this.value[control] = value[control];
            this.controls[control].value = value[control];
            if (validate)
                this.controls[control].validate(value[control]);
            this.notify(control);
        });
        this.notify('FORM_REF');
    }
    setControlValue(control, value, validate = true) {
        if (!this.hasControl(control))
            return;
        this.value[control] = value;
        this.controls[control].value = value;
        if (validate) {
            this.controls[control].validate(value);
            // Campos con sameAs de este (p. ej. confirmar contraseña): si ya se habían tocado, se revalidan
            // (si no, al cambiar la contraseña el error de "no coinciden" se quedaba desactualizado)
            Object.keys(this.controls).forEach(k => {
                var _a;
                const other = this.controls[k];
                if (k !== control && ((_a = other.validation) === null || _a === void 0 ? void 0 : _a.sameAs) === control && __classPrivateFieldGet(this, _FormGroupRef_instances, "m", _FormGroupRef_touched).call(this, k)) {
                    other.validate(other.value);
                    this.notify(k);
                }
            });
        }
        this.notify(control);
        this.notify('FORM_REF');
    }
    /** Valor de un campo */
    getValue(control) {
        return this.value[control];
    }
    /** Copia de todos los valores */
    getValues() {
        return Object.assign({}, this.value);
    }
    /** ¿Ha cambiado respecto al valor inicial? Un campo, o cualquiera si no se indica */
    isDirty(control) {
        const changed = (k) => JSON.stringify(this.value[k]) !== JSON.stringify(this.initValue[k]);
        return control != null ? changed(control) : Object.keys(this.controls).some(changed);
    }
    /** Solo los campos que han cambiado (p. ej. para enviar un PATCH) */
    getDirtyValues() {
        return Object.fromEntries(Object.keys(this.controls).filter(k => this.isDirty(k)).map(k => [k, this.value[k]]));
    }
    /* ---------------- Validación ---------------- */
    /** Valida todos los campos (salvo los deshabilitados) y muestra sus errores. true si todo es válido */
    validate() {
        let valid = true;
        Object.keys(this.controls).map(x => {
            if (this.controls[x].disabled)
                return;
            const err = this.controls[x].validate(this.value[x]);
            this.notify(x);
            if (err)
                valid = false;
        });
        this.notify('FORM_REF');
        return valid;
    }
    /** ¿Hay algún campo inválido? Sin mostrar errores (p. ej. para deshabilitar el botón de enviar) */
    isInvalid() {
        return Object.keys(this.controls).some(x => !this.controls[x].disabled && this.controls[x].validation && !!validateField(this.controls, x, this.controls[x].validation));
    }
    validateControl(control, validation) {
        var _a;
        const rules = validation !== null && validation !== void 0 ? validation : (_a = this.controls[control]) === null || _a === void 0 ? void 0 : _a.validation;
        if (rules)
            this.controls[control].error = validateField(this.controls, control, rules);
        this.notify(control);
    }
    /** Valida y, si todo es válido, llama a onValid con los valores; si no, a onInvalid con los errores */
    submit(onValid, onInvalid) {
        return this.validate() ? onValid(this.getValues()) : onInvalid === null || onInvalid === void 0 ? void 0 : onInvalid(this.getErrors());
    }
    /** Cambia las reglas de un campo (las reemplaza) y lo revalida si ya se había tocado */
    setValidation(control, validation) {
        if (!this.hasControl(control))
            return;
        this.controls[control].validation = validation;
        if (!validation)
            this.controls[control].error = '';
        else if (__classPrivateFieldGet(this, _FormGroupRef_instances, "m", _FormGroupRef_touched).call(this, control))
            this.controls[control].validate(this.value[control]);
        this.notify(control);
        this.notify('FORM_REF');
    }
    /** Añade reglas a las que ya tiene (p. ej. hacerlo obligatorio según otro campo) */
    addValidation(control, validation) {
        if (!this.hasControl(control))
            return;
        this.setValidation(control, Object.assign(Object.assign({}, this.controls[control].validation), validation));
    }
    /** Quita reglas concretas (['required', 'min']) o todas si no se indican */
    removeValidation(control, rules) {
        if (!this.hasControl(control))
            return;
        if (!rules)
            return this.setValidation(control, undefined);
        const next = Object.assign({}, this.controls[control].validation);
        rules.forEach(r => delete next[r]);
        this.setValidation(control, Object.keys(next).length ? next : undefined);
    }
    /* ---------------- Errores ---------------- */
    /** Pone un error a mano (p. ej. uno del servidor: "ese email ya existe") */
    setError(control, error) {
        if (!this.hasControl(control))
            return;
        this.controls[control].error = error;
        this.notify(control);
        this.notify('FORM_REF');
    }
    /** Varios errores a la vez: { email: 'Ya existe', usuario: 'No disponible' } */
    setErrors(errors) {
        Object.entries(errors).forEach(([k, e]) => this.hasControl(k) && (this.controls[k].error = e, this.notify(k)));
        this.notify('FORM_REF');
    }
    /** Quita los errores de unos campos, o de todos */
    clearErrors(controls) {
        (controls !== null && controls !== void 0 ? controls : Object.keys(this.controls)).forEach(k => {
            if (!this.hasControl(k))
                return;
            this.controls[k].error = '';
            this.notify(k);
        });
        this.notify('FORM_REF');
    }
    /** Errores visibles ahora: { campo: mensaje } (solo los que tienen) */
    getErrors() {
        return Object.fromEntries(Object.keys(this.controls).filter(k => this.controls[k].error).map(k => [k, this.controls[k].error]));
    }
    /* ---------------- Habilitar / deshabilitar ---------------- */
    /** Deshabilita un campo: no se puede editar y validate() / isInvalid() lo ignoran (su valor se mantiene) */
    disable(control) {
        __classPrivateFieldGet(this, _FormGroupRef_instances, "m", _FormGroupRef_setDisabled).call(this, control, true);
    }
    enable(control) {
        __classPrivateFieldGet(this, _FormGroupRef_instances, "m", _FormGroupRef_setDisabled).call(this, control, false);
    }
    isDisabled(control) {
        var _a;
        return !!((_a = this.controls[control]) === null || _a === void 0 ? void 0 : _a.disabled);
    }
    /* ---------------- Campos dinámicos ---------------- */
    hasControl(control) {
        return control in this.controls;
    }
    /**
     * Añade un campo (p. ej. "añadir otro teléfono"). Si ya existe, no hace nada.
     * Sin definición, restaura uno quitado con removeControl (con sus reglas, su valor y su valor inicial)
     */
    addControl(control, definition) {
        if (this.hasControl(control))
            return;
        const removed = __classPrivateFieldGet(this, _FormGroupRef_removed, "f")[control];
        if (!definition && !removed)
            return;
        this.createControl(control, definition !== null && definition !== void 0 ? definition : [removed.value, removed.validation]);
        if (!definition && removed)
            this.initValue[control] = removed.initValue;
        delete __classPrivateFieldGet(this, _FormGroupRef_removed, "f")[control];
        this.notify(control);
        this.notify('FORM_REF');
    }
    /**
     * Quita un campo del formulario (su valor, su valor inicial y sus errores): deja de validarse y de salir
     * en getValues. Su input sigue en pantalla con lo escrito; addControl(nombre) lo vuelve a conectar
     */
    removeControl(control) {
        var _a;
        if (!this.hasControl(control))
            return;
        __classPrivateFieldGet(this, _FormGroupRef_removed, "f")[control] = { value: this.value[control], initValue: this.initValue[control], validation: this.controls[control].validation };
        delete this.controls[control];
        delete this.value[control];
        delete this.initValue[control];
        __classPrivateFieldGet(this, _FormGroupRef_snapshots, "f")[control] = undefined;
        (_a = __classPrivateFieldGet(this, _FormGroupRef_listeners, "f")[control]) === null || _a === void 0 ? void 0 : _a.forEach(cb => cb());
        this.notify('FORM_REF');
    }
    /* ---------------- Reiniciar ---------------- */
    /** Vuelve a los valores iniciales (o a estos valores, si se pasan) y quita los errores */
    reset(values) {
        Object.keys(this.controls).map(x => {
            const v = values && x in values ? values[x] : this.initValue[x];
            this.value[x] = v;
            this.controls[x].value = v;
            this.controls[x].error = '';
            this.notify(x);
        });
        this.notify('FORM_REF');
    }
    /** Vuelve un campo a su valor inicial y le quita el error */
    resetControl(control) {
        if (!this.hasControl(control))
            return;
        this.value[control] = this.initValue[control];
        this.controls[control].value = this.initValue[control];
        this.controls[control].error = '';
        this.notify(control);
        this.notify('FORM_REF');
    }
    /* ---------------- Escuchar cambios (fuera de React) ---------------- */
    /**
     * Llama a `listener` con los valores cada vez que cambia un VALOR del formulario (o de ese campo); no
     * con cambios de errores o de disable. Devuelve la función para dejar de escuchar.
     * @example const stop = form.watch(values => guardarBorrador(values)); ... stop();
     */
    watch(listener, control) {
        const read = () => JSON.stringify(control != null ? this.value[control] : this.value);
        let last = read();
        return this.subscribe(control !== null && control !== void 0 ? control : 'FORM_REF')(() => {
            const now = read();
            if (now === last)
                return;
            last = now;
            listener(this.getValues());
        });
    }
    /**
     * Pinta algo que depende del formulario y se actualiza solo, directamente en el JSX.
     * Con `control`, solo se redibuja cuando cambia ese campo; sin él, con cualquier cambio.
     * Si devuelve texto o un número se envuelve en un <Text> (vale dentro de cualquier Box).
     * @example <Box>{form.listener(v => v.nombre, 'nombre')}</Box>
     * @example {form.listener(v => `Total: ${v.precio * v.cantidad} €`)}
     * @example {form.listener(v => v.acepto ? <Button>Enviar</Button> : null, 'acepto')}
     */
    listener(render, control) {
        return react_1.default.createElement(FormListener, { form: this, render, control });
    }
    /**
     * Hook: el valor plano (texto, número, lo que devuelva `select`) para usarlo donde quieras (props,
     * concatenar, condiciones). Re-renderiza el componente cuando cambia ese campo (o cualquiera, sin `control`).
     * Va en el cuerpo de un componente, como cualquier hook.
     * @example const nombre = form.useListener(v => v.nombre, 'nombre'); <Input placeholder={`Hola ${nombre}`} />
     */
    useListener(select, control) {
        (0, react_1.useSyncExternalStore)(this.subscribe(control !== null && control !== void 0 ? control : 'FORM_REF'), this.getSnapshot(control !== null && control !== void 0 ? control : 'FORM_REF'));
        return select(this.getValues(), this);
    }
    /* ---------------- Interno ---------------- */
    createControl(control, props) {
        var _a, _b;
        this.value[control] = props[0];
        this.controls[control] = {
            value: props[0],
            error: (_b = (_a = this.controls[control]) === null || _a === void 0 ? void 0 : _a.error) !== null && _b !== void 0 ? _b : '',
            disabled: false,
            setValue: (value) => this.setControlValue(control, value),
            // Usa las reglas ACTUALES del control (setValidation / addValidation las pueden cambiar)
            validate: () => {
                var _a;
                const rules = (_a = this.controls[control]) === null || _a === void 0 ? void 0 : _a.validation;
                const error = rules ? validateField(this.controls, control, rules) : '';
                if (this.controls[control])
                    this.controls[control].error = error;
                return error;
            },
            reset: () => this.resetControl(control),
            validation: props[1]
        };
        this.initValue[control] = props[0];
        __classPrivateFieldGet(this, _FormGroupRef_snapshots, "f")[control] = Object.assign({}, this.controls[control]);
    }
    notify(control) {
        var _a;
        if (control === 'FORM_REF') {
            // Nueva referencia para que useSyncExternalStore detecte el cambio
            __classPrivateFieldGet(this, _FormGroupRef_snapshots, "f")['FORM_REF'] = {};
        }
        else if (this.controls[control]) {
            __classPrivateFieldGet(this, _FormGroupRef_snapshots, "f")[control] = Object.assign({}, this.controls[control]);
        }
        (_a = __classPrivateFieldGet(this, _FormGroupRef_listeners, "f")[control]) === null || _a === void 0 ? void 0 : _a.forEach((cb) => cb());
    }
}
exports.FormGroupRef = FormGroupRef;
_FormGroupRef_listeners = new WeakMap(), _FormGroupRef_snapshots = new WeakMap(), _FormGroupRef_subscribers = new WeakMap(), _FormGroupRef_getters = new WeakMap(), _FormGroupRef_removed = new WeakMap(), _FormGroupRef_instances = new WeakSet(), _FormGroupRef_setDisabled = function _FormGroupRef_setDisabled(control, disabled) {
    if (!this.hasControl(control))
        return;
    this.controls[control].disabled = disabled;
    if (disabled)
        this.controls[control].error = '';
    this.notify(control);
    this.notify('FORM_REF');
}, _FormGroupRef_touched = function _FormGroupRef_touched(control) {
    const c = this.controls[control];
    return !!c && (!!c.error || (c.value != null && c.value !== '' && !(Array.isArray(c.value) && !c.value.length)));
};
// Lo que pinta form.listener: se suscribe al campo (o al formulario) y vuelve a pintar al cambiar
const FormListener = ({ form, render, control }) => {
    (0, react_1.useSyncExternalStore)(form.subscribe(control !== null && control !== void 0 ? control : 'FORM_REF'), form.getSnapshot(control !== null && control !== void 0 ? control : 'FORM_REF'));
    const insideText = (0, react_1.useContext)(Text_1.InsideTextContext);
    const result = render(form.getValues(), form);
    // Texto o número: dentro de un <Text> se pinta tal cual (hereda su estilo); fuera, React Native exige
    // un <Text> para cualquier texto, así que se envuelve en uno
    if (typeof result === 'string' || typeof result === 'number')
        return insideText ? result : <Text_1.Text>{result}</Text_1.Text>;
    return result;
};
/**
 * Hook: un campo del formulario (value, error, setValue…). El componente solo se vuelve a pintar cuando cambia ese campo
 * @example const email = useFormControl(form, 'email');
 * <Text>{email.error ?? email.value}</Text>
 */
const useFormControl = (formGroup, formControl) => {
    return (0, react_1.useSyncExternalStore)(formGroup.subscribe(formControl), formGroup.getSnapshot(formControl));
};
exports.useFormControl = useFormControl;
/**
 * Hook: el formulario entero. El componente se vuelve a pintar con cualquier cambio (para isInvalid(), contadores…)
 * @example const f = useFormGroup(form);
 * <Button disabled={f.isInvalid()}>Enviar</Button>
 */
const useFormGroup = (formGroup) => {
    (0, react_1.useSyncExternalStore)(formGroup.subscribe('FORM_REF'), formGroup.getSnapshot('FORM_REF'));
    return formGroup;
};
exports.useFormGroup = useFormGroup;
function ListenerForm({ formGroup, formControl, children }) {
    const value = formControl
        ? (0, exports.useFormControl)(formGroup, formControl)
        : (0, exports.useFormGroup)(formGroup);
    return children(value);
}
const Control = (_a) => {
    var _b;
    var { formGroup, formControl, _box: boxProp, _error: errorProp, isSelect, isCheckBox, isRadio, isSwitch, isDate, isSearch, isSlider } = _a, props = __rest(_a, ["formGroup", "formControl", "_box", "_error", "isSelect", "isCheckBox", "isRadio", "isSwitch", "isDate", "isSearch", "isSlider"]);
    const formControlState = (0, exports.useFormControl)(formGroup, formControl);
    // Campo quitado con removeControl: el input se queda en pantalla con su valor (en un estado local) pero
    // fuera del formulario (sin validar, ni en getValues). Con addControl se vuelve a conectar al mismo input
    const lastValue = (0, react_1.useRef)(formControlState === null || formControlState === void 0 ? void 0 : formControlState.value);
    if (formControlState)
        lastValue.current = formControlState.value;
    const [detachedValue, setDetachedValue] = (0, react_1.useState)(undefined);
    // Al volver (addControl), lo escrito mientras estaba fuera pasa al formulario
    (0, react_1.useEffect)(() => {
        if (formControlState && detachedValue !== undefined) {
            formGroup.setControlValue(formControl, detachedValue, false);
            setDetachedValue(undefined);
        }
    }, [!!formControlState]);
    const control = formControlState !== null && formControlState !== void 0 ? formControlState : {
        value: detachedValue !== undefined ? detachedValue : lastValue.current,
        error: '',
        disabled: false,
        setValue: setDetachedValue,
    };
    // theme.components.EAForm: solo sus props propias (_box y _error); el resto lo tematiza cada control
    const [{ _box, _error }] = (0, useThemeProps_1.useThemeProps)('EAForm', { _box: boxProp, _error: errorProp });
    // Cada control recibe un subconjunto distinto de estas props
    const rest = props;
    const errorBorder = control.error ? { borderColor: 'danger.100' } : {};
    // form.disable('campo') (o disabled en las props): no se puede editar
    const disabled = !!control.disabled || !!rest.disabled;
    const disabledStyle = disabled ? { opacity: 0.5 } : {};
    const onChange = (value) => {
        var _a;
        control.setValue(value);
        (_a = props.onChange) === null || _a === void 0 ? void 0 : _a.call(props, value);
    };
    const onDateChange = (e) => {
        var _a, _b, _c, _d, _e;
        const value = !e ? null : 'start' in e ? { start: (_b = (_a = e.start) === null || _a === void 0 ? void 0 : _a.iso) !== null && _b !== void 0 ? _b : null, end: (_d = (_c = e.end) === null || _c === void 0 ? void 0 : _c.iso) !== null && _d !== void 0 ? _d : null } : e.iso;
        control.setValue(value);
        (_e = props.onChange) === null || _e === void 0 ? void 0 : _e.call(props, e);
    };
    return (<Box_1.Box {..._box}>
            {isSelect ?
            <Select_1.Select defaultValue={control.value} borderColor={control.error ? 'danger.100' : 'light.100'} {...rest} disabled={disabled} onChange={onChange}/>
            : isCheckBox ?
                <CheckBox_1.CheckBox checked={!!control.value} {...rest} disabled={disabled} onChange={onChange}/>
                : isSwitch ?
                    <Switch_1.Switch value={!!control.value} {...rest} disabled={disabled} onValueChange={e => {
                            var _a;
                            onChange(e);
                            (_a = props.onValueChange) === null || _a === void 0 ? void 0 : _a.call(props, e);
                        }}/>
                    : isRadio ?
                        // El label del grupo va arriba (cada opción tiene el suyo y antes lo pisaba)
                        <Box_1.Box gap={6} accessibilityRole="radiogroup">
                                {props.label != null && <Label_1.Label isRequired={props.isRequired} {...props._label}>{props.label}</Label_1.Label>}
                                {react_1.default.Children.toArray(props.children).filter(react_1.default.isValidElement).map((x) => {
                                const { label: _groupLabel, _label: _gl, isRequired: _req, children: _ch } = rest, radioProps = __rest(rest, ["label", "_label", "isRequired", "children"]);
                                return <Radio_1.Radio key={x.props.value} checked={control.value == x.props.value} {...radioProps} {...x.props} disabled={disabled || x.props.disabled} onChange={onChange}/>;
                            })}
                            </Box_1.Box>
                        : isDate ?
                            <DatePicker_1.DatePicker value={control.value} borderColor={control.error ? 'danger.100' : 'light.100'} {...rest} disabled={disabled} onChange={onDateChange}/>
                            : isSlider ?
                                <Slider_1.Slider value={(_b = control.value) !== null && _b !== void 0 ? _b : undefined} {...rest} disabled={disabled} 
                                // El formulario se actualiza al soltar (no en cada paso del arrastre)
                                onChange={props.onChange} onChangeEnd={(v) => control.setValue(v)}/>
                                : isSearch ?
                                    <SearchInput_1.SearchInput value={control.value} {...rest} onChange={onChange} _input={Object.assign({ label: props.label, isFloat: props.isFloat, editable: !disabled, _containerStyle: Object.assign(Object.assign({}, errorBorder), disabledStyle) }, props._input)}/>
                                    :
                                        <Input_1.Input value={control.value} {...rest} editable={!disabled && rest.editable !== false} _containerStyle={Object.assign(Object.assign(Object.assign({}, props._containerStyle), errorBorder), disabledStyle)} onChangeText={e => {
                                                var _a;
                                                control.setValue(e);
                                                (_a = props.onChangeText) === null || _a === void 0 ? void 0 : _a.call(props, e);
                                            }}/>}
            {control.error ? <Text_1.Text color={'danger.100'} {..._error}>{control.error}</Text_1.Text> : null}
        </Box_1.Box>);
};
exports.Control = Control;
exports.Control.Item = ControlItem;
