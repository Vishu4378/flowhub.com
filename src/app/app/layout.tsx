import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { RequireAuth } from '@/auth/guards';

// The dashboard is private and client-rendered; keep it out of search results.
export const metadata: Metadata = {
  title: 'Dashboard',
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <RequireAuth>{children}</RequireAuth>;
}
