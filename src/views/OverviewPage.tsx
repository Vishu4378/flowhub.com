'use client';

import { BarList } from '@/components/charts/BarList';
import { ColumnChart } from '@/components/charts/ColumnChart';
import { Button, Card, EmptyState, ErrorNotice, PageHeader, PageLoader } from '@/components/ui';
import { ACTIVITY_LABELS, describeActivity } from '@/lib/activity';
import { timeAgo } from '@/lib/format';
import { useActivity, useAnalytics } from '@/lib/queries';
import { useOrg } from '@/lib/useOrg';

const short = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' });
const long = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <Card className="p-5">
      <p className="text-sm text-balance text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">{value.toLocaleString()}</p>
    </Card>
  );
}

export function OverviewPage() {
  const org = useOrg();
  const analytics = useAnalytics(org.id);

  if (analytics.isPending) return <PageLoader />;
  if (analytics.error) return <ErrorNotice error={analytics.error} />;
  const { totals, projectsCreatedByWeek, activityByType } = analytics.data;

  const weeks = projectsCreatedByWeek.map((w) => {
    const date = new Date(w.weekStart);
    return { key: w.weekStart, label: short.format(date), title: `Week of ${long.format(date)}`, value: w.count };
  });

  return (
    <>
      <PageHeader title="Overview" description={`How ${org.name} is doing at a glance.`} />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Active projects" value={totals.activeProjects} />
        <StatTile label="Archived projects" value={totals.archivedProjects} />
        <StatTile label="Members" value={totals.members} />
        <StatTile label="Events in the last 30 days" value={totals.eventsLast30Days} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <h2 className="font-semibold text-slate-900">Projects created per week</h2>
          <p className="mb-4 text-sm text-slate-500">Last 12 weeks</p>
          <ColumnChart data={weeks} valueLabel="Projects" />
        </Card>
        <Card className="p-5">
          <h2 className="font-semibold text-slate-900">Activity by type</h2>
          <p className="mb-4 text-sm text-slate-500">Last 30 days</p>
          {activityByType.length ? (
            <BarList items={activityByType.map((a) => ({ label: ACTIVITY_LABELS[a.type] ?? a.type, value: a.count }))} />
          ) : (
            <p className="text-sm text-slate-500">No activity yet.</p>
          )}
        </Card>
      </div>

      <ActivityFeed />
    </>
  );
}

function ActivityFeed() {
  const org = useOrg();
  const activity = useActivity(org.id);
  const entries = activity.data?.pages.flat() ?? [];

  return (
    <section className="mt-8">
      <h2 className="mb-3 font-semibold text-slate-900">Recent activity</h2>
      <ErrorNotice error={activity.error} />
      {activity.isPending ? (
        <PageLoader />
      ) : entries.length === 0 ? (
        <EmptyState title="No activity yet" description="Changes to projects and members will appear here." />
      ) : (
        <Card>
          <ol className="divide-y divide-slate-100">
            {entries.map((e) => (
              <li key={e.id} className="flex items-baseline justify-between gap-4 px-5 py-3">
                <p className="text-sm text-slate-700">{describeActivity(e)}</p>
                <time dateTime={e.createdAt} className="shrink-0 text-xs text-slate-400" title={new Date(e.createdAt).toLocaleString()}>
                  {timeAgo(e.createdAt)}
                </time>
              </li>
            ))}
          </ol>
          {activity.hasNextPage && (
            <div className="border-t border-slate-100 p-3 text-center">
              <Button variant="ghost" loading={activity.isFetchingNextPage} onClick={() => activity.fetchNextPage()}>
                Load more
              </Button>
            </div>
          )}
        </Card>
      )}
    </section>
  );
}
