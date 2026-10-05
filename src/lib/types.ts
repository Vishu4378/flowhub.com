export type OrgRole = 'owner' | 'admin' | 'member';
export type ProjectStatus = 'active' | 'archived';

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  role: OrgRole;
  createdAt: string;
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
}

export interface Session {
  accessToken: string;
  user: User;
}

export interface Me {
  user: User;
  organizations: Organization[];
}
