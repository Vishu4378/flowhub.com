import type { ReactNode } from 'react';
import { formatMoney } from '@/lib/format';
import type { Plan } from '@/lib/types';

/** One plan's price, limits and features. Server-safe: no hooks. */
export function PlanCard({
  plan,
  highlighted,
  action,
}: {
  plan: Pick<Plan, 'id' | 'name' | 'description' | 'priceMonthly' | 'currency' | 'features'>;
  highlighted?: boolean;
  action?: ReactNode;
}) {
  return (
    <div
      className={`flex flex-col rounded-xl bg-white p-6 ring-1 ${
        highlighted ? 'ring-2 ring-indigo-600' : 'ring-slate-200'
      }`}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">{plan.name}</h3>
        {highlighted && (
          <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">Popular</span>
        )}
      </div>
      <p className="mt-1 text-sm text-slate-500">{plan.description}</p>
      <p className="mt-5">
        <span className="text-3xl font-semibold tracking-tight text-slate-900">
          {plan.priceMonthly === 0 ? 'Free' : formatMoney(plan.priceMonthly, plan.currency)}
        </span>
        {plan.priceMonthly > 0 && <span className="text-sm text-slate-500"> / month</span>}
      </p>
      <ul className="mt-5 flex-1 space-y-2 text-sm text-slate-700">
        {plan.features.map((f) => (
          <li key={f} className="flex gap-2">
            <svg className="mt-0.5 size-4 shrink-0 text-indigo-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
              <path fillRule="evenodd" d="M16.7 5.3a1 1 0 0 1 0 1.4l-8 8a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4L8 12.6l7.3-7.3a1 1 0 0 1 1.4 0Z" clipRule="evenodd" />
            </svg>
            {f}
          </li>
        ))}
      </ul>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
