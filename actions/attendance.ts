'use server';

import { sql } from '@/lib/db';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

export async function checkAttendanceAction() {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: '로그인이 필요합니다.' };

  const participantId = Number(session.user.id);
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  try {
    // 출석 기록 테이블 자동 생성
    await sql`
      CREATE TABLE IF NOT EXISTS attendance_records (
        id              SERIAL PRIMARY KEY,
        participant_id  INTEGER NOT NULL,
        attended_date   DATE    NOT NULL,
        created_at      TIMESTAMP DEFAULT NOW(),
        UNIQUE (participant_id, attended_date)
      )
    `;

    // 오늘 이미 출석했는지 확인
    const existing = await sql`
      SELECT id FROM attendance_records
      WHERE participant_id = ${participantId} AND attended_date = ${today}
      LIMIT 1
    `;
    if (existing.length > 0) {
      return { success: true, alreadyChecked: true };
    }

    // 출석 기록 INSERT
    await sql`
      INSERT INTO attendance_records (participant_id, attended_date)
      VALUES (${participantId}, ${today})
      ON CONFLICT DO NOTHING
    `;

    // 출석률 재계산: 총 출석 일수 / 프로그램 시작 이후 경과일 * 100
    const countRows = await sql`
      SELECT COUNT(*) AS cnt FROM attendance_records WHERE participant_id = ${participantId}
    `;
    const attendedDays = Number(countRows[0]?.cnt ?? 1);

    // 프로그램 시작일 기준 경과일 (최소 1, 최대 attendedDays로 비율 계산)
    const firstRow = await sql`
      SELECT MIN(attended_date) AS first_date FROM attendance_records WHERE participant_id = ${participantId}
    `;
    const firstDate = new Date(firstRow[0]?.first_date ?? today);
    const todayDate = new Date(today);
    const elapsedDays = Math.max(1, Math.round((todayDate.getTime() - firstDate.getTime()) / 86400000) + 1);

    const newAttendance = Math.min(100, Math.round((attendedDays / elapsedDays) * 100));
    const newStatus = newAttendance >= 80 ? '정상' : newAttendance >= 60 ? '주의' : '위험';

    // participants 테이블 업데이트
    await sql`
      UPDATE participants
      SET attendance  = ${newAttendance},
          status      = ${newStatus},
          last_access = '오늘'
      WHERE id = ${participantId}
    `;

    revalidatePath('/home');
    return { success: true, alreadyChecked: false, attendance: newAttendance };
  } catch (error) {
    console.error('[checkAttendanceAction]', error);
    return { success: false, error: '출석 처리 중 오류가 발생했습니다.' };
  }
}

export async function getTodayAttendance(): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.id) return false;

  const participantId = Number(session.user.id);
  const today = new Date().toISOString().split('T')[0];

  try {
    const rows = await sql`
      SELECT id FROM attendance_records
      WHERE participant_id = ${participantId} AND attended_date = ${today}
      LIMIT 1
    `;
    return rows.length > 0;
  } catch {
    return false;
  }
}
