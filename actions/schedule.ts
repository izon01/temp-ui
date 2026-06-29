'use server';

import { auth } from '@/auth';
import { sql } from '@/lib/db';
import { revalidatePath } from 'next/cache';

async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS schedule_events (
      id         SERIAL PRIMARY KEY,
      date       TEXT NOT NULL UNIQUE,
      text       TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  // Add UNIQUE constraint for existing tables without it
  try {
    await sql`ALTER TABLE schedule_events ADD CONSTRAINT schedule_events_date_unique UNIQUE (date)`;
  } catch { /* already exists */ }
}

export async function getScheduleEvents(year: number, month: number) {
  try {
    await ensureTable();
    const prefix = `${year}-${String(month).padStart(2, '0')}`;
    const rows = await sql`
      SELECT id, date, text FROM schedule_events
      WHERE date LIKE ${prefix + '-%'}
      ORDER BY date
    `;
    return rows as Array<{ id: number; date: string; text: string }>;
  } catch (e) {
    console.error('[getScheduleEvents]', e);
    return [];
  }
}

export async function upsertScheduleEvent(date: string, text: string) {
  const session = await auth();
  if (session?.user?.role !== 'admin') return { success: false };
  try {
    await ensureTable();
    if (text.trim() === '') {
      await sql`DELETE FROM schedule_events WHERE date = ${date}`;
    } else {
      await sql`
        INSERT INTO schedule_events (date, text)
        VALUES (${date}, ${text})
        ON CONFLICT (date) DO UPDATE SET text = EXCLUDED.text
      `;
    }
    revalidatePath('/schedule');
    return { success: true };
  } catch (e) {
    console.error('[upsertScheduleEvent]', e);
    return { success: false };
  }
}
