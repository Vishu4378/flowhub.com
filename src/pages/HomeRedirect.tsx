import { Navigate } from 'react-router';
import { useAuth } from '../auth/AuthContext';

const LAST_ORG_KEY = 'flowhub.lastOrg';

export function rememberOrg(orgId: string) {
  try {
    localStorage.setItem(LAST_ORG_KEY, orgId);
  } catch {
    // Storage unavailable; we'll fall back to the first organization.
  }
}

/** Sends the user to their last-used organization, or prompts them to create one. */
export function HomeRedirect() {
  const { me } = useAuth();
  const organizations = me?.organizations ?? [];
  if (organizations.length === 0) return <Navigate to="/organizations/new" replace />;

  let last: string | null = null;
  try {
    last = localStorage.getItem(LAST_ORG_KEY);
  } catch {
    // ignore
  }
  const target = organizations.find((o) => o.id === last) ?? organizations[0]!;
  return <Navigate to={`/orgs/${target.id}/projects`} replace />;
}
