'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/auth/AuthContext';
import {
  Avatar,
  Badge,
  Button,
  Card,
  ErrorNotice,
  Field,
  Input,
  Modal,
  PageHeader,
  PageLoader,
  Select,
  SuccessNotice,
} from '@/components/ui';
import { canManage, initials, timeAgo } from '@/lib/format';
import {
  useCreateInvitation,
  useInvitations,
  useMembers,
  useRemoveMember,
  useRevokeInvitation,
  useUpdateMember,
} from '@/lib/queries';
import type { Member, OrgRole } from '@/lib/types';
import { useOrg } from '@/lib/useOrg';

const ROLE_TONE = { owner: 'indigo', admin: 'amber', member: 'slate' } as const;

export function MembersPage() {
  const org = useOrg();
  const { me } = useAuth();
  const router = useRouter();
  const members = useMembers(org.id);
  const updateMember = useUpdateMember(org.id);
  const removeMember = useRemoveMember(org.id);
  const [adding, setAdding] = useState(false);
  const [invitedEmail, setInvitedEmail] = useState<string | null>(null);
  const [removing, setRemoving] = useState<Member | null>(null);

  const manager = canManage(org.role);
  const invitations = useInvitations(org.id, manager);
  const revoke = useRevokeInvitation(org.id);
  const assignable: OrgRole[] = org.role === 'owner' ? ['owner', 'admin', 'member'] : ['admin', 'member'];
  const myId = me?.user.id;
  const ownerCount = members.data?.filter((m) => m.role === 'owner').length ?? 0;

  const confirmRemove = () => {
    if (!removing) return;
    const leaving = removing.userId === myId;
    removeMember.mutate(removing.userId, {
      onSuccess: () => {
        setRemoving(null);
        if (leaving) router.replace('/app');
      },
    });
  };

  return (
    <>
      <PageHeader
        title="Members"
        description="People who can see and work on this organization's projects."
        actions={manager && <Button onClick={() => setAdding(true)}>Invite member</Button>}
      />

      {invitedEmail && (
        <div className="mb-4">
          <SuccessNotice>
            Invitation sent to <strong>{invitedEmail}</strong>. It expires in 7 days.
          </SuccessNotice>
        </div>
      )}

      <ErrorNotice error={members.error ?? updateMember.error} />
      {members.isPending ? (
        <PageLoader />
      ) : (
        <Card className="divide-y divide-slate-100">
          {members.data?.map((member) => {
            const isSelf = member.userId === myId;
            // Admins can't edit owners; the API enforces the same rule.
            const editable = manager && !isSelf && (org.role === 'owner' || member.role !== 'owner');
            return (
              <div key={member.userId} className="flex flex-wrap items-center gap-4 px-5 py-4">
                <Avatar label={initials(member.name)} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-slate-900">
                    {member.name} {isSelf && <span className="text-sm font-normal text-slate-400">(you)</span>}
                  </p>
                  <p className="truncate text-sm text-slate-500">{member.email}</p>
                </div>
                {editable ? (
                  <div className="w-32 shrink-0">
                  <Select
                    aria-label={`Role for ${member.name}`}
                    value={member.role}
                    className="capitalize"
                    disabled={updateMember.isPending}
                    onChange={(e) => updateMember.mutate({ userId: member.userId, role: e.target.value as OrgRole })}
                  >
                    {assignable.map((role) => (
                      <option key={role} value={role} className="capitalize">
                        {role}
                      </option>
                    ))}
                  </Select>
                  </div>
                ) : (
                  <Badge tone={ROLE_TONE[member.role]}>{member.role}</Badge>
                )}
                {(editable || (isSelf && !(member.role === 'owner' && ownerCount === 1))) && (
                  <Button variant="ghost" onClick={() => setRemoving(member)}>
                    {isSelf ? 'Leave' : 'Remove'}
                  </Button>
                )}
              </div>
            );
          })}
        </Card>
      )}

      {manager && (invitations.data?.length ?? 0) > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-sm font-semibold text-slate-900">Pending invitations</h2>
          <ErrorNotice error={revoke.error} />
          <Card className="divide-y divide-slate-100">
            {invitations.data!.map((invite) => (
              <div key={invite.id} className="flex flex-wrap items-center gap-4 px-5 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">{invite.email}</p>
                  <p className="text-xs text-slate-500">
                    Invited {timeAgo(invite.createdAt)} · expires {timeAgo(invite.expiresAt)}
                  </p>
                </div>
                <Badge tone={ROLE_TONE[invite.role]}>{invite.role}</Badge>
                <Button
                  variant="ghost"
                  loading={revoke.isPending && revoke.variables === invite.id}
                  onClick={() => revoke.mutate(invite.id)}
                >
                  Revoke
                </Button>
              </div>
            ))}
          </Card>
        </section>
      )}

      <Modal open={adding} onClose={() => setAdding(false)} title="Invite a member">
        <InviteForm
          orgId={org.id}
          roles={assignable}
          onCancel={() => setAdding(false)}
          onSent={(email) => {
            setAdding(false);
            setInvitedEmail(email);
          }}
        />
      </Modal>

      <Modal
        open={!!removing}
        onClose={() => setRemoving(null)}
        title={removing?.userId === myId ? `Leave ${org.name}?` : 'Remove member?'}
      >
        <p className="text-sm text-slate-600">
          {removing?.userId === myId
            ? 'You will lose access to this organization and its projects.'
            : `${removing?.name} will lose access to ${org.name}.`}
        </p>
        <div className="mt-4">
          <ErrorNotice error={removeMember.error} />
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setRemoving(null)}>
            Cancel
          </Button>
          <Button variant="danger" loading={removeMember.isPending} onClick={confirmRemove}>
            {removing?.userId === myId ? 'Leave' : 'Remove'}
          </Button>
        </div>
      </Modal>
    </>
  );
}

function InviteForm({
  orgId,
  roles,
  onCancel,
  onSent,
}: {
  orgId: string;
  roles: OrgRole[];
  onCancel: () => void;
  onSent: (email: string) => void;
}) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<OrgRole>('member');
  const invite = useCreateInvitation(orgId);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    invite.mutate({ email, role }, { onSuccess: () => onSent(email) });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <ErrorNotice error={invite.error} />
      <Field label="Email" hint="We'll email them a link to join. They can sign up if they don't have an account.">
        {(id) => <Input id={id} type="email" autoFocus required value={email} onChange={(e) => setEmail(e.target.value)} />}
      </Field>
      <Field label="Role">
        {(id) => (
          <Select id={id} value={role} onChange={(e) => setRole(e.target.value as OrgRole)}>
            {roles.map((r) => (
              <option key={r} value={r} className="capitalize">
                {r}
              </option>
            ))}
          </Select>
        )}
      </Field>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={invite.isPending}>
          Send invitation
        </Button>
      </div>
    </form>
  );
}
