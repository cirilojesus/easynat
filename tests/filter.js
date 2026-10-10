// Pruebas de Filter, FilterChips, filterData, filterCount y la conexión con ListStore
const assert = require('assert');
const H = require('./harness');
const { h, TR, act, RN, lib, wait } = H;
const { Filter, FilterChips, filterData, filterCount, cleanFilters, ListStore, Select, Switch, SearchInput } = lib('index');
const ok = msg => console.log('OK ' + msg);

const render = async el => { let t; await act(async () => { t = TR.create(el) }); return t };
const textOf = n => (typeof n === 'string' ? n : (n.children || []).map(textOf).join(''));
const texts = t => t.root.findAll(n => n.type === 'Text').map(textOf);
const typeIn = async (t, value, i = 0) => { const n = t.root.findAll(n => n.type === 'TextInput')[i]; await act(async () => n.props.onChangeText(value)) };
const select = async (t, value) => { const s = t.root.findAll(n => n.type === Select)[0]; await act(async () => s.props.onChange(value)) };
const toggle = async (t, value) => { const s = t.root.findAll(n => n.type === Switch)[0]; await act(async () => s.props.onValueChange(value)) };
const pressText = async (t, re) => { const b = t.root.findAll(n => typeof n.type === 'string' && n.props.onPress && re.test(textOf(n)))[0]; assert.ok(b, 'botón ' + re); await act(async () => b.props.onPress()) };
const pressLabel = async (t, label) => { const b = t.root.findAll(n => typeof n.type === 'string' && n.props.accessibilityLabel === label)[0]; assert.ok(b, label); await act(async () => b.props.onPress()) };

const ESTADO = { name: 'estado', type: 'select', label: 'Estado', options: [{ label: 'Pagado', value: 'paid' }, { label: 'Pendiente', value: 'pending' }] };
const FIELDS = [{ name: 'q', placeholder: 'Buscar…' }, ESTADO, { name: 'urgente', type: 'switch', label: 'Urgentes' }];

