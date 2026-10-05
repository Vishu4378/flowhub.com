import { useOutletContext } from 'react-router';
import type { OrgOutletContext } from '../layouts/AppLayout';

/** The organization of the current /orgs/:orgId route, provided by AppLayout. */
export function useOrg() {
  return useOutletContext<OrgOutletContext>().org;
}
