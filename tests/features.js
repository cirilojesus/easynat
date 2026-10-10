// Pruebas de las funciones nuevas: Menu (Divider, Group, disabled, closeOnSelect, emptyContent, accesibilidad)
// y SearchInput (acentos, emptyText, filter, onSearch + debounce, loading, clearable, maxSelected)
const assert = require('assert');
const { React, h, TR, act, RN, env, lib, wait, mountSiblings, shown } = require('./harness');
const { Menu } = lib('Menu');
const { SearchInput } = lib('SearchInput');
const ok = msg => console.log('OK ' + msg);
const layoutAll = async () => { await act(async () => env.siblingRoot.root.findAll(n => n.type === 'AnimatedView' && n.props.onLayout).forEach(n => n.props.onLayout({ nativeEvent: { layout: { width: 200, height: 120 } } }))) };
const settle = async () => { await wait(10); await layoutAll(); await wait(10); await layoutAll(); await wait(250); };
const btnOf = txt => env.siblingRoot.root.findAll(n => n.type === 'Pressable' && n.props.onPress).find(p => p.findAll(n => n.children?.includes?.(txt)).length);
const press = async txt => { const b = btnOf(txt); assert.ok(b, 'item ' + txt); await act(async () => b.props.onPress()); };
const input = app => app.root.findAll(n => n.props && typeof n.props.onChangeText === 'function' && n.props.onFocus)[0];
const spinners = () => [...env.siblingRoot.root.findAll(n => n.type === 'Spinner')];
const CIUDADES = [{ n: 'Málaga', id: 1 }, { n: 'Córdoba', id: 2 }, { n: 'Logroño', id: 3 }, { n: 'Madrid', id: 4 }];
const P = { _item: { label: 'n', value: 'id' } };

