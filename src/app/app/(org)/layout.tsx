import { Suspense, type ReactNode } from 'react';
import { PageLoader } from '@/components/ui';
import { OrgShell } from '@/components/OrgShell';

/** Every page under /app/<page>?org=<id>: resolves the org, then shows the sidebar shell. */
export default function OrgLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<PageLoader fullScreen />}>
      <OrgShell>{children}</OrgShell>
    </Suspense>
  );
}
