/**
 * Every in-app URL with an id in it. The site is a static export (one HTML
 * file per page), so ids travel as query parameters, not path segments.
 * Keep in sync with flowhub-services/src/common/utils/app-url.ts.
 */
export type OrgPage = 'overview' | 'projects' | 'project' | 'members' | 'billing' | 'settings';

export const routes = {
  org: (orgId: string, page: OrgPage, extra: Record<string, string> = {}) =>
    `/app/${page}?${new URLSearchParams({ org: orgId, ...extra }).toString()}`,
  project: (orgId: string, projectId: string) => routes.org(orgId, 'project', { id: projectId }),
  invite: (token: string) => `/invite?token=${encodeURIComponent(token)}`,
  adminOrg: (id: string) => `/app/admin/organization?id=${encodeURIComponent(id)}`,
};
