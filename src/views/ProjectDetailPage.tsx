'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Badge, Button, Card, ErrorNotice, Field, Input, Modal, PageLoader, Textarea } from '@/components/ui';
import { canManage, timeAgo } from '@/lib/format';
import { useDeleteProject, useProject, useUpdateProject } from '@/lib/queries';
import type { Project } from '@/lib/types';
import { useOrg } from '@/lib/useOrg';

export function ProjectDetailPage({ projectId }: { projectId: string }) {
  const org = useOrg();
  const project = useProject(org.id, projectId);

  if (project.isPending) return <PageLoader />;
  if (project.error) {
    return (
      <div className="space-y-4">
        <ErrorNotice error={project.error} />
        <Link href={`/app/orgs/${org.id}/projects`} className="text-sm font-medium text-indigo-600">
          ← Back to projects
        </Link>
      </div>
    );
  }
  // Keyed so the form resets when navigating between projects.
  return <ProjectEditor key={project.data.id} project={project.data} />;
}

function ProjectEditor({ project }: { project: Project }) {
  const org = useOrg();
  const router = useRouter();
  const update = useUpdateProject(org.id, project.id);
  const remove = useDeleteProject(org.id);
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const dirty = name !== project.name || description !== project.description;
  const archived = project.status === 'archived';

  const save = (e: FormEvent) => {
    e.preventDefault();
    update.mutate({ name, description });
  };

  return (
    <>
      <Link href={`/app/orgs/${org.id}/projects`} className="text-sm font-medium text-slate-500 hover:text-slate-700">
        ← Projects
      </Link>
      <div className="mt-3 mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">{project.name}</h1>
          <Badge tone={archived ? 'slate' : 'green'}>{project.status}</Badge>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            loading={update.isPending && update.variables?.status !== undefined}
            onClick={() => update.mutate({ status: archived ? 'active' : 'archived' })}
          >
            {archived ? 'Restore' : 'Archive'}
          </Button>
          {canManage(org.role) && (
            <Button variant="danger" onClick={() => setConfirmDelete(true)}>
              Delete
            </Button>
          )}
        </div>
      </div>

      <Card className="p-6">
        <form onSubmit={save} className="space-y-4">
          <ErrorNotice error={update.error} />
          <Field label="Name">
            {(id) => <Input id={id} required maxLength={120} value={name} onChange={(e) => setName(e.target.value)} />}
          </Field>
          <Field label="Description">
            {(id) => (
              <Textarea
                id={id}
                rows={6}
                maxLength={2000}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            )}
          </Field>
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Created {timeAgo(project.createdAt)} · Updated {timeAgo(project.updatedAt)}
            </p>
            <Button type="submit" disabled={!dirty} loading={update.isPending && update.variables?.status === undefined}>
              Save changes
            </Button>
          </div>
        </form>
      </Card>

      <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Delete project?">
        <p className="text-sm text-slate-600">
          <strong>{project.name}</strong> will be permanently deleted. Archive it instead if you might need it again.
        </p>
        <ErrorNotice error={remove.error} />
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            loading={remove.isPending}
            onClick={() =>
              remove.mutate(project.id, { onSuccess: () => router.replace(`/app/orgs/${org.id}/projects`) })
            }
          >
            Delete project
          </Button>
        </div>
      </Modal>
    </>
  );
}
