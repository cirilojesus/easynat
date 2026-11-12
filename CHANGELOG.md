# Cambios

## Próxima versión

- **Menu en Android (edge-to-edge):** el menú ya no tapa el botón que lo abre. Se medía el trigger con `measureInWindow`, que en Android resta la barra de estado, mientras que el Portal empieza en y = 0; ahora se mide con `measure` (pageX/pageY), la misma referencia que el Portal, en iOS y Android.
- **SearchInput** (`listType="absolute"`): mismo cambio; el espacio libre arriba y abajo del input ya no sale desplazado en Android.
- **Menu: márgenes como desplazamiento.** `m`, `mx`, `my`, `mt`, `mb`, `ml` y `mr` (o `margin…` en `style` o en el tema) mueven la caja en cualquier dirección (x = izquierdo − derecho, y = superior − inferior, también negativos) y se aplican antes de ajustarla a la pantalla, así que no se sale. Antes `mr` y `mb` no hacían nada y `ml` / `mt` podían sacarla de la pantalla.
- **Nuevos componentes:** `Tooltip` (burbuja junto a un elemento: se abre al tocar o mantener pulsado, se coloca arriba o abajo según el sitio, se cierra sola, al tocar fuera o con atrás), `Breadcrumbs` (ruta de navegación con `maxItems` y "…" desplegable, separador propio y `scrollable`) y `ReadMore` (texto recortado a `numberOfLines` con "Leer más" / "Leer menos", que solo aparece si no cabe).
- **`ago(fecha, ahora?)`:** tiempo relativo corto en el idioma actual ("ahora", "hace 5 min", "hace 3 h", "hace 2 d"; desde 30 días, la fecha). Acepta milisegundos, `Date` o texto.
- **`import 'easynat/pdfjs'`:** acceso corto para usar PDFViewer sin internet (`easynat/dist/utils/pdfjs` sigue funcionando).
- **Image:** sin `size` ni tamaño propio ocupa todo el ancho (`100%`) con la proporción real de la imagen (antes 50×50). Con `size` sigue siendo cuadrada.
- **Input multiline (textarea):** el label flotante, en reposo, va en la primera línea y no en el centro de la caja; el texto empieza arriba (`textAlignVertical="top"` por defecto).
- **Button: `loadingOnPress` ahora es `false` por defecto.** Si `onPress` devuelve una promesa ya no sale el spinner salvo con `loadingOnPress`. El `feedback` sigue esperando a que termine la promesa.

## 1.0.0 — primera versión

La primera versión publicada de easynat.

- **Base:** ThemeProvider, Box (más de 30 variantes combinables: tarjetas, etiquetas, filas, rejillas `grid_sm` … `grid_xl` con `col_1` … `col_6`, avatares, separadores), Text (h1–h6 y variantes de texto), Pressable, Icon, Image, ScrollView, FlatList, EALinearGradient, KeyboardAvoidingView, StatusBar y Portal.
- **Tema:** props de estilo cortas (escala ×4), variantes por componente desde el tema, varias variantes a la vez (`variant="card row_between"`) y `useThemeProps` para tus componentes.
- **Modo oscuro:** colores semánticos (`background`, `surface`, `border`, `text`…), escala de grises invertida, `defaultMode` (`light`, `dark` o `system`) y `setMode` / `toggleTheme`, que se recuerdan.
- **Botones:** Button (solid, subtle, outline, ghost, link y unstyled; carga por prop, ref o promesa; interruptor; cambio de contenido animado al pulsar), HoldButton y SlideButton.
- **Formularios:** Input, Select (options o Select.Item, búsqueda, varias opciones, grupos, clearable), Slider (valor o rango, marcas, burbuja), SearchInput, CheckBox, Radio, Switch, DatePicker y EAForm (FormGroupRef y Control) con 20 reglas de validación, errores del servidor y campos dinámicos.
- **Avisos y capas:** showAlert, Spinner y showSpinner a pantalla completa, ProgressBar, Skeleton, Modal y openModal, Menu con submenús.
- **Disposición y animación:** Collapse, Accordion, Carousel y Stagger.
- **Datos:** Table, Filter, AsyncList con ListStore y Chart (línea, área, sparkline, barras, columnas, tarta, donut y progreso).
- **Contenido y multimedia** (con `react-native-webview`): RenderHTML, RichTextEditor, ImageViewer, ImageEditor y PDFViewer.
- **Idiomas:** `initTranslate`, `t`, `useI18n` y los textos de la librería en español e inglés.
