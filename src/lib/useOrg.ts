'use client';

import { createContext, use } from 'react';
import type { Organization } from './types';

/** The organization named by ?org= on /app/<page> routes, provided by DashboardShell. */
export const OrgContext = createContext<Organization | null>(null);

export function useOrg(): Organization {
  const org = use(OrgContext);
  if (!org) throw new Error('useOrg must be used inside an organization route');
  return org;
}
