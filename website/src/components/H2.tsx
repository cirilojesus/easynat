import { slugify } from '@/lib/slug';

/** Título de sección de las guías, con ancla (el buscador enlaza a ella) */
export function H2({ children }: { children: string }) {
    return <h2 id={slugify(children)} className="scroll-mt-20 text-xl font-semibold">{children}</h2>;
}
