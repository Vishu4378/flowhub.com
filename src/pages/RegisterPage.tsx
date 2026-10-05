import { useMutation } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../auth/AuthContext';
import { Button, ErrorNotice, Field, Input } from '../components/ui';
import { AuthLayout } from '../layouts/AuthLayout';
import { api } from '../lib/api';

export function RegisterPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', organizationName: '' });
  const set = (key: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const register = useMutation({
    mutationFn: api.auth.register,
    onSuccess: (session) => {
      signIn(session);
      navigate('/', { replace: true });
    },
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    register.mutate(form);
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle={
        <>
          Already have one?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <ErrorNotice error={register.error} />
        <Field label="Your name">
          {(id) => <Input id={id} autoComplete="name" required value={form.name} onChange={set('name')} />}
        </Field>
        <Field label="Work email">
          {(id) => <Input id={id} type="email" autoComplete="email" required value={form.email} onChange={set('email')} />}
        </Field>
        <Field label="Password" hint="At least 8 characters.">
          {(id) => (
            <Input
              id={id}
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              value={form.password}
              onChange={set('password')}
            />
          )}
        </Field>
        <Field label="Organization name" hint="You can invite teammates once you're in.">
          {(id) => <Input id={id} minLength={2} required value={form.organizationName} onChange={set('organizationName')} />}
        </Field>
        <Button type="submit" className="w-full" loading={register.isPending}>
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
}
