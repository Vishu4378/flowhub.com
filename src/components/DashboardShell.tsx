'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { useAuth } from '@/auth/AuthContext';
import { Logo } from '@/components/Logo';
import { NotificationsBell } from '@/components/NotificationsPanel';
import { VerifyEmailBanner } from '@/components/VerifyEmailBanner';
import { OrgSwitcher } from '@/components/OrgSwitcher';
import { Avatar, PageLoader } from '@/components/ui';
import { initials } from '@/lib/format';
import { rememberOrg } from '@/lib/lastOrg';
import { OrgContext } from '@/lib/useOrg';

const NAV = [
  { segment: 'overview', label: 'Overview' },
  { segment: 'projects', label: 'Projects' },
  { segment: 'members', label: 'Members' },
  { segment: 'billing', label: 'Billing' },
  { segment: 'settings', label: 'Settings' },
];

/** Sidebar layout for every /app/orgs/[orgId] page; resolves and provides the org. */
export function DashboardShell({ orgId, children }: { orgId: string; children: ReactNode }) {
  const { me, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  // Remembers the page the mobile menu was opened on, so navigating closes it.
  const [menuOpenOn, setMenuOpenOn] = useState<string | null>(null);
  const menuOpen = menuOpenOn === pathname;
  const setMenuOpen = (open: boolean) => setMenuOpenOn(open ? pathname : null);

  const organizations = me?.organizations ?? [];
  const org = organizations.find((o) => o.id === orgId);

  useEffect(() => {
    if (org) rememberOrg(org.id);
    else if (me) router.replace('/app');
  }, [org, me, router]);

  if (!org || !me) return <PageLoader fullScreen />;

  const base = `/app/orgs/${org.id}`;
  const sidebar = (
    <div className="flex h-full flex-col gap-6 bg-slate-900 px-4 py-5">
      <div className="flex items-center justify-between px-2">
        <Logo dark className="[&_img]:size-7 [&_span]:text-base" />
        <NotificationsBell />
      </div>
      <OrgSwitcher organizations={organizations} currentId={org.id} />
      <nav className="flex flex-1 flex-col gap-1">
        {NAV.map((item) => {
          const href = `${base}/${item.segment}`;
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={item.segment}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={`rounded-md px-3 py-2 text-sm font-medium ${
                active ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="flex items-center gap-3 border-t border-slate-800 px-2 pt-4">
        <Avatar label={initials(me.user.name)} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-white">{me.user.name}</p>
          <p className="truncate text-xs text-slate-400">{me.user.email}</p>
        </div>
        <button onClick={signOut} className="text-xs text-slate-400 hover:text-white">
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <OrgContext value={org}>
      <div className="min-h-svh lg:pl-64">
        <aside className="fixed inset-y-0 left-0 hidden w-64 lg:block">{sidebar}</aside>

        {menuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-slate-900/50" onClick={() => setMenuOpen(false)} />
            <aside className="absolute inset-y-0 left-0 w-64">{sidebar}</aside>
          </div>
        )}

        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="rounded p-1 text-slate-600 hover:bg-slate-100"
          >
            <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
            </svg>
          </button>
          <span className="flex-1 truncate font-semibold">{org.name}</span>
          <NotificationsBell light />
        </header>

        <VerifyEmailBanner />
        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </div>
    </OrgContext>
  );
}
