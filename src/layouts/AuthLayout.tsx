import type { ReactNode } from 'react';
import { Logo } from '@/components/Logo';

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle: ReactNode; children: ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <Logo className="mx-auto" />
        <h1 className="mt-8 text-center text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
        <p className="mt-2 text-center text-sm text-slate-500">{subtitle}</p>
        <div className="mt-8 rounded-lg bg-white p-6 shadow-xs ring-1 ring-slate-200">{children}</div>
      </div>
    </div>
  );
}
