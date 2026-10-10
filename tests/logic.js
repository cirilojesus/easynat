// Pruebas de lógica: traducciones, tema, estilos, RenderHTML, EAForm, parseDate y Portal público
const assert = require('assert');
const { React, h, TR, act, RN, siblings, env, lib, wait, mountSiblings, shown } = require('./harness');
const ok = msg => console.log('OK ' + msg);

(async () => {
  // Traducciones
  const { t, libT, setLanguages, setLang } = lib('utils/translate');
  setLanguages({ es: { hola: 'Hola {{n}}', a: { b: 'anidado' } }, en: { easynat: { done: 'OK!' } } });
  await setLang('es');
  assert.equal(t('hola', { n: 'Ana' }), 'Hola Ana');
  assert.equal(t('a.b'), 'anidado');
  assert.equal(t('no.existe.x'), 'no.existe.x');
  assert.equal(libT('done'), 'Aceptar');
  assert.equal(libT('minLength', { min: 3 }), 'El mínimo es de 3 valores');
  await setLang('en');
  assert.equal(libT('done'), 'OK!');
  assert.equal(libT('cancel'), 'Cancel');
  ok('traducciones (t, libT, claves anidadas e inexistentes)');

  // Tema y estilos
  const { mergeTheme } = lib('utils/helpers');
  const { theme } = lib('theme');
  const { DEFAULT_PROPS } = lib('utils/DEFAULT_PROPS');
  const before = JSON.stringify(theme);
  const m = mergeTheme(theme, { light: { colors: { brand: '#123' }, fontFamily: 'Inter' } });
  assert.equal(m.light.colors.brand, '#123');
  assert.equal(m.light.colors['primary.100'], '#4F46E5');
  assert.equal(m.light.fontFamily, 'Inter');
  assert.ok(m.dark.shadows[1]);
  assert.equal(JSON.stringify(theme), before, 'mergeTheme no muta el tema de la librería');
  const st = Object.assign({}, ...DEFAULT_PROPS({ p: 2, color: 'primary.100', onPress() {}, children: 'x', flex: 1, _text: {} }, m.light).filter(Boolean));
  assert.deepEqual(st, { padding: 8, flex: 1, color: '#4F46E5' });
  ok('mergeTheme y DEFAULT_PROPS');

  // RenderHTML
  const { renderHTML } = lib('RenderHTML');
  const html = renderHTML('<ol><li>a</li><li>b</li></ol><p>sin cerrar</p></div><b>x');
  // <ol>: el marcador del 2º <li> es "2."; </div> de más se ignora; <b>x sin cerrar queda en su propio párrafo
  assert.equal([].concat(html[0].props.children)[1].props.children[0].props.children, '2.');
  assert.equal(html.length, 3);
  ok('RenderHTML (numeración, cierres de más y etiquetas sin cerrar)');

  // EAForm
  await setLang('es');
  const { FormGroupRef } = lib('EAForm');
  const form = new FormGroupRef({
    nombre: ['', { required: true, minLength: 3 }], email: ['', { required: true, email: true }],
    edad: ['', { number: true }], telefono: ['', { pattern: /^\d{9}$/ }],
    password: ['', { required: true, minLength: 6 }],
    confirmar: ['', { required: true, custom: c => c.confirmar.value !== c.password.value ? 'Las contraseñas no coinciden' : '' }],
    opcional: ['', { email: true }], acepto: [false, { required: true }],
  });
  assert.equal(form.validate(), false);
  assert.equal(form.controls.opcional.error, '', 'email opcional vacío no da error');
  form.setControlValue('edad', 'abc'); assert.equal(form.controls.edad.error, 'Debe ser un valor numérico');
  form.setControlValue('telefono', '123'); assert.equal(form.controls.telefono.error, 'El valor no coincide con el formato esperado.');
  form.setControlValue('password', 'secreto1'); form.setControlValue('confirmar', 'otro');
  assert.equal(form.controls.confirmar.error, 'Las contraseñas no coinciden');
  form.setValue({ nombre: 'Ana', email: 'ana@mail.com', edad: '30', telefono: '612345678', password: 'secreto1', confirmar: 'secreto1', acepto: true }, true);
  assert.equal(form.isInvalid(), false);
  form.setInitValue({ nombre: 'Inicial' }); form.controls.nombre.setValue('Cambiado'); form.reset();
  assert.equal(form.value.nombre, 'Inicial');
  ok('EAForm (validaciones, custom, setValue, setInitValue y reset)');

  // parseDate (exportada desde DatePicker)
  const { parseDate } = lib('DatePicker');
  for (const v of [null, undefined, '', 'basura', { start: null, end: null }]) assert.equal(parseDate(v), null);
  assert.ok(parseDate('2026-01-05') instanceof Date);
  assert.ok(parseDate({ start: null, end: '2026-02-01' }).start instanceof Date);
  ok('parseDate (null, rangos vacíos y fechas inválidas)');

  // Portal público
  const { Portal } = lib('Portal');
  await mountSiblings();
  let app; const Comp = ({ txt, show }) => (show ? h(Portal, null, h(RN.Text, null, txt)) : null);
  await act(async () => { app = TR.create(h(Comp, { txt: 'overlay 1', show: true })) }); await wait(10);
  assert.ok(shown('overlay 1'), 'renderiza el contenido encima');
  await act(async () => app.update(h(Comp, { txt: 'overlay 2', show: true }))); await wait(10);
  assert.ok(shown('overlay 2') && !shown('overlay 1'), 'actualiza el contenido');
  await act(async () => app.update(h(Comp, { txt: 'overlay 2', show: false }))); await wait(10);
  assert.ok(!shown('overlay 2') && siblings.size === 0, 'desmontar lo quita');
  ok('Portal público (mostrar, actualizar y quitar)');
})().catch(e => { console.error('FALLO', e); process.exit(1) });
