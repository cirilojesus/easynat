// Pruebas de Table: anchos, orden, formato, totales, selección, paginación, desplegables, carga, vacío y alto fijo
const assert = require('assert');
const { h, TR, act, RN, lib } = require('./harness');
const { Table } = lib('index');
const ok = msg => console.log('OK ' + msg);

const render = async el => { let t; await act(async () => { t = TR.create(el) }); return t };
const textOf = n => (typeof n === 'string' ? n : (n.children || []).map(textOf).join(''));
const texts = t => t.root.findAll(n => n.type === 'Text').map(textOf);
const layout = async (t, width) => {
  const v = t.root.findAll(n => n.type === 'View' && n.props.onLayout).pop();
  await act(async () => v.props.onLayout({ nativeEvent: { layout: { width, height: 300 } } }));
};
// Las celdas del cuerpo (texto) en orden, por columna
const column = (t, values) => texts(t).filter(x => values.includes(x));
const press = async (t, pred) => { const n = t.root.findAll(n => typeof n.type === 'string' && n.props.onPress && pred(n))[0]; assert.ok(n, 'no se encontró'); await act(async () => n.props.onPress()) };
const flat = s => RN.StyleSheet.flatten(s);

const DATA = [
  { id: 1, nombre: 'Banana', precio: 2, alta: '2026-03-01' },
  { id: 2, nombre: 'apple', precio: 10, alta: '2025-12-01' },
  { id: 3, nombre: 'Cereza', precio: null, alta: '2026-01-15' },
  { id: 4, nombre: 'item 10', precio: 5, alta: '2026-02-01' },
  { id: 5, nombre: 'item 2', precio: 5, alta: '2026-02-02' },
];
const COLS = [
  { key: 'nombre', title: 'Nombre', sortable: true, footer: 'Total' },
  { key: 'precio', title: 'Precio', sortable: true, align: 'right', format: v => (v == null ? '—' : `${v} €`), footer: rows => `${rows.reduce((a, r) => a + (r.precio ?? 0), 0)} €` },
];
const NOMBRES = DATA.map(d => d.nombre);

