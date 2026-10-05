'use client';

import { createContext, use } from 'react';
import type { Organization } from './types';

/** The organization of the current /app/orgs/[orgId] route, provided by its layout. */
export const OrgContext = createContext<Organization | null>(null);

export function useOrg(): Organization {
  const org = use(OrgContext);
  if (!org) throw new Error('useOrg must be used inside an organization route');
  return org;
}
