'use client';

import Link from 'next/link';
import { useDeferredValue, useState } from 'react';
import { Pagination } from '@/components/AdminShell';
import { Badge, Card, ErrorNotice, Input, PageHeader, PageLoader, Select } from '@/components/ui';
import { formatDate } from '@/lib/format';
import { useAdminOrganizations } from '@/lib/queries';
import { routes } from '@/lib/routes';

export function AdminOrganizationsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'' | 'active' | 'suspended'>('');
  const [page, setPage] = useState(1);
  const deferred = useDeferredValue(search.trim());
  const orgs = useAdminOrganizations({ search: deferred || undefined, status: status || undefined, page });

  return (
    <>
      <PageHeader title="Organizations" />
      <div className="mb-4 flex flex-wrap gap-3">
        <Input
          type="search"
          placeholder="Search by name or slug…"
          aria-label="Search organizations"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="max-w-xs"
        />
        <div className="w-40">
          <Select
            aria-label="Status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as typeof status);
              setPage(1);
            }}
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </Select>
        </div>
      </div>

      <ErrorNotice error={orgs.error} />
      {orgs.isPending ? (
        <PageLoader />
      ) : (
        <>
          <Card className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="px-5 py-3 font-medium">Organization</th>
                  <th className="px-5 py-3 font-medium">Plan</th>
                  <th className="px-5 py-3 text-right font-medium">Members</th>
                  <th className="px-5 py-3 text-right font-medium">Projects</th>
                  <th className="px-5 py-3 font-medium">Created</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orgs.data!.items.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <Link href={routes.adminOrg(o.id)} className="font-medium text-slate-900 hover:text-indigo-600">
                        {o.name}
                      </Link>
                      <p className="text-xs text-slate-500">{o.slug}</p>
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={o.plan === 'free' ? 'slate' : 'indigo'}>{o.plan}</Badge>
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums">{o.members}</td>
                    <td className="px-5 py-3 text-right tabular-nums">{o.projects}</td>
                    <td className="px-5 py-3 whitespace-nowrap text-slate-600">{formatDate(o.createdAt)}</td>
                    <td className="px-5 py-3">
                      {o.suspendedAt ? <Badge tone="amber">Suspended</Badge> : <Badge tone="green">Active</Badge>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <Pagination page={page} pageSize={orgs.data!.pageSize} total={orgs.data!.total} onPage={setPage} />
        </>
      )}
    </>
  );
}
