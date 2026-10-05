'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { meQueryKey, useAuth } from '@/auth/AuthContext';
import { Button, ErrorNotice, PageLoader } from '@/components/ui';
import { AuthLayout } from '@/layouts/AuthLayout';
import { api } from '@/lib/api';

const linkClass = 'font-medium text-indigo-600 hover:text-indigo-500';

/** Landing page for emailed invite links; works signed in or out. */
export function InvitePage({ token }: { token: string }) {
  const { me, isAuthenticated, isLoading, signOut } = useAuth();
  const router = useRouter();
  const qc = useQueryClient();
  const invite = useQuery({
    queryKey: ['invite', token],
    queryFn: () => api.invitations.preview(token),
    retry: false,
  });
  const accept = useMutation({
    mutationFn: () => api.invitations.accept(token),
    onSuccess: async ({ organizationId }) => {
      await qc.invalidateQueries({ queryKey: meQueryKey });
      router.replace(`/app/orgs/${organizationId}/overview`);
    },
  });

  if (invite.isPending || isLoading) return <PageLoader fullScreen />;
  if (invite.error) {
    return (
      <AuthLayout title="Invitation unavailable" subtitle={<Link href="/" className={linkClass}>Go to FlowHub</Link>}>
        <ErrorNotice error={invite.error} />
        <p className="mt-3 text-sm text-slate-600">Ask the person who invited you to send a new invitation.</p>
      </AuthLayout>
    );
  }

  const data = invite.data;
  const here = `/invite/${token}`;
  const wrongAccount = isAuthenticated && me?.user.email !== data.email;

  return (
    <AuthLayout
      title={`Join ${data.organizationName}`}
      subtitle={`${data.inviterName ?? 'Someone'} invited ${data.email} to join as ${data.role}.`}
    >
      <div className="space-y-4">
        <ErrorNotice error={accept.error} />
        {!isAuthenticated ? (
          <>
            <Link
              href={
                data.accountExists
                  ? `/login?next=${encodeURIComponent(here)}`
                  : `/register?invite=${encodeURIComponent(token)}`
              }
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500"
            >
              {data.accountExists ? 'Sign in to accept' : 'Create your account'}
            </Link>
            <p className="text-center text-sm text-slate-500">
              {data.accountExists ? (
                <>New to FlowHub? <Link href={`/register?invite=${encodeURIComponent(token)}`} className={linkClass}>Sign up</Link></>
              ) : (
                <>Have an account? <Link href={`/login?next=${encodeURIComponent(here)}`} className={linkClass}>Sign in</Link></>
              )}
            </p>
          </>
        ) : wrongAccount ? (
          <>
            <p className="text-sm text-slate-600">
              You’re signed in as <strong>{me?.user.email}</strong>, but this invitation is for{' '}
              <strong>{data.email}</strong>.
            </p>
            <Button variant="secondary" className="w-full" onClick={signOut}>
              Sign out and switch account
            </Button>
          </>
        ) : (
          <Button className="w-full" loading={accept.isPending} onClick={() => accept.mutate()}>
            Accept invitation
          </Button>
        )}
      </div>
    </AuthLayout>
  );
}
