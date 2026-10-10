// Acceso tipado a src/data/api.json (lo genera scripts/gen-api.mjs a partir del código de la librería)
import api from '@/data/api.json';

export type ApiMember = { name: string; type: string; optional: boolean; doc: string; deprecated: boolean };
export type ApiType = { name: string; module: string; members: ApiMember[]; extends: string[]; alias: string; doc: string; typeParams: string[] };
export type ApiFunction = { name: string; module: string; kind?: string; signatures: string[]; doc: string; examples: string[]; value?: string };

const data = api as unknown as { types: Record<string, ApiType>; functions: Record<string, ApiFunction>; components: Record<string, { name: string; doc: string }> };

export const getType = (name: string): ApiType | undefined => data.types[name];
export const getFunction = (name: string): ApiFunction | undefined => data.functions[name];
export const allFunctions = () => Object.values(data.functions);
export const allTypes = () => Object.values(data.types);

/** Grupos para la página de funciones (por el archivo de la librería donde están) */
export const FUNCTION_GROUPS: { title: string; description: string; modules: string[] }[] = [
    { title: 'Avisos, modales y spinners', description: 'Se llaman desde cualquier parte, sin montar nada.', modules: ['Alert', 'Modal', 'Spinner'] },
    { title: 'Tema y estilos', description: 'Leer y combinar el tema, y las props por defecto de cada componente.', modules: ['theme', 'theme-provider', 'utils/useThemeProps', 'utils/helpers', 'Box', 'utils/color'] },
    { title: 'Idiomas', description: 'Traducciones de la app y de los textos de la librería.', modules: ['utils/translate'] },
    { title: 'Formularios', description: 'Hooks y ayudas de EAForm.', modules: ['EAForm'] },
    { title: 'Fechas', description: 'Formatear y leer fechas como el DatePicker.', modules: ['DatePicker'] },
    { title: 'Listas y filtros', description: 'Listas de la API y filtros de datos locales.', modules: ['AsyncList', 'Filter'] },
    { title: 'HTML', description: 'Convertir y limpiar HTML.', modules: ['RenderHTML'] },
    { title: 'Teclado y toques', description: 'Estado del teclado y toques fuera de una vista.', modules: ['utils/keyboard', 'utils/touches'] },
    { title: 'Multimedia y WebView', description: 'Abrir visores y editores y leer archivos.', modules: ['ImageViewer', 'ImageEditor', 'PDFViewer', 'utils/webview', 'RichTextEditor', 'Chart', 'Stagger'] },
];

/* ---------- Tipos que se usan unos a otros ---------- */

const IDENT = /[A-Za-z_][A-Za-z0-9_]*/g;

/** Los tipos de la librería que aparecen en otro (en sus props, en lo que hereda o en su definición) */
export const typeRefs = (name: string): string[] => {
    const t = data.types[name];
    if (!t) return [];
    const text = [t.alias, ...t.extends, ...t.members.map(m => m.type)].join(' ');
    return [...new Set(text.match(IDENT) ?? [])].filter(n => n !== name && data.types[n]);
};

// Tipos base que comparten casi todos los componentes: se enlazan, pero no se repiten en cada página
const SHARED = new Set(['EABoxProps', 'EADefaultProps', 'EATextProps', 'EAPressableProps', 'EAButtonProps', 'EAFlatListProps',
    'EAScrollViewProps', 'EATextInputProps', 'IconProps', 'Theme', 'ThemeType', 'ComponentsTheme', 'ComponentTheme', 'ALL_PROPS',
    'VARIANTS_TYPE', 'EAMenuProps', 'EAModalProps', 'CollapseProps', 'EAKeyboardAvoidingProps', 'EASpinnerProps', 'LabelType', 'FormGroupRef']);

/**
 * Los tipos que hay que enseñar en la página de un componente: los suyos y los que usan sus props (hasta dos niveles),
 * sin los tipos base compartidos (salvo que sean de este componente)
 */
export const typesForPage = (primary: string[]) => {
    const own = primary.filter(n => data.types[n]);
    const extra: string[] = [];
    const seen = new Set(own);
    let level = own;
    for (let depth = 0; depth < 2; depth++) {
        const next: string[] = [];
        for (const n of level) for (const r of typeRefs(n)) {
            if (seen.has(r) || SHARED.has(r)) continue;
            seen.add(r); extra.push(r); next.push(r);
        }
        level = next;
    }
    return { own, extra };
};
