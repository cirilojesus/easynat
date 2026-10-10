// Pruebas de Carousel y Stagger
const assert = require('assert');
const H = require('./harness');
const { h, TR, act, env, lib, wait } = H;
const RN = require('react-native');
const rea = require('react-native-reanimated');
const ok = msg => console.log('OK ' + msg);

(async () => {
  const { Carousel, Stagger, Box, Text } = lib('index');
  const render = async el => { let t; await act(async () => { t = TR.create(el) }); return t };
  const byLabel = (t, l) => t.root.findAll(n => typeof n.type === 'string' && n.props.accessibilityLabel === l)[0];
  const list = t => t.root.findAll(n => n.type === 'AnimatedFlatList')[0];
  const layout = async (t, width) => { const v = t.root.findAll(n => n.type === 'View' && n.props.onLayout && n.props.style && n.props.style.flex === 1)[0]; await act(async () => v.props.onLayout({ nativeEvent: { layout: { width, height: 200 } } })) };
  const texts = t => JSON.stringify(t.toJSON());

  // ---- Carousel con hijos: pestañas, flechas, ignora null, ref, onIndexChange
  {
    env.scrolls.length = 0;
    const changes = [], ref = H.React.createRef();
    const t = await render(h(Carousel, { ref, onIndexChange: i => changes.push(i) },
      h(Carousel.Item, { tab: 'A' }, h(Text, null, 'uno')), null, false && h(Carousel.Item, { tab: 'X' }),
      h(Carousel.Item, { tab: 'B' }, h(Text, null, 'dos')), h(Carousel.Item, { tab: 'C' }, h(Text, null, 'tres'))));
    assert.ok(!list(t), 'sin medir no se pinta la lista');
    await layout(t, 300);
    assert.equal(list(t).props.data.length, 3, 'null / false de los condicionales no cuentan');
    assert.ok(texts(t).includes('uno') && texts(t).includes('tres'));
    const tabs = t.root.findAll(n => typeof n.type === 'string' && n.props.accessibilityRole === 'tab');
    assert.equal(tabs.length, 3, 'pestañas (hay tab)');
    assert.ok(!t.root.findAll(n => n.props && n.props.accessibilityLabel === '1' && n.props.accessibilityRole === 'button').length, 'con pestañas no hay puntos');
    assert.ok(!byLabel(t, 'prev') && byLabel(t, 'next'), 'en la primera, solo la flecha siguiente');
    assert.equal(list(t).props.pagingEnabled, true, 'una por vista: paginación nativa');
    await act(async () => byLabel(t, 'next').props.onPress());
    assert.deepEqual(env.scrolls.at(-1), { offset: 300, animated: true });
    assert.deepEqual(changes, [1]);
    await act(async () => ref.current.goTo(5));
    assert.deepEqual(env.scrolls.at(-1), { offset: 600, animated: true }, 'goTo se queda en la última');
    assert.ok(byLabel(t, 'prev') && !byLabel(t, 'next'), 'en la última, sin flecha siguiente');
    assert.equal(ref.current.getIndex(), 2);
    // deslizar: al terminar, la del medio
    await act(async () => list(t).props.onMomentumScrollEnd({ nativeEvent: { contentOffset: { x: 310 } } }));
    assert.equal(ref.current.getIndex(), 1);
    assert.deepEqual(changes, [1, 2, 1]);
    // al cambiar el ancho, sigue en la misma
    await layout(t, 400);
    assert.deepEqual(env.scrolls.at(-1), { offset: 400, animated: false });
    ok('Carousel con hijos: ignora null, pestañas, flechas según la posición, next / goTo (con tope) / deslizar, onIndexChange y mantener la diapositiva al cambiar el ancho');
  }

  // ---- Carousel con data: puntos, loop, controlado, itemsPerView / gap / inset, autoplay
  {
    env.scrolls.length = 0;
    const items = ['a', 'b', 'c', 'd', 'e'];
    const T = await render(h(Carousel, { data: items, renderItem: x => h(Text, null, 'item ' + x), itemsPerView: 2, gap: 10, inset: 20, loop: true }));
    await layout(T, 320);
    const L = list(T);
    const itemW = (320 - 40 - 10) / 2;
    assert.equal(L.props.snapToInterval, itemW + 10, 'encaja en cada diapositiva');
    assert.equal(L.props.pagingEnabled, false);
    assert.deepEqual(L.props.getItemLayout(null, 2), { length: itemW + 10, offset: 20 + 2 * (itemW + 10), index: 2 });
    const dots = T.root.findAll(n => typeof n.type === 'string' && n.props.accessibilityRole === 'button' && /^\d$/.test(n.props.accessibilityLabel || ''));
    assert.equal(dots.length, 4, '5 con 2 por vista: 4 posiciones');
    assert.ok(byLabel(T, 'prev'), 'con loop siempre hay flechas');
    await act(async () => byLabel(T, 'prev').props.onPress());
    assert.equal(env.scrolls.at(-1).offset, 3 * (itemW + 10), 'loop: de la primera a la última posición');
    await act(async () => dots[1].props.onPress());
    assert.equal(env.scrolls.at(-1).offset, itemW + 10, 'los puntos llevan a su posición');
    // controlado
    const C = await render(h(Carousel, { data: items, renderItem: x => h(Text, null, x), index: 1 }));
    await layout(C, 200);
    env.scrolls.length = 0;
    await act(async () => C.update(h(Carousel, { data: items, renderItem: x => h(Text, null, x), index: 3 })));
    await layout(C, 200);
    assert.ok(env.scrolls.some(s => s.offset === 600), 'index controlado: ' + JSON.stringify(env.scrolls));
    // autoplay: avanza solo y se para al arrastrar
    env.scrolls.length = 0;
    const A = await render(h(Carousel, { data: items, renderItem: x => h(Text, null, x), autoplay: 30 }));
    await layout(A, 100);
    await wait(45);
    assert.ok(env.scrolls.some(s => s.offset === 100), 'autoplay avanza: ' + JSON.stringify(env.scrolls));
    await act(async () => list(A).props.onScrollBeginDrag());
    const n = env.scrolls.length;
    await wait(80);
    assert.equal(env.scrolls.length, n, 'arrastrando no avanza');
    await act(async () => list(A).props.onMomentumScrollEnd({ nativeEvent: { contentOffset: { x: 100 } } }));
    await wait(45);
    assert.ok(env.scrolls.length > n, 'al soltar sigue');
    A.unmount();
    ok('Carousel con data: itemsPerView / gap / inset (snap y getItemLayout), puntos por posición, loop, index controlado y autoplay (se para al arrastrar)');
  }

  // ---- Stagger: entrada al montarse con retrasos en orden, center, sin animar, ref, visible, onShowEnd / onHideEnd
  {
    rea.timings.length = 0; rea.delays.length = 0;
    const kids = n => Array.from({ length: n }, (_, i) => h(Box, { key: i }, h(Text, null, 'x' + i)));
    const S = await render(h(Stagger, { staggerDelay: 50, delay: 10 }, kids(3)));
    assert.deepEqual(rea.timings, [1, 1, 1], 'entra al montarse');
    assert.deepEqual(rea.delays, [10, 60, 110], 'uno detrás de otro (delay + i * staggerDelay)');
    rea.delays.length = 0;
    await render(h(Stagger, { staggerDelay: 50, order: 'center' }, kids(5)));
    assert.deepEqual(rea.delays, [100, 50, 0, 50, 100], 'desde el centro');
    rea.delays.length = 0;
    await render(h(Stagger, { staggerDelay: 50, order: 'reverse' }, kids(3)));
    assert.deepEqual(rea.delays, [100, 50, 0], 'al revés');
    rea.timings.length = 0;
    await render(h(Stagger, { animateOnInit: false }, kids(3)));
    assert.equal(rea.timings.length, 0, 'animateOnInit false: ya visibles');
    // ref y avisos
    env.timingCallbacks = true;
    const ends = [], ref = H.React.createRef();
    const R = await render(h(Stagger, { ref, onShowEnd: () => ends.push('show'), onHideEnd: () => ends.push('hide'), staggerDelay: 50 }, kids(3)));
    assert.deepEqual(ends, ['show'], 'onShowEnd una vez, al terminar el último');
    rea.timings.length = 0; rea.delays.length = 0;
    await act(async () => ref.current.hide());
    assert.deepEqual(rea.timings, [0, 0, 0]);
    assert.deepEqual(rea.delays, [100, 50, 0], 'al salir, en orden contrario');
    assert.deepEqual(ends, ['show', 'hide']);
    assert.equal(ref.current.isVisible(), false);
    // ocultos: no se pueden tocar
    assert.ok(R.root.findAll(n => n.type === 'ReaView').every(v => v.props.pointerEvents === 'none'));
    await act(async () => ref.current.toggle());
    assert.equal(ref.current.isVisible(), true);
    assert.ok(R.root.findAll(n => n.type === 'ReaView').every(v => v.props.pointerEvents === 'auto'));
    // exit: sale a otro sitio (valor 2)
    rea.timings.length = 0;
    const X = await render(h(Stagger, { exit: { opacity: 0, translateX: -50 }, visible: true }, kids(2)));
    rea.timings.length = 0;
    await act(async () => X.update(h(Stagger, { exit: { opacity: 0, translateX: -50 }, visible: false }, kids(2))));
    assert.deepEqual(rea.timings, [2, 2], 'visible={false} con exit: a la salida');
    // nuevos hijos estando visible: entran
    rea.timings.length = 0;
    await act(async () => R.update(h(Stagger, { ref, staggerDelay: 50 }, kids(4))));
    assert.deepEqual(rea.timings, [1], 'el añadido entra animado');
    env.timingCallbacks = false;
    // el color del texto solo envuelve el texto si se anima
    const plain = await render(h(Stagger, null, h(Box, null, 'hola')));
    assert.equal(plain.root.findAll(n => n.type === 'ReaText').length, 0);
    const col = await render(h(Stagger, { from: { color: '#fff' }, to: { color: '#000' } }, h(Box, null, 'hola')));
    assert.equal(col.root.findAll(n => n.type === 'ReaText').length, 1);
    ok('Stagger: retrasos en orden / centro / al revés, animateOnInit, onShowEnd / onHideEnd, hide al revés, toggle, sin toques oculto, exit, nuevos hijos y texto animado solo si hace falta');
  }

  console.log('test_motion: todo OK');
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1) });
