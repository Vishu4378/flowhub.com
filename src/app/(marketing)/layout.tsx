import type { ReactNode } from 'react';
import { HeaderActions } from '@/components/HeaderActions';
import { Logo } from '@/components/Logo';

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col bg-white">
      <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Logo />
          <HeaderActions />
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-slate-100">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-8 text-sm text-slate-500 sm:px-6">
          <p>© {new Date().getFullYear()} FlowHub</p>
          <nav className="flex gap-6">
            <a href="/pricing" className="hover:text-slate-900">
              Pricing
            </a>
            <a href="/login" className="hover:text-slate-900">
              Sign in
            </a>
            <a href="/register" className="hover:text-slate-900">
              Create account
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
