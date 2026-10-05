'use client';

import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/auth/AuthContext';
import { api } from '@/lib/api';

/** Shown until the user confirms their email address. */
export function VerifyEmailBanner() {
  const { me } = useAuth();
  const resend = useMutation({ mutationFn: api.auth.resendVerification });
  if (!me || me.user.emailVerifiedAt) return null;

  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-900">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2">
        <p>
          Confirm your email: we sent a link to <strong>{me.user.email}</strong>.
        </p>
        {resend.isSuccess ? (
          <span className="font-medium">Sent. Check your inbox.</span>
        ) : (
          <button
            onClick={() => resend.mutate()}
            disabled={resend.isPending}
            className="font-semibold underline hover:no-underline disabled:opacity-50"
          >
            {resend.isPending ? 'Sending…' : 'Resend email'}
          </button>
        )}
        {resend.error && <span className="w-full text-red-700">{resend.error.message}</span>}
      </div>
    </div>
  );
}
