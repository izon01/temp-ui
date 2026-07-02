import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getSupportRequests } from '@/actions/support';
import SupportClient from './SupportClient';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export default async function SupportPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const requests = await getSupportRequests();
  const isAdmin = session.user.role === 'admin';
  const currentUserId = session.user.id;

  return <SupportClient initialRequests={requests} isAdmin={isAdmin} currentUserId={currentUserId} />;
}
