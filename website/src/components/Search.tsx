'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { SearchEntry, SearchKind } from '@/lib/search';

// Sin acentos ni mayúsculas: "configuración" encuentra "configuracion"
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// Primero lo más útil a igualdad de puntuación
const KIND_WEIGHT: Record<SearchKind, number> = { Componente: 6, Guía: 5, Sección: 4, Función: 4, Variante: 3, Ejemplo: 2, Prop: 2, Tipo: 1 };

type Indexed = SearchEntry & { nt: string; nd: string };

/**
 * Puntuación de una entrada: todas las palabras tienen que estar (en el título, en dónde está o en el texto). Una prop o
 * un tipo necesita además alguna en su nombre o su texto (si no, "spinner" sacaría todas las props del Spinner)
 */
const score = (e: Indexed, words: string[], whole: string) => {
    let s = 0, direct = false;
    for (const w of words) {
        if (e.nt === w) { s += 100; direct = true; }
        else if (e.nt.startsWith(w)) { s += 60; direct = true; }
        else if (e.nt.includes(w)) { s += 35; direct = true; }
        else if (e.p && norm(e.p).includes(w)) s += 15;
        else if (e.nd.includes(w)) { s += 8; direct = true; }
        else return 0;
    }
    if (!direct && (e.k === 'Prop' || e.k === 'Tipo')) return 0;
    if (words.length > 1 && e.nt.includes(whole)) s += 40;
    return s + KIND_WEIGHT[e.k] - e.nt.length / 50;
};

/** Resalta las palabras buscadas */
function Mark({ text, words }: { text: string; words: string[] }) {
    if (!words.length) return <>{text}</>;
    const n = norm(text);
    const marks: [number, number][] = [];
    for (const w of words) {
        let i = n.indexOf(w);
        while (i !== -1 && w) { marks.push([i, i + w.length]); i = n.indexOf(w, i + w.length); }
    }
    if (!marks.length) return <>{text}</>;
    marks.sort((a, b) => a[0] - b[0]);
    const parts: React.ReactNode[] = [];
    let last = 0;
    for (const [a, b] of marks) {
        if (a < last) continue;
        parts.push(text.slice(last, a), <mark key={a} className="rounded bg-brand/20 px-0.5 text-inherit">{text.slice(a, b)}</mark>);
        last = b;
    }
    parts.push(text.slice(last));
    return <>{parts}</>;
}

/** Un trozo del texto alrededor de la primera palabra encontrada */
const snippet = (d: string, words: string[]) => {
    const n = norm(d);
    const i = Math.min(...words.map(w => n.indexOf(w)).filter(i => i >= 0));
    if (!Number.isFinite(i) || i < 60) return d;
    return '…' + d.slice(i - 40);
};

const KIND_STYLE: Record<SearchKind, string> = {
    Componente: 'bg-brand/15 text-brand', Guía: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    Sección: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', Función: 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
    Variante: 'bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-400', Ejemplo: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
    Prop: 'bg-zinc-500/15 text-foreground/80', Tipo: 'bg-zinc-500/10 text-muted',
};

const FILTERS: (SearchKind | 'Todo')[] = ['Todo', 'Componente', 'Prop', 'Función', 'Ejemplo', 'Tipo', 'Guía'];

