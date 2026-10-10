// duration en Modal y Menu: onOpen llega cuando termina la animación con la duración indicada
const assert = require('assert');
const { React, h, TR, act, RN, lib, wait, mountSiblings, layout, env } = require('./harness');
const { Modal } = lib('Modal');
const { Menu } = lib('Menu');
const { ThemeProvider } = lib('theme-provider');
const ok = msg => console.log('OK ' + msg);
const menuLayout = async () => { await act(async () => env.siblingRoot.root.findAll(n => n.type === 'AnimatedView' && n.props.onLayout).forEach(n => n.props.onLayout({ nativeEvent: { layout: { width: 150, height: 100 } } }))) };

(async () => {
  await mountSiblings();
  // Modal: por defecto 200 ms; con duration={600}, 600 ms
  for (const [duration, antes, despues] of [[undefined, 150, 260], [600, 450, 700]]) {
    const r = React.createRef(); let abierto = false; let t;
    await act(async () => { t = TR.create(h(Modal, { ref: r, duration, onOpen: () => (abierto = true) }, h(RN.Text, null, 'x'))) });
    await act(async () => r.current.open()); await wait(10); await layout();
    await wait(antes - 15); assert.equal(abierto, false, `Modal duration=${duration}: aún animando a los ${antes} ms`);
    await wait(despues - antes); assert.equal(abierto, true, `Modal duration=${duration}: abierto a los ${despues} ms`);
    await act(async () => r.current.close()); await wait(duration ?? 200); await wait(50); await act(async () => t.unmount()); await wait(20);
  }
  ok('Modal: duration (por defecto 200 ms)');

  // Menu: por defecto 150 ms; con duration={500}, 500 ms; también desde el tema
  for (const [props, theme, antes, despues] of [[{}, null, 100, 220], [{ duration: 500 }, null, 400, 600], [{}, { Menu: { duration: 500 } }, 400, 600]]) {
    const r = React.createRef(); let abierto = false; let t;
    const menu = h(Menu, { ref: r, ...props, onOpen: () => (abierto = true), trigger: () => null }, h(Menu.Item, { label: 'a' }));
    await act(async () => { t = TR.create(theme ? h(ThemeProvider, { theme: { light: { components: theme } } }, menu) : menu) }); await wait(10);
    await act(async () => r.current.open()); await wait(10); await menuLayout(); await wait(5);
    await wait(antes - 20); assert.equal(abierto, false, `Menu ${JSON.stringify(props)}${theme ? ' (tema)' : ''}: aún animando`);
    await wait(despues - antes); assert.equal(abierto, true, `Menu ${JSON.stringify(props)}${theme ? ' (tema)' : ''}: abierto`);
    await act(async () => r.current.close()); await wait(600); await act(async () => t.unmount()); await wait(20);
  }
  ok('Menu: duration (por defecto 150 ms) por prop y desde el tema');
})().catch(e => { console.error('FALLO', e); process.exit(1) });
