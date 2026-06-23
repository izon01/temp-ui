'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { sql } from '@/lib/db';

export async function createNotice(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== 'admin') {
    return { success: false, error: '관리자만 공지를 등록할 수 있습니다.' };
  }

  const title    = String(formData.get('title')    ?? '').trim();
  const content  = String(formData.get('content')  ?? '').trim();
  const category = String(formData.get('category') ?? '공지').trim();
  const isPinned = formData.get('isPinned') === 'true';
  const iconMap: Record<string, string> = {
    '공지': 'campaign', '필독': 'notification_important', '프로그램': 'school',
  };
  const icon = iconMap[category] ?? 'campaign';

  if (!title || !content) {
    return { success: false, error: '제목과 내용을 입력해주세요.' };
  }

  try {
    await sql`
      INSERT INTO notices (title, content, category, is_pinned, icon, author_id)
      VALUES (${title}, ${content}, ${category}, ${isPinned}, ${icon}, ${session.user.id})
    `;
    revalidatePath('/notices');
    return { success: true };
  } catch (error) {
    console.error('[createNotice]', error);
    return { success: false, error: '등록 중 오류가 발생했습니다.' };
  }
}

export async function getNotices() {
  try {
    const rows = await sql`
      SELECT id, title, category, is_pinned AS "isPinned", icon, views,
             TO_CHAR(created_at, 'YYYY.MM.DD') AS date
      FROM notices
      ORDER BY is_pinned DESC, created_at DESC
    `;
    return rows as Array<{
      id: number; title: string; category: string;
      isPinned: boolean; icon: string; views: number; date: string;
    }>;
  } catch (error) {
    console.error('[getNotices]', error);
    return null;
  }
}
