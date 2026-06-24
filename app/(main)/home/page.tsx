export const dynamic = 'force-dynamic';

import { getParticipantCount, getParticipants, getAverageAttendance } from '@/actions/participants';
import { participants as mockParticipants } from '@/data/mockData';
import HomeClient from './HomeClient';

export default async function HomePage() {
  const [dbParticipants, participantCount, avgAttendance] = await Promise.all([
    getParticipants(),
    getParticipantCount(),
    getAverageAttendance(),
  ]);

  const participants = dbParticipants && dbParticipants.length > 0
    ? dbParticipants
    : mockParticipants.map(p => ({ ...p, lastAccess: p.lastAccess }));

  // mock fallback 시 평균 계산
  const attendanceRate = avgAttendance > 0
    ? avgAttendance
    : Math.round(participants.reduce((s, p) => s + p.attendance, 0) / (participants.length || 1));

  return (
    <HomeClient
      participants={participants}
      participantCount={participantCount || participants.length}
      initialAttendanceRate={attendanceRate}
    />
  );
}
