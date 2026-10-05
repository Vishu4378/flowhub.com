import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../auth/AuthContext';
import { Avatar, Badge, Button, Card, ErrorNotice, Field, Input, Modal, PageHeader, PageLoader, Select } from '../components/ui';
import { canManage, initials } from '../lib/format';
import { useAddMember, useMembers, useRemoveMember, useUpdateMember } from '../lib/queries';
import type { Member, OrgRole } from '../lib/types';
import { useOrg } from '../lib/useOrg';

const ROLE_TONE = { owner: 'indigo', admin: 'amber', member: 'slate' } as const;

export function MembersPage() {
  const org = useOrg();
  const { me } = useAuth();
  const navigate = useNavigate();
  const members = useMembers(org.id);
  const updateMember = useUpdateMember(org.id);
  const removeMember = useRemoveMember(org.id);
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<Member | null>(null);

  const manager = canManage(org.role);
  const assignable: OrgRole[] = org.role === 'owner' ? ['owner', 'admin', 'member'] : ['admin', 'member'];
  const myId = me?.user.id;

  const confirmRemove = () => {
    if (!removing) return;
    const leaving = removing.userId === myId;
    removeMember.mutate(removing.userId, {
      onSuccess: () => {
        setRemoving(null);
        if (leaving) navigate('/', { replace: true });
      },
    });
  };

  return (
    <>
      <PageHeader
        title="Members"
        description="People who can see and work on this organization's projects."
        actions={manager && <Button onClick={() => setAdding(true)}>Add member</Button>}
      />

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
                  <Select
                    aria-label={`Role for ${member.name}`}
                    value={member.role}
                    className="w-32"
                    disabled={updateMember.isPending}
                    onChange={(e) => updateMember.mutate({ userId: member.userId, role: e.target.value as OrgRole })}
                  >
                    {assignable.map((role) => (
                      <option key={role} value={role} className="capitalize">
                        {role}
                      </option>
                    ))}
                  </Select>
                ) : (
                  <Badge tone={ROLE_TONE[member.role]}>{member.role}</Badge>
                )}
                {(editable || isSelf) && (
                  <Button variant="ghost" onClick={() => setRemoving(member)}>
                    {isSelf ? 'Leave' : 'Remove'}
                  </Button>
                )}
              </div>
            );
          })}
        </Card>
      )}

      <Modal open={adding} onClose={() => setAdding(false)} title="Add a member">
        <AddMemberForm orgId={org.id} roles={assignable} onDone={() => setAdding(false)} />
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

function AddMemberForm({ orgId, roles, onDone }: { orgId: string; roles: OrgRole[]; onDone: () => void }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<OrgRole>('member');
  const add = useAddMember(orgId);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    add.mutate({ email, role }, { onSuccess: onDone });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <ErrorNotice error={add.error} />
      <Field label="Email" hint="They need a FlowHub account already. Email invitations are coming soon.">
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
        <Button type="button" variant="secondary" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" loading={add.isPending}>
          Add member
        </Button>
      </div>
    </form>
  );
}
