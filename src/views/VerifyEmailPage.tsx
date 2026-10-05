'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { meQueryKey, useAuth } from '@/auth/AuthContext';
import { ErrorNotice, PageLoader, SuccessNotice } from '@/components/ui';
import { AuthLayout } from '@/layouts/AuthLayout';
import { api } from '@/lib/api';

export function VerifyEmailPage() {
  const token = useSearchParams().get('token');
  const { isAuthenticated } = useAuth();
  const qc = useQueryClient();
  const verify = useMutation({
    mutationFn: api.auth.verifyEmail,
    onSuccess: () => qc.invalidateQueries({ queryKey: meQueryKey }),
  });

  // Tokens are single use; StrictMode's double effect must not burn it twice.
  const sent = useRef(false);
  useEffect(() => {
    if (token && !sent.current) {
      sent.current = true;
      verify.mutate(token);
    }
  }, [token, verify]);

  const continueLink = (
    <Link href={isAuthenticated ? '/app' : '/login'} className="font-medium text-indigo-600 hover:text-indigo-500">
      {isAuthenticated ? 'Continue to FlowHub' : 'Sign in'}
    </Link>
  );

  return (
    <AuthLayout title="Confirm your email" subtitle={continueLink}>
      {!token ? (
        <ErrorNotice error={new Error('This link is missing its token.')} />
      ) : verify.isPending || verify.isIdle ? (
        <PageLoader />
      ) : verify.isSuccess ? (
        <SuccessNotice>Thanks, your email is confirmed.</SuccessNotice>
      ) : (
        <div className="space-y-3">
          <ErrorNotice error={verify.error} />
          <p className="text-sm text-slate-600">
            You can request a new link from the banner at the top of your dashboard.
          </p>
        </div>
      )}
    </AuthLayout>
  );
}
