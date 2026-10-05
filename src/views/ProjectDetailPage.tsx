'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Badge, Button, Card, ErrorNotice, Field, Input, Modal, PageLoader, Textarea } from '@/components/ui';
import { canManage, timeAgo } from '@/lib/format';
import { useDeleteProject, useProject, useRotateApiKey, useUpdateProject } from '@/lib/queries';
import { routes } from '@/lib/routes';
import type { Project } from '@/lib/types';
import { useOrg } from '@/lib/useOrg';

export function ProjectDetailPage() {
  const org = useOrg();
  const projectId = useSearchParams().get('id') ?? '';
  const project = useProject(org.id, projectId);

  if (!projectId) return <ErrorNotice error={new Error('No project selected.')} />;
  if (project.isPending) return <PageLoader />;
  if (project.error) {
    return (
      <div className="space-y-4">
        <ErrorNotice error={project.error} />
        <Link href={routes.org(org.id, 'projects')} className="text-sm font-medium text-indigo-600">
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
      <Link href={routes.org(org.id, 'projects')} className="text-sm font-medium text-slate-500 hover:text-slate-700">
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

      {canManage(org.role) && <ApiKeyCard project={project} />}

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
              remove.mutate(project.id, { onSuccess: () => router.replace(routes.org(org.id, 'projects')) })
            }
          >
            Delete project
          </Button>
        </div>
      </Modal>
    </>
  );
}

/** The project's machine credential. The full key is shown once, right after creation. */
function ApiKeyCard({ project }: { project: Project }) {
  const org = useOrg();
  const rotate = useRotateApiKey(org.id, project.id);
  const [revealed, setRevealed] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const hasKey = !!project.apiKeyPrefix;

  const generate = () =>
    rotate.mutate(undefined, {
      onSuccess: ({ apiKey }) => {
        setRevealed(apiKey);
        setCopied(false);
      },
    });

  return (
    <Card className="mt-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold text-slate-900">API key</h2>
          <p className="mt-1 text-sm text-slate-500">
            Your app sends this in the <code className="rounded bg-slate-100 px-1">x-org-api-key</code> header.
          </p>
        </div>
        <Button variant="secondary" loading={rotate.isPending} onClick={generate}>
          {hasKey ? 'Regenerate key' : 'Generate key'}
        </Button>
      </div>
      <div className="mt-4 space-y-3">
        <ErrorNotice error={rotate.error} />
        {revealed ? (
          <div className="rounded-md bg-amber-50 p-3 ring-1 ring-amber-200">
            <p className="text-sm font-medium text-amber-900">Copy this key now. You won’t see it again.</p>
            <div className="mt-2 flex gap-2">
              <code className="flex-1 overflow-x-auto rounded bg-white px-2 py-1.5 text-sm ring-1 ring-amber-200">{revealed}</code>
              <Button
                variant="secondary"
                onClick={() => navigator.clipboard.writeText(revealed).then(() => setCopied(true))}
              >
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>
        ) : hasKey ? (
          <p className="text-sm text-slate-600">
            Active key <code className="rounded bg-slate-100 px-1">{project.apiKeyPrefix}…</code>
            {project.apiKeyCreatedAt && <> · created {timeAgo(project.apiKeyCreatedAt)}</>}
          </p>
        ) : (
          <p className="text-sm text-slate-500">No key yet.</p>
        )}
      </div>
    </Card>
  );
}
