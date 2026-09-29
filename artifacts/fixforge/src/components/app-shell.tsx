import { Link, useLocation } from 'wouter';
import { Activity, ArrowUpRight, ChevronRight, CircleDot, Command, GitBranch, History, LayoutDashboard, Plus, Wrench } from 'lucide-react';
import { type ReactNode } from 'react';

const navItems = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/repairs', label: 'Repairs', icon: History },
];

export function AppShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return (
    <div className="ff-noise min-h-[100dvh] bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex">
        <div className="flex h-20 items-center gap-3 border-b border-sidebar-border px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-accent-foreground shadow-[0_0_0_5px_rgba(231,169,58,.12)]">
            <Wrench size={18} strokeWidth={2.5} />
          </div>
          <div>
            <div className="font-semibold tracking-tight text-white">FixForge</div>
            <div className="ff-mono text-[9px] uppercase tracking-[.22em] text-sidebar-foreground/55">repair control room</div>
          </div>
        </div>
        <div className="flex-1 px-3 py-7">
          <div className="mb-3 px-3 ff-mono text-[10px] uppercase tracking-[.24em] text-sidebar-foreground/45">Workspace</div>
          <nav className="space-y-1">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = href === '/' ? location === '/' : location.startsWith(href === '/projects/demo' ? '/projects' : href);
              return (
                <Link key={href} href={href} data-testid={`link-nav-${label.toLowerCase()}`} className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${active ? 'bg-sidebar-accent text-white' : 'text-sidebar-foreground/65 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground'}`}>
                  <Icon size={16} className={active ? 'text-accent' : 'text-sidebar-foreground/50 group-hover:text-sidebar-foreground'} />
                  <span className="flex-1">{label}</span>
                  {active && <ChevronRight size={14} className="text-sidebar-foreground/35" />}
                </Link>
              );
            })}
          </nav>
          <div className="mt-9 mb-3 px-3 ff-mono text-[10px] uppercase tracking-[.24em] text-sidebar-foreground/45">System</div>
          <div className="rounded-xl border border-sidebar-border bg-sidebar-accent/45 p-3">
            <div className="mb-3 flex items-center gap-2 text-xs font-medium text-sidebar-foreground/80"><CircleDot size={13} className="text-emerald-400" /> All systems nominal</div>
            <div className="space-y-2">
              {['Node API', 'Postgres', 'Forge Engine'].map((service) => (
                <div key={service} className="flex items-center justify-between text-[11px] text-sidebar-foreground/50">
                  <span>{service}</span><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center justify-between text-[11px] text-sidebar-foreground/45"><span className="ff-mono">v0.1.0</span><Command size={14} /></div>
        </div>
      </aside>
      <div className="lg:pl-[248px]">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/80 bg-background/90 px-5 backdrop-blur-md lg:px-10">
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Wrench size={15} /></div>
            <span className="font-semibold">FixForge</span>
          </div>
          <div className="hidden items-center gap-2 text-xs text-muted-foreground lg:flex"><Activity size={14} className="text-accent" /> Live workspace <span className="h-1 w-1 rounded-full bg-muted-foreground/50" /> Production</div>
          <div className="flex items-center gap-3">
            <Link href="/new-repair" data-testid="link-header-new-repair" className="inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:-translate-y-px hover:bg-primary/90"><Plus size={15} /> New repair</Link>
            <div className="hidden h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-xs font-semibold lg:flex" data-testid="text-user-avatar">FM</div>
          </div>
        </header>
        <nav className="flex items-center gap-1 border-b border-border/70 bg-background px-4 py-2 lg:hidden">
          <Link href="/" data-testid="link-mobile-overview" className={`rounded-md px-3 py-1.5 text-xs font-medium ${location === '/' ? 'bg-secondary text-foreground' : 'text-muted-foreground'}`}>Overview</Link>
          <Link href="/repairs" data-testid="link-mobile-repairs" className={`rounded-md px-3 py-1.5 text-xs font-medium ${location.startsWith('/repairs') ? 'bg-secondary text-foreground' : 'text-muted-foreground'}`}>Repairs</Link>
        </nav>
        <main className="ff-grid min-h-[calc(100dvh-4rem)] px-5 py-8 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  );
}

export function RepoMark({ value }: { value: string }) {
  return <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground"><GitBranch size={15} /></div>;
}

export function ExternalArrow() { return <ArrowUpRight size={14} />; }