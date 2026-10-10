export type Example = {
    title: string;
    description?: string;
    code: string;
};

export type Category =
    | 'Base'
    | 'Botones'
    | 'Formularios'
    | 'Avisos y carga'
    | 'Capas'
    | 'Disposición y animación'
    | 'Datos'
    | 'Contenido'
    | 'Multimedia';

export const CATEGORIES: { id: Category; description: string }[] = [
    { id: 'Base', description: 'Los bloques con los que se construye todo: cajas, textos, iconos, imágenes y el tema.' },
    { id: 'Botones', description: 'Botones con variantes, carga, cambios al pulsar y botones de mantener y deslizar.' },
    { id: 'Formularios', description: 'Campos, selectores, fechas y un formulario con validación completa.' },
    { id: 'Avisos y carga', description: 'Avisos, spinners a pantalla completa, barras de progreso y esqueletos.' },
    { id: 'Capas', description: 'Modales y menús que se abren desde cualquier parte, encima de todo.' },
    { id: 'Disposición y animación', description: 'Desplegables, acordeones, carruseles y animaciones en cascada.' },
    { id: 'Datos', description: 'Tablas, filtros, listas infinitas con caché y gráficos.' },
    { id: 'Contenido', description: 'Mostrar HTML y escribirlo con un editor de texto enriquecido.' },
    { id: 'Multimedia', description: 'Visor y editor de imágenes y visor de PDF.' },
];

export type ComponentDoc = {
    slug: string;
    name: string;
    category: Category;
    /** Una línea (tarjetas y metadescripción) */
    summary: string;
    /** Párrafo de introducción */
    description: string;
    /** Lo que sabe hacer */
    features: string[];
    /** Lo que se importa de 'easynat' */
    imports: string[];
    examples: Example[];
    /** Tipos de api.json cuyas props se muestran (en orden) */
    types?: string[];
    /** Funciones / constantes de api.json relacionadas */
    functions?: string[];
    /** Dependencia opcional que necesita */
    requires?: string;
    /** Capturas en /public/shots (sin extensión) */
    shots?: string[];
    /** Variantes por defecto (nombre: descripción) */
    variants?: { name: string; description: string }[];
    /** Algo importante que hay que saber */
    notes?: string[];
};
