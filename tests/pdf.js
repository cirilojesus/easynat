// Pruebas de PDFViewer: opcionalidad, documento (pdf.js del CDN o de dentro), lectura de la fuente en trozos, mensajes
// (carga, página, enlaces, contraseña, error, búsqueda) y el script del visor en un DOM (linkedom) con un pdf.js falso
const assert = require('assert');
const H = require('./harness');
const { h, TR, act, env, lib, wait } = H;
const ok = msg => console.log('OK ' + msg);

const fetched = [];
global.fetch = async (uri, init) => { fetched.push([uri, init]); if (uri.includes('roto')) throw new Error('sin red'); return { status: 200, blob: async () => ({ uri }) } };
global.FileReader = class { readAsDataURL(b) { this.result = 'data:application/pdf;base64,' + Buffer.from('PDF:' + b.uri).toString('base64'); setTimeout(() => this.onload()) } };

(async () => {
  const { PDFViewer, registerPdfJs, PDFJS_VERSION } = lib('index');
  const RN = require('react-native');
  const render = async el => { let t; await act(async () => { t = TR.create(el) }); return t };
  const webOf = t => t.root.findAll(n => n.type === 'WebView')[0];
  const send = async (t, msg) => act(async () => webOf(t).props.onMessage({ nativeEvent: { data: JSON.stringify(msg) } }));
  const btn = (t, label) => t.root.findAll(n => typeof n.type === 'string' && n.props.accessibilityLabel === label)[0];
  const text = t => JSON.stringify(t.toJSON());
  const scriptsOf = html => [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);

  // ---- opcional, y pdf.js: del CDN por defecto; de dentro de la app si se registró
  {
    env.noWebView = true;
    const warn = console.warn; console.warn = () => { };
    const a = await render(h(PDFViewer, { source: 'https://x/a.pdf' }));
    console.warn = warn; env.noWebView = false;
    assert.ok(text(a).includes('npx expo install react-native-webview'));
    const cdn = webOf(await render(h(PDFViewer, { source: { base64: 'AA==' } }))).props.source.html;
    scriptsOf(cdn).forEach(js => new Function(js));
    assert.ok(cdn.includes(`"lib":"https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VERSION}/legacy/build/"`) && cdn.includes('"inline":false') && !cdn.includes('__PDFJS_MAIN='), 'CDN por defecto');
    assert.ok(cdn.length < 40000, 'sin pdf.js dentro el documento es pequeño: ' + cdn.length);
    registerPdfJs({ version: '9.9.9', main: 'var x = "</script>";', worker: 'w' });
    const inl = webOf(await render(h(PDFViewer, { source: { base64: 'AA==' } }))).props.source.html;
    assert.ok(inl.includes('"inline":true') && inl.includes('window.__PDFJS_MAIN="var x = \\"\\u003c/script>\\";"'), 'registrado: va dentro (y un </script> no rompe el documento)');
    assert.equal(scriptsOf(inl).length, 2, 'el </script> del código no cierra el <script>');
    const own = webOf(await render(h(PDFViewer, { source: { base64: 'AA==' }, pdfjsUrl: 'https://mi.cdn/pdfjs/' }))).props.source.html;
    assert.ok(own.includes('"cmaps":"https://mi.cdn/pdfjs/cmaps/"'), 'pdfjsUrl propio');
    registerPdfJs(null);
    // el archivo de pdf.js (utils/pdfjs) se registra solo al importarlo
    require(require('path').join(__dirname, '.build/utils/pdfjs.js'));
    const real = webOf(await render(h(PDFViewer, { source: { base64: 'AA==' } }))).props.source.html;
    assert.ok(real.includes('"inline":true') && real.length > 1400000 && scriptsOf(real).length === 2, 'import utils/pdfjs: pdf.js dentro (' + real.length + ')');
    registerPdfJs(null);
    ok('opcional; pdf.js del CDN por defecto, dentro de la app con registerPdfJs (escapado) o de una URL propia');
  }

  // ---- la fuente: base64, data URI, uri con cabeceras; en trozos y después de "ready"
  {
    env.injected.length = 0; fetched.length = 0;
    const big = 'A'.repeat(512 * 1024 * 2 + 10);
    const t = await render(h(PDFViewer, { source: { base64: big }, password: 'pw' }));
    await wait(10);
    assert.equal(env.injected.length, 0, 'hasta "ready" se espera');
    await send(t, { type: 'ready' });
    const chunks = env.injected.filter(js => js.startsWith('window.__chunk('));
    assert.equal(chunks.length, 3, 'en trozos de 512 KB');
    assert.equal(env.injected.at(-1), 'window.__open({"password":"pw"});true;');
    env.injected.length = 0;
    const t2 = await render(h(PDFViewer, { source: { uri: 'https://x/f.pdf', headers: { Authorization: 'Bearer 1' } } }));
    await send(t2, { type: 'ready' }); await wait(20);
    assert.deepEqual(fetched[0], ['https://x/f.pdf', { headers: { Authorization: 'Bearer 1' } }], 'con sus cabeceras');
    const sent = env.injected.find(js => js.startsWith('window.__chunk('));
    assert.equal(Buffer.from(JSON.parse(sent.slice(15, -7)), 'base64').toString(), 'PDF:https://x/f.pdf', 'sin el "data:...;base64,"');
    env.injected.length = 0;
    const t3 = await render(h(PDFViewer, { source: 'data:application/pdf;base64,QUJD' }));
    await send(t3, { type: 'ready' }); await wait(10);
    assert.ok(env.injected.includes('window.__chunk("QUJD");true;'), 'data URI');
    ok('fuente: base64 en trozos de 512 KB, uri con cabeceras, data URI; todo después de "ready"');
  }

  // ---- mensajes: carga, página, enlaces, contraseña, error y reintentar, búsqueda por ref
  {
    env.injected.length = 0; RN.Linking.opened.length = 0;
    const events = [], ref = H.React.createRef();
    const t = await render(h(PDFViewer, { ref, source: 'https://x/roto.pdf', onTextSelect: s => events.push(['select', s]), onLoad: i => events.push(['load', i]), onPageChange: (p, n) => events.push(['page', p, n]), onError: e => events.push(['error', e.code]), onLinkPress: u => u.includes('no-abrir') ? false : undefined }));
    await wait(20);
    assert.ok(text(t).includes('Could not open the PDF') && text(t).includes('sin red'), 'error de red');
    assert.deepEqual(events.at(-1), ['error', 'network']);
    fetched.length = 0;
    await act(async () => btn(t, 'retry').props.onPress());
    await wait(20);
    assert.equal(fetched.length, 1, 'reintentar vuelve a leerlo');
    await send(t, { type: 'ready' });
    await send(t, { type: 'loaded', numPages: 12, title: 'Manual' });
    assert.deepEqual(events.find(e => e[0] === 'load'), ['load', { numPages: 12, title: 'Manual' }]);
    assert.ok(text(t).includes('1 / 12'), 'indicador');
    await send(t, { type: 'page', page: 4, numPages: 12 });
    assert.ok(text(t).includes('4 / 12') && events.some(e => e[0] === 'page' && e[1] === 4));
    await send(t, { type: 'link', url: 'https://web.com' });
    await send(t, { type: 'link', url: 'https://no-abrir.com' });
    await send(t, { type: 'link', url: 'javascript:alert(1)' });
    assert.deepEqual(RN.Linking.opened, ['https://web.com'], 'se abre la web; onLinkPress → false no; javascript: nunca');
    // contraseña
    await send(t, { type: 'password', incorrect: false });
    const input = () => t.root.findAll(n => n.type === 'TextInput' && n.props.accessibilityLabel === 'password')[0];
    assert.ok(input() && text(t).includes('This PDF is password protected'));
    await act(async () => input().props.onChangeText('1234'));
    env.injected.length = 0;
    await act(async () => btn(t, 'submitPassword').props.onPress());
    assert.deepEqual(env.injected, ['window.__password("1234");true;']);
    await send(t, { type: 'password', incorrect: true });
    assert.ok(text(t).includes('Wrong password') && input().props.value === '', 'incorrecta: aviso y campo vacío');
    await send(t, { type: 'loaded', numPages: 12 });
    // búsqueda por ref (se resuelve con el número de resultados) y con la barra
    env.injected.length = 0;
    let n; const pr = ref.current.search('hola').then(x => { n = x });
    const call = env.injected.find(js => js.startsWith('window.__search('));
    assert.ok(call && call.startsWith('window.__search("hola",'), call);
    const id = Number(/,(\d+)\)/.exec(call)[1]);
    await send(t, { type: 'search', id, count: 3, index: 0 });
    await pr; assert.equal(n, 3);
    await act(async () => btn(t, 'openSearch').props.onPress());
    assert.ok(text(t).includes('1/3'), 'la barra muestra 1/3');
    env.injected.length = 0;
    await act(async () => btn(t, 'searchNext').props.onPress());
    assert.ok(env.injected.includes('window.__searchStep(1);true;'));
    await act(async () => btn(t, 'closeSearch').props.onPress());
    assert.ok(env.injected.includes('window.__clearSearch();true;') && !btn(t, 'searchInput'));
    await send(t, { type: 'selection', text: 'copiado' });
    ref.current.goToPage(5); ref.current.setZoom(2); ref.current.clearSelection();
    assert.ok(env.injected.includes('window.__clearSelection();true;'));
    assert.ok(env.injected.includes('window.__goTo(5);true;') && env.injected.includes('window.__setZoom(2);true;'));
    assert.deepEqual(events.find(e => e[0] === 'select'), ['select', 'copiado'], 'onTextSelect');
    const off = webOf(await render(h(PDFViewer, { source: { base64: 'AA==' }, textSelection: false }))).props.source.html;
    assert.ok(off.includes('"text":false'), 'textSelection={false}');
    ok('mensajes: onTextSelect, textSelection, error de red y reintentar, onLoad, indicador y onPageChange, enlaces (onLinkPress y solo http/mailto/tel), contraseña (incorrecta), búsqueda por ref y con la barra, goToPage y setZoom');
  }

  // ---- el script del visor en un DOM, con un pdf.js falso
  {
    const { parseHTML } = require('linkedom');
    const t = await render(h(PDFViewer, { source: { base64: 'AA==' }, spacing: 10 }));
    const html = webOf(t).props.source.html;
    const [cfgJs, script] = scriptsOf(html);
    const { window, document } = parseHTML(html.replace(/<script>[\s\S]*?<\/script>/g, ''));
    const scroller = document.getElementById('scroll'), pagesEl = document.getElementById('pages');
    let viewH = 800;
    Object.defineProperty(scroller, 'clientWidth', { get: () => 410 });
    Object.defineProperty(scroller, 'clientHeight', { get: () => viewH });
    scroller.scrollTop = 0; scroller.scrollLeft = 0;
    // Sin motor de maquetación: las páginas se apilan con su alto y la separación
    const proto = Object.getPrototypeOf(pagesEl);
    const px = v => parseFloat(v) || 0;
    Object.defineProperty(proto, 'offsetHeight', { get() { return px(this.style.height) }, configurable: true });
    Object.defineProperty(proto, 'offsetWidth', { get() { return px(this.style.width) }, configurable: true });
    Object.defineProperty(proto, 'offsetLeft', { get() { return 0 }, configurable: true });
    Object.defineProperty(proto, 'offsetTop', { get() {
      if (!this.classList || !this.classList.contains('page')) return 0;
      let y = 10, el = this.previousElementSibling;
      while (el) { y += px(el.style.height) + px(el.style.marginBottom); el = el.previousElementSibling; }
      return y;
    }, configurable: true });
    const posts = [], frames = [];
    window.ReactNativeWebView = { postMessage: m => posts.push(JSON.parse(m)) };
    const last = type => posts.filter(p => p.type === type).at(-1);
    // pdf.js falso
    const calls = { getDocument: [], render: 0, cancel: 0 };
    let needPassword = false, failWith = null;
    const texts = [['Hola múndo', 'segunda línea'], ['Sin coincidencias'], ['Otra vez MUNDO aquí']];
    const mkPage = i => ({
      getViewport: ({ scale }) => ({ width: 600 * scale, height: 800 * scale, scale, transform: [scale, 0, 0, -scale, 0, 800 * scale],
        convertToViewportRectangle: r => [r[0] * scale, (800 - r[1]) * scale, r[2] * scale, (800 - r[3]) * scale] }),
      render: () => { calls.render++; return { promise: Promise.resolve(), cancel() { calls.cancel++ } } },
      getAnnotations: () => Promise.resolve(i === 1 ? [{ subtype: 'Link', rect: [0, 700, 100, 720], url: 'https://a.com' }, { subtype: 'Link', rect: [0, 600, 100, 620], dest: 'cap3' }, { subtype: 'Text', rect: [0, 0, 1, 1] }] : []),
      getTextContent: () => Promise.resolve({ items: texts[i - 1].map((s, k) => ({ str: s, transform: [12, 0, 0, 12, 50, 700 - k * 20], width: s.length * 6, hasEOL: true, fontName: 'f' })), styles: { f: { fontFamily: 'sans-serif' } } }),
    });
    const pdfPages = [1, 2, 3].map(mkPage);
    const doc = { numPages: 3, getPage: i => Promise.resolve(pdfPages[i - 1]), getMetadata: () => Promise.resolve({ info: { Title: 'Demo' } }),
      getDestination: () => Promise.resolve([{ num: 9 }, { name: 'XYZ' }, 0, 400]), getPageIndex: () => Promise.resolve(2), destroy() { calls.destroyed = (calls.destroyed || 0) + 1 } };
    const fakeLib = {
      GlobalWorkerOptions: {},
      renderTextLayer(o) {
        calls.text = (calls.text || 0) + 1; calls.lastText = o;
        o.textContentSource.items.forEach(it => { const sp = o.container.ownerDocument.createElement('span'); sp.textContent = it.str; o.container.appendChild(sp); });
        return { promise: Promise.resolve(), cancel() { calls.textCancel = (calls.textCancel || 0) + 1 } };
      },
      Util: { transform: (a, b) => [a[0] * b[0] + a[2] * b[1], a[1] * b[0] + a[3] * b[1], a[0] * b[2] + a[2] * b[3], a[1] * b[2] + a[3] * b[3], a[0] * b[4] + a[2] * b[5] + a[4], a[1] * b[4] + a[3] * b[5] + a[5]] },
      getDocument(o) {
        calls.getDocument.push(o);
        const task = {};
        task.promise = new Promise((resolve, reject) => {
          if (failWith) return setTimeout(() => reject(Object.assign(new Error('mal'), { name: failWith })));
          if (!needPassword) return setTimeout(() => resolve(doc));
          const update = p => (p === '1234' ? resolve(doc) : task.onPassword(update, 2));
          setTimeout(() => task.onPassword(update, 1));
        });
        return task;
      },
    };
    const run = new Function('window', 'document', 'requestAnimationFrame', 'atob', 'URL', 'Blob', cfgJs.replace(/window\.__CFG=/, 'window.__CFG=') + ';' + script);
    run(window, document, f => frames.push(f), atob, URL, Blob);
    const flush = async () => { for (let i = 0; i < 5; i++) { await new Promise(r => setTimeout(r)); frames.splice(0).forEach(f => f()) } };
    // pdf.js "se carga": el script lo había pedido con un <script src>
    const tag = document.head.querySelector('script');
    assert.ok(tag && tag.src.startsWith('https://cdn.jsdelivr.net/npm/pdfjs-dist@'), 'pide pdf.js al CDN: ' + (tag && tag.src));
    window.pdfjsLib = fakeLib;
    const realFetch = global.fetch;
    global.fetch = async u => ({ text: async () => 'worker:' + u });
    window.fetch = global.fetch;
    tag.onload(); await flush();
    global.fetch = realFetch;
    assert.ok(fakeLib.GlobalWorkerOptions.workerSrc.startsWith('blob:'), 'worker desde un blob');
    assert.equal(posts[0].type, 'ready');
    // abrir: trozos → bytes, sin eval
    const bytes = Buffer.from('%PDF-1.4 hola');
    const b64 = bytes.toString('base64');
    window.__chunk(b64.slice(0, 5)); window.__chunk(b64.slice(5)); window.__open({});
    await flush();
    const o = calls.getDocument[0];
    assert.deepEqual(Buffer.from(o.data), bytes, 'los trozos juntos son el PDF');
    assert.equal(o.isEvalSupported, false, 'isEvalSupported: false (CVE-2024-4367)');
    assert.equal(o.enableXfa, false);
    assert.ok(o.cMapUrl.endsWith('/cmaps/') && o.cMapPacked);
    assert.deepEqual(last('loaded'), { type: 'loaded', numPages: 3, title: 'Demo' });
    const pageEls = pagesEl.querySelectorAll('.page');
    assert.equal(pageEls.length, 3);
    const W = (410 - 20), Hp = W / 600 * 800;
    assert.equal(px(pageEls[0].style.width), Math.floor(W), 'ancho ajustado');
    assert.equal(px(pageEls[0].style.height), Math.floor(Hp));
    assert.deepEqual(last('page'), { type: 'page', page: 1, numPages: 3 });
    assert.ok(window.__state().rendered.includes(1), 'la primera página dibujada');
    // capa de texto (seleccionar y copiar): con la escala de la página y encima del dibujo
    await flush();
    const layer = pageEls[0].querySelector('.textLayer');
    assert.ok(layer, 'capa de texto en la página 1');
    assert.equal(layer.style.getPropertyValue('--scale-factor'), String(W / 600), '--scale-factor = escala en pantalla');
    assert.equal(calls.lastText.viewport.scale, W / 600);
    assert.ok(layer.querySelectorAll('span').length >= 2 && layer.querySelector('.endOfContent'), 'el texto y el final de la capa');
    assert.deepEqual(window.__state().text, window.__state().rendered, 'una capa por página dibujada');
    // enlaces: el de la web se manda; el interno va a la página 3 (a su altura XYZ)
    const links = pageEls[0].querySelectorAll('a.link');
    assert.equal(links.length, 2, 'solo los Link');
    assert.equal(links[0].style.top, (100 - 720 / 8) + '%');
    links[0].dispatchEvent(new window.Event('click'));
    assert.deepEqual(last('link'), { type: 'link', url: 'https://a.com' });
    links[1].dispatchEvent(new window.Event('click')); await flush();
    assert.equal(Math.round(scroller.scrollTop), Math.round(pageEls[2].offsetTop - 5 + 0.5 * px(pageEls[2].style.height)), 'el enlace interno lleva a la página 3, a media página (XYZ 400 de 800)');
    await flush();
    assert.equal(last('page').page, 3);
    // buscar sin mayúsculas ni acentos
    window.__search('Mundo', 7); await flush();
    assert.deepEqual(last('search'), { type: 'search', id: 7, count: 2, index: 0 });
    assert.equal(pagesEl.querySelectorAll('.hl').length, 2);
    assert.equal(pagesEl.querySelectorAll('.hl.cur').length, 1);
    assert.equal(pageEls[0].querySelectorAll('.hl.cur').length, 1, 'la primera, en la página 1');
    window.__searchStep(1);
    assert.equal(pageEls[2].querySelectorAll('.hl.cur').length, 1, 'siguiente: la de la página 3');
    window.__searchStep(1);
    assert.equal(pageEls[0].querySelectorAll('.hl.cur').length, 1, 'y vuelve a la primera');
    window.__clearSearch();
    assert.equal(pagesEl.querySelectorAll('.hl').length, 0);
    assert.equal(window.__pure.fold('Canción ÁRBOL Ñu'), 'cancion arbol nu', 'sin acentos ni mayúsculas (mismo largo)');
    // zoom: más ancho y se vuelve a dibujar
    const before = calls.render;
    window.__setZoom(2); await flush();
    assert.equal(px(pageEls[0].style.width), Math.floor(W * 2));
    assert.deepEqual(last('zoom'), { type: 'zoom', zoom: 2 });
    assert.ok(calls.render > before, 'redibuja a la nueva resolución');
    assert.equal(pageEls[0].querySelector('.textLayer').style.getPropertyValue('--scale-factor'), String(W / 600 * 2), 'la capa de texto se rehace con el zoom');
    assert.equal(pageEls[0].querySelectorAll('.textLayer').length, 1, 'sin capas repetidas');
    window.__setZoom(99); assert.equal(last('zoom').zoom, 5, 'con tope (maxZoom)');
    window.__setZoom(1); await flush();
    // con una vista pequeña, al bajar al final se sueltan las páginas lejanas
    viewH = 100; window.__goTo(3); await flush();
    assert.ok(!window.__state().rendered.includes(1) && window.__state().rendered.includes(3), 'suelta las lejanas: ' + window.__state().rendered);
    assert.ok(!pageEls[0].querySelector('.textLayer') && !window.__state().text.includes(1), 'y su capa de texto');
    // lo seleccionado llega a la app (onTextSelect)
    window.getSelection = () => ({ toString: () => 'Hola múndo' });
    document.dispatchEvent(new window.Event('selectionchange'));
    await new Promise(r => setTimeout(r, 300));
    assert.deepEqual(last('selection'), { type: 'selection', text: 'Hola múndo' });
    // contraseña
    needPassword = true; posts.length = 0;
    window.__chunk(b64); window.__open({}); await flush();
    assert.deepEqual(last('password'), { type: 'password', incorrect: false });
    window.__password('mal'); await flush();
    assert.deepEqual(last('password'), { type: 'password', incorrect: true });
    window.__password('1234'); await flush();
    assert.equal(last('loaded').numPages, 3);
    assert.ok(calls.destroyed >= 1, 'el documento anterior se suelta');
    // PDF no válido
    needPassword = false; failWith = 'InvalidPDFException';
    window.__chunk(b64); window.__open({}); await flush();
    assert.equal(last('error').code, 'invalid');
    ok('script: pdf.js del CDN con worker en blob, trozos → bytes, isEvalSupported false, páginas ajustadas, enlaces (web e internos con XYZ), buscar (acentos), zoom con tope, soltar páginas lejanas, contraseña y PDF no válido');
  }

  console.log('test_pdf: todo OK');
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1) });
