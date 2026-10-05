'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { useAuth } from '@/auth/AuthContext';
import { Logo } from '@/components/Logo';
import { PageLoader } from '@/components/ui';

const NAV = [
  { href: '/app/admin', label: 'Overview', exact: true },
  { href: '/app/admin/organizations', label: 'Organizations' },
  { href: '/app/admin/users', label: 'Users' },
  { href: '/app/admin/activity', label: 'Audit log' },
];

/** Platform-owner area. Hidden from everyone else; the API enforces it too. */
export function AdminShell({ children }: { children: ReactNode }) {
  const { me } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (me && !me.isSuperAdmin) router.replace('/app');
  }, [me, router]);

  if (!me?.isSuperAdmin) return <PageLoader fullScreen />;

  return (
    <div className="min-h-svh">
      <header className="border-b border-slate-800 bg-slate-900">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <Logo dark className="[&_img]:size-7 [&_span]:text-base" />
            <span className="rounded bg-amber-400/15 px-1.5 py-0.5 text-xs font-semibold text-amber-300">Admin</span>
          </div>
          <nav className="flex flex-1 flex-wrap gap-1">
            {NAV.map((item) => {
              // startsWith also matches the singular detail page (/app/admin/organization).
              const active = item.exact ? pathname === item.href : pathname.startsWith(item.href.replace(/s$/, ''));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                    active ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <Link href="/app" className="text-sm text-slate-400 hover:text-white">
            ← Back to app
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}

export function Pagination({
  page,
  pageSize,
  total,
  onPage,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPage: (page: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
      <span>
        {total === 0 ? 'No results' : `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)} of ${total}`}
      </span>
      <div className="flex gap-2">
        <button
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
          className="rounded-md px-3 py-1.5 font-medium ring-1 ring-slate-300 hover:bg-white disabled:opacity-40"
        >
          Previous
        </button>
        <button
          disabled={page >= pages}
          onClick={() => onPage(page + 1)}
          className="rounded-md px-3 py-1.5 font-medium ring-1 ring-slate-300 hover:bg-white disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
