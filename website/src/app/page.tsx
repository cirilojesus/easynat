import type { Metadata } from 'next';
import Link from 'next/link';
import { CodeBlock } from '@/components/CodeBlock';
import { ComponentGrid } from '@/components/ComponentGrid';
import { Shots } from '@/components/Shot';
import { COMPONENTS } from '@/content';
import { allFunctions } from '@/lib/api';

export const metadata: Metadata = { alternates: { canonical: '/' } };

const HIGHLIGHTS = [
    { t: 'Gráficos', d: 'Líneas, áreas, barras, tartas, anillos y progreso en un solo componente, con tooltip, zoom y animación.', href: '/docs/componentes/chart', shot: 'charts-1' },
    { t: 'Formularios con validación', d: '20 reglas, errores del servidor, campos dinámicos y hooks para no re-renderizar todo.', href: '/docs/componentes/form', shot: 'form' },
    { t: 'Tablas', d: 'Orden, selección, filas desplegables, paginación, totales, grupos y colspan; con datos de tu API.', href: '/docs/componentes/table', shot: 'table' },
    { t: 'Editor de fotos', d: 'Dibujo, textos, stickers, filtros, ajustes, recorte y privacidad, exportando a la resolución original.', href: '/docs/componentes/image-editor', shot: 'image-editor-1' },
    { t: 'Editor de texto', d: 'Formatos, colores, tablas, imágenes, menciones con @ y comandos propios.', href: '/docs/componentes/rich-text-editor', shot: 'rich-text' },
    { t: 'Visor de PDF', d: 'Zoom nítido, búsqueda, enlaces, contraseña y texto que se puede seleccionar y copiar.', href: '/docs/componentes/pdf-viewer', shot: 'pdf' },
];

const COMPARE: [string, boolean][] = [
    ['Props de estilo (p, bg, rounded…) y tema', true],
    ['Variantes combinables desde el tema', true],
    ['Modales, avisos y spinners desde cualquier parte', true],
    ['Formularios con validación', true],
    ['DatePicker (fechas, rangos, horas…)', true],
    ['Tabla con orden, selección y paginación', true],
    ['Listas infinitas con caché', true],
    ['Gráficos', true],
    ['Editor de texto enriquecido', true],
    ['Editor y visor de imágenes', true],
    ['Visor de PDF', true],
    ['Botones de mantener y deslizar', true],
];

export default function Home() {
    const nFunctions = allFunctions().length;
    return (
        <div>
            {/* Portada */}
            <section className="relative overflow-hidden border-b border-border">
                <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(79,70,229,0.18),transparent_60%)]" />
                <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 lg:grid-cols-[1.1fr_1fr]">
                    <div className="min-w-0 space-y-6">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/logo/icon.png" alt="" width={150} height={56} className="h-14 w-auto" />
                        <p className="inline-flex rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted">React Native · Expo · TypeScript</p>
                        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
                            Componentes para React Native que <span className="bg-gradient-to-r from-brand to-brand-2 bg-clip-text text-transparent">ya hacen lo difícil</span>
                        </h1>
                        <p className="max-w-xl text-lg text-muted">
                            {COMPONENTS.length} componentes con el mismo estilo de props: desde botones y formularios con validación
                            hasta gráficos, tablas, un editor de fotos y un visor de PDF. Con tema, variantes y {nFunctions} funciones y hooks.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <Link href="/docs" className="rounded-xl bg-brand px-5 py-3 font-medium text-white shadow-lg shadow-brand/25 hover:opacity-90">Empezar</Link>
                            <Link href="/docs/componentes" className="rounded-xl border border-border px-5 py-3 font-medium hover:border-brand">Ver componentes</Link>
                        </div>
                        <CodeBlock lang="bash" title="Instalar" code="npx expo install easynat" />
                    </div>
                    <div className="flex min-w-0 justify-center"><Shots names={['image-editor-1', 'charts-1']} alt="easynat en un móvil" /></div>
                </div>
            </section>

            {/* Lo que la diferencia */}
            <section className="mx-auto max-w-7xl space-y-10 px-4 py-20">
                <div className="max-w-2xl space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">Lo que normalmente tendrías que buscar en otras librerías</h2>
                    <p className="text-muted">Viene incluido y con el mismo estilo que el resto: mismas props, mismo tema, mismos colores.</p>
                </div>
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {HIGHLIGHTS.map(h => (
                        <Link key={h.t} href={h.href} className="group space-y-3 rounded-2xl border border-border p-5 transition hover:border-brand/50 hover:shadow-xl hover:shadow-brand/5">
                            <h3 className="text-lg font-semibold group-hover:text-brand">{h.t}</h3>
                            <p className="text-sm text-muted">{h.d}</p>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Código */}
            <section className="border-y border-border bg-surface/50">
                <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-20 lg:grid-cols-2">
                    <div className="min-w-0 space-y-4">
                        <h2 className="text-3xl font-bold tracking-tight">Escribes menos</h2>
                        <ul className="space-y-3 text-muted">
                            <li><b className="text-foreground">Props cortas</b> en todos los componentes: p, bg, rounded, gap, shadow…</li>
                            <li><b className="text-foreground">Variantes</b> que se combinan: variant=&quot;card row_between&quot;.</li>
                            <li><b className="text-foreground">Funciones globales</b>: showAlert, openModal o showSpinner desde cualquier archivo.</li>
                            <li><b className="text-foreground">Async por defecto</b>: si onPress devuelve una promesa, el botón muestra el spinner solo.</li>
                        </ul>
                    </div>
                    <CodeBlock title="Pedido.tsx" code={`<Box variant="card" gap={3}>
    <Box variant="row_between">
        <Text variant="title">Pedido #1024</Text>
        <Box variant="badge_sm" bg="success.100">Pagado</Box>
    </Box>
    <Chart type="sparkline" data={ventas} height={40} />
    <Button onPress={() => api.enviar(id)}
        feedback={{ children: '¡Enviado!', colorScheme: 'success' }}>
        Enviar factura
    </Button>
</Box>

const ok = await openModal<null, boolean>({ … }).result;
await withSpinner(api.guardar(datos), 'Guardando…');
showAlert('Guardado', 'success');`} />
                </div>
            </section>

            {/* Incluido */}
            <section className="mx-auto max-w-4xl space-y-6 px-4 py-20">
                <h2 className="text-center text-3xl font-bold tracking-tight">Todo incluido</h2>
                <div className="overflow-hidden rounded-2xl border border-border">
                    {COMPARE.map(([f]) => (
                        <div key={f} className="flex items-center justify-between border-t border-border px-4 py-3 text-sm first:border-t-0">
                            <span>{f}</span><span className="font-semibold text-brand">✓</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Todos */}
            <section className="mx-auto max-w-7xl space-y-8 px-4 pb-24">
                <h2 className="text-3xl font-bold tracking-tight">Todos los componentes</h2>
                <ComponentGrid />
            </section>
        </div>
    );
}
