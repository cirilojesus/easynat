import type { MetadataRoute } from 'next';
import { COMPONENTS, GUIDES } from '@/content';
import { SITE_URL } from '@/lib/site';

// Se genera al compilar (exportación estática)
export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        { url: `${SITE_URL}/`, priority: 1 },
        { url: `${SITE_URL}/docs/componentes/`, priority: 0.9 },
        { url: `${SITE_URL}/galeria/`, priority: 0.8 },
        ...GUIDES.map(g => ({ url: `${SITE_URL}${g.href}/`, priority: 0.8 })),
        ...COMPONENTS.map(c => ({ url: `${SITE_URL}/docs/componentes/${c.slug}/`, priority: 0.7 })),
    ];
}
