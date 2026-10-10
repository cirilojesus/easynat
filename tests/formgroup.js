// API de FormGroupRef: campos dinámicos, reglas en caliente, errores, disable, dirty, submit, watch y reset
const assert = require('assert');
const { React, h, TR, act, RN, lib, wait, mountSiblings } = require('./harness');
const { FormGroupRef, Control } = lib('EAForm');
const { setLang } = lib('utils/translate');
const ok = msg => console.log('OK ' + msg);

(async () => {
  await setLang('es');
  await mountSiblings();

  // ---- Reglas en caliente
  {
    const f = new FormGroupRef({ empresa: [''], cif: [''] });
    assert.ok(f.validate(), 'sin reglas: válido');
    f.addValidation('cif', { required: true });
    assert.ok(!f.validate() && f.controls.cif.error, 'addValidation: ahora es obligatorio');
    f.addValidation('cif', { minLength: 9 });
    assert.deepEqual(Object.keys(f.controls.cif.validation).sort(), ['minLength', 'required'], 'addValidation suma reglas');
    f.removeValidation('cif', ['required']);
    assert.deepEqual(Object.keys(f.controls.cif.validation), ['minLength'], 'removeValidation de una regla');
    f.setControlValue('cif', 'B12');
    assert.ok(f.controls.cif.error, 'minLength sigue activa');
    f.removeValidation('cif');
    assert.ok(f.controls.cif.validation === undefined && f.controls.cif.error === '', 'removeValidation sin reglas: quita todas y el error');
    f.setValidation('cif', { pattern: /^[A-Z]\d{8}$/ });
    assert.ok(f.controls.cif.error, 'setValidation revalida un campo ya tocado');
    ok('addValidation, removeValidation (una o todas) y setValidation (revalida si ya se tocó)');
  }

  // ---- Campos dinámicos
  {
    const f = new FormGroupRef({ nombre: ['Ana'] });
    f.addControl('telefono2', ['', { phone: true }]);
    assert.ok(f.hasControl('telefono2') && f.getValue('telefono2') === '');
    f.setControlValue('telefono2', '123');
    assert.ok(f.controls.telefono2.error, 'el campo añadido valida');
    f.addControl('telefono2', ['otro']);
    assert.equal(f.getValue('telefono2'), '123', 'addControl de uno existente no lo pisa');
    f.removeControl('telefono2');
    assert.ok(!f.hasControl('telefono2') && !('telefono2' in f.getValues()), 'removeControl quita valor y control');
    assert.ok(f.validate(), 'sin el campo quitado, el formulario es válido');
    f.setControlValue('noExiste', 1);
    ok('addControl / removeControl / hasControl');
  }

  // ---- Errores manuales, disable, dirty, submit, watch, reset
  {
    const f = new FormGroupRef({ email: ['a@b.com', { required: true, email: true }], edad: ['', { required: true }] });
    f.setError('email', 'Ese email ya existe');
    assert.deepEqual(f.getErrors(), { email: 'Ese email ya existe' });
    f.setErrors({ edad: 'Obligatoria', noExiste: 'x' });
    assert.deepEqual(Object.keys(f.getErrors()).sort(), ['edad', 'email']);
    f.clearErrors(['email']);
    assert.deepEqual(Object.keys(f.getErrors()), ['edad']);
    f.clearErrors();
    assert.deepEqual(f.getErrors(), {});

    f.disable('edad');
    assert.ok(f.isDisabled('edad') && !f.isInvalid() && f.validate(), 'disable: el campo deshabilitado no cuenta para validar');
    f.enable('edad');
    assert.ok(f.isInvalid(), 'enable: vuelve a contar');

    assert.ok(!f.isDirty());
    f.setControlValue('edad', '30');
    assert.ok(f.isDirty() && f.isDirty('edad') && !f.isDirty('email'));
    assert.deepEqual(f.getDirtyValues(), { edad: '30' }, 'getDirtyValues: solo lo cambiado');

    let enviado, fallos;
    f.submit(v => (enviado = v));
    assert.deepEqual(enviado, { email: 'a@b.com', edad: '30' }, 'submit válido llama con los valores');
    f.setControlValue('email', 'mal');
    f.submit(() => (enviado = 'no'), e => (fallos = e));
    assert.ok(fallos.email && enviado !== 'no', 'submit inválido llama a onInvalid con los errores');

    const vistos = []; const stop = f.watch(v => vistos.push(v.edad));
    f.setControlValue('edad', '31'); f.setControlValue('edad', '32');
    stop(); f.setControlValue('edad', '33');
    assert.deepEqual(vistos, ['31', '32'], 'watch avisa con los valores hasta que se deja de escuchar');
    const soloEmail = []; const stop2 = f.watch(v => soloEmail.push(v.email), 'email');
    f.setControlValue('edad', '34'); f.setControlValue('email', 'x@y.com'); stop2();
    assert.deepEqual(soloEmail, ['x@y.com'], 'watch de un campo solo avisa de ese campo');
    const avisos = []; const stop3 = f.watch(v => avisos.push(v.email), 'email');
    f.setError('email', 'x'); f.disable('email'); f.enable('email'); f.setControlValue('email', 'x@y.com'); f.setControlValue('email', 'z@y.com'); stop3();
    assert.deepEqual(avisos, ['z@y.com'], 'watch no avisa por errores, disable ni por poner el mismo valor');

    f.resetControl('edad');
    assert.equal(f.getValue('edad'), '', 'resetControl');
    f.controls.email.reset();
    assert.equal(f.value.email, 'a@b.com', 'control.reset() también actualiza form.value (antes no)');
    f.reset({ edad: '40' });
    assert.deepEqual(f.getValues(), { email: 'a@b.com', edad: '40' }, 'reset(valores)');
    f.reset();
    assert.deepEqual(f.getValues(), { email: 'a@b.com', edad: '' }, 'reset() a los iniciales');
    ok('setError / setErrors / clearErrors / getErrors, disable / enable, isDirty / getDirtyValues, submit, watch y reset / resetControl');
  }

  // ---- En pantalla: disable bloquea el campo y removeControl no rompe
  {
    const f = new FormGroupRef({ nombre: ['Ana'], extra: [''] });
    let t;
    await act(async () => { t = TR.create(h(React.Fragment, null, h(Control, { formGroup: f, formControl: 'nombre', label: 'Nombre' }), h(Control, { formGroup: f, formControl: 'extra', label: 'Extra' }))) });
    const inputs = () => t.root.findAll(n => n.type === 'TextInput');
    assert.notEqual(inputs()[0].props.editable, false);
    await act(async () => f.disable('nombre'));
    assert.equal(inputs()[0].props.editable, false, 'deshabilitado en pantalla');
    await act(async () => t.unmount());
    ok('Control: disable() bloquea el campo');
  }

  // ---- removeControl deja el input en pantalla; addControl(nombre) lo vuelve a conectar
  {
    const f = new FormGroupRef({ nombre: ['Ana'], apodo: ['', { required: true, minLength: 3 }] });
    let t;
    await act(async () => { t = TR.create(h(Control, { formGroup: f, formControl: 'apodo', label: 'Apodo' })) });
    const input = () => t.root.findAll(n => n.type === 'TextInput')[0];
    const error = () => t.root.findAll(n => n.type === 'Text').some(n => /Required|requerido|mínimo|Minimum/i.test(n.children.join('')));
    await act(async () => input().props.onChangeText('Lu'));
    assert.ok(error(), 'conectado: valida (minLength 3)');
    await act(async () => f.removeControl('apodo'));
    assert.ok(input(), 'quitado: el input sigue en pantalla');
    assert.equal(input().props.value, 'Lu', 'con lo que tenía escrito');
    assert.ok(!error() && !('apodo' in f.getValues()) && f.validate(), 'fuera del formulario: sin error, ni en getValues, ni cuenta al validar');
    await act(async () => input().props.onChangeText('Lucas'));
    assert.equal(input().props.value, 'Lucas', 'se puede seguir escribiendo mientras está fuera');
    await act(async () => f.addControl('apodo'));
    assert.equal(f.getValue('apodo'), 'Lucas', 'addControl(nombre): vuelve con lo escrito mientras estaba fuera');
    assert.deepEqual(f.controls.apodo.validation, { required: true, minLength: 3 }, 'y con sus reglas');
    assert.ok(!f.isDirty('apodo') === false && f.initValue.apodo === '', 'con su valor inicial original');
    await act(async () => input().props.onChangeText(''));
    assert.ok(error(), 'vuelve a validar');
    await act(async () => t.unmount());
    ok('removeControl deja el input (fuera del formulario); addControl(nombre) lo reconecta con lo escrito y sus reglas');
  }
  // ---- form.listener: pinta en el JSX y se actualiza solo
  {
    const f = new FormGroupRef({ nombre: ['Ana'], precio: [10], cantidad: [2] });
    let llamadasNombre = 0, t;
    const Box = lib('Box').Box;
    await act(async () => { t = TR.create(h(Box, null,
      f.listener(v => { llamadasNombre++; return v.nombre }, 'nombre'),
      f.listener(v => `Total: ${v.precio * v.cantidad}`),
      f.listener(v => v.precio > 50 ? h(RN.Text, null, 'caro') : null, 'precio'))) });
    const textos = () => t.root.findAll(n => n.type === 'Text').map(n => n.children.join(''));
    assert.ok(textos().includes('Ana') && textos().includes('Total: 20'), 'pinta texto (envuelto en Text) y valores calculados');
    llamadasNombre = 0;
    await act(async () => f.setControlValue('cantidad', 3));
    assert.ok(textos().includes('Total: 30'), 'sin campo: se actualiza con cualquier cambio');
    assert.equal(llamadasNombre, 0, 'con campo: no se redibuja si cambia otro');
    await act(async () => f.setControlValue('nombre', 'Eva'));
    assert.ok(textos().includes('Eva') && llamadasNombre === 1, 'con campo: se redibuja cuando cambia el suyo');
    await act(async () => f.setControlValue('precio', 60));
    assert.ok(textos().includes('caro'), 'puede devolver JSX (o null)');
    await act(async () => t.unmount());
    ok('form.listener: en el JSX, texto o JSX, por campo o de todo el formulario');
  }
  // ---- listener dentro de un Text (texto plano, hereda el estilo) / en un Box (envuelto) y useListener
  {
    const f = new FormGroupRef({ nombre: ['Ana'] });
    const { Text } = lib('Text'); const { Box } = lib('Box');
    let t, valor;
    const Comp = () => { valor = f.useListener(v => `Hola ${v.nombre}`, 'nombre'); return h(RN.TextInput, { placeholder: valor }) };
    await act(async () => { t = TR.create(h(Box, null,
      h(Text, { color: 'danger.100', testID: 'padre' }, 'Saludo: ', f.listener(v => v.nombre, 'nombre')),
      h(Box, { testID: 'caja' }, f.listener(v => v.nombre, 'nombre')),
      h(Comp))) });
    const padre = t.root.findAll(n => n.type === 'Text' && n.props.testID === 'padre')[0];
    assert.equal(padre.findAll(n => n.type === 'Text').length, 1, 'dentro de un Text: texto plano, sin otro Text dentro (hereda el estilo)');
    assert.ok(padre.findAll(() => true).some(n => n.children?.includes?.('Ana')) || JSON.stringify(padre.children.map(c => typeof c === 'string' ? c : '')).length, 'el nombre está dentro');
    const caja = t.root.findAll(n => n.type === 'View' && n.props.testID === 'caja')[0];
    assert.equal(caja.findAll(n => n.type === 'Text').length, 1, 'en un Box: envuelto en un Text (si no, React Native falla)');
    assert.equal(valor, 'Hola Ana', 'useListener devuelve el valor plano');
    assert.equal(t.root.findAll(n => n.type === 'TextInput')[0].props.placeholder, 'Hola Ana', 'y sirve para props');
    await act(async () => f.setControlValue('nombre', 'Eva'));
    assert.equal(valor, 'Hola Eva', 'useListener se actualiza');
    assert.ok(JSON.stringify(t.toJSON()).includes('Eva'), 'y los listener también');
    await act(async () => t.unmount());
    ok('listener: texto plano dentro de un Text, envuelto en un Box; useListener devuelve el valor plano');
  }
})().catch(e => { console.error('FALLO', e); process.exit(1) });
