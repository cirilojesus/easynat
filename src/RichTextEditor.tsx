// RichTextEditor: editor de texto enriquecido (HTML) sobre react-native-webview. Genera HTML que RenderHTML sabe
// mostrar. react-native-webview es opcional: se carga solo al usar el editor (require en try/catch, que Metro
// trata como dependencia opcional), así que quien no lo usa no necesita instalarla
import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { Keyboard, NativeScrollEvent, NativeSyntheticEvent, Platform, Pressable, ScrollView as RNScrollView, View } from "react-native";
import { Box, EABoxProps } from "./Box";
import { Button } from "./Button";
import { FormGroupRef, useFormControl } from "./EAForm";
import { Icon } from "./Icon";
import { Input } from "./Input";
import { Label, LabelRef, LabelType } from "./Label";
import { Menu, MenuRef } from "./Menu";
import { openModal } from "./Modal";
import { EATextProps, Text } from "./Text";
import { Theme, ThemeColor } from "./theme";
import { libT } from "./utils/translate";
import { useTapOutside } from "./utils/touches";
import { useThemeProps } from "./utils/useThemeProps";

import { loadWebView, MissingWebView, WebViewHandle, WebViewMessageEvent } from "./utils/webview";

/* ---------------- El documento del WebView ---------------- */

// Lo que corre dentro del WebView: un div contenteditable, sus estilos y el script que habla con React Native
// (postMessage hacia RN; RN llama a window.__cmd, __setHTML...)

type EditorCss = {
    color: string;
    fontSize: number;
    lineHeight: number;
    padding: number;
    placeholderColor: string;
    linkColor: string;
    mentionColor: string;
    accentColor: string;
    mutedColor: string;
    borderColor: string;
    css?: string;
};

/** Los estilos del contenido (se cambian en caliente con window.__setCss, sin recargar) */
const editorCss = (c: EditorCss) => `
html,body{margin:0;padding:0;background:transparent;-webkit-text-size-adjust:100%;height:100%}
body{color:${c.color};font-family:-apple-system,Roboto,"Segoe UI",sans-serif;font-size:${c.fontSize}px;line-height:${c.lineHeight}}
#editor{outline:none;padding:${c.padding}px;box-sizing:border-box;word-wrap:break-word;overflow-wrap:anywhere;-webkit-user-select:text;user-select:text;-webkit-tap-highlight-color:transparent}
#editor.is-empty:before{content:attr(data-placeholder);color:${c.placeholderColor};pointer-events:none;position:absolute}
#editor>*:first-child{margin-top:0}
p,div{margin:0 0 .4em}
h1{font-size:1.6em;margin:.3em 0}h2{font-size:1.35em;margin:.3em 0}h3{font-size:1.15em;margin:.3em 0}
ul,ol{padding-left:1.4em;margin:0 0 .4em}
ul.checklist{list-style:none;padding-left:.1em}
ul.checklist li{position:relative;padding-left:1.7em}
ul.checklist li:before{content:'';position:absolute;left:0;top:.2em;width:1.05em;height:1.05em;border:1.5px solid ${c.mutedColor};border-radius:4px;box-sizing:border-box}
ul.checklist li[data-checked="true"]:before{background:${c.accentColor};border-color:${c.accentColor}}
ul.checklist li[data-checked="true"]:after{content:'';position:absolute;left:.37em;top:.33em;width:.28em;height:.55em;border:solid #fff;border-width:0 2px 2px 0;transform:rotate(45deg)}
ul.checklist li[data-checked="true"]{color:${c.mutedColor}}
blockquote{border-left:3px solid ${c.borderColor};margin:.4em 0;padding-left:.8em;color:${c.mutedColor};font-style:italic}
pre{font-family:Menlo,monospace;font-size:.9em;background:rgba(127,127,127,.12);border-radius:6px;padding:.6em;white-space:pre-wrap;margin:.4em 0}
a{color:${c.linkColor}}
.mention{color:${c.mentionColor};font-weight:600}
img{max-width:100%;height:auto;border-radius:4px}
table{border-collapse:collapse;width:100%;margin:.4em 0;table-layout:fixed}
td,th{border:1px solid ${c.borderColor};padding:4px 6px;vertical-align:top;word-break:break-word}
th{background:rgba(127,127,127,.08);text-align:left}
hr{border:none;border-top:1px solid ${c.borderColor};margin:.8em 0}
${c.css ?? ''}`;

const json = (v: unknown) => JSON.stringify(v).replace(/</g, '\\u003c');

/** El HTML completo del WebView (se genera una vez: los cambios van por los window.__*) */
const editorDocument = (opts: { css: string; html: string; placeholder: string; disabled: boolean; mentionTrigger?: string; pastePlain: boolean; commands?: Record<string, string> }) => `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<style id="theme">${opts.css}</style></head>
<body><div id="editor" contenteditable="${opts.disabled ? 'false' : 'true'}"></div>
<script>window.__CFG=${json({ html: opts.html, placeholder: opts.placeholder, trigger: opts.mentionTrigger ?? null, pastePlain: opts.pastePlain, commands: opts.commands ?? {} })};</script>
<script>${EDITOR_SCRIPT}</script></body></html>`;

