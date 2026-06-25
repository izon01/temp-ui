export const dynamic = 'force-dynamic';

import { auth } from '@/auth';
import { getParticipantCount, getParticipantsWithParticipationRate } from '@/actions/participants';
import { getParticipantActivityStats, getAssignmentSubmissionRate } from '@/actions/assignments';
import { getNotices } from '@/actions/notices';
import HomeClient from './HomeClient';

export default async function HomePage() {
  const session = await auth();
  const userId  = session?.user?.id ?? '';
  const isAdmin = session?.user?.role === 'admin';

  const [{ participants: dbParticipants, avgParticipationRate }, participantCount, submissionRate, allNotices] = await Promise.all([
    getParticipantsWithParticipationRate(),
    getParticipantCount(),
    isAdmin
      ? getAssignmentSubmissionRate()
      : getParticipantActivityStats(userId).then(s => s.overallRate),
    getNotices(),
  ]);

  const participants = dbParticipants;

  const pinnedNotices = (allNotices ?? [])
    .slice(0, 3)
    .map(n => ({ id: n.id, title: n.title, date: n.date, views: n.views, isPinned: n.isPinned, category: n.category, icon: n.icon, content: n.content }));

  return (
    <HomeClient
      participants={participants}
      participantCount={participantCount || participants.length}
      avgParticipationRate={avgParticipationRate}
      submissionRate={submissionRate}
      pinnedNotices={pinnedNotices}
    />
  );
}
