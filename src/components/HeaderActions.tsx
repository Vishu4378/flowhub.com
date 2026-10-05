'use client';

import Link from 'next/link';
import { useAuth } from '@/auth/AuthContext';

const primary =
  'rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-xs hover:bg-indigo-500';

/** Static pages render the signed-out buttons; signed-in visitors get a shortcut to the app. */
export function HeaderActions() {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return (
      <Link href="/app" className={primary}>
        Open app
      </Link>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <Link href="/pricing" className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:text-slate-900">
        Pricing
      </Link>
      <Link href="/login" className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:text-slate-900">
        Sign in
      </Link>
      <Link href="/register" className={primary}>
        Get started
      </Link>
    </div>
  );
}