// En ES5 a propósito: así funciona también en WebViews de Android antiguos
const EDITOR_SCRIPT = String.raw`(function () {
  var cfg = window.__CFG, ed = document.getElementById('editor');
  var RN = window.ReactNativeWebView;
  function post(o) { if (RN) RN.postMessage(JSON.stringify(o)); }
  function attr(s) { return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }
  function esc(s) { return String(s).replace(/[.*+?^${'$'}{}()|[\]\\]/g, '\\$&'); }
  var saved = null, last = null, lastH = -1, lastState = '', mention = null, mentionQuery = null;

  function sel() { return window.getSelection(); }
  function closest(selector) {
    var s = sel(); if (!s.rangeCount) return null;
    var n = s.anchorNode; if (n && n.nodeType === 3) n = n.parentNode;
    while (n && n !== ed) { if (n.matches && n.matches(selector)) return n; n = n.parentNode; }
    return null;
  }
  // Vacío: sin texto (ni espacios de relleno) y sin imágenes, listas o separadores
  function isEmpty() {
    var t = (ed.innerText || '').replace(/[​\s]/g, '');
    return !t && !ed.querySelector('img,hr,iframe,video,li,.mention');
  }
  function current() { return isEmpty() ? '' : ed.innerHTML; }
  function height() {
    var h = Math.ceil(ed.getBoundingClientRect().height);
    if (h !== lastH) { lastH = h; post({ type: 'height', height: h }); }
  }
  // Listas de tareas: cada <li> con su data-checked (al pulsar Enter el navegador copia el del anterior)
  function normalize() {
    var lists = ed.querySelectorAll('ul.checklist');
    for (var i = 0; i < lists.length; i++) {
      var items = lists[i].children;
      for (var j = 0; j < items.length; j++) if (!items[j].hasAttribute('data-checked')) items[j].setAttribute('data-checked', 'false');
    }
    var li = closest('ul.checklist > li');
    if (li && !(li.innerText || '').replace(/[​\s]/g, '')) li.setAttribute('data-checked', 'false');
  }
  function change() {
    ed.classList.toggle('is-empty', isEmpty());
    var h = current();
    if (h !== last) { last = h; post({ type: 'change', html: h, text: (ed.innerText || '').replace(/​/g, '').trim() }); }
    height();
  }
  function state() {
    var st = {};
    ['bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', 'insertUnorderedList', 'insertOrderedList', 'justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull']
      .forEach(function (c) { try { st[c] = document.queryCommandState(c); } catch (e) { st[c] = false; } });
    var block = ''; try { block = String(document.queryCommandValue('formatBlock') || '').toLowerCase(); } catch (e) { }
    // Solo el de un <font size> de verdad (queryCommandValue también "ve" un tamaño en los títulos)
    var font = closest('font[size]');
    var a = closest('a');
    st.block = block; st.fontSize = font ? font.getAttribute('size') : '';
    st.checkList = !!closest('ul.checklist'); if (st.checkList) st.insertUnorderedList = false;
    st.quote = !!closest('blockquote'); st.code = !!closest('pre'); st.table = !!closest('table');
    var lh = closest('[style*="line-height"]'), ls = closest('[style*="letter-spacing"]');
    st.lineHeight = lh ? parseFloat(lh.style.lineHeight) || null : null;
    st.letterSpacing = ls ? parseFloat(ls.style.letterSpacing) || null : null;
    st.link = a ? a.getAttribute('href') || '' : null;
    st.selection = sel().toString().slice(0, 200);
    var k = JSON.stringify(st);
    if (k !== lastState) { lastState = k; post({ type: 'state', state: st }); }
  }
  function save() { var s = sel(); if (s.rangeCount && ed.contains(s.anchorNode)) saved = s.getRangeAt(0).cloneRange(); }
  function restore() {
    ed.focus();
    if (saved) { var s = sel(); s.removeAllRanges(); s.addRange(saved); }
  }
  function caretToEnd() {
    var r = document.createRange(); r.selectNodeContents(ed); r.collapse(false);
    var s = sel(); s.removeAllRanges(); s.addRange(r); saved = r.cloneRange();
  }
  // Menciones: el trigger (@) + lo escrito justo antes del cursor
  function checkMention() {
    if (!cfg.trigger) return;
    var s = sel(), q = null;
    if (s.rangeCount && s.isCollapsed && s.anchorNode && s.anchorNode.nodeType === 3 && !closest('.mention')) {
      var before = s.anchorNode.textContent.slice(0, s.anchorOffset);
      var m = new RegExp('(?:^|[\\s\\u00a0])' + esc(cfg.trigger) + '([^\\s\\u00a0' + esc(cfg.trigger) + ']{0,40})$').exec(before);
      if (m) { q = m[1]; mention = { node: s.anchorNode, offset: s.anchorOffset, len: m[1].length + cfg.trigger.length }; }
    }
    if (q === null) mention = null;
    if (q !== mentionQuery) { mentionQuery = q; post({ type: 'mention', query: q }); }
  }
  function insertMention(v) {
    if (!mention) return;
    var r = document.createRange();
    r.setStart(mention.node, Math.max(0, mention.offset - mention.len)); r.setEnd(mention.node, mention.offset);
    var s = sel(); s.removeAllRanges(); s.addRange(r);
    document.execCommand('insertHTML', false, '<span class="mention" contenteditable="false" data-id="' + attr(v.id) + '">' + attr(cfg.trigger + v.label) + '</span>&nbsp;');
    mention = null; mentionQuery = null; post({ type: 'mention', query: null });
  }
  function toggleChecklist() {
    var list = closest('ul.checklist');
    if (list) { document.execCommand('insertUnorderedList'); return; } // quitar la lista
    if (!closest('ul')) document.execCommand('insertUnorderedList');
    var ul = closest('ul');
    if (ul) { ul.classList.add('checklist'); normalize(); }
  }
  function link(v) {
    var a = closest('a');
    if (!v || !v.url) { // quitar el enlace
      if (a) { var r = document.createRange(); r.selectNode(a); var s0 = sel(); s0.removeAllRanges(); s0.addRange(r); document.execCommand('unlink'); }
      return;
    }
    if (a) { a.setAttribute('href', v.url); if (v.text) a.textContent = v.text; return; }
    var s = sel();
    if (s.isCollapsed || v.text) document.execCommand('insertHTML', false, '<a href="' + attr(v.url) + '">' + attr(v.text || v.url) + '</a>&nbsp;');
    else document.execCommand('createLink', false, v.url);
  }

  var BLOCKS = 'p,div,h1,h2,h3,h4,h5,h6,li,blockquote,pre';
  // Los bloques (párrafos, títulos, elementos de lista...) que toca la selección; el texto suelto se mete en un <p>
  function blocksInRange(retry) {
    var s = sel(); if (!s.rangeCount) return [];
    var r = s.getRangeAt(0), all = ed.querySelectorAll(BLOCKS), out = [];
    for (var i = 0; i < all.length; i++) if (r.intersectsNode(all[i]) && !all[i].querySelector(BLOCKS)) out.push(all[i]);
    if (!out.length && !retry) { document.execCommand('formatBlock', false, '<p>'); return blocksInRange(true); }
    return out;
  }
  function setStyle(el, prop, value) {
    el.style[prop] = value || '';
    if (!el.getAttribute('style')) el.removeAttribute('style');
  }
  // Interlineado: en los párrafos de la selección (null = el normal)
  function lineHeight(v) { blocksInRange().forEach(function (b) { setStyle(b, 'lineHeight', v ? String(v) : ''); }); }
  // Espaciado entre letras: en lo seleccionado o, solo con el cursor, en su párrafo (0/null = el normal)
  function letterSpacing(v) {
    var s = sel(); if (!s.rangeCount) return;
    var r = s.getRangeAt(0), px = v ? v + 'px' : '';
    if (r.collapsed) { blocksInRange().forEach(function (b) { setStyle(b, 'letterSpacing', px); }); return; }
    var span = document.createElement('span');
    span.appendChild(r.extractContents());
    var inner = span.querySelectorAll('[style*="letter-spacing"]');
    for (var i = 0; i < inner.length; i++) setStyle(inner[i], 'letterSpacing', '');
    if (px) span.style.letterSpacing = px;
    r.insertNode(span);
    var nr = document.createRange(); nr.selectNodeContents(span); s.removeAllRanges(); s.addRange(nr);
    if (!px) { while (span.firstChild) span.parentNode.insertBefore(span.firstChild, span); span.parentNode.removeChild(span); }
  }
  function cellHtml(tag) { return '<' + tag + '><br></' + tag + '>'; }
  function insertTable(v) {
    var rows = Math.max(1, v && v.rows || 3), cols = Math.max(1, v && v.cols || 3), h = '<table><tbody>';
    for (var r = 0; r < rows; r++) {
      h += '<tr>';
      for (var c = 0; c < cols; c++) h += cellHtml(r === 0 && v && v.header ? 'th' : 'td');
      h += '</tr>';
    }
    document.execCommand('insertHTML', false, h.replace('<table>', '<table data-new="1">') + '</tbody></table><p><br></p>');
    // El cursor, a la primera celda (no debajo de la tabla)
    var t = ed.querySelector('table[data-new]');
    if (t) {
      t.removeAttribute('data-new');
      var r = document.createRange(); r.selectNodeContents(t.querySelector('th,td')); r.collapse(true);
      var s = sel(); s.removeAllRanges(); s.addRange(r);
    }
  }
  // Filas y columnas de la tabla donde está el cursor
  function tableAction(action) {
    var cell = closest('td,th'), row = closest('tr'), table = closest('table');
    if (!table) return;
    var index = cell ? Array.prototype.indexOf.call(row.children, cell) : 0;
    var rows = table.querySelectorAll('tr'), i;
    if (action === 'deleteTable') { table.parentNode.removeChild(table); return; }
    if (action === 'addRow' && row) {
      var nr = document.createElement('tr');
      for (i = 0; i < row.children.length; i++) nr.innerHTML += cellHtml('td');
      row.parentNode.insertBefore(nr, row.nextSibling);
    }
    if (action === 'deleteRow' && row) { if (rows.length <= 1) table.parentNode.removeChild(table); else row.parentNode.removeChild(row); }
    if (action === 'addColumn') for (i = 0; i < rows.length; i++) {
      var ref = rows[i].children[index], nc = document.createElement(ref && ref.tagName === 'TH' ? 'th' : 'td');
      nc.innerHTML = '<br>'; rows[i].insertBefore(nc, ref ? ref.nextSibling : null);
    }
    if (action === 'deleteColumn') {
      if (rows[0] && rows[0].children.length <= 1) { table.parentNode.removeChild(table); return; }
      for (i = 0; i < rows.length; i++) if (rows[i].children[index]) rows[i].removeChild(rows[i].children[index]);
    }
  }
  // Quita el color (o el fondo) de lo seleccionado: deja el texto con el color normal del tema
  function clearColor(background) {
    var s = sel(); if (!s.rangeCount) return;
    var r = s.getRangeAt(0), prop = background ? 'background-color' : 'color';
    var nodes = ed.querySelectorAll(background ? '[style*="background"]' : 'font[color],[style*="color"]');
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      if (!r.intersectsNode(n)) continue;
      if (!background && n.tagName === 'FONT') n.removeAttribute('color');
      n.style.removeProperty(prop); if (background) n.style.removeProperty('background');
      if (!n.getAttribute('style')) n.removeAttribute('style');
      // Un <font> o <span> que se queda sin nada: se quita (su contenido se queda)
      if ((n.tagName === 'FONT' || n.tagName === 'SPAN') && !n.attributes.length) {
        while (n.firstChild) n.parentNode.insertBefore(n.firstChild, n);
        n.parentNode.removeChild(n);
      }
    }
  }
  function color(background, value) {
    if (!value) { clearColor(background); return; }
    if (background) { if (!document.execCommand('hiliteColor', false, value)) document.execCommand('backColor', false, value); }
    else document.execCommand('foreColor', false, value);
  }

  // Comandos propios (prop commands): una función (value, ed) por nombre. ed: utilidades sobre el editor
  var custom = {};
  var api = {
    root: ed,
    selection: sel,
    range: function () { var s = sel(); return s.rangeCount ? s.getRangeAt(0) : null; },
    selectedText: function () { return sel().toString(); },
    closest: closest,
    blocks: function () { return blocksInRange(); },
    exec: function (name, value) { return document.execCommand(name, false, value == null ? null : value); },
    command: function (name, value) { window.__cmd(name, value); },
    insertHTML: function (h) { document.execCommand('insertHTML', false, h); },
    insertText: function (t) { document.execCommand('insertText', false, t); },
    // Envuelve lo seleccionado en una etiqueta: wrap('mark', { style: 'background:#ff0' })
    wrap: function (tag, attrs) {
      var r = api.range(); if (!r || r.collapsed) return null;
      var el = document.createElement(tag);
      for (var k in attrs || {}) el.setAttribute(k, attrs[k]);
      el.appendChild(r.extractContents()); r.insertNode(el);
      var nr = document.createRange(); nr.selectNodeContents(el); var s = sel(); s.removeAllRanges(); s.addRange(nr);
      return el;
    },
    // Avisa a React Native: llega a onCustomEvent(evento, datos)
    emit: function (event, data) { post({ type: 'custom', event: event, data: data === undefined ? null : data }); },
  };
  window.__defineCommand = function (name, source) {
    try { custom[name] = eval('(' + source + ')'); }
    catch (e) { post({ type: 'error', message: 'command "' + name + '": ' + e.message }); }
  };
  for (var key in cfg.commands) window.__defineCommand(key, cfg.commands[key]);

  window.__cmd = function (name, value) {
    restore();
    if (custom[name]) {
      try { custom[name](value, api); }
      catch (e) { post({ type: 'error', message: 'command "' + name + '": ' + e.message }); }
      normalize(); save(); change(); state();
      return;
    }
    switch (name) {
      case 'heading': document.execCommand('formatBlock', false, '<' + (value || 'p') + '>'); break;
      case 'quote': document.execCommand('formatBlock', false, closest('blockquote') ? '<p>' : '<blockquote>'); break;
      case 'code': document.execCommand('formatBlock', false, closest('pre') ? '<p>' : '<pre>'); break;
      case 'checkList': toggleChecklist(); break;
      case 'insertUnorderedList':
        // En una lista de tareas: pasa a lista normal
        var cl = closest('ul.checklist');
        if (cl) { cl.classList.remove('checklist'); for (var i = 0; i < cl.children.length; i++) cl.children[i].removeAttribute('data-checked'); }
        else document.execCommand('insertUnorderedList');
        break;
      case 'link': link(value); break;
      case 'image': if (value) document.execCommand('insertHTML', false, '<img src="' + attr(value) + '"><br>'); break;
      case 'table': insertTable(value); break;
      case 'tableAction': tableAction(value); break;
      case 'lineHeight': lineHeight(value); break;
      case 'letterSpacing': letterSpacing(value); break;
      case 'textColor': color(false, value); break;
      case 'highlight': color(true, value); break;
      case 'mention': insertMention(value); break;
      default: document.execCommand(name, false, value == null ? null : value);
    }
    normalize(); save(); change(); state();
  };
  window.__setHTML = function (h) { ed.innerHTML = h || ''; normalize(); ed.classList.toggle('is-empty', isEmpty()); last = current(); height(); };
  window.__setCss = function (css) { document.getElementById('theme').textContent = css; height(); };
  window.__setPlaceholder = function (p) { ed.setAttribute('data-placeholder', p || ''); };
  window.__setDisabled = function (d) { ed.contentEditable = d ? 'false' : 'true'; if (d) ed.blur(); };
  window.__focus = function () { ed.focus(); if (saved) restore(); else caretToEnd(); };
  window.__blur = function () { ed.blur(); sel().removeAllRanges(); };

  document.addEventListener('selectionchange', function () { save(); state(); checkMention(); });
  ed.addEventListener('input', function () { normalize(); change(); state(); checkMention(); });
  ed.addEventListener('focus', function () { post({ type: 'focus' }); });
  ed.addEventListener('blur', function () { post({ type: 'blur' }); });
  // Marcar una tarea: tocar la casilla (el hueco de la izquierda del <li>)
  ed.addEventListener('click', function (e) {
    var li = e.target && e.target.closest && e.target.closest('ul.checklist > li');
    if (!li) return;
    var r = li.getBoundingClientRect();
    if (e.clientX - r.left < parseFloat(getComputedStyle(li).paddingLeft)) {
      li.setAttribute('data-checked', li.getAttribute('data-checked') === 'true' ? 'false' : 'true');
      e.preventDefault(); change();
    }
  });
  // Tocar debajo del texto (el body) también enfoca el editor
  document.addEventListener('click', function (e) { if ((e.target === document.body || e.target === document.documentElement) && ed.isContentEditable) window.__focus(); });
  if (cfg.pastePlain) ed.addEventListener('paste', function (e) {
    var t = (e.clipboardData || window.clipboardData).getData('text/plain');
    e.preventDefault(); document.execCommand('insertText', false, t);
  });
  try { document.execCommand('defaultParagraphSeparator', false, 'p'); } catch (e) { }
  if (window.ResizeObserver) new ResizeObserver(height).observe(ed); else setInterval(height, 300);
  window.__setPlaceholder(cfg.placeholder);
  window.__setHTML(cfg.html);
  post({ type: 'ready' });
})();`;

