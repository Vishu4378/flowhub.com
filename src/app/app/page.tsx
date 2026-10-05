'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/auth/AuthContext';
import { PageLoader } from '@/components/ui';
import { lastOrg } from '@/lib/lastOrg';
import { routes } from '@/lib/routes';

/** Sends the user to their last-used organization, or prompts them to create one. */
export default function AppHome() {
  const { me } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!me) return;
    const organizations = me.organizations;
    if (organizations.length === 0) {
      router.replace('/app/organizations/new');
      return;
    }
    const last = lastOrg();
    const target = organizations.find((o) => o.id === last) ?? organizations[0]!;
    router.replace(routes.org(target.id, 'overview'));
  }, [me, router]);

  return <PageLoader fullScreen />;
}
