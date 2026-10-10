import { Sidebar, type NavGroup } from '@/components/Sidebar';
import { byCategory, GUIDES } from '@/content';

export default function DocsLayout({ children }: LayoutProps<'/docs'>) {
    const groups: NavGroup[] = [
        { title: 'Empezar', items: GUIDES.map(g => ({ title: g.title, href: g.href })) },
        ...byCategory().map(c => ({ title: c.id, items: c.items.map(i => ({ title: i.name, href: `/docs/componentes/${i.slug}` })) })),
    ];
    return (
        <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-8 lg:flex-row">
            <Sidebar groups={groups} />
            <main className="min-w-0 flex-1 pb-24">{children}</main>
        </div>
    );
}
