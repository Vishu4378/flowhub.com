import { Suspense } from 'react';
import { PageLoader } from '@/components/ui';
import { BillingPage } from '@/views/BillingPage';

export default function Page() {
  return (
    <Suspense fallback={<PageLoader />}>
      <BillingPage />
    </Suspense>
  );
}
