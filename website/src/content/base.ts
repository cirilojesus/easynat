import type { ComponentDoc } from './types';

export const BASE: ComponentDoc[] = [
    {
        slug: 'theme-provider',
        name: 'ThemeProvider',
        category: 'Base',
        summary: 'Envuelve la app: tema, colores, variantes por defecto y la capa donde se pintan modales y avisos.',
        description: 'Va una vez en la raíz de la app. Aporta el tema (colores, sombras, fuentes y props por defecto de cada componente), el área segura y la capa por encima de todo donde se pintan modales, menús, avisos y spinners. Cualquier componente puede leer el tema con useTheme().',
        features: [
            'Colores, sombras y fuentes propias que se fusionan con las de la librería',
            'Props y variantes por defecto para cada componente (theme.components.Button = { … })',
            'Modo oscuro listo: colores semánticos (background, surface, border, text…) que cambian con el modo',
            'defaultMode: light, dark o system (sigue al móvil en vivo); setMode / toggleTheme y se recuerda entre sesiones',
            'El oscuro hereda tu marca, fuentes y components de light; en dark solo pones lo que cambia',
            'Capa global para openModal, showAlert, showSpinner y Portal',
        ],
        imports: ['ThemeProvider', 'useTheme'],
        examples: [
            {
                title: 'En la raíz de la app',
                code: `import { ThemeProvider } from 'easynat';

export default function App() {
    return (
        <ThemeProvider>
            <Navigation />
        </ThemeProvider>
    );
}`,
            },
            {
                title: 'Tema propio',
                description: 'Solo se indica lo que cambia; el resto viene de la librería. Las variantes de components se combinan con las de la librería. Lo de light vale también para el oscuro; en dark solo va lo que cambia.',
                code: `const theme = {
    light: {
        colors: { 'primary.100': '#0EA5E9', 'primary.200': '#0284C7', 'primary.50': '#0EA5E933' },
        fontFamily: 'Inter',
        components: {
            Button: { rounded: 2, size: 'lg' },
            Box: { variants: { tarjeta: { p: 4, rounded: 3, bg: 'surface', shadow: 2 } } },
            Input: { variant: 'filled' },
        },
    },
    // Opcional: la librería ya trae los colores oscuros
    dark: {
        colors: { 'background': '#0B1120', 'surface': '#111827', 'primary.100': '#38BDF8' },
    },
};

<ThemeProvider theme={theme} defaultMode="system">…</ThemeProvider>`,
            },
            {
                title: 'Modo oscuro',
                description: 'Ver la guía de tema para los colores de cada modo.',
                code: `<ThemeProvider defaultMode="system" theme={{
    light: { colors: { 'primary.100': '#0EA5E9' } },   // también en oscuro
    dark: { colors: { 'background': '#000000' } },     // solo en oscuro
}}>…</ThemeProvider>

const { mode, setMode, toggleTheme } = useTheme();
<Switch label="Modo oscuro" value={mode === 'dark'} onValueChange={toggleTheme} />`,
            },
            {
                title: 'Leer el tema',
                code: `const { theme, mode } = useTheme();
<View style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }} />`,
            },
        ],
        functions: ['useTheme', 'mergeTheme', 'COLORS_THEME', 'DARK_COLORS'],
        types: ['ThemeProviderProps', 'ThemeContextValue', 'ThemeModeSetting', 'ComponentsTheme', 'ComponentTheme'],
        shots: ['dark-box', 'dark-forms'],
    },
    {
        slug: 'box',
        name: 'Box',
        category: 'Base',
        summary: 'La caja de todo: View con props de estilo cortas, área segura y 30 variantes listas.',
        description: 'Es un View con las props de estilo de la librería (p, m, bg, rounded, w, h, flexDir, shadow…), _text para los textos que contenga y safeArea para respetar la muesca. Trae variantes para tarjetas, etiquetas, filas, rejillas, avatares y separadores, y se pueden combinar con espacios.',
        features: [
            'Props cortas: p, px, m, mt, bg, rounded, borderColor, shadow, w, h, flexDir, gap…',
            'Los números de 0.5 a 6 van en la escala ×4 (p={3} = 12 px); el resto en px',
            'Colores del tema por nombre: bg="primary.100", borderColor="light.100"',
            'safeArea / safeAreaTop / safeAreaBottom suman el área segura al padding',
            'Variantes combinables: variant="card row_between"',
            'Rejillas grid_sm / grid / grid_lg / grid_xl con columnas col_1 … col_6',
        ],
        imports: ['Box'],
        variants: [
            { name: 'card · card_sm · card_flat · card_elevated · card_outline · surface', description: 'Tarjetas con borde, sombra o fondo suave' },
            { name: 'badge · badge_sm · badge_lg · badge_outline · chip · dot', description: 'Etiquetas y el punto de aviso de un icono' },
            { name: 'row · row_between · column · center · fill · absolute_fill · overlay', description: 'Disposición' },
            { name: 'screen · section · footer', description: 'Pantalla, sección con espacio y pie de botones' },
            { name: 'grid_sm · grid · grid_lg · grid_xl', description: 'Rejilla con 4, 8, 12 o 16 px entre columnas' },
            { name: 'col_1 … col_6', description: 'Columnas: cuántas caben por fila (toman el padding de su rejilla)' },
            { name: 'divider · divider_vertical', description: 'Separadores' },
            { name: 'avatar · avatar_sm · avatar_lg', description: 'Círculo para iniciales o una foto' },
        ],
        examples: [
            {
                title: 'Props de estilo',
                code: `<Box p={4} bg="surface" rounded={3} shadow={2} gap={2} _text={{ color: 'gray' }}>
    Texto suelto con el estilo de _text
</Box>`,
            },
            {
                title: 'Variantes combinadas',
                code: `<Box variant="card row_between">
    <Box variant="row">
        <Box variant="avatar">AG</Box>
        <Text fontWeight="600">Ana García</Text>
    </Box>
    <Box variant="badge_sm" bg="success.100" alignSelf="center">Activa</Box>
</Box>`,
            },
            {
                title: 'Rejilla',
                description: 'La rejilla reparte la separación entre sus columnas: con grid_lg cada col lleva 6 px a cada lado y 12 px entre filas.',
                code: `<Box variant="grid_lg">
    {productos.map(p => (
        <Box key={p.id} variant="col_3">
            <Producto {...p} />
        </Box>
    ))}
</Box>`,
            },
            {
                title: 'Área segura',
                code: `<Box flex={1} safeAreaTop safeAreaBottom px={4}>…</Box>`,
            },
        ],
        types: ['EABoxProps', 'BoxVariant'],
        functions: ['GRID_GUTTERS'],
        shots: ['box-variants', 'box-grid'],
    },
    {
        slug: 'text',
        name: 'Text',
        category: 'Base',
        summary: 'Texto con colores del tema, props de estilo y 18 variantes tipográficas.',
        description: 'Text de React Native con colores por nombre del tema, las props de estilo de la librería y variantes para títulos, subtítulos, etiquetas o código. Si el tema define fontFamily, elige la fuente según el peso.',
        features: [
            'color="primary.100" y el resto de props de estilo',
            'Títulos h1…h6 y variantes title, subtitle, body, small, caption, label, overline, muted, bold, link, error y code',
            'Variantes combinables: variant="small muted"',
            'Fuentes por peso: con fontFamily: "Inter" en el tema usa Inter_400, Inter_700…',
        ],
        imports: ['Text'],
        variants: [
            { name: 'h1 · h2 · h3 · h4 · h5 · h6', description: 'De 30 a 16 px, en negrita' },
            { name: 'title · subtitle · body', description: 'Título de tarjeta, subtítulo gris y texto normal' },
            { name: 'small · caption · label · overline', description: 'Texto pequeño, pie gris, etiqueta y encabezado en mayúsculas' },
            { name: 'muted · bold · link · error · code', description: 'Gris, negrita, enlace, error y código' },
        ],
        examples: [
            {
                title: 'Variantes',
                code: `<Text variant="h3">Pedidos</Text>
<Text variant="subtitle">Últimos 30 días</Text>
<Text variant="overline">Resumen</Text>
<Text variant="small muted">Actualizado hace 2 min</Text>
<Text variant="error">El email no es válido</Text>`,
            },
            {
                title: 'Colores y estilo',
                code: `<Text color="primary.100" fontWeight="700" textAlign="center" mt={2}>Hola</Text>`,
            },
        ],
        types: ['EATextProps', 'TextVariants'],
        shots: ['text-variants'],
    },
    {
        slug: 'pressable',
        name: 'Pressable',
        category: 'Base',
        summary: 'Cualquier cosa pulsable, con estilos al pulsar (_pressed).',
        description: 'Pressable de React Native con las props de estilo de la librería y _pressed para cambiar el estilo mientras se pulsa. Deshabilitado se ve más claro.',
        features: ['Props de estilo y colores del tema', '_pressed: estilos mientras se pulsa (también _text)', 'disabled con opacidad'],
        imports: ['Pressable'],
        shots: ['misc'],
        examples: [{
            title: 'Fila pulsable',
            code: `<Pressable onPress={abrir} p={3} rounded={2} bg="surface" _pressed={{ bg: 'light.50' }} flexDir="row" gap={2}>
    <Icon as="Feather" name="file" />
    <Text>Factura 0012</Text>
</Pressable>`,
        }],
        types: ['EAPressableProps'],
    },
    {
        slug: 'icon',
        name: 'Icon',
        category: 'Base',
        summary: 'Iconos de @expo/vector-icons con colores del tema y autocompletado del nombre.',
        description: 'Cualquier familia de @expo/vector-icons (Feather, MaterialCommunityIcons, Ionicons, FontAwesome5…) con autocompletado del nombre según la familia, colores del tema y props de estilo.',
        features: ['as: la familia; name con autocompletado de esa familia', 'color con nombres del tema', 'Tamaño 18 por defecto (cámbialo en theme.components.Icon)'],
        imports: ['Icon'],
        shots: ['misc'],
        examples: [{
            title: 'Iconos',
            code: `<Icon as="Feather" name="search" color="gray" />
<Icon as="MaterialCommunityIcons" name="heart" color="danger.100" size={24} ml={2} />`,
        }],
        types: ['IconProps'],
    },
    {
        slug: 'image',
        name: 'Image',
        category: 'Base',
        summary: 'Imagen con imagen de reserva si falla, tamaño cuadrado rápido y props de estilo.',
        description: 'Image de React Native con props de estilo, size para hacerla cuadrada y fallback: si la imagen no carga, se muestra otra.',
        features: ['fallback: otra imagen si falla la carga; _alt: un texto en su lugar', 'size={64} para un cuadrado (50 × 50 si no se indica tamaño)', 'rounded, w, h y el resto de props de estilo'],
        imports: ['Image'],
        shots: ['misc'],
        examples: [{
            title: 'Foto de perfil',
            code: `<Image source={{ uri: usuario.foto }} fallback={require('./avatar.png')} size={64} rounded={40} />`,
        }],
        types: ['EAImageProps'],
    },
    {
        slug: 'scroll-view',
        name: 'ScrollView y FlatList',
        category: 'Base',
        summary: 'ScrollView y FlatList con props de estilo, también para el contenido.',
        description: 'Los mismos de React Native con las props de estilo de la librería en el contenedor y en el contenido (_contentContainerStyle).',
        features: ['Props de estilo en la lista', '_contentContainerStyle con props de estilo', 'FlatList genérica: data y renderItem tipados'],
        imports: ['ScrollView', 'FlatList'],
        examples: [{
            title: 'Lista',
            code: `<FlatList
    data={pedidos}
    keyExtractor={p => p.id}
    renderItem={({ item }) => <Pedido {...item} />}
    _contentContainerStyle={{ p: 4, gap: 3 }}
/>`,
        }],
        types: ['EAScrollViewProps', 'EAFlatListProps'],
    },
    {
        slug: 'linear-gradient',
        name: 'EALinearGradient',
        category: 'Base',
        summary: 'Degradados lineales y radiales con colores del tema (sobre react-native-svg).',
        description: 'Un degradado dibujado con SVG: lineal con ángulo o radial, con colores del tema, posición y opacidad por color.',
        features: ['type: linear o radial', 'angle en grados', 'Colores del tema; offset (0 a 100 %) y opacidad por color. Sin offset se reparten solos'],
        imports: ['EALinearGradient'],
        shots: ['misc'],
        examples: [{
            title: 'Cabecera con degradado',
            code: `<EALinearGradient
    colors={[{ color: 'primary.100' }, { color: 'secondary.100' }]}   // offset (0-100) opcional: se reparten solos
    angle={45}
    height={120}
    width="100%"
/>`,
        }],
        types: ['EALinearGradientProps', 'GradientColor'],
    },
    {
        slug: 'keyboard-avoiding-view',
        name: 'KeyboardAvoidingView',
        category: 'Base',
        summary: 'Sube el contenido por encima del teclado, con hooks para saber su altura.',
        description: 'KeyboardAvoidingView con props de estilo y comportamiento correcto por plataforma, más hooks para leer el estado y la altura del teclado.',
        features: ['Props de estilo', 'useKeyboard() y useKeyboardHeight()', 'useAndroidKeyboardPadding para pantallas edge-to-edge (Android 15+)'],
        imports: ['KeyboardAvoidingView', 'useKeyboardHeight'],
        examples: [{
            title: 'Formulario con teclado',
            code: `<KeyboardAvoidingView flex={1}>
    <ScrollView _contentContainerStyle={{ p: 4, gap: 3 }}>…</ScrollView>
    <Box p={3}><Button>Guardar</Button></Box>
</KeyboardAvoidingView>

const alto = useKeyboardHeight(); // 0 si está cerrado`,
        }],
        types: ['EAKeyboardAvoidingProps'],
        functions: ['useKeyboard', 'useKeyboardHeight', 'useAndroidKeyboardPadding'],
    },
    {
        slug: 'status-bar',
        name: 'StatusBar',
        category: 'Base',
        summary: 'La barra de estado con colores del tema.',
        description: 'StatusBar de React Native con colores del tema y props por plataforma.',
        features: ['bg con nombres del tema', '_ios / _android'],
        imports: ['StatusBar'],
        examples: [{ title: 'Barra de estado', code: `<StatusBar barStyle="light-content" bg="primary.100" />` }],
        types: ['EAStatusBarProps'],
    },
    {
        slug: 'portal',
        name: 'Portal',
        category: 'Base',
        summary: 'Pinta algo por encima de toda la app desde cualquier componente.',
        description: 'Lo que pongas dentro se pinta en la capa superior de la app (junto al ThemeProvider), por encima de pantallas y navegación. Útil para overlays propios.',
        features: ['Encima de todo, sin modales', 'Recibe el tema de la librería', 'Se quita al desmontarse'],
        imports: ['Portal'],
        examples: [{
            title: 'Overlay propio',
            code: `{guardando && (
    <Portal>
        <Box variant="overlay">
            <Spinner size="large" color="white" />
        </Box>
    </Portal>
)}`,
        }],
        notes: ['El contenido no recibe los contextos de la pantalla (por ejemplo useNavigation()), solo los que hay por encima del ThemeProvider.'],
    },
];

