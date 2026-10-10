import type { ComponentDoc } from './types';

export const DATA: ComponentDoc[] = [
    {
        slug: 'table',
        name: 'Table',
        category: 'Datos',
        summary: 'Tablas con orden, selección, filas desplegables, paginación, totales, colspan y datos de la API.',
        description: 'Una tabla completa: columnas con ancho, alineación, formato y render propio; ordenar tocando la cabecera, seleccionar filas, desplegar detalles, paginar, totales en el pie, grupos de cabecera y celdas que ocupan varias columnas. Con más columnas de las que caben se desplaza en horizontal. Puede leer de un ListStore (scroll infinito y caché).',
        features: [
            'Columnas: width, flex, minWidth, align, format, render, numberOfLines',
            'Orden (sortable, sortValue), controlado o manual (manualSort para la API)',
            'Selección simple o múltiple, filas desplegables (renderExpanded)',
            'Paginación (pageSize) o scroll con store (ListStore)',
            'Pie con totales (footer y footerColSpan)',
            'Grupos de cabecera { title, children } y colSpan por fila',
            'striped, bordered, rowStyle, tamaños sm / md / lg',
        ],
        imports: ['Table'],
        examples: [
            {
                title: 'Básica',
                code: `<Table
    data={pedidos}
    keyField="id"
    striped
    columns={[
        { key: 'id', title: '#', width: 60 },
        { key: 'cliente', title: 'Cliente', flex: 2, sortable: true },
        { key: 'estado', title: 'Estado', render: p => <Box variant="badge_sm" bg={color(p.estado)}>{p.estado}</Box> },
        { key: 'total', title: 'Total', align: 'right', sortable: true,
          format: v => \`\${v} €\`, footer: rows => \`\${suma(rows)} €\` },
    ]}
    onRowPress={abrirPedido}
/>`,
            },
            {
                title: 'Selección, detalle y paginación',
                code: `<Table data={pedidos} columns={columnas} keyField="id"
    selectable onSelectionChange={(keys, rows) => setElegidos(rows)}
    renderExpanded={p => <Text p={3}>{p.notas}</Text>}
    pageSize={20} />`,
            },
            {
                title: 'Grupos y colspan',
                code: `columns={[
    { key: 'concepto', title: 'Concepto', flex: 2,
      colSpan: fila => (fila.seccion ? 4 : 1), footer: 'Total factura', footerColSpan: 2 },
    { title: 'Importe', children: [
        { key: 'base', title: 'Base', align: 'right' },
        { key: 'iva', title: 'IVA 21 %', align: 'right' },
        { key: 'total', title: 'Total', align: 'right' },
    ] },
]}
rowStyle={fila => (fila.seccion ? { bg: 'light.50' } : undefined)}`,
            },
        ],
        types: ['TableProps', 'TableColumn', 'TableColumnGroup', 'TableSort'],
        shots: ['table'],
    },
    {
        slug: 'filter',
        name: 'Filter',
        category: 'Datos',
        summary: 'Formulario de filtros con chips, en vivo o con botón Aplicar, conectado a una lista o a una tabla.',
        description: 'Se describen los campos (texto, select, autocompletar, fecha, rango, switch, checkbox, radio) y Filter pinta el formulario y devuelve solo los filtros activos. Puede ir en la pantalla o en un modal, en vivo (con espera al escribir) o con botón Aplicar, y conectarse a un ListStore para recargar la lista. filterData filtra datos locales con las mismas reglas.',
        features: [
            'Campos: text, select, autocomplete, date, dateRange, switch, checkbox, radio',
            'mode live (con debounce) o apply',
            'Chips de los filtros activos (FilterChips) y botón Limpiar',
            'store: recarga un ListStore con los filtros (sin vacíos)',
            'filterData(filas, valores, campos) para datos locales (sin acentos ni mayúsculas)',
            'cleanFilters y filterCount ("Filtros (2)")',
        ],
        imports: ['Filter', 'FilterChips', 'filterData'],
        examples: [
            {
                title: 'Con una lista de la API',
                code: `<Filter
    store={pedidos}
    fields={[
        { name: 'q', type: 'text', placeholder: 'Buscar…' },
        { name: 'estado', type: 'select', label: 'Estado', options: ESTADOS, width: 'half' },
        { name: 'fecha', type: 'dateRange', label: 'Fecha', width: 'half' },
        { name: 'urgente', type: 'switch', label: 'Solo urgentes' },
    ]}
/>`,
            },
            {
                title: 'Filtrar una tabla local',
                code: `const [filtros, setFiltros] = useState({});
<Filter fields={CAMPOS} onChange={setFiltros} />
<Table data={filterData(pedidos, filtros, CAMPOS)} columns={columnas} />`,
            },
        ],
        types: ['FilterProps', 'FilterField', 'FilterFieldType', 'FilterRef'],
        functions: ['filterData', 'cleanFilters', 'filterCount'],
        shots: ['filter-list'],
    },
    {
        slug: 'async-list',
        name: 'AsyncList y ListStore',
        category: 'Datos',
        summary: 'Listas de la API con scroll infinito, tirar para refrescar, caché, errores y esqueletos.',
        description: 'ListStore guarda una lista paginada de la API: carga, más páginas, refrescar, reintentar, parámetros (filtros) y caché en memoria o en AsyncStorage. AsyncList la pinta con scroll infinito, tirar para refrescar, esqueletos al cargar, vacío, error con reintentar y rejilla. El mismo store sirve para una Table o un Filter.',
        features: [
            'fetch({ page, pageSize, params, signal }) → array o { data, hasMore, total }',
            'Cancela las peticiones viejas (signal) y descarta las respuestas tardías',
            'Sin duplicados al paginar (keyField / dedupe)',
            'Caché por parámetros en memoria (por defecto) o AsyncStorage',
            'setParams, refresh, loadMore, retry, reset',
            'Cambios locales: addItems, updateItem, removeItem, setData',
            'AsyncList: skeleton, refreshable, rejilla (itemMinWidth), resetOnUnmount',
            'store.use(selector) y store.listener(render)',
        ],
        imports: ['AsyncList', 'ListStore', 'useListStore'],
        examples: [
            {
                title: 'Lista con scroll infinito',
                code: `const pedidos = new ListStore({
    pageSize: 20,
    keyField: 'id',
    fetch: async ({ page, pageSize, params, signal }) => {
        const r = await api.get('/pedidos', { params: { page, pageSize, ...params }, signal });
        return { data: r.items, total: r.total };
    },
});

<AsyncList
    store={pedidos}
    skeleton
    renderItem={({ item }) => <Pedido {...item} />}
    _contentContainerStyle={{ p: 4, gap: 3 }}
/>`,
            },
            {
                title: 'Cambios sin recargar',
                code: `pedidos.updateItem(id, { estado: 'pagado' });
pedidos.removeItem(id);
pedidos.addItems([nuevo]);
pedidos.setParams({ estado: 'pendiente' });   // recarga desde la página 1

const total = pedidos.use(s => s.total);`,
            },
        ],
        types: ['AsyncListProps', 'ListStoreOptions', 'ListStore', 'ListFetchArgs', 'ListState'],
        functions: ['useListStore'],
        shots: ['filter-list'],
    },
    {
        slug: 'chart',
        name: 'Chart',
        category: 'Datos',
        summary: 'Nueve tipos de gráfico en un componente: líneas, áreas, barras, tartas, anillos y progreso.',
        description: 'Un solo componente Chart con type: line, area, sparkline, column, bar, horizontalBar, pie, donut y progress. Se adapta al ancho, anima la entrada, enseña un tooltip al tocar o arrastrar, admite varias series, líneas de referencia, zoom con dos dedos y agrupar trozos pequeños en "Otros".',
        features: [
            'Tipos: line, area, sparkline, column, bar, horizontalBar, pie, donut, progress',
            'Varias series con leyenda (arriba o abajo)',
            'Tooltip al tocar o arrastrar; onSelect',
            'Zoom con dos dedos, doble toque para volver y visiblePoints',
            'Líneas de referencia (objetivo, media…)',
            'Barras apiladas, curvas suaves o rectas, degradado',
            'Tartas con groupSmall ("Otros"), etiqueta central y porcentajes',
            'Responsive (aspectRatio) y loading',
        ],
        imports: ['Chart'],
        examples: [
            {
                title: 'Líneas y barras',
                code: `<Chart type="line" area labels={meses}
    series={[{ name: 'Ventas', data: ventas }, { name: 'Gastos', data: gastos }]}
    referenceLines={[{ value: 5000, label: 'Objetivo', dashed: true }]}
    zoomable />

<Chart type="column" stacked labels={['T1', 'T2', 'T3', 'T4']}
    series={[{ name: 'Online', data: [12, 18, 9, 22] }, { name: 'Tienda', data: [8, 6, 11, 7] }]} />`,
            },
            {
                title: 'Tarta, anillo y progreso',
                code: `<Chart type="donut" data={[
    { label: 'Móvil', value: 62 }, { label: 'Web', value: 30 }, { label: 'Tablet', value: 8 },
]} centerLabel="Visitas" groupSmall={5} />

<Chart type="progress" value={72} label="Completado" />
<Chart type="sparkline" data={[3, 5, 4, 8, 6, 9]} height={40} />`,
            },
        ],
        types: ['ChartProps', 'ChartBaseProps', 'CartesianChartProps', 'LineChartProps', 'BarChartProps', 'PieChartProps', 'ProgressRingProps', 'ChartSeries', 'ChartReferenceLine'],
        functions: ['compactNumber'],
        shots: ['charts-1', 'charts-2'],
    },
];

