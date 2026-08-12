import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getEmploymentRecords } from '@/actions/employment';
import EmploymentStatusClient from './EmploymentStatusClient';

export const dynamic = 'force-dynamic';

export default async function EmploymentStatusPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const records = await getEmploymentRecords();
  const isAdmin = session.user.role === 'admin';

  return <EmploymentStatusClient initialRecords={records} isAdmin={isAdmin} />;
}