/* ---------------- Tipos ---------------- */

/** Lo que tiene aplicado el texto donde está el cursor (para marcar los botones activos) */
export type RichEditorState = {
    bold?: boolean; italic?: boolean; underline?: boolean; strikeThrough?: boolean; subscript?: boolean; superscript?: boolean;
    insertUnorderedList?: boolean; insertOrderedList?: boolean; checkList?: boolean;
    justifyLeft?: boolean; justifyCenter?: boolean; justifyRight?: boolean; justifyFull?: boolean;
    /** Interlineado del párrafo (null = el normal) */
    lineHeight?: number | null;
    /** Espaciado entre letras en px (null = el normal) */
    letterSpacing?: number | null;
    quote?: boolean; code?: boolean;
    /** El cursor está dentro de una tabla */
    table?: boolean;
    /** Bloque actual: p, h1, h2, h3, blockquote, pre... */
    block?: string;
    /** Tamaño de <font size> (1-7) */
    fontSize?: string;
    /** href del enlace donde está el cursor (null si no hay) */
    link?: string | null;
    /** El texto seleccionado ahora mismo ('' si solo está el cursor). Sirve para botones propios o para onStateChange */
    selection?: string;
};

export type RichToolbarAction =
    | 'bold' | 'italic' | 'underline' | 'strike' | 'heading' | 'fontSize' | 'bulletList' | 'orderedList' | 'checkList'
    | 'alignLeft' | 'alignCenter' | 'alignRight' | 'quote' | 'code' | 'link' | 'removeFormat' | 'undo' | 'redo'
    | 'textColor' | 'highlight' | 'image' | 'table' | 'hr'
    | 'subscript' | 'superscript' | 'alignJustify' | 'lineHeight' | 'letterSpacing'
    /** Separador */
    | '|';

