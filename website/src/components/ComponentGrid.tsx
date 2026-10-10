import Link from 'next/link';
import { byCategory } from '@/content';

export function ComponentGrid() {
    return (
        <div className="space-y-12">
            {byCategory().map(cat => (
                <section key={cat.id} className="space-y-4">
                    <div>
                        <h2 className="text-xl font-semibold">{cat.id}</h2>
                        <p className="text-sm text-muted">{cat.description}</p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {cat.items.map(c => (
                            <Link key={c.slug} href={`/docs/componentes/${c.slug}`}
                                className="group rounded-xl border border-border p-4 transition hover:-translate-y-0.5 hover:border-brand/50 hover:shadow-lg hover:shadow-brand/5">
                                <div className="flex items-center justify-between gap-2">
                                    <h3 className="font-semibold group-hover:text-brand">{c.name}</h3>
                                    {c.requires && <span className="rounded-full bg-surface px-2 py-0.5 text-[0.65rem] text-muted">WebView</span>}
                                </div>
                                <p className="mt-1 text-sm text-muted">{c.summary}</p>
                            </Link>
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
}
