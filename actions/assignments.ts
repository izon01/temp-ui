'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { sql } from '@/lib/db';

export async function submitAssignmentAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: '로그인이 필요합니다.' };
  }

  const assignmentId = String(formData.get('assignmentId') ?? '').trim();
  const link         = String(formData.get('link')         ?? '').trim();
  const fileName     = String(formData.get('fileName')     ?? '').trim();

  if (!link && !fileName) {
    return { success: false, error: '파일 또는 링크를 입력해주세요.' };
  }

  try {
    await sql`
      INSERT INTO assignment_submissions
        (assignment_id, participant_id, link, file_name, status, submitted_at)
      VALUES
        (${assignmentId}, ${session.user.id}, ${link || null}, ${fileName || null}, 'pending', NOW())
      ON CONFLICT (assignment_id, participant_id)
      DO UPDATE SET
        link = EXCLUDED.link,
        file_name = EXCLUDED.file_name,
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
