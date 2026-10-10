# Cambios

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
