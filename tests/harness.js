// Entorno simulado de React Native para probar la librería compilada en testdist
// React 19: act() solo funciona (sin avisos) si el entorno lo declara
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
// react-test-renderer está obsoleto en React 19 (sigue funcionando): sin el aviso en cada prueba
const _warn = console.error; console.error = (...a) => { if (!String(a[0]).includes('react-test-renderer is deprecated')) _warn(...a) };
const Module = require('module');
const React = require('react');
const h = React.createElement;
const TR = require('react-test-renderer');
const { act } = TR;

const host = name => {
  const C = React.forwardRef((p, ref) => {
    // measureInWindow devuelve la posición simulada del trigger (env.triggerLayout)
    React.useImperativeHandle(ref, () => ({ setNativeProps() {}, measure: cb => { if (env.measure) cb(...env.measure) }, measureInWindow: cb => { const l = env.triggerLayout; setTimeout(() => cb(l.x, l.y, l.width, l.height)) } }));
    return h(name, p, typeof p.children === 'function' ? p.children({ pressed: false }) : p.children);
  });
  C.displayName = name;
  return C;
};

// Animated realista: tarda `duration` ms y una animación nueva interrumpe a la anterior (finished: false)
class Value {
  constructor(v) { this.v = v; this.anim = null; this.ls = new Map(); this.lid = 0 }
  addListener(fn) { const id = ++this.lid; this.ls.set(id, fn); return id }
  removeListener(id) { this.ls.delete(id) }
  get v() { return this._v }
  set v(x) { this._v = x; this.ls?.forEach(fn => fn({ value: x })) }
  // Devuelve un valor derivado que calcula la interpolación lineal sobre el valor actual
  interpolate({ inputRange, outputRange }) {
    const src = this;
    return { src, get v() { const [i0, i1] = inputRange, [o0, o1] = outputRange; return o0 + (o1 - o0) * ((src.v - i0) / (i1 - i0)); } };
  }
  setValue(v) { this.v = v }
  stopAnimation() { if (this.anim) { const a = this.anim; this.anim = null; clearTimeout(a.t); a.cb?.({ finished: false }) } }
}
const Animated = {
  Value, View: host('AnimatedView'), add: (a, b) => ({ get v() { return (a.v ?? a) + (b.v ?? b) } }), subtract: (a, b) => ({ get v() { return (a.v ?? a) - (b.v ?? b) } }),
  spring: (value, { toValue }) => ({ start: cb => { value.stopAnimation(); value.v = toValue; cb?.({ finished: true }) } }), Text: host('AnimatedText'), createAnimatedComponent: c => c,
  timing: (value, { toValue, duration = 0 }) => ({
    start: cb => { value.stopAnimation(); const a = { cb }; a.t = setTimeout(() => { value.v = toValue; value.anim = null; cb?.({ finished: true }) }, duration); value.anim = a; },
  }),
};

