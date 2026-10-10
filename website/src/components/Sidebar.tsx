'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export type NavGroup = { title: string; items: { title: string; href: string }[] };

const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function Sidebar({ groups }: { groups: NavGroup[] }) {
    // Con trailingSlash las rutas acaban en /: se comparan sin ella
    const strip = (p: string) => (p.length > 1 ? p.replace(/\/$/, '') : p);
    const path = strip(usePathname() ?? '');
    const [q, setQ] = useState('');
    const [open, setOpen] = useState(false);
    const shown = groups
        .map(g => ({ ...g, items: q ? g.items.filter(i => fold(i.title).includes(fold(q))) : g.items }))
        .filter(g => g.items.length);
    const nav = (
        <nav className="space-y-6 text-sm">
            <input
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Buscar componente…"
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-brand"
            />
            {shown.map(g => (
                <div key={g.title}>
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted">{g.title}</p>
                    <ul className="space-y-0.5">
                        {g.items.map(i => {
                            const active = path === strip(i.href);
                            return (
                                <li key={i.href}>
                                    <Link href={i.href} onClick={() => setOpen(false)}
                                        className={`block rounded-md px-2 py-1 ${active ? 'bg-brand/10 font-medium text-brand' : 'text-foreground/80 hover:bg-surface hover:text-foreground'}`}>
                                        {i.title}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            ))}
            {!shown.length && <p className="text-muted">Sin resultados</p>}
        </nav>
    );
    return (
        <>
            <button type="button" onClick={() => setOpen(o => !o)} className="mb-4 rounded-lg border border-border px-3 py-1.5 text-sm lg:hidden">
                {open ? 'Cerrar menú' : 'Menú de la documentación'}
            </button>
            {open && <div className="mb-8 lg:hidden">{nav}</div>}
            <aside className="sticky top-20 hidden max-h-[calc(100vh-6rem)] w-60 shrink-0 overflow-y-auto pr-2 pb-10 lg:block">{nav}</aside>
        </>
    );
}
