'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { sql } from '@/lib/db';

const MAX_CONTENT = 1000;
const iconMap: Record<string, string> = {
  '공지': 'campaign', '필독': 'notification_important', '프로그램': 'school',
  '취업정보': 'work', '기타': 'info',
};

export async function createNotice(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== 'admin') return { success: false, error: '관리자만 공지를 등록할 수 있습니다.' };

  const title    = String(formData.get('title')    ?? '').trim();
  const content  = String(formData.get('content')  ?? '').trim();
  const category = String(formData.get('category') ?? '공지').trim();
  const isPinned = formData.get('isPinned') === 'true';
  const imageUrl = formData.get('imageUrl') ? String(formData.get('imageUrl')) : null;
  const icon     = iconMap[category] ?? 'campaign';

  if (!title || !content) return { success: false, error: '제목과 내용을 입력해주세요.' };
  if (content.length > MAX_CONTENT) return { success: false, error: `내용은 ${MAX_CONTENT}자를 초과할 수 없습니다.` };

  try {
    await ensureNoticesTable();
    await sql`
      INSERT INTO notices (title, content, category, is_pinned, icon, image_url, author_id)
      VALUES (${title}, ${content}, ${category}, ${isPinned}, ${icon}, ${imageUrl}, ${session.user.id})
    `;
    revalidatePath('/notices');
    return { success: true };
  } catch (error) {
    console.error('[createNotice]', error);
    return { success: false, error: '등록 중 오류가 발생했습니다.' };
  }
}

export async function deleteNotice(id: number) {
  const session = await auth();
  if (session?.user?.role !== 'admin') return { success: false, error: '권한이 없습니다.' };
  try {
    await sql`DELETE FROM notices WHERE id = ${id}`;
    revalidatePath('/notices');
    return { success: true };
  } catch (error) {
    console.error('[deleteNotice]', error);
    return { success: false, error: '삭제 중 오류가 발생했습니다.' };
  }
}

async function ensureNoticesTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS notices (
      id         SERIAL PRIMARY KEY,
      title      TEXT NOT NULL,
      content    TEXT,
      category   TEXT NOT NULL DEFAULT '공지',
      is_pinned  BOOLEAN NOT NULL DEFAULT false,
      icon       TEXT NOT NULL DEFAULT 'campaign',
      views      INTEGER NOT NULL DEFAULT 0,
      image_url  TEXT,
      author_id  TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

export async function getNotices(q?: string) {
  const query = q?.trim() ?? '';
  try {
    await ensureNoticesTable();
    const rows = query
      ? await sql`
          SELECT id, title, content, category, is_pinned AS "isPinned", icon, views,
                 image_url AS "imageUrl", TO_CHAR(created_at, 'YYYY.MM.DD') AS date
          FROM notices
          WHERE title ILIKE ${'%' + query + '%'} OR content ILIKE ${'%' + query + '%'}
          ORDER BY is_pinned DESC, created_at DESC
        `
      : await sql`
          SELECT id, title, content, category, is_pinned AS "isPinned", icon, views,
                 image_url AS "imageUrl", TO_CHAR(created_at, 'YYYY.MM.DD') AS date
          FROM notices
          ORDER BY is_pinned DESC, created_at DESC
        `;
    return rows as Array<{
      id: number; title: string; content: string; category: string;
      isPinned: boolean; icon: string; views: number; imageUrl: string | null; date: string;
    }>;
  } catch (error) {
    console.error('[getNotices]', error);
    return null;
  }
}
