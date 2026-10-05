'use client';

import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { Button, ErrorNotice, Field, Input, SuccessNotice } from '@/components/ui';
import { AuthLayout } from '@/layouts/AuthLayout';
import { api } from '@/lib/api';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const request = useMutation({ mutationFn: api.auth.forgotPassword });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    request.mutate(email);
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle={
        <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
          Back to sign in
        </Link>
      }
    >
      {request.isSuccess ? (
        <SuccessNotice>
          If an account exists for <strong>{email}</strong>, we’ve emailed a link to reset the password. It expires in
          an hour.
        </SuccessNotice>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <ErrorNotice error={request.error} />
          <Field label="Email" hint="We'll email you a link to choose a new password.">
            {(id) => (
              <Input id={id} type="email" autoComplete="email" autoFocus required value={email} onChange={(e) => setEmail(e.target.value)} />
            )}
          </Field>
          <Button type="submit" className="w-full" loading={request.isPending}>
            Send reset link
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
