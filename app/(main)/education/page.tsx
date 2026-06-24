import { auth } from '@/auth';
import { getAssignments, getParticipantActivityStats } from '@/actions/assignments';
import EducationClient from './EducationClient';

export default async function EducationPage() {
  const session = await auth();
  const userId   = session?.user?.id ?? '';
  const userName = session?.user?.name ?? '학생';
  const isAdmin  = session?.user?.role === 'admin';

  const [assignments, stats] = await Promise.all([
    getAssignments(userId),
    getParticipantActivityStats(userId),
  ]);

  return (
    <EducationClient
      initialAssignments={assignments}
      userName={userName}
      isAdmin={isAdmin}
      stats={stats}
    />
  );
}
