'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { sql } from '@/lib/db';

const MAX_CONTENT = 1000;

export async function getAssignments(participantId?: string) {
  const rows = await sql`
    SELECT
      a.id, a.week, a.title, a.description,
      TO_CHAR(a.deadline, 'YYYY-MM-DD') AS deadline,
      (a.deadline - CURRENT_DATE) AS days_left,
      CASE WHEN s.id IS NOT NULL THEN true ELSE false END AS submitted
    FROM assignments a
    LEFT JOIN assignment_submissions s
      ON s.assignment_id = a.id AND s.participant_id = ${participantId ?? null}
    ORDER BY a.week DESC, a.created_at DESC
  `;
  return rows as Array<{
    id: number; week: number; title: string; description: string;
    deadline: string; days_left: number | null; submitted: boolean;
  }>;
}

export async function createAssignment(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== 'admin') return { success: false, error: '관리자만 과제를 등록할 수 있습니다.' };

  const week        = parseInt(String(formData.get('week') ?? '0'), 10);
  const title       = String(formData.get('title')       ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const deadline    = String(formData.get('deadline')    ?? '').trim();

  if (!week || !title || !deadline) return { success: false, error: '주차, 과제명, 제출 기한은 필수입니다.' };
  if (description.length > MAX_CONTENT) return { success: false, error: `내용은 ${MAX_CONTENT}자를 초과할 수 없습니다.` };

  try {
    await sql`INSERT INTO assignments (week, title, description, deadline, created_by) VALUES (${week}, ${title}, ${description}, ${deadline}, ${session.user.id})`;
    revalidatePath('/education');
    return { success: true };
  } catch (error) {
    console.error('[createAssignment]', error);
    return { success: false, error: '등록 중 오류가 발생했습니다.' };
  }
}

export async function deleteAssignment(id: number) {
  const session = await auth();
  if (session?.user?.role !== 'admin') return { success: false, error: '권한이 없습니다.' };
  try {
    await sql`DELETE FROM assignment_submissions WHERE assignment_id = ${id}`;
    await sql`DELETE FROM assignments WHERE id = ${id}`;
    revalidatePath('/education');
    return { success: true };
  } catch (error) {
    console.error('[deleteAssignment]', error);
    return { success: false, error: '삭제 중 오류가 발생했습니다.' };
  }
}

/** 참여자 본인의 특정 과제 제출물 조회 */
export async function getMySubmission(assignmentId: number) {
  const session = await auth();
  if (!session?.user) return null;
  try {
    await sql`ALTER TABLE assignment_submissions ADD COLUMN IF NOT EXISTS content TEXT`;
    await sql`ALTER TABLE assignment_submissions ADD COLUMN IF NOT EXISTS file_data TEXT`;
    const rows = await sql`
      SELECT link, file_name AS "fileName", file_data AS "fileData", content,
             TO_CHAR(submitted_at, 'YYYY-MM-DD HH24:MI') AS "submittedAt"
      FROM assignment_submissions
      WHERE assignment_id = ${assignmentId} AND participant_id = ${session.user.id}
      LIMIT 1
    `;
    if (!rows[0]) return null;
    const r = rows[0];
    return {
      link:        r.link        ? String(r.link)        : '',
      fileName:    r.fileName    ? String(r.fileName)    : '',
      fileData:    r.fileData    ? String(r.fileData)    : '',
      content:     r.content     ? String(r.content)     : '',
      submittedAt: r.submittedAt ? String(r.submittedAt) : '',
    };
  } catch (error) {
    console.error('[getMySubmission]', error);
    return null;
  }
}

