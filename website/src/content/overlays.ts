import type { ComponentDoc } from './types';

export const FEEDBACK: ComponentDoc[] = [
    {
        slug: 'alert',
        name: 'showAlert (avisos)',
        category: 'Avisos y carga',
        summary: 'Un aviso arriba de la pantalla desde cualquier parte, con una sola línea.',
        description: 'showAlert(mensaje, color) muestra un aviso que baja desde arriba y se va solo. No hay que montar nada: funciona desde cualquier función, también fuera de los componentes. Tocarlo lo cierra.',
        features: ['Cualquier colorScheme del tema (success, danger, info…)', 'Duración (3 s por defecto)', 'Estilos propios y variantes por color en theme.components.Alert', 'hideAlert() para cerrarlo'],
        imports: ['showAlert', 'hideAlert'],
        shots: ['misc-2'],
        examples: [{
            title: 'Avisos',
            code: `showAlert('Guardado', 'success');
showAlert('No hay conexión', 'danger', { _text: { fontWeight: '700' } }, 5000);
hideAlert();`,
        }],
        functions: ['showAlert', 'hideAlert'],
        types: ['EAAlertProps'],
    },
    {
        slug: 'spinner',
        name: 'Spinner y showSpinner',
        category: 'Avisos y carga',
        summary: 'Spinner normal y un spinner que tapa toda la pantalla desde cualquier parte.',
        description: 'Spinner es el indicador de siempre con colores del tema. showSpinner() muestra uno que cubre toda la pantalla (también por encima de un modal abierto) y bloquea los toques y la tecla atrás. Se esconde con su control, solo a los X ms, o al terminar una promesa con withSpinner.',
        features: [
            'showSpinner(mensaje) devuelve un control: hide() y update({ message, progress })',
            'duration: se esconde solo',
            'delay: no aparece si la tarea termina antes (sin parpadeo)',
            'minDuration: no es un destello',
            'Varios a la vez: se ve mientras quede alguno',
            'progress con porcentaje',
            'cancelable con onCancel (tocar el fondo o atrás)',
            'Variantes card y plain; <SpinnerOverlay visible /> controlado',
        ],
        imports: ['Spinner', 'showSpinner', 'hideSpinner', 'withSpinner', 'SpinnerOverlay'],
        variants: [
            { name: 'card', description: 'El spinner en una tarjeta (surface del tema, por defecto)' },
            { name: 'plain', description: 'Solo el spinner sobre un fondo oscuro' },
        ],
        examples: [
            {
                title: 'Desde cualquier parte',
                code: `const s = showSpinner('Guardando…');
await guardar();
s.hide();

showSpinner({ message: 'Conectando…', duration: 3000 });   // se esconde solo
const datos = await withSpinner(api.get('/pedidos'), 'Cargando pedidos…');
hideSpinner();                                             // todos`,
            },
            {
                title: 'Progreso y cancelar',
                code: `const s = showSpinner({ message: 'Subiendo foto…', progress: 0, cancelable: true, onCancel: cancelarSubida });
subir(foto, p => s.update({ progress: p })).finally(s.hide);`,
            },
            {
                title: 'Controlado y normal',
                code: `<SpinnerOverlay visible={guardando} message="Guardando…" />
<Spinner size="large" color="primary.100" />`,
            },
        ],
        types: ['SpinnerOverlayOptions', 'SpinnerHandle', 'EASpinnerProps'],
        functions: ['showSpinner', 'hideSpinner', 'withSpinner', 'isSpinnerVisible'],
        shots: ['spinner'],
    },
    {
        slug: 'progress-bar',
        name: 'ProgressBar',
        category: 'Avisos y carga',
        summary: 'Barra de progreso animada con el porcentaje.',
        description: 'Una barra que se anima hasta el progreso indicado, con el porcentaje o un texto propio.',
        features: ['progress de 0 a 100', 'text: true (porcentaje), false o un texto', 'color del tema'],
        imports: ['ProgressBar'],
        shots: ['misc'],
        examples: [{ title: 'Progreso', code: `<ProgressBar progress={65} color="success.100" />\n<ProgressBar progress={30} text="3 de 10" />` }],
        types: ['EAProgressBarProps'],
    },
    {
        slug: 'skeleton',
        name: 'Skeleton',
        category: 'Avisos y carga',
        summary: 'Esqueletos de carga animados a partir de una estructura.',
        description: 'Bloques grises que laten mientras carga el contenido, descritos con una lista de tamaños. AsyncList y Table lo usan al cargar.',
        features: ['structure: lista de bloques con w, h y estilo', 'gap entre bloques'],
        imports: ['Skeleton'],
        examples: [{
            title: 'Tarjeta cargando',
            code: `<Skeleton structure={[
    { w: 48, h: 48, rounded: 24 },
    { w: '70%', h: 14 },
    { w: '40%', h: 12 },
]} />`,
        }],
        types: ['SkeletonProps'],
    },
];

