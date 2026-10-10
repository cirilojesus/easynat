import type { Metadata } from 'next';
import { H2 } from '@/components/H2';
import Link from 'next/link';
import { CodeBlock } from '@/components/CodeBlock';
import { COMPONENTS } from '@/content';

export const metadata: Metadata = {
    title: 'Introducción',
    description: 'Qué es easynat, cómo se usa y qué trae: componentes para React Native con props de estilo, tema, variantes y TypeScript.',
    alternates: { canonical: '/docs/' },
};

const IDEAS = [
    { t: 'Props de estilo cortas', d: 'p, m, bg, rounded, w, h, flexDir, shadow… en cualquier componente, con los colores del tema por nombre.', href: '/docs/props-de-estilo' },
    { t: 'Tema y variantes', d: 'Props por defecto y variantes de cada componente desde el tema; varias variantes a la vez con espacios.', href: '/docs/tema' },
    { t: 'Funciones globales', d: 'showAlert, openModal, showSpinner… desde cualquier parte, sin montar nada.', href: '/docs/api' },
    { t: 'Idiomas', d: 'Traducciones de tu app y de los textos de la librería, con cambio de idioma en caliente.', href: '/docs/idiomas' },
];

export default function DocsIntro() {
    return (
        <article className="space-y-10">
            <header className="space-y-3">
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Introducción</h1>
                <p className="max-w-3xl text-lg text-muted">
                    easynat es una librería de componentes para React Native y Expo. Trae {COMPONENTS.length} páginas de componentes,
                    desde una caja con estilo hasta gráficos, tablas, formularios con validación, un editor de texto, un editor de fotos y un visor de PDF,
                    con el mismo estilo de props en todos y tipos de TypeScript con autocompletado.
                </p>
            </header>

            <section className="space-y-3">
                <H2>Un vistazo</H2>
                <CodeBlock title="App.tsx" code={`import { ThemeProvider, Box, Text, Button, showAlert } from 'easynat';

export default function App() {
    return (
        <ThemeProvider>
            <Box flex={1} safeArea p={4} gap={3}>
                <Text variant="h3">Hola 👋</Text>
                <Box variant="card row_between">
                    <Text>Pedido #1024</Text>
                    <Box variant="badge_sm" bg="success.100">Pagado</Box>
                </Box>
                <Button onPress={() => showAlert('¡Listo!', 'success')}>Guardar</Button>
            </Box>
        </ThemeProvider>
    );
}`} />
            </section>

            <section className="grid gap-3 sm:grid-cols-2">
                {IDEAS.map(i => (
                    <Link key={i.t} href={i.href} className="rounded-xl border border-border p-4 hover:border-brand/50">
                        <h3 className="font-semibold">{i.t}</h3>
                        <p className="mt-1 text-sm text-muted">{i.d}</p>
                    </Link>
                ))}
            </section>

            <section className="space-y-2">
                <H2>Siguiente paso</H2>
                <p className="text-muted">
                    <Link href="/docs/instalacion" className="text-brand underline">Instálala</Link> y mira
                    los <Link href="/docs/componentes" className="text-brand underline">componentes</Link>.
                </p>
            </section>
        </article>
    );
}
