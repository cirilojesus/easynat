// Pruebas de RenderHTML, parseHTML, htmlToText y decodeHtmlEntities
const assert = require('assert');
const { React, h, TR, act, RN, lib, wait } = require('./harness');
const { RenderHTML, parseHTML, htmlToText, decodeHtmlEntities, renderHTML, resolveUrl } = lib('RenderHTML');
const ok = msg => console.log('OK ' + msg);

const render = async (props) => { let t; await act(async () => { t = TR.create(h(RenderHTML, props)) }); return t };
// Texto de un nodo Text host (hijos strings y Text anidados)
const textOf = n => (typeof n === 'string' ? n : (n.children || []).map(textOf).join(''));
const topTexts = t => t.root.findAll(n => n.type === 'Text' && !hasTextAncestor(n));
const hasTextAncestor = n => { for (let p = n.parent; p; p = p.parent) if (p.type === 'Text') return true; return false };
const flat = s => RN.StyleSheet.flatten(s);
const all = (t, type) => t.root.findAll(n => n.type === type);
const labelsOf = t => t.root.findAll(n => n.type === 'Text').map(textOf);
// La caja (View) que envuelve una imagen: lleva su proporción y el estilo _image
const boxOf = n => { let q = n.parent; while (q && q.type !== 'View') q = q.parent; return q };

