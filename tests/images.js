// Pruebas de ImageViewer e ImageEditor: opcionalidad, documento del WebView, mensajes, conversión de imágenes locales
// y la geometría del editor (girar, recortar y exportar a la resolución original) con un DOM mínimo
const assert = require('assert');
const H = require('./harness');
const { h, TR, act, env, lib, wait, React } = H;
const ok = msg => console.log('OK ' + msg);

// fetch + FileReader de React Native (en Node no hay FileReader)
const fetched = [];
global.fetch = async uri => { fetched.push(uri); if (uri.includes('roto')) throw new Error('404'); return { blob: async () => ({ uri }) } };
global.FileReader = class { readAsDataURL(b) { this.result = 'data:image/jpeg;base64,' + Buffer.from(b.uri).toString('base64'); setTimeout(() => this.onload()) } };

(async () => {
  const { ImageViewer, ImageEditor, openImageEditor } = lib('index');
  const render = async el => { let t; await act(async () => { t = TR.create(el) }); return t };
  const webOf = t => t.root.findAll(n => n.type === 'WebView')[0];
  const send = async (t, msg) => act(async () => webOf(t).props.onMessage({ nativeEvent: { data: JSON.stringify(msg) } }));
  const btn = (t, label) => t.root.findAll(n => typeof n.type === 'string' && n.props.accessibilityRole === 'button' && n.props.accessibilityLabel === label)[0];
  const scriptsOf = html => [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);

  // ---- opcional: sin react-native-webview, aviso
  {
    env.noWebView = true;
    const warn = console.warn; console.warn = () => { };
    const a = await render(h(ImageViewer, { images: ['https://x/1.jpg'] }));
    const b = await render(h(ImageEditor, { source: 'https://x/1.jpg' }));
    console.warn = warn; env.noWebView = false;
    [a, b].forEach(t => assert.ok(JSON.stringify(t.toJSON()).includes('npx expo install react-native-webview')));
    ok('sin react-native-webview: los dos avisan (no se rompen)');
  }

  // ---- visor: documento válido, imágenes locales convertidas (solo las de alrededor), índice, zoom y toques
  {
    env.injected.length = 0; fetched.length = 0;
    const idx = [], taps = [];
    const imgs = ['https://x/1.jpg', 'file:///a.jpg', 'file:///b.jpg', 'file:///c.jpg', { uri: 'https://x/5.jpg', title: 'Quinta' }];
    const t = await render(h(ImageViewer, { images: imgs, initialIndex: 0, onIndexChange: i => idx.push(i) }));
    const html = webOf(t).props.source.html;
    scriptsOf(html).forEach(js => new Function(js));
    assert.ok(html.includes('"images":["https://x/1.jpg",null,null,null,"https://x/5.jpg"]'), 'las file:// no van tal cual: ' + html.slice(html.indexOf('__CFG'), html.indexOf('__CFG') + 160));
    await wait(20);
    assert.deepEqual(fetched, ['file:///a.jpg'], 'solo se convierte la de al lado de la visible');
    assert.equal(env.injected.length, 0, 'hasta "ready" se encola');
    await send(t, { type: 'ready' });
    assert.ok(env.injected.some(js => js.startsWith('window.__setSrc(1,"data:image/jpeg;base64,')), 'y llega convertida');
    assert.ok(btn(t, '→') && !btn(t, '←'), 'en la primera: solo la flecha derecha');
    await send(t, { type: 'index', index: 4 });
    assert.deepEqual(idx, [4]);
    assert.ok(JSON.stringify(t.toJSON()).includes('Quinta'), 'el título de la visible');
    assert.ok(btn(t, '←') && !btn(t, '→'));
    await send(t, { type: 'zoom', scale: 2 });
    assert.ok(!btn(t, '←'), 'con zoom no hay flechas');
    await send(t, { type: 'tap' });
    assert.ok(!btn(t, '1'), 'un toque oculta los controles');
    await send(t, { type: 'tap' });
    assert.ok(btn(t, '1'), 'y otro los vuelve a mostrar');
    env.injected.length = 0;
    await act(async () => btn(t, '2').props.onPress());
    assert.ok(env.injected.includes('window.__goTo(1,true);true;'), 'los puntos llevan a su imagen: ' + env.injected);
    ok('ImageViewer: documento, conversión de file:// cercanas, índice, título, flechas, zoom, toque y puntos');
  }

  // ---- editor: carga en data URI, estado de deshacer, guardar → resultado; cancelar
  {
    env.injected.length = 0;
    const saved = [], cancel = [];
    const t = await render(h(ImageEditor, { source: 'https://x/foto.jpg', onSave: r => saved.push(r), onCancel: () => cancel.push(1), maxSize: 1000, format: 'png' }));
    scriptsOf(webOf(t).props.source.html).forEach(js => new Function(js));
    await send(t, { type: 'ready' });
    await wait(20);
    assert.ok(env.injected.some(js => js.startsWith('window.__load("data:image/jpeg;base64,')), 'las https también como data URI (sin CORS al exportar)');
    assert.equal(btn(t, 'undo').props.accessibilityState.disabled, true);
    await send(t, { type: 'loaded', width: 4000, height: 3000 });
    await send(t, { type: 'state', canUndo: true, canRedo: false, hasSelection: false });
    assert.equal(btn(t, 'undo').props.accessibilityState.disabled, false, 'deshacer se activa al dibujar');
    await act(async () => btn(t, 'highlighter').props.onPress());
    assert.ok(env.injected.includes('window.__setTool("highlighter");true;'));
    assert.equal(btn(t, 'highlighter').props.accessibilityState.selected, true);
    assert.ok(btn(t, 'shapes') && btn(t, 'privacy') && !btn(t, 'star'), 'formas y privacidad agrupadas en un botón con menú');
    assert.ok(!btn(t, 'sticker') && !btn(t, 'emoji'), 'sin stickers no hay botón de stickers');
    assert.ok(btn(t, 'fill') && btn(t, 'adjust'), 'bote y ajustes');
    assert.ok(webOf(t).props.source.html.includes('"snap":false'), 'imán / guías desactivados por defecto');
    env.injected.length = 0;
    let p; await act(async () => { p = btn(t, 'Done').props.onPress() });
    const call = env.injected.find(js => js.startsWith('window.__export('));
    assert.ok(call && call.includes('"format":"png"') && call.includes('"maxSize":1000'), call);
    const id = JSON.parse(call.slice('window.__export('.length, call.indexOf(');true'))).id;
    await send(t, { type: 'export', id, dataUri: 'data:image/png;base64,QUJD', width: 1000, height: 750 });
    await act(async () => { await p });
    assert.deepEqual(saved, [{ dataUri: 'data:image/png;base64,QUJD', base64: 'QUJD', mimeType: 'image/png', width: 1000, height: 750 }]);
    await act(async () => btn(t, 'Cancel').props.onPress());
    assert.equal(cancel.length, 1);
    // recorte en marcha: la barra pasa a aplicar / cancelar
    await send(t, { type: 'state', canUndo: true, canRedo: false, hasSelection: true });
    await act(async () => btn(t, 'crop').props.onPress());
    env.injected.length = 0;
    await act(async () => btn(t, 'Apply').props.onPress());
    assert.ok(env.injected[0] === 'window.__applyCrop();true;', env.injected);
    ok('ImageEditor: data URI, deshacer, herramienta, guardar con formato y tamaño máximo, cancelar y aplicar recorte');
  }

  // ---- editor: escribir y editar textos, barra con algo seleccionado, atrás de Android
  {
    env.injected.length = 0;
    const cancel = [];
    const t = await render(h(ImageEditor, { source: 'data:x', onCancel: () => cancel.push(1) }));
    await send(t, { type: 'ready' }); await send(t, { type: 'loaded', width: 400, height: 300 });
    const last = l => t.root.findAll(n => typeof n.type === 'string' && n.props.accessibilityLabel === l).at(-1);
    const input = () => t.root.findAll(n => n.type === 'TextInput')[0];
    await act(async () => btn(t, 'text').props.onPress());
    assert.ok(env.injected.includes('window.__setTool("text");true;') && input(), 'T: herramienta de texto y el cuadro para escribir');
    await act(async () => input().props.onChangeText('Hola\nmundo'));
    await act(async () => btn(t, 'font-serif').props.onPress());
    await act(async () => btn(t, '#facc15').props.onPress());
    assert.ok(btn(t, 'bg-solid'), 'por defecto, caja del color');
    assert.equal(input().props.style.backgroundColor, '#facc15', 'vista previa con caja del color');
    assert.equal(input().props.style.color, '#111111', 'y letra que se lee encima');
    env.injected.length = 0;
    await act(async () => last('Done').props.onPress());
    assert.ok(!input(), 'se cierra');
    const add = env.injected.find(js => js.startsWith('window.__addText('));
    assert.ok(add && add.includes('"text":"Hola\\nmundo"') && add.includes('"color":"#facc15"') && add.includes('"bg":"outline"') === false && add.includes('"fontId":"serif"') && add.includes('Georgia'), add);
    // un toque en un hueco de la foto (newText) abre el cuadro con el último estilo; vacío no añade nada
    await send(t, { type: 'newText', x: 0.2, y: 0.3 });
    assert.equal(input().props.style.fontFamily, 'serif', 'recuerda la fuente');
    env.injected.length = 0;
    await act(async () => last('Done').props.onPress());
    assert.ok(!env.injected.some(js => js.includes('__addText')), 'vacío: nada');
    // editar uno existente: llega con su texto; vacío lo borra; cancelar lo vuelve a mostrar
    await send(t, { type: 'editText', index: 0, op: { text: 'Hola', color: '#ffffff', bg: 'soft', font: 'mono', align: 'left' } });
    assert.equal(input().props.value, 'Hola');
    assert.equal(input().props.style.textAlign, 'left');
    env.injected.length = 0;
    await act(async () => input().props.onChangeText('Adiós'));
    await act(async () => last('Done').props.onPress());
    assert.ok(env.injected[0].startsWith('window.__updateText(0,{"text":"Adiós"') && env.injected[0].includes('"fontId":"mono"'), env.injected[0]);
    await send(t, { type: 'editText', index: 0, op: { text: 'Hola' } });
    env.injected.length = 0;
    await act(async () => t.root.findAll(n => typeof n.type === 'string' && n.props.accessibilityLabel === 'Cancel').at(-1).props.onPress());
    assert.ok(env.injected.includes('window.__endEdit();true;') && !input());
    // con algo seleccionado: duplicar y borrar en vez de girar y recortar; estilo si es una forma
    await send(t, { type: 'state', canUndo: true, canRedo: false, hasSelection: false, changed: true, selected: { type: 'star', color: '#ef4444', fill: 'solid', dash: 'solid', hasWidth: true, closed: true, dashable: true } });
    assert.ok(btn(t, 'duplicate') && btn(t, 'delete') && btn(t, 'style') && !btn(t, 'rotate'), 'barra de la selección');
    env.injected.length = 0;
    await act(async () => btn(t, 'delete').props.onPress());
    assert.ok(env.injected.includes('window.__deleteSelected();true;'));
    // atrás: primero quita la selección; con cambios, avisa; la segunda vez cancela
    const RN = require('react-native');
    env.injected.length = 0;
    await act(async () => { RN.BackHandler.press() });
    assert.ok(env.injected.includes('window.__select(-1);true;') && cancel.length === 0, 'atrás quita la selección');
    await send(t, { type: 'state', canUndo: true, canRedo: false, hasSelection: false, changed: true, selected: null });
    await act(async () => { RN.BackHandler.press() });
    assert.ok(JSON.stringify(t.toJSON()).includes('Press back again') && cancel.length === 0, 'con cambios: avisa antes de descartar');
    await act(async () => { RN.BackHandler.press() });
    assert.equal(cancel.length, 1, 'y la segunda vez cancela');
    await act(async () => btn(t, 'text').props.onPress());
    await act(async () => { RN.BackHandler.press() });
    assert.ok(!input(), 'atrás con el cuadro de texto abierto: lo cierra');
    t.unmount();
    ok('ImageEditor: escribir (fuente, color, caja), editar, vacío borra, barra de la selección y atrás de Android');
  }

  // ---- editor: stickers, ajustes y filtros, cuentagotas, quitar el zoom
  {
    env.injected.length = 0;
    const t = await render(h(ImageEditor, { source: 'data:x', stickers: ['https://x/s1.png', { uri: 'https://x/s2.svg', thumbnail: 'https://x/s2.png', label: 'dos' }] }));
    await send(t, { type: 'ready' }); await send(t, { type: 'loaded', width: 400, height: 300 });
    assert.ok(btn(t, 'sticker'), 'con stickers: botón');
    // el menú no está abierto en el árbol: se prueba con el ref
    const r = React.createRef();
    const t2 = await render(h(ImageEditor, { ref: r, source: 'data:x', stickers: ['https://x/s1.png'] }));
    await send(t2, { type: 'ready' });
    env.injected.length = 0;
    await act(async () => { await r.current.addSticker('https://x/s1.png') });
    const st1 = env.injected.find(js => js.startsWith('window.__addSticker('));
    assert.ok(st1 && st1.includes('"id":"https://x/s1.png"') && st1.includes('"src":"data:image/jpeg;base64,'), 'el sticker llega como data URI: ' + st1);
    assert.ok(env.injected.includes('window.__setTool("move");true;'), 'y queda para moverlo');
    // ajustes: panel con filtros; un filtro = un paso de deshacer
    env.injected.length = 0;
    await act(async () => btn(t, 'adjust').props.onPress());
    assert.ok(env.injected.includes('window.__setTool("none");true;') && btn(t, 'filter-mono') && btn(t, 'contrast'), 'panel de ajustes (y los toques no dibujan)');
    env.injected.length = 0;
    await act(async () => btn(t, 'filter-mono').props.onPress());
    assert.deepEqual(env.injected, ['window.__adjustBegin();true;', 'window.__setAdjust({"mono":100,"contrast":12});true;', 'window.__adjustEnd();true;']);
    assert.equal(btn(t, 'filter-mono').props.accessibilityState.selected, true);
    assert.equal(btn(t, 'resetAdjust').props.accessibilityState.disabled, false);
    // el control deslizante: tocar a 3/4 = 50; arrastrar suma; al soltar, un paso de deshacer
    await act(async () => btn(t, 'warmth').props.onPress());
    const slider = t.root.findAll(n => n.props && n.props.accessibilityRole === 'adjustable' && n.props.onResponderGrant)[0];
    await act(async () => slider.props.onLayout({ nativeEvent: { layout: { width: 200 } } }));
    env.injected.length = 0;
    await act(async () => slider.props.onResponderGrant({ nativeEvent: { locationX: 150, pageX: 150 } }));
    await act(async () => slider.props.onResponderMove({ nativeEvent: { pageX: 170 } }));
    await act(async () => slider.props.onResponderRelease());
    assert.equal(env.injected[0], 'window.__adjustBegin();true;');
    assert.ok(env.injected.includes('window.__setAdjust({"mono":100,"contrast":12,"warmth":50});true;') && env.injected.includes('window.__setAdjust({"mono":100,"contrast":12,"warmth":70});true;'), env.injected.join(' | '));
    assert.equal(env.injected.at(-1), 'window.__adjustEnd();true;');
    await act(async () => btn(t, 'closeAdjust').props.onPress());
    assert.ok(btn(t, 'shapes'), 'cerrar ajustes: vuelve la barra');
    // cuentagotas: el color tomado se aplica y se vuelve a la herramienta de antes
    env.injected.length = 0;
    await send(t, { type: 'pick', color: '#123456' });
    assert.ok(env.injected.includes('window.__setColor("#123456");true;'));
    // con zoom: botón para quitarlo
    assert.ok(!btn(t, 'resetZoom'));
    await send(t, { type: 'state', canUndo: false, canRedo: false, hasSelection: false, changed: false, selected: null, zoom: 2.5, adjust: { mono: 100 } });
    env.injected.length = 0;
    await act(async () => btn(t, 'resetZoom').props.onPress());
    assert.ok(env.injected.includes('window.__resetZoom();true;'));
    t.unmount(); t2.unmount();
    ok('ImageEditor: stickers (data URI), panel de ajustes, filtros y control deslizante (un paso de deshacer), cuentagotas y quitar el zoom');
  }

  // ---- error al abrir la imagen
  {
    const t = await render(h(ImageEditor, { source: 'https://x/roto.jpg' }));
    await wait(20);
    assert.ok(JSON.stringify(t.toJSON()).includes('Could not load'), 'aviso si no se puede abrir');
    ok('ImageEditor: aviso si la imagen no se puede abrir');
  }

  // ---- el script del editor con un DOM mínimo: girar, recortar y exportar a la resolución original
  {
    const t = await render(h(ImageEditor, { source: 'data:x', snapGuides: true }));
    const [cfgJs, script] = scriptsOf(webOf(t).props.source.html);
    const posts = [], listeners = {};
    const drawn = [];
    const imgData = (w, h) => ({ width: w, height: h, data: new Uint8ClampedArray(Math.max(1, w * h) * 4).fill(128) });
    const ctx = () => new Proxy({ getImageData: (x, y, w, h) => imgData(w, h), createImageData: (w, h) => imgData(w, h), measureText(s) { return { width: String(s).length * parseFloat(/(\d+(\.\d+)?)px/.exec(this.font || '10px')[1]) * 0.5 } }, fillText(s) { drawn.push(s) }, drawImage() { drawn.push('img') } },
      { get: (o, k) => (k in o ? o[k] : () => { }), set: (o, k, v) => { o[k] = v; return true } });
    const el = () => ({ style: {}, getContext: ctx, getBoundingClientRect: () => ({ left: 0, top: 0 }), toDataURL: function (type) { return `${type}:${this.width}x${this.height}` } });
    const els = { wrap: el(), base: el(), draw: el(), crop: el() };
    const win = {
      innerWidth: 400, innerHeight: 800, devicePixelRatio: 2,
      ReactNativeWebView: { postMessage: m => posts.push(JSON.parse(m)) },
      addEventListener: () => { },
    };
    const doc = { getElementById: id => els[id], createElement: () => el(), addEventListener: (n, f) => { listeners[n] = f } };
    class Img { set src(v) { this.naturalWidth = 4000; this.naturalHeight = 3000; this.onload() } }
    const frames = [];
    const run = new Function('window', 'document', 'Image', 'innerWidth', 'innerHeight', 'requestAnimationFrame', cfgJs + ';' + script);
    run(win, doc, Img, 400, 800, f => frames.push(f));
    const last = type => posts.filter(p => p.type === type).at(-1);
    assert.equal(posts[0].type, 'ready');
    win.__load('data:foto');
    assert.deepEqual(last('loaded'), { type: 'loaded', width: 4000, height: 3000 });
    const touch = (n, x, y) => listeners[n]({ touches: n === 'touchend' ? [] : [{ clientX: x, clientY: y }], changedTouches: [{ clientX: x, clientY: y }], preventDefault() { } });
    // dibujar un trazo → se puede deshacer
    touch('touchstart', 10, 10); touch('touchmove', 100, 100); touch('touchend', 100, 100);
    assert.equal(last('state').canUndo, true);
    win.__export({ id: 1, format: 'jpeg', quality: 0.9 });
    assert.equal(last('export').dataUri, 'image/jpeg:4000x3000', 'exporta al tamaño original, no al de la pantalla');
    win.__rotate(1);
    win.__export({ id: 2, format: 'png' });
    assert.equal(last('export').dataUri, 'image/png:3000x4000', 'girada: ancho y alto cambiados');
    // recortar la mitad izquierda (en pantalla) → 1500 x 4000
    const dw = parseFloat(els.draw.style.width), dh = parseFloat(els.draw.style.height);
    win.__setTool('crop');
    touch('touchstart', 0, 0); touch('touchmove', dw / 2, dh); touch('touchend', dw / 2, dh);
    assert.equal(last('state').hasSelection, true);
    win.__applyCrop();
    win.__export({ id: 3, format: 'png' });
    assert.equal(last('export').dataUri, 'image/png:1500x4000', 'recortada');
    win.__export({ id: 4, format: 'png', maxSize: 1000 });
    assert.equal(last('export').dataUri, 'image/png:375x1000', 'con maxSize: lado mayor 1000');
    win.__undo(); win.__export({ id: 5, format: 'png' });
    assert.equal(last('export').dataUri, 'image/png:3000x4000', 'deshacer quita el recorte');
    win.__undo(); win.__export({ id: 6, format: 'png' });
    assert.equal(last('export').dataUri, 'image/png:4000x3000', 'y luego el giro');
    win.__redo(); win.__export({ id: 7, format: 'png' });
    assert.equal(last('export').dataUri, 'image/png:3000x4000', 'rehacer');
    // un toque sin moverse con una figura no crea nada
    win.__setTool('square');
    const before = posts.filter(p => p.type === 'state').length;
    touch('touchstart', 50, 50); touch('touchend', 50, 50);
    assert.equal(last('state').canRedo, true, 'un toque con figura no es un trazo (no borra el rehacer)');
    assert.ok(posts.filter(p => p.type === 'state').length > before);
    ok('script del editor: exporta a 4000×3000, gira, recorta, maxSize y deshacer / rehacer del giro y el recorte');

    // ---- textos y selección: añadir, arrastrar (con imán al centro), tirador (escala y giro), tocar para editar
    win.__undo(); win.__clear();
    const S = () => win.__state(), O = i => S().st.ops[i];
    const { dw: W, dh: Hh } = S(), ox = (400 - W) / 2, oy = (800 - Hh) / 2;
    const at = (n, x, y) => touch(n, ox + x, oy + y);
    win.__setTool('text');
    win.__addText({ text: 'Hola', px: 30, font: 'sans-serif', fontId: 'sans', color: '#fff', bg: 'solid' });
    const i0 = S().st.ops.length - 1;
    assert.equal(S().selected, i0, 'el texto nuevo queda seleccionado');
    assert.ok(Math.abs(O(i0).size * Math.sqrt(W * Hh) - 30) < 1e-9, 'tamaño normalizado (30 px en pantalla)');
    assert.equal(last('state').selected.type, 'text');
    // arrastrar desde su centro 60 px a la derecha
    at('touchstart', W / 2, Hh / 2); at('touchmove', W / 2 + 30, Hh / 2 + 2); at('touchmove', W / 2 + 60, Hh / 2 + 3); at('touchend', W / 2 + 60, Hh / 2 + 3);
    assert.ok(Math.abs(O(i0).dx * W - 60) < 0.5, 'movido: ' + O(i0).dx * W);
    assert.equal(O(i0).dy, 0, 'a 3 px del centro: el imán lo deja centrado en vertical');
    assert.equal(last('state').canUndo, true);
    // tirador (abajo a la derecha de la caja): alejarlo al doble, girado 90º → escala 2 y giro
    const L = { w: 4 * 15, pad: 30 * 0.35, h: 30 * 1.25 };
    const cx = W / 2 + 60, cy = Hh / 2, hx = cx + L.w / 2 + L.pad + 6, hy = cy + L.h / 2 + 6;
    at('touchstart', hx, hy); at('touchmove', cx - (hy - cy) * 2, cy + (hx - cx) * 2); at('touchend', cx - (hy - cy) * 2, cy + (hx - cx) * 2);
    assert.ok(Math.abs(O(i0).s - 2) < 1e-6 && Math.abs(O(i0).rot - Math.PI / 2) < 1e-6, 'escala ' + O(i0).s + ' giro ' + O(i0).rot);
    // un toque en el texto ya seleccionado: editarlo (y se oculta mientras)
    posts.length = 0;
    at('touchstart', cx, cy); at('touchend', cx, cy);
    assert.deepEqual(posts.find(p => p.type === 'editText'), { type: 'editText', index: i0, op: { text: 'Hola', color: '#fff', bg: 'solid', font: 'sans', align: 'center' } });
    win.__updateText(i0, { text: 'Adiós', color: '#000' });
    assert.equal(O(i0).text, 'Adiós'); assert.equal(O(i0).s, 2, 'editar no pierde la escala');
    // un toque en un hueco con la herramienta de texto: escribir uno nuevo ahí
    posts.length = 0;
    at('touchstart', 20, 20); at('touchend', 20, 20);
    const nt = posts.find(p => p.type === 'newText');
    assert.ok(nt && Math.abs(nt.x - 20 / W) < 1e-9, 'newText en el punto tocado');
    // color con algo seleccionado: se aplica a eso; duplicar y borrar
    win.__select(i0); win.__setColor('#22c55e');
    assert.equal(O(i0).color, '#22c55e');
    win.__duplicate();
    assert.equal(S().st.ops.length, i0 + 2); assert.ok(Math.abs(O(i0 + 1).dx - O(i0).dx - 0.04) < 1e-9, 'la copia, un poco desplazada');
    win.__deleteSelected();
    assert.equal(S().st.ops.length, i0 + 1);
    // girar la foto: el texto gira con ella; recortar: el tamaño se adapta
    const prev = O(i0);
    win.__rotate(1);
    assert.ok(Math.abs(O(i0).rot - (prev.rot + Math.PI / 2)) < 1e-9 && Math.abs(O(i0).x - (1 - prev.y)) < 1e-9, 'el texto gira con la foto');
    assert.ok(Math.abs(O(i0).dx + prev.dy) < 1e-9 && Math.abs(O(i0).dy - prev.dx) < 1e-9, 'y su desplazamiento también');
    win.__undo();
    ok('script del editor: texto nuevo seleccionado, arrastrar con imán, tirador (escala y giro), tocar para editar, color a la selección, duplicar, borrar y girar con la foto');

    // ---- pixelar / desenfocar: de la foto, al exportar; formas con relleno y discontinuas; marcador
    win.__clear();
    win.__setTool('pixelate'); at('touchstart', 10, 10); at('touchmove', 100, 80); at('touchend', 100, 80);
    win.__setTool('blur'); at('touchstart', 3, 3); at('touchend', 4, 4);
    assert.equal(S().st.ops.length, 1, 'una zona minúscula no cuenta');
    assert.equal(O(0).type, 'pixelate'); assert.ok(O(0).block > 0);
    win.__setStyle({ fill: 'soft', dash: 'dashed' });
    win.__setTool('star'); at('touchstart', 150, 20); at('touchmove', 200, 70); at('touchend', 200, 70);
    assert.equal(O(1).fill, 'soft'); assert.equal(O(1).dash, 'dashed');
    win.__setTool('highlighter'); at('touchstart', 10, 150); for (let x = 12; x < 120; x += 3) at("touchmove", x, 150 + (x % 2) * 0.5); at('touchend', 120, 150);
    assert.ok(O(2).points.length < 10, 'trazo simplificado: ' + O(2).points.length + ' puntos');
    assert.ok(Math.abs(O(2).width * Math.sqrt(W * Hh) - 6 * 2.5) < 1e-9, 'marcador: más ancho');
    drawn.length = 0;
    win.__export({ id: 9, format: 'jpeg' });
    assert.ok(!last('export').error, last('export').error);
    assert.ok(drawn.filter(d => d === 'img').length >= 3, 'la foto, la zona pixelada (reducir y agrandar) y la capa');
    // seleccionar un trazo solo tocando cerca de la línea
    win.__setTool('move');
    at('touchstart', 60, 190); at('touchend', 60, 190);
    assert.equal(S().selected, -1, 'lejos del trazo (aunque dentro de su rectángulo ampliado): nada');
    at('touchstart', 60, 151); at('touchend', 60, 151);
    assert.equal(S().selected, 2, 'sobre el trazo: seleccionado');
    ok('script del editor: pixelar (de la foto), zonas mínimas fuera, estrella con relleno y discontinua, marcador simplificado, exportar y seleccionar trazos');

    // ---- zoom: dos dedos sin selección; los toques se pasan a la foto; dibujar con zoom; quitarlo
    win.__clear(); win.__select(-1); win.__setTool('pencil');
    const two = (n, a, b) => listeners[n]({ touches: n === 'touchend' ? [] : [{ clientX: ox + a[0], clientY: oy + a[1] }, { clientX: ox + b[0], clientY: oy + b[1] }], changedTouches: [], preventDefault() { } });
    two('touchstart', [W / 2 - 20, Hh / 2], [W / 2 + 20, Hh / 2]); two('touchmove', [W / 2 - 40, Hh / 2], [W / 2 + 40, Hh / 2]); two('touchend', [0, 0], [0, 0]);
    assert.ok(Math.abs(S().zoom - 2) < 1e-9, 'zoom x2: ' + S().zoom);
    assert.equal(S().st.ops.length, 0, 'el pellizco no dibuja');
    assert.equal(last('state').zoom, 2);
    // con zoom x2 centrado, tocar el centro de la pantalla sigue siendo el centro de la foto; 40 px de pantalla = 20 de foto
    at('touchstart', W / 2, Hh / 2); at('touchmove', W / 2 + 40, Hh / 2); at('touchend', W / 2 + 40, Hh / 2);
    const z = O(0);
    assert.ok(Math.abs(z.points[0].x - 0.5) < 1e-6 && Math.abs(z.points.at(-1).x - (0.5 + 20 / W)) < 1e-6, 'puntos con zoom: ' + JSON.stringify(z.points));
    assert.ok(Math.abs(z.width * Math.sqrt(W * Hh) - 3) < 1e-9, 'grosor de pantalla (6 px con zoom x2 = 3 px de foto)');
    win.__resetZoom();
    assert.equal(S().zoom, 1);

    // ---- bote: dentro de lo dibujado (un toque = un relleno); inundación y crecer
    win.__setTool('fill'); at('touchstart', 30, 30); at('touchend', 30, 30);
    assert.deepEqual(O(1), { type: 'fill', x: 30 / W, y: 30 / Hh, color: '#22c55e', mode: 'drawing' });
    win.__setStyle({ fillMode: 'image' }); at('touchstart', 31, 31); at('touchmove', 80, 80); at('touchend', 80, 80);
    assert.equal(S().st.ops.length, 2, 'arrastrar no rellena');
    const P = win.__pure;
    // un cuadrado de 6x6 con borde: dentro se llena, fuera no
    const wall = new Uint8Array(36);
    for (let i = 0; i < 6; i++) { wall[i] = wall[30 + i] = wall[i * 6] = wall[i * 6 + 5] = 1; }
    const inside = P.flood(wall, 6, 6, 2, 2);
    assert.equal([...inside].filter(Boolean).length, 16, 'dentro: 4x4');
    assert.equal(P.flood(wall, 6, 6, 0, 0), null, 'en el borde: nada');
    assert.equal([...P.grow(inside, 6, 6, 1, wall)].filter(Boolean).length, 32, 'crece solo hacia el borde (sin esquinas)');
    // ajustes por píxel
    const px = (rgb, a) => { const d = new Uint8ClampedArray([...rgb, 255]); P.adjustPixels(d, a); return [...d.slice(0, 3)]; };
    assert.deepEqual(px([100, 100, 100], {}), [100, 100, 100], 'sin ajustes, igual');
    assert.ok(px([100, 100, 100], { brightness: 50 })[0] === 130, 'brillo +50');
    const m = px([200, 50, 50], { mono: 100 });
    assert.ok(m[0] === m[1] && m[1] === m[2], 'B/N: gris ' + m);
    const c = px([200, 60, 60], { contrast: 50 });
    assert.ok(c[0] > 200 && c[1] < 60, 'contraste: se separan ' + c);
    const sat = px([150, 100, 100], { saturation: -100 });
    assert.ok(Math.abs(sat[0] - sat[1]) <= 1, 'saturación -100: gris ' + sat);
    const w = px([100, 100, 100], { warmth: 100 });
    assert.ok(w[0] > 100 && w[2] < 100, 'calidez: más rojo, menos azul ' + w);
    // __setAdjust + __adjustEnd: un paso de deshacer; la foto se rehace en el siguiente fotograma
    const undoBefore = S().st;
    win.__adjustBegin(); win.__setAdjust({ brightness: 10 }); win.__setAdjust({ brightness: 20 }); win.__adjustEnd();
    assert.deepEqual(S().st.adjust, { brightness: 20 });
    assert.equal(frames.length > 0, true, 'rehacer la foto se deja para el fotograma');
    frames.splice(0).forEach(f => f());
    win.__undo();
    assert.deepEqual(S().st.adjust, undoBefore.adjust, 'un deshacer quita el ajuste entero');
    assert.equal(S().st.ops.length, 2, 'y no toca lo dibujado');
    win.__export({ id: 11, format: 'jpeg' });
    assert.ok(!last('export').error, 'exportar con relleno: ' + last('export').error);
    ok('script del editor: zoom con dos dedos (sin dibujar), toques y grosor con zoom, bote (toque, no arrastre), inundación, ajustes por píxel y un deshacer por ajuste');
  }

  console.log('test_images: todo OK');
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1) });
