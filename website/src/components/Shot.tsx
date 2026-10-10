import fs from 'node:fs';
import path from 'node:path';
import Image from 'next/image';

/** Capturas de la app de pruebas (public/shots/*.png), en un marco de móvil. Si no existe, no pinta nada */
export function Shots({ names, alt }: { names?: string[]; alt: string }) {
    const files = (names ?? []).filter(n => fs.existsSync(path.join(process.cwd(), 'public', 'shots', `${n}.png`)));
    if (!files.length) return null;
    return (
        <div className="flex max-w-full gap-4 overflow-x-auto pb-2">
            {files.map(n => (
                <div key={n} className="w-[200px] shrink-0 sm:w-[270px] rounded-[2rem] border-[6px] border-zinc-900 bg-zinc-900 shadow-xl dark:border-zinc-700">
                    <Image src={`/shots/${n}.png`} alt={alt} width={270} height={585} className="h-auto w-full rounded-[1.6rem]" />
                </div>
            ))}
        </div>
    );
}
