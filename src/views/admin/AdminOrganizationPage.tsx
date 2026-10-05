'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Badge, Button, Card, ErrorNotice, Field, Input, Modal, PageLoader } from '@/components/ui';
import { describeActivity } from '@/lib/activity';
import { formatDate, timeAgo } from '@/lib/format';
import { useAdminOrganization, useAdminOrgAction } from '@/lib/queries';

export function AdminOrganizationPage() {
  const id = useSearchParams().get('id') ?? '';
  const org = useAdminOrganization(id);
  const action = useAdminOrgAction();
  const router = useRouter();
  const [dialog, setDialog] = useState<'suspend' | 'delete' | null>(null);
  const [reason, setReason] = useState('');
  const [confirmSlug, setConfirmSlug] = useState('');

  if (!id) return <ErrorNotice error={new Error('No organization selected.')} />;
  if (org.isPending) return <PageLoader />;
  if (org.error) return <ErrorNotice error={org.error} />;
  const o = org.data;
  const close = () => {
    setDialog(null);
    action.reset();
  };

  return (
    <>
      <Link href="/app/admin/organizations" className="text-sm font-medium text-slate-500 hover:text-slate-700">
        ← Organizations
      </Link>
      <div className="mt-3 mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{o.name}</h1>
            {o.suspendedAt ? <Badge tone="amber">Suspended</Badge> : <Badge tone="green">Active</Badge>}
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {o.slug} · created {formatDate(o.createdAt)} · {o.projects} projects · plan{' '}
            <span className="font-medium capitalize text-slate-700">{o.plan}</span> ({o.subscriptionStatus.replace('_', ' ')})
            {o.currentPeriodEnd && <> · renews {formatDate(o.currentPeriodEnd)}</>}
          </p>
          {o.suspendedAt && (
            <p className="mt-2 text-sm text-amber-800">
              Suspended {timeAgo(o.suspendedAt)}
              {o.suspendedReason && <>: {o.suspendedReason}</>}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {o.suspendedAt ? (
            <Button
              variant="secondary"
              loading={action.isPending}
              onClick={() => action.mutate({ type: 'unsuspend', id })}
            >
              Reinstate
            </Button>
          ) : (
            <Button variant="secondary" onClick={() => setDialog('suspend')}>
              Suspend
            </Button>
          )}
          <Button variant="danger" onClick={() => setDialog('delete')}>
            Delete
          </Button>
        </div>
      </div>
      {!dialog && <ErrorNotice error={action.error} />}

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 font-semibold text-slate-900">Members</h2>
          <Card className="divide-y divide-slate-100">
            {o.members.map((m) => (
              <div key={m.userId} className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">{m.name}</p>
                  <p className="truncate text-xs text-slate-500">{m.email}</p>
                </div>
                <Badge tone={m.role === 'owner' ? 'indigo' : 'slate'}>{m.role}</Badge>
              </div>
            ))}
          </Card>
        </section>
        <section>
          <h2 className="mb-3 font-semibold text-slate-900">Recent activity</h2>
          <Card className="divide-y divide-slate-100">
            {o.activity.length === 0 && <p className="px-5 py-4 text-sm text-slate-500">No activity.</p>}
            {o.activity.map((e) => (
              <div key={e.id} className="flex items-baseline justify-between gap-3 px-5 py-3">
                <p className="text-sm text-slate-700">{describeActivity(e)}</p>
                <time className="shrink-0 text-xs text-slate-400">{timeAgo(e.createdAt)}</time>
              </div>
            ))}
          </Card>
        </section>
      </div>

      <Modal open={dialog === 'suspend'} onClose={close} title={`Suspend ${o.name}?`}>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            action.mutate({ type: 'suspend', id, reason: reason || undefined }, { onSuccess: close });
          }}
        >
          <p className="text-sm text-slate-600">
            Every member loses access until you reinstate it. Owners are notified by email.
          </p>
          <ErrorNotice error={action.error} />
          <Field label="Reason" hint="Optional. Shown to the organization’s members.">
            {(fid) => <Input id={fid} maxLength={300} value={reason} onChange={(e) => setReason(e.target.value)} />}
          </Field>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" loading={action.isPending}>
              Suspend
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={dialog === 'delete'} onClose={close} title={`Delete ${o.name}?`}>
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Permanently deletes all of its projects and memberships. Paid subscriptions must be canceled in Stripe
            first. Type <strong>{o.slug}</strong> to confirm.
          </p>
          <ErrorNotice error={action.error} />
          <Input aria-label="Confirm slug" value={confirmSlug} onChange={(e) => setConfirmSlug(e.target.value)} />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={close}>
              Cancel
            </Button>
            <Button
              variant="danger"
              disabled={confirmSlug !== o.slug}
              loading={action.isPending}
              onClick={() =>
                action.mutate({ type: 'delete', id }, { onSuccess: () => router.replace('/app/admin/organizations') })
              }
            >
              Delete forever
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
