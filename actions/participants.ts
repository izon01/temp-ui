'use server';

import { sql } from '@/lib/db';

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
