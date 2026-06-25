'use server';

import { sql } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';

export async function getAverageAttendance(): Promise<number> {
  try {
    const rows = await sql`
      SELECT ROUND(AVG(attendance)) AS avg FROM participants WHERE role = 'participant'
    `;
    return Number(rows[0]?.avg ?? 0);
  } catch (error) {
    console.error('[getAverageAttendance]', error);
    return 0;
  }
}

export async function getParticipantStats(participantId: number) {
  try {
    const rows = await sql`
      SELECT
        COUNT(a.id)                                            AS total_assignments,
        COUNT(s.id)                                            AS submitted_count
      FROM assignments a
      LEFT JOIN assignment_submissions s
        ON s.assignment_id = a.id AND s.participant_id = ${participantId}
    `;
    return {
      totalAssignments: Number(rows[0]?.total_assignments ?? 0),
      submittedCount:   Number(rows[0]?.submitted_count   ?? 0),
    };
  } catch (error) {
    console.error('[getParticipantStats]', error);
    return { totalAssignments: 0, submittedCount: 0 };
  }
}

export async function getParticipantCount(): Promise<number> {
  try {
    const rows = await sql`
      SELECT COUNT(*) AS count FROM participants WHERE role = 'participant'
    `;
    return Number(rows[0]?.count ?? 0);
  } catch (error) {
    console.error('[getParticipantCount]', error);
    return 0;
  }
}

export async function getParticipantProfile(id: number) {
  try {
    const rows = await sql`
      SELECT id, name, email, team, track, login_id, phone, profile_image AS "profileImage"
      FROM participants WHERE id = ${id} LIMIT 1
    `;
    if (!rows[0]) return null;
    const r = rows[0];
    return {
      id: Number(r.id), name: String(r.name ?? ''),
      email: String(r.email ?? ''), team: String(r.team ?? ''),
      track: String(r.track ?? ''), loginId: String(r.login_id ?? ''),
      phone: String(r.phone ?? ''), profileImage: r.profileImage ? String(r.profileImage) : '',
    };
  } catch (error) {
    console.error('[getParticipantProfile]', error);
    return null;
  }
}

export async function updateParticipantProfile(
  id: number,
  data: { team: string; track: string; phone?: string; profileImage?: string }
) {
  try {
    await sql`
      UPDATE participants
      SET team          = ${data.team},
          track         = ${data.track},
          phone         = ${data.phone ?? null},
          profile_image = ${data.profileImage ?? null}
      WHERE id = ${id}
    `;
    revalidatePath('/home');
    return { success: true };
  } catch (error) {
    console.error('[updateParticipantProfile]', error);
    return { success: false, error: '저장 중 오류가 발생했습니다.' };
  }
}

export async function changePassword(
  id: number,
  currentPassword: string,
  newPassword: string
) {
  if (newPassword.length < 6) {
    return { success: false, error: '새 비밀번호는 6자 이상이어야 합니다.' };
  }
  try {
    const rows = await sql`SELECT password_hash FROM participants WHERE id = ${id} LIMIT 1`;
    if (!rows[0]) return { success: false, error: '사용자를 찾을 수 없습니다.' };

    const valid = await bcrypt.compare(currentPassword, String(rows[0].password_hash));
    if (!valid) return { success: false, error: '기존 비밀번호가 올바르지 않습니다.' };

    const newHash = await bcrypt.hash(newPassword, 10);
    await sql`UPDATE participants SET password_hash = ${newHash} WHERE id = ${id}`;
    return { success: true };
  } catch (error) {
    console.error('[changePassword]', error);
    return { success: false, error: '비밀번호 변경 중 오류가 발생했습니다.' };
  }
}

export async function getParticipants() {
  try {
    const rows = await sql`
      SELECT id, name, team, track, attendance, status,
             last_access AS "lastAccess"
      FROM participants
      WHERE role = 'participant'
      ORDER BY id
    `;
    return rows as Array<{
      id: number; name: string; team: string; track: string;
      attendance: number; status: string; lastAccess: string;
    }>;
  } catch (error) {
    console.error('[getParticipants]', error);
    return null;
  }
}

/** 전 참여자 개인별 전체 참여율 + 평균 참여율을 계산 */
export async function getParticipantsWithParticipationRate(): Promise<{
  participants: Array<{
    id: number; name: string; team: string; track: string;
    attendance: number; status: string; lastAccess: string;
    participationRate: number;
  }>;
  avgParticipationRate: number;
}> {
  // 1단계: 참여자 목록 — assignments 테이블과 독립적으로 항상 조회
  let baseRows: Array<Record<string, unknown>> = [];
  try {
    baseRows = await sql`
      SELECT id, name, team, track, attendance, status,
             CAST(last_access AS TEXT) AS "lastAccess"
      FROM participants
      WHERE role = 'participant'
      ORDER BY id
    ` as Array<Record<string, unknown>>;
  } catch (error) {
    console.error('[getParticipantsWithParticipationRate] participants 조회 실패:', error);
    return { participants: [], avgParticipationRate: 0 };
  }

  // 2단계: 과제 통계 — 테이블 없으면 0으로 폴백
  let totalAssignments = 0;
  const submittedMap: Record<number, number> = {};
  try {
    const aRows = await sql`SELECT COUNT(*)::int AS cnt FROM assignments` as Array<{ cnt: number }>;
    totalAssignments = Number(aRows[0]?.cnt ?? 0);
    if (totalAssignments > 0) {
      const sRows = await sql`
        SELECT participant_id, COUNT(*)::int AS cnt
        FROM assignment_submissions
        GROUP BY participant_id
      ` as Array<{ participant_id: number; cnt: number }>;
      for (const row of sRows) submittedMap[Number(row.participant_id)] = Number(row.cnt);
    }
  } catch {
    // assignments / assignment_submissions 테이블 미존재 시 통계 없이 진행
  }

  const participants = baseRows.map(r => {
    const submitted = submittedMap[Number(r.id)] ?? 0;
    const participationRate = totalAssignments > 0
      ? Math.min(100, Math.round((submitted / totalAssignments) * 100))
      : 0;
    return {
      id: Number(r.id),
      name: String(r.name ?? ''),
      team: String(r.team ?? ''),
      track: String(r.track ?? ''),
      attendance: Number(r.attendance ?? 0),
      status: String(r.status ?? '정상'),
      lastAccess: String(r.lastAccess ?? ''),
      participationRate,
    };
  });

  const avgParticipationRate = participants.length > 0
    ? Math.round(participants.reduce((sum, p) => sum + p.participationRate, 0) / participants.length)
    : 0;

  return { participants, avgParticipationRate };
}
