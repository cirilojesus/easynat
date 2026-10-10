// Pruebas del DatePicker: calendario alineado, límites por día, selección, rango, listas y props
const assert = require('assert');
const { React, h, TR, act, RN, lib, wait, mountSiblings, layout, env } = require('./harness');
const { DatePicker } = lib('DatePicker');
const ok = msg => console.log('OK ' + msg);
const root = () => env.siblingRoot.root;
const btnTexto = txt => root().findAll(n => n.type === 'Pressable' && n.props.onPress && n.findAll(x => x.type === 'Text' && x.children?.length === 1 && x.children[0] === txt).length)[0];
const filas = () => root().findAll(n => n.type === 'View' && n.parent && n.findAll(x => x.type === 'Pressable').length && [].concat(n.props.style || []).flat(9).some(s => s && s.flexDirection === 'row')).filter(r => r.children.length === 7);
const textoDe = n => n.findAll(x => x.type === 'Text').flatMap(x => x.children).join('');
const abrir = async t => { await act(async () => t.root.findAll(n => n.type === 'Pressable' && n.props.onPress)[0].props.onPress()); await wait(30); await layout(); await wait(250); };
const hecho = async () => { await act(async () => btnTexto(root().findAll(n => n.type === 'Text' && /^(Done|Hecho|Listo|Aceptar)$/.test(n.children.join('')))[0].children.join('')).props.onPress()); await wait(300); };

