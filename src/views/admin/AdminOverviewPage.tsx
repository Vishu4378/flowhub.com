'use client';

import Link from 'next/link';
import { ColumnChart } from '@/components/charts/ColumnChart';
import { Card, ErrorNotice, PageHeader, PageLoader } from '@/components/ui';
import { formatMoney } from '@/lib/format';
import { useAdminStats } from '@/lib/queries';

const DAY_MS = 24 * 60 * 60 * 1000;
const short = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' });
const long = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

/** Monday 00:00 UTC of the current week, matching the API's $dateTrunc. */
function thisWeekStart() {
  const now = new Date();
  const d = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return d - ((new Date(d).getUTCDay() + 6) % 7) * DAY_MS;
}

function Tile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card className="p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </Card>
  );
}

export function AdminOverviewPage() {
  const stats = useAdminStats();
  if (stats.isPending) return <PageLoader />;
  if (stats.error) return <ErrorNotice error={stats.error} />;
  const s = stats.data;

  // The API only returns weeks that had signups; fill the gaps with zeros.
  const counts = new Map(s.signupsByWeek.map((w) => [new Date(w.weekStart).getTime(), w.count]));
  const start = thisWeekStart() - 11 * 7 * DAY_MS;
  const weeks = Array.from({ length: 12 }, (_, i) => {
    const t = start + i * 7 * DAY_MS;
    return { key: String(t), label: short.format(t), title: `Week of ${long.format(t)}`, value: counts.get(t) ?? 0 };
  });
  const revenue30 = s.revenue.last30Days.map((r) => formatMoney(r.amount, r.currency)).join(' + ') || formatMoney(0, 'usd');

  return (
    <>
      <PageHeader title="Platform overview" description="Every organization on FlowHub." />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <Tile label="Monthly recurring revenue" value={formatMoney(s.revenue.mrr, s.revenue.currency)} sub="From active subscriptions" />
        <Tile label="Collected in the last 30 days" value={revenue30} />
        <Tile
          label="Paying organizations"
          value={s.organizations.paying.toLocaleString()}
          sub={`Pro ${s.organizations.byPlan.pro ?? 0} · Business ${s.organizations.byPlan.business ?? 0}`}
        />
        <Tile
          label="Organizations"
          value={s.organizations.total.toLocaleString()}
          sub={s.organizations.suspended ? `${s.organizations.suspended} suspended` : undefined}
        />
        <Tile label="Users" value={s.users.total.toLocaleString()} sub={`${s.users.signupsLast30Days} new in 30 days`} />
        <Tile label="Projects" value={s.projects.total.toLocaleString()} />
      </div>

      <Card className="mt-6 p-5">
        <div className="flex items-baseline justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">Signups per week</h2>
            <p className="mb-4 text-sm text-slate-500">Last 12 weeks</p>
          </div>
          <Link href="/app/admin/users" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
            All users →
          </Link>
        </div>
        <ColumnChart data={weeks} valueLabel="Signups" width={1000} />
      </Card>

      <p className="mt-6 text-sm text-slate-500">
        System health: the API reports its status at <code className="rounded bg-slate-100 px-1">GET /health</code>.
        Metrics dashboards arrive with Prometheus and Grafana (Phase 8).
      </p>
    </>
  );
}
