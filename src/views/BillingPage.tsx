'use client';

import { useQueryClient } from '@tanstack/react-query';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { PlanCard } from '@/components/PlanCard';
import { Badge, Button, Card, ErrorNotice, PageHeader, PageLoader, SuccessNotice } from '@/components/ui';
import { canManage, formatDate, formatMoney } from '@/lib/format';
import { keys, useBilling, useBillingPortal, useCheckout, usePayments, usePlans } from '@/lib/queries';
import type { BillingOverview, SubscriptionStatus } from '@/lib/types';
import { useOrg } from '@/lib/useOrg';

const STATUS: Record<SubscriptionStatus, { label: string; tone: 'green' | 'amber' | 'slate' }> = {
  none: { label: 'Free', tone: 'slate' },
  incomplete: { label: 'Incomplete', tone: 'amber' },
  trialing: { label: 'Trial', tone: 'green' },
  active: { label: 'Active', tone: 'green' },
  past_due: { label: 'Payment due', tone: 'amber' },
  canceled: { label: 'Canceled', tone: 'slate' },
  unpaid: { label: 'Unpaid', tone: 'amber' },
};

export function BillingPage() {
  const org = useOrg();
  const billing = useBilling(org.id);
  const plans = usePlans();
  const checkout = useCheckout(org.id);
  const portal = useBillingPortal(org.id);
  const isOwner = org.role === 'owner';
  const result = useCheckoutResult(org.id);

  if (billing.isPending || plans.isPending) return <PageLoader />;
  if (billing.error || plans.error) return <ErrorNotice error={billing.error ?? plans.error} />;
  const b = billing.data;

  return (
    <>
      <PageHeader
        title="Billing"
        description="Your plan, usage and invoices."
        actions={
          isOwner &&
          b.hasBillingAccount && (
            <Button variant="secondary" loading={portal.isPending} onClick={() => portal.mutate()}>
              Manage billing
            </Button>
          )
        }
      />

      <div className="space-y-4">
        {result === 'success' && (
          <SuccessNotice>Thanks! Your payment went through. Your new plan will appear here in a moment.</SuccessNotice>
        )}
        {result === 'canceled' && <ErrorNotice error={new Error('Checkout was canceled. You have not been charged.')} />}
        <ErrorNotice error={checkout.error ?? portal.error} />
        {!b.billingEnabled && (
          <p className="rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-600">
            Paid plans aren’t enabled on this server yet.
          </p>
        )}
      </div>

      <CurrentPlan billing={b} />

      <h2 className="mt-10 mb-4 font-semibold text-slate-900">Plans</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {plans.data.map((plan) => {
          const current = plan.id === b.plan.id;
          let action = null;
          if (current) {
            action = <Button variant="secondary" className="w-full" disabled>Current plan</Button>;
          } else if (isOwner && plan.id !== 'free') {
            action = b.hasBillingAccount && b.plan.id !== 'free' ? (
              <Button variant="secondary" className="w-full" loading={portal.isPending} onClick={() => portal.mutate()}>
                Switch in billing portal
              </Button>
            ) : (
              <Button
                className="w-full"
                disabled={!plan.purchasable}
                loading={checkout.isPending && checkout.variables === plan.id}
                onClick={() => checkout.mutate(plan.id as 'pro' | 'business')}
              >
                {plan.purchasable ? `Upgrade to ${plan.name}` : 'Unavailable'}
              </Button>
            );
          }
          return <PlanCard key={plan.id} plan={plan} highlighted={plan.id === 'pro'} action={action} />;
        })}
      </div>
      {!isOwner && <p className="mt-3 text-sm text-slate-500">Only owners can change the plan.</p>}

      {canManage(org.role) && <Invoices />}
    </>
  );
}

/**
 * After returning from Stripe, the webhook may land a second or two later.
 * Poll the overview briefly, then clean ?checkout= from the URL.
 */
function useCheckoutResult(orgId: string) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const qc = useQueryClient();
  const result = params.get('checkout');

  useEffect(() => {
    if (result !== 'success') return;
    let tries = 0;
    const timer = setInterval(() => {
      void qc.invalidateQueries({ queryKey: keys.billing(orgId) });
      if (++tries >= 5) clearInterval(timer);
    }, 2000);
    return () => clearInterval(timer);
  }, [result, orgId, qc]);

  useEffect(() => {
    if (!result) return;
    const t = setTimeout(() => router.replace(pathname), 15_000);
    return () => clearTimeout(t);
  }, [result, router, pathname]);

  return result;
}

