import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { meQueryKey } from '@/auth/AuthContext';
import { api } from '@/lib/api';
import type { OrgRole, Project, ProjectStatus } from '@/lib/types';

export const keys = {
  org: (orgId: string) => ['org', orgId] as const,
  members: (orgId: string) => ['org', orgId, 'members'] as const,
  projects: (orgId: string) => ['org', orgId, 'projects'] as const,
  projectList: (orgId: string, filters: { status?: ProjectStatus; search?: string }) =>
    ['org', orgId, 'projects', 'list', filters] as const,
  project: (orgId: string, id: string) => ['org', orgId, 'projects', id] as const,
  invitations: (orgId: string) => ['org', orgId, 'invitations'] as const,
  billing: (orgId: string) => ['org', orgId, 'billing'] as const,
  payments: (orgId: string) => ['org', orgId, 'payments'] as const,
  analytics: (orgId: string) => ['org', orgId, 'analytics'] as const,
  activity: (orgId: string) => ['org', orgId, 'activity'] as const,
  notifications: ['notifications'] as const,
  unreadCount: ['notifications', 'unread'] as const,
  plans: ['plans'] as const,
};

// ---------- organizations ----------

export function useOrganization(orgId: string) {
  return useQuery({ queryKey: keys.org(orgId), queryFn: () => api.organizations.get(orgId) });
}

export function useCreateOrganization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.organizations.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: meQueryKey }),
  });
}

export function useUpdateOrganization(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { name: string }) => api.organizations.update(orgId, body),
    onSuccess: (org) => {
      qc.setQueryData(keys.org(orgId), org);
      return qc.invalidateQueries({ queryKey: meQueryKey });
    },
  });
}

export function useDeleteOrganization(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.organizations.remove(orgId),
    onSuccess: () => {
      qc.removeQueries({ queryKey: keys.org(orgId) });
      return qc.invalidateQueries({ queryKey: meQueryKey });
    },
  });
}

// ---------- members ----------

export function useMembers(orgId: string) {
  return useQuery({ queryKey: keys.members(orgId), queryFn: () => api.organizations.members(orgId) });
}

export function useUpdateMember(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: OrgRole }) =>
      api.organizations.updateMember(orgId, userId, role),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.members(orgId) }),
  });
}

export function useRemoveMember(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => api.organizations.removeMember(orgId, userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.members(orgId) }),
  });
}

// ---------- projects ----------

export function useProjects(orgId: string, filters: { status?: ProjectStatus; search?: string }) {
  return useQuery({
    queryKey: keys.projectList(orgId, filters),
    queryFn: () => api.projects.list(orgId, filters),
    placeholderData: (previous) => previous,
  });
}

export function useProject(orgId: string, id: string) {
  return useQuery({ queryKey: keys.project(orgId, id), queryFn: () => api.projects.get(orgId, id) });
}

export function useCreateProject(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { name: string; description?: string }) => api.projects.create(orgId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.projects(orgId) }),
  });
}

export function useUpdateProject(orgId: string, id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<Pick<Project, 'name' | 'description' | 'status'>>) =>
      api.projects.update(orgId, id, body),
    onSuccess: (project) => {
      qc.setQueryData(keys.project(orgId, id), project);
      return qc.invalidateQueries({ queryKey: keys.projects(orgId) });
    },
  });
}

export function useDeleteProject(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.projects.remove(orgId, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.projects(orgId) }),
  });
}

// ---------- invitations ----------

export function useInvitations(orgId: string, enabled = true) {
  return useQuery({
    queryKey: keys.invitations(orgId),
    queryFn: () => api.invitations.list(orgId),
    enabled,
  });
}

export function useCreateInvitation(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { email: string; role: OrgRole }) => api.invitations.create(orgId, body),
    onSuccess: () =>
      Promise.all([
        qc.invalidateQueries({ queryKey: keys.invitations(orgId) }),
        qc.invalidateQueries({ queryKey: keys.billing(orgId) }),
      ]),
  });
}

export function useRevokeInvitation(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.invitations.revoke(orgId, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.invitations(orgId) }),
  });
}

// ---------- notifications ----------

/** Polled so the bell updates without a refresh. */
export function useUnreadCount() {
  return useQuery({
    queryKey: keys.unreadCount,
    queryFn: api.notifications.unreadCount,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  });
}

export function useNotifications(enabled = true) {
  return useQuery({ queryKey: keys.notifications, queryFn: api.notifications.list, enabled });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.notifications.markRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.notifications }),
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.notifications.markAllRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.notifications }),
  });
}

// ---------- billing ----------

export function usePlans() {
  return useQuery({ queryKey: keys.plans, queryFn: api.billing.plans, staleTime: 5 * 60_000 });
}

export function useBilling(orgId: string) {
  return useQuery({ queryKey: keys.billing(orgId), queryFn: () => api.billing.overview(orgId) });
}

export function usePayments(orgId: string, enabled = true) {
  return useQuery({
    queryKey: keys.payments(orgId),
    queryFn: () => api.billing.payments(orgId),
    enabled,
  });
}

/** Both return a Stripe-hosted URL; the browser is sent there. */
export function useCheckout(orgId: string) {
  return useMutation({
    mutationFn: (plan: 'pro' | 'business') => api.billing.checkout(orgId, plan),
    onSuccess: ({ url }) => window.location.assign(url),
  });
}

export function useBillingPortal(orgId: string) {
  return useMutation({
    mutationFn: () => api.billing.portal(orgId),
    onSuccess: ({ url }) => window.location.assign(url),
  });
}

// ---------- analytics ----------

export function useAnalytics(orgId: string) {
  return useQuery({ queryKey: keys.analytics(orgId), queryFn: () => api.analytics.overview(orgId) });
}

/** Cursor-paginated by timestamp: each page asks for entries before the last one. */
export function useActivity(orgId: string) {
  return useInfiniteQuery({
    queryKey: keys.activity(orgId),
    queryFn: ({ pageParam }) => api.analytics.activity(orgId, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => (last.length === 30 ? last.at(-1)!.createdAt : undefined),
  });
}
