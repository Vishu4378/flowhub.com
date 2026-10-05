import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PageLoader } from '@/components/ui';
import { InvitePage } from '@/views/InvitePage';

export const metadata: Metadata = { title: 'Invitation' };

export default function Page() {
  return (
    <Suspense fallback={<PageLoader fullScreen />}>
      <InvitePage />
    </Suspense>
  );
}
