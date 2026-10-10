import fs from 'node:fs';
import path from 'node:path';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { COMPONENTS } from '@/content';

export const metadata: Metadata = {
    title: 'Galería',
    description: 'Capturas reales de los componentes de easynat funcionando en un móvil Android.',
    alternates: { canonical: '/galeria/' },
};

export default function Gallery() {
    // Cada captura, con el primer componente que la usa
    const seen = new Set<string>();
    const shots = COMPONENTS.flatMap(c => (c.shots ?? []).map(s => ({ s, c })))
        .filter(({ s }) => !seen.has(s) && seen.add(s) && fs.existsSync(path.join(process.cwd(), 'public', 'shots', `${s}.png`)));
    return (
        <div className="mx-auto max-w-7xl space-y-8 px-4 py-12">
            <header className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Galería</h1>
                <p className="text-muted">Capturas reales de la app de ejemplo en Android. Toca una para ver el componente.</p>
            </header>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
                {shots.map(({ s, c }) => (
                    <Link key={s} href={`/docs/componentes/${c.slug}`} className="group space-y-2">
                        <div className="overflow-hidden rounded-[1.4rem] border-[5px] border-zinc-900 bg-zinc-900 shadow-lg transition group-hover:-translate-y-1 dark:border-zinc-700">
                            <Image src={`/shots/${s}.png`} alt={c.name} width={270} height={585} className="h-auto w-full" />
                        </div>
                        <p className="text-center text-sm font-medium group-hover:text-brand">{c.name}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
}
