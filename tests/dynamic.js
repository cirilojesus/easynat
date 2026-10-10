// Pruebas de openModal({...}): modales creados al vuelo
const assert = require('assert');
const { React, h, act, RN, siblings, lib, wait, mountSiblings, layout, shown } = require('./harness');
const { openModal, closeAllModals } = lib('Modal');
const settle = async () => { await wait(10); await layout(); await wait(350); };
const ok = msg => console.log('OK ' + msg);

(async () => {
  await mountSiblings();
  const base = siblings.size;

  let after = 0;
  let modal;
  await act(async () => { modal = openModal({ header: { children: h(RN.Text, null, 'cabecera') }, afterClose: () => after++, children: h(RN.Text, null, 'dinámico') }) });
  await settle();
  assert.ok(shown('dinámico') && shown('cabecera') && modal.isOpen(), 'abre con header y contenido');
  ok('openModal({...}) abre un modal sin declararlo');

  await act(async () => modal.update({ children: h(RN.Text, null, 'actualizado') })); await wait(20);
  assert.ok(shown('actualizado') && !shown('dinámico'), 'update cambia el contenido');
  ok('handle.update() cambia el contenido');

  await act(async () => modal.close()); await settle(); await wait(20);
  assert.ok(!shown('actualizado') && !modal.isOpen());
  assert.equal(after, 1, 'afterClose una vez');
  assert.equal(siblings.size, base, 'se destruye al cerrarse, sin dejar nada montado');
  ok('handle.close() lo cierra, llama a afterClose y lo destruye');

  let m2;
  await act(async () => { m2 = openModal({ children: h(RN.Text, null, 'efímero') }); m2.close() });
  await settle(); await wait(20);
  assert.ok(!shown('efímero') && siblings.size === base, 'cerrado antes de montarse: no aparece ni deja restos');
  ok('cerrar antes de que termine de montarse');

  await act(async () => { openModal({ children: h(RN.Text, null, 'uno') }); openModal({ children: h(RN.Text, null, 'dos') }) });
  await settle();
  assert.ok(shown('uno') && shown('dos'));
  await act(async () => closeAllModals()); await settle(); await wait(20);
  assert.ok(!shown('uno') && !shown('dos') && siblings.size === base);
  ok('closeAllModals también cierra y destruye los dinámicos');

  // openModal(id) sigue devolviendo boolean
  assert.equal(openModal('no-existe'), false);
  ok('openModal(id) sigue funcionando igual');
})().catch(e => { console.error('FALLO', e); process.exit(1) });
