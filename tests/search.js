// Pruebas de SearchInput: ids falsy, filtro, elegir en simple y múltiple
const assert = require('assert');
const { React, h, TR, act, RN, env, lib, wait, mountSiblings, shown } = require('./harness');
const { SearchInput } = lib('SearchInput');
const ok = msg => console.log('OK ' + msg);
const DATA = [{ nombre: 'Madrid', id: 0 }, { nombre: 'Lima', id: 1 }, { nombre: 'Bogotá', id: 2 }];
const layoutAll = async () => { await act(async () => env.siblingRoot.root.findAll(n => n.type === 'AnimatedView' && n.props.onLayout).forEach(n => n.props.onLayout({ nativeEvent: { layout: { width: 200, height: 120 } } }))) };
const settle = async () => { await wait(10); await layoutAll(); await wait(10); await layoutAll(); await wait(250); };
const input = app => app.root.findAll(n => n.props && typeof n.props.onChangeText === 'function' && n.props.onFocus)[0];
const pressItem = async txt => {
  const btn = env.siblingRoot.root.findAll(n => n.type === 'Pressable' && n.props.onPress).find(p => p.findAll(n => n.children?.includes?.(txt)).length);
  assert.ok(btn, 'item ' + txt); await act(async () => btn.props.onPress());
};

