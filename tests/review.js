// Pruebas de la revisión final: variantes de Text e Input y helpers públicos (color, toDataUri, isWebViewAvailable)
const assert = require('assert');
const H = require('./harness');
const { h, TR, act, env, lib } = H;
const ok = msg => console.log('OK ' + msg);

(async () => {
  const L = lib('index');
  const render = async el => { let t; await act(async () => { t = TR.create(el) }); return t };
  const flat = s => Object.assign({}, ...[].concat(s).flat(9).filter(Boolean));

  // ---- Text
  {
    const st = async v => flat((await render(h(L.Text, { variant: v }, 'x'))).root.findAll(n => n.type === 'Text')[0].props.style);
    const sizes = [];
    for (const v of ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']) sizes.push((await st(v)).fontSize);
    assert.deepEqual(sizes, [...sizes].sort((a, b) => b - a), 'h1 > h2 > … > h6');
    assert.equal((await st('h1')).fontWeight, '700');
    assert.equal((await st('caption')).color, L.COLORS_THEME['silver'], 'caption gris');
    assert.equal((await st('overline')).textTransform, 'uppercase');
    const combo = await st('small muted');
    assert.ok(combo.fontSize === 12 && combo.color === L.COLORS_THEME['silver'], 'combinadas con espacios');
    ok('Text: h1…h6 en orden, pesos, caption / overline y variantes combinadas');
  }

  // ---- Input
  {
    const box = async (v, focus) => {
      const t = await render(h(L.Input, { variant: v, placeholder: 'p' }));
      if (focus) await act(async () => t.root.findAll(n => n.type === 'TextInput')[0].props.onFocus?.({}));
      const ti = t.root.findAll(n => n.type === 'TextInput')[0];
      let p = ti.parent; while (p && !(p.type === 'View' && p.props.style && flat(p.props.style).flexDirection === 'row')) p = p.parent;
      return flat(p.props.style);
    };
    const o = await box('outline');
    assert.ok(o.borderWidth === 1 && o.borderColor === L.COLORS_THEME['light.100'], 'outline: borde claro');
    const of = await box('outline', true);
    assert.equal(of.borderColor, L.COLORS_THEME['primary.100'], 'con foco: primary');
    const f = await box('filled');
    assert.ok(f.backgroundColor === L.COLORS_THEME['light.50'] && f.borderColor === 'transparent', 'filled');
    assert.equal((await box('filled', true)).borderColor, L.COLORS_THEME['primary.100'], 'filled con foco');
    const u = await box('underlined');
    assert.ok(u.borderWidth === 0 && u.borderBottomWidth === 1 && u.borderRadius === 0, 'underlined');
    assert.equal((await box('rounded')).borderRadius, 40);
    assert.equal((await box('unstyled')).borderWidth, 0);
    ok('Input: outline, filled, underlined, rounded, unstyled y borde primary con foco');
  }

  // ---- helpers
  {
    assert.equal(L.withAlpha('#4F46E5', 0.12), '#4F46E51f');
    assert.equal(L.withAlpha('#63c257ff', 0.5), '#63c25780', '8 dígitos: cambia la transparencia');
    assert.equal(L.withAlpha('#abc', 1), '#aabbccff');
    assert.equal(L.withAlpha('red', 0.5), 'red', 'no hex: igual');
    assert.equal(L.readableColor('#facc15'), '#111111');
    assert.equal(L.readableColor('#1e3a8a'), '#ffffff');
    assert.equal(typeof L.isWebViewAvailable(), 'boolean');
    global.fetch = async () => ({ status: 200, blob: async () => ({}) });
    global.FileReader = class { readAsDataURL() { this.result = 'data:image/png;base64,QQ=='; setTimeout(() => this.onload()) } };
    assert.equal(await L.toDataUri('https://x/a.png'), 'data:image/png;base64,QQ==');
    assert.equal(await L.toDataUri('data:text/plain;base64,QQ=='), 'data:text/plain;base64,QQ==', 'data: se queda');
    global.fetch = async () => ({ status: 404 });
    await assert.rejects(L.toDataUri('https://x/no'), /HTTP 404/);
    ok('helpers: withAlpha, readableColor, isWebViewAvailable y toDataUri (data:, errores HTTP)');
  }

  console.log('test_review: todo OK');
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1) });