(async () => {
  await mountSiblings();
  env.triggerLayout = { x: 20, y: 200, width: 300, height: 44 };

  // ---- Menu
  {
    const r = React.createRef(); let a; const sel = [];
    await act(async () => { a = TR.create(h(Menu, { ref: r, trigger: () => null },
      h(Menu.Group, { title: 'Edición' },
        h(Menu.Item, { label: 'Copiar', onPress: () => sel.push('copiar') }),
        h(Menu.Item, { label: 'Marcar', closeOnSelect: false, onPress: () => sel.push('marcar') })),
      h(Menu.Divider),
      false,
      h(Menu.Group, { title: 'Peligro' },
        h(Menu.Item, { label: 'Borrar', disabled: true })))) });
    await act(async () => r.current.open()); await settle();
    assert.ok(shown('Edición') && shown('Peligro') && shown('Copiar') && shown('Borrar'), 'títulos de grupo e items');
    const menu = env.siblingRoot.root.findAll(n => n.type === 'AnimatedView' && n.props.accessibilityRole === 'menu');
    assert.equal(menu.length, 1, 'contenido con role menu');
    assert.equal(btnOf('Copiar').props.accessibilityRole, 'menuitem');
    assert.ok(btnOf('Borrar').props.disabled && btnOf('Borrar').props.accessibilityState.disabled, 'item deshabilitado');
    assert.equal(btnOf('Copiar').props.label, undefined, 'label no llega al botón como prop');
    await press('Marcar'); await wait(250);
    assert.ok(r.current.isOpen() && sel.includes('marcar'), 'closeOnSelect={false} en el item: sigue abierto');
    await press('Copiar'); await wait(250);
    assert.ok(!r.current.isOpen(), 'item normal cierra');
    await act(async () => a.unmount()); await wait(20);
    ok('Menu: Group, Divider, children falsy, disabled, closeOnSelect por item y accesibilidad');

    await act(async () => { a = TR.create(h(Menu, { ref: r, closeOnSelect: false, trigger: () => null }, h(Menu.Item, { label: 'Uno' }))) });
    await act(async () => r.current.open()); await settle(); await press('Uno'); await wait(250);
    assert.ok(r.current.isOpen(), 'closeOnSelect={false} en el Menu');
    await act(async () => r.current.close()); await wait(250); await act(async () => a.unmount());
    await act(async () => { a = TR.create(h(Menu, { ref: r, data: [], renderItem: () => null, emptyContent: h(RN.Text, null, 'Nada aquí'), trigger: () => null })) });
    await act(async () => r.current.open()); await settle();
    assert.ok(shown('Nada aquí'), 'emptyContent sin items');
    await act(async () => r.current.close()); await wait(250); await act(async () => a.unmount());
    ok('Menu: closeOnSelect a nivel de menú y emptyContent');
  }

  // ---- SearchInput: acentos, emptyText, filter
  {
    let a;
    await act(async () => { a = TR.create(h(SearchInput, { ...P, value: null, data: CIUDADES })) });
    await act(async () => input(a).props.onFocus({})); await settle();
    await act(async () => input(a).props.onChangeText('malaga')); await settle();
    assert.ok(shown('Málaga') && !shown('Madrid'), '"malaga" encuentra "Málaga"');
    await act(async () => input(a).props.onChangeText('CORDO')); await settle();
    assert.ok(shown('Córdoba'), 'mayúsculas y acentos');
    await act(async () => input(a).props.onChangeText('logrono')); await settle();
    assert.ok(shown('Logroño'), 'ñ');
    await act(async () => input(a).props.onChangeText('xyz')); await settle();
    assert.ok(shown('Sin resultados'), 'sin resultados');
    await act(async () => a.unmount()); await wait(250);
    await act(async () => { a = TR.create(h(SearchInput, { ...P, value: null, data: CIUDADES, emptyText: null })) });
    await act(async () => input(a).props.onFocus({})); await act(async () => input(a).props.onChangeText('xyz')); await settle();
    assert.ok(!shown('Sin resultados'), 'emptyText={null} lo desactiva');
    await act(async () => a.unmount()); await wait(250);
    await act(async () => { a = TR.create(h(SearchInput, { ...P, value: null, data: CIUDADES, filter: (it, t) => it.n.startsWith(t) })) });
    await act(async () => input(a).props.onFocus({})); await act(async () => input(a).props.onChangeText('M')); await settle();
    assert.ok(shown('Málaga') && shown('Madrid') && !shown('Córdoba'), 'filter personalizado');
    await act(async () => input(a).props.onChangeText('a')); await settle();
    assert.ok(!shown('Málaga'), 'filter personalizado (startsWith, distingue mayúsculas)');
    await act(async () => a.unmount()); await wait(250);
    ok('SearchInput: sin acentos ni mayúsculas, "Sin resultados", emptyText null y filter personalizado');
  }

  // ---- SearchInput: onSearch con debounce, sin filtro local, loading
  {
    const llamadas = []; let a;
    const props = (data, loading) => ({ ...P, value: null, data, loading, debounce: 100, onSearch: t => llamadas.push(t) });
    await act(async () => { a = TR.create(h(SearchInput, props([], false))) });
    await act(async () => input(a).props.onFocus({}));
    for (const t of ['m', 'ma', 'mad']) await act(async () => input(a).props.onChangeText(t));
    await wait(50); assert.equal(llamadas.length, 0, 'debounce: aún no');
    await wait(120); assert.deepEqual(llamadas, ['mad'], 'una llamada con el último texto');
    await act(async () => a.update(h(SearchInput, props([], true)))); await settle();
    assert.equal(spinners().length, 1, 'loading sin resultados: indicador');
    assert.ok(!shown('Sin resultados'), 'mientras carga no dice "sin resultados"');
    // El servidor devuelve algo que no contiene "mad" en el label: sin filtro local se muestra igual
    await act(async () => a.update(h(SearchInput, props([{ n: 'Comunidad de M.', id: 9 }], false)))); await settle();
    assert.ok(shown('Comunidad de M.') && spinners().length === 0, 'con onSearch no se filtra localmente');
    await act(async () => a.update(h(SearchInput, props([{ n: 'Comunidad de M.', id: 9 }], true)))); await settle();
    assert.ok(shown('Comunidad de M.') && spinners().length === 1, 'cargando con resultados previos: indicador encima');
    await act(async () => a.unmount()); await wait(250);
    ok('SearchInput: onSearch con debounce, sin filtro local y loading');
  }

  // ---- SearchInput: clearable y maxSelected
  {
    let valor = 'x'; let a;
    const S = ({ multiple, max }) => { const [v, setV] = React.useState(multiple ? [] : CIUDADES[3]); valor = v; return h(SearchInput, { ...P, value: v, onChange: setV, data: CIUDADES, clearable: true, multiple, maxSelected: max }) };
    await act(async () => { a = TR.create(h(S, {})) });
    assert.equal(input(a).props.value, 'Madrid');
    const clear = () => a.root.findAll(n => n.type === 'Pressable' && n.props.accessibilityLabel === 'Borrar');
    assert.equal(clear().length, 1, 'botón borrar visible con valor');
    await act(async () => clear()[0].props.onPress());
    assert.ok(valor === null && input(a).props.value === '', 'borra texto y valor');
    assert.equal(clear().length, 0, 'sin texto ni valor no hay botón');
    await act(async () => a.unmount()); await wait(250);

    await act(async () => { a = TR.create(h(S, { multiple: true, max: 2 })) });
    await act(async () => input(a).props.onFocus({})); await settle();
    await press('Málaga'); await settle(); await press('Córdoba'); await settle();
    assert.equal(valor.length, 2);
    assert.ok(!shown('Logroño') && !shown('Madrid'), 'con maxSelected alcanzado la lista no se muestra');
    await act(async () => a.unmount()); await wait(250);
    ok('SearchInput: clearable (texto y valor) y maxSelected');
  }
  // ---- Modo absolute: "Sin resultados" y loading en la lista del propio árbol
  {
    let a; const enApp = txt => a.root.findAll(n => n.type === 'Text' && n.children?.includes?.(txt)).length > 0;
    await act(async () => { a = TR.create(h(SearchInput, { ...P, listType: 'absolute', value: null, data: CIUDADES })) });
    await act(async () => input(a).props.onFocus({})); await act(async () => input(a).props.onChangeText('xyz')); await wait(20);
    assert.ok(enApp('Sin resultados'), 'absolute: sin resultados');
    await act(async () => a.update(h(SearchInput, { ...P, listType: 'absolute', value: null, data: CIUDADES, loading: true }))); await wait(20);
    assert.ok(a.root.findAll(n => n.type === 'Spinner').length === 1 && !enApp('Sin resultados'), 'absolute: cargando');
    await act(async () => a.unmount());
    ok('SearchInput absolute: "Sin resultados" y loading');
  }
  // ---- Absolute: con el input enfocado el contenedor conserva zIndex/elevation aunque la lista se quede
  // sin contenido (quitarlos reordena la vista en Fabric y Android quita el foco al input)
  {
    let a; let valor = [];
    const S = () => { const [v, setV] = React.useState([]); valor = v; return h(SearchInput, { ...P, listType: 'absolute', multiple: true, maxSelected: 1, value: v, onChange: setV, data: CIUDADES }) };
    await act(async () => { a = TR.create(h(S)) });
    const cont = () => a.root.findAll(n => n.type === 'View' && n.props.collapsable === false && n.props.style !== undefined)[0];
    const z = () => [].concat(cont()?.props.style || []).flat(9).filter(Boolean).reduce((o, x) => ({ ...o, ...x }), {}).zIndex;
    await act(async () => input(a).props.onFocus({})); await wait(20);
    assert.equal(z(), 1000, 'abierta: zIndex');
    const btn = a.root.findAll(n => n.type === 'Pressable' && n.props.onPress && n.findAll(x => x.children?.includes?.('Málaga')).length)[0];
    await act(async () => btn.props.onPress()); await wait(20);
    assert.equal(valor.length, 1);
    assert.equal(z(), 1000, 'máximo alcanzado con foco: conserva zIndex');
    assert.ok(a.root.findAll(n => n.props?.pointerEvents === 'none').length > 0, 'lista oculta y sin toques, pero montada');
    await act(async () => input(a).props.onBlur({})); await wait(20);
    assert.equal(z(), undefined, 'sin foco: sin zIndex');
    await act(async () => a.unmount());
    ok('absolute: con foco conserva zIndex y la lista montada aunque se quede sin contenido');
  }
  // ---- Estilos: _emptyText, _loading, _clearable, _tags, _tag, _tagRemove y Menu _divider/_groupTitle/_title
  {
    const flat = n => [].concat(n.props.style || []).flat(9).filter(Boolean).reduce((o, x) => ({ ...o, ...x }), {});
    let a;
    await act(async () => { a = TR.create(h(SearchInput, { ...P, value: null, data: CIUDADES, _emptyText: { color: 'danger.100', fontSize: 20 } })) });
    await act(async () => input(a).props.onFocus({})); await act(async () => input(a).props.onChangeText('xyz')); await settle();
    const vacio = env.siblingRoot.root.findAll(n => n.type === 'Text' && n.children?.includes?.('Sin resultados'))[0];
    assert.equal(flat(vacio).fontSize, 20, '_emptyText');
    await act(async () => a.update(h(SearchInput, { ...P, value: null, data: CIUDADES, loading: true, _loading: { color: 'danger.100', size: 'large', _container: { py: 6 } } }))); await settle();
    const sp = spinners()[0];
    assert.equal(sp.props.size, 'large', '_loading: props del spinner');
    let n = sp.parent; while (n && !(n.type === 'View' && flat(n).paddingVertical !== undefined)) n = n.parent;
    assert.equal(n && flat(n).paddingVertical, 24, '_loading._container');
    await act(async () => a.unmount()); await wait(250);

    const S = () => { const [v, setV] = React.useState([CIUDADES[0]]); return h(SearchInput, { ...P, multiple: true, clearable: true, value: v, onChange: setV, data: CIUDADES,
      _clearable: { accessibilityLabel: 'Limpiar', p: 2 }, _tags: { gap: 2 }, _tag: { bg: 'primary.50', _text: { color: 'primary.100' } }, _tagRemove: { colorScheme: 'primary', accessibilityHint: 'quita' } }) };
    await act(async () => { a = TR.create(h(S)) });
    await act(async () => input(a).props.onChangeText('x'));
    const limpiar = a.root.findAll(n => n.type === 'Pressable' && n.props.accessibilityLabel === 'Limpiar');
    assert.equal(limpiar.length, 1, '_clearable: props del botón');
    await act(async () => limpiar[0].props.onPress());
    assert.equal(input(a).props.value, '', '_clearable mantiene su función');
    const quitar = a.root.findAll(n => n.type === 'Pressable' && n.props.accessibilityHint === 'quita');
    assert.equal(quitar.length, 1, '_tagRemove');
    assert.equal(quitar[0].props.accessibilityLabel, 'Quitar Málaga', 'accesibilidad del botón quitar');
    const textoTag = a.root.findAll(n => n.type === 'Text' && n.children?.includes?.('Málaga'))[0];
    assert.ok(textoTag && JSON.stringify(flat(textoTag)).includes('"color"'), '_tag._text');
    await act(async () => quitar[0].props.onPress());
    assert.equal(a.root.findAll(n => n.type === 'Pressable' && n.props.accessibilityHint === 'quita').length, 0, '_tagRemove mantiene su función');
    await act(async () => a.unmount()); await wait(250);
    ok('SearchInput: _emptyText, _loading (+_container), _clearable, _tags, _tag y _tagRemove');

    const r = React.createRef();
    await act(async () => { a = TR.create(h(Menu, { ref: r, trigger: () => null, _divider: { my: 3 }, _groupTitle: { fontSize: 15 } },
      h(Menu.Group, { title: 'Uno', _title: { color: 'danger.100' } }, h(Menu.Item, { label: 'a' })),
      h(Menu.Divider), h(Menu.Divider, { my: 5 }),
      h(Menu.Group, { title: 'Dos' }, h(Menu.Item, { label: 'b' })))) });
    await act(async () => r.current.open()); await settle();
    const t = txt => env.siblingRoot.root.findAll(n => n.type === 'Text' && n.children?.includes?.(txt))[0];
    assert.equal(flat(t('Uno')).fontSize, 15, '_groupTitle del Menu');
    assert.equal(flat(t('Dos')).fontSize, 15);
    assert.ok(flat(t('Uno')).color && flat(t('Uno')).color !== flat(t('Dos')).color, '_title del grupo se suma');
    const divs = env.siblingRoot.root.findAll(n => n.type === 'View' && flat(n).height !== undefined && flat(n).height < 2);
    assert.deepEqual(divs.map(d => flat(d).marginVertical), [12, 20], '_divider del Menu y props propias del Divider');
    await act(async () => r.current.close()); await wait(250); await act(async () => a.unmount());
    ok('Menu: _divider, _groupTitle y _title / props propias de Divider');
  }

  // ---- Rendimiento: el filtrado no se repite si no cambian datos, texto ni selección
  {
    let llamadas = 0; const filtro = (it, t) => { llamadas++; return it.n.includes(t) };
    let forzar; const Padre = () => { const [, set] = React.useState(0); forzar = () => set(x => x + 1); return h(SearchInput, { ...P, value: null, data: CIUDADES, filter: filtro }) };
    let a; await act(async () => { a = TR.create(h(Padre)) });
    await act(async () => input(a).props.onChangeText('M')); await wait(20);
    const tras = llamadas; assert.ok(tras > 0);
    for (let i = 0; i < 5; i++) await act(async () => forzar());
    assert.equal(llamadas, tras, 'renders del padre sin cambios: no vuelve a filtrar');
    await act(async () => input(a).props.onChangeText('Ma')); await wait(20);
    assert.ok(llamadas > tras, 'cambia el texto: filtra');
    await act(async () => a.unmount()); await wait(250);
    ok('rendimiento: filtrado memorizado');
  }
  // ---- Simple con valor elegido: al volver a abrir muestra las demás opciones (no "Sin resultados")
  for (const listType of ['menu', 'absolute']) {
    let a; const S = () => { const [v, setV] = React.useState(CIUDADES[3]); return h(SearchInput, { ...P, listType, value: v, onChange: setV, data: CIUDADES }) };
    const visto = txt => [env.siblingRoot.root, a.root].some(r => r.findAll(n => n.type === 'Text' && n.children?.includes?.(txt)).length > 0);
    await act(async () => { a = TR.create(h(S)) });
    assert.equal(input(a).props.value, 'Madrid');
    await act(async () => input(a).props.onFocus({})); await settle();
    assert.ok(!visto('Sin resultados'), listType + ': no dice "Sin resultados"');
    const opcion = txt => [env.siblingRoot.root, a.root].some(r => r.findAll(n => n.type === 'Pressable' && n.props.onPress && n.findAll(x => x.children?.includes?.(txt)).length).length > 0);
    assert.ok(opcion('Madrid'), listType + ': aparece la opción elegida (coincide con el texto)');
    assert.ok(!visto('Málaga') && !visto('Córdoba'), listType + ': solo las que coinciden con el texto');
    await act(async () => input(a).props.onChangeText('Madri')); await settle();
    assert.ok(visto('Madrid') && !visto('Málaga'), listType + ': al editar vuelve a filtrar');
    await act(async () => input(a).props.onChangeText('Madridx')); await settle();
    assert.ok(visto('Sin resultados'), listType + ': buscando sin coincidencias sí lo dice');
    await act(async () => a.unmount()); await wait(250);
  }
  ok('simple con valor: al reabrir filtra por su texto y muestra la elegida; al editar filtra');
})().catch(e => { console.error('FALLO', e); process.exit(1) });