export const CONTENT: ComponentDoc[] = [
    {
        slug: 'render-html',
        name: 'RenderHTML',
        category: 'Contenido',
        summary: 'Pinta HTML con componentes nativos: tablas, listas, imágenes, enlaces y "Leer más".',
        description: 'Convierte HTML en componentes de React Native, sin WebView: títulos, párrafos, listas (también de tareas), tablas con scroll, imágenes, enlaces, citas, código, <details>, sub y superíndice. Estilos por etiqueta y por clase, renderers propios, URLs relativas y un "Leer más" que recorta el contenido.',
        features: [
            'Sin WebView: rápido y con el estilo de la app',
            'tagsStyles y classesStyles; ignoredStyles',
            'renderers propios por etiqueta',
            'baseUrl para enlaces e imágenes relativas; onLinkPress / onImagePress',
            'collapsedHeight: "Leer más / Leer menos"',
            'Tablas con scroll horizontal; listas de tareas; <details>',
            'htmlToText, parseHTML y decodeHtmlEntities',
        ],
        imports: ['RenderHTML', 'htmlToText'],
        examples: [
            {
                title: 'Descripción de un producto',
                code: `<RenderHTML
    html={producto.descripcion}
    scroll={false}
    collapsedHeight={160}
    tagsStyles={{ h2: { color: 'primary.100' }, a: { color: 'secondary.100' } }}
    emptyText="Sin descripción"
/>`,
            },
            {
                title: 'Texto plano',
                code: `htmlToText('<p>Hola <b>mundo</b> &amp; más</p>');           // "Hola mundo & más"
htmlToText(html, { lineBreaks: true });                          // con saltos de línea`,
            },
        ],
        types: ['EARenderHTMLProps', 'RenderHTMLOptions', 'HtmlTagsStyles', 'HtmlRenderer'],
        functions: ['htmlToText', 'parseHTML', 'renderHTML', 'decodeHtmlEntities', 'resolveUrl'],
        shots: ['render-html'],
    },
    {
        slug: 'rich-text-editor',
        name: 'RichTextEditor',
        category: 'Contenido',
        summary: 'Editor de texto enriquecido: formatos, colores, tablas, imágenes, menciones y comandos propios.',
        description: 'Un editor de HTML completo con barra de herramientas configurable: negrita, cursiva, subrayado, tachado, títulos, listas (y de tareas), alineación, sub y superíndice, interlineado, colores, enlaces, imágenes, tablas, separadores y menciones con @. Funciona dentro de modales, se conecta a EAForm y permite comandos propios.',
        features: [
            'Barra configurable con flechas cuando no cabe (arriba o abajo)',
            'Colores de texto y de resaltado, tamaños y títulos',
            'Tablas con filas y columnas, imágenes (por URL o con tu selector) y enlaces',
            'Menciones con @ y lista de sugerencias',
            'Comandos propios (defineCommand) y eventos (onCustomEvent)',
            'onStateChange: qué formatos hay activos y lo seleccionado',
            'label, isFloat, error, formGroup / formControl',
            'Cierra el teclado al tocar fuera (blurOnOutsidePress)',
        ],
        imports: ['RichTextEditor', 'RichTextEditorRef', 'toDataUri'],
        requires: 'react-native-webview',
        examples: [
            {
                title: 'Editor con label',
                code: `<RichTextEditor
    label="Descripción"
    isFloat
    defaultValue="<p>Hola</p>"
    onChange={(html, texto) => setHtml(html)}
    minHeight={160}
/>`,
            },
            {
                title: 'Barra propia, menciones e imágenes',
                code: `<RichTextEditor
    toolbar={['bold', 'italic', 'underline', '|', 'bulletList', 'checkList', '|', 'link', 'image', 'table']}
    mentions={{ trigger: '@', data: usuarios.map(u => ({ id: u.id, label: u.nombre })) }}
    onImagePick={async () => { const f = await elegirFoto(); return f ? toDataUri(f.uri) : null }}
    formGroup={form}
    formControl="cuerpo"
/>`,
            },
        ],
        types: ['RichTextEditorProps', 'RichTextEditorRef', 'RichEditorState', 'RichToolbarAction', 'RichMention'],
        functions: ['DEFAULT_TOOLBAR'],
        shots: ['rich-text'],
    },
];

