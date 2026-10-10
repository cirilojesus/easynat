import type { Metadata } from 'next';
import { FunctionDoc } from '@/components/FunctionDoc';
import { allFunctions, FUNCTION_GROUPS } from '@/lib/api';

export const metadata: Metadata = {
    title: 'Funciones y hooks',
    description: 'Todas las funciones, hooks y constantes de easynat: avisos, modales, spinners, tema, idiomas, formularios, fechas, listas, HTML, teclado y multimedia.',
    alternates: { canonical: '/docs/api/' },
};

// Componentes que el generador ve como funciones (se documentan en su página)
const SKIP = new Set(['Icon', 'DatePicker', 'ListenerForm', 'touchHandlers', 'defaultTheme', 'theme', 'subscribe', 'renderChild', 'calcSize',
    // Los textos internos de la librería: para la app se usa t()
    'libT']);

export default function ApiPage() {
    const fns = allFunctions().filter(f => !SKIP.has(f.name));
    const used = new Set<string>();
    const groups = FUNCTION_GROUPS.map(g => {
        const items = fns.filter(f => g.modules.includes(f.module) && !used.has(f.name));
        items.forEach(f => used.add(f.name));
        return { ...g, items };
    }).filter(g => g.items.length);
    const rest = fns.filter(f => !used.has(f.name));
    return (
        <article className="space-y-12">
            <header className="space-y-3">
                <h1 className="text-3xl font-bold tracking-tight">Funciones y hooks</h1>
                <p className="max-w-3xl text-muted">Todo lo que exporta la librería además de los componentes ({fns.length}), con su firma y su documentación, sacadas del código.</p>
                <div className="flex flex-wrap gap-2 text-sm">
                    {groups.map(g => <a key={g.title} href={`#${encodeURIComponent(g.title)}`} className="rounded-full border border-border px-3 py-1 hover:border-brand">{g.title}</a>)}
                </div>
            </header>
            {[...groups, ...(rest.length ? [{ title: 'Otras', description: '', items: rest, modules: [] }] : [])].map(g => (
                <section key={g.title} id={encodeURIComponent(g.title)} className="space-y-4">
                    <div>
                        <h2 className="text-2xl font-semibold">{g.title}</h2>
                        {g.description && <p className="text-sm text-muted">{g.description}</p>}
                    </div>
                    {g.items.map(f => <FunctionDoc key={f.name} name={f.name} />)}
                </section>
            ))}
        </article>
    );
}
