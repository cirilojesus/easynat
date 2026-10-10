// Pruebas del Slider: tocar / arrastrar, step, rango (tirador cercano, minDistance), controlado, accesibilidad y formulario
const assert = require('assert');
const { React, h, TR, act, RN, lib, wait, mountSiblings, env } = require('./harness');
const { Slider } = lib('Slider');
const { Control, FormGroupRef } = lib('EAForm');
const ok = msg => console.log('OK ' + msg);
const root = t => t.root.findAll(n => n.props.accessibilityRole === 'adjustable' && n.props.__pan)[0] ?? t.root.findAll(n => n.props.__pan)[0];
const pan = t => t.root.findAll(n => n.props.__pan)[0].props.__pan;
// md: tirador de 22 → el carril útil mide ancho - 22 (300 con 322)
const mount = async el => { let t; await act(async () => { t = TR.create(el) }); const v = t.root.findAll(n => n.props.__pan)[0]; await act(async () => v.props.onLayout({ nativeEvent: { layout: { width: 322, height: 32 } } })); return t; };
const gesture = async (t, x, dx = 0) => {
  const p = pan(t);
  await act(async () => { p.onPanResponderGrant({ nativeEvent: { locationX: x + 11 } }, { dx: 0, dy: 0 }); if (dx) p.onPanResponderMove({}, { dx, dy: 0 }); p.onPanResponderRelease({}, { dx, dy: 0 }); });
};

(async () => {
  await mountSiblings();
  {
    const seen = []; let end, start;
    const t = await mount(h(Slider, { onChange: v => seen.push(v), onChangeEnd: v => (end = v), onChangeStart: v => (start = v), step: 10 }));
    await gesture(t, 0, 0);
    assert.equal(start, 0); assert.deepEqual(seen, [], 'tocar en el valor actual no cambia');
    await gesture(t, 90);          // 90/300 = 30
    assert.equal(end, 30, 'tocar el carril salta al valor');
    await gesture(t, 90, 47);      // 137/300 = 45.6 → 50 (step 10)
    assert.equal(end, 50, 'arrastrar con step');
    await gesture(t, 0, 999); assert.equal(end, 100, 'no pasa del máximo');
    await gesture(t, 0, -999); assert.equal(end, 0, 'ni del mínimo');
    assert.ok(seen.every(v => v % 10 === 0), 'onChange solo en valores del step');
    const p = pan(t);
    assert.equal(p.onMoveShouldSetPanResponder({}, { dx: 2, dy: 10 }), false, 'gesto vertical: para el scroll');
    assert.equal(p.onMoveShouldSetPanResponder({}, { dx: 10, dy: 2 }), true);
    ok('Slider: tocar salta, arrastrar con step, límites, onChange / onChangeStart / onChangeEnd, deja el scroll vertical');
  }
  {
    let end;
    const t = await mount(h(Slider, { defaultValue: [20, 80], minDistance: 10, onChangeEnd: v => (end = v) }));
    await gesture(t, 30);           // 10: el de abajo
    assert.deepEqual(end, [10, 80], 'rango: mueve el tirador más cercano');
    await gesture(t, 270);          // 90: el de arriba
    assert.deepEqual(end, [10, 90]);
    await gesture(t, 30, 999);      // el de abajo hasta el máximo: se para a minDistance del otro
    assert.deepEqual(end, [80, 90], 'minDistance');
    ok('Slider rango: [desde, hasta], tirador más cercano y minDistance');
  }
  {
    let got;
    const P = ({ v }) => h(Slider, { value: v, min: 0, max: 10, onChange: x => (got = x) });
    let t = await mount(h(P, { v: 4 }));
    const a = t.root.findAll(n => n.props.accessibilityRole === 'adjustable')[0];
    assert.equal(a.props.accessibilityValue.now, 4);
    await act(async () => a.props.onAccessibilityAction({ nativeEvent: { actionName: 'increment' } }));
    assert.equal(got, 5, 'accesibilidad: increment');
    await act(async () => t.update(h(P, { v: 7 })));
    assert.equal(t.root.findAll(n => n.props.accessibilityRole === 'adjustable')[0].props.accessibilityValue.now, 7, 'controlado: sigue a value');
    ok('Slider: controlado y acciones de accesibilidad');
  }
  {
    const form = new FormGroupRef({ precio: [[10, 50], {}], volumen: [30, {}] });
    let t; await act(async () => { t = TR.create(h(RN.View, null, h(Control, { formGroup: form, formControl: 'precio', isSlider: true, range: true, label: 'Precio' }))) });
    const v = t.root.findAll(n => n.props.__pan)[0];
    await act(async () => v.props.onLayout({ nativeEvent: { layout: { width: 322, height: 32 } } }));
    await gesture(t, 270);
    assert.deepEqual(form.value.precio, [10, 90], 'Control isSlider guarda al soltar');
    ok('EAForm: Control isSlider');
  }
  // ---- Rendimiento: sin nada que enseñe el valor, arrastrar no repinta; con burbuja, como mucho una vez por fotograma
  {
    const count = async (props, moves) => {
      let commits = 0;
      let t; await act(async () => { t = TR.create(h(React.Profiler, { id: 's', onRender: () => commits++ }, h(Slider, { step: 0, ...props }))) });
      const v = t.root.findAll(n => n.props.__pan)[0];
      await act(async () => v.props.onLayout({ nativeEvent: { layout: { width: 322, height: 32 } } }));
      const p = v.props.__pan;
      await act(async () => p.onPanResponderGrant({ nativeEvent: { locationX: 11 } }));
      const c0 = commits;
      // Cada movimiento en su propio act: como en el móvil, un evento por fotograma
      for (let i = 1; i <= moves; i++) await act(async () => p.onPanResponderMove({}, { dx: i * 3 }));
      const during = commits - c0;
      await act(async () => p.onPanResponderRelease({}, {}));
      return during;
    };
    const silent = await count({}, 50);
    const live = await count({ showValue: 'drag' }, 50);
    assert.equal(silent, 0, 'sin burbuja ni label con valor: 0 repintados al arrastrar (antes 1 por movimiento)');
    assert.ok(live > 0 && live <= 50, 'con burbuja: se repinta para enseñar el valor');
    ok('Slider: 50 movimientos → ' + silent + ' repintados sin nada que enseñe el valor, ' + live + ' con burbuja (uno por fotograma como mucho)');
  }
  {
    // Controlado y el padre no acepta el valor: al soltar vuelve al suyo
    const t = await mount(h(Slider, { value: 30, onChange: () => {} }));
    await gesture(t, 270);
    const a = t.root.findAll(n => n.props.accessibilityRole === 'adjustable')[0];
    assert.equal(a.props.accessibilityValue.now, 30, 'vuelve al value de fuera');
    ok('Slider controlado: si el padre no cambia value, al soltar vuelve');
  }
  console.log('TODO OK');
  process.exit(0);
})().catch(e => { console.error('FALLO', e); process.exit(1); });