(async () => {
  await mountSiblings();

  // ---- "AAAA-MM-DD" es una fecha local (antes se tomaba como UTC: al oeste de Greenwich salía el día anterior)
  {
    let res, t;
    await act(async () => { t = TR.create(h(DatePicker, { value: '2026-03-01', locale: 'es', onChange: r => (res = r) })) });
    assert.ok(t.root.findAll(n => n.type === 'Text' && n.children.join('').includes('01/03/2026')).length, 'muestra el 1 de marzo, no el 28 de febrero');
    await act(async () => t.unmount());
    ok('value "AAAA-MM-DD" se interpreta en la zona horaria local');
  }

  // ---- Alineación: marzo de 2026 empieza en domingo
  for (const [locale, firstDayOfWeek, huecos] of [['es', undefined, 6], ['en-US', undefined, 0], ['es', 0, 0], ['en-US', 1, 6]]) {
    let t; await act(async () => { t = TR.create(h(DatePicker, { value: '2026-03-15T12:00:00', locale, firstDayOfWeek })) });
    await abrir(t);
    const primera = filas()[0];
    const vacias = primera.children.filter(c => !c.findAll(x => x.type === 'Pressable').length).length;
    assert.equal(vacias, huecos, `${locale} firstDayOfWeek=${firstDayOfWeek}: ${huecos} huecos antes del 1`);
    await act(async () => t.unmount()); await wait(300);
  }
  ok('calendario: el día 1 en la columna de su día de la semana (lunes en es, domingo en en-US, firstDayOfWeek)');

  // ---- minValue="today": hoy se puede elegir, ayer no
  {
    const hoy = new Date(); let t;
    await act(async () => { t = TR.create(h(DatePicker, { minValue: 'today', locale: 'es' })) });
    await abrir(t);
    const dia = n => btnTexto(String(n));
    assert.ok(!dia(hoy.getDate()).props.disabled, 'hoy habilitado con minValue="today"');
    if (hoy.getDate() > 1) assert.ok(dia(hoy.getDate() - 1).props.disabled, 'ayer deshabilitado');
    await act(async () => t.unmount()); await wait(300);
    ok('minValue="today": el día de hoy se puede elegir (antes salía deshabilitado)');
  }

  // ---- Elegir y confirmar; unSelect; el botón no recibe props internas
  {
    let res; let t;
    await act(async () => { t = TR.create(h(DatePicker, { value: '2026-03-15', locale: 'es', unSelect: true, onChange: r => (res = r), _months: { config: 'short' } })) });
    const boton = t.root.findAll(n => n.type === 'Pressable' && n.props.onPress)[0];
    assert.ok(boton.props.value === undefined && boton.props.onChange === undefined && boton.props._months === undefined, 'props del DatePicker no llegan al botón');
    await abrir(t);
    await act(async () => btnTexto('20').props.onPress());
    await hecho();
    assert.deepEqual([res.year, res.month, res.day], [2026, 2, 20]);
    assert.ok(res.format.includes('20') && res.iso, 'onChange con format e iso');
    await abrir(t);
    await act(async () => btnTexto('20').props.onPress()); await hecho();
    assert.equal(res, null, 'unSelect: pulsar el elegido lo quita');
    await act(async () => t.unmount()); await wait(300);
    ok('elegir + Done (onChange con format e iso), unSelect y props limpias en el botón');
  }

  // ---- Rango: inicio, fin y días intermedios
  {
    let res; let t;
    await act(async () => { t = TR.create(h(DatePicker, { type: 'date-range', value: '2026-03-01', locale: 'es', onChange: r => (res = r) })) });
    await abrir(t);
    await act(async () => btnTexto('10').props.onPress());
    await act(async () => btnTexto('5').props.onPress());
    const estilo = n => [].concat(btnTexto(n).props.style({ pressed: false })).flat(9).filter(Boolean).reduce((o, x) => ({ ...o, ...x }), {});
    assert.ok(estilo('5').backgroundColor && estilo('10').backgroundColor, 'inicio y fin rellenos');
    assert.ok(!estilo('7').backgroundColor && estilo('7').borderColor && estilo('7').borderColor !== 'transparent', 'días intermedios con borde');
    assert.equal(estilo('12').borderColor, 'transparent', 'fuera del rango sin borde');
    await hecho();
    assert.deepEqual([res.start.day, res.end.day], [5, 10], 'se ordena: el anterior pasa a inicio');
    await act(async () => t.unmount()); await wait(300);
    ok('date-range: inicio/fin ordenados y días intermedios marcados');
  }

  // ---- Listas: día de la semana marcado, mes-año sin año 0
  {
    let res; let t;
    await act(async () => { t = TR.create(h(DatePicker, { type: 'weekday', value: { weekday: 3 }, locale: 'es', onChange: r => (res = r) })) });
    await abrir(t);
    const marcado = root().findAll(n => n.type === 'Pressable' && n.props.onPress).find(p => {
      if (typeof p.props.style !== 'function') return false;
      const s = [].concat(p.props.style({ pressed: false })).flat(9).filter(Boolean).reduce((o, x) => ({ ...o, ...x }), {});
      return s.backgroundColor && p.findAll(x => x.type === 'Text').length && /mi[eé]rcoles/i.test(textoDe(p));
    });
    assert.ok(marcado, 'el miércoles (weekday 3) aparece marcado');
    await act(async () => btnTexto(textoDe(root().findAll(n => n.type === 'Pressable' && n.props.onPress).find(p => /viernes/i.test(textoDe(p))))).props.onPress());
    await hecho();
    assert.equal(res.weekday, 5, 'elegir viernes → weekday 5');
    await act(async () => t.unmount()); await wait(300);

    await act(async () => { t = TR.create(h(DatePicker, { type: 'month-year', locale: 'es', onChange: r => (res = r) })) });
    await abrir(t);
    const mes = root().findAll(n => n.type === 'Pressable' && n.props.onPress).find(p => /^junio$/i.test(textoDe(p)));
    await act(async () => mes.props.onPress()); await hecho();
    assert.deepEqual([res.year, res.month], [new Date().getFullYear(), 5], 'mes sin año elegido: usa el año actual (antes año 0)');
    await act(async () => t.unmount()); await wait(300);
    ok('listas: weekday marcado y elegido; month-year sin año 0');
  }
  // ---- Label flotante: sube al elegir una fecha (no solo con value)
  {
    let t;
    await act(async () => { t = TR.create(h(DatePicker, { label: 'Fecha', isFloat: true, locale: 'es' })) });
    const y = () => t.root.findAll(n => n.type === 'Text').map(n => [].concat(n.props.style).flat(9).filter(Boolean).flatMap(s => s.transform || []).find(x => x.translateY)).find(Boolean).translateY.v;
    await wait(150); assert.equal(y(), 20, 'sin valor: abajo (dentro del campo)');
    await abrir(t); await act(async () => btnTexto('10').props.onPress()); await hecho(); await wait(150);
    assert.equal(y(), 1, 'al elegir una fecha sube');
    await act(async () => t.unmount()); await wait(300);
    await act(async () => { t = TR.create(h(DatePicker, { label: 'Fecha', isFloat: true, value: '2026-01-01' })) }); await wait(150);
    assert.equal(y(), 1, 'con value inicial empieza arriba');
    await act(async () => t.unmount()); await wait(300);
    ok('label flotante (componente Label): sube al elegir y con value inicial');
  }

  // ---- Años infinitos: la lista crece por arriba y por abajo
  {
    let t;
    await act(async () => { t = TR.create(h(DatePicker, { type: 'year', value: '1990-01-01' })) });
    await abrir(t);
    const lista = () => root().findAll(n => n.type === 'FlatList')[0];
    const anios = () => root().findAll(n => n.type === 'Pressable' && n.props.onPress).map(textoDe).filter(x => /^\d+$/.test(x)).map(Number);
    const [a0, a1] = [Math.min(...anios()), Math.max(...anios())];
    assert.ok(a0 <= 1930 && a1 >= 2050, 'rango inicial alrededor del valor');
    const fl = root().findAll(n => n.props && n.props.onStartReached && n.props.maintainVisibleContentPosition)[0];
    await act(async () => fl.props.onStartReached()); await act(async () => fl.props.onEndReached());
    assert.ok(Math.min(...anios()) < a0 && Math.max(...anios()) > a1, 'al llegar a los extremos añade años arriba y abajo');
    await act(async () => t.unmount()); await wait(300);
    ok('años infinitos: crecen por los dos extremos (sin saltos: maintainVisibleContentPosition)');
  }

  // ---- Límites en cada tipo
  {
    const deshab = txt => { const b = root().findAll(n => n.type === 'Pressable' && n.props.onPress).find(p => textoDe(p) === txt); assert.ok(b, 'opción ' + txt); return !!b.props.disabled; };
    let t;
    // time: de 08:30 a 18:00
    await act(async () => { t = TR.create(h(DatePicker, { type: 'time', minValue: { hour: 8, minute: 30 }, maxValue: { hour: 18 }, value: { hour: 8, minute: 45 } })) });
    await abrir(t);
    assert.deepEqual([deshab('07'), deshab('08'), deshab('18'), deshab('19')], [true, false, false, true], 'time: horas fuera del rango');
    const minutos = root().findAll(n => n.type === 'FlatList')[1];
    const minDeshab = txt => !!minutos.findAll(n => n.type === 'Pressable' && n.props.onPress).find(p => textoDe(p) === txt).props.disabled;
    assert.deepEqual([minDeshab('15'), minDeshab('30')], [true, false], 'time: a las 08, minutos antes de :30 deshabilitados');
    await act(async () => t.unmount()); await wait(300);
    // year: 2000-2010
    await act(async () => { t = TR.create(h(DatePicker, { type: 'year', minValue: { year: 2000 }, maxValue: { year: 2010 }, value: '2005-01-01' })) });
    await abrir(t);
    assert.deepEqual([deshab('1999'), deshab('2000'), deshab('2010'), deshab('2011')], [true, false, false, true], 'year');
    await act(async () => t.unmount()); await wait(300);
    // month: de marzo a junio
    await act(async () => { t = TR.create(h(DatePicker, { type: 'month', locale: 'es', minValue: { month: 2 }, maxValue: { month: 5 } })) });
    await abrir(t);
    assert.deepEqual([deshab('febrero'), deshab('marzo'), deshab('junio'), deshab('julio')], [true, false, false, true], 'month');
    await act(async () => t.unmount()); await wait(300);
    // weekday: de lunes a viernes
    await act(async () => { t = TR.create(h(DatePicker, { type: 'weekday', locale: 'es', minValue: { weekday: 1 }, maxValue: { weekday: 5 } })) });
    await abrir(t);
    assert.deepEqual([deshab('domingo'), deshab('lunes'), deshab('viernes'), deshab('sábado')], [true, false, false, true], 'weekday');
    await act(async () => t.unmount()); await wait(300);
    // month-year: de 2020-03 a 2021-02
    await act(async () => { t = TR.create(h(DatePicker, { type: 'month-year', locale: 'es', minValue: '2020-03-01', maxValue: '2021-02-01', value: '2020-06-01' })) });
    await abrir(t);
    assert.deepEqual([deshab('2019'), deshab('2020'), deshab('2021'), deshab('2022')], [true, false, false, true], 'month-year: años');
    assert.deepEqual([deshab('febrero'), deshab('marzo')], [true, false], 'month-year: en 2020, antes de marzo deshabilitado');
    await act(async () => t.unmount()); await wait(300);
    ok('minValue / maxValue en time (hora y minuto), year, month, weekday y month-year');
  }

  // ---- Calendario: menús de año y mes, flechas que cruzan de año y respetan límites
  {
    let t;
    await act(async () => { t = TR.create(h(DatePicker, { locale: 'es', value: '2026-01-15', minValue: '2025-12-10', maxValue: '2027-02-20' })) });
    await abrir(t);
    const textos = () => root().findAll(n => n.type === 'Text').map(n => n.children.join(''));
    const flecha = i => root().findAll(n => n.type === 'Pressable' && n.props.onPress && n.findAll(x => x.type === 'Icon' && /^arrow-/.test(x.props.name)).length)[i];
    // 0: año ←, 1: año →, 2: mes ←, 3: mes →
    await act(async () => flecha(2).props.onPress());
    assert.ok(textos().includes('2025') && textos().includes('diciembre'), 'mes ← en enero pasa a diciembre del año anterior');
    assert.ok(flecha(2).props.disabled, 'no deja ir antes del mínimo (diciembre de 2025)');
    assert.ok(flecha(0).props.disabled, 'ni al año 2024');
    // Menú del año: abre la lista y elegir 2027 navega
    const triggerAnio = root().findAll(n => n.type === 'Pressable' && n.props.onPress).find(p => textoDe(p) === '2025');
    await act(async () => triggerAnio.props.onPress()); await wait(20);
    await act(async () => root().findAll(n => n.type === 'AnimatedView' && n.props.onLayout).forEach(n => n.props.onLayout({ nativeEvent: { layout: { width: 120, height: 280 } } }))); await wait(250);
    const opcion = txt => root().findAll(n => n.type === 'Pressable' && n.props.onPress).find(p => textoDe(p) === txt);
    assert.ok(opcion('2024').props.disabled && !opcion('2027').props.disabled && opcion('2028').props.disabled, 'menú de años con límites');
    await act(async () => opcion('2027').props.onPress()); await wait(250);
    assert.ok(textos().includes('2027'), 'elegir en el menú navega al año');
    await act(async () => t.unmount()); await wait(300);
    ok('calendario: menú de años con límites, mes que cruza de año y flechas limitadas');
  }

  // ---- datetime: horas fuera del límite deshabilitadas y el día elegido se ajusta al mínimo
  {
    let res, t;
    await act(async () => { t = TR.create(h(DatePicker, { type: 'datetime', locale: 'es', minValue: new Date(2026, 2, 10, 9, 30), value: new Date(2026, 2, 12, 7, 0), onChange: r => (res = r) })) });
    await abrir(t);
    await act(async () => btnTexto('10').props.onPress());
    await hecho();
    assert.deepEqual([res.day, res.hour, res.minute], [10, 9, 30], 'el 10 con hora 07:00 se ajusta al mínimo 09:30');
    await act(async () => t.unmount()); await wait(300);
    ok('datetime: al elegir el día del mínimo, la hora se ajusta al límite');
  }
  // ---- month-year sin valor y con hoy fuera de los límites: nada marcado, se abre en el límite y los meses se pueden elegir
  {
    let res, t;
    await act(async () => { t = TR.create(h(DatePicker, { type: 'month-year', locale: 'es', minValue: '2020-03-01', maxValue: '2021-02-01', onChange: r => (res = r) })) });
    await abrir(t);
    const botones = () => root().findAll(n => n.type === 'Pressable' && n.props.onPress && typeof n.props.style === 'function');
    const relleno = p => [].concat(p.props.style({ pressed: false })).flat(9).filter(Boolean).reduce((o, x) => ({ ...o, ...x }), {}).backgroundColor;
    const marcados = botones().filter(p => relleno(p) && /^(\d{4}|[a-z]+)$/.test(textoDe(p)) && !/^(Cancel|Done)$/.test(textoDe(p)));
    assert.equal(marcados.length, 0, 'sin valor no hay ningún año ni mes marcado (antes salía el año actual)');
    const op = txt => botones().find(p => textoDe(p) === txt);
    assert.ok(!op('enero').props.disabled && !op('febrero').props.disabled && op('marzo').props.disabled, 'meses del año del límite (2021): enero y febrero se pueden elegir');
    await act(async () => op('2020').props.onPress());
    await hecho();
    assert.deepEqual([res.year, res.month], [2020, 2], 'elegir 2020 sin mes: se ajusta a marzo (el mínimo), no enero');
    await act(async () => t.unmount()); await wait(300);
    ok('month-year: sin valor no marca nada, abre en el límite y ajusta el mes al rango');
  }
  // ---- Idioma: minutos con los dígitos del idioma, medianoche "00" (no "24") y separador en cualquier idioma
  {
    let res, t;
    await act(async () => { t = TR.create(h(DatePicker, { type: 'time', locale: 'ar-EG', value: { hour: 0, minute: 5 } })) });
    await abrir(t);
    const textos = () => root().findAll(n => n.type === 'Pressable' && n.props.onPress).map(textoDe);
    assert.ok(textos().includes('٠٥') && !textos().some(x => /0[٠-٩]/.test(x)), 'minutos en árabe: "٠٥" (antes "0٥", con un 0 latino)');
    const horas = root().findAll(n => n.type === 'FlatList')[0].findAll(n => n.type === 'Pressable' && n.props.onPress).map(textoDe);
    assert.ok(horas[0] === '٠٠' && !horas.includes('٢٤'), 'medianoche "٠٠", no "٢٤"');
    await act(async () => t.unmount()); await wait(300);

    const fmt = async (props) => { let tt; await act(async () => { tt = TR.create(h(DatePicker, props)) }); const txt = tt.root.findAll(n => n.type === 'Text').map(n => n.children.join('')).find(x => /\d/.test(x)); await act(async () => tt.unmount()); return txt; };
    assert.equal(await fmt({ locale: 'de', value: '2026-03-15' }), '15.03.2026', 'sin separate: tal cual el idioma (alemán)');
    assert.equal(await fmt({ locale: 'de', value: '2026-03-15', separate: '-' }), '15-03-2026', 'alemán con "-"');
    assert.equal(await fmt({ locale: 'ru', value: '2026-03-15', separate: '/' }), '15/03/2026', 'ruso con "/"');
    assert.equal(await fmt({ locale: 'ko', value: '2026-03-15', separate: '-' }), '2026-03-15', 'coreano (2026. 03. 15.) con "-", sin el punto final');
    assert.equal(await fmt({ locale: 'de', value: '2026-03-15', separate: false }), '15.03.2026', 'separate={false}: el del idioma');
    assert.equal(await fmt({ locale: 'es', value: '2026-03-15', config: { month: 'long' } }), '15 de marzo de 2026', 'mes en texto: no se toca');
    assert.equal(await fmt({ type: 'datetime', locale: 'es', value: new Date(2026, 2, 15, 0, 30), separate: '-' }), '15-03-2026, 00:30', 'datetime: separador en la fecha, la hora intacta y medianoche 00');
    ok('idioma: minutos con dígitos del idioma, medianoche 00, separador en es/de/ru/ko, false y mes en texto');
  }
  // ---- Horas en 24 h como números (ja: "08", no "08時"); en 12 h, con la marca de mañana / tarde
  {
    let t;
    const horas = () => root().findAll(n => n.type === 'FlatList')[0].findAll(n => n.type === 'Pressable' && n.props.onPress).map(textoDe);
    const minutos = () => root().findAll(n => n.type === 'FlatList')[1].findAll(n => n.type === 'Pressable' && n.props.onPress).map(textoDe);
    for (const [locale, h8, m5] of [['ja', '8時', '05分'], ['ko', '8시', '05분'], ['es', '08', '05'], ['zh-CN', '08', '05']]) {
      await act(async () => { t = TR.create(h(DatePicker, { type: 'time', locale, value: { hour: 8, minute: 5 } })) });
      await abrir(t);
      assert.ok(horas().includes(h8) && minutos().includes(m5), locale + ': hora ' + h8 + ' y minuto ' + m5 + ' (' + horas()[8] + ' / ' + minutos()[5] + ')');
      await act(async () => t.unmount()); await wait(300);
    }
    await act(async () => { t = TR.create(h(DatePicker, { type: 'time', locale: 'ja', value: { hour: 8, minute: 5 }, _time: { config: { hourCycle: 'h12', hour: 'numeric', minute: '2-digit' } } })) });
    await abrir(t);
    assert.ok(horas().includes('午前8時'), 'ja 12 h: con la marca de mañana');
    await act(async () => t.unmount()); await wait(300);
    ok('horas y minutos con las unidades del idioma (ja 時/分, ko 시/분) o números (es, zh); en 12 h el formato del idioma');
  }

  // ---- _value: el valor en otro idioma / formato que el resto del picker
  {
    let res, t;
    await act(async () => { t = TR.create(h(DatePicker, { locale: 'en-US', value: '2026-03-15', _value: { locale: 'es', config: { month: 'long' } }, onChange: r => (res = r) })) });
    assert.ok(t.root.findAll(n => n.type === 'Text').some(n => n.children.join('') === '15 de marzo de 2026'), 'texto del campo en español');
    await abrir(t);
    assert.ok(root().findAll(n => n.type === 'Text').some(n => n.children.join('') === 'March'), 'el picker sigue en inglés');
    await act(async () => btnTexto('20').props.onPress()); await hecho();
    assert.equal(res.format, '20 de marzo de 2026', 'onChange.format con _value');
    await act(async () => t.unmount()); await wait(300);
    ok('_value: locale y config propios para el valor (texto y onChange), el picker en su idioma');
  }
  // ---- Rango: "Hecho" deshabilitado mientras solo haya inicio
  {
    let res, t;
    await act(async () => { t = TR.create(h(DatePicker, { type: 'date-range', locale: 'es', value: { start: '2026-03-01', end: '2026-03-05' }, onChange: r => (res = r) })) });
    await act(async () => t.root.findAll(n => n.type === 'Pressable' && n.props.onPress)[0].props.onPress()); await wait(30); await layout(); await wait(250);
    const done = () => root().findAll(n => n.type === 'Pressable' && n.props.onPress && /^(Done|Hecho)$/.test(textoDe(n)))[0];
    assert.ok(!done().props.disabled, 'con un rango completo se puede confirmar');
    // Uno nuevo vacío: al elegir solo el inicio, no se puede confirmar
    await act(async () => t.unmount()); await wait(300);
    await act(async () => { t = TR.create(h(DatePicker, { type: 'date-range', locale: 'es', onChange: r => (res = r) })) });
    await act(async () => t.root.findAll(n => n.type === 'Pressable' && n.props.onPress)[0].props.onPress()); await wait(30); await layout(); await wait(250);
    assert.ok(!done().props.disabled, 'sin nada elegido se puede (deja el campo vacío)');
    await act(async () => btnTexto('10').props.onPress());
    assert.ok(done().props.disabled, 'solo el inicio: Hecho deshabilitado');
    await act(async () => btnTexto('10').props.onPress());
    assert.ok(!done().props.disabled, 'la misma fecha otra vez: rango de un día, ya se puede');
    await act(async () => done().props.onPress()); await wait(300);
    assert.equal(res.start.day, res.end.day, 'rango de un día');
    await act(async () => t.unmount()); await wait(300);
    ok('date-range: no se confirma con solo el inicio; rango de un día tocando la misma fecha');
  }
  // ---- clearable: botón Limpiar (no aparece por defecto)
  {
    let res = 'sin llamar', t;
    const limpiar = () => root().findAll(n => n.type === 'Pressable' && n.props.onPress && /^(Clear|Limpiar)$/.test(textoDe(n)))[0];
    await act(async () => { t = TR.create(h(DatePicker, { locale: 'es', value: '2026-03-15' })) });
    await abrir(t);
    assert.equal(limpiar(), undefined, 'por defecto no aparece');
    await act(async () => t.unmount()); await wait(300);

    await act(async () => { t = TR.create(h(DatePicker, { locale: 'es', value: '2026-03-15', clearable: true, placeholder: 'Sin fecha', onChange: r => (res = r) })) });
    await abrir(t);
    await act(async () => limpiar().props.onPress()); await wait(300);
    assert.equal(res, null, 'onChange(null)');
    assert.ok(t.root.findAll(n => n.type === 'Text').some(n => n.children.join('') === 'Sin fecha'), 'el campo vuelve al placeholder');
    await abrir(t);
    assert.ok(limpiar().props.disabled, 'sin fecha no hay nada que limpiar');
    await act(async () => t.unmount()); await wait(300);

    await act(async () => { t = TR.create(h(DatePicker, { type: 'date-range', locale: 'es', value: { start: '2026-03-01', end: '2026-03-05' }, clearable: true, onChange: r => (res = r) })) });
    await abrir(t);
    await act(async () => limpiar().props.onPress()); await wait(300);
    assert.deepEqual(res, { start: null, end: null }, 'rango: onChange con start y end a null');
    await act(async () => t.unmount()); await wait(300);
    ok('clearable: oculto por defecto; borra (onChange null / rango vacío), vuelve al placeholder y se deshabilita sin fecha');
  }
  // ---- disabledDates: lista (fechas y patrones) y función
  {
    let t;
    const dia = n => !!btnTexto(String(n)).props.disabled;
    // Marzo de 2026: el 1 es domingo
    await act(async () => { t = TR.create(h(DatePicker, { locale: 'es', value: '2026-03-10', disabledDates: ['2026-03-12', new Date(2026, 2, 20), { weekday: 0 }, { month: 2, day: 25 }, { hour: 13 }] })) });
    await abrir(t);
    assert.deepEqual([dia(12), dia(20), dia(25)], [true, true, true], 'fechas concretas y { month, day }');
    assert.deepEqual([dia(1), dia(8), dia(15)], [true, true, true], '{ weekday: 0 }: todos los domingos');
    assert.deepEqual([dia(10), dia(11), dia(13)], [false, false, false], 'el resto se puede elegir; { hour: 13 } no bloquea días');
    await act(async () => t.unmount()); await wait(300);

    // time: horas y minutos
    await act(async () => { t = TR.create(h(DatePicker, { type: 'time', value: { hour: 9, minute: 0 }, disabledDates: [{ hour: 13 }, { hour: 9, minute: 30 }] })) });
    await abrir(t);
    const enLista = (i, txt) => !!root().findAll(n => n.type === 'FlatList')[i].findAll(n => n.type === 'Pressable' && n.props.onPress).find(p => textoDe(p) === txt).props.disabled;
    assert.deepEqual([enLista(0, '13'), enLista(0, '09'), enLista(1, '30'), enLista(1, '15')], [true, false, true, false], 'time: hora 13 y 09:30 bloqueadas');
    await act(async () => t.unmount()); await wait(300);

    // weekday, year y month
    await act(async () => { t = TR.create(h(DatePicker, { type: 'weekday', locale: 'es', disabledDates: [{ weekday: 0 }, { weekday: 6 }] })) });
    await abrir(t);
    const op = txt => !!root().findAll(n => n.type === 'Pressable' && n.props.onPress).find(p => textoDe(p) === txt).props.disabled;
    assert.deepEqual([op('domingo'), op('sábado'), op('lunes')], [true, true, false], 'weekday');
    await act(async () => t.unmount()); await wait(300);
    await act(async () => { t = TR.create(h(DatePicker, { type: 'month-year', locale: 'es', value: '2026-06-01', disabledDates: [{ year: 2025 }, { month: 7 }] })) });
    await abrir(t);
    assert.deepEqual([op('2025'), op('2026'), op('agosto'), op('julio')], [true, false, true, false], 'month-year: año 2025 y agosto');
    await act(async () => t.unmount()); await wait(300);

    // datetime: { weekday, hour } bloquea esa hora solo ese día de la semana
    await act(async () => { t = TR.create(h(DatePicker, { type: 'datetime', locale: 'es', value: new Date(2026, 2, 14, 10, 0), disabledDates: [{ weekday: 6, hour: 8 }] })) });
    await abrir(t);
    const triggerHora = () => root().findAll(n => n.type === 'Pressable' && n.props.onPress).filter(p => textoDe(p) === '10').at(-1); // el día 10 también dice "10"
    await act(async () => triggerHora().props.onPress()); await wait(20);
    await act(async () => root().findAll(n => n.type === 'AnimatedView' && n.props.onLayout).forEach(n => n.props.onLayout({ nativeEvent: { layout: { width: 120, height: 280 } } }))); await wait(250);
    const horaMenu = txt => root().findAll(n => n.type === 'Pressable' && n.props.onPress).filter(p => textoDe(p) === txt).map(p => !!p.props.disabled);
    assert.ok(horaMenu('08').includes(true) && horaMenu('09').every(x => !x), 'sábado 14: las 08 bloqueadas, las 09 no');
    await act(async () => t.unmount()); await wait(300);

    // Función: deshabilita fines de semana y la hora 0
    await act(async () => { t = TR.create(h(DatePicker, { locale: 'es', value: '2026-03-10', disabledDates: (d, unit) => unit === 'day' && (d.getDay() === 0 || d.getDay() === 6) })) });
    await abrir(t);
    assert.deepEqual([dia(7), dia(8), dia(9)], [true, true, false], 'función: sábado 7 y domingo 8 bloqueados, lunes 9 no');
    await act(async () => t.unmount()); await wait(300);
    ok('disabledDates: fechas, patrones (weekday, month+day, hour, hour+minute, year, weekday+hour) y función');
  }
  // ---- datetime + disabledDates: las flechas saltan lo bloqueado y al elegir un día la hora pasa a una permitida
  {
    let res, t;
    await act(async () => { t = TR.create(h(DatePicker, { type: 'datetime', locale: 'es', value: new Date(2026, 2, 10, 3, 0), onChange: r => (res = r),
      disabledDates: (d, unit) => unit === 'hour' && d.getHours() < 8 })) });
    await abrir(t);
    await act(async () => btnTexto('11').props.onPress());
    const flechasHora = () => root().findAll(n => n.type === 'Pressable' && n.props.onPress && n.findAll(x => x.type === 'Icon' && /^(minus|plus)$/.test(x.props.name)).length);
    // [hora -, hora +, minuto -, minuto +]
    assert.ok(flechasHora()[0].props.disabled, 'antes de las 8 no hay horas: la flecha atrás deshabilitada');
    await act(async () => flechasHora()[1].props.onPress());
    await hecho();
    assert.deepEqual([res.day, res.hour], [11, 9], 'al elegir el 11 la hora (03) pasa a las 08, y la flecha + a las 09');
    await act(async () => t.unmount()); await wait(300);
    ok('datetime + disabledDates: hora ajustada a la primera permitida y flechas que saltan lo bloqueado');
  }
})().catch(e => { console.error('FALLO', e); process.exit(1) });