export const OVERLAYS: ComponentDoc[] = [
    {
        slug: 'modal',
        name: 'Modal',
        category: 'Capas',
        summary: 'Modales con id, con ref o creados al vuelo con openModal({...}) que devuelven un resultado.',
        description: 'Tres formas de usarlo: en el JSX con un id (y abrirlo desde cualquier archivo con openModal(id, data)), con ref, o creándolo al vuelo con openModal({ … }) sin tocar el JSX. Los dinámicos devuelven una promesa con el resultado: perfecto para confirmaciones con await.',
        features: [
            'openModal(id, data) / closeModal(id, result) desde cualquier parte',
            'openModal({ children, … }) crea uno al vuelo; modal.update() y modal.close(resultado)',
            'await modal.result: confirmaciones con valor',
            'children como función: recibe { data, close }',
            'Animaciones slideUp, slideDown, slideLeft, slideRight, fade, scale, none',
            'static (no se cierra al tocar fuera), header, buttonClose y área segura',
            'afterClose, onOpen, closeAllModals, isModalOpen',
        ],
        imports: ['Modal', 'openModal', 'closeModal', 'closeAllModals'],
        shots: ['misc'],
        examples: [
            {
                title: 'Con id, desde cualquier archivo',
                code: `<Modal id="producto" header={{ children: <Text variant="h5" p={4}>Producto</Text> }}>
    {({ data, close }) => (
        <Box p={4} gap={3}>
            <Text>{data.nombre}</Text>
            <Button onPress={() => close('comprado')}>Comprar</Button>
        </Box>
    )}
</Modal>

// En otro archivo
openModal('producto', producto);`,
            },
            {
                title: 'Confirmación con await',
                code: `const modal = openModal<null, boolean>({
    static: true,
    animationType: 'scale',
    children: ({ close }) => (
        <Box p={5} gap={3}>
            <Text variant="title">¿Borrar el pedido?</Text>
            <Box variant="footer">
                <Button variant="ghost" onPress={() => close(false)}>Cancelar</Button>
                <Button colorScheme="danger" onPress={() => close(true)}>Borrar</Button>
            </Box>
        </Box>
    ),
});
if (await modal.result) borrar();`,
            },
        ],
        types: ['EAModalProps', 'EAModalHandle', 'EAModalRef', 'EAModalAnimation'],
        functions: ['openModal', 'closeModal', 'isModalOpen', 'closeAllModals'],
    },
    {
        slug: 'menu',
        name: 'Menu',
        category: 'Capas',
        summary: 'Menús flotantes que se colocan solos, con grupos, separadores y submenús.',
        description: 'Un menú que se abre junto a su trigger y elige el lado con más espacio. Admite grupos con título, separadores, submenús, items que no cierran el menú, listas largas con data + renderItem y menús dentro de modales.',
        features: [
            'placement (bottom, top, right, left) y cambio de lado automático',
            'Menu.Item, Menu.Group, Menu.Divider y submenús',
            'closeOnSelect por menú o por item',
            'data + renderItem para listas largas',
            'useTriggerWidth, backdrop, emptyContent',
            'ref: open, close, toggle',
            'Márgenes (ml, mr, mt, mb, m, mx, my) = desplazamiento de la caja en cualquier dirección, sin salirse de la pantalla',
            'Bien colocado también en Android edge-to-edge (se mide respecto a la raíz, como el Portal)',
        ],
        imports: ['Menu', 'Button', 'Icon'],
        shots: ['menu-open'],
        examples: [{
            title: 'Grupos y submenú',
            code: `<Menu trigger={({ onPress }) => <Button variant="outline" onPress={onPress}>Opciones</Button>}>
    <Menu.Group title="Archivo">
        <Menu.Item label="Nuevo" onPress={nuevo} />
        <Menu.Item label="Abrir" onPress={abrir} />
    </Menu.Group>
    <Menu.Divider />
    <Menu placement="right" trigger={({ onPress }) => (
        <Button variant="ghost" rounded={0} justifyContent="space-between" _text={{ color: 'black' }}
            iconRight={<Icon as="Feather" name="chevron-right" color="black" />} onPress={onPress}>
            Exportar como
        </Button>
    )}>
        <Menu.Item label="PDF" onPress={pdf} />
        <Menu.Item label="Excel" onPress={excel} />
    </Menu>
    <Menu.Item label="Cerrar sesión" _text={{ color: 'danger.100' }} onPress={salir} />
</Menu>`,
        }],
        types: ['EAMenuProps', 'EAMenuItemType', 'MenuRef', 'EAMenuTriggerProps'],
    },
    {
        slug: 'tooltip',
        name: 'Tooltip',
        category: 'Capas',
        summary: 'Burbuja con un texto corto junto a un icono o botón, con flecha y sin salirse de la pantalla.',
        description: 'Se abre al tocar (o al mantener pulsado) un elemento y enseña una burbuja con flecha encima o debajo, la que tenga sitio. Sigue al elemento al hacer scroll y se cierra sola, al tocar en cualquier sitio o con atrás. Va en un Portal encima de todo o, con mode="absolute", junto al elemento.',
        features: [
            'placement top / bottom con cambio de lado si no cabe',
            'Centrada en el trigger sin salirse de la pantalla; la flecha apunta a su centro',
            'openOn press o longPress; children función para conectarlo a tu propio botón',
            'Se cierra sola (duration, 3 s; 0 = no), al tocar fuera y con atrás',
            'mode portal (por defecto, sigue al trigger) o absolute (junto a él, sin Portal)',
            'Controlado (isOpen + onOpenChange) y ref: open, close, toggle',
            'Estilo de la burbuja con props de estilo; invertida respecto al tema (oscura en claro y clara en oscuro)',
        ],
        imports: ['Tooltip', 'Icon', 'Button'],
        shots: ['tooltip'],
        examples: [
            {
                title: 'Información',
                code: `<Tooltip label="Se guarda solo cada 5 minutos">
    <Icon as="Feather" name="info" />
</Tooltip>

<Tooltip label="Abajo y sin flecha" placement="bottom" hasArrow={false} bg="primary.100" _text={{ color: 'white' }}>
    <Icon as="Feather" name="help-circle" />
</Tooltip>`,
            },
            {
                title: 'Con tu botón, mantener pulsado y absolute',
                code: `<Tooltip label="Copiar enlace" openOn="longPress">
    {t => <Button {...t} onPress={copiar} icon={<Icon as="Feather" name="copy" />} />}
</Tooltip>

{/* Junto al trigger, sin Portal: se mueve con él (un contenedor con overflow hidden lo recorta) */}
<Tooltip mode="absolute" label="Dentro de la pantalla"><Icon as="Feather" name="info" /></Tooltip>`,
            },
        ],
        types: ['EATooltipProps', 'TooltipRef', 'TooltipTriggerProps'],
    },
];

