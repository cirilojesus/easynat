import type { Metadata } from 'next';
import { PropsTable } from '@/components/PropsTable';
import { allTypes } from '@/lib/api';

export const metadata: Metadata = {
    title: 'Tipos',
    description: 'Todos los tipos de TypeScript de easynat (props, refs, opciones y uniones), sacados del código.',
    alternates: { canonical: '/docs/tipos/' },
};

export default function TypesPage() {
    const types = allTypes().sort((a, b) => a.module.localeCompare(b.module) || a.name.localeCompare(b.name));
    const local = new Set(types.map(t => t.name));
    const groups = [...new Set(types.map(t => t.module))].map(m => ({ module: m, items: types.filter(t => t.module === m) }));
    return (
        <article className="space-y-12">
            <header className="space-y-3">
                <h1 className="text-3xl font-bold tracking-tight">Tipos</h1>
                <p className="max-w-3xl text-muted">Los {types.length} tipos que exporta la librería, por archivo. Toca un nombre subrayado para ir a su definición.</p>
                <div className="flex flex-wrap gap-1.5 text-xs">
                    {types.map(t => <a key={t.name} href={`#tipo-${t.name}`} className="rounded-md border border-border px-2 py-0.5 font-mono hover:border-brand">{t.name}</a>)}
                </div>
            </header>
            {groups.map(g => (
                <section key={g.module} className="space-y-8">
                    <h2 className="border-b border-border pb-2 font-mono text-lg font-semibold">{g.module}</h2>
                    {g.items.map(t => <PropsTable key={t.name} name={t.name} local={local} />)}
                </section>
            ))}
        </article>
    );
}
