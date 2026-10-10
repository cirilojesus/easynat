import fs from 'node:fs';
import path from 'node:path';
import { COMPONENTS, GUIDES } from '@/content';
import { allFunctions, allTypes, typesForPage } from './api';
import { slugify } from './slug';

/** Una entrada del buscador: t = título, k = tipo, u = URL (con ancla), p = dónde está, d = texto en el que también se busca */
export type SearchEntry = { t: string; k: SearchKind; u: string; p?: string; d?: string };
export type SearchKind = 'Guía' | 'Sección' | 'Componente' | 'Variante' | 'Ejemplo' | 'Prop' | 'Función' | 'Tipo';

const cut = (s = '', n = 220) => (s.length > n ? s.slice(0, n).trimEnd() + '…' : s);
// Las funciones que no están en la página de un componente sino en una guía
const GUIDE_FUNCTIONS: Record<string, string[]> = {
    '/docs/tema/': ['useThemeProps', 'mergeProps', 'useTheme', 'mergeTheme'],
    '/docs/idiomas/': ['initTranslate', 'setLanguages', 't', 'useI18n', 'setLang', 'getLang', 'getDeviceLanguage'],
};
const SKIP_FUNCTIONS = new Set(['Icon', 'DatePicker', 'ListenerForm', 'touchHandlers', 'defaultTheme', 'theme', 'subscribe', 'renderChild', 'calcSize', 'libT']);

/** Los títulos (H2) de una guía y el primer párrafo de cada uno, leídos de su código */
const guideSections = (slug: string) => {
    const file = path.join(process.cwd(), 'src', 'app', 'docs', slug, 'page.tsx');
    if (!fs.existsSync(file)) return [];
    const src = fs.readFileSync(file, 'utf8');
    return [...src.matchAll(/<H2>([^<]+)<\/H2>([\s\S]*?)(?=<H2>|<\/article>)/g)].map(m => {
        const p = m[2].match(/<p[^>]*>([\s\S]*?)<\/p>/)?.[1] ?? '';
        const text = p.replace(/\{[^}]*\}/g, ' ').replace(/<[^>]+>/g, '').replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();
        return { title: m[1].trim(), text };
    });
};

export function buildSearchIndex(): SearchEntry[] {
    const out: SearchEntry[] = [];
    const fnPage = new Map<string, string>();
    const typePage = new Map<string, string>();

    for (const g of GUIDES) {
        const u = `${g.href}/`;
        out.push({ t: g.title, k: 'Guía', u });
        for (const s of guideSections(g.slug)) out.push({ t: s.title, k: 'Sección', u: `${u}#${slugify(s.title)}`, p: g.title, d: cut(s.text) });
    }
    for (const [u, names] of Object.entries(GUIDE_FUNCTIONS)) for (const n of names) fnPage.set(n, u);

    for (const c of COMPONENTS) {
        const u = `/docs/componentes/${c.slug}/`;
        out.push({ t: c.name, k: 'Componente', u, p: c.category, d: cut([c.summary, ...c.features].join(' · '), 400) });
        for (const v of c.variants ?? []) out.push({ t: v.name, k: 'Variante', u: `${u}#variante-${slugify(v.name)}`, p: c.name, d: v.description });
        for (const e of c.examples) out.push({ t: e.title, k: 'Ejemplo', u: `${u}#ejemplo-${slugify(e.title)}`, p: c.name, d: cut(`${e.description ?? ''} ${e.code.replace(/\s+/g, ' ')}`, 300) });
        for (const f of c.functions ?? []) if (!fnPage.has(f)) fnPage.set(f, u);
        const { own, extra } = typesForPage(c.types ?? []);
        for (const t of [...own, ...extra]) if (!typePage.has(t)) typePage.set(t, u);
        // Props: las de los tipos propios del componente
        // ComponentsTheme solo lista los componentes del tema (cada uno ya tiene su entrada)
        for (const tn of own.filter(n => n !== 'ComponentsTheme')) {
            const t = allTypes().find(x => x.name === tn);
            for (const m of t?.members ?? []) {
                out.push({ t: m.name, k: 'Prop', u: `${u}#tipo-${tn}`, p: `${c.name} · ${tn}`, d: cut(`${m.doc} ${m.type}`.trim()) });
            }
        }
    }

    for (const f of allFunctions()) {
        if (SKIP_FUNCTIONS.has(f.name)) continue;
        const page = fnPage.get(f.name) ?? '/docs/api/';
        const kind = /^use[A-Z]/.test(f.name) ? 'hook' : f.kind === 'class' ? 'clase' : /^[A-Z][A-Z0-9_]+$/.test(f.name) ? 'constante' : 'función';
        out.push({ t: f.name, k: 'Función', u: `${page}#fn-${f.name}`, p: kind, d: cut(f.doc || f.signatures[0] || '') });
    }
    for (const t of allTypes()) {
        out.push({ t: t.name, k: 'Tipo', u: `${typePage.get(t.name) ?? '/docs/tipos/'}#tipo-${t.name}`, p: t.module, d: cut(t.doc || t.alias || t.members.map(m => m.name).join(', ')) });
    }
    return out;
}
