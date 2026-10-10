// Pruebas de ListStore y AsyncList: páginas, hay más, peticiones viejas, errores, filtros, caché y la lista
const assert = require('assert');
const H = require('./harness');
const { h, TR, act, RN, lib, wait } = H;
const { ListStore, AsyncList, useListStore } = lib('index');
const ok = msg => console.log('OK ' + msg);

// API simulada: cada petición queda pendiente hasta que la prueba la resuelve
const api = () => {
  const calls = [];
  const fetch = args => new Promise((resolve, reject) => calls.push({ args, resolve, reject }));
  return { calls, fetch, last: () => calls[calls.length - 1] };
};
const items = (from, n) => Array.from({ length: n }, (_, i) => ({ id: from + i, name: `item ${from + i}` }));
const flush = () => new Promise(r => setTimeout(r, 0));

(async () => {
  // ---- páginas: load, loadMore, hasMore por pageSize y por total; sin duplicar peticiones
  {
    const a = api();
    const s = new ListStore({ fetch: a.fetch, pageSize: 3 });
    assert.equal(s.status, 'idle');
    const p = s.load();
    assert.equal(s.status, 'loading');
    assert.deepEqual(a.last().args.page, 1); assert.equal(a.last().args.reason, 'load');
    a.last().resolve(items(1, 3)); await p;
    assert.equal(s.status, 'success'); assert.equal(s.data.length, 3); assert.equal(s.getState().hasMore, true, '3 de 3: puede haber más');
    s.loadMore(); s.loadMore();
    assert.equal(a.calls.length, 2, 'loadMore dos veces seguidas: una sola petición');
    assert.equal(a.last().args.page, 2); assert.equal(s.status, 'loadingMore');
    a.last().resolve(items(4, 2)); await flush();
    assert.deepEqual(s.data.map(i => i.id), [1, 2, 3, 4, 5], 'se añaden');
    assert.equal(s.getState().hasMore, false, 'menos de pageSize: no hay más');
    await s.loadMore();
    assert.equal(a.calls.length, 2, 'sin más: no pide');
    const b = api();
    const t = new ListStore({ fetch: b.fetch, pageSize: 2 });
    t.load(); b.last().resolve({ data: items(1, 2), total: 3 }); await flush();
    assert.equal(t.getState().hasMore, true); assert.equal(t.getState().total, 3);
    t.loadMore(); b.last().resolve({ data: items(3, 1), total: 3 }); await flush();
    assert.equal(t.getState().hasMore, false, 'con total: hay más mientras data < total');
    ok('páginas: load, loadMore (sin duplicar), hasMore por pageSize y por total');
  }

  // ---- peticiones viejas se ignoran (y se abortan); refresh mantiene los datos; setParams vuelve a cargar
  {
    const a = api();
    const s = new ListStore({ fetch: a.fetch, pageSize: 2, params: { q: '' } });
    s.load(); const first = a.last();
    s.setParams({ q: 'abc' });
    assert.equal(first.args.signal.aborted, true, 'la anterior se aborta');
    assert.deepEqual(a.last().args.params, { q: 'abc' }, 'con los params nuevos');
    first.resolve(items(100, 2)); a.last().resolve(items(1, 2)); await flush();
    assert.deepEqual(s.data.map(i => i.id), [1, 2], 'la respuesta vieja que llega tarde no cuenta');
    s.refresh();
    assert.equal(s.status, 'refreshing'); assert.equal(s.data.length, 2, 'refrescando: los datos siguen');
    a.last().resolve(items(7, 1)); await flush();
    assert.deepEqual(s.data.map(i => i.id), [7], 'y luego se cambian');
    const n = a.calls.length;
    await s.setParams({ q: 'abc' });
    assert.equal(a.calls.length, n, 'mismos params: no pide');
    s.setParams(prev => ({ ...prev, estado: 'paid' }));
    assert.deepEqual(a.last().args.params, { q: 'abc', estado: 'paid' }); assert.equal(s.data.length, 0, 'filtros nuevos: se vacía');
    a.last().resolve([]); await flush();
    ok('peticiones viejas ignoradas y abortadas, refresh mantiene los datos, setParams (objeto o función) recarga');
  }

  // ---- errores: retry repite lo que falló; tras fallar una página, loadMore espera al retry
  {
    const a = api();
    const s = new ListStore({ fetch: a.fetch, pageSize: 2 });
    s.load(); a.last().reject(new Error('sin red')); await flush();
    assert.equal(s.status, 'error'); assert.equal(s.getState().error.message, 'sin red');
    s.retry(); assert.equal(a.last().args.reason, 'load', 'retry de la carga');
    a.last().resolve(items(1, 2)); await flush();
    s.loadMore(); a.last().reject(new Error('x')); await flush();
    assert.equal(s.status, 'error'); assert.equal(s.data.length, 2, 'falla una página: los datos siguen');
    const n = a.calls.length;
    await s.loadMore();
    assert.equal(a.calls.length, n, 'tras el error, el scroll no vuelve a pedir solo');
    s.retry(); assert.equal(a.last().args.reason, 'more'); assert.equal(a.last().args.page, 2, 'retry de la página');
    a.last().resolve(items(3, 2)); await flush();
    assert.equal(s.data.length, 4);
    ok('errores: retry repite lo que falló; loadMore no reintenta solo');
  }

  // ---- cambios locales, use(selector), listener y caché
  {
    const s = new ListStore({ fetch: async () => [] });
    s.setData(items(1, 3));
    s.updateItem('2', { name: 'cambiado' });
    s.removeItem('1');
    s.addItems({ id: 9, name: 'nuevo' });
    s.addItems([{ id: 10, name: 'fin' }], { end: true });
    assert.deepEqual(s.data.map(i => `${i.id}:${i.name}`), ['9:nuevo', '2:cambiado', '3:item 3', '10:fin']);
    let renders = 0;
    const Count = () => { renders++; const n = s.use(st => st.data.length); return h(RN.Text, null, `n=${n}`) };
    let t; await act(async () => { t = TR.create(h(RN.View, null, h(Count), s.listener(st => `total: ${st.data.length}`))) });
    assert.ok(JSON.stringify(t.toJSON()).includes('n=4') && JSON.stringify(t.toJSON()).includes('total: 4'));
    const before = renders;
    await act(async () => s.updateItem('2', { name: 'otra vez' }));
    assert.equal(renders, before, 'use(selector): sin re-render si lo seleccionado no cambia');
    await act(async () => s.removeItem('2'));
    assert.ok(JSON.stringify(t.toJSON()).includes('n=3') && JSON.stringify(t.toJSON()).includes('total: 3'), 'y sí cuando cambia');
    // Caché: la primera página se guarda y se muestra al abrir mientras llega la nueva
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    await AsyncStorage.setItem('cache-pedidos', JSON.stringify(items(50, 2)));
    const a = api();
    const c = new ListStore({ fetch: a.fetch, cacheKey: 'cache-pedidos', cacheStorage: 'storage' });
    await flush();
    assert.deepEqual(c.data.map(i => i.id), [50, 51]); assert.equal(c.getState().fromCache, true, 'de la caché');
    c.load(); a.last().resolve(items(1, 1)); await flush();
    assert.equal(c.getState().fromCache, false);
    assert.deepEqual(JSON.parse(await AsyncStorage.getItem('cache-pedidos')).map(i => i.id), [1], 'la nueva se guarda');
    // Caché en memoria (por defecto): sin AsyncStorage; otro store con la misma clave la ve al momento
    const m1 = api();
    const mem = new ListStore({ fetch: m1.fetch, cacheKey: 'mem-pedidos' });
    mem.load(); m1.last().resolve(items(1, 2)); await flush();
    assert.equal(await AsyncStorage.getItem('mem-pedidos'), undefined, 'memoria: no toca AsyncStorage');
    const mem2 = new ListStore({ fetch: async () => [], cacheKey: 'mem-pedidos' });
    assert.deepEqual(mem2.data.map(i => i.id), [1, 2], 'memoria: al momento (sin esperar)');
    assert.equal(mem2.getState().fromCache, true);
    // Tras un reset (p. ej. resetOnUnmount), la siguiente carga desde cero también la muestra al momento
    mem2.reset(); const m2 = []; mem2.options.fetch = () => new Promise(r => m2.push(r));
    mem2.load();
    assert.deepEqual([mem2.status, mem2.data.length, mem2.getState().fromCache], ['loading', 2, true], 'reset + load: caché al momento mientras carga');
    m2[0](items(5, 1)); await flush();
    // Cada combinación de filtros tiene la suya: unos params nuevos no muestran la de otros
    mem2.setParams({ q: 'otro' });
    assert.equal(mem2.data.length, 0, 'filtros nunca vistos: sin caché');
    m2[1](items(20, 1)); await flush();
    mem2.setParams({}, { replace: true });
    assert.deepEqual(mem2.data.map(i => i.id), [5], 'volver a unos filtros ya vistos: su primera página al momento');
    m2[2](items(5, 1)); await flush();
    await mem2.clearCache();
    assert.equal(new ListStore({ fetch: async () => [], cacheKey: 'mem-pedidos' }).data.length, 0, 'clearCache');
    ok('cambios locales (update, remove, add), use(selector) sin renders de más, listener, caché en memoria (por defecto) y en AsyncStorage');
  }

  // ---- AsyncList: carga al montarse, filas, scroll infinito, refrescar, vacío, error, rejilla y filtro local
  {
    const a = api();
    const s = new ListStore({ fetch: a.fetch, pageSize: 2 });
    const textOf = n => (typeof n === 'string' ? n : (n.children || []).map(textOf).join(''));
    const texts = t => t.root.findAll(n => n.type === 'Text').map(textOf);
    let t; await act(async () => { t = TR.create(h(AsyncList, { store: s, renderItem: ({ item }) => h(RN.Text, null, item.name) })) });
    await act(flush);
    assert.equal(a.calls.length, 1, 'carga al montarse');
    assert.ok(texts(t).some(x => /Cargando|Loading/.test(x)), 'primera carga: Cargando…');
    await act(async () => { a.last().resolve(items(1, 2)); await flush() });
    assert.ok(texts(t).includes('item 1') && texts(t).includes('item 2'));
    const list = () => t.root.findAll(n => n.type === 'FlatList')[0];
    await act(async () => list().props.onEndReached());
    assert.equal(a.last().args.page, 2, 'al llegar al final: siguiente página');
    assert.ok(t.root.findAll(n => n.type === 'Spinner').length > 0, 'cargando más: spinner abajo');
    await act(async () => { a.last().reject(new Error('x')); await flush() });
    assert.ok(texts(t).some(x => /No se pudo cargar|Could not load/.test(x)) && texts(t).includes('item 1'), 'error al cargar más: aviso abajo y los datos siguen');
    await act(async () => { t.root.findAll(n => typeof n.type === 'string' && n.props.accessibilityRole === 'button' && n.props.onPress)[0].props.onPress() });
    assert.equal(a.last().args.reason, 'more', 'Reintentar');
    await act(async () => { a.last().resolve([]); await flush() });
    const rc = list().props.refreshControl;
    assert.equal(rc.props.refreshing, false);
    await act(async () => { rc.props.onRefresh() });
    assert.equal(list().props.refreshControl.props.refreshing, true, 'tirar para refrescar');
    await act(async () => { a.last().resolve([]); await flush() });
    assert.ok(texts(t).some(x => /Sin resultados|No results/.test(x)), 'vacía: Sin resultados');
    // Rejilla por ancho y filtro local
    const g = new ListStore({ fetch: async () => items(1, 6) });
    let u; await act(async () => { u = TR.create(h(AsyncList, { store: g, itemMinWidth: 100, filterItems: i => i.id % 2 === 0, renderItem: ({ item }) => h(RN.Text, null, item.name) })) });
    await act(async () => { await flush(); await flush() });
    await act(async () => u.root.findAll(n => n.type === 'View' && n.props.onLayout)[0].props.onLayout({ nativeEvent: { layout: { width: 350, height: 600 } } }));
    assert.equal(u.root.findAll(n => n.type === 'FlatList')[0].props.numColumns, 3, '350 / 100 → 3 columnas');
    assert.deepEqual(texts(u).filter(x => x.startsWith('item')), ['item 2', 'item 4', 'item 6'], 'filterItems');
    ok('AsyncList: carga al montarse, scroll infinito, error con reintentar, refrescar, vacía, rejilla y filtro local');
  }

  // ---- reset al estado inicial, resetOnUnmount y setParams quita los vacíos
  {
    const a = api();
    const s = new ListStore({ fetch: a.fetch, params: { estado: 'all' } });
    s.setParams({ q: 'x', vacio: '', nada: null }); a.last().resolve(items(1, 1)); await flush();
    assert.deepEqual(s.params, { estado: 'all', q: 'x' }, 'setParams: los vacíos se quitan');
    s.reset();
    assert.deepEqual(s.params, { estado: 'all', q: 'x' }, 'reset(): los params se quedan');
    s.reset({ params: 'initial' });
    assert.deepEqual(s.params, { estado: 'all' }, "reset({ params: 'initial' }): los del principio");
    // resetOnUnmount: al desmontarse (cerrar el modal, volver atrás) todo al principio y lo pendiente cancelado
    const b = api();
    const st = new ListStore({ fetch: b.fetch, params: { orden: 'fecha' } });
    let t; await act(async () => { t = TR.create(h(AsyncList, { store: st, resetOnUnmount: true, renderItem: ({ item }) => h(RN.Text, null, item.name) })) });
    await act(async () => { b.last().resolve(items(1, 2)); await flush() });
    st.setParams({ q: 'z' });
    const pendiente = b.last();
    await act(async () => t.unmount());
    assert.equal(pendiente.args.signal.aborted, true, 'lo pendiente se cancela');
    assert.deepEqual([st.status, st.data.length, st.params], ['idle', 0, { orden: 'fecha' }], 'vuelve al principio');
    // Sin resetOnUnmount se queda como estaba (para volver a la pantalla y verlo igual)
    const c = api();
    const keep = new ListStore({ fetch: c.fetch });
    let u; await act(async () => { u = TR.create(h(AsyncList, { store: keep, renderItem: ({ item }) => h(RN.Text, null, item.name) })) });
    await act(async () => { c.last().resolve(items(1, 2)); await flush() });
    await act(async () => u.unmount());
    assert.equal(keep.data.length, 2, 'sin resetOnUnmount: se queda');
    ok("reset() / reset({ params: 'initial' }), resetOnUnmount (y sin él se queda), setParams quita vacíos");
  }

  // ---- keyField, sin duplicados al paginar, caché con límite, itemHeight y skeleton
  {
    const a = api();
    const s = new ListStore({ fetch: a.fetch, pageSize: 2, keyField: 'code' });
    s.load(); a.last().resolve([{ code: 'a', n: 1 }, { code: 'b', n: 2 }]); await flush();
    assert.equal(s.keyOf(s.data[1], 1), 'b', 'keyField');
    s.loadMore(); a.last().resolve([{ code: 'b', n: 2 }, { code: 'c', n: 3 }]); await flush();
    assert.deepEqual(s.data.map(i => i.code), ['a', 'b', 'c'], 'la "b" repetida de la página 2 no se duplica');
    s.updateItem('c', { n: 30 }); s.removeItem('a');
    assert.deepEqual(s.data.map(i => `${i.code}${i.n}`), ['b2', 'c30'], 'updateItem / removeItem por keyField');
    const d = new ListStore({ fetch: async () => [{ id: 1 }, { id: 1 }], pageSize: 1, dedupe: false });
    await d.load(); await d.loadMore();
    assert.equal(d.data.length, 4, 'dedupe: false: se quedan todos, repetidos incluidos');
    // Caché en memoria con límite: 60 combinaciones de filtros → solo se guardan las 50 últimas
    const lru = new ListStore({ fetch: async () => [{ id: 1 }], cacheKey: 'lru' });
    for (let i = 0; i < 60; i++) await lru.setParams({ i }, { replace: true });
    assert.equal(new ListStore({ fetch: async () => [], cacheKey: 'lru', params: { i: 0 } }).data.length, 0, 'la más antigua se fue');
    assert.equal(new ListStore({ fetch: async () => [], cacheKey: 'lru', params: { i: 59 } }).data.length, 1, 'la última sigue');
    // itemHeight → getItemLayout; skeleton en la primera carga
    const b = api();
    const st = new ListStore({ fetch: b.fetch });
    let t; await act(async () => { t = TR.create(h(AsyncList, { store: st, itemHeight: 80, skeleton: 3, renderItem: ({ item }) => h(RN.Text, null, item.name) })) });
    const gl = t.root.findAll(n => n.type === lib('FlatList').FlatList)[0].props.getItemLayout;
    assert.deepEqual(gl(null, 5), { length: 80, offset: 400, index: 5 }, 'itemHeight: getItemLayout');
    assert.ok(t.root.findAll(n => n.type === lib('Skeleton').Skeleton).length === 3, 'skeleton: 3 elementos de carga');
    await act(async () => { b.last().resolve(items(1, 1)); await flush() });
    assert.equal(t.root.findAll(n => n.type === lib('Skeleton').Skeleton).length, 0, 'y luego los datos');
    ok('keyField, sin duplicados al paginar (dedupe), caché en memoria con límite, itemHeight (getItemLayout) y skeleton');
  }

  // ---- useListStore: el mismo store en cada render y fetch siempre el último
  {
    const seen = [];
    let store1, store2;
    const C = ({ q }) => { const s = useListStore({ fetch: async () => { seen.push(q); return [] } }); if (!store1) store1 = s; else store2 = s; return null };
    let t; await act(async () => { t = TR.create(h(C, { q: 'a' })) });
    await act(async () => t.update(h(C, { q: 'b' })));
    assert.equal(store1, store2, 'mismo store');
    await store1.load();
    assert.deepEqual(seen, ['b'], 'fetch con lo último del componente');
    ok('useListStore: store estable y fetch con las variables actuales');
  }
})().catch(e => { console.error('FALLO', e); process.exit(1) });