export const LAYOUT: ComponentDoc[] = [
    {
        slug: 'collapse',
        name: 'Collapse',
        category: 'Disposición y animación',
        summary: 'Contenido desplegable con animación de altura, controlado o no.',
        description: 'Un trigger que abre y cierra su contenido animando la altura. Puede empezar abierto, controlarse desde fuera, montar el contenido solo al abrirse (lazy) y anidarse.',
        features: ['trigger con { onPress, isOpen }', 'isOpen + onChange (controlado) o defaultOpen', 'lazy para contenido pesado', 'Icono que gira (o propio, o ninguno)', 'onOpen / onClose y duración', 'Contenido dinámico: se adapta a su altura'],
        imports: ['Collapse', 'Button'],
        shots: ['collapse'],
        examples: [{
            title: 'Detalles',
            code: `<Collapse trigger={props => <Button variant="outline" {...props}>Ver detalles</Button>}>
    <Text p={3}>Contenido que se despliega.</Text>
</Collapse>`,
        }],
        types: ['CollapseProps', 'CollapseHandle'],
    },
    {
        slug: 'accordion',
        name: 'Accordion',
        category: 'Disposición y animación',
        summary: 'Varios Collapse donde abrir uno cierra el anterior (o varios a la vez).',
        description: 'Agrupa Collapse: por defecto solo uno abierto; con allowMultiple, varios. Se puede controlar el índice abierto.',
        features: ['defaultIndex o index + onChange', 'allowMultiple', 'Accordion.Item con las props de Collapse'],
        imports: ['Accordion', 'Button'],
        shots: ['collapse'],
        examples: [{
            title: 'Preguntas frecuentes',
            code: `<Accordion defaultIndex={0}>
    {preguntas.map(p => (
        <Accordion.Item key={p.id} trigger={props => <Button variant="outline" {...props}>{p.titulo}</Button>}>
            <Text p={3}>{p.respuesta}</Text>
        </Accordion.Item>
    ))}
</Accordion>`,
        }],
        types: ['AccordionProps'],
    },
    {
        slug: 'carousel',
        name: 'Carousel',
        category: 'Disposición y animación',
        summary: 'Carrusel con pestañas, puntos, autoplay, bucle, varias por vista y efectos.',
        description: 'Diapositivas que se deslizan, con hijos Carousel.Item o con data + renderItem. Pestañas que se desplazan solas, flechas, puntos, autoplay que se para al tocar, bucle, varias diapositivas por vista asomando las de al lado y efectos de escala o fundido.',
        features: [
            'Carousel.Item con tab, o data + renderItem',
            'Pestañas arriba o abajo, flechas y puntos',
            'autoplay (se para al arrastrar) y loop',
            'itemsPerView, gap e inset (las de al lado asomando)',
            'effect: scale o fade',
            'index controlado y ref: goTo, next, prev',
        ],
        imports: ['Carousel', 'CarouselRef'],
        examples: [
            {
                title: 'Con pestañas',
                code: `<Carousel h={220}>
    <Carousel.Item tab="Inicio">…</Carousel.Item>
    <Carousel.Item tab="Pedidos">…</Carousel.Item>
    <Carousel.Item tab="Ajustes">…</Carousel.Item>
</Carousel>`,
            },
            {
                title: 'Galería con autoplay y tarjetas asomando',
                code: `<Carousel h={190} data={fotos} autoplay={3000} loop
    renderItem={f => <Image source={{ uri: f.uri }} style={{ flex: 1 }} />} />

<Carousel h={200} data={fotos} inset={36} gap={12} effect="scale" arrows={false}
    renderItem={f => <Tarjeta {...f} />} />`,
            },
        ],
        types: ['CarouselType', 'CarouselRef', 'EACarouselItem'],
        shots: ['carousel'],
    },
    {
        slug: 'stagger',
        name: 'Stagger',
        category: 'Disposición y animación',
        summary: 'Anima la entrada y la salida de sus hijos uno detrás de otro.',
        description: 'Los hijos aparecen en cascada con un preset (fadeUp, scale, flip…) o con from / to propios, incluidos colores. La salida puede ser distinta de la entrada, en orden normal, al revés o desde el centro. Los hijos que se añaden después entran animados.',
        features: [
            'Presets fade, fadeUp, fadeDown, fadeLeft, fadeRight, scale, zoom, flip',
            'from / to / exit con opacidad, transformaciones, colores y tamaños',
            'order: forward, reverse, center',
            'visible controlado y ref: show, hide, toggle, replay',
            'onShowEnd / onHideEnd',
            'Los ocultos no se pueden tocar',
        ],
        imports: ['Stagger', 'StaggerRef'],
        examples: [{
            title: 'Lista animada',
            code: `<Stagger preset="fadeUp" staggerDelay={60} gap={2}>
    {items.map(i => <Tarjeta key={i.id} {...i} />)}
</Stagger>

<Stagger visible={abierto} order="center" exit={{ opacity: 0, translateX: -60 }} flexDir="row" flexWrap="wrap" gap={2}>
    {fotos.map(f => <Miniatura key={f.id} {...f} />)}
</Stagger>`,
        }],
        types: ['StaggerProps', 'StaggerRef', 'StaggerAnimValues', 'StaggerPreset', 'StaggerOrder'],
        functions: ['STAGGER_PRESETS'],
        shots: ['stagger'],
    },
    {
        slug: 'breadcrumbs',
        name: 'Breadcrumbs',
        category: 'Disposición y animación',
        summary: 'Ruta de navegación con enlaces, chips o flechas, "…" con menú y desplegables.',
        description: 'La ruta hasta la pantalla actual ("Inicio › Productos › Zapatillas"). El último es la página actual. Si hay muchos, "…" abre un menú con los ocultos, y un elemento puede tener su propio desplegable para saltar a otro del mismo nivel.',
        features: [
            'Variantes text, underline, chips (con colorScheme por elemento) y arrows (barra de flechas)',
            'separator: chevron (por defecto), slash, un texto o un elemento',
            'maxItems: el primero, "…" (abre un menú con los ocultos) y los últimos',
            'options: desplegable en un elemento (p. ej. cambiar de proyecto), con la opción actual marcada',
            'Iconos por elemento, scrollable (una línea con scroll) y startContent / endContent (atrás, adelante…)',
        ],
        imports: ['Breadcrumbs', 'Icon'],
        shots: ['breadcrumbs'],
        variants: [
            { name: 'text', description: 'Enlaces de color y el actual en negrita (por defecto)' },
            { name: 'underline', description: 'Enlaces subrayados' },
            { name: 'chips', description: 'Cada elemento en una etiqueta de su color' },
            { name: 'arrows', description: 'Barra de flechas encadenadas en una línea' },
        ],
        examples: [
            {
                title: 'Ruta',
                code: `<Breadcrumbs items={[
    { label: 'Inicio', icon: <Icon as="Feather" name="home" size={14} />, onPress: () => nav.navigate('Home') },
    { label: 'Tienda', onPress: () => nav.navigate('Shop') },
    { label: 'Zapatillas' },
]} />

<Breadcrumbs items={ruta} maxItems={3} separator="slash" />   {/* Inicio / … / Hombre / Zapatillas */}`,
            },
            {
                title: 'Variantes',
                code: `<Breadcrumbs variant="chips" items={[
    { label: 'PRB.01 · PV PLANT', colorScheme: 'warning', onPress: abrir },
    { label: 'PRB.01.01 · CIVIL', colorScheme: 'secondary' },
]} />
<Breadcrumbs variant="arrows" items={pasos} />
<Breadcrumbs variant="underline" items={pasos} />`,
            },
            {
                title: 'Desplegable y botones',
                code: `<Breadcrumbs
    bg="light.50" rounded={3} px={2}
    startContent={<Button variant="ghost" icon={<Icon as="Feather" name="chevron-left" />} onPress={atras} />}
    items={[
        { label: 'Equipo', onPress: verEquipo },
        { label: pod, options: pods.map(p => ({ label: p, selected: p === pod, onPress: () => setPod(p) })) },
        { label: 'Miembros' },
    ]}
/>`,
            },
        ],
        types: ['EABreadcrumbsProps', 'BreadcrumbItem', 'BreadcrumbOption'],
    },
];
