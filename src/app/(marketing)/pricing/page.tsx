import type { Metadata } from 'next';
import Link from 'next/link';
import { PlanCard } from '@/components/PlanCard';
import type { Plan } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Simple monthly plans for teams of every size. Start free, upgrade when you grow.',
  alternates: { canonical: '/pricing' },
};

// Regenerated in the background at most every 5 minutes (ISR), so price
// changes show up without a redeploy while the page stays static.
export const revalidate = 300;

async function getPlans(): Promise<Plan[] | null> {
  const base = process.env.API_PROXY_URL ?? 'http://localhost:3000';
  try {
    const res = await fetch(`${base}/api/billing/plans`, { next: { revalidate } });
    return res.ok ? ((await res.json()) as Plan[]) : null;
  } catch {
    return null;
  }
}

const FAQ = [
  {
    q: 'Can I start for free?',
    a: 'Yes. The Free plan has no time limit. Upgrade only when you need more projects or members.',
  },
  {
    q: 'Do pending invitations count toward the member limit?',
    a: 'Yes. Invitations reserve a seat until they are accepted, revoked, or expire after 7 days.',
  },
  {
    q: 'Can I change or cancel my plan?',
    a: 'Anytime, from Billing → Manage billing. Cancellations take effect at the end of the paid period.',
  },
];

export default async function PricingPage() {
  const plans = await getPlans();
  return (
    <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">Simple, predictable pricing</h1>
        <p className="mt-4 text-lg text-slate-600">Start free. Upgrade when your team grows.</p>
      </div>

      {plans ? (
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
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
      ) : (
        <p className="mt-14 text-center text-slate-500">
          Pricing is temporarily unavailable. <Link href="/register" className="font-medium text-indigo-600">Start for free</Link>.
        </p>
      )}

      <section aria-labelledby="faq" className="mx-auto mt-24 max-w-3xl">
        <h2 id="faq" className="text-2xl font-semibold tracking-tight text-slate-900">Frequently asked questions</h2>
        <dl className="mt-8 divide-y divide-slate-200">
          {FAQ.map((item) => (
            <div key={item.q} className="py-5">
              <dt className="font-medium text-slate-900">{item.q}</dt>
              <dd className="mt-2 text-sm leading-6 text-slate-600">{item.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: FAQ.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
          }),
        }}
      />
    </div>
  );
}
