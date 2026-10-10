import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { CodeBlock } from '@/components/CodeBlock';
import { FunctionDoc } from '@/components/FunctionDoc';
import { PropsTable } from '@/components/PropsTable';
import { Shots } from '@/components/Shot';
import { COMPONENTS, componentBySlug } from '@/content';
import { getFunction, typesForPage } from '@/lib/api';
import { slugify } from '@/lib/slug';

export function generateStaticParams() {
    return COMPONENTS.map(c => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<'/docs/componentes/[slug]'>): Promise<Metadata> {
    const { slug } = await params;
    const c = componentBySlug(slug);
    if (!c) return {};
    return {
        title: `${c.name} — React Native`,
        description: c.summary,
        alternates: { canonical: `/docs/componentes/${c.slug}/` },
        openGraph: { title: `${c.name} · easynat`, description: c.summary },
    };
}

// Lo que lee params va dentro de <Suspense>. Las páginas se generan enteras al compilar (generateStaticParams)
export default function ComponentPage({ params }: PageProps<'/docs/componentes/[slug]'>) {
    return (
        <Suspense fallback={<DocSkeleton />}>
            <ComponentDetail params={params} />
        </Suspense>
    );
}

function DocSkeleton() {
    return (
        <div className="animate-pulse space-y-4" aria-hidden>
            <div className="h-4 w-24 rounded bg-surface" />
            <div className="h-9 w-56 rounded bg-surface" />
            <div className="h-20 max-w-3xl rounded bg-surface" />
            <div className="h-40 rounded-xl bg-surface" />
        </div>
    );
}

async function ComponentDetail({ params }: Pick<PageProps<'/docs/componentes/[slug]'>, 'params'>) {
    const { slug } = await params;
    const c = componentBySlug(slug);
    if (!c) notFound();
    const i = COMPONENTS.indexOf(c);
    const prev = COMPONENTS[i - 1], next = COMPONENTS[i + 1];
    const { own: types, extra } = typesForPage(c.types ?? []);
    // Los tipos que están en esta página: sus enlaces llevan a su sección (los demás, a /docs/tipos)
    const local = new Set([...types, ...extra]);
    const fns = (c.functions ?? []).filter(f => getFunction(f));

    return (
        <article className="space-y-12">
            <header className="space-y-3">
                <p className="text-sm font-medium text-brand">{c.category}</p>
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{c.name}</h1>
                <p className="max-w-3xl text-lg text-muted">{c.description}</p>
                {c.requires && (
                    <p className="inline-flex items-center gap-2 rounded-full border border-amber-300/60 bg-amber-50 px-3 py-1 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                        Necesita <code className="font-mono">{c.requires}</code> (dependencia opcional)
                    </p>
                )}
            </header>

            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto]">
                <div className="min-w-0 space-y-6">
                    <CodeBlock code={`import { ${c.imports.join(', ')} } from 'easynat';`} title="Importar" />
                    <section>
                        <h2 className="mb-3 text-xl font-semibold">Qué hace</h2>
                        <ul className="grid gap-2 sm:grid-cols-2">
                            {c.features.map(f => (
                                <li key={f} className="flex gap-2 rounded-lg border border-border bg-surface/60 p-3 text-sm">
                                    <span className="mt-0.5 text-brand">✓</span><span>{f}</span>
                                </li>
                            ))}
                        </ul>
                    </section>
                </div>
                <Shots names={c.shots} alt={`${c.name} en la app de ejemplo`} />
            </div>

            {c.variants && (
                <section id="variantes" className="scroll-mt-20 space-y-3">
                    <h2 className="text-xl font-semibold">Variantes</h2>
                    <p className="text-sm text-muted">Con <code className="font-mono">variant=&quot;…&quot;</code>. Se pueden combinar con espacios (<a href="/docs/tema/#varias-variantes-a-la-vez" className="text-brand underline">cómo</a>) y cambiar o ampliar desde el tema.</p>
                    <div className="overflow-hidden rounded-xl border border-border">
                        {c.variants.map(v => (
                            <div key={v.name} id={`variante-${slugify(v.name)}`} className="scroll-mt-20 grid gap-1 border-t border-border p-3 first:border-t-0 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
                                <code className="font-mono text-sm font-semibold text-brand">{v.name}</code>
                                <span className="text-sm text-muted">{v.description}</span>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <section id="ejemplos" className="scroll-mt-20 space-y-6">
                <h2 className="text-xl font-semibold">Ejemplos</h2>
                {c.examples.map(e => (
                    <div key={e.title} id={`ejemplo-${slugify(e.title)}`} className="scroll-mt-20 space-y-2">
                        <h3 className="font-semibold">{e.title}</h3>
                        {e.description && <p className="text-sm text-muted">{e.description}</p>}
                        <CodeBlock code={e.code} title={e.title} />
                    </div>
                ))}
            </section>

            {c.notes && (
                <section className="space-y-2">
                    <h2 className="text-xl font-semibold">A tener en cuenta</h2>
                    {c.notes.map(n => <p key={n} className="rounded-lg border-l-4 border-brand bg-surface p-3 text-sm">{n}</p>)}
                </section>
            )}

            {types.length > 0 && (
                <section id="props" className="scroll-mt-20 space-y-8">
                    <div>
                        <h2 className="text-xl font-semibold">Props</h2>
                        <p className="text-sm text-muted">Sacadas del código de la librería. <span className="text-brand-2">*</span> = obligatoria.</p>
                    </div>
                    {types.map(t => <PropsTable key={t} name={t} local={local} />)}
                </section>
            )}

            {extra.length > 0 && (
                <section id="tipos" className="scroll-mt-20 space-y-8">
                    <div>
                        <h2 className="text-xl font-semibold">Tipos</h2>
                        <p className="text-sm text-muted">Los que aparecen en las props de arriba. Toca un nombre subrayado para ir a su definición.</p>
                    </div>
                    {extra.map(t => <PropsTable key={t} name={t} local={local} />)}
                </section>
            )}

            {fns.length > 0 && (
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold">Funciones relacionadas</h2>
                    {fns.map(f => <FunctionDoc key={f} name={f} local={local} />)}
                </section>
            )}

            <nav className="flex justify-between gap-4 border-t border-border pt-6 text-sm">
                {prev ? <Link href={`/docs/componentes/${prev.slug}`} className="text-muted hover:text-foreground">← {prev.name}</Link> : <span />}
                {next ? <Link href={`/docs/componentes/${next.slug}`} className="text-muted hover:text-foreground">{next.name} →</Link> : <span />}
            </nav>
        </article>
    );
}
