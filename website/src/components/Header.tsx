import Link from 'next/link';
import { Search } from './Search';

/** El logo: completo (con el texto claro en modo oscuro) y, en pantallas pequeñas, solo el icono */
export function Logo() {
    return (
        <Link href="/" aria-label="easynat, inicio" className="flex shrink-0 items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo/icon.png" alt="easynat" width={60} height={22} className="h-[22px] w-auto sm:hidden" />
            <picture className="hidden sm:block">
                <source srcSet="/logo/logo-dark.png" media="(prefers-color-scheme: dark)" />
                <img src="/logo/logo.png" alt="easynat" width={184} height={26} className="h-[26px] w-auto" />
            </picture>
        </Link>
    );
}

export function Header() {
    return (
        <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
            <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-4">
                <Logo />
                <nav className="flex min-w-0 items-center gap-4 text-sm text-muted sm:gap-5">
                    <Link href="/docs" className="hover:text-foreground">Docs</Link>
                    <Link href="/docs/componentes" className="hover:text-foreground">Componentes</Link>
                    <Link href="/galeria" className="hidden hover:text-foreground sm:inline">Galería</Link>
                    <Link href="/docs/api" className="hidden hover:text-foreground sm:inline">Funciones</Link>
                </nav>
                <div className="ml-auto flex items-center gap-4">
                    <Search />
                </div>
            </div>
        </header>
    );
}
