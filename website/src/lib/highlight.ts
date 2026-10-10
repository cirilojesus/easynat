// Resaltado de código al compilar (Shiki): en el navegador no se carga nada
import { createHighlighter, type Highlighter } from 'shiki';

let highlighter: Promise<Highlighter> | null = null;
const get = () => (highlighter ??= createHighlighter({ themes: ['github-light', 'github-dark'], langs: ['tsx', 'ts', 'bash', 'json'] }));

export async function highlight(code: string, lang: 'tsx' | 'ts' | 'bash' | 'json' = 'tsx') {
    const h = await get();
    return h.codeToHtml(code.trim(), { lang, themes: { light: 'github-light', dark: 'github-dark' }, defaultColor: 'light' });
}
