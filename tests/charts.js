// Pruebas de los gráficos: escalas, paths, LineChart/AreaChart/Sparkline, barras, pie/donut y ProgressRing
const assert = require('assert');
const { h, TR, act, RN, lib, wait } = require('./harness');
const { Chart, compactNumber } = lib('Chart');
// Un componente por tipo (cacheado: el mismo tipo de elemento entre renders)
const byType = {};
const T = type => (byType[type] ||= p => h(Chart, { type, ...p }));
const C = { LineChart: T('line'), AreaChart: T('area'), Sparkline: T('sparkline'), BarChart: T('bar'), ColumnChart: T('column'),
  HorizontalBarChart: T('horizontalBar'), PieChart: T('pie'), DonutChart: T('donut'), ProgressRing: T('progress') };
const { COLORS_THEME } = lib('theme');
const ok = msg => console.log('OK ' + msg);

const render = async el => { let t; await act(async () => { t = TR.create(el) }); return t };
const all = (t, type) => t.root.findAll(n => n.type === type);
// Las barras (los Rect animados; el del ClipPath no cuenta)
const inClip = n => { for (let q = n.parent; q; q = q.parent) if (q.type === 'ClipPath') return true; return false };
const bars = t => t.root.findAll(n => n.type === 'Rect' && !inClip(n));
// Geometría de un elemento animado (animatedProps) o normal (props)
const geo = n => ({ ...n.props, ...(n.props.animatedProps ? { ...n.props.animatedProps } : null) });
const svgTexts = t => all(t, 'Text').concat(all(t, 'Text')).length && t.root.findAll(n => n.type === 'Text' || n.type === 'SvgText');
const textsOf = (t, type) => all(t, type).map(n => (n.children || []).filter(c => typeof c === 'string').join(''));
const labels = t => textsOf(t, 'Text');
const overlay = t => t.root.findAll(n => n.type === 'View' && (n.props.onResponderGrant || n.props.onResponderRelease)).pop();
const touch = async (t, x, y = 50) => {
  const o = overlay(t); const e = { nativeEvent: { locationX: x, locationY: y, pageX: x, pageY: y } };
  await act(async () => { o.props.onResponderGrant?.(e) });
  await act(async () => { overlay(t).props.onResponderRelease?.(e) });
};
const ev = (x, y) => { const t = { locationX: x, locationY: y, pageX: x, pageY: y }; return { nativeEvent: { ...t, touches: [t] } } };
const shownText = (t, s) => JSON.stringify(t.toJSON()).includes(s);

