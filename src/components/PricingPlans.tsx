'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { PlanCard } from '@/components/PlanCard';
import { api } from '@/lib/api';
import type { Plan } from '@/lib/types';

/** Shows the build-time plans immediately, then refreshes them from the API. */
export function PricingPlans({ initialPlans }: { initialPlans: Plan[] | null }) {
  const plans = useQuery({
    queryKey: ['plans'],
    queryFn: api.billing.plans,
    initialData: initialPlans ?? undefined,
    staleTime: 0,
  });
  const list = plans.data;

  if (!list) {
    return (
      <p className="mt-14 text-center text-slate-500">
        {plans.isPending ? 'Loading plans…' : 'Pricing is temporarily unavailable.'}{' '}
        <Link href="/register" className="font-medium text-indigo-600">
          Start for free
        </Link>
        .
      </p>
    );
  }

  return (
    <div className="mt-14 grid gap-6 md:grid-cols-3">
      {list.map((plan) => (
        <PlanCard
          key={plan.id}
          plan={plan}
          highlighted={plan.id === 'pro'}
          action={
            <Link
              href="/register"
              className={`block rounded-md px-3 py-2 text-center text-sm font-semibold ${
                plan.id === 'pro'
                  ? 'bg-indigo-600 text-white hover:bg-indigo-500'
                  : 'text-slate-700 ring-1 ring-slate-300 ring-inset hover:bg-slate-50'
              }`}
            >
              {plan.priceMonthly === 0 ? 'Get started' : `Start with ${plan.name}`}
            </Link>
          }
        />
      ))}
    </div>
  );
}
