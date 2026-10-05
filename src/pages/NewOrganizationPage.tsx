import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../auth/AuthContext';
import { Button, ErrorNotice, Field, Input } from '../components/ui';
import { AuthLayout } from '../layouts/AuthLayout';
import { useCreateOrganization } from '../lib/queries';

export function NewOrganizationPage() {
  const navigate = useNavigate();
  const { me, signOut } = useAuth();
  const [name, setName] = useState('');
  const create = useCreateOrganization();
  const hasOrgs = (me?.organizations.length ?? 0) > 0;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    create.mutate({ name }, { onSuccess: (org) => navigate(`/orgs/${org.id}/projects`) });
  };

  return (
    <AuthLayout
      title="Create an organization"
      subtitle={
        hasOrgs ? (
          <Link to="/" className="font-medium text-indigo-600 hover:text-indigo-500">
            Back to your workspace
          </Link>
        ) : (
          <>
            Organizations hold your projects and team.{' '}
            <button onClick={signOut} className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign out
            </button>
          </>
        )
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <ErrorNotice error={create.error} />
        <Field label="Organization name">
          {(id) => <Input id={id} autoFocus minLength={2} required value={name} onChange={(e) => setName(e.target.value)} />}
        </Field>
        <Button type="submit" className="w-full" loading={create.isPending}>
          Create organization
        </Button>
      </form>
    </AuthLayout>
  );
}
