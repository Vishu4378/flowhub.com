import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { meQueryKey } from '../auth/AuthContext';
import { api } from './api';
import type { OrgRole, Project, ProjectStatus } from './types';

export const keys = {
  org: (orgId: string) => ['org', orgId] as const,
  members: (orgId: string) => ['org', orgId, 'members'] as const,
  projects: (orgId: string) => ['org', orgId, 'projects'] as const,
  projectList: (orgId: string, filters: { status?: ProjectStatus; search?: string }) =>
    ['org', orgId, 'projects', 'list', filters] as const,
  project: (orgId: string, id: string) => ['org', orgId, 'projects', id] as const,
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

export function useAddMember(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { email: string; role: OrgRole }) => api.organizations.addMember(orgId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.members(orgId) }),
  });
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
