import { getType } from '@/lib/api';
import { COMMON_PROPS } from '@/lib/common-props';
import { TypeText } from './TypeText';

/** Las props (o miembros) de un tipo de la librería, leídas del código */
export function PropsTable({ name, local }: { name: string; local?: Set<string> }) {
    const t = getType(name);
    if (!t) return null;
    const members = t.members.filter(m => !/^_(ios|android|web)$/.test(m.name));
    return (
        <section id={`tipo-${name}`} className="scroll-mt-20 space-y-3">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h3 className="font-mono text-base font-semibold">{name}{t.typeParams.length ? `<${t.typeParams.join(', ')}>` : ''}</h3>
                {t.extends.length > 0 && <span className="text-sm text-muted">además de {t.extends.map((e, i) => <TypeText key={i} text={e} local={local} className="mx-0.5 rounded bg-surface px-1" />)}</span>}
            </div>
            {t.doc && <p className="text-sm text-muted">{t.doc}</p>}
            {t.alias && t.alias !== 'class' && !members.length && (
                <pre className="overflow-x-auto rounded-lg border border-border bg-surface p-3 whitespace-pre-wrap"><TypeText text={t.alias} local={local} className="text-brand" /></pre>
            )}
            {members.length > 0 && (
                <div className="overflow-x-auto rounded-xl border border-border">
                    <table className="w-full min-w-[560px] text-left text-sm">
                        <thead className="bg-surface text-xs uppercase tracking-wide text-muted">
                            <tr><th className="px-3 py-2 font-medium">Prop</th><th className="px-3 py-2 font-medium">Tipo</th><th className="px-3 py-2 font-medium">Descripción</th></tr>
                        </thead>
                        <tbody>
                            {members.map(m => (
                                <tr key={m.name} className="border-t border-border align-top">
                                    <td className="px-3 py-2 font-mono text-[0.8rem] font-semibold whitespace-nowrap">
                                        {m.name}{m.optional ? <span className="text-muted">?</span> : <span className="text-brand-2"> *</span>}
                                    </td>
                                    <td className="px-3 py-2"><TypeText text={m.type} local={local} className="text-brand" /></td>
                                    <td className="px-3 py-2 text-muted whitespace-pre-line">{m.doc || COMMON_PROPS[m.name] || '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}
