// Pruebas del modo oscuro: colores por defecto, herencia de light, setMode / system y que los componentes los usan
const assert = require('assert');
const { React, h, TR, act, RN, lib, wait, mountSiblings } = require('./harness');
const { ThemeProvider, useTheme } = lib('theme-provider');
const { theme: libTheme, DARK_COLORS, COLORS_THEME } = lib('theme');
const { mergeTheme } = lib('utils/helpers');
const L = n => lib(n)[n];
const ok = msg => console.log('OK ' + msg);
const flat = n => [].concat(n.props.style || []).flat(9).filter(Boolean).reduce((o, x) => ({ ...o, ...(typeof x === 'object' ? x : {}) }), {});
const AsyncStorage = require('@react-native-async-storage/async-storage').default;

(async () => {
  await mountSiblings();
  // ---- Colores
  {
    assert.equal(libTheme.dark.colors.background, DARK_COLORS.background);
    assert.equal(libTheme.dark.colors['primary.100'], COLORS_THEME['primary.100'], 'los de marca son los mismos');
    assert.notEqual(libTheme.dark.colors.text, libTheme.light.colors.text);
    for (const k of Object.keys(COLORS_THEME)) assert.ok(libTheme.dark.colors[k], 'el oscuro tiene todos los colores: ' + k);
    ok('el oscuro tiene todos los colores; cambian los semánticos y los grises, no los de marca');
  }
  // ---- mergeTheme: el oscuro hereda lo de light salvo los colores que tienen versión oscura
  {
    const m = mergeTheme(libTheme, { light: { colors: { 'primary.100': '#0EA5E9', 'text': '#111111', 'mio': '#123456' }, fontFamily: 'Inter', components: { Button: { rounded: 2 } } }, dark: { colors: { 'mio': '#654321' } } });
    assert.equal(m.dark.colors['primary.100'], '#0EA5E9', 'primary de light pasa al oscuro');
    assert.equal(m.dark.colors.text, DARK_COLORS.text, 'text de light no tapa el oscuro');
    assert.equal(m.dark.colors.mio, '#654321', 'lo de dark gana');
    assert.equal(m.dark.fontFamily, 'Inter'); assert.equal(m.dark.components.Button.rounded, 2);
    assert.equal(m.light.colors.text, '#111111');
    const m2 = mergeTheme(libTheme, { light: { components: { Box: { p: 2, variants: { tarjeta: { p: 4 }, card: { rounded: 2 } } } } }, dark: { components: { Box: { variants: { card: { shadow: 0 } } } } } });
    assert.equal(m2.dark.components.Box.p, 2, 'Box de light sigue en oscuro');
    assert.deepEqual(m2.dark.components.Box.variants, { tarjeta: { p: 4 }, card: { shadow: 0 } }, 'las variantes se suman; la misma variante la cambia dark');
    assert.deepEqual(m2.light.components.Box.variants.card, { rounded: 2 });
    ok('mergeTheme: components de dark se fusionan con los de light por componente y por variante');
    ok('mergeTheme: dark hereda marca, fuentes y components de light; dark.colors gana; los semánticos no se heredan');
  }
  // ---- Provider: defaultMode, system, setMode, toggleTheme y color por defecto del texto
  {
    const Text = L('Text');
    let ctx; const Spy = () => { ctx = useTheme(); return null; };
    const mount = async (props, el) => { await AsyncStorage.removeItem('@app_theme'); let t; await act(async () => { t = TR.create(h(ThemeProvider, props, h(Spy), el)) }); await wait(20); return t; };
    let t = await mount({ defaultMode: 'dark' }, h(Text, null, 'Hola', h(Text, { fontWeight: '700' }, 'anidado')));
    assert.equal(ctx.mode, 'dark');
    const texts = t.root.findAll(x => x.type === 'Text');
    assert.equal(flat(texts[0]).color, DARK_COLORS.text, 'Text sin color usa text del modo');
    assert.equal(flat(texts[1]).color, undefined, 'el anidado hereda (no fuerza color)');
    const root = t.root.findAll(x => x.type === 'View' && flat(x).flex === 1)[0];
    assert.equal(flat(root).backgroundColor, DARK_COLORS.background, 'fondo de la app');
    await act(async () => ctx.toggleTheme()); await wait(5);
    assert.equal(ctx.mode, 'light'); assert.equal(flat(t.root.findAll(x => x.type === 'Text')[0]).color, COLORS_THEME.text);
    globalThis.__scheme = 'dark';
    t = await mount({ defaultMode: 'system' });
    assert.equal(ctx.setting, 'system'); assert.equal(ctx.mode, 'dark', 'system sigue al móvil');
    await act(async () => ctx.setMode('light')); await wait(5);
    assert.equal(ctx.mode, 'light'); assert.equal(await AsyncStorage.getItem('@app_theme'), 'light', 'se recuerda');
    globalThis.__scheme = undefined;
    ok('ThemeProvider: defaultMode, system, setMode (recordado), toggleTheme; Text y el fondo siguen el modo');
  }
  // ---- Componentes
  {
    const Box = L('Box');
    await AsyncStorage.removeItem('@app_theme');
    const t = await (async () => { let t; await act(async () => { t = TR.create(h(ThemeProvider, { defaultMode: 'dark' }, h(Box, { variant: 'card', testID: 'c' }))) }); await wait(20); return t; })();
    const card = t.root.findAll(x => x.props.testID === 'c' && x.type === 'View')[0];
    assert.equal(flat(card).backgroundColor, DARK_COLORS.surface); assert.equal(flat(card).borderColor, DARK_COLORS.border);
    ok('Box card usa surface y border del modo');
  }
  console.log('TODO OK');
})().catch(e => { console.error('FALLO', e); process.exit(1); });
