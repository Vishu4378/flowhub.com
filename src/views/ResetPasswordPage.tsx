'use client';

import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { useAuth } from '@/auth/AuthContext';
import { Button, ErrorNotice, Field, Input } from '@/components/ui';
import { AuthLayout } from '@/layouts/AuthLayout';
import { api } from '@/lib/api';

export function ResetPasswordPage() {
  const token = useSearchParams().get('token') ?? '';
  const router = useRouter();
  const { signIn } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const reset = useMutation({
    mutationFn: api.auth.resetPassword,
    onSuccess: (session) => {
      signIn(session);
      router.replace('/app');
    },
  });

  const mismatch = confirm.length > 0 && confirm !== password;
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!mismatch) reset.mutate({ token, password });
  };

  return (
    <AuthLayout
      title="Choose a new password"
      subtitle={
        <Link href="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
          Need a new link?
        </Link>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <ErrorNotice error={!token ? new Error('This link is missing its token.') : reset.error} />
        <Field label="New password" hint="At least 8 characters.">
          {(id) => (
            <Input id={id} type="password" autoComplete="new-password" autoFocus minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} />
          )}
        </Field>
        <Field label="Confirm password" hint={mismatch ? <span className="text-red-600">Passwords don’t match.</span> : undefined}>
          {(id) => (
            <Input id={id} type="password" autoComplete="new-password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          )}
        </Field>
        <Button type="submit" className="w-full" loading={reset.isPending} disabled={!token || mismatch}>
          Save password and sign in
        </Button>
      </form>
    </AuthLayout>
  );
}
