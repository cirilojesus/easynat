import { highlight } from '@/lib/highlight';
import { CopyButton } from './CopyButton';

export async function CodeBlock({ code, lang = 'tsx', title }: { code: string; lang?: 'tsx' | 'ts' | 'bash' | 'json'; title?: string }) {
    const html = await highlight(code, lang);
    return (
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
            <div className="flex items-center justify-between border-b border-border px-3 py-1.5">
                <span className="text-xs text-muted">{title ?? lang}</span>
                <CopyButton text={code.trim()} />
            </div>
            <div className="shiki-wrap" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
    );
}