/** 관리자용: 특정 과제의 전체 참여자 제출 현황 조회 */
export async function getAssignmentSubmissions(assignmentId: number) {
  const session = await auth();
  if (session?.user?.role !== 'admin') return [];
  try {
    await sql`ALTER TABLE assignment_submissions ADD COLUMN IF NOT EXISTS content   TEXT`;
    await sql`ALTER TABLE assignment_submissions ADD COLUMN IF NOT EXISTS file_data TEXT`;
    const rows = await sql`
      SELECT s.id,
             p.name AS "participantName", p.team, p.track,
             s.link, s.file_name AS "fileName", s.file_data AS "fileData", s.content,
             TO_CHAR(s.submitted_at, 'YYYY-MM-DD HH24:MI') AS "submittedAt"
      FROM assignment_submissions s
      JOIN participants p ON p.id = s.participant_id
      WHERE s.assignment_id = ${assignmentId}
      ORDER BY s.submitted_at DESC
    `;
    return rows as Array<{
      id: number; participantName: string; team: string; track: string;
      link: string | null; fileName: string | null; fileData: string | null; content: string | null;
      submittedAt: string;
    }>;
  } catch (error) {
    console.error('[getAssignmentSubmissions]', error);
    return [];
  }
}

/** 관리자용: 과제 수정 */
export async function updateAssignment(id: number, formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== 'admin') return { success: false, error: '권한이 없습니다.' };

  const week        = parseInt(String(formData.get('week') ?? '0'), 10);
  const title       = String(formData.get('title')       ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const deadline    = String(formData.get('deadline')    ?? '').trim();

  if (!week || !title || !deadline) return { success: false, error: '주차, 과제명, 제출 기한은 필수입니다.' };

  try {
    await sql`
      UPDATE assignments
      SET week = ${week}, title = ${title}, description = ${description}, deadline = ${deadline}
      WHERE id = ${id}
    `;
    revalidatePath('/education');
    return { success: true };
  } catch (error) {
    console.error('[updateAssignment]', error);
    return { success: false, error: '수정 중 오류가 발생했습니다.' };
  }
}

/** 전체 과제 제출률 (전체 제출 수 / 과제수 × 참여자수 × 100) */
export async function getAssignmentSubmissionRate(): Promise<number> {
  try {
    const rows = await sql`
      SELECT
        (SELECT COUNT(*) FROM assignment_submissions)::float AS total_submissions,
        (SELECT COUNT(*) FROM assignments)::float            AS total_assignments,
        (SELECT COUNT(*) FROM participants WHERE role = 'participant')::float AS total_participants
    `;
    const { total_submissions, total_assignments, total_participants } = rows[0];
    const denom = Number(total_assignments) * Number(total_participants);
    if (denom === 0) return 0;
    return Math.min(100, Math.round((Number(total_submissions) / denom) * 100));
  } catch (error) {
    console.error('[getAssignmentSubmissionRate]', error);
    return 0;
  }
}

export async function submitAssignmentAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { success: false, error: '로그인이 필요합니다.' };

  const assignmentId = String(formData.get('assignmentId') ?? '').trim();
  const link         = String(formData.get('link')         ?? '').trim();
  const fileName     = String(formData.get('fileName')     ?? '').trim();
  const content      = String(formData.get('content')      ?? '').trim();

  if (!link && !fileName && !content) return { success: false, error: '파일, 링크, 또는 본문 내용을 입력해주세요.' };

  try {
    await sql`ALTER TABLE assignment_submissions ADD COLUMN IF NOT EXISTS content   TEXT`;
    await sql`ALTER TABLE assignment_submissions ADD COLUMN IF NOT EXISTS file_data TEXT`;
    const fileData = String(formData.get('fileData') ?? '').trim() || null;
    await sql`
      INSERT INTO assignment_submissions (assignment_id, participant_id, link, file_name, file_data, content, status, submitted_at)
      VALUES (${assignmentId}, ${session.user.id}, ${link || null}, ${fileName || null}, ${fileData}, ${content || null}, 'pending', NOW())
      ON CONFLICT (assignment_id, participant_id)
      DO UPDATE SET
        link       = EXCLUDED.link,
        file_name  = EXCLUDED.file_name,
        file_data  = EXCLUDED.file_data,
        content    = EXCLUDED.content,
        status     = 'pending',
        submitted_at = NOW()
    `;
    revalidatePath('/education');
    return { success: true };
  } catch (error) {
    console.error('[submitAssignment]', error);
    return { success: false, error: '제출 중 오류가 발생했습니다.' };
  }
}
