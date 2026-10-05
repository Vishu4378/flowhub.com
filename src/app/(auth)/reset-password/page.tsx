import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ResetPasswordPage } from '@/views/ResetPasswordPage';

export const metadata: Metadata = { title: 'Choose a new password', robots: { index: false } };

export default function Page() {
  return (
    <Suspense>
      <ResetPasswordPage />
    </Suspense>
  );
}
