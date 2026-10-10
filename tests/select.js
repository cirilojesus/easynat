// Pruebas del Select: options, controlado, multiple + maxSelected, búsqueda, grupos, clearable, ref y placeholder
const assert = require('assert');
const { React, h, TR, act, RN, lib, wait, mountSiblings, layout, env } = require('./harness');
const { Select } = lib('Select');
const { ThemeProvider } = lib('theme-provider');
const ok = msg => console.log('OK ' + msg);
const flat = n => [].concat(n.props.style || []).flat(9).filter(Boolean).reduce((o, x) => ({ ...o, ...(typeof x === 'object' ? x : {}) }), {});
const textos = r => r.findAll(n => n.type === 'Text').map(n => n.children.join(''));
const sib = () => env.siblingRoot.root;
const option = label => sib().findAll(n => n.type === 'Pressable' && n.props.onPress).find(p => p.findAll(x => x.type === 'Text' && x.children.join('') === label).length);
const field = t => t.root.findAll(n => n.type === 'Pressable' && n.props.accessibilityState?.expanded !== undefined)[0];
const openIt = async t => { await act(async () => field(t).props.onPress()); await wait(30); await layout(); await wait(260); };
const press = async label => { await act(async () => option(label).props.onPress()); await wait(260); };
const OPTS = [
  { label: 'España', value: 'es', group: 'Europa', description: 'Madrid' },
  { label: 'Portugal', value: 'pt', group: 'Europa' },
  { label: 'México', value: 'mx', group: 'América' },
  { label: 'Perú', value: 'pe', group: 'América', disabled: true },
];

