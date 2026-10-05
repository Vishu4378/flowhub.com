import type { Metadata } from 'next';
import { InvitePage } from '@/views/InvitePage';

export const metadata: Metadata = { title: 'Invitation' };

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <InvitePage token={token} />;
}
