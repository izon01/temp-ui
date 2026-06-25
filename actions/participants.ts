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

/** 전 참여자 개인별 전체 참여율 + 평균 참여율을 한 번의 쿼리로 계산 */
export async function getParticipantsWithParticipationRate(): Promise<{
  participants: Array<{
    id: number; name: string; team: string; track: string;
    attendance: number; status: string; lastAccess: string;
    participationRate: number;
  }>;
  avgParticipationRate: number;
}> {
  try {
    const rows = await sql`
      SELECT
        p.id,
        p.name,
        p.team,
        p.track,
        p.attendance,
        p.status,
        p.last_access AS "lastAccess",
        COUNT(a.id)::int   AS total_items,
        COUNT(s.id)::int   AS submitted_items
      FROM participants p
      CROSS JOIN assignments a
      LEFT JOIN assignment_submissions s
        ON s.assignment_id = a.id AND s.participant_id = p.id
      WHERE p.role = 'participant'
      GROUP BY p.id, p.name, p.team, p.track, p.attendance, p.status, p.last_access
      ORDER BY p.id
    `;

    const participants = rows.map(r => {
      const total     = Number(r.total_items);
      const submitted = Number(r.submitted_items);
      const participationRate = total > 0 ? Math.min(100, Math.round((submitted / total) * 100)) : 0;
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
  } catch (error) {
    console.error('[getParticipantsWithParticipationRate]', error);
    return { participants: [], avgParticipationRate: 0 };
  }
}
