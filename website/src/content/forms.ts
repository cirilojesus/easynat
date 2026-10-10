import type { ComponentDoc } from './types';

export const FORMS: ComponentDoc[] = [
    {
        slug: 'input',
        name: 'Input',
        category: 'Formularios',
        summary: 'Campo de texto con label normal o flotante, iconos, contraseña y cinco variantes.',
        description: 'TextInput con label (normal o flotante que sube al escribir), iconos a los lados, contraseña con botón para verla, tamaños y variantes. Con foco el borde pasa al color primary (o al de _focus).',
        features: [
            'label normal o isFloat (flotante)',
            'isRequired añade el asterisco',
            'isPassword con botón para ver la contraseña',
            'iconLeft / iconRight',
            'Variantes outline, filled, underlined, rounded y unstyled',
            'Tamaños sm, md, lg, xl y _focus para el estilo con foco',
        ],
        imports: ['Input', 'Icon'],
        variants: [
            { name: 'outline', description: 'Borde claro (por defecto)' },
            { name: 'filled', description: 'Fondo gris suave, sin borde' },
            { name: 'underlined', description: 'Solo la línea de abajo' },
            { name: 'rounded', description: 'Borde redondeado' },
            { name: 'unstyled', description: 'Sin borde ni fondo' },
        ],
        examples: [
            {
                title: 'Labels e iconos',
                code: `<Input label="Nombre" placeholder="Escribe tu nombre" value={nombre} onChangeText={setNombre} />
<Input label="Email" isFloat isRequired keyboardType="email-address" />
<Input label="Contraseña" isFloat isPassword />
<Input placeholder="Buscar" iconLeft={<Icon as="Feather" name="search" ml={3} color="gray" />} />`,
            },
            {
                title: 'Variantes',
                code: `<Input variant="filled" placeholder="Filled" />
<Input variant="underlined" placeholder="Underlined" />
<Input variant="rounded" placeholder="Rounded" />
<Input _focus={{ _containerStyle: { borderColor: 'success.100' } }} placeholder="Foco verde" />`,
            },
        ],
        types: ['EATextInputProps', 'InputVariant'],
        shots: ['input-variants', 'forms-controls'],
    },
    {
        slug: 'select',
        name: 'Select',
        category: 'Formularios',
        summary: 'Selector en un panel desde abajo: una o varias opciones, búsqueda, grupos y descripciones.',
        description: 'Abre las opciones en un panel desde abajo. Las opciones van como array (options) o con Select.Item, con descripción, icono, grupo y deshabilitadas. Elige una o varias (multiple, con máximo), busca dentro de la lista sin acentos, se borra con ×, y funciona controlado o sin controlar (también con el valor 0).',
        features: [
            'options como array o <Select.Item> (label, value, description, icon, group, disabled)',
            'multiple con maxSelected: no se cierra al elegir y tiene botón Listo',
            'searchable: busca en el label y la descripción, sin acentos ni mayúsculas',
            'Grupos con título (group) y check en la opción elegida',
            'clearable (×), isInvalid, disabled, title del panel y renderValue',
            'label normal o flotante, isRequired y tamaños sm, md, lg, xl',
            'onChange(valor, opción), onOpen / onClose y ref: open, close, clear, isOpen',
            'Accesible: estado abierto, valor y opciones marcadas',
        ],
        imports: ['Select', 'SelectRef'],
        shots: ['select', 'select-open'],
        examples: [
            {
                title: 'Con options, búsqueda y grupos',
                code: `const PAISES = [
    { label: 'España', value: 'es', group: 'Europa', description: 'Madrid' },
    { label: 'Portugal', value: 'pt', group: 'Europa', description: 'Lisboa' },
    { label: 'México', value: 'mx', group: 'América', description: 'Ciudad de México' },
    { label: 'Perú', value: 'pe', group: 'América', disabled: true },
];

<Select label="País" isFloat options={PAISES} value={pais} onChange={setPais} searchable clearable />`,
            },
            {
                title: 'Varias opciones',
                description: 'El valor es un array. Con maxSelected, al llegar al máximo las demás se deshabilitan.',
                code: `<Select
    label="Idiomas"
    multiple
    maxSelected={3}
    value={idiomas}                        // ['es', 'en']
    onChange={(valores, opciones) => setIdiomas(valores)}
    options={[
        { label: 'Español', value: 'es', icon: <Text>🇪🇸</Text> },
        { label: 'Inglés', value: 'en', icon: <Text>🇬🇧</Text> },
        { label: 'Francés', value: 'fr', icon: <Text>🇫🇷</Text> },
    ]}
    renderValue={sel => \`\${sel.length} idiomas\`}   // opcional: lo que se ve en el campo
/>`,
            },
            {
                title: 'Con Select.Item y ref',
                code: `const ref = useRef<SelectRef>(null);

<Select ref={ref} placeholder="Número" size="lg" value={num} onChange={setNum} isInvalid={num == null}>
    <Select.Item label="Cero" value={0} />
    <Select.Item label="Uno" value={1} />
</Select>

<Button onPress={() => ref.current?.open()}>Elegir número</Button>`,
            },
            {
                title: 'En un formulario',
                code: `<Control formGroup={form} formControl="pais" isSelect label="País" options={PAISES} searchable />`,
            },
        ],
        types: ['EASelectProps', 'SelectOption', 'EASelectItemProps', 'SelectRef'],
    },
    {
        slug: 'slider',
        name: 'Slider',
        category: 'Formularios',
        summary: 'Barra para elegir un valor o un rango arrastrando, con pasos, marcas y burbuja con el valor.',
        description: 'Un valor (número) o un rango con dos tiradores ([desde, hasta]). Se toca el carril para saltar o se arrastra; respeta step, mínimo y máximo, y en rango la distancia mínima. Muestra el valor en una burbuja (siempre o al arrastrar), junto al label o con formato propio, y deja hacer scroll vertical aunque se empiece encima.',
        features: [
            'Un valor o rango [desde, hasta] (range, minDistance)',
            'min, max y step (0 = continuo)',
            'onChange al arrastrar, onChangeStart y onChangeEnd al soltar',
            'showValue: burbuja siempre o solo al arrastrar ("drag"); showLabelValue junto al label',
            'marks: en cada step o una lista con texto; showMinMax',
            'formatValue para el texto (€, %, horas…)',
            'Variantes default, filled y outline; colorScheme y tamaños sm, md, lg',
            '_track, _fill, _thumb, _tooltip y _mark para el estilo',
            'Accesible: adjustable (subir / bajar con el lector de pantalla)',
            'En formularios: Control con isSlider',
        ],
        imports: ['Slider', 'SliderRef'],
        shots: ['slider'],
        variants: [
            { name: 'default', description: 'Tirador blanco con sombra (por defecto)' },
            { name: 'filled', description: 'Tirador del color del relleno' },
            { name: 'outline', description: 'Tirador con borde del color' },
        ],
        examples: [
            {
                title: 'Un valor',
                code: `const [volumen, setVolumen] = useState(30);

<Slider label="Volumen" showLabelValue value={volumen} onChange={setVolumen} />`,
            },
            {
                title: 'Rango',
                code: `const [precio, setPrecio] = useState<[number, number]>([20, 70]);

<Slider
    label="Precio"
    showLabelValue
    value={precio}
    onChange={setPrecio}
    min={0}
    max={500}
    step={5}
    minDistance={10}
    formatValue={v => \`\${v} €\`}
    showMinMax
/>`,
            },
            {
                title: 'Pasos, marcas y burbuja',
                code: `<Slider defaultValue={40} step={10} marks showValue="drag" colorScheme="success" />

<Slider
    defaultValue={2}
    min={0}
    max={4}
    variant="outline"
    marks={[{ value: 0, label: 'XS' }, { value: 1, label: 'S' }, { value: 2, label: 'M' }, { value: 3, label: 'L' }, { value: 4, label: 'XL' }]}
/>

// Guardar solo al soltar
<Slider defaultValue={50} onChangeEnd={v => api.guardarBrillo(v)} />`,
            },
            {
                title: 'Estilo propio',
                code: `<Slider defaultValue={25} size="sm" _fill={{ bg: 'text' }} _track={{ bg: 'light.200' }} _thumb={{ bg: 'text' }} />`,
            },
            {
                title: 'En un formulario',
                description: 'El valor se guarda en el formulario al soltar.',
                code: `const form = new FormGroupRef({ precio: [[0, 100], {}] });

<Control formGroup={form} formControl="precio" isSlider range label="Precio" showLabelValue />`,
            },
        ],
        types: ['SliderProps', 'SliderRef', 'SliderMark'],
    },
    {
        slug: 'search-input',
        name: 'SearchInput',
        category: 'Formularios',
        summary: 'Buscador con sugerencias: simple o múltiple con etiquetas, local o remoto.',
        description: 'Un Input que filtra una lista de opciones mientras se escribe. Elige una o varias (con etiquetas que se quitan con ×), busca en local o llama a onSearch para buscar en el servidor.',
        features: [
            'multiple: varias opciones con etiquetas',
            'Búsqueda local (filter) o remota (onSearch con debounce)',
            'loading, emptyText y clearable',
            'maxSelected para limitar',
            'Lista en un menú flotante o debajo del campo (listType="absolute")',
        ],
        imports: ['SearchInput'],
        shots: ['misc-2'],
        examples: [
            {
                title: 'Local',
                code: `<SearchInput
    data={frutas}
    _item={{ label: 'label', value: 'value' }}
    value={fruta}
    onChange={setFruta}
    clearable
/>`,
            },
            {
                title: 'Remoto y múltiple',
                code: `<SearchInput
    multiple
    data={resultados}
    _item={{ label: 'nombre', value: 'id' }}
    value={elegidos}
    onChange={setElegidos}
    onSearch={async texto => setResultados(await api.buscar(texto))}
    loading={buscando}
    maxSelected={3}
/>`,
            },
        ],
        types: ['SearchInputModel'],
    },
    {
        slug: 'checkbox-radio-switch',
        name: 'CheckBox, Radio y Switch',
        category: 'Formularios',
        summary: 'Casillas, opciones y interruptores con label pulsable, tamaños y colores.',
        description: 'Los tres con label (también pulsable), colorScheme del tema, tamaños y estado deshabilitado. Son accesibles: rol y estado marcado.',
        features: ['label pulsable', 'colorScheme y tamaños sm, md, lg, xl', 'disabled', 'Switch con scale para agrandarlo'],
        imports: ['CheckBox', 'Radio', 'Switch'],
        examples: [{
            title: 'Los tres',
            code: `<CheckBox label="Acepto los términos" checked={acepto} onChange={setAcepto} />
<CheckBox size="lg" colorScheme="success" label="Grande" checked onChange={…} />

{['a', 'b', 'c'].map(v => (
    <Radio key={v} label={\`Opción \${v}\`} value={v} checked={opcion === v} onChange={setOpcion} />
))}

<Switch label="Notificaciones" value={notif} onValueChange={setNotif} />
<Switch label="Grande" scale={1.3} colorScheme="success" value={notif} onValueChange={setNotif} />`,
        }],
        types: ['EACheckBoxProps', 'EARadioProps', 'EASwitchProps'],
        shots: ['forms-controls'],
    },
    {
        slug: 'date-picker',
        name: 'DatePicker',
        category: 'Formularios',
        summary: 'Fechas, rangos, horas, meses, años y días de la semana, en cualquier idioma.',
        description: 'Un selector completo en un modal: calendario, rango de fechas, fecha y hora, solo hora, mes y año, mes, año o día de la semana. Usa Intl, así que funciona en cualquier idioma y formato, con límites, fechas deshabilitadas y primer día de la semana.',
        features: [
            'type: calendar, date-range, datetime, time, month-year, month, year, weekday',
            'locale en cualquier idioma (formatos y nombres de Intl)',
            'minValue / maxValue ("today", fechas u objetos { hour: 9 })',
            'disabledDates: lista o función (sin domingos, sin festivos…)',
            'firstDayOfWeek, clearable y unSelect',
            'onChange con todos los detalles (year, month, day, iso, format…)',
        ],
        imports: ['DatePicker'],
        examples: [
            {
                title: 'Fecha, rango y hora',
                code: `<DatePicker label="Fecha" locale="es" onChange={d => setFecha(d.iso)} />
<DatePicker type="date-range" locale="es" onChange={r => setRango(r)} />
<DatePicker type="datetime" locale="es" minValue="today" />
<DatePicker type="time" value={{ hour: 14, minute: 30 }} />`,
            },
            {
                title: 'Límites y fechas deshabilitadas',
                code: `<DatePicker
    locale="es"
    minValue="today"
    maxValue={enUnMes}
    disabledDates={(fecha, unidad) => unidad === 'day' && fecha.getDay() === 0}
    clearable
/>`,
            },
        ],
        types: ['DatePickerType', 'DateDetailsType', 'DisabledDate'],
        functions: ['formatDate', 'formatDateWith', 'parseDate', 'toDateDetails', 'getDeviceLocaleInfo'],
        shots: ['date-picker-open', 'date-picker'],
    },
    {
        slug: 'form',
        name: 'EAForm (FormGroupRef y Control)',
        category: 'Formularios',
        summary: 'Formularios con validación: 20 reglas, errores del servidor, campos dinámicos y hooks.',
        description: 'Se define el formulario una vez (valores iniciales y reglas) y cada Control se conecta a un campo: Input, Select, Radio, SearchInput, DatePicker, Switch o CheckBox. Valida al escribir, revalida los campos que dependen de otros (confirmar contraseña), permite errores del servidor, añadir o quitar campos y escuchar cambios sin re-renderizar todo.',
        features: [
            'Reglas: required, email, number, integer, positive, min, max, minLength, maxLength, phone, url, alpha, alphanumeric, sameAs, minItems, maxItems, fileTypes, maxFileSize, pattern y custom',
            'Mensajes propios por regla con {{min}}…',
            'Control con isSelect, isRadio, isSearch, isDate, isSwitch, isCheckBox o isSlider',
            'submit(), validate(), isInvalid(), getDirtyValues(), reset()',
            'setError / setErrors para errores del servidor',
            'addControl / removeControl y reglas en caliente (setValidation, addValidation)',
            'useFormGroup, useFormControl, watch, listener y ListenerForm',
        ],
        imports: ['FormGroupRef', 'Control', 'useFormControl', 'useFormGroup', 'ListenerForm'],
        examples: [
            {
                title: 'Definir y pintar',
                code: `// [valor inicial, reglas]
const form = new FormGroupRef({
    nombre: ['', { required: true, minLength: 3 }],
    email: ['', { required: true, email: true }],
    edad: ['', { integer: true, min: 18, messages: { min: 'Debes tener al menos {{min}} años' } }],
    password: ['', { required: true, minLength: 6 }],
    confirmar: ['', { required: true, sameAs: 'password' }],
    pais: [null, { required: true }],
    acepto: [false, { required: true }],
});

<Control formGroup={form} formControl="nombre" label="Nombre" isFloat isRequired />
<Control formGroup={form} formControl="email" label="Email" keyboardType="email-address" />
<Control formGroup={form} formControl="password" label="Contraseña" isPassword />
<Control formGroup={form} formControl="confirmar" label="Confirmar" isPassword />
<Control formGroup={form} formControl="pais" isSelect label="País">
    <Control.Item label="España" value="es" />
    <Control.Item label="México" value="mx" />
</Control>
<Control formGroup={form} formControl="acepto" isCheckBox label="Acepto los términos" />`,
            },
            {
                title: 'Enviar',
                code: `<Button onPress={() => form.submit(
    async valores => {
        const res = await api.registrar(valores);
        if (res.emailExiste) form.setError('email', 'Ese email ya existe');
    },
    errores => showAlert('Revisa los campos marcados', 'danger'),
)}>
    Crear cuenta
</Button>`,
            },
            {
                title: 'Escuchar sin re-renderizar todo',
                code: `// Solo este componente se repinta al cambiar "password"
const password = useFormControl(form, 'password');
<Text>{password.value.length}/6</Text>

// Directamente en el JSX
{form.listener(v => \`Hola \${v.nombre}\`, 'nombre')}

// Valor plano para usarlo en props
const total = form.useListener(v => v.cantidad * v.precio);`,
            },
        ],
        types: ['InputValidation', 'FormGroupRef', 'InputFormParams'],
        functions: ['useFormControl', 'useFormGroup', 'ListenerForm'],
        shots: ['form'],
    },
    {
        slug: 'label',
        name: 'Label',
        category: 'Formularios',
        summary: 'El label de los campos: normal o flotante, con asterisco de obligatorio.',
        description: 'El que usan Input, Select, DatePicker y RichTextEditor. Se puede usar suelto para campos propios.',
        features: ['isFloat: sube al tener valor o foco', 'isRequired: asterisco'],
        imports: ['Label'],
        examples: [{ title: 'Suelto', code: `<Label isRequired>Comentario</Label>` }],
        types: ['LabelType'],
    },
];
