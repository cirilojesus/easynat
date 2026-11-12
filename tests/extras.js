// Pruebas de ago, Image (tamaño por defecto), label flotante en textarea, Button (loadingOnPress), Tooltip,
// Breadcrumbs, ReadMore y el acceso easynat/pdfjs
const assert = require('assert');
const path = require('path');
const fs = require('fs');
const { React, h, TR, act, RN, env, lib, wait, mountSiblings, shown } = require('./harness');
const ok = msg => console.log('OK ' + msg);
const flat = s => Object.assign({}, ...[].concat(s).flat(9).filter(Boolean));
const render = async el => { let t; await act(async () => { t = TR.create(el) }); return t };
const textos = t => t.root.findAll(n => n.type === 'Text').map(n => n.children.filter(c => typeof c === 'string').join('')).filter(Boolean);

(async () => {
  await mountSiblings();
  const { ago, setLang, Image, Input, Tooltip, Breadcrumbs, ReadMore } = lib('index');

  // ---- ago: tiempo relativo en el idioma actual
  {
    const now = Date.UTC(2026, 10, 12, 12, 0, 0);
    await setLang('es');
    assert.equal(ago(now - 10_000, now), 'ahora');
    assert.equal(ago(now + 60_000, now), 'ahora', 'futuro: ahora');
    assert.equal(ago(now - 5 * 60_000, now), 'hace 5 min');
    assert.equal(ago(now - 3 * 3_600_000, now), 'hace 3 h');
    assert.equal(ago(new Date(now - 2 * 86_400_000), now), 'hace 2 d', 'acepta Date');
    assert.equal(ago(new Date(now - 90_000).toISOString(), new Date(now)), 'hace 1 min', 'acepta texto de fecha y now como Date');
    assert.equal(ago(now - 40 * 86_400_000, now), new Date(now - 40 * 86_400_000).toLocaleDateString('es'), '30 días o más: la fecha');
    assert.equal(ago('no es fecha', now), '', 'fecha inválida: vacío');
    await setLang('en');
    assert.equal(ago(now - 5 * 60_000, now), '5 min ago');
    assert.equal(ago(now - 1000, now), 'now');
    await setLang('es');
    ok('ago: ahora / min / h / d / fecha, en español e inglés, con número, Date o texto');
  }

  // ---- Image: sin tamaño ocupa todo el ancho con la proporción real; size y alto propio se respetan
  {
    const img = t => flat(t.root.findAll(n => n.type === 'Image')[0].props.style);
    let t = await render(h(Image, { source: { uri: 'https://x/foto.jpg' } }));
    assert.equal(img(t).width, '100%', 'sin tamaño: ancho 100%');
    await wait(10);
    assert.equal(img(t).aspectRatio, 2, 'con la proporción de getSize (800x400)');
    assert.equal(img(t).height, undefined);
    t = await render(h(Image, { source: { uri: 'https://x/a.jpg' }, size: 40 }));
    assert.deepEqual([img(t).width, img(t).height], [40, 40], 'size: cuadrada');
    t = await render(h(Image, { source: { uri: 'https://x/b.jpg' }, h: 120 })); await wait(10);
    assert.deepEqual([img(t).width, img(t).height, img(t).aspectRatio], ['100%', 120, undefined], 'con alto propio: sin proporción automática');
    t = await render(h(Image, { source: { uri: 'https://x/c.jpg' }, w: 200 })); await wait(10);
    assert.deepEqual([img(t).width, img(t).aspectRatio], [200, 2], 'con ancho propio: alto según la proporción');
    ok('Image: por defecto ancho 100% con la proporción de la imagen; size, alto y ancho propios se respetan');
  }

  // ---- Input multiline (textarea): texto arriba y label flotante en la primera línea, no en el centro
  {
    const labelY = t => t.root.findAll(n => n.type === 'Text').map(n => [].concat(n.props.style).flat(9).filter(Boolean).flatMap(s => s.transform || []).find(x => x.translateY)).find(Boolean)?.translateY.v;
    const montar = async multiline => {
      const t = await render(h(Input, { label: 'Notas', isFloat: true, multiline, ...(multiline ? { h: 120 } : {}) }));
      // layout: caja del campo de 120 de alto y label de 20
      const caja = t.root.findAll(n => n.type === 'View' && n.props.onLayout && flat(n.props.style).borderWidth === 1)[0];
      await act(async () => caja.props.onLayout({ nativeEvent: { layout: { height: 120 } } }));
      const label = t.root.findAll(n => n.type === 'Text' && n.props.onLayout)[0];
      await act(async () => label.props.onLayout({ nativeEvent: { layout: { height: 20 } } }));
      await wait(150);
      return t;
    };
    let t = await montar(false);
    assert.equal(labelY(t), 120 / 2 + 20 / 2 - 10, 'una línea: centrado en la caja');
    t = await montar(true);
    const linea = 14 * 1.25 + 8 + 8 + 2;
    assert.equal(labelY(t), linea / 2 + 20 / 2 - 10, 'multiline: en la primera línea');
    assert.equal(t.root.findAll(n => n.type === 'TextInput')[0].props.textAlignVertical, 'top', 'multiline: texto arriba');
    t = await render(h(Input, { multiline: true, textAlignVertical: 'center' }));
    assert.equal(t.root.findAll(n => n.type === 'TextInput')[0].props.textAlignVertical, 'center', 'textAlignVertical propio');
    ok('Input multiline: label flotante en la primera línea y texto arriba');
  }

  // ---- Tooltip: se abre al tocar, sobre el trigger y centrado, sin salirse; se cierra solo, al tocar fuera y con atrás
  {
    const burbuja = () => env.siblingRoot.root.findAll(n => n.type === 'AnimatedView' && n.props.onLayout)[0];
    const st = () => flat(burbuja().props.style);
    const op = () => { const o = st().opacity; return typeof o === 'object' ? o.v : o };
    const medir = async (w = 100, hh = 30) => { await act(async () => burbuja().props.onLayout({ nativeEvent: { layout: { width: w, height: hh } } })); await wait(200) };
    const { emitTap } = lib('index');

    env.triggerLayout = { x: 150, y: 300, width: 40, height: 40 };
    let t = await render(h(Tooltip, { label: 'Ayuda', duration: 0 }, h(RN.Text, null, 'i')));
    const trigger = () => t.root.findAll(n => n.type === 'Pressable' && n.props.onPress)[0];
    await act(async () => trigger().props.onPress()); await wait(10);
    assert.ok(shown('Ayuda'), 'abierto: se ve el texto');
    assert.equal(op(), 0, 'oculto hasta medir');
    await medir();
    assert.equal(op(), 1, 'visible tras medir');
    assert.equal(st().left, 150 + 20 - 50, 'centrado sobre el trigger');
    assert.equal(st().bottom, 800 - 300 + 6 + 6, 'encima del trigger (con flecha)');
    // Un toque dentro del trigger no lo cierra (lo alterna el propio trigger); fuera, sí
    await act(async () => emitTap(160, 310)); await wait(10);
    assert.ok(shown('Ayuda'), 'toque en el trigger: sigue abierto');
    await act(async () => emitTap(10, 10)); await wait(200);
    assert.ok(!shown('Ayuda'), 'toque fuera: se cierra');
    // Botón atrás
    await act(async () => trigger().props.onPress()); await wait(10); await medir();
    let handled; await act(async () => { handled = RN.BackHandler.press() }); await wait(200);
    assert.ok(handled && !shown('Ayuda'), 'atrás lo cierra');
    await act(async () => t.unmount());

    // Sin sitio arriba: abajo. Cerca del borde: no se sale. Se cierra solo tras duration
    env.triggerLayout = { x: 370, y: 30, width: 20, height: 20 };
    t = await render(h(Tooltip, { label: 'Borde', duration: 80 }, h(RN.Text, null, 'b')));
    await act(async () => trigger().props.onPress()); await wait(10); await medir(120, 30);
    assert.equal(st().top, 30 + 20 + 12, 'sin sitio arriba: debajo');
    assert.equal(st().left, 400 - 120 - 8, 'sin salirse por la derecha');
    await wait(200);
    assert.ok(!shown('Borde'), 'se cierra solo tras duration');
    await act(async () => t.unmount());

    // openOn="longPress", controlado, children función y ref
    env.triggerLayout = { x: 150, y: 300, width: 40, height: 40 };
    t = await render(h(Tooltip, { label: 'Largo', openOn: 'longPress', duration: 0 }, h(RN.Text, null, 'l')));
    const p = t.root.findAll(n => n.type === 'Pressable' && n.props.onLongPress)[0];
    assert.ok(p && !p.props.onPress, 'longPress: sin onPress');
    await act(async () => p.props.onLongPress()); await wait(10);
    assert.ok(shown('Largo'));
    await act(async () => t.unmount()); await wait(20);
    const ref = React.createRef(); const cambios = []; let tp;
    t = await render(h(Tooltip, { ref, label: 'Ctrl', isOpen: false, onOpenChange: v => cambios.push(v), duration: 0 }, x => { tp = x; return h(RN.Text, null, 'c') }));
    await act(async () => tp.onPress()); await wait(10);
    assert.deepEqual(cambios, [true], 'controlado: avisa');
    assert.ok(!shown('Ctrl'), 'controlado: manda isOpen');
    await act(async () => t.update(h(Tooltip, { ref, label: 'Ctrl', isOpen: true, onOpenChange: v => cambios.push(v), duration: 0 }, x => { tp = x; return h(RN.Text, null, 'c') }))); await wait(10);
    assert.ok(shown('Ctrl') && ref.current.isOpen() && tp.isOpen, 'abierto por la prop');
    await act(async () => t.unmount()); await wait(20);
    assert.ok(!shown('Ctrl'), 'al desmontar no queda nada');
    ok('Tooltip: abre al tocar o mantener, centrado sin salirse, cambia de lado, se cierra solo / fuera / con atrás, controlado y por ref');
  }

  // ---- Breadcrumbs: el último es la página actual, separadores, maxItems con "…"
  {
    const pulsados = [];
    const items = ['Inicio', 'Tienda', 'Ropa', 'Hombre', 'Zapatillas'].map((label, i) => ({ label, onPress: () => pulsados.push(label) }));
    let t = await render(h(Breadcrumbs, { items, separator: '/' }));
    assert.deepEqual(textos(t), ['Inicio', '/', 'Tienda', '/', 'Ropa', '/', 'Hombre', '/', 'Zapatillas']);
    const links = t.root.findAll(n => n.type === 'Pressable' && n.props.accessibilityRole === 'link');
    assert.equal(links.length, 4, 'el último no se pulsa');
    await act(async () => links[1].props.onPress());
    assert.deepEqual(pulsados, ['Tienda']);
    t = await render(h(Breadcrumbs, { items, separator: '›', maxItems: 3 }));
    assert.deepEqual(textos(t), ['Inicio', '›', '…', '›', 'Hombre', '›', 'Zapatillas'], 'maxItems: primero, … y los últimos');
    const dots = t.root.findAll(n => n.type === 'Pressable' && n.props.accessibilityLabel === '…')[0];
    await act(async () => dots.props.onPress());
    assert.equal(textos(t).filter(x => x !== '›').length, 5, 'al tocar … se ven todos');
    t = await render(h(Breadcrumbs, { items: items.slice(0, 2), scrollable: true }));
    assert.equal(t.root.findAll(n => n.type === 'ScrollView' && n.props.horizontal).length, 1, 'scrollable: scroll horizontal');
    assert.equal(t.root.findAll(n => n.type === 'Icon').length, 1, 'separador por defecto: icono');
    ok('Breadcrumbs: actual sin pulsar, separador propio o icono, maxItems con … desplegable y scrollable');
  }

  // ---- ReadMore: recorta y muestra "Leer más" solo si no cabe
  {
    const visible = t => t.root.findAll(n => n.type === 'Text' && !n.props.onTextLayout)[0];
    const copia = t => t.root.findAll(n => n.type === 'Text' && n.props.onTextLayout)[0];
    const lineas = async (t, n) => act(async () => copia(t).props.onTextLayout({ nativeEvent: { lines: Array(n).fill({}) } }));
    const toggles = [];
    let t = await render(h(ReadMore, { numberOfLines: 2, onToggle: v => toggles.push(v), fontSize: 15 }, 'Un texto largo'));
    assert.equal(visible(t).props.numberOfLines, 2);
    assert.ok(!textos(t).includes('Leer más'), 'sin medir: sin enlace');
    await lineas(t, 2);
    assert.ok(!textos(t).includes('Leer más'), 'cabe: sin enlace');
    await lineas(t, 5);
    assert.ok(textos(t).includes('Leer más'), 'no cabe: Leer más');
    const enlace = () => t.root.findAll(n => n.type === 'Pressable' && n.props.onPress)[0];
    await act(async () => enlace().props.onPress());
    assert.equal(visible(t).props.numberOfLines, undefined, 'desplegado: sin límite');
    assert.ok(textos(t).includes('Leer menos'));
    await act(async () => enlace().props.onPress());
    assert.equal(visible(t).props.numberOfLines, 2, 'recogido otra vez');
    assert.deepEqual(toggles, [true, false]);
    t = await render(h(ReadMore, { showLess: false, readMoreText: 'Ver todo' }, 'Texto'));
    await lineas(t, 9);
    assert.ok(textos(t).includes('Ver todo'), 'texto propio');
    await act(async () => enlace().props.onPress());
    assert.ok(!t.root.findAll(n => n.type === 'Pressable' && n.props.onPress).length, 'showLess=false: no se puede recoger');
    ok('ReadMore: recorta, enlace solo si no cabe, despliega y recoge, textos propios y showLess');
  }

  // ---- easynat/pdfjs: el archivo de la raíz carga dist/utils/pdfjs y va en el paquete
  {
    const root = path.join(__dirname, '..');
    const shim = fs.readFileSync(path.join(root, 'pdfjs.js'), 'utf8');
    assert.ok(/require\('\.\/dist\/utils\/pdfjs'\)/.test(shim), 'pdfjs.js carga dist/utils/pdfjs');
    const pkg = require(path.join(root, 'package.json'));
    assert.ok(pkg.files.includes('pdfjs.js') && pkg.files.includes('pdfjs.d.ts'), 'en files del paquete');
    ok("import 'easynat/pdfjs': acceso corto a pdf.js sin internet");
  }
})().catch(e => { console.error('FALLO', e); process.exit(1) });
