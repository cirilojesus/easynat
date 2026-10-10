<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://easynat.web.app/logo/logo-dark.png">
    <img src="https://easynat.web.app/logo/logo.png" alt="easynat" width="360">
  </picture>
</p>

# easynat

Componentes de React Native listos para usar, con tema claro y oscuro, props de estilo cortas y variantes que se combinan.

> **English:** a React Native UI library with 40+ ready-to-use components: theming with built-in dark mode, short style props,
> forms with validation, charts, tables, sliders, date pickers, an image editor and a PDF viewer. Documentation (in Spanish):
> **[easynat.web.app](https://easynat.web.app)**.

📖 **Documentación, ejemplos y capturas: [easynat.web.app](https://easynat.web.app)**

## Qué trae

| | |
|---|---|
| **Base** | ThemeProvider, Box (30+ variantes: tarjetas, etiquetas, rejillas…), Text (h1–h6, caption…), Pressable, Icon, Image, ScrollView, FlatList, LinearGradient, KeyboardAvoidingView, StatusBar, Portal |
| **Botones** | Button (solid, subtle, outline, ghost, link; carga, interruptor, cambio al pulsar), HoldButton (mantener), SlideButton (deslizar para confirmar) |
| **Formularios** | Input, Select (búsqueda, varias opciones, grupos), Slider (valor o rango), SearchInput, CheckBox, Radio, Switch, DatePicker (fechas, rangos, horas), EAForm con 20 reglas de validación |
| **Avisos y carga** | showAlert, Spinner y showSpinner a pantalla completa, ProgressBar, Skeleton |
| **Capas** | Modal (también openModal desde cualquier parte), Menu (anidados) |
| **Disposición** | Collapse, Accordion, Carousel, Stagger (animaciones en cascada) |
| **Datos** | Table (orden, colspan, totales, filas desplegables), Filter, AsyncList (listas infinitas con caché), Chart (línea, área, barras, tarta…) |
| **Contenido y multimedia** | RenderHTML, RichTextEditor, ImageViewer, ImageEditor, PDFViewer |

Además: modo oscuro con colores semánticos, idiomas (i18n) con el idioma del dispositivo, y funciones como `withAlpha`, `formatDate` o `useKeyboard`.

## Instalación

Con Expo:

```bash
npx expo install easynat react-native-reanimated react-native-worklets react-native-svg react-native-safe-area-context react-native-root-siblings @react-native-async-storage/async-storage @expo/vector-icons
```

Sin Expo (React Native CLI): instala los mismos paquetes con `npm install` y sigue la instalación nativa de cada uno
(Reanimated necesita su plugin de Babel). `@expo/vector-icons` necesita los módulos de Expo en el proyecto:
`npx install-expo-modules@latest`.

`react-native-worklets` solo hace falta con Reanimated 4.

### Opcional: componentes con WebView

RichTextEditor, ImageViewer, ImageEditor y PDFViewer necesitan `react-native-webview`. Si no lo usas, no hace falta instalarlo:

```bash
npx expo install react-native-webview
```

El PDFViewer descarga pdf.js de internet la primera vez. Para que funcione sin conexión, impórtalo una vez en tu app (añade unos 1,5 MB):

```ts
import 'easynat/dist/utils/pdfjs';
```

## Empezar

Envuelve la app en el `ThemeProvider` (una vez, en la raíz):

```tsx
import { ThemeProvider, Box, Text, Button, showAlert } from 'easynat';

export default function App() {
    return (
        <ThemeProvider defaultMode="system">
            <Box variant="screen" safeArea p={4} gap={3}>
                <Text variant="h3">Hola 👋</Text>
                <Box variant="card row_between">
                    <Text>Pedido #1024</Text>
                    <Box variant="badge_sm">Nuevo</Box>
                </Box>
                <Button onPress={() => showAlert('Guardado', 'success')}>Guardar</Button>
            </Box>
        </ThemeProvider>
    );
}
```

### Props de estilo

Todas las cajas aceptan props cortas. Los números de 0.5 a 6 van en una escala ×4 (`p={3}` = 12 px); el resto en px.
Los colores se usan por nombre del tema:

```tsx
<Box p={4} mt={2} bg="primary.50" rounded={3} shadow={2} flexDir="row" gap={2} />
```

### Tema y modo oscuro

Solo se pone lo que cambia; lo de `light` vale también para el oscuro:

```tsx
const theme = {
    light: {
        colors: { 'primary.100': '#0EA5E9' },
        components: { Button: { rounded: 2, variants: { pill: { rounded: 40 } } } },
    },
    dark: { colors: { background: '#000000' } },
};

<ThemeProvider theme={theme} defaultMode="system">…</ThemeProvider>

const { mode, setMode, toggleTheme } = useTheme();
```

Las variantes se combinan con espacios: `<Box variant="card row_between">`, `<Text variant="small muted">`.

## Requisitos

- React 18.2+, React Native 0.72+ y Reanimated 3.3+ (Expo SDK 49 o superior).
- Probado con Expo SDK 57, React Native 0.86, React 19 y Reanimated 4.5, en Android e iOS.
- Escrito en TypeScript: los tipos van incluidos.

## Licencia

[MIT](./LICENSE) © Jesús Ruiz
