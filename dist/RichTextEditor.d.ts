import React from "react";
import { EABoxProps } from "./Box";
import { FormGroupRef } from "./EAForm";
import { LabelType } from "./Label";
import { EATextProps } from "./Text";
/** Lo que tiene aplicado el texto donde está el cursor (para marcar los botones activos) */
export type RichEditorState = {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikeThrough?: boolean;
    subscript?: boolean;
    superscript?: boolean;
    insertUnorderedList?: boolean;
    insertOrderedList?: boolean;
    checkList?: boolean;
    justifyLeft?: boolean;
    justifyCenter?: boolean;
    justifyRight?: boolean;
    justifyFull?: boolean;
    /** Interlineado del párrafo (null = el normal) */
    lineHeight?: number | null;
    /** Espaciado entre letras en px (null = el normal) */
    letterSpacing?: number | null;
    quote?: boolean;
    code?: boolean;
    /** El cursor está dentro de una tabla */
    table?: boolean;
    /** Bloque actual: p, h1, h2, h3, blockquote, pre... */
    block?: string;
    /** Tamaño de <font size> (1-7) */
    fontSize?: string;
    /** href del enlace donde está el cursor (null si no hay) */
    link?: string | null;
    /** El texto seleccionado ahora mismo ('' si solo está el cursor). Sirve para botones propios o para onStateChange */
    selection?: string;
};
export type RichToolbarAction = 'bold' | 'italic' | 'underline' | 'strike' | 'heading' | 'fontSize' | 'bulletList' | 'orderedList' | 'checkList' | 'alignLeft' | 'alignCenter' | 'alignRight' | 'quote' | 'code' | 'link' | 'removeFormat' | 'undo' | 'redo' | 'textColor' | 'highlight' | 'image' | 'table' | 'hr' | 'subscript' | 'superscript' | 'alignJustify' | 'lineHeight' | 'letterSpacing'
/** Separador */
 | '|';
/** Un botón propio en la barra */
export type RichToolbarCustom = {
    key: string;
    icon: React.ReactElement;
    onPress: (editor: RichTextEditorRef) => void;
    isActive?: (state: RichEditorState) => boolean;
};
export type RichMention = string | {
    id: string;
    label: string;
};
/** Los comandos que trae el editor y el valor que lleva cada uno (void = sin valor) */
export interface RichBuiltinCommands {
    bold: void;
    italic: void;
    underline: void;
    strikeThrough: void;
    subscript: void;
    superscript: void;
    removeFormat: void;
    /** Tamaño de <font size>, de '1' a '7' (3 es el normal) */
    fontSize: '1' | '2' | '3' | '4' | '5' | '6' | '7';
    /** Un color (hex, rgb...) o null para quitarlo */
    textColor: string | null;
    /** Color de fondo del texto o null para quitarlo */
    highlight: string | null;
    /** Espaciado entre letras en px o null para el normal */
    letterSpacing: number | null;
    heading: 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    /** Interlineado (1.5, 2...) o null para el normal */
    lineHeight: number | null;
    quote: void;
    code: void;
    checkList: void;
    insertUnorderedList: void;
    insertOrderedList: void;
    justifyLeft: void;
    justifyCenter: void;
    justifyRight: void;
    justifyFull: void;
    insertHTML: string;
    insertText: string;
    insertHorizontalRule: void;
    /** URL https o data URI (data:image/jpeg;base64,...) */
    image: string;
    /** El enlace (si hay texto seleccionado lo convierte en enlace) o null para quitar el del cursor */
    link: {
        url: string;
        text?: string;
    } | null;
    table: {
        rows: number;
        cols: number;
        header?: boolean;
    };
    /** Acción sobre la tabla donde está el cursor */
    tableAction: 'addRow' | 'addColumn' | 'deleteRow' | 'deleteColumn' | 'deleteTable';
    /** Sustituye el @texto que se está escribiendo por la mención */
    mention: {
        id: string;
        label: string;
    };
    undo: void;
    redo: void;
    selectAll: void;
    delete: void;
}
/**
 * Tus comandos (los de la prop `commands`), para que command() también los autocomplete y compruebe su valor.
 * Se amplía desde tu app:
 * declare module 'easynat' { interface RichCustomCommands { mayusculas: void; marcar: string } }
 */
