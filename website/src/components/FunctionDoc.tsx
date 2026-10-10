import { getFunction } from '@/lib/api';
import { CodeBlock } from './CodeBlock';
import { TypeText } from './TypeText';

/** Una función, hook o constante de la librería con su firma y su documentación (del código) */
export async function FunctionDoc({ name, local }: { name: string; local?: Set<string> }) {
    const f = getFunction(name);
    if (!f) return null;
    const kind = f.kind === 'const' ? 'constante' : f.kind === 'class' ? 'clase' : /^use[A-Z]/.test(name) ? 'hook' : 'función';
    return (
        <section id={`fn-${name}`} className="scroll-mt-20 space-y-2 rounded-xl border border-border p-4">
            <div className="flex items-center gap-2">
                <h3 className="font-mono text-base font-semibold">{name}</h3>
                <span className="rounded-full bg-surface px-2 py-0.5 text-xs text-muted">{kind}</span>
            </div>
            {f.signatures.map((s, i) => <pre key={i} className="overflow-x-auto rounded-lg bg-surface p-2.5 whitespace-pre-wrap"><TypeText text={s} local={local} className="text-brand" /></pre>)}
            {f.value && <pre className="type-text overflow-x-auto rounded-lg bg-surface p-2.5 whitespace-pre-wrap">{`${name} = ${f.value}`}</pre>}
            {f.doc && <p className="text-sm text-muted whitespace-pre-line">{f.doc}</p>}
            {f.examples.length > 0 && <CodeBlock code={f.examples.join('\n')} title="Ejemplo" />}
        </section>
    );
}
