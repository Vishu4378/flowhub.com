import { Suspense } from 'react';
import { PageLoader } from '@/components/ui';
import { AdminOrganizationPage } from '@/views/admin/AdminOrganizationPage';

export default function Page() {
  return (
    <Suspense fallback={<PageLoader />}>
      <AdminOrganizationPage />
    </Suspense>
  );
}