(async () => {
  await mountSiblings();
  // ---- options + placeholder + controlado
  {
    let t, got;
    await act(async () => { t = TR.create(h(Select, { options: OPTS, placeholder: 'Elige país', value: null, onChange: (v, o) => (got = [v, o]) })) });
    const ph = t.root.findAll(n => n.type === 'Text' && n.children.join('') === 'Elige país')[0];
    assert.ok(ph, 'placeholder'); assert.equal(flat(ph).color, '#a0a0a0', 'placeholder en text.subtle');
    await openIt(t);
    assert.deepEqual(textos(sib()).filter(x => ['EUROPA', 'Europa', 'América'].includes(x)).length >= 2, true, 'títulos de grupo');
    assert.ok(textos(sib()).includes('Madrid'), 'description');
    assert.ok(option('Perú').props.disabled, 'opción deshabilitada');
    await press('México');
    assert.equal(got[0], 'mx'); assert.equal(got[1].label, 'México', 'onChange recibe la opción');
    assert.ok(!textos(t.root).includes('México'), 'controlado: si el padre no cambia value, el campo no cambia');
    await act(async () => t.update(h(Select, { options: OPTS, value: 'mx' })));
    assert.ok(textos(t.root).includes('México'));
    await act(async () => t.unmount()); await wait(300);
    ok('Select: options con grupos, description y disabled; onChange(valor, opción); controlado de verdad; placeholder apagado');
  }
  // ---- multiple + maxSelected + clearable + ref
  {
    let t, got; const ref = React.createRef();
    const S = () => { const [v, setV] = React.useState([]); return h(Select, { ref, options: OPTS, multiple: true, maxSelected: 2, clearable: true, value: v, onChange: x => { got = x; setV(x) } }); };
    await act(async () => { t = TR.create(h(S)) });
    await act(async () => ref.current.open()); await wait(30); await layout(); await wait(260);
    await press('España'); await press('Portugal');
    assert.deepEqual(got, ['es', 'pt']);
    assert.ok(ref.current.isOpen(), 'multiple: no se cierra al elegir');
    assert.ok(option('México').props.disabled, 'maxSelected: las demás se deshabilitan');
    await press('España'); assert.deepEqual(got, ['pt'], 'tocar otra vez la quita');
    assert.ok(textos(sib()).some(x => x.startsWith('Listo') || x.startsWith('Done')), 'botón de listo');
    await act(async () => ref.current.close()); await wait(300);
    assert.ok(textos(t.root).includes('Portugal'), 'el campo muestra lo elegido');
    await act(async () => ref.current.clear()); assert.deepEqual(got, [], 'clear');
    await act(async () => t.unmount()); await wait(300);
    ok('Select multiple: varias, no se cierra, maxSelected, quitar, botón Listo, ref open / close / clear');
  }
  // ---- búsqueda sin acentos + Select.Item + clearable en el campo
  {
    let t, got;
    await act(async () => { t = TR.create(h(Select, { searchable: true, clearable: true, defaultValue: 'b', onChange: v => (got = v) },
      h(Select.Item, { label: 'Ámbar', value: 'a' }), h(Select.Item, { label: 'Bermellón', value: 'b' }), h(Select.Item, { label: 'Cian', value: 'c' }))) });
    assert.ok(textos(t.root).includes('Bermellón'));
    await openIt(t);
    const search = sib().findAll(n => n.type === 'TextInput')[0];
    await act(async () => search.props.onChangeText('amb')); await wait(20);
    assert.ok(option('Ámbar') && !option('Cian'), 'busca sin acentos');
    await act(async () => search.props.onChangeText('zzz')); await wait(20);
    assert.ok(textos(sib()).some(x => /resultados|results/i.test(x)), 'sin resultados');
    await act(async () => search.props.onChangeText('')); await wait(20);
    await press('Cian'); assert.equal(got, 'c');
    assert.ok(textos(t.root).includes('Cian'), 'no controlado: cambia solo');
    const x = t.root.findAll(n => n.type === 'Pressable' && n.props.accessibilityLabel && /borrar|clear|limpiar/i.test(n.props.accessibilityLabel))[0];
    assert.ok(x, 'botón borrar'); await act(async () => x.props.onPress()); assert.equal(got, null, 'clearable da null');
    await act(async () => t.unmount()); await wait(300);
    ok('Select: searchable (sin acentos, sin resultados), Select.Item, no controlado y clearable');
  }
  // ---- clearable baja el label flotante (también tras elegir: el panel se cierra por código, sin onClose del Modal)
  {
    const labelY = t => t.root.findAll(n => n.type === 'Text').map(n => [].concat(n.props.style).flat(9).filter(Boolean).flatMap(s => s.transform || []).find(x => x.translateY)).find(Boolean)?.translateY.v;
    let t, closes = 0;
    const S = () => { const [v, setV] = React.useState(null); return h(Select, { label: 'País', isFloat: true, clearable: true, options: OPTS, value: v, onChange: setV, onClose: () => closes++ }); };
    await act(async () => { t = TR.create(h(S)) }); await wait(150);
    assert.equal(labelY(t), 20, 'vacío: abajo');
    for (let i = 0; i < 3; i++) {
      await openIt(t); assert.equal(labelY(t), 1, 'abierto: arriba');
      await press(i % 2 ? 'Portugal' : 'España'); await wait(150);
      assert.equal(labelY(t), 1, 'con valor: arriba');
      assert.equal(field(t).props.accessibilityState.expanded, false, 'tras elegir, el campo sabe que está cerrado');
      const x = t.root.findAll(n => n.type === 'Pressable' && n.props.accessibilityLabel && /borrar|clear|limpiar/i.test(n.props.accessibilityLabel))[0];
      await act(async () => x.props.onPress()); await wait(150);
      assert.equal(labelY(t), 20, 'al borrar con ×, el label baja (vuelta ' + i + ')');
    }
    assert.equal(closes, 3, 'onClose una vez por cierre');
    // Cerrar tocando fuera (el usuario) y por ref
    await openIt(t);
    const backdrop = sib().findAll(n => n.type === 'Pressable' && n.props.onPress && !n.findAll(x => x.type === 'Text').length)[0];
    await act(async () => backdrop.props.onPress()); await wait(300);
    assert.equal(labelY(t), 20, 'cerrado tocando fuera sin elegir: baja');
    await act(async () => t.unmount()); await wait(300);
    ok('Select clearable: el label baja siempre al borrar (tras elegir, tocar fuera o varias veces) y onClose en cada cierre');
  }
  console.log('TODO OK');
  process.exit(0);
})().catch(e => { console.error('FALLO', e); process.exit(1); });