export const MEDIA: ComponentDoc[] = [
    {
        slug: 'image-viewer',
        name: 'ImageViewer',
        category: 'Multimedia',
        summary: 'Galería a pantalla completa con zoom por imagen, miniaturas y títulos.',
        description: 'Un visor de imágenes con zoom de dos dedos y doble toque por imagen, deslizar entre ellas, puntos, miniaturas o contador, título y pie propio. Funciona dentro de una pantalla o a pantalla completa con openImageViewer(). Convierte las imágenes locales para que se vean también en iOS.',
        features: ['Zoom por imagen (dos dedos y doble toque) y arrastrar con zoom', 'Indicador: puntos, miniaturas o "2 / 5"', 'Flechas, título y renderFooter', 'openImageViewer(imagenes, { index })', 'file:// y content:// también (se convierten las cercanas)'],
        imports: ['ImageViewer', 'openImageViewer'],
        requires: 'react-native-webview',
        examples: [{
            title: 'Galería',
            code: `<Pressable onPress={() => openImageViewer(fotos, { index: i, indicator: 'thumbnails' })}>…</Pressable>

<ImageViewer images={[{ uri: url, title: 'Recibo' }, otraUrl]} h={260} onIndexChange={setI} />`,
        }],
        types: ['ImageViewerProps', 'ImageViewerItem', 'ImageViewerRef'],
        functions: ['openImageViewer'],
        shots: ['image-viewer'],
    },
    {
        slug: 'image-editor',
        name: 'ImageEditor',
        category: 'Multimedia',
        summary: 'Editor de fotos: dibujo, formas, textos, stickers, filtros, ajustes, recorte y privacidad.',
        description: 'Un editor completo que exporta a la resolución original: lápiz suavizado, marcador, formas con relleno y trazo discontinuo, textos con fuentes y fondos, stickers, bote de relleno, cuentagotas, pixelar y desenfocar, goma, 10 ajustes y 9 filtros, girar y recortar, zoom, mover / escalar / girar lo dibujado y deshacer.',
        features: [
            'Dibujo: lápiz suavizado, marcador, línea, flecha, flecha doble, formas, estrella y bocadillo',
            'Relleno y trazo continuo, discontinuo o punteado',
            'Textos con 6 fuentes, color y 4 fondos; se editan tocándolos',
            'Stickers (tus imágenes), bote de relleno y cuentagotas',
            'Pixelar y desenfocar zonas (privacidad)',
            'Ajustes (exposición, brillo, contraste, saturación…) y filtros',
            'Seleccionar, mover, escalar y girar lo dibujado; zoom con dos dedos',
            'Girar y recortar; deshacer y rehacer; exporta en jpeg o png a la resolución original',
        ],
        imports: ['ImageEditor', 'openImageEditor'],
        requires: 'react-native-webview',
        examples: [{
            title: 'Editar y guardar',
            code: `const r = await openImageEditor(foto.uri, {
    stickers: [require('./sello.png'), 'https://…/logo.png'],
    format: 'jpeg',
    maxSize: 2000,
});
if (r) await subir(r.base64);            // { dataUri, base64, mimeType, width, height } o null`,
        }],
        types: ['ImageEditorProps', 'ImageEditorRef', 'ImageEditorResult', 'ImageEditorTool', 'ImageEditorAdjust', 'ImageEditorFilter', 'ImageEditorSticker', 'ImageEditorFont'],
        functions: ['openImageEditor', 'IMAGE_EDITOR_TOOLS', 'IMAGE_EDITOR_FONTS', 'IMAGE_EDITOR_ADJUSTMENTS', 'IMAGE_EDITOR_FILTERS'],
        shots: ['image-editor-1', 'image-editor-2'],
    },
    {
        slug: 'pdf-viewer',
        name: 'PDFViewer',
        category: 'Multimedia',
        summary: 'Visor de PDF con zoom, búsqueda, enlaces, contraseña y texto seleccionable.',
        description: 'Muestra PDFs con pdf.js: páginas en scroll que solo se dibujan cerca de la vista, zoom con dos dedos y doble toque, enlaces internos y externos, búsqueda sin acentos con resaltado, seleccionar y copiar texto, contraseña e indicador de página. Lee de URL (con cabeceras), archivos locales o base64.',
        features: [
            'Fuente: https con cabeceras, file://, content://, data URI o base64',
            'Zoom nítido y páginas lejanas liberadas (memoria)',
            'Búsqueda con resaltado y anterior / siguiente',
            'Seleccionar y copiar texto (onTextSelect)',
            'Enlaces internos y externos (onLinkPress)',
            'Contraseña: por prop o se pregunta',
            'pdf.js del CDN o dentro de la app (sin internet)',
        ],
        imports: ['PDFViewer', 'openPDFViewer'],
        requires: 'react-native-webview',
        examples: [
            {
                title: 'Dentro de una pantalla y a pantalla completa',
                code: `<PDFViewer source={{ uri: 'https://…/factura.pdf', headers: { Authorization: token } }}
    onPageChange={(p, n) => setPagina(\`\${p} / \${n}\`)} />

openPDFViewer(archivo.uri, { initialPage: 3 });`,
            },
            {
                title: 'Sin internet',
                description: 'pdf.js se descarga del CDN la primera vez. Importando este archivo una vez va dentro de la app.',
                code: `import 'easynat/dist/utils/pdfjs';`,
            },
        ],
        types: ['PDFViewerProps', 'PDFViewerRef', 'PDFSource', 'PDFViewerError'],
        functions: ['openPDFViewer', 'registerPdfJs', 'PDFJS_VERSION'],
        shots: ['pdf'],
    },
];