(async () => {
  // ---- htmlToText y entidades
  {
    assert.equal(decodeHtmlEntities('&amp;lt;b&amp;gt;'), '&lt;b&gt;', 'una sola pasada: &amp;lt; no se convierte en <');
    assert.equal(decodeHtmlEntities('Ca&ntilde;&oacute;n &#233; &#x1F600; &hellip; &EACUTE; &noexiste;'), 'Cañón é 😀 … é &noexiste;');
    assert.equal(htmlToText('<p>Hola&nbsp;<b>mundo</b></p><p>Adiós</p>'), 'Hola mundo Adiós');
    assert.equal(htmlToText('<style>p{color:red}</style><script>alert(1)</script><!-- nota -->Texto'), 'Texto', 'sin style, script ni comentarios');
    assert.equal(htmlToText('<ul><li>Uno</li><li>Dos</li></ul><p>Fin<br>línea</p>', { lineBreaks: true }), '• Uno\n• Dos\nFin\nlínea');
    assert.equal(htmlToText(null), ''); assert.equal(htmlToText(''), '');
    ok('htmlToText: entidades en una pasada, numéricas y con nombre, sin script/style/comentarios, lineBreaks');
  }

  // ---- parser tolerante
  {
    const tree = parseHTML(`<P CLASS='x' data-a=1 hidden>Hola <B>mundo</P><ul><li>a<li>b</ul></span>fin`);
    assert.equal(tree[0].name, 'p'); assert.deepEqual(tree[0].attrs, { class: 'x', 'data-a': '1', hidden: true });
    assert.equal(tree[0].children[1].name, 'b', 'el <B> sin cerrar se cierra con su </P>');
    const ul = tree[1]; assert.equal(ul.children.length, 2, '<li> sin cerrar: el siguiente cierra el anterior');
    assert.equal(tree[2].text, 'fin', 'un cierre suelto (</span>) se ignora');
    ok('parseHTML: mayúsculas, comillas simples/sin comillas/sin valor, etiquetas sin cerrar y cierres sueltos');
  }

  // ---- párrafos: los espacios del código no se pintan y el texto en línea va en un solo Text
  {
    const t = await render({ html: `
      <p>
        Hola   <b>mundo</b>, esto es <i>cursiva</i>
        y <u><s>las dos</s></u>.
      </p>` });
    const tops = topTexts(t);
    assert.equal(tops.length, 1, 'un párrafo = un Text (fluye como en HTML)');
    assert.equal(textOf(tops[0]), 'Hola mundo, esto es cursiva y las dos.', 'saltos y sangría se juntan en un espacio, sin bordes');
    const b = tops[0].findAll(n => n.type === 'Text' && textOf(n) === 'mundo')[0];
    assert.equal(flat(b.props.style).fontWeight, '700');
    const s = tops[0].findAll(n => n.type === 'Text' && textOf(n) === 'las dos').pop();
    assert.equal(flat(s.props.style).textDecorationLine, 'underline line-through', '<u><s> suman las dos decoraciones');
    ok('párrafos: espacios como en HTML, un solo Text por párrafo, negrita y decoraciones combinadas');
  }

  // ---- <br>, títulos, estilo en línea, <font>, lista, enlace
  {
    RN.Linking.opened.length = 0;
    const pressed = [];
    const t = await render({
      scroll: false,
      html: `<h1 style="color:#ff0000">Título</h1>
        <p>Línea 1<br>Línea 2</p>
        <div style="text-align:center; font-size: 18px; font-family: Times New Roman">Centrado</div>
        <font size="5" color="blue">Grande</font>
        <ol start="3"><li>Tres con un texto muy largo</li><li>Cuatro<ul><li>Anidado</li></ul></li></ol>
        <p><a href="https://ejemplo.com">Enlace</a> y <a href="mailto:a@b.c" style="text-decoration:none">correo</a></p>`,
      onLinkPress: href => pressed.push(href),
    });
    assert.ok(!t.root.findAll(n => n.type === 'ScrollView').length, 'scroll={false}: sin ScrollView');
    const texts = topTexts(t).map(textOf);
    assert.ok(texts.includes('Línea 1\nLínea 2'), '<br> es un salto de línea dentro del mismo Text');
    const h1 = topTexts(t).find(n => textOf(n) === 'Título');
    assert.equal(flat(h1.props.style).fontSize, 26); assert.equal(flat(h1.props.style).color, '#ff0000');
    const centro = topTexts(t).find(n => textOf(n) === 'Centrado');
    assert.equal(flat(centro.props.style).textAlign, 'center'); assert.equal(flat(centro.props.style).fontSize, 18);
    const grande = t.root.findAll(n => n.type === 'Text' && textOf(n) === 'Grande').pop();
    assert.equal(flat(grande.props.style).fontSize, 24);
    assert.ok(texts.includes('3.') && texts.includes('4.') && texts.includes('◦'), 'ol con start y lista anidada con ◦');
    const enlace = t.root.findAll(n => n.type === 'Text' && n.props.accessibilityRole === 'link');
    assert.equal(enlace.length, 2);
    assert.equal(flat(enlace[0].props.style).textDecorationLine, 'underline');
    assert.notEqual(flat(enlace[1].props.style).textDecorationLine, 'underline', 'text-decoration:none quita el subrayado');
    await act(async () => enlace[0].props.onPress());
    assert.deepEqual(pressed, ['https://ejemplo.com']); assert.equal(RN.Linking.opened.length, 0, 'onLinkPress sustituye a Linking');
    ok('br, h1 con style, text-align/font-size, <font>, ol start + anidadas, enlaces y onLinkPress');
  }

  // ---- enlace por defecto con Linking, tagsStyles, _text, imágenes, tabla, checkbox, pre
  {
    RN.Linking.opened.length = 0;
    const t = await render({
      html: `<p>Ver <a href="https://x.com">x<img src="https://img/a.png"></a></p>
        <img src="https://img/b.png" width="100" height="50">
        <table><tr><th>A</th><td>B</td></tr></table>
        <input type="checkbox" checked> <input type="checkbox">
        <pre>  línea  1
  línea 2</pre>`,
      tagsStyles: { p: { color: 'success.100' }, a: { color: 'danger.100' } },
      _text: { fontSize: 15 },
    });
    assert.ok(t.root.findAll(n => n.type === 'ScrollView').length, 'por defecto con ScrollView');
    const link = t.root.findAll(n => n.type === 'Text' && n.props.accessibilityRole === 'link')[0];
    await act(async () => link.props.onPress());
    assert.deepEqual(RN.Linking.opened, ['https://x.com'], 'sin onLinkPress abre con Linking');
    const imgs = t.root.findAll(n => n.type === 'Image');
    assert.equal(imgs.length, 2, 'la imagen de dentro del enlace sale como bloque (no dentro del Text)');
    assert.ok(imgs.every(i => !hasTextAncestor(i)));
    assert.equal(flat(boxOf(imgs[1]).props.style).aspectRatio, 2, 'width/height dan la proporción');
    await act(async () => wait(10));
    assert.equal(flat(boxOf(t.root.findAll(n => n.type === 'Image')[0]).props.style).aspectRatio, 2, 'sin tamaño: la proporción de getSize');
    const ver = topTexts(t).find(n => textOf(n).startsWith('Ver'));
    const tema = { colors: lib('theme').COLORS_THEME };
    assert.equal(flat(ver.props.style).color, tema.colors['success.100'], 'tagsStyles.p: color del tema');
    assert.equal(flat(link.props.style).color, tema.colors['danger.100'], 'tagsStyles.a');
    assert.equal(flat(ver.props.style).fontSize, 15, '_text: estilo base');
    assert.ok(topTexts(t).some(n => textOf(n) === 'A') && topTexts(t).some(n => textOf(n) === 'B'), 'tabla');
    assert.equal(t.root.findAll(n => n.type === 'Text' && textOf(n) === '✓' && hasTextAncestor(n)).length >= 1, true, 'checkbox en línea (dentro del Text)');
    assert.ok(topTexts(t).some(n => textOf(n) === '  línea  1\n  línea 2'), '<pre> conserva espacios y saltos');
    ok('Linking por defecto, tagsStyles, _text, imágenes (proporción, fuera del texto), tabla, checkbox, pre');
  }

  // ---- no vuelve a parsear en cada render del padre (aunque onLinkPress cambie)
  {
    let t; const html = '<p>Hola</p>';
    await act(async () => { t = TR.create(h(RenderHTML, { html, onLinkPress: () => { } })) });
    const first = t.root.findAll(n => n.type === 'Text')[0];
    await act(async () => t.update(h(RenderHTML, { html, onLinkPress: () => { } })));
    assert.equal(t.root.findAll(n => n.type === 'Text')[0], first, 'mismo elemento: no se volvió a parsear');
    await act(async () => t.update(h(RenderHTML, { html: '<p>Adiós</p>' })));
    assert.equal(textOf(t.root.findAll(n => n.type === 'Text')[0]), 'Adiós');
    assert.equal(renderHTML('').length, 0, 'HTML vacío: nada');
    ok('memorizado: solo se vuelve a parsear si cambia el HTML o los estilos');
  }

  // ---- baseUrl (resolveUrl), renderers, classesStyles e ignoredStyles
  {
    const B = 'https://miweb.com/blog/post';
    assert.equal(resolveUrl('/uploads/a.png', B), 'https://miweb.com/uploads/a.png');
    assert.equal(resolveUrl('img/a.png', B), 'https://miweb.com/blog/img/a.png');
    assert.equal(resolveUrl('../a.png', B), 'https://miweb.com/a.png');
    assert.equal(resolveUrl('//cdn.com/a.png', B), 'https://cdn.com/a.png');
    assert.equal(resolveUrl('mailto:a@b.c', B), 'mailto:a@b.c'); assert.equal(resolveUrl('#arriba', B), '#arriba');
    assert.equal(resolveUrl('/a', undefined), '/a', 'sin baseUrl: igual');
    const pressed = [];
    const t = await render({
      scroll: false, baseUrl: 'https://miweb.com', onLinkPress: h => pressed.push(h),
      html: `<p class="destacado otra" style="color:#000; font-size: 1.5em">Hola <a href="/contacto">aquí</a> <span class="precio" style="color:#111">9 €</span> <font color="red">rojo</font></p>
        <img src="/uploads/a.png" width="10" height="10"><producto id="12"></producto><b>negrita</b>`,
      _text: { fontSize: 20 },
      classesStyles: { destacado: { bg: 'warning.100' }, otra: { fontWeight: '700' }, precio: { color: 'success.100' } },
      ignoredStyles: ['color'],
      renderers: {
        producto: ({ attrs }) => h(RN.Text, { testID: 'producto' }, `Producto ${attrs.id}`),
        img: ({ attrs }) => h(RN.Text, { testID: 'img' }, attrs.src),
        b: ({ children, inline }) => (inline ? undefined : children), // undefined: el de por defecto
      },
    });
    assert.equal(textOf(t.root.findAll(n => n.props.testID === 'producto').pop()), 'Producto 12', 'etiqueta propia del CMS');
    assert.equal(textOf(t.root.findAll(n => n.props.testID === 'img').pop()), 'https://miweb.com/uploads/a.png', 'renderer de img con la URL completa');
    const p = topTexts(t).find(n => textOf(n).startsWith('Hola'));
    const ps = flat(p.props.style);
    assert.equal(ps.fontWeight, '700', 'classesStyles (varias clases)');
    assert.notEqual(ps.color, '#000', 'ignoredStyles: sin el color del CMS');
    assert.equal(ps.fontSize, 30, '1.5em sobre el fontSize de _text (20)');
    const precio = p.findAll(n => n.type === 'Text' && textOf(n) === '9 €').pop();
    assert.equal(flat(precio.props.style).color, lib('theme').COLORS_THEME['success.100'], 'clase en un span; su color del style se ignora');
    const rojo = p.findAll(n => n.type === 'Text' && textOf(n) === 'rojo').pop();
    assert.notEqual(flat(rojo.props.style).color, 'red', '<font color> también se ignora');
    assert.equal(flat(topTexts(t).find(n => textOf(n) === 'negrita').findAll(n => n.type === 'Text').pop().props.style).fontWeight, '700', 'renderer que devuelve undefined: el de por defecto');
    await act(async () => p.findAll(n => n.props.accessibilityRole === 'link')[0].props.onPress());
    assert.deepEqual(pressed, ['https://miweb.com/contacto'], 'enlace relativo completado');
    ok('baseUrl (relativas, ../, //, mailto, #), renderers (propias, img, fallback), classesStyles, ignoredStyles y em relativo a _text');
  }

  // ---- onImagePress, _image, _bullet, emptyText, collapsedHeight y <details>
  {
    const got = [];
    const t = await render({
      scroll: false, onImagePress: (src, info) => got.push([src, info]), _image: { rounded: 2 }, _bullet: { color: 'danger.100' },
      html: '<img src="https://x/a.png" width="20" height="10"><p>texto</p><img src="https://x/b.png" width="20" height="10"><ul><li>uno</li></ul>',
    });
    const presses = t.root.findAll(n => typeof n.type === 'string' && n.props.accessibilityRole === 'imagebutton' && n.props.onPress);
    assert.equal(presses.length, 2);
    await act(async () => presses[1].props.onPress());
    assert.deepEqual(got[0], ['https://x/b.png', { index: 1, images: ['https://x/a.png', 'https://x/b.png'] }], 'src, posición y todas las imágenes');
    assert.ok(flat(boxOf(all(t, 'Image')[0]).props.style).borderRadius > 0, '_image: bordes redondeados');
    assert.equal(flat(topTexts(t).find(n => textOf(n) === '•').props.style).color, lib('theme').COLORS_THEME['danger.100'], '_bullet');

    const e = await render({ html: '<p>   </p>', emptyText: 'Sin descripción' });
    assert.ok(topTexts(e).some(n => textOf(n) === 'Sin descripción'), 'emptyText con HTML vacío');

    const c = await render({ scroll: false, collapsedHeight: 100, html: '<p>muy largo</p>' });
    const inner = () => c.root.findAll(n => n.type === 'View' && n.props.onLayout).pop();
    await act(async () => inner().props.onLayout({ nativeEvent: { layout: { height: 110 } } }));
    assert.ok(!topTexts(c).some(n => ['Leer más', 'Read more'].includes(textOf(n))), 'solo sobran 10 px: sin botón');
    await act(async () => inner().props.onLayout({ nativeEvent: { layout: { height: 500 } } }));
    const btn = () => topTexts(c).find(n => ['Leer más', 'Read more', 'Leer menos', 'Read less'].includes(textOf(n)));
    assert.ok(['Leer más', 'Read more'].includes(textOf(btn())), 'largo: "Leer más"');
    const clip = () => c.root.findAll(n => n.type === 'View' && n.props.style?.overflow === 'hidden' && 'maxHeight' in n.props.style)[0];
    assert.equal(clip().props.style.maxHeight, 100, 'recortado a collapsedHeight');
    await act(async () => c.root.findAll(n => typeof n.type === 'string' && n.props.accessibilityRole === 'button' && n.props.onPress && n.props.hitSlop)[0].props.onPress());
    assert.equal(clip().props.style.maxHeight, undefined, 'desplegado');
    assert.ok(['Leer menos', 'Read less'].includes(textOf(btn())));

    const d = await render({ scroll: false, html: '<details open><summary>Ver <b>más</b> detalles</summary><p>Oculto</p></details><details><summary>Otra</summary><p>Dentro</p></details>' });
    const triggers = d.root.findAll(n => typeof n.type === 'string' && n.props.accessibilityState && 'expanded' in n.props.accessibilityState && n.props.onPress);
    assert.ok(triggers.length >= 2, 'cada <details> es un Collapse');
    assert.ok(labelsOf(d).includes('Ver más detalles') && labelsOf(d).includes('Otra'), 'el <summary> es el botón');
    assert.equal(triggers.find(n => JSON.stringify(n.props.accessibilityState).includes('true')) != null, true, '<details open> empieza abierto');
    ok('onImagePress (src, índice y lista), _image, _bullet, emptyText, collapsedHeight con "Leer más" y <details> con Collapse');
  }

  // ---- tablas: scroll horizontal con ancho mínimo por columna (colspan cuenta doble); tableScroll={false} como antes
  {
    const html = '<table><tr><th>A</th><th>B</th><th colspan="2">C</th></tr><tr><td>1</td><td>2</td><td>3</td><td>4</td></tr></table>';
    const cellOf = (t, txt) => { const tx = t.root.findAll(n => n.type === 'Text' && textOf(n) === txt).pop(); return boxOf(tx) };
    const t = await render({ scroll: false, html, tableColumnWidth: 80 });
    const hs = t.root.findAll(n => n.type === 'ScrollView' && n.props.horizontal);
    assert.equal(hs.length, 1, 'la tabla va en un scroll horizontal');
    assert.equal(hs[0].props.contentContainerStyle.minWidth, '100%', 'si cabe, ocupa el ancho');
    assert.equal(flat(cellOf(t, 'A').props.style).minWidth, 80, 'ancho mínimo por columna');
    assert.equal(flat(cellOf(t, 'C').props.style).minWidth, 160, 'colspan=2: el doble');
    const off = await render({ scroll: false, html, tableScroll: false });
    assert.equal(off.root.findAll(n => n.type === 'ScrollView' && n.props.horizontal).length, 0, 'tableScroll={false}: sin scroll');
    assert.equal(flat(cellOf(off, 'A').props.style).minWidth, undefined, 'ni ancho mínimo');
    ok('tablas: scroll horizontal, ancho mínimo por columna (tableColumnWidth, colspan) y tableScroll={false}');
  }

  // ---- listas de tareas del RichTextEditor: <ul class="checklist"><li data-checked>
  {
    const t = await render({ scroll: false, html: '<ul class="checklist"><li data-checked="true">Hecho</li><li data-checked="false">Pendiente</li></ul>' });
    const checks = t.root.findAll(n => n.type === 'Text' && textOf(n) === '✓');
    assert.equal(checks.length > 0, true, 'la marcada lleva ✓');
    assert.ok(!labelsOf(t).includes('•'), 'sin viñetas');
    assert.ok(labelsOf(t).includes('Hecho') && labelsOf(t).includes('Pendiente'));
    ok('listas de tareas (checklist del editor) con casilla en lugar de viñeta');
  }

  // ---- letter-spacing y sub/sup desplazados (vista en línea con translateY)
  {
    const t = await render({ scroll: false, _text: { fontSize: 20 }, html: '<p style="letter-spacing: 3px">H<sub>2</sub>O y x<sup>2</sup></p>' });
    const p = topTexts(t)[0];
    assert.equal(flat(p.props.style).letterSpacing, 3, 'letter-spacing');
    const shifted = t.root.findAll(n => n.type === 'View' && n.props.style?.transform);
    const ys = shifted.map(v => v.props.style.transform[0].translateY);
    assert.ok(ys.length === 2 && ys[0] > 0 && ys[1] < 0, 'sub baja y sup sube: ' + ys);
    const two = shifted[0].findAll(n => n.type === 'Text').pop();
    assert.equal(flat(two.props.style).fontSize, 14, '72 % del tamaño del texto');
    ok('letter-spacing y subíndice / superíndice desplazados y a escala');
  }
})().catch(e => { console.error('FALLO', e); process.exit(1) });
