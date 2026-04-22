'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/',               icon: 'home',                       label: 'Overview' },
  { href: '/impact',         icon: 'route',                      label: 'Impact Explorer' },
  { href: '/audit',          icon: 'monitoring',                label: 'Metrics' },
  { href: '/code-audit',     icon: 'analytics',                  label: 'Debt Analyzer' },
  { href: '/docs/technical', icon: 'description',               label: 'Technical Spec' },
  { href: '/docs/functional',icon: 'translate',                 label: 'Functional Logic' },
  { href: '/docs/system-overview', icon: 'hub',                  label: 'Knowledge Sync' },
  { href: '/use-cases',      icon: 'fact_check',                 label: 'Use Cases' },
  { href: '/onboarding',     icon: 'school',                     label: 'Onboarding' },
  { href: '/docquery',       icon: 'psychology',                 label: 'AI Assistant' },
];

export function SideNavBar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-24 h-[calc(100vh-6rem)] bg-slate-950/60 backdrop-blur-2xl w-64 border-r border-white/5 flex flex-col z-30">
      <div className="flex-1 overflow-y-auto px-4 pt-10 flex flex-col gap-1.5 font-medium text-sm">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl transition-all duration-300 group ${
                isActive
                  ? 'bg-primary-container text-on-primary-container shadow-lg shadow-primary-container/20'
                  : 'text-on-surface-variant hover:bg-white/5 hover:text-on-surface'
              }`}
            >
              <span className={`material-symbols-outlined text-[1.2rem] ${isActive ? 'fill-1' : ''}`}>
                {item.icon}
              </span>
              <span className="tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="p-6 border-t border-white/5">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low border border-white/5">
          <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(195,192,255,0.8)]"></div>
          <div className="text-[10px] uppercase font-bold tracking-widest opacity-50">Mainframe Link ACTIVE</div>
        </div>
      </div>
    </aside>
  );
}