function CurrentPlan({ billing: b }: { billing: BillingOverview }) {
  const status = STATUS[b.status];
  return (
    <Card className="mt-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">Current plan</p>
          <div className="mt-1 flex items-center gap-2">
            <h2 className="text-xl font-semibold text-slate-900">{b.plan.name}</h2>
            <Badge tone={status.tone}>{status.label}</Badge>
          </div>
          {b.currentPeriodEnd && b.plan.id !== 'free' && (
            <p className="mt-1 text-sm text-slate-500">
              {b.cancelAtPeriodEnd ? 'Ends' : 'Renews'} on {formatDate(b.currentPeriodEnd)}
            </p>
          )}
          {b.status === 'past_due' && (
            <p className="mt-2 text-sm font-medium text-amber-700">
              Your last payment failed. Update your card in the billing portal to keep this plan.
            </p>
          )}
        </div>
        <p className="text-right text-2xl font-semibold text-slate-900">
          {b.plan.priceMonthly ? formatMoney(b.plan.priceMonthly, b.plan.currency) : 'Free'}
          {b.plan.priceMonthly > 0 && <span className="text-sm font-normal text-slate-500"> / month</span>}
        </p>
      </div>
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <Meter label="Projects" used={b.usage.projects} limit={b.plan.limits.projects} />
        <Meter label="Members and pending invitations" used={b.usage.members} limit={b.plan.limits.members} />
      </div>
    </Card>
  );
}

/** Fill shifts accent → warning → danger as usage nears the limit; the track is a light step of the same ramp. */
function Meter({ label, used, limit }: { label: string; used: number; limit: number | null }) {
  const ratio = limit ? Math.min(used / limit, 1) : 0;
  const fill = ratio >= 1 ? 'bg-red-500' : ratio >= 0.8 ? 'bg-amber-500' : 'bg-indigo-600';
  const track = ratio >= 1 ? 'bg-red-100' : ratio >= 0.8 ? 'bg-amber-100' : 'bg-indigo-100';
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-sm">
        <span className="text-slate-700">{label}</span>
        <span className="font-medium text-slate-900 tabular-nums">
          {used} {limit === null ? '' : `/ ${limit}`}
          {limit === null && <span className="font-normal text-slate-500">· unlimited</span>}
        </span>
      </div>
      {limit !== null && (
        <div
          className={`h-2 rounded-full ${track}`}
          role="meter"
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={limit}
          aria-valuenow={used}
        >
          <div className={`h-2 rounded-full ${fill}`} style={{ width: `${Math.max(ratio * 100, used ? 4 : 0)}%` }} />
        </div>
      )}
      {limit !== null && used >= limit && <p className="mt-1 text-xs text-red-600">Limit reached. Upgrade to add more.</p>}
    </div>
  );
}

function Invoices() {
  const org = useOrg();
  const payments = usePayments(org.id);
  const list = payments.data ?? [];
  return (
    <section className="mt-10">
      <h2 className="mb-4 font-semibold text-slate-900">Invoices</h2>
      <ErrorNotice error={payments.error} />
      {payments.isPending ? (
        <PageLoader />
      ) : list.length === 0 ? (
        <p className="text-sm text-slate-500">No invoices yet.</p>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Description</th>
                <th className="px-5 py-3 text-right font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.map((p) => (
                <tr key={p.id}>
                  <td className="px-5 py-3 whitespace-nowrap text-slate-700">{formatDate(p.occurredAt)}</td>
                  <td className="px-5 py-3 text-slate-700">{p.description}</td>
                  <td className="px-5 py-3 text-right text-slate-900 tabular-nums">{formatMoney(p.amount, p.currency)}</td>
                  <td className="px-5 py-3">
                    <Badge tone={p.status === 'paid' ? 'green' : 'amber'}>{p.status}</Badge>
                  </td>
                  <td className="px-5 py-3 text-right whitespace-nowrap">
                    {p.invoiceUrl && (
                      <a href={p.invoiceUrl} target="_blank" rel="noreferrer" className="font-medium text-indigo-600 hover:text-indigo-500">
                        View
                      </a>
                    )}
                    {p.invoicePdfUrl && (
                      <a href={p.invoicePdfUrl} target="_blank" rel="noreferrer" className="ml-3 font-medium text-indigo-600 hover:text-indigo-500">
                        PDF
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </section>
  );
}