export const BUTTONS: ComponentDoc[] = [
    {
        slug: 'button',
        name: 'Button',
        category: 'Botones',
        summary: 'Seis variantes, tamaños, iconos, spinner por ref o automático y cambios animados al pulsar.',
        description: 'El botón de la librería: variantes solid, subtle, outline, link, ghost y unstyled con cualquier colorScheme del tema, cuatro tamaños e iconos. Muestra un spinner cuando se lo pides por ref o solo si onPress devuelve una promesa, puede alternar como interruptor (_active) y enseñar un mensaje momentáneo (feedback), con el cambio animado.',
        features: [
            'Variantes solid, subtle, outline, link, ghost y unstyled con cualquier colorScheme',
            'Tamaños sm, md, lg, xl e iconos a izquierda y derecha',
            'Spinner: ref.startLoading(), isLoading, loadingText o automático si onPress devuelve una promesa',
            'Sin loadingText el botón no cambia de tamaño al cargar',
            'toggle + _active: cambia texto, icono o variante (un like, guardar…)',
            'feedback: "¡Copiado!" durante un momento y vuelve solo',
            'Animación del cambio: zoom, fade o slide',
        ],
        imports: ['Button', 'ButtonRef', 'Icon'],
        variants: [
            { name: 'solid', description: 'Fondo del color y texto blanco (por defecto)' },
            { name: 'subtle', description: 'Tinte suave del color y texto en tono oscuro' },
            { name: 'outline', description: 'Borde y texto del color' },
            { name: 'link', description: 'Solo el texto; subraya al pulsar' },
            { name: 'ghost', description: 'Solo el texto; fondo suave al pulsar' },
            { name: 'unstyled', description: 'Sin fondo ni relleno' },
        ],
        examples: [
            {
                title: 'Variantes y colores',
                code: `<Button>Guardar</Button>
<Button variant="subtle" colorScheme="secondary">Secundario</Button>
<Button variant="outline" size="sm" icon={<Icon as="Feather" name="plus" />}>Añadir</Button>
<Button variant="ghost" colorScheme="danger">Borrar</Button>
<Button disabled>Deshabilitado</Button>`,
            },
            {
                title: 'Spinner',
                description: 'Con ref, con la prop o solo: si onPress devuelve una promesa, el spinner sale hasta que termina y mientras no se puede volver a pulsar.',
                code: `const ref = useRef<ButtonRef>(null);
<Button ref={ref} onPress={() => { ref.current?.startLoading(); … ref.current?.stopLoading() }}>Guardar</Button>

<Button onPress={() => api.guardar(datos)}>Guardar</Button>          {/* promesa: spinner solo */}
<Button isLoading loadingText="Enviando…">Enviar</Button>`,
            },
            {
                title: 'Cambios al pulsar',
                code: `{/* "Copy" → "Copied!" un momento */}
<Button variant="subtle" icon={<Icon as="Feather" name="copy" />}
    feedback={{ children: 'Copied!', colorScheme: 'success', icon: <Icon as="Feather" name="check" /> }}>
    Copy
</Button>

{/* Like: alterna y cambia el icono (con animación) */}
<Button variant="outline" rounded={40} toggle onActiveChange={a => setLikes(n => n + (a ? 1 : -1))}
    icon={<Icon as="MaterialCommunityIcons" name="heart-outline" />}
    _active={{ icon: <Icon as="MaterialCommunityIcons" name="heart" color="danger.100" /> }}>
    {String(likes)}
</Button>`,
            },
        ],
        types: ['EAButtonProps', 'ButtonRef', 'ButtonChangeAnimation'],
        shots: ['button-variants', 'button-states'],
    },
    {
        slug: 'hold-button',
        name: 'HoldButton',
        category: 'Botones',
        summary: 'Mantener pulsado hasta llenar la barra: para acciones que no se deben hacer sin querer.',
        description: 'Mientras se mantiene pulsado se llena una barra; al completarse llama a onComplete. Si se suelta antes, la barra vuelve. Acepta todas las props del Button.',
        features: ['holdDuration (1,5 s por defecto)', 'Si onComplete devuelve una promesa, spinner', 'onHoldStart / onHoldCancel', 'fillColor y keepFilled', 'Lectores de pantalla: activar lo completa'],
        imports: ['HoldButton'],
        examples: [{
            title: 'Borrar manteniendo pulsado',
            code: `<HoldButton colorScheme="danger" icon={<Icon as="Feather" name="trash-2" />} onComplete={borrarCuenta}>
    Mantén para borrar
</HoldButton>`,
        }],
        types: ['HoldButtonProps', 'HoldButtonRef'],
        shots: ['button-special'],
    },
    {
        slug: 'slide-button',
        name: 'SlideButton',
        category: 'Botones',
        summary: 'Deslizar para confirmar, con spinner si la acción tarda y vuelta atrás si falla.',
        description: 'Se arrastra el círculo hasta el final del carril para confirmar. Si no llega al umbral vuelve con un rebote. Funciona dentro de un ScrollView sin que la página le quite el gesto.',
        features: ['threshold (85 % por defecto)', 'Promesa en onComplete: spinner; si falla, vuelve', 'completedText y completedIcon', 'resetAfter y ref.reset()', 'Variante dark'],
        imports: ['SlideButton', 'SlideButtonRef'],
        examples: [{
            title: 'Confirmar pedido',
            code: `<SlideButton
    variant="dark"
    text="Slide to confirm order"
    completedText="¡Pedido confirmado!"
    onComplete={() => api.confirmar(pedido.id)}
/>`,
        }],
        types: ['SlideButtonProps', 'SlideButtonRef'],
        shots: ['button-special'],
    },
];
