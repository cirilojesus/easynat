import type { Metadata } from 'next';
import { CodeBlock } from '@/components/CodeBlock';
import { FunctionDoc } from '@/components/FunctionDoc';

export const metadata: Metadata = {
    title: 'Idiomas (i18n)',
    description: 'Traducciones en easynat: los textos de tu app, los de la librería y el cambio de idioma en caliente.',
    alternates: { canonical: '/docs/idiomas/' },
};

export default function I18nGuide() {
    return (
        <article className="space-y-10">
            <header className="space-y-3">
                <h1 className="text-3xl font-bold tracking-tight">Idiomas (i18n)</h1>
                <p className="max-w-3xl text-muted">
                    Un sistema de traducciones pequeño y sin dependencias: claves con puntos, parámetros, variantes (singular / plural…)
                    y el idioma del dispositivo por defecto, que se recuerda al cambiarlo. Los textos de la librería (validaciones, botones…)
                    están en español e inglés y se pueden cambiar.
                </p>
            </header>
            <CodeBlock code={`initTranslate({
    es: {
        hola: 'Hola, {{nombre}}',
        mensajes: 'Tienes {{n}} mensajes | uno: Tienes un mensaje',
        easynat: { required: 'No te olvides de este campo' },   // textos de la librería
    },
    en: { hola: 'Hello, {{nombre}}', mensajes: 'You have {{n}} messages | uno: You have one message' },
});

t('hola', { nombre: 'Ana' });                 // "Hola, Ana"
t('mensajes', { n: 1 }, { uno: n === 1 });     // "Tienes un mensaje"

// En un componente: se re-renderiza al cambiar el idioma
const { t, lang, setLang } = useI18n();
<Button onPress={() => setLang(lang === 'es' ? 'en' : 'es')}>{t('cambiar')}</Button>`} />
            <section className="space-y-4">
                {['initTranslate', 'setLanguages', 't', 'useI18n', 'setLang', 'getLang', 'getDeviceLanguage'].map(n => <FunctionDoc key={n} name={n} />)}
            </section>
        </article>
    );
}
