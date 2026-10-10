import { buildSearchIndex } from '@/lib/search';

// Se genera al compilar (exportación estática): el buscador lo descarga al abrirse
export const dynamic = 'force-static';

export function GET() {
    return Response.json(buildSearchIndex());
}
