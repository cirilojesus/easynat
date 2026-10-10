import type { Metadata } from 'next';
import { H2 } from '@/components/H2';
import { CodeBlock } from '@/components/CodeBlock';
import { FunctionDoc } from '@/components/FunctionDoc';
import { getFunction } from '@/lib/api';
import { Shots } from '@/components/Shot';

export const metadata: Metadata = {
    title: 'Tema, modo oscuro y variantes',
    description: 'Colores, modo oscuro, sombras, fuentes, props por defecto y variantes de cada componente en easynat.',
    alternates: { canonical: '/docs/tema/' },
};

export default function ThemeGuide() {
    // Los colores salen del código (api.json): 'nombre': "#hex"
    const parse = (v = '') => [...v.matchAll(/'([a-z]+(?:\.[a-z0-9]+)?)':\s*["']([^"']+)["']/g)].map(m => [m[1], m[2]] as [string, string]);
    const colors = parse(getFunction('COLORS_THEME')?.value);
    const dark = new Map(parse(getFunction('DARK_COLORS')?.value));
    const SEMANTIC = ['background', 'surface', 'surface.50', 'border', 'text', 'text.muted', 'text.subtle', 'contrast'];
    return (
        <article className="space-y-10">
            <header className="space-y-3">
                <h1 className="text-3xl font-bold tracking-tight">Tema y variantes</h1>
                <p className="max-w-3xl text-muted">
                    El tema tiene colores, sombras, fuentes y, para cada componente, sus props por defecto y sus variantes.
                    Lo que pases al ThemeProvider se fusiona con el de la librería: solo hace falta poner lo que cambia.
                </p>
            </header>

            <section className="space-y-3">
                <H2>Orden en que se aplican las props</H2>
                <ol className="flex flex-wrap items-center gap-2 text-sm">
                    {['Defaults del componente', 'theme.components.X', 'Variante(s)', 'Tamaño (size)', 'Tus props', '_ios / _android'].map((s, i, a) => (
                        <li key={s} className="flex items-center gap-2"><span className="rounded-lg border border-border bg-surface px-2.5 py-1">{s}</span>{i < a.length - 1 && <span className="text-muted">→</span>}</li>
                    ))}
                </ol>
                <p className="text-sm text-muted">Las props que empiezan por _ (_text, _pressed, _icon…) se fusionan en vez de reemplazarse.</p>
            </section>

            <section className="space-y-3">
                <H2>Varias variantes a la vez</H2>
                <p className="max-w-3xl text-sm text-muted">
                    <code>variant</code> acepta varios nombres separados por espacios. Sirve sobre todo para combinar una variante de aspecto
                    con una de disposición sin crear una nueva para cada combinación. Funciona en todos los componentes (y en los tuyos con useThemeProps).
                </p>
                <CodeBlock code={`<Box variant="card row_between">…</Box>        // tarjeta + fila con los extremos separados
<Text variant="small muted">Hace 5 min</Text>   // pequeño + gris
<Box variant="card_sm center">Vacío</Box>     // tarjeta pequeña + contenido centrado
<Button variant="outline pill">Comprar</Button> // 'pill' es tuya (del tema), 'outline' de la librería`} />
                <ul className="max-w-3xl list-disc space-y-1.5 pl-5 text-sm">
                    <li><b>En orden:</b> cada variante se aplica encima de la anterior; si dos tocan la misma prop, gana la última. Con <code>variant=&quot;card surface&quot;</code> el fondo lo pone <code>surface</code>.</li>
                    <li><b>Las props con _ se fusionan</b> (<code>_text</code>, <code>_pressed</code>, <code>_icon</code>…): una variante puede poner <code>_text: {'{'} fontSize {'}'}</code> y otra <code>_text: {'{'} color {'}'}</code> sin que se pierda nada.</li>
                    <li><b>Librería + tema:</b> cada nombre junta la variante de la librería y la de tu tema con el mismo nombre (la tuya encima), así que puedes ampliar una variante de la librería o mezclarlas con las tuyas.</li>
                    <li><b>Tus props siempre ganan:</b> <code>{'<Box variant="card" p={2}>'}</code> usa la tarjeta con otro padding.</li>
                    <li>Un nombre que no existe se ignora (sin error).</li>
                </ul>
                <CodeBlock title="Ampliar una variante de la librería" code={`const theme = {
    light: {
        components: {
            Box: { variants: { card: { rounded: 6 } } },    // card de la librería + rounded 6
            Button: { variants: { pill: { rounded: 40, px: 5 } } },
        },
    },
};`} />
            </section>

            <section className="space-y-3">
                <H2>Personalizar</H2>
                <p className="max-w-3xl text-sm text-muted">
                    El tema tiene dos modos: <code>light</code> y <code>dark</code>. Lo que pones en <code>light</code> (colores de marca, fuentes,
                    components) vale también para el oscuro; en <code>dark</code> solo va lo que cambia en oscuro. Más abajo, <a href="#modo-oscuro" className="text-brand underline">todo sobre el modo oscuro</a>.
                </p>
                <CodeBlock code={`const theme = {
    light: {
        colors: { 'primary.100': '#0EA5E9', 'primary.200': '#0284C7', 'primary.50': '#0EA5E933' },
        fontFamily: 'Inter',                       // usa Inter_400, Inter_600, Inter_700…
        components: {
            Button: { rounded: 2, variants: { pill: { rounded: 40, px: 5 } } },
            Input: { variant: 'filled' },          // variante por defecto
            Text: { variants: { precio: { fontSize: 22, fontWeight: '700', color: 'success.200' } } },
        },
    },
    // Opcional: la librería ya trae los colores oscuros (background, surface, border, text, grises…)
    dark: {
        colors: {
            'background': '#0B1120',               // fondo de la app en oscuro
            'surface': '#111827',                  // tarjetas, modales, menús
            'primary.100': '#38BDF8',              // un primary más claro, solo en oscuro
        },
        components: {
            Box: { variants: { card: { shadow: 0 } } },   // components solo para oscuro
        },
    },
};

// defaultMode: 'light' (por defecto), 'dark' o 'system' (sigue al móvil)
<ThemeProvider theme={theme} defaultMode="system">…</ThemeProvider>

// Cambiar de modo desde la app (se recuerda)
const { mode, setMode, toggleTheme } = useTheme();

<Button variant="pill">Comprar</Button>
<Text variant="precio">49,90 €</Text>
<Box variant="card row_between">…</Box>   // varias variantes a la vez`} />
            </section>

            <section className="space-y-4">
                <H2>Modo oscuro</H2>
                <p className="max-w-3xl text-muted">
                    La librería trae los dos modos listos. Los componentes usan colores <b>semánticos</b> (background, surface, border,
                    text…) que cambian con el modo, y la escala de grises se invierte: <code>light</code> sigue siendo el gris suave de
                    fondos y bordes y <code>dark</code> el texto fuerte, así que <code>bg=&quot;light.100&quot;</code> o <code>color=&quot;gray&quot;</code> se
                    ven bien en los dos. Los colores de marca (primary, success, danger…) son los mismos.
                </p>
                <CodeBlock title="Elegir el modo" code={`// Empieza en claro, oscuro o el del móvil ('system' lo sigue en vivo)
<ThemeProvider defaultMode="system">…</ThemeProvider>

// Cambiarlo desde la app (se recuerda para la próxima vez)
const { mode, setting, setMode, toggleTheme } = useTheme();

<Switch label="Modo oscuro" value={mode === 'dark'} onValueChange={toggleTheme} />
<Button variant="ghost" onPress={() => setMode('system')}>Usar el del sistema</Button>`} />
                <CodeBlock title="Tus colores en oscuro" code={`const theme = {
    light: {
        colors: { 'primary.100': '#0EA5E9' },   // tu marca: pasa también al oscuro
        components: { Button: { rounded: 2 } }, // fuentes y components también se heredan
    },
    dark: {
        colors: {
            'background': '#000000',            // solo lo que quieras distinto en oscuro
            'surface': '#111111',
            'primary.100': '#38BDF8',           // un primary más claro solo en oscuro
        },
    },
};`} />
                <CodeBlock title="En tus componentes" code={`// Usa los semánticos y tu pantalla cambia sola con el modo
<Box flex={1} bg="background">
    <Box variant="card">                     {/* card ya usa surface y border */}
        <Text>Sin color: usa "text"</Text>
        <Text color="text.muted">Secundario</Text>
    </Box>
</Box>

// Para lo que no es de la librería (iconos, StatusBar, navegación…)
const { theme, mode } = useTheme();
<StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} />
<Icon color={theme.colors['text.muted']} … />`} />
                <Shots names={['dark-buttons', 'dark-box', 'dark-forms', 'dark-charts', 'dark-table', 'dark-modal']} alt="Componentes de easynat en modo oscuro" />
                <div className="overflow-x-auto rounded-xl border border-border">
                    <table className="w-full min-w-[520px] text-sm">
                        <thead className="bg-surface text-left text-xs uppercase text-muted">
                            <tr><th className="px-3 py-2">Color</th><th className="px-3 py-2">Claro</th><th className="px-3 py-2">Oscuro</th><th className="px-3 py-2">Para qué</th></tr>
                        </thead>
                        <tbody>
                            {SEMANTIC.map(k => {
                                const light = colors.find(c => c[0] === k)?.[1];
                                const use: Record<string, string> = {
                                    background: 'Fondo de la app y de las pantallas (Box variant="screen")',
                                    surface: 'Tarjetas, modales, menús, spinner',
                                    'surface.50': 'Superficie suave (Box variant="surface")',
                                    border: 'Bordes de tarjetas, menús y separadores',
                                    text: 'Texto por defecto (Text e Input sin color)',
                                    'text.muted': 'Texto secundario',
                                    'text.subtle': 'Placeholders y texto apagado',
                                    contrast: 'Texto encima de un color (botones solid)',
                                };
                                return (
                                    <tr key={k} className="border-t border-border">
                                        <td className="px-3 py-2 font-mono font-semibold">{k}</td>
                                        {[light, dark.get(k)].map((hex, i) => (
                                            <td key={i} className="px-3 py-2"><span className="flex items-center gap-2 font-mono text-xs"><span className="h-5 w-5 rounded border border-border" style={{ background: hex }} />{hex}</span></td>
                                        ))}
                                        <td className="px-3 py-2 text-muted">{use[k]}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </section>

            {colors.length > 0 && (
                <section className="space-y-3">
                    <H2>Colores por defecto</H2>
                    <p className="text-sm text-muted">Cada color tiene .50 (suave), .100 (normal) y .200 (oscuro). Se usan por nombre: bg=&quot;primary.100&quot;. A la derecha, su valor en modo oscuro si cambia.</p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                        {colors.map(([name, hex]) => (
                            <div key={name} className="flex items-center gap-2 rounded-lg border border-border p-2 text-xs">
                                <span className="h-7 w-7 shrink-0 rounded-md border border-border" style={{ background: hex }} />
                                <span className="min-w-0 flex-1"><b className="block font-mono">{name}</b><span className="font-mono text-muted">{hex}</span></span>
                                {dark.get(name) && dark.get(name) !== hex && <span title={`Oscuro: ${dark.get(name)}`} className="h-7 w-7 shrink-0 rounded-md border border-border" style={{ background: dark.get(name) }} />}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <section className="space-y-4">
                <H2>Para tus componentes</H2>
                <p className="text-muted">useThemeProps hace por tu componente lo mismo que por los de la librería: defaults, tema, variantes, tamaño y plataforma.</p>
                <CodeBlock code={`const [props, theme] = useThemeProps('MiTarjeta', rawProps, {
    defaults: { p: 4 },
    variants: { destacada: { bg: 'primary.50' } },
});`} />
                <FunctionDoc name="useThemeProps" />
                <FunctionDoc name="mergeProps" />
                <FunctionDoc name="useTheme" />
                <FunctionDoc name="mergeTheme" />
            </section>
        </article>
    );
}
