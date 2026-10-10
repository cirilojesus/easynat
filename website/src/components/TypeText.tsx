import { getType } from '@/lib/api';

/** El texto de un tipo con los nombres de los tipos de la librería como enlaces (a su sección en la página o a /docs/tipos) */
export function TypeText({ text, local, className = '' }: { text: string; local?: Set<string>; className?: string }) {
    const parts: React.ReactNode[] = [];
    let last = 0;
    for (const m of text.matchAll(/[A-Za-z_][A-Za-z0-9_]*/g)) {
        const name = m[0], i = m.index ?? 0;
        if (!getType(name)) continue;
        if (i > last) parts.push(text.slice(last, i));
        const href = local?.has(name) ? `#tipo-${name}` : `/docs/tipos/#tipo-${name}`;
        parts.push(<a key={i} href={href} className="underline decoration-brand/40 underline-offset-2 hover:decoration-brand">{name}</a>);
        last = i + name.length;
    }
    if (last < text.length) parts.push(text.slice(last));
    return <code className={`type-text break-words ${className}`}>{parts}</code>;
}
