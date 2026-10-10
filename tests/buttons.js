// Pruebas de Button (variantes, carga, toggle, feedback), HoldButton y SlideButton
const assert = require('assert');
const H = require('./harness');
const { h, TR, act, lib, wait } = H;
const RN = require('react-native');
const ok = msg => console.log('OK ' + msg);

(async () => {
  const { Button, HoldButton, SlideButton } = lib('index');
  const render = async el => { let t; await act(async () => { t = TR.create(el) }); return t };
  const press = t => t.root.findAll(n => n.type === 'Pressable')[0];
  const flat = s => Object.assign({}, ...[].concat(typeof s === 'function' ? s({ pressed: false }) : s).flat(9).filter(Boolean));
  const style = t => flat(press(t).props.style);
  const txt = t => H.texts(t).join('|');
  const spinners = t => t.root.findAll(n => n.type === 'Spinner').length;

  // ---- variantes
  {
    const solid = style(await render(h(Button, null, 'A')));
    assert.equal(solid.backgroundColor, '#4F46E5', 'solid: fondo del color');
    const subtle = style(await render(h(Button, { variant: 'subtle' }, 'A')));
    assert.equal(subtle.backgroundColor, '#4F46E51f', 'subtle: tinte suave (12 %)');
    const outline = style(await render(h(Button, { variant: 'outline', colorScheme: 'secondary' }, 'A')));
    assert.ok(outline.borderWidth === 1 && outline.borderColor === '#EC4899', 'outline: borde del color');
    const un = style(await render(h(Button, { variant: 'unstyled' }, 'A')));
    assert.ok(un.padding === 0 && !un.backgroundColor && un.borderRadius === 0, 'unstyled: sin estilos');
    const dis = style(await render(h(Button, { disabled: true }, 'A')));
    assert.equal(dis.opacity, 0.5, 'deshabilitado: más claro');
    ok('variantes: solid, subtle (tinte suave), outline (borde neutro), unstyled y deshabilitado');
  }

  // ---- carga: ref, prop, promesa; no se pulsa dos veces; tamaño intacto sin texto
  {
    const ref = H.React.createRef(); let n = 0;
    const t = await render(h(Button, { ref, onPress: () => { n++ } }, 'Guardar'));
    await act(async () => ref.current.startLoading());
    assert.ok(spinners(t) === 1 && txt(t).includes('Guardar'), 'ref: spinner encima y el texto oculto (mismo tamaño)');
    assert.equal(press(t).props.accessibilityState.busy, true);
    await act(async () => press(t).props.onPress({}));
    assert.equal(n, 0, 'cargando no se pulsa');
    assert.equal(ref.current.isLoading(), true);
    await act(async () => ref.current.stopLoading());
    assert.equal(spinners(t), 0);
    const p = await render(h(Button, { isLoading: true, loadingText: 'Enviando…' }, 'Enviar'));
    assert.ok(txt(p).includes('Enviando…') && !txt(p).includes('Enviar|') && spinners(p) === 1, 'loadingText');
    let resolve; const a = await render(h(Button, { onPress: () => new Promise(r => { resolve = r }) }, 'Async'));
    await act(async () => press(a).props.onPress({}));
    assert.equal(spinners(a), 1, 'promesa: spinner solo');
    await act(async () => { resolve(); await wait(1) });
    assert.equal(spinners(a), 0, 'y se quita al terminar');
    const off = await render(h(Button, { loadingOnPress: false, onPress: () => new Promise(() => { }) }, 'X'));
    await act(async () => press(off).props.onPress({}));
    assert.equal(spinners(off), 0, 'loadingOnPress={false}');
    ok('carga: ref (start / stop / isLoading), sin pulsar dos veces, mismo tamaño, isLoading + loadingText, promesa de onPress y loadingOnPress');
  }

  // ---- toggle / _active / controlado; feedback (al pulsar, tras promesa, por ref)
  {
    const changes = [];
    const t = await render(h(Button, { toggle: true, onActiveChange: a => changes.push(a), _active: { children: 'Activo', variant: 'outline' } }, 'Normal'));
    await act(async () => press(t).props.onPress({}));
    assert.ok(txt(t).includes('Activo') && style(t).borderWidth === 1 && press(t).props.accessibilityState.selected, '_active: texto y variante');
    await act(async () => press(t).props.onPress({}));
    assert.ok(txt(t).includes('Normal'));
    assert.deepEqual(changes, [true, false]);
    // la animación: tras el primer cambio el contenido va en una vista animada con entering
    assert.ok(t.root.findAll(n => n.type === 'ReaView' && n.props.entering).length === 1, 'contenido animado al cambiar');
    const plain = await render(h(Button, null, 'Nada'));
    assert.equal(plain.root.findAll(n => n.type === 'ReaView').length, 0, 'un botón normal no se envuelve');
    const c = await render(h(Button, { active: true, onActiveChange: a => changes.push(a), _active: { children: 'Sí' } }, 'No'));
    await act(async () => press(c).props.onPress({}));
    assert.ok(txt(c).includes('Sí') && changes.at(-1) === false, 'controlado: avisa pero manda la prop');
    const f = await render(h(Button, { feedback: { children: 'Copiado' }, feedbackDuration: 40 }, 'Copiar'));
    await act(async () => press(f).props.onPress({}));
    assert.ok(txt(f).includes('Copiado'), 'feedback al pulsar');
    await wait(60);
    assert.ok(txt(f).includes('Copiar'), 'y vuelve solo');
    let res; const fp = await render(h(Button, { onPress: () => new Promise(r => { res = r }), feedback: { children: 'Hecho' } }, 'Ir'));
    await act(async () => press(fp).props.onPress({}));
    assert.ok(!txt(fp).includes('Hecho'), 'con promesa: aún no');
    await act(async () => { res(); await wait(1) });
    assert.ok(txt(fp).includes('Hecho'), 'tras la promesa');
    const r = H.React.createRef();
    const fr = await render(h(Button, { ref: r }, 'Base'));
    await act(async () => r.current.showFeedback({ children: 'Por ref' }, 30));
    assert.ok(txt(fr).includes('Por ref'));
    ok('toggle con _active (texto, variante, selected), animación solo al cambiar, controlado, feedback al pulsar / tras promesa / por ref y vuelta sola');
  }

  // ---- HoldButton
  {
    let done = 0, cancel = 0;
    const t = await render(h(HoldButton, { holdDuration: 40, onComplete: () => { done++ }, onHoldCancel: () => { cancel++ } }, 'Mantén'));
    await act(async () => press(t).props.onPressIn());
    await wait(15);
    await act(async () => press(t).props.onPressOut());
    assert.equal(done, 0, 'soltar antes: no');
    assert.equal(cancel, 1, 'onHoldCancel');
    await wait(300);
    await act(async () => press(t).props.onPressIn());
    await wait(80);
    assert.equal(done, 1, 'mantener: onComplete');
    await act(async () => press(t).props.onPressOut());
    assert.ok(t.root.findAll(n => n.type === 'AnimatedView' && n.props.pointerEvents === 'none').length === 1, 'la barra');
    let r2; const a = await render(h(HoldButton, { holdDuration: 10, onComplete: () => new Promise(r => { r2 = r }) }, 'Async'));
    await act(async () => press(a).props.onPressIn()); await wait(40);
    assert.equal(spinners(a), 1, 'onComplete con promesa: spinner');
    await act(async () => { r2(); await wait(1) });
    assert.equal(spinners(a), 0);
    ok('HoldButton: soltar antes cancela (onHoldCancel), mantener completa y onComplete con promesa muestra spinner');
  }

  // ---- SlideButton
  {
    let done = 0; const ref = H.React.createRef();
    const t = await render(h(SlideButton, { ref, text: 'Desliza', completedText: 'Listo', onComplete: () => { done++ } }));
    const track = t.root.findAll(n => n.type === 'View' && n.props.onLayout)[0];
    await act(async () => track.props.onLayout({ nativeEvent: { layout: { width: 300, height: 56 } } }));
    const pan = t.root.findAll(n => n.props && n.props.__pan)[0].props.__pan;
    const max = 300 - 48 - 8;
    assert.equal(pan.onStartShouldSetPanResponder(), true);
    assert.equal(pan.onMoveShouldSetPanResponder(null, { dx: 5, dy: 20 }), false, 'vertical: es scroll de la página');
    assert.equal(pan.onPanResponderTerminationRequest(), false, 'no lo suelta al ScrollView');
    await act(async () => { pan.onPanResponderMove(null, { dx: 100 }); pan.onPanResponderRelease(null, { dx: 100 }) });
    assert.equal(done, 0, 'poco recorrido: vuelve');
    await act(async () => { pan.onPanResponderMove(null, { dx: max }); pan.onPanResponderRelease(null, { dx: max * 0.9 }) });
    assert.equal(done, 1, 'pasado el umbral: completa');
    assert.equal(pan.onStartShouldSetPanResponder(), false, 'terminado: no se arrastra');
    await act(async () => ref.current.reset());
    // Accesibilidad: activar lo completa
    await act(async () => track.props.onAccessibilityAction({ nativeEvent: { actionName: 'activate' } }));
    assert.equal(done, 2, 'activar (lectores de pantalla) completa');
    assert.ok(H.texts(t).includes('Listo') && ref.current.isCompleted(), 'texto de terminado');
    await act(async () => ref.current.reset());
    assert.ok(!ref.current.isCompleted() && H.texts(t).includes('Desliza'), 'reset');
    let rej; const a = await render(h(SlideButton, { ref, onComplete: () => new Promise((_, r) => { rej = r }) }));
    const tr2 = a.root.findAll(n => n.type === 'View' && n.props.onLayout)[0];
    await act(async () => tr2.props.onLayout({ nativeEvent: { layout: { width: 300, height: 56 } } }));
    await act(async () => ref.current.complete());
    assert.equal(spinners(a), 1, 'promesa: spinner en el círculo');
    await act(async () => { rej(new Error('x')); await wait(1) });
    assert.ok(spinners(a) === 0 && !ref.current.isCompleted(), 'si falla, vuelve al principio');
    ok('SlideButton: arrastrar (poco vuelve, pasado el umbral completa, vertical no), completar (accesibilidad y ref), texto de terminado, reset, spinner con promesa y volver si falla');
  }

  console.log('test_buttons: todo OK');
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1) });