const RN = {
  Platform: { OS: 'android', select: o => o.android },
  StyleSheet: { flatten: a => Object.assign({}, ...[].concat(a).flat(9).filter(Boolean)), absoluteFill: {}, hairlineWidth: 0.5 },
  RefreshControl: host('RefreshControl'),
  Switch: host('RNSwitch'),
  View: host('View'), Text: host('Text'), TextInput: host('TextInput'), ScrollView: host('ScrollView'), Pressable: host('Pressable'), KeyboardAvoidingView: host('KAV'), ActivityIndicator: host('Spinner'),
  // PanResponder: los handlers llevan la configuración (las pruebas llaman a sus funciones con un dx)
  PanResponder: { create: cfg => ({ panHandlers: { __pan: cfg } }) },
  Animated, Easing: { out: x => x, in: x => x, ease: 0, bezier: () => 0 },
  BackHandler: { handlers: new Set(), addEventListener(ev, fn) { this.handlers.add(fn); return { remove: () => this.handlers.delete(fn) } }, press() { return [...this.handlers].reverse().some(fn => fn()) } },
  Keyboard: {
    count: 0, subs: {},
    addListener(ev, fn) { this.count++; (this.subs[ev] ||= new Set()).add(fn); return { remove: () => { this.count--; this.subs[ev].delete(fn) } } },
    // emite un evento de teclado (height 0 = cerrar)
    emit(ev, height) { this.subs[ev]?.forEach(fn => fn({ endCoordinates: { height } })) },
    isVisible: () => false, metrics: () => undefined, dismiss() {},
  },
  useColorScheme: () => (globalThis.__scheme ?? 'light'),
  Appearance: { getColorScheme: () => (globalThis.__scheme ?? 'light'), addChangeListener: () => ({ remove() {} }) },
  useWindowDimensions: () => ({ width: 400, height: 800 }),
  // Como el real: ListHeaderComponent arriba y ListEmptyComponent sin datos (elemento o componente)
  FlatList: React.forwardRef((p, ref) => {
    const el = c => (c == null ? null : React.isValidElement(c) ? c : h(c));
    // Expone onEndReached, refreshControl y numColumns (para probarlos) y pinta cabecera, filas, vacío y pie
    return h('FlatList', { onEndReached: p.onEndReached, refreshControl: p.refreshControl, numColumns: p.numColumns }, h(React.Fragment, { key: 'header' }, el(p.ListHeaderComponent)),
      ...Array.from(p.data || []).map((item, index) => h(React.Fragment, { key: index }, p.renderItem({ item, index, separators: {} }))),
      h(React.Fragment, { key: 'empty' }, (p.data || []).length ? null : el(p.ListEmptyComponent)),
      h(React.Fragment, { key: 'footer' }, el(p.ListFooterComponent)));
  }),
  Dimensions: { get: () => ({ width: 400, height: 800 }) },
};

// Image con getSize (800x400) y Linking que apunta las URL abiertas
RN.Image = Object.assign(host('Image'), { getSize: (uri, ok) => setTimeout(() => ok(800, 400)) });
RN.Linking = { opened: [], openURL(u) { this.opened.push(u); return Promise.resolve() } };

const reanimated = {
  // Cada withTiming que se lanza (para comprobar cuándo se anima)
  timings: [],
  __esModule: true, default: { View: host('ReaView'), Text: host('ReaText'), createAnimatedComponent: c => c,
    // FlatList animado: pinta las filas y apunta los scrollToOffset (env.scrolls)
    FlatList: React.forwardRef((p, ref) => {
      React.useImperativeHandle(ref, () => ({ scrollToOffset: o => env.scrolls.push(o) }));
      return h('AnimatedFlatList', { ...p, renderItem: undefined }, ...Array.from(p.data || []).map((item, index) => h(React.Fragment, { key: index }, p.renderItem({ item, index }))));
    }) },
  useSharedValue: v => { const r = React.useRef(null); if (!r.current) r.current = { value: v }; return r.current }, useAnimatedStyle: () => ({}),
  // El callback de fin solo si la prueba lo pide (env.timingCallbacks), al momento
  withTiming: (v, cfg, cb) => { reanimated.timings.push(v); if (cb && env.timingCallbacks) cb(true); return v }, withDelay: (d, v) => { reanimated.delays.push(d); return v }, withRepeat: v => v,
  delays: [], useAnimatedScrollHandler: h => h, Extrapolation: { CLAMP: 'clamp' },
  // Animaciones de entrada (entering): encadenables y sin efecto
  ...Object.fromEntries(['FadeIn', 'FadeInDown', 'ZoomIn', 'FadeOut', 'LinearTransition'].map(k => { const o = new Proxy({}, { get: (_, m) => (m === 'name' ? k : () => o) }); return [k, o] })),
  interpolate: () => 0, interpolateColor: () => '#000', Easing: { bezier: () => 0, out: f => f, in: f => f, cubic: x => x, linear: x => x },
  // Perezoso: se evalúa al leerlo, con los shared values del momento (como en el hilo de UI)
  useAnimatedProps: f => new Proxy({}, { get: (_, k) => f()[k], ownKeys: () => Reflect.ownKeys(f()), getOwnPropertyDescriptor: (_, k) => ({ enumerable: true, configurable: true, value: f()[k] }) }), useDerivedValue: () => ({ value: 0 }), useAnimatedReaction() {}, runOnJS: f => f,
};

