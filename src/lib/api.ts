import type {
  ActivityEntry,
  AnalyticsOverview,
  AppNotification,
  BillingOverview,
  Invitation,
  InvitationPreview,
  Me,
  Member,
  Organization,
  OrgRole,
  Payment,
  Plan,
  Project,
  ProjectStatus,
  Session,
  User,
} from './types';

const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL ?? ''}/api`;
const TOKEN_KEY = 'flowhub.token';

const tokenListeners = new Set<() => void>();
const notifyToken = () => tokenListeners.forEach((listener) => listener());

/** The access token in localStorage, observable for useSyncExternalStore. */
export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
    notifyToken();
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    notifyToken();
  },
  subscribe: (listener: () => void) => {
    tokenListeners.add(listener);
    // Keep tabs in sync: signing out in one signs out everywhere.
    const onStorage = (e: StorageEvent) => e.key === TOKEN_KEY && listener();
    window.addEventListener('storage', onStorage);
    return () => {
      tokenListeners.delete(listener);
      window.removeEventListener('storage', onStorage);
    };
  },
};

export class ApiError extends Error {
  readonly status: number;
  /** Machine-readable reason, e.g. PLAN_LIMIT. */
  readonly code?: string;
  constructor(status: number, message: string, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

/** Turns a Nest error body into one readable message. */
export function errorMessage(data: unknown, fallback: string): string {
  const message = (data as { message?: unknown } | null)?.message;
  if (Array.isArray(message)) return message.join('. ');
  return typeof message === 'string' && message ? message : fallback;
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
    throw new ApiError(res.status, errorMessage(data, res.statusText), data?.code);
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
      organizationName?: string;
      inviteToken?: string;
    }) => post<Session>('/auth/register', body),
    me: () => get<Me>('/auth/me'),
    verifyEmail: (token: string) => post<void>('/auth/verify-email', { token }),
    resendVerification: () => post<void>('/auth/verify-email/resend'),
    forgotPassword: (email: string) => post<void>('/auth/forgot-password', { email }),
    resetPassword: (body: { token: string; password: string }) =>
      post<Session>('/auth/reset-password', body),
    changePassword: (body: { currentPassword: string; newPassword: string }) =>
      post<void>('/auth/change-password', body),
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
    updateMember: (orgId: string, userId: string, role: OrgRole) =>
      patch(`/organizations/${orgId}/members/${userId}`, { role }),
    removeMember: (orgId: string, userId: string) =>
      del(`/organizations/${orgId}/members/${userId}`),
  },
  invitations: {
    list: (orgId: string) => get<Invitation[]>(`/organizations/${orgId}/invitations`),
    create: (orgId: string, body: { email: string; role: OrgRole }) =>
      post<Invitation>(`/organizations/${orgId}/invitations`, body),
    revoke: (orgId: string, id: string) => del(`/organizations/${orgId}/invitations/${id}`),
    preview: (token: string) => get<InvitationPreview>(`/invitations/${token}`),
    accept: (token: string) => post<{ organizationId: string }>(`/invitations/${token}/accept`),
  },
  notifications: {
    list: () => get<AppNotification[]>('/notifications'),
    unreadCount: () => get<{ count: number }>('/notifications/unread-count'),
    markRead: (id: string) => post<AppNotification>(`/notifications/${id}/read`),
    markAllRead: () => post<void>('/notifications/read-all'),
  },
  billing: {
    plans: () => get<Plan[]>('/billing/plans'),
    overview: (orgId: string) => get<BillingOverview>(`/organizations/${orgId}/billing`),
    checkout: (orgId: string, plan: Exclude<Plan['id'], 'free'>) =>
      post<{ url: string }>(`/organizations/${orgId}/billing/checkout`, { plan }),
    portal: (orgId: string) => post<{ url: string }>(`/organizations/${orgId}/billing/portal`),
    payments: (orgId: string) => get<Payment[]>(`/organizations/${orgId}/payments`),
  },
  analytics: {
    overview: (orgId: string) => get<AnalyticsOverview>(`/organizations/${orgId}/analytics/overview`),
    activity: (orgId: string, before?: string) =>
      get<ActivityEntry[]>(
        `/organizations/${orgId}/activity${before ? `?before=${encodeURIComponent(before)}` : ''}`,
      ),
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
