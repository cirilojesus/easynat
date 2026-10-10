// Pruebas de animationType, onOpen y defaultOpen
const assert = require('assert');
const { React, h, TR, act, RN, siblings, env, lib, wait, mountSiblings, layout, shown } = require('./harness');
const { Modal } = lib('Modal');
const ok = msg => console.log('OK ' + msg);
const W = 400, H = 800; // Dimensions simuladas en el harness

// Estilo animado del contenido: opacity, translateX/Y y scale evaluados con el valor actual
const anim = () => {
  const v = env.siblingRoot.root.findAll(n => n.type === 'AnimatedView' && n.props.onLayout)[0];
  const styles = [].concat(v.props.style).flat(9).filter(Boolean);
  const out = { opacity: 1, translateX: 0, translateY: 0, scale: 1 };
  for (const s of styles) {
    if (s.opacity !== undefined && typeof s.opacity === 'object') out.opacity = 'v' in s.opacity ? s.opacity.v : s.opacity;
    for (const t of s.transform ?? []) for (const [k, val] of Object.entries(t)) out[k] = typeof val === 'object' ? val.v : val;
  }
  return out;
};
const round = o => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, Math.round(v * 100) / 100]));

(async () => {
  await mountSiblings();
  const casos = {
    slideUp: [{ translateY: H }, { translateY: 0 }],
    undefined: [{ translateY: H }, { translateY: 0 }], // por defecto
    slideDown: [{ translateY: -H }, { translateY: 0 }],
    slideLeft: [{ translateX: W }, { translateX: 0 }],
    slideRight: [{ translateX: -W }, { translateX: 0 }],
    fade: [{ opacity: 0 }, { opacity: 1 }],
    scale: [{ opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1 }],
  };
  for (const [tipo, [inicio, fin]] of Object.entries(casos)) {
    const ref = React.createRef();
    let app;
    await act(async () => { app = TR.create(h(Modal, { ref, animationType: tipo === 'undefined' ? undefined : tipo }, h(RN.Text, null, 'c'))) });
    await act(async () => ref.current.open()); await wait(10);
    const a0 = round(anim());
    for (const [k, v] of Object.entries(inicio)) assert.equal(a0[k], v, `${tipo}: inicio ${k}`);
    await layout(); await wait(350);
    const a1 = round(anim());
    for (const [k, v] of Object.entries(fin)) assert.equal(a1[k], v, `${tipo}: final ${k}`);
    await act(async () => ref.current.close()); await wait(400);
    assert.ok(!shown('c'), `${tipo}: se cierra`);
    await act(async () => app.unmount());
  }
  ok('slideUp (por defecto), slideDown, slideLeft, slideRight, fade y scale: estado inicial y final correctos');

  // none: sin animación, abre y cierra al instante
  {
    const ref = React.createRef(); let app; let after = 0;
    await act(async () => { app = TR.create(h(Modal, { ref, animationType: 'none', afterClose: () => after++ }, h(RN.Text, null, 'sin'))) });
    await act(async () => ref.current.open()); await wait(10); await layout();
    const v = env.siblingRoot.root.findAll(n => n.type === 'AnimatedView' && n.props.onLayout)[0];
    const backdropProgress = [].concat(v.props.style).flat(9); // el contenido no tiene estilo animado
    assert.ok(!backdropProgress.some(s => s && (s.transform || (typeof s.opacity === 'object'))), 'none: sin transformaciones');
    await act(async () => ref.current.close());
    assert.equal(after, 1, 'none: afterClose inmediato, sin esperar animación');
    await wait(15); assert.ok(!shown('sin'));
    await act(async () => app.unmount());
    ok('none: abre y cierra al instante');
  }

  // onOpen: tras terminar de abrirse, con la data; no si se cierra antes de terminar
  {
    const ref = React.createRef(); const calls = []; let app;
    await act(async () => { app = TR.create(h(Modal, { ref, onOpen: d => calls.push(d) }, h(RN.Text, null, 'o'))) });
    await act(async () => ref.current.open({ id: 7 })); await wait(10); await layout();
    assert.equal(calls.length, 0, 'onOpen no se llama antes de terminar la animación');
    await wait(350);
    assert.deepEqual(calls, [{ id: 7 }], 'onOpen con la data al terminar');
    await act(async () => ref.current.close()); await wait(400);
    await act(async () => ref.current.open('x')); await wait(10); await layout(); await wait(50);
    await act(async () => ref.current.close()); await wait(400);
    assert.equal(calls.length, 1, 'cerrado a mitad de la apertura: no se llama onOpen');
    await act(async () => app.unmount());
    ok('onOpen(data) al terminar de abrir, y no si se cierra a mitad');
  }

  // defaultOpen: monta ya abierto, sin animación de entrada
  {
    const { closeAllModals } = lib('Modal');
    const ref = React.createRef(); let app; let opened = 0; let after = 0;
    await act(async () => { app = TR.create(h(Modal, { ref, defaultOpen: true, onOpen: () => opened++, afterClose: () => after++ }, h(RN.Text, null, 'auto'))) });
    await wait(5); // solo lo que tarda el portal en insertar el contenido
    assert.ok(shown('auto'), 'visible al montar');
    assert.equal(round(anim()).translateY, 0, 'ya en posición final, sin animar');
    assert.ok(ref.current.isOpen(), 'cuenta como abierto');
    assert.equal(opened, 0, 'onOpen espera a que el contenido esté montado');
    await layout(); await layout();
    assert.equal(opened, 1, 'onOpen una sola vez tras montarse');
    await act(async () => closeAllModals()); await wait(60);
    assert.ok(shown('auto') && after === 0, 'el cierre se anima: a los 60 ms sigue visible (no instantáneo)');
    await wait(400);
    assert.ok(!shown('auto') && after === 1, 'cerrado por closeAllModals');
    await act(async () => ref.current.open()); await wait(10); await layout(); await wait(350);
    assert.ok(shown('auto') && opened === 2, 'las aperturas posteriores se animan y notifican');
    await act(async () => app.unmount()); await wait(20);
    ok('defaultOpen: monta abierto sin animación; cierre y reaperturas animados');
  }
  assert.equal(siblings.size, 0, 'sin siblings huérfanos');
})().catch(e => { console.error('FALLO', e); process.exit(1) });
