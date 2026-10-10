// Pruebas: Menu dentro de un Modal y menús anidados
const assert = require('assert');
const { React, h, TR, act, RN, siblings, env, lib, wait, mountSiblings, shown } = require('./harness');
const { Menu } = lib('Menu');
const { Modal } = lib('Modal');
const ok = msg => console.log('OK ' + msg);

// Contenidos de menú abiertos (AnimatedView con onLayout y estilo absoluto con left)
const menuContents = () => env.siblingRoot.root.findAll(n => n.type === 'AnimatedView' && n.props.onLayout && [].concat(n.props.style).flat(9).some(s => s && s.left !== undefined));
const layoutAll = async () => { await act(async () => env.siblingRoot.root.findAll(n => n.type === 'AnimatedView' && n.props.onLayout).forEach(n => n.props.onLayout({ nativeEvent: { layout: { width: 150, height: 120 } } }))) };
const settle = async () => { await wait(10); await layoutAll(); await wait(10); await layoutAll(); await wait(350); };
let appRoot = null;
const press = async txt => {
  const roots = [env.siblingRoot.root, appRoot?.root].filter(Boolean);
  const btn = roots.flatMap(r => r.findAll(n => n.type === 'Pressable' && n.props.onPress)).find(p => p.findAll(n => n.children?.includes?.(txt)).length);
  assert.ok(btn, 'botón ' + txt); await act(async () => btn.props.onPress());
};

(async () => {
  await mountSiblings();

  // --- Menu dentro de un Modal
  env.triggerLayout = { x: 30, y: 500, width: 200, height: 40 };
  const modal = React.createRef(); const menu = React.createRef(); let app; const elegidos = [];
  await act(async () => {
    app = TR.create(h(Modal, { ref: modal },
      h(Menu, { ref: menu, trigger: ({ onPress }) => h(RN.Pressable, { onPress }, h(RN.Text, null, 'abrir menú')) },
        h(Menu.Item, { label: 'Opción modal', onPress: () => elegidos.push('modal') }))))
  });
  await act(async () => modal.current.open()); await settle();
  assert.ok(shown('abrir menú'));
  await press('abrir menú'); await settle();
  assert.ok(shown('Opción modal') && menu.current.isOpen());
  const st = Object.assign({}, ...[].concat(menuContents()[0].props.style).flat(9).filter(Boolean));
  assert.equal(st.top, 500 + 40 + 4, 'posicionado bajo su trigger dentro del modal');
  ok('menú dentro de un modal: se abre encima del modal y en su sitio');

  await act(async () => RN.BackHandler.press()); await wait(250);
  assert.ok(!menu.current.isOpen() && modal.current.isOpen(), 'atrás cierra primero el menú, el modal sigue');
  await press('abrir menú'); await settle();
  await press('Opción modal'); await wait(250);
  assert.deepEqual(elegidos, ['modal']);
  assert.ok(!menu.current.isOpen() && modal.current.isOpen(), 'elegir un item cierra el menú pero no el modal');
  await act(async () => RN.BackHandler.press()); await wait(400);
  assert.ok(!modal.current.isOpen() && !shown('abrir menú'), 'un segundo atrás cierra el modal');
  ok('dentro del modal: atrás cierra el menú y luego el modal; elegir no cierra el modal');
  await act(async () => app.unmount()); await wait(20);

  // --- Menús anidados
  env.triggerLayout = { x: 20, y: 200, width: 200, height: 40 };
  const padre = React.createRef(); const hijo = React.createRef(); let a2; const sel = [];
  await act(async () => {
    a2 = TR.create(h(Menu, { ref: padre, trigger: ({ onPress }) => h(RN.Pressable, { onPress }, h(RN.Text, null, 'padre')) },
      h(Menu.Item, { label: 'Item padre', onPress: () => sel.push('padre') }),
      h(Menu, { ref: hijo, trigger: ({ onPress }) => h(RN.Pressable, { onPress }, h(RN.Text, null, 'Más opciones')) },
        h(Menu.Item, { label: 'Item hijo', onPress: () => sel.push('hijo') }))))
  });
  appRoot = a2;
  await press('padre'); await settle();
  assert.ok(shown('Item padre') && shown('Más opciones'));
  await press('Más opciones'); await settle();
  assert.ok(shown('Item hijo') && hijo.current.isOpen() && padre.current.isOpen(), 'submenú abierto con el padre');
  assert.equal(menuContents().length, 2, 'dos capas de menú');
  ok('submenú abierto encima del menú padre');

  await act(async () => RN.BackHandler.press()); await wait(250);
  assert.ok(!hijo.current.isOpen() && padre.current.isOpen(), 'atrás cierra solo el submenú');
  ok('atrás cierra solo el submenú');

  await press('Más opciones'); await settle();
  await press('Item hijo'); await wait(300);
  assert.deepEqual(sel, ['hijo']);
  assert.ok(!hijo.current?.isOpen() && !padre.current.isOpen() && !shown('Item padre') && !shown('Item hijo'), 'elegir en el submenú cierra toda la cadena (el submenú se desmonta con el padre)');
  ok('elegir un item del submenú cierra el submenú y el padre');

  await press('padre'); await settle();
  await press('Item padre'); await wait(300);
  assert.ok(!padre.current.isOpen() && sel.at(-1) === 'padre');
  ok('elegir un item del padre lo cierra');
  await act(async () => a2.unmount()); await wait(20);
  assert.equal(siblings.size, 0, 'sin capas huérfanas');
})().catch(e => { console.error('FALLO', e); process.exit(1) });
