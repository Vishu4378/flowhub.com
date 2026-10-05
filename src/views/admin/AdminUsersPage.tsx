'use client';

import { useDeferredValue, useState } from 'react';
import { Pagination } from '@/components/AdminShell';
import { Badge, Card, ErrorNotice, Input, PageHeader, PageLoader } from '@/components/ui';
import { formatDate } from '@/lib/format';
import { useAdminUsers } from '@/lib/queries';

export function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const deferred = useDeferredValue(search.trim());
  const users = useAdminUsers({ search: deferred || undefined, page });

  return (
    <>
      <PageHeader title="Users" />
      <Input
        type="search"
        placeholder="Search by name or email…"
        aria-label="Search users"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        className="mb-4 max-w-xs"
      />
      <ErrorNotice error={users.error} />
      {users.isPending ? (
        <PageLoader />
      ) : (
        <>
          <Card className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="px-5 py-3 font-medium">User</th>
                  <th className="px-5 py-3 text-right font-medium">Organizations</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.data!.items.map((u) => (
                  <tr key={u.id}>
                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-900">
                        {u.name} {u.isSuperAdmin && <Badge tone="amber">Super admin</Badge>}
                      </p>
                      <p className="text-xs text-slate-500">{u.email}</p>
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums">{u.organizations}</td>
                    <td className="px-5 py-3">
                      {u.emailVerifiedAt ? <Badge tone="green">Verified</Badge> : <Badge>Unverified</Badge>}
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-slate-600">{formatDate(u.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <Pagination page={page} pageSize={users.data!.pageSize} total={users.data!.total} onPage={setPage} />
        </>
      )}
    </>
  );
}
