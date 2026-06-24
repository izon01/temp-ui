export const dynamic = 'force-dynamic';

import { auth } from '@/auth';
import { getParticipantCount, getParticipantsWithParticipationRate } from '@/actions/participants';
import { getParticipantActivityStats, getAssignmentSubmissionRate } from '@/actions/assignments';
import { participants as mockParticipants } from '@/data/mockData';
import HomeClient from './HomeClient';

export default async function HomePage() {
  const session = await auth();
  const userId  = session?.user?.id ?? '';
  const isAdmin = session?.user?.role === 'admin';

  const [{ participants: dbParticipants, avgParticipationRate }, participantCount, submissionRate] = await Promise.all([
    getParticipantsWithParticipationRate(),
    getParticipantCount(),
    isAdmin
      ? getAssignmentSubmissionRate()
      : getParticipantActivityStats(userId).then(s => s.overallRate),
  ]);

  const participants = dbParticipants.length > 0
    ? dbParticipants
    : mockParticipants.map(p => ({ ...p, lastAccess: p.lastAccess, participationRate: p.attendance }));

  return (
    <HomeClient
      participants={participants}
      participantCount={participantCount || participants.length}
      avgParticipationRate={avgParticipationRate}
      submissionRate={submissionRate}
    />
  );
}
