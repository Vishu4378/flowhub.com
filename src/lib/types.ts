export type OrgRole = 'owner' | 'admin' | 'member';
export type ProjectStatus = 'active' | 'archived';

export interface User {
  id: string;
  email: string;
  name: string;
  emailVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  role: OrgRole;
  createdAt: string;
  suspendedAt?: string | null;
  suspendedReason?: string | null;
}

export interface Member {
  userId: string;
  name: string;
  email: string;
  role: OrgRole;
  joinedAt: string;
}

export interface Project {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  status: ProjectStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  /** Display prefix of the project's API key, or null if none yet. */
  apiKeyPrefix?: string | null;
  apiKeyCreatedAt?: string | null;
}

export interface Session {
  accessToken: string;
  user: User;
}

export interface Me {
  user: User;
  organizations: Organization[];
  isSuperAdmin?: boolean;
}

export interface Invitation {
  id: string;
  organizationId: string;
  email: string;
  role: OrgRole;
  expiresAt: string;
  createdAt: string;
}

export interface InvitationPreview {
  organizationName: string;
  email: string;
  role: OrgRole;
  inviterName: string | null;
  expiresAt: string;
  accountExists: boolean;
}

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  link: string | null;
  orgId: string | null;
  readAt: string | null;
  createdAt: string;
}

export type PlanId = 'free' | 'pro' | 'business';

export interface Plan {
  id: PlanId;
  name: string;
  description: string;
  /** Smallest currency unit (cents). */
  priceMonthly: number;
  currency: string;
  limits: { projects: number | null; members: number | null };
  features: string[];
  purchasable: boolean;
}

export type SubscriptionStatus =
  | 'none'
  | 'incomplete'
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'unpaid';

export interface BillingOverview {
  plan: Omit<Plan, 'purchasable'>;
  status: SubscriptionStatus;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  hasBillingAccount: boolean;
  usage: { projects: number; members: number };
  billingEnabled: boolean;
}

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: 'paid' | 'failed';
  description: string;
  invoiceUrl: string | null;
  invoicePdfUrl: string | null;
  occurredAt: string;
}

export interface ActivityEntry {
  id: string;
  type: string;
  actorId: string | null;
  actorName: string | null;
  subject: { id: string; name: string; kind: string } | null;
  /** May be absent on older entries. */
  meta?: Record<string, unknown>;
  createdAt: string;
}

export interface AnalyticsOverview {
  totals: {
    activeProjects: number;
    archivedProjects: number;
    members: number;
    eventsLast30Days: number;
  };
  projectsCreatedByWeek: { weekStart: string; count: number }[];
  activityByType: { type: string; count: number }[];
}

// ---------- super admin ----------

export interface Paged<T> {
  total: number;
  page: number;
  pageSize: number;
  items: T[];
}

export interface AdminStats {
  organizations: { total: number; suspended: number; paying: number; byPlan: Record<string, number> };
  users: { total: number; signupsLast30Days: number };
  projects: { total: number };
  revenue: { mrr: number; currency: string; last30Days: { currency: string; amount: number }[] };
  signupsByWeek: { weekStart: string; count: number }[];
}

export interface AdminOrganization {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  suspendedAt: string | null;
  suspendedReason: string | null;
  members: number;
  projects: number;
  plan: PlanId;
  subscriptionStatus: SubscriptionStatus;
}

export interface AdminActivity extends ActivityEntry {
  organizationId: string;
  organizationName: string;
}

export interface AdminOrganizationDetail extends Omit<AdminOrganization, 'members'> {
  currentPeriodEnd: string | null;
  members: { userId: string; name: string; email: string; role: OrgRole }[];
  activity: AdminActivity[];
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  emailVerifiedAt: string | null;
  createdAt: string;
  organizations: number;
  isSuperAdmin: boolean;
}