export interface RichCustomCommands {
}
/** Todos los comandos: command() los autocompleta y comprueba su valor (y acepta otros de document.execCommand) */
export type RichCommands = RichBuiltinCommands & RichCustomCommands;
/** command(nombre, valor): con autocompletado de los nombres y el valor que corresponde a cada uno */
export type RichCommandFn = {
    <K extends keyof RichCommands>(name: K, ...value: RichCommands[K] extends void ? [] : [value: RichCommands[K]]): void;
    /** Cualquier otro comando de document.execCommand (p. ej. 'outdent', 'indent', 'fontName') */
    <N extends string>(name: N extends keyof RichCommands ? never : N, value?: string | number | boolean | null): void;
};
export type RichTextEditorRef = {
    focus: () => void;
    blur: () => void;
    /** El HTML actual ('' si está vacío) */
    getHTML: () => string;
    /** El texto sin formato */
    getText: () => string;
    setHTML: (html: string) => void;
    /** Inserta HTML donde está el cursor */
    insertHTML: (html: string) => void;
    insertText: (text: string) => void;
    /**
     * Da una orden al editor: command('heading', 'h2'), command('textColor', '#DC2626'), command('bold')...
     * Ver RichCommands para la lista y el valor de cada uno
     */
    command: RichCommandFn;
    clear: () => void;
};
export type RichTextEditorProps = Omit<EABoxProps, 'children'> & {
    /** HTML (controlado: si cambia desde fuera se carga en el editor) */
    value?: string;
    /** HTML inicial (no controlado) */
    defaultValue?: string;
    /** Al escribir: el HTML ('' si está vacío) y el texto sin formato */
    onChange?: (html: string, text: string) => void;
    onFocus?: () => void;
    onBlur?: () => void;
    placeholder?: string;
    label?: React.ReactNode;
    isFloat?: boolean;
    isRequired?: boolean;
    /** Mensaje de error (borde rojo y texto debajo). Con formGroup se toma del formulario */
    error?: string;
    disabled?: boolean;
    /** EAForm: el valor (HTML), la validación, el error y disabled salen del formulario */
    formGroup?: FormGroupRef<any>;
    formControl?: string;
    /** Alto mínimo y máximo del área de texto: crece con el contenido y, pasado el máximo, hace scroll */
    minHeight?: number;
    maxHeight?: number;
    /** Botones de la barra (en orden; '|' es un separador) o false para quitarla */
    toolbar?: (RichToolbarAction | RichToolbarCustom)[] | false;
    toolbarPosition?: 'top' | 'bottom';
    /** Color de los botones activos y de las casillas. Por defecto primary */
    colorScheme?: string;
    /** Menciones: al escribir el trigger (@) sale una lista con las que coinciden */
    mentions?: {
        data: RichMention[];
        /** Por defecto '@' */
        trigger?: string;
        /** Máximo de sugerencias. Por defecto 5 */
        max?: number;
        /** Lo escrito tras el trigger (null al terminar): para buscar en un servidor y cambiar data */
        onSearch?: (query: string | null) => void;
    };
    /** Pegar como texto sin formato (sin los estilos de la web o Word de donde viene). Por defecto true */
    pastePlain?: boolean;
    /**
     * Botón de imagen: tu selector (p. ej. expo-image-picker). Devuelve una URL https o un data URI
     * (data:image/jpeg;base64,...), o null si se cancela. Sin él, se pide la URL en un modal
     */
    onImagePick?: () => Promise<string | null | undefined> | string | null | undefined;
    /** Colores del botón de color de texto (claves del tema o colores) */
    textColors?: string[];
    /** Colores del botón de resaltado */
    highlightColors?: string[];
    /** Cada vez que cambia lo que hay donde está el cursor: negrita, lista, enlace, texto seleccionado... */
    onStateChange?: (state: RichEditorState) => void;
    /**
     * Comandos propios: el código de una función (como texto) que corre dentro del editor (WebView) y recibe
     * (value, ed). Se usan con command('nombre', valor), igual que los del editor. ed tiene: root, selection(),
     * range(), selectedText(), closest(sel), blocks(), exec(nombre, valor), command(nombre, valor),
     * insertHTML(html), insertText(texto), wrap(etiqueta, atributos) y emit(evento, datos) → onCustomEvent
     * @example commands={{ mayusculas: '(v, ed) => ed.insertText(ed.selectedText().toUpperCase())' }}
     */
    commands?: Record<string, string>;
    /** Lo que mandan tus comandos con ed.emit(evento, datos) */
    onCustomEvent?: (event: string, data: any) => void;
    /**
     * Al tocar fuera del editor (en cualquier parte de la app) se quita el foco y se cierra el teclado.
     * Por defecto true. Necesita el ThemeProvider (es quien avisa de los toques)
     */
    blurOnOutsidePress?: boolean;
    /** Estilo del contenido: color, tamaño de letra, padding... y CSS propio */
    editorStyle?: {
        color?: string;
        fontSize?: number;
        lineHeight?: number;
        padding?: number;
        placeholderColor?: string;
        linkColor?: string;
        mentionColor?: string;
        /** CSS extra para el contenido, p. ej. 'h1{color:red}' */
        css?: string;
    };
    /** La caja del editor (borde, fondo, redondeo) */
    _editor?: EABoxProps;
    /** La caja del editor con foco (se fusiona con _editor) */
    _focus?: EABoxProps;
    _toolbar?: EABoxProps;
    _toolbarButton?: EABoxProps;
    /** Las flechas que avisan de que la barra tiene más botones (al hacer scroll) */
    _toolbarArrow?: EABoxProps;
    _label?: LabelType;
    _error?: EATextProps;
    _mentionList?: EABoxProps;
    _mentionItem?: EATextProps;
    variant?: (string & {});
};
/** Los botones de la barra por defecto ('|' es un separador). Para una barra propia, pásale tu lista a `toolbar` */
export declare const DEFAULT_TOOLBAR: RichToolbarAction[];
/**
 * Editor de texto enriquecido (HTML). Necesita react-native-webview (dependencia opcional: instálala para usarlo)
 * @example <RichTextEditor label="Descripción" isFloat onChange={html => setHtml(html)} />
 * @example <RichTextEditor formGroup={form} formControl="comentario" mentions={{ data: usuarios }} />
 */