/** Un botón propio en la barra */
export type RichToolbarCustom = {
    key: string;
    icon: React.ReactElement;
    onPress: (editor: RichTextEditorRef) => void;
    isActive?: (state: RichEditorState) => boolean;
};

export type RichMention = string | { id: string; label: string };

/** Los comandos que trae el editor y el valor que lleva cada uno (void = sin valor) */
export interface RichBuiltinCommands {
    // Formato del texto
    bold: void; italic: void; underline: void; strikeThrough: void; subscript: void; superscript: void; removeFormat: void;
    /** Tamaño de <font size>, de '1' a '7' (3 es el normal) */
    fontSize: '1' | '2' | '3' | '4' | '5' | '6' | '7';
    /** Un color (hex, rgb...) o null para quitarlo */
    textColor: string | null;
    /** Color de fondo del texto o null para quitarlo */
    highlight: string | null;
    /** Espaciado entre letras en px o null para el normal */
    letterSpacing: number | null;
    // Bloques
    heading: 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    /** Interlineado (1.5, 2...) o null para el normal */
    lineHeight: number | null;
    quote: void; code: void; checkList: void; insertUnorderedList: void; insertOrderedList: void;
    justifyLeft: void; justifyCenter: void; justifyRight: void; justifyFull: void;
    // Insertar
    insertHTML: string; insertText: string; insertHorizontalRule: void;
    /** URL https o data URI (data:image/jpeg;base64,...) */
    image: string;
    /** El enlace (si hay texto seleccionado lo convierte en enlace) o null para quitar el del cursor */
    link: { url: string; text?: string } | null;
    table: { rows: number; cols: number; header?: boolean };
    /** Acción sobre la tabla donde está el cursor */
    tableAction: 'addRow' | 'addColumn' | 'deleteRow' | 'deleteColumn' | 'deleteTable';
    /** Sustituye el @texto que se está escribiendo por la mención */
    mention: { id: string; label: string };
    // Edición
    undo: void; redo: void; selectAll: void; delete: void;
}

/**
 * Tus comandos (los de la prop `commands`), para que command() también los autocomplete y compruebe su valor.
 * Se amplía desde tu app:
 * declare module 'easynat' { interface RichCustomCommands { mayusculas: void; marcar: string } }
 */
export interface RichCustomCommands { }

/** Todos los comandos: command() los autocompleta y comprueba su valor (y acepta otros de document.execCommand) */
export type RichCommands = RichBuiltinCommands & RichCustomCommands;

/** command(nombre, valor): con autocompletado de los nombres y el valor que corresponde a cada uno */
export type RichCommandFn = {
    <K extends keyof RichCommands>(name: K, ...value: RichCommands[K] extends void ? [] : [value: RichCommands[K]]): void;
    /** Cualquier otro comando de document.execCommand (p. ej. 'outdent', 'indent', 'fontName') */
    <N extends string>(name: N extends keyof RichCommands ? never : N, value?: string | number | boolean | null): void;
};

export type RichTextEditorRef = {
    focus: () => void;
    blur: () => void;
    /** El HTML actual ('' si está vacío) */
    getHTML: () => string;
    /** El texto sin formato */
    getText: () => string;
    setHTML: (html: string) => void;
    /** Inserta HTML donde está el cursor */
    insertHTML: (html: string) => void;
    insertText: (text: string) => void;
    /**
     * Da una orden al editor: command('heading', 'h2'), command('textColor', '#DC2626'), command('bold')...
     * Ver RichCommands para la lista y el valor de cada uno
     */
    command: RichCommandFn;
    clear: () => void;
};

export type RichTextEditorProps = Omit<EABoxProps, 'children'> & {
    /** HTML (controlado: si cambia desde fuera se carga en el editor) */
    value?: string;
    /** HTML inicial (no controlado) */
    defaultValue?: string;
    /** Al escribir: el HTML ('' si está vacío) y el texto sin formato */
    onChange?: (html: string, text: string) => void;
    onFocus?: () => void;
    onBlur?: () => void;
    placeholder?: string;
    label?: React.ReactNode;
    isFloat?: boolean;
    isRequired?: boolean;
    /** Mensaje de error (borde rojo y texto debajo). Con formGroup se toma del formulario */
    error?: string;
    disabled?: boolean;
    /** EAForm: el valor (HTML), la validación, el error y disabled salen del formulario */
    formGroup?: FormGroupRef<any>;
    formControl?: string;
    /** Alto mínimo y máximo del área de texto: crece con el contenido y, pasado el máximo, hace scroll */
    minHeight?: number;
    maxHeight?: number;
    /** Botones de la barra (en orden; '|' es un separador) o false para quitarla */
    toolbar?: (RichToolbarAction | RichToolbarCustom)[] | false;
    toolbarPosition?: 'top' | 'bottom';
    /** Color de los botones activos y de las casillas. Por defecto primary */
    colorScheme?: string;
    /** Menciones: al escribir el trigger (@) sale una lista con las que coinciden */
    mentions?: {
        data: RichMention[];
        /** Por defecto '@' */
        trigger?: string;
        /** Máximo de sugerencias. Por defecto 5 */
        max?: number;
        /** Lo escrito tras el trigger (null al terminar): para buscar en un servidor y cambiar data */
        onSearch?: (query: string | null) => void;
    };
    /** Pegar como texto sin formato (sin los estilos de la web o Word de donde viene). Por defecto true */
    pastePlain?: boolean;
    /**
     * Botón de imagen: tu selector (p. ej. expo-image-picker). Devuelve una URL https o un data URI
     * (data:image/jpeg;base64,...), o null si se cancela. Sin él, se pide la URL en un modal
     */
    onImagePick?: () => Promise<string | null | undefined> | string | null | undefined;
    /** Colores del botón de color de texto (claves del tema o colores) */
    textColors?: string[];
    /** Colores del botón de resaltado */
    highlightColors?: string[];
    /** Cada vez que cambia lo que hay donde está el cursor: negrita, lista, enlace, texto seleccionado... */
    onStateChange?: (state: RichEditorState) => void;
    /**
     * Comandos propios: el código de una función (como texto) que corre dentro del editor (WebView) y recibe
     * (value, ed). Se usan con command('nombre', valor), igual que los del editor. ed tiene: root, selection(),
     * range(), selectedText(), closest(sel), blocks(), exec(nombre, valor), command(nombre, valor),
     * insertHTML(html), insertText(texto), wrap(etiqueta, atributos) y emit(evento, datos) → onCustomEvent
     * @example commands={{ mayusculas: '(v, ed) => ed.insertText(ed.selectedText().toUpperCase())' }}
     */
    commands?: Record<string, string>;
    /** Lo que mandan tus comandos con ed.emit(evento, datos) */
    onCustomEvent?: (event: string, data: any) => void;
    /**
     * Al tocar fuera del editor (en cualquier parte de la app) se quita el foco y se cierra el teclado.
     * Por defecto true. Necesita el ThemeProvider (es quien avisa de los toques)
     */
    blurOnOutsidePress?: boolean;
    /** Estilo del contenido: color, tamaño de letra, padding... y CSS propio */
    editorStyle?: {
        color?: string; fontSize?: number; lineHeight?: number; padding?: number; placeholderColor?: string;
        linkColor?: string; mentionColor?: string;
        /** CSS extra para el contenido, p. ej. 'h1{color:red}' */
        css?: string;
    };
    /** La caja del editor (borde, fondo, redondeo) */
    _editor?: EABoxProps;
    /** La caja del editor con foco (se fusiona con _editor) */
    _focus?: EABoxProps;
    _toolbar?: EABoxProps;
    _toolbarButton?: EABoxProps;
    /** Las flechas que avisan de que la barra tiene más botones (al hacer scroll) */
    _toolbarArrow?: EABoxProps;
    _label?: LabelType;
    _error?: EATextProps;
    _mentionList?: EABoxProps;
    _mentionItem?: EATextProps;
    variant?: (string & {});
};