(async () => {
  // ---- anchos: el sobrante por flex respetando mínimos; si no caben, scroll horizontal
  {
    const t = await render(h(Table, { data: DATA, columns: [{ key: 'a', flex: 2 }, { key: 'b' }, { key: 'c', minWidth: 70 }] }));
    await layout(t, 300);
    const widthOf = key => t.root.findAll(n => n.type === 'Text' && textOf(n) === key)[0];
    const cellW = key => { let q = widthOf(key); while (q && !(q.props.style && flat(q.props.style).width)) q = q.parent; return flat(q.props.style).width };
    const ws = ['a', 'b', 'c'].map(cellW);
    assert.equal(ws.reduce((x, y) => x + y, 0), 300, 'llenan el ancho justo: ' + ws);
    assert.ok(ws[2] >= 70 && ws[1] >= 100 && ws[0] > ws[1], 'mínimos respetados y flex 2 más ancha: ' + ws);
    assert.equal(t.root.findAll(n => n.type === 'ScrollView' && n.props.horizontal).length, 0, 'caben: sin scroll');
    await layout(t, 200);
    assert.equal(t.root.findAll(n => n.type === 'ScrollView' && n.props.horizontal).length, 1, 'no caben: scroll horizontal');
    ok('anchos: flex con mínimos, llenan el ancho y scroll horizontal si no caben');
  }

  // ---- orden (asc → desc → sin orden), textos con números, vacíos al final, sortValue; format y totales
  {
    const sorts = [];
    const t = await render(h(Table, { data: DATA, columns: COLS, onSortChange: s => sorts.push(s) }));
    await layout(t, 400);
    assert.deepEqual(column(t, NOMBRES), NOMBRES, 'sin orden: como vienen');
    assert.ok(texts(t).includes('2 €') && texts(t).includes('—'), 'format');
    assert.ok(texts(t).includes('Total') && texts(t).includes('22 €'), 'footer con totales');
    await press(t, n => n.props.accessibilityLabel === 'Nombre');
    assert.deepEqual(column(t, NOMBRES), ['apple', 'Banana', 'Cereza', 'item 2', 'item 10'], 'asc: sin mayúsculas, "item 2" antes que "item 10"');
    await press(t, n => n.props.accessibilityLabel === 'Nombre');
    assert.deepEqual(column(t, NOMBRES), ['item 10', 'item 2', 'Cereza', 'Banana', 'apple'], 'desc');
    await press(t, n => n.props.accessibilityLabel === 'Nombre');
    assert.deepEqual(column(t, NOMBRES), NOMBRES, 'tercera vez: sin orden');
    await press(t, n => n.props.accessibilityLabel === 'Precio');
    assert.deepEqual(column(t, NOMBRES), ['Banana', 'item 10', 'item 2', 'apple', 'Cereza'], 'números; empates en su orden; vacío al final');
    assert.deepEqual(sorts, [{ key: 'nombre', direction: 'asc' }, { key: 'nombre', direction: 'desc' }, null, { key: 'precio', direction: 'asc' }]);
    const f = await render(h(Table, { data: DATA, defaultSort: { key: 'alta', direction: 'asc' }, columns: [{ key: 'nombre' }, { key: 'alta', sortable: true, sortValue: r => new Date(r.alta) }] }));
    assert.deepEqual(column(f, NOMBRES), ['apple', 'Cereza', 'item 10', 'item 2', 'Banana'], 'sortValue con fechas');
    const m = await render(h(Table, { data: DATA, columns: COLS, manualSort: true, defaultSort: { key: 'nombre', direction: 'asc' } }));
    assert.deepEqual(column(m, NOMBRES), NOMBRES, 'manualSort: no reordena (lo hace el servidor)');
    ok('orden asc/desc/sin orden, numérico en textos, vacíos al final, sortValue, manualSort, format y totales');
  }

  // ---- selección (todas, una, single) y onRowPress / renderExpanded
  {
    const changes = [], pressed = [];
    const t = await render(h(Table, { data: DATA, columns: COLS, selectable: true, onSelectionChange: (k, rows) => changes.push([k, rows.length]), onRowPress: r => pressed.push(r.id) }));
    const checks = () => t.root.findAll(n => typeof n.type === 'string' && n.props.accessibilityRole === 'checkbox');
    const box = i => checks()[i];
    await act(async () => box(0).props.onPress());
    assert.deepEqual(changes[0], [['1', '2', '3', '4', '5'], 5], 'la de la cabecera: todas');
    await act(async () => box(2).props.onPress());
    assert.deepEqual(changes[1][0], ['1', '3', '4', '5'], 'quitar una');
    await press(t, n => n.props.accessibilityRole === 'button' && !n.props.accessibilityLabel && textOf(n).includes('apple'));
    assert.deepEqual(pressed, [2], 'onRowPress con la fila');
    const s = await render(h(Table, { data: DATA, columns: COLS, selectable: 'single', onSelectionChange: k => changes.push(k) }));
    const sb = () => s.root.findAll(n => typeof n.type === 'string' && n.props.accessibilityRole === 'checkbox');
    assert.equal(sb().length, DATA.length, "single: sin casilla de 'todas'");
    await act(async () => sb()[0].props.onPress()); await act(async () => sb()[3].props.onPress());
    assert.deepEqual(changes.slice(-2), [['1'], ['4']], 'single: una sola');
    const e = await render(h(Table, { data: DATA.slice(0, 2), columns: COLS, renderExpanded: r => h(RN.Text, null, `Detalle ${r.id}`), defaultExpandedKeys: ['2'] }));
    assert.ok(texts(e).includes('Detalle 2') && !texts(e).includes('Detalle 1'), 'defaultExpandedKeys');
    await press(e, n => n.props.accessibilityLabel === 'expand' && n.props.accessibilityState?.expanded === false);
    assert.ok(texts(e).includes('Detalle 1'), 'la flecha despliega');
    ok('selección (todas, una, single), onRowPress y filas desplegables');
  }

  // ---- paginación, carga, vacío y alto fijo (FlatList)
  {
    const pages = [];
    const many = Array.from({ length: 23 }, (_, i) => ({ id: i, n: `fila ${i}` }));
    const t = await render(h(Table, { data: many, columns: [{ key: 'n' }], pageSize: 10, onPageChange: p => pages.push(p) }));
    assert.ok(texts(t).includes('fila 0') && !texts(t).includes('fila 10'), 'página 1');
    assert.ok(texts(t).some(x => /1–10 (de|of) 23/.test(x)), 'rango: ' + texts(t).filter(x => x.includes('23')));
    await press(t, n => n.props.accessibilityLabel === 'next');
    assert.ok(texts(t).includes('fila 10') && !texts(t).includes('fila 0'), 'página 2');
    await press(t, n => n.props.accessibilityLabel === 'last');
    assert.ok(texts(t).includes('fila 22') && texts(t).some(x => /21–23/.test(x)), 'última');
    assert.deepEqual(pages, [1, 2]);
    const l = await render(h(Table, { data: DATA, columns: COLS, loading: true }));
    assert.ok(!texts(l).includes('Banana') && l.root.findAll(n => n.type === 'ReaView' || n.type === 'AnimatedView').length > 0, 'loading: Skeleton en lugar de las filas');
    const v = await render(h(Table, { data: [], columns: COLS, emptyText: 'Nada por aquí' }));
    assert.ok(texts(v).includes('Nada por aquí') && !texts(v).includes('Total'), 'vacía: emptyText y sin totales');
    const fx = await render(h(Table, { data: many, columns: [{ key: 'n' }], height: 200 }));
    assert.equal(fx.root.findAll(n => n.type === 'FlatList').length, 1, 'height: el cuerpo es una FlatList (solo pinta lo visible)');
    ok('paginación (rango, siguiente, última), loading con Skeleton, vacía y alto fijo con FlatList');
  }

  // ---- keyField, filas sin Pressable si no se pueden tocar, y conectada a un ListStore
  {
    const sel = [];
    const t = await render(h(Table, { data: [{ code: 'x1', n: 'A' }, { code: 'x2', n: 'B' }], keyField: 'code', columns: [{ key: 'n' }], selectable: true, onSelectionChange: k => sel.push(k) }));
    await act(async () => t.root.findAll(n => typeof n.type === 'string' && n.props.accessibilityRole === 'checkbox')[2].props.onPress());
    assert.deepEqual(sel[0], ['x2'], 'keyField');
    const plain = await render(h(Table, { data: DATA, columns: COLS }));
    assert.equal(plain.root.findAll(n => n.type === RN.Pressable).length, 2, 'sin onRowPress: las filas no llevan Pressable (solo las 2 cabeceras que ordenan)');
    // Con store: carga sola, "Cargar más", y con height más filas al llegar al final
    const { ListStore } = lib('index');
    const reqs = [];
    const store = new ListStore({ pageSize: 2, fetch: ({ page }) => new Promise(r => reqs.push({ page, r })) });
    const s = await render(h(Table, { store, columns: [{ key: 'n' }] }));
    assert.equal(reqs.length, 1, 'carga al montarse');
    assert.ok(s.root.findAll(n => n.type === lib('Skeleton').Skeleton).length > 0, 'cargando: Skeleton');
    await act(async () => { reqs[0].r([{ id: 1, n: 'uno' }, { id: 2, n: 'dos' }]); await new Promise(r => setTimeout(r, 0)) });
    assert.ok(texts(s).includes('uno') && texts(s).some(x => /Cargar más|Load more/.test(x)), 'filas y "Cargar más"');
    await press(s, n => n.props.accessibilityRole === 'button' && /Cargar más|Load more/.test(textOf(n)));
    assert.equal(reqs[1].page, 2, 'Cargar más: página 2');
    await act(async () => { reqs[1].r([{ id: 3, n: 'tres' }]); await new Promise(r => setTimeout(r, 0)) });
    assert.ok(texts(s).includes('tres') && !texts(s).some(x => /Cargar más|Load more/.test(x)), 'sin más: el botón se va');
    const store2 = new ListStore({ pageSize: 2, fetch: async ({ page }) => [{ id: page * 10, n: `p${page}` }, { id: page * 10 + 1, n: 'x' }] });
    const h2 = await render(h(Table, { store: store2, columns: [{ key: 'n' }], height: 200 }));
    await act(async () => { await new Promise(r => setTimeout(r, 0)) });
    await act(async () => h2.root.findAll(n => n.type === 'FlatList')[0].props.onEndReached());
    await act(async () => { await new Promise(r => setTimeout(r, 0)) });
    assert.ok(texts(h2).includes('p2'), 'con height: al llegar al final, la siguiente página');
    ok('keyField, filas sin Pressable cuando no se tocan y store (carga, Cargar más, scroll infinito con height)');
  }

  // ---- colSpan: grupos de cabecera, celdas que ocupan varias columnas, footerColSpan y rowStyle
  {
    const rows = [{ id: 's', seccion: 'Sección A' }, { id: '1', a: 'x', b: 1, c: 2 }];
    const cols = [
      { key: 'a', title: 'A', width: 100, colSpan: r => (r.seccion ? 3 : 1), render: r => h(RN.Text, null, r.seccion ?? r.a), footer: 'Total', footerColSpan: 2 },
      { title: 'Grupo', children: [{ key: 'b', title: 'B', width: 60 }, { key: 'c', title: 'C', width: 40, footer: 'suma' }] },
    ];
    const t = await render(h(Table, { data: rows, columns: cols, rowStyle: r => (r.seccion ? { bg: '#ff0000' } : undefined) }));
    await layout(t, 400);
    assert.ok(texts(t).includes('Grupo') && texts(t).includes('B') && texts(t).includes('C'), 'cabecera del grupo y sus columnas');
    const cellWidth = txt => { let q = t.root.findAll(n => n.type === 'Text' && textOf(n) === txt).pop(); while (q && !(q.props.style && flat(q.props.style).width)) q = q.parent; return flat(q.props.style).width };
    assert.equal(cellWidth('Grupo'), 100, 'el grupo mide lo que sus columnas (60 + 40)');
    assert.equal(cellWidth('Sección A'), 200, 'colSpan 3: la celda mide las tres columnas');
    assert.equal(cellWidth('x'), 100, 'en la otra fila, colSpan 1');
    assert.equal(texts(t).filter(x => x === '1').length, 1, 'las celdas tapadas no se pintan (el 1 solo en la fila normal)');
    assert.equal(cellWidth('Total'), 160, 'footerColSpan 2');
    const sec = t.root.findAll(n => n.type === 'View' && flat(n.props.style)?.backgroundColor === '#ff0000');
    assert.equal(sec.length, 1, 'rowStyle: solo la fila de sección');
    // El orden sigue funcionando con columnas dentro de grupos
    const o = await render(h(Table, { data: [{ id: 1, b: 2 }, { id: 2, b: 1 }], defaultSort: { key: 'b', direction: 'asc' }, columns: [{ key: 'id' }, { title: 'G', children: [{ key: 'b', sortable: true }] }] }));
    assert.deepEqual(texts(o).filter(x => /^[12]$/.test(x)).slice(0, 4), ['2', '1', '1', '2'], 'orden por una columna de un grupo');
    ok('colSpan: grupos de cabecera, celdas que ocupan varias columnas, footerColSpan, rowStyle y orden dentro de grupos');
  }
})().catch(e => { console.error('FALLO', e); process.exit(1) });
