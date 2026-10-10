import type { Metadata } from 'next';
import { ComponentGrid } from '@/components/ComponentGrid';
import { COMPONENTS } from '@/content';

export const metadata: Metadata = {
    title: 'Componentes',
    description: `Los ${COMPONENTS.length} componentes de easynat para React Native, por categoría.`,
    alternates: { canonical: '/docs/componentes/' },
};

export default function ComponentsPage() {
    return (
        <div className="space-y-8">
            <header className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Componentes</h1>
                <p className="text-muted">{COMPONENTS.length} páginas: desde una caja con estilo hasta un editor de fotos o un visor de PDF.</p>
            </header>
            <ComponentGrid />
        </div>
    );
}
