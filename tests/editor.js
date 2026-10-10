// Pruebas de RichTextEditor (easynat/web): comandos, mensajes del WebView, menciones, formulario y opcionalidad
const assert = require('assert');
const H = require('./harness');
const { h, TR, act, env, lib, wait } = H;
const ok = msg => console.log('OK ' + msg);

(async () => {
  const { RichTextEditor } = lib('index');
  const { FormGroupRef } = lib('EAForm');
  const render = async el => { let t; await act(async () => { t = TR.create(el) }); return t };

  // ---- react-native-webview es opcional: no se carga al importar 'easynat', sino al usar el editor; sin ella, aviso
  {
    assert.equal(H.webviewLoads(), 0, "importar 'easynat' no carga react-native-webview");
    env.noWebView = true;
    const warn = console.warn, warns = []; console.warn = m => warns.push(m);
    const sin = await render(h(RichTextEditor, {}));
    console.warn = warn;
    const txt = JSON.stringify(sin.toJSON());
    assert.ok(txt.includes('npx expo install react-native-webview') && sin.root.findAll(n => n.type === 'WebView').length === 0, 'sin instalar: aviso con el comando (no se rompe)');
    assert.ok(warns.some(w => w.includes('react-native-webview')), 'y un aviso en la consola');
    env.noWebView = false;
    const con = await render(h(RichTextEditor, {}));
    assert.equal(con.root.findAll(n => n.type === 'WebView').length, 1, 'instalada: el editor');
    ok("opcional: importar 'easynat' no la carga; sin instalar, el editor avisa; instalada, funciona");
  }
  const webOf = t => t.root.findAll(n => n.type === 'WebView')[0];
  const send = async (t, msg) => act(async () => webOf(t).props.onMessage({ nativeEvent: { data: JSON.stringify(msg) } }));
  const textOf = n => (typeof n === 'string' ? n : (n.children || []).map(textOf).join(''));
  const buttons = t => t.root.findAll(n => typeof n.type === 'string' && n.props.accessibilityRole === 'button' && n.props.accessibilityLabel);
  const btn = (t, label) => buttons(t).find(b => b.props.accessibilityLabel === label);

  // ---- el script del WebView es JS válido (ES5) y lleva el HTML inicial
  {
    const doc = webOf(await render(h(RichTextEditor, { defaultValue: '<p>Hola</script></p>', placeholder: 'Escribe' }))).props.source.html;
    const scripts = [...doc.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
    assert.equal(scripts.length, 2, 'config + script (el </script> del contenido va escapado)');
    scripts.forEach(js => new Function(js));
    assert.ok(scripts[0].includes('\\u003c/script>'), 'el HTML inicial no puede cerrar el <script>');
    ok('documento del WebView: script válido y HTML inicial escapado');
  }

  // ---- comandos encolados hasta "ready", botones, estado activo, onChange, altura
  {
    env.injected.length = 0;
    const changes = [];
    const t = await render(h(RichTextEditor, { defaultValue: '<p>Hola</p>', onChange: (html, text) => changes.push([html, text]), minHeight: 100, maxHeight: 200 }));
    assert.ok(webOf(t).props.source.html.includes('"html":"\\u003cp>Hola\\u003c/p>"'), 'defaultValue en el documento');
    await act(async () => btn(t, 'bold').props.onPress());
    assert.equal(env.injected.length, 0, 'antes de "ready": encolado');
    await send(t, { type: 'ready' });
    assert.ok(env.injected.some(js => js.startsWith('window.__cmd("bold",null)')), 'al estar listo se ejecuta: ' + env.injected);
    await send(t, { type: 'state', state: { bold: true, block: 'h2' } });
    assert.equal(btn(t, 'bold').props.accessibilityState.selected, true, 'B marcada con el cursor en negrita');
    assert.equal(btn(t, 'italic').props.accessibilityState.selected, false);
    await send(t, { type: 'change', html: '<p><b>Hola</b></p>', text: 'Hola' });
    assert.deepEqual(changes, [['<p><b>Hola</b></p>', 'Hola']], 'onChange(html, texto)');
    await send(t, { type: 'height', height: 150 });
    assert.equal(webOf(t).props.style.height, 150, 'crece con el contenido');
    assert.equal(webOf(t).props.scrollEnabled, false);
    await send(t, { type: 'height', height: 900 });
    assert.equal(webOf(t).props.style.height, 200, 'hasta maxHeight…');
    assert.equal(webOf(t).props.scrollEnabled, true, '…y luego hace scroll');
    await send(t, { type: 'height', height: 10 });
    assert.equal(webOf(t).props.style.height, 100, 'nunca menos de minHeight');
    // Ya cargado, no navega (un enlace pulsado dentro abriría la web en el editor)
    await act(async () => webOf(t).props.onLoadEnd());
    assert.equal(webOf(t).props.onShouldStartLoadWithRequest({ url: 'https://evil.com' }), false);
    ok('comandos encolados hasta ready, botón activo según el estado, onChange, alto entre min y max, sin navegar');
  }

  // ---- controlado, ref, toolbar propia, disabled, placeholder con label flotante
  {
    env.injected.length = 0;
    const ref = { current: null };
    const custom = [];
    const el = v => h(RichTextEditor, { ref, value: v, label: 'Notas', isFloat: true, placeholder: 'Escribe…', toolbar: ['bold', '|', { key: 'hoy', icon: h('Icono'), onPress: e => custom.push(e.getHTML()) }] });
    const t = await render(el('<p>a</p>'));
    await send(t, { type: 'ready' });
    assert.ok(webOf(t).props.source.html.includes('"placeholder":"Escribe…"'), 'con texto el label está arriba: placeholder normal');
    const vacio = await render(h(RichTextEditor, { label: 'Notas', isFloat: true, placeholder: 'Escribe…' }));
    assert.ok(webOf(vacio).props.source.html.includes('"placeholder":""'), 'vacío, label flotante abajo: sin placeholder (el label hace de placeholder)');
    await act(async () => webOf(vacio).props.onMessage({ nativeEvent: { data: JSON.stringify({ type: 'ready' }) } }));
    env.injected.length = 0;
    await act(async () => webOf(vacio).props.onMessage({ nativeEvent: { data: JSON.stringify({ type: 'focus' }) } }));
    assert.ok(env.injected.some(js => js.includes('__setPlaceholder("Escribe…")')), 'con foco (label arriba): el placeholder vuelve');
    await act(async () => t.update(el('<p>b</p>')));
    assert.ok(env.injected.some(js => js.startsWith('window.__setHTML("<p>b</p>")')), 'value nuevo desde fuera: se carga');
    const n = env.injected.length;
    await send(t, { type: 'change', html: '<p>c</p>', text: 'c' });
    await act(async () => t.update(el('<p>c</p>')));
    assert.ok(!env.injected.slice(n).some(js => js.includes('__setHTML')), 'sin recargar lo que acaba de escribir');
    assert.equal(buttons(t).length, 2, 'bold + botón propio');
    await act(async () => btn(t, 'hoy').props.onPress());
    assert.deepEqual(custom, ['<p>c</p>'], 'el botón propio recibe la API del editor');
    await act(async () => ref.current.insertHTML('<b>x</b>'));
    assert.ok(env.injected.some(js => js.startsWith('window.__cmd("insertHTML","<b>x</b>")')), 'ref.insertHTML');
    assert.equal(ref.current.getHTML(), '<p>c</p>'); assert.equal(ref.current.getText(), 'c');
    await act(async () => t.update(h(RichTextEditor, { ref, value: '<p>c</p>', disabled: true, toolbar: ['bold'] })));
    assert.ok(env.injected.some(js => js.startsWith('window.__setDisabled(true)')), 'disabled en caliente');
    assert.equal(btn(t, 'bold').props.accessibilityState.disabled, true, 'botones deshabilitados');
    ok('value controlado (sin recargar lo escrito), placeholder con label flotante, botón propio, ref y disabled');
  }

  // ---- menciones
  {
    env.injected.length = 0;
    const searches = [];
    const t = await render(h(RichTextEditor, { mentions: { data: ['Ana García', { id: 'u2', label: 'Andrés' }, 'Carlos'], onSearch: q => searches.push(q) } }));
    await send(t, { type: 'ready' });
    assert.ok(webOf(t).props.source.html.includes('"trigger":"@"'));
    await send(t, { type: 'mention', query: 'an' });
    const items = t.root.findAll(n => n.type === 'Text').map(textOf).filter(x => x.startsWith('@'));
    assert.deepEqual([...new Set(items)], ['@Ana García', '@Andrés'], 'filtra por lo escrito');
    const press = t.root.findAll(n => typeof n.type === 'string' && n.props.accessibilityRole === 'button' && !n.props.accessibilityLabel && n.props.onPress);
    await act(async () => press[1].props.onPress());
    assert.ok(env.injected.some(js => js.startsWith('window.__cmd("mention",{"id":"u2","label":"Andrés"})')), 'inserta la mención con su id');
    await send(t, { type: 'mention', query: null });
    assert.equal(t.root.findAll(n => n.type === 'Text').map(textOf).filter(x => x.startsWith('@')).length, 0, 'al terminar, la lista se va');
    assert.deepEqual(searches, ['an', null], 'onSearch para buscar en un servidor');
    ok('menciones: lista filtrada, inserción con id y onSearch');
  }

  // ---- EAForm: valor, required y error
  {
    const form = new FormGroupRef({ texto: ['', { required: true }] });
    const t = await render(h(RichTextEditor, { formGroup: form, formControl: 'texto', label: 'Texto' }));
    await act(async () => { form.validate() });
    assert.ok(t.root.findAll(n => n.type === 'Text').some(n => /required|obligatorio/i.test(textOf(n))), 'required: error debajo');
    assert.ok(t.root.findAll(n => n.type === 'Text').some(n => textOf(n).includes('*')), 'isRequired por la validación');
    await send(t, { type: 'ready' });
    await send(t, { type: 'change', html: '<p>Hola</p>', text: 'Hola' });
    assert.equal(form.getValue('texto'), '<p>Hola</p>', 'el HTML va al formulario');
    assert.equal(form.isInvalid(), false);
    await send(t, { type: 'change', html: '', text: '' });
    assert.equal(form.isInvalid(), true, 'vacío (el editor manda "") vuelve a ser inválido');
    ok('EAForm: el HTML va al formulario, required con "" y error con isRequired');
  }

  // ---- colores, tabla (según el cursor), imagen (onImagePick), separador, onStateChange y flechas de la barra
  {
    env.injected.length = 0;
    const states = [];
    const t = await render(h(RichTextEditor, { onImagePick: async () => 'https://x/foto.jpg', onStateChange: st => states.push(st), textColors: ['danger.100', '#123456'] }));
    await send(t, { type: 'ready' });
    const injected = s => env.injected.some(js => js.startsWith(s));
    // Separador: botón simple
    await act(async () => btn(t, 'hr').props.onPress());
    assert.ok(injected('window.__cmd("insertHorizontalRule",null)'), 'separador');
    // Imagen con el selector propio
    await act(async () => { await buttons(t).find(b => /image|imagen/i.test(b.props.accessibilityLabel)).props.onPress() });
    await wait(5);
    assert.ok(injected('window.__cmd("image","https://x/foto.jpg")'), 'onImagePick: inserta lo que devuelve');
    // onStateChange recibe el estado (incluido el texto seleccionado)
    await send(t, { type: 'state', state: { bold: true, selection: 'Hola', table: true } });
    assert.deepEqual(states[states.length - 1], { bold: true, selection: 'Hola', table: true }, 'onStateChange con selection');
    // Menús de colores y tabla: se montan al abrir (Portal); aquí se comprueban sus triggers
    const labels = buttons(t).map(b => b.props.accessibilityLabel);
    assert.ok(labels.some(l => /color/i.test(l)) && labels.some(l => /highlight|resaltado/i.test(l)) && labels.some(l => /table|tabla/i.test(l)), 'botones de color, resaltado y tabla: ' + labels);
    const tableBtn = buttons(t).find(b => /^(table|tabla)$/i.test(b.props.accessibilityLabel));
    assert.equal(tableBtn.props.accessibilityState.selected, true, 'con el cursor en una tabla, el botón se marca');
    // Flechas: solo si la barra no cabe
    const sv = t.root.findAll(n => n.type === 'ScrollView' && n.props.horizontal)[0];
    const arrows = () => buttons(t).filter(b => b.props.accessibilityLabel === '→' || b.props.accessibilityLabel === '←').map(b => b.props.accessibilityLabel);
    await act(async () => { sv.props.onLayout({ nativeEvent: { layout: { width: 300 } } }); sv.props.onContentSizeChange(900, 40) });
    assert.deepEqual(arrows(), ['→'], 'al principio: solo la flecha derecha');
    await act(async () => sv.props.onScroll({ nativeEvent: { contentOffset: { x: 300 } } }));
    assert.deepEqual(arrows(), ['←', '→'], 'en medio: las dos');
    await act(async () => sv.props.onScroll({ nativeEvent: { contentOffset: { x: 600 } } }));
    assert.deepEqual(arrows(), ['←'], 'al final: solo la izquierda');
    await act(async () => sv.props.onContentSizeChange(250, 40));
    await act(async () => sv.props.onScroll({ nativeEvent: { contentOffset: { x: 0 } } }));
    assert.deepEqual(arrows(), [], 'si cabe todo: sin flechas');
    // El contenido que de verdad se puede desplazar lo dice el propio scroll (contentSize): manda sobre lo medido antes
    await act(async () => sv.props.onContentSizeChange(380, 40));
    await act(async () => sv.props.onScroll({ nativeEvent: { contentOffset: { x: 23 }, contentSize: { width: 366 }, layoutMeasurement: { width: 343 } } }));
    assert.deepEqual(arrows(), ['←'], 'al final según el scroll: sin flecha derecha (no tapa el último botón)');
    ok('separador, imagen con onImagePick, onStateChange (selection), botones de color/resaltado/tabla y flechas de la barra');
  }

  // ---- subíndice, superíndice, justificado, interlineado, espaciado y cerrar al tocar fuera
  {
    env.injected.length = 0;
    const { emitTap, touchHandlers, addTapListener: addTouchListener, useTapOutside } = lib('index');
    const emitTouch = e => emitTap(e.nativeEvent.pageX, e.nativeEvent.pageY);
    const RN = H.RN;
    let blurs = 0; RN.Keyboard.dismiss = () => { blurs++ };
    // El editor mide dónde está (measure): x 10..310, y 100..300
    env.measure = [0, 0, 300, 200, 10, 100];
    const t = await render(h(RichTextEditor, {}));
    await send(t, { type: 'ready' });
    for (const [label, cmd] of [['subscript', 'subscript'], ['superscript', 'superscript'], ['alignJustify', 'justifyFull']]) {
      await act(async () => btn(t, label).props.onPress());
      assert.ok(env.injected.some(js => js.startsWith(`window.__cmd("${cmd}",null)`)), label);
    }
    await send(t, { type: 'state', state: { superscript: true, justifyFull: true, lineHeight: 2 } });
    assert.equal(btn(t, 'superscript').props.accessibilityState.selected, true);
    assert.equal(btn(t, 'alignJustify').props.accessibilityState.selected, true);
    const labels = buttons(t).map(b => b.props.accessibilityLabel);
    assert.ok(labels.some(l => /line|interlineado/i.test(l)) && labels.some(l => /letter|espaciado/i.test(l)), 'interlineado y espaciado: ' + labels);
    assert.equal(buttons(t).find(b => /^(line spacing|interlineado)$/i.test(b.props.accessibilityLabel)).props.accessibilityState.selected, true, 'interlineado propio: marcado');
    // Tocar fuera (con foco): quita el foco y cierra el teclado; dentro, no
    await send(t, { type: 'focus' });
    env.injected.length = 0;
    emitTouch({ nativeEvent: { pageX: 100, pageY: 150 } });
    assert.ok(!env.injected.some(js => js.includes('__blur')), 'tocar dentro: sigue con foco');
    emitTouch({ nativeEvent: { pageX: 100, pageY: 600 } });
    assert.ok(env.injected.some(js => js.startsWith('window.__blur()')) && blurs === 1, 'tocar fuera: blur y teclado cerrado');
    await send(t, { type: 'blur' });
    env.injected.length = 0;
    emitTouch({ nativeEvent: { pageX: 100, pageY: 600 } });
    assert.ok(!env.injected.some(js => js.includes('__blur')), 'sin foco: no escucha');
    // blurOnOutsidePress={false}
    const t2 = await render(h(RichTextEditor, { blurOnOutsidePress: false }));
    await act(async () => webOf(t2).props.onMessage({ nativeEvent: { data: '{"type":"ready"}' } }));
    await act(async () => webOf(t2).props.onMessage({ nativeEvent: { data: '{"type":"focus"}' } }));
    env.injected.length = 0;
    emitTouch({ nativeEvent: { pageX: 100, pageY: 600 } });
    assert.ok(!env.injected.some(js => js.includes('__blur')), 'blurOnOutsidePress={false}: no se cierra');
    // Toque de verdad (soltar sin moverse) sí; arrastrar (scroll), varios dedos o cancelado, no
    const taps = [];
    const stop = addTouchListener(p => taps.push(p));
    const ev = (x, y, n = 1) => ({ nativeEvent: { pageX: x, pageY: y, touches: Array.from({ length: n }, () => ({ pageX: x, pageY: y })) } });
    touchHandlers.onTouchStart(ev(50, 50)); touchHandlers.onTouchMove(ev(53, 52)); touchHandlers.onTouchEnd(ev(53, 52));
    assert.deepEqual(taps, [{ pageX: 50, pageY: 50 }], 'toque (se movió 3 px): cuenta');
    touchHandlers.onTouchStart(ev(50, 50)); touchHandlers.onTouchMove(ev(50, 120)); touchHandlers.onTouchEnd(ev(50, 120));
    assert.equal(taps.length, 1, 'arrastre (scroll): no cuenta');
    touchHandlers.onTouchStart(ev(50, 50)); touchHandlers.onTouchCancel(); touchHandlers.onTouchEnd(ev(50, 50));
    assert.equal(taps.length, 1, 'cancelado (el ScrollView se quedó el gesto): no cuenta');
    touchHandlers.onTouchStart(ev(50, 50, 2)); touchHandlers.onTouchEnd(ev(50, 50));
    assert.equal(taps.length, 1, 'dos dedos: no cuenta');
    stop();
    env.measure = null;
    ok('subíndice/superíndice/justificado, interlineado y espaciado, cerrar el teclado al tocar fuera (blurOnOutsidePress) y arrastrar no cuenta');
  }

  // ---- comandos propios (prop commands): en el documento, en caliente, command(), onCustomEvent y errores
  {
    env.injected.length = 0;
    const events = [], warns = [];
    const warn = console.warn; console.warn = m => warns.push(m);
    const cmds = { mayusculas: '(v, ed) => ed.insertText(ed.selectedText().toUpperCase())' };
    const el = c => h(RichTextEditor, { commands: c, onCustomEvent: (e, d) => events.push([e, d]) });
    const t = await render(el(cmds));
    assert.ok(webOf(t).props.source.html.includes('"commands":{"mayusculas":"(v, ed) =>'), 'van en el documento');
    const doc = webOf(t).props.source.html;
    [...doc.matchAll(/<script>([\s\S]*?)<\/script>/g)].forEach(m => new Function(m[1]));
    await send(t, { type: 'ready' });
    await act(async () => t.update(el({ ...cmds, marcar: "(c, ed) => ed.wrap('mark', { style: 'background:' + c })" })));
    assert.ok(env.injected.some(js => js.startsWith('window.__defineCommand("marcar",')), 'uno nuevo: se define en caliente');
    const ref = { current: null };
    await act(async () => t.update(h(RichTextEditor, { ref, commands: { ...cmds, marcar: "(c, ed) => ed.wrap('mark', { style: 'background:' + c })" }, onCustomEvent: (e, d) => events.push([e, d]) })));
    await act(async () => ref.current.command('marcar', '#ff0'));
    assert.ok(env.injected.some(js => js.startsWith('window.__cmd("marcar","#ff0")')), 'se usan con command()');
    await send(t, { type: 'custom', event: 'palabras', data: 7 });
    assert.deepEqual(events, [['palabras', 7]], 'ed.emit → onCustomEvent');
    await send(t, { type: 'error', message: 'command "x": boom' });
    assert.ok(warns.some(w => w.includes('boom')), 'un error del comando: aviso en consola');
    console.warn = warn;
    ok('comandos propios: en el documento, definidos en caliente, con command(), ed.emit → onCustomEvent y errores avisados');
  }

  // ---- useTapOutside (público): fuera llama, dentro no, desactivado no escucha
  {
    const { useTapOutside, emitTap } = lib('index');
    const calls = [];
    const Panel = ({ enabled }) => { const r = H.React.useRef(null); useTapOutside(r, () => calls.push('fuera'), enabled); return h(H.RN.View, { ref: r }) };
    env.measure = [0, 0, 100, 50, 20, 200]; // x 20..120, y 200..250
    const t = await render(h(Panel, { enabled: true }));
    emitTap(50, 220); assert.deepEqual(calls, [], 'dentro: nada');
    emitTap(50, 400); assert.deepEqual(calls, ['fuera'], 'fuera: se llama');
    await act(async () => t.update(h(Panel, { enabled: false })));
    emitTap(50, 400); assert.deepEqual(calls, ['fuera'], 'desactivado: no escucha');
    env.measure = null;
    ok('useTapOutside: fuera llama, dentro no, desactivado no escucha');
  }
})().catch(e => { console.error('FALLO', e); process.exit(1) });