/** Los botones de la barra por defecto ('|' es un separador). Para una barra propia, pásale tu lista a `toolbar` */
export const DEFAULT_TOOLBAR: RichToolbarAction[] = [
    'bold', 'italic', 'underline', 'strike', 'subscript', 'superscript', '|', 'heading', 'fontSize', 'textColor', 'highlight', '|',
    'bulletList', 'orderedList', 'checkList', '|', 'alignLeft', 'alignCenter', 'alignRight', 'alignJustify', 'lineHeight', 'letterSpacing', '|',
    'link', 'image', 'table', 'quote', 'hr', '|', 'undo', 'redo', 'removeFormat',
];

// Colores del contenido en hex fijo (no del tema): el HTML guardado se ve igual en cualquier app
const TEXT_COLORS = ['#111827', '#6B7280', '#DC2626', '#EA580C', '#CA8A04', '#16A34A', '#0891B2', '#2563EB', '#7C3AED', '#DB2777'];
const HIGHLIGHT_COLORS = ['#FEF08A', '#FED7AA', '#FECACA', '#BBF7D0', '#BAE6FD', '#DDD6FE', '#FBCFE8', '#E5E7EB'];
const LINE_HEIGHTS = [1, 1.5, 2, 2.5];
const LETTER_SPACINGS = [0.5, 1, 2, 3];
const TABLE_SIZES = [{ rows: 2, cols: 2 }, { rows: 3, cols: 3 }, { rows: 4, cols: 3 }, { rows: 4, cols: 4 }];

/* ---------------- Barra de herramientas ---------------- */

const ICONS: Record<Exclude<RichToolbarAction, '|'>, string> = {
    bold: 'format-bold', italic: 'format-italic', underline: 'format-underline', strike: 'format-strikethrough-variant',
    heading: 'format-header-pound', fontSize: 'format-size', bulletList: 'format-list-bulleted', orderedList: 'format-list-numbered',
    checkList: 'format-list-checks', alignLeft: 'format-align-left', alignCenter: 'format-align-center', alignRight: 'format-align-right',
    quote: 'format-quote-close', code: 'code-tags', link: 'link-variant', removeFormat: 'format-clear', undo: 'undo', redo: 'redo',
    textColor: 'format-color-text', highlight: 'format-color-highlight', image: 'image-outline', table: 'table', hr: 'minus',
    subscript: 'format-subscript', superscript: 'format-superscript', alignJustify: 'format-align-justify',
    lineHeight: 'format-line-spacing', letterSpacing: 'format-letter-spacing',
};

// Comando de execCommand de cada botón simple (y qué mirar del estado para marcarlo activo)
const SIMPLE: Partial<Record<RichToolbarAction, { cmd: string; active?: keyof RichEditorState }>> = {
    bold: { cmd: 'bold', active: 'bold' }, italic: { cmd: 'italic', active: 'italic' }, underline: { cmd: 'underline', active: 'underline' },
    strike: { cmd: 'strikeThrough', active: 'strikeThrough' }, bulletList: { cmd: 'insertUnorderedList', active: 'insertUnorderedList' },
    orderedList: { cmd: 'insertOrderedList', active: 'insertOrderedList' }, checkList: { cmd: 'checkList', active: 'checkList' },
    alignLeft: { cmd: 'justifyLeft', active: 'justifyLeft' }, alignCenter: { cmd: 'justifyCenter', active: 'justifyCenter' },
    alignRight: { cmd: 'justifyRight', active: 'justifyRight' }, quote: { cmd: 'quote', active: 'quote' }, code: { cmd: 'code', active: 'code' },
    removeFormat: { cmd: 'removeFormat' }, undo: { cmd: 'undo' }, redo: { cmd: 'redo' }, hr: { cmd: 'insertHorizontalRule' },
    subscript: { cmd: 'subscript', active: 'subscript' }, superscript: { cmd: 'superscript', active: 'superscript' },
    alignJustify: { cmd: 'justifyFull', active: 'justifyFull' },
};

// <font size> de 1 a 7 (los que usa RenderHTML)
const FONT_SIZES = [{ size: '2', key: 'fontSmall' }, { size: '3', key: 'fontNormal' }, { size: '5', key: 'fontLarge' }, { size: '6', key: 'fontHuge' }] as const;

const ToolButton = ({ icon, active, disabled, onPress, accent, _button, label, ...rest }: {
    icon: React.ReactElement | string; active?: boolean; disabled?: boolean; onPress?: () => void; accent: string; _button?: EABoxProps; label: string;
} & Record<string, any>) => (
    <Pressable
        {...rest}
        onPress={onPress ?? rest.onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ selected: !!active, disabled: !!disabled }}
        hitSlop={4}
        style={({ pressed }) => ({ opacity: disabled ? 0.35 : pressed ? 0.5 : 1 })}
    >
        <Box w={34} h={34} rounded={1.5} alignItems="center" justifyContent="center" bg={active ? 'light.50' : undefined} {..._button}>
            {typeof icon === 'string'
                ? <Icon as="MaterialCommunityIcons" name={icon as any} size={20} color={(active ? accent : 'gray.100') as any} />
                : icon}
        </Box>
    </Pressable>
);

/* ---------------- Editor ---------------- */

type BaseProps = RichTextEditorProps & { theme: Theme };

