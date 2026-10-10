import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

// Se genera al compilar (exportación estática)
export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
    return { rules: { userAgent: '*', allow: '/' }, sitemap: `${SITE_URL}/sitemap.xml` };
}
