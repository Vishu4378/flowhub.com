'use client';

import { useEffect } from 'react';
import { reportError } from '@/lib/reportError';

/** Last resort when the root layout itself fails; must render its own <html>. */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => reportError(error), [error]);

  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', display: 'grid', placeItems: 'center', minHeight: '100vh', margin: 0 }}>
        <div style={{ textAlign: 'center', padding: 16 }}>
          <h1 style={{ fontSize: 22 }}>FlowHub hit an unexpected error</h1>
          <p style={{ color: '#475569' }}>We’ve been notified. Please try again.</p>
          <button onClick={reset} style={{ marginTop: 12, padding: '8px 14px', borderRadius: 6, border: 0, background: '#4f46e5', color: '#fff' }}>
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
