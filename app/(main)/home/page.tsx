export const dynamic = 'force-dynamic';
export const maxDuration = 60;

import { auth } from '@/auth';
import { getParticipantCount, getParticipantsWithParticipationRate } from '@/actions/participants';
import { getParticipantActivityStats, getAssignmentSubmissionRate } from '@/actions/assignments';
import { getNotices } from '@/actions/notices';
import { runMigrations } from '@/lib/migrations';
import HomeClient from './HomeClient';

export default async function HomePage() {
  await runMigrations();
  const session = await auth();
  const userId  = session?.user?.id ?? '';
  const isAdmin = session?.user?.role === 'admin';

  const [{ participants, avgParticipationRate }, participantCount, submissionRate, allNotices] = await Promise.all([
    getParticipantsWithParticipationRate(),
    getParticipantCount(),
    isAdmin
      ? getAssignmentSubmissionRate()
      : userId
        ? getParticipantActivityStats(userId).then(s => s?.overallRate ?? 0)
        : Promise.resolve(0),
    getNotices(),
  ]);

  const pinnedNotices = (allNotices ?? [])
    .sort((a, b) => b.date.localeCompare(a.date))   // 최신순
    .slice(0, 3)
    .map(n => ({ id: n.id, title: n.title, date: n.date, views: n.views, isPinned: n.isPinned, category: n.category, icon: n.icon, content: n.content, imageUrl: n.imageUrl ?? null, fileName: n.fileName ?? null }));

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