const RichTextEditorBase = forwardRef<RichTextEditorRef, BaseProps>(({ theme, ...p }, ref) => {
    const {
        value, defaultValue, onChange, onFocus, onBlur, placeholder, label, isFloat, isRequired, error, disabled = false,
        minHeight = 120, maxHeight = 320, toolbar = DEFAULT_TOOLBAR, toolbarPosition = 'top', colorScheme = 'primary',
        mentions, pastePlain = true, onImagePick, textColors = TEXT_COLORS, highlightColors = HIGHLIGHT_COLORS, onStateChange, blurOnOutsidePress = true, commands, onCustomEvent,
        editorStyle, _editor, _focus, _toolbar, _toolbarButton, _toolbarArrow, _label, _error, _mentionList, _mentionItem,
        formGroup: _fg, formControl: _fc, variant: _v, ...boxProps
    } = p;
    const color = (c: string) => theme.colors?.[c as ThemeColor] || c;
    const accent = color(`${colorScheme}.100`);

    const WebView = loadWebView();
    const web = useRef<WebViewHandle>(null);
    const ready = useRef(false);
    const queue = useRef<string[]>([]);
    const html = useRef(value ?? defaultValue ?? '');
    const text = useRef('');
    const [contentHeight, setContentHeight] = useState(minHeight);
    const [state, setState] = useState<RichEditorState>({});
    const [focused, setFocused] = useState(false);
    const [filled, setFilled] = useState(() => !!(value ?? defaultValue));
    const [mentionQuery, setMentionQuery] = useState<string | null>(null);
    const labelRef = useRef<LabelRef>(null);
    const [fieldHeight, setFieldHeight] = useState(0);
    // Cargado el documento, el WebView ya no navega (un enlace pulsado dentro abriría la web en el editor)
    const loaded = useRef(false);

    /** Ejecuta JS en el editor (o lo encola hasta que esté listo) */
    const run = (js: string) => {
        const code = `${js};true;`;
        if (ready.current) web.current?.injectJavaScript(code);
        else queue.current.push(code);
    };
    const js = (v: unknown) => JSON.stringify(v ?? null);
    const command = ((name: string, v?: unknown) => {
        // Android: si el foco nativo lo tiene otra vista (p. ej. un Input del modal del enlace), devolvérselo
        if (Platform.OS === 'android') (web.current as any)?.requestFocus?.();
        run(`window.__cmd(${js(name)},${js(v)})`);
    }) as RichCommandFn;

    const css = editorCss({
        color: color(editorStyle?.color ?? 'text'),
        fontSize: editorStyle?.fontSize ?? 15,
        lineHeight: editorStyle?.lineHeight ?? 1.45,
        padding: editorStyle?.padding ?? 12,
        placeholderColor: color(editorStyle?.placeholderColor ?? 'silver.100'),
        linkColor: color(editorStyle?.linkColor ?? accent),
        mentionColor: color(editorStyle?.mentionColor ?? accent),
        accentColor: accent,
        mutedColor: color('gray.100'),
        borderColor: color('light.200'),
        css: editorStyle?.css,
    });
    // El label flotante abajo hace de placeholder: mientras esté abajo, el placeholder taparía con él
    const raised = focused || filled;
    const shownPlaceholder = isFloat && label && !raised ? '' : placeholder ?? '';
    // El documento se genera una sola vez (si cambiara, el WebView se recargaría y se perdería lo escrito)
    const source = useMemo(() => ({
        html: editorDocument({ css, html: html.current, placeholder: shownPlaceholder, disabled, mentionTrigger: mentions ? mentions.trigger ?? '@' : undefined, pastePlain, commands }),
    }), []);

    // Cambios después de crearlo: en caliente
    const first = useRef(true);
    useEffect(() => { if (!first.current) run(`window.__setCss(${js(css)})`) }, [css]);
    useEffect(() => { if (!first.current) run(`window.__setDisabled(${disabled})`) }, [disabled]);
    // Comandos propios nuevos o cambiados: se definen en caliente
    const commandsKey = JSON.stringify(commands ?? {});
    useEffect(() => {
        if (first.current) return;
        Object.entries(commands ?? {}).forEach(([name, src]) => run(`window.__defineCommand(${js(name)},${js(src)})`));
    }, [commandsKey]);
    useEffect(() => { if (!first.current) run(`window.__setPlaceholder(${js(shownPlaceholder)})`) }, [shownPlaceholder]);
    useEffect(() => { labelRef.current?.animate(raised) }, [raised]);
    // value controlado: si llega uno distinto del que escribió el usuario, se carga
    useEffect(() => {
        if (first.current || value === undefined || value === html.current) return;
        html.current = value;
        setFilled(!!value);
        run(`window.__setHTML(${js(value)})`);
    }, [value]);
    useEffect(() => { first.current = false }, []);

    // Tocar fuera del editor: quitar el foco y cerrar el teclado. Con el foco se mide dónde está en la pantalla;
    // los menús y modales del editor se pintan fuera de la vista que avisa de los toques (no cuentan como fuera)
    const root = useRef<View>(null);
    useTapOutside(root, () => { run('window.__blur()'); Keyboard.dismiss() }, focused && blurOnOutsidePress);

    useImperativeHandle(ref, () => ({
        focus: () => { (web.current as any)?.requestFocus?.(); run('window.__focus()') },
        blur: () => run('window.__blur()'),
        getHTML: () => html.current,
        getText: () => text.current,
        setHTML: h => { html.current = h; setFilled(!!h); run(`window.__setHTML(${js(h)})`) },
        insertHTML: h => command('insertHTML', h),
        insertText: t => command('insertText', t),
        command,
        clear: () => { html.current = ''; text.current = ''; setFilled(false); run(`window.__setHTML('')`); onChange?.('', '') },
    }));

    const onMessage = (e: WebViewMessageEvent) => {
        let msg: any;
        try { msg = JSON.parse(e.nativeEvent.data) } catch { return }
        switch (msg.type) {
            case 'ready':
                ready.current = true;
                queue.current.splice(0).forEach(code => web.current?.injectJavaScript(code));
                break;
            case 'change':
                html.current = msg.html;
                text.current = msg.text;
                setFilled(!!msg.html);
                onChange?.(msg.html, msg.text);
                break;
            case 'height': setContentHeight(msg.height); break;
            case 'state': setState(msg.state); onStateChange?.(msg.state); break;
            case 'focus': setFocused(true); onFocus?.(); break;
            case 'blur': setFocused(false); onBlur?.(); break;
            case 'mention': setMentionQuery(msg.query); mentions?.onSearch?.(msg.query); break;
            case 'custom': onCustomEvent?.(msg.event, msg.data); break;
            // Un comando propio con un error: se avisa en la consola (no rompe el editor)
            case 'error': console.warn(`[RichTextEditor] ${msg.message}`); break;
        }
    };

    // Enlace: un modal con la URL (y el texto si no hay nada seleccionado)
    const askLink = async () => {
        const current = state.link ?? '';
        const result = await openModal<null, { url: string; text: string } | 'remove'>({
            _contentStyle: { h: 'auto', my: 'auto', mx: 6, roundedTop: 16, roundedBottom: 16 },
            children: ({ close }) => <LinkForm initialUrl={current} askText={!state.selection && !current} canRemove={!!current} onDone={close} />,
        }).result;
        if (result === 'remove') command('link', null);
        else if (result?.url) command('link', { url: /^[a-z][a-z0-9+.-]*:/i.test(result.url) ? result.url : `https://${result.url}`, text: result.text });
    };

    const askImage = async () => {
        const src = onImagePick
            ? await onImagePick()
            : await openModal<null, string>({
                _contentStyle: { h: 'auto', my: 'auto', mx: 6, roundedTop: 16, roundedBottom: 16 },
                children: ({ close }) => <ImageForm onDone={close} />,
            }).result;
        if (src) command('image', src);
    };

    const mentionList = useMemo(() => {
        if (!mentions || mentionQuery === null) return [];
        const q = mentionQuery.toLowerCase();
        return mentions.data
            .map(m => (typeof m === 'string' ? { id: m, label: m } : m))
            .filter(m => m.label.toLowerCase().includes(q))
            .slice(0, mentions.max ?? 5);
    }, [mentions, mentionQuery]);

    const items = toolbar === false ? [] : toolbar;
    // Flechas a los lados cuando la barra tiene más botones de los que caben (y se puede hacer scroll)
    const barRef = useRef<RNScrollView>(null);
    const [barScroll, setBarScroll] = useState({ x: 0, view: 0, content: 0 });
    const canLeft = barScroll.x > 4;
    const canRight = barScroll.content - barScroll.view - barScroll.x > 4;
    const scrollBar = (dir: 1 | -1) => barRef.current?.scrollTo({ x: Math.max(0, barScroll.x + dir * barScroll.view * 0.7), animated: true });
    // Las medidas del propio evento de scroll son las reales (onContentSizeChange podía no coincidir con lo
    // que de verdad se puede desplazar, y la flecha se quedaba tapando el último botón)
    const onBarScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
        const next = { x: Math.round(contentOffset.x), view: Math.round(layoutMeasurement?.width ?? 0), content: Math.round(contentSize?.width ?? 0) };
        setBarScroll(b => {
            const n = { x: next.x, view: next.view || b.view, content: next.content || b.content };
            return n.x === b.x && n.view === b.view && n.content === b.content ? b : n;
        });
    };
    const arrowBg = color(String(_toolbar?.bg ?? _editor?.bg ?? 'surface'));
    const arrow = (dir: 1 | -1) => (
        <Pressable onPress={() => scrollBar(dir)} accessibilityRole="button" accessibilityLabel={dir > 0 ? '→' : '←'} hitSlop={6}
            style={{ position: 'absolute', top: 0, bottom: 0, [dir > 0 ? 'right' : 'left']: 0, justifyContent: 'center' }}>
            <Box h="100%" justifyContent="center" px={0.5} bg={arrowBg as any} style={{ shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 4, shadowOffset: { width: -dir * 2, height: 0 }, elevation: 3 }} {..._toolbarArrow}>
                <Icon as="MaterialCommunityIcons" name={dir > 0 ? 'chevron-right' : 'chevron-left'} size={20} color={'gray.100' as any} />
            </Box>
        </Pressable>
    );
    const bar = items.length > 0 && (
        <Box flexDir="row" {..._toolbar}>
            <RNScrollView
                ref={barRef} horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="always"
                onScroll={onBarScroll} onMomentumScrollEnd={onBarScroll} onScrollEndDrag={onBarScroll} scrollEventThrottle={32}
                onLayout={e => { const w = Math.round(e.nativeEvent.layout.width); setBarScroll(b => (b.view === w ? b : { ...b, view: w })) }}
                onContentSizeChange={w => { const c = Math.round(w); setBarScroll(b => (b.content === c ? b : { ...b, content: c })) }}
                contentContainerStyle={{ alignItems: 'center', gap: 2, paddingVertical: 4 }}
            >
                {items.map((item, i) => {
                    if (item === '|') return <View key={i} style={{ width: 1, height: 20, marginHorizontal: 4, backgroundColor: color('light.200') }} />;
                    if (typeof item === 'object') {
                        return <ToolButton key={item.key} label={item.key} icon={item.icon} accent={accent} disabled={disabled} _button={_toolbarButton}
                            active={item.isActive?.(state)} onPress={() => item.onPress(api())} />;
                    }
                    if (item === 'heading') return (
                        <Menu key={i} trigger={t => <ToolButton {...t} label={libT('heading', { n: '' })} icon={ICONS.heading} accent={accent} disabled={disabled} _button={_toolbarButton} active={/^h[1-6]$/.test(state.block ?? '')} />}>
                            <Menu.Item onPress={() => command('heading', 'p')}>{libT('normal')}</Menu.Item>
                            {([1, 2, 3] as const).map(n => <Menu.Item key={n} onPress={() => command('heading', `h${n}` as const)} _text={{ fontWeight: '700', fontSize: 20 - n * 2 }}>{libT('heading', { n })}</Menu.Item>)}
                        </Menu>
                    );
                    if (item === 'fontSize') return (
                        <Menu key={i} trigger={t => <ToolButton {...t} label={libT('fontNormal')} icon={ICONS.fontSize} accent={accent} disabled={disabled} _button={_toolbarButton} active={!!state.fontSize && state.fontSize !== '3'} />}>
                            {FONT_SIZES.map(f => <Menu.Item key={f.size} onPress={() => command('fontSize', f.size)}>{libT(f.key)}</Menu.Item>)}
                        </Menu>
                    );
                    if (item === 'textColor' || item === 'highlight') return (
                        <ColorMenu key={i} colors={(item === 'textColor' ? textColors : highlightColors).map(color)} accent={accent} disabled={disabled}
                            icon={ICONS[item]} label={libT(item)} _button={_toolbarButton} onPick={c => command(item, c)} />
                    );
                    if (item === 'table') return (
                        <Menu key={i} trigger={t => <ToolButton {...t} label={libT('table')} icon={ICONS.table} accent={accent} disabled={disabled} _button={_toolbarButton} active={!!state.table} />}>
                            {state.table
                                ? (['addRow', 'addColumn', 'deleteRow', 'deleteColumn', 'deleteTable'] as const).map(a => (
                                    <Menu.Item key={a} onPress={() => command('tableAction', a)} _text={a.startsWith('delete') ? { color: 'danger.100' } : undefined}>{libT(a)}</Menu.Item>
                                ))
                                : TABLE_SIZES.map(z => (
                                    <Menu.Item key={`${z.rows}x${z.cols}`} onPress={() => command('table', { ...z, header: true })}>{libT('insertTable', { size: `${z.cols} × ${z.rows}` })}</Menu.Item>
                                ))}
                        </Menu>
                    );
                    if (item === 'lineHeight') return (
                        <Menu key={i} trigger={t => <ToolButton {...t} label={libT('lineHeight')} icon={ICONS.lineHeight} accent={accent} disabled={disabled} _button={_toolbarButton} active={state.lineHeight != null} />}>
                            <Menu.Item onPress={() => command('lineHeight', null)} _text={state.lineHeight == null ? { fontWeight: '700', color: `${colorScheme}.100` } : undefined}>{libT('normal')}</Menu.Item>
                            {LINE_HEIGHTS.map(v => (
                                <Menu.Item key={v} onPress={() => command('lineHeight', v)} _text={state.lineHeight === v ? { fontWeight: '700', color: `${colorScheme}.100` } : undefined}>{String(v)}</Menu.Item>
                            ))}
                        </Menu>
                    );
                    if (item === 'letterSpacing') return (
                        <Menu key={i} trigger={t => <ToolButton {...t} label={libT('letterSpacing')} icon={ICONS.letterSpacing} accent={accent} disabled={disabled} _button={_toolbarButton} active={state.letterSpacing != null} />}>
                            <Menu.Item onPress={() => command('letterSpacing', null)} _text={state.letterSpacing == null ? { fontWeight: '700', color: `${colorScheme}.100` } : undefined}>{libT('normal')}</Menu.Item>
                            {LETTER_SPACINGS.map(v => (
                                <Menu.Item key={v} onPress={() => command('letterSpacing', v)} _text={{ letterSpacing: v, ...(state.letterSpacing === v && { fontWeight: '700', color: `${colorScheme}.100` }) }}>{`${v} px`}</Menu.Item>
                            ))}
                        </Menu>
                    );
                    if (item === 'image') return <ToolButton key={i} label={libT('insertImage')} icon={ICONS.image} accent={accent} disabled={disabled} _button={_toolbarButton} onPress={askImage} />;
                    if (item === 'link') return <ToolButton key={i} label={libT('insertLink')} icon={ICONS.link} accent={accent} disabled={disabled} _button={_toolbarButton} active={state.link != null} onPress={askLink} />;
                    const simple = SIMPLE[item];
                    if (!simple) return null;
                    return <ToolButton key={i} label={item} icon={ICONS[item]} accent={accent} disabled={disabled} _button={_toolbarButton}
                        active={simple.active ? !!state[simple.active] : false} onPress={() => command(simple.cmd)} />;
                })}
            </RNScrollView>
            {canLeft && arrow(-1)}
            {canRight && arrow(1)}
        </Box>
    );

    const webHeight = Math.min(maxHeight, Math.max(minHeight, contentHeight));
    const editorBox = { ..._editor, ...(focused ? _focus : null) };
    // Sin WebView no se crea el campo (se muestra el aviso de abajo)
    const field = WebView && (
        <Box
            borderWidth={1}
            rounded={1}
            overflow="hidden"
            {...editorBox}
            borderColor={error ? 'danger.100' : focused ? (_focus?.borderColor ?? accent as any) : (_editor?.borderColor ?? 'light.100')}
            onLayout={e => setFieldHeight(e.nativeEvent.layout.height)}
        >
            {toolbarPosition === 'top' && bar}
            {toolbarPosition === 'top' && bar && <View style={{ height: 1, backgroundColor: color('light.100') }} />}
            <WebView
                ref={web}
                originWhitelist={['*']}
                source={source}
                onMessage={onMessage}
                onLoadEnd={() => { loaded.current = true }}
                onShouldStartLoadWithRequest={req => !loaded.current || req.url === 'about:blank'}
                style={{ height: webHeight, backgroundColor: 'transparent' }}
                // El contenedor del WebView trae flex: 1: en un padre de alto automático (p. ej. un modal con
                // h="auto") se quedaba en 0. Con su alto explícito funciona en cualquier sitio
                containerStyle={{ backgroundColor: 'transparent', flex: 0, height: webHeight }}
                scrollEnabled={contentHeight > maxHeight}
                nestedScrollEnabled
                showsVerticalScrollIndicator={contentHeight > maxHeight}
                bounces={false}
                overScrollMode="never"
                hideKeyboardAccessoryView
                keyboardDisplayRequiresUserAction={false}
                automaticallyAdjustContentInsets={false}
                setSupportMultipleWindows={false}
                javaScriptEnabled
                accessibilityLabel={typeof label === 'string' ? label : placeholder}
            />
            {toolbarPosition === 'bottom' && bar && <View style={{ height: 1, backgroundColor: color('light.100') }} />}
            {toolbarPosition === 'bottom' && bar}
        </Box>
    );

    // api() para los botones propios: la misma que el ref
    const api = (): RichTextEditorRef => ({
        focus: () => run('window.__focus()'), blur: () => run('window.__blur()'), getHTML: () => html.current, getText: () => text.current,
        setHTML: h => { html.current = h; run(`window.__setHTML(${js(h)})`) }, insertHTML: h => command('insertHTML', h),
        insertText: t => command('insertText', t), command, clear: () => run(`window.__setHTML('')`),
    });

    if (!WebView) return <MissingWebView name="RichTextEditor" {...boxProps} />;

    return (
        <Box {...boxProps}>
            <View ref={root} collapsable={false}>
            {label ? (
                // El label flotante descansa en la primera línea del texto (no en el centro de toda la caja)
                <View>
                    <Label ref={labelRef} isFloat={isFloat} isRequired={isRequired}
                        fieldHeight={toolbarPosition === 'top' && bar ? 0 : Math.min(fieldHeight, 44)} {..._label}>{label}</Label>
                    {field}
                </View>
            ) : field}
            {mentionList.length > 0 && (
                <Box borderWidth={1} borderColor="light.100" rounded={1} mt={1} bg="surface" overflow="hidden" {..._mentionList}>
                    {mentionList.map((m, i) => (
                        <Pressable key={m.id} onPress={() => command('mention', m)} accessibilityRole="button"
                            style={({ pressed }) => ({ paddingHorizontal: 12, paddingVertical: 9, opacity: pressed ? 0.6 : 1, borderTopWidth: i ? 1 : 0, borderColor: color('light.50') })}>
                            <Text {..._mentionItem}>{`${mentions?.trigger ?? '@'}${m.label}`}</Text>
                        </Pressable>
                    ))}
                </Box>
            )}
            {!!error && <Text color="danger.100" fontSize={12} mt={1} {..._error}>{error}</Text>}
            </View>
        </Box>
    );
});

