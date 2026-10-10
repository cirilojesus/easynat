// Pruebas del Menu: posición, apertura por ref, defaultOpen, items, callbacks, back, teclado y ráfagas
const assert = require('assert');
const { React, h, TR, act, RN, siblings, env, lib, wait, mountSiblings, shown } = require('./harness');
const { Menu } = lib('Menu');
const ok = msg => console.log('OK ' + msg);

// Contenido del menú: el AnimatedView con onLayout dentro del portal
const content = () => env.siblingRoot.root.findAll(n => n.type === 'AnimatedView' && n.props.onLayout)[0];
const style = () => Object.assign({}, ...[].concat(content().props.style).flat(9).filter(Boolean));
const opacity = () => { const o = style().opacity; return typeof o === 'object' ? o.v : o; };
// Simula el layout nativo del contenido con un ancho dado
const layout = async (width = 150) => { await act(async () => content()?.props.onLayout({ nativeEvent: { layout: { width, height: 120 } } })) };
const settle = async (width) => { await wait(10); await layout(width); await wait(10); await layout(width); await wait(250); };
const pressItem = async txt => {
  const btn = env.siblingRoot.root.findAll(n => n.type === 'Pressable' && n.props.onPress).find(p => p.findAll(n => n.children?.includes?.(txt)).length);
  assert.ok(btn, 'item ' + txt); await act(async () => btn.props.onPress());
};