// root-siblings: inserta, actualiza y quita de forma ASÍNCRONA (setTimeout), como la librería real
const siblings = new Map();
let sid = 0;
const env = { siblingRoot: null, triggerLayout: { x: 20, y: 300, width: 200, height: 40 }, scrolls: [], timingCallbacks: false };
const renderSiblings = () => env.siblingRoot?.update(h('SiblingRoot', null, ...[...siblings].map(([id, el]) => h(React.Fragment, { key: id }, el))));
class RootSiblings {
  constructor(el) { this.id = ++sid; setTimeout(() => { siblings.set(this.id, el); renderSiblings() }) }
  update(el) { setTimeout(() => { if (siblings.has(this.id)) { siblings.set(this.id, el); renderSiblings() } }) }
  destroy() { setTimeout(() => { siblings.delete(this.id); renderSiblings() }) }
}

// react-native-svg: cada elemento es un host con su nombre (Svg por defecto)
const svgHosts = {};
const svg = new Proxy({}, { get: (_, k) => k === '__esModule' ? true : (svgHosts[k] ||= host(k === 'default' ? 'Svg' : k)) });

// Fotogramas al momento (las pruebas no esperan a la pantalla)
global.requestAnimationFrame = fn => { fn(); return 0 };
global.cancelAnimationFrame = () => {};

// react-native-webview: un host que apunta el JS inyectado (env.injected) y expone requestFocus
const WebView = React.forwardRef((props, ref) => {
  React.useImperativeHandle(ref, () => ({ injectJavaScript: js => env.injected.push(js), requestFocus: () => { env.focusRequests++ } }));
  return h('WebView', props);
});
env.injected = []; env.focusRequests = 0;
let webviewLoads = 0;

const store = {};
const stubs = {
  'react-native': RN,
  'react-native-reanimated': reanimated,
  'react-native-svg': svg,
  get 'react-native-webview'() { webviewLoads++; if (env.noWebView) throw new Error("Cannot find module 'react-native-webview'"); return { WebView } },
  'react-native-root-siblings': { __esModule: true, default: RootSiblings, RootSiblingParent: ({ children }) => children },
  'react-native-safe-area-context': { useSafeAreaInsets: () => ({ top: 20, bottom: 10, left: 0, right: 0 }), SafeAreaProvider: ({ children }) => children },
  '@react-native-async-storage/async-storage': { __esModule: true, default: { getItem: async k => store[k], setItem: async (k, v) => { store[k] = v }, removeItem: async k => { delete store[k] } } },
  '@expo/vector-icons': new Proxy({}, { get: () => host('Icon') }),
};
const orig = Module._load;
Module._load = function (r, ...a) { return stubs[r] || orig.call(this, r, ...a) };

const D = require('path').join(__dirname, '.build');
const lib = p => require(D + '/' + p);

const wait = async ms => { await act(() => new Promise(r => setTimeout(r, ms))); await act(() => new Promise(r => setTimeout(r, 5))); };
const mountSiblings = async () => { await act(async () => { env.siblingRoot = TR.create(h('SiblingRoot')) }) };
// Simula el layout nativo: dispara onLayout del contenido de los modales montados
const layout = async () => { await act(async () => { env.siblingRoot.root.findAll(n => n.type === 'AnimatedView' && n.props.onLayout).forEach(n => n.props.onLayout({ nativeEvent: { layout: { width: 400, height: 300 } } })) }) };
const shown = txt => env.siblingRoot.root.findAll(n => typeof n.type === 'string' && n.children.includes(txt)).length > 0;
const texts = tree => tree.root.findAll(n => typeof n.type === 'string').flatMap(n => n.children.filter(c => typeof c === 'string'));

module.exports = { React, h, TR, act, RN, host, siblings, env, lib, wait, mountSiblings, layout, shown, texts, webviewLoads: () => webviewLoads };
