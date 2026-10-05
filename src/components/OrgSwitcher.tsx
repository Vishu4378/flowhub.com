import { useNavigate } from 'react-router';
import type { Organization } from '../lib/types';

export function OrgSwitcher({ organizations, currentId }: { organizations: Organization[]; currentId: string }) {
  const navigate = useNavigate();
  return (
    <select
      aria-label="Switch organization"
      value={currentId}
      onChange={(e) => {
        const value = e.target.value;
        navigate(value === '__new' ? '/organizations/new' : `/orgs/${value}/projects`);
      }}
      className="w-full truncate rounded-md border-0 bg-slate-800 py-2 pr-8 pl-3 text-sm font-medium text-white ring-1 ring-slate-700 focus:ring-2 focus:ring-indigo-500"
    >
      {organizations.map((org) => (
        <option key={org.id} value={org.id}>
          {org.name}
        </option>
      ))}
      <option value="__new">+ New organization</option>
    </select>
  );
}
