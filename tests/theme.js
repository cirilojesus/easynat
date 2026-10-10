// Pruebas del sistema de tema: useThemeProps/mergeProps y que cada componente lo respeta
const assert = require('assert');
const { React, h, TR, act, RN, lib, wait, mountSiblings } = require('./harness');
const { ThemeProvider } = lib('theme-provider');
const { mergeProps, useThemeProps } = lib('utils/useThemeProps');
const L = n => lib(n)[n];
const ok = msg => console.log('OK ' + msg);
const flat = n => [].concat(n.props.style || []).flat(9).filter(Boolean).reduce((o, x) => ({ ...o, ...(typeof x === 'object' ? x : {}) }), {});
const render = async (components, el) => { let t; await act(async () => { t = TR.create(h(ThemeProvider, { theme: { light: { components } } }, el)) }); await wait(10); return t; };

(async () => {
  await mountSiblings();

  // ---- mergeProps
  {
    const r = mergeProps({ a: 1, _text: { color: 'x', fontSize: 1 }, header: { p: 1 } }, { a: 2, b: undefined, _text: { fontSize: 2 }, header: { m: 1 } });
    assert.deepEqual(r, { a: 2, _text: { color: 'x', fontSize: 2 }, header: { m: 1 } }, '_ se fusiona, el resto se reemplaza, undefined no pisa');
    const el = h('X'); assert.equal(mergeProps({ _icon: { a: 1 } }, { _icon: el })._icon, el, 'un elemento React no se fusiona');
    ok('mergeProps: fusiona _props, reemplaza el resto, ignora undefined');
  }

  // ---- Orden: defaults del componente → tema → variante → tamaño → props → plataforma
  {
    let out, th; const C = p => { [out, th] = useThemeProps('Box', p, { defaults: { a: 'def', b: 'def', c: 'def', d: 'def' }, variants: { v: { c: 'var-lib', e: 'var-lib' } }, sizes: { s: { d: 'size' } } }); return null; };
    await render({ Box: { b: 'tema', variant: 'v', size: 's', variants: { v: { e: 'var-tema' } }, _android: { f: 'android' } } }, h(C, { a: 'props' }));
    assert.deepEqual([out.a, out.b, out.c, out.d, out.e, out.f], ['props', 'tema', 'var-lib', 'size', 'var-tema', 'android']);
    assert.ok(th && th.colors && th.components.Box, 'devuelve también el theme');
    ok('orden: defaults → tema → variante (librería + tema) → tamaño → props → plataforma; variant y size por defecto del tema');
  }

  // ---- Box y Text: la variante gana a los defaults del tema (antes era al revés)
  {
    const Text = L('Text'), Box = L('Box');
    let t = await render({ Text: { fontSize: 14, color: 'gray' } }, h(Text, { variant: 'h1' }, 'Hola'));
    let n = t.root.findAll(x => x.type === 'Text')[0];
    assert.equal(flat(n).fontSize, 30, 'h1 sigue siendo grande con fontSize en el tema');
    assert.equal(flat(n).color, '#4f4f4fff', 'el color del tema se aplica');
    t = await render({ Text: { variants: { h1: { color: 'danger.100' } } } }, h(Text, { variant: 'h1' }, 'Hola'));
    n = t.root.findAll(x => x.type === 'Text')[0];
    assert.equal(flat(n).fontSize, 30, 'la variante del tema se fusiona con la de la librería (no la reemplaza)');
    assert.equal(flat(n).color, '#c25757ff');
    t = await render({ Box: { rounded: 0, _text: { color: 'danger.100' } } }, h(Box, { variant: 'badge', _text: { fontWeight: '700' } }, 'Tag'));
    const v = t.root.findAll(x => x.type === 'View').pop(), tx = t.root.findAll(x => x.type === 'Text')[0];
    assert.equal(flat(v).borderRadius, 40, 'badge: su rounded gana al del tema (0)');
    assert.deepEqual([flat(tx).fontSize, flat(tx).color, flat(tx).fontWeight], [12, '#c25757ff', '700'], '_text del tema + variante + props fusionados');
    ok('Box y Text: la variante gana a los defaults del tema; las variantes y _text se fusionan');
  }

  // ---- Button: variant y colorScheme por defecto desde el tema; variants no llega al Pressable
  {
    const Button = L('Button');
    const t = await render({ Button: { variant: 'outline', colorScheme: 'danger', _text: { fontWeight: '700' } } }, h(Button, null, 'Ok'));
    const p = t.root.findAll(x => x.type === 'Pressable')[0];
    const st = [].concat(p.props.style({ pressed: false })).flat(9).filter(Boolean).reduce((o, x) => ({ ...o, ...x }), {});
    assert.equal(st.borderColor, '#c25757ff', 'variant outline + colorScheme danger del tema');
    assert.equal(p.props.variants, undefined, 'no pasa variants al Pressable');
    const tx = t.root.findAll(x => x.type === 'Text')[0];
    assert.deepEqual([flat(tx).color, flat(tx).fontWeight], ['#c25757ff', '700']);
    ok('Button: variant y colorScheme por defecto del tema; _text fusionado');
  }

  // ---- CheckBox: su variant no llega al Button interno
  {
    const CheckBox = L('CheckBox');
    const t = await render({ CheckBox: { variants: { grande: { _containerIcon: { w: 40 } } } } }, h(CheckBox, { variant: 'grande', label: 'Acepto' }));
    const p = t.root.findAll(x => x.type === 'Pressable')[0];
    const st = [].concat(p.props.style({ pressed: false })).flat(9).filter(Boolean).reduce((o, x) => ({ ...o, ...x }), {});
    assert.equal(st.padding, 0, 'el Button interno sigue con variant unstyle (p=0)');
    const caja = t.root.findAll(x => x.type === 'View' && flat(x).width === 40);
    assert.equal(caja.length, 1, 'variante del CheckBox aplicada');
    ok('CheckBox: variantes propias sin romper el Button interno');
  }

  // ---- Select y DatePicker: props que antes no se podían poner en el tema
  {
    const Select = L('Select'), DatePicker = L('DatePicker');
    let t = await render({ Select: { placeholder: 'Elige…', bg: 'light.100' } }, h(Select, null, h(Select.Item, { label: 'A', value: 1 })));
    assert.ok(t.root.findAll(x => x.type === 'Text' && x.children.includes('Elige…')).length, 'placeholder del tema');
    t = await render({ DatePicker: { placeholder: 'Fecha…', bg: 'light.100' } }, h(DatePicker, {}));
    assert.ok(t.root.findAll(x => x.type === 'Text' && x.children.includes('Fecha…')).length, 'placeholder del tema');
    const p = t.root.findAll(x => x.type === 'Pressable')[0];
    const st = [].concat(p.props.style({ pressed: false })).flat(9).filter(Boolean).reduce((o, x) => ({ ...o, ...x }), {});
    assert.equal(st.backgroundColor, '#e2e2e2ff', 'bg del tema llega al Pressable del DatePicker (antes se perdía)');
    ok('Select y DatePicker: el tema llega a todas sus props');
  }

  // ---- Componentes que antes no tenían tema
  {
    const Spinner = L('Spinner'), Icon = L('Icon'), ProgressBar = L('ProgressBar');
    let t = await render({ Spinner: { color: 'danger.100', size: 'large' } }, h(Spinner));
    let s = t.root.findAll(x => x.type === 'Spinner')[0];
    assert.deepEqual([s.props.color, s.props.size], ['#c25757ff', 'large']);
    t = await render({ Icon: { size: 30, color: 'danger.100' } }, h(Icon, { as: 'Feather', name: 'x' }));
    s = t.root.findAll(x => x.type === 'Icon')[0];
    assert.deepEqual([s.props.size, s.props.color], [30, '#c25757ff']);
    t = await render({ ProgressBar: { variants: { fino: { h: 4, text: false } } } }, h(ProgressBar, { progress: 50, variant: 'fino' }));
    assert.equal(t.root.findAll(x => x.type === 'Text' && x.children.includes('50%')).length, 0, 'variante de ProgressBar (text: false)');
    ok('Spinner, Icon y ProgressBar: defaults y variantes desde el tema');
  }

  // ---- ThemeProvider: valor estable (no re-renderiza a los consumidores si el tema no cambia)
  {
    const { useTheme } = lib('theme-provider');
    let renders = 0; const Consumidor = React.memo(() => { useTheme(); renders++; return null; });
    const THEME = { light: {} };
    let forzar; const App = () => { const [, set] = React.useState(0); forzar = () => set(x => x + 1); return h(ThemeProvider, { theme: THEME }, h(Consumidor)); };
    await act(async () => { TR.create(h(App)) }); await wait(10);
    const antes = renders;
    for (let i = 0; i < 3; i++) await act(async () => forzar());
    assert.equal(renders, antes, 'renders del ThemeProvider sin cambios: los consumidores no se re-renderizan');
    ok('ThemeProvider: valor del contexto estable');
  }
})().catch(e => { console.error('FALLO', e); process.exit(1) });
