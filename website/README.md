# Web de easynat

La web y la documentación de la librería, con Next.js (App Router). Vive en el mismo repositorio que la librería
pero es un proyecto aparte: tiene su propio `package.json` y no se publica en npm (la librería solo publica `dist`).

## Comandos

```bash
cd website
npm install
npm run dev      # http://localhost:3000
npm run build    # compila (todas las páginas son estáticas)
npm start        # sirve lo compilado
```

`dev` y `build` ejecutan antes `npm run api`.

## De dónde sale cada cosa

| Qué | Dónde |
|---|---|
| Props, tipos y funciones | `src/data/api.json`, generado por `scripts/gen-api.mjs` leyendo `../src` con el compilador de TypeScript. **No se edita a mano**: si cambian los tipos o los comentarios de la librería, la web se actualiza sola al compilar |
| Descripción, ejemplos y variantes de cada componente | `src/content/*.ts` (un objeto por componente) |
| Guías (instalación, props de estilo, tema, idiomas, funciones) | `src/app/docs/*/page.tsx` |
| Capturas | `public/shots/*.png`, sacadas de la app de pruebas (`.playground`) en modo captura |
| Descripción de las props sin comentario en el código | `src/lib/common-props.ts` (las que se repiten: `variant`, `size`, `_text`…) |

### Añadir un componente

1. Un objeto más en el archivo de su categoría de `src/content/`: `slug`, `name`, `summary`, `description`, `features`, `examples`
   y `types` (los nombres de sus tipos de props, tal como se exportan).
2. Si tiene captura, el nombre del archivo en `shots`.

La página, el menú, la galería y el sitemap salen solos.

### Rehacer las capturas

La app de pruebas tiene un modo captura: con `EXPO_PUBLIC_MENU_CHECK=shots` pregunta cada medio segundo a
`http://10.0.2.2:8099/shot.json` (el ordenador, visto desde el emulador de Android) qué demo enseñar, a qué altura y si
lanzar una acción (abrir el visor, el editor, un spinner…). Así se cambia de pantalla sin recompilar. Ver
`.playground/ShotHost.tsx`.

## Google (Search Console)

Para verificar la web en Search Console con la etiqueta meta, pon el código en `website/.env.local`:

```bash
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=el-codigo-que-da-google
```

y vuelve a publicar (`npm run deploy`). Después, en Search Console, envía `https://easynat.web.app/sitemap.xml`.

## Despliegue

La web es estática (`output: 'export'`: todo se genera en `out/` al compilar) y está en Firebase Hosting, en el proyecto
`easynat` (https://easynat.web.app):

```bash
cd website
npm run deploy      # compila y sube a Firebase (hace falta `npx firebase-tools login` la primera vez)
```

La URL del sitio para el sitemap, las canónicas y las metaetiquetas va en `NEXT_PUBLIC_SITE_URL` (por defecto
`https://easynat.web.app`); si se pone un dominio propio, hay que cambiarla y volver a publicar.
