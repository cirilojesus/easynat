// Pruebas de data / result: children como función, open(data), close(result), afterClose(result) y result
const assert = require('assert');
const { React, h, TR, act, RN, siblings, env, lib, wait, mountSiblings, layout, shown } = require('./harness');
const { Modal, openModal, closeModal } = lib('Modal');
const settle = async () => { await wait(10); await layout(); await wait(350); };
const ok = msg => console.log('OK ' + msg);
// Pulsa el botón de texto `txt` dentro de los modales
const press = async txt => {
  const btn = env.siblingRoot.root.findAll(n => n.type === 'Pressable' && n.props.onPress).find(p => p.findAll(n => n.children?.includes?.(txt)).length);
  assert.ok(btn, 'botón ' + txt);
  await act(async () => btn.props.onPress());
};
// La X por defecto (cierre del usuario, sin resultado)
const pressX = async () => {
  const x = env.siblingRoot.root.findAll(n => n.type === 'Pressable' && n.props.onPress).find(p => p.findAll(n => n.type === 'Icon').length);
  await act(async () => x.props.onPress());
};

(async () => {
  await mountSiblings();
  const base = siblings.size;

  // --- Modal declarado con children como función
  const results = [];
  const ref = React.createRef();
  await act(async () => {
    TR.create(h(Modal, { id: 'producto', ref, afterClose: r => results.push(r) },
      ({ data, close }) => h(RN.View, null,
        h(RN.Text, null, `Detalles de: ${data?.name}`),
        h(RN.Text, null, `Precio: ${data?.price}`),
        h(RN.Pressable, { onPress: () => close({ comprado: data?.name }) }, h(RN.Text, null, 'Comprar')))))
  });

  assert.equal(openModal('producto', { name: 'Teclado Mecánico', price: 85 }), true); await settle();
  assert.ok(shown('Detalles de: Teclado Mecánico') && shown('Precio: 85'));
  ok('openModal(id, data): la data llega a children({ data })');

  await press('Comprar'); await settle();
  assert.deepEqual(results.at(-1), { comprado: 'Teclado Mecánico' });
  ok('close(result) desde children: afterClose recibe el resultado');

  await act(async () => ref.current.open({ name: 'Ratón', price: 20 })); await settle();
  assert.ok(shown('Detalles de: Ratón') && !shown('Detalles de: Teclado Mecánico'));
  ok('ref.open(data): cada apertura reemplaza la data');

  await pressX(); await settle();
  assert.equal(results.length, 2); assert.equal(results.at(-1), undefined);
  ok('cerrar con la X: afterClose recibe undefined');

  await act(async () => ref.current.open()); await settle();
  assert.ok(shown('Detalles de: undefined'), 'abrir sin data: no se arrastra la data anterior');
  closeModal('producto', 'por-id'); await settle();
  assert.equal(results.at(-1), 'por-id');
  ok('la data no se retiene entre aperturas y closeModal(id, result) pasa el resultado');

  // --- Modal dinámico con data y result
  let after;
  const modal = openModal({
    data: { name: 'Monitor', price: 300 },
    afterClose: r => (after = r),
    children: ({ data, close }) => h(RN.View, null,
      h(RN.Text, null, `Dinámico: ${data.name}`),
      h(RN.Pressable, { onPress: () => close({ confirmado: true }) }, h(RN.Text, null, 'Confirmar'))),
  });
  await settle();
  assert.ok(shown('Dinámico: Monitor'));
  await act(async () => modal.update({ data: { name: 'Monitor 4K', price: 400 } })); await wait(30);
  assert.ok(shown('Dinámico: Monitor 4K'));
  ok('openModal({ data, children: fn }) y update({ data })');

  await press('Confirmar');
  const result = await modal.result;
  await settle(); await wait(20);
  assert.deepEqual(result, { confirmado: true });
  assert.deepEqual(after, { confirmado: true });
  assert.equal(siblings.size, base, 'destruido al cerrarse');
  ok('await modal.result recibe close(result) y el modal se destruye');

  // result leído DESPUÉS de cerrar (promesa perezosa): se resuelve igual
  const m2 = openModal({ children: ({ close }) => h(RN.Pressable, { onPress: () => close('tarde') }, h(RN.Text, null, 'Cerrar tarde')) });
  await settle(); await press('Cerrar tarde'); await settle(); await wait(20);
  assert.equal(await m2.result, 'tarde');
  ok('result leído después de cerrar también se resuelve');

  // Cerrado por el usuario (X): result undefined
  const m3 = openModal({ children: h(RN.Text, null, 'm3') });
  await settle(); await pressX(); await settle(); await wait(20);
  assert.equal(await m3.result, undefined);
  ok('cerrado con la X: result es undefined');

  // handle.close(result) antes de que termine de montarse
  let m4;
  await act(async () => { m4 = openModal({ children: h(RN.Text, null, 'm4') }); m4.close('rápido') });
  await settle(); await wait(20);
  assert.equal(await m4.result, 'rápido');
  assert.ok(!shown('m4') && siblings.size === base);
  ok('handle.close(result) antes de montarse resuelve result sin dejar restos');
})().catch(e => { console.error('FALLO', e); process.exit(1) });
