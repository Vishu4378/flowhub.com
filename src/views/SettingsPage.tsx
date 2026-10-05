'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { meQueryKey, useAuth } from '@/auth/AuthContext';
import { Button, Card, ErrorNotice, Field, Input, Modal, PageHeader } from '@/components/ui';
import { api } from '@/lib/api';
import { canManage } from '@/lib/format';
import { useDeleteOrganization, useUpdateOrganization } from '@/lib/queries';
import { useOrg } from '@/lib/useOrg';

export function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" />
      <div className="space-y-6">
        <ProfileSection />
        <PasswordSection />
        <OrganizationSection />
      </div>
    </>
  );
}

function Section({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <Card className="grid gap-6 p-6 md:grid-cols-3">
      <div>
        <h2 className="font-semibold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      <div className="md:col-span-2">{children}</div>
    </Card>
  );
}

function ProfileSection() {
  const { me } = useAuth();
  const qc = useQueryClient();
  const [name, setName] = useState(me?.user.name ?? '');
  const update = useMutation({
    mutationFn: api.users.updateMe,
    onSuccess: () => qc.invalidateQueries({ queryKey: meQueryKey }),
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    update.mutate({ name });
  };

  return (
    <Section title="Your profile" description="How you appear to teammates.">
      <form onSubmit={submit} className="space-y-4">
        <ErrorNotice error={update.error} />
        <Field label="Email">{(id) => <Input id={id} value={me?.user.email ?? ''} disabled />}</Field>
        <Field label="Name">
          {(id) => <Input id={id} required maxLength={80} value={name} onChange={(e) => setName(e.target.value)} />}
        </Field>
        <div className="flex items-center justify-end gap-3">
          {update.isSuccess && <span className="text-sm text-emerald-600">Saved</span>}
          <Button type="submit" disabled={name === me?.user.name} loading={update.isPending}>
            Save
          </Button>
        </div>
      </form>
    </Section>
  );
}

function PasswordSection() {
  const [currentPassword, setCurrent] = useState('');
  const [newPassword, setNew] = useState('');
  const change = useMutation({
    mutationFn: api.auth.changePassword,
    onSuccess: () => {
      setCurrent('');
      setNew('');
    },
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    change.mutate({ currentPassword, newPassword });
  };

  return (
    <Section title="Password" description="Use at least 8 characters.">
      <form onSubmit={submit} className="space-y-4">
        <ErrorNotice error={change.error} />
        <Field label="Current password">
          {(id) => (
            <Input id={id} type="password" autoComplete="current-password" required value={currentPassword} onChange={(e) => setCurrent(e.target.value)} />
          )}
        </Field>
        <Field label="New password">
          {(id) => (
            <Input id={id} type="password" autoComplete="new-password" minLength={8} required value={newPassword} onChange={(e) => setNew(e.target.value)} />
          )}
        </Field>
        <div className="flex items-center justify-end gap-3">
          {change.isSuccess && <span className="text-sm text-emerald-600">Password changed</span>}
          <Button type="submit" loading={change.isPending}>
            Change password
          </Button>
        </div>
      </form>
    </Section>
  );
}

function OrganizationSection() {
  const org = useOrg();
  const router = useRouter();
  const [name, setName] = useState(org.name);
  const [confirming, setConfirming] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const update = useUpdateOrganization(org.id);
  const remove = useDeleteOrganization(org.id);
  const manager = canManage(org.role);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    update.mutate({ name });
  };

  return (
    <>
      <Section title="Organization" description={manager ? 'Visible to everyone in this organization.' : 'Only admins can change these.'}>
        <form onSubmit={submit} className="space-y-4">
          <ErrorNotice error={update.error} />
          <Field label="Organization name">
            {(id) => (
              <Input id={id} required minLength={2} maxLength={80} disabled={!manager} value={name} onChange={(e) => setName(e.target.value)} />
            )}
          </Field>
          <Field label="Slug">{(id) => <Input id={id} value={org.slug} disabled />}</Field>
          {manager && (
            <div className="flex items-center justify-end gap-3">
              {update.isSuccess && <span className="text-sm text-emerald-600">Saved</span>}
              <Button type="submit" disabled={name === org.name} loading={update.isPending}>
                Save
              </Button>
            </div>
          )}
        </form>
      </Section>

      {org.role === 'owner' && (
        <Section title="Danger zone" description="Deleting an organization removes all of its projects and memberships.">
          <Button variant="danger" onClick={() => setConfirming(true)}>
            Delete organization
          </Button>
        </Section>
      )}

      <Modal open={confirming} onClose={() => setConfirming(false)} title={`Delete ${org.name}?`}>
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            This permanently deletes every project and removes every member. Type <strong>{org.slug}</strong> to confirm.
          </p>
          <ErrorNotice error={remove.error} />
          <Input aria-label="Confirm slug" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setConfirming(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              disabled={confirmText !== org.slug}
              loading={remove.isPending}
              onClick={() => remove.mutate(undefined, { onSuccess: () => router.replace('/app') })}
            >
              Delete forever
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