(async () => {
  // ---- sin collapse: los campos directos; texto con debounce, select y switch al momento, chips, × y limpiar
  {
    const calls = [];
    const t = await render(h(Filter, { fields: FIELDS, debounce: 60, showChips: true, onChange: (v, all) => calls.push([v, all]) }));
    assert.equal(t.root.findAll(n => n.type === lib('index').Collapse).length, 0, 'sin Collapse: va donde se quiera');
    await typeIn(t, 'te'); await typeIn(t, 'tecl');
    assert.equal(calls.length, 0, 'escribiendo: todavía no');
    await wait(90);
    assert.deepEqual(calls.map(c => c[0]), [{ q: 'tecl' }], 'tras el debounce, una vez y solo lo que tiene valor');
    await select(t, 'paid');
    await toggle(t, true); await toggle(t, false);
    assert.deepEqual(calls[calls.length - 1][0], { q: 'tecl', estado: 'paid' }, 'switch apagado: no es filtro');
    assert.equal(calls[calls.length - 1][1].urgente, false, 'en "all" sí está');
    assert.ok(texts(t).includes('Estado: Pagado') && texts(t).includes('“tecl”'), 'chips');
    await pressLabel(t, '× Estado');
    assert.deepEqual(calls[calls.length - 1][0], { q: 'tecl' }, 'la × quita ese filtro');
    await pressText(t, /(Limpiar|Clear) filt/);
    assert.deepEqual(calls[calls.length - 1][0], {}, 'limpiar');
    ok('sin collapse; debounce al escribir; select y switch al momento; valores limpios; chips con ×; limpiar');
  }

  // ---- mode="apply" + onApply; ref (clear, apply, getValues); value controlado; autocomplete
  {
    const calls = [], applied = [];
    const ref = { current: null };
    const t = await render(h(Filter, { ref, fields: FIELDS, mode: 'apply', onChange: v => calls.push(v), onApply: v => applied.push(v) }));
    await select(t, 'pending'); await typeIn(t, 'abc'); await wait(450);
    assert.equal(calls.length, 0, 'sin aplicar: nada');
    assert.deepEqual(ref.current.getValues(), { q: 'abc', estado: 'pending' }, 'ref.getValues');
    await pressText(t, /(Aplicar|Apply)/);
    assert.deepEqual(calls, [{ q: 'abc', estado: 'pending' }]); assert.deepEqual(applied, [{ q: 'abc', estado: 'pending' }], 'onApply (p. ej. para cerrar el modal)');
    await act(async () => ref.current.clear());
    assert.deepEqual(calls[calls.length - 1], {}, 'ref.clear');
    const fields = [ESTADO, { name: 'desde', type: 'date', label: 'Desde', formatChip: v => `Desde ${v}` }];
    const c = await render(h(Filter, { fields, showChips: true, value: { estado: 'pending', desde: '2026-03-01' } }));
    assert.ok(texts(c).includes('Estado: Pendiente') && texts(c).includes('Desde 2026-03-01'), 'value controlado y formatChip');
    await act(async () => c.update(h(Filter, { fields, showChips: true, value: { estado: 'paid' } })));
    assert.ok(texts(c).includes('Estado: Pagado') && !texts(c).includes('Desde 2026-03-01'), 'value nuevo desde fuera');
    const out = [];
    const ac = await render(h(Filter, { fields: [{ name: 'cliente', type: 'autocomplete', label: 'Cliente', options: [{ label: 'Ana', value: 7 }] }], onChange: v => out.push(v) }));
    await act(async () => ac.root.findAll(n => n.type === SearchInput)[0].props.onChange({ label: 'Ana', value: 7 }));
    assert.deepEqual(out[0], { cliente: 7 }, 'autocomplete: el value de la opción');
    ok('mode="apply" con onApply; ref clear/apply/getValues; value controlado; formatChip; autocomplete');
  }

  // ---- con ListStore: dos Filter (búsqueda en la pantalla, el resto en un "modal") sin pisarse, chips del store
  {
    const reqs = [];
    const store = new ListStore({ fetch: async ({ params }) => { reqs.push(params); return [] } });
    const t = await render(h(RN.View, null,
      h(Filter, { fields: [{ name: 'q', placeholder: 'Buscar…' }], store, debounce: 0 }),
      h(FilterChips, { fields: FIELDS, store, showClearAll: true })));
    await typeIn(t, 'ana');
    assert.deepEqual(store.params, { q: 'ana' });
    // El "modal": otro Filter con otros campos sobre el mismo store; al montarse toma lo que ya hay
    let modal = await render(h(Filter, { fields: [ESTADO], store }));
    await select(modal, 'paid');
    assert.deepEqual(store.params, { q: 'ana', estado: 'paid' }, 'cada uno escribe lo suyo');
    await act(async () => modal.unmount());
    modal = await render(h(Filter, { fields: [ESTADO], store }));
    assert.equal(modal.root.findAll(n => n.type === Select)[0].props.defaultValue, 'paid', 'al volver a abrirlo tiene lo que había');
    assert.ok(texts(t).includes('Estado: Pagado') && texts(t).includes('“ana”'), 'FilterChips con los params del store');
    await pressLabel(t, '× Estado');
    assert.deepEqual(store.params, { q: 'ana' }, 'la × del chip lo quita del store');
    assert.equal(modal.root.findAll(n => n.type === Select)[0].props.defaultValue, null, 'y el Filter del modal se entera');
    await select(modal, 'pending');
    const all = t.root.findAll(n => typeof n.type === 'string' && /(Limpiar|Clear) filt/.test(n.props.accessibilityLabel ?? ''))[0];
    await act(async () => all.props.onPress());
    assert.deepEqual(store.params, {}, 'chip "Limpiar filtros": todos');
    ok('ListStore: dos Filter sobre el mismo store, cada uno lo suyo; al reabrir toma lo que hay; FilterChips del store');
  }

  // ---- filterData (Table) y filterCount
  {
    const rows = [
      { id: 1, cliente: 'Ana García', estado: 'paid', urgente: true, fecha: '2026-01-10', total: 10 },
      { id: 2, cliente: 'Luis Pérez', estado: 'pending', urgente: false, fecha: '2026-02-01', total: 50 },
      { id: 3, cliente: 'Lucía Gil', estado: 'paid', urgente: false, fecha: '2026-03-15', total: 90 },
    ];
    const F = [
      { name: 'q', searchIn: ['cliente', 'id'] }, ESTADO, { name: 'urgente', type: 'switch' },
      { name: 'desde', type: 'date', searchIn: ['fecha'] }, { name: 'hasta', type: 'date', searchIn: ['fecha'], compare: 'to' },
      { name: 'rango', type: 'dateRange', searchIn: ['fecha'] }, { name: 'caro', type: 'checkbox', match: r => r.total > 40 },
    ];
    const ids = v => filterData(rows, v, F).map(r => r.id);
    assert.deepEqual(ids({}), [1, 2, 3], 'sin filtros: todas');
    assert.deepEqual(ids({ q: 'lucia' }), [3], 'texto sin acentos ni mayúsculas');
    assert.deepEqual(ids({ q: '2' }), [2], 'texto en varios campos (searchIn)');
    assert.deepEqual(ids({ estado: 'paid' }), [1, 3]);
    assert.deepEqual(ids({ urgente: true }), [1]); assert.deepEqual(ids({ urgente: false }), [1, 2, 3], 'switch apagado: no filtra');
    assert.deepEqual(ids({ desde: '2026-02-01' }), [2, 3]); assert.deepEqual(ids({ hasta: '2026-02-01T10:00:00' }), [1, 2]);
    assert.deepEqual(ids({ rango: { start: '2026-01-15', end: '2026-03-01' } }), [2]);
    assert.deepEqual(ids({ caro: true, estado: 'paid' }), [3], 'match propio + varios a la vez');
    assert.equal(filterCount(F, { q: 'x', estado: null, urgente: false, caro: true }), 2);
    assert.deepEqual(cleanFilters(F, { q: '', estado: 'paid', urgente: false }), { estado: 'paid' });
    ok('filterData (texto, searchIn, select, switch, desde/hasta, rango, match) y filterCount / cleanFilters');
  }

  // ---- fields inline (array nuevo en cada render): el debounce no se pierde; campos añadidos después
  {
    const calls = [];
    const el = extra => h(Filter, { fields: [{ name: 'q' }, ...extra], debounce: 60, onChange: v => calls.push(v) });
    const t = await render(el([]));
    await typeIn(t, 'abc');
    // El padre se re-renderiza (llegan datos...) mientras se espera el debounce: antes se cancelaba
    await act(async () => t.update(el([])));
    await act(async () => t.update(el([])));
    await wait(90);
    assert.deepEqual(calls, [{ q: 'abc' }], 're-renders del padre durante el debounce: el filtro se aplica igual');
    await act(async () => t.update(el([ESTADO])));
    await select(t, 'paid');
    assert.deepEqual(calls[calls.length - 1], { q: 'abc', estado: 'paid' }, 'un campo añadido después entra en el formulario');
    ok('fields inline: los re-renders no pierden el debounce; campos añadidos después funcionan');
  }
})().catch(e => { console.error('FALLO', e); process.exit(1) });