/** Menú de colores: una cuadrícula de muestras y "Sin color" */
const ColorMenu = ({ colors, icon, label, accent, disabled, _button, onPick }: {
    colors: string[]; icon: string; label: string; accent: string; disabled?: boolean; _button?: EABoxProps; onPick: (color: string | null) => void;
}) => {
    const menu = useRef<MenuRef>(null);
    const pick = (c: string | null) => { menu.current?.close(); onPick(c) };
    return (
        <Menu ref={menu} trigger={t => <ToolButton {...t} label={label} icon={icon} accent={accent} disabled={disabled} _button={_button} />}>
            <Box flexDir="row" flexWrap="wrap" gap={8} p={2.5} w={5 * 30 + 4 * 8 + 20}>
                {colors.map(c => (
                    <Pressable key={c} onPress={() => pick(c)} accessibilityRole="button" accessibilityLabel={c} hitSlop={3}
                        style={({ pressed }) => ({ width: 30, height: 30, borderRadius: 15, backgroundColor: c, opacity: pressed ? 0.6 : 1, borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)' })} />
                ))}
            </Box>
            <Menu.Item onPress={() => pick(null)}>{libT('noColor')}</Menu.Item>
        </Menu>
    );
};

/** El formulario de la imagen por URL (sin onImagePick) */
const ImageForm = ({ onDone }: { onDone: (src?: string) => void }) => {
    const [url, setUrl] = useState('');
    return (
        <Box p={5} gap={12}>
            <Text variant="h5">{libT('insertImage')}</Text>
            <Input label={libT('imageUrl')} value={url} onChangeText={setUrl} autoCapitalize="none" autoCorrect={false} keyboardType="url" autoFocus />
            <Box flexDir="row" gap={8}>
                <Button flex={1} variant="outline" onPress={() => onDone()}>{libT('cancel')}</Button>
                <Button flex={1} disabled={!/^(https?:|data:image\/)/i.test(url.trim())} onPress={() => onDone(url.trim())}>{libT('done')}</Button>
            </Box>
        </Box>
    );
};

/** El formulario del enlace (dentro del modal) */
const LinkForm = ({ initialUrl, askText, canRemove, onDone }: { initialUrl: string; askText: boolean; canRemove: boolean; onDone: (r?: { url: string; text: string } | 'remove') => void }) => {
    const [url, setUrl] = useState(initialUrl);
    const [linkText, setLinkText] = useState('');
    return (
        <Box p={5} gap={12}>
            <Text variant="h5">{libT('insertLink')}</Text>
            <Input label={libT('linkUrl')} value={url} onChangeText={setUrl} autoCapitalize="none" autoCorrect={false} keyboardType="url" autoFocus />
            {askText && <Input label={libT('linkText')} value={linkText} onChangeText={setLinkText} />}
            <Box flexDir="row" gap={8}>
                {canRemove && <Button flex={1} variant="outline" colorScheme="danger" onPress={() => onDone('remove')}>{libT('removeLink')}</Button>}
                <Button flex={1} variant="outline" onPress={() => onDone()}>{libT('cancel')}</Button>
                <Button flex={1} disabled={!url.trim()} onPress={() => onDone({ url: url.trim(), text: linkText.trim() })}>{libT('done')}</Button>
            </Box>
        </Box>
    );
};

/** Con formGroup: valor (HTML), error, disabled y required salen del formulario */
const FormRichTextEditor = forwardRef<RichTextEditorRef, BaseProps & { formGroup: FormGroupRef<any>; formControl: string }>(({ formGroup, formControl, ...p }, ref) => {
    const control = useFormControl(formGroup, formControl);
    return (
        <RichTextEditorBase
            ref={ref}
            {...p}
            value={control.value ?? ''}
            error={control.error || p.error}
            disabled={control.disabled || p.disabled}
            isRequired={p.isRequired ?? !!control.validation?.required}
            onChange={(h, t) => { control.setValue(h); p.onChange?.(h, t) }}
        />
    );
});

/**
 * Editor de texto enriquecido (HTML). Necesita react-native-webview (dependencia opcional: instálala para usarlo)
 * @example <RichTextEditor label="Descripción" isFloat onChange={html => setHtml(html)} />
 * @example <RichTextEditor formGroup={form} formControl="comentario" mentions={{ data: usuarios }} />
 */
export const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>((props, ref) => {
    // Defaults → theme.components.RichTextEditor → variante → props → plataforma
    const [p, theme] = useThemeProps<RichTextEditorProps>('RichTextEditor', props);
    return p.formGroup && p.formControl
        ? <FormRichTextEditor ref={ref} {...p} formGroup={p.formGroup} formControl={p.formControl} theme={theme} />
        : <RichTextEditorBase ref={ref} {...p} theme={theme} />;
});
