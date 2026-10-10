// Pruebas del spinner a pantalla completa (showSpinner / withSpinner / SpinnerOverlay) y de las variantes de Box
const assert = require('assert');
const H = require('./harness');
const { h, TR, act, env, lib, wait, mountSiblings, shown } = H;
const RN = require('react-native');
const ok = msg => console.log('OK ' + msg);

(async () => {
  const { showSpinner, hideSpinner, withSpinner, isSpinnerVisible, SpinnerOverlay, Box } = lib('index');
  await mountSiblings();
  const overlay = () => env.siblingRoot.root.findAll(n => n.type === 'AnimatedView' && n.props.pointerEvents)[0];
  const settle = async (ms = 30) => wait(ms);

  // ---- mostrar, esconder, varios a la vez, tiempo mínimo
  {
    let s;
    await act(async () => { s = showSpinner('Guardando…') });
    await settle();
    assert.ok(isSpinnerVisible() && shown('Guardando…'), 'se ve, con su mensaje');
    assert.equal(overlay().props.pointerEvents, 'auto', 'bloquea los toques');
    const other = showSpinner({ message: 'Otro', minDuration: 0 });
    await settle();
    assert.ok(shown('Otro'), 'el último manda el mensaje');
    other.hide(); await settle();
    assert.ok(isSpinnerVisible() && shown('Guardando…'), 'esconder uno no esconde los demás');
    s.hide();
    await settle(50);
    assert.ok(isSpinnerVisible(), 'se queda el tiempo mínimo (300 ms)');
    await settle(400);
    assert.ok(!isSpinnerVisible(), 'y luego se esconde');
    await settle(250);
    assert.ok(!overlay(), 'tras el fundido se quita la capa');
    ok('showSpinner: se ve, bloquea, varios a la vez (el último manda), esconder uno no esconde los demás, tiempo mínimo y quitar la capa');
  }

  // ---- duration, delay (sin parpadeo), progreso, hideSpinner, withSpinner
  {
    showSpinner({ message: 'Auto', duration: 60, minDuration: 0 });
    await settle(20); assert.ok(isSpinnerVisible());
    await settle(120); assert.ok(!isSpinnerVisible(), 'duration: se esconde solo');
    const d = showSpinner({ message: 'Lento', delay: 80 });
    await settle(30); assert.ok(!isSpinnerVisible(), 'delay: aún no');
    d.hide(); await settle(100);
    assert.ok(!isSpinnerVisible() && !shown('Lento'), 'terminó antes del delay: nunca se ve');
    const p = showSpinner({ message: 'Subiendo', progress: 0.25, minDuration: 0 });
    await settle(); assert.ok(shown('25 %'));
    await act(async () => p.update({ progress: 0.8, message: 'Casi' })); await settle();
    assert.ok(shown('80 %') && shown('Casi'), 'update: progreso y mensaje');
    showSpinner({ minDuration: 0 });
    hideSpinner(); await settle(50);
    assert.ok(!isSpinnerVisible(), 'hideSpinner los esconde todos');
    let seen = false;
    const r = await withSpinner(async () => { await new Promise(res => setTimeout(res, 20)); seen = isSpinnerVisible(); return 42 }, { minDuration: 0 });
    assert.equal(r, 42); assert.ok(seen, 'withSpinner: visible mientras dura');
    await settle(40); assert.ok(!isSpinnerVisible(), 'y se esconde al terminar');
    await assert.rejects(withSpinner(Promise.reject(new Error('mal')), { minDuration: 0 }), /mal/);
    await settle(40); assert.ok(!isSpinnerVisible(), 'también si falla');
    ok('duration, delay sin parpadeo, progreso con update, hideSpinner y withSpinner (bien y mal)');
  }

  // ---- atrás de Android, cancelable, teclado, SpinnerOverlay
  {
    let dismissed = 0; const kd = RN.Keyboard.dismiss; RN.Keyboard.dismiss = () => { dismissed++ };
    showSpinner({ minDuration: 0 }); await settle();
    assert.equal(dismissed, 1, 'cierra el teclado');
    assert.equal(RN.BackHandler.press(), true, 'atrás bloqueado');
    assert.ok(isSpinnerVisible(), 'y sigue visible');
    hideSpinner(); await settle(50);
    let cancelled = 0;
    showSpinner({ cancelable: true, onCancel: () => cancelled++, minDuration: 0, dismissKeyboard: false }); await settle();
    assert.equal(dismissed, 1, 'dismissKeyboard: false');
    await act(async () => { RN.BackHandler.press() }); await settle(50);
    assert.ok(!isSpinnerVisible() && cancelled === 1, 'cancelable: atrás lo cierra y avisa');
    showSpinner({ cancelable: true, onCancel: () => cancelled++, minDuration: 0 }); await settle();
    const backdrop = env.siblingRoot.root.findAll(n => n.type === 'Pressable' && n.props.accessibilityRole === 'progressbar')[0];
    await act(async () => backdrop.props.onPress()); await settle(50);
    assert.ok(!isSpinnerVisible() && cancelled === 2, 'tocar el fondo también');
    RN.Keyboard.dismiss = kd;
    let t;
    await act(async () => { t = TR.create(h(SpinnerOverlay, { visible: false, message: 'Comp', minDuration: 0 })) });
    await settle(); assert.ok(!isSpinnerVisible());
    await act(async () => t.update(h(SpinnerOverlay, { visible: true, message: 'Comp', minDuration: 0 }))); await settle();
    assert.ok(isSpinnerVisible() && shown('Comp'), 'SpinnerOverlay visible');
    await act(async () => t.update(h(SpinnerOverlay, { visible: true, message: 'Comp 2', minDuration: 0 }))); await settle();
    assert.ok(shown('Comp 2'), 'cambia el mensaje');
    await act(async () => t.unmount()); await settle(50);
    assert.ok(!isSpinnerVisible(), 'al desmontarse se esconde');
    ok('atrás bloqueado, cancelable (atrás y fondo) con onCancel, cerrar el teclado y SpinnerOverlay (visible, mensaje, desmontar)');
  }

  // ---- variantes de Box: la del usuario arreglada, combinadas con espacios, safeArea desde variante
  {
    const st = async el => { let t; await act(async () => { t = TR.create(el) }); return Object.assign({}, t.root.findAll(n => n.type === 'View')[0].props.style) };
    const sm = await st(h(Box, { variant: 'badge_sm' }, 'x'));
    assert.ok(sm.backgroundColor && sm.paddingHorizontal === 6 && sm.paddingVertical === 2 && sm.borderRadius === 40, 'badge_sm con fondo: ' + JSON.stringify(sm));
    const badge = await st(h(Box, { variant: 'badge' }, 'x'));
    assert.equal(badge.gap, 4, 'badge: 4 px entre icono y texto (antes 16)');
    const both = await st(h(Box, { variant: 'card row_between' }));
    assert.ok(both.borderWidth === 1 && both.padding === 16 && both.flexDirection === 'row' && both.justifyContent === 'space-between', 'varias variantes con espacios');
    // rejillas: la columna toma la mitad de la separación de SU rejilla
    const colIn = async (g, c, extra) => { let t; await act(async () => { t = TR.create(h(Box, { variant: g }, h(Box, { variant: c, testID: 'c', ...extra }))) });
      const views = t.root.findAll(n => n.type === 'View'); return [Object.assign({}, views[0].props.style), Object.assign({}, views.find(v => v.props.testID === 'c').props.style)] };
    for (const [g, gut] of [['grid_sm', 4], ['grid', 8], ['grid_lg', 12], ['grid_xl', 16]]) {
      const [gs, cs] = await colIn(g, 'col_3');
      assert.ok(gs.marginHorizontal === -gut / 2 && gs.rowGap === gut && gs.flexWrap === 'wrap' && cs.paddingHorizontal === gut / 2 && cs.width === '33.333%', g + ': ' + JSON.stringify([gs, cs]));
    }
    const [, c1] = await colIn('grid', 'col_1'), [, c5] = await colIn('grid_lg', 'col_5');
    assert.ok(c1.width === '100%' && c5.width === '19.999%' && c5.paddingHorizontal === 6, 'col_1 y col_5');
    const [, own] = await colIn('grid_xl', 'col_2', { px: 0 });
    assert.equal(own.paddingHorizontal, 0, 'un px propio manda sobre el de la rejilla');
    const [nested] = await colIn('grid_sm', 'col_2');
    let tn; await act(async () => { tn = TR.create(h(Box, { variant: 'grid_xl' }, h(Box, { variant: 'col_2' }, h(Box, { variant: 'grid_sm' }, h(Box, { variant: 'col_2', testID: 'in' }))))) });
    assert.equal(Object.assign({}, tn.root.findAll(n => n.type === 'View' && n.props.testID === 'in')[0].props.style).paddingHorizontal, 2, 'rejilla dentro de otra: manda la más cercana');
    assert.ok(!(await st(h(Box, { variant: 'row_3' }))).flexWrap, 'row_3 ya no existe');
    const over = await st(h(Box, { variant: 'card', p: 1, bg: 'red' }));
    assert.ok(over.padding === 4 && over.backgroundColor === 'red', 'las props pisan la variante');
    let t; await act(async () => { t = TR.create(h(Box, { variant: 'badge_sm', _text: { fontSize: 20 } }, 'hola')) });
    const txt = t.root.findAll(n => n.type === 'Text')[0];
    const ts = Object.assign({}, ...[].concat(txt.props.style).flat(9).filter(Boolean));
    assert.ok(ts.fontSize === 20 && ts.color, '_text de la variante y de las props se juntan: ' + JSON.stringify(ts));
    ok('Box: badge_sm con fondo, gap del badge, variantes combinadas con espacios, rejillas sm / md / lg / xl con col_1 … col_6 (y anidadas), las props mandan y _text se fusiona');
  }

  console.log('test_overlay: todo OK');
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1) });