(async () => {
  // ---- formato compacto y paths dibujados (escala redonda, step, monotone, huecos)
  {
    assert.equal(compactNumber(1500), '1.5k'); assert.equal(compactNumber(2300000), '2.3M'); assert.equal(compactNumber(7.25), '7.25');
    const d = async (curve, data) => geo(all(await render(h(C.LineChart, { width: 300, height: 200, data, curve, showYAxis: false, showXAxis: false })), 'Path')[0]).d;
    assert.ok((await d('step', [1, 2, 3])).includes('H'), 'step: escalones');
    assert.ok((await d('monotone', [1, 5, 3])).includes('C'), 'monotone: curvas');
    assert.ok(/^M[\d.]+,[\d.]+L[\d.]+,[\d.]+$/.test(await d('linear', [1, 2])), 'linear: rectas');
    const ejes = await render(h(C.BarChart, { width: 300, data: [0.1, 0.47] }));
    assert.deepEqual(textsOf(ejes, 'Text').filter(x => /^[\d.]+$/.test(x)), ['0', '0.1', '0.2', '0.3', '0.4', '0.5'], 'marcas redondas, sin errores de coma flotante');
    const neg = await render(h(C.BarChart, { width: 300, data: [-12, 30] }));
    assert.ok(['-20', '-10', '0', '10', '20', '30'].every(v => textsOf(neg, 'Text').includes(v)), 'escala con negativos');
    ok('compactNumber exportado; paths step / monotone / linear y escalas redondas (decimales y negativos)');
  }

  // ---- LineChart: path, ejes, puntos, tooltip y onSelect
  {
    const sel = [];
    const t = await render(h(C.LineChart, { width: 300, height: 200, data: [10, 40, 25, 60], labels: ['Ene', 'Feb', 'Mar', 'Abr'], onSelect: s => sel.push(s) }));
    const paths = all(t, 'Path');
    assert.equal(paths.length, 1);
    assert.ok(/^M[\d.]+,[\d.]+L/.test(geo(paths[0]).d), 'path de la línea');
    assert.equal(all(t, 'Circle').length, 4, 'un punto por valor');
    const tx = textsOf(t, 'Text');
    assert.ok(['10', '30', '60'].every(v => tx.includes(v)) && !tx.includes('0'), 'marcas del eje Y redondas, ajustadas a los valores (la línea no fuerza el 0): ' + tx);
    assert.ok(['Ene', 'Abr'].every(v => tx.includes(v)), 'etiquetas del eje X');
    // Tocar cerca del 3er punto (x≈ 2/3 del ancho)
    await touch(t, 205);
    assert.equal(sel[0].index, 2); assert.equal(sel[0].label, 'Mar'); assert.equal(sel[0].values[0].value, 25);
    assert.ok(shownText(t, '"25"') || labels(t).some(l => l.includes('25')), 'tooltip con el valor');
    assert.ok(labels(t).includes('Mar'), 'tooltip con la etiqueta');
    // Volver a tocar lo mismo: se quita
    await touch(t, 205);
    assert.equal(sel[sel.length - 1], null, 'tocar de nuevo quita la selección');
    // Arrastrar en horizontal va recorriendo los puntos
    await act(async () => overlay(t).props.onResponderGrant(ev(10, 50)));
    await act(async () => overlay(t).props.onResponderMove(ev(15, 52)));
    assert.equal(sel[sel.length - 1], null, 'menos de 8 px: todavía nada');
    await act(async () => overlay(t).props.onResponderMove(ev(110, 55)));
    assert.equal(sel[sel.length - 1].index, 1, 'arrastrando: el punto bajo el dedo');
    assert.equal(overlay(t).props.onResponderTerminationRequest(), false, 'recorriendo: el scroll no le quita el toque');
    await act(async () => overlay(t).props.onResponderRelease(ev(110, 55)));
    assert.equal(sel[sel.length - 1].index, 1, 'al soltar se queda');
    // Un swipe vertical (scroll de la pantalla): no selecciona, y si el scroll se queda el toque, vuelve lo de antes
    const before = sel.length;
    await act(async () => overlay(t).props.onResponderGrant(ev(250, 40)));
    await act(async () => overlay(t).props.onResponderMove(ev(252, 120)));
    assert.equal(overlay(t).props.onResponderTerminationRequest(), true);
    await act(async () => overlay(t).props.onResponderTerminate());
    assert.equal(sel.length, before, 'el scroll no cambia la selección');
    ok('LineChart: path, puntos, ejes redondos, tooltip, onSelect (tocar otra vez lo quita), arrastrar y no seleccionar al hacer scroll');
  }

  // ---- varias series: leyenda, colores del tema, huecos y tooltip con todas
  {
    const t = await render(h(C.LineChart, {
      width: 300, curve: 'monotone',
      series: [{ name: 'Ventas', data: [1, 2, null, 4], color: 'primary.100' }, { name: 'Gastos', data: [2, 1, 3, 2] }],
      labels: ['a', 'b', 'c', 'd'],
    }));
    const paths = all(t, 'Path');
    assert.equal(paths.length, 2);
    assert.equal(paths[0].props.stroke, COLORS_THEME['primary.100'], 'color del tema resuelto');
    assert.equal(geo(paths[0]).d.split('M').length - 1, 2, 'null en una serie: dos tramos');
    assert.ok(labels(t).includes('Ventas') && labels(t).includes('Gastos'), 'leyenda automática con varias series');
    await touch(t, 299);
    assert.ok(labels(t).some(l => l.startsWith('Ventas')) && labels(t).filter(l => l.startsWith('Gastos')).length >= 1, 'tooltip con las dos series');
    ok('series: leyenda, colores del tema, huecos (null) y tooltip con todas las series');
  }

  // ---- AreaChart y Sparkline
  {
    const t = await render(h(C.AreaChart, { width: 300, data: [3, 5, 4] }));
    assert.equal(all(t, 'LinearGradient').length, 1, 'degradado');
    const area = all(t, 'Path')[0];
    assert.ok(geo(area).d.endsWith('Z') && area.props.fill.startsWith('url(#'), 'área cerrada con el degradado');
    assert.ok(textsOf(t, 'Text').includes('0'), 'el área incluye el 0');
    const s = await render(h(C.Sparkline, { width: 100, data: [3, 5, 4, 8] }));
    assert.equal(all(s, 'Text').length, 0, 'sparkline sin ejes'); assert.equal(all(s, 'Circle').length, 0, 'ni puntos');
    assert.equal(overlay(s), undefined, 'ni toques');
    ok('AreaChart (degradado, cerrada, desde 0) y Sparkline (sin ejes, puntos ni toques)');
  }

  // ---- ancho del contenedor (onLayout), vacío, y datos que cambian
  {
    const t = await render(h(C.LineChart, { data: [1, 2, 3] }));
    assert.equal(all(t, 'Svg').length, 0, 'sin medir todavía: nada');
    const v = t.root.findAll(n => n.type === 'View' && n.props.onLayout)[0];
    await act(async () => v.props.onLayout({ nativeEvent: { layout: { width: 320, height: 220 } } }));
    assert.equal(all(t, 'Svg')[0].props.width, 320, 'usa el ancho medido');
    const e = await render(h(C.BarChart, { width: 300, data: [] }));
    assert.ok(labels(e).includes('No data') || labels(e).includes('Sin datos'), 'sin datos: texto');
    const e2 = await render(h(C.PieChart, { width: 300, data: [0, 0], emptyText: 'Nada' }));
    assert.ok(labels(e2).includes('Nada'), 'emptyText');
    ok('ancho por onLayout, vacío con texto por defecto o emptyText');
  }

  // ---- BarChart: positivos y negativos, agrupadas, apiladas, horizontal, selección y valores
  {
    const t = await render(h(C.BarChart, { width: 300, height: 200, data: [{ label: 'A', value: 10, color: 'danger.100' }, { label: 'B', value: -5 }, { label: 'C', value: 20 }], showValues: true }));
    const rects = bars(t);
    assert.equal(rects.length, 3);
    const [a, b] = rects.map(geo);
    assert.ok(b.y >= a.y + a.height - 0.01, 'la negativa empieza en el 0 y va hacia abajo');
    assert.equal(rects[0].props.fill, COLORS_THEME['danger.100'], 'color por barra');
    assert.ok(textsOf(t, 'Text').includes('-5') && textsOf(t, 'Text').includes('20'), 'valores encima');
    await touch(t, 290);
    assert.deepEqual(bars(t).map(r => r.props.opacity), [0.45, 0.45, 1], 'la tocada resalta');

    const g = await render(h(C.BarChart, { width: 300, series: [{ data: [1, 2] }, { data: [3, 4] }], labels: ['x', 'y'] }));
    const gr = bars(g);
    assert.equal(gr.length, 4); assert.ok(gr[0].props.x < gr[1].props.x && gr[1].props.x < gr[2].props.x, 'agrupadas una al lado de otra');
    const st = await render(h(C.BarChart, { width: 300, stacked: true, series: [{ data: [1] }, { data: [3] }], labels: ['x'], showValues: true }));
    const [s1, s2] = bars(st).map(geo);
    assert.equal(s1.x, s2.x, 'apiladas en la misma x'); assert.ok(Math.abs(s2.y + s2.height - s1.y) < 0.01, 'una encima de otra');
    assert.ok(textsOf(st, 'Text').includes('4'), 'apiladas: total encima');

    const hz = await render(h(C.HorizontalBarChart, { width: 300, data: [5, 10], labels: ['Una etiqueta muy pero que muy larga', 'Corta'] }));
    const hr = bars(hz);
    assert.ok(geo(hr[1]).width > geo(hr[0]).width, 'horizontal: crece en ancho');
    assert.ok(textsOf(hz, 'Text').some(l => l.endsWith('…')), 'etiqueta larga recortada');
    assert.ok(all(hz, 'Svg')[0].props.height >= 120, 'alto automático según las categorías');
    const col = await render(h(C.ColumnChart, { width: 300, data: [1, 2], horizontal: true }));
    assert.ok(geo(bars(col)[0]).height > 0, 'ColumnChart siempre vertical');
    ok('BarChart: negativos, color por barra, valores, selección, agrupadas, apiladas, horizontal y ColumnChart');
  }

  // ---- PieChart y DonutChart
  {
    const sel = [];
    const t = await render(h(C.PieChart, { width: 200, size: 200, data: [{ label: 'A', value: 50 }, { label: 'B', value: 30 }, { label: 'C', value: 20 }], onSelect: s => sel.push(s) }));
    assert.equal(all(t, 'Path').length, 3);
    assert.ok(all(t, 'Path').every(p => geo(p).d.startsWith('M100,100')), 'tarta: desde el centro');
    assert.ok(labels(t).includes('A') && labels(t).includes('  50%'), 'leyenda con porcentaje: ' + labels(t));
    assert.ok(!textsOf(t, 'Text').includes('50%'), 'los % de las porciones esperan a la animación');
    await wait(720);
    assert.ok(textsOf(t, 'Text').includes('50%') && textsOf(t, 'Text').includes('20%'), 'y luego aparecen');
    // Tocar a la derecha del centro (la A va de 0 a 180º: arriba → derecha → abajo)
    await touch(t, 170, 100);
    assert.equal(sel[0].label, 'A'); assert.equal(sel[0].percent, 50);
    assert.ok(labels(t).includes('A: '), 'tooltip en la tarta');
    await touch(t, 30, 100);
    assert.equal(sel[1].label, 'B', 'izquierda: la B');

    const d = await render(h(C.DonutChart, { width: 200, data: [{ label: 'A', value: 75 }, { label: 'B', value: 25 }], formatValue: v => `${v} €` }));
    assert.ok(geo(all(d, 'Path')[0]).d.includes('L'), 'donut con hueco');
    assert.ok(labels(d).includes('100 €') && labels(d).includes('Total'), 'centro: el total');
    await touch(d, 185, 100);
    assert.ok(labels(d).includes('75 €') && labels(d).some(l => l.startsWith('A ·')), 'centro: lo seleccionado');
    await touch(d, 100, 100);
    assert.ok(labels(d).includes('100 €'), 'tocar el hueco quita la selección');
    ok('PieChart (porciones, % tras animar, leyenda, toque por ángulo, tooltip) y DonutChart (centro con total o selección)');
  }

  // ---- ProgressRing
  {
    const t = await render(h(C.ProgressRing, { value: 25, size: 100, thickness: 10 }));
    const [, prog] = all(t, 'Path');
    const L = 2 * Math.PI * 45;
    assert.ok(Math.abs(geo(prog).strokeDashoffset - L * 0.75) < 0.01, 'el 25% del aro');
    assert.ok(labels(t).includes('25%'));
    const z = await render(h(C.ProgressRing, { value: 0 }));
    assert.equal(geo(all(z, 'Path')[1]).strokeOpacity, 0, 'en 0 no se ve el punto del extremo redondeado');
    const hf = await render(h(C.ProgressRing, { value: 150, half: true, size: 100, thickness: 10, label: 'Velocidad', formatValue: v => `${v} km/h` }));
    assert.equal(all(hf, 'Svg')[0].props.height, 55, 'medio círculo');
    assert.equal(geo(all(hf, 'Path')[1]).strokeDashoffset, 0, 'por encima del máximo: lleno');
    assert.ok(labels(hf).includes('150 km/h') && labels(hf).includes('Velocidad'));
    ok('ProgressRing: proporción, 0 sin punto, half, tope en el máximo, formatValue y label');
  }

  // ---- responsive: dos en una fila; al quitar uno, el otro ocupa todo (sin repetir la animación de entrada)
  {
    const anim = require('react-native-reanimated');
    const t = await render(h(C.LineChart, { data: [1, 3, 2] }));
    const measure = async w => { const v = t.root.findAll(n => n.type === 'View' && n.props.onLayout)[0]; await act(async () => v.props.onLayout({ nativeEvent: { layout: { width: w, height: 220 } } })) };
    await measure(160);
    const before = anim.timings.length;
    const d160 = geo(all(t, 'Path')[0]).d;
    await measure(340);
    assert.equal(all(t, 'Svg')[0].props.width, 340, 'ocupa el ancho nuevo');
    assert.notEqual(geo(all(t, 'Path')[0]).d, d160, 'redibujado al ancho nuevo');
    assert.equal(anim.timings.length, before, 'cambiar de ancho no repite la animación');
    const xs = all(t, 'Circle').map(c => c.props.cx);
    assert.ok(Math.max(...xs) > 300, 'los puntos llegan al borde nuevo');
    await act(async () => t.update(h(C.LineChart, { data: [5, 1, 4] })));
    assert.equal(anim.timings.length, before + 1, 'datos nuevos: sí anima');
    // Barras: al cambiar de ancho van directas (sin withTiming)
    const b = await render(h(C.BarChart, { data: [1, 2, 3] }));
    const mb = async w => { const v = b.root.findAll(n => n.type === 'View' && n.props.onLayout)[0]; await act(async () => v.props.onLayout({ nativeEvent: { layout: { width: w, height: 220 } } })) };
    await mb(150);
    const nb = anim.timings.length;
    await mb(300);
    assert.equal(anim.timings.length, nb, 'barras: sin animar al cambiar de ancho');
    assert.ok(bars(b)[2].props.x > 150, 'y ocupan el ancho nuevo');
    // aspectRatio: el alto sale del ancho
    const a = await render(h(C.AreaChart, { data: [1, 2], aspectRatio: 2 }));
    const va = a.root.findAll(n => n.type === 'View' && n.props.onLayout)[0];
    assert.equal(va.props.style.aspectRatio, 2);
    await act(async () => va.props.onLayout({ nativeEvent: { layout: { width: 300, height: 150 } } }));
    assert.equal(all(a, 'Svg')[0].props.height, 150, 'aspectRatio: alto = ancho / 2');
    ok('responsive: ocupa el ancho del contenedor al cambiar (sin repetir la animación), aspectRatio y datos nuevos animan');
  }

  // ---- zoom con dos dedos, desplazar con un dedo, doble toque y eje Y ajustado a lo visible
  {
    const ranges = [];
    const data = Array.from({ length: 20 }, (_, i) => i * 10);
    const lbl = data.map((_, i) => `L${i}`);
    const t = await render(h(C.LineChart, { width: 300, height: 200, data, labels: lbl, zoomable: true, onZoomChange: r => ranges.push(r) }));
    const tch = (x, lx = x) => ({ pageX: x, pageY: 100, locationX: lx, locationY: 100 });
    const move = async touches => act(async () => overlay(t).props.onResponderMove({ nativeEvent: { ...touches[0], touches } }));
    await act(async () => overlay(t).props.onResponderGrant(ev(150, 100)));
    await move([tch(120), tch(180)]);
    assert.equal(overlay(t).props.onResponderTerminationRequest(), false, 'haciendo zoom: el scroll no le quita el toque');
    await move([tch(60), tch(240)]); // 3x más separados
    await act(async () => overlay(t).props.onResponderRelease(ev(150, 100)));
    const z = ranges[ranges.length - 1];
    assert.ok(z && z.end - z.start <= 8 && z.start > 3, 'zoom x3 alrededor del centro: ' + JSON.stringify(z));
    const tx = textsOf(t, 'Text');
    assert.ok(!tx.includes('L0') && !tx.includes('L19'), 'los extremos ya no se ven');
    assert.ok(!tx.includes('0'), 'el eje Y se ajusta a lo visible (no empieza en 0): ' + tx.filter(x => /^\d+$/.test(x)));
    // Arrastrar con un dedo desplaza (no recorre)
    const sel = [];
    await act(async () => overlay(t).props.onResponderGrant(ev(150, 100)));
    await act(async () => overlay(t).props.onResponderMove(ev(250, 100)));
    await act(async () => overlay(t).props.onResponderRelease(ev(250, 100)));
    const pz = ranges[ranges.length - 1];
    assert.ok(pz.start < z.start, 'arrastrar a la derecha muestra lo anterior: ' + JSON.stringify(pz));
    // Doble toque: se quita el zoom
    await act(async () => { overlay(t).props.onResponderGrant(ev(100, 100)) }); await act(async () => { overlay(t).props.onResponderRelease(ev(100, 100)) });
    await act(async () => { overlay(t).props.onResponderGrant(ev(100, 100)) }); await act(async () => { overlay(t).props.onResponderRelease(ev(100, 100)) });
    assert.equal(ranges[ranges.length - 1], null, 'doble toque: sin zoom');
    assert.ok(textsOf(t, 'Text').includes('L0'), 'vuelve a verse todo');
    // Barras con zoom: se dibujan menos
    const b = await render(h(C.ColumnChart, { width: 300, data: Array.from({ length: 12 }, (_, i) => i + 1), zoomable: true }));
    const bt = (x) => ({ pageX: x, pageY: 100, locationX: x, locationY: 100 });
    await act(async () => overlay(b).props.onResponderGrant(ev(150, 100)));
    await act(async () => overlay(b).props.onResponderMove({ nativeEvent: { ...bt(130), touches: [bt(130), bt(170)] } }));
    await act(async () => overlay(b).props.onResponderMove({ nativeEvent: { ...bt(70), touches: [bt(70), bt(230)] } }));
    assert.ok(bars(b).length <= 5, 'zoom en barras: ' + bars(b).length + ' barras');
    ok('zoom: dos dedos (centrado), scroll bloqueado mientras, eje Y ajustado, desplazar con un dedo, doble toque y barras');
  }

  // ---- visiblePoints, referenceLines, legendPosition, loading y groupSmall
  {
    const lbl = Array.from({ length: 30 }, (_, i) => `D${i}`);
    const v = await render(h(C.LineChart, { width: 300, data: lbl.map((_, i) => i), labels: lbl, visiblePoints: 10 }));
    const tx = textsOf(v, 'Text');
    assert.ok(tx.includes('D29') && !tx.includes('D0') && !tx.includes('D19'), 'visiblePoints: los últimos 10');
    const r = await render(h(C.LineChart, { width: 300, data: [10, 20, 30], referenceLines: [{ value: 50, label: 'Meta' }, { value: 15, color: 'success.100', dashed: false }] }));
    assert.ok(textsOf(r, 'Text').includes('Meta') && textsOf(r, 'Text').includes('50'), 'la escala incluye la línea de referencia');
    const lines = all(r, 'Line').filter(l => l.props.stroke === COLORS_THEME['success.100']);
    assert.equal(lines.length, 1); assert.equal(lines[0].props.strokeDasharray, undefined, 'dashed: false');
    const top = await render(h(C.LineChart, { width: 300, series: [{ name: 'Ventas', data: [1, 2] }, { name: 'Gastos', data: [2, 1] }], legendPosition: 'top' }));
    const j = JSON.stringify(top.toJSON());
    assert.ok(j.indexOf('Ventas') < j.indexOf('"Svg"'), 'leyenda arriba');
    const ld = await render(h(C.BarChart, { width: 300, data: [1, 2], loading: true }));
    assert.ok(all(ld, 'Spinner').length === 1 && all(ld, 'Svg').length === 0, 'loading: indicador en lugar del gráfico');
    const ldp = await render(h(C.DonutChart, { width: 300, data: [1, 2], loading: true }));
    assert.ok(all(ldp, 'Spinner').length === 1 && all(ldp, 'Svg').length === 0, 'loading en donut');
    const g = await render(h(C.PieChart, { width: 300, animate: false, data: [{ label: 'A', value: 50 }, { label: 'B', value: 30 }, { label: 'C', value: 10 }, { label: 'D', value: 4 }, { label: 'E', value: 3 }, { label: 'F', value: 3 }], groupSmall: 5 }));
    assert.equal(all(g, 'Path').length, 4, 'D, E y F juntas');
    assert.ok(labels(g).some(l => l === 'Others' || l === 'Otros') && labels(g).includes('  10%'), 'en "Otros" con su porcentaje: ' + labels(g));
    ok('visiblePoints, referenceLines (escala, color, dashed), legendPosition top, loading y groupSmall');
  }

  // ---- rendimiento: al terminar la animación, SVG normal (sin animatedProps); con datos nuevos, anima desde lo que había
  {
    const animated = t => t.root.findAll(n => typeof n.type === 'string' && n.props.animatedProps).length;
    const t = await render(h(C.LineChart, { width: 300, data: [1, 5, 3], duration: 40 }));
    assert.ok(animated(t) > 0, 'animando: elementos animados');
    await wait(90);
    assert.equal(animated(t), 0, 'terminada: ninguno animado');
    assert.ok(all(t, 'Path')[0].props.d.startsWith('M'), 'path normal con su d');
    await act(async () => t.update(h(C.LineChart, { width: 300, data: [5, 1, 3], duration: 40 })));
    assert.ok(animated(t) > 0, 'datos nuevos: vuelve a animar');
    await wait(90);
    // Barras: con datos nuevos parten de donde estaban
    const b = await render(h(C.BarChart, { width: 300, height: 200, data: [10, 20], duration: 40 }));
    await wait(90);
    const before = bars(b).map(r => ({ pos: r.props.y, len: r.props.height }));
    assert.equal(animated(b), 0);
    await act(async () => b.update(h(C.BarChart, { width: 300, height: 200, data: [20, 10], duration: 40 })));
    const animBars = b.root.findAll(n => typeof n.type === 'function' && n.props.from && n.props.to && n.props.progress);
    assert.ok(Math.abs(animBars[0].props.from.len - before[0].len) < 0.01, 'la barra crece desde su alto anterior');
    // Cambiar de ancho con la animación terminada: sigue sin animar
    await wait(90);
    await act(async () => b.update(h(C.BarChart, { width: 200, height: 200, data: [20, 10], duration: 40 })));
    assert.equal(animated(b), 0, 'ancho nuevo: SVG normal directamente');
    ok('rendimiento: SVG normal al terminar la animación; datos nuevos animan desde lo anterior; ancho nuevo sin animar');
  }
})().catch(e => { console.error('FALLO', e); process.exit(1) });
