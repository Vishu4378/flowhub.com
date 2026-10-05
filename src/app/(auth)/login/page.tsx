import type { Metadata } from 'next';
import { Suspense } from 'react';
import { LoginPage } from '@/views/LoginPage';

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to your FlowHub workspace.',
  alternates: { canonical: '/login' },
};

export default function Page() {
  return (
    <Suspense>
      <LoginPage />
    </Suspense>
  );
}
