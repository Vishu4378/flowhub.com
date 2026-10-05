'use client';

import Link from 'next/link';
import { Button, Card, EmptyState, ErrorNotice, PageHeader, PageLoader } from '@/components/ui';
import { describeActivity } from '@/lib/activity';
import { timeAgo } from '@/lib/format';
import { useAdminActivity } from '@/lib/queries';
import { routes } from '@/lib/routes';

/** Every organization's activity in one stream, newest first. */
export function AdminActivityPage() {
  const activity = useAdminActivity();
  const entries = activity.data?.pages.flat() ?? [];

  return (
    <>
      <PageHeader title="Audit log" description="Everything that happened across the platform." />
      <ErrorNotice error={activity.error} />
      {activity.isPending ? (
        <PageLoader />
      ) : entries.length === 0 ? (
        <EmptyState title="Nothing yet" description="Activity from every organization will show up here." />
      ) : (
        <Card>
          <ol className="divide-y divide-slate-100">
            {entries.map((e) => (
              <li key={e.id} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-5 py-3">
                <p className="text-sm text-slate-700">
                  <Link href={routes.adminOrg(e.organizationId)} className="font-medium text-slate-900 hover:text-indigo-600">
                    {e.organizationName}
                  </Link>
                  <span className="text-slate-400"> · </span>
                  {describeActivity(e)}
                </p>
                <time dateTime={e.createdAt} title={new Date(e.createdAt).toLocaleString()} className="text-xs text-slate-400">
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
    </>
  );
}
