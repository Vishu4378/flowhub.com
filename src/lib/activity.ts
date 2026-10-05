import type { ActivityEntry } from './types';

/** Human labels for activity types, used in the feed and the breakdown. */
export const ACTIVITY_LABELS: Record<string, string> = {
  'organization.created': 'Organization created',
  'project.created': 'Projects created',
  'project.updated': 'Projects edited',
  'project.archived': 'Projects archived',
  'project.restored': 'Projects restored',
  'project.deleted': 'Projects deleted',
  'member.invited': 'Invitations sent',
  'member.joined': 'Members joined',
  'member.role_changed': 'Role changes',
  'member.removed': 'Members removed',
  'subscription.changed': 'Plan changes',
  'organization.suspended': 'Suspensions',
  'organization.unsuspended': 'Reinstatements',
};

/** One sentence describing an entry, e.g. "Ada archived Website relaunch". */
export function describeActivity(e: ActivityEntry): string {
  const who = e.actorName ?? 'FlowHub';
  const what = e.subject?.name ?? '';
  const meta = e.meta ?? {};
  const role = typeof meta.role === 'string' ? meta.role : '';
  switch (e.type) {
    case 'organization.created':
      return `${who} created the organization`;
    case 'project.created':
      return `${who} created ${what}`;
    case 'project.updated':
      return `${who} edited ${what}`;
    case 'project.archived':
      return `${who} archived ${what}`;
    case 'project.restored':
      return `${who} restored ${what}`;
    case 'project.deleted':
      return `${who} deleted ${what}`;
    case 'member.invited':
      return `${who} invited ${what} as ${role}`;
    case 'member.joined':
      return `${what} joined as ${role}`;
    case 'member.role_changed':
      return `${who} made ${what} ${role === 'admin' ? 'an' : 'a'} ${role}`;
    case 'member.removed':
      return e.actorId && e.subject?.id === e.actorId ? `${what} left` : `${who} removed ${what}`;
    case 'subscription.changed':
      return `Plan changed to ${String(meta.plan)} (${String(meta.status).replace('_', ' ')})`;
    case 'organization.suspended':
      return `Organization suspended${typeof meta.reason === 'string' && meta.reason ? `: ${meta.reason}` : ''}`;
    case 'organization.unsuspended':
      return 'Organization reinstated';
    default:
      return e.type;
  }
}
