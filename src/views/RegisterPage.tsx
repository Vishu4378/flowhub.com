'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { useAuth } from '@/auth/AuthContext';
import { safeNext } from '@/auth/guards';
import { Button, ErrorNotice, Field, Input, PageLoader } from '@/components/ui';
import { AuthLayout } from '@/layouts/AuthLayout';
import { api } from '@/lib/api';
import { routes } from '@/lib/routes';

export function RegisterPage() {
  const { signIn } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const inviteToken = params.get('invite');
  const next = safeNext(params.get('next'));

  // Signing up from an invite: the email is fixed and no new org is created.
  const invite = useQuery({
    queryKey: ['invite', inviteToken],
    queryFn: () => api.invitations.preview(inviteToken!),
    enabled: !!inviteToken,
    retry: false,
  });

  const [form, setForm] = useState({ name: '', email: '', password: '', organizationName: '' });
  const set = (key: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const register = useMutation({
    mutationFn: api.auth.register,
    onSuccess: (session) => {
      signIn(session);
      router.replace(next);
    },
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    register.mutate(
      invite.data
        ? { name: form.name, email: invite.data.email, password: form.password, inviteToken: inviteToken! }
        : form,
    );
  };

  if (inviteToken && invite.isPending) return <PageLoader fullScreen />;

  return (
    <AuthLayout
      title={invite.data ? `Join ${invite.data.organizationName}` : 'Create your account'}
      subtitle={
        <>
          Already have one?{' '}
          <Link
            href={inviteToken ? `/login?next=${encodeURIComponent(routes.invite(inviteToken))}` : '/login'}
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <ErrorNotice error={invite.error ?? register.error} />
        <Field label="Your name">
          {(id) => <Input id={id} autoComplete="name" required value={form.name} onChange={set('name')} />}
        </Field>
        <Field label="Work email" hint={invite.data ? 'This is the address the invitation was sent to.' : undefined}>
          {(id) => (
            <Input
              id={id}
              type="email"
              autoComplete="email"
              required
              value={invite.data?.email ?? form.email}
              readOnly={!!invite.data}
              disabled={!!invite.data}
              onChange={set('email')}
            />
          )}
        </Field>
        <Field label="Password" hint="At least 8 characters.">
          {(id) => (
            <Input id={id} type="password" autoComplete="new-password" minLength={8} required value={form.password} onChange={set('password')} />
          )}
        </Field>
        {!invite.data && (
          <Field label="Organization name" hint="You can invite teammates once you're in.">
            {(id) => <Input id={id} minLength={2} required value={form.organizationName} onChange={set('organizationName')} />}
          </Field>
        )}
        <Button type="submit" className="w-full" loading={register.isPending} disabled={!!inviteToken && !invite.data}>
          {invite.data ? 'Create account and join' : 'Create account'}
        </Button>
      </form>
    </AuthLayout>
  );
}
