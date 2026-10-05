import type { Metadata } from 'next';
import { Suspense } from 'react';
import { RegisterPage } from '@/views/RegisterPage';

export const metadata: Metadata = {
  title: 'Create your account',
  description: 'Create a free FlowHub account and set up your first organization.',
  alternates: { canonical: '/register' },
};

export default function Page() {
  return (
    <Suspense>
      <RegisterPage />
    </Suspense>
  );
}
