export const dynamic = 'force-dynamic';
export const maxDuration = 60;

import { auth } from '@/auth';
import { getAssignments, getParticipantActivityStats, getAdminMonitoringStats } from '@/actions/assignments';
import { getTodayAttendance } from '@/actions/attendance';
import EducationClient from './EducationClient';

export default async function EducationPage() {
  const session = await auth();
  const userId   = session?.user?.id ?? '';
  const userName = session?.user?.name ?? '학생';
  const isAdmin  = session?.user?.role === 'admin';

  const [assignments, stats, attendanceChecked, adminStats] = await Promise.all([
    getAssignments(userId),
    getParticipantActivityStats(userId),
    isAdmin ? Promise.resolve(false) : getTodayAttendance(),
    isAdmin ? getAdminMonitoringStats() : Promise.resolve(null),
  ]);

  return (
    <EducationClient
      initialAssignments={assignments}
      userName={userName}
      isAdmin={isAdmin}
      stats={stats}
      initialAttendanceChecked={attendanceChecked}
      adminStats={adminStats}
    />
  );
}
