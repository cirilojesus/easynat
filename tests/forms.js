// Pruebas de Input, Select, CheckBox, Radio, Switch y EAForm
const assert = require('assert');
const { React, h, TR, act, RN, lib, wait, mountSiblings, layout, env } = require('./harness');
const { Input } = lib('Input');
const { Select } = lib('Select');
const { CheckBox } = lib('CheckBox');
const { Radio } = lib('Radio');
const { Control, FormGroupRef, useFormControl } = lib('EAForm');
const { formatDate, parseDate, toDateDetails, formatDateWith } = lib('DatePicker');
const ok = msg => console.log('OK ' + msg);
const labelY = t => t.root.findAll(n => n.type === 'Text').map(n => [].concat(n.props.style).flat(9).filter(Boolean).flatMap(s => s.transform || []).find(x => x.translateY)).find(Boolean)?.translateY.v;
const input = t => t.root.findAll(n => n.type === 'TextInput')[0];
const textos = t => t.root.findAll(n => n.type === 'Text').map(n => n.children.join(''));

(async () => {
  await mountSiblings();

  // ---- Input: label flotante también sin value (no controlado), placeholder oculto y props limpias
  {
    let t;
    await act(async () => { t = TR.create(h(Input, { label: 'Nombre', isFloat: true, placeholder: 'Escribe', iconLeft: h(RN.Text, null, 'i') })) });
    await wait(150);
    assert.equal(labelY(t), 20, 'vacío y sin foco: abajo');
    assert.equal(input(t).props.placeholder, undefined, 'el label hace de placeholder');
    for (const k of ['label', 'iconLeft', 'isFloat', '_containerStyle', 'isPassword']) assert.equal(input(t).props[k], undefined, 'TextInput sin ' + k);
    await act(async () => input(t).props.onFocus({})); await wait(150);
    assert.equal(labelY(t), 1, 'con foco: arriba');
    assert.equal(input(t).props.placeholder, 'Escribe', 'con foco se ve el placeholder');
    await act(async () => input(t).props.onChangeText('Ana'));
    await act(async () => input(t).props.onBlur({})); await wait(150);
    assert.equal(labelY(t), 1, 'sin value pero con texto escrito: sigue arriba (antes bajaba encima del texto)');
    await act(async () => input(t).props.onChangeText(''));
    await wait(150); assert.equal(labelY(t), 20, 'si se borra todo, baja');
    await act(async () => t.unmount());
    await act(async () => { t = TR.create(h(Input, { label: 'Nombre', isFloat: true, value: 'Ana' })) }); await wait(150);
    assert.equal(labelY(t), 1, 'controlado con value: arriba');
    await act(async () => t.unmount());
    ok('Input: label flotante (Label) con o sin value, placeholder bajo el label y props limpias en el TextInput');
  }

  // ---- Select: value (y defaultValue), valor 0 sube el label, props del item limpias
  {
    let t, elegido;
    const items = [h(Select.Item, { key: 0, label: 'Cero', value: 0 }), h(Select.Item, { key: 1, label: 'Uno', value: 1 })];
    await act(async () => { t = TR.create(h(Select, { label: 'Número', isFloat: true, value: 0, onChange: v => (elegido = v) }, ...items)) });
    await wait(150);
    assert.ok(textos(t).includes('Cero'), 'value 0 se muestra');
    assert.equal(labelY(t), 1, 'con el valor 0 el label sube (antes no)');
    await act(async () => t.root.findAll(n => n.type === 'Pressable' && n.props.onPress)[0].props.onPress()); await wait(30); await layout(); await wait(250);
    const opcion = env.siblingRoot.root.findAll(n => n.type === 'Pressable' && n.props.onPress).find(p => p.findAll(x => x.children?.includes?.('Uno')).length);
    assert.ok(opcion.props.label === undefined && opcion.props.value === undefined, 'label/value del item no llegan al botón');
    await act(async () => opcion.props.onPress()); await wait(300);
    assert.equal(elegido, 1);
    await act(async () => t.unmount()); await wait(300);
    await act(async () => { t = TR.create(h(Select, { defaultValue: 1 }, ...items)) });
    assert.ok(textos(t).includes('Uno'), 'defaultValue sigue funcionando');
    await act(async () => t.unmount());
    ok('Select: value / defaultValue, el label sube con el valor 0 y props del item limpias');
  }

  // ---- Accesibilidad de CheckBox y Radio
  {
    let t;
    await act(async () => { t = TR.create(h(React.Fragment, null, h(CheckBox, { label: 'Acepto', checked: true }), h(Radio, { label: 'A', checked: false, size: 'lg' }))) });
    const [cb, rd] = t.root.findAll(n => n.type === 'Pressable' && n.props.accessibilityRole);
    assert.deepEqual([cb.props.accessibilityRole, cb.props.accessibilityState.checked], ['checkbox', true]);
    assert.deepEqual([rd.props.accessibilityRole, rd.props.accessibilityState.checked], ['radio', false]);
    const circulo = t.root.findAll(n => n.type === 'View' && [].concat(n.props.style).flat(9).some(s => s && s.borderRadius === 40))[0];
    assert.equal([].concat(circulo.props.style).flat(9).filter(Boolean).reduce((o, x) => ({ ...o, ...x }), {}).width, 26, 'Radio size="lg"');
    await act(async () => t.unmount());
    ok('CheckBox y Radio: rol y estado de accesibilidad; Radio con tamaños');
  }

  // ---- EAForm: suscripción estable, setValue con campos desconocidos, label del grupo de radios
  {
    const form = new FormGroupRef({ nombre: ['', { required: true }], genero: [null], acepto: [false] });
    assert.equal(form.subscribe('nombre'), form.subscribe('nombre'), 'subscribe devuelve siempre la misma función por control');
    assert.equal(form.getSnapshot('nombre'), form.getSnapshot('nombre'));
    assert.doesNotThrow(() => form.setValue({ nombre: 'Ana', noExiste: 1 }), 'setValue con un campo que no existe no rompe');
    assert.equal(form.value.nombre, 'Ana');

    let renders = 0;
    const Campo = () => { renders++; useFormControl(form, 'nombre'); return null };
    let t; await act(async () => { t = TR.create(h(Campo)) });
    renders = 0;
    await act(async () => form.setControlValue('genero', 'f'));
    assert.equal(renders, 0, 'cambiar otro campo no re-renderiza este');
    await act(async () => form.setControlValue('nombre', 'Eva'));
    assert.equal(renders, 1, 'cambiar este campo: un render');
    await act(async () => t.unmount());

    await act(async () => { t = TR.create(h(Control, { formGroup: form, formControl: 'genero', isRadio: true, label: 'Género', isRequired: true },
      h(Control.Item, { label: 'Femenino', value: 'f' }), h(Control.Item, { label: 'Masculino', value: 'm' }))) });
    assert.ok(textos(t).some(x => x.startsWith('Género')), 'label del grupo de radios visible');
    assert.ok(textos(t).includes('Femenino') && textos(t).includes('Masculino'));
    const radios = t.root.findAll(n => n.type === 'Pressable' && n.props.accessibilityRole === 'radio');
    assert.equal(radios.find(r => r.props.accessibilityState.checked) && radios.length, 2);
    await act(async () => radios[1].props.onPress());
    assert.equal(form.value.genero, 'm');
    await act(async () => t.unmount());

    // Input del formulario: error de validación visible y borde rojo
    await act(async () => { t = TR.create(h(Control, { formGroup: form, formControl: 'nombre', label: 'Nombre' })) });
    await act(async () => input(t).props.onChangeText(''));
    assert.ok(textos(t).some(x => /requerido|Required/.test(x)), 'error de validación al vaciar un campo requerido');
    await act(async () => t.unmount());
    ok('EAForm: subscribe estable (solo re-renderiza el campo que cambia), setValue seguro, label del grupo de radios y errores');
  }
  // ---- Funciones exportadas del DatePicker
  {
    assert.equal(formatDate('2026-03-15', { locale: 'es' }), '15/03/2026', 'formatDate con texto "AAAA-MM-DD"');
    assert.equal(formatDate(new Date(2026, 2, 15), { locale: 'de', separate: '-' }), '15-03-2026', 'separate en alemán');
    assert.equal(formatDate(new Date(2026, 2, 15), { locale: 'es', config: { month: 'long' } }), '15 de marzo de 2026');
    assert.equal(formatDate('no es fecha'), '', 'fecha no válida: ""');
    const d = parseDate('2026-03-15'); assert.ok(d instanceof Date && d.getDate() === 15, 'parseDate local');
    assert.deepEqual(Object.keys(parseDate({ start: '2026-03-01', end: '2026-03-05' })), ['start', 'end'], 'parseDate de un rango');
    assert.equal(parseDate({ weekday: 3 }).getDay(), 3, 'parseDate de weekday');
    const det = toDateDetails(new Date(2026, 2, 15, 9, 5), { locale: 'es' });
    assert.deepEqual([det.year, det.month, det.day, det.hour, det.minute, det.weekday, det.format], [2026, 2, 15, 9, 5, 0, '15/03/2026']);
    assert.equal(formatDateWith(new Date(2026, 2, 18), 'es', { weekday: 'long' }), 'miércoles');
    ok('exportadas: formatDate, parseDate, toDateDetails y formatDateWith');
  }

  // ---- Iconos centrados: CheckBox y Radio
  {
    let t;
    await act(async () => { t = TR.create(h(React.Fragment, null, h(CheckBox, { label: 'a', checked: true, size: 'lg' }), h(Radio, { label: 'b', checked: true }))) });
    const cajas = t.root.findAll(n => n.type === 'View' && [].concat(n.props.style).flat(9).filter(Boolean).reduce((o, x) => ({ ...o, ...x }), {}).borderWidth && n.props.style && [].concat(n.props.style).flat(9).filter(Boolean).reduce((o, x) => ({ ...o, ...x }), {}).alignItems === 'center');
    assert.equal(cajas.length >= 2, true, 'caja del CheckBox y aro del Radio centran su contenido');
    await act(async () => t.unmount());
    ok('CheckBox y Radio: icono / punto centrados');
  }
})().catch(e => { console.error('FALLO', e); process.exit(1) });
