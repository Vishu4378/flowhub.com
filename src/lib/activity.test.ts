import { describeActivity } from './activity';
import type { ActivityEntry } from './types';

const entry = (overrides: Partial<ActivityEntry>): ActivityEntry => ({
  id: '1',
  type: 'project.created',
  actorId: 'u1',
  actorName: 'Ada',
  subject: { id: 'p1', name: 'Website', kind: 'project' },
  meta: {},
  createdAt: new Date().toISOString(),
  ...overrides,
});

describe('describeActivity', () => {
  it('reads like a sentence', () => {
    expect(describeActivity(entry({}))).toBe('Ada created Website');
    expect(describeActivity(entry({ type: 'project.archived' }))).toBe('Ada archived Website');
    expect(
      describeActivity(entry({ type: 'member.role_changed', subject: { id: 'u2', name: 'Bob', kind: 'member' }, meta: { role: 'admin' } })),
    ).toBe('Ada made Bob an admin');
  });

  it('describes suspensions with their reason', () => {
    expect(describeActivity(entry({ type: 'organization.suspended', meta: { reason: 'Unpaid' } }))).toBe(
      'Organization suspended: Unpaid',
    );
    expect(describeActivity(entry({ type: 'organization.unsuspended' }))).toBe('Organization reinstated');
  });

  it('copes with entries that have no meta', () => {
    expect(describeActivity(entry({ type: 'organization.created', meta: undefined }))).toBe('Ada created the organization');
  });

  it('distinguishes leaving from being removed', () => {
    const removed = { type: 'member.removed', meta: { role: 'member' } };
    expect(describeActivity(entry({ ...removed, subject: { id: 'u1', name: 'Ada', kind: 'member' } }))).toBe('Ada left');
    expect(describeActivity(entry({ ...removed, subject: { id: 'u2', name: 'Bob', kind: 'member' } }))).toBe('Ada removed Bob');
  });
});
