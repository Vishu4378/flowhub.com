'use client';

import { useDeferredValue, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorNotice,
  Field,
  Input,
  Modal,
  PageHeader,
  PageLoader,
  Textarea,
} from '@/components/ui';
import { timeAgo } from '@/lib/format';
import { useCreateProject, useProjects } from '@/lib/queries';
import { routes } from '@/lib/routes';
import type { ProjectStatus } from '@/lib/types';
import { useOrg } from '@/lib/useOrg';

const TABS: { value: ProjectStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archived' },
];

export function ProjectsPage() {
  const org = useOrg();
  const params = useSearchParams();
  const router = useRouter();
  const status = (params.get('status') as ProjectStatus | null) ?? 'active';
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search.trim());
  const [creating, setCreating] = useState(false);

  const projects = useProjects(org.id, { status, search: deferredSearch || undefined });
  const list = projects.data ?? [];

  return (
    <>
      <PageHeader
        title="Projects"
        description={`Everything ${org.name} is working on.`}
        actions={<Button onClick={() => setCreating(true)}>New project</Button>}
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-lg bg-slate-100 p-1" role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              role="tab"
              aria-selected={status === tab.value}
              onClick={() =>
                router.replace(routes.org(org.id, 'projects', tab.value === 'active' ? {} : { status: tab.value }))
              }
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                status === tab.value ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <Input
          type="search"
          placeholder="Search projects…"
          aria-label="Search projects"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
      </div>

      <ErrorNotice error={projects.error} />
      {projects.isPending ? (
        <PageLoader />
      ) : list.length === 0 ? (
        deferredSearch ? (
          <EmptyState title="No matches" description={`No ${status} projects match “${deferredSearch}”.`} />
        ) : status === 'archived' ? (
          <EmptyState title="Nothing archived" description="Archived projects will show up here." />
        ) : (
          <EmptyState
            title="No projects yet"
            description="Create your first project to get your team moving."
            action={<Button onClick={() => setCreating(true)}>New project</Button>}
          />
        )
      ) : (
        <Card className="divide-y divide-slate-100">
          {list.map((project) => (
            <Link
              key={project.id}
              href={routes.project(org.id, project.id)}
              className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-slate-900">{project.name}</p>
                {project.description && (
                  <p className="mt-0.5 truncate text-sm text-slate-500">{project.description}</p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-3">
                {project.status === 'archived' && <Badge>Archived</Badge>}
                <span className="text-xs text-slate-400">Updated {timeAgo(project.updatedAt)}</span>
              </div>
            </Link>
          ))}
        </Card>
      )}

      <Modal open={creating} onClose={() => setCreating(false)} title="New project">
        <CreateProjectForm orgId={org.id} onDone={() => setCreating(false)} />
      </Modal>
    </>
  );
}

function CreateProjectForm({ orgId, onDone }: { orgId: string; onDone: () => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const create = useCreateProject(orgId);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    create.mutate({ name, description: description || undefined }, { onSuccess: onDone });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <ErrorNotice error={create.error} />
      <Field label="Name">
        {(id) => <Input id={id} autoFocus required maxLength={120} value={name} onChange={(e) => setName(e.target.value)} />}
      </Field>
      <Field label="Description" hint="Optional.">
        {(id) => (
          <Textarea id={id} maxLength={2000} value={description} onChange={(e) => setDescription(e.target.value)} />
        )}
      </Field>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" loading={create.isPending}>
          Create project
        </Button>
      </div>
    </form>
  );
}
