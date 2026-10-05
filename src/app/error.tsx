'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { reportError } from '@/lib/reportError';

/** Shown when a page crashes while rendering; the crash is reported to the team. */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => reportError(error), [error]);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-3 px-4 text-center">
      <p className="text-sm font-semibold text-red-600">Something went wrong</p>
      <h1 className="text-2xl font-semibold tracking-tight">This page hit an unexpected error</h1>
      <p className="max-w-md text-sm text-slate-600">We’ve been notified and will look into it. Try again, or head home.</p>
      <div className="mt-2 flex gap-3">
        <button onClick={reset} className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500">
          Try again
        </button>
        <Link href="/" className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50">
          Go home
        </Link>
      </div>
    </div>
  );
}