(async () => {
  await mountSiblings();
  env.triggerLayout = { x: 20, y: 200, width: 300, height: 44 };

  // Simple
  let valor = null; let app;
  const S = () => { const [v, setV] = React.useState(null); valor = v; return h(SearchInput, { value: v, onChange: setV, data: DATA, _item: { label: 'nombre', value: 'id' } }) };
  await act(async () => { app = TR.create(h(S)) });
  await act(async () => input(app).props.onFocus({})); await settle();
  assert.ok(shown('Madrid') && shown('Lima') && shown('Bogotá'), 'el item con id 0 aparece');
  ok('item con id 0 visible sin selección');
  await act(async () => input(app).props.onChangeText('li')); await settle();
  assert.ok(shown('Lima') && !shown('Madrid'), 'filtra por texto');
  await pressItem('Lima'); await wait(250);
  assert.deepEqual(valor, { nombre: 'Lima', id: 1 });
  assert.ok(!shown('Bogotá'), 'en modo simple se cierra al elegir');
  ok('simple: filtra, elige y cierra');
  await act(async () => input(app).props.onChangeText('')); await settle();
  assert.ok(valor === null && shown('Madrid') && shown('Lima'), 'al escribir se reabre y borra la selección');
  ok('escribir reabre el menú');
  await act(async () => app.unmount()); await wait(20);

  // Múltiple
  let lista = []; let app2;
  const M = () => { const [v, setV] = React.useState([]); lista = v; return h(SearchInput, { multiple: true, value: v, onChange: setV, data: DATA, _item: { label: 'nombre', value: 'id' } }) };
  await act(async () => { app2 = TR.create(h(M)) });
  await act(async () => input(app2).props.onFocus({})); await settle();
  await pressItem('Madrid'); await settle();
  assert.ok(shown('Lima') && !env.siblingRoot.root.findAll(n => n.type === 'Pressable' && n.props.onPress).some(p => p.findAll(n => n.children?.includes?.('Madrid')).length), 'múltiple: sigue abierto y no repite lo elegido');
  await pressItem('Bogotá'); await settle();
  assert.deepEqual(lista.map(c => c.id), [0, 2]);
  ok('múltiple: sigue abierto, no repite y acumula (incluido id 0)');
  await act(async () => app2.unmount()); await wait(20);

  // Valor borrado desde fuera (reset de formulario) limpia el texto; escribir no lo borra
  {
    let app4; const props = v => ({ value: v, data: DATA, _item: { label: 'nombre', value: 'id', variant: 'ghost' } });
    await act(async () => { app4 = TR.create(h(SearchInput, props(DATA[1]))) });
    assert.equal(input(app4).props.value, 'Lima');
    await act(async () => app4.update(h(SearchInput, props(null))));
    assert.equal(input(app4).props.value, '', 'reset desde fuera limpia el texto');
    await act(async () => app4.update(h(SearchInput, props(DATA[1]))));
    await act(async () => input(app4).props.onChangeText('Lim'));
    await act(async () => app4.update(h(SearchInput, props(null))));
    assert.equal(input(app4).props.value, 'Lim', 'lo que escribe el usuario no se borra');
    // label/value de _item no llegan al botón como props
    await act(async () => input(app4).props.onFocus({})); await settle();
    const btns = env.siblingRoot.root.findAll(n => n.type === 'Pressable' && n.props.onPress && n.findAll(x => x.children?.includes?.('Lima')).length);
    assert.ok(btns.length > 0, 'opción visible');
    assert.ok(btns.every(b => b.props.label === undefined && b.props.value === undefined), 'sin label/value en el botón');
    await act(async () => app4.unmount()); await wait(250);
    ok('reset desde fuera limpia el texto; escribir no; _item no pasa label/value al botón');
  }

  // Modo menu: sin backdrop por defecto; con backdrop, tocar fuera cierra
  {
    let app3;
    await act(async () => { app3 = TR.create(h(SearchInput, { value: null, data: DATA, _item: { label: 'nombre', value: 'id' } })) });
    await act(async () => input(app3).props.onFocus({})); await settle();
    const fondo = () => env.siblingRoot.root.findAll(n => n.type === 'Pressable' && n.props.onPress && n.props.flex === 1);
    assert.ok(shown('Lima') && fondo().length === 0, 'modo menu: sin backdrop por defecto');
    await act(async () => input(app3).props.onBlur({})); await wait(250);
    assert.ok(!shown('Lima'), 'perder el foco cierra la lista');
    await act(async () => app3.unmount()); await wait(20);
    await act(async () => { app3 = TR.create(h(SearchInput, { backdrop: true, value: null, data: DATA, _item: { label: 'nombre', value: 'id' } })) });
    await act(async () => input(app3).props.onFocus({})); await settle();
    assert.equal(fondo().length, 1, 'con backdrop: hay fondo');
    await act(async () => fondo()[0].props.onPress()); await wait(250);
    assert.ok(!shown('Lima'), 'tocar el backdrop cierra la lista');
    await act(async () => app3.unmount()); await wait(20);
    ok('modo menu: sin backdrop por defecto; con backdrop tocar fuera cierra');
  }

  // Modo absolute: lista en el propio árbol (sin portal), filtra, elige y cierra
  {
    let v = null; let app4;
    const A = () => { const [val, setVal] = React.useState(null); v = val; return h(SearchInput, { listType: 'absolute', value: val, onChange: setVal, data: DATA, _item: { label: 'nombre', value: 'id' } }) };
    await act(async () => { app4 = TR.create(h(A)) });
    const enApp = txt => app4.root.findAll(n => typeof n.type === 'string' && n.children.includes(txt)).length > 0;
    assert.ok(!enApp('Madrid'), 'cerrada al inicio');
    await act(async () => input(app4).props.onFocus({}));
    assert.ok(enApp('Madrid') && enApp('Lima') && !shown('Madrid'), 'abre en el propio árbol, no en un portal');
    const lista = app4.root.findAll(n => n.props && n.props.position === 'absolute' && n.props.onLayout)[0];
    assert.ok(lista, 'lista en position absolute bajo el input');
    await act(async () => input(app4).props.onChangeText('bo'));
    assert.ok(enApp('Bogotá') && !enApp('Madrid'), 'filtra');
    const btn = app4.root.findAll(n => n.type === 'Pressable' && n.props.onPress).find(p => p.findAll(n => n.children?.includes?.('Bogotá')).length);
    await act(async () => btn.props.onPress());
    assert.deepEqual(v, { nombre: 'Bogotá', id: 2 }); assert.ok(!app4.root.findAll(n => n.props && n.props.position === 'absolute' && n.props.onLayout).length, 'se cierra al elegir');
    await act(async () => input(app4).props.onFocus({})); await act(async () => input(app4).props.onBlur({}));
    assert.ok(!app4.root.findAll(n => n.props && n.props.position === 'absolute' && n.props.onLayout).length, 'se cierra al perder el foco');
    await act(async () => app4.unmount());
    ok('modo absolute: lista bajo el input sin portal; filtra, elige, cierra al elegir y al perder el foco');
  }

  // Modo absolute: placement y cambio de lado según el espacio (pantalla simulada 800 de alto, insets 20/10)
  {
    const listaAbs = app => app.root.findAll(n => n.props && n.props.position === 'absolute' && n.props.onLayout)[0];
    const contenedor = app => app.root.findAll(n => n.type === 'View' && n.props.style && n.props.style.zIndex === 1000)[0];
    const abrir = async (props, trig) => {
      env.triggerLayout = trig;
      let app;
      await act(async () => { app = TR.create(h(SearchInput, { listType: 'absolute', value: null, data: DATA, _item: { label: 'nombre', value: 'id' }, ...props })) });
      // layout del input (alto 44) y de la lista (alto 120)
      await act(async () => app.root.findAll(n => n.type === 'View' && n.props.onLayout && !n.props.position)[0].props.onLayout({ nativeEvent: { layout: { height: 44 } } }));
      await act(async () => input(app).props.onFocus({}));
      await act(async () => listaAbs(app).props.onLayout({ nativeEvent: { layout: { height: 120 } } }));
      await wait(450);
      return app;
    };

    let app = await abrir({}, { x: 20, y: 200, width: 300, height: 44 });
    let l = listaAbs(app);
    assert.equal(l.props.opacity, 1); assert.equal(l.props.top, 44 + 4, 'por defecto abajo, bajo el input');
    assert.equal(contenedor(app).props.style.paddingBottom, 124, 'área táctil ampliada hacia abajo');
    await act(async () => app.unmount());

    app = await abrir({}, { x: 20, y: 700, width: 300, height: 44 });
    l = listaAbs(app);
    assert.equal(l.props.top, 0, 'sin sitio abajo: cambia arriba');
    assert.equal(contenedor(app).props.style.paddingTop, 124, 'área táctil ampliada hacia arriba');
    await act(async () => app.unmount());

    app = await abrir({ placement: 'top' }, { x: 20, y: 400, width: 300, height: 44 });
    assert.equal(listaAbs(app).props.top, 0, 'placement="top" con sitio arriba');
    await act(async () => app.unmount());

    // Con teclado: el input a media pantalla se queda sin sitio abajo y la lista pasa arriba con alto limitado
    app = await abrir({}, { x: 20, y: 380, width: 300, height: 44 });
    assert.equal(listaAbs(app).props.top, 44 + 4, 'sin teclado: abajo');
    await act(async () => RN.Keyboard.emit('keyboardDidShow', 350)); await wait(450);
    assert.equal(listaAbs(app).props.top, 0, 'con teclado: arriba');
    assert.ok(listaAbs(app).props.maxH <= 380 - 20 - 4 - 8, 'alto limitado al espacio de arriba');
    await act(async () => RN.Keyboard.emit('keyboardDidHide', 0)); await wait(450);
    await act(async () => app.unmount());
    app = await abrir({ placement: 'top', fixedPlacement: true }, { x: 20, y: 120, width: 300, height: 44 });
    assert.equal(listaAbs(app).props.top, 0, 'fixedPlacement top: sigue arriba aunque no quepa');
    await act(async () => app.unmount());
    ok('modo absolute: placement bottom/top, cambia de lado si no cabe (también con teclado) y limita su alto');
  }

  // Menu: con el trigger bajo el teclado, la lista no baja de la parte superior del teclado
  {
    const { Menu } = lib('Menu');
    env.triggerLayout = { x: 20, y: 600, width: 200, height: 40 };
    await act(async () => RN.Keyboard.emit('keyboardDidShow', 300));
    const r = React.createRef(); let a;
    await act(async () => { a = TR.create(h(Menu, { ref: r, trigger: () => h(RN.Text, null, 'tk') }, h(Menu.Item, { label: 'Uno' }))) });
    await act(async () => r.current.open()); await wait(10);
    await act(async () => env.siblingRoot.root.findAll(n => n.type === 'AnimatedView' && n.props.onLayout).forEach(n => n.props.onLayout({ nativeEvent: { layout: { width: 150, height: 100 } } })));
    await wait(500);
    const v = env.siblingRoot.root.findAll(n => n.type === 'AnimatedView' && n.props.onLayout)[0];
    const st = Object.assign({}, ...[].concat(v.props.style).flat(9).filter(Boolean));
    assert.ok(st.bottom >= 300 + 8, 'anclada por encima del teclado (bottom ' + st.bottom + ')');
    await act(async () => r.current.close()); await wait(300); await act(async () => a.unmount());
    await act(async () => RN.Keyboard.emit('keyboardDidHide', 0));
    ok('Menu: con el trigger bajo el teclado la lista queda encima del teclado');
  }
})().catch(e => { console.error('FALLO', e); process.exit(1) });