export function Search() {
    const [open, setOpen] = useState(false);
    const [q, setQ] = useState('');
    const [filter, setFilterState] = useState<SearchKind | 'Todo'>('Todo');
    const [index, setIndex] = useState<Indexed[] | null>(null);
    const [active, setActive] = useState(0);
    const input = useRef<HTMLInputElement>(null);
    const list = useRef<HTMLUListElement>(null);
    const router = useRouter();
    // Al cambiar la búsqueda o el filtro, el primer resultado vuelve a ser el activo
    const search = (v: string) => { setQ(v); setActive(0); };
    const setFilter = (f: SearchKind | 'Todo') => { setFilterState(f); setActive(0); };

    // El índice se descarga la primera vez que se abre
    useEffect(() => {
        if (!open || index) return;
        fetch('/search-index.json').then(r => r.json()).then((data: SearchEntry[]) =>
            setIndex(data.map(e => ({ ...e, nt: norm(e.t), nd: norm(e.d ?? '') }))));
    }, [open, index]);

    // ⌘K / Ctrl+K y "/" abren el buscador; Esc lo cierra (esté donde esté el foco)
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') { setOpen(false); return; }
            const typing = (e.target as HTMLElement)?.closest('input, textarea, [contenteditable]');
            if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) { e.preventDefault(); setOpen(o => !o); }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);
    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = prev; };
    }, [open]);

    const words = useMemo(() => norm(q).split(/\s+/).filter(Boolean), [q]);
    const results = useMemo(() => {
        if (!index || !words.length) return [];
        const whole = words.join(' ');
        return index
            .filter(e => filter === 'Todo' || e.k === filter || (filter === 'Guía' && e.k === 'Sección'))
            .map(e => [e, score(e, words, whole)] as const)
            .filter(([, s]) => s > 0)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 50)
            .map(([e]) => e);
    }, [index, words, filter]);
    useEffect(() => { list.current?.querySelector(`[data-i="${active}"]`)?.scrollIntoView({ block: 'nearest' }); }, [active]);

    const go = useCallback((e: SearchEntry) => {
        setOpen(false);
        router.push(e.u);
    }, [router]);

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a + 1, results.length - 1)); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(a - 1, 0)); }
        else if (e.key === 'Enter' && results[active]) { e.preventDefault(); go(results[active]); }
        else if (e.key === 'Tab') {
            e.preventDefault();
            const i = FILTERS.indexOf(filter);
            setFilter(FILTERS[(i + (e.shiftKey ? FILTERS.length - 1 : 1)) % FILTERS.length]);
        }
    };

    return (
        <>
            <button onClick={() => setOpen(true)} aria-label="Buscar en la documentación"
                className="flex items-center gap-2 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-sm text-muted hover:border-brand/50 hover:text-foreground sm:w-56">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
                <span className="hidden sm:inline">Buscar…</span>
                <kbd className="ml-auto hidden rounded border border-border px-1.5 font-mono text-[10px] sm:inline">⌘K</kbd>
            </button>

            {open && (
                <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-3 pt-[8vh] backdrop-blur-sm sm:p-6 sm:pt-[12vh]" onMouseDown={() => setOpen(false)}>
                    <div role="dialog" aria-modal="true" aria-label="Buscar"
                        className="flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
                        onMouseDown={e => e.stopPropagation()}>
                        <div className="flex shrink-0 items-center gap-3 border-b border-border px-4">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="shrink-0 text-muted"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
                            {/* La búsqueda anterior se queda, seleccionada: escribir la reemplaza */}
                            <input ref={input} autoFocus onFocus={e => e.target.select()} value={q} onChange={e => search(e.target.value)} onKeyDown={onKeyDown}
                                placeholder="Componentes, props, funciones, ejemplos…"
                                className="h-14 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted" />
                            <button onClick={() => setOpen(false)} className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted">ESC</button>
                        </div>
                        <div className="flex shrink-0 gap-1.5 overflow-x-auto border-b border-border px-4 py-2">
                            {FILTERS.map(f => (
                                <button key={f} onClick={() => { setFilter(f); input.current?.focus(); }}
                                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs ${filter === f ? 'bg-brand text-white' : 'bg-surface text-muted hover:text-foreground'}`}>
                                    {f === 'Todo' ? 'Todo' : f === 'Guía' ? 'Guías' : f === 'Función' ? 'Funciones' : f + 's'}
                                </button>
                            ))}
                        </div>
                        <ul ref={list} className="min-h-0 flex-1 overflow-y-auto p-2">
                            {!index && <li className="p-6 text-center text-sm text-muted">Cargando…</li>}
                            {index && !words.length && (
                                <li className="space-y-2 p-6 text-center text-sm text-muted">
                                    <p>Busca en toda la documentación: {index.length.toLocaleString('es')} entradas.</p>
                                    <p className="text-xs">Prueba con <i>modo oscuro</i>, <i>onPress</i>, <i>showSpinner</i>, <i>colSpan</i> o <i>validación email</i>.</p>
                                </li>
                            )}
                            {index && words.length > 0 && !results.length && <li className="p-6 text-center text-sm text-muted">Sin resultados para «{q}»</li>}
                            {results.map((e, i) => (
                                <li key={e.u + e.t + i} data-i={i}>
                                    <a href={e.u} onClick={ev => { ev.preventDefault(); go(e); }} onMouseMove={() => setActive(i)}
                                        className={`block rounded-xl px-3 py-2.5 ${i === active ? 'bg-brand/10' : ''}`}>
                                        <span className="flex min-w-0 items-center gap-2">
                                            <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${KIND_STYLE[e.k]}`}>{e.k}</span>
                                            <span className={`truncate font-medium ${['Prop', 'Función', 'Tipo', 'Variante'].includes(e.k) ? 'font-mono text-sm' : ''}`}><Mark text={e.t} words={words} /></span>
                                            {e.p && <span className="ml-auto max-w-[35%] shrink-0 truncate sm:max-w-[45%] pl-2 text-xs text-muted">{e.p}</span>}
                                        </span>
                                        {e.d && <span className="mt-1 line-clamp-2 text-xs text-muted"><Mark text={snippet(e.d, words)} words={words} /></span>}
                                    </a>
                                </li>
                            ))}
                        </ul>
                        <div className="hidden shrink-0 items-center gap-4 border-t border-border px-4 py-2 text-[11px] text-muted sm:flex">
                            <span><kbd className="font-mono">↑↓</kbd> moverse</span><span><kbd className="font-mono">↵</kbd> abrir</span>
                            <span><kbd className="font-mono">Tab</kbd> filtro</span><span><kbd className="font-mono">Esc</kbd> cerrar</span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
