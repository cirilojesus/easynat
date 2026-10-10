'use client';
import { useState } from 'react';

export function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);
    return (
        <button
            type="button"
            onClick={async () => {
                try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500) } catch { }
            }}
            className="rounded-md border border-border bg-background/80 px-2 py-1 text-xs text-muted backdrop-blur transition hover:text-foreground"
            aria-label="Copiar código"
        >
            {copied ? '¡Copiado!' : 'Copiar'}
        </button>
    );
}
