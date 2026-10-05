import type { Metadata } from 'next';
import { ForgotPasswordPage } from '@/views/ForgotPasswordPage';

export const metadata: Metadata = { title: 'Reset your password', robots: { index: false } };

export default function Page() {
  return <ForgotPasswordPage />;
}
