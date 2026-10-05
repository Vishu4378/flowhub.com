import type {
  Me,
  Member,
  Organization,
  OrgRole,
  Project,
  ProjectStatus,
  Session,
  User,
} from './types';

const BASE_URL = `${import.meta.env.VITE_API_URL ?? ''}/api`;
const TOKEN_KEY = 'flowhub.token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export class ApiError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/** Called on any 401 so the app can drop the session. */
let onUnauthorized: () => void = () => {};
export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const headers: Record<string, string> = {};
  const token = tokenStore.get();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401 && token) onUnauthorized();
    // Nest returns validation errors as an array of messages.
    const message = Array.isArray(data?.message)
      ? data.message.join('. ')
      : (data?.message ?? res.statusText);
    throw new ApiError(res.status, message);
  }
  return data as T;
}

const get = <T>(path: string) => request<T>('GET', path);
const post = <T>(path: string, body?: unknown) => request<T>('POST', path, body);
const patch = <T>(path: string, body: unknown) => request<T>('PATCH', path, body);
const del = (path: string) => request<void>('DELETE', path);

export const api = {
  auth: {
    login: (body: { email: string; password: string }) =>
      post<Session>('/auth/login', body),
    register: (body: {
      name: string;
      email: string;
      password: string;
      organizationName: string;
    }) => post<Session>('/auth/register', body),
    me: () => get<Me>('/auth/me'),
  },
  users: {
    updateMe: (body: { name: string }) => patch<User>('/users/me', body),
  },
  organizations: {
    list: () => get<Organization[]>('/organizations'),
    create: (body: { name: string }) => post<Organization>('/organizations', body),
    get: (orgId: string) => get<Organization>(`/organizations/${orgId}`),
    update: (orgId: string, body: { name: string }) =>
      patch<Organization>(`/organizations/${orgId}`, body),
    remove: (orgId: string) => del(`/organizations/${orgId}`),
    members: (orgId: string) => get<Member[]>(`/organizations/${orgId}/members`),
    addMember: (orgId: string, body: { email: string; role: OrgRole }) =>
      post<Member>(`/organizations/${orgId}/members`, body),
    updateMember: (orgId: string, userId: string, role: OrgRole) =>
      patch(`/organizations/${orgId}/members/${userId}`, { role }),
    removeMember: (orgId: string, userId: string) =>
      del(`/organizations/${orgId}/members/${userId}`),
  },
  projects: {
    list: (orgId: string, params: { status?: ProjectStatus; search?: string }) => {
      const query = new URLSearchParams();
      if (params.status) query.set('status', params.status);
      if (params.search) query.set('search', params.search);
      const qs = query.toString();
      return get<Project[]>(`/organizations/${orgId}/projects${qs ? `?${qs}` : ''}`);
    },
    get: (orgId: string, id: string) =>
      get<Project>(`/organizations/${orgId}/projects/${id}`),
    create: (orgId: string, body: { name: string; description?: string }) =>
      post<Project>(`/organizations/${orgId}/projects`, body),
    update: (
      orgId: string,
      id: string,
      body: Partial<Pick<Project, 'name' | 'description' | 'status'>>,
    ) => patch<Project>(`/organizations/${orgId}/projects/${id}`, body),
    remove: (orgId: string, id: string) =>
      del(`/organizations/${orgId}/projects/${id}`),
  },
};
