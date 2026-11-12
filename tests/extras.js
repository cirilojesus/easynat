// Pruebas de ago, Image (tamaño por defecto), label flotante en textarea, Button (loadingOnPress), Tooltip,
// Breadcrumbs, ReadMore y el acceso easynat/pdfjs
const assert = require('assert');
const path = require('path');
const fs = require('fs');
const { React, h, TR, act, RN, env, reanimated, siblings, lib, wait, mountSiblings, shown, texts } = require('./harness');
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
    t = await render(h(Image, { source: { uri: 'https://x/d.jpg' }, flex: 1 })); await wait(10);
    assert.deepEqual([img(t).flex, img(t).aspectRatio, img(t).flexShrink], [1, 2, 1], 'con flex (en una fila): mantiene la proporción');
    t = await render(h(Image, { source: { uri: 'https://x/e.jpg' } })); await wait(10);
    assert.equal(img(t).flexShrink, 1, 'por defecto flexShrink 1: en una fila se reparten el ancho');
    // getSize falla (p. ej. data: URI en Android): proporción provisional y la real al cargar (onLoad)
    const getSize = RN.Image.getSize; RN.Image.getSize = (uri, ok, fail) => setTimeout(() => fail(new Error('no')));
    let cargada = 0;
    t = await render(h(Image, { source: { uri: 'data:image/jpeg;base64,AAA' }, onLoad: () => cargada++ })); await wait(10);
    assert.equal(img(t).aspectRatio, 16 / 9, 'sin tamaño conocido: 16:9 provisional (no alto 0)');
    await act(async () => t.root.findAll(n => n.type === 'Image')[0].props.onLoad({ nativeEvent: { source: { width: 300, height: 100 } } }));
    assert.equal(img(t).aspectRatio, 3, 'al cargar: la proporción real');
    assert.equal(cargada, 1, 'y llama al onLoad propio');
    RN.Image.getSize = getSize;
    // Si no carga: hueco gris con icono (y alt), del mismo tamaño
    t = await render(h(Image, { source: { uri: 'https://x/rota.jpg' }, alt: 'Foto' })); await wait(10);
    await act(async () => t.root.findAll(n => n.type === 'Image')[0].props.onError());
    assert.ok(t.root.findAll(n => n.type === 'Icon' && n.props.name === 'image').length === 1 && textos(t).includes('Foto'), 'error: icono y alt');
    await act(async () => t.update(h(Image, { source: { uri: 'https://x/buena.jpg' }, alt: 'Foto' })));
    assert.equal(t.root.findAll(n => n.type === 'Image').length, 1, 'al cambiar de source se vuelve a intentar');
    ok('Image: por defecto ancho 100% con la proporción de la imagen; size, alto y ancho propios se respetan; hueco con icono si falla');
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
    // Franja (AnimatedView, posición vertical) y dentro la burbuja + flecha (View con onLayout, marginLeft)
    let raiz = () => env.siblingRoot.root;
    const franja = () => raiz().findAll(n => n.type === 'AnimatedView' && n.props.pointerEvents === 'none')[0];
    const burbuja = () => franja().findAll(n => n.type === 'View' && n.props.onLayout)[0];
    const st = () => ({ ...flat(franja().props.style), left: flat(burbuja().props.style).marginLeft });
    const op = () => { const o = flat(franja().props.style).opacity; return typeof o === 'object' ? o.v : o };
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
    assert.equal(st().bottom, 800 - 300 + 6, 'encima del trigger (el alto medido incluye la flecha)');
    // La flecha va debajo de la burbuja (hermana suya, no dentro) y apunta al centro del trigger
    const hijos = burbuja().children.filter(n => typeof n !== 'string');
    const flecha = hijos[hijos.length - 1];
    assert.equal(flat(flecha.props.style).borderTopWidth, 6, 'flecha debajo de la burbuja');
    assert.equal(flat(flecha.props.style).marginLeft, 50 - 6, 'apunta al centro del trigger');
    // Sigue al trigger mientras está abierto (scroll)
    env.triggerLayout = { x: 150, y: 250, width: 40, height: 40 };
    await wait(250);
    assert.equal(st().bottom, 800 - 250 + 6, 'se mueve con el trigger al hacer scroll');
    env.triggerLayout = { x: 150, y: 300, width: 40, height: 40 };
    await wait(250);
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
    assert.equal(st().top, 30 + 20 + 6, 'sin sitio arriba: debajo');
    assert.equal(flat(burbuja().children.filter(n => typeof n !== 'string')[0].props.style).borderBottomWidth, 6, 'debajo: flecha arriba de la burbuja');
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
    // mode="absolute": junto al trigger (sin Portal), coordenadas relativas a él
    env.triggerLayout = { x: 150, y: 300, width: 40, height: 40 };
    t = await render(h(Tooltip, { label: 'Abs', mode: 'absolute', duration: 0 }, h(RN.Text, null, 'a')));
    await act(async () => trigger().props.onPress()); await wait(10);
    assert.ok(!shown('Abs'), 'absolute: no va al Portal');
    raiz = () => t.root;
    assert.ok(texts(t).includes('Abs'), 'absolute: dentro del árbol del trigger');
    await medir();
    assert.equal(op(), 1);
    assert.equal(flat(franja().props.style).bottom, 40 + 6, 'encima del trigger (relativo a él)');
    assert.equal(flat(franja().props.style).left, -150, 'franja del ancho de la pantalla');
    assert.equal(st().left, 150 + 20 - 50, 'centrada sobre el trigger');
    const cont = t.root.findAll(n => n.type === 'View' && n.props.collapsable === false)[0];
    assert.equal(flat(cont.props.style).zIndex, 1000, 'abierto: el contenedor sube de capa');
    await act(async () => t.unmount()); await wait(20);
    raiz = () => env.siblingRoot.root;
    ok('Tooltip: abre al tocar o mantener, centrado sin salirse, en Portal o absolute, cambia de lado, se cierra solo / fuera / con atrás, controlado y por ref');
  }

  // ---- Breadcrumbs: actual sin pulsar, separadores, maxItems con menú, options, variantes y contenido extra
  {
    const pulsados = [];
    const items = ['Inicio', 'Tienda', 'Ropa', 'Hombre', 'Zapatillas'].map(label => ({ label, onPress: () => pulsados.push(label) }));
    let t = await render(h(Breadcrumbs, { items, separator: '/' }));
    assert.deepEqual(textos(t), ['Inicio', '/', 'Tienda', '/', 'Ropa', '/', 'Hombre', '/', 'Zapatillas']);
    const links = t.root.findAll(n => n.type === 'Pressable' && n.props.accessibilityRole === 'link');
    assert.equal(links.length, 4, 'el último no se pulsa');
    await act(async () => links[1].props.onPress());
    assert.deepEqual(pulsados, ['Tienda']);
    t = await render(h(Breadcrumbs, { items, separator: 'slash' }));
    assert.equal(textos(t)[1], '/', "separator='slash'");
    // maxItems: "…" abre un menú con los ocultos
    t = await render(h(Breadcrumbs, { items, maxItems: 3 }));
    assert.deepEqual(textos(t), ['Inicio', 'Hombre', 'Zapatillas'], 'maxItems: el primero, … y los últimos');
    const dots = t.root.findAll(n => n.type === 'Pressable' && n.props.accessibilityLabel === '…')[0];
    await act(async () => dots.props.onPress()); await wait(30);
    assert.ok(shown('Tienda') && shown('Ropa'), '… abre un menú con los ocultos');
    const enMenu = txt => env.siblingRoot.root.findAll(n => n.type === 'Pressable' && n.props.onPress).find(p => p.findAll(n => n.children?.includes?.(txt)).length);
    await act(async () => enMenu('Ropa').props.onPress()); await wait(200);
    assert.deepEqual(pulsados, ['Tienda', 'Ropa'], 'elegir en el menú navega');
    assert.ok(!shown('Tienda'), 'y se cierra');
    await act(async () => t.unmount()); await wait(20);
    // options: desplegable en un elemento
    const elegidos = [];
    t = await render(h(Breadcrumbs, { items: [{ label: 'Pods', options: [{ label: 'Growth', onPress: () => elegidos.push('g') }, { label: 'Design', selected: true }] }, { label: 'Miembros' }] }));
    const conOpciones = t.root.findAll(n => n.type === 'Pressable' && n.props.accessibilityState?.expanded === false)[0];
    assert.ok(conOpciones, 'elemento con options: botón desplegable');
    assert.ok(t.root.findAll(n => n.type === 'Icon' && n.props.name === 'chevron-down').length, 'con chevron');
    await act(async () => conOpciones.props.onPress()); await wait(30);
    assert.ok(shown('Growth') && shown('Design'));
    await act(async () => enMenu('Growth').props.onPress()); await wait(200);
    assert.deepEqual(elegidos, ['g']);
    await act(async () => t.unmount()); await wait(20);
    // Variantes
    t = await render(h(Breadcrumbs, { items, variant: 'chips' }));
    assert.equal(t.root.findAll(n => n.type === 'View' && flat(n.props.style).backgroundColor === '#4e46e56f').length, 5, 'chips: cada elemento con fondo');
    t = await render(h(Breadcrumbs, { items: items.slice(0, 3), variant: 'arrows' }));
    assert.ok(!t.root.findAll(n => n.type === 'Icon' && n.props.name === 'chevron-right').length, 'arrows: sin separadores');
    const tramos = t.root.findAll(n => n.type === 'View' && n.props.onLayout);
    for (const tr of tramos) await act(async () => tr.props.onLayout({ nativeEvent: { layout: { width: 90, height: 34 } } }));
    assert.equal(t.root.findAll(n => n.type === 'Polygon').length, 3, 'arrows: un polígono por tramo');
    t = await render(h(Breadcrumbs, { items, variant: 'underline' }));
    assert.equal(flat(t.root.findAll(n => n.type === 'Text' && n.children.includes('Tienda'))[0].props.style).textDecorationLine, 'underline', 'underline');
    // scrollable y contenido al principio / final
    t = await render(h(Breadcrumbs, { items: items.slice(0, 2), scrollable: true, startContent: h(RN.Text, null, 'atrás'), endContent: h(RN.Text, null, 'fin') }));
    assert.equal(t.root.findAll(n => n.type === 'ScrollView' && n.props.horizontal).length, 1, 'scrollable: scroll horizontal');
    assert.deepEqual([textos(t)[0], textos(t).at(-1)], ['atrás', 'fin'], 'startContent y endContent');
    ok('Breadcrumbs: actual sin pulsar, separadores, maxItems con menú, options con desplegable, chips / arrows / underline, scrollable y contenido extra');
  }

  // ---- ReadMore: texto o contenido, enlace debajo / al final de la línea / flotante, fade, animación y collapsed
  {
    const visible = t => t.root.findAll(n => n.type === 'Text' && !n.props.onTextLayout && !n.props['aria-hidden'])[0];
    const copia = t => t.root.findAll(n => n.type === 'Text' && n.props.onTextLayout)[0];
    const lineas = async (t, n) => act(async () => copia(t).props.onTextLayout({ nativeEvent: { lines: Array.from({ length: n }, (_, i) => ({ y: i * 20, height: 20, text: `linea${i} con texto ` })) } }));
    // La altura se anima con Reanimated en el hilo de UI: se comprueba el recorte y a qué alto va cada withTiming
    const clip = t => t.root.findAll(n => n.type === 'ReaView')[0];
    const recortado = t => flat(clip(t).props.style).overflow === 'hidden';
    const animaA = () => reanimated.timings.at(-1);
    env.timingCallbacks = true;
    const enlace = t => t.root.findAll(n => n.type === 'Pressable' && n.props.onPress)[0];
    const toggles = [];
    let t = await render(h(ReadMore, { onToggle: v => toggles.push(v), fontSize: 15 }, 'Un texto largo'));
    assert.equal(visible(t).props.numberOfLines, 3, 'por defecto 3 líneas');
    assert.ok(!textos(t).includes('Leer más'), 'sin medir: sin enlace');
    await lineas(t, 3);
    assert.ok(!textos(t).includes('Leer más'), 'cabe: sin enlace');
    await lineas(t, 6);
    assert.ok(textos(t).includes('Leer más'), 'no cabe: Leer más');
    assert.ok(recortado(t), 'recortado');
    assert.equal(flat(clip(t).props.style).height, 60, 'al alto de 3 líneas también en el estilo de React');
    assert.equal(visible(t).props.numberOfLines, 3, 'recogido: con los …');
    assert.ok(t.root.findAll(n => n.type === 'Icon' && n.props.name === 'chevron-down').length, 'con chevron');
    await act(async () => enlace(t).props.onPress());
    assert.equal(visible(t).props.numberOfLines, undefined, 'desplegando: sin límite');
    assert.equal(animaA(), 120, 'anima hasta el alto entero');
    assert.equal(flat(clip(t).props.style).height, 120, 'al terminar, React también pinta con el alto final (si no, un repintado lo pisaba)');
    assert.ok(textos(t).includes('Leer menos'));
    await act(async () => enlace(t).props.onPress()); await wait(10);
    assert.equal(animaA(), 60, 'recoge animando hasta 3 líneas');
    assert.equal(flat(clip(t).props.style).height, 60);
    assert.equal(visible(t).props.numberOfLines, 3, 'y vuelve a llevar los …');
    assert.deepEqual(toggles, [true, false]);
    // fade: degradado y sin …
    t = await render(h(ReadMore, { fade: true, numberOfLines: 2 }, 'Texto'));
    await lineas(t, 5);
    assert.equal(t.root.findAll(n => n.type === 'LinearGradient').length, 1, 'fade: degradado');
    assert.equal(visible(t).props.numberOfLines, undefined, 'fade: sin …, lo recorta el alto');
    assert.ok(recortado(t));
    // overlay: botón flotante sobre el final recortado; desplegado va debajo
    t = await render(h(ReadMore, { fade: true, triggerPlacement: 'overlay' }, 'Texto'));
    await lineas(t, 6);
    assert.ok(clip(t).findAll(n => n.type === 'Pressable' && n.props.onPress).length === 1, 'overlay: dentro del contenido recortado');
    await act(async () => enlace(t).props.onPress()); await wait(300);
    assert.ok(!clip(t).findAll(n => n.type === 'Pressable' && n.props.onPress).length && enlace(t), 'desplegado: debajo');
    // inline: "… Leer más" al final de la última línea
    t = await render(h(ReadMore, { triggerPlacement: 'inline', numberOfLines: 2 }, 'Texto'));
    await lineas(t, 4);
    const link = () => t.root.findAll(n => n.type === 'Text' && n.props.onPress)[0];
    assert.ok(link() && link().children.includes('Leer más'), 'inline: enlace dentro del texto');
    assert.ok(visible(t).children.includes('… '), 'con … delante');
    assert.ok(visible(t).children.some(c => typeof c === 'string' && c.startsWith('linea0')), 'empieza por las primeras líneas');
    await act(async () => link().props.onPress());
    assert.ok(link().children.includes('Leer menos') && visible(t).children.includes('Texto'), 'desplegado: texto entero y Leer menos');
    // maxHeight con cualquier contenido
    t = await render(h(ReadMore, { maxHeight: 100 }, h(RN.View, null, h(RN.Text, null, 'Párrafo'))));
    assert.equal(flat(clip(t).props.style).maxHeight, 100, 'antes de medir: recortado con maxHeight');
    const contenido = t.root.findAll(n => n.type === 'View' && n.props.onLayout)[0];
    await act(async () => contenido.props.onLayout({ nativeEvent: { layout: { height: 300 } } }));
    assert.ok(recortado(t) && textos(t).includes('Leer más'), 'contenido más alto: enlace');
    await act(async () => enlace(t).props.onPress());
    assert.equal(animaA(), 300, 'despliega hasta su alto');
    await act(async () => enlace(t).props.onPress());
    assert.equal(animaA(), 100, 'recoge hasta maxHeight');
    await act(async () => t.update(h(ReadMore, { maxHeight: 100 }, h(RN.View, null, h(RN.Text, null, 'Párrafo')))));
    await act(async () => t.root.findAll(n => n.type === 'View' && n.props.onLayout)[0].props.onLayout({ nativeEvent: { layout: { height: 80 } } }));
    assert.ok(!textos(t).includes('Leer más'), 'contenido que cabe: sin enlace');
    // collapsed propio, textos propios, showLess y renderTrigger
    t = await render(h(ReadMore, { collapsed: h(RN.Text, null, 'Resumen'), readMoreText: 'Ver todo', showLess: false }, h(RN.Text, null, 'Completo')));
    assert.ok(textos(t).includes('Resumen') && !textos(t).includes('Completo') && textos(t).includes('Ver todo'), 'collapsed: el resumen y el enlace');
    await act(async () => enlace(t).props.onPress());
    assert.ok(textos(t).includes('Completo') && !enlace(t), 'desplegado: el contenido y, con showLess=false, sin enlace');
    let estado;
    t = await render(h(ReadMore, { renderTrigger: s => { estado = s; return h(RN.Text, null, s.expanded ? 'menos' : 'más') } }, 'Texto'));
    await lineas(t, 9);
    assert.ok(textos(t).includes('más'));
    await act(async () => estado.toggle());
    assert.ok(textos(t).includes('menos'), 'renderTrigger');
    env.timingCallbacks = false;
    ok('ReadMore: líneas o maxHeight, enlace debajo / inline / flotante, chevron, fade, altura animada, collapsed, showLess y renderTrigger');
  }

  // ---- watermarkImage: función (WebView invisible que se crea y se quita sola) y el dibujo del canvas
  {
    const { watermarkImage } = lib('index');
    const webview = () => env.siblingRoot.root.findAll(n => n.type === 'WebView')[0];
    const send = async msg => act(async () => webview().props.onMessage({ nativeEvent: { data: JSON.stringify(msg) } }));
    env.injected.length = 0;
    const antes = siblings.size;
    const p = watermarkImage('data:image/png;base64,AAA', { text: 'Ana López', date: true, position: 'top-left' });
    await wait(20);
    assert.ok(webview(), 'monta un WebView invisible');
    await send({ type: 'ready' });
    const js = env.injected.find(j => j.startsWith('window.__wm('));
    assert.ok(js && js.includes('Ana López') && js.includes('top-left'), 'le pasa la imagen y las opciones');
    await send({ type: 'done', dataUri: 'data:image/jpeg;base64,QUJD', width: 800, height: 600 });
    const r = await p;
    assert.deepEqual([r.base64, r.mimeType, r.width, r.height], ['QUJD', 'image/jpeg', 800, 600], 'resultado');
    await wait(20);
    assert.equal(siblings.size, antes, 'y quita el WebView al terminar');
    // Error de la página: rechaza
    const p2 = watermarkImage('data:image/png;base64,AAA', { text: 'x' });
    const rechazo = assert.rejects(p2, /No se pudo leer/);
    await wait(20);
    await send({ type: 'error', message: 'No se pudo leer la imagen' });
    await rechazo;
    await wait(20);

    // El script de la página con un canvas simulado (imagen de 1000x500)
    const p3 = watermarkImage('data:image/png;base64,AAA', { text: 'x' }); p3.catch(() => { }); await wait(20);
    const html = webview().props.source.html;
    await send({ type: 'error', message: 'fin' }); await wait(20);
    const script = html.slice(html.indexOf('<script>') + 8, html.indexOf('</script>'));
    const dibujar = cfg => {
      const calls = []; let posted;
      const ctx = { font: '10px sans-serif', save() { }, restore() { }, translate() { }, rotate(a) { calls.push(['rotate', a]) },
        drawImage(_i, x, y, w, h) { calls.push(['drawImage', w, h]) }, fillRect(...a) { calls.push(['fillRect', ...a]) },
        fillText(t, x, y) { calls.push(['fillText', t, x, y, this.textAlign, this.font]) },
        measureText(t) { return { width: t.length * parseFloat(/(\d+)px/.exec(this.font)[1]) * 0.5 } } };
      const canvas = { getContext: () => ctx, toDataURL: (m, q) => `data:${m};base64,Q${q ?? ''}` };
      class Img { set src(v) { this.naturalWidth = 1000; this.naturalHeight = 500; this.onload() } }
      const win = { ReactNativeWebView: { postMessage: m => { posted = JSON.parse(m) } } };
      new Function('window', 'document', 'Image', script)(win, { createElement: () => canvas }, Img);
      win.__wm({ src: 'data:', position: 'bottom-right', color: '#000', background: '#ddd', quality: 0.9, format: 'jpeg', ...cfg });
      return { calls, posted, canvas };
    };
    let d = dibujar({ lines: ['Ana'] });
    const size = Math.round(500 * 0.035); // 18: 3,5% del lado menor
    const tw = 3 * size * 0.5, m = Math.round(size / 2);
    const rect = d.calls.find(c => c[0] === 'fillRect');
    assert.deepEqual(rect.slice(1, 3), [1000 - (tw + m * 2), 500 - (Math.round(size * 1.25) + m * 2 - (Math.round(size * 1.25) - size))], 'fondo en la esquina inferior derecha');
    const txt = d.calls.find(c => c[0] === 'fillText');
    assert.deepEqual([txt[1], txt[2], txt[4]], ['Ana', 1000 - m, 'right'], 'texto alineado a la derecha, con margen');
    assert.equal(d.posted.dataUri, 'data:image/jpeg;base64,Q0.9', 'jpeg con calidad');
    d = dibujar({ lines: ['Ana'], position: 'top-left', background: null });
    assert.ok(!d.calls.some(c => c[0] === 'fillRect'), 'sin fondo');
    assert.deepEqual(d.calls.find(c => c[0] === 'fillText').slice(2, 5), [m, m, 'left'], 'arriba a la izquierda');
    d = dibujar({ lines: ['CONFIDENCIAL'], position: 'tile', format: 'png' });
    assert.ok(d.calls.filter(c => c[0] === 'fillText').length > 10, 'tile: repetida por toda la imagen');
    assert.ok(d.calls.some(c => c[0] === 'rotate' && Math.abs(c[1] + Math.PI / 6) < 1e-9), 'tile: girada -30°');
    assert.ok(d.posted.dataUri.startsWith('data:image/png'), 'png');
    d = dibujar({ lines: ['Ana'], maxSize: 400 });
    assert.deepEqual(d.calls.find(c => c[0] === 'drawImage').slice(1), [400, 200], 'maxSize reduce la imagen');
    assert.deepEqual([d.posted.width, d.posted.height], [400, 200]);
    d = dibujar({ lines: ['x'.repeat(200)] });
    const largo = d.calls.find(c => c[0] === 'fillText');
    assert.ok(parseFloat(/(\d+)px/.exec(largo[5])[1]) < size, 'texto largo: letra más pequeña para caber');
    assert.ok(largo[1].length * parseFloat(/(\d+)px/.exec(largo[5])[1]) * 0.5 <= 1000 * 0.9, 'y cabe en el 90% del ancho');
    ok('watermarkImage: WebView invisible que se quita solo, opciones, errores, esquinas, sin fondo, mosaico, png/jpeg y maxSize');
  }

  // ---- Props de estilo (flex, bg, p…) no llegan sueltas al componente nativo: solo en style
  {
    const { KeyboardAvoidingView, Box } = lib('index');
    let t = await render(h(KeyboardAvoidingView, { flex: 1, bg: 'primary.100', behavior: 'height' }));
    const kav = t.root.findAll(n => n.type === 'KAV')[0];
    assert.equal(kav.props.flex, undefined, 'KAV sin flex suelto (pisaba el flex: 0 que pone al salir el teclado)');
    assert.equal(kav.props.bg, undefined);
    assert.equal(flat(kav.props.style).flex, 1, 'flex en el style');
    assert.equal(kav.props.behavior, 'height', 'las demás props siguen');
    t = await render(h(Box, { p: 2, w: 100, pointerEvents: 'none', testID: 'b' }));
    const v = t.root.findAll(n => n.type === 'View')[0];
    assert.deepEqual([v.props.p, v.props.w, v.props.testID, v.props.pointerEvents], [undefined, undefined, 'b', 'none'], 'Box: sin p ni w sueltos; pointerEvents sí');
    assert.deepEqual([flat(v.props.style).padding, flat(v.props.style).width], [8, 100]);
    ok('props de estilo solo en style (KeyboardAvoidingView con flex={1}, Box…)');
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
