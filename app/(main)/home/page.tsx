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

  // participants는 통계와 완전히 독립 실행 — 통계 에러가 리스트에 영향 없음
  const { participants, avgParticipationRate } = await getParticipantsWithParticipationRate();

  const [participantCount, submissionRate, allNotices] = await Promise.all([
    getParticipantCount(),
    isAdmin
      ? getAssignmentSubmissionRate()
      : getParticipantActivityStats(userId).then(s => s.overallRate),
    getNotices(),
  ]);

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
