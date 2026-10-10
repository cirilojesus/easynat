/** Texto → ancla de URL: minúsculas, sin acentos ni signos ('Tema propio' → 'tema-propio') */
export const slugify = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
