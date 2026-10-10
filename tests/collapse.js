// Pruebas de Collapse y Accordion
const assert = require('assert');
const { React, h, TR, act, RN, lib, wait } = require('./harness');
const { Collapse } = lib('Collapse');
const { Accordion } = lib('Accordion');
const ok = msg => console.log('OK ' + msg);

// El trigger guarda sus últimas props para inspeccionarlas
const make = (store, key = 't') => props => { store[key] = props; return h(RN.Pressable, { onPress: props.onPress }, h(RN.Text, null, key)); };
const visible = (t, txt) => t.root.findAll(n => n.type === 'Text' && n.children?.includes?.(txt)).length > 0;

(async () => {
  // ---- Collapse no controlado: isOpen inmediato, onChange al momento, onOpen/onClose al terminar
  {
    const s = {}; const ev = []; let t;
    await act(async () => { t = TR.create(h(Collapse, { trigger: make(s), duration: 60, onChange: o => ev.push('change:' + o), onOpen: () => ev.push('open'), onClose: () => ev.push('close') }, h(RN.Text, null, 'Contenido'))) });
    assert.equal(s.t.isOpen, false);
    assert.deepEqual(s.t.accessibilityState, { expanded: false, disabled: false });
    await act(async () => s.t.onPress());
    assert.equal(s.t.isOpen, true, 'isOpen al momento (sin esperar al hilo de UI)');
    assert.deepEqual(ev, ['change:true'], 'onChange al pedirlo; onOpen todavía no');
    await wait(90);
    assert.deepEqual(ev, ['change:true', 'open'], 'onOpen al terminar la animación');
    await act(async () => s.t.onPress()); await wait(90);
    assert.deepEqual(ev.slice(2), ['change:false', 'close']);
    assert.ok(s.t.accessibilityState.expanded === false && s.t.accessibilityRole === 'button');
    ok('Collapse: isOpen inmediato, onChange, onOpen/onClose al terminar y accesibilidad');
  }

  // ---- defaultOpen sin avisos; ref open/close/toggle/isOpen; _open se fusiona con _trigger
  {
    const s = {}; const ev = []; const r = React.createRef(); let t;
    await act(async () => { t = TR.create(h(Collapse, { ref: r, defaultOpen: true, duration: 30, trigger: make(s), onOpen: () => ev.push('open'),
      _trigger: { _text: { color: 'gray', fontSize: 14 } }, _open: { _text: { color: 'primary.100' } } }, h(RN.Text, null, 'C'))) });
    await wait(50);
    assert.ok(s.t.isOpen && r.current.isOpen() && ev.length === 0, 'defaultOpen: abierto sin animar ni avisar');
    assert.deepEqual(s.t._text, { color: 'primary.100', fontSize: 14 }, '_open fusionado con _trigger (no lo reemplaza)');
    await act(async () => r.current.close()); assert.equal(s.t.isOpen, false);
    assert.deepEqual(s.t._text, { color: 'gray', fontSize: 14 });
    await act(async () => r.current.toggle()); assert.equal(r.current.isOpen(), true);
    await act(async () => r.current.open()); assert.equal(r.current.isOpen(), true, 'open sobre abierto no hace nada');
    await act(async () => t.unmount());
    ok('Collapse: defaultOpen, ref (open/close/toggle/isOpen) y _open fusionado');
  }

  // ---- Controlado, lazy y disabled
  {
    const s = {}; const ev = []; let t;
    const props = open => ({ isOpen: open, trigger: make(s), onChange: o => ev.push(o), lazy: true });
    await act(async () => { t = TR.create(h(Collapse, props(false), h(RN.Text, null, 'Pesado'))) });
    assert.ok(!visible(t, 'Pesado'), 'lazy: sin montar mientras no se abre');
    await act(async () => s.t.onPress());
    assert.deepEqual(ev, [true]); assert.equal(s.t.isOpen, false, 'controlado: no se abre solo, avisa con onChange');
    await act(async () => t.update(h(Collapse, props(true), h(RN.Text, null, 'Pesado'))));
    assert.ok(s.t.isOpen && visible(t, 'Pesado'), 'se abre al cambiar isOpen y monta el contenido');
    await act(async () => t.update(h(Collapse, props(false), h(RN.Text, null, 'Pesado'))));
    assert.ok(visible(t, 'Pesado'), 'lazy: tras abrirse una vez sigue montado');
    await act(async () => t.update(h(Collapse, { ...props(false), isOpen: undefined, disabled: true }, h(RN.Text, null, 'Pesado'))));
    await act(async () => s.t.onPress());
    assert.ok(!s.t.isOpen && s.t.disabled && s.t.accessibilityState.disabled, 'disabled: no responde');
    await act(async () => t.unmount());
    ok('Collapse: controlado (isOpen + onChange), lazy y disabled');
  }

  // ---- Accordion: uno a la vez, defaultIndex, allowMultiple, controlado
  {
    const s = {}; const cambios = []; let t;
    const items = () => [0, 1, 2].map(i => h(Accordion.Item, { key: i, trigger: make(s, 'i' + i) }, h(RN.Text, null, 'c' + i)));
    await act(async () => { t = TR.create(h(Accordion, { defaultIndex: 1, onChange: x => cambios.push(x) }, ...items())) });
    assert.deepEqual([s.i0.isOpen, s.i1.isOpen, s.i2.isOpen], [false, true, false], 'defaultIndex');
    await act(async () => s.i2.onPress());
    assert.deepEqual([s.i0.isOpen, s.i1.isOpen, s.i2.isOpen], [false, false, true], 'abrir uno cierra el anterior');
    await act(async () => s.i2.onPress());
    assert.deepEqual([s.i2.isOpen, cambios], [false, [2, -1]], 'cerrar el abierto: ninguno (-1)');
    await act(async () => t.unmount());

    await act(async () => { t = TR.create(h(Accordion, { allowMultiple: true, defaultIndex: [0] }, ...items())) });
    await act(async () => s.i2.onPress());
    assert.deepEqual([s.i0.isOpen, s.i1.isOpen, s.i2.isOpen], [true, false, true], 'allowMultiple: varios abiertos');
    await act(async () => t.unmount());

    const c2 = [];
    await act(async () => { t = TR.create(h(Accordion, { index: 0, onChange: x => c2.push(x) }, ...items())) });
    await act(async () => s.i1.onPress());
    assert.deepEqual([s.i0.isOpen, s.i1.isOpen, c2], [true, false, [1]], 'controlado: decide el padre');
    await act(async () => t.update(h(Accordion, { index: 1, onChange: x => c2.push(x) }, ...items())));
    assert.deepEqual([s.i0.isOpen, s.i1.isOpen], [false, true]);
    await act(async () => t.unmount());
    const showIdx = {};
    await act(async () => { t = TR.create(h(Accordion, { showIndex: 2 }, ...[0, 1, 2].map(i => h(Accordion.Item, { key: i, trigger: make(showIdx, 'i' + i) }, h(RN.Text, null, 'x'))))) });
    assert.equal(showIdx.i2.isOpen, true, 'showIndex (antes no hacía nada) sigue funcionando');
    await act(async () => t.unmount());
    ok('Accordion: uno a la vez, defaultIndex/showIndex, allowMultiple y controlado');
  }
})().catch(e => { console.error('FALLO', e); process.exit(1) });
