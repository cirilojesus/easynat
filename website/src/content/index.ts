import { BASE, BUTTONS } from './base';
import { FORMS } from './forms';
import { FEEDBACK, LAYOUT, OVERLAYS } from './overlays';
import { CONTENT, DATA, MEDIA } from './data';
import { CATEGORIES, type ComponentDoc } from './types';

export const COMPONENTS: ComponentDoc[] = [...BASE, ...BUTTONS, ...FORMS, ...FEEDBACK, ...OVERLAYS, ...LAYOUT, ...DATA, ...CONTENT, ...MEDIA];

export const componentBySlug = (slug: string) => COMPONENTS.find(c => c.slug === slug);

export const byCategory = () => CATEGORIES.map(c => ({ ...c, items: COMPONENTS.filter(x => x.category === c.id) }));

export { CATEGORIES };
export type { ComponentDoc };

/** Las guías (páginas que no son de un componente) */
export const GUIDES = [
    { slug: '', title: 'Introducción', href: '/docs' },
    { slug: 'instalacion', title: 'Instalación', href: '/docs/instalacion' },
    { slug: 'props-de-estilo', title: 'Props de estilo', href: '/docs/props-de-estilo' },
    { slug: 'tema', title: 'Tema y variantes', href: '/docs/tema' },
    { slug: 'idiomas', title: 'Idiomas (i18n)', href: '/docs/idiomas' },
    { slug: 'api', title: 'Funciones y hooks', href: '/docs/api' },
    { slug: 'tipos', title: 'Tipos', href: '/docs/tipos' },
];
