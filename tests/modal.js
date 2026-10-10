// Pruebas de Modal: portal, animación, ráfagas, registro por id, buttonClose y Stagger
const assert = require('assert');
const { React, h, TR, act, RN, siblings, env, lib, wait, mountSiblings, layout, shown } = require('./harness');
const { Modal, openModal, closeModal, closeAllModals, isModalOpen } = lib('Modal');
const { Button } = lib('Button');
const { Stagger } = lib('Stagger');
const { Box } = lib('Box');

const slide = () => {
  const v = env.siblingRoot.root.findAll(n => n.type === 'AnimatedView' && n.props.onLayout)[0];
  return v ? [].concat(v.props.style).flat(9).find(s => s && s.transform)?.transform[0].translateY.src.v : null;
};
const settle = async () => { await wait(5); await layout(); await wait(350); };
const ok = msg => console.log('OK ' + msg);

(async () => {
  await mountSiblings();

  // --- Ciclo de vida con el portal asíncrono
  const ref = React.createRef();
  await act(async () => { TR.create(h(Modal, { ref }, h(RN.Text, null, 'contenido'))) });
  await act(async () => ref.current.open());
  await wait(5);
  assert.ok(shown('contenido'), 'el contenido llega al portal');
  assert.equal(slide(), 0, 'sin onLayout todavía no anima');
  await layout(); await wait(350);
  assert.equal(slide(), 1, 'tras onLayout anima hasta 1');
  ok('abrir: el contenido llega y anima solo cuando está montado');

  await act(async () => ref.current.close()); await wait(400);
  assert.ok(!shown('contenido')); ok('cerrar: se desmonta al terminar la animación');

  await act(async () => ref.current.open()); await settle();
  await act(async () => ref.current.close()); await wait(80);
  await act(async () => ref.current.open()); await wait(400);
  assert.ok(shown('contenido') && slide() === 1); ok('reabrir durante el cierre lo deja visible');

  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 200; i++) {
    await act(async () => (rnd() < 0.5 ? ref.current.open() : ref.current.close()));
    if (rnd() < 0.5) await layout();
    await wait(Math.floor(rnd() * 300));
  }
  await act(async () => ref.current.close()); await wait(400);
  assert.ok(!shown('contenido'));
  await act(async () => ref.current.open()); await settle();
  assert.ok(shown('contenido') && slide() === 1, 'tras la ráfaga vuelve a abrir y es visible');
  assert.equal(siblings.size, 1, 'sin siblings huérfanos');
  await act(async () => ref.current.close()); await wait(400);
  ok('ráfaga de 200 open/close: sigue abriendo, visible y sin siblings huérfanos');

  // --- Registro por id + ref
  const refA = React.createRef();
  const M = ({ id, r, txt }) => h(Modal, { id, ref: r }, h(RN.Text, null, txt));
  let app;
  const render = async kids => act(async () => { app ? app.update(h(React.Fragment, null, ...kids)) : (app = TR.create(h(React.Fragment, null, ...kids))) });
  await render([h(M, { key: 'a', id: 'a', r: refA, txt: 'A' }), h(M, { key: 'b', id: 'b', txt: 'B' })]);

  assert.equal(openModal('a'), true); await settle();
  assert.ok(shown('A') && !shown('B') && isModalOpen('a') && !isModalOpen('b'));
  assert.equal(closeModal('a'), true); await settle();
  assert.ok(!shown('A') && !isModalOpen('a'));
  ok('openModal / closeModal / isModalOpen por id');

  await act(async () => refA.current.open()); await settle();
  assert.ok(shown('A') && isModalOpen('a') && refA.current.isOpen(), 'el ref sigue funcionando');
  closeModal('a'); await settle();
  assert.ok(!shown('A') && !refA.current.isOpen(), 'abierto por ref, cerrado por id');
  ok('el ref sigue funcionando y se combina con el id');

  assert.equal(openModal('no-existe'), false);
  assert.equal(closeModal('no-existe'), false);
  assert.equal(isModalOpen('no-existe'), false);
  ok('ids inexistentes devuelven false sin romper');

  openModal('a'); openModal('b'); await settle();
  assert.ok(shown('A') && shown('B'));
  await act(async () => closeAllModals()); await settle();
  assert.ok(!shown('A') && !shown('B') && !isModalOpen('a') && !isModalOpen('b'));
  ok('closeAllModals cierra todos');

  await render([h(M, { key: 'a', id: 'a', r: refA, txt: 'A' }), h(M, { key: 'b', id: 'b', txt: 'B' }), h(M, { key: 'a2', id: 'a', txt: 'A2' })]);
  openModal('a'); await settle();
  assert.ok(shown('A2') && !shown('A'), 'abre el montado más reciente');
  await act(async () => refA.current.open()); await settle();
  closeModal('a'); await settle();
  assert.ok(!shown('A') && !shown('A2'), 'closeModal cierra todos los de ese id');
  ok('id repetido: abre el más reciente y closeModal cierra todos');

  openModal('b'); await settle();
  await render([h(M, { key: 'a', id: 'a', r: refA, txt: 'A' })]); await wait(20);
  assert.equal(openModal('b'), false, 'desmontado: fuera del registro');
  assert.equal(isModalOpen('b'), false);
  ok('desmontar limpia el registro');

  // --- buttonClose
  let closed = 0;
  const r1 = React.createRef();
  await render([h(Modal, { key: 'c', ref: r1, onClose: () => closed++, buttonClose: h(Button, { variant: 'subtle' }, 'Cerrar') }, h(RN.Text, null, 'x'))]);
  await act(async () => r1.current.open()); await settle();
  assert.ok(shown('Cerrar'));
  const btn = env.siblingRoot.root.findAll(n => n.type === 'Pressable' && n.props.onPress).find(p => p.findAll(n => n.children?.includes?.('Cerrar')).length);
  await act(async () => btn.props.onPress());
  assert.equal(closed, 1);
  await settle();
  ok('buttonClose como elemento propio dispara onClose');

  for (const [bc, icons] of [[true, 1], [false, 0]]) {
    const r2 = React.createRef();
    await render([h(Modal, { key: 'd' + bc, ref: r2, buttonClose: bc }, h(RN.Text, null, 'y'))]);
    await act(async () => r2.current.open()); await settle();
    assert.equal(env.siblingRoot.root.findAll(n => n.type === 'Icon').length, icons);
    await act(async () => r2.current.close()); await wait(400);
  }
  ok('buttonClose true / false');

  // --- Stagger con hijos condicionales y texto suelto
  let t4;
  await act(async () => { t4 = TR.create(h(Stagger, null, h(Box, null, 'S1'), false, null, 'suelto', h(Box, null, 'S2'))) });
  const ts = t4.root.findAll(n => typeof n.type === 'string').flatMap(n => n.children.filter(c => typeof c === 'string'));
  assert.deepEqual(ts.filter(x => x === 'S1' || x === 'S2'), ['S1', 'S2']);
  ok('Stagger con hijos condicionales');
})().catch(e => { console.error('FALLO', e); process.exit(1) });
