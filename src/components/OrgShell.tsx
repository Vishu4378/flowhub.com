'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { DashboardShell } from '@/components/DashboardShell';
import { PageLoader } from '@/components/ui';

/** Reads ?org= and hands it to the shell; without one, go pick an org. */
export function OrgShell({ children }: { children: ReactNode }) {
  const orgId = useSearchParams().get('org');
  const router = useRouter();

  useEffect(() => {
    if (!orgId) router.replace('/app');
  }, [orgId, router]);

  if (!orgId) return <PageLoader fullScreen />;
  return <DashboardShell orgId={orgId}>{children}</DashboardShell>;
}