export declare const RichTextEditor: React.ForwardRefExoticComponent<Omit<EABoxProps, "children"> & {
    /** HTML (controlado: si cambia desde fuera se carga en el editor) */
    value?: string;
    /** HTML inicial (no controlado) */
    defaultValue?: string;
    /** Al escribir: el HTML ('' si está vacío) y el texto sin formato */
    onChange?: (html: string, text: string) => void;
    onFocus?: () => void;
    onBlur?: () => void;
    placeholder?: string;
    label?: React.ReactNode;
    isFloat?: boolean;
    isRequired?: boolean;
    /** Mensaje de error (borde rojo y texto debajo). Con formGroup se toma del formulario */
    error?: string;
    disabled?: boolean;
    /** EAForm: el valor (HTML), la validación, el error y disabled salen del formulario */
    formGroup?: FormGroupRef<any>;
    formControl?: string;
    /** Alto mínimo y máximo del área de texto: crece con el contenido y, pasado el máximo, hace scroll */
    minHeight?: number;
    maxHeight?: number;
    /** Botones de la barra (en orden; '|' es un separador) o false para quitarla */
    toolbar?: (RichToolbarAction | RichToolbarCustom)[] | false;
    toolbarPosition?: "top" | "bottom";
    /** Color de los botones activos y de las casillas. Por defecto primary */
    colorScheme?: string;
    /** Menciones: al escribir el trigger (@) sale una lista con las que coinciden */
    mentions?: {
        data: RichMention[];
        /** Por defecto '@' */
        trigger?: string;
        /** Máximo de sugerencias. Por defecto 5 */
        max?: number;
        /** Lo escrito tras el trigger (null al terminar): para buscar en un servidor y cambiar data */
        onSearch?: (query: string | null) => void;
    };
    /** Pegar como texto sin formato (sin los estilos de la web o Word de donde viene). Por defecto true */
    pastePlain?: boolean;
    /**
     * Botón de imagen: tu selector (p. ej. expo-image-picker). Devuelve una URL https o un data URI
     * (data:image/jpeg;base64,...), o null si se cancela. Sin él, se pide la URL en un modal
     */
    onImagePick?: () => Promise<string | null | undefined> | string | null | undefined;
    /** Colores del botón de color de texto (claves del tema o colores) */
    textColors?: string[];
    /** Colores del botón de resaltado */
    highlightColors?: string[];
    /** Cada vez que cambia lo que hay donde está el cursor: negrita, lista, enlace, texto seleccionado... */
    onStateChange?: (state: RichEditorState) => void;
    /**
     * Comandos propios: el código de una función (como texto) que corre dentro del editor (WebView) y recibe
     * (value, ed). Se usan con command('nombre', valor), igual que los del editor. ed tiene: root, selection(),
     * range(), selectedText(), closest(sel), blocks(), exec(nombre, valor), command(nombre, valor),
     * insertHTML(html), insertText(texto), wrap(etiqueta, atributos) y emit(evento, datos) → onCustomEvent
     * @example commands={{ mayusculas: '(v, ed) => ed.insertText(ed.selectedText().toUpperCase())' }}
     */
    commands?: Record<string, string>;
    /** Lo que mandan tus comandos con ed.emit(evento, datos) */
    onCustomEvent?: (event: string, data: any) => void;
    /**
     * Al tocar fuera del editor (en cualquier parte de la app) se quita el foco y se cierra el teclado.
     * Por defecto true. Necesita el ThemeProvider (es quien avisa de los toques)
     */
    blurOnOutsidePress?: boolean;
    /** Estilo del contenido: color, tamaño de letra, padding... y CSS propio */
    editorStyle?: {
        color?: string;
        fontSize?: number;
        lineHeight?: number;
        padding?: number;
        placeholderColor?: string;
        linkColor?: string;
        mentionColor?: string;
        /** CSS extra para el contenido, p. ej. 'h1{color:red}' */
        css?: string;
    };
    /** La caja del editor (borde, fondo, redondeo) */
    _editor?: EABoxProps;
    /** La caja del editor con foco (se fusiona con _editor) */
    _focus?: EABoxProps;
    _toolbar?: EABoxProps;
    _toolbarButton?: EABoxProps;
    /** Las flechas que avisan de que la barra tiene más botones (al hacer scroll) */
    _toolbarArrow?: EABoxProps;
    _label?: LabelType;
    _error?: EATextProps;
    _mentionList?: EABoxProps;
    _mentionItem?: EATextProps;
    variant?: (string & {});
} & React.RefAttributes<RichTextEditorRef>>;
