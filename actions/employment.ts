'use server';

import { auth } from '@/auth';
import { sql } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export interface EmploymentRecord {
  id: number;
  cohort: string;
  name: string;
  company: string;
  department: string;
  content: string;
  createdAt: string;
}

async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS employment_status (
      id          SERIAL PRIMARY KEY,
      cohort      TEXT NOT NULL,
      name        TEXT NOT NULL,
      company     TEXT NOT NULL,
      department  TEXT NOT NULL DEFAULT '',
      content     TEXT NOT NULL DEFAULT '',
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

export async function getEmploymentRecords(): Promise<EmploymentRecord[]> {
  await ensureTable();
  const rows = await sql`
    SELECT
      id, cohort, name, company, department, content,
      TO_CHAR(created_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD') AS "createdAt"
    FROM employment_status
    ORDER BY cohort DESC, created_at DESC
  `;
  return rows as EmploymentRecord[];
}

export async function createEmploymentRecord(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (session?.user?.role !== 'admin') return { success: false, error: '권한이 없습니다.' };

  const cohort = (formData.get('cohort') as string)?.trim();
  const name = (formData.get('name') as string)?.trim();
  const company = (formData.get('company') as string)?.trim();
  const department = (formData.get('department') as string)?.trim() ?? '';
  const content = (formData.get('content') as string)?.trim() ?? '';

  if (!cohort || !name || !company) return { success: false, error: '기수, 이름, 기업명은 필수입니다.' };

  await ensureTable();
  await sql`
    INSERT INTO employment_status (cohort, name, company, department, content)
    VALUES (${cohort}, ${name}, ${company}, ${department}, ${content})
  `;
  revalidatePath('/employment-status');
  return { success: true };
}

export async function updateEmploymentRecord(id: number, formData: FormData): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (session?.user?.role !== 'admin') return { success: false, error: '권한이 없습니다.' };

  const cohort = (formData.get('cohort') as string)?.trim();
  const name = (formData.get('name') as string)?.trim();
  const company = (formData.get('company') as string)?.trim();
  const department = (formData.get('department') as string)?.trim() ?? '';
  const content = (formData.get('content') as string)?.trim() ?? '';

  if (!cohort || !name || !company) return { success: false, error: '기수, 이름, 기업명은 필수입니다.' };

  await sql`
    UPDATE employment_status
    SET cohort=${cohort}, name=${name}, company=${company},
        department=${department}, content=${content}, updated_at=NOW()
    WHERE id=${id}
  `;
  revalidatePath('/employment-status');
  return { success: true };
}

export async function deleteEmploymentRecord(id: number): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (session?.user?.role !== 'admin') return { success: false, error: '권한이 없습니다.' };

  await sql`DELETE FROM employment_status WHERE id=${id}`;
  revalidatePath('/employment-status');
  return { success: true };
}
