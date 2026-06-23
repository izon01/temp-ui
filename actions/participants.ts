'use server';

import { sql } from '@/lib/db';

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
