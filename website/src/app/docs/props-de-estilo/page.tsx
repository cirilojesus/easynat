import type { Metadata } from 'next';
import { H2 } from '@/components/H2';
import { CodeBlock } from '@/components/CodeBlock';
import { PropsTable } from '@/components/PropsTable';

export const metadata: Metadata = {
    title: 'Props de estilo',
    description: 'Las props de estilo de easynat (p, m, bg, rounded, w, h…), la escala ×4 y los colores del tema.',
    alternates: { canonical: '/docs/props-de-estilo/' },
};

const GROUPS: [string, string][] = [
    ['Espaciado', 'p · px · py · pt · pb · pl · pr · m · mx · my · mt · mb · ml · mr · gap'],
    ['Color', 'bg · color · borderColor · borderTopColor … borderXColor · borderYColor'],
    ['Bordes', 'rounded · roundedTop · roundedBottom · roundedLeft · roundedRight · borderWidth · borderXWidth · borderYWidth…'],
    ['Tamaño', 'w · h · minW · minH · maxW · maxH'],
    ['Flex', 'flexDir · flex · alignItems · justifyContent · flexWrap · alignSelf…'],
    ['Otros', 'shadow (1 a 6) · opacity · position · top · left · zIndex · overflow…'],
    ['Por estado', '_text · _pressed · _focus · _active (según el componente)'],
    ['Por plataforma', '_ios · _android · _web'],
];

export default function StyleProps() {
    return (
        <article className="space-y-8">
            <header className="space-y-3">
                <h1 className="text-3xl font-bold tracking-tight">Props de estilo</h1>
                <p className="max-w-3xl text-muted">Todos los componentes aceptan estas props además de style. Se calculan con el tema, así que los colores van por nombre.</p>
            </header>
            <section className="space-y-3">
                <H2>La escala ×4</H2>
                <p className="text-muted">En espaciado, bordes redondeados, tamaños y gap, los números <b>0.5, 1, 1.5 … 6</b> se multiplican por 4. El resto (7, 10, 40, negativos, porcentajes) va tal cual en px.</p>
                <div className="flex flex-wrap gap-2 text-sm">
                    {[0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 16, 40].map(n => (
                        <span key={n} className="rounded-lg border border-border px-2.5 py-1 font-mono">{n} → {[0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6].includes(n) ? n * 4 : n} px</span>
                    ))}
                </div>
                <CodeBlock code={`<Box p={3} mt={6} rounded={2} gap={1.5} />   // 12 px, 24 px, 8 px, 6 px
<Box p={10} rounded={40} mx={-6} />           // 10 px, 40 px, -6 px
<Box w="50%" h={120} bg="primary.100" borderColor="#00000020" />`} />
            </section>
            <section className="space-y-3">
                <H2>Todas las props</H2>
                <div className="overflow-hidden rounded-xl border border-border text-sm">
                    {GROUPS.map(([g, p]) => (
                        <div key={g} className="grid gap-1 border-t border-border p-3 first:border-t-0 sm:grid-cols-[10rem_1fr]">
                            <b>{g}</b><code className="font-mono text-muted">{p}</code>
                        </div>
                    ))}
                </div>
            </section>
            <section className="space-y-3">
                <H2>Por plataforma y estado</H2>
                <CodeBlock code={`<Box p={4} _ios={{ shadow: 2 }} _android={{ borderWidth: 1 }} />
<Pressable bg="white" _pressed={{ bg: 'light.50' }} _text={{ color: 'gray' }}>Texto</Pressable>`} />
            </section>
            <PropsTable name="EABoxProps" />
        </article>
    );
}
