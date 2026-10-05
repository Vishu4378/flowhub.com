'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { PageLoader } from '@/components/ui';
import { useAuth } from './AuthContext';

/**
 * Only post-login paths inside the app (or an invite link) are honoured, so a
 * crafted ?next= can't bounce users to another site.
 */
export function safeNext(next: string | null): string {
  if (!next || next.startsWith('//')) return '/app';
  return next.startsWith('/app') || next.startsWith('/invite?') ? next : '/app';
}

/** Dashboard routes; bounces to /login and remembers where to return. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Keep the query string: it carries the org (and project) id.
      const here = `${pathname}${window.location.search}`;
      router.replace(`/login?next=${encodeURIComponent(here)}`);
    }
  }, [isLoading, isAuthenticated, router, pathname]);

  if (!isAuthenticated) return <PageLoader fullScreen />;
  return children;
}

/** Login and register; signed-in users go on to ?next= or the app. */
export function GuestOnly({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) return;
    const next = new URLSearchParams(window.location.search).get('next');
    router.replace(safeNext(next));
  }, [isAuthenticated, router]);

  if (isLoading || isAuthenticated) return <PageLoader fullScreen />;
  return children;
}
