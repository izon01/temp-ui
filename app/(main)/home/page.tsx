export const dynamic = 'force-dynamic';

import { auth } from '@/auth';
import { getParticipantCount, getParticipants, getAverageAttendance } from '@/actions/participants';
import { getParticipantActivityStats, getAssignmentSubmissionRate } from '@/actions/assignments';
import { participants as mockParticipants } from '@/data/mockData';
import HomeClient from './HomeClient';

export default async function HomePage() {
  const session = await auth();
  const userId  = session?.user?.id ?? '';
  const isAdmin = session?.user?.role === 'admin';

  const [dbParticipants, participantCount, avgAttendance, submissionRate] = await Promise.all([
    getParticipants(),
    getParticipantCount(),
    getAverageAttendance(),
    isAdmin
      ? getAssignmentSubmissionRate()                           // 관리자: 전체 평균
      : getParticipantActivityStats(userId).then(s => s.overallRate), // 참여자: 본인 제출률
  ]);

  const participants = dbParticipants && dbParticipants.length > 0
    ? dbParticipants
    : mockParticipants.map(p => ({ ...p, lastAccess: p.lastAccess }));

  const attendanceRate = avgAttendance > 0
    ? avgAttendance
    : Math.round(participants.reduce((s, p) => s + p.attendance, 0) / (participants.length || 1));

  return (
    <HomeClient
      participants={participants}
      participantCount={participantCount || participants.length}
      initialAttendanceRate={attendanceRate}
      submissionRate={submissionRate}
    />
  );
}
