import { useEffect, useState } from 'react';
import { Navigate, NavLink, Outlet, useParams } from 'react-router';
import { useAuth } from '../auth/AuthContext';
import { OrgSwitcher } from '../components/OrgSwitcher';
import { Avatar } from '../components/ui';
import { initials } from '../lib/format';
import { rememberOrg } from '../pages/HomeRedirect';
import type { Organization } from '../lib/types';

export interface OrgOutletContext {
  org: Organization;
}

const NAV = [
  { to: 'projects', label: 'Projects' },
  { to: 'members', label: 'Members' },
  { to: 'settings', label: 'Settings' },
];

export function AppLayout() {
  const { orgId } = useParams();
  const { me, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const organizations = me?.organizations ?? [];
  const org = organizations.find((o) => o.id === orgId);
  useEffect(() => {
    if (org) rememberOrg(org.id);
  }, [org]);
  if (!org) return <Navigate to="/" replace />;

  const sidebar = (
    <div className="flex h-full flex-col gap-6 bg-slate-900 px-4 py-5">
      <div className="flex items-center gap-2 px-2">
        <img src="/favicon.svg" alt="" className="size-7" />
        <span className="font-semibold text-white">FlowHub</span>
      </div>
      <OrgSwitcher organizations={organizations} currentId={org.id} />
      <nav className="flex flex-1 flex-col gap-1">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) =>
              `rounded-md px-3 py-2 text-sm font-medium ${
                isActive ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="flex items-center gap-3 border-t border-slate-800 px-2 pt-4">
        <Avatar label={initials(me!.user.name)} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-white">{me!.user.name}</p>
          <p className="truncate text-xs text-slate-400">{me!.user.email}</p>
        </div>
        <button onClick={signOut} className="text-xs text-slate-400 hover:text-white">
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-svh lg:pl-64">
      <aside className="fixed inset-y-0 left-0 hidden w-64 lg:block">{sidebar}</aside>

      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setMenuOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64">{sidebar}</aside>
        </div>
      )}

      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        <button onClick={() => setMenuOpen(true)} aria-label="Open menu" className="rounded p-1 text-slate-600 hover:bg-slate-100">
          <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
          </svg>
        </button>
        <span className="truncate font-semibold">{org.name}</span>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet context={{ org } satisfies OrgOutletContext} />
      </main>
    </div>
  );
}
