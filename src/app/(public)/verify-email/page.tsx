import type { Metadata } from 'next';
import { Suspense } from 'react';
import { VerifyEmailPage } from '@/views/VerifyEmailPage';

export const metadata: Metadata = { title: 'Confirm your email' };

export default function Page() {
  return (
    <Suspense>
      <VerifyEmailPage />
    </Suspense>
  );
}
