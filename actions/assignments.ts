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

export async function submitAssignmentAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { success: false, error: '로그인이 필요합니다.' };

  const assignmentId = String(formData.get('assignmentId') ?? '').trim();
  const link         = String(formData.get('link')         ?? '').trim();
  const fileName     = String(formData.get('fileName')     ?? '').trim();
  const content      = String(formData.get('content')      ?? '').trim();

  if (!link && !fileName && !content) return { success: false, error: '파일, 링크, 또는 본문 내용을 입력해주세요.' };

  try {
    // content 컬럼이 없으면 추가 (최초 1회)
    await sql`ALTER TABLE assignment_submissions ADD COLUMN IF NOT EXISTS content TEXT`;
    await sql`
      INSERT INTO assignment_submissions (assignment_id, participant_id, link, file_name, content, status, submitted_at)
      VALUES (${assignmentId}, ${session.user.id}, ${link || null}, ${fileName || null}, ${content || null}, 'pending', NOW())
      ON CONFLICT (assignment_id, participant_id)
      DO UPDATE SET
        link = EXCLUDED.link,
        file_name = EXCLUDED.file_name,
        content = EXCLUDED.content,
        status = 'pending',
        submitted_at = NOW()
    `;
    revalidatePath('/education');
    return { success: true };
  } catch (error) {
    console.error('[submitAssignment]', error);
    return { success: false, error: '제출 중 오류가 발생했습니다.' };
  }
}
