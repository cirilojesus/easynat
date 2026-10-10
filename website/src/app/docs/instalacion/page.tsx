import type { Metadata } from 'next';
import { H2 } from '@/components/H2';
import { CodeBlock } from '@/components/CodeBlock';

export const metadata: Metadata = {
    title: 'Instalación',
    description: 'Cómo instalar easynat en un proyecto de React Native o Expo y sus dependencias.',
    alternates: { canonical: '/docs/instalacion/' },
};

const PEERS = [
    ['react-native-reanimated', 'Animaciones (Stagger, Chart, Button…)'],
    ['react-native-worklets', 'Lo necesita Reanimated 4 (con Reanimated 3 no hace falta)'],
    ['react-native-svg', 'Gráficos, degradados e iconos de check'],
    ['react-native-safe-area-context', 'Área segura (safeArea)'],
    ['react-native-root-siblings', 'La capa de modales, avisos y spinners'],
    ['@react-native-async-storage/async-storage', 'Recordar tema, idioma y la caché de listas'],
    ['@expo/vector-icons', 'Iconos'],
];

export default function Install() {
    return (
        <article className="space-y-8">
            <header className="space-y-3">
                <h1 className="text-3xl font-bold tracking-tight">Instalación</h1>
                <p className="text-muted">Versión actual: <b>1.0.0</b>. Funciona con Expo (SDK 49 o superior) y con React Native sin Expo.</p>
                <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
                    <li>React 18.2+, React Native 0.72+ y Reanimated 3.3+.</li>
                    <li>Probada con Expo SDK 57, React Native 0.86, React 19 y Reanimated 4.5, en Android e iOS.</li>
                    <li>Escrita en TypeScript: los tipos vienen incluidos (también con <code>strict</code>).</li>
                </ul>
            </header>
            <section className="space-y-3">
                <H2>1. La librería y sus dependencias</H2>
                <CodeBlock lang="bash" title="Con Expo" code={`npx expo install easynat react-native-reanimated react-native-worklets react-native-svg react-native-safe-area-context react-native-root-siblings @react-native-async-storage/async-storage @expo/vector-icons`} />
                <CodeBlock lang="bash" title="Sin Expo (React Native CLI)" code={`npm install easynat react-native-reanimated react-native-worklets react-native-svg react-native-safe-area-context react-native-root-siblings @react-native-async-storage/async-storage @expo/vector-icons
cd ios && pod install`} />
                <p className="text-sm text-muted">Sin Expo, sigue también la instalación nativa de cada paquete (Reanimated necesita su plugin de Babel). @expo/vector-icons necesita los módulos de Expo en el proyecto: <code>npx install-expo-modules@latest</code>.</p>
                <div className="overflow-hidden rounded-xl border border-border text-sm">
                    {PEERS.map(([p, d]) => (
                        <div key={p} className="grid gap-1 border-t border-border p-3 first:border-t-0 sm:grid-cols-2">
                            <code className="font-mono text-brand">{p}</code><span className="text-muted">{d}</span>
                        </div>
                    ))}
                </div>
            </section>
            <section className="space-y-3">
                <H2>2. Opcional: react-native-webview</H2>
                <p className="text-muted">Solo para RichTextEditor, ImageViewer, ImageEditor y PDFViewer. Si no está instalada, esos componentes muestran un aviso con el comando y el resto funciona igual.</p>
                <CodeBlock lang="bash" code={`npx expo install react-native-webview`} />
                <p className="text-muted">El PDFViewer descarga pdf.js de internet la primera vez. Para que funcione sin conexión, impórtalo una vez (añade unos 1,5 MB a la app):</p>
                <CodeBlock code={`import 'easynat/dist/utils/pdfjs';`} />
            </section>
            <section className="space-y-3">
                <H2>3. El ThemeProvider</H2>
                <p className="text-muted">Una vez, en la raíz de la app.</p>
                <CodeBlock title="App.tsx" code={`import { ThemeProvider } from 'easynat';

export default function App() {
    // defaultMode: 'light' (por defecto), 'dark' o 'system' (sigue al móvil)
    return <ThemeProvider defaultMode="system"><Navigation /></ThemeProvider>;
}`} />
            </section>
        </article>
    );
}
