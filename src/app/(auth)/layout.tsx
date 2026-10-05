import type { ReactNode } from 'react';
import { GuestOnly } from '@/auth/guards';

export default function AuthGroupLayout({ children }: { children: ReactNode }) {
  return <GuestOnly>{children}</GuestOnly>;
}