(async () => {
  await mountSiblings();
  const items = [h(Menu.Item, { key: 1, label: 'Editar' }), h(Menu.Item, { key: 2, label: 'Borrar' })];

  // 1. Abrir con el trigger: oculto hasta medir; luego debajo del trigger
  env.triggerLayout = { x: 20, y: 300, width: 200, height: 40 };
  let triggerProps; const events = [];
  const ref = React.createRef(); let app;
  await act(async () => { app = TR.create(h(Menu, { ref, onOpen: () => events.push('open'), onClose: () => events.push('close'), trigger: p => { triggerProps = p; return h(RN.Text, null, 'trigger') } }, ...items)) });
  await act(async () => triggerProps.onPress()); // sin evento: no debe romper
  await wait(10);
  assert.equal(opacity(), 0, 'no se muestra antes de estar posicionado/animado');
  await settle();
  const s1 = style();
  assert.equal(opacity(), 1, 'visible tras abrir');
  assert.equal(s1.top, 300 + 40 + 4, 'debajo del trigger (y + alto + gap)');
  assert.equal(s1.left, 20, 'alineado a la izquierda del trigger (menuDir=left)');
  assert.ok(triggerProps.isOpen && events.join() === 'open', 'trigger recibe isOpen y onOpen se llama');
  ok('abrir con el trigger (sin evento): oculto hasta posicionarse, luego debajo y alineado');

  // 2. Elegir un Menu.Item cierra el menú y llama a onClose
  await pressItem('Editar'); await wait(200);
  assert.ok(!shown('Editar') && events.join() === 'open,close');
  assert.ok(RN.Keyboard.count <= 5, 'listeners de teclado acotados (store global)');
  ok('Menu.Item cierra el menú y llama a onClose');

  // 3. Abrir por ref sin haber pulsado el trigger: se posiciona igual
  env.triggerLayout = { x: 50, y: 100, width: 100, height: 30 };
  await act(async () => ref.current.open()); await settle();
  assert.equal(style().top, 100 + 30 + 4, 'posicionado bajo el trigger aunque se abra por ref');
  assert.ok(ref.current.isOpen());
  ok('ref.open() lo posiciona en el trigger (antes salía en 0,0)');

  // 4. Botón atrás de Android lo cierra
  let handled; await act(async () => { handled = RN.BackHandler.press() }); await wait(200);
  assert.ok(handled && !ref.current.isOpen() && !shown('Editar'));
  ok('el botón atrás cierra el menú');
  await act(async () => app.unmount());

  // 5. Sin espacio abajo: se coloca arriba anclado con bottom (sin depender de su altura)
  env.triggerLayout = { x: 20, y: 720, width: 200, height: 40 };
  const r2 = React.createRef(); let a2;
  await act(async () => { a2 = TR.create(h(Menu, { ref: r2, trigger: () => h(RN.Text, null, 't2') }, ...items)) });
  await act(async () => r2.current.open()); await settle();
  const s5 = style();
  assert.equal(s5.top, undefined); assert.equal(s5.bottom, 800 - 720 + 4, 'anclado arriba del trigger');
  ok('sin espacio abajo se coloca arriba, anclado con bottom');
  await act(async () => r2.current.close()); await wait(200); await act(async () => a2.unmount());

  // 6. Horizontal: no se sale de la pantalla
  env.triggerLayout = { x: 330, y: 200, width: 60, height: 30 };
  const r3 = React.createRef(); let a3;
  await act(async () => { a3 = TR.create(h(Menu, { ref: r3, trigger: () => h(RN.Text, null, 't3') }, ...items)) });
  await act(async () => r3.current.open()); await settle(180);
  assert.equal(style().left, 400 - 180 - 8, 'menuDir=left pegado al borde derecho sin salirse');
  await act(async () => r3.current.close()); await wait(200); await act(async () => a3.unmount());
  env.triggerLayout = { x: 10, y: 200, width: 60, height: 30 };
  const r4 = React.createRef(); let a4;
  await act(async () => { a4 = TR.create(h(Menu, { ref: r4, menuDir: 'right', trigger: () => h(RN.Text, null, 't4') }, ...items)) });
  await act(async () => r4.current.open()); await settle(180);
  assert.equal(style().left, 8, 'menuDir=right sin salirse por la izquierda');
  await act(async () => r4.current.close()); await wait(200); await act(async () => a4.unmount());
  ok('horizontal: alineado con el trigger y sin salirse de la pantalla (left/right)');

  // 7. data + renderItem reciben close()
  env.triggerLayout = { x: 20, y: 300, width: 200, height: 40 };
  const r5 = React.createRef(); let a5; const elegidos = [];
  await act(async () => {
    a5 = TR.create(h(Menu, {
      ref: r5, trigger: () => h(RN.Text, null, 't5'), data: ['uno', 'dos'],
      renderItem: ({ item, close }) => h(RN.Pressable, { onPress: () => { elegidos.push(item); close() } }, h(RN.Text, null, item)),
    }))
  });
  await act(async () => r5.current.open()); await settle();
  await pressItem('dos'); await wait(200);
  assert.deepEqual(elegidos, ['dos']); assert.ok(!r5.current.isOpen() && !shown('uno'));
  ok('renderItem recibe close() para cerrar al elegir');
  await act(async () => a5.unmount());

  // 8. defaultOpen: monta abierto, posicionado (no en 0,0) y con onOpen una vez
  env.triggerLayout = { x: 40, y: 150, width: 100, height: 30 };
  let opened = 0; let a6; const r6 = React.createRef();
  await act(async () => { a6 = TR.create(h(Menu, { ref: r6, defaultOpen: true, onOpen: () => opened++, trigger: () => h(RN.Text, null, 't6') }, ...items)) });
  await wait(5);
  assert.equal(opacity(), 0, 'defaultOpen: oculto hasta conocer la posición del trigger');
  await layout(); await wait(20); await layout();
  assert.equal(opacity(), 1, 'defaultOpen: visible sin animación de entrada');
  assert.equal(style().top, 150 + 30 + 4, 'defaultOpen: en su sitio, no en 0,0');
  assert.ok(r6.current.isOpen() && opened === 1, 'defaultOpen cuenta como abierto y llama a onOpen');
  ok('defaultOpen: abierto, posicionado y sin quedar invisible bloqueando la pantalla');
  await act(async () => r6.current.close()); await wait(200); await act(async () => a6.unmount());

  // 9. Ráfaga de toggles: después sigue abriendo
  const r7 = React.createRef(); let a7; let tp;
  await act(async () => { a7 = TR.create(h(Menu, { ref: r7, trigger: p => { tp = p; return h(RN.Text, null, 't7') } }, ...items)) });
  let seed = 3; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 80; i++) { await act(async () => tp.onPress()); if (rnd() < 0.5) await layout(); await wait(Math.floor(rnd() * 200)); }
  await act(async () => r7.current.close()); await wait(300);
  await act(async () => r7.current.open()); await settle();
  assert.ok(r7.current.isOpen() && opacity() === 1 && shown('Editar'));
  ok('ráfaga de 80 toggles: sigue abriendo y visible');
  await act(async () => r7.current.close()); await wait(300); await act(async () => a7.unmount()); await wait(20);
  // 10. Sin items no pinta la caja; si llegan items con el menú abierto, aparece
  {
    env.triggerLayout = { x: 20, y: 300, width: 200, height: 40 };
    const r8 = React.createRef(); let a8;
    const M = ({ data }) => h(Menu, { ref: r8, data, trigger: () => h(RN.Text, null, 't8'), renderItem: ({ item }) => h(RN.Text, null, item) });
    await act(async () => { a8 = TR.create(h(M, { data: [] })) });
    await act(async () => r8.current.open()); await wait(20);
    assert.ok(!content(), 'sin items: no hay caja');
    await act(async () => a8.update(h(M, { data: ['llegó'] }))); await settle();
    assert.ok(shown('llegó') && opacity() === 1, 'al llegar items aparece animado');
    await act(async () => r8.current.close()); await wait(300); await act(async () => a8.unmount()); await wait(20);
    ok('sin items no pinta la caja vacía; aparece cuando llegan items');
  }
  // 11. placement right / left: al lado del trigger, y al otro lado si no cabe
  for (const [placement, trig, esperadoLeft, msg] of [
    ['right', { x: 20, y: 300, width: 150, height: 40 }, 20 + 150 + 4, 'right: a la derecha del trigger'],
    ['right', { x: 220, y: 300, width: 150, height: 40 }, 220 - 150 - 4, 'right sin sitio: pasa a la izquierda'],
    ['left', { x: 220, y: 300, width: 150, height: 40 }, 220 - 150 - 4, 'left: a la izquierda del trigger'],
  ]) {
    env.triggerLayout = trig;
    const r = React.createRef(); let a;
    await act(async () => { a = TR.create(h(Menu, { ref: r, placement, trigger: () => h(RN.Text, null, 'tp') }, ...items)) });
    await act(async () => r.current.open()); await settle(150);
    const st = style();
    assert.equal(st.left, esperadoLeft, msg);
    assert.equal(st.top, 300, placement + ': alineado con la parte superior del trigger');
    await act(async () => r.current.close()); await wait(250); await act(async () => a.unmount());
  }
  // right cerca del borde inferior: sube para caber (alto simulado del menú: 120)
  {
    env.triggerLayout = { x: 20, y: 760, width: 150, height: 30 };
    const r = React.createRef(); let a;
    await act(async () => { a = TR.create(h(Menu, { ref: r, placement: 'right', trigger: () => h(RN.Text, null, 'tb') }, ...items)) });
    await act(async () => r.current.open()); await settle(150);
    assert.equal(style().top, 800 - 10 - 8 - 120, 'sube para no salirse por abajo (alto - insets.bottom - borde - alto del menú)');
    await act(async () => r.current.close()); await wait(250); await act(async () => a.unmount());
  }
  ok('placement right / left: al lado del trigger y cambia de lado si no cabe');
  // 11b. Ancho según el contenido: se mide primero oculto en la esquina (con todo el ancho) y luego se coloca
  for (const [props, esperadoLeft] of [[{ menuDir: 'right' }, 320 + 60 - 150], [{ placement: 'left' }, 320 - 150 - 4]]) {
    env.triggerLayout = { x: 320, y: 100, width: 60, height: 40 };
    const r = React.createRef(); let a;
    await act(async () => { a = TR.create(h(Menu, { ref: r, ...props, trigger: () => h(RN.Text, null, 'w') }, ...items)) });
    await act(async () => r.current.open()); await wait(10);
    assert.deepEqual([style().left, style().top, opacity()], [0, 0, 0], 'primer layout: oculto en la esquina para medir su ancho natural');
    await settle(150);
    assert.equal(style().left, esperadoLeft, 'luego en su sitio con su ancho real (' + JSON.stringify(props) + ')');
    assert.equal(opacity(), 1, 'y visible');
    await act(async () => r.current.close()); await wait(250); await act(async () => a.unmount());
  }
  ok('ancho según el contenido: mide oculto y se coloca bien con menuDir right y placement left');

  // 12. fixedPlacement: se queda en su lado aunque no quepa
  {
    env.triggerLayout = { x: 20, y: 720, width: 200, height: 40 };
    const r = React.createRef(); let a;
    await act(async () => { a = TR.create(h(Menu, { ref: r, fixedPlacement: true, trigger: () => h(RN.Text, null, 'fx') }, ...items)) });
    await act(async () => r.current.open()); await settle();
    assert.equal(style().top, 720 + 40 + 4, 'fixedPlacement bottom: sigue abajo aunque no quepa');
    await act(async () => r.current.close()); await wait(250); await act(async () => a.unmount());
    env.triggerLayout = { x: 20, y: 720, width: 200, height: 40 };
    await act(async () => { a = TR.create(h(Menu, { ref: r, trigger: () => h(RN.Text, null, 'fx2') }, ...items)) });
    await act(async () => r.current.open()); await settle();
    assert.equal(style().top, undefined, 'sin fixedPlacement: cambia arriba');
    await act(async () => r.current.close()); await wait(250); await act(async () => a.unmount());
    ok('fixedPlacement mantiene el lado; sin él cambia si no cabe');
  }

  // 13. Sigue al trigger mientras está abierto (teclado / KeyboardAvoidingView / scroll lo mueven)
  {
    env.triggerLayout = { x: 20, y: 500, width: 200, height: 40 };
    const r = React.createRef(); let a; let renders = 0;
    const Contador = () => { renders++; return null };
    await act(async () => { a = TR.create(h(Menu, { ref: r, trigger: () => h(RN.Text, null, 'seg') }, h(Menu.Item, { label: 'Uno' }), h(Contador, { key: 'c' }))) });
    await act(async () => r.current.open()); await settle();
    assert.equal(style().top, 500 + 40 + 4);
    const antes = renders; await wait(350);
    assert.equal(renders, antes, 'posición igual: no re-renderiza aunque mida cada 100 ms');
    env.triggerLayout = { x: 20, y: 300, width: 200, height: 40 };  // el trigger sube (p. ej. KeyboardAvoidingView)
    await wait(250);
    assert.equal(style().top, 300 + 40 + 4, 'se recoloca junto al trigger que se movió');
    await act(async () => r.current.close()); await wait(250); await act(async () => a.unmount());
    ok('sigue al trigger mientras está abierto, sin re-renders si no se mueve');
  }
  assert.equal(siblings.size, 0, 'sin siblings huérfanos');
  assert.ok(RN.Keyboard.count <= 5, 'listeners de teclado acotados, no uno por menú');
})().catch(e => { console.error('FALLO', e); process.exit(1) });
