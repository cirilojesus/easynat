// Pruebas de utils/keyboard con un teclado simulado por plataforma
// React 19: act() solo funciona (sin avisos) si el entorno lo declara
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
// react-test-renderer está obsoleto en React 19 (sigue funcionando): sin el aviso en cada prueba
const _warn = console.error; console.error = (...a) => { if (!String(a[0]).includes('react-test-renderer is deprecated')) _warn(...a) };
const Module = require('module');
const React = require('react');
const assert = require('assert');
const TR = require('react-test-renderer');
const { act } = TR;

const makeRN = (OS, open) => {
  const subs = {};
  let visible = open;
  const Keyboard = {
    addListener: (ev, fn) => { (subs[ev] ||= new Set()).add(fn); return { remove: () => subs[ev].delete(fn) } },
    isVisible: () => visible, metrics: () => (visible ? { height: 300 } : undefined), dismiss() {},
    emit: (ev, height) => { visible = /Show/.test(ev); subs[ev]?.forEach(f => f({ endCoordinates: { height } })) },
    count: () => Object.values(subs).reduce((a, s) => a + s.size, 0), subs,
  };
  return { Platform: { OS }, Keyboard, View: 'View' };
};
const load = (OS, open) => {
  const RN = makeRN(OS, open);
  const orig = Module._load;
  Module._load = function (r, ...a) { return r === 'react-native' ? RN : orig.call(this, r, ...a) };
  for (const k of Object.keys(require.cache)) if (k.includes('/.build/')) delete require.cache[k];
  const mod = require(require('path').join(__dirname, '.build/utils/keyboard'));
  Module._load = orig;
  return { RN, ...mod };
};

(async () => {
  for (const OS of ['ios', 'android']) {
    const { RN, useKeyboard, useKeyboardHeight } = load(OS, false);
    let st, h;
    const C = () => { st = useKeyboard(); h = useKeyboardHeight(); return null };
    let t; await act(async () => { t = TR.create(React.createElement(C)) });
    assert.deepEqual([st.height, st.isVisible, h], [0, false, 0]);
    const show = OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hide = OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    await act(async () => RN.Keyboard.emit(show, 336)); assert.deepEqual([st.height, st.isVisible, h], [336, true, 336]);
    await act(async () => RN.Keyboard.emit(show, 380)); assert.equal(st.height, 380);
    await act(async () => RN.Keyboard.emit(hide, 0)); assert.deepEqual([st.height, st.isVisible], [0, false]);
    await act(async () => t.unmount());
    // Un solo par de listeners para toda la app, aunque se monten muchos componentes
    const antes = RN.Keyboard.count();
    let ts = []; await act(async () => { for (let i = 0; i < 10; i++) ts.push(TR.create(React.createElement(C))) });
    assert.equal(RN.Keyboard.count(), antes, 'montar 10 componentes no añade listeners');
    // Montado a mitad del teclado: ya lee la altura en el primer render
    await act(async () => RN.Keyboard.emit(show, 300));
    let h2; const D = () => { h2 = useKeyboardHeight(); return null };
    await act(async () => { TR.create(React.createElement(D)) });
    assert.equal(h2, 300, 'un componente montado con el teclado abierto conoce la altura');
    await act(async () => ts.forEach(x => x.unmount()));
    console.log(`OK useKeyboard ${OS}`);
  }
  {
    const { useKeyboardHeight } = load('ios', true);
    let h; const C = () => { h = useKeyboardHeight(); return null };
    await act(async () => { TR.create(React.createElement(C)) });
    assert.equal(h, 300);
    console.log('OK altura inicial con el teclado ya abierto');
  }
  for (const [offset, esperado] of [[0, 336], [50, 286], [400, 0]]) {
    const { RN, useAndroidKeyboardPadding } = load('android', false);
    let props; const ref = { current: { setNativeProps: p => { props = p } } };
    const C = () => { useAndroidKeyboardPadding(ref, offset); return null };
    let t; await act(async () => { t = TR.create(React.createElement(C)) });
    await act(async () => RN.Keyboard.emit('keyboardDidShow', 336)); assert.deepEqual(props.style, { paddingBottom: esperado });
    await act(async () => RN.Keyboard.emit('keyboardDidHide', 0)); assert.deepEqual(props.style, { paddingBottom: 0 });
    await act(async () => t.unmount()); assert.equal(RN.Keyboard.count(), 0);
  }
  console.log('OK useAndroidKeyboardPadding (offset 0 / 50 / mayor que el teclado)');
})().catch(e => { console.error('FALLO', e); process.exit(1) });
