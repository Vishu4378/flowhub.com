import type { Metadata } from 'next';
import type { ReactNode } from 'react';

/** Token links from emails: reachable signed in or out, never indexed. */
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function PublicTokenLayout({ children }: { children: ReactNode }) {
  return children;
}
